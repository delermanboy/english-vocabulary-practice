import { useState } from 'react'
import { VocabularyData } from '../types'
import { useMistakes } from '../hooks'
import { shuffleArray } from '../utils'
import QuizComponent from './QuizComponent'
import { useQuiz } from '../hooks'

interface MistakesBookProps {
  vocabulary: VocabularyData
  onBack: () => void
}

function MistakesBook({ vocabulary, onBack }: MistakesBookProps) {
  const {
    mistakes,
    isLoaded,
    removeMistake,
    clearAllMistakes,
    removeWordFromMistakes
  } = useMistakes()
  
  const [isPracticeMode, setIsPracticeMode] = useState(false)
  const [sortBy, setSortBy] = useState<'time' | 'unit' | 'word'>('time')
  const {
    quizState,
    initializeQuiz,
    selectAnswer,
    resetQuiz
  } = useQuiz()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const sortedMistakes = [...mistakes].sort((a, b) => {
    if (sortBy === 'time') {
      return b.timestamp - a.timestamp
    } else if (sortBy === 'unit') {
      return a.word.unit.localeCompare(b.word.unit)
    } else {
      return a.word.word.localeCompare(b.word.word)
    }
  })

  const unitStats = mistakes.reduce((acc, mistake) => {
    const unit = mistake.word.unit
    if (!acc[unit]) acc[unit] = 0
    acc[unit]++
    return acc
  }, {} as Record<string, number>)

  const startPractice = () => {
    if (mistakes.length === 0) return
    
    const questions = mistakes.map((mistake, index) => ({
      id: index,
      sentence: mistake.sentence,
      answer: mistake.correctAnswer,
      word: mistake.word
    }))
    
    const shuffledQuestions = shuffleArray(questions)
    const allWords = vocabulary.words.map(w => w.word)
    const correctWords = mistakes.map(m => m.correctAnswer)
    const distractorWords = allWords.filter(w => !correctWords.includes(w))
    
    const numDistractors = Math.min(5, distractorWords.length)
    const selectedDistractors = shuffleArray(distractorWords).slice(0, numDistractors)
    const options = shuffleArray([...correctWords, ...selectedDistractors].flat())

    initializeQuiz(shuffledQuestions, options)
    setIsPracticeMode(true)
  }

  const exitPractice = () => {
    setIsPracticeMode(false)
    resetQuiz()
  }

  const handleQuizComplete = (questions: any[], answers: Record<number, string>) => {
    const correctAnswers = questions.filter(q => answers[q.id] === q.answer)
    correctAnswers.forEach(q => {
      removeWordFromMistakes(q.answer)
    })
  }

  if (!isLoaded) {
    return (
      <div className="container">
        <button className="btn btn-back" onClick={onBack}>
          ← 返回首页
        </button>
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>加载中...</p>
        </div>
      </div>
    )
  }

  if (isPracticeMode) {
    return (
      <div className="container">
        <button className="btn btn-back" onClick={exitPractice}>
          ← 退出练习
        </button>
        <div className="card">
          <h2 className="section-title">📝 错题重练</h2>
          <QuizComponent
            quizState={quizState}
            onSelectAnswer={selectAnswer}
            onSubmit={() => {}}
            onReset={exitPractice}
            onQuizComplete={handleQuizComplete}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
          <div>
            <h2 className="section-title" style={{ margin: 0, paddingBottom: 0, borderBottom: 'none' }}>
              📚 错题本
            </h2>
            <p style={{ color: '#666', marginTop: '8px' }}>
              当前共有 <span style={{ fontWeight: 700, color: '#667eea' }}>{mistakes.length}</span> 道错题
            </p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {mistakes.length > 0 && (
              <>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="time">⏰ 按时间排序</option>
                  <option value="unit">📚 按单元排序</option>
                  <option value="word">📝 按单词排序</option>
                </select>
                <button 
                  className="btn btn-primary"
                  onClick={startPractice}
                >
                  🎯 开始重练
                </button>
              </>
            )}
            <button 
              className="btn btn-secondary"
              onClick={clearAllMistakes}
              style={{ background: '#fff0f0', color: '#eb3349', border: 'none' }}
            >
              🗑️ 清空错题
            </button>
          </div>
        </div>

        {mistakes.length > 0 && Object.keys(unitStats).length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            marginBottom: '20px', 
            paddingBottom: '20px', 
            borderBottom: '1px solid #eee' 
          }}>
            {Object.entries(unitStats).map(([unit, count]) => (
              <div key={unit} style={{ 
                background: '#f5f5ff', 
                padding: '8px 16px', 
                borderRadius: '20px',
                fontSize: '0.9rem',
                color: '#667eea',
                fontWeight: 600
              }}>
                {unit}: {count}道
              </div>
            ))}
          </div>
        )}

        {mistakes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 30px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>太棒了！错题本是空的</h3>
            <p style={{ color: '#666' }}>继续保持！</p>
          </div>
        ) : (
          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sortedMistakes.map((mistake) => (
                <div 
                  key={mistake.id} 
                  className="question-card"
                  style={{ position: 'relative' }}
                >
                  <button
                    onClick={() => removeMistake(mistake.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      opacity: 0.5,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.5'}
                    title="删除此题"
                  >
                    ✕
                  </button>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: '12px',
                    gap: '20px'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '1.4rem', 
                        fontWeight: 700, 
                        color: '#667eea' 
                      }}>
                        {mistake.word.word}
                        <span style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 400, 
                          color: '#888',
                          marginLeft: '8px'
                        }}>
                          {mistake.word.pos}
                        </span>
                      </div>
                      <div style={{ color: '#666', marginTop: '4px' }}>
                        {mistake.word.definition}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#999',
                      textAlign: 'right',
                      flexShrink: 0
                    }}>
                      <div>{formatDate(mistake.timestamp)}</div>
                      {mistake.reviewCount > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          已复习 {mistake.reviewCount} 次
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sentence" style={{ marginBottom: '12px' }}>
                    {mistake.sentence.replace('_____', `**${mistake.correctAnswer}**`)}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center' 
                  }}>
                    {mistake.userAnswer && (
                      <div style={{ 
                        background: '#fff0f0',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        borderLeft: '3px solid #eb3349',
                        color: '#eb3349',
                        fontSize: '0.9rem'
                      }}>
                        ❌ 你的答案：{mistake.userAnswer}
                      </div>
                    )}
                    <div style={{ 
                      background: '#e8f5e9',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #38ef7d',
                      color: '#2e7d32',
                      fontSize: '0.9rem'
                    }}>
                      ✅ 正确答案：{mistake.correctAnswer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MistakesBook
