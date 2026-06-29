import { useState, useMemo } from 'react'
import './App.css'
import HomePage from './components/HomePage'
import UnitPractice from './components/UnitPractice'
import MixedPractice from './components/MixedPractice'
import SimulationPractice from './components/SimulationPractice'
import MistakesBook from './components/MistakesBook'
import { PracticeMode, VocabularyData } from './types'
import vocabularyData from './data/vocabulary.json'
import { useMistakes } from './hooks'

type AppMode = PracticeMode | null

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>(null)
  const { addMistakes } = useMistakes()

  const goHome = () => setCurrentMode(null)

  // 确保词汇数据结构完整
  const completeVocabularyData = useMemo((): VocabularyData => {
    // 从单词中提取所有单元
    const unitNames = [...new Set(vocabularyData.words.map((word: any) => word.unit))]
    
    // 构建完整的 units 数组
    const units = unitNames.map(unitName => ({
      name: unitName,
      words: vocabularyData.words
        .filter((word: any) => word.unit === unitName)
        .map((word: any) => word.word)
    }))

    return {
      words: vocabularyData.words,
      units
    }
  }, [])

  return (
    <div className="app">
      {!currentMode && (
        <HomePage
          vocabulary={completeVocabularyData}
          onSelectMode={setCurrentMode}
        />
      )}
      {currentMode === 'unit' && (
        <UnitPractice
          vocabulary={completeVocabularyData}
          onBack={goHome}
          onQuizComplete={addMistakes}
        />
      )}
      {currentMode === 'mixed' && (
        <MixedPractice
          vocabulary={completeVocabularyData}
          onBack={goHome}
          onQuizComplete={addMistakes}
        />
      )}
      {currentMode === 'simulation' && (
        <SimulationPractice
          vocabulary={completeVocabularyData}
          onBack={goHome}
          onQuizComplete={addMistakes}
        />
      )}
      {currentMode === 'mistakes' && (
        <MistakesBook
          vocabulary={completeVocabularyData}
          onBack={goHome}
        />
      )}
    </div>
  )
}

export default App
