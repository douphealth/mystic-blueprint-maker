# Why the emails never arrive

**Symptom:** a visitor submits the email gate, sees "Your blueprint is unlocked!",
and no email ever arrives — not in the inbox, and (as far as anyone has checked)
not in spam either.

**Short answer:** the sending side works. The *domain authentication* is half
finished, so mailbox providers treat the mail as untrusted and bury or drop it.

---

## What is actually working

The lead endpoint is live on both hosts and Brevo accepts the message. This was
tested directly rather than inferred:

```
$ curl -s -X POST https://blueprint.mysticaldigits.com/api/life-path-lead \
    -H "Content-Type: application/json" \
    -d '{"email":"probe@example.com","fullName":"Probe Test","birthDate":"1990-05-15"}'

{"ok":true,"message":"Blueprint email sent.","requestId":"<202609151100.48083222591@smtp-relay.mailin.fr>"}
```

`smtp-relay.mailin.fr` is Brevo's relay, and the `requestId` is a real SMTP queue
id. So the request succeeds, Brevo queues the mail, and the app reports success
honestly. Nothing in the application code is silently swallowing an error.

Note: `probe@example.com` is a reserved domain that discards mail, so this test
delivered nothing to anyone. It only exercised the path.

**Conclusion: this is a deliverability problem, not a bug in the app.**

---

## The evidence, from live DNS

`mysticaldigits.com` (Cloudflare nameservers):

| Record | Status |
| --- | --- |
| `TXT mysticaldigits.com` | `brevo-code:bb5c38756d570b21e840beda270ceddd` |
| `TXT _dmarc.mysticaldigits.com` | `v=DMARC1; p=none; pct=100; rua=mailto:dmarcreports@lovable.dev` |
| `TXT brevo._domainkey.mysticaldigits.com` | **NXDOMAIN** |
| `TXT mail._domainkey.mysticaldigits.com` | **NXDOMAIN** |
| SPF (`v=spf1 ...`) | **absent** |
| `MX` | `mx.zoho.com`, `mx3.zoho.com`, `mx2.zoho.com` |

## Root cause

**1. DKIM was never set up — this is the blocker.**

The `brevo-code` TXT record proves the domain was added to Brevo and the
ownership step was completed. But neither DKIM hostname resolves. Domain
authentication was started in the Brevo dashboard and abandoned before the DKIM
records were copied into Cloudflare.

Without DKIM there is no cryptographic signature tying the message to
`mysticaldigits.com`. Per Brevo's own documentation, DKIM alignment is what makes
DMARC pass on their shared IPs — SPF is explicitly **not** required to
authenticate a domain there. So the missing DKIM is not one gap among several;
it is *the* gap.

**2. The sender address is Brevo's shared domain.**

The configured sender is `digitsmystical@11048820.brevosend.com`. That is a
shared Brevo domain, not `mysticaldigits.com`. It authenticates as itself, but it
carries the reputation of a domain Gmail has seen enormous volumes of abuse
from. So the mail is both unbranded *and* arriving with a reputation problem
before anyone reads the subject line.

**3. DMARC reports go to Lovable, not to you.**

`rua=mailto:dmarcreports@lovable.dev` means every aggregate report — the thing
that would have told you months ago that DKIM was missing — is delivered to a
third party. The record exists, which satisfies the Gmail/Yahoo/Microsoft
requirement for a `rua` tag, but you are flying blind.

---

## The fix

### Step 1 — Finish DKIM in Brevo (this is the one that matters)

1. Brevo → **Settings → Senders, Domains & Dedicated IPs → Domains**
2. Open `mysticaldigits.com`
3. Copy the DKIM records. Brevo issues either two `CNAME` records (2048-bit, the
   default and the better option) or one `TXT` record (1024-bit). Copy whichever
   your account shows.
4. Add them in **Cloudflare → DNS**. Set the proxy status to **DNS only** (grey
   cloud) — a CNAME that is proxied will not validate.
5. Back in Brevo, click **Authenticate**. It should flip to authenticated.

Do **not** invent DKIM values. They are generated per account and must be copied
from the dashboard.

### Step 2 — Change the sender address

Once DKIM validates, switch the From address from the shared
`...@brevosend.com` domain to something on your own domain, for example
`hello@mysticaldigits.com` or `blueprint@mysticaldigits.com`.

MX already points at Zoho, so you have real mailboxes on this domain and can
receive replies. A monitored `From` address is worth having anyway: replies to a
no-reply address are how deliverability problems get reported to you.

### Step 3 — Add SPF

Brevo does not require it on shared IPs, but it is cheap and it protects you if
you ever move to a dedicated IP or add another sender:

```
mysticaldigits.com.  TXT  "v=spf1 include:spf.brevo.com ~all"
```

If a record with `v=spf1` already exists, **merge into it** — two SPF records on
one name is a permanent `permerror`. Zoho's own include should be part of the
same record if you send from Zoho too. Check Zoho's docs for their current
include value before combining.

### Step 4 — Point DMARC at yourself

```
_dmarc.mysticaldigits.com.  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@mysticaldigits.com"
```

Leave `p=none` for now. Once reports show DKIM passing consistently, tighten to
`p=quarantine` and later `p=reject`.

---

## How to verify it worked

Re-run these. The DKIM lookups should stop returning `NXDOMAIN`:

```
for n in mysticaldigits.com _dmarc.mysticaldigits.com; do
  curl -s "https://cloudflare-dns.com/dns-query?name=$n&type=TXT" -H "accept: application/dns-json"
  echo
done

# Whatever DKIM hostname Brevo gave you:
curl -s "https://cloudflare-dns.com/dns-query?name=<dkim-host>&type=CNAME" -H "accept: application/dns-json"
```

Then send a real message to a Gmail address and open **Show original**. You want
to see all three of:

```
SPF:   PASS
DKIM:  PASS with domain mysticaldigits.com
DMARC: PASS
```

`DKIM: PASS` naming *your* domain, not `brevosend.com`, is the line that matters.

## Interim mitigation already shipped

The success screen used to state flatly "We emailed you your usage guide." When
the mail lands in spam that is actively misleading — it is what turns a
deliverability problem into a "the site is broken" complaint. It now also tells
the buyer to check spam and mark it "not spam", which both prevents the support
ticket and gives mailbox providers the positive signal that gradually repairs
reputation.

## One more thing worth checking

The email sequence's CTA links point at `life-path.mysticaldigits.com`. That host
does not serve the app any more:

```
$ curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" \
    "https://life-path.mysticaldigits.com/?name=Amara+Nightingale&dob=1990-05-15"

301 https://mysticaldigits.com/life-path-number-calculator/
```

So a reader who clicks through does not just lose the query parameters — they
land on the *calculator page*, not the blueprint app, and none of the `?name=`
and `?dob=` values survive. Every personalised link in the sequence is broken in
two ways at once.

The corrected links are in `email_sequence.md`, but that file is a document. The
live templates in the ESP still hold the old URLs until someone updates them
there. That is a separate fix from the DNS work above, and it is worth doing in
the same pass — a mail that finally reaches the inbox but links to the wrong page
is still a lost subscriber.
