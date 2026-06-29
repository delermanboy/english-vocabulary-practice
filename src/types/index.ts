export interface Word {
  word: string;
  pos: string;
  definition: string;
  examples: string[];
  unit: string;
}

export interface Unit {
  name: string;
  words: string[];
}

export interface VocabularyData {
  words: Word[];
  units: Unit[];
}

export interface Question {
  id: number;
  sentence: string;
  answer: string;
  word: Word;
}

export interface QuizState {
  questions: Question[];
  options: string[];
  answers: Record<number, string>;
  currentQuestion: number;
  submitted: boolean;
  score: number;
}

export type PracticeMode = 'unit' | 'mixed' | 'simulation' | 'mistakes';

export interface Mistake {
  id: string;
  word: Word;
  sentence: string;
  userAnswer: string;
  correctAnswer: string;
  timestamp: number;
  reviewCount: number;
}

export interface MistakesData {
  mistakes: Mistake[];
  lastUpdated: number;
}
