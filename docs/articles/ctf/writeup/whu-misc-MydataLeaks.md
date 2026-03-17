# [Misc]MydataLeaks
下载得到一个 csv 文件，在 Excel 中打开

![](<MydataLeaks-1.png>)

初步观察，发现可疑的字符片段（按原始文件行索引排列）：
```txt
l3
fl
ag{
ev3_
ry_
wh_
3r3_}
D
at4_
ak5_
```
容易得到部分片段，如 `flag{`，`wh_3r3}` ,多次尝试得到 flag：

`flag{Dat4_l3ak5_ev3_ry_wh_3r3}`

（Data leaks everywhere）

*番外：*
笔者在做题过程中，苦于组合试错，忽然灵光一现：这些片段要按照某一顺序排列，那么应该在题目中寻找提示，结合先前已经确定的 flag 片段，**注意到**片段出现顺序与 **userid** 正相关！在 Excel 中排序：

![](<MydataLeaks-2.png>)

验证 flag，正确！