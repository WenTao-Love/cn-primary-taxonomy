# v0.2 Theme & UX Injection Script
$ErrorActionPreference = "Stop"

$file = "D:\xcode\fgit\cn-primary-taxonomy\cn-primary-taxonomy.html"
$content = Get-Content -Path $file -Raw -Encoding UTF8

Write-Host "Original file length: $($content.Length)"

# ===== 1. Inject theme CSS after <style> =====
$themeCSS = @'

/* ===== v0.2 主题系统 : 浅色默认 + 深色切换 ===== */
:root {
  --bg: #fafaf7; --surface: #ffffff; --surface-2: #f5f5f0;
  --ink: #1c1f26; --ink-2: #3a3f4b; --muted: #6b7280; --line: #e6e4dd;
  --accent: #d94a4a; --accent-2: #c73c3c; --accent-soft: #fdf0ef;
  --blue: #2d6cdf; --blue-soft: #eaf1fc; --green: #2f8f5d; --green-soft: #e8f5ee;
  --amber: #c77f10; --amber-soft: #fcf2df; --purple: #7b4fb5; --purple-soft: #f1ebf9;
  --shadow: 0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.05); --radius: 10px;
}
body.theme-dark {
  --bg: #0f1419; --surface: #151d28; --surface-2: #1a2332;
  --ink: #e6e6e6; --ink-2: #c5cdd6; --muted: #7f8c9a; --line: rgba(255,255,255,0.06);
  --accent: #e74c3c; --accent-2: #c0392b; --accent-soft: rgba(231,76,60,.15);
  --blue: #5dade2; --blue-soft: rgba(93,173,226,.12);
  --green: #2ecc71; --green-soft: rgba(46,204,113,.12);
  --amber: #f39c12; --amber-soft: rgba(243,156,18,.12);
  --purple: #a29bfe; --purple-soft: rgba(162,155,254,.12);
  --shadow: 0 1px 2px rgba(0,0,0,.2), 0 8px 24px rgba(0,0,0,.3);
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
#graph { background:radial-gradient(ellipse at center, var(--surface-2) 0%, var(--bg) 100%); }
#sidebar { background:var(--surface); border-left:1px solid var(--line); }
#app.sidebar-collapsed #sidebar { border-left-color:transparent; }
#overview-panel, #guide-panel, #search-panel, #filter-panel, #assistant-panel, #graph-status {
  background:var(--surface-2); border:1px solid var(--line);
}
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

/* ===== 移动端响应式 ===== */
@media (max-width: 768px) {
  #app { grid-template-columns:1fr; grid-template-rows:1fr auto; }
  #sidebar {
    position:fixed; bottom:0; left:0; right:0; height:50vh;
    border-left:none; border-top:1px solid var(--line); border-radius:16px 16px 0 0;
    transform:translateY(100%); transition:transform 0.3s ease; z-index:20;
  }
  #sidebar.mobile-open { transform:translateY(0); }
  .sidebar-toggle { display:none; }
  .legend { bottom:auto; top:8px; left:60px; padding:8px 12px; }
  .theme-toggle { top:8px; left:8px; }
  #detail-panel { font-size:14px; }
  .chain-item, .relation-card { padding:12px; }
  .tag { font-size:13px; padding:4px 10px; }
}
@media (max-width: 480px) {
  .legend { display:none; }
  #sidebar { height:60vh; }
  .stats-bar { grid-template-columns:repeat(3,1fr); gap:6px; }
  .stats-bar b { font-size:16px; }
}

/* ===== 首次使用引导遮罩 ===== */
.onboarding-overlay {
  position:fixed; inset:0; z-index:100; background:rgba(0,0,0,0.6);
  display:flex; align-items:center; justify-content:center;
  opacity:0; pointer-events:none; transition:opacity 0.3s ease;
}
.onboarding-overlay.show { opacity:1; pointer-events:auto; }
.onboarding-card {
  background:var(--surface); border-radius:16px; padding:28px;
  max-width:420px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,.3); text-align:center;
}
.onboarding-card h2 { font-size:20px; margin-bottom:16px; color:var(--ink); }
.onboarding-card .onboarding-step {
  display:flex; align-items:flex-start; gap:12px; text-align:left;
  margin:12px 0; font-size:14px; line-height:1.6; color:var(--ink-2);
}
.onboarding-card .onboarding-num {
  width:28px; height:28px; border-radius:50%; background:var(--accent-soft);
  color:var(--accent); display:flex; align-items:center; justify-content:center;
  font-weight:700; font-size:13px; flex-shrink:0;
}
.onboarding-card .onboarding-actions {
  display:flex; gap:10px; margin-top:20px; justify-content:center;
}
.onboarding-card button {
  padding:10px 20px; border-radius:8px; font-size:14px; font-weight:600;
  cursor:pointer; border:none; transition:all 0.2s;
}
.onboarding-card .btn-primary { background:var(--accent); color:#fff; }
.onboarding-card .btn-primary:hover { background:var(--accent-2); }
.onboarding-card .btn-secondary { background:var(--surface-2); color:var(--ink-2); border:1px solid var(--line); }
.onboarding-card .btn-secondary:hover { background:var(--line); }
.onboarding-dots { display:flex; gap:6px; justify-content:center; margin-top:16px; }
.onboarding-dot { width:8px; height:8px; border-radius:50%; background:var(--line); transition:background 0.2s; }
.onboarding-dot.active { background:var(--accent); }

'@

# Insert after <style> tag
$content = $content -replace '(<style>\r\n)', "`$1$themeCSS"
Write-Host "After theme CSS injection: $($content.Length)"

# ===== 2. Add viewport meta =====
$content = $content -replace '(<meta charset="UTF-8">\r\n)', '<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">'

# ===== 3. Add theme toggle button =====
$content = $content -replace '(<div id="graph">\r\n  <button id="sidebar-toggle")', '<button class="theme-toggle" id="theme-toggle" type="button" title="切换主题">🌙</button>
<div id="graph">
  <button id="sidebar-toggle"'

# ===== 4. Add onboarding overlay before </body> =====
$onboardingHTML = '

<!-- 首次使用引导 -->
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

'
$content = $content -replace '(\r?\n</body>)', "$onboardingHTML</body>"

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Final file length: $($content.Length)"
Write-Host "SUCCESS: Theme CSS, viewport, toggle button, and onboarding overlay injected."
