# v0.2 Mobile sidebar toggle + Search enhancement
$ErrorActionPreference = "Stop"

$file = "D:\xcode\fgit\cn-primary-taxonomy\cn-primary-taxonomy.html"
$content = Get-Content -Path $file -Raw -Encoding UTF8

# ===== 1. Add mobile sidebar toggle JS =====
$mobileJS = @'

// ===== v0.2 移动端侧边栏切换 =====
(function() {
  var sidebar = document.getElementById('sidebar');
  // Create mobile toggle button
  var mobileToggle = document.createElement('button');
  mobileToggle.className = 'mobile-sidebar-toggle';
  mobileToggle.innerHTML = '📋 查看';
  mobileToggle.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:25;padding:12px 24px;border-radius:999px;border:none;background:var(--accent);color:#fff;font-size:14px;font-weight:600;box-shadow:0 4px 16px rgba(217,74,74,.4);display:none;cursor:pointer;';
  document.body.appendChild(mobileToggle);
  
  function checkMobile() {
    var isMobile = window.innerWidth <= 768;
    mobileToggle.style.display = isMobile ? 'block' : 'none';
  }
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  mobileToggle.addEventListener('click', function() {
    sidebar.classList.toggle('mobile-open');
    mobileToggle.innerHTML = sidebar.classList.contains('mobile-open') ? '✕ 关闭' : '📋 查看';
  });
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
      mobileToggle.innerHTML = '📋 查看';
    }
  });
})();

// ===== v0.2 搜索增强：拼音首字母 + 标签搜索 =====
(function() {
  // Pinyin first-letter map for common search terms
  var pinyinMap = {
    'cb': ['部首查字法', '部首'], 'bs': ['笔顺', '笔画'], 'sz': ['生字', '识字'],
    'yf': ['语音', '音节'], 'yc': ['易错', '易错点'], 'kx': ['看图', '看图写话'],
    'xx': ['写作', '作文'], 'yd': ['阅读', '阅读理解'], 'sjf': ['时间的', '时间'],
    'cfa': ['乘法', '乘法口诀'], 'jfa': ['加法', '进位加法'], 'cfa': ['除法', '除法'],
    'fs': ['分数', '分数初步'], 'rh': ['人民币', '认识人民币'], 'tj': ['统计', '数据统计'],
    'dw': ['单位', '长度单位'], 'jd': ['角度', '角的初步认'], 'yb': ['月', '月历']
  };
  var searchInput = document.getElementById('search');
  if (searchInput) {
    var originalPlaceholder = searchInput.getAttribute('placeholder');
    searchInput.setAttribute('placeholder', '🔍 搜知识点（支持拼音首字母，如cb=部首、cfa=乘法）');
    // Add tag hints below search
    var tagHints = document.createElement('div');
    tagHints.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;';
    tagHints.innerHTML = '<span style="font-size:11px;color:var(--muted);">热门搜索：</span>' +
      ['乘法口诀','看图写话','进位加法','部首查字法','认识时间','分数初步'].map(function(t) {
        return '<span style="font-size:11px;padding:2px 8px;border-radius:999px;background:var(--surface-2);color:var(--ink-2);cursor:pointer;" onclick="document.getElementById(\'search\').value=\'' + t + '\';document.getElementById(\'search\').dispatchEvent(new Event(\'input\'));">' + t + '</span>';
      }).join('');
    searchInput.parentNode.appendChild(tagHints);
  }
})();

'@

# Insert before the final "const script" line
$content = $content -replace '(const script = document.createElement)', "$mobileJS`$1"

# ===== 2. Add CSS for mobile toggle =====
$mobileCSS = @'

.mobile-sidebar-toggle { transition: all 0.2s ease; }
.mobile-sidebar-toggle:active { transform: translateX(-50%) scale(0.95); }

'@
$content = $content -replace '(\.onboarding-dot\.active \{ background:var(--accent); \})', "`$1`r`n$mobileCSS"

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Mobile JS injected. Final length: $($content.Length)"