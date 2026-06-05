# MysticalDigits: High-Converting & Personalized Onboarding Email Sequence

This email sequence uses dynamic query parameters to send returning users directly to their calculated results and premium PDF workbook, bypassing the intake quiz entirely.

---

## ⚡ CRITICAL: How to Set Up the Direct Bypass Links
To prevent subscribers from having to take the quiz again, you must construct the CTA links using your Email Service Provider's (ESP) dynamic merge tags.

Use this format for your CTA buttons:

1. **Primary CTA (Open Reading & Auto-Download PDF):**
   `https://life-path.mysticaldigits.com/?name=YOUR_NAME_TAG&dob=YOUR_DOB_TAG&download=1` (or `{{pdf_url}}` if pre-mapped to this URL)

2. **Secondary CTA (Open Interactive Reading only):**
   `https://life-path.mysticaldigits.com/?name=YOUR_NAME_TAG&dob=YOUR_DOB_TAG`

### 📋 Platform-Specific Merge Tag Reference Table

| ESP Platform | Name Merge Tag | Date of Birth (YYYY-MM-DD) Merge Tag | Example Primary CTA Link |
| :--- | :--- | :--- | :--- |
| **Loops.so** | `{{contact.name}}` | `{{contact.dob}}` | `https://life-path.mysticaldigits.com/?name={{contact.name}}&dob={{contact.dob}}&download=1` |
| **ActiveCampaign** | `%FIRSTNAME% %LASTNAME%` | `%BIRTH_DATE%` | `https://life-path.mysticaldigits.com/?name=%FIRSTNAME%+%LASTNAME%&dob=%BIRTH_DATE%&download=1` |
| **Mailchimp** | `*|FNAME|* *|LNAME|*` | `*|DOB|*` | `https://life-path.mysticaldigits.com/?name=*|FNAME|*+*|LNAME|*&dob=*|DOB|*&download=1` |
| **ConvertKit** | `{{ subscriber.first_name }}` | `{{ subscriber.cf_birth_date }}` | `https://life-path.mysticaldigits.com/?name={{ subscriber.first_name }}&dob={{ subscriber.cf_birth_date }}&download=1` |
| **Klaviyo** | `{{ person.first_name }}` | `{{ person.birth_date }}` | `https://life-path.mysticaldigits.com/?name={{ person.first_name }}&dob={{ person.birth_date }}&download=1` |
| **Resend** | `{{ name }}` | `{{ dob }}` | `https://life-path.mysticaldigits.com/?name={{ name }}&dob={{ dob }}&download=1` |

---

## 📧 Email 1: Welcome & Instant Results Bypass (Day 1)
**Trigger**: Immediately after intake submission.
**Subject**: {{first_name}}, your personalized MysticalDigits PDF is ready
**Preheader**: Confirming your blueprint is ready. Open to auto-download your workbook and view your interactive map.

```html
<!-- HEADER LOGO -->
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<!-- EMAIL BODY -->
<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  
  <p>Hello {{first_name}},</p>
  
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
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}&download=1" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 28px; text-decoration: none; border-radius: 4px; display: inline-block; box-shadow: 0 4px 12px rgba(221, 177, 70, 0.3);">
      Open Reading + Auto-Download PDF ↗
    </a>
    <div style="margin-top: 8px; font-size: 11px; color: #9D9380; font-family: sans-serif;">(Points directly to your profile and triggers PDF download in browser)</div>

    <p style="margin-top: 25px; margin-bottom: 5px; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option B: Explore Interactive Map Online</p>
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}" style="color: #DDB146; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; text-decoration: underline; display: inline-block;">
      Open Your Interactive Reading ↗
    </a>
  </div>

  <p>In Pythagorean numerology, your numbers act as a mirror, showing where your energy naturally thrives and where it encounters friction. We hope this blueprint serves as a helpful reflective planning tool.</p>

  <p>Tomorrow, we will explore your <strong>Soul Urge</strong> — the silent, private drive that governs your relationships, career desires, and quiet moments.</p>

  <p>In alignment,</p>
  <p><strong>The MysticalDigits Team</strong></p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(18, 16, 28, 0.1); font-size: 12px; color: #9D9380; text-align: center;">
    <p>Explore resources: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a> · Read our blog: <a href="https://mysticaldigits.com/blog" style="color: #DDB146; text-decoration: none;">Guides & Insights</a></p>
  </div>
</div>
```

---

## 📧 Email 2: The Soul Urge & Private Values (Day 2)
**Trigger**: 24 hours after Email 1.
**Subject**: {{first_name}}, are you feeding your Soul Urge?
**Preheader**: The silent fuel dictating your core satisfaction in work and love.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hello {{first_name}},</p>

  <p>Yesterday, we discussed your Life Path. Today, we look deeper at your **Soul Urge** (also known as the Heart's Desire).</p>

  <p>While the Life Path represents your external journey, the Soul Urge represents your private motivation — what you need to feel satisfied, independent of public praise.</p>

  <p>If your daily work, your boundaries, or your relationships do not satisfy your Soul Urge fuel, you will experience a persistent feeling of depletion, regardless of how much success you achieve.</p>

  <!-- CTA ACTIONS -->
  <div style="text-align: center; margin: 35px 0; padding: 20px; border: 1px dashed #DDB146; border-radius: 8px; background-color: rgba(221, 177, 70, 0.03);">
    <p style="margin-top: 0; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option A: Download PDF Workbook</p>
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}&download=1" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 16px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Open Reading + Auto-Download PDF ↗
    </a>

    <p style="margin-top: 25px; margin-bottom: 5px; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option B: Explore Interactive Map Online</p>
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}" style="color: #DDB146; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; text-decoration: underline; display: inline-block;">
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
    <p>Read about numbers: <a href="https://mysticaldigits.com/blog/birthday-numbers-meaning" style="color: #DDB146; text-decoration: none;">Birthday Meanings</a> · Support: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a></p>
  </div>
</div>
```

---

## 📧 Email 3: Expression & Career Vectors (Day 3)
**Trigger**: 24 hours after Email 2.
**Subject**: {{first_name}}, are you using your natural talent vector?
**Preheader**: The naming blueprint that defines your career success and legacy.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hello {{first_name}},</p>

  <p>Your Life Path shows the path of your growth. Your Soul Urge shows your fuel. Today, let’s unlock your <strong>Expression (Destiny) Number</strong>.</p>

  <p>This number is computed from all letters in your birth name. In classical numerology, the Expression represents your tangible capabilities — how your mind, problem-solving skills, and output are built to affect the real world.</p>

  <p>When you align your work with your Expression archetype, your output carries leverage. You stop feeling like you are pushing a boulder uphill and start working with your natural design.</p>

  <!-- CTA ACTIONS -->
  <div style="text-align: center; margin: 35px 0; padding: 20px; border: 1px dashed #DDB146; border-radius: 8px; background-color: rgba(221, 177, 70, 0.03);">
    <p style="margin-top: 0; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option A: Download PDF Workbook</p>
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}&download=1" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 16px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Open Reading + Auto-Download PDF ↗
    </a>

    <p style="margin-top: 25px; margin-bottom: 5px; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option B: Explore Interactive Map Online</p>
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}" style="color: #DDB146; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; text-decoration: underline; display: inline-block;">
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
    <p>Read about expression: <a href="https://mysticaldigits.com/blog/expression-career-guide" style="color: #DDB146; text-decoration: none;">Career Vector Guide</a> · Home: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a></p>
  </div>
</div>
```

---

## 📧 Email 4: Personal Timing & Cycles (Day 4)
**Trigger**: 24 hours after Email 3.
**Subject**: Stop fighting the tide, {{first_name}}
**Preheader**: Why your Personal Year and Personal Month dictate your success.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hi {{first_name}},</p>

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
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}&download=1" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 16px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Open Reading + Auto-Download PDF ↗
    </a>

    <p style="margin-top: 25px; margin-bottom: 5px; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option B: Explore Interactive Map Online</p>
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}" style="color: #DDB146; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; text-decoration: underline; display: inline-block;">
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
    <p>Read about timing: <a href="https://mysticaldigits.com/blog/numerology-cycles" style="color: #DDB146; text-decoration: none;">9-Year Cycle Guide</a> · Main site: <a href="https://mysticaldigits.com" style="color: #DDB146; text-decoration: none;">mysticaldigits.com</a></p>
  </div>
</div>
```

---

## 📧 Email 5: The Premium Upgrade (Day 5)
**Trigger**: 24 hours after Email 4.
**Subject**: {{first_name}}, meet your Custom Personal Operating System
**Preheader**: The ultimate custom workbook built for your specific frequencies.

```html
<div style="text-align: center; padding: 20px 0; background-color: #0B0B14;">
  <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; letter-spacing: 0.35em; color: #DDB146; text-transform: uppercase;">✦ MYSTICALDIGITS ✦</p>
</div>

<div style="font-family: 'Georgia', Times, serif; font-size: 16px; line-height: 1.8; color: #12101C; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #FCF6E9;">
  <p>Hello {{first_name}},</p>

  <p>Over the last four days, you have analyzed your core numbers individually.</p>

  <p>But they are not meant to be read in isolation. Together, your numbers form a single **Personal Operating System** — a custom playbook for choosing partners, negotiating money, aligning work, and timing actions.</p>

  <p>To help you implement this blueprint in your daily life, we created the **MysticalDigits Premium Workbook**.</p>

  <p>This is a custom-generated PDF workbook built exclusively for you. It is a highly practical, interactive journal designed for deep reflection and daily action.</p>

  <h3 style="font-family: 'Helvetica Neue', sans-serif; border-bottom: 1px solid #DDB146; padding-bottom: 8px;">✦ What’s Inside Your Premium OS Workbook:</h3>
  <ul>
    <li><strong>Advanced Shadow-to-Strategy Maps:</strong> How to convert your numbers' typical friction points into practical behaviors.</li>
    <li><strong>Wealth & Legacy Settings:</strong> Leveraging your Expression for career authority.</li>
    <li><strong>Interactive 12-Month Calendar:</strong> Specific timing rules, rituals, and monthly tracking pages.</li>
    <li><strong>Printable Reflection Journals:</strong> High-value prompts to clarify your goals and boundaries.</li>
  </ul>

  <!-- CTA ACTIONS -->
  <div style="text-align: center; margin: 35px 0; padding: 20px; border: 1px dashed #DDB146; border-radius: 8px; background-color: rgba(221, 177, 70, 0.03);">
    <p style="margin-top: 0; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option A: Download PDF Workbook</p>
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}&download=1" style="background-color: #DDB146; color: #12101C; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; padding: 16px 28px; text-decoration: none; border-radius: 4px; display: inline-block; box-shadow: 0 4px 15px rgba(221, 177, 70, 0.4);">
      Open Reading + Auto-Download PDF ↗
    </a>

    <p style="margin-top: 25px; margin-bottom: 5px; font-weight: bold; font-family: 'Helvetica Neue', sans-serif; font-size: 14px;">Option B: Explore Interactive Map Online</p>
    <a href="https://life-path.mysticaldigits.com/?name={{full_name}}&dob={{birth_date}}" style="color: #DDB146; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: bold; font-size: 14px; text-decoration: underline; display: inline-block;">
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
