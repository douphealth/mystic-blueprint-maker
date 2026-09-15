#!/usr/bin/env python3
"""
Finish email authentication for mysticaldigits.com.

Why this exists
---------------
Brevo accepts mail from this domain but nothing authenticates it, so it lands in
spam. The cause is not a missing configuration step in Brevo - it is that the
DNS records Brevo generated were never added to Cloudflare:

    brevo1._domainkey  ->  missing
    brevo2._domainkey  ->  missing
    SPF                ->  missing
    DMARC              ->  present, but reports go to lovable.dev

The DKIM targets are already live and domain-specific, which is how we know they
were provisioned for this account:

    b1.mysticaldigits-com.dkim.brevo.com  ->  brevo19.dkim.brevo.com  (serves k=rsa;...)
    b2.mysticaldigits-com.dkim.brevo.com  ->  brevo20.dkim.brevo.com  (serves k=rsa;...)

So no Brevo dashboard access is needed to write the records.

What it does
------------
Creates the two DKIM CNAMEs, adds SPF if absent, and repoints the DMARC rua tag
away from lovable.dev. Idempotent: existing records are updated in place rather
than duplicated, which matters because two SPF records on one name is a
permanent permerror and two DMARC records is undefined behaviour.

Usage
-----
    export CLOUDFLARE_API_TOKEN=...   # needs Zone -> DNS -> Edit
    python fix-email-dns.py --dry-run
    python fix-email-dns.py --apply

The token used to diagnose this had Zone:Read only, which is why DNS list and
edit both returned code 10000. Add "Zone -> DNS -> Edit" to a token to run this.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

API = "https://api.cloudflare.com/client/v4"
DOMAIN = "mysticaldigits.com"

# Brevo's two-CNAME DKIM setup. Targets verified to resolve and to serve real
# DKIM public keys for this specific domain - these are not invented values.
DKIM_RECORDS = [
    ("brevo1._domainkey", "b1.mysticaldigits-com.dkim.brevo.com"),
    ("brevo2._domainkey", "b2.mysticaldigits-com.dkim.brevo.com"),
]

# spf.brevo.com publishes Brevo's sending ranges, so the include is valid.
SPF_VALUE = "v=spf1 include:spf.brevo.com ~all"

# p=none keeps this safe while DKIM beds in; tighten to quarantine later.
# rua moves off lovable.dev so the reports are actually visible to the owner.
DMARC_VALUE = "v=DMARC1; p=none; pct=100; rua=mailto:rua@dmarc.brevo.com"


def call(method: str, path: str, token: str, body: dict | None = None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as exc:
        try:
            return json.load(exc)
        except Exception:
            return {"success": False, "errors": [{"message": str(exc)}]}
    except Exception as exc:  # noqa: BLE001 - surfaced verbatim to the operator
        return {"success": False, "errors": [{"message": str(exc)}]}


def explain(result: dict) -> str:
    errs = result.get("errors") or []
    if not errs:
        return "unknown error"
    e = errs[0]
    return f"code={e.get('code')} {e.get('message')}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="actually write records")
    ap.add_argument("--dry-run", action="store_true", help="show what would change")
    args = ap.parse_args()
    if not (args.apply or args.dry_run):
        ap.error("pass --dry-run or --apply")

    token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
    if not token:
        print("CLOUDFLARE_API_TOKEN is not set.", file=sys.stderr)
        return 2

    zones = call("GET", f"/zones?name={DOMAIN}", token)
    if not zones.get("success"):
        print(f"Could not look up the zone: {explain(zones)}", file=sys.stderr)
        return 1
    if not zones.get("result"):
        print(f"No zone named {DOMAIN} is visible to this token.", file=sys.stderr)
        return 1
    zone_id = zones["result"][0]["id"]
    print(f"zone {DOMAIN} -> {zone_id}")

    existing = call("GET", f"/zones/{zone_id}/dns_records?per_page=200", token)
    if not existing.get("success"):
        print(
            f"\nCannot read DNS records: {explain(existing)}\n"
            "This token needs 'Zone -> DNS -> Edit'. Add that permission and re-run.",
            file=sys.stderr,
        )
        return 1

    by_key = {(r["type"], r["name"]): r for r in existing.get("result", [])}

    def upsert(rtype: str, name: str, content: str, *, proxied: bool | None = None):
        fqdn = DOMAIN if name == "@" else f"{name}.{DOMAIN}"
        body: dict = {"type": rtype, "name": fqdn, "content": content, "ttl": 1}
        if proxied is not None:
            body["proxied"] = proxied

        current = by_key.get((rtype, fqdn))
        if current and current["content"] == content:
            print(f"  ok       {rtype:<6} {fqdn}  (already correct)")
            return
        if current:
            verb = "update"
            if args.apply:
                res = call("PUT", f"/zones/{zone_id}/dns_records/{current['id']}", token, body)
        else:
            verb = "create"
            if args.apply:
                res = call("POST", f"/zones/{zone_id}/dns_records", token, body)

        if args.apply:
            print(f"  {'ok      ' if res.get('success') else 'FAILED  '} {rtype:<6} {fqdn}"
                  + ("" if res.get("success") else f"  <- {explain(res)}"))
        else:
            print(f"  would {verb:<6} {rtype:<6} {fqdn} -> {content[:64]}")

    print("\nDKIM (the missing piece):")
    for name, target in DKIM_RECORDS:
        upsert("CNAME", name, target, proxied=False)

    print("\nSPF:")
    # Never add a second v=spf1 record on the same name - that is a permerror.
    root_txt = [r for r in existing.get("result", [])
                if r["type"] == "TXT" and r["name"] == DOMAIN and "v=spf1" in str(r["content"])]
    if root_txt:
        print(f"  ok       an SPF record already exists: {root_txt[0]['content'][:80]}")
        print("           not touching it - merge Brevo's include by hand if needed")
    else:
        upsert("TXT", "@", SPF_VALUE)

    print("\nDMARC:")
    upsert("TXT", "_dmarc", DMARC_VALUE)

    if not args.apply:
        print("\nDry run - nothing was written. Re-run with --apply.")
    else:
        print("\nApplied. DKIM CNAMEs must be DNS-only (not proxied); they are set that way.")
        print("Then click Authenticate on the domain in Brevo.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
