# 来签个到吧 WriteUp

分析下 `chall.py` 中的加密流程：

```python
# 加密过程（chall.py）
from base64 import b16encode, b32encode, b64encode, b85encode
from hashlib import sha1
from random import choice
from secret import flag

SCHEMES = [b16encode, b32encode, b64encode, b85encode]

ROUNDS = 16
current = flag.encode()
for _ in range(ROUNDS):
    checksum = sha1(current).digest()  # 20字节SHA1摘要
    current = choice(SCHEMES)(current)  # 随机选一种Base编码
    current += checksum                 # 编码结果 + SHA1摘要
```

总共 16 轮加密，每轮先计算 SHA1 摘要，然后随机选择一种 Base 编码，最后将编码结果与 SHA1 摘要拼接起来。

注意到每轮末尾附加的 20 字节一定是 SHA1 摘要，去掉这 20 字节后，剩余部分一定是某种 Base 编码。尝试 4 种 Base 编码，用 SHA1 校验，就可以逆向解密出 flag。

```python
# 解密过程（solve.py）
from base64 import b16decode, b32decode, b64decode, b85decode
from hashlib import sha1

SCHEMES = [b16decode, b32decode, b64decode, b85decode]

ROUNDS = 16

with open("2026-Regional/来签个到吧/output.txt", "rb") as f:
    current = f.read()

for i in range(ROUNDS):
    # 去掉末尾20字节的SHA1摘要
    checksum = current[-20:]
    encoded = current[:-20]
    
    # 尝试4种Base解码，用SHA1校验
    decoded = None
    for scheme in SCHEMES:
        result = scheme(encoded)
        if sha1(result).digest() == checksum:
            decoded = result
            print(f"Round {ROUNDS - i}: {scheme.__name__}")
            break

    current = decoded
```
