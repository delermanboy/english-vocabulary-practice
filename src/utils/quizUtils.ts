import { Question, VocabularyData, Word } from '../types';

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Compact irregular verb map (most common ones only)
const IRREGULARS: Record<string, string[]> = {
  be: ['am', 'is', 'are', 'was', 'were', 'been', 'being'],
  become: ['became', 'becoming'],
  begin: ['began', 'begun', 'beginning'],
  break: ['broke', 'broken', 'breaking'],
  bring: ['brought', 'bringing'],
  build: ['built', 'building'],
  buy: ['bought', 'buying'],
  catch: ['caught', 'catching'],
  choose: ['chose', 'chosen', 'choosing'],
  come: ['came', 'coming'],
  cut: ['cutting'],
  do: ['did', 'done', 'doing', 'does'],
  draw: ['drew', 'drawn', 'drawing'],
  drive: ['drove', 'driven', 'driving'],
  eat: ['ate', 'eaten', 'eating'],
  fall: ['fell', 'fallen', 'falling'],
  feed: ['fed', 'feeding'],
  feel: ['felt', 'feeling'],
  find: ['found', 'finding'],
  fly: ['flew', 'flown', 'flying'],
  forget: ['forgot', 'forgotten', 'forgetting'],
  forgive: ['forgave', 'forgiven', 'forgiving'],
  get: ['got', 'gotten', 'getting', 'gets'],
  give: ['gave', 'given', 'giving', 'gives'],
  go: ['went', 'gone', 'going', 'goes'],
  grow: ['grew', 'grown', 'growing', 'grows'],
  hang: ['hung', 'hanged', 'hanging'],
  have: ['had', 'having', 'has'],
  hear: ['heard', 'hearing'],
  hide: ['hid', 'hidden', 'hiding'],
  hold: ['held', 'holding'],
  keep: ['kept', 'keeping', 'keeps'],
  know: ['knew', 'known', 'knowing', 'knows'],
  lead: ['led', 'leading', 'leads'],
  leave: ['left', 'leaving', 'leaves'],
  let: ['letting'],
  lose: ['lost', 'losing', 'loses'],
  make: ['made', 'making', 'makes'],
  mean: ['meant', 'meaning', 'means'],
  meet: ['met', 'meeting', 'meets'],
  pay: ['paid', 'paying', 'pays'],
  put: ['putting', 'puts'],
  read: ['reading', 'reads'],
  run: ['ran', 'running', 'runs'],
  say: ['said', 'saying', 'says'],
  see: ['saw', 'seen', 'seeing', 'sees'],
  sell: ['sold', 'selling', 'sells'],
  send: ['sent', 'sending', 'sends'],
  set: ['setting', 'sets'],
  show: ['showed', 'shown', 'showing', 'shows'],
  shut: ['shutting'],
  sit: ['sat', 'sitting', 'sits'],
  speak: ['spoke', 'spoken', 'speaking', 'speaks'],
  spring: ['sprang', 'sprung', 'springing', 'springs'],
  spend: ['spent', 'spending', 'spends'],
  stand: ['stood', 'standing', 'stands'],
  take: ['took', 'taken', 'taking', 'takes'],
  teach: ['taught', 'teaching', 'teaches'],
  tell: ['told', 'telling', 'tells'],
  think: ['thought', 'thinking', 'thinks'],
  throw: ['threw', 'thrown', 'throwing', 'throws'],
  understand: ['understood', 'understanding', 'understands'],
  wear: ['wore', 'worn', 'wearing'],
  win: ['won', 'winning', 'wins'],
  write: ['wrote', 'written', 'writing', 'writes'],
  can: ['could'],
  may: ['might'],
  will: ['would'],
  shall: ['should'],
  strike: ['struck', 'striking'],
};

function generateVariants(word: string): string[] {
  const base = word.toLowerCase().trim();
  const variants = new Set<string>([base]);

  if (IRREGULARS[base]) {
    IRREGULARS[base].forEach(v => variants.add(v));
  }

  const suffixes = ['s', 'es', 'ed', 'd', 'ing', 'ly', 'er', 'est', 'ion', 'tion', 'ness', 'ment'];
  suffixes.forEach(s => variants.add(base + s));

  if (base.endsWith('y') && base.length > 1) {
    const stem = base.slice(0, -1);
    variants.add(stem + 'ies');
    variants.add(stem + 'ied');
    variants.add(stem + 'ying');
  }

  if (base.endsWith('e') && base.length > 1) {
    const stem = base.slice(0, -1);
    variants.add(stem + 'ing');
    variants.add(stem + 'ed');
    variants.add(stem + 'er');
    variants.add(stem + 'est');
  }

  // consonant doubling
  if (base.length >= 3 && /[^aeiou][aeiou][^aeiouy]$/.test(base)) {
    const last = base.slice(-1);
    variants.add(base + last + 'ing');
    variants.add(base + last + 'ed');
  }

  return Array.from(variants);
}

/**
 * Build a regex alternation pattern from all variants of a word.
 */
function buildVariantPattern(word: string): string {
  const variants = generateVariants(word);
  return variants.map(escapeRegex).join('|');
}

/**
 * Try to match a phrase variant (a specific string, not the full entry with "/")
 * against the sentence using inflection-aware matching.
 */
function tryMatchPhrase(sentence: string, phrase: string): string | null {
  const parts = phrase.split(/\s+/);
  if (parts.length === 0) return null;

  const first = parts[0];
  const last = parts[parts.length - 1];

  const firstPattern = buildVariantPattern(first);
  const lastPattern = buildVariantPattern(last);

  // Try: firstVariant ... lastVariant within ~50 chars
  const phraseRe = new RegExp(
    '\\b(' + firstPattern + ')\\b([\\s\\S]{0,50})\\b(' + lastPattern + ')\\b',
    'i'
  );
  const phraseMatch = phraseRe.exec(sentence);
  if (phraseMatch) {
    return phraseMatch[0];
  }

  // Try just matching first word variant
  const firstRe = new RegExp('\\b(' + firstPattern + ')\\b', 'i');
  const firstMatch = firstRe.exec(sentence);
  if (firstMatch) return firstMatch[0];

  return null;
}

/**
 * Find the actual form of a word/phrase in a sentence, handling inflections.
 * Returns the matched text (with original casing) or null if not found.
 */
export function findWordForm(sentence: string, word: string): string | null {
  const sent = sentence;
  const w = word.toLowerCase().trim();

  // 1. Exact match
  const exactRe = new RegExp('\\b' + escapeRegex(w) + '\\b', 'i');
  const exact = exactRe.exec(sent);
  if (exact) return exact[0];

  // 2. Multi-word phrases
  if (w.includes(' ')) {
    // Try each slash-separated variant independently
    const variants = w.split('/');
    for (const variant of variants) {
      const v = variant.trim();
      if (!v) continue;

      const matched = tryMatchPhrase(sent, v);
      if (matched) return matched;
    }

    // Fallback: if phrase starts with "not" and nothing matched,
    // try skipping "not" (because sentence may use contractions like don't/won't)
    const firstWord = w.split(/\s+/)[0];
    if (firstWord === 'not') {
      const withoutNot = w.replace(/^not\s+/, '');
      const noNotVariants = withoutNot.split('/');
      for (const variant of noNotVariants) {
        const v = variant.trim();
        if (!v) continue;
        const matched = tryMatchPhrase(sent, v);
        if (matched) return matched;
      }
    }
  }

  // 3. Single word with inflections
  const variants = generateVariants(w);
  for (const v of variants) {
    const re = new RegExp('\\b' + escapeRegex(v) + '\\b', 'i');
    const m = re.exec(sent);
    if (m) return m[0];
  }

  return null;
}

/**
 * Create a blanked version of the sentence by replacing the word form with _____.
 * Returns null if the word cannot be found in the sentence.
 */
export function createBlankSentence(sentence: string, word: string): string | null {
  const form = findWordForm(sentence, word);
  if (!form) return null;

  // Replace only the first occurrence
  const escaped = escapeRegex(form);
  const re = new RegExp('\\b' + escaped + '\\b');
  return sentence.replace(re, '_____');
}

/**
 * Generate distractor words that are NOT in the correct answers set.
 * Prefers words from the same unit(s), then falls back to others.
 */
function generateDistractors(
  correctWords: Word[],
  allWords: Word[],
  count: number
): Word[] {
  const correctSet = new Set(correctWords.map(w => w.word));
  const unitNames = new Set(correctWords.map(w => w.unit));

  // Prefer same-unit words as distractors
  const sameUnit = allWords.filter(
    w => unitNames.has(w.unit) && !correctSet.has(w.word) && w.examples.length > 0
  );
  const otherUnits = allWords.filter(
    w => !unitNames.has(w.unit) && !correctSet.has(w.word) && w.examples.length > 0
  );

  const pool = shuffleArray([...sameUnit, ...otherUnits]);
  return pool.slice(0, count);
}

/**
 * Build options array from correct answers + distractors, then shuffle.
 */
function buildOptions(correctWords: Word[], allWords: Word[], extraDistractors: number): string[] {
  const distractors = generateDistractors(correctWords, allWords, extraDistractors);
  const optionWords = shuffleArray([...correctWords, ...distractors]);
  return optionWords.map(w => w.word);
}

export interface QuizResult {
  questions: Question[];
  options: string[];
}

export function generateUnitQuiz(
  vocabulary: VocabularyData,
  unitName: string,
  questionCount?: number
): QuizResult {
  const unitWords = vocabulary.words.filter(
    w => w.unit === unitName && w.examples.length > 0
  );

  if (unitWords.length === 0) {
    return { questions: [], options: [] };
  }

  let selected = shuffleArray(unitWords);
  if (questionCount && questionCount < selected.length) {
    selected = selected.slice(0, questionCount);
  }

  const questions: Question[] = selected.map((word, idx) => {
    const example = word.examples[Math.floor(Math.random() * word.examples.length)];
    const blanked = createBlankSentence(example, word.word);
    // Fallback: if blank creation fails, use the raw sentence (should be rare now)
    const sentence = blanked ?? example;
    return {
      id: idx,
      sentence,
      answer: word.word,
      word,
    };
  });

  // Distractors: add 3 extra wrong options (or more if unit is small)
  const extraDistractors = Math.max(3, Math.min(6, Math.floor(selected.length * 0.5)));
  const options = buildOptions(selected, vocabulary.words, extraDistractors);

  return { questions, options };
}

export function generateMixedQuiz(
  vocabulary: VocabularyData,
  unitNames: string[],
  questionCount?: number,
  fixedDistractors?: number
): QuizResult {
  const pool = vocabulary.words.filter(
    w => unitNames.includes(w.unit) && w.examples.length > 0
  );

  if (pool.length === 0) {
    return { questions: [], options: [] };
  }

  let selected = shuffleArray(pool);
  if (questionCount && questionCount < selected.length) {
    selected = selected.slice(0, questionCount);
  }

  const questions: Question[] = selected.map((word, idx) => {
    const example = word.examples[Math.floor(Math.random() * word.examples.length)];
    const blanked = createBlankSentence(example, word.word);
    const sentence = blanked ?? example;
    return {
      id: idx,
      sentence,
      answer: word.word,
      word,
    };
  });

  const extraDistractors = fixedDistractors ?? Math.max(3, Math.min(8, Math.floor(selected.length * 0.5)));
  const options = buildOptions(selected, vocabulary.words, extraDistractors);

  return { questions, options };
}

export function generateSimulationQuiz(
  vocabulary: VocabularyData,
  unitNames?: string[]
): QuizResult {
  // If no units specified, use all units
  const names = unitNames ?? vocabulary.units.map(u => u.name);
  // Fixed 15 questions + 5 distractors = 20 options for a standardized test feel
  return generateMixedQuiz(vocabulary, names, 15, 5);
}

export function calculateScore(
  questions: Question[],
  answers: Record<number, string>
): { score: number; total: number; wrongQuestions: Question[] } {
  let score = 0;
  const wrongQuestions: Question[] = [];

  questions.forEach(q => {
    const userAnswer = answers[q.id];
    if (userAnswer && userAnswer.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
      score++;
    } else {
      wrongQuestions.push(q);
    }
  });

  return { score, total: questions.length, wrongQuestions };
}
