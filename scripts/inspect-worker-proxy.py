#!/usr/bin/env python3
"""
Inspect the mysticaldigits-blueprint-proxy Worker.

Why this exists
---------------
`blueprint.mysticaldigits.com` is served by a Worker named
`mysticaldigits-blueprint-proxy`, which lives in a *different* Cloudflare account
from the Pages project `mystic-blueprint-maker`. The Worker is serving a build
frozen at 2026-09-10 while Pages has been deploying current code all along.

This script only READS. It dumps the Worker script, its bindings, and its
deployment metadata so the pinned upstream URL can be found. Nothing is modified.

Usage
-----
    export CLOUDFLARE_API_TOKEN=...
    python scripts/inspect-worker-proxy.py

    # narrow it down if you already know the account
    python scripts/inspect-worker-proxy.py --account <account_id>

Required token scope (create it in the account that shows the Worker):
    Account  ->  Workers Scripts  ->  Read      (Edit later, to apply the fix)
    Zone     ->  Zone             ->  Read
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

API = "https://api.cloudflare.com/client/v4"
SCRIPT_NAME = "mysticaldigits-blueprint-proxy"
OUT_DIR = pathlib.Path(__file__).resolve().parent.parent / "_worker_probe"


def call(token: str, path: str) -> tuple[int, str, str]:
    """Return (status, content_type, body). Never raises on HTTP errors."""
    req = urllib.request.Request(
        f"{API}{path}",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            return resp.status, resp.headers.get("Content-Type", ""), resp.read().decode(
                "utf-8", "replace"
            )
    except urllib.error.HTTPError as exc:
        return exc.code, exc.headers.get("Content-Type", ""), exc.read().decode(
            "utf-8", "replace"
        )
    except Exception as exc:  # noqa: BLE001 - report, never crash the probe
        return 0, "", f"{type(exc).__name__}: {exc}"


def summarise(body: str, limit: int = 400) -> str:
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return body[:limit].replace("\n", " ")
    if isinstance(data, dict) and "errors" in data and data.get("errors"):
        return f"errors={json.dumps(data['errors'])[:limit]}"
    return json.dumps(data)[:limit]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--account", help="account id to probe (skips account discovery)")
    ap.add_argument("--script", default=SCRIPT_NAME, help="worker script name")
    args = ap.parse_args()

    token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    if not token:
        print("CLOUDFLARE_API_TOKEN is not set.", file=sys.stderr)
        return 2

    OUT_DIR.mkdir(exist_ok=True)

    # ---- accounts -----------------------------------------------------------
    accounts: list[tuple[str, str]] = []
    if args.account:
        accounts = [(args.account, "(given)")]
    else:
        status, _, body = call(token, "/accounts")
        print(f"GET /accounts -> {status}")
        print(f"  {summarise(body)}")
        try:
            for acct in json.loads(body).get("result", []) or []:
                accounts.append((acct["id"], acct.get("name", "?")))
        except json.JSONDecodeError:
            pass

    if not accounts:
        print()
        print("No accounts visible to this token.")
        print("Account -> Workers Scripts -> Read is required to enumerate them.")
        print("Re-run with --account <account_id> if you know it.")
        return 1

    # ---- per account --------------------------------------------------------
    for account_id, account_name in accounts:
        print()
        print(f"=== account {account_id}  ({account_name}) ===")

        status, _, body = call(token, f"/accounts/{account_id}/workers/scripts")
        print(f"  list scripts -> {status}")
        names: list[str] = []
        try:
            for item in json.loads(body).get("result", []) or []:
                names.append(item.get("id") or item.get("name") or "?")
        except json.JSONDecodeError:
            print(f"    {summarise(body)}")
        if names:
            print(f"    {len(names)} script(s): {', '.join(sorted(names))}")

        if args.script not in names and names:
            if not any(args.script in n for n in names):
                print(f"    '{args.script}' not in this account - skipping")
                continue

        # Script body, settings and deployment metadata. Endpoint shapes differ
        # between API versions, so probe several and keep whatever answers.
        targets = {
            "script.js": f"/accounts/{account_id}/workers/scripts/{args.script}",
            "settings.json": f"/accounts/{account_id}/workers/scripts/{args.script}/settings",
            "deployments.json": (
                f"/accounts/{account_id}/workers/scripts/{args.script}/deployments"
            ),
            "service.json": (
                f"/accounts/{account_id}/workers/services/{args.script}"
                "/environments/production"
            ),
        }

        for filename, path in targets.items():
            status, ctype, body = call(token, path)
            print(f"  {filename:<18} {status}  {summarise(body, 200)}")
            if status == 200 and body:
                (OUT_DIR / f"{account_id[:8]}-{filename}").write_text(
                    body, encoding="utf-8"
                )

    print()
    print(f"Raw responses written to {OUT_DIR}")
    print()
    print("What to look for: a hardcoded upstream such as")
    print("  https://<deployment-hash>.mystic-blueprint-maker.pages.dev")
    print("That is the pin. It should become the production alias,")
    print("  https://mystic-blueprint-maker.pages.dev")
    print("which always tracks the newest deployment.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
