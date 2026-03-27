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

// Life Path Number from date of birth
export function calculateLifePath(dob: Date): number {
  const month = reduceNumber(dob.getMonth() + 1);
  const day = reduceNumber(dob.getDate());
  const year = reduceNumber(
    String(dob.getFullYear()).split('').reduce((s, d) => s + parseInt(d), 0)
  );
  return reduceNumber(month + day + year);
}

// Sum of all letters in name
function nameSum(name: string): number {
  return name.toUpperCase().split('')
    .filter(c => LETTER_VALUES[c])
    .reduce((sum, c) => sum + LETTER_VALUES[c], 0);
}

// Expression / Destiny Number (all letters)
export function calculateExpression(fullName: string): number {
  return reduceNumber(nameSum(fullName));
}

// Soul Urge / Heart's Desire (vowels only)
export function calculateSoulUrge(fullName: string): number {
  const vowelSum = fullName.toUpperCase().split('')
    .filter(c => VOWELS.has(c))
    .reduce((sum, c) => sum + (LETTER_VALUES[c] || 0), 0);
  return reduceNumber(vowelSum);
}

// Personality Number (consonants only)
export function calculatePersonality(fullName: string): number {
  const consonantSum = fullName.toUpperCase().split('')
    .filter(c => LETTER_VALUES[c] && !VOWELS.has(c))
    .reduce((sum, c) => sum + LETTER_VALUES[c], 0);
  return reduceNumber(consonantSum);
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
  fullName.toUpperCase().split('').forEach(c => {
    const v = LETTER_VALUES[c];
    if (v) freq[v] = (freq[v] || 0) + 1;
  });
  const maxFreq = Math.max(...Object.values(freq));
  return Object.entries(freq)
    .filter(([, count]) => count === maxFreq)
    .map(([num]) => parseInt(num));
}

// Karmic Debt check
export function calculateKarmicDebt(lifePath: number, expression: number, soulUrge: number, personality: number): number[] {
  const karmicNumbers = [13, 14, 16, 19];
  const debts: number[] = [];

  // Check the unreduced sums for karmic debt indicators
  // Simplified: we check if any core number reduces FROM a karmic number
  [lifePath, expression, soulUrge, personality].forEach(n => {
    karmicNumbers.forEach(k => {
      if (reduceNumber(k) === n && !debts.includes(k)) {
        debts.push(k);
      }
    });
  });
  return debts;
}

// Pinnacles
export function calculatePinnacles(dob: Date): { number: number; ageStart: number; ageEnd: number | null }[] {
  const lp = calculateLifePath(dob);
  const month = reduceNumber(dob.getMonth() + 1);
  const day = reduceNumber(dob.getDate());
  const year = reduceNumber(String(dob.getFullYear()).split('').reduce((s, d) => s + parseInt(d), 0));

  const firstEnd = 36 - lp;

  return [
    { number: reduceNumber(month + day), ageStart: 0, ageEnd: firstEnd },
    { number: reduceNumber(day + year), ageStart: firstEnd + 1, ageEnd: firstEnd + 9 },
    { number: reduceNumber(reduceNumber(month + day) + reduceNumber(day + year)), ageStart: firstEnd + 10, ageEnd: firstEnd + 18 },
    { number: reduceNumber(month + year), ageStart: firstEnd + 19, ageEnd: null },
  ];
}

// Challenges
export function calculateChallenges(dob: Date): number[] {
  const month = reduceNumber(dob.getMonth() + 1);
  const day = reduceNumber(dob.getDate());
  const year = reduceNumber(String(dob.getFullYear()).split('').reduce((s, d) => s + parseInt(d), 0));

  const first = Math.abs(month - day);
  const second = Math.abs(day - year);
  const third = Math.abs(first - second);
  const fourth = Math.abs(month - year);

  return [reduceNumber(first), reduceNumber(second), reduceNumber(third), reduceNumber(fourth)];
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
    karmicDebt: calculateKarmicDebt(lifePath, expression, soulUrge, personality),
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
