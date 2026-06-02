/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>✦ Your Numerology Blueprint ✦</Text>
        <Heading style={h1}>Confirm it's you</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={otp}>{token}</Text>
        <div style={divider} />
        <Text style={footer}>
          This code expires shortly. If you didn't request this, ignore this email.<br />
          © {new Date().getFullYear()} Mystical Digits · mysticaldigits.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "Georgia, 'Times New Roman', serif", margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 32px', backgroundColor: '#ffffff' }
const brand = { fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase' as const, color: '#B8923A', fontWeight: 'bold' as const, margin: '0 0 32px', textAlign: 'center' as const, fontFamily: "Georgia, serif" }
const h1 = { fontSize: '28px', fontWeight: 'normal' as const, color: '#1a1a2e', margin: '0 0 20px', textAlign: 'center' as const, lineHeight: '1.3' }
const text = { fontSize: '16px', color: '#444', lineHeight: '1.7', margin: '0 0 24px', textAlign: 'center' as const }
const buttonWrap = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: '#B8923A', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' as const, letterSpacing: '0.15em', textTransform: 'uppercase' as const, borderRadius: '4px', padding: '16px 36px', textDecoration: 'none', display: 'inline-block' }
const divider = { borderTop: '1px solid #e8e3d6', margin: '40px 0 24px' }
const footer = { fontSize: '12px', color: '#999', textAlign: 'center' as const, lineHeight: '1.6', margin: '0' }
const otp = { fontSize: '36px', fontWeight: 'bold' as const, color: '#B8923A', textAlign: 'center' as const, letterSpacing: '0.4em', margin: '24px 0', fontFamily: "Georgia, serif" }
