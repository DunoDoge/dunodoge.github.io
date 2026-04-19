# myHash WriteUp

## 题目分析

下载题目文件，包含两个 py 文件，分别是：

- `myhash.py` - 自定义的 WHUHash128 哈希算法实现
- `chal.py` - CTF 挑战服务器脚本

启动容器，服务器提供三个选项：

1. **Get token** - 获取固定消息的签名
2. **Submit data+sig** - 提交消息和签名进行验证
3. **Exit** - 退出

交互示例：

```powershell
$ ncat 127.0.0.1 27259
1) Get token
2) Submit data+sig
3) Exit
Choice> 1
TOKEN data=SGFzaF9pc19hX2dpZnRfZnJvbV9oZWF2ZW4= sig=3ea85568de3176f413e01e9879a7cb0b

1) Get token
2) Submit data+sig
3) Exit
Choice> 3
bye
```

***

## 漏洞分析

### 1. 自定义哈希算法 WHUHash128

#### 算法结构

采用 **Merkle-Damgård** 构造，与 MD5 类似：

- **初始状态**: 4 个 32 位寄存器 (来自数学常数 π, e, φ 等)
- **分组大小**: 64 字节
- **输出**: 128 位 (16 字节)
- **轮数**: 64 轮，分 4 个阶段

#### 压缩函数

```python
for i in range(64):
    if i < 16:      # 阶段 1: 与非或结构
        f = (b ^ (c | (~d & MASK32))) & MASK32
        g = (5 * i + 1) & 15
    elif i < 32:    # 阶段 2: 选择函数
        f = ((d & b) | ((~d & MASK32) & c)) & MASK32
        g = (3 * i + 5) & 15
    elif i < 48:    # 阶段 3: 异或
        f = (b ^ c ^ d) & MASK32
        g = (7 * i) & 15
    else:           # 阶段 4: 变体
        f = (c ^ (b | (~d & MASK32))) & MASK32
        g = (11 * i + 9) & 15
    
    t = (a + f + x[g] + K[i]) & MASK32
    t = _rol32(t, S[i])
    t = (t + b) & MASK32
    a, b, c, d = d, t, b, c

# 状态累加
self._a = (self._a + a) & MASK32
self._b = (self._b + b) & MASK32
self._c = (self._c + c) & MASK32
self._d = (self._d + d) & MASK32

# 额外交叉混合
na = (self._a ^ _rol32(self._c, 3)) & MASK32
nb = (self._b + _rol32(self._d, 7)) & MASK32
nc = (self._c ^ _rol32(self._a, 13)) & MASK32
nd = (self._d + _rol32(self._b, 17)) & MASK32
```

#### 填充方案

完全仿照 MD5 风格：

```python
def md_style_padding(message_len: int, pad_lead: int = 0x80) -> bytes:
    bit_len = (message_len * 8) & MASK64
    pad_zero_len = (56 - ((message_len + 1) % 64)) % 64
    return bytes([pad_lead]) + (b"\x00" * pad_zero_len) + struct.pack("<Q", bit_len)
```

填充格式：`消息 + 0x80~0xFF(1字节) + 零填充 + 64位长度(小端)`

### 2. 关键漏洞

#### (1) Merkle-Damgård 结构的长度扩展攻击

Merkle-Damgård 结构的核心弱点：

```
H(secret || message) = 最终内部状态 (a, b, c, d)

如果知道 H(secret || message) 的输出和消息长度，
就可以从该状态继续计算：
H(secret || message || padding || extension)
```

**这意味着：即使不知道密钥，也能伪造扩展消息的合法签名！**

#### (2) 不安全的 MAC 构造

```python
# 错误做法（题目使用的方式）
MAC = Hash(secret_key || message)

# 正确做法
MAC = HMAC(secret_key, message)
```

HMAC 使用双重哈希结构来防止长度扩展攻击：

```
HMAC(K, m) = H((K' ⊕ opad) || H((K' ⊕ ipad) || m))
```

#### (3) 随机但固定的 pad\_byte

```python
pad_byte = random.randrange(0x100)  # 服务器启动时随机生成一次
```

虽然随机，但服务器运行期间保持不变，只需爆破 256 种可能。

***

## 攻击原理

### 长度扩展攻击

已知：

- `message1 = b"Hash_is_a_gift_from_heaven"`
- `sig1 = WHUHash128(secret_key || message1, pad_lead=pad_byte)`

目标：

- 构造 `message2` 使得 `b"GetFlag" in message2`
- 计算 `sig2 = WHUHash128(secret_key || message2, pad_lead=pad_byte)`

### 攻击步骤

#### Step 1: 获取已知消息-签名对

```
$ ncat 127.0.0.1 27259
Choice> 1

TOKEN data=SGFzaF9pc19hX2dpZnRfZnJvbV9oZWF2ZW4= sig=3ea85568de3176f413e01e9879a7cb0b
```

解码：

- `message = "Hash_is_a_gift_from_heaven"` (28 字节)
- `signature = 0x3ea85568de3176f413e01e9879a7cb0b`

#### Step 2: 解析签名为内部状态

```python
import struct

sig = bytes.fromhex("3ea85568de3176f413e01e9879a7cb0b")
a, b, c, d = struct.unpack("<4I", sig)
# 这就是处理完 secret_key || message 后的内部状态
```

#### Step 3: 计算填充字节

由于不知道 `secret_key` 的长度，需要爆破 `key_len`：

```python
for key_len in range(8, 64):
    orig_len = key_len + len(message)
    
    # MD5 风格填充
    bit_len = (orig_len * 8) & 0xFFFFFFFFFFFFFFFF
    pad_zero_len = (56 - ((orig_len + 1) % 64)) % 64
    padding = bytes([pad_byte]) + b"\x00" * pad_zero_len + struct.pack("<Q", bit_len)
```

#### Step 4: 构造扩展消息

```python
extension = b"GetFlag"
forged_msg = message + padding + extension
```

#### Step 5: 从已知状态继续哈希

```python
h = WHUHash128(
    state=(a, b, c, d),          # 已知签名作为初始状态
    count=orig_len + len(padding), # 已处理的字节数
    pad_lead=pad_byte
)
h.update(extension)
forged_sig = h.hexdigest()
```

#### Step 6: 双重爆破

```python
for pad_byte in range(256):      # 爆破填充前导字节
    for key_len in range(8, 64): # 爆破密钥长度
        # 计算伪造签名
        # 提交服务器验证
```

理论最大尝试次数：256 × 56 = 14336 次

***

## EXP 脚本

```python
import struct
import base64
from pwn import remote, log
from myhash import WHUHash128

HOST = "127.0.0.1"
PORT = 27259

def get_token(r):
    """获取已签名的 token"""
    r.sendlineafter(b"Choice> ", b"1")
    line = r.recvline().decode()
    
    parts = line.strip().split()
    data_part = parts[1]
    data_b64 = data_part.split("=", 1)[1]
    sig_part = parts[2]
    sig = sig_part.split("=", 1)[1]
    
    return data_b64, sig

def submit_attempt(r, data_b64, sig):
    """提交伪造的数据和签名"""
    r.sendlineafter(b"Choice> ", b"2")
    r.sendlineafter(b"DATA_B64> ", data_b64.encode())
    r.sendlineafter(b"SIG> ", sig.encode())
    
    response = r.recvline().decode().strip()
    return response

def length_extension_attack(known_msg_b64, known_sig_hex):
    """长度扩展攻击: 爆破 pad_byte 和 key_len"""
    known_msg = base64.b64decode(known_msg_b64)
    known_sig = bytes.fromhex(known_sig_hex)
    extension = b"GetFlag"
    
    a, b, c, d = struct.unpack("<4I", known_sig)
    
    for pad_byte in range(256):
        for key_len in range(8, 64):
            orig_len = key_len + len(known_msg)
            
            bit_len = (orig_len * 8) & 0xFFFFFFFFFFFFFFFF
            pad_zero_len = (56 - ((orig_len + 1) % 64)) % 64
            padding = bytes([pad_byte]) + b"\x00" * pad_zero_len + struct.pack("<Q", bit_len)
            
            forged_msg = known_msg + padding + extension
            
            h = WHUHash128(
                state=(a, b, c, d),
                count=orig_len + len(padding),
                pad_lead=pad_byte
            )
            h.update(extension)
            forged_sig = h.hexdigest()
            
            forged_msg_b64 = base64.b64encode(forged_msg).decode()
            
            yield forged_msg_b64, forged_sig, pad_byte, key_len

def main():
    r = remote(HOST, PORT)
    
    # Step 1: 获取 token
    known_msg_b64, known_sig = get_token(r)
    
    # Step 2: 长度扩展攻击
    for forged_msg_b64, forged_sig, pad_byte, key_len in length_extension_attack(known_msg_b64, known_sig):
        response = submit_attempt(r, forged_msg_b64, forged_sig)
        
        if "flag=" in response:
            log.success(f"pad_byte = {pad_byte} (0x{pad_byte:02x})")
            log.success(f"key_len = {key_len}")
            log.success(f"Response: {response}")
            break
    
    r.close()

if __name__ == "__main__":
    main()
```

