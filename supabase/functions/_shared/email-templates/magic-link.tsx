/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your numerology blueprint is ready — the numbers don't lie ✦</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Hero card */}
        <Section style={heroCard}>
          <Text style={eyebrow}>✦ YOUR BLUEPRINT IS READY</Text>
          <Heading style={h1}>The universe has your number.</Heading>
          <Text style={lede}>
            We've decoded your Life Path, Destiny, Soul Urge and the hidden patterns shaping your next chapter.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Reveal My Blueprint →
          </Button>
          <Text style={microNote}>One tap. No password. Instant access.</Text>
        </Section>

        {/* What's inside */}
        <Section style={card}>
          <Text style={cardTitle}>What's waiting inside</Text>
          <Text style={bullet}><span style={dot}>◆</span> Your <strong>Life Path Number</strong> — the soul contract you signed at birth</Text>
          <Text style={bullet}><span style={dot}>◆</span> Your <strong>Destiny &amp; Expression</strong> — what you're built to create</Text>
          <Text style={bullet}><span style={dot}>◆</span> Your <strong>Soul Urge</strong> — the secret motivation behind every choice</Text>
          <Text style={bullet}><span style={dot}>◆</span> Karmic Debt &amp; Master Number alerts most readings miss</Text>
        </Section>

        {/* Social proof */}
        <Section style={proofCard}>
          <Text style={quote}>
            "It was eerily accurate. Read me better than my own therapist."
          </Text>
          <Text style={attribution}>— Maya R., verified reader · ★★★★★</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footerTitle}>{siteName}</Text>
        <Text style={footer}>
          Your blueprint stays sealed until you open it. This link is private to you and expires in 60 minutes.
        </Text>
        <Text style={footerMuted}>
          Didn't request this? You can safely ignore — no account was created.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

/* ============ STYLES ============ */
const main = {
  backgroundColor: '#F5F1E8',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, sans-serif',
  margin: 0,
  padding: '32px 16px',
}
const container = { maxWidth: '560px', margin: '0 auto' }

const heroCard = {
  background: 'linear-gradient(160deg, #16162E 0%, #1F1B3D 55%, #2A1F4A 100%)',
  borderRadius: '20px',
  padding: '44px 32px 38px',
  textAlign: 'center' as const,
  border: '1px solid #2C2A4E',
}
const eyebrow = {
  color: '#E6C76A',
  fontSize: '11px',
  fontWeight: '700' as const,
  letterSpacing: '3px',
  margin: '0 0 18px',
}
const h1 = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '36px',
  lineHeight: '1.1',
  fontWeight: '700' as const,
  color: '#FFFFFF',
  margin: '0 0 16px',
}
const lede = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#C9C7DC',
  margin: '0 0 28px',
}
const button = {
  background: 'linear-gradient(180deg, #E6C76A 0%, #B8923A 100%)',
  color: '#16162E',
  fontSize: '15px',
  fontWeight: '700' as const,
  letterSpacing: '0.6px',
  borderRadius: '999px',
  padding: '16px 36px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 8px 24px rgba(184,146,58,0.35)',
}
const microNote = {
  fontSize: '12px',
  color: '#8E8CAE',
  margin: '18px 0 0',
  letterSpacing: '0.4px',
}

const card = {
  background: '#FFFFFF',
  borderRadius: '16px',
  padding: '28px 28px 12px',
  margin: '20px 0 0',
  border: '1px solid #ECE6D6',
}
const cardTitle = {
  fontFamily: 'Georgia, serif',
  fontSize: '20px',
  color: '#16162E',
  margin: '0 0 18px',
  fontWeight: '700' as const,
}
const bullet = {
  fontSize: '15px',
  color: '#3F4058',
  lineHeight: '1.6',
  margin: '0 0 12px',
}
const dot = { color: '#B8923A', marginRight: '10px', fontSize: '12px' }

const proofCard = {
  background: '#16162E',
  borderRadius: '16px',
  padding: '26px 28px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
}
const quote = {
  fontFamily: 'Georgia, serif',
  fontSize: '17px',
  fontStyle: 'italic' as const,
  color: '#F5F1E8',
  lineHeight: '1.5',
  margin: '0 0 12px',
}
const attribution = {
  fontSize: '12px',
  color: '#E6C76A',
  margin: 0,
  letterSpacing: '1px',
}

const hr = { borderColor: '#E1DAC6', margin: '32px 0 20px' }
const footerTitle = {
  fontFamily: 'Georgia, serif',
  fontSize: '14px',
  color: '#16162E',
  fontWeight: '700' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}
const footer = {
  fontSize: '12px',
  color: '#6F7088',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 8px',
}
const footerMuted = {
  fontSize: '11px',
  color: '#9A9BAA',
  textAlign: 'center' as const,
  margin: 0,
}
