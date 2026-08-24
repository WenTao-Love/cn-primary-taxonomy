# v0.2 All-in-one injection for the SPLIT file
$ErrorActionPreference = "Stop"

$file = "D:\xcode\fgit\cn-primary-taxonomy\cn-primary-taxonomy-split.html"
$content = Get-Content -Path $file -Raw -Encoding UTF8
Write-Host "Split file original length: $($content.Length)"

# ===== 1. Inject theme CSS after <style> =====
$themeCSS = @'

/* ===== v0.2 主题系统 ===== */
:root {
  --bg:#fafaf7; --surface:#ffffff; --surface-2:#f5f5f0;
  --ink:#1c1f26; --ink-2:#3a3f4b; --muted:#6b7280; --line:#e6e4dd;
  --accent:#d94a4a; --accent-2:#c73c3c; --accent-soft:#fdf0ef;
  --blue:#2d6cdf; --blue-soft:#eaf1fc; --green:#2f8f5d; --green-soft:#e8f5ee;
  --amber:#c77f10; --amber-soft:#fcf2df; --purple:#7b4fb5; --purple-soft:#f1ebf9;
  --shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.05); --radius:10px;
}
body.theme-dark {
  --bg:#0f1419; --surface:#151d28; --surface-2:#1a2332;
  --ink:#e6e6e6; --ink-2:#c5cdd6; --muted:#7f8c9a; --line:rgba(255,255,255,0.06);
  --accent:#e74c3c; --accent-2:#c0392b; --accent-soft:rgba(231,76,60,.15);
  --blue:#5dade2; --blue-soft:rgba(93,173,226,.12);
  --green:#2ecc71; --green-soft:rgba(46,204,113,.12);
  --amber:#f39c12; --amber-soft:rgba(243,156,18,.12);
  --purple:#a29bfe; --purple-soft:rgba(162,155,254,.12);
  --shadow:0 1px 2px rgba(0,0,0,.2),0 8px 24px rgba(0,0,0,.3);
}
.theme-toggle {
  position:absolute; top:16px; left:16px; z-index:15;
  width:36px; height:36px; border-radius:999px;
  border:1px solid var(--line); background:var(--surface); color:var(--ink);
  cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center;
  box-shadow:var(--shadow); transition:all 0.2s ease;
}
.theme-toggle:hover { transform:scale(1.08); border-color:var(--accent); }
body { background:var(--bg); color:var(--ink); }
#graph { background:radial-gradient(ellipse at center,var(--surface-2) 0%,var(--bg) 100%); }
#sidebar { background:var(--surface); border-left:1px solid var(--line); }
#app.sidebar-collapsed #sidebar { border-left-color:transparent; }
#overview-panel, #guide-panel, #search-panel, #filter-panel, #assistant-panel, #graph-status { background:var(--surface-2); border:1px solid var(--line); }
#overview-panel h1 { color:var(--ink); }
#overview-panel p { color:var(--muted); }
.stats-bar div { background:var(--bg); color:var(--muted); }
.stats-bar b { color:var(--ink); }
#sidebar h2 { color:var(--ink); }
#sidebar .meta { color:var(--muted); }
#sidebar .desc { color:var(--ink-2); background:var(--surface-2); border-left-color:var(--blue); }
#sidebar h3 { color:var(--muted); }
.guide-step { background:var(--surface-2); color:var(--ink-2); }
.guide-step b { color:var(--ink); }
.guide-note { background:var(--blue-soft); color:var(--ink-2); }
.legend { background:rgba(255,255,255,0.92); border:1px solid var(--line); }
.legend h3 { color:var(--muted); }
.search-box input { background:var(--surface); border:1px solid var(--line); color:var(--ink); }
.search-box input::placeholder { color:var(--muted); }
.search-box input:focus { border-color:var(--blue); }
.search-results { background:var(--surface); border:1px solid var(--line); }
.search-result-item { border-bottom:1px solid var(--line); }
.search-result-item:hover { background:var(--blue-soft); }
.search-result-item .srn { color:var(--blue); }
.search-result-item .srd { color:var(--muted); }
.single-select { background:var(--surface); border:1px solid var(--line); color:var(--ink); }
.single-select:focus { border-color:var(--blue); }
.multi-select { border:1px solid var(--line); background:var(--surface); }
.multi-select[open] { border-color:var(--blue); }
.multi-select summary { color:var(--ink); }
.multi-select .summary-value { color:var(--muted); }
.multi-select-menu { border-top:1px solid var(--line); }
.multi-select-search { background:var(--surface-2); border:1px solid var(--line); color:var(--ink); }
.multi-select-search:focus { border-color:var(--blue); }
.multi-select-option { color:var(--ink-2); }
.multi-select-option:hover { background:var(--blue-soft); }
#assistant-panel input { background:var(--surface); border:1px solid var(--line); color:var(--ink); }
#assistant-panel button { background:var(--blue-soft); border:1px solid rgba(45,108,223,.3); color:var(--blue); }
#assistant-panel button:hover { background:rgba(45,108,223,.18); }
#assistant-panel .chips .chip { background:var(--surface-2); color:var(--ink-2); }
#assistant-result { color:var(--ink-2); }
#assistant-result .path-step { background:var(--surface-2); color:var(--ink); }
#assistant-result .path-step:hover { background:var(--blue-soft); }
#assistant-result .assistant-muted { color:var(--muted); }
#assistant-result .assistant-card { background:var(--surface-2); }
#assistant-result .assistant-card strong { color:var(--ink); }
#assistant-result .assistant-list { color:var(--ink-2); }
#assistant-result .assistant-action { background:var(--blue-soft); color:var(--blue); }
#assistant-result .assistant-action:hover { background:rgba(45,108,223,.18); }
#assistant-result .assistant-candidate { background:var(--surface-2); color:var(--ink-2); }
#assistant-result .assistant-candidate:hover { background:var(--blue-soft); color:var(--ink); }
.hint { color:var(--muted); }
.hint span { color:var(--blue); }
.resource-link { background:var(--surface-2); color:var(--ink); }
.resource-link:hover { background:var(--blue-soft); }
.resource-link small { color:var(--muted); }
.graph-status { color:var(--ink-2); }
.graph-status strong { color:var(--ink); }
.evidence-list li, .mistakes-list li { color:var(--ink-2); }
.chain-item { background:var(--surface-2); }
.chain-item:hover { background:var(--blue-soft); }
.chain-arrow { color:var(--muted); }
.relation-card { background:var(--surface-2); color:var(--ink-2); }
.relation-card b { color:var(--ink); }
.parent-coach-box { background:var(--blue-soft); border:1px solid rgba(45,108,223,.22); }
.parent-coach-box .coach-title { color:var(--ink); }
.parent-coach-box .coach-text { color:var(--ink-2); }
.node-label { fill:var(--ink-2); }
.sidebar-toggle { border:1px solid var(--line); background:var(--surface); color:var(--ink); }
.sidebar-toggle:hover { background:var(--blue-soft); border-color:var(--blue); }
.tag { background:var(--surface-2)!important; color:var(--ink-2)!important; }
@media(max-width:768px) {
  #app { grid-template-columns:1fr; grid-template-rows:1fr auto; }
  #sidebar { position:fixed; bottom:0; left:0; right:0; height:50vh; border-left:none; border-top:1px solid var(--line); border-radius:16px 16px 0 0; transform:translateY(100%); transition:transform 0.3s ease; z-index:20; }
  #sidebar.mobile-open { transform:translateY(0); }
  .sidebar-toggle { display:none; }
  .legend { bottom:auto; top:8px; left:60px; padding:8px 12px; }
  .theme-toggle { top:8px; left:8px; }
}
@media(max-width:480px) { .legend { display:none; } #sidebar { height:60vh; } }
.onboarding-overlay { position:fixed; inset:0; z-index:100; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.3s ease; }
.onboarding-overlay.show { opacity:1; pointer-events:auto; }
.onboarding-card { background:var(--surface); border-radius:16px; padding:28px; max-width:420px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,.3); text-align:center; }
.onboarding-card h2 { font-size:20px; margin-bottom:16px; color:var(--ink); }
.onboarding-card .onboarding-step { display:flex; align-items:flex-start; gap:12px; text-align:left; margin:12px 0; font-size:14px; line-height:1.6; color:var(--ink-2); }
.onboarding-card .onboarding-num { width:28px; height:28px; border-radius:50%; background:var(--accent-soft); color:var(--accent); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0; }
.onboarding-card .onboarding-actions { display:flex; gap:10px; margin-top:20px; justify-content:center; }
.onboarding-card button { padding:10px 20px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all 0.2s; }
.onboarding-card .btn-primary { background:var(--accent); color:#fff; }
.onboarding-card .btn-primary:hover { background:var(--accent-2); }
.onboarding-card .btn-secondary { background:var(--surface-2); color:var(--ink-2); border:1px solid var(--line); }
.onboarding-card .btn-secondary:hover { background:var(--line); }
.onboarding-dots { display:flex; gap:6px; justify-content:center; margin-top:16px; }
.onboarding-dot { width:8px; height:8px; border-radius:50%; background:var(--line); transition:background 0.2s; }
.onboarding-dot.active { background:var(--accent); }
.chapter-view-toggle { position:absolute; top:16px; right:60px; z-index:15; padding:6px 14px; border-radius:999px; border:1px solid var(--line); background:var(--surface); color:var(--ink); font-size:13px; cursor:pointer; font-weight:600; box-shadow:var(--shadow); }
.chapter-view-toggle:hover { border-color:var(--accent); color:var(--accent); }
.chapter-view-toggle.active { background:var(--accent-soft); border-color:var(--accent); color:var(--accent); }
.chapter-panel { position:absolute; top:0; left:0; right:0; bottom:0; background:var(--bg); z-index:12; overflow-y:auto; display:none; padding:24px; }
.chapter-panel.show { display:block; }
.chapter-panel h2 { font-size:18px; margin-bottom:16px; color:var(--ink); }
.chapter-tree { font-size:14px; line-height:2; }
.chapter-tree .grade-level { font-weight:700; font-size:16px; color:var(--accent); margin-top:16px; }
.chapter-tree .subject-level { font-weight:600; color:var(--ink-2); margin-left:16px; margin-top:8px; }
.chapter-tree .chapter-level { color:var(--ink); margin-left:32px; cursor:pointer; padding:4px 8px; border-radius:6px; }
.chapter-tree .chapter-level:hover { background:var(--blue-soft); }
.chapter-tree .chapter-count { color:var(--muted); font-size:12px; margin-left:8px; }
.chapter-back-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; border:1px solid var(--line); background:var(--surface); color:var(--ink); font-size:13px; cursor:pointer; margin-bottom:16px; font-weight:600; }
.chapter-back-btn:hover { background:var(--surface-2); }
.mobile-sidebar-toggle { transition:all 0.2s ease; }
.mobile-sidebar-toggle:active { transform:translateX(-50%) scale(0.95); }

'@
$content = $content -replace '(<style>\r\n)', "`$1$themeCSS"

# ===== 2. Viewport meta =====
$content = $content -replace '(<meta charset="UTF-8">\r\n)', '<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">'

# ===== 3. Theme toggle button =====
$content = $content -replace '(<div id="graph">\r?\n  <button id="sidebar-toggle")', '<button class="theme-toggle" id="theme-toggle" type="button" title="切换主题">🌙</button>
<div id="graph">
  <button id="sidebar-toggle"'

# ===== 4. Chapter view HTML =====
$content = $content -replace '(<svg id="canvas"></svg>\r?\n)</div>', '<svg id="canvas"></svg>
<button class="chapter-view-toggle" id="chapter-view-toggle" type="button">📚 按教材看</button>
<div class="chapter-panel" id="chapter-panel">
  <button class="chapter-back-btn" id="chapter-back-btn">← 返回图谱</button>
  <h2>📚 按教材单元浏览</h2>
  <div class="chapter-tree" id="chapter-tree"></div>
</div>
</div>'

# ===== 5. Onboarding HTML =====
$content = $content -replace '(\r?\n</body>)', '

<div class="onboarding-overlay" id="onboarding-overlay">
  <div class="onboarding-card">
    <h2 id="onboarding-title">👋 欢迎来到知识图谱</h2>
    <div id="onboarding-content"></div>
    <div class="onboarding-actions">
      <button class="btn-secondary" id="onboarding-skip">跳过</button>
      <button class="btn-primary" id="onboarding-next">下一步</button>
    </div>
    <div class="onboarding-dots" id="onboarding-dots"></div>
  </div>
</div>

</body>'

# ===== 6. Terminology replacements =====
$content = $content -replace '📚 前置依赖（要先学会这些 ↓）', '📚 先学这些，才能学会上面的'
$content = $content -replace '🚀 解锁后续（学完可以学这些 ↑）', '🚀 学会上面的，就能接着学这些'
$content = $content -replace '强依赖（必须先掌握）', '必须先学会才能往下学'
$content = $content -replace '弱依赖（有帮助）', '先学了更容易'
$content = $content -replace "relationTone\(item\.link\.strength\)", "item.link.strength === 'hard' ? '必须先学会' : '先学了更容易'"
$content = $content -replace '✓ 掌握的证据（会什么就算掌握了）', '✓ 学会了的标志（做到这些就算会了）'
$content = $content -replace '📏 分技能测评 Rubric', '📏 分能力水平说明'
$content = $content -replace '这个知识点没有显式前置，可直接从当前节点开始练', '这个点没有必须先学的基础，可以直接从这里开始'
$content = $content -replace '当前节点后续解锁范围较小，可以先把本点练扎实', '学完这个，暂时没有紧跟着要学的，先把当前练扎实'
$content = $content -replace '（无前置，是起始知识点）', '（这是最基础的一课，可以直接学）'
$content = $content -replace '（无后续，是终点知识点）', '（这是当前阶段最后一步啦）'
$content = $content -replace '<b>先补什么：</b>', '<b>🔴 要先学会：</b>'
$content = $content -replace '<b>建议补什么：</b>', '<b>🟡 先学了更容易：</b>'
$content = $content -replace '<b>这一步学稳后能带动什么：</b>', '<b>学会这个还能带动：</b>'
$content = $content -replace '当前没有"必须先补"的显式前置，可直接从本节点练起', '没有必须先学的，可以直接从这里练起'
$content = $content -replace '当前没有额外"建议先补"的辅助前置', '没有额外建议先学的'

# ===== 7. JS injections before "const script" =====
$jsAll = @'

// ===== v0.2 主题切换 + 首次使用引导 + 移动端 + 章节视图 + 测评增强 =====
(function() {
  var themeToggle = document.getElementById('theme-toggle');
  var currentTheme = localStorage.getItem('cnpt-theme') || 'light';
  function applyTheme(theme) {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('cnpt-theme', theme);
  }
  applyTheme(currentTheme);
  if (themeToggle) themeToggle.addEventListener('click', function() { currentTheme = currentTheme === 'light' ? 'dark' : 'light'; applyTheme(currentTheme); });
  var onboardingSteps = [
    { title:'👋 欢迎来到知识图谱', html:'<div class="onboarding-step"><span class="onboarding-num">1</span><span>每个圆点代表一个<b>知识点</b>，比如"乘法口诀"、"部首查字法"。</span></div><div class="onboarding-step"><span class="onboarding-num">2</span><span>红色连线表示"必须先学会"，黄色表示"先学了更容易"。</span></div><div class="onboarding-step"><span class="onboarding-num">3</span><span>点开任意知识点，就能看到怎么辅导孩子。</span></div>' },
    { title:'🔍 找到孩子不会的点', html:'<div class="onboarding-step"><span class="onboarding-num">1</span><span>用<b>搜索框</b>直接搜关键词，比如"乘法"、"作文"。</span></div><div class="onboarding-step"><span class="onboarding-num">2</span><span>或者告诉<b>学习助手</b>："孩子乘法口诀不熟"，它会帮你找到该先补什么。</span></div><div class="onboarding-step"><span class="onboarding-num">3</span><span>也可以用<b>筛选器</b>按年级、学科缩小范围。</span></div>' },
    { title:'📖 看怎么辅导娃', html:'<div class="onboarding-step"><span class="onboarding-num">1</span><span>点开右侧详情，看<b>"要先学会"</b>——这是孩子卡住的原因。</span></div><div class="onboarding-step"><span class="onboarding-num">2</span><span>看<b>"家长辅导建议"</b>——一句句照着念就行。</span></div><div class="onboarding-step"><span class="onboarding-num">3</span><span>根据孩子掌握情况，只补1-3个前置点，不要全图都学一遍。</span></div>' }
  ];
  var onboardingOverlay = document.getElementById('onboarding-overlay');
  var onboardingContent = document.getElementById('onboarding-content');
  var onboardingTitle = document.getElementById('onboarding-title');
  var onboardingNext = document.getElementById('onboarding-next');
  var onboardingSkip = document.getElementById('onboarding-skip');
  var onboardingDots = document.getElementById('onboarding-dots');
  var onboardingStep = 0;
  function showOBStep(n) {
    onboardingTitle.textContent = onboardingSteps[n].title;
    onboardingContent.innerHTML = onboardingSteps[n].html;
    onboardingDots.innerHTML = onboardingSteps.map(function(_,i){ return '<span class="onboarding-dot'+(i===n?' active':'')+'"></span>'; }).join('');
    onboardingNext.textContent = n === onboardingSteps.length-1 ? '开始使用' : '下一步';
  }
  function closeOB() { onboardingOverlay.classList.remove('show'); localStorage.setItem('cnpt-onboarding-done','1'); }
  if (onboardingOverlay && !localStorage.getItem('cnpt-onboarding-done')) { showOBStep(0); onboardingOverlay.classList.add('show'); }
  if (onboardingNext) onboardingNext.addEventListener('click', function() { if (onboardingStep < onboardingSteps.length-1) { onboardingStep++; showOBStep(onboardingStep); } else { closeOB(); } });
  if (onboardingSkip) onboardingSkip.addEventListener('click', closeOB);
})();
(function() {
  var sidebar = document.getElementById('sidebar');
  var mobileToggle = document.createElement('button');
  mobileToggle.className = 'mobile-sidebar-toggle';
  mobileToggle.innerHTML = '📋 查看';
  mobileToggle.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:25;padding:12px 24px;border-radius:999px;border:none;background:var(--accent);color:#fff;font-size:14px;font-weight:600;box-shadow:0 4px 16px rgba(217,74,74,.4);display:none;cursor:pointer;';
  document.body.appendChild(mobileToggle);
  function checkMobile() { var m = window.innerWidth <= 768; mobileToggle.style.display = m ? 'block' : 'none'; }
  checkMobile();
  window.addEventListener('resize', checkMobile);
  mobileToggle.addEventListener('click', function() { sidebar.classList.toggle('mobile-open'); mobileToggle.innerHTML = sidebar.classList.contains('mobile-open') ? '✕ 关闭' : '📋 查看'; });
})();
(function() {
  var searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.setAttribute('placeholder', '🔍 搜知识点（支持拼音首字母，如cb=部首、cfa=乘法）');
    var tagHints = document.createElement('div');
    tagHints.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;';
    tagHints.innerHTML = '<span style="font-size:11px;color:var(--muted);">热门搜索：</span>' +
      ['乘法口诀','看图写话','进位加法','部首查字法','认识时间','分数初步'].map(function(t) {
        return '<span style="font-size:11px;padding:2px 8px;border-radius:999px;background:var(--surface-2);color:var(--ink-2);cursor:pointer;" onclick="document.getElementById(\'search\').value=\'' + t + '\';document.getElementById(\'search\').dispatchEvent(new Event(\'input\'));">' + t + '</span>';
      }).join('');
    searchInput.parentNode.appendChild(tagHints);
  }
})();
(function() {
  var toggle = document.getElementById('chapter-view-toggle');
  var panel = document.getElementById('chapter-panel');
  var tree = document.getElementById('chapter-tree');
  var backBtn = document.getElementById('chapter-back-btn');
  function buildTree() {
    if (!fullData || !fullData.topics) return;
    var topics = fullData.topics.topics;
    var grouped = {};
    topics.forEach(function(t) {
      var g = t.grade + '年级' + (t.term || '');
      var s = t.subject || '其他';
      var c = t.chapter || t.module || t.unit || '其他';
      if (!grouped[g]) grouped[g] = {};
      if (!grouped[g][s]) grouped[g][s] = {};
      if (!grouped[g][s][c]) grouped[g][s][c] = [];
      grouped[g][s][c].push(t);
    });
    var html = '';
    Object.keys(grouped).sort().forEach(function(grade) {
      html += '<div class="grade-level">' + grade + '</div>';
      Object.keys(grouped[grade]).sort().forEach(function(subj) {
        html += '<div class="subject-level">' + subj + '</div>';
        Object.keys(grouped[grade][subj]).sort().forEach(function(ch) {
          var count = grouped[grade][subj][ch].length;
          html += '<div class="chapter-level" data-topic-id="' + grouped[grade][subj][ch][0].id + '">' + ch + '<span class="chapter-count">(' + count + '个知识点)</span></div>';
        });
      });
    });
    tree.innerHTML = html;
    tree.querySelectorAll('.chapter-level').forEach(function(el) {
      el.addEventListener('click', function() { panel.classList.remove('show'); toggle.classList.remove('active'); focusTopicById(el.dataset.topicId); });
    });
  }
  if (toggle) toggle.addEventListener('click', function() {
    if (panel.classList.contains('show')) { panel.classList.remove('show'); toggle.classList.remove('active'); }
    else { panel.classList.add('show'); toggle.classList.add('active'); if (!tree.innerHTML) buildTree(); }
  });
  if (backBtn) backBtn.addEventListener('click', function() { panel.classList.remove('show'); toggle.classList.remove('active'); });
})();
(function() {
  var origRender = window.renderSidebar;
  if (!origRender) return;
  window.renderSidebar = function(topic) {
    if (!topic.assessmentPrompt && topic.commonMistakes && topic.commonMistakes.length) {
      var name = topic.name;
      var mistake = topic.commonMistakes[0];
      var practice = (topic.practiceChain && topic.practiceChain[0]) || (topic.assessmentTasks && topic.assessmentTasks[0]);
      var ev = (topic.evidence && topic.evidence[0]) || '';
      topic.assessmentPrompt = '给孩子出一道"' + name + '"相关的题，观察他：①能不能独立想起来？②做的时候有没有犯"' + mistake + (practice ? '"？③带着再做一次"' + practice : '') + '"，看能不能纠正。' + (ev ? '做到"' + ev + '"就算掌握了。' : '');
    }
    origRender(topic);
  };
})();

'@

$content = $content -replace '(const script = document.createElement)', "$jsAll`$1"

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Split file final length: $($content.Length)"
Write-Host "SUCCESS: All v0.2 features injected into split file."