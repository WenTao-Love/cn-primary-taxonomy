/**
 * CN-Primary-Taxonomy · 跨学科主题研修（共享组件）
 * 主题：国防教育 / 国家安全 / 挫折与意志
 * 数据：data/themes.json → 构建期注入 window.__CNPT_THEMES__
 * 用法：window.CNPT.themeLearning.create('student'|'parent'|...)
 * 说明：只挂接现有关键词（不新增知识点），复用 path.topologicalSort 与 storage 掌握状态。
 */
(function () {
  if (!window.CNPT) return;
  const DATA = window.__CNPT_THEMES__ || { themes: [] };

  class ThemeLearning {
    constructor(role) {
      this.role = role || 'student';
      this.storage = window.CNPT.storage.create(this.role);
    }

    getThemes() {
      return DATA.themes || [];
    }

    getTheme(id) {
      return this.getThemes().find(t => t.id === id) || null;
    }

    /** 主题关联知识点（含掌握状态） */
    topicsOf(theme) {
      const map = window.CNPT.indices.getTopicMap ? window.CNPT.indices.getTopicMap() : {};
      return (theme.topics || []).map(id => {
        const t = map.get ? map.get(id) : map[id];
        if (!t) return null;
        return {
          id,
          name: t.name,
          subject: t.subject,
          grade: t.grade,
          difficulty: t.difficulty || 3,
          status: this.storage.getTopicStatus(id)
        };
      }).filter(Boolean);
    }

    /** 主题内学习顺序（拓扑排序，跨学科无依赖时按难度由易到难） */
    buildThemePath(themeId) {
      const theme = this.getTheme(themeId);
      if (!theme) return [];
      const sortedIds = window.CNPT.path.topologicalSort(theme.topics.slice());
      const info = this.topicsOf(theme);
      const byId = {};
      info.forEach(t => { byId[t.id] = t; });
      return sortedIds.map(id => byId[id]).filter(Boolean);
    }

    stats(themeId) {
      const theme = this.getTheme(themeId);
      if (!theme) return { total: 0, mastered: 0, learning: 0, notStarted: 0 };
      const ts = this.topicsOf(theme);
      const by = s => ts.filter(t => t.status === s).length;
      const mastered = by('mastered');
      const learning = by('learning');
      return {
        total: ts.length,
        mastered,
        learning,
        notStarted: ts.length - mastered - learning
      };
    }

    /** 列表页用：主题 + 关联点数 + 掌握率 */
    list() {
      return this.getThemes().map(t => {
        const s = this.stats(t.id);
        return {
          id: t.id,
          name: t.name,
          icon: t.icon,
          intro: t.intro,
          total: s.total,
          mastered: s.mastered,
          percent: s.total ? Math.round(s.mastered / s.total * 100) : 0
        };
      });
    }
  }

  function create(role) {
    return new ThemeLearning(role);
  }

  window.CNPT.themeLearning = { create, VERSION: '1.0' };
})();
