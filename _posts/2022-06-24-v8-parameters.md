---
layout: post
title: "Chromium 和 v8 的一些参数（WIP)"
---

# V8 参数

## 构建参数

- v8_enable_snapshot_code_comments = false # 编译 builtins 函数时带上相应的注释，有助于我们调试时快速了解 builtins 函数的意义 

## 调试函数

v8 提供了一些可以辅助调试的 Runtime 函数，命令行中指定 --allow-natives-syntax 后就可以在 JavaScript 代码中使用，常用的如下：
- %DebugPrint()
- %SystemBreak()
