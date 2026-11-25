# WordPress side of the Blueprint funnel

These are Code Snippets on mysticaldigits.com. Nothing here deploys automatically;
each change is saved by hand (REST `POST /wp-json/code-snippets/v1/snippets/<id>`)
after the owner approves it.

| File | Snippet | What changes |
|---|---|---|
| `snippet-350.php` | 350 "MDX Premium Entitlement Backend" | Restore by emailed 24 h link (`request-restore`, `token`); an email alone no longer unlocks; existing buyer at checkout gets an emailed link; confirmation email with order details on the first webhook delivery; `receipt` in verify responses |
| `snippet-374.php` | 374 "MDX Blueprint CTA" | On pages with the Life Path calculator, one "See my free Blueprint" button inside the result, and the birth date added to every Blueprint link as `#dob=YYYY-MM-DD&from=calculator` |

`*-live-2026-11-25.php` are the live versions as fetched on 25 Nov 2026 (rollback copies).
Secrets are replaced by `__WHSEC__` and `__CHECKOUT_KEY__`; at save time the deploy
script copies the real values from the live snippet, so no secret is in git.
`_helpers-350.php.inc` and `_routes-350.php.inc` are the pieces spliced into 350.

## Order (matters)

1. Merge the app PR and let Pages deploy it. The new app works against both the
   old and the new snippet 350 (it falls back when `request-restore` is a 404).
2. Save snippet 350. Check: `request-restore` → `{ok:true}`; `verify-entitlement`
   with `{email}` → `reason: use_restore_link`; signed webhook probe → row +
   confirmation email; then revoke the probe row.
3. Save snippet 374, purge the Cloudflare cache for the calculator page, run the
   calculator, and confirm the new button opens the app with the date filled in.

Saving 350 before the app is live would make the old app's "Restore it" say
"no purchase found" to real buyers, so keep this order.

Rollback: re-save the `*-live-2026-11-25.php` version (with the secrets filled in).
