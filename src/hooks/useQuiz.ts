import { useState, useCallback } from 'react';
import { Question, QuizState } from '../types';

export interface ExtendedQuizState extends QuizState {
  /** Maps option word -> questionId that is using it, or null if free */
  usedOptions: Record<string, number | null>;
}

export function useQuiz() {
  const [quizState, setQuizState] = useState<ExtendedQuizState>({
    questions: [],
    options: [],
    answers: {},
    currentQuestion: 0,
    submitted: false,
    score: 0,
    usedOptions: {}
  });

  const initializeQuiz = useCallback((questions: Question[], options: string[]) => {
    const usedOptions: Record<string, number | null> = {};
    options.forEach(opt => { usedOptions[opt] = null; });

    setQuizState({
      questions,
      options,
      answers: {},
      currentQuestion: 0,
      submitted: false,
      score: 0,
      usedOptions
    });
  }, []);

  /**
   * Select an answer for a question.
   * Enforces the "one word can only be used once" rule:
   * - If the word is already used by another question, it gets moved to this question.
   * - If this question already has a different answer, that old answer is freed.
   */
  const selectAnswer = useCallback((questionId: number, word: string) => {
    setQuizState(prev => {
      const currentAnswer = prev.answers[questionId];

      // If clicking the same word, deselect it
      if (currentAnswer === word) {
        const newAnswers = { ...prev.answers };
        delete newAnswers[questionId];
        return {
          ...prev,
          answers: newAnswers,
          usedOptions: {
            ...prev.usedOptions,
            [word]: null
          }
        };
      }

      const newAnswers = { ...prev.answers, [questionId]: word };
      const newUsed = { ...prev.usedOptions };

      // Free the old answer of this question (if any)
      if (currentAnswer && newUsed[currentAnswer] === questionId) {
        newUsed[currentAnswer] = null;
      }

      // If the new word is used by another question, free it there first
      const prevQuestionId = newUsed[word];
      if (prevQuestionId !== null && prevQuestionId !== undefined && prevQuestionId !== questionId) {
        delete newAnswers[prevQuestionId];
      }

      // Assign this word to the current question
      newUsed[word] = questionId;

      return {
        ...prev,
        answers: newAnswers,
        usedOptions: newUsed
      };
    });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setQuizState(prev => ({
      ...prev,
      currentQuestion: Math.max(0, Math.min(index, prev.questions.length - 1))
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      currentQuestion: Math.min(prev.currentQuestion + 1, prev.questions.length - 1)
    }));
  }, []);

  const prevQuestion = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      currentQuestion: Math.max(prev.currentQuestion - 1, 0)
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
      score: 0,
      usedOptions: {}
    });
  }, []);

  return {
    quizState,
    initializeQuiz,
    selectAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    resetQuiz
  };
}
