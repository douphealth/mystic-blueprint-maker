// Pythagorean numerology letter-to-number mapping
const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

// Reduce to single digit or master number
export function reduceNumber(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((sum, d) => sum + parseInt(d), 0);
  }
  return n;
}

// Reduce all the way to a single digit, Master Numbers included (11 -> 2,
// 22 -> 4, 33 -> 6). Challenges and the length of the first Pinnacle are
// defined on single digits.
function reduceToDigit(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((sum, d) => sum + parseInt(d), 0);
  }
  return n;
}

// Life Path Number from date of birth
export function calculateLifePath(dob: Date): number {
  return reduceNumber(lifePathTotal(dob));
}

// The compound total the Life Path is reduced from: month, day and year each
// reduced on their own (Master Numbers kept), then added.
function lifePathTotal(dob: Date): number {
  const month = reduceNumber(dob.getMonth() + 1);
  const day = reduceNumber(dob.getDate());
  const year = reduceNumber(
    String(dob.getFullYear()).split('').reduce((s, d) => s + parseInt(d), 0)
  );
  return month + day + year;
}

// Upper-case A-Z letters of a name, with accents removed first. Without this,
// "José" or "Zoë" silently lost the accented letter (É, Ë have no entry in
// LETTER_VALUES), so Expression and Soul Urge came out wrong for anyone whose
// name carries a diacritic.
function nameLetters(name: string): string[] {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().split('');
}

// Sum of all letters in name
function nameSum(name: string): number {
  return nameLetters(name)
    .filter(c => LETTER_VALUES[c])
    .reduce((sum, c) => sum + LETTER_VALUES[c], 0);
}

// Sum of the vowels / consonants in a name (before any reduction)
function vowelSum(name: string): number {
  return nameLetters(name)
    .filter(c => VOWELS.has(c))
    .reduce((sum, c) => sum + (LETTER_VALUES[c] || 0), 0);
}

function consonantSum(name: string): number {
  return nameLetters(name)
    .filter(c => LETTER_VALUES[c] && !VOWELS.has(c))
    .reduce((sum, c) => sum + LETTER_VALUES[c], 0);
}

// Expression / Destiny Number (all letters)
export function calculateExpression(fullName: string): number {
  return reduceNumber(nameSum(fullName));
}

// Soul Urge / Heart's Desire (vowels only)
export function calculateSoulUrge(fullName: string): number {
  return reduceNumber(vowelSum(fullName));
}

// Personality Number (consonants only)
export function calculatePersonality(fullName: string): number {
  return reduceNumber(consonantSum(fullName));
}

// Birthday Number (just the day reduced)
export function calculateBirthday(dob: Date): number {
  return reduceNumber(dob.getDate());
}

// Personal Year Number
export function calculatePersonalYear(dob: Date, year: number): number {
  const month = dob.getMonth() + 1;
  const day = dob.getDate();
  const sum = reduceNumber(month) + reduceNumber(day) + reduceNumber(
    String(year).split('').reduce((s, d) => s + parseInt(d), 0)
  );
  return reduceNumber(sum);
}

// Hidden Passion - most frequently occurring number in the name
export function calculateHiddenPassion(fullName: string): number[] {
  const freq: Record<number, number> = {};
  nameLetters(fullName).forEach(c => {
    const v = LETTER_VALUES[c];
    if (v) freq[v] = (freq[v] || 0) + 1;
  });
  const maxFreq = Math.max(...Object.values(freq));
  return Object.entries(freq)
    .filter(([, count]) => count === maxFreq)
    .map(([num]) => parseInt(num));
}

// Karmic Debt: a core number carries one when the compound total it is reduced
// from is 13, 14, 16 or 19 (13/4, 14/5, 16/7, 19/1). The final single digit is
// not enough — a plain 7 is not a Karmic Debt 16; a 7 that came from 16 is.
const KARMIC_DEBT_NUMBERS = [13, 14, 16, 19];

// Every value a total passes through on its way to a single digit or Master
// Number, starting with the total itself: 79 -> 16 -> 7 gives [79, 16, 7].
function reductionChain(total: number): number[] {
  const chain = [total];
  let n = total;
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((sum, d) => sum + parseInt(d), 0);
    chain.push(n);
  }
  return chain;
}

export function calculateKarmicDebt(dob: Date, fullName: string): number[] {
  const found = new Set<number>();
  const totals = [
    lifePathTotal(dob),
    nameSum(fullName),
    vowelSum(fullName),
    consonantSum(fullName),
    dob.getDate(), // Birthday: born on the 13th, 14th, 16th or 19th
  ];
  totals.forEach(total =>
    reductionChain(total).forEach(step => {
      if (KARMIC_DEBT_NUMBERS.includes(step)) found.add(step);
    })
  );
  return [...found].sort((a, b) => a - b);
}

// Pinnacles
export function calculatePinnacles(dob: Date): { number: number; ageStart: number; ageEnd: number | null }[] {
  const lp = calculateLifePath(dob);
  const month = reduceNumber(dob.getMonth() + 1);
  const day = reduceNumber(dob.getDate());
  const year = reduceNumber(String(dob.getFullYear()).split('').reduce((s, d) => s + parseInt(d), 0));

  // The first Pinnacle runs to age 36 minus the single-digit Life Path. Using
  // a Master Number here ended it at age 3 for a Life Path 33.
  const firstEnd = 36 - reduceToDigit(lp);

  return [
    { number: reduceNumber(month + day), ageStart: 0, ageEnd: firstEnd },
    { number: reduceNumber(day + year), ageStart: firstEnd + 1, ageEnd: firstEnd + 9 },
    { number: reduceNumber(reduceNumber(month + day) + reduceNumber(day + year)), ageStart: firstEnd + 10, ageEnd: firstEnd + 18 },
    { number: reduceNumber(month + year), ageStart: firstEnd + 19, ageEnd: null },
  ];
}

// Challenges: the differences between the single-digit month, day and year.
// Master Numbers are reduced first (Nov -> 2, not 11), which keeps every
// challenge in the 0-8 range that the readings are written for. Feeding 11 in
// produced 9 and 11 for about 1 birth date in 15, and neither has a reading.
export function calculateChallenges(dob: Date): number[] {
  const month = reduceToDigit(dob.getMonth() + 1);
  const day = reduceToDigit(dob.getDate());
  const year = reduceToDigit(String(dob.getFullYear()).split('').reduce((s, d) => s + parseInt(d), 0));

  const first = Math.abs(month - day);
  const second = Math.abs(day - year);
  const third = Math.abs(first - second);
  const fourth = Math.abs(month - year);

  return [first, second, third, fourth];
}

// Personal Month
export function calculatePersonalMonth(dob: Date, year: number, month: number): number {
  const py = calculatePersonalYear(dob, year);
  return reduceNumber(py + month);
}

export interface NumerologyProfile {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  birthday: number;
  personalYear: number;
  hiddenPassion: number[];
  karmicDebt: number[];
  pinnacles: { number: number; ageStart: number; ageEnd: number | null }[];
  challenges: number[];
  personalMonths: number[];
}

export function calculateFullProfile(fullName: string, dob: Date): NumerologyProfile {
  const currentYear = new Date().getFullYear();
  const lifePath = calculateLifePath(dob);
  const expression = calculateExpression(fullName);
  const soulUrge = calculateSoulUrge(fullName);
  const personality = calculatePersonality(fullName);

  return {
    lifePath,
    expression,
    soulUrge,
    personality,
    birthday: calculateBirthday(dob),
    personalYear: calculatePersonalYear(dob, currentYear),
    hiddenPassion: calculateHiddenPassion(fullName),
    karmicDebt: calculateKarmicDebt(dob, fullName),
    pinnacles: calculatePinnacles(dob),
    challenges: calculateChallenges(dob),
    personalMonths: Array.from({ length: 12 }, (_, i) =>
      calculatePersonalMonth(dob, currentYear, i + 1)
    ),
  };
}

export type NumberCategory = 'spiritual' | 'creative' | 'leadership' | 'healing' | 'analytical' | 'nurturing';

export function getNumberCategory(n: number): NumberCategory {
  const map: Record<number, NumberCategory> = {
    1: 'leadership', 2: 'nurturing', 3: 'creative', 4: 'analytical',
    5: 'creative', 6: 'nurturing', 7: 'spiritual', 8: 'leadership',
    9: 'healing', 11: 'spiritual', 22: 'leadership', 33: 'healing',
  };
  return map[n] || 'spiritual';
}

export function getCategoryColor(cat: NumberCategory): string {
  const map: Record<NumberCategory, string> = {
    spiritual: 'hsl(270, 40%, 55%)',
    creative: 'hsl(43, 72%, 55%)',
    leadership: 'hsl(15, 70%, 55%)',
    healing: 'hsl(160, 45%, 45%)',
    analytical: 'hsl(210, 50%, 55%)',
    nurturing: 'hsl(340, 40%, 55%)',
  };
  return map[cat];
}
