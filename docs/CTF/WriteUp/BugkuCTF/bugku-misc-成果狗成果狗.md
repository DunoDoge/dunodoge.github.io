# [Misc]成果狗成果狗

下载附件为一图片，在 010 Editor 中查看发现这个文件中包含两张图片，每个图片末都有一段密文（验证为 Base64）,分离得到 `1.jpg`、`2.jpg`

Base64 转换完，字符都出现在0-9A-F之中，猜测是十六进制，根据题目提示 `图片拼接得到flag？` 猜测两段密文就是图片二进制数据的十六进制表示经 Base64 编码的结果，刚好对应两张图片，手搓一个简单的 python 脚本：

```python
with open("path\\to\\fl.jpg", "rb") as fl:
    with open("path\\to\\1.jpg", "ab") as f:
        f.write(bytes.fromhex("...")) # Paste hex data from Base64
    with open("path\\to\\2.jpg", "ab") as f:
        f.write(bytes.fromhex("...")) # Paste hex data from Base64
```

然后在 010 Editor 中手动修改两张图片的高度等于宽度，就能看到 flag 片段了。

tip: exchange the two Base64 fractions if you want to restore the real images!