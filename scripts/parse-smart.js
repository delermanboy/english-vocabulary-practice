
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

function extractWordsSmart(content, unitName) {
  const words = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  // 先打印前50行来看结构
  console.log(`\n=== ${unitName} 文档预览 (前50行) ===`);
  lines.slice(0, 50).forEach((line, i) => {
    console.log(`${String(i + 1).padStart(2, '0')}. ${line}`);
  });
  
  let i = 0;
  while (i < lines.length) {
    let line = lines[i].trim();
    
    // 跳过空行和 "e.g." 开头的例句
    if (!line || line.startsWith('e.g.') || line.startsWith('例如：') || line.match(/^[\u4e00-\u9fa5]/)) {
      i++;
      continue;
    }
    
    // 模式1: 单词 词性: 释义 （包含冒号）
    let match = line.match(/^([a-zA-Z][a-zA-Z0-9\s\-]*?)\s+([a-z.\/]+):\s*(.+)$/);
    if (!match) {
      // 模式2: 单词 词性 释义 （没有冒号）
      match = line.match(/^([a-zA-Z][a-zA-Z0-9\s\-]*?)\s+([a-z.\/]+)\s+(.+)$/);
    }
    if (!match) {
      // 模式3: 单词短语 （如 in a row）
      match = line.match(/^([a-z][a-z\s]+?):\s*(.+)$/);
    }
    
    if (match) {
      const word = match[1].trim();
      let pos = match.length > 3 ? match[2] : '';
      let definition = match.length > 3 ? match[3] : match[2];
      
      // 如果词性看起来像释义，可能是模式3（短语）
      if (pos && pos.match(/[\u4e00-\u9fa5]/)) {
        definition = pos + (definition ? ' ' + definition : '');
        pos = '';
      }
      
      const wordEntry = {
        word,
        pos,
        definition,
        examples: [],
        unit: unitName
      };
      
      // 收集下面的例句
      i++;
      while (i < lines.length) {
        const exampleLine = lines[i].trim();
        if (!exampleLine) {
          i++;
          continue;
        }
        // 如果下一行看起来像新单词，停止
        if (exampleLine.match(/^[a-zA-Z][a-zA-Z0-9\s\-]*?\s+[a-z.\/]+/) || 
            exampleLine.match(/^[a-z][a-z\s]+?:/)) {
          break;
        }
        // 收集例句（英文或中文）
        wordEntry.examples.push(exampleLine);
        i++;
      }
      
      words.push(wordEntry);
    } else {
      i++;
    }
  }
  
  return words;
}

async function main() {
  console.log('=== 智能解析Word文档 ===\n');
  
  const allWords = [];
  const units = [];
  
  for (const [fileName, unitName] of Object.entries(unitMap)) {
    const filePath = path.join(docsDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`文件不存在: ${filePath}`);
      continue;
    }
    
    console.log(`\n========== 解析 ${fileName} (${unitName}) ==========`);
    const content = await parseDocx(filePath);
    const unitWords = extractWordsSmart(content, unitName);
    
    console.log(`\n✅ ${unitName}: 识别到 ${unitWords.length} 个单词`);
    unitWords.slice(0, 10).forEach((w, i) => {
      console.log(`  ${i + 1}. ${w.word} ${w.pos} - ${w.definition.substring(0, 50)}...`);
    });
    if (unitWords.length > 10) {
      console.log(`  ... 还有 ${unitWords.length - 10} 个`);
    }
    
    allWords.push(...unitWords);
    units.push({
      name: unitName,
      words: unitWords.map(w => w.word)
    });
  }
  
  console.log(`\n\n========== 最终统计 ==========`);
  console.log(`总单元数: ${units.length}`);
  console.log(`总单词数: ${allWords.length}`);
  units.forEach(u => {
    console.log(`${u.name}: ${u.words.length} 个词`);
  });
  
  // 保存完整数据
  const outputPath = path.join(__dirname, '../src/data/vocabulary-full.json');
  fs.writeFileSync(outputPath, JSON.stringify({ words: allWords, units }, null, 2));
  console.log(`\n✅ 完整数据已保存到: ${outputPath}`);
  
  // 同时保存到 vocabulary.json（替换旧的）
  fs.copyFileSync(outputPath, path.join(__dirname, '../src/data/vocabulary.json'));
  console.log('✅ 已更新 vocabulary.json');
}

main().catch(console.error);

