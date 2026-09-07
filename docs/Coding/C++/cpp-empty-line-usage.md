# C/C++ 空行使用规范

空行（blank lines）在 C/C++ 代码中主要用来提高可读性，将逻辑上不同的代码块分隔开。以下是通用的规范和建议：

## 1. 文件级别的空行

| 位置 | 规范 |
|------|------|
| **文件开头** | 许可证/版权注释后空一行，再接 `#include` |
| **`#include` 块之间** | 标准库头文件与用户自定义头文件之间空一行分组 |
| **`#include` 与代码之间** | `#include` 块结束后空一行，再接全局声明/定义 |
| **文件末尾** | 最后一行应为空行（POSIX 规范） |

**示例：**
```cpp
// 版权注释...

#include <iostream>
#include <vector>

#include "my_header.h"

#define MAX_SIZE 100

int global_var = 0;
```

## 2. 函数/方法之间的空行

| 位置 | 规范 |
|------|------|
| **函数与函数之间** | **空一行**（大多数风格）或**空两行**（Linux 内核风格） |
| **类内成员函数之间** | 通常空一行 |

**示例：**
```cpp
void func1() {
    // ...
}

void func2() {
    // ...
}
```

## 3. 函数内部的空行

在函数体内部，空行用于分隔逻辑段落：

```cpp
void processData(const std::vector<int>& data) {
    // 1. 变量声明/初始化段
    int sum = 0;
    double avg = 0.0;

    // 2. 核心处理逻辑
    for (int val : data) {
        sum += val;
    }

    // 3. 后处理/输出
    avg = static_cast<double>(sum) / data.size();
    std::cout << "Average: " << avg << std::endl;
}
```

**常见规则：**
- 每个逻辑段落之间空一行
- 不要在同一段落内使用空行分割单行语句
- 变量声明块与第一段执行代码之间通常空一行
- `return` 语句前常空一行（可选，取决于个人风格）

---

```cpp
// ✅ 好：控制结构前后空行分隔
int x = computeValue();

if (x > 0) {
    doSomething();
}

int y = anotherFunc();

// ❌ 不好：过度空行
int x = computeValue();


if (x > 0) {
    doSomething();
}


int y = anotherFunc();
```

## 5. 类/结构体定义中的空行

```cpp
class MyClass {
public:
    // 构造函数
    MyClass() = default;

    // 公有成员函数
    void doSomething();
    int getValue() const;

private:
    // 成员变量
    int value_;

    // 私有辅助函数
    void helper();
};
```

**规则：**
- 不同访问权限段（`public:`/`protected:`/`private:`）之间空一行
- 不同类别的成员（构造函数、成员函数、成员变量）之间空一行
- 同一类别的紧密相关成员之间通常不空行

## 6. 主流编码风格对比

| 风格 | 函数间空行 | 函数内空行 | 注释 |
|------|-----------|-----------|------|
| **Google C++ Style** | 1行 | 按逻辑段落 | 较节制 |
| **Linux Kernel** | 1行（有时2行用于文件级函数分组） | 按逻辑段落 | 适度 |
| **LLVM** | 1行 | 按逻辑段落 | 较节制 |
| **Microsoft** | 1行 | 按逻辑段落 | 适度 |

## 7. 应避免的做法

```cpp
// ❌ 连续多个空行
int a = 1;


int b = 2;

// ❌ 行尾有空格且空行中有空格
int a = 1;   

int b = 2;   

// ❌ 大括号前后多余空行
if (cond) {

    doSomething();

}

// ❌ 注释与代码之间无空行分隔
int a = 1;
// 这是一段注释
int b = 2;
```

## 8. 工具自动化

推荐使用以下工具自动处理空行和格式：

| 工具 | 命令 |
|------|------|
| **clang-format** | `clang-format -i file.cpp` |
| **AStyle** | `astyle --style=allman file.cpp` |
| **VS Code 设置** | `"editor.formatOnSave": true` |

常用的 `.clang-format` 配置片段：
```yaml
BasedOnStyle: Google
MaxEmptyLinesToKeep: 1
```

## 总结

| 场景 | 空行数 |
|------|--------|
| 文件头部注释与代码之间 | **1行** |
| `#include` 块之间分界 | **1行** |
| 函数/方法定义之间 | **1行**（个别风格2行） |
| 函数内逻辑段落之间 | **1行** |
| 类内不同访问权限段之间 | **1行** |
| 连续空行最大数 | **不超过2行** |
| 文件末尾 | **1个空行** |

**核心原则：** 空行用于增强可读性，而不是随意添加。应当将代码组织成有意义的逻辑块，每个块之间用一行空行分隔，避免两个以上连续空行。