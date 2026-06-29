
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const rawData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/vocabulary-full.json'), 'utf8')
)

const cleanedWords = []
const units = []

const unitWordsMap = {}

rawData.words.forEach(word => {
  if (!unitWordsMap[word.unit]) {
    unitWordsMap[word.unit] = []
  }
  
  if (word.word.length > 0 && 
      !word.word.match(/^[A-Z]/) && 
      !word.word.match(/^The\s/) &&
      !word.word.match(/^He\s/) &&
      !word.word.match(/^She\s/) &&
      !word.word.match(/^I\s/) &&
      !word.word.match(/^You\s/) &&
      !word.word.match(/^We\s/) &&
      !word.word.match(/^They\s/) &&
      !word.word.match(/^There\s/) &&
      !word.word.match(/^It\s/) &&
      !word.word.match(/^Only\s/) &&
      !word.word.match(/^Many\s/) &&
      !word.word.match(/^Feeling\s/) &&
      !word.word.match(/^Before\s/) &&
      !word.word.match(/^A\s/) &&
      !word.word.match(/^This\s/) &&
      !word.word.match(/^That\s/) &&
      !word.word.match(/^Your\s/) &&
      !word.word.match(/^His\s/) &&
      !word.word.match(/^Her\s/) &&
      !word.word.match(/^Our\s/) &&
      word.word.length > 1) {
    
    let pos = word.pos
    let definition = word.definition
    
    if (!pos && definition) {
      const posMatch = definition.match(/^([a-z.\/]+)\s+(.*)$/)
      if (posMatch) {
        pos = posMatch[1]
        definition = posMatch[2]
      }
    }
    
    const examples = word.examples.filter(ex => 
      !ex.match(/^[0-9]+\)/) && 
      !ex.match(/^e\.g\./) &&
      ex.length < 200
    )
    
    const cleanedWord = {
      word: word.word,
      pos: pos || '',
      definition: definition || '',
      examples: examples.length > 0 ? examples : [word.word + ' example.'],
      unit: word.unit
    }
    
    if (cleanedWord.definition.length > 0 || cleanedWord.pos.length > 0) {
      cleanedWords.push(cleanedWord)
      unitWordsMap[word.unit].push(word.word)
    }
  }
})

rawData.units.forEach(unit => {
  if (unitWordsMap[unit.name] && unitWordsMap[unit.name].length > 0) {
    units.push({
      name: unit.name,
      words: unitWordsMap[unit.name]
    })
  }
})

console.log(`清理后统计:`)
console.log(`总单词数: ${cleanedWords.length}`)
units.forEach(unit => {
  console.log(`${unit.name}: ${unit.words.length} 个单词`)
})

const finalData = {
  words: cleanedWords,
  units
}

fs.writeFileSync(
  path.join(__dirname, '../src/data/vocabulary.json'),
  JSON.stringify(finalData, null, 2)
)

console.log(`\n已保存到 vocabulary.json`)
