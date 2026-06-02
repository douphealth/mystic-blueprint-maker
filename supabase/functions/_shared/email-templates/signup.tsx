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
    <Preview>Your personalized numerology blueprint is waiting.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>✦ Your Blueprint Is Ready</Text>
        <Heading style={h1}>Confirm your email to reveal the full reading.</Heading>
        <Text style={text}>We finished mapping the core numbers tied to your name and birth date.</Text>
        <Text style={text}>Confirm <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link> to unlock your reading, save it, and get instant access to your downloadable blueprint.</Text>
        <Button style={button} href={confirmationUrl}>
          Reveal My Blueprint
        </Button>
        <Text style={note}>Sent from <Link href={siteUrl} style={link}>{siteName}</Link>. Your private link expires soon.</Text>
        <Text style={footer}>If you didn't request this, you can safely ignore this email.</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 28px' }
const eyebrow = {
  color: '#B8923A',
  fontSize: '12px',
  fontWeight: '700' as const,
  letterSpacing: '2px',
  margin: '0 0 14px',
  textTransform: 'uppercase' as const,
}
const h1 = {
  fontFamily: 'Georgia, serif',
  fontSize: '34px',
  lineHeight: '1.12',
  fontWeight: '700' as const,
  color: '#16162E',
  margin: '0 0 18px',
}
const text = {
  fontSize: '16px',
  color: '#3F4058',
  lineHeight: '1.65',
  margin: '0 0 18px',
}
const link = { color: '#B8923A', textDecoration: 'underline' }
const button = {
  backgroundColor: '#B8923A',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700' as const,
  letterSpacing: '1.4px',
  borderRadius: '6px',
  padding: '15px 22px',
  textDecoration: 'none',
  textTransform: 'uppercase' as const,
}
const note = { fontSize: '13px', color: '#6F7088', margin: '20px 0 0' }
const footer = { fontSize: '12px', color: '#9A9BAA', margin: '30px 0 0' }
