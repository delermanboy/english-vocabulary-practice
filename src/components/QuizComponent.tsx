import { useState, useEffect, useRef, useCallback } from 'react'
import { Question } from '../types'
import { calculateScore } from '../utils'
import { ExtendedQuizState } from '../hooks/useQuiz'

interface QuizComponentProps {
  quizState: ExtendedQuizState
  onSelectAnswer: (questionId: number, word: string) => void
  onSubmit: () => void
  onReset: () => void
  onQuizComplete?: (questions: Question[], answers: Record<number, string>) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return isMobile
}

function QuizComponent({
  quizState,
  onSelectAnswer,
  onReset,
  onQuizComplete
}: QuizComponentProps) {
  const isMobile = useIsMobile()
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<{
    score: number
    total: number
    wrongQuestions: Question[]
    timeSpent: number
  } | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  // Local current index for navigation (independent from parent state)
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentQuestion = quizState.questions[currentIndex]
  const totalCount = quizState.questions.length
  const answeredCount = Object.keys(quizState.answers).length

  // Reset current index when questions change
  useEffect(() => {
    setCurrentIndex(0)
    setElapsed(0)
    startTimeRef.current = Date.now()
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [quizState.questions])

  const goToNext = () => setCurrentIndex(i => Math.min(i + 1, totalCount - 1))
  const goToPrev = () => setCurrentIndex(i => Math.max(i - 1, 0))

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const scoreResult = calculateScore(quizState.questions, quizState.answers)
    setResults({ ...scoreResult, timeSpent: elapsed })
    setShowResults(true)

    if (onQuizComplete) {
      onQuizComplete(quizState.questions, quizState.answers)
    }
  }

  const handleOptionClick = useCallback((word: string) => {
    if (!currentQuestion || showResults) return
    onSelectAnswer(currentQuestion.id, word)

    // Auto advance to next unanswered question after a short delay
    setTimeout(() => {
      for (let i = currentIndex + 1; i < quizState.questions.length; i++) {
        if (!quizState.answers[quizState.questions[i].id]) {
          setCurrentIndex(i)
          return
        }
      }
      for (let i = 0; i < currentIndex; i++) {
        if (!quizState.answers[quizState.questions[i].id]) {
          setCurrentIndex(i)
          return
        }
      }
    }, 400)
  }, [currentQuestion, showResults, currentIndex, quizState, onSelectAnswer])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResults) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onReset()
          setShowResults(false)
          setResults(null)
          setCurrentIndex(0)
        }
        return
      }

      const num = parseInt(e.key)
      if (!isNaN(num) && num >= 1 && num <= quizState.options.length) {
        const word = quizState.options[num - 1]
        if (word && currentQuestion) {
          handleOptionClick(word)
        }
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (answeredCount === totalCount) {
          handleSubmit()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [quizState, showResults, currentQuestion, answeredCount, totalCount, handleOptionClick, onReset])

  if (showResults && results) {
    const accuracy = Math.round((results.score / results.total) * 100)
    let gradeEmoji = '🎉'
    let gradeText = '太棒了！'
    if (accuracy < 60) { gradeEmoji = '💪'; gradeText = '继续加油！'; }
    else if (accuracy < 80) { gradeEmoji = '👍'; gradeText = '做得不错！'; }
    else if (accuracy < 100) { gradeEmoji = '🌟'; gradeText = '非常出色！'; }

    return (
      <div className="quiz-container">
        <div className="results-card">
          <h2>{gradeEmoji} {gradeText}</h2>
          <div className="score-display">
            {results.score} / {results.total}
          </div>
          <div className="score-info">
            正确率: {accuracy}% &nbsp;|&nbsp; 用时: {formatTime(results.timeSpent)}
          </div>
        </div>

        {results.wrongQuestions.length > 0 && (
          <div className="card">
            <h3 className="section-title">❌ 错题解析 ({results.wrongQuestions.length} 道)</h3>
            <div className="wrong-answers">
              {results.wrongQuestions.map((q) => (
                <div key={q.id} className="question-card">
                  <div className="question-number">第 {q.id + 1} 题</div>
                  <div className="sentence">{q.sentence.replace('_____', q.answer)}</div>
                  <div className="explanation">
                    <h4>📝 单词解析</h4>
                    <p><strong>{q.word.word}</strong> ({q.word.pos})</p>
                    <p>{q.word.definition}</p>
                    {q.word.examples.slice(0, 3).map((ex, i) => (
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
          <button className="btn btn-primary" onClick={() => { onReset(); setShowResults(false); setResults(null); setCurrentIndex(0); }}>
            🔄 再来一次
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  const currentAnswer = quizState.answers[currentQuestion.id]

  return (
    <div className="quiz-container">
      {/* Top bar: progress + timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontWeight: 600, color: '#667eea', fontSize: '0.95rem' }}>
          ⏱️ {formatTime(elapsed)}
        </span>
        <span style={{ fontWeight: 600, color: '#666', fontSize: '0.95rem' }}>
          {answeredCount}/{totalCount} 已答
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{
          height: '100%',
          width: `${(answeredCount / totalCount) * 100}%`,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Question navigator dots */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: isMobile ? '4px' : '6px',
        marginBottom: isMobile ? '12px' : '20px',
        justifyContent: 'center'
      }}>
        {quizState.questions.map((q, idx) => {
          const isAnswered = !!quizState.answers[q.id]
          const isCurrent = idx === currentIndex
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '28px' : '32px',
                borderRadius: '50%',
                border: 'none',
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: isCurrent
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : isAnswered
                    ? '#38ef7d'
                    : '#e0e0e0',
                color: isCurrent ? 'white' : isAnswered ? '#0d5c3b' : '#666',
                boxShadow: isCurrent ? '0 2px 8px rgba(102,126,234,0.4)' : 'none'
              }}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      {/* Current question */}
      <div className="question-card" style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '8px' : '12px' }}>
          <span className="question-number">第 {currentIndex + 1} / {totalCount} 题</span>
          {currentAnswer && (
            <span style={{ color: '#11998e', fontWeight: 600, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>✓ 已作答</span>
          )}
        </div>
        <div className="sentence" style={{ fontSize: isMobile ? '1.05rem' : '1.4rem', lineHeight: isMobile ? 1.6 : 2 }}>
          {(() => {
            const parts = currentQuestion.sentence.split('_____')
            return (
              <>
                {parts[0] || ''}
                <span className={`blank ${currentAnswer ? 'filled' : ''}`} style={{ fontSize: isMobile ? '0.95rem' : '1.2rem' }}>
                  {currentAnswer || '_____'}
                </span>
                {parts[1] || ''}
              </>
            )
          })()}
        </div>
      </div>

      {/* Options with POS hint and usage state */}
      <div className="card" style={{ marginBottom: isMobile ? '12px' : '20px', padding: isMobile ? '12px' : undefined }}>
        <h3 className="section-title" style={{ fontSize: isMobile ? '1rem' : '1.1rem', marginBottom: isMobile ? '10px' : '16px' }}>
          📝 选择正确答案 {!isMobile && <span style={{ fontWeight: 400, color: '#888', fontSize: '0.85rem' }}>(按数字键 1-{Math.min(quizState.options.length, 9)} 快速选择)</span>}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: isMobile ? '6px' : '10px'
        }}>
          {quizState.options.map((word, idx) => {
            // Find the word object to get POS
            const wordObj = quizState.questions.find(q => q.answer === word)?.word
            const pos = wordObj?.pos || ''
            const isSelected = currentAnswer === word
            const usedByQuestionId = quizState.usedOptions[word]
            const isUsedByOther = usedByQuestionId !== null && usedByQuestionId !== undefined && usedByQuestionId !== currentQuestion.id

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(word)}
                style={{
                  padding: isMobile ? '10px 12px' : '14px 16px',
                  border: isSelected ? '2px solid #667eea' : isUsedByOther ? '2px solid #e0e0e0' : '2px solid #e0e0e0',
                  borderRadius: isMobile ? '10px' : '12px',
                  background: isSelected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : isUsedByOther ? '#f5f5f5' : 'white',
                  color: isSelected ? 'white' : isUsedByOther ? '#999' : '#333',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '8px' : '10px',
                  opacity: isUsedByOther ? 0.7 : 1,
                  boxShadow: isSelected ? '0 4px 12px rgba(102,126,234,0.3)' : 'none',
                  position: 'relative'
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isMobile ? '20px' : '24px',
                  height: isMobile ? '20px' : '24px',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(255,255,255,0.2)' : isUsedByOther ? '#e0e0e0' : '#f0f0f0',
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {idx + 1}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: isMobile ? '0.9rem' : '1rem', wordBreak: 'break-word' }}>{word}</div>
                  {pos && (
                    <div style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', opacity: isSelected ? 0.8 : isUsedByOther ? 0.5 : 0.5, marginTop: '2px' }}>
                      {pos}
                    </div>
                  )}
                </div>
                {isUsedByOther && (
                  <span style={{
                    fontSize: '0.65rem',
                    background: '#ddd',
                    color: '#666',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    已用
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation + Submit */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn btn-secondary"
          onClick={goToPrev}
          disabled={currentIndex === 0}
        >
          ← 上一题
        </button>

        {answeredCount === totalCount ? (
          <button className="btn btn-primary" onClick={handleSubmit} style={{ flex: 1, justifyContent: 'center' }}>
            ✅ 提交答案
          </button>
        ) : (
          <div style={{ flex: 1, textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
            还剩 {totalCount - answeredCount} 道题
          </div>
        )}

        <button
          className="btn btn-secondary"
          onClick={goToNext}
          disabled={currentIndex === totalCount - 1}
        >
          下一题 →
        </button>
      </div>
    </div>
  )
}

export default QuizComponent
