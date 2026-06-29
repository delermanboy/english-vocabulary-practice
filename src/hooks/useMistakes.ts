import { useState, useEffect, useCallback } from 'react'
import { Mistake, MistakesData, Question } from '../types'

const STORAGE_KEY = 'english-vocabulary-mistakes'

export function useMistakes() {
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 加载错题
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data: MistakesData = JSON.parse(saved)
        setMistakes(data.mistakes)
      }
    } catch (error) {
      console.error('Failed to load mistakes:', error)
    }
    setIsLoaded(true)
  }, [])

  // 保存错题
  const saveMistakes = useCallback((newMistakes: Mistake[]) => {
    try {
      const data: MistakesData = {
        mistakes: newMistakes,
        lastUpdated: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setMistakes(newMistakes)
    } catch (error) {
      console.error('Failed to save mistakes:', error)
    }
  }, [])

  // 添加错题
  const addMistake = useCallback((
    question: Question,
    userAnswer: string
  ) => {
    const newMistake: Mistake = {
      id: `${question.word.word}-${Date.now()}`,
      word: question.word,
      sentence: question.sentence,
      userAnswer,
      correctAnswer: question.answer,
      timestamp: Date.now(),
      reviewCount: 0
    }

    setMistakes(prev => {
      const filtered = prev.filter(m => m.word.word !== question.word.word)
      const updated = [...filtered, newMistake]
      saveMistakes(updated)
      return updated
    })
  }, [saveMistakes])

  // 批量添加错题
  const addMistakes = useCallback((
    questions: Question[],
    answers: Record<number, string>
  ) => {
    const newMistakes: Mistake[] = []
    
    questions.forEach(q => {
      const userAnswer = answers[q.id]
      if (userAnswer !== q.answer) {
        newMistakes.push({
          id: `${q.word.word}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          word: q.word,
          sentence: q.sentence,
          userAnswer,
          correctAnswer: q.answer,
          timestamp: Date.now(),
          reviewCount: 0
        })
      }
    })

    if (newMistakes.length > 0) {
      setMistakes(prev => {
        const filtered = prev.filter(m => !newMistakes.some(nm => nm.word.word === m.word.word))
        const updated = [...filtered, ...newMistakes]
        saveMistakes(updated)
        return updated
      })
    }
  }, [saveMistakes])

  // 删除单个错题
  const removeMistake = useCallback((mistakeId: string) => {
    setMistakes(prev => {
      const updated = prev.filter(m => m.id !== mistakeId)
      saveMistakes(updated)
      return updated
    })
  }, [saveMistakes])

  // 标记复习次数
  const incrementReviewCount = useCallback((mistakeId: string) => {
    setMistakes(prev => {
      const updated = prev.map(m => 
        m.id === mistakeId 
          ? { ...m, reviewCount: m.reviewCount + 1 }
          : m
      )
      saveMistakes(updated)
      return updated
    })
  }, [saveMistakes])

  // 清空所有错题
  const clearAllMistakes = useCallback(() => {
    if (window.confirm('确定要清空所有错题吗？此操作不可恢复！')) {
      saveMistakes([])
    }
  }, [saveMistakes])

  // 从错题中移除单词（做对了）
  const removeWordFromMistakes = useCallback((word: string) => {
    setMistakes(prev => {
      const updated = prev.filter(m => m.word.word !== word)
      saveMistakes(updated)
      return updated
    })
  }, [saveMistakes])

  return {
    mistakes,
    isLoaded,
    addMistake,
    addMistakes,
    removeMistake,
    incrementReviewCount,
    clearAllMistakes,
    removeWordFromMistakes
  }
}
