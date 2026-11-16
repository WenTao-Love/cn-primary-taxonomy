/*!
 * CN-Primary-Taxonomy · 数据加载器
 * 支持多种数据加载策略：嵌入式 > 独立JS文件 > JSON fetch
 * 增强字段（AI 生成初稿）作为独立数据集按需加载，并在加载后合并进主数据。
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};

  /**
   * 解析 build.mjs 生成的 shared/data/*.js（形如 `window.__CNPT_EMBEDDED.<name> = <JSON>;`）
   * 只截取赋值号之后的 JSON 字面量，绝不执行远程脚本。
   */
  function parseEmbeddedJs(text, name) {
    const marker = `window.__CNPT_EMBEDDED.${name}`;
    const idx = text.indexOf(marker);
    if (idx === -1) return null;
    const eq = text.indexOf('=', idx);
    if (eq === -1) return null;
    const jsonText = text.slice(eq + 1).trim().replace(/;\s*$/, '');
    try {
      return JSON.parse(jsonText);
    } catch (e) {
      console.warn(`解析 ${name} 内嵌数据失败: ${e.message}`);
      return null;
    }
  }

  /**
   * 加载单个数据集
   * @param {string} name - 数据集名称 (topics/dependencies/clusters/enhanced)
   * @param {string} url - 备用JSON URL
   * @returns {Promise<object>}
   */
  function loadDataset(name, url) {
    // 策略1: window.__CNPT_EMBEDDED (内嵌到HTML中)
    if (window.__CNPT_EMBEDDED && window.__CNPT_EMBEDDED[name]) {
      return Promise.resolve(window.__CNPT_EMBEDDED[name]);
    }

    // 策略2: embedded script标签中的JSON
    const embedded = document.getElementById(`embedded-${name}`);
    if (embedded) {
      try {
        return Promise.resolve(JSON.parse(embedded.textContent));
      } catch (e) {
        console.warn(`解析 embedded-${name} 失败，尝试其他方式`);
      }
    }

    // 策略3: 从独立JS文件加载 (shared/data/)
    const scriptUrl = getScriptPath(name);
    if (scriptUrl) {
      return fetch(scriptUrl)
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.text();
        })
        .then(text => {
          const parsed = parseEmbeddedJs(text, name);
          if (parsed !== null) return parsed;
          // 兼容纯 JSON 文件
          return JSON.parse(text);
        })
        .catch(err => {
          console.warn(`${scriptUrl} 加载失败: ${err.message}，尝试JSON`);
          // 策略4: 从 data/ 目录加载原始JSON
          if (url) return fetch(url).then(r => r.json());
          throw err;
        });
    }

    // 策略4: 直接fetch JSON
    if (url) {
      return fetch(url).then(r => r.json());
    }

    return Promise.reject(new Error(`无法加载数据集: ${name}`));
  }

  /**
   * 获取数据JS文件的URL
   * 根据当前页面位置智能判断shared/目录的相对路径
   */
  function getScriptPath(name) {
    const depth = getPathDepth();
    const prefix = depth === 0 ? './shared/data/' : 
                   depth === 1 ? '../shared/data/' : '../../shared/data/';
    return `${prefix}${name}.js`;
  }

  /**
   * 计算当前页面相对于项目根目录的深度
   */
  function getPathDepth() {
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    // 如果URL以.html结尾，深度 = segments.length - 1
    if (pathname.endsWith('.html') || pathname.endsWith('.htm')) {
      return Math.max(0, segments.length - 1);
    }
    return Math.max(0, segments.length);
  }

  /**
   * 把增强字段合并进主数据（只填充缺失字段，不覆盖已有内容）
   * @param {Object} topicsObj - { version, topicCount, topics: [] }
   * @param {Object|null} enhancedObj - { enhancedTopics: [] }
   * @returns {{merged:number, total:number}}
   */
  function mergeEnhancedFields(topicsObj, enhancedObj) {
    const result = { merged: 0, total: 0 };
    if (!topicsObj || !Array.isArray(topicsObj.topics)) return result;
    if (!enhancedObj || !Array.isArray(enhancedObj.enhancedTopics)) return result;

    const byId = new Map();
    for (const e of enhancedObj.enhancedTopics) {
      if (e && typeof e.id === 'string') byId.set(e.id, e);
    }

    for (const t of topicsObj.topics) {
      const e = byId.get(t.id);
      if (!e) continue;
      let hit = false;
      if (t.oneLiner === undefined && typeof e.oneLiner === 'string') { t.oneLiner = e.oneLiner; hit = true; }
      if (t.parentGuide === undefined && e.parentGuide && typeof e.parentGuide === 'object') { t.parentGuide = e.parentGuide; hit = true; }
      if (t.teacherGuide === undefined && e.teacherGuide && typeof e.teacherGuide === 'object') { t.teacherGuide = e.teacherGuide; hit = true; }
      if (t.quizQuestions === undefined && Array.isArray(e.quizQuestions)) { t.quizQuestions = e.quizQuestions; hit = true; }
      if (hit) result.merged++;
    }
    result.total = byId.size;
    return result;
  }

  /**
   * 加载全部数据集（含增强字段）
   * @returns {Promise<{topics, dependencies, clusters, enhanced, enhancedMerge}>}
   */
  async function loadAllData() {
    const dataPaths = getDataPaths();
    const [topics, deps, clusters, enhanced] = await Promise.all([
      loadDataset('topics', dataPaths.topics),
      loadDataset('dependencies', dataPaths.dependencies),
      loadDataset('clusters', dataPaths.clusters).catch(() => ({ clusters: [] })),
      loadDataset('enhanced', dataPaths.enhanced).catch(() => null)
    ]);
    const enhancedMerge = mergeEnhancedFields(topics, enhanced);
    if (enhancedMerge.merged > 0) {
      console.info(`[CNPT] 增强字段已合并 ${enhancedMerge.merged}/${enhancedMerge.total} 条（AI 生成初稿，未经教师审核）`);
    }
    return { topics, dependencies: deps, clusters, enhanced, enhancedMerge };
  }

  /**
   * 根据当前页面位置获取JSON数据路径
   */
  function getDataPaths() {
    const depth = getPathDepth();
    const prefix = depth === 0 ? './data/' : 
                   depth === 1 ? '../data/' : '../../data/';
    return {
      topics: `${prefix}topics.json`,
      dependencies: `${prefix}dependencies.json`,
      clusters: `${prefix}clusters.json`,
      enhanced: `${prefix}topics-enhanced-fields-full.json`
    };
  }

  window.CNPT.dataLoader = {
    loadDataset,
    loadAllData,
    mergeEnhancedFields,
    getPathDepth,
    getScriptPath,
    parseEmbeddedJs
  };
})();
