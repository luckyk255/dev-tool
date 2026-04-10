# 全能编辑器 Pro（Universal Editor Pro）

在浏览器里完成 **Markdown + LaTeX 实时预览** 与 **JSON 校验与格式化** 的单页工具，无需构建与安装依赖。

## 在线访问

可在浏览器直接打开：

**[https://luckyk255.github.io/](https://luckyk255.github.io/)**

## 功能概览

- **Markdown + LaTeX**：基于 [marked](https://github.com/markedjs/marked) 渲染 Markdown，[MathJax 3](https://www.mathjax.org/) 渲染 `$...$`、`$$...$$` 等公式；预览样式使用 [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)。
- **JSON 模式**：解析校验、缩进格式化，预览区带简易语法高亮；解析失败时显示错误信息。
- **编辑体验**：行号、左右分栏实时预览；宽屏下可拖拽中间分隔条调整比例（约 25%～75%）。
- **导入 / 导出 / 复制**：本地选文件导入；导出为 `.md` 或格式化后的 `.json`；一键复制编辑器内容。
- **自动保存**：内容、模式、语言、主题与分栏比例写入 `localStorage`（键名：`universal-editor-pro`）。
- **界面**：中 / 英切换；浅色 / 深色主题；响应式布局（窄屏下纵向堆叠，隐藏分隔条）。

## 如何使用

### 本地直接打开

用浏览器打开项目根目录下的 `index.html` 即可。

> **说明**：部分浏览器在 `file://` 协议下对外部 CDN 脚本或剪贴板 API 可能有限制。若预览或公式异常，请改用下面的本地静态服务。

### 本地静态服务器（推荐）

在项目根目录执行任一方式：

```bash
# Python 3
python3 -m http.server 8080
```

```bash
# Node（如已安装 npx）
npx --yes serve -l 8080
```

然后在浏览器访问 `http://localhost:8080`。

## 项目结构

| 文件 | 说明 |
|------|------|
| `index.html` | 页面结构、CDN 引入（字体、marked、MathJax、markdown 样式） |
| `styles.css` | 布局、主题变量与组件样式 |
| `script.js` | 模式切换、预览渲染、持久化与交互逻辑 |

## 技术栈

- 原生 HTML / CSS / JavaScript（无打包工具）
- 运行时依赖通过 jsDelivr CDN 加载：`marked`、`mathjax@3`、`github-markdown-css`、Google Fonts（Inter、Noto Sans SC）
