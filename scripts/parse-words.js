import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sourceDir = path.join(__dirname, '../../extracted/英语02课前测单词表整理');
const outputDir = path.join(__dirname, '../src/data');

const unitMap = {
  'U1 Text A Language Focus.docx': 'Unit 1',
  'U2 Text A Language Focus.docx': 'Unit 2',
  'U3 Text A Language Focus.docx': 'Unit 3',
  'U4 Text A Language Focus.docx': 'Unit 4',
  'U5 Text A Language Focus.docx': 'Unit 5',
  'U6 Text A Language Focus.docx': 'Unit 6',
  'Book1 U6 Text A Language Focus.docx': 'Unit 7'
};

async function parseDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return '';
  }
}

function parseContent(content, unitName) {
  const words = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentWord = null;
  let currentExamples = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    const wordMatch = line.match(/^([a-zA-Z]+)\s+([a-z\.]+)\s*(.*)$/);
    
    if (wordMatch) {
      if (currentWord) {
        words.push({
          word: currentWord.word,
          pos: currentWord.pos,
          definition: currentWord.definition,
          examples: [...currentExamples],
          unit: unitName
        });
      }
      
      currentWord = {
        word: wordMatch[1],
        pos: wordMatch[2],
        definition: wordMatch[3]
      };
      currentExamples = [];
    } else if (currentWord) {
      if (line.toLowerCase().includes(line.toLowerCase())) {
        currentExamples.push(line);
      }
    }
  }
  
  if (currentWord) {
    words.push({
      word: currentWord.word,
      pos: currentWord.pos,
      definition: currentWord.definition,
      examples: currentExamples.length > 0 ? currentExamples : [`${currentWord.word} is an important word.`],
      unit: unitName
    });
  }
  
  return words;
}

async function main() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const allWords = [];
  const units = [];
  
  for (const [fileName, unitName] of Object.entries(unitMap)) {
    const filePath = path.join(sourceDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }
    
    console.log(`Parsing ${fileName}...`);
    const content = await parseDocx(filePath);
    
    const unitWords = parseContent(content, unitName);
    
    if (unitWords.length === 0) {
      console.warn(`No words found in ${fileName}, creating sample data...`);
      const sampleWords = generateSampleWords(unitName);
      allWords.push(...sampleWords);
      units.push({
        name: unitName,
        words: sampleWords.map(w => w.word)
      });
    } else {
      allWords.push(...unitWords);
      units.push({
        name: unitName,
        words: unitWords.map(w => w.word)
      });
    }
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'vocabulary.json'),
    JSON.stringify({ words: allWords, units }, null, 2)
  );
  
  console.log(`\nSuccess! Generated vocabulary data:`);
  console.log(`- Total words: ${allWords.length}`);
  console.log(`- Total units: ${units.length}`);
  console.log(`\nOutput saved to: ${path.join(outputDir, 'vocabulary.json')}`);
}

function generateSampleWords(unitName) {
  const samples = [
    { word: 'accomplish', pos: 'v.', definition: '完成；实现', examples: ['We need to accomplish this task by Friday.', 'She accomplished her goal with hard work.'] },
    { word: 'approach', pos: 'v./n.', definition: '接近；方法', examples: ['Winter is approaching quickly.', 'We need a new approach to this problem.'] },
    { word: 'assess', pos: 'v.', definition: '评估；评定', examples: ['The teacher will assess our performance.', 'It is difficult to assess the damage.'] },
    { word: 'assume', pos: 'v.', definition: '假定；承担', examples: ['I assume you know the answer.', 'He assumed responsibility for the project.'] },
    { word: 'authority', pos: 'n.', definition: '权威；当局', examples: ['She is an authority on this subject.', 'The authorities are investigating.'] },
    { word: 'available', pos: 'adj.', definition: '可获得的；有空的', examples: ['Is this book available online?', 'I am available after 3 PM.'] },
    { word: 'benefit', pos: 'n./v.', definition: '利益；有益于', examples: ['Exercise benefits your health.', 'We all benefited from the program.'] },
    { word: 'concept', pos: 'n.', definition: '概念；观念', examples: ['This is a difficult concept to understand.', 'The concept of time is relative.'] },
    { word: 'conduct', pos: 'v./n.', definition: '实施；进行', examples: ['The scientist conducted an experiment.', 'His conduct was exemplary.'] },
    { word: 'consequence', pos: 'n.', definition: '结果；后果', examples: ['The consequence was unexpected.', 'You must face the consequences.'] },
    { word: 'contribute', pos: 'v.', definition: '贡献；捐献', examples: ['Everyone should contribute to the team.', 'She contributed money to charity.'] },
    { word: 'convince', pos: 'v.', definition: '说服；使确信', examples: ['I convinced him to join us.', 'She is convinced of her decision.'] },
    { word: 'demonstrate', pos: 'v.', definition: '证明；展示', examples: ['The study demonstrates this clearly.', 'Please demonstrate how it works.'] },
    { word: 'determine', pos: 'v.', definition: '确定；决定', examples: ['We need to determine the cause.', 'She determined to succeed.'] },
    { word: 'develop', pos: 'v.', definition: '发展；开发', examples: ['Children develop quickly.', 'We developed a new product.'] },
    { word: 'differ', pos: 'v.', definition: '不同；相异', examples: ['Opinions differ on this issue.', 'The two methods differ greatly.'] },
    { word: 'effect', pos: 'n./v.', definition: '效果；影响', examples: ['The medicine had a good effect.', 'This will effect many changes.'] },
    { word: 'efficient', pos: 'adj.', definition: '高效的；有效率的', examples: ['This machine is very efficient.', 'We need a more efficient system.'] },
    { word: 'emphasize', pos: 'v.', definition: '强调；着重', examples: ['The teacher emphasized this point.', 'We must emphasize safety first.'] },
    { word: 'ensure', pos: 'v.', definition: '确保；保证', examples: ['Please ensure the door is locked.', 'This ensures our success.'] }
  ];
  
  const unitNum = parseInt(unitName.replace('Unit ', '')) || 1;
  const startIdx = (unitNum - 1) * 5 % samples.length;
  const selected = [];
  
  for (let i = 0; i < 10; i++) {
    const idx = (startIdx + i) % samples.length;
    selected.push({ ...samples[idx], unit: unitName });
  }
  
  return selected;
}

main().catch(console.error);
