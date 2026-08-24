# v0.2 Textbook Chapter View + Assessment enhancement
$ErrorActionPreference = "Stop"

$file = "D:\xcode\fgit\cn-primary-taxonomy\cn-primary-taxonomy.html"
$content = Get-Content -Path $file -Raw -Encoding UTF8

# ===== 1. Add chapter view CSS =====
$chapterCSS = @'

/* ===== v0.2 教材章节视图 ===== */
.chapter-view-toggle {
  position: absolute; top: 16px; right: 60px; z-index: 15;
  padding: 6px 14px; border-radius: 999px; border: 1px solid var(--line);
  background: var(--surface); color: var(--ink); font-size: 13px;
  cursor: pointer; font-weight: 600; box-shadow: var(--shadow);
  transition: all 0.2s ease;
}
.chapter-view-toggle:hover { border-color: var(--accent); color: var(--accent); }
.chapter-view-toggle.active { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
.chapter-panel {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: var(--bg); z-index: 12; overflow-y: auto;
  display: none; padding: 24px;
}
.chapter-panel.show { display: block; }
.chapter-panel h2 { font-size: 18px; margin-bottom: 16px; color: var(--ink); }
.chapter-tree { font-size: 14px; line-height: 2; }
.chapter-tree .grade-level { font-weight: 700; font-size: 16px; color: var(--accent); margin-top: 16px; }
.chapter-tree .subject-level { font-weight: 600; color: var(--ink-2); margin-left: 16px; margin-top: 8px; }
.chapter-tree .chapter-level { color: var(--ink); margin-left: 32px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.chapter-tree .chapter-level:hover { background: var(--blue-soft); }
.chapter-tree .chapter-count { color: var(--muted); font-size: 12px; margin-left: 8px; }
.chapter-back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; border: 1px solid var(--line);
  background: var(--surface); color: var(--ink); font-size: 13px;
  cursor: pointer; margin-bottom: 16px; font-weight: 600;
}
.chapter-back-btn:hover { background: var(--surface-2); }

'@
$content = $content -replace '(\.mobile-sidebar-toggle \{ transition: all 0\.2s ease; \})', "`$1`r`n$chapterCSS"

# ===== 2. Add chapter view HTML =====
$chapterHTML = @'

<!-- 教材章节视图 -->
<button class="chapter-view-toggle" id="chapter-view-toggle" type="button">📚 按教材看</button>
<div class="chapter-panel" id="chapter-panel">
  <button class="chapter-back-btn" id="chapter-back-btn">← 返回图谱</button>
  <h2>📚 按教材单元浏览</h2>
  <div class="chapter-tree" id="chapter-tree"></div>
</div>

'@
$content = $content -replace '(<svg id="canvas"></svg>)', "`$1`r`n$chapterHTML"

# ===== 3. Add chapter view JS =====
$chapterJS = @'

// ===== v0.2 教材章节目录视图 =====
(function() {
  var toggle = document.getElementById('chapter-view-toggle');
  var panel = document.getElementById('chapter-panel');
  var tree = document.getElementById('chapter-tree');
  var backBtn = document.getElementById('chapter-back-btn');
  var svgCanvas = document.getElementById('canvas');
  
  function buildChapterTree() {
    if (!fullData || !fullData.topics) return;
    var topics = fullData.topics.topics;
    // Group by grade > subject > chapter
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
    var grades = Object.keys(grouped).sort();
    grades.forEach(function(grade) {
      html += '<div class="grade-level">' + grade + '</div>';
      var subjects = Object.keys(grouped[grade]).sort();
      subjects.forEach(function(subj) {
        html += '<div class="subject-level">' + subj + '</div>';
        var chapters = Object.keys(grouped[grade][subj]).sort();
        chapters.forEach(function(ch) {
          var count = grouped[grade][subj][ch].length;
          var firstTopic = grouped[grade][subj][ch][0];
          html += '<div class="chapter-level" data-topic-id="' + firstTopic.id + '">' + 
                   ch + '<span class="chapter-count">(' + count + '个知识点)</span></div>';
        });
      });
    });
    tree.innerHTML = html;
    // Add click handlers
    tree.querySelectorAll('.chapter-level').forEach(function(el) {
      el.addEventListener('click', function() {
        var id = el.dataset.topicId;
        if (id) {
          panel.classList.remove('show');
          toggle.classList.remove('active');
          focusTopicById(id);
        }
      });
    });
  }
  
  toggle.addEventListener('click', function() {
    var showing = panel.classList.contains('show');
    if (showing) {
      panel.classList.remove('show');
      toggle.classList.remove('active');
    } else {
      panel.classList.add('show');
      toggle.classList.add('active');
      if (!tree.innerHTML) buildChapterTree();
    }
  });
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      panel.classList.remove('show'); toggle.classList.remove('active');
    });
  }
})();

// ===== v0.2 测评话术增强：无数据时动态生成 =====
(function() {
  var originalRenderSidebar = window.renderSidebar;
  if (!originalRenderSidebar) return;
  window.renderSidebar = function(topic) {
    // Auto-generate assessmentPrompt if missing
    if (!topic.assessmentPrompt && topic.commonMistakes && topic.commonMistakes.length) {
      var name = topic.name;
      var mistake = topic.commonMistakes[0];
      var practice = (topic.practiceChain && topic.practiceChain[0]) || (topic.assessmentTasks && topic.assessmentTasks[0]);
      var ev = (topic.evidence && topic.evidence[0]) || '';
      var generated = '给孩子出一道"' + name + '"相关的题，观察他：①能不能独立想起来？②做的时候有没有犯"' + mistake + (practice ? '"？③带着再做一次"' + practice : '') + '"，看能不能纠正。' + (ev ? '做到"' + ev + '"就算掌握了。' : '');
      // Temporarily set for display
      topic.assessmentPrompt = generated;
    }
    originalRenderSidebar(topic);
  };
})();

'@

# Insert before "const script" line
$content = $content -replace '(const script = document.createElement)', "$chapterJS`$1"

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Chapter view + assessment enhancement injected. Final length: $($content.Length)"