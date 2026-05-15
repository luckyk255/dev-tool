const STORAGE_KEY = 'editor-pro';

const i18n = {
  zh: {
    title: 'Editor-Pro',
    eyebrow: 'Elegant / Modular / Live Preview',
    subtitle: 'Markdown、LaTeX、JSON 与 SQL 格式化，一页完成。',
    modeMarkdown: 'Markdown + LaTeX',
    modeJson: 'JSON 格式化',
    modeSql: 'SQL 格式化',
    copyBtn: '复制内容',
    importBtn: '导入文件',
    downloadBtn: '导出文件',
    inputPanel: '输入区',
    previewPanel: '预览区',
    hintMarkdown: '支持 Markdown 和 LaTeX 公式',
    hintJson: '自动校验并格式化 JSON',
    hintSql: '自动格式化 SQL 语句',
    previewLive: '实时渲染',
    previewTip: '优雅阅读视图',
    placeholderMarkdown: '在这里输入 Markdown 与 LaTeX 内容...',
    placeholderJson: '在这里输入 JSON 文本...',
    placeholderSql: '在这里输入 SQL 语句...',
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
    downloadNameJson: 'formatted.json',
    downloadNameSql: 'formatted.sql'
  },
  en: {
    title: 'Editor-Pro',
    eyebrow: 'Elegant / Modular / Live Preview',
    subtitle: 'Markdown, LaTeX, JSON, and SQL formatting in one clean workspace.',
    modeMarkdown: 'Markdown + LaTeX',
    modeJson: 'JSON Formatter',
    modeSql: 'SQL Formatter',
    copyBtn: 'Copy Content',
    importBtn: 'Import File',
    downloadBtn: 'Export File',
    inputPanel: 'Input',
    previewPanel: 'Preview',
    hintMarkdown: 'Supports Markdown and LaTeX formulas',
    hintJson: 'Validate and format JSON automatically',
    hintSql: 'Format SQL statements automatically',
    previewLive: 'Live preview',
    previewTip: 'Elegant reading view',
    placeholderMarkdown: 'Type Markdown and LaTeX content here...',
    placeholderJson: 'Type JSON here...',
    placeholderSql: 'Type SQL here...',
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
    downloadNameJson: 'formatted.json',
    downloadNameSql: 'formatted.sql'
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
}`,
  sql: `SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count, SUM(o.total) AS total_amount FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= '2024-01-01' AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_amount DESC LIMIT 20;`
};

const state = {
  mode: 'markdown',
  lang: 'zh',
  theme: 'light',
  content: {
    markdown: sampleContent.markdown,
    json: sampleContent.json,
    sql: sampleContent.sql
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
  const map = { markdown: 'placeholderMarkdown', json: 'placeholderJson', sql: 'placeholderSql' };
  els.editor.placeholder = t(map[state.mode] ?? 'placeholderMarkdown');
}

function updateHints() {
  const map = { markdown: 'hintMarkdown', json: 'hintJson', sql: 'hintSql' };
  els.modeHint.textContent = t(map[state.mode] ?? 'hintMarkdown');
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
  if (state.mode === 'sql') {
    renderSql(raw);
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

function getSqlLineClass(line) {
  const t = line.trimStart().toUpperCase();
  if (!t) return 'sql-line--blank';
  if (t.startsWith('SELECT')) return 'sql-line--select';
  if (t.startsWith('WITH')) return 'sql-line--with';
  if (t.startsWith('INSERT') || t.startsWith('UPDATE') || t.startsWith('DELETE')) return 'sql-line--dml';
  if (t.startsWith('FROM')) return 'sql-line--from';
  if (t.startsWith('WHERE')) return 'sql-line--where';
  if (t.startsWith('GROUP BY')) return 'sql-line--group';
  if (t.startsWith('ORDER BY')) return 'sql-line--order';
  if (t.startsWith('HAVING')) return 'sql-line--having';
  if (t.startsWith('LIMIT') || t.startsWith('OFFSET')) return 'sql-line--limit';
  if (t.startsWith('ON ')) return 'sql-line--on';
  if (t.startsWith('AND') || t.startsWith('OR ')) return 'sql-line--logic';
  if (/^(LEFT|RIGHT|INNER|FULL|CROSS|NATURAL)\b/.test(t) || t.startsWith('JOIN ')) return 'sql-line--join';
  return 'sql-line--detail';
}

function renderSql(content) {
  els.preview.className = 'preview preview--sql';
  const formatted = content ? formatSql(content) : '';
  const highlighted = highlightSql(formatted);
  const lines = highlighted.split('\n');
  const lineNumbersHtml = lines.map((_, i) => `<div class="sql-line-item">${i + 1}</div>`).join('');
  const contentHtml = lines.map((line) => {
    const lineClass = getSqlLineClass(line);
    return `<div class="sql-line ${lineClass}">${line || ' '}</div>`;
  }).join('');
  els.preview.innerHTML = `
    <div class="sql-preview">
      <div class="sql-line-numbers" aria-hidden="true">${lineNumbersHtml}</div>
      <pre class="sql-code" id="sqlContent"><code>${contentHtml}</code></pre>
    </div>
  `;
  const sqlContent = document.getElementById('sqlContent');
  const sqlLineNumbers = els.preview.querySelector('.sql-line-numbers');
  if (sqlContent && sqlLineNumbers) {
    sqlContent.addEventListener('scroll', () => {
      sqlLineNumbers.scrollTop = sqlContent.scrollTop;
    });
  }
}

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS',
  'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP',
  'ALTER', 'ADD', 'COLUMN', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
  'DEFAULT', 'CONSTRAINT', 'UNIQUE', 'CHECK', 'WITH', 'CASE', 'WHEN', 'THEN', 'ELSE',
  'END', 'IF', 'ASC', 'DESC', 'NULLS', 'FIRST', 'LAST', 'OVER', 'PARTITION',
  'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'COALESCE', 'CAST', 'CONVERT', 'EXTRACT', 'DATE', 'TIMESTAMP', 'INTERVAL',
  'TRUNCATE', 'RETURNING', 'USING', 'LATERAL', 'EXCEPT', 'INTERSECT', 'FETCH', 'NEXT',
  'ROWS', 'ONLY', 'RECURSIVE', 'EXPLAIN', 'ANALYZE'
]);

const SQL_NEWLINE_BEFORE = new Set([
  'SELECT', 'FROM', 'WHERE',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS',
  'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'EXCEPT', 'INTERSECT',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'DROP', 'ALTER',
  'WITH', 'ON', 'RETURNING', 'FETCH'
]);

const JOIN_MODIFIERS = new Set(['LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'NATURAL']);

const SQL_STICKY_NEXT = {
  INSERT: new Set(['INTO']),
  REPLACE: new Set(['INTO']),
  GROUP: new Set(['BY']),
  ORDER: new Set(['BY']),
  DELETE: new Set(['FROM']),
  UNION: new Set(['ALL', 'DISTINCT']),
  EXCEPT: new Set(['ALL']),
  INTERSECT: new Set(['ALL'])
};

const SQL_PAREN_INDENT_AFTER = new Set(['AS', 'IN', 'EXISTS']);

const SQL_SPACE_BEFORE_PAREN = new Set([
  'AS', 'IN', 'VALUES', 'EXISTS', 'INTO', 'FROM', 'WHERE', 'ON', 'WHEN', 'CASE', 'NOT'
]);

const SQL_MAJOR_CLAUSE = new Set([
  'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
  'UNION', 'EXCEPT', 'INTERSECT', 'SET', 'VALUES', 'RETURNING', 'FETCH', 'JOIN'
]);

const SQL_CLAUSE_STARTERS = new Set([
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
  'INSERT', 'UPDATE', 'DELETE', 'WITH', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
  'FULL', 'CROSS', 'NATURAL', 'UNION', 'EXCEPT', 'INTERSECT', 'AND', 'OR', 'ON', 'SET', 'VALUES'
]);

function formatSql(sql) {
  const tokens = tokenizeSql(sql);
  const lines = [];
  let currentLine = '';
  let indentLevel = 0;
  let expectingSelectList = false;
  let parenDepth = 0;

  const indent = (level) => '    '.repeat(Math.max(0, level));

  const clauseBase = () => (parenDepth === 0 ? 0 : Math.max(0, indentLevel - 1));

  const flush = () => {
    const trimmed = currentLine.trimEnd();
    if (trimmed) lines.push(trimmed);
    currentLine = '';
  };

  const appendToken = (value) => {
    const trimmed = currentLine.trimEnd();
    if (!trimmed) {
      currentLine = indent(indentLevel) + value;
      return;
    }
    const lastChar = trimmed[trimmed.length - 1];
    const noSpaceBefore = /^[,.;)]/.test(value) || lastChar === '(';
    currentLine = noSpaceBefore ? trimmed + value : `${trimmed} ${value}`;
  };

  const isTopLevelKeyword = (upper) => (
    ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'WITH'].includes(upper)
  );

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const upper = tok.type === 'keyword' ? tok.value.toUpperCase() : '';

    if (tok.type === 'keyword' && JOIN_MODIFIERS.has(upper)) {
      let j = i;
      const mods = [];
      while (j < tokens.length && tokens[j].type === 'keyword' && JOIN_MODIFIERS.has(tokens[j].value.toUpperCase())) {
        mods.push(tokens[j].value);
        j++;
      }
      if (j < tokens.length && tokens[j].type === 'keyword' && tokens[j].value.toUpperCase() === 'JOIN') {
        flush();
        const base = clauseBase();
        currentLine = indent(base) + [...mods, tokens[j].value].join(' ');
        indentLevel = base + 1;
        i = j;
        continue;
      }
    }

    if (tok.type === 'keyword' && upper === 'ON') {
      flush();
      const base = clauseBase();
      currentLine = indent(base + 1) + tok.value;
      continue;
    }

    if (tok.type === 'keyword' && SQL_NEWLINE_BEFORE.has(upper)) {
      const nextTok = tokens[i + 1];
      const nextUpper = nextTok?.type === 'keyword' ? nextTok.value.toUpperCase() : '';

      if (SQL_STICKY_NEXT[upper]?.has(nextUpper)) {
        const isTopLevel = isTopLevelKeyword(upper) && parenDepth === 0;
        const base = isTopLevel ? 0 : clauseBase();
        flush();
        if (isTopLevel) {
          indentLevel = 0;
          expectingSelectList = upper === 'SELECT';
        }
        currentLine = indent(base) + `${tok.value} ${nextTok.value}`;
        indentLevel = base + 1;
        i += 1;
        continue;
      }

      const isTopLevel = isTopLevelKeyword(upper) && parenDepth === 0;
      const isMajor = SQL_MAJOR_CLAUSE.has(upper);
      const base = isTopLevel ? 0 : (isMajor ? clauseBase() : indentLevel);
      flush();
      if (isTopLevel) {
        indentLevel = 0;
        expectingSelectList = upper === 'SELECT';
      }
      currentLine = indent(base) + tok.value;
      indentLevel = isTopLevel || isMajor ? base + 1 : indentLevel;
      continue;
    }

    if (tok.type === 'punctuation' && tok.value === ',') {
      const trimmed = currentLine.trimEnd();
      currentLine = trimmed.endsWith('(') ? `${trimmed}${tok.value}` : `${trimmed},`;
      if (expectingSelectList && parenDepth === 0) {
        flush();
        currentLine = indent(indentLevel);
      }
      continue;
    }

    if (tok.type === 'punctuation' && tok.value === '(') {
      parenDepth += 1;
      const trimmed = currentLine.trimEnd();
      const prevTok = tokens[i - 1];
      const prevUpper = prevTok?.type === 'keyword' ? prevTok.value.toUpperCase() : '';
      const needsSpace = prevTok?.type === 'identifier' || SQL_SPACE_BEFORE_PAREN.has(prevUpper);
      if (trimmed && needsSpace) {
        currentLine = `${trimmed} (`;
      } else {
        currentLine += '(';
      }
      const nextUpper = tokens[i + 1]?.type === 'keyword' ? tokens[i + 1].value.toUpperCase() : '';
      if (SQL_PAREN_INDENT_AFTER.has(prevUpper) || nextUpper === 'SELECT') {
        flush();
        indentLevel += 1;
        currentLine = indent(indentLevel);
      }
      continue;
    }

    if (tok.type === 'punctuation' && tok.value === ')') {
      const closingSubquery = parenDepth > 0 && indentLevel > 1;
      parenDepth = Math.max(0, parenDepth - 1);
      if (closingSubquery && parenDepth === 0) {
        flush();
        indentLevel -= 1;
        currentLine = indent(indentLevel) + ')';
      } else {
        currentLine += ')';
      }
      continue;
    }

    if (tok.type === 'punctuation' && tok.value === ';') {
      currentLine += ';';
      flush();
      indentLevel = 0;
      parenDepth = 0;
      expectingSelectList = false;
      if (i < tokens.length - 1) lines.push('');
      continue;
    }

    if (tok.type === 'keyword' && (upper === 'AND' || upper === 'OR')) {
      flush();
      const base = clauseBase();
      currentLine = indent(base + 2) + tok.value;
      continue;
    }

    appendToken(tok.value);
  }

  flush();
  return lines.join('\n');
}

function tokenizeSql(sql) {
  const tokens = [];
  let i = 0;
  while (i < sql.length) {
    if (/\s/.test(sql[i])) { i++; continue; }

    if (sql[i] === '-' && sql[i + 1] === '-') {
      let end = sql.indexOf('\n', i);
      if (end === -1) end = sql.length;
      tokens.push({ type: 'comment', value: sql.slice(i, end) });
      i = end;
      continue;
    }

    if (sql[i] === '/' && sql[i + 1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      const finish = end === -1 ? sql.length : end + 2;
      tokens.push({ type: 'comment', value: sql.slice(i, finish) });
      i = finish;
      continue;
    }

    if (sql[i] === "'" || sql[i] === '"' || sql[i] === '`') {
      const quote = sql[i];
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === quote && sql[j - 1] !== '\\') { j++; break; }
        j++;
      }
      const raw = sql.slice(i, j);
      tokens.push({ type: quote === "'" ? 'string' : 'identifier', value: raw });
      i = j;
      continue;
    }

    if (/[0-9]/.test(sql[i]) || (sql[i] === '.' && /[0-9]/.test(sql[i + 1]))) {
      let j = i;
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++;
      tokens.push({ type: 'number', value: sql.slice(i, j) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[a-zA-Z0-9_]/.test(sql[j])) j++;
      // Handle qualified names: schema.table.column
      while (sql[j] === '.' && j + 1 < sql.length && /[a-zA-Z_]/.test(sql[j + 1])) {
        j++;
        while (j < sql.length && /[a-zA-Z0-9_]/.test(sql[j])) j++;
      }
      const word = sql.slice(i, j);
      const isQualified = word.includes('.');
      const firstPart = isQualified ? word.split('.')[0] : word;
      tokens.push({ type: !isQualified && SQL_KEYWORDS.has(firstPart.toUpperCase()) ? 'keyword' : 'identifier', value: word });
      i = j;
      continue;
    }

    if (/[=<>!]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[=<>!]/.test(sql[j])) j++;
      tokens.push({ type: 'operator', value: sql.slice(i, j) });
      i = j;
      continue;
    }

    if (/[+\-*/%]/.test(sql[i])) {
      tokens.push({ type: 'operator', value: sql[i] });
      i++;
      continue;
    }

    tokens.push({ type: 'punctuation', value: sql[i] });
    i++;
  }
  return tokens;
}

function highlightSql(sql) {
  return sql.split('\n').map((line) => (line ? highlightSqlLine(line) : ' ')).join('\n');
}

function highlightSqlLine(line) {
  const tokens = tokenizeSql(line);
  const parts = [];
  let cursor = 0;
  let isLeading = true;

  for (const tok of tokens) {
    const pos = line.indexOf(tok.value, cursor);
    if (pos < 0) continue;
    if (pos > cursor) {
      parts.push(escapeHtml(line.slice(cursor, pos)));
    }
    let cls = sqlTokenClass(tok);
    if (isLeading && tok.type === 'keyword' && SQL_CLAUSE_STARTERS.has(tok.value.toUpperCase())) {
      cls = cls ? `${cls} sql-clause` : 'sql-clause';
    }
    if (tok.type !== 'comment') isLeading = false;
    parts.push(cls ? `<span class="${cls}">${escapeHtml(tok.value)}</span>` : escapeHtml(tok.value));
    cursor = pos + tok.value.length;
  }
  if (cursor < line.length) parts.push(escapeHtml(line.slice(cursor)));
  return parts.join('');
}

function sqlTokenClass(tok) {
  const map = {
    keyword: 'sql-keyword',
    string: 'sql-string',
    number: 'sql-number',
    comment: 'sql-comment',
    operator: 'sql-operator',
    identifier: 'sql-identifier'
  };
  return map[tok.type] ?? '';
}

async function copyContent() {
  let text = els.editor.value;
  if (state.mode === 'json') {
    try {
      text = JSON.stringify(JSON.parse(text || '{}'), null, 2);
    } catch (_) {
      // keep raw content when invalid
    }
  }
  if (state.mode === 'sql') {
    text = formatSql(text);
  }

  try {
    await navigator.clipboard.writeText(text);
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
  if (state.mode === 'sql') {
    content = formatSql(content);
  }

  const nameMap = { markdown: 'downloadNameMarkdown', json: 'downloadNameJson', sql: 'downloadNameSql' };
  const filename = t(nameMap[state.mode] ?? 'downloadNameMarkdown');
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
    if (parsed?.content?.sql) state.content.sql = parsed.content.sql;
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
