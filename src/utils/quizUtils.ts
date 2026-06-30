import { Question, VocabularyData } from '../types';

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function pickRandomExample(word: VocabularyData['words'][0]): string {
  if (word.examples.length === 0) {
    return `${word.word} is an important word.`;
  }
  const idx = Math.floor(Math.random() * word.examples.length);
  return word.examples[idx];
}

function createBlankSentence(sentence: string, word: string): string {
  // Escape special regex characters in word
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
  // If whole-word replacement fails, try substring replacement
  let result = sentence.replace(regex, '_____');
  if (result === sentence) {
    // Fallback: case-insensitive substring replace
    result = sentence.replace(new RegExp(escaped, 'gi'), '_____');
  }
  return result;
}

export function generateUnitQuiz(
  vocabulary: VocabularyData,
  unitName: string,
  questionCount?: number
): { questions: Question[]; options: string[] } {
  const unitWords = vocabulary.words.filter(w => w.unit === unitName);
  const shuffled = shuffleArray(unitWords);
  const targetWords = questionCount && questionCount < shuffled.length
    ? shuffled.slice(0, questionCount)
    : shuffled;

  const questions: Question[] = targetWords.map((word, idx) => {
    const example = pickRandomExample(word);
    const sentence = createBlankSentence(example, word.word);
    return {
      id: idx,
      sentence,
      answer: word.word,
      word
    };
  });

  return {
    questions,
    options: shuffleArray(targetWords.map(w => w.word))
  };
}

export function generateMixedQuiz(
  vocabulary: VocabularyData,
  unitNames: string[],
  questionCount?: number
): { questions: Question[]; options: string[] } {
  const selectedWords = shuffleArray(vocabulary.words.filter(w => unitNames.includes(w.unit)));
  const targetWords = questionCount && questionCount < selectedWords.length
    ? selectedWords.slice(0, questionCount)
    : selectedWords;

  const questions: Question[] = targetWords.map((word, idx) => {
    const example = pickRandomExample(word);
    const sentence = createBlankSentence(example, word.word);
    return {
      id: idx,
      sentence,
      answer: word.word,
      word
    };
  });

  return {
    questions,
    options: shuffleArray(targetWords.map(w => w.word))
  };
}

export function generateSimulationQuiz(
  vocabulary: VocabularyData
): { questions: Question[]; options: string[] } {
  const allWords = shuffleArray([...vocabulary.words]);

  const targetWords = allWords.slice(0, 15);
  const distractorWords = allWords.slice(15, 20);

  const questions: Question[] = targetWords.map((word, idx) => {
    const example = pickRandomExample(word);
    const sentence = createBlankSentence(example, word.word);
    return {
      id: idx,
      sentence,
      answer: word.word,
      word
    };
  });

  return {
    questions: shuffleArray(questions),
    options: shuffleArray([...targetWords.map(w => w.word), ...distractorWords.map(w => w.word)])
  };
}

export function calculateScore(
  questions: Question[],
  answers: Record<number, string>
): { score: number; total: number; wrongQuestions: Question[] } {
  let score = 0;
  const wrongQuestions: Question[] = [];
  
  questions.forEach(q => {
    if (answers[q.id] === q.answer) {
      score++;
    } else {
      wrongQuestions.push(q);
    }
  });
  
  return { score, total: questions.length, wrongQuestions };
}
