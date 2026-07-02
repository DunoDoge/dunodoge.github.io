# [Reverse]easy-100

jadx 反编译 apk 文件，查看源代码：

MainActivity.java

```java
public class MainActivity extends q {  // AppCompatActivity
    private String v;  // 从图片中提取的密钥

    ...

    // 从图片中提取16字节密钥
    private void p() throws IOException {
        InputStream inputStreamOpen = getResources().getAssets().open("url.png");
        int iAvailable = inputStreamOpen.available();
        byte[] bArr = new byte[iAvailable];
        inputStreamOpen.read(bArr, 0, iAvailable);
        byte[] bArr2 = new byte[16];
        System.arraycopy(bArr, 144, bArr2, 0, 16);  // 从偏移144处复制16字节
        this.v = new String(bArr2, "utf-8");  // 密钥保存到 v
    }

    // 验证函数：比较加密结果是否匹配目标字节数组
    private boolean a(String str, String str2) {
        return new c().a(str, str2).equals(
            new String(new byte[]{21, -93, -68, -94, 86, 117, -19, -68, 
                              -92, 33, 50, 118, 16, 13, 1, -15, 
                              -13, 3, 4, 103, -18, 81, 30, 68, 
                              54, -93, 44, -23, 93, 98, 5, 59})
        );
    }
}
```

c.java

```java
public class c {
    // 主加密函数：str是密钥(v), str2是用户输入
    public String a(String str, String str2) throws UnsupportedEncodingException {
        String strA = a(str);  // 对密钥进行预处理（字符交换）
        a aVar = new a();      // 创建AES加密器
        aVar.a(strA.getBytes());  // 初始化密钥
        
        try {
            // 加密用户输入，返回UTF-8字符串
            return new String(aVar.b(str2.getBytes()), "utf-8");
        } catch (Exception e) {
            return "";
        }
    }

    // 密钥预处理：将字符串每2个字符交换位置
    private String a(String str) throws UnsupportedEncodingException {
        // 先验证UTF-8编码
        str.getBytes("utf-8");
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < str.length(); i += 2) {
            sb.append(str.charAt(i + 1));  // 先加后一个字符
            sb.append(str.charAt(i));       // 再加前一个字符
        }
        return sb.toString();  // 返回交换后的字符串
    }
}
```

a.java

```java
public class a {
    private SecretKeySpec a;  // AES密钥
    private Cipher b;          // AES加密器

    protected void a(byte[] bArr) throws UnsupportedEncodingException {
        if (bArr == null) {
            // 使用空字符串的MD5作为默认密钥（备用）
            this.a = new SecretKeySpec(
                MessageDigest.getInstance("MD5").digest("".getBytes("utf-8")), 
                "AES"
            );
        } else {
            // 直接使用传入的字节数组作为密钥
            this.a = new SecretKeySpec(bArr, "AES");
        }
        // AES/ECB/PKCS5Padding 模式
        this.b = Cipher.getInstance("AES/ECB/PKCS5Padding");
    }

    protected byte[] b(byte[] bArr) throws InvalidKeyException {
        this.b.init(1, this.a);  // 1 = ENCRYPT_MODE
        return this.b.doFinal(bArr);  // 执行加密
    }
}
```

总结：

1. 获取密钥：从 assets/url.png 的第 144 字节处读取 16 字节，然后进行字符交换预处理
2. 目标密文（32字节）：[21, -93, -68, -94, 86, 117, -19, -68, -92, 33, 50, 118, 16, 13, 1, -15, -13, 3, 4, 103, -18, 81, 30, 68, 54, -93, 44, -23, 93, 98, 5, 59] 转换为无符号字节：[15, 163, 188, 162, 86, 117, 237, 188, 164, 33, 50, 118, 16, 13, 1, 241, 243, 3, 4, 103, 238, 81, 30, 68, 54, 163, 44, 233, 93, 98, 5, 59]
3. 解密：由于 AES/ECB 模式，可以直接用密钥解密目标密文得到明文 flag

综上所述，给出解密代码：

```python
from Crypto.Cipher import AES

def preprocess_key(key_str):
    """
    密钥预处理：每2个字符交换位置
    例如: "this_is_the_key." -> "htsii__sht_eek.y"
    """
    result = []
    for i in range(0, len(key_str), 2):
        if i + 1 < len(key_str):
            result.append(key_str[i + 1])
            result.append(key_str[i])
        else:
            result.append(key_str[i])
    return ''.join(result)

def decrypt_flag():
    # 从 url.png 偏移 144 处提取的原始密钥
    raw_key = "this_is_the_key."
    
    # 密钥预处理（交换相邻字符）
    processed_key = preprocess_key(raw_key)
    key_bytes = processed_key.encode('utf-8')
    
    # 目标密文（从 MainActivity.java 提取的32字节有符号字节数组）
    target_bytes = bytes([
        (21 + 256) % 256, (-93 + 256) % 256, (-68 + 256) % 256, (-94 + 256) % 256,
        (86 + 256) % 256, (117 + 256) % 256, (-19 + 256) % 256, (-68 + 256) % 256,
        (-92 + 256) % 256, (33 + 256) % 256, (50 + 256) % 256, (118 + 256) % 256,
        (16 + 256) % 256, (13 + 256) % 256, (1 + 256) % 256, (-15 + 256) % 256,
        (-13 + 256) % 256, (3 + 256) % 256, (4 + 256) % 256, (103 + 256) % 256,
        (-18 + 256) % 256, (81 + 256) % 256, (30 + 256) % 256, (68 + 256) % 256,
        (54 + 256) % 256, (-93 + 256) % 256, (44 + 256) % 256, (-23 + 256) % 256,
        (93 + 256) % 256, (98 + 256) % 256, (5 + 256) % 256, (59 + 256) % 256
    ])
    
    # AES-ECB 解密
    cipher = AES.new(key_bytes, AES.MODE_ECB)
    plaintext = cipher.decrypt(target_bytes)
    
    # 去除 PKCS5Padding（最后一个字节表示填充长度）
    pad_len = plaintext[-1]
    if 1 <= pad_len <= 16:
        plaintext = plaintext[:-pad_len]
    
    # 解码为字符串
    flag = plaintext.decode('utf-8')
    return flag

# 执行解密
if __name__ == "__main__":
    flag = decrypt_flag()
    print(f"解密成功！Flag: {flag}")
```

运行代码得到 flag：`LCTF{1t's_rea1ly_an_ea3y_ap4}`
