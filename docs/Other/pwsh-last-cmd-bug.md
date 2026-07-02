# Powershell，你的上一条指令呢？

今天在使用终端的时候想找一条很久以前执行过的命令，一直按上方向键，结果莫名其妙执行了一个历史命令

```cmd
# pinow @ DunoDoge in D:\duno-blog on git:main x [23:11:08]
$ cd d:\CTFProblem\PolarisCTF\ez_uds; @'                 
> import re
> import socket
> import sys
> 
> HOST = sys.argv[1] if len(sys.argv) >= 2 else 'nc1.ctfplus.cn'
> PORT = int(sys.argv[2]) if len(sys.argv) >= 3 else 21461
> 
> 
> def calc_key(seed: int) -> int:
>     key = seed ^ 0xA5A5A5A5
>     key = ((key << 3) | (key >> 29)) & 0xFFFFFFFF
>     key = (key + 0x12345678) & 0xFFFFFFFF
>     return key
> 
> 
> def recv_all(sock: socket.socket, timeout: float = 2.0) -> str:
>     sock.settimeout(timeout)
>     data = []
>     while True:
>         try:
>             chunk = sock.recv(4096)
>         except socket.timeout:
>             break
>         if not chunk:
>             break
>         data.append(chunk.decode('utf-8', errors='replace'))
>         if b'Input HEX' in chunk or b'exit' in chunk:
>             break
>     return ''.join(data)
> 
> 
> if __name__ == '__main__':
>     with socket.create_connection((HOST, PORT), timeout=10) as s:
>         banner = recv_all(s, timeout=2)
>         print('=== banner ===')
>         print(banner.strip())
> 
>         print('\n>>> 请求 seed (27 01)')
>         s.sendall(b'2701\n')
>         raw = recv_all(s, timeout=2)
>         print(raw.strip())
> 
>         m = re.search(r'([0-9A-Fa-f]{2}(?:[ \t]+[0-9A-Fa-f]{2})*)', raw)
>         if not m:
>             raise SystemExit('无法从响应中提取 seed')
> 
>         hexstr = ''.join(m.group(1).split())
>         if len(hexstr) < 8:
>             raise SystemExit(f'seed 长度不足: {hexstr!r}')
> 
>         seed = int(hexstr[:8], 16)
>         print(f'seed = 0x{seed:08X}')
> 
>         key = calc_key(seed)
>         print(f'计算 key = 0x{key:08X}')
> 
>         key_hex = f'{key:08X}'
>         cmd = '2702' + key_hex
>         print('>>> 发送 key: ' + cmd)
>         s.sendall(cmd.encode() + b'\n')
> 
>         final = recv_all(s, timeout=2)
>         print('\n=== final response ===')
>         print(final.strip())
> '@ | Out-File -FilePath crack.py -Encoding utf8
哎呀，出现问题。请在报告此 Bug 时添加以下详细信息。
在 GitHub 上报告: https://github.com/lzybkr/PSReadLine/issues/new
-----------------------------------------------------------------------
上 94 个密钥:
 UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow 
UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow Backspace Backspace Backspace Backspace Backspace Backspace Backspace Backspace Backspace UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow 
UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow UpArrow

异常:
System.ArgumentOutOfRangeException: 该值必须大于或等于零，且必须小于控制台缓冲区在该维度的大小。
参数名: top
实际值是 -49。
   在 System.Console.SetCursorPosition(Int32 left, Int32 top)
   在 Microsoft.PowerShell.PSConsoleReadLine.ReallyRender(RenderData renderData, String defaultColor)
   在 Microsoft.PowerShell.PSConsoleReadLine.ForceRender()
   在 Microsoft.PowerShell.PSConsoleReadLine.HistoryRecall(Int32 direction)
   在 Microsoft.PowerShell.PSConsoleReadLine.PreviousHistory(Nullable`1 key, Object arg)
   在 Microsoft.PowerShell.PSConsoleReadLine.ProcessOneKey(ConsoleKeyInfo key, Dictionary`2 dispatchTable, Boolean ignoreIfNoAction, Object arg)
   在 Microsoft.PowerShell.PSConsoleReadLine.InputLoop()
   在 Microsoft.PowerShell.PSConsoleReadLine.ReadLine(Runspace runspace, EngineIntrinsics engineIntrinsics)
```

又多试了几遍，“上 x 个密钥”部分的 x 数字会越来越大……

问了下 AI，AI 是这么解答的：

## ✅ 问题分析：PSReadLine 上/历史回溯异常

太好了，这段描述很完整，现象和栈都给了。结论很清晰：是 `PSReadLine` 在历史切换时光标位置计算出了负值，导致 `Console.SetCursorPosition` 抛出 `ArgumentOutOfRangeException`。

### 关键症状

- 用户连续按 `↑`（`UpArrow`）直到出现错误
- 报错信息：
  - `System.ArgumentOutOfRangeException: top 必须 >= 0 且 < 缓冲区高度`
  - 实际值 `-49`
  - 出错点：`PSConsoleReadLine.ReallyRender` -> `SetCursorPosition(left, top)`
- “上 x 个密钥”里的 x 不断累加（意味着历史回溯操作被重复发送 + 视图更新出错）

---

## 🔍 原因猜测（基于 PSReadLine 行为）

1. `HistoryRecall(direction)` 试图载入上一条命令。
2. 内部 `RenderData` 计算当前行在控制台 buffer 中的 `top`（基于当前命令长度、折行、窗口高度等）。
3. 当 `top` 计算不符合当前窗口状态（或已有残余渲染数据）时，得到 `-49`（越界）。
4. `ReallyRender` 直接调 `Console.SetCursorPosition`，结果抛异常。
5. 异常未被吞，直接终止历史回溯命令，导致“无限上箭头+取消”循环或多次错误状态。

---

## 🛠 可能触发条件

- 当前命令行很长（含`@'...`多行多语句）导致折行、滚动状态复杂。
- 当前屏幕可用 buffer 行数不足，且光标已经在顶部（`top` 逼近 0）时继续“上历史”。
- `PSReadLine` 旧版 bug（你提供的场景很符合）：
  - 重复 `UpArrow` 触发无效历史、边界处理漏出
  - 逐次加大“上 x 密钥”计数，说明一个回退步导致渲染失败，仍保留下一次输入历史索引递增

---

## 💡 结论

文章里的问题不是“history不存在”，是 `PSReadLine` 里面「渲染时计算光标位置时没有充分做 0 边界/屏幕滚动保护」，最终 `SetCursorPosition` 得到负 top 导致程序异常崩。  
这种问题属于 `PSReadLine` 插件的 bug（4.0.x / 5.x 里曾出现），建议升级 `PowerShell` 和 `PSReadLine` 版本，或者调整控制台窗口大小/禁用行折叠复现确认。

所以是 Powershell 版本太旧导致的吗……
