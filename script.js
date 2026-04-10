const STORAGE_KEY = 'universal-editor-pro';

const i18n = {
  zh: {
    title: '全能编辑器 Pro',
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
    autosaveReady: '自动保存已开启',
    autosaveSaved: '已自动保存',
    themeLight: '浅色',
    themeDark: '深色',
    downloadNameMarkdown: '编辑内容.md',
    downloadNameJson: 'formatted.json'
  },
  en: {
    title: 'Universal Editor Pro',
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
    autosaveReady: 'Auto-save is enabled',
    autosaveSaved: 'Saved automatically',
    themeLight: 'Light',
    themeDark: 'Dark',
    downloadNameMarkdown: 'editor-content.md',
    downloadNameJson: 'formatted.json'
  }
};

const sampleContent = {
  markdown: `# Universal Editor Pro

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
  "name": "Universal Editor Pro",
  "version": 2,
  "features": ["live preview", "autosave", "theme switch", "i18n"],
  "active": true,
  "meta": {
    "author": "OpenAI",
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
    button.classList.toggle('active', button.dataset.mode === state.mode);
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
    const formatted = JSON.stringify(parsed, null, 2);
    els.preview.innerHTML = `
      <div class="json-preview">
        <div class="json-line-numbers" id="jsonLineNumbers">${generateJsonLines(formatted)}</div>
        <div class="json-content" id="jsonContent">${highlightJson(formatted)}</div>
      </div>
    `;

    const jsonContent = document.getElementById('jsonContent');
    const jsonLineNumbers = document.getElementById('jsonLineNumbers');
    jsonContent.addEventListener('scroll', () => {
      jsonLineNumbers.scrollTop = jsonContent.scrollTop;
    });
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

function generateJsonLines(text) {
  const lineCount = Math.max(1, text.split('\n').length);
  return Array.from({ length: lineCount }, (_, index) => (
    `<div class="json-line-item">${index + 1}</div>`
  )).join('');
}

function highlightJson(jsonText) {
  return escapeHtml(jsonText)
    .replace(/"([^"\\]*(?:\\.[^"\\]*)*)"(?=\s*:)/g, '<span class="json-key">"$1"</span>')
    .replace(/:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/:\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g, ': <span class="json-number">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>');
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
