import { Question, VocabularyData } from '../types';

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateUnitQuiz(
  vocabulary: VocabularyData,
  unitName: string
): { questions: Question[]; options: string[] } {
  const unitWords = vocabulary.words.filter(w => w.unit === unitName);
  const questions: Question[] = [];
  
  unitWords.forEach((word, idx) => {
    const example = word.examples[0] || `${word.word} is an important word.`;
    const sentence = createBlankSentence(example, word.word);
    questions.push({
      id: idx,
      sentence,
      answer: word.word,
      word
    });
  });
  
  return {
    questions: shuffleArray(questions),
    options: shuffleArray(unitWords.map(w => w.word))
  };
}

export function generateMixedQuiz(
  vocabulary: VocabularyData,
  unitNames: string[]
): { questions: Question[]; options: string[] } {
  const selectedWords = vocabulary.words.filter(w => unitNames.includes(w.unit));
  const questions: Question[] = [];
  
  selectedWords.forEach((word, idx) => {
    const example = word.examples[0] || `${word.word} is an important word.`;
    const sentence = createBlankSentence(example, word.word);
    questions.push({
      id: idx,
      sentence,
      answer: word.word,
      word
    });
  });
  
  return {
    questions: shuffleArray(questions),
    options: shuffleArray(selectedWords.map(w => w.word))
  };
}

export function generateSimulationQuiz(
  vocabulary: VocabularyData
): { questions: Question[]; options: string[] } {
  const allWords = [...vocabulary.words];
  const shuffledWords = shuffleArray(allWords);
  
  const targetWords = shuffledWords.slice(0, 15);
  const distractorWords = shuffledWords.slice(15, 20);
  
  const questions: Question[] = targetWords.map((word, idx) => {
    const example = word.examples[0] || `${word.word} is an important word.`;
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

function createBlankSentence(sentence: string, word: string): string {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  return sentence.replace(regex, '_____');
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
