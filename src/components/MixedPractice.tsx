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
  const [questionCount, setQuestionCount] = useState<number | undefined>(undefined)
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
    const { questions, options } = generateMixedQuiz(vocabulary, selectedUnits, questionCount)
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
