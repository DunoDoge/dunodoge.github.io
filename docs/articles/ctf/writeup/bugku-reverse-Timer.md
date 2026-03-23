# [Reverse]Timer

## Step.1 反编译 apk 代码

依旧用 jadx 打开，查看 MainActivity 代码，这里简单梳理一下：

```java
public native String stringFromJNI2(int i);
```

从 `liblhm.so` 引入的库函数，具体作用在后面说明

```java
public static boolean is2(int n) {
    if (n <= 3) {
        return n > 1;
    }
    if (n % 2 == 0 || n % 3 == 0) {
        return false;
    }
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) {
            return false;
        }
    }
    return true;
}
```

`is2()` 判断一个数是否为质数，详细证明可自行搜索

```java
public void run() {
    MainActivity.this.t = System.currentTimeMillis();
    MainActivity.this.now = (int) (MainActivity.this.t / 1000);
    MainActivity.this.t = 1500 - (MainActivity.this.t % 1000);
    tv2.setText("AliCTF");
    if (MainActivity.this.beg - MainActivity.this.now <= 0) {
        tv1.setText("The flag is:");
        tv2.setText("alictf{" + MainActivity.this.stringFromJNI2(MainActivity.this.k) + "}");
    }
    if (MainActivity.is2(MainActivity.this.beg - MainActivity.this.now)) {
        MainActivity.this.k += 100;
    } else {
        MainActivity mainActivity = MainActivity.this;
        mainActivity.k--;
    }
    tv1.setText("Time Remaining(s):" + (MainActivity.this.beg - MainActivity.this.now));
    handler.postDelayed(this, MainActivity.this.t);
}
```

`run()` 在一段倒计时内计算 k，k 最终结果作为 `stringFromJNI2()` 参数用于计算 flag，计算逻辑：

1. 倒计时 = beg - now = 200000s
2. 倒计时为质数，k += 100
3. 否则 k -= 1
4. 倒计时归零，k 作为传参计算 flag

k 的最终值：

```math
k = 100*P - 1*(200000 - P) = 101*P - 200000
```

其中 P = $\pi$(200000) = 17984，代入得 **k = 1616384**

## Step.2 反编译 liblhm.so 库

首先提取出 `liblhm.so` 文件，在 jadx 中导出：

![Timer-1](<Timer-1.png>)

或者直接解压 apk，在 /lib 文件夹中找到 liblhm.so 文件

反编译工具用 **IDA** 或 **Ghidra**，这里以 IDA 为例：

![Timer-2](<Timer-2.png>)

在 Functions 中找到 `Java_net_bluelotus_tomorrow_easyandroid_MainActivity_stringFromJNI2` 函数，按 F5 反编译，注意真正传入的参数为 a3：

```c
int __fastcall Java_net_bluelotus_tomorrow_easyandroid_MainActivity_stringFromJNI2(int a1, int a2, int a3)
{
  double v3; // r6
  int (__fastcall *v4)(int, char *); // r3
  char v8; // [sp+10h] [bp-30h] BYREF
  unsigned __int8 n57; // [sp+11h] [bp-2Fh]
  unsigned __int8 n0x6F; // [sp+12h] [bp-2Eh]
  char v11; // [sp+13h] [bp-2Dh]
  char v12; // [sp+14h] [bp-2Ch]
  char v13; // [sp+15h] [bp-2Bh]
  char v14; // [sp+16h] [bp-2Ah]
  char v15; // [sp+17h] [bp-29h]
  char v16; // [sp+18h] [bp-28h]
  char v17; // [sp+19h] [bp-27h]
  char v18; // [sp+1Ah] [bp-26h]
  char v19; // [sp+1Bh] [bp-25h]
  char v20; // [sp+1Ch] [bp-24h]
  _BYTE _3te7[7]; // [sp+1Dh] [bp-23h] BYREF

  v3 = (double)a3;
  v8 = (int)((double)a3 / 323276.1) + a3 % 100;
  if ( isPrime() )
  {
    n57 = (unsigned int)(v3 / 59865.9 + 21.0);
    n0x6F = (int)((double)n57 * 2.423 + 1.7);
    if ( n0x6F > 0x6Fu )
      v11 = (int)(v3 / 24867.4);
    qmemcpy(_3te7, "3te7", 4);
  }
  else
  {
    n57 = 57;
    n0x6F = 67;
    v11 = -120;
    qmemcpy(_3te7, "=jo;", 4);
  }
  v12 = n0x6F - 4;
  v13 = (int)(v3 / 31693.8);
  v14 = (int)(v3 / 19242.66);
  v15 = (int)(v3 / 15394.1);
  v16 = (int)(v3 / 14829.2);
  v17 = (int)(v3 / 16003.8);
  v18 = (int)(v3 / 14178.8);
  v19 = a3 / 20992;
  _3te7[4] = 0;
  v4 = *(int (__fastcall **)(int, char *))(*(_DWORD *)a1 + 668);
  v20 = (int)(v3 / 16663.7);
  return v4(a1, &v8);
}
```

观察发现函数最后返回一个字符串，起始地址为 `&v8`，且由 v8, n57, n0x6F, v11~v20, _3te7 依次拼接而成，计算逻辑已在代码中给出，代入 `k = 1616384` 就能求解（计算过程略）

最终 flag：

`alictf{Y0vAr3TimerMa3te7}`（Bugku 为 flag{} 格式）

注意：反编译代码 `if ( isPrime() )` 判断分支条件丢失参数，猜测传入参数为 v8，计算为质数，进入 if 分支（也可以两个分支的答案都测试一下）
