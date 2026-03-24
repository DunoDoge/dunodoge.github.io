# [Reverse]SafeBox

jadx 反编译代码，其中 `MainActivity` 解密部分：

```java
public void onClick(View v) throws NumberFormatException {
    int i = Integer.parseInt(Et1.getText().toString());
    if (i > 10000000 && i < 99999999) {
        int t = 1;
        int t1 = 10000000;
        int flag = 1;
        if (Math.abs(((i / 1000) % 100) - 36) == 3 && (i % 1000) % 584 == 0) {
            int j = 0;
            while (true) {
                if (j >= 4) {
                    break;
                }
                if ((i / t) % 10 != (i / t1) % 10) {
                    flag = 0;
                    break;
                } else {
                    t *= 10;
                    t1 /= 10;
                    j++;
                }
            }
            if (flag == 1) {
                char c1 = (char) (i / 1000000);
                char c2 = (char) ((i / 10000) % 100);
                char c3 = (char) ((i / 100) % 100);
                Et1.setText("NJCTF{" + c1 + c2 + c3 + "f4n}");
            }
        }
    }
}
```

分析源代码逻辑：接受一个数字 i，经过一系列检验，通过后输出 flag。具体而言，分成以下几个判断：

```java
if (i > 10000000 && i < 99999999)
```

这说明 i 是一个 8 位数；

```java
if (Math.abs(((i / 1000) % 100) - 36) == 3 && (i % 1000) % 584 == 0)
```

这说明 i 的第 4，5 位是 33 或 39，且末三位是 584；

```java
while (true) {
    if (j >= 4) {
        break;
    }
    if ((i / t) % 10 != (i / t1) % 10) {
        flag = 0;
        break;
    } else {
        t *= 10;
        t1 /= 10;
        j++;
    }
}
```

这说明 i 是一个回文数！

因此 i 的值为 48533584

```java
if (flag == 1) {
    char c1 = (char) (i / 1000000);
    // c1 = 48 '0'
    char c2 = (char) ((i / 10000) % 100); // c2 = 53 '5'
    char c3 = (char) ((i / 100) % 100); // c3 = 53 '#'
    Et1.setText("NJCTF{" + c1 + c2 + c3 + "f4n}");
}
```

拼凑出 `NJCTF{05#f4n}`，但是注意提示：

```txt
flag格式 NJCTF{xxx} 并且 xxx只包含[a-z][A-Z][0-9]
```

说明这不是我们要找的 flag！再次检查反编译代码，发现在 `androidTest` 有一段几乎一模一样的代码，只有三处不同：

```java
if (j >= 3) {
    break;
    }
// 4，5 位不要求回文
...
char c3 = (char) (((i / 100) % 100) + 10);
Et1.setText("NJCTF{have" + c1 + c2 + c3 + "f4n}");
```

分别检验 i = 48533584 和 i = 48539584，对应结果为 `NJCTF{have05-f4n}` `NJCTF{have05if4n}`，真正的 flag 为后者！
