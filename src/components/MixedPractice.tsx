import { useState } from 'react'
import { VocabularyData, Question } from '../types'
import { useQuiz } from '../hooks/useQuiz'
import { generateMixedQuiz } from '../utils'
import QuizComponent from './QuizComponent'

interface MixedPracticeProps {
  vocabulary: VocabularyData
  onBack: () => void
  onQuizComplete?: (questions: Question[], answers: Record<number, string>) => void
}

function MixedPractice({ vocabulary, onBack, onQuizComplete }: MixedPracticeProps) {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [started, setStarted] = useState(false)
  const { quizState, initializeQuiz, selectAnswer, resetQuiz } = useQuiz()

  const toggleUnit = (unitName: string) => {
    setSelectedUnits(prev => {
      if (prev.includes(unitName)) {
        return prev.filter(u => u !== unitName)
      } else {
        return [...prev, unitName]
      }
    })
  }

  const startQuiz = () => {
    if (selectedUnits.length === 0) return
    const { questions, options } = generateMixedQuiz(vocabulary, selectedUnits)
    initializeQuiz(questions, options)
    setStarted(true)
  }

  const handleReset = () => {
    resetQuiz()
    setSelectedUnits([])
    setStarted(false)
  }

  if (started && quizState.questions.length > 0) {
    return (
      <div className="container">
        <button className="btn btn-back" onClick={onBack}>
          ← 返回首页
        </button>
        <div className="card">
          <h2 className="section-title">🔀 混合练习</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            已选择单元: {selectedUnits.join(', ')}
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
      <div className="card">
        <h2 className="section-title">🔀 选择要混合的单元</h2>
        <div className="unit-selector">
          {vocabulary.units.map((unit) => (
            <button
              key={unit.name}
              className={`unit-btn ${selectedUnits.includes(unit.name) ? 'selected' : ''}`}
              onClick={() => toggleUnit(unit.name)}
            >
              {unit.name}
              <br />
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                {unit.words.length} 个单词
              </span>
            </button>
          ))}
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={startQuiz}
            disabled={selectedUnits.length === 0}
          >
            🚀 开始练习
          </button>
        </div>
      </div>
    </div>
  )
}

export default MixedPractice
