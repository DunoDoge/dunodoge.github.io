# Vibe Coding for HarmonyOS

历经近两周的摸索，总算是熟悉 Vibe for Harmony 的一些基本步骤——虽然也走了不少弯路！

## 一、构建一个简单的课程表应用

项目仓库：<https://github.com/DunoDoge/EasyCurriculum>

仅仅是初版 demo 就让 AI 重做了几遍，最开始几次生成代码的效果都不尽人意，项目里的 bug 简直多如牛毛，甚至还有 bug 在修复后又重新出现的！

之后又试着用 VSCode 的 Github Copilot，这玩意还没 Trae 聪明，我给它写 Agents，Instructions，结果中间半途而废，连 demo 都没做出来

这两天智谱发布新模型 GLM-5.1，Trae IDE 也同步上线，我整理好文档库、ArkTS 语法规则和工具链，一股脑喂给 AI，效果竟然还不错，修 bug 也是一针见血，唯一的缺点就是用的人太多，要排几千人的队……

对于这个项目，我的工作包括：

1. 描述基本需求，AI 给出更详细计划后检查修改
2. 检查 AI 生成代码
3. 测试应用并检查 bug，准确描述测试流程和 bug 出现场景

这个课程表应用本质上就是前端开发，可见现在 AI 做这些前端项目几乎称得上游刃有余；中后期工作就只剩 UI 美化和数据导入/导出功能，做完这些再考虑设计一些新功能和特性吧……

推荐阅读：[如何让Cursor精通鸿蒙开发？](<https://juejin.cn/post/7522416099649470490>)
