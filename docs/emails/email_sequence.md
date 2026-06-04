# MysticalDigits: High-Converting & Personalized Onboarding Email Sequence

This email sequence uses dynamic query parameters to send returning users directly to their calculated results and premium PDF workbook, bypassing the intake quiz entirely.

---

## ⚡ CRITICAL: How to Set Up the Direct Bypass Links
To prevent subscribers from having to take the quiz again, you must construct the CTA links using your Email Service Provider's (ESP) dynamic merge tags. 

Use this format for your CTA buttons:
`https://life-path.mysticaldigits.com/?name=YOUR_NAME_TAG&dob=YOUR_DOB_TAG`

### 📋 Platform-Specific Merge Tag Reference Table

| ESP Platform | Name Merge Tag | Date of Birth (YYYY-MM-DD) Merge Tag | Example CTA Link |
| :--- | :--- | :--- | :--- |
| **Loops.so** | `{{contact.name}}` | `{{contact.dob}}` | `https://life-path.mysticaldigits.com/?name={{contact.name}}&dob={{contact.dob}}` |
| **ActiveCampaign** | `%FIRSTNAME% %LASTNAME%` | `%BIRTH_DATE%` | `https://life-path.mysticaldigits.com/?name=%FIRSTNAME%+%LASTNAME%&dob=%BIRTH_DATE%` |
| **Mailchimp** | `*|FNAME|* *|LNAME|*` | `*|DOB|*` | `https://life-path.mysticaldigits.com/?name=*|FNAME|*+*|LNAME|*&dob=*|DOB|*` |
| **ConvertKit** | `{{ subscriber.first_name }}` | `{{ subscriber.cf_birth_date }}` | `https://life-path.mysticaldigits.com/?name={{ subscriber.first_name }}&dob={{ subscriber.cf_birth_date }}` |
| **Klaviyo** | `{{ person.first_name }}` | `{{ person.birth_date }}` | `https://life-path.mysticaldigits.com/?name={{ person.first_name }}&dob={{ person.birth_date }}` |
| **Resend** | `{{ name }}` | `{{ dob }}` | `https://life-path.mysticaldigits.com/?name={{ name }}&dob={{ dob }}` |

---

## 📧 Email 1: Welcome & Instant Results Bypass (Day 1)
**Trigger**: Immediately after intake submission.
**Subject**: ✦ {{first_name}}, your custom Life Path {{life_path_number}} Blueprint is unlocked!
**Preheader**: Open to access your six-number alignment map, sacred geometry chart, and custom PDF workbook.

```html
<!-- HEADER LOGO -->
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<!-- EMAIL BODY -->
<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  
  <p>Hello {{first_name}},</p>
  
  <p>Your cosmic calculations are ready. Your birth numbers and name frequencies have been mapped, and your personalized results are fully compiled.</p>
  
  <p>To view your interactive numerology map and download your high-value printable workbook, use your direct access link below. <strong>(This link bypasses the intake quiz, loading your custom numbers immediately)</strong>:</p>

  <!-- PREMIUM CTA BUTTON -->
  <div style="text-align: center; margin: 35px 0;">
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 18px 32px; text-decoration: none; border-radius: 4px; display: inline-block; box-shadow: 0 4px 15px rgba(221, 177, 70, 0.4);">
      Access Your Custom Reading ↗
    </a>
  </div>

  <p>Your core frequency is <strong>Life Path {{life_path_number}}</strong>. In Pythagorean numerology, the Life Path represents your primary developmental rhythm. It is not deterministic; it acts as a mirror showing where your energy naturally thrives and where it encounters friction.</p>

  <h3 style="font-family: 'Helvetica Neue', Helvetica, sans-serif; color: #12101C; border-bottom: 1px solid #DDB146; padding-bottom: 8px; margin-top: 30px;">✦ Your Core Alignment Profile</h3>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: sans-serif; font-size: 14px;">
    <tr style="border-bottom: 1px solid rgba(18, 16, 28, 0.1);">
      <td style="padding: 10px 0; font-weight: bold; color: #9D9380;">Growth Pattern (Life Path)</td>
      <td style="padding: 10px 0; text-align: right; font-weight: bold;">Number {{life_path_number}}</td>
    </tr>
    <tr style="border-bottom: 1px solid rgba(18, 16, 28, 0.1);">
      <td style="padding: 10px 0; font-weight: bold; color: #9D9380;">Talent Vector (Expression)</td>
      <td style="padding: 10px 0; text-align: right; font-weight: bold;">Number {{expression_number}}</td>
    </tr>
    <tr style="border-bottom: 1px solid rgba(18, 16, 28, 0.1);">
      <td style="padding: 10px 0; font-weight: bold; color: #9D9380;">Internal Fuel (Soul Urge)</td>
      <td style="padding: 10px 0; text-align: right; font-weight: bold;">Number {{soul_urge_number}}</td>
    </tr>
  </table>

  <h4 style="margin-top: 30px; font-family: 'Helvetica Neue', sans-serif;">📖 Your Day 1 Alignment Prompt:</h4>
  <p style="color: #4A4A4A; font-style: italic; background-color: rgba(221, 177, 70, 0.05); padding: 15px; border-left: 3px solid #DDB146;">
    Think about the last major conflict you faced. Did you handle it with the mature leadership of your numbers, or did you slip into the shadow side (e.g. overthinking, control, avoidance)? Simply noting the pattern is the first step of self-discovery.
  </p>

  <p style="margin-top: 30px;">Tomorrow, we will explore your <strong>Soul Urge</strong> — the silent, private drive that governs your relationships, career desires, and quiet moments.</p>

  <p>In alignment,</p>
  <p><strong>The MysticalDigits Team</strong></p>

  <div style="margin-top: 40px; padding-top: 20px; border-t: 1px solid rgba(18, 16, 28, 0.1); font-size: 12px; color: #9D9380; text-align: center;">
    <p>Explore resources: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a> · Read our blog: <a href="https://mysticaldigits.com/blog" style="color: #DDB146; text-decoration: none;">Guides & Insights</a></p>
  </div>
</div>
```

---

## 📧 Email 2: The Soul Urge & Private Values (Day 2)
**Trigger**: 24 hours after Email 1.
**Subject**: {{first_name}}, are you feeding your Soul Urge {{soul_urge_number}}?
**Preheader**: The silent fuel dictating your core satisfaction in work and love.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hello {{first_name}},</p>

  <p>Yesterday, we discussed your Life Path. Today, we look deeper at your **Soul Urge Number {{soul_urge_number}}**.</p>

  <p>While the Life Path represents external lessons, the Soul Urge is calculated from the vowels of your birth name. In ancient naming rituals, vowels represented the breath of the spirit. Your Soul Urge represents your private motivation — what you need to feel satisfied, independent of public praise.</p>

  <p>If your daily work, your boundaries, or your relationships do not satisfy your Soul Urge {{soul_urge_number}} fuel, you will experience a persistent feeling of depletion, regardless of how much money you make or how successful you look.</p>

  <div style="background-color: rgba(221, 177, 70, 0.05); border-left: 3px solid #DDB146; padding: 18px; margin: 25px 0;">
    <p style="margin: 0; font-weight: bold; font-family: sans-serif; font-size: 14px; color: #12101C; text-transform: uppercase; letter-spacing: 0.05em;">✦ Soul Urge {{soul_urge_number}} Core Drive:</p>
    <p style="margin: 8px 0 0 0; color: #4A4A4A; font-style: italic;">"{{soul_urge_short_description}}"</p>
  </div>

  <p>To review your full Soul Urge readings and check your personal operating filters, click your bypass link below:</p>

  <div style="text-align: center; margin: 35px 0;">
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 18px 32px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Review Soul Urge Readings ↗
    </a>
  </div>

  <h4 style="font-family: 'Helvetica Neue', sans-serif;">📖 Your Day 2 Aligned Question:</h4>
  <p style="color: #4A4A4A; font-style: italic;">
    Look at your current environment. Are you compromising your core drive to keep the peace, or is your space designed to fuel your Soul Urge?
  </p>

  <p style="margin-top: 30px;">Tomorrow, we will explore your **Expression/Destiny Number**: how you are designed to packages your talents for real-world impact and authority.</p>

  <p>To your alignment,</p>
  <p><strong>The MysticalDigits Team</strong></p>

  <div style="margin-top: 40px; padding-top: 20px; border-t: 1px solid rgba(18, 16, 28, 0.1); font-size: 12px; color: #9D9380; text-align: center;">
    <p>Read about numbers: <a href="https://mysticaldigits.com/blog/birthday-numbers-meaning" style="color: #DDB146; text-decoration: none;">Birthday Meanings</a> · Support: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a></p>
  </div>
</div>
```

---

## 📧 Email 3: Expression & Career Vectors (Day 3)
**Trigger**: 24 hours after Email 2.
**Subject**: {{first_name}}, are you using your natural talent vector? (Expression {{expression_number}})
**Preheader**: The naming blueprint that defines your career success and legacy.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hello {{first_name}},</p>

  <p>Your Life Path shows the path of your growth. Your Soul Urge shows your fuel. Today, let’s unlock your <strong>Expression (Destiny) Number {{expression_number}}</strong>.</p>

  <p>This number is computed from all letters in your birth name. In classical numerology, the Expression represents your tangible capabilities — how your mind, problem-solving skills, and output are built to affect the real world.</p>

  <p>Your destiny profile represents your structural advantage:</p>
  <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-family: sans-serif; font-size: 14px; border: 1px solid rgba(221,177,70,0.2);">
    <tr style="background-color: rgba(221, 177, 70, 0.05);">
      <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid rgba(221,177,70,0.2);">Expression Vector</td>
      <td style="padding: 12px; border-bottom: 1px solid rgba(221,177,70,0.2); font-weight: bold; text-align: right;">Number {{expression_number}}</td>
    </tr>
    <tr>
      <td style="padding: 12px; font-weight: bold;">Legacy Archetype</td>
      <td style="padding: 12px; text-align: right; font-style: italic;">{{expression_title}}</td>
    </tr>
  </table>

  <p>When you align your work with your Expression {{expression_number}} archetype, your output carries leverage. You stop feeling like you are pushing a boulder uphill and start working with your natural design.</p>

  <div style="text-align: center; margin: 35px 0;">
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 18px 32px; text-decoration: none; border-radius: 4px; display: inline-block;">
      See Your Destiny Interpretation ↗
    </a>
  </div>

  <h4 style="font-family: 'Helvetica Neue', sans-serif;">📖 Your Day 3 Integration:</h4>
  <p style="color: #4A4A4A; font-style: italic;">
    Identify the single most common task in your week. Does it align with the strengths of your Destiny number, or does it drain you because it asks you to operate against your code?
  </p>

  <p style="margin-top: 30px;">Tomorrow, we talk about **timing**. We will look at your Personal Year and Month to prevent you from forcing decisions in the wrong season.</p>

  <p>In flow,</p>
  <p><strong>The MysticalDigits Team</strong></p>

  <div style="margin-top: 40px; padding-top: 20px; border-t: 1px solid rgba(18, 16, 28, 0.1); font-size: 12px; color: #9D9380; text-align: center;">
    <p>Read about expression: <a href="https://mysticaldigits.com/blog/expression-career-guide" style="color: #DDB146; text-decoration: none;">Career Vector Guide</a> · Home: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a></p>
  </div>
</div>
```

---

## 📧 Email 4: Personal Timing & Cycles (Day 4)
**Trigger**: 24 hours after Email 3.
**Subject**: Stop fighting the tide, {{first_name}}
**Preheader**: Why Personal Year {{personal_year}} and Personal Month {{personal_month}} dictate your success.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hi {{first_name}},</p>

  <p>Why do some months feel like walking through wet cement, while other months bring effortless windfalls, partnerships, and breakthroughs?</p>

  <p>The answer lies in your timing cycles. You are currently navigating **Personal Year {{personal_year}}** and **Personal Month {{personal_month}}**.</p>

  <p>Numerology groups life into 9-year waves. Each year has a clean season:</p>
  <ul>
    <li><strong>1 Year (Initiation)</strong>: A season to plant bold seeds, take risks, and go first.</li>
    <li><strong>7 Year (Inner Growth)</strong>: A season for study, solitude, and research. Pushing for external scale this year often leads to burnout.</li>
    <li><strong>9 Year (Completion)</strong>: A season to close loops, archive projects, and let go of relationships. Pushing for new commitments during a 9 Year feels like swimming upstream.</li>
  </ul>

  <p>Your current Personal Month is {{personal_month}}. Use this filter to decide what to say yes to over the next 30 days.</p>

  <div style="text-align: center; margin: 35px 0;">
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 18px 32px; text-decoration: none; border-radius: 4px; display: inline-block;">
      View Your Timing Calendar ↗
    </a>
  </div>

  <h4 style="font-family: 'Helvetica Neue', sans-serif;">📖 Your Day 4 Focus Prompt:</h4>
  <p style="color: #4A4A4A; font-style: italic;">
    Are you forcing a seed-planting phase during a clearing season? Align your workload with the season of your Personal Year {{personal_year}}.
  </p>

  <p style="margin-top: 30px;">Tomorrow, we will show you how to tie all these numbers together into a single, cohesive **Personal Operating System** to guide your weekly decisions.</p>

  <p>With perspective,</p>
  <p><strong>The MysticalDigits Team</strong></p>

  <div style="margin-top: 40px; padding-top: 20px; border-t: 1px solid rgba(18, 16, 28, 0.1); font-size: 12px; color: #9D9380; text-align: center;">
    <p>Read about timing: <a href="https://mysticaldigits.com/blog/numerology-cycles" style="color: #DDB146; text-decoration: none;">9-Year Cycle Guide</a> · Main site: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a></p>
  </div>
</div>
```

---

## 📧 Email 5: The Premium Upgrade (Day 5)
**Trigger**: 24 hours after Email 4.
**Subject**: {{first_name}}, meet your Custom Personal Operating System
**Preheader**: The ultimate 64-page custom workbook built for your specific frequencies.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hello {{first_name}},</p>

  <p>Over the last four days, you have analyzed your core numbers individually.</p>

  <p>But they are not meant to be read in isolation. Together, your numbers form a single **Personal Operating System** — a custom playbook for choosing partners, negotiating money, aligning work, and timing actions.</p>

  <p>To help you implement this blueprint in your daily life, we created the **MysticalDigits Premium Workbook**.</p>

  <p>This is a custom-generated, 64-page PDF workbook built exclusively for you. It is a highly practical, interactive journal designed for deep reflection and daily action.</p>

  <h3 style="font-family: 'Helvetica Neue', sans-serif; border-bottom: 1px solid #DDB146; padding-bottom: 8px;">✦ What’s Inside Your Premium OS Workbook:</h3>
  <ul>
    <li><strong>Advanced Shadow-to-Strategy Maps:</strong> How to convert your numbers' typical friction points into practical behaviors.</li>
    <li><strong>Wealth & Legacy Settings:</strong> Leveraging your Expression {{expression_number}} for career authority.</li>
    <li><strong>Interactive 12-Month Calendar:</strong> Specific timing rules, rituals, and monthly tracking pages.</li>
    <li><strong>Printable Reflection Journals:</strong> High-value prompts to clarify your goals and boundaries.</li>
  </ul>

  <!-- HIGH CONVERTING CTA BUTTON -->
  <div style="text-align: center; margin: 35px 0;">
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 18px 32px; text-decoration: none; border-radius: 4px; display: inline-block; box-shadow: 0 4px 15px rgba(221, 177, 70, 0.4);">
      Get Your Custom Operating System Workbook ↗
    </a>
  </div>

  <p>It’s time to stop guessing your path and start executing your design with absolute clarity.</p>

  <p>To your deepest alignment,</p>
  <p><strong>The MysticalDigits Team</strong></p>

  <div style="margin-top: 40px; padding-top: 20px; border-t: 1px solid rgba(18, 16, 28, 0.1); font-size: 12px; color: #9D9380; text-align: center;">
    <p>Visit us: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a> · Support: <a href="mailto:support@mysticaldigits.com" style="color: #DDB146; text-decoration: none;">support@mysticaldigits.com</a></p>
  </div>
</div>
```
