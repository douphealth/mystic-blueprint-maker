/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
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
    <Preview>Your private numerology blueprint is ready — one tap reveals it.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>✦ Private Blueprint Access</Text>
        <Heading style={h1}>Your numbers are ready to reveal.</Heading>
        <Text style={text}>Your personalized numerology blueprint has been sealed for you inside {siteName}.</Text>
        <Text style={text}>Tap below to unlock your reading, save it to your account, and return anytime your next decision needs clarity.</Text>
        <Button style={button} href={confirmationUrl}>
          Reveal My Blueprint
        </Button>
        <Text style={note}>This secure link expires soon to protect your private reading.</Text>
        <Text style={footer}>If you didn't request this link, you can safely ignore this email.</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
