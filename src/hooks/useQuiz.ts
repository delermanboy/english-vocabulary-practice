import { useState, useCallback } from 'react';
import { Question, QuizState } from '../types';

export function useQuiz() {
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    options: [],
    answers: {},
    currentQuestion: 0,
    submitted: false,
    score: 0
  });

  const initializeQuiz = useCallback((questions: Question[], options: string[]) => {
    setQuizState({
      questions,
      options,
      answers: {},
      currentQuestion: 0,
      submitted: false,
      score: 0
    });
  }, []);

  const selectAnswer = useCallback((questionId: number, word: string) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: word
      }
    }));
  }, []);

  const submitQuiz = useCallback((score: number) => {
    setQuizState(prev => ({
      ...prev,
      submitted: true,
      score
    }));
  }, []);

  const resetQuiz = useCallback(() => {
    setQuizState({
      questions: [],
      options: [],
      answers: {},
      currentQuestion: 0,
      submitted: false,
      score: 0
    });
  }, []);

  return {
    quizState,
    initializeQuiz,
    selectAnswer,
    submitQuiz,
    resetQuiz
  };
}
