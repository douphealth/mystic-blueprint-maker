/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your private numerology blueprint is waiting.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>✦ Mystical Digits</Text>
        <Heading style={h1}>Your blueprint is waiting</Heading>
        <Text style={text}>
          Confirm{' '}
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>{' '}
          to unlock your private reading in{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          .
        </Text>
        <Text style={text}>
          We’ve mapped the first layer of your core numbers. Open the reading now, then unlock the complete premium blueprint when you’re ready to go deeper.
        </Text>
        <div style={buttonWrap}>
          <Button style={button} href={confirmationUrl}>
            Reveal My Blueprint
          </Button>
        </div>
        <Text style={microcopy}>This secure link expires shortly to protect your private reading.</Text>
        <div style={divider} />
        <Text style={footer}>
          If you didn’t request this, you can safely ignore this email.<br />
          © {new Date().getFullYear()} Mystical Digits · mysticaldigits.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", margin: 0, padding: 0 }
const container = { maxWidth: '580px', margin: '0 auto', padding: '44px 30px 34px', backgroundColor: '#ffffff' }
const eyebrow = { color: '#B8923A', fontSize: '12px', fontWeight: '700' as const, letterSpacing: '0.28em', textTransform: 'uppercase' as const, textAlign: 'center' as const, margin: '0 0 22px' }
const h1 = {
  fontSize: '31px',
  fontWeight: '700' as const,
  color: '#17172f',
  margin: '0 0 18px',
  textAlign: 'center' as const,
  lineHeight: '1.18',
}
const text = {
  fontSize: '16px',
  color: '#4d4a5f',
  lineHeight: '1.72',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}
const link = { color: '#B8923A', textDecoration: 'none', fontWeight: '700' as const }
const buttonWrap = { textAlign: 'center' as const, margin: '30px 0 16px' }
const button = {
  backgroundColor: '#B8923A',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '800' as const,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  borderRadius: '6px',
  padding: '16px 30px',
  textDecoration: 'none',
  display: 'inline-block',
}
const microcopy = { fontSize: '12px', color: '#8d899b', textAlign: 'center' as const, lineHeight: '1.6', margin: '0' }
const divider = { borderTop: '1px solid #ece7da', margin: '34px 0 22px' }
const footer = { fontSize: '12px', color: '#9b97a6', margin: '0', textAlign: 'center' as const, lineHeight: '1.65' }
