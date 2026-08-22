/*!
 * CN-Primary-Taxonomy · 数据加载器
 * 支持多种数据加载策略：嵌入式 > 独立JS文件 > JSON fetch
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};

  /**
   * 加载单个数据集
   * @param {string} name - 数据集名称 (topics/dependencies/clusters)
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
          return r.json();
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
   * 加载全部三个数据集
   * @returns {Promise<{topics, dependencies, clusters}>}
   */
  async function loadAllData() {
    const dataPaths = getDataPaths();
    const [topics, deps, clusters] = await Promise.all([
      loadDataset('topics', dataPaths.topics),
      loadDataset('dependencies', dataPaths.dependencies),
      loadDataset('clusters', dataPaths.clusters).catch(() => ({ clusters: [] }))
    ]);
    return { topics, dependencies: deps, clusters };
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
      clusters: `${prefix}clusters.json`
    };
  }

  window.CNPT.dataLoader = {
    loadDataset,
    loadAllData,
    getPathDepth,
    getScriptPath
  };
})();
