# [Reverse]Mountain climbing

拿到 exe 文件，查壳，有 UPX，而且有修改，无法直接用工具脱壳，考虑手动脱壳。

![Mountain climbing-1](<Mountain climbing-1.png>)

> 手动脱壳的基本原理：ESP 定律，堆栈平衡
>
> 壳实质上是一个子程序，它在程序运行时首先取得控制权并对程序进行压缩，在运行程序时解压过程作为过程调用，在调用前用 pushad 把所有寄存器压栈，解压完成后再用 popad 出栈，通过这个特征找到程序的原始入口点（OEP, Original Entry Point），进而导出脱壳后的程序
>
> 详细内容见 CTF Wiki：<https://ctf-wiki.org/reverse/platform/windows/unpack/esp/>

## Step.1 手动脱 UPX 壳

x32dbg 打开 exe 文件，按 F9 运行，程序在 pushad 处断点，在执行完这一步后所有寄存器压栈，可以观察到 ESP 有更新

右键点击 ESP，选择“在内存窗口中转到”跟踪这部分栈在内存中的位置，然后按图示操作断点追踪栈的变化

![Mountain climbing-2](<Mountain climbing-2.png>)

![Mountain climbing-3](<Mountain climbing-3.png>)

然后按 F9 运行到断点处，大概是执行了 popad 改变了 ESP 的值，查看断点上一条指令，果不其然

此时UPX的解压过程已经结束，现在在进行一些清理工作（将缺失的栈段空间补齐）

看到下面的 jmp 指令，程序有一个大跳转，目标位置应该就是我们寻找的 OEP

![Mountain climbing-4](<Mountain climbing-4.png>)

双击 jmp 指令跳转到目标位置，此时就可以用 Scylla 插件进行 dump，操作步骤：

1. 修改 OEP 为实际值
2. 点击 IAT Autosearch -> Get Imports，修复 IAT
3. 点击 Dump，导出脱壳程序

> 💡 修复 IAT 非必须操作，如果只要用 IDA 查看反编译结果就不需要这一步

![Mountain climbing-5](<Mountain climbing-5.png>)

## Step.2 IDA 反编译 + 动态调试

运行程序，需要一个输入，先随便输个数字：

![Mountain climbing-6](<Mountain climbing-6.png>)

用 IDA 打开脱壳文件，可以看到伪代码：

```c
int __cdecl main_0(int argc, const char **argv, const char **envp)
{
  char v4; // [esp+0h] [ebp-160h]
  char v5; // [esp+0h] [ebp-160h]
  int n19; // [esp+D0h] [ebp-90h]
  int j; // [esp+DCh] [ebp-84h]
  int v8; // [esp+DCh] [ebp-84h]
  int i; // [esp+E8h] [ebp-78h]
  int v10; // [esp+E8h] [ebp-78h]
  char Str[104]; // [esp+F4h] [ebp-6Ch] BYREF

  srand(0xCu);
  j_memset(dword_423D80, 0, 0x9C40u);
  for ( i = 1; i <= 20; ++i )
  {
    for ( j = 1; j <= i; ++j )
      dword_41A138[100 * i + j] = rand() % 100000;
  }
  sub_41134D(
    aInputYourKeyWi,                            // "input your key with your operation can get the maximum:"
    v4);
  sub_411249(
    aS,                                         // "%s"
    (char)Str);
  if ( j_strlen(Str) == 19 )
  {
    sub_41114F(Str);
    n19 = 0;
    v8 = 1;
    v10 = 1;
    *(_DWORD *)dword_423D78 += dword_41A13C[100];
    while ( n19 < 19 )
    {
      if ( Str[n19] == 76 )
      {
        ++v10;
        *(_DWORD *)dword_423D78 += dword_41A138[100 * v10 + v8];
      }
      else
      {
        if ( Str[n19] != 82 )
          goto LABEL_8;
        ++v10;
        ++v8;
        *(_DWORD *)dword_423D78 += dword_41A138[100 * v10 + v8];
      }
      ++n19;
    }
    sub_41134D(
      aYourOperationC,                          // "your operation can get %d points\n"
      dword_423D78[0]);
    system((const char *)Command);              // "pause"
    return 0;
  }
  else
  {
LABEL_8:
    sub_41134D(
      aError,                                   // "error\n"
      v5);
    system((const char *)Command);              // "pause"
    return 0;
  }
}
```

根据中间这段 While 循环得知最终输入为连续 19 个 L/R，直接输入连续 19 个 R，程序还输出 error，分析循环上下文代码，应该是函数 `sub_41114F` 对输入动了手脚。双击函数名看下伪代码实现（实际上套了好几层，这里只给出一个调用链）

> ❓ 主函数中还有两个函数：`sub_41134D` 和 `sub_411249`，结合上下文和二者具体伪代码推测出分别对应 `printf` 和 `scanf` 函数！

```txt
main_0:
    sub_41114F(Str);           // 传入输入字符串的指针，但该参数未被直接使用

sub_41114F:
    → sub_411900(a1);          // a1 被传递但实际未使用

sub_411900:
    → sub_4110A5(nullsub_1, sub_411994 - nullsub_1, 4);
    → return nullsub_1();      // 调用解密后的 nullsub_1

sub_4110A5:
    → sub_411750(lpAddress, a2, n4);  // thunk 转发

sub_411750:                    // 核心功能：内存区域异或解密
    VirtualQuery(...)
    VirtualProtect(..., PAGE_EXECUTE_READWRITE)
    while (a2--)
        *lpAddress++ ^= n4;    // 逐字节异或 4
    VirtualProtect(..., 原保护属性)
```

有两个函数比较陌生：`VirtualQuery` 和 `VirtualProtect`，这里给出 AI 的解释：

- 参数：
    1. `lpAddress`：待解密内存起始地址
    2. `a2`：需要解密的字节数
    3. `n4`：异或密钥（此处固定为 4）
- 步骤：
    1. 通过 `VirtualQuery` 获取目标内存区域的基础信息（基址、大小）。
    2. 通过 `VirtualProtect` 将内存页临时修改为可读可写可执行（`PAGE_EXECUTE_READWRITE = 0x40`）。
    3. 循环对范围内的每一个字节执行 `*lpAddress++ ^= n4` 异或操作。
    4. 恢复原始内存保护属性。

尝试在 IDA 中查看 `nullsub_1` 反编译代码，双击函数点开发现什么都木有，可能是采用了某个反静态分析的加密（具体见[后记：SMC 加密](#后记smc-加密)）

用 x32dbg 进行动态调试，在 `sub_411900` 调用 `sub_4110A5` 后的下一步设置断点，追踪查看 `nullsub_1` 汇编代码：

```asm
0041191E   mov dword ptr ss:[ebp-8], 00411953    ; nullsub_1 起始地址
00411925   mov dword ptr ss:[ebp-14], 00411994   ; sub_411994 地址
00411930   mov eax, [ebp-14]
00411933   sub eax, [ebp-8]                      ; 长度 = 0x411994 - 0x411953
00411949   call sub_4110A5                       ; 解密调用
︙
00411953   (nullsub_1 start...)
```

> 💡 在指令 `call sub_4110A5` 执行之前的代码，加载出错！
>
> ![Mountain climbing-7](<Mountain climbing-7.png>)
>
> F8 步过，可以看到代码正常显示！
>
> ![Mountain climbing-8](<Mountain climbing-8.png>)

```asm
00411953   mov dword ptr ss:[ebp-44], 0   ; 初始化循环变量 i=0
0041195A   jmp 00411965                    ; 跳转到条件判断

0041195C   mov eax, [ebp-44]               ; 循环体开始：eax = i
0041195F   add eax, 1
00411962   mov [ebp-44], eax               ; i++

00411965   cmp dword ptr ss:[ebp-44], 0x13 ; 比较 i 与 19 (0x13)
00411969   jge 00411994                    ; 如果 i >= 19 则跳转到结束

0041196B   mov eax, [ebp-44]               ; eax = i
0041196E   and eax, 0x80000001             ; 检查 i 是否为奇数 (通过位测试)
00411973   jns 0041197A                    ; 如果符号位未设置（正数且结果非负）跳转
00411975   dec eax                         ; 这些指令是编译器对取模负数的优化
00411976   or eax, 0xFFFFFFFE
00411979   inc eax
0041197A   test eax, eax                   ; 测试 eax 是否为 0
0041197C   je 00411992                     ; 如果是偶数 (i%2 == 0) 则跳过异或操作，直接跳转到循环末尾

0041197E   mov eax, [ebp+8]                ; 如果是奇数，则 eax = 输入字符串指针 (参数1)
00411981   add eax, [ebp-44]               ; 加上 i，得到当前字符地址
00411984   movsx ecx, byte ptr [eax]       ; 读取字符 (带符号扩展)
00411987   xor ecx, 4                      ; 异或 4
0041198A   mov edx, [ebp+8]                ; edx = 字符串指针
0041198D   add edx, [ebp-44]               ; 加上 i 得到字符地址
00411990   mov byte ptr [edx], cl          ; 写回异或后的字符

00411992   jmp 0041195C                    ; 继续循环
```

结合调试，可以推测出具体作用是：对输入的字符串中偶数位的进行异或，奇数位不变。

> 💡 到这一步，我们还可以直接 dump 导出解密内部函数后的程序（OEP 设置为 4112C1）再丢给 IDA 静态分析验证

## Step.3 根据源码逻辑编写解密脚本

重点关注这几行代码：

```c
srand(0xCu);
j_memset(dword_423D80, 0, 0x9C40u);
for ( i = 1; i <= 20; ++i )
{
    for ( j = 1; j <= i; ++j )
        dword_41A138[100 * i + j] = rand() % 100000;
}
```

这段代码构造了一个下三角矩阵，`srand()` 确定随机数种子。

> ❗ 不同平台下 `srand()` 和 `rand()` 的结果 不保证一致。即使设置了相同的随机种子，程序在不同操作系统、编译器或 C 运行时库（CRT）上运行，生成的随机数序列也极大概率不同。

```c
n19 = 0;
v8 = 1;
v10 = 1;
while ( n19 < 19 )
{
    if ( Str[n19] == 76 )
    {
        ++v10;
        *(_DWORD *)dword_423D78 += dword_41A138[100 * v10 + v8];
    }
    else
    {
        if ( Str[n19] != 82 )
            goto LABEL_8;
        ++v10;
        ++v8;
        *(_DWORD *)dword_423D78 += dword_41A138[100 * v10 + v8];
    }
    ++n19;
}
```

这段循环处理用户输入：

1. 字符为 'L'，dword_423D78 += dword_41A138[100 * ++i + j]
2. 字符为 'R'，dword_423D78 += dword_41A138[100 * ++i + ++j]

注意：起点并非 `(1,1)` (为什么？)

结合题目“Mountain climbing”和最后程序输出 `your operation can get %d points`，猜测是要在下三角矩阵中寻找一路径，使得最终累计分数最大，根据这个思路编写一个脚本：

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <cstdlib>
#include <algorithm>

using namespace std;

int main() {
    // 固定随机种子，与原程序一致
    srand(0xCu);

    // 生成 20 行的数字三角形，存储方式与原程序相同：索引为 100*i + j
    const int ROWS = 20;
    const int COLS_OFFSET = 100;
    vector<vector<int>> tri(ROWS + 1, vector<int>(ROWS + 1, 0)); // 1-based 索引

    for (int i = 1; i <= ROWS; ++i) {
        for (int j = 1; j <= i; ++j) {
            tri[i][j] = rand() % 100000;
        }
    }

    // 动态规划：dp[i][j] 表示从顶部到达 (i,j) 的最大累加和
    // path[i][j] 记录到达该位置的方向：'L' 表示来自左上方，'R' 表示来自右上方
    vector<vector<int>> dp(ROWS + 1, vector<int>(ROWS + 1, 0));
    vector<vector<char>> path(ROWS + 1, vector<char>(ROWS + 1, ' '));

    // 起点
    dp[1][1] = tri[1][1];

    // 填充 dp 表
    for (int i = 2; i <= ROWS; ++i) {
        for (int j = 1; j <= i; ++j) {
            // 来自左上方 (i-1, j-1) 对应 'R' 方向（因为向右下移动，列增加）
            int fromLeftUp = (j - 1 >= 1) ? dp[i-1][j-1] : -1;
            // 来自右上方 (i-1, j) 对应 'L' 方向（因为向左下移动，列不变）
            int fromRightUp = (j <= i-1) ? dp[i-1][j] : -1;

            if (fromLeftUp > fromRightUp) {
                dp[i][j] = fromLeftUp + tri[i][j];
                path[i][j] = 'R';   // 从上一行的 j-1 到当前 j，列增加，即向右下
            } else {
                dp[i][j] = fromRightUp + tri[i][j];
                path[i][j] = 'L';   // 从上一行的 j 到当前 j，列不变，即向左下
            }
        }
    }

    // 在最后一行找到最大值的位置
    int maxSum = -1, maxCol = 1;
    for (int j = 1; j <= ROWS; ++j) {
        if (dp[ROWS][j] > maxSum) {
            maxSum = dp[ROWS][j];
            maxCol = j;
        }
    }

    // 回溯路径（从下往上）
    string bestPath;
    int curRow = ROWS, curCol = maxCol;
    while (curRow > 1) {
        char dir = path[curRow][curCol];
        bestPath.push_back(dir);
        if (dir == 'L') {
            // 来自右上方，列不变
            curRow--;
        } else { // 'R'
            // 来自左上方，列减 1
            curRow--;
            curCol--;
        }
    }
    // 由于是从底向上回溯，得到的路径是反的，需要反转
    reverse(bestPath.begin(), bestPath.end());

    // 此时 bestPath 是纯 L/R 的 19 字符序列
    cout << "bestPath(L/R): " << bestPath << endl;
    cout << "maximum: " << maxSum << endl;

    // 编码：奇数索引位（从0开始，即第2、4、6...个字符）异或 4
    string encoded = bestPath;
    for (size_t i = 0; i < encoded.length(); ++i) {
        if (i % 2 == 1) {
            encoded[i] ^= 4;   // 'L' ^ 4 = 'H', 'R' ^ 4 = 'V'
        }
    }

    cout << "key: " << encoded << endl;

    return 0;
}
```

运行脚本解密即可。

flag: `zsctf{RVRVRHLVRVLVLVRVLVL}`

## 后记：SMC 加密

SMC（Self Modifying Code）是一种动态代码加密技术，通过程序在运行时自我解密关键代码段，防止静态分析和逆向破解。

### SMC 加密的基本原理

SMC加密的核心思想是在编译可执行文件时，将需要保护的代码区段单独编译成一个section（段），并将其标记为可读、可写、不可执行，然后在程序运行时通过解密算法将其转换为可读、可执行、不可写的状态，从而实现程序正常运行但无法被静态分析。常用的加密算法包括异或（XOR）等简单算法，解密时使用相同算法恢复原始代码。

### 如何识别 SMC？

SMC的实现是需要对目标内存进行修改的，.text一般是没有写权限的。

那么就需要拥有修改目标内存的权限：

在 Linux 系统中，可以通过 `mprotect` 函数修改目标内存的权限
在 Windows 系统中，`VirtualProtect` 函数实现内存权限的修改
因此也可以在IDA的导入表 Imports 中观察是否调用这两个函数来判断是否进行了 SMC

### 如何破解 SMC？

SMC一般有两种破解方法：

1. 找到对代码或数据加密的函数后通过 idapython 写解密脚本
2. 动态调试 到SMC解密结束的地方dump出来（本题解就是这种方法）

以上内容部分整理自 CSDN 博客：[【RE】 SMC动态代码加密技术](<https://blog.csdn.net/Daphneohh/article/details/139240790>)
