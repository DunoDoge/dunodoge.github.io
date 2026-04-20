# Vibe Coding for HarmonyOS

历经近两周的摸索，总算是熟悉鸿蒙 Vibe Coding 的一些基本步骤——虽然也走了不少弯路！

## 一、构建一个简单的课程表应用

项目仓库：<https://github.com/DunoDoge/EasyCurriculum>

基于 ArkTS 开发，当前已实现基本课程表功能，现阶段工作为开发课程导入和其他课表设置功能，完善功能后考虑优化 UI 交互。

总结下经验：

1. 写好 ArkTS 语法约束规则（可以让 AI 总结）并配置文档集
2. 需求描述不能含糊其辞，明确要做什么，不做什么
3. 一定要审查 AI 给出的执行文档，确保 AI 真正“理解”你的要求且无冗余
4. 告知 AI 如何编译，必须通过编译才能返回结果，避免频繁手动调试

***

使用 Trae IDE 辅助开发。

推荐阅读：[如何让Cursor精通鸿蒙开发？](<https://juejin.cn/post/7522416099649470490>)

## 二、鸿蒙 C++ 开发实现 DOS 模拟器平台移植

项目仓库：<https://github.com/DunoDoge/DOSBox-OH>

这个项目的灵感来源于汇编语言实验中用到的 DOSBox，以及规划开发时了解到的 DOSBox Staging（<https://www.dosbox-staging.org/>）

通过 ArkTS 构建前端界面，使用 NAPI 实现与 C++ 原生代码的桥接，已经可以在手机、平板、2in1 设备上运行，支持键盘输入，可运行一些 DOS 应用，后续会优化图形显示，并增加音频、镜像挂载等功能。

***

这段时间接触了华为官方开发的 AI IDE 华为云码道（CodeArts Agent），功能和 VS Code 类似，只不过自带 Agent 由 Github Copilot 换成华为云的代码智能体，好处就是用智谱 GLM-5.1 模型要比 Trae 快得多（排队时间短！）
