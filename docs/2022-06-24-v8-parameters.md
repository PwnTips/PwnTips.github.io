---
title: "Chromium 和 v8 的一些参数（WIP)"
---

# Chromium 和 v8 的一些参数（WIP)

# V8 参数

## 构建参数

- v8_enable_snapshot_code_comments = false # 编译 builtins 函数时带上相应的注释，有助于我们调试时快速了解 builtins 函数的意义 

## 调试函数

v8 提供了一些可以辅助调试的 Runtime 函数，命令行中指定 --allow-natives-syntax 后就可以在 JavaScript 代码中使用，常用的如下：
- %DebugPrint()
- %SystemBreak()

### JIT 日志

```sh
--trace-turbo
```



## Chrome 命令参数

上面的 v8 参数 Chrome 也是支持的，但是用法和给 d8 指定时有些区别：

- v8 的参数要放到--js-flags=中，例如 chrome.exe --js-flags="--trace-turbo"
- 还要额外加上 --no-sandbox 参数，否则 v8 引擎所在的渲染进程是在沙箱中运行的，没法输出日志到控制台或者文件中
- 需要指定 --enable-_logging_=stderr 参数，这样 chrome 才会把 %DebugPrint() 一类的输出，输出到进程所属控制台
- 例如：在命令行执行  `chrome.exe --no-sandbox --enable-logging=stderr --js-flags="--help"` 之后会看到 v8 命令的帮助 