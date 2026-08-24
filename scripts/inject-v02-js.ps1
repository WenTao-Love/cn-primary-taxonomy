# v0.2 Theme Toggle + Onboarding + Terminology JS Injection
$ErrorActionPreference = "Stop"

$file = "D:\xcode\fgit\cn-primary-taxonomy\cn-primary-taxonomy.html"
$content = Get-Content -Path $file -Raw -Encoding UTF8

# ===== 1. Inject theme toggle + onboarding JS before final </script> =====
$jsCode = @'

// ===== v0.2 主题切换 + 首次使用引导 =====
(function() {
  // 主题切换
  var themeToggle = document.getElementById('theme-toggle');
  var currentTheme = localStorage.getItem('cnpt-theme') || 'light';
  function applyTheme(theme) {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('cnpt-theme', theme);
  }
  applyTheme(currentTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(currentTheme);
    });
  }

  // 首次使用引导 (3步)
  var onboardingSteps = [
    {
      title: '👋 欢迎来到知识图谱',
      html: '<div class="onboarding-step"><span class="onboarding-num">1</span><span>每个圆点代表一个<b>知识点</b>，比如"乘法口诀"、"部首查字法"。</span></div><div class="onboarding-step"><span class="onboarding-num">2</span><span>红色连线表示"必须先学会"，黄色表示"先学了更容易"。</span></div><div class="onboarding-step"><span class="onboarding-num">3</span><span>点开任意知识点，就能看到怎么辅导孩子。</span></div>'
    },
    {
      title: '🔍 找到孩子不会的点',
      html: '<div class="onboarding-step"><span class="onboarding-num">1</span><span>用<b>搜索框</b>直接搜关键词，比如"乘法"、"作文"。</span></div><div class="onboarding-step"><span class="onboarding-num">2</span><span>或者告诉<b>学习助手</b>："孩子乘法口诀不熟"，它会帮你找到该先补什么。</span></div><div class="onboarding-step"><span class="onboarding-num">3</span><span>也可以用<b>筛选器</b>按年级、学科缩小范围。</span></div>'
    },
    {
      title: '📖 看怎么辅导娃',
      html: '<div class="onboarding-step"><span class="onboarding-num">1</span><span>点开右侧详情，看<b>"先补什么"</b>——这是孩子卡住的原因。</span></div><div class="onboarding-step"><span class="onboarding-num">2</span><span>看<b>"家长辅导建议"</b>——一句句照着念就行。</span></div><div class="onboarding-step"><span class="onboarding-num">3</span><span>根据孩子掌握情况，只补1-3个前置点，不要全图都学一遍。</span></div>'
    }
  ];
  var onboardingOverlay = document.getElementById('onboarding-overlay');
  var onboardingContent = document.getElementById('onboarding-content');
  var onboardingTitle = document.getElementById('onboarding-title');
  var onboardingNext = document.getElementById('onboarding-next');
  var onboardingSkip = document.getElementById('onboarding-skip');
  var onboardingDots = document.getElementById('onboarding-dots');
  var onboardingStep = 0;

  function showOnboardingStep(n) {
    onboardingTitle.textContent = onboardingSteps[n].title;
    onboardingContent.innerHTML = onboardingSteps[n].html;
    onboardingDots.innerHTML = onboardingSteps.map(function(_, i) {
      return '<span class="onboarding-dot' + (i === n ? ' active' : '') + '"></span>';
    }).join('');
    onboardingNext.textContent = n === onboardingSteps.length - 1 ? '开始使用' : '下一步';
  }

  function closeOnboarding() {
    onboardingOverlay.classList.remove('show');
    localStorage.setItem('cnpt-onboarding-done', '1');
  }

  if (onboardingOverlay && !localStorage.getItem('cnpt-onboarding-done')) {
    showOnboardingStep(0);
    onboardingOverlay.classList.add('show');
  }

  if (onboardingNext) {
    onboardingNext.addEventListener('click', function() {
      if (onboardingStep < onboardingSteps.length - 1) {
        onboardingStep++;
        showOnboardingStep(onboardingStep);
      } else {
        closeOnboarding();
      }
    });
  }
  if (onboardingSkip) {
    onboardingSkip.addEventListener('click', closeOnboarding);
  }
})();

'@

# Insert before the final </script>
$content = $content -replace '(\r?\n<script src=)', "$jsCode`r`n<script src="

Write-Host "JS injected. New length: $($content.Length)"

# ===== 2. Replace technical terms in renderSidebar output =====
# "前置依赖（要先学会这些 ↓）" → "先学这些，才能学会上面的"
$content = $content -replace '📚 前置依赖（要先学会这些 ↓）', '📚 先学这些，才能学会上面的'
# "解锁后续（学完可以学这些 ↑）" → "学会上面的，就能接着学这些"
$content = $content -replace '🚀 解锁后续（学完可以学这些 ↑）', '🚀 学会上面的，就能接着学这些'

# "先补什么" → 保持不变（已经够友好）
# "建议补什么" → 保持不变
# "这一步学稳后能带动什么" → "学会这个，还能帮到其他"

# "必须先补" → keep
# 硬依赖术语：🔴 already used, keep
# 软依赖术语: 🟡 already used, keep

# "强依赖（必须先掌握）" in legend → "必须先学会才能往下学"
$content = $content -replace '强依赖（必须先掌握）', '必须先学会才能往下学'
# "弱依赖（有帮助）" → "先学了更容易"
$content = $content -replace '弱依赖（有帮助）', '先学了更容易'

# "relationTone" function - hard/soft display
$content = $content -replace "relationTone\(item\.link\.strength\)", "item.link.strength === 'hard' ? '必须先学会' : '先学了更容易'"

# Sidebar "chain-item hard/soft" class labels
# The "硬依赖" / "软依赖" text in chain items - already handled by the emoji+relationTone

# "常见易错点" - keep
# "常见考法" - keep
# "家长测评话术" - keep
# "掌握的证据（会什么就算掌握了）" → "学会了的标志（做到这些就算会了）"
$content = $content -replace '✓ 掌握的证据（会什么就算掌握了）', '✓ 学会了的标志（做到这些就算会了）'
# "建议练习链" → keep
# "建议测评任务" → keep
# "分技能测评 Rubric" → "分能力水平说明"
$content = $content -replace '📏 分技能测评 Rubric', '📏 分能力水平说明'
# "学科评价框架" → keep

# "这个知识点没有显式前置" → "这个点没有必须先学的基础"
$content = $content -replace '这个知识点没有显式前置，可直接从当前节点开始练', '这个点没有必须先学的基础，可以直接从这里开始'

# "当前节点后续解锁范围较小" → "学完这个，暂时没有紧跟着要学的"
$content = $content -replace '当前节点后续解锁范围较小，可以先把本点练扎实', '学完这个，暂时没有紧跟着要学的，先把当前练扎实'

# "无前置，是起始知识点" → "这是最基础的一课，可以直接学"
$content = $content -replace '（无前置，是起始知识点）', '（这是最基础的一课，可以直接学）'
# "无后续，是终点知识点" → "这是当前阶段最后一步啦"
$content = $content -replace '（无后续，是终点知识点）', '（这是当前阶段最后一步啦）'

# "先补什么" in relation-card → keep
# In the relation summary
$content = $content -replace '<b>先补什么：</b>', '<b>🔴 要先学会：</b>'
$content = $content -replace '<b>建议补什么：</b>', '<b>🟡 先学了更容易：</b>'
$content = $content -replace '<b>这一步学稳后能带动什么：</b>', '<b>学会这个还能带动：</b>'

# "当前没有"必须先补"的显式前置" → "没有必须先学的"
$content = $content -replace '当前没有"必须先补"的显式前置，可直接从本节点练起', '没有必须先学的，可以直接从这里练起'
# "当前没有额外"建议先补"的辅助前置" → "没有建议先学的"
$content = $content -replace '当前没有额外"建议先补"的辅助前置', '没有额外建议先学的'

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Final length: $($content.Length)"
Write-Host "SUCCESS: Theme JS, onboarding, and friendly terminology injected."
