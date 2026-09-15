#!/usr/bin/env python3
"""
Repoint the mysticaldigits-blueprint-proxy Worker at the live Pages project.

The problem
-----------
`blueprint.mysticaldigits.com` is served by the Worker
`mysticaldigits-blueprint-proxy`, which proxies to a hardcoded upstream:

    upstream.hostname = 'mystic-blueprint.gearup-flow-master.pages.dev'

That is a *branch alias* on a different Pages project, and it stopped receiving
deployments. Meanwhile `mystic-blueprint-maker.pages.dev` — the project the repo
actually deploys to — has been current the whole time. So the Worker has been
serving a build frozen on 2026-09-10.

The fix
-------
One line: point the upstream at the production alias.

    upstream.hostname = 'mystic-blueprint-maker.pages.dev'

The production alias always tracks the newest production deployment, so it
cannot go stale again.

Also worth knowing: the Worker's `rewriteJsMd()` patches inject an email stash and
rewrite the Stripe link at runtime. Both of its string needles are absent from the
current bundle, so those patches are now no-ops — the app does the same job
natively (`md:buyer-email`, `prefilled_email`). They are left in place on purpose:
they are harmless when they miss, and they still help if an older bundle is ever
served.

Usage
-----
    export CLOUDFLARE_API_TOKEN=...
    python scripts/repoint-blueprint-proxy.py --check      # read-only: show the diff
    python scripts/repoint-blueprint-proxy.py --apply      # upload the fix
    python scripts/repoint-blueprint-proxy.py --restore <backup.js>

Requires: Account -> Workers Scripts -> Edit
"""

from __future__ import annotations

import argparse
import os
import pathlib
import re
import sys
import urllib.error
import urllib.request
import uuid

API = "https://api.cloudflare.com/client/v4"
ACCOUNT = "5dc0401c38d9de0c6947fee40a210937"
SCRIPT = "mysticaldigits-blueprint-proxy"
OLD_UPSTREAM = "mystic-blueprint.gearup-flow-master.pages.dev"
NEW_UPSTREAM = "mystic-blueprint-maker.pages.dev"
COMPAT_DATE = "2026-09-01"
BACKUP_DIR = pathlib.Path(__file__).resolve().parent.parent / "_worker_probe"


def auth() -> str:
    token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    if not token:
        print("CLOUDFLARE_API_TOKEN is not set.", file=sys.stderr)
        raise SystemExit(2)
    return token


def fetch_module(token: str) -> bytes:
    """GET the script and return the module source."""
    req = urllib.request.Request(
        f"{API}/accounts/{ACCOUNT}/workers/scripts/{SCRIPT}",
        headers={"Authorization": f"Bearer {token}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read()
    except urllib.error.HTTPError as exc:
        print(f"GET failed: {exc.code} {exc.read().decode('utf-8', 'replace')[:300]}")
        raise SystemExit(1)

    boundary = re.match(rb"--([0-9a-f]+)\r\n", raw)
    if not boundary:
        print("Unexpected response: not multipart.")
        raise SystemExit(1)

    for part in raw.split(b"--" + boundary.group(1)):
        if b"\r\n\r\n" not in part:
            continue
        head, body = part.split(b"\r\n\r\n", 1)
        body = body.rstrip(b"\r\n")
        if body == b"--":
            continue
        name = re.search(rb'name="([^"]+)"', head)
        if name and name.group(1).endswith(b".js"):
            return body
    print("No .js module found in the script payload.")
    raise SystemExit(1)


def put_module(token: str, source: bytes) -> None:
    """PUT the module back, preserving the compatibility date."""
    boundary = uuid.uuid4().hex
    metadata = (
        b'{"main_module":"md.js","compatibility_date":"' + COMPAT_DATE.encode() + b'"}'
    )
    body = b"".join(
        [
            f"--{boundary}\r\n".encode(),
            b'Content-Disposition: form-data; name="metadata"\r\n',
            b"Content-Type: application/json\r\n\r\n",
            metadata,
            b"\r\n",
            f"--{boundary}\r\n".encode(),
            b'Content-Disposition: form-data; name="md.js"; filename="md.js"\r\n',
            b"Content-Type: application/javascript+module\r\n\r\n",
            source,
            b"\r\n",
            f"--{boundary}--\r\n".encode(),
        ]
    )
    req = urllib.request.Request(
        f"{API}/accounts/{ACCOUNT}/workers/scripts/{SCRIPT}",
        data=body,
        method="PUT",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            payload = resp.read().decode("utf-8", "replace")
            print(f"PUT {resp.status}: {payload[:200]}")
    except urllib.error.HTTPError as exc:
        print(f"PUT failed: {exc.code}")
        print(exc.read().decode("utf-8", "replace")[:600])
        raise SystemExit(1)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="read-only: show what would change")
    ap.add_argument("--apply", action="store_true", help="upload the change")
    ap.add_argument("--restore", metavar="FILE", help="upload a previously saved module")
    args = ap.parse_args()

    token = auth()
    BACKUP_DIR.mkdir(exist_ok=True)

    if args.restore:
        source = pathlib.Path(args.restore).read_bytes()
        print(f"Restoring {len(source):,} bytes from {args.restore}")
        put_module(token, source)
        print("Restored.")
        return 0

    source = fetch_module(token)
    text = source.decode("utf-8")

    backup = BACKUP_DIR / "md.backup.js"
    backup.write_bytes(source)
    print(f"Fetched {len(source):,} bytes; backup written to {backup}")

    occurrences = text.count(OLD_UPSTREAM)
    print(f"Upstream references found: {occurrences}  ({OLD_UPSTREAM})")
    if occurrences == 0:
        if NEW_UPSTREAM in text:
            print(f"Already points at {NEW_UPSTREAM}. Nothing to do.")
            return 0
        print("Neither the old nor the new upstream appears. Aborting rather than guess.")
        return 1

    patched = text.replace(OLD_UPSTREAM, NEW_UPSTREAM)
    print()
    print("--- change ---")
    for line in patched.splitlines():
        if NEW_UPSTREAM in line:
            print(f"+ {line.strip()}")
    print()

    if args.check or not args.apply:
        print("Dry run. Re-run with --apply to upload.")
        return 0

    put_module(token, patched.encode("utf-8"))
    print()
    print("Uploaded. Now verify the custom domain serves the new bundle:")
    print("  curl -s https://blueprint.mysticaldigits.com/ | grep -o 'index-[A-Za-z0-9_-]*\\.js'")
    print("Roll back with:")
    print(f"  python {__file__} --restore {backup}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
