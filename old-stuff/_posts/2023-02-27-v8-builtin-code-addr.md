# 获取 v8 builtin 函数的地址

v8 的 builtin 函数不是完全用 CPP 实现的，例如 CodeStubAssembler 是由 CPP 生成 tubrofan 的 IR，再由 turbofan 编译出机器码。所以这部分代码肯定不能像普通的 CPP 代码那样进行调试的。

搜索了一些材料以后发现了一些调试方法，这里记录一下：
- 从 isolate->builtin 数组中找到对应的函数起始地址
- https://v8.dev/docs/gdb 记录的内容，这部分代码也是可以下断点 
- 