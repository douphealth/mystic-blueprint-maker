import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BlueprintReadyProps {
  firstName?: string
  lifePathNumber?: number | string
  readingUrl?: string
  purchaseUrl?: string
  unsubscribeUrl?: string
}

const ROOT_URL = 'https://mysticaldigits.com'

export const BlueprintReadyEmail = ({
  firstName = 'Seeker',
  lifePathNumber,
  readingUrl = ROOT_URL,
  purchaseUrl = `${ROOT_URL}/?upgrade=1`,
  unsubscribeUrl = `${ROOT_URL}/unsubscribe`,
}: BlueprintReadyProps) => {
  const subjectLine = lifePathNumber
    ? `${firstName}, your Life Path ${lifePathNumber} blueprint is unlocked`
    : `${firstName}, your numerology blueprint is unlocked`

  return (
    <Html>
      <Head />
      <Preview>{subjectLine} — the patterns the universe encoded the day you were born.</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Hero — cinematic dark card */}
          <Section style={hero}>
            <Text style={kicker}>✦ YOUR NUMEROLOGY BLUEPRINT</Text>
            <Heading style={h1}>
              {firstName}, the numbers<br />have spoken.
            </Heading>
            <Text style={heroSub}>
              {lifePathNumber
                ? `Your Life Path ${lifePathNumber} reading is ready — a one-of-one map of the energies you were born to carry.`
                : `Your full reading is ready — a one-of-one map of the energies you were born to carry.`}
            </Text>
            <Button href={readingUrl} style={ctaPrimary}>
              Reveal My Blueprint →
            </Button>
            <Text style={heroNote}>One tap. No password. Instant access.</Text>
          </Section>

          {/* What's inside */}
          <Section style={card}>
            <Heading as="h2" style={h2}>What the universe encoded in you</Heading>
            <Text style={bullet}>◆ <strong>Life Path</strong> — the soul mission you incarnated to fulfill</Text>
            <Text style={bullet}>◆ <strong>Destiny &amp; Expression</strong> — the gifts you’re built to share</Text>
            <Text style={bullet}>◆ <strong>Soul Urge</strong> — what your heart secretly craves</Text>
            <Text style={bullet}>◆ <strong>Karmic Debt &amp; Master Number alerts</strong> — hidden cycles most people never see</Text>
          </Section>

          {/* Premium offer — the actual money line */}
          <Section style={offerCard}>
            <Text style={offerKicker}>UNLOCK THE COMPLETE BLUEPRINT</Text>
            <Heading as="h2" style={h2Light}>
              Your full 40-page personal reading — <span style={gold}>$7.99</span> once. Yours forever.
            </Heading>
            <Text style={offerBody}>
              Deep-dive interpretations of every core number. Year-by-year forecast. Compatibility profile.
              Karmic alerts. Downloadable PDF blueprint. No subscription. No upsells.
            </Text>
            <Button href={purchaseUrl} style={ctaGold}>
              Unlock My Full Reading — $7.99
            </Button>
            <Text style={guarantee}>
              ✓ Instant access &nbsp;·&nbsp; ✓ Lifetime PDF &nbsp;·&nbsp; ✓ 100% private
            </Text>
          </Section>

          {/* Social proof */}
          <Section style={proofCard}>
            <Text style={stars}>★ ★ ★ ★ ★</Text>
            <Text style={quote}>
              “It was eerily accurate. I’ve done astrology readings that cost $200 and weren’t half this specific.
              The karmic debt section alone made the whole thing worth it.”
            </Text>
            <Text style={quoteAttr}>— Maya R., verified reader</Text>
          </Section>

          {/* Secondary CTA */}
          <Section style={{ textAlign: 'center', padding: '8px 24px 32px' }}>
            <Text style={smallMuted}>Want to see your free preview first?</Text>
            <Link href={readingUrl} style={secondaryLink}>Open my free reading →</Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerBrand}>Your Numerology Blueprint</Text>
            <Text style={footerText}>
              You received this because you requested your personal blueprint at mysticaldigits.com.
            </Text>
            <Text style={footerText}>
              <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe</Link>
              &nbsp;·&nbsp;
              <Link href={ROOT_URL} style={footerLink}>mysticaldigits.com</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BlueprintReadyEmail,
  subject: (data: Record<string, any>) => {
    const name = data?.firstName || 'Seeker'
    const lp = data?.lifePathNumber
    return lp
      ? `${name}, your Life Path ${lp} blueprint is ready ✦`
      : `${name}, your numerology blueprint is ready ✦`
  },
  displayName: 'Blueprint Ready',
  previewData: {
    firstName: 'Alex',
    lifePathNumber: 7,
    readingUrl: ROOT_URL,
    purchaseUrl: `${ROOT_URL}/?upgrade=1`,
  },
} satisfies TemplateEntry

/* ===== Styles ===== */

const body: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
  color: '#1a1a2e',
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '24px 16px 40px',
}

const hero: React.CSSProperties = {
  background: 'linear-gradient(160deg, #0F0F23 0%, #1E1B4B 55%, #2A1F4A 100%)',
  borderRadius: '20px',
  padding: '44px 32px 40px',
  textAlign: 'center',
  color: '#ffffff',
}

const kicker: React.CSSProperties = {
  color: '#E6C76A',
  letterSpacing: '0.28em',
  fontSize: '11px',
  fontWeight: 600,
  margin: '0 0 18px',
  textTransform: 'uppercase',
}

const h1: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '34px',
  lineHeight: '1.15',
  margin: '0 0 16px',
  color: '#ffffff',
  fontWeight: 400,
}

const heroSub: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.55',
  color: '#D7D3E8',
  margin: '0 auto 28px',
  maxWidth: '460px',
}

const ctaPrimary: React.CSSProperties = {
  backgroundColor: '#E6C76A',
  color: '#16162E',
  fontSize: '15px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '16px 32px',
  borderRadius: '999px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 10px 30px rgba(230,199,106,0.35)',
}

const heroNote: React.CSSProperties = {
  marginTop: '18px',
  fontSize: '12px',
  color: '#A9A4C2',
  letterSpacing: '0.04em',
}

const card: React.CSSProperties = {
  background: '#FAF8F2',
  border: '1px solid #EFE7D2',
  borderRadius: '16px',
  padding: '28px 28px 12px',
  margin: '24px 0',
}

const h2: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '22px',
  margin: '0 0 14px',
  color: '#16162E',
  fontWeight: 400,
}

const h2Light: React.CSSProperties = {
  ...h2,
  color: '#ffffff',
  fontSize: '24px',
  lineHeight: '1.25',
}

const bullet: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 8px',
  color: '#2A2A4A',
}

const offerCard: React.CSSProperties = {
  background: 'linear-gradient(155deg, #16162E 0%, #251E47 100%)',
  borderRadius: '18px',
  padding: '32px 28px',
  textAlign: 'center',
  color: '#ffffff',
  margin: '24px 0',
}

const offerKicker: React.CSSProperties = {
  color: '#E6C76A',
  letterSpacing: '0.28em',
  fontSize: '10px',
  fontWeight: 700,
  margin: '0 0 12px',
}

const gold: React.CSSProperties = {
  color: '#E6C76A',
  fontWeight: 700,
}

const offerBody: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.65',
  color: '#CFC9E6',
  margin: '12px auto 24px',
  maxWidth: '440px',
}

const ctaGold: React.CSSProperties = {
  background: 'linear-gradient(135deg, #E6C76A 0%, #B8923A 100%)',
  color: '#16162E',
  fontSize: '15px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  padding: '16px 30px',
  borderRadius: '999px',
  textDecoration: 'none',
  display: 'inline-block',
  textTransform: 'uppercase',
}

const guarantee: React.CSSProperties = {
  marginTop: '16px',
  fontSize: '12px',
  color: '#A9A4C2',
  letterSpacing: '0.04em',
}

const proofCard: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ECE7DC',
  borderRadius: '14px',
  padding: '24px 24px',
  textAlign: 'center',
  margin: '8px 0 20px',
}

const stars: React.CSSProperties = {
  color: '#E6C76A',
  fontSize: '16px',
  letterSpacing: '0.2em',
  margin: '0 0 10px',
}

const quote: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '16px',
  fontStyle: 'italic',
  lineHeight: '1.6',
  color: '#2A2A4A',
  margin: '0 0 10px',
}

const quoteAttr: React.CSSProperties = {
  fontSize: '12px',
  color: '#6C6885',
  letterSpacing: '0.05em',
  margin: 0,
}

const smallMuted: React.CSSProperties = {
  fontSize: '13px',
  color: '#6C6885',
  margin: '0 0 6px',
}

const secondaryLink: React.CSSProperties = {
  color: '#16162E',
  fontWeight: 600,
  textDecoration: 'underline',
  fontSize: '14px',
}

const divider: React.CSSProperties = {
  borderColor: '#ECE7DC',
  margin: '24px 0 16px',
}

const footer: React.CSSProperties = {
  textAlign: 'center',
  padding: '0 16px 16px',
}

const footerBrand: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '14px',
  color: '#16162E',
  margin: '0 0 8px',
  letterSpacing: '0.04em',
}

const footerText: React.CSSProperties = {
  fontSize: '11px',
  color: '#8A86A0',
  lineHeight: '1.6',
  margin: '0 0 4px',
}

const footerLink: React.CSSProperties = {
  color: '#8A86A0',
  textDecoration: 'underline',
}

export default BlueprintReadyEmail
