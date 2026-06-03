import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BlueprintReadyProps {
  firstName?: string
  lifePathNumber?: number | string
  readingUrl?: string
  purchaseUrl?: string
}

const ROOT_URL = 'https://mysticaldigits.com'

const ARCHETYPES: Record<string, { name: string; gift: string; anchor: string; shadow: string }> = {
  '1': { name: 'The Initiator', gift: 'courage, originality, decisive action', anchor: 'Choose the move only you can make.', shadow: 'impatience or isolation when support would help' },
  '2': { name: 'The Diplomat', gift: 'intuition, emotional intelligence, partnership', anchor: 'Let sensitivity become precision, not self-doubt.', shadow: 'over-adapting to keep the peace' },
  '3': { name: 'The Voice', gift: 'expression, joy, artistry, magnetic communication', anchor: 'Say the honest thing simply and beautifully.', shadow: 'scattering energy before the work lands' },
  '4': { name: 'The Architect', gift: 'structure, endurance, mastery, trust', anchor: 'Build the small system that carries the big dream.', shadow: 'rigidity when life asks for flexibility' },
  '5': { name: 'The Catalyst', gift: 'freedom, movement, curiosity, reinvention', anchor: 'Use change as fuel, not escape.', shadow: 'restlessness that avoids commitment' },
  '6': { name: 'The Harmonizer', gift: 'care, beauty, responsibility, devotion', anchor: 'Give from overflow, not obligation.', shadow: 'over-giving until resentment appears' },
  '7': { name: 'The Seeker', gift: 'wisdom, analysis, intuition, sacred solitude', anchor: 'Protect quiet time; your clarity is born there.', shadow: 'withdrawing when truth needs to be spoken' },
  '8': { name: 'The Executive', gift: 'power, strategy, abundance, leadership', anchor: 'Let ambition serve something worthy.', shadow: 'measuring worth through outcomes alone' },
  '9': { name: 'The Humanitarian', gift: 'compassion, completion, vision, service', anchor: 'Release what is complete so the next chapter can arrive.', shadow: 'carrying what was never yours to hold' },
  '11': { name: 'The Illuminator', gift: 'intuition, inspiration, spiritual signal', anchor: 'Write down the first clear knowing before the mind edits it.', shadow: 'nervous overthinking that dilutes the message' },
  '22': { name: 'The Master Builder', gift: 'vision, systems, legacy, practical magic', anchor: 'Translate the vision into one measurable next step.', shadow: 'pressure from trying to build everything at once' },
  '33': { name: 'The Master Healer', gift: 'compassion, teaching, restoration, heart-led service', anchor: 'Serve with boundaries so the gift stays clean.', shadow: 'saving others instead of empowering them' },
}

export const BlueprintReadyEmail = ({
  firstName = 'Seeker',
  lifePathNumber,
  readingUrl = ROOT_URL,
  purchaseUrl = `${ROOT_URL}/?upgrade=1`,
}: BlueprintReadyProps) => {
  const lifePath = lifePathNumber ? String(lifePathNumber) : undefined
  const archetype = lifePath ? ARCHETYPES[lifePath] : undefined
  const subjectLine = archetype
    ? `${firstName}, your Life Path ${lifePath} blueprint is ready`
    : `${firstName}, your numerology blueprint is ready`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{subjectLine} — open your private reading and start with the 3-minute clarity ritual inside.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={shell}>
            <Section style={hero}>
              <Text style={eyebrow}>YOUR NUMEROLOGY BLUEPRINT</Text>
              <Heading style={h1}>{firstName}, your private reading is ready.</Heading>
              <Text style={heroText}>
                {archetype
                  ? `Your Life Path ${lifePath} carries the ${archetype.name} pattern: ${archetype.gift}. Start with the quick map below, then open the full reading when you’re ready.`
                  : `Your personal numerology map is ready. Start with the quick clarity ritual below, then open the full reading when you’re ready.`}
              </Text>
              <Button href={readingUrl} style={primaryButton}>Open My Blueprint</Button>
              <Text style={microcopy}>Private access · built from your name and birth date · no password required</Text>
            </Section>

            {archetype && (
              <Section style={spotlightCard}>
                <Row>
                  <Column style={numberColumn}>
                    <Text style={numberLabel}>LIFE PATH</Text>
                    <Text style={numberText}>{lifePath}</Text>
                  </Column>
                  <Column>
                    <Text style={cardKicker}>{archetype.name}</Text>
                    <Heading as="h2" style={h2Dark}>Your best next move</Heading>
                    <Text style={bodyTextDark}>{archetype.anchor}</Text>
                    <Text style={smallDark}>Watch for: {archetype.shadow}.</Text>
                  </Column>
                </Row>
              </Section>
            )}

            <Section style={creamCard}>
              <Text style={sectionKicker}>READ THIS FIRST</Text>
              <Heading as="h2" style={h2}>A smarter way to use your reading</Heading>
              <Text style={bodyText}>Numerology works best as a mirror, not a prediction machine. Read it slowly and look for the patterns that explain what you already feel.</Text>
              <Text style={checkLine}>01 · Notice the sentence that makes you pause — that is usually the active pattern.</Text>
              <Text style={checkLine}>02 · Convert one insight into a concrete action within 24 hours.</Text>
              <Text style={checkLine}>03 · Revisit your Personal Year each month so timing becomes easier to read.</Text>
            </Section>

            <Section style={ritualCard}>
              <Text style={sectionKickerLight}>3-MINUTE CLARITY RITUAL</Text>
              <Heading as="h2" style={h2Light}>Before you open the full blueprint</Heading>
              <Text style={ritualStep}>1. Take three slow breaths and name what you most want clarity on.</Text>
              <Text style={ritualStep}>2. Open your reading and scan only the headings first.</Text>
              <Text style={ritualStep}>3. Choose one paragraph that feels specific — turn it into today’s decision.</Text>
            </Section>

            <Section style={gridCard}>
              <Heading as="h2" style={h2}>What’s waiting inside</Heading>
              <Row style={featureRow}>
                <Column style={featureColumn}><Text style={featureTitle}>Core Numbers</Text><Text style={featureCopy}>Life Path, Destiny, Soul Urge, Personality, Birthday, and Personal Year.</Text></Column>
                <Column style={featureColumn}><Text style={featureTitle}>Hidden Patterns</Text><Text style={featureCopy}>Master Number flags, Karmic Debt, and the repeated energies in your name.</Text></Column>
              </Row>
              <Row>
                <Column style={featureColumn}><Text style={featureTitle}>Action Guidance</Text><Text style={featureCopy}>Plain-language prompts, rituals, and next steps you can actually use.</Text></Column>
                <Column style={featureColumn}><Text style={featureTitle}>Premium PDF</Text><Text style={featureCopy}>A polished workbook-style blueprint you can save, print, and revisit.</Text></Column>
              </Row>
            </Section>

            <Section style={upgradeCard}>
              <Text style={upgradeKicker}>OPTIONAL COMPLETE READING</Text>
              <Heading as="h2" style={h2Light}>Go deeper only if the free blueprint resonates.</Heading>
              <Text style={upgradeText}>
                The complete version expands your life phases, annual forecast, shadow patterns, compatibility profile, lucky codes, and printable workbook. One-time $7.99 — no subscription.
              </Text>
              <Button href={purchaseUrl} style={goldButton}>Unlock the Complete Blueprint</Button>
            </Section>

            <Hr style={divider} />
            <Section style={footer}>
              <Text style={footerBrand}>Mystical Digits</Text>
              <Text style={footerText}>You received this because you requested your personal numerology blueprint.</Text>
            </Section>
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

const body: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  margin: 0,
  padding: 0,
  color: '#171427',
}

const container: React.CSSProperties = {
  maxWidth: '640px',
  margin: '0 auto',
  padding: '20px 12px 44px',
}

const shell: React.CSSProperties = {
  border: '1px solid #ECE4D0',
  borderRadius: '24px',
  overflow: 'hidden',
  backgroundColor: '#FBF8F0',
}

const hero: React.CSSProperties = {
  background: 'linear-gradient(150deg, #080914 0%, #15133A 48%, #2A1B45 100%)',
  color: '#ffffff',
  textAlign: 'center',
  padding: '48px 34px 42px',
}

const eyebrow: React.CSSProperties = {
  color: '#E7CA72',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.22em',
  margin: '0 0 18px',
}

const h1: React.CSSProperties = {
  color: '#FFF9E8',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '38px',
  lineHeight: '1.08',
  fontWeight: 400,
  margin: '0 auto 18px',
  maxWidth: '500px',
}

const heroText: React.CSSProperties = {
  color: '#DDD7F0',
  fontSize: '16px',
  lineHeight: '1.65',
  margin: '0 auto 30px',
  maxWidth: '500px',
}

const primaryButton: React.CSSProperties = {
  backgroundColor: '#E7CA72',
  color: '#121225',
  borderRadius: '999px',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  padding: '16px 30px',
  textDecoration: 'none',
  textTransform: 'uppercase',
}

const microcopy: React.CSSProperties = {
  color: '#AAA3C5',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '18px 0 0',
}

const spotlightCard: React.CSSProperties = {
  backgroundColor: '#14132B',
  padding: '28px',
  color: '#ffffff',
}

const numberColumn: React.CSSProperties = {
  width: '128px',
  paddingRight: '20px',
}

const numberLabel: React.CSSProperties = {
  color: '#AFA7C8',
  fontSize: '10px',
  letterSpacing: '0.18em',
  margin: '0 0 4px',
}

const numberText: React.CSSProperties = {
  color: '#E7CA72',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '58px',
  lineHeight: '1',
  margin: 0,
}

const cardKicker: React.CSSProperties = {
  color: '#E7CA72',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  margin: '0 0 8px',
  textTransform: 'uppercase',
}

const creamCard: React.CSSProperties = {
  backgroundColor: '#FBF8F0',
  padding: '30px 30px 22px',
}

const ritualCard: React.CSSProperties = {
  background: 'linear-gradient(145deg, #241A43 0%, #121225 100%)',
  color: '#ffffff',
  padding: '32px 30px',
}

const gridCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '30px',
}

const upgradeCard: React.CSSProperties = {
  background: 'linear-gradient(145deg, #101021 0%, #21193E 100%)',
  color: '#ffffff',
  textAlign: 'center',
  padding: '34px 30px 38px',
}

const sectionKicker: React.CSSProperties = {
  color: '#B8923A',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.16em',
  margin: '0 0 10px',
}

const sectionKickerLight: React.CSSProperties = {
  ...sectionKicker,
  color: '#E7CA72',
}

const h2: React.CSSProperties = {
  color: '#171427',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '25px',
  lineHeight: '1.2',
  fontWeight: 400,
  margin: '0 0 14px',
}

const h2Dark: React.CSSProperties = {
  ...h2,
  color: '#FFF9E8',
  marginBottom: '10px',
}

const h2Light: React.CSSProperties = {
  ...h2,
  color: '#FFF9E8',
  textAlign: 'inherit',
}

const bodyText: React.CSSProperties = {
  color: '#403B55',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 16px',
}

const bodyTextDark: React.CSSProperties = {
  color: '#E6E1F4',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 10px',
}

const smallDark: React.CSSProperties = {
  color: '#AFA7C8',
  fontSize: '13px',
  lineHeight: '1.55',
  margin: 0,
}

const checkLine: React.CSSProperties = {
  color: '#26223A',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 9px',
}

const ritualStep: React.CSSProperties = {
  color: '#E6E1F4',
  fontSize: '15px',
  lineHeight: '1.65',
  margin: '0 0 9px',
}

const featureRow: React.CSSProperties = {
  marginBottom: '14px',
}

const featureColumn: React.CSSProperties = {
  width: '50%',
  paddingRight: '14px',
}

const featureTitle: React.CSSProperties = {
  color: '#171427',
  fontSize: '14px',
  fontWeight: 800,
  margin: '0 0 5px',
}

const featureCopy: React.CSSProperties = {
  color: '#5F5871',
  fontSize: '13px',
  lineHeight: '1.55',
  margin: 0,
}

const upgradeKicker: React.CSSProperties = {
  color: '#E7CA72',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.18em',
  margin: '0 0 12px',
}

const upgradeText: React.CSSProperties = {
  color: '#D9D2EA',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: '0 auto 24px',
  maxWidth: '480px',
}

const goldButton: React.CSSProperties = {
  background: 'linear-gradient(135deg, #F0D98A 0%, #C79C3D 100%)',
  color: '#121225',
  borderRadius: '999px',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 800,
  letterSpacing: '0.06em',
  padding: '15px 28px',
  textDecoration: 'none',
  textTransform: 'uppercase',
}

const divider: React.CSSProperties = {
  borderColor: '#ECE4D0',
  margin: '0',
}

const footer: React.CSSProperties = {
  backgroundColor: '#FBF8F0',
  padding: '20px 28px 24px',
  textAlign: 'center',
}

const footerBrand: React.CSSProperties = {
  color: '#171427',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '15px',
  margin: '0 0 6px',
}

const footerText: React.CSSProperties = {
  color: '#817A92',
  fontSize: '11px',
  lineHeight: '1.6',
  margin: 0,
}

export default BlueprintReadyEmail