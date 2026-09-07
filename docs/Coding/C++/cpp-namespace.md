# C++ 名称空间

- 名称空间（namespace）是 C++ 用来组织标识符（比如函数、类、变量、常量）的一种机制。
- 它的作用是避免不同代码库中相同名字发生冲突。

## 为什么需要名称空间

如果没有名称空间，不同地方定义了相同名字会冲突：

```cpp
void print();
int print;
```

但放在不同名称空间里，就不会冲突：

```cpp
namespace A {
    void print();
}

namespace B {
    void print();
}
```

## `std` 是什么

- `std` 是 C++ 标准库的名称空间。
- 标准库中大多数内容，如 `cout`、`cin`、`string`、`vector`，都在 `std` 里。

## 使用方式

直接使用：

```cpp
std::cout << "Hello" << std::endl;
```

或者通过 `using namespace std;` 引入整个名称空间：

```cpp
using namespace std;
cout << "Hello" << endl;
```

## 总结

- 名称空间就是“名字的容器”。
- 它能把不同模块的名字分开放，减少冲突。
- `std` 是标准库的名称空间，标准库里的名字都在这里。