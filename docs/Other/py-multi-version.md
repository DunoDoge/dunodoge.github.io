# Windows 管理 Python 版本的正确姿势

Windows 上管理多版本 Python 最推荐的方式是使用系统自带的 **Python Launcher for Windows**（`py` 命令），无需手动改 PATH。

## 1. 使用 `py` 启动器（最方便）

安装 Python 时如果勾选了 "py launcher"，就可以在命令行中这样用：

```bash
# 运行默认版本
py script.py

# 运行指定版本（如 Python 3.10）
py -3.10 script.py

# 运行指定版本（如 Python 3.11）
py -3.11 script.py

# 查看已安装的所有版本
py --list
py -0
```

## 2. 使用完整路径

如果不想用 `py`，可以直接调用安装目录下的 `python.exe`：

```bash
# 示例路径
C:\Users\你的用户名\AppData\Local\Programs\Python\Python310\python.exe script.py

# 或者
C:\Python311\python.exe script.py
```

## 3. 临时修改当前终端的 PATH

只在当前窗口生效，不影响全局：

```cmd
set PATH=C:\Python310;%PATH%
python script.py
```

PowerShell 版本：

```powershell
$env:Path = "C:\Python310;" + $env:Path
python script.py
```

## 4. 为项目使用虚拟环境（推荐做法）

不同项目用不同版本，互不干扰：

```bash
# 用指定版本创建虚拟环境
py -3.10 -m venv myproject_env

# 激活环境
myproject_env\Scripts\activate.bat

# 此时 python 命令就指向 3.10 了
python --version
```

### 常见问题

| 问题 | 解决 |
|------|------|
| 输入 `python` 打开了 Microsoft Store | 去系统设置 → 应用 → 应用执行别名，关闭 `python.exe` 和 `python3.exe` 的别名 |
| `py` 提示找不到命令 | 安装 Python 时没勾选 py launcher，需要重新安装勾选 |
| 想设置默认版本 | `py -3.11` 或设置环境变量 `PY_PYTHON=3.11` |

**总结**：日常用 `py -3.xx` 最省心，项目级管理用虚拟环境。