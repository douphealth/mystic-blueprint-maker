# MysticalDigits: High-Converting & Personalized Onboarding Email Sequence

> ## ⚠️ Read this before you paste anything into Brevo
>
> **This account sends through Brevo.** Every tag below uses Brevo's syntax:
> `{{ contact.ATTRIBUTE }}`, with the attribute name exactly as it appears on
> Brevo's Contact attributes page. Do not paste a tag from any other ESP's
> documentation into these templates — Brevo will not substitute it, and the
> recipient sees the raw braces.
>
> **One value you must confirm before sending: `DOB_ISO`.**
> The birth date has to arrive as strict `YYYY-MM-DD` or the app cannot build
> the reading. Two ways to get there — pick one:
>
> - **Preferred: a text attribute.** Create a contact attribute named
>   `DOB_ISO` of type **Text** (Settings → Contacts → Contact attributes) and
>   store the date already formatted, e.g. `1990-05-15`. Deterministic, and no
>   filter has to be trusted.
> - **If the date already lives in a date-type attribute** (the intake sends
>   `birthDate`, so check for `BIRTHDATE`), either rename it to `DOB_ISO`, or
>   find-and-replace `DOB_ISO` below with the real name and add a date filter:
>   `{{ contact.BIRTHDATE|date:"2006-01-02" }}`. That layout string is Go's
>   reference-time format, not `strftime` — verify it in Brevo's preview before
>   sending, because a date attribute rendered through an account-locale
>   default will come out `DD/MM/YYYY` and silently break the link.
>
> **What is already fixed, so you do not redo it:**
>
> - **The CTA domain.** Every button previously pointed at
>   `life-path.mysticaldigits.com`, which 301-redirects to
>   `mysticaldigits.com/life-path-number-calculator/` and **strips the entire
>   query string** — so `?name=…&dob=…&download=1` never reached the app and
>   both the personalisation and the auto-download failed silently. All links
>   below point at `blueprint.mysticaldigits.com`, which serves the app.
> - **DKIM.** `brevo1` and `brevo2._domainkey.mysticaldigits.com` now resolve
>   through to real RSA keys, confirmed on two independent resolvers. Domain
>   authentication is in place.
>
> **The one thing still outstanding on delivery:** the sender is
> `digitsmystical@11048820.brevosend.com` — Brevo's *shared* domain. Brevo
> signs with the DKIM key of the **sending** domain, so the
> `mysticaldigits.com` key above is not being used yet. Move the From address
> onto your own domain and the DKIM work starts counting.
>
> **Two URL-safety notes.** Brevo substitutes attribute values raw, so a name
> containing `&`, `#` or `%` will corrupt the query string — rare, but worth
> knowing. And if a tag fails to substitute, the visitor no longer hits a dead
> end: the app now falls back to the intake form with the name pre-filled
> rather than showing an "Invalid Link" wall.


This email sequence uses dynamic query parameters to send returning users directly to their calculated results and premium PDF workbook, bypassing the intake quiz entirely.

---

## ⚡ CRITICAL: How to Set Up the Direct Bypass Links
To prevent subscribers from having to take the quiz again, the CTA links carry
the subscriber's name and birth date as query parameters. The app reads them on
load and skips straight to the finished reading.

Use exactly these two forms:

1. **Primary CTA (open the reading and auto-download the PDF):**

   ```
   https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}&download=1
   ```

2. **Secondary CTA (open the interactive reading only):**

   ```
   https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}
   ```

Three details that are easy to get wrong:

- **The `+` is not decoration.** A URL cannot contain a literal space, and the
  app decodes `+` as one. Use `+`, not a space, between first and last name.
- **`download=1` is what triggers the auto-download.** Without it the visitor
  lands on the reading and has to click. With it, the PDF starts on its own.
- **The attribute names are case-sensitive and must match your Brevo account
  exactly.** `{{ contact.FIRSTNAME }}` and `{{ contact.LASTNAME }}` are Brevo
  defaults and will already exist. `DOB_ISO` is the one you create.

### What the app accepts

| Parameter | Accepted aliases | Required format |
| :--- | :--- | :--- |
| `name` | `full_name`, `fullname` | Free text. `+` is read as a space. |
| `dob` | `birth_date`, `birthDate` | **Strict `YYYY-MM-DD`.** Nothing else parses. |
| `email` | — | Optional. Pre-fills the email gate. |
| `download` | — | `1` triggers the auto-download. |

If `dob` is present but unparseable, or only one of the two is present, the app
now drops the visitor into the intake form with the name pre-filled and a short
explanation — it does **not** show the old "Invalid Link" wall. A misconfigured
tag costs the subscriber a few seconds instead of the whole reading.

---

## 📧 Email 1: Welcome & Instant Results Bypass (Day 1)
**Trigger**: Immediately after intake submission.
**Subject**: {{ contact.FIRSTNAME }}, your personalized MysticalDigits PDF is ready
**Preheader**: Confirming your blueprint is ready. Open to auto-download your workbook and view your interactive map.

```html
<!-- HEADER LOGO -->
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<!-- EMAIL BODY -->
<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  
  <p>Hello {{ contact.FIRSTNAME }},</p>
  
  <p>Your personalized MysticalDigits PDF is ready. We have calculated and compiled your complete numerology profile based on your name vibration and birth date.</p>

  <p>Your PDF blueprint is a detailed guide that includes:</p>
  <ul>
    <li><strong>Your Personalized Six-Number Map:</strong> Life Path, Expression/Destiny, Soul Urge, Personality, Birthday, and Personal Year.</li>
    <li><strong>Monthly Timing Cycle:</strong> Your current personal month focus, actions to prioritize, and pitfalls to avoid.</li>
    <li><strong>Premium Decision Filter:</strong> A 5-step diagnostic tool to run any major career, relationship, or financial decision through.</li>
    <li><strong>30-Day Activation Plan:</strong> A structured checklist to translate insights into daily, aligned actions.</li>
  </ul>

  <h3 style="font-family: 'Helvetica Neue', Helvetica, sans-serif; color: #12101C; border-bottom: 1px solid #DDB146; padding-bottom: 8px; margin-top: 30px;">✦ 3 Steps to Get Started:</h3>
  <ol>
    <li>Click the primary button below to open your reading and trigger the auto-download of your workbook PDF.</li>
    <li>Print the PDF or use a PDF editor to fill in the reflection worksheets and decision filter pages.</li>
    <li>Keep the interactive reading link bookmarked so you can dynamically review your monthly energy cycles.</li>
  </ol>
  
  <p>Use the buttons below to choose how you want to interact with your blueprint:</p>

  <!-- CTA ACTIONS -->
  <div style="text-align: center; margin: 35px 0; padding: 20px; border: 1px dashed #DDB146; border-radius: 8px; background-color: rgba(221, 177, 70, 0.03);">
    <p style="margin-top: 0; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option A: Download PDF Workbook</p>
    <a href="https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}&download=1" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 28px; text-decoration: none; border-radius: 4px; display: inline-block; box-shadow: 0 4px 12px rgba(221, 177, 70, 0.3);">
      Open Reading + Auto-Download PDF ↗
    </a>
    <div style="margin-top: 8px; font-size: 11px; color: #9D9380; font-family: sans-serif;">(Points directly to your profile and triggers PDF download in browser)</div>

    <p style="margin-top: 25px; margin-bottom: 5px; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option B: Explore Interactive Map Online</p>
    <a href="https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}" style="color: #DDB146; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; text-decoration: underline; display: inline-block;">
      Open Your Interactive Reading ↗
    </a>
  </div>

  <p>In Pythagorean numerology, your numbers act as a mirror, showing where your energy naturally thrives and where it encounters friction. We hope this blueprint serves as a helpful reflective planning tool.</p>

  <p>Tomorrow, we will explore your <strong>Soul Urge</strong> — the silent, private drive that governs your relationships, career desires, and quiet moments.</p>

  <p>In alignment,</p>
  <p><strong>The MysticalDigits Team</strong></p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(18, 16, 28, 0.1); font-size: 12px; color: #9D9380; text-align: center;">
    <p>Explore resources: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a> · Read our blog: <a href="https://mysticaldigits.com/blog/" style="color: #DDB146; text-decoration: none;">Guides & Insights</a></p>
  </div>
</div>
```

---

## 📧 Email 2: The Soul Urge & Private Values (Day 2)
**Trigger**: 24 hours after Email 1.
**Subject**: {{ contact.FIRSTNAME }}, are you feeding your Soul Urge?
**Preheader**: The silent fuel dictating your core satisfaction in work and love.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hello {{ contact.FIRSTNAME }},</p>

  <p>Yesterday, we discussed your Life Path. Today, we look deeper at your **Soul Urge** (also known as the Heart's Desire).</p>

  <p>While the Life Path represents your external journey, the Soul Urge represents your private motivation — what you need to feel satisfied, independent of public praise.</p>

  <p>If your daily work, your boundaries, or your relationships do not satisfy your Soul Urge fuel, you will experience a persistent feeling of depletion, regardless of how much success you achieve.</p>

  <!-- CTA ACTIONS -->
  <div style="text-align: center; margin: 35px 0; padding: 20px; border: 1px dashed #DDB146; border-radius: 8px; background-color: rgba(221, 177, 70, 0.03);">
    <p style="margin-top: 0; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option A: Download PDF Workbook</p>
    <a href="https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}&download=1" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 16px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Open Reading + Auto-Download PDF ↗
    </a>

    <p style="margin-top: 25px; margin-bottom: 5px; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option B: Explore Interactive Map Online</p>
    <a href="https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}" style="color: #DDB146; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; text-decoration: underline; display: inline-block;">
      Open Your Interactive Reading ↗
    </a>
  </div>

  <h4 style="font-family: 'Helvetica Neue', sans-serif;">📖 Your Day 2 Aligned Question:</h4>
  <p style="color: #4A4A4A; font-style: italic;">
    Look at your current environment. Are you compromising your core drive to keep the peace, or is your space designed to fuel your Soul Urge?
  </p>

  <p style="margin-top: 30px;">Tomorrow, we will explore your **Expression/Destiny Number**: how you are designed to package your talents for real-world impact and authority.</p>

  <p>To your alignment,</p>
  <p><strong>The MysticalDigits Team</strong></p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(18, 16, 28, 0.1); font-size: 12px; color: #9D9380; text-align: center;">
    <p>Read about numbers: <a href="https://mysticaldigits.com/birthday-number-numerology/" style="color: #DDB146; text-decoration: none;">Birthday Meanings</a> · Support: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a></p>
  </div>
</div>
```

---

## 📧 Email 3: Expression & Career Vectors (Day 3)
**Trigger**: 24 hours after Email 2.
**Subject**: {{ contact.FIRSTNAME }}, are you using your natural talent vector?
**Preheader**: The naming blueprint that defines your career success and legacy.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hello {{ contact.FIRSTNAME }},</p>

  <p>Your Life Path shows the path of your growth. Your Soul Urge shows your fuel. Today, let’s unlock your <strong>Expression (Destiny) Number</strong>.</p>

  <p>This number is computed from all letters in your birth name. In classical numerology, the Expression represents your tangible capabilities — how your mind, problem-solving skills, and output are built to affect the real world.</p>

  <p>When you align your work with your Expression archetype, your output carries leverage. You stop feeling like you are pushing a boulder uphill and start working with your natural design.</p>

  <!-- CTA ACTIONS -->
  <div style="text-align: center; margin: 35px 0; padding: 20px; border: 1px dashed #DDB146; border-radius: 8px; background-color: rgba(221, 177, 70, 0.03);">
    <p style="margin-top: 0; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option A: Download PDF Workbook</p>
    <a href="https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}&download=1" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 16px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Open Reading + Auto-Download PDF ↗
    </a>

    <p style="margin-top: 25px; margin-bottom: 5px; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option B: Explore Interactive Map Online</p>
    <a href="https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}" style="color: #DDB146; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; text-decoration: underline; display: inline-block;">
      Open Your Interactive Reading ↗
    </a>
  </div>

  <h4 style="font-family: 'Helvetica Neue', sans-serif;">📖 Your Day 3 Integration:</h4>
  <p style="color: #4A4A4A; font-style: italic;">
    Identify the single most common task in your week. Does it align with the strengths of your Destiny number, or does it drain you because it asks you to operate against your code?
  </p>

  <p style="margin-top: 30px;">Tomorrow, we talk about **timing**. We will look at your Personal Year and Month to prevent you from forcing decisions in the wrong season.</p>

  <p>In flow,</p>
  <p><strong>The MysticalDigits Team</strong></p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(18, 16, 28, 0.1); font-size: 12px; color: #9D9380; text-align: center;">
    <p>Read about expression: <a href="https://mysticaldigits.com/expression-number-insight/" style="color: #DDB146; text-decoration: none;">Career Vector Guide</a> · Home: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a></p>
  </div>
</div>
```

---

## 📧 Email 4: Personal Timing & Cycles (Day 4)
**Trigger**: 24 hours after Email 3.
**Subject**: Stop fighting the tide, {{ contact.FIRSTNAME }}
**Preheader**: Why your Personal Year and Personal Month dictate your success.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hi {{ contact.FIRSTNAME }},</p>

  <p>Why do some months feel like walking through wet cement, while other months bring effortless windfalls, partnerships, and breakthroughs?</p>

  <p>The answer lies in your timing cycles. You are currently navigating your own Personal Year and Personal Month cycles.</p>

  <p>Numerology groups life into 9-year waves. Each year has a clean season:</p>
  <ul>
    <li><strong>1 Year (Initiation)</strong>: A season to plant bold seeds, take risks, and go first.</li>
    <li><strong>7 Year (Inner Growth)</strong>: A season for study, solitude, and research.</li>
    <li><strong>9 Year (Completion)</strong>: A season to close loops, archive projects, and let go of relationships.</li>
  </ul>

  <!-- CTA ACTIONS -->
  <div style="text-align: center; margin: 35px 0; padding: 20px; border: 1px dashed #DDB146; border-radius: 8px; background-color: rgba(221, 177, 70, 0.03);">
    <p style="margin-top: 0; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option A: Download PDF Workbook</p>
    <a href="https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}&download=1" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 16px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Open Reading + Auto-Download PDF ↗
    </a>

    <p style="margin-top: 25px; margin-bottom: 5px; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option B: Explore Interactive Map Online</p>
    <a href="https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}" style="color: #DDB146; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; text-decoration: underline; display: inline-block;">
      Open Your Interactive Reading ↗
    </a>
  </div>

  <h4 style="font-family: 'Helvetica Neue', sans-serif;">📖 Your Day 4 Focus Prompt:</h4>
  <p style="color: #4A4A4A; font-style: italic;">
    Are you forcing a seed-planting phase during a clearing season? Align your workload with the season of your Personal Year.
  </p>

  <p style="margin-top: 30px;">Tomorrow, we will show you how to tie all these numbers together into a single, cohesive **Personal Operating System** to guide your weekly decisions.</p>

  <p>With perspective,</p>
  <p><strong>The MysticalDigits Team</strong></p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(18, 16, 28, 0.1); font-size: 12px; color: #9D9380; text-align: center;">
    <p>Read about timing: <a href="https://mysticaldigits.com/annual-numerology-cycles/" style="color: #DDB146; text-decoration: none;">9-Year Cycle Guide</a> · Main site: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a></p>
  </div>
</div>
```

---

## 📧 Email 5: The Premium Upgrade (Day 5)
**Trigger**: 24 hours after Email 4.
**Subject**: {{ contact.FIRSTNAME }}, meet your Custom Personal Operating System
**Preheader**: The ultimate custom workbook built for your specific frequencies.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hello {{ contact.FIRSTNAME }},</p>

  <p>Over the last four days, you have analyzed your core numbers individually.</p>

  <p>But they are not meant to be read in isolation. Together, your numbers form a single **Personal Operating System** — a custom playbook for choosing partners, negotiating money, aligning work, and timing actions.</p>

  <p>To help you implement this blueprint in your daily life, we created the **MysticalDigits Premium Workbook**.</p>

  <p>This is a custom-generated PDF workbook built exclusively for you. It is a highly practical, interactive journal designed for deep reflection and daily action.</p>

  <h3 style="font-family: 'Helvetica Neue', sans-serif; border-bottom: 1px solid #DDB146; padding-bottom: 8px;">✦ What's Inside Your 61-Page Premium Edition:</h3>
  <ul>
    <li><strong>Deep Shadow Pattern Analysis:</strong> The trigger, the coping move, the cost, and the mature response — for every number in your chart.</li>
    <li><strong>Relationship Compatibility Map:</strong> Your signature read against all twelve Life Paths, plus green lights and red flags you can actually use.</li>
    <li><strong>Career &amp; Purpose Alignment:</strong> Environments, roles and industries for your Expression, with a seven-line fit grid for any opportunity.</li>
    <li><strong>Wealth &amp; Legacy Settings:</strong> Your money archetype, where it leaks, the one rule that fixes it, and a legacy builder worksheet.</li>
    <li><strong>The Full Life Phase Map:</strong> All four Pinnacles and all four Challenges, each with its own page and age range.</li>
    <li><strong>Personalised Codes &amp; Growth Prompts:</strong> Colours, crystal, element and favourable days, plus 35 uncomfortable questions across seven domains.</li>
    <li><strong>Month-By-Month Forecast &amp; Operating System:</strong> Your Personal Year in depth, four months per page, and a 90-day execution board.</li>
    <li><strong>Printable Journals:</strong> Weekly review spreads, a monthly tracker, and a year-at-a-glance page.</li>
  </ul>

  <!-- CTA ACTIONS -->
  <div style="text-align: center; margin: 35px 0; padding: 20px; border: 1px dashed #DDB146; border-radius: 8px; background-color: rgba(221, 177, 70, 0.03);">
    <p style="margin-top: 0; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option A: Download PDF Workbook</p>
    <a href="https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}&download=1" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 16px 28px; text-decoration: none; border-radius: 4px; display: inline-block; box-shadow: 0 4px 15px rgba(221, 177, 70, 0.4);">
      Open Reading + Auto-Download PDF ↗
    </a>

    <p style="margin-top: 25px; margin-bottom: 5px; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option B: Explore Interactive Map Online</p>
    <a href="https://blueprint.mysticaldigits.com/?name={{ contact.FIRSTNAME }}+{{ contact.LASTNAME }}&dob={{ contact.DOB_ISO }}" style="color: #DDB146; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; text-decoration: underline; display: inline-block;">
      Open Your Interactive Reading ↗
    </a>
  </div>

  <p>It’s time to stop guessing your path and start executing your design with absolute clarity.</p>

  <p>To your deepest alignment,</p>
  <p><strong>The MysticalDigits Team</strong></p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(18, 16, 28, 0.1); font-size: 12px; color: #9D9380; text-align: center;">
    <p>Visit us: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a> · Support: <a href="mailto:support@mysticaldigits.com" style="color: #DDB146; text-decoration: none;">support@mysticaldigits.com</a></p>
  </div>
</div>
```

---

## Appendix: merge tags for other ESPs

**Not used by this account.** This account sends through Brevo, and Brevo does
not substitute any of the syntaxes below — it will mail them out as literal
text. Kept only as a starting point if the sequence is ever migrated.

| ESP Platform | Name Merge Tag | Date of Birth (YYYY-MM-DD) Merge Tag |
| :--- | :--- | :--- |
| **Loops.so** | `{{contact.name}}` | `{{contact.dob}}` |
| **ActiveCampaign** | `%FIRSTNAME% %LASTNAME%` | `%BIRTH_DATE%` |
| **Mailchimp** | `*\|FNAME\|* *\|LNAME\|*` | `*\|DOB\|*` |
| **ConvertKit** | `{{ subscriber.first_name }}` | `{{ subscriber.cf_birth_date }}` |
| **Klaviyo** | `{{ person.first_name }}` | `{{ person.birth_date }}` |
| **Resend** | `{{ name }}` | `{{ dob }}` |

Note that every ESP in the table above needs the same three things Brevo needs:
a name, a birth date in strict `YYYY-MM-DD`, and a `+` (not a space) between the
first and last name in the URL.

