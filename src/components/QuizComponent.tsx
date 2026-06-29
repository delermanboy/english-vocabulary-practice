import { useState } from 'react'
import { Question, QuizState } from '../types'
import { calculateScore } from '../utils'

interface QuizComponentProps {
  quizState: QuizState
  onSelectAnswer: (questionId: number, word: string) => void
  onSubmit: () => void
  onReset: () => void
  onQuizComplete?: (questions: Question[], answers: Record<number, string>) => void
}

function QuizComponent({
  quizState,
  onSelectAnswer,
  onReset,
  onQuizComplete
}: QuizComponentProps) {
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<{
    score: number
    total: number
    wrongQuestions: Question[]
  } | null>(null)
  const [activeBlankId, setActiveBlankId] = useState<number | null>(null)

  const handleSubmit = () => {
    const scoreResult = calculateScore(quizState.questions, quizState.answers)
    setResults(scoreResult)
    setShowResults(true)
    
    if (onQuizComplete) {
      onQuizComplete(quizState.questions, quizState.answers)
    }
  }

  const isWordUsed = (word: string) => {
    return Object.values(quizState.answers).includes(word)
  }

  const getBlankClass = (question: Question) => {
    const userAnswer = quizState.answers[question.id]
    const isActive = activeBlankId === question.id
    if (!showResults) {
      let classes = ''
      if (userAnswer) classes += 'filled '
      if (isActive) classes += 'active'
      return classes.trim()
    }
    return userAnswer === question.answer ? 'correct' : 'wrong'
  }

  if (showResults && results) {
    return (
      <div className="quiz-container">
        <div className="results-card">
          <h2>📊 测试结果</h2>
          <div className="score-display">
            {results.score} / {results.total}
          </div>
          <div className="score-info">
            正确率: {Math.round((results.score / results.total) * 100)}%
          </div>
        </div>

        {results.wrongQuestions.length > 0 && (
          <div className="card">
            <h3 className="section-title">❌ 错题解析</h3>
            <div className="wrong-answers">
              {results.wrongQuestions.map((q) => (
                <div key={q.id} className="question-card">
                  <div className="question-number">第 {q.id + 1} 题</div>
                  <div className="sentence">{q.sentence.replace('_____', q.answer)}</div>
                  <div className="explanation">
                    <h4>📝 单词解析</h4>
                    <p><strong>{q.word.word}</strong> ({q.word.pos})</p>
                    <p>{q.word.definition}</p>
                    {q.word.examples.slice(1).map((ex, i) => (
                      <p key={i} style={{ fontStyle: 'italic', color: '#888' }}>
                        • {ex}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="actions">
          <button className="btn btn-primary" onClick={onReset}>
            🔄 再来一次
          </button>
        </div>
      </div>
    )
  }

  const answeredCount = Object.keys(quizState.answers).length
  const totalCount = quizState.questions.length

  return (
    <div className="quiz-container">
      <div className="progress-bar" style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontWeight: 600, color: '#666' }}>
            📝 答题进度
          </span>
          <span style={{ fontWeight: 700, color: '#667eea' }}>
            {answeredCount} / {totalCount}
          </span>
        </div>
        <div style={{
          height: '8px',
          background: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${(answeredCount / totalCount) * 100}%`,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
      
      <div className="questions-list">
        {quizState.questions.map((question) => (
          <div key={question.id} className="question-card">
            <div className="question-number">第 {question.id + 1} 题</div>
            <div
              className={`sentence`}
              onClick={() => {}}
            >
              {question.sentence.split('_____')[0] || ''}
              <span
                className={`blank ${getBlankClass(question)}`}
                onClick={() => {
                  if (showResults) return
                  setActiveBlankId(activeBlankId === question.id ? null : question.id)
                }}
              >
                {quizState.answers[question.id] || '_____'}
              </span>
              {question.sentence.split('_____')[1] || ''}
            </div>
            {!quizState.answers[question.id] && !showResults && (
              <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '8px' }}>
                💡 {activeBlankId === question.id ? '点击下方选项填空' : '点击空或选项填空'}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="section-title">📝 词汇选项</h3>
        <div className="options-container">
          {quizState.options.map((word, idx) => {
            const used = isWordUsed(word)
            const questionId = used
              ? Object.entries(quizState.answers).find(([_, w]) => w === word)?.[0] ?? null
              : null
            const questionIdNumber = questionId !== null ? Number(questionId) : null
            
            return (
            <button
              key={idx}
              className={`option-btn ${used ? 'used' : ''}`}
              onClick={() => {
                if (used && questionIdNumber !== null) {
                  onSelectAnswer(questionIdNumber, '')
                  if (activeBlankId === questionIdNumber) {
                    setActiveBlankId(null)
                  }
                } else if (!used) {
                  let targetQuestionId: number | null = null
                  
                  if (activeBlankId !== null) {
                    targetQuestionId = activeBlankId
                    const oldWord = quizState.answers[activeBlankId]
                    if (oldWord && oldWord !== word) {
                      onSelectAnswer(activeBlankId, '')
                    }
                  }
                  
                  if (targetQuestionId === null) {
                    const unanswered = quizState.questions.find(
                      q => !quizState.answers[q.id]
                    )
                    if (unanswered) {
                      targetQuestionId = unanswered.id
                    }
                  }
                  
                  if (targetQuestionId !== null) {
                    onSelectAnswer(targetQuestionId, word)
                    setActiveBlankId(null)
                  }
                }
              }}
            >
              {word}
            </button>
          )})}
        </div>
      </div>

      <div className="submit-section">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={Object.keys(quizState.answers).length < quizState.questions.length}
        >
          ✅ 提交答案
        </button>
      </div>
    </div>
  )
}

export default QuizComponent
