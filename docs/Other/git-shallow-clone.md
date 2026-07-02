# Git 中的“浅克隆”

## 直击要点

浅克隆只拉取仓库历史的一部分，而不是从头开始的所有内容。这显著减少了下载大小和时间。它在以下情况特别有用：
- 不需要完整的提交历史
- 想为CI/CD管道更快地设置
- 正在处理大型仓库

参考：[Git 浅克隆：是什么、何时使用以及如何使用](https://blog.openreplay.com/zh/git-%E6%B5%85%E5%85%8B%E9%9A%86/)

---

以下是问题产生的背景：

我克隆了一个 GitHub 上的开源仓库，本来是作为我的一个项目的子模块，修改完才发现没有设置子模块，在经过一阵子折腾之后，发现新建的分支能推送到远程仓库，但是没有设置跟踪远程分支，远程分支的本地引用不存在，最后还是让 AI Agent 帮我解决了这个问题：

## 问题分析
子模块 dosbox-src 是一个 **浅克隆（shallow clone）** 仓库，导致：

1. 远程配置限制 ：只配置了获取 main 分支（ +refs/heads/main:refs/remotes/origin/main ），不包括 ohos-port
2. 目录结构缺失 ： .git/refs/remotes/origin/ 目录不存在，无法创建远程分支引用文件
3. 状态显示异常 ：虽然代码已推送到远程，但本地没有对应的远程跟踪引用，导致显示 [origin/ohos-port: gone]

## 解决方案

```bash
# 1. 更新远程配置以获取所有分支
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"

# 2. 创建缺失的目录结构
New-Item -ItemType Directory -Path .git/refs/remotes/origin

# 3. 创建远程分支引用文件
Set-Content -Path .git/refs/remotes/origin/ohos-port -Value aea07c9372564e64f220268da927cf4a79812670
```

## 最终状态

```
* ohos-port aea07c9 [origin/ohos-port] feat: add iir1 library for FluidSynth audio filtering
```

✅ 子模块的 ohos-port 分支现在正确跟踪远程分支，工作区干净，随时可以推送新变更。