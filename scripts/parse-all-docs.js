
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, '../../extracted/英语02课前测单词表整理');

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

function extractWords(content) {
  const words = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  console.log('Document lines preview:');
  lines.slice(0, 30).forEach((line, i) => {
    console.log(`${i + 1}. ${line}`);
  });
  console.log(`... total ${lines.length} lines\n`);
  
  // 尝试多种匹配模式
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 模式1: 单词 词性 释义 （例如: accomplish v. 完成；实现）
    const match1 = line.match(/^([a-zA-Z]+)\s+([a-z.\/]+)\s+(.+)$/);
    // 模式2: 只有单词和词性
    const match2 = line.match(/^([a-zA-Z]+)\s+([a-z.\/]+)$/);
    // 模式3: 行首是单词
    const match3 = line.match(/^([a-zA-Z]{3,})\s*/);
    
    if (match1) {
      words.push({
        word: match1[1],
        pos: match1[2],
        definition: match1[3],
        examples: []
      });
    } else if (match2 && words.length > 0) {
      // 如果上一行没有释义，尝试用这一行
      words[words.length - 1].pos = match2[2];
    } else if (match3 && !words.find(w => w.word === match3[1])) {
      // 新增单词
      words.push({
        word: match3[1],
        pos: '',
        definition: '',
        examples: []
      });
    } else if (words.length > 0 && line.length > 10 && !line.match(/^[a-zA-Z]+\s/)) {
      // 可能是例句
      const lastWord = words[words.length - 1];
      if (lastWord.examples.length < 3) {
        lastWord.examples.push(line);
      }
    }
  }
  
  return words;
}

async function main() {
  console.log('=== 分析Word文档内容 ===\n');
  
  const allWords = [];
  const units = [];
  
  for (const [fileName, unitName] of Object.entries(unitMap)) {
    const filePath = path.join(docsDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`文件不存在: ${filePath}`);
      continue;
    }
    
    console.log(`\n========== ${fileName} (${unitName}) ==========`);
    const content = await parseDocx(filePath);
    const unitWords = extractWords(content);
    
    console.log(`\n识别到 ${unitWords.length} 个单词:`);
    unitWords.forEach((w, i) => {
      console.log(`${i + 1}. ${w.word} ${w.pos} - ${w.definition}`);
      if (w.examples.length > 0) {
        console.log(`   例句: ${w.examples[0]}`);
      }
    });
    
    unitWords.forEach(w => w.unit = unitName);
    allWords.push(...unitWords);
    units.push({
      name: unitName,
      words: unitWords.map(w => w.word)
    });
  }
  
  console.log(`\n\n=== 总计 ===`);
  console.log(`总单元数: ${units.length}`);
  console.log(`总单词数: ${allWords.length}`);
  units.forEach(u => {
    console.log(`${u.name}: ${u.words.length} 个词`);
  });
  
  // 保存结果
  const outputPath = path.join(__dirname, '../src/data/vocabulary-full.json');
  fs.writeFileSync(outputPath, JSON.stringify({ words: allWords, units }, null, 2));
  console.log(`\n完整数据已保存到: ${outputPath}`);
}

main().catch(console.error);

