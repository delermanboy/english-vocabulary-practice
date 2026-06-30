import { useState } from 'react'
import { VocabularyData, Question } from '../types'
import { useQuiz } from '../hooks/useQuiz'
import { generateUnitQuiz } from '../utils'
import QuizComponent from './QuizComponent'

interface UnitPracticeProps {
  vocabulary: VocabularyData
  onBack: () => void
  onQuizComplete?: (questions: Question[], answers: Record<number, string>) => void
}

function UnitPractice({ vocabulary, onBack, onQuizComplete }: UnitPracticeProps) {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState<number | undefined>(undefined)
  const { quizState, initializeQuiz, selectAnswer, resetQuiz } = useQuiz()

  const startQuiz = (unitName: string) => {
    const { questions, options } = generateUnitQuiz(vocabulary, unitName, questionCount)
    initializeQuiz(questions, options)
  }

  const handleUnitSelect = (unitName: string) => {
    setSelectedUnit(unitName)
    startQuiz(unitName)
  }

  const handleReset = () => {
    resetQuiz()
    setSelectedUnit(null)
  }

  if (selectedUnit && quizState.questions.length > 0) {
    return (
      <div className="container">
        <button className="btn btn-back" onClick={onBack}>
          ← 返回首页
        </button>
        <div className="card">
          <h2 className="section-title">📚 {selectedUnit} 单元练习</h2>
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
        <h2 className="section-title">📚 选择单元</h2>

        {/* Question count selector */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontWeight: 600, marginBottom: '10px', color: '#333' }}>📋 题目数量</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: '全部', value: undefined },
              { label: '10题', value: 10 },
              { label: '15题', value: 15 },
              { label: '20题', value: 20 }
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setQuestionCount(opt.value)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: questionCount === opt.value ? '#667eea' : '#e0e0e0',
                  background: questionCount === opt.value ? '#667eea' : 'white',
                  color: questionCount === opt.value ? 'white' : '#333',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="unit-selector">
          {vocabulary.units.map((unit) => (
            <button
              key={unit.name}
              className="unit-btn"
              onClick={() => handleUnitSelect(unit.name)}
            >
              {unit.name}
              <br />
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                {unit.words.length} 个单词
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UnitPractice
