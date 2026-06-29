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
  const { quizState, initializeQuiz, selectAnswer, resetQuiz } = useQuiz()

  const startQuiz = (unitName: string) => {
    const { questions, options } = generateUnitQuiz(vocabulary, unitName)
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
