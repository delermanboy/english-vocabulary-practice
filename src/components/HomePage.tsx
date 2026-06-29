import { VocabularyData, PracticeMode } from '../types'
import { useMistakes } from '../hooks'

interface HomePageProps {
  vocabulary: VocabularyData
  onSelectMode: (mode: PracticeMode) => void
}

function HomePage({ vocabulary, onSelectMode }: HomePageProps) {
  const { mistakes } = useMistakes()
  
  const modes = [
    {
      mode: 'unit' as PracticeMode,
      title: '📚 单元练习',
      description: '选择特定单元，专注练习该单元的所有单词。每个单元有独立的词汇池供选择。'
    },
    {
      mode: 'mixed' as PracticeMode,
      title: '🔀 混合练习',
      description: '自由选择多个单元，将它们的单词合并到一起练习，适合综合复习。'
    },
    {
      mode: 'simulation' as PracticeMode,
      title: '🎯 模拟测试',
      description: '标准化测试模式：15道题目 + 5个干扰词汇，完全模拟真实考试体验。'
    },
    {
      mode: 'mistakes' as PracticeMode,
      title: `📝 错题本 ${mistakes.length > 0 ? `(${mistakes.length})` : ''}`,
      description: '查看错题记录并进行针对性复习，将答错的单词彻底掌握！'
    }
  ]

  return (
    <div className="container">
      <header className="header">
        <h1>📖 英语单词复习系统</h1>
        <p>掌握核心词汇，提升英语能力</p>
        <p style={{ fontSize: '1rem', marginTop: '10px', opacity: 0.8 }}>
          共 {vocabulary.units.length} 个单元，{vocabulary.words.length} 个单词
        </p>
      </header>

      <div className="card">
        <h2 className="section-title">选择练习模式</h2>
        <div className="mode-grid">
          {modes.map(({ mode, title, description }) => (
            <div
              key={mode}
              className="mode-card"
              onClick={() => onSelectMode(mode)}
            >
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
