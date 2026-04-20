const STORAGE_KEY = 'editor-pro';

const i18n = {
  zh: {
    title: 'Editor-Pro',
    eyebrow: 'Elegant / Modular / Live Preview',
    subtitle: 'Markdown、LaTeX 与 JSON 格式化，一页完成。',
    modeMarkdown: 'Markdown + LaTeX',
    modeJson: 'JSON 格式化',
    copyBtn: '复制内容',
    importBtn: '导入文件',
    downloadBtn: '导出文件',
    inputPanel: '输入区',
    previewPanel: '预览区',
    hintMarkdown: '支持 Markdown 和 LaTeX 公式',
    hintJson: '自动校验并格式化 JSON',
    previewLive: '实时渲染',
    previewTip: '优雅阅读视图',
    placeholderMarkdown: '在这里输入 Markdown 与 LaTeX 内容...',
    placeholderJson: '在这里输入 JSON 文本...',
    toastCopied: '复制成功',
    toastCopyFailed: '复制失败，请手动复制',
    toastImported: '文件已导入',
    toastExported: '文件已导出',
    invalidJson: 'JSON 解析错误',
    jsonFoldExpand: '展开',
    jsonFoldCollapse: '收起',
    autosaveReady: '自动保存已开启',
    autosaveSaved: '已自动保存',
    themeLight: '浅色',
    themeDark: '深色',
    downloadNameMarkdown: '编辑内容.md',
    downloadNameJson: 'formatted.json'
  },
  en: {
    title: 'Editor-Pro',
    eyebrow: 'Elegant / Modular / Live Preview',
    subtitle: 'Markdown, LaTeX, and JSON formatting in one clean workspace.',
    modeMarkdown: 'Markdown + LaTeX',
    modeJson: 'JSON Formatter',
    copyBtn: 'Copy Content',
    importBtn: 'Import File',
    downloadBtn: 'Export File',
    inputPanel: 'Input',
    previewPanel: 'Preview',
    hintMarkdown: 'Supports Markdown and LaTeX formulas',
    hintJson: 'Validate and format JSON automatically',
    previewLive: 'Live preview',
    previewTip: 'Elegant reading view',
    placeholderMarkdown: 'Type Markdown and LaTeX content here...',
    placeholderJson: 'Type JSON here...',
    toastCopied: 'Copied successfully',
    toastCopyFailed: 'Copy failed, please copy manually',
    toastImported: 'File imported',
    toastExported: 'File exported',
    invalidJson: 'JSON parse error',
    jsonFoldExpand: 'Expand',
    jsonFoldCollapse: 'Collapse',
    autosaveReady: 'Auto-save is enabled',
    autosaveSaved: 'Saved automatically',
    themeLight: 'Light',
    themeDark: 'Dark',
    downloadNameMarkdown: 'editor-content.md',
    downloadNameJson: 'formatted.json'
  }
};

const sampleContent = {
  markdown: `# Editor-Pro

## Why this version feels better
- Cleaner visual hierarchy
- Better bilingual typography
- Local auto-save
- Import / export support
- Draggable split layout

Inline formula: $E = mc^2$

Block formula:
$$
\int_{-\infty}^{+\infty} e^{-x^2} dx = \sqrt{\pi}
$$`,
  json: `{
  "name": "Editor-Pro",
  "version": 2,
  "features": ["live preview", "autosave", "theme switch", "i18n"],
  "active": true,
  "meta": {
    "author": "luckyk255",
    "score": 9.5,
    "notes": null
  }
}`
};

const state = {
  mode: 'markdown',
  lang: 'zh',
  theme: 'light',
  content: {
    markdown: sampleContent.markdown,
    json: sampleContent.json
  },
  splitRatio: 0.5
};

const els = {};

window.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  restoreState();
  bindEvents();
  applyTheme();
  applyLanguage();
  loadCurrentModeContent();
  renderLineNumbers();
  renderPreview();
  applySplitRatio();
});

function cacheElements() {
  els.editor = document.getElementById('editor');
  els.preview = document.getElementById('preview');
  els.modeGroup = document.getElementById('modeGroup');
  els.editorLineNumbers = document.getElementById('editorLineNumbers');
  els.copyBtn = document.getElementById('copyBtn');
  els.downloadBtn = document.getElementById('downloadBtn');
  els.fileInput = document.getElementById('fileInput');
  els.langToggle = document.getElementById('langToggle');
  els.themeToggle = document.getElementById('themeToggle');
  els.toast = document.getElementById('toast');
  els.modeHint = document.getElementById('modeHint');
  els.saveStatus = document.getElementById('saveStatus');
  els.workspace = document.getElementById('workspace');
  els.splitter = document.getElementById('splitter');
}

function bindEvents() {
  els.editor.addEventListener('input', onEditorInput);
  els.editor.addEventListener('scroll', syncEditorLineNumbers);
  els.copyBtn.addEventListener('click', copyContent);
  els.downloadBtn.addEventListener('click', exportContent);
  els.fileInput.addEventListener('change', importFile);
  els.langToggle.addEventListener('click', toggleLanguage);
  els.themeToggle.addEventListener('click', toggleTheme);
  els.modeGroup.addEventListener('click', (event) => {
    const target = event.target.closest('[data-mode]');
    if (!target) return;
    switchMode(target.dataset.mode);
  });
  bindSplitterEvents();
}

function onEditorInput() {
  state.content[state.mode] = els.editor.value;
  renderLineNumbers();
  renderPreview();
  persistState('autosaveSaved');
}

function switchMode(mode) {
  if (mode === state.mode) return;
  state.content[state.mode] = els.editor.value;
  state.mode = mode;
  loadCurrentModeContent();
  updateModeButtons();
  updatePlaceholders();
  updateHints();
  renderLineNumbers();
  renderPreview();
  persistState();
}

function toggleLanguage() {
  state.lang = state.lang === 'zh' ? 'en' : 'zh';
  applyLanguage();
  updateHints();
  updatePlaceholders();
  renderPreview();
  persistState();
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
  persistState();
}

function applyLanguage() {
  document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = t(key);
  });
  els.langToggle.textContent = state.lang === 'zh' ? 'EN' : '中';
  els.themeToggle.textContent = state.theme === 'light' ? t('themeDark') : t('themeLight');
  els.saveStatus.textContent = t('autosaveReady');
  updateModeButtons();
  updatePlaceholders();
}

function applyTheme() {
  document.body.dataset.theme = state.theme;
  if (els.themeToggle) {
    els.themeToggle.textContent = state.theme === 'light' ? t('themeDark') : t('themeLight');
  }
}

function updateModeButtons() {
  document.querySelectorAll('[data-mode]').forEach((button) => {
    const active = button.dataset.mode === state.mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function updatePlaceholders() {
  els.editor.placeholder = state.mode === 'markdown' ? t('placeholderMarkdown') : t('placeholderJson');
}

function updateHints() {
  els.modeHint.textContent = state.mode === 'markdown' ? t('hintMarkdown') : t('hintJson');
}

function loadCurrentModeContent() {
  els.editor.value = state.content[state.mode];
  els.editor.scrollTop = 0;
  syncEditorLineNumbers();
}

function renderLineNumbers() {
  const lineCount = Math.max(1, els.editor.value.split('\n').length);
  els.editorLineNumbers.innerHTML = Array.from({ length: lineCount }, (_, index) => (
    `<div class="line-number-item">${index + 1}</div>`
  )).join('');
  syncEditorLineNumbers();
}

function syncEditorLineNumbers() {
  els.editorLineNumbers.scrollTop = els.editor.scrollTop;
}

function renderPreview() {
  const raw = els.editor.value.trim();
  if (state.mode === 'markdown') {
    renderMarkdown(raw);
    return;
  }
  renderJson(raw);
}

function renderMarkdown(content) {
  els.preview.className = 'preview markdown-body';
  marked.setOptions({ gfm: true, breaks: true, smartypants: false });
  els.preview.innerHTML = marked.parse(content || '# ...');

  if (window.MathJax?.typesetPromise) {
    MathJax.typesetClear([els.preview]);
    MathJax.typesetPromise([els.preview]).catch((error) => {
      console.error('MathJax render failed:', error);
    });
  }
}

function renderJson(content) {
  els.preview.className = 'preview';
  try {
    const parsed = JSON.parse(content || '{}');
    els.preview.innerHTML = `
      <div class="json-preview json-tree-preview">
        <div class="json-line-numbers" id="jsonLineNumbers"></div>
        <div class="json-content json-tree-content" id="jsonContent"></div>
      </div>
    `;

    const jsonContent = document.getElementById('jsonContent');
    const jsonLineNumbers = document.getElementById('jsonLineNumbers');
    const collapsedPaths = collectCollapsedPaths(els.preview);
    jsonContent.innerHTML = renderJsonTree(parsed, 0, '', true, '$', collapsedPaths);
    updateJsonLineNumbers();
    jsonContent.addEventListener('scroll', () => {
      jsonLineNumbers.scrollTop = jsonContent.scrollTop;
    });
    jsonContent.addEventListener('click', onJsonTreeClick);
  } catch (error) {
    const safeContent = escapeHtml(content);
    els.preview.innerHTML = `
      <div class="json-preview">
        <div class="json-line-numbers"></div>
        <div class="json-content"><span class="json-error">${t('invalidJson')}: ${escapeHtml(error.message)}</span>\n${safeContent}</div>
      </div>
    `;
  }
}

function collectCollapsedPaths(container) {
  return new Set(
    Array.from(container.querySelectorAll('.json-node[data-collapsed="true"][data-json-path]'), (node) => node.dataset.jsonPath)
  );
}

function onJsonTreeClick(event) {
  const explicitToggle = event.target.closest('[data-json-toggle]');
  const clickedRow = event.target.closest('.json-row');
  const node = (explicitToggle || clickedRow)?.closest('.json-node');
  if (!node) return;

  // Allow clicking the opening row (not the closing row) to toggle collapse,
  // similar to common JSON viewers.
  if (!explicitToggle) {
    if (!clickedRow) return;
    if (clickedRow.classList.contains('json-closing-row')) return;
    if (clickedRow.parentElement !== node) return;
  }

  const collapsed = node.dataset.collapsed === 'true';
  node.dataset.collapsed = collapsed ? 'false' : 'true';
  const toggle = node.querySelector('[data-json-toggle]');
  if (toggle) {
    toggle.setAttribute('aria-expanded', collapsed ? 'true' : 'false');
    toggle.setAttribute('aria-label', collapsed ? t('jsonFoldCollapse') : t('jsonFoldExpand'));
  }
  const jsonContent = document.getElementById('jsonContent');
  const jsonLineNumbers = document.getElementById('jsonLineNumbers');
  if (jsonContent && jsonLineNumbers) {
    updateJsonLineNumbers();
    jsonLineNumbers.scrollTop = jsonContent.scrollTop;
  }
}

function renderJsonTree(value, depth = 0, key = '', isLast = true, path = '$', collapsedPaths = new Set()) {
  if (Array.isArray(value)) {
    return renderJsonCollection(value, depth, key, isLast, '[', ']', false, path, collapsedPaths);
  }

  if (value && typeof value === 'object') {
    return renderJsonCollection(Object.entries(value), depth, key, isLast, '{', '}', true, path, collapsedPaths);
  }

  return renderJsonPrimitiveRow(value, depth, key, isLast);
}

function renderJsonCollection(value, depth, key, isLast, open, close, isObject, path, collapsedPaths) {
  const items = isObject ? value : value.map((item, index) => [String(index), item]);
  const count = items.length;
  const summary = `${open === '{' ? count + ' keys' : count + ' items'}`;
  const collapsed = collapsedPaths.has(path);
  const children = count === 0
    ? ''
    : items.map(([childKey, childValue], index) => {
      const childPath = isObject ? `${path}.${childKey}` : `${path}[${index}]`;
      return renderJsonTree(childValue, depth + 1, isObject ? childKey : '', index === count - 1, childPath, collapsedPaths);
    }).join('');

  return `
    <div class="json-node" data-json-path="${escapeHtml(path)}" data-collapsed="${collapsed ? 'true' : 'false'}">
      <div class="json-row" style="--json-depth:${depth}">
        <button type="button" class="json-toggle" data-json-toggle aria-expanded="${collapsed ? 'false' : 'true'}" aria-label="${collapsed ? t('jsonFoldExpand') : t('jsonFoldCollapse')}"></button>
        ${renderJsonKey(key)}<span class="json-bracket">${open}</span>
        <span class="json-summary">${escapeHtml(summary)}</span>
        <span class="json-collapsed-inline"><span class="json-ellipsis">…</span><span class="json-bracket">${close}</span>${isLast ? '' : '<span class="json-comma">,</span>'}</span>
      </div>
      <div class="json-children">${children}</div>
      <div class="json-row json-closing-row" style="--json-depth:${depth}">
        <span class="json-toggle-spacer"></span><span class="json-bracket">${close}</span>${isLast ? '' : '<span class="json-comma">,</span>'}
      </div>
    </div>
  `;
}

function generateJsonLines(text) {
  const lineCount = Math.max(1, text.split('\n').length);
  return Array.from({ length: lineCount }, (_, index) => (
    `<div class="json-line-item">${index + 1}</div>`
  )).join('');
}

function updateJsonLineNumbers() {
  const jsonContent = document.getElementById('jsonContent');
  const jsonLineNumbers = document.getElementById('jsonLineNumbers');
  if (!jsonContent || !jsonLineNumbers) return;

  const rows = Array.from(jsonContent.querySelectorAll('.json-row'))
    .filter((row) => row.offsetParent !== null);
  const lineCount = Math.max(1, rows.length);
  jsonLineNumbers.innerHTML = Array.from({ length: lineCount }, (_, index) => (
    `<div class="json-line-item">${index + 1}</div>`
  )).join('');
}

function renderJsonPrimitiveRow(value, depth, key, isLast) {
  return `
    <div class="json-row" style="--json-depth:${depth}">
      <span class="json-toggle-spacer"></span>
      ${renderJsonKey(key)}${highlightJsonValue(value)}${isLast ? '' : '<span class="json-comma">,</span>'}
    </div>
  `;
}

function renderJsonKey(key) {
  if (!key) return '';
  return `<span class="json-key">"${escapeHtml(key)}"</span><span class="json-colon">: </span>`;
}

function highlightJsonValue(value) {
  if (typeof value === 'string') {
    return `<span class="json-string">"${escapeHtml(value)}"</span>`;
  }

  if (typeof value === 'number') {
    return `<span class="json-number">${String(value)}</span>`;
  }

  if (typeof value === 'boolean') {
    return `<span class="json-boolean">${String(value)}</span>`;
  }

  if (value === null) {
    return '<span class="json-null">null</span>';
  }

  return `<span>${escapeHtml(JSON.stringify(value))}</span>`;
}

async function copyContent() {
  try {
    await navigator.clipboard.writeText(els.editor.value);
    showToast(t('toastCopied'));
  } catch (error) {
    showToast(t('toastCopyFailed'));
  }
}

function exportContent() {
  let content = els.editor.value;
  if (state.mode === 'json') {
    try {
      content = JSON.stringify(JSON.parse(content || '{}'), null, 2);
    } catch (_) {
      // keep raw content when invalid
    }
  }

  const filename = state.mode === 'markdown' ? t('downloadNameMarkdown') : t('downloadNameJson');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast(t('toastExported'));
}

async function importFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const text = await file.text();
  state.content[state.mode] = text;
  els.editor.value = text;
  renderLineNumbers();
  renderPreview();
  persistState();
  showToast(t('toastImported'));
  event.target.value = '';
}

function bindSplitterEvents() {
  let isDragging = false;

  const onPointerMove = (event) => {
    if (!isDragging || window.innerWidth <= 980) return;
    const rect = els.workspace.getBoundingClientRect();
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0.25, 0.75);
    state.splitRatio = ratio;
    applySplitRatio();
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    isDragging = false;
    els.splitter.classList.remove('is-dragging');
    document.body.style.userSelect = '';
    persistState();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  els.splitter.addEventListener('pointerdown', () => {
    if (window.innerWidth <= 980) return;
    isDragging = true;
    els.splitter.classList.add('is-dragging');
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  });
}

function applySplitRatio() {
  if (window.innerWidth <= 980) return;
  const left = `${Math.round(state.splitRatio * 1000) / 10}%`;
  const right = `${Math.round((1 - state.splitRatio) * 1000) / 10}%`;
  els.workspace.style.gridTemplateColumns = `minmax(320px, ${left}) 12px minmax(320px, ${right})`;
}

function persistState(statusKey = null) {
  const payload = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, payload);
  if (statusKey) {
    els.saveStatus.textContent = t(statusKey);
    window.clearTimeout(persistState.timer);
    persistState.timer = window.setTimeout(() => {
      els.saveStatus.textContent = t('autosaveReady');
    }, 1500);
  }
}

function restoreState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.mode) state.mode = parsed.mode;
    if (parsed?.lang) state.lang = parsed.lang;
    if (parsed?.theme) state.theme = parsed.theme;
    if (parsed?.splitRatio) state.splitRatio = clamp(parsed.splitRatio, 0.25, 0.75);
    if (parsed?.content?.markdown) state.content.markdown = parsed.content.markdown;
    if (parsed?.content?.json) state.content.json = parsed.content.json;
  } catch (error) {
    console.warn('Restore state failed:', error);
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove('show');
  }, 1800);
}

function t(key) {
  return i18n[state.lang][key] ?? key;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
