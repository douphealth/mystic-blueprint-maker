// ---------------------------------------------------------------------------
// Premium edition content tables.
//
// The free workbook answers "what are my numbers". The premium edition has to
// answer the harder question: "what do I actually do on Monday". Everything in
// this file is written to be specific and actionable rather than flattering —
// a shadow table that only describes strengths is a horoscope, not a tool.
//
// Keyed by number, covering 1-9 plus the master numbers 11, 22 and 33.
// ---------------------------------------------------------------------------

export interface ShadowProfile {
  loop: string;
  trigger: string;
  coping: string;
  cost: string;
  mature: string;
  practice: string;
}

export const shadowProfiles: Record<number, ShadowProfile> = {
  1: {
    loop: "The Control Loop",
    trigger: "Being told what to do, or waiting on somebody else's decision.",
    coping: "Take it over. Do it yourself, faster, without asking.",
    cost: "You end up carrying work that was never yours, and people stop offering to help.",
    mature: "Delegate the outcome and keep the standard. Say what you need once, clearly, then let it run.",
    practice: "Hand one task to another person this week and do not correct it for seven days.",
  },
  2: {
    loop: "The Disappearing Loop",
    trigger: "Tension in the room, or the sense that someone disapproves of you.",
    coping: "Soften the truth. Agree, delay, hint, and hope the situation resolves itself.",
    cost: "Resentment accumulates quietly, then arrives all at once as withdrawal or an explosion.",
    mature: "Say the difficult thing early and kindly, while it is still small enough to be easy.",
    practice: "Name one unspoken expectation out loud, to the exact person it concerns.",
  },
  3: {
    loop: "The Scatter Loop",
    trigger: "Boredom, or a project that has stopped feeling exciting.",
    coping: "Start something new. The next idea is always more alive than the current one.",
    cost: "You accumulate twelve beginnings and no finished work, so nobody can see what you are capable of.",
    mature: "Finish the unglamorous last ten percent before you allow yourself the next idea.",
    practice: "Close one open loop completely before you start anything else.",
  },
  4: {
    loop: "The Rigidity Loop",
    trigger: "A plan changing without warning.",
    coping: "Tighten the system. More rules, more checklists, more preparation.",
    cost: "The structure that was meant to create freedom becomes the thing you serve.",
    mature: "Hold the outcome firm and the method loose.",
    practice: "Deliberately change one fixed routine, and notice that nothing breaks.",
  },
  5: {
    loop: "The Escape Loop",
    trigger: "Commitment, or the feeling that life has become predictable.",
    coping: "Change the external thing — the city, the job, the relationship, the plan.",
    cost: "You keep arriving in new places carrying the same restlessness with you.",
    mature: "Change one variable at a time and stay long enough to see the result.",
    practice: "Stay with one commitment for ninety days past the point you would normally leave.",
  },
  6: {
    loop: "The Rescue Loop",
    trigger: "Somebody in difficulty, or a situation that appears to need you specifically.",
    coping: "Step in, fix it, and take responsibility for their outcome.",
    cost: "You become the load-bearing wall, and nobody learns to hold their own weight.",
    mature: "Offer support that does not require you to absorb the consequence.",
    practice: "Ask 'do you want help, or do you want to be heard?' before you respond.",
  },
  7: {
    loop: "The Withdrawal Loop",
    trigger: "Overwhelm, or the feeling of being fundamentally misunderstood.",
    coping: "Go quiet. Analyse alone. Wait until you have the perfect answer.",
    cost: "People read your absence as rejection, and the distance hardens on both sides.",
    mature: "Take the solitude you need, then return with one sentence that reopens the door.",
    practice: "Tell one person you are going quiet, and when you will be back.",
  },
  8: {
    loop: "The Armour Loop",
    trigger: "Feeling underestimated, or a situation where control is slipping away.",
    coping: "Increase the pressure. Work harder, negotiate harder, project certainty.",
    cost: "People comply instead of contributing, and you mistake that for respect.",
    mature: "Lead with the standard rather than the force. Let the work argue for you.",
    practice: "In one meeting this week, ask a question instead of making a statement.",
  },
  9: {
    loop: "The Martyr Loop",
    trigger: "A cause, a person, or a situation that clearly needs more than you have to give.",
    coping: "Give past your limit, then quietly resent the cost.",
    cost: "You empty the reservoir, and the generosity turns into exhaustion and bitterness.",
    mature: "Serve from overflow. Completion is a discipline, not an abandonment.",
    practice: "Close one commitment this month, fully and without apology.",
  },
  11: {
    loop: "The Static Loop",
    trigger: "A strong intuition that nobody else can see yet.",
    coping: "Wait for confirmation. Collect more signs. Stay inside the insight.",
    cost: "The vision never reaches the physical world, and the sensitivity turns into anxiety.",
    mature: "Translate the signal into one small, testable action within forty-eight hours.",
    practice: "Convert one intuition this week into something another person can actually see.",
  },
  22: {
    loop: "The Load Loop",
    trigger: "A vision large enough that only you appear to see it.",
    coping: "Carry it alone. Do every part yourself because nobody will do it properly.",
    cost: "The scale of the dream becomes the reason it never ships.",
    mature: "Give the vision architecture — scope, sequence, people, proof — and hand pieces over.",
    practice: "Break your largest goal into three deliverables and delegate one of them.",
  },
  33: {
    loop: "The Overgive Loop",
    trigger: "Somebody who needs the exact thing you are good at giving.",
    coping: "Become the healer, the teacher, the one who holds it all together.",
    cost: "You teach dependence while calling it service, and your own needs go unnamed.",
    mature: "Model the boundary. Teach what you embody, not what you sacrifice.",
    practice: "Decline one request this week and offer a resource instead of yourself.",
  },
};

export interface RelationshipSignature {
  needs: string;
  gives: string;
  fears: string;
  attracts: string;
  friction: string;
}

export const relationshipSignatures: Record<number, RelationshipSignature> = {
  1: {
    needs: "Autonomy, and a partner who has a direction of their own.",
    gives: "Decisive energy, protection, momentum, and someone who will go first.",
    fears: "Being managed, slowed down, or absorbed into somebody else's plan.",
    attracts: "Strong, self-possessed people who are not easily impressed.",
    friction: "Competing instead of collaborating when both people are ambitious.",
  },
  2: {
    needs: "Emotional safety and consistent, unhurried attention.",
    gives: "Deep attunement, loyalty, and practical care that notices the small things.",
    fears: "Conflict, and being experienced as too much or too needy.",
    attracts: "Steady, expressive partners who say what they mean.",
    friction: "Choosing silence over saying the hard thing while it is still small.",
  },
  3: {
    needs: "Play, admiration, and room to be fully expressive.",
    gives: "Warmth, humour, and the social ease that makes a house feel alive.",
    fears: "Being boring, and being dismissed as not serious enough.",
    attracts: "People who make them laugh and also take them seriously.",
    friction: "Deflecting a serious conversation by turning it into a joke.",
  },
  4: {
    needs: "Reliability, clear expectations, and a shared plan.",
    gives: "Stability, follow-through, and tangible security you can point at.",
    fears: "Chaos, unpredictability, and being surprised by someone's exit.",
    attracts: "Grounded, committed partners who do what they said they would.",
    friction: "Confusing control with care, then feeling unappreciated for it.",
  },
  5: {
    needs: "Freedom, novelty, and room to move without negotiating it.",
    gives: "Adventure, energy, and an adaptability that keeps things from going stale.",
    fears: "Being trapped, defined, or reduced to a routine.",
    attracts: "Curious, independent people who have their own life.",
    friction: "Leaving just before the deeper work begins.",
  },
  6: {
    needs: "Devotion, beauty, and to feel genuinely needed.",
    gives: "Care, home-making, and emotional labour that holds everything together.",
    fears: "Being unappreciated, or discovering they have taken on too much.",
    attracts: "People who need holding — which is precisely the problem.",
    friction: "Rescuing instead of partnering, then feeling resentful about the imbalance.",
  },
  7: {
    needs: "Solitude, intellectual intimacy, and conversations with real depth.",
    gives: "Insight, calm, and the rare experience of being truly listened to.",
    fears: "Superficiality, and emotional demand that arrives without warning.",
    attracts: "Thoughtful, independent people who do not need constant reassurance.",
    friction: "Disappearing into analysis instead of staying present in the room.",
  },
  8: {
    needs: "Respect, competence, and shared ambition.",
    gives: "Protection, direction, and material security that is actually real.",
    fears: "Losing control, or being seen as weak or unsuccessful.",
    attracts: "Capable, driven partners who can hold their own.",
    friction: "Treating the relationship like a negotiation to be won.",
  },
  9: {
    needs: "Meaning, generosity, and emotional breadth.",
    gives: "Compassion, perspective, and an acceptance that lets people be unfinished.",
    fears: "Being needed forever, and never reaching the end of the list.",
    attracts: "People with depth, history, and a story to tell.",
    friction: "Over-giving until empty, then withdrawing to recover in private.",
  },
  11: {
    needs: "A partner who can hold intensity without flinching or fixing it.",
    gives: "Vision, inspiration, and an unusual ability to perceive what is unspoken.",
    fears: "Being dismissed as too much, too strange, or too sensitive.",
    attracts: "Receptive, spiritually curious people who are not afraid of depth.",
    friction: "Mistaking anxiety for intuition and acting on the wrong signal.",
  },
  22: {
    needs: "A co-builder who can hold a large vision without shrinking it.",
    gives: "Structure, legacy thinking, and genuine capability under pressure.",
    fears: "Being the only one who can see it, and therefore the only one who can carry it.",
    attracts: "Pragmatic, ambitious partners who like building things.",
    friction: "Turning the relationship into a project with deliverables.",
  },
  33: {
    needs: "Mutual care, and explicit permission to receive rather than only give.",
    gives: "Healing presence and a warmth that makes people feel safe quickly.",
    fears: "Being drained, and being taken for granted by the people they hold.",
    attracts: "People who need healing — which is the loop, not the solution.",
    friction: "Giving until there is nothing left, then having nothing left to give.",
  },
};

export interface CareerVectors {
  environments: string;
  roles: string;
  industries: string;
  avoid: string;
  models: string[];
}

export const careerVectors: Record<number, CareerVectors> = {
  1: {
    environments: "Founder-led, autonomous, fast-moving, minimal approval chains.",
    roles: "Founder, director, lead specialist, solo practitioner.",
    industries: "Any field where an individual's judgment carries the work.",
    avoid: "Consensus-heavy committees and long sign-off processes.",
    models: ["Solo consultancy", "A product with your name on it", "Founder-led studio"],
  },
  2: {
    environments: "Collaborative, calm, high-trust, low-conflict.",
    roles: "Mediator, advisor, partner, coordinator, therapist, editor.",
    industries: "Counselling, HR, diplomacy, design partnership, client care.",
    avoid: "Combat cultures and roles that demand public confrontation.",
    models: ["Two-person partnership", "Advisory retainer", "Boutique service"],
  },
  3: {
    environments: "Expressive, social, visible, fast-feedback.",
    roles: "Creative director, communicator, performer, marketer, host.",
    industries: "Media, entertainment, branding, teaching, sales.",
    avoid: "Silent, repetitive back-office work with no audience.",
    models: ["Content-led personal brand", "Studio with a public face", "Speaking and workshops"],
  },
  4: {
    environments: "Structured, process-driven, long-horizon.",
    roles: "Operator, engineer, project lead, controller, architect.",
    industries: "Engineering, finance, construction, logistics, law.",
    avoid: "Chaotic startups that change direction weekly.",
    models: ["Systems-based service", "An agency with real process", "A product built to last"],
  },
  5: {
    environments: "Varied, mobile, low-bureaucracy, project-based.",
    roles: "Growth lead, sales, journalist, consultant, trader.",
    industries: "Media, travel, technology, sales, events.",
    avoid: "Rigid hierarchies and identical days.",
    models: ["Project-based consulting", "Multi-revenue portfolio", "Location-independent service"],
  },
  6: {
    environments: "Warm, aesthetic, service-hearted, relationship-led.",
    roles: "Care lead, designer, hospitality owner, therapist, teacher.",
    industries: "Health, beauty, hospitality, education, interiors.",
    avoid: "Cold, transactional, high-churn environments.",
    models: ["A practice with loyal clients", "Hospitality or wellness brand", "Teaching and care-based service"],
  },
  7: {
    environments: "Quiet, deep-work, low-interruption, research-led.",
    roles: "Researcher, analyst, specialist, writer, scientist.",
    industries: "Research, data, academia, strategy, writing.",
    avoid: "High-volume social roles with constant interruption.",
    models: ["Expert consultancy", "Research or IP licensing", "Writing and deep specialism"],
  },
  8: {
    environments: "Commercial, results-driven, high-stakes.",
    roles: "Executive, deal-maker, operator, owner, investor.",
    industries: "Finance, real estate, enterprise, law, business ownership.",
    avoid: "Roles where effort and outcome are visibly disconnected.",
    models: ["Owner-operator business", "Equity and ownership stakes", "Enterprise consulting"],
  },
  9: {
    environments: "Purpose-driven, humanitarian, wide-reach.",
    roles: "Director, campaigner, healer, artist, educator.",
    industries: "Non-profit, arts, health, international work, education.",
    avoid: "Purely extractive, profit-only environments.",
    models: ["Mission-led organisation", "Arts or healing practice", "Teaching with a cause"],
  },
  11: {
    environments: "Visionary, receptive, low-cynicism, patient with ideas.",
    roles: "Creative visionary, teacher, counsellor, speaker, healer.",
    industries: "Arts, spirituality, psychology, innovation, education.",
    avoid: "Purely mechanistic, numbers-only environments.",
    models: ["Vision-led brand", "Teaching and mentoring", "A creative practice with a spiritual spine"],
  },
  22: {
    environments: "Large-scale, ambitious, well-resourced.",
    roles: "Chief builder, systems architect, programme director.",
    industries: "Infrastructure, enterprise, institutions, large platforms.",
    avoid: "Roles too small to hold the size of the vision.",
    models: ["Institution or platform building", "Large-scale delivery", "Legacy enterprise"],
  },
  33: {
    environments: "Healing, community-centred, high-trust.",
    roles: "Healer, teacher of teachers, community lead, mentor.",
    industries: "Wellbeing, education, community, care leadership.",
    avoid: "Extractive or aggressively competitive environments.",
    models: ["Teaching practice", "Community or retreat model", "Mentorship at scale"],
  },
};

export interface MoneyArchetype {
  archetype: string;
  earns: string;
  leaks: string;
  rule: string;
}

export const moneyArchetypes: Record<number, MoneyArchetype> = {
  1: { archetype: "The Originator", earns: "By being first, and by selling your own judgment.", leaks: "Reinvesting in ideas nobody asked for; refusing to charge for your decisions.", rule: "Price the decision, not the hours." },
  2: { archetype: "The Steward", earns: "Through relationships, referrals, and trusted long-term clients.", leaks: "Undercharging to keep the peace; giving away scope to avoid friction.", rule: "Raise the price before you raise the effort." },
  3: { archetype: "The Communicator", earns: "Through visibility — attention converts into income for you.", leaks: "Spending on image; abandoning offers before they compound.", rule: "One offer, repeated for twelve months, beats twelve offers." },
  4: { archetype: "The Builder", earns: "Through systems and assets that keep working after you stop.", leaks: "Over-preparing; buying tools instead of selling outcomes.", rule: "Ship at eighty percent, then improve in public." },
  5: { archetype: "The Trader", earns: "Through movement — new markets, new offers, new audiences.", leaks: "Novelty spending; start-up costs that never get recovered.", rule: "Fund every new experiment from the last one's profit." },
  6: { archetype: "The Caretaker", earns: "Through service, loyalty, and a premium client experience.", leaks: "Discounts for people you love; rescuing clients from their own decisions.", rule: "Generosity comes from surplus, never from the invoice." },
  7: { archetype: "The Specialist", earns: "Through depth — you can charge for what others cannot do.", leaks: "Under-marketing; assuming that quality is self-evident.", rule: "Spend as much time explaining the value as producing it." },
  8: { archetype: "The Owner", earns: "Through ownership, leverage, and negotiating well.", leaks: "Status purchases; taking on risk you have not priced.", rule: "Never trade equity for comfort." },
  9: { archetype: "The Benefactor", earns: "Through reach — the wider the contribution, the more it returns.", leaks: "Funding everyone else's project; an inability to close.", rule: "Complete the paid work before you start the gifted work." },
  11: { archetype: "The Channel", earns: "Through inspiration that has been made concrete.", leaks: "Waiting for the right moment; undervaluing the intangible.", rule: "Charge for the transformation, not the time." },
  22: { archetype: "The Architect", earns: "Through scale and structure — big things, properly built.", leaks: "Carrying costs alone; under-capitalising the vision.", rule: "Raise money and help before you need it." },
  33: { archetype: "The Teacher", earns: "Through teaching what you have already lived.", leaks: "Free labour disguised as service; burnout that stops income.", rule: "One paid container, one gifted container. Keep them separate." },
};

// ---------------------------------------------------------------------------
// Lucky codes. These are symbolic rather than causal — the workbook says so
// explicitly on the page where they appear, because presenting colour and
// crystal correspondences as physics would be dishonest.
// ---------------------------------------------------------------------------

export interface LuckyCode {
  colors: string[];
  crystal: string;
  element: string;
  direction: string;
  days: string[];
  numbers: number[];
}

export const luckyCodes: Record<number, LuckyCode> = {
  1: { colors: ["Gold", "Scarlet", "Black"], crystal: "Garnet", element: "Fire", direction: "East", days: ["Sunday", "Monday"], numbers: [1, 10, 19, 28] },
  2: { colors: ["Pearl", "Silver", "Pale Green"], crystal: "Moonstone", element: "Water", direction: "West", days: ["Monday", "Friday"], numbers: [2, 11, 20, 29] },
  3: { colors: ["Yellow", "Turquoise", "Violet"], crystal: "Citrine", element: "Air", direction: "North-East", days: ["Wednesday", "Thursday"], numbers: [3, 12, 21, 30] },
  4: { colors: ["Navy", "Forest Green", "Stone Grey"], crystal: "Emerald", element: "Earth", direction: "North", days: ["Saturday", "Sunday"], numbers: [4, 13, 22, 31] },
  5: { colors: ["Sky Blue", "Silver", "Amber"], crystal: "Aquamarine", element: "Air", direction: "West", days: ["Wednesday", "Friday"], numbers: [5, 14, 23] },
  6: { colors: ["Rose", "Ivory", "Emerald"], crystal: "Rose Quartz", element: "Earth", direction: "South-West", days: ["Friday", "Tuesday"], numbers: [6, 15, 24] },
  7: { colors: ["Indigo", "Deep Purple", "Sea Green"], crystal: "Amethyst", element: "Water", direction: "North-West", days: ["Monday", "Thursday"], numbers: [7, 16, 25] },
  8: { colors: ["Charcoal", "Bronze", "Deep Blue"], crystal: "Black Tourmaline", element: "Earth", direction: "South", days: ["Saturday", "Thursday"], numbers: [8, 17, 26] },
  9: { colors: ["Crimson", "White", "Gold"], crystal: "Bloodstone", element: "Fire", direction: "South", days: ["Tuesday", "Sunday"], numbers: [9, 18, 27] },
  11: { colors: ["White", "Silver", "Lilac"], crystal: "Selenite", element: "Light", direction: "Above", days: ["Monday", "Sunday"], numbers: [11, 29, 2] },
  22: { colors: ["Deep Green", "Stone", "Bronze"], crystal: "Jade", element: "Earth", direction: "North", days: ["Saturday", "Thursday"], numbers: [22, 4, 13] },
  33: { colors: ["Soft Rose", "Warm Cream", "Gold"], crystal: "Rhodonite", element: "Heart", direction: "Centre", days: ["Friday", "Tuesday"], numbers: [33, 6, 15] },
};

export const affirmations: Record<number, string> = {
  1: "I do not need consensus in order to begin.",
  2: "My sensitivity is a skill, and my boundaries are what protect it.",
  3: "I finish what deserves my voice.",
  4: "I hold the outcome firmly and the method loosely.",
  5: "I stay long enough to find out what I am capable of.",
  6: "I give from surplus, not from sacrifice.",
  7: "I come back and say the sentence that reopens the door.",
  8: "I lead with standards, not with force.",
  9: "I close the loop and keep only the wisdom.",
  11: "I ground the signal into something another person can see.",
  22: "I build in a way that does not depend on my mood.",
  33: "I teach what I embody, not what I sacrifice.",
};

// ---------------------------------------------------------------------------
// Life phase map, in depth. The free workbook summarises pinnacles and
// challenges on a single page; here each phase gets room to be useful.
// ---------------------------------------------------------------------------

export interface PinnacleReading {
  theme: string;
  opportunity: string;
  risk: string;
  instruction: string;
  question: string;
  onTrack: string;
  offCourse: string;
}

export const pinnacleReadings: Record<number, PinnacleReading> = {
  1: { theme: "The First Ascent", opportunity: "Establishing an independent identity — the phase where your name starts to mean something on its own.", risk: "Leading before you have listened, and burning bridges you will need later.", instruction: "Build one thing that is unmistakably yours, and finish it.", question: "What am I building that would still exist if nobody applauded?", onTrack: "You are building something unmistakably yours, and you can name it in one sentence.", offCourse: "You are leading before you have listened, and calling the friction other people's resistance." },
  2: { theme: "The Long Apprenticeship", opportunity: "Learning patience, partnership, and the real value of timing.", risk: "Waiting so long for the right moment that the moment quietly passes.", instruction: "Choose one collaboration and go deeper instead of wider.", question: "Where am I waiting for permission I already have?", onTrack: "You are going deeper with fewer people instead of wider with everyone.", offCourse: "You are still waiting for a signal that has already arrived." },
  3: { theme: "The Public Voice", opportunity: "Recognition, expression, and being seen for what you actually do.", risk: "Confusing visibility with substance.", instruction: "Publish consistently and let the work be judged.", question: "What would I say if I stopped editing myself for the room?", onTrack: "You are publishing consistently and letting the work be judged.", offCourse: "You are getting attention for a version of yourself you do not recognise." },
  4: { theme: "The Foundation Years", opportunity: "Building the structure that everything afterwards rests on.", risk: "Mistaking rigidity for reliability.", instruction: "Systematise the one thing you keep doing manually.", question: "What would make this durable if I stepped away for a month?", onTrack: "The systems you built are still working when you are not watching.", offCourse: "You are defending a process that no longer fits the situation." },
  5: { theme: "The Unsettled Chapter", opportunity: "Freedom, expansion, and rapid adaptation to changing conditions.", risk: "Changing everything at once and calling it growth.", instruction: "Change one variable and measure the result.", question: "Am I moving toward something, or away from something?", onTrack: "You are changing one variable at a time and measuring the result.", offCourse: "You are calling restlessness a calling." },
  6: { theme: "The Responsibility Chapter", opportunity: "Family, home, service, and a deep sense of belonging.", risk: "Becoming indispensable and calling it love.", instruction: "Take responsibility for your own wellbeing as seriously as theirs.", question: "Who am I carrying that could carry themselves?", onTrack: "You are carrying your share and no more, and saying so out loud.", offCourse: "You are indispensable, and quietly resentful about it." },
  7: { theme: "The Inward Season", opportunity: "Mastery, study, and a genuine deepening of expertise.", risk: "Disappearing from the people who matter most.", instruction: "Protect the solitude, and tell people when you are going quiet.", question: "What would I understand if I stopped performing for a season?", onTrack: "Your solitude is producing clarity you can actually use.", offCourse: "Nobody can reach you any more, and you have stopped noticing." },
  8: { theme: "The Harvest", opportunity: "Power, ownership, and material consolidation.", risk: "Measuring everything and valuing only what can be measured.", instruction: "Negotiate for ownership, not just for income.", question: "What am I building that outlasts the current deal?", onTrack: "You are negotiating for ownership, not only for income.", offCourse: "You are winning the argument and losing the room." },
  9: { theme: "The Clearing", opportunity: "Completion, release, and the wisdom that only endings produce.", risk: "Clinging to what is already finished.", instruction: "Close one major loop completely during this phase.", question: "What am I keeping alive out of habit rather than love?", onTrack: "You are closing loops and keeping only the wisdom.", offCourse: "You are keeping something alive out of habit rather than love." },
  11: { theme: "The Illuminated Phase", opportunity: "Vision, teaching, and unusual creative reach.", risk: "Living inside the insight and never landing it in the world.", instruction: "Give the vision a deadline and a witness.", question: "What is the smallest visible version of this vision?", onTrack: "The vision has a deadline, a witness, and a first deliverable.", offCourse: "The insight keeps arriving and nothing lands in the world." },
  22: { theme: "The Great Work", opportunity: "Building at real scale, with real stakes and real resources.", risk: "Carrying the entire structure alone.", instruction: "Assemble the team before you need them.", question: "What would I attempt if I were not the only one holding it?", onTrack: "There is a team, a sequence, and proof that it works.", offCourse: "You are the only person who understands how any of it fits together." },
  33: { theme: "The Teaching Phase", opportunity: "Service, community, and leading through care.", risk: "Serving until there is nothing left of you to serve from.", instruction: "Build one container that refills you as it serves others.", question: "What am I teaching that I have not yet allowed myself?", onTrack: "You are serving from a container that refills you.", offCourse: "You are exhausted, and calling it devotion." },
};

export interface ChallengeReading {
  lesson: string;
  work: string;
  trap: string;
  practice: string;
}

export const challengeReadings: Record<number, ChallengeReading> = {
  0: { lesson: "You meet every challenge at once, which means you get to choose which one to face first.", work: "Set your own priorities instead of inheriting everybody else's.", trap: "Being pulled in every direction and mistaking exhaustion for effort.", practice: "Name the one challenge that, if resolved, would make the others smaller." },
  1: { lesson: "Learning to stand alone without becoming hard.", work: "Practise independence in small, safe increments.", trap: "Either bulldozing other people or refusing to lead at all.", practice: "Make one decision this week without asking anybody's opinion." },
  2: { lesson: "Learning to hold your own sensitivity without collapsing into other people's feelings.", work: "Separate your emotions from the emotions in the room.", trap: "Oversensitivity that reads every mood as a verdict about you.", practice: "Before reacting, ask: whose feeling is this, actually?" },
  3: { lesson: "Learning to express what is real, not only what is pleasant.", work: "Say the true thing in a form people can actually receive.", trap: "Scattering your voice, or hiding it behind humour.", practice: "Write the sentence you have been softening, then deliver it once, plainly." },
  4: { lesson: "Learning to build without becoming rigid.", work: "Create structure that adapts when conditions change.", trap: "Working relentlessly and calling it discipline.", practice: "Take one full day off, planned in advance, and keep it." },
  5: { lesson: "Learning to be free without being reckless.", work: "Give your freedom a direction and a landing pad.", trap: "Using change as an anaesthetic.", practice: "Make one commitment and hold it for ninety days." },
  6: { lesson: "Learning responsibility without self-erasure.", work: "Care for others from surplus rather than from obligation.", trap: "Becoming the family's permanent solution to every problem.", practice: "Say no to one request and stay warm while doing it." },
  7: { lesson: "Learning to trust — yourself and the evidence — without retreating.", work: "Let people in before you have finished analysing them.", trap: "Using depth as a hiding place.", practice: "Share a half-formed thought with one trusted person." },
  8: { lesson: "Learning to handle power, money, and authority without losing your centre.", work: "Hold both the material and the moral accounting at once.", trap: "Measuring your entire worth in outcomes.", practice: "Make one decision that costs you money and protects your integrity." },
};

// ---------------------------------------------------------------------------
// Growth acceleration prompts, grouped by domain. Deliberately uncomfortable:
// a prompt you can answer without thinking is not doing any work.
// ---------------------------------------------------------------------------

export const growthPrompts: { domain: string; prompts: string[] }[] = [
  {
    domain: "Identity",
    prompts: [
      "Which part of my personality is a genuine trait, and which part is a strategy I built to stay safe?",
      "If my Life Path number is accurate, what does it ask me to stop apologising for?",
      "What compliment do I deflect most often — and what would happen if I simply accepted it?",
      "Where am I performing competence instead of actually building it?",
      "What would I stop doing tomorrow if I fully believed I was already enough?",
    ],
  },
  {
    domain: "Work and craft",
    prompts: [
      "Which task in my week asks me to operate directly against my natural design?",
      "What have I been calling 'not ready' that is actually 'not willing to be judged'?",
      "If I could only ship one thing this quarter, which thing would make everything else easier?",
      "Where am I busy in a way that produces nothing I could point at?",
      "What is the unglamorous last ten percent that I keep avoiding?",
    ],
  },
  {
    domain: "Money and value",
    prompts: [
      "What do I charge for that I should be charging more for — and what stops me?",
      "Where does money leak out of my life through decisions I make while tired?",
      "What would I do differently if I treated my work as an asset rather than an income?",
      "Which financial decision have I been avoiding because it requires an adult conversation?",
      "What am I building that will keep paying me after I stop working on it?",
    ],
  },
  {
    domain: "Love and connection",
    prompts: [
      "What do the people closest to me consistently receive from me — and is that what I intend to give?",
      "Where am I choosing peace over honesty, and what has it cost?",
      "What boundary, if I held it warmly, would improve my closest relationship?",
      "Whose approval am I still working for, and do they even know it?",
      "When did I last ask for something directly instead of hoping it would be noticed?",
    ],
  },
  {
    domain: "Body and energy",
    prompts: [
      "What does my body do when I am about to make a decision I know is wrong for me?",
      "Which commitment in my calendar is draining me, and what would it cost to remove it?",
      "What restores me that I keep treating as optional?",
      "Where am I using achievement to avoid feeling something?",
      "What would a week look like if my energy were the constraint rather than my time?",
    ],
  },
  {
    domain: "Boundaries and voice",
    prompts: [
      "What am I tolerating that I would not accept on behalf of somebody I love?",
      "Where have I said yes in the last month that should have been a no?",
      "What sentence have I rehearsed in my head but never actually said out loud?",
      "Who benefits from me staying small, and do they know they benefit?",
      "What would I say if I trusted that the relationship could survive the truth?",
    ],
  },
  {
    domain: "Legacy and direction",
    prompts: [
      "What do I want to be true about my life in ten years that is not yet true today?",
      "What am I building that outlasts me?",
      "Which version of my life am I living — the chosen one, or the inherited one?",
      "What would I attempt if I were not the only person holding it up?",
      "What is the one sentence I want people to use when they describe what I contributed?",
    ],
  },
];

export const luckyCodeDisclaimer =
  "These correspondences come from the symbolic traditions that numerology grew out of, not from physics. Treat them as a vocabulary for attention — a reason to notice a colour or a day — rather than as a mechanism that produces outcomes. Nothing on this page changes your results.";
