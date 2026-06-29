import { useState, useEffect } from 'react'
import { VocabularyData, Question } from '../types'
import { useQuiz } from '../hooks/useQuiz'
import { generateSimulationQuiz } from '../utils'
import QuizComponent from './QuizComponent'

interface SimulationPracticeProps {
  vocabulary: VocabularyData
  onBack: () => void
  onQuizComplete?: (questions: Question[], answers: Record<number, string>) => void
}

function SimulationPractice({ vocabulary, onBack, onQuizComplete }: SimulationPracticeProps) {
  const [started, setStarted] = useState(false)
  const { quizState, initializeQuiz, selectAnswer, resetQuiz } = useQuiz()

  const startQuiz = () => {
    const { questions, options } = generateSimulationQuiz(vocabulary)
    initializeQuiz(questions, options)
    setStarted(true)
  }

  useEffect(() => {
    startQuiz()
  }, [])

  const handleReset = () => {
    resetQuiz()
    startQuiz()
  }

  if (started && quizState.questions.length > 0) {
    return (
      <div className="container">
        <button className="btn btn-back" onClick={onBack}>
          ← 返回首页
        </button>
        <div className="card">
          <h2 className="section-title">🎯 模拟测试</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            📝 共 15 道题，20 个可选词汇（含 5 个干扰词）
          </p>
          <QuizComponent
            quizState={quizState}
            onSelectAnswer={selectAnswer}
            onSubmit={() => {}}
            onReset={handleReset}
            onQuizComplete={onQuizComplete}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <button className="btn btn-back" onClick={onBack}>
        ← 返回首页
      </button>
      <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
        <h2>🎯 正在加载模拟测试...</h2>
      </div>
    </div>
  )
}

export default SimulationPractice
