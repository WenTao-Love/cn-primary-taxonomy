/*!
 * CN-Primary-Taxonomy · 诗词飞花令 / 随机抽诗共享组件
 * 借鉴《免费查诗：近 40 万首古诗自己搭一座诗库》（诗泉 / chinese-poetry）：
 *   按标题/作者/全文检索、按作者/体裁随机抽诗、飞花令（按字检索诗句）。
 * 数据说明：内置 40 首课标常见古诗词（公版文本，仅作示例库）；
 *   完整近 40 万首诗库可参考开源项目 chinese-poetry / 诗泉（poetry.palemoky.com）。
 * 使用方式：
 *   CNPT.components.poetry.renderTool(document.getElementById('app'));
 *   CNPT.components.poetry.feihualing('春');
 *   CNPT.components.poetry.random({ author: '李白' });
 */
(function() {
  'use strict';

  window.CNPT = window.CNPT || {};
  window.CNPT.components = window.CNPT.components || {};

  // 课标常见古诗词示例库（公版文本）
  const POEMS = [
    { title: '静夜思', author: '李白', dynasty: '唐', tags: ['思乡', '写景'], lines: ['床前明月光，疑是地上霜。', '举头望明月，低头思故乡。'] },
    { title: '春晓', author: '孟浩然', dynasty: '唐', tags: ['写景', '春天'], lines: ['春眠不觉晓，处处闻啼鸟。', '夜来风雨声，花落知多少。'] },
    { title: '咏鹅', author: '骆宾王', dynasty: '唐', tags: ['咏物', '动物'], lines: ['鹅，鹅，鹅，曲项向天歌。', '白毛浮绿水，红掌拨清波。'] },
    { title: '悯农（其二）', author: '李绅', dynasty: '唐', tags: ['田园', '惜粮'], lines: ['锄禾日当午，汗滴禾下土。', '谁知盘中餐，粒粒皆辛苦。'] },
    { title: '登鹳雀楼', author: '王之涣', dynasty: '唐', tags: ['励志', '写景'], lines: ['白日依山尽，黄河入海流。', '欲穷千里目，更上一层楼。'] },
    { title: '望庐山瀑布', author: '李白', dynasty: '唐', tags: ['写景', '山水'], lines: ['日照香炉生紫烟，遥看瀑布挂前川。', '飞流直下三千尺，疑是银河落九天。'] },
    { title: '绝句', author: '杜甫', dynasty: '唐', tags: ['写景', '春天'], lines: ['两个黄鹂鸣翠柳，一行白鹭上青天。', '窗含西岭千秋雪，门泊东吴万里船。'] },
    { title: '山行', author: '杜牧', dynasty: '唐', tags: ['写景', '秋天'], lines: ['远上寒山石径斜，白云生处有人家。', '停车坐爱枫林晚，霜叶红于二月花。'] },
    { title: '回乡偶书', author: '贺知章', dynasty: '唐', tags: ['思乡'], lines: ['少小离家老大回，乡音无改鬓毛衰。', '儿童相见不相识，笑问客从何处来。'] },
    { title: '赠汪伦', author: '李白', dynasty: '唐', tags: ['送别', '友情'], lines: ['李白乘舟将欲行，忽闻岸上踏歌声。', '桃花潭水深千尺，不及汪伦送我情。'] },
    { title: '黄鹤楼送孟浩然之广陵', author: '李白', dynasty: '唐', tags: ['送别', '写景'], lines: ['故人西辞黄鹤楼，烟花三月下扬州。', '孤帆远影碧空尽，唯见长江天际流。'] },
    { title: '早发白帝城', author: '李白', dynasty: '唐', tags: ['写景', '抒怀'], lines: ['朝辞白帝彩云间，千里江陵一日还。', '两岸猿声啼不住，轻舟已过万重山。'] },
    { title: '望天门山', author: '李白', dynasty: '唐', tags: ['写景', '山水'], lines: ['天门中断楚江开，碧水东流至此回。', '两岸青山相对出，孤帆一片日边来。'] },
    { title: '九月九日忆山东兄弟', author: '王维', dynasty: '唐', tags: ['思乡', '节日'], lines: ['独在异乡为异客，每逢佳节倍思亲。', '遥知兄弟登高处，遍插茱萸少一人。'] },
    { title: '枫桥夜泊', author: '张继', dynasty: '唐', tags: ['写景', '羁旅'], lines: ['月落乌啼霜满天，江枫渔火对愁眠。', '姑苏城外寒山寺，夜半钟声到客船。'] },
    { title: '渔歌子', author: '张志和', dynasty: '唐', tags: ['田园', '写景'], lines: ['西塞山前白鹭飞，桃花流水鳜鱼肥。', '青箬笠，绿蓑衣，斜风细雨不须归。'] },
    { title: '咏柳', author: '贺知章', dynasty: '唐', tags: ['咏物', '春天'], lines: ['碧玉妆成一树高，万条垂下绿丝绦。', '不知细叶谁裁出，二月春风似剪刀。'] },
    { title: '绝句（迟日江山丽）', author: '杜甫', dynasty: '唐', tags: ['写景', '春天'], lines: ['迟日江山丽，春风花草香。', '泥融飞燕子，沙暖睡鸳鸯。'] },
    { title: '江畔独步寻花', author: '杜甫', dynasty: '唐', tags: ['写景', '春天'], lines: ['黄四娘家花满蹊，千朵万朵压枝低。', '留连戏蝶时时舞，自在娇莺恰恰啼。'] },
    { title: '元日', author: '王安石', dynasty: '宋', tags: ['节日', '春节'], lines: ['爆竹声中一岁除，春风送暖入屠苏。', '千门万户曈曈日，总把新桃换旧符。'] },
    { title: '泊船瓜洲', author: '王安石', dynasty: '宋', tags: ['思乡', '写景'], lines: ['京口瓜洲一水间，钟山只隔数重山。', '春风又绿江南岸，明月何时照我还。'] },
    { title: '题西林壁', author: '苏轼', dynasty: '宋', tags: ['哲理', '写景'], lines: ['横看成岭侧成峰，远近高低各不同。', '不识庐山真面目，只缘身在此山中。'] },
    { title: '饮湖上初晴后雨', author: '苏轼', dynasty: '宋', tags: ['写景', '山水'], lines: ['水光潋滟晴方好，山色空蒙雨亦奇。', '欲把西湖比西子，淡妆浓抹总相宜。'] },
    { title: '惠崇春江晚景', author: '苏轼', dynasty: '宋', tags: ['写景', '春天', '题画'], lines: ['竹外桃花三两枝，春江水暖鸭先知。', '蒌蒿满地芦芽短，正是河豚欲上时。'] },
    { title: '夏日绝句', author: '李清照', dynasty: '宋', tags: ['励志', '咏史'], lines: ['生当作人杰，死亦为鬼雄。', '至今思项羽，不肯过江东。'] },
    { title: '示儿', author: '陆游', dynasty: '宋', tags: ['爱国'], lines: ['死去元知万事空，但悲不见九州同。', '王师北定中原日，家祭无忘告乃翁。'] },
    { title: '秋夜将晓出篱门迎凉有感', author: '陆游', dynasty: '宋', tags: ['爱国', '写景'], lines: ['三万里河东入海，五千仞岳上摩天。', '遗民泪尽胡尘里，南望王师又一年。'] },
    { title: '四时田园杂兴（其三十一）', author: '范成大', dynasty: '宋', tags: ['田园', '乡村'], lines: ['昼出耘田夜绩麻，村庄儿女各当家。', '童孙未解供耕织，也傍桑阴学种瓜。'] },
    { title: '小池', author: '杨万里', dynasty: '宋', tags: ['写景', '夏天'], lines: ['泉眼无声惜细流，树阴照水爱晴柔。', '小荷才露尖尖角，早有蜻蜓立上头。'] },
    { title: '晓出净慈寺送林子方', author: '杨万里', dynasty: '宋', tags: ['写景', '夏天', '送别'], lines: ['毕竟西湖六月中，风光不与四时同。', '接天莲叶无穷碧，映日荷花别样红。'] },
    { title: '春日', author: '朱熹', dynasty: '宋', tags: ['写景', '春天', '哲理'], lines: ['胜日寻芳泗水滨，无边光景一时新。', '等闲识得东风面，万紫千红总是春。'] },
    { title: '观书有感', author: '朱熹', dynasty: '宋', tags: ['哲理', '读书'], lines: ['半亩方塘一鉴开，天光云影共徘徊。', '问渠那得清如许？为有源头活水来。'] },
    { title: '村居', author: '高鼎', dynasty: '清', tags: ['写景', '春天', '儿童'], lines: ['草长莺飞二月天，拂堤杨柳醉春烟。', '儿童散学归来早，忙趁东风放纸鸢。'] },
    { title: '所见', author: '袁枚', dynasty: '清', tags: ['写景', '儿童'], lines: ['牧童骑黄牛，歌声振林樾。', '意欲捕鸣蝉，忽然闭口立。'] },
    { title: '己亥杂诗（其五）', author: '龚自珍', dynasty: '清', tags: ['励志', '咏怀'], lines: ['浩荡离愁白日斜，吟鞭东指即天涯。', '落红不是无情物，化作春泥更护花。'] },
    { title: '长歌行', author: '汉乐府', dynasty: '汉', tags: ['励志', '惜时'], lines: ['青青园中葵，朝露待日晞。', '阳春布德泽，万物生光辉。', '常恐秋节至，焜黄华叶衰。', '百川东到海，何时复西归？', '少壮不努力，老大徒伤悲。'] },
    { title: '敕勒歌', author: '北朝民歌', dynasty: '北朝', tags: ['边塞', '草原'], lines: ['敕勒川，阴山下。', '天似穹庐，笼盖四野。', '天苍苍，野茫茫，风吹草低见牛羊。'] },
    { title: '游子吟', author: '孟郊', dynasty: '唐', tags: ['母爱', '感恩'], lines: ['慈母手中线，游子身上衣。', '临行密密缝，意恐迟迟归。', '谁言寸草心，报得三春晖。'] },
    { title: '竹里馆', author: '王维', dynasty: '唐', tags: ['写景', '山水', '隐逸'], lines: ['独坐幽篁里，弹琴复长啸。', '深林人不知，明月来相照。'] },
    { title: '鹿柴', author: '王维', dynasty: '唐', tags: ['写景', '山水'], lines: ['空山不见人，但闻人语响。', '返景入深林，复照青苔上。'] },
    { title: '月夜忆舍弟', author: '杜甫', dynasty: '唐', tags: ['思乡', '亲情', '边塞'], lines: ['戍鼓断人行，边秋一雁声。', '露从今夜白，月是故乡明。', '有弟皆分散，无家问死生。', '寄书长不达，况乃未休兵。'] }
  ];

  function esc(s) {
    if (window.CNPT?.utils?.escapeHtml) return CNPT.utils.escapeHtml(s);
    return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function fullText(p) {
    return `${p.title}${p.author}${p.dynasty}${p.lines.join('')}`;
  }

  /** 全文/标题/作者检索 */
  function search(keyword) {
    const k = String(keyword || '').trim();
    if (!k) return [];
    return POEMS.filter(p => fullText(p).includes(k));
  }

  /** 随机抽诗（可按作者/标签过滤） */
  function random(opts = {}) {
    let pool = POEMS;
    if (opts.author) pool = pool.filter(p => p.author === opts.author);
    if (opts.tag) pool = pool.filter(p => (p.tags || []).includes(opts.tag));
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /** 飞花令：返回含指定字的诗句（逐句） */
  function feihualing(char) {
    const c = String(char || '').trim();
    if (!c) return [];
    const out = [];
    for (const p of POEMS) {
      for (const line of p.lines) {
        if (line.includes(c)) {
          out.push({ poem: p.title, author: p.author, dynasty: p.dynasty, line });
        }
      }
    }
    return out;
  }

  /** 渲染工具页 */
  function renderTool(container) {
    if (!container) return;
    container.innerHTML = '';
    const authors = [...new Set(POEMS.map(p => p.author))];

    const wrap = document.createElement('div');
    wrap.className = 'pt-wrap';
    wrap.innerHTML = `
      <div class="pt-controls">
        <div class="pt-row">
          <input class="pt-input" id="pt-search" type="search" placeholder="搜标题 / 作者 / 诗句，如「床前明月光」">
          <button class="pt-btn" id="pt-btn-search">🔍 搜诗</button>
        </div>
        <div class="pt-row">
          <select class="pt-input" id="pt-author"><option value="">全部作者</option>${authors.map(a => `<option>${esc(a)}</option>`).join('')}</select>
          <button class="pt-btn" id="pt-btn-random">🎲 随机抽一首</button>
        </div>
        <div class="pt-row">
          <input class="pt-input" id="pt-char" maxlength="1" placeholder="飞花令：输入一个字，如「春」">
          <button class="pt-btn" id="pt-btn-fhl">🌸 飞花令</button>
        </div>
      </div>
      <div class="pt-result" id="pt-result"></div>
      <div class="pt-note">📚 内置 ${POEMS.length} 首课标常见古诗词（公版文本，示例库）。完整近 40 万首诗库可参考开源项目「中华古诗词」/ 诗泉（poetry.palemoky.com），本项目未内嵌其数据。</div>
    `;
    container.appendChild(wrap);

    const result = wrap.querySelector('#pt-result');

    function poemCard(p) {
      return `<div class="pt-poem">
        <div class="pt-poem-head"><b>${esc(p.title)}</b><span>${esc(p.dynasty)} · ${esc(p.author)}</span></div>
        <div class="pt-poem-lines">${p.lines.map(l => `<p>${esc(l)}</p>`).join('')}</div>
        <div class="pt-poem-tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
      </div>`;
    }

    function showPoems(list, emptyText) {
      if (!list.length) { result.innerHTML = `<div class="pt-empty">${esc(emptyText)}</div>`; return; }
      result.innerHTML = list.map(poemCard).join('');
    }

    wrap.querySelector('#pt-btn-search').addEventListener('click', () => {
      const k = wrap.querySelector('#pt-search').value;
      showPoems(search(k), k ? `没有找到包含「${k}」的诗` : '先输入关键词再搜哦');
    });
    wrap.querySelector('#pt-search').addEventListener('keydown', e => {
      if (e.key === 'Enter') wrap.querySelector('#pt-btn-search').click();
    });

    wrap.querySelector('#pt-btn-random').addEventListener('click', () => {
      const author = wrap.querySelector('#pt-author').value;
      const p = random(author ? { author } : {});
      showPoems(p ? [p] : [], '这个作者暂时没有收录');
    });

    wrap.querySelector('#pt-btn-fhl').addEventListener('click', () => {
      const c = wrap.querySelector('#pt-char').value;
      if (!c) { result.innerHTML = '<div class="pt-empty">先输入一个字</div>'; return; }
      const hits = feihualing(c);
      if (!hits.length) { result.innerHTML = `<div class="pt-empty">示例库里暂时没有含「${esc(c)}」的诗句</div>`; return; }
      result.innerHTML = `<div class="pt-fhl-title">🌸 「${esc(c)}」字飞花令 · ${hits.length} 句</div>` + hits.map(h =>
        `<div class="pt-fhl-item"><p>${esc(h.line)}</p><span>—— ${esc(h.poem)} · ${esc(h.dynasty)} · ${esc(h.author)}</span></div>`
      ).join('');
    });

    // 默认展示随机一首，吸引打开
    const first = random({});
    showPoems(first ? [first] : [], '');
    injectStyles();
  }

  function injectStyles() {
    if (document.getElementById('cnpt-poetry-styles')) return;
    const style = document.createElement('style');
    style.id = 'cnpt-poetry-styles';
    style.textContent = `
      .pt-wrap { max-width: 860px; margin: 0 auto; }
      .pt-controls { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
      .pt-row { display: flex; gap: 10px; }
      .pt-input { flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 15px; outline: none; background: #fff; }
      .pt-input:focus { border-color: #667eea; }
      .pt-btn { padding: 10px 18px; border-radius: 10px; border: none; background: linear-gradient(135deg,#667eea,#764ba2); color: #fff; font-size: 14px; cursor: pointer; white-space: nowrap; }
      .pt-btn:hover { opacity: 0.92; }
      .pt-result { display: flex; flex-direction: column; gap: 14px; }
      .pt-poem { background: #fff; border-radius: 14px; padding: 18px 22px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); border-left: 4px solid #667eea; }
      .pt-poem-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
      .pt-poem-head b { font-size: 17px; color: #2d3748; }
      .pt-poem-head span { font-size: 12px; color: #94a3b8; }
      .pt-poem-lines p { margin: 4px 0; font-size: 16px; letter-spacing: 0.06em; color: #334155; }
      .pt-poem-tags { margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; }
      .pt-poem-tags span { font-size: 11px; padding: 1px 8px; border-radius: 10px; background: rgba(102,126,234,0.1); color: #4c5fd5; }
      .pt-fhl-title { font-size: 15px; font-weight: 700; color: #2d3748; }
      .pt-fhl-item { background: #fff; border-radius: 12px; padding: 12px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
      .pt-fhl-item p { margin: 0 0 4px; font-size: 15px; color: #334155; }
      .pt-fhl-item span { font-size: 12px; color: #94a3b8; }
      .pt-empty { text-align: center; color: #94a3b8; padding: 24px; }
      .pt-note { margin-top: 18px; font-size: 12px; color: #94a3b8; line-height: 1.7; }
      @media (max-width: 560px) { .pt-row { flex-direction: column; } }
    `;
    document.head.appendChild(style);
  }

  window.CNPT.components.poetry = { POEMS, search, random, feihualing, renderTool, injectStyles };
})();
