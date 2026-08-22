/**
 * add-evaluation-criteria.mjs
 * 为非英语学科添加通用评价方案字段（evaluationCriteria）
 * 英语学科已有skillRubric四技能量表，不需要此字段
 * 使用方法: node scripts/add-evaluation-criteria.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOPICS_PATH = resolve(ROOT, 'data/topics.json');

// 按学科生成通用评价方案
function generateEvaluationCriteria(subject, subnodeType) {
  const templates = {
    '数学': {
      levels: [
        { level: '了解', desc: '能说出相关概念和定义，辨认基本特征' },
        { level: '理解', desc: '能用自己的话解释原理，建立新旧知识联系' },
        { level: '掌握', desc: '能独立正确解题，过程规范、结果准确' },
        { level: '应用', desc: '能灵活运用所学解决综合问题和实际情境' }
      ]
    },
    '语文': {
      levels: [
        { level: '了解', desc: '能正确朗读/背诵，识别关键信息' },
        { level: '理解', desc: '能说出主要内容和表达的思想感情' },
        { level: '掌握', desc: '能运用所学完成书面和口头表达' },
        { level: '应用', desc: '能在新情境中综合运用多种语文能力' }
      ]
    },
    '科学': {
      levels: [
        { level: '了解', desc: '能说出生活中的相关现象和基本概念' },
        { level: '理解', desc: '能用科学语言描述现象，解释简单原理' },
        { level: '掌握', desc: '能设计简单实验，规范操作并得出结论' },
        { level: '应用', desc: '能运用所学解释实际问题，提出合理猜想' }
      ]
    },
    '道德与法治': {
      levels: [
        { level: '了解', desc: '知道基本的道德规范和行为准则' },
        { level: '理解', desc: '能理解规范的道理和对他人的意义' },
        { level: '掌握', desc: '能在日常行为中践行规范，做出正确选择' },
        { level: '应用', desc: '能在复杂情境中判断是非，说服和帮助他人' }
      ]
    },
    '劳动': {
      levels: [
        { level: '了解', desc: '知道劳动工具的使用方法和安全常识' },
        { level: '理解', desc: '理解劳动过程和成果的价值' },
        { level: '掌握', desc: '能规范完成劳动任务，保证质量' },
        { level: '应用', desc: '能创造性解决劳动中的问题，热爱劳动' }
      ]
    },
    '体育与健康': {
      levels: [
        { level: '了解', desc: '知道动作名称和基本规则' },
        { level: '理解', desc: '理解动作要领和健康知识' },
        { level: '掌握', desc: '能规范完成动作，达到基本要求' },
        { level: '应用', desc: '能在运动/生活中灵活运用，锻炼成为习惯' }
      ]
    },
    '美术': {
      levels: [
        { level: '了解', desc: '能识别美术元素和常见艺术形式' },
        { level: '理解', desc: '能表达自己对作品的感受，理解创作意图' },
        { level: '掌握', desc: '能运用所学技法完成创作' },
        { level: '应用', desc: '能综合运用多种材料和方法表达创意' }
      ]
    },
    '音乐': {
      levels: [
        { level: '了解', desc: '能识别音乐要素和常见乐器' },
        { level: '理解', desc: '能感受音乐情绪，理解歌曲/乐曲表达' },
        { level: '掌握', desc: '能准确演唱/演奏，节奏音准基本正确' },
        { level: '应用', desc: '能自信表演，创造性地表现音乐情感' }
      ]
    },
    '信息科技': {
      levels: [
        { level: '了解', desc: '知道信息设备的基本功能和操作界面' },
        { level: '理解', desc: '理解基本的信息技术和数字概念' },
        { level: '掌握', desc: '能独立完成基本操作和简单作品' },
        { level: '应用', desc: '能综合运用技术解决实际问题，安全使用' }
      ]
    },
    'AI素养': {
      levels: [
        { level: '了解', desc: '知道AI是什么，能举出生活中的AI例子' },
        { level: '理解', desc: '理解AI的基本工作原理（数据→训练→预测）' },
        { level: '掌握', desc: '能使用AI工具完成简单任务' },
        { level: '应用', desc: '能评价AI输出质量，批判性思考AI的局限' }
      ]
    }
  };

  return templates[subject] || templates['数学'];
}

console.log('📝 开始为非英语学科添加通用评价方案...\n');

// 读取数据
const data = JSON.parse(readFileSync(TOPICS_PATH, 'utf8'));
const topics = data.topics;

let filled = 0;
let skipped = 0;

topics.forEach(topic => {
  // 英语学科已有skillRubric，跳过
  if (topic.subject === '英语') {
    skipped++;
    return;
  }
  
  // 已有评价方案的跳过
  if (topic.evaluationCriteria) {
    skipped++;
    return;
  }
  
  topic.evaluationCriteria = generateEvaluationCriteria(topic.subject, topic.subnodeType || null);
  filled++;
});

// 更新时间戳
data.generatedAt = new Date().toISOString();
data.note = (data.note || '') + ' · 已为非英语学科添加evaluationCriteria通用评价方案字段';

// 写回文件
writeFileSync(TOPICS_PATH, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ 评价方案补全完成！`);
console.log(`   - 已添加: ${filled} 个知识点`);
console.log(`   - 已跳过(英语/已有): ${skipped} 个知识点`);
console.log(`   - 总计: ${topics.length} 个知识点`);
console.log(`\n📁 输出: ${TOPICS_PATH}`);
console.log(`\n💡 现有字段覆盖情况:`);
console.log(`   - skillRubric(英语四技能量表): 仅英语学科`);
console.log(`   - evaluationCriteria(通用评价方案): 全部非英语学科`);
