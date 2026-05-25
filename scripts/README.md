# 开发与系统脚本

按平台分类的实用脚本，与仓库根目录的在线编辑器同属 `dev-tool` 项目。

| 目录 | 内容 |
|------|------|
| `powershell/` | PowerShell Linux 命令兼容层及安装脚本 |
| `autohotkey/` | Windows 全局 Emacs 风格键位 |
| `karabiner/` | macOS Karabiner-Elements 配置 |

---

## 📦 脚本列表

### 1️⃣ Linux Commands for PowerShell (`powershell/linux-cmd.ps1`)
在 Windows PowerShell 中使用熟悉的 Linux 命令。

#### 🚀 一键安装（推荐）

**方法一：直接安装**
```powershell
irm https://raw.githubusercontent.com/luckyk255/dev-tool/main/scripts/powershell/install.ps1 | iex
```

**方法二：下载后安装**
```powershell
# 下载安装脚本
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/luckyk255/dev-tool/main/scripts/powershell/install.ps1" -OutFile "install.ps1"

# 运行安装
.\install.ps1
```

安装完成后，重启 PowerShell 或运行 `. $PROFILE` 即可使用。

#### ⚙️ 手动安装

1. 下载 `linux-cmd.ps1`
2. 在 PowerShell 中运行：`notepad $PROFILE`
3. 添加以下内容到文件中：
   ```powershell
   . "D:\path\to\linux-cmd.ps1"
   ```
4. 保存并重启 PowerShell

---

### 2️⃣ Emacs 风格键位映射 (`autohotkey/gljm.ahk`)
为 Windows 全局添加 Emacs/类 Unix 的键盘快捷键，提升文本编辑效率。

#### 🚀 快速使用

1. 安装 [AutoHotkey](https://www.autohotkey.com/)
2. 下载 `gljm.ahk`
3. 双击运行脚本

#### ⚙️ 开机自启动

1. 按 `Win + R`，输入 `shell:startup`
2. 将 `gljm.ahk` 的快捷方式放入该文件夹

---

## 📖 详细文档

### Linux Commands - 可用命令

#### File Operations
- `cp [-r] <source>... <dest>` - Copy files/dirs (recursive; overwrites existing target)
- `touch <file>` - Create file or update timestamp
- `head <file> [-n 10]` - Show first lines
- `tail <file> [-n 10] [-f]` - Show last lines (use `-f` to follow)
- `ll [path]` - Detailed file list
- `la [path]` - List all files (including hidden)

#### Text Processing
- `grep <pattern> <file>` - Search text
- `grep <pattern> <file> -i` - Case-insensitive search

#### Directory Operations
- `tree [path] [-Depth 3]` - Show directory tree

#### System Info
- `df` - Disk usage
- `du <path> [-h]` - Directory size
- `top` - Process monitor (Ctrl+C to exit)
- `kill <pid>` - Terminate process
- `env [NAME]` / `get [NAME]` - List or read environment variables
- `set NAME=value` / `export NAME=value` - Set environment variable (current session)

#### Network & Ports
- `wget <url> [-O filename]` - Download file
- `port <port>` - Show process using a port (e.g. `port 8080`)
- `lsof -i :<port>` - Same as `port` (Linux style, e.g. `lsof -i :8080`)
- `killport <port>` / `kp <port>` - Kill process on port (e.g. `kp 3000`)
- `fuser -k <port>/tcp` - Kill by port (Linux style, e.g. `fuser -k 8080/tcp`)

#### Help
- `help` - List all commands
- `help <command>` - Show usage for one command
- `<command> --help` - Same as above (e.g. `port --help`)

#### Other
- `open [path]` - Open folder or select file in File Explorer (`open .` for current dir)
- `which <command>` - Find command location
- `clear` - Clear screen

---

### Emacs 键位映射 - 快捷键列表

#### 光标移动
- `Ctrl + b` - 左移一个字符
- `Ctrl + f` - 右移一个字符
- `Ctrl + p` - 上移一行
- `Ctrl + n` - 下移一行
- `Ctrl + a` - 移动到行首
- `Ctrl + e` - 移动到行末
- `Ctrl + Alt + b` - 左移一个单词
- `Ctrl + Alt + f` - 右移一个单词

#### 删除操作
- `Ctrl + h` - 向左删除字符
- `Ctrl + d` - 向右删除字符
- `Ctrl + k` - 删除到行尾
- `Ctrl + u` - 删除到行首
- `Ctrl + Alt + h` - 向左删除单词
- `Ctrl + Win + d` - 向右删除单词

#### 文本选择（配合 Shift）
- `Ctrl + Shift + b` - 向左选择
- `Ctrl + Shift + f` - 向右选择
- `Ctrl + Shift + p` - 向上选择
- `Ctrl + Shift + n` - 向下选择
- `Ctrl + Shift + Alt + b` - 向左选择单词
- `Ctrl + Shift + Alt + f` - 向右选择单词

#### 其他快捷键
- `Ctrl + ;` - 插入 10 个换行
- `Ctrl + j` - Shift + Enter（软回车）
- `Alt + r` - 替换（Ctrl + r）
- `Alt + f` - 查找（Ctrl + f）
- `Alt + Shift + f` - 全局查找（Ctrl + Shift + f）
- `Alt + Shift + r` - 全局替换（Ctrl + Shift + r）
- `Alt + n` - 新建（Ctrl + n）
- `Alt + a` - 全选（Ctrl + a）
- `Alt + h` - 查看历史记录（Ctrl + h）
- `Alt + e` - 搜索/历史记录（Ctrl + e）

---

## ⚙️ 常见问题

### PowerShell 执行策略错误
如果遇到执行策略错误，运行：
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 卸载 Linux Commands
编辑 PowerShell 配置文件：
```powershell
notepad $PROFILE
```
删除 Linux 命令部分并保存。

### AutoHotkey 脚本不生效
1. 确保已安装 [AutoHotkey](https://www.autohotkey.com/)
2. 右键点击 `gljm.ahk` → 以管理员身份运行
3. 检查系统托盘是否有 AutoHotkey 图标

---

## 📄 License

MIT License - 随意使用和修改！

---

## 🔗 快速链接

- 一键安装 Linux Commands：
  ```powershell
  irm https://raw.githubusercontent.com/luckyk255/dev-tool/main/scripts/powershell/install.ps1 | iex
  ```
