/**
 * 跨学科主题研修回归测试
 * 数据：data/themes.json（构建期注入 window.__CNPT_THEMES__）
 * 组件：shared/js/components/theme-learning.js
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
function assert(cond, name) {
  if (cond) { console.log(`  ✅ ${name}`); pass++; }
  else { console.error(`  ❌ ${name}`); fail++; }
}

const themesData = JSON.parse(readFileSync(resolve(ROOT, 'data/themes.json'), 'utf8'));
const topicsRaw = JSON.parse(readFileSync(resolve(ROOT, 'data/topics.json'), 'utf8'));
const topics = Array.isArray(topicsRaw) ? topicsRaw : (topicsRaw.topics || topicsRaw.data);
const topicSet = new Set(topics.map(t => t.id));

console.log('跨学科主题研修回归测试\n');

// 1) 数据完整性
assert(Array.isArray(themesData.themes) && themesData.themes.length === 3, '三个主题（国防/安全/意志）');
for (const th of themesData.themes) {
  assert(Array.isArray(th.topics) && th.topics.length > 0, `${th.name} 有关联知识点`);
  const missing = th.topics.filter(id => !topicSet.has(id));
  assert(missing.length === 0, `${th.name} 全部关联点存在（${th.topics.length} 个）`);
  assert(Array.isArray(th.objectives) && Array.isArray(th.activities) && Array.isArray(th.gaps), `${th.name} 含目标/活动/缺口`);
}

// 2) 组件行为（mock 环境）
global.window = {
  CNPT: {
    storage: { create: () => ({ getTopicStatus: () => 'notStarted' }) },
    indices: { getTopicMap: () => new Map(topics.map(t => [t.id, t])) },
    path: {
      topologicalSort: (ids) => {
        const byId = Object.fromEntries(topics.map(t => [t.id, t]));
        return ids.slice().sort((a, b) => (byId[a]?.difficulty || 3) - (byId[b]?.difficulty || 3));
      }
    }
  },
  __CNPT_THEMES__: themesData
};
const src = readFileSync(resolve(ROOT, 'shared/js/components/theme-learning.js'), 'utf8');
new Function('window', src)(global.window);
const engine = global.window.CNPT.themeLearning.create('student');
assert(engine && global.window.CNPT.themeLearning.VERSION === '1.0', '组件加载并暴露 create/VERSION');

const list = engine.list();
assert(list.length === 3 && list.every(t => t.total > 0), 'list() 返回 3 主题且含关联点数');
const defense = engine.getTheme('defense-education');
assert(defense && defense.name === '国防教育', 'getTheme(defense-education)');
const path = engine.buildThemePath('defense-education');
assert(path.length === defense.topics.length && path.every(p => p.id && p.name), 'buildThemePath 覆盖全部关联点且含信息');
const stats = engine.stats('national-security');
assert(stats.total === 10 && stats.mastered === 0, 'stats(national-security) = 10 个点');
assert(engine.buildThemePath('not-exist').length === 0, '未知主题返回空路径');

console.log(`\n共 ${pass + fail} 项 · 通过 ${pass} · 失败 ${fail}`);
process.exit(fail > 0 ? 1 : 0);
