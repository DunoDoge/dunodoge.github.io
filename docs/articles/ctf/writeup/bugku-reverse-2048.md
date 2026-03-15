# [Reverse]2048

用 jadx 打开 `2048.apk`，查看源代码

![](<2048-1.png>)

在 MainGame 类中找到 flag 解密逻辑：
```java
public String getFlag() {
    return this.flag;
}
```
```java
public boolean isCTFWin() {
    if (this.ctfwin != 666) {
        return false;
    }
    this.checkSum = this.lastChecksum;
    this.flag = decryptFlag(this.checkSum);
    return true;
}
```
```java
public String decryptFlag(int i) {
    StringBuffer stringBuffer = new StringBuffer();
    HashMap map = new HashMap();
    char[] charArray = String.valueOf(i).toCharArray();
    int[] iArr = new int[charArray.length];
    int i2 = 0;
    for (int i3 = 0; i3 < charArray.length; i3++) {
        iArr[i3] = Integer.parseInt(String.valueOf(charArray[i3]));
    }
    for (int i4 = 0; i4 < this.charset.length(); i4++) {
        int i5 = i4 * 2;
        map.put(this.table.substring(i5, i5 + 2), Character.valueOf(this.charset.charAt(i4)));
    }
    String strReplaceAll = "MjA0OA##hJFSQUSkNTgi;585g>f5g9<bf7<m3:1699gf5Ab4e8Y3".replaceAll("MjA0OA##", "");
    System.out.println("encText: " + strReplaceAll);
    int i6 = 0;
    while (i2 < strReplaceAll.length()) {
        if (i2 < 10 || i2 == strReplaceAll.length() - 2) {
            int i7 = i2 + 2;
            if (map.containsKey(strReplaceAll.substring(i2, i7))) {
                stringBuffer.append(map.get(strReplaceAll.substring(i2, i7)));
                i2++;
            } else {
                stringBuffer.append(strReplaceAll.charAt(i2));
            }
        } else {
            stringBuffer.append((char) (strReplaceAll.charAt(i2) - iArr[i6 % iArr.length]));
            i6++;
        }
        i2++;
    }
    return stringBuffer.toString();
}
```
其中 `strReplaceAll` 就是加密后的 flag，问题转化为破解 `checkSum`，注意到
```java
public int checkSum = 0;
```
继续查找用例：

![](<2048-2.png>)

转到 move 代码片段，发现 checkSum 由一组值多次累加得到：
```java
// move()
int iBinarySearch = Arrays.binarySearch(this.checkPoints, tile.getValue());
if (iBinarySearch >= 0 && this.ctfwin != 666) {
    int[] iArr = this.checkPointsCount;
    iArr[iBinarySearch] = iArr[iBinarySearch] + 1;
    int[] iArr2 = this.checkPointsCalcCount;
    if (iArr2[iBinarySearch] > 0) {
        this.checkSum += this.checkPoints[iBinarySearch];
        iArr2[iBinarySearch] = iArr2[iBinarySearch] - 1;
    }
}
```
其中 `checkPoints` 和 `checkPointsCalcCount` 已经在代码中给出：
```java
public int[] checkPoints = {16, 32, 64, 128, 256, 512, 1024, 2048}; // 合成数字
public int[] checkPointsCalcCount = {100, 60, 30, 10, 8, 4, 2, 1}; // 计入次数
```
因此 checkSum 最大可能取值等于
```python
sum([checkPoints[i] * checkPointsCalcCount[i] for i in range(len(checkpoints))]) # 14912
```
实际上 checkSum = 14912，这是因为要想赢得游戏，需要合成数字的次数 ≥ checkPointsCalcCount 给出的值，因此取最大值

将 checkSum = 14912 代入 `decryptFlag()` 运行解得 flag

`flag{fe2464c5e3f53ad68d280208ee18a2d4}`