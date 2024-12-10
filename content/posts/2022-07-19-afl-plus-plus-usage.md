---
layout: post
title: "学习使用 AFL++"
---

目前热度最高的漏洞挖掘方法应该就是 Fuzzing 了，本文记录我学习使用 AFL++ 来 Fuzzing 开源的音频文件标签处理库 [taglib](https://taglib.org/) 的过程。

## 构建 AFL++

参考[官方文档](https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/INSTALL.md)即可，同时要注意：
- AFL++ 支持的功能很丰富，考虑到大部分人不会用到所有功能，构建也是提供了不同的可选集合的，比如我只需要 llvm 的 instrumentation，就用 `make all` 即可，文档里已经描述的很清楚了。
- 如果需要 `llvm/gcc` 以外的一些功能，构建过程中可能从 github/google 服务器拉取依赖代码，推荐挂好梯子
- 先装好依赖确认 llvm-config/LLVM_CONFIG 可以正常使用后再去构建 AFL++，否则可能出现虽然构建成功了，但较新的 llvm 功能没有被构建到程序中的情况。
- 构建完成后，运行 `make install`，将 afl++ 安装到 /usr/local/bin 目录

## 构建 harness

harness 是被 fuzzing 的程序，它会被 fuzzer 运行，负责执行待 fuzzing 的代码，同时采集代码覆盖信息反馈给 fuzzer。

对于 taglib 来说，examples 目录下提供的 tagreader 程序，可以打开通过参数指定的音频文件，列出文件中包含的 tag，就可以直接作为 harmess 来使用。不过 fuzzing 过程中，会重复的打开文件，修改文件，如果每次打开一个文件都要重启程序，执行效率不高，我按照[官方文档 persist_mode ](https://github.com/AFLplusplus/AFLplusplus/blob/stable/instrumentation/README.persistent_mode.md) 中提到的方法，对 tagreader.cpp 稍加修改，把它改成了启动后可以持续解析同一个文件的程序，这样省下了很多进程初始化的时间，提升了 fuzzing 效率。

其实还可以进一步优化，采用内存映射的方式读取数据，这样映射一次后，数据就驻留在内存（数据总量很大时也可能是交换文件）中了，省去读取文件的时间。

这里我先尝试用标版的 clang 构建出未修改的 tagreader，成功后再用 afl++ 的 llvm lto 模式构建了 perisst_mode 的 tagreader。这部分的构建官方文档我怀疑有部分内容过时了，对于 taglib 来说 lto 模式构建也很简单，如下操作即可：

```
$ cd taglib
$ cmake -DCMAKE_C_COMPILER=afl-cc -DCMAKE_CXX_COMPILER=afl-c++ -DBUILD_EXAMPLES=ON -DCMAKE_INSTALL_PREFIX=/usr/local -DCMAKE_BUILD_TYPE=Release .
$ export AFL_CC_COMPILE=LTO
$ make
```

cmake 的参数：
- -DCMAKE_C_COMPILER=afl-cc -DCMAKE_CXX_COMPILER=afl-c++ 把 afl-cc/afl-c++ 作为编译工具，这个程序会从环境变量读取相关配置，用合适的参数调用真正的编译工具
- 剩下的部分是 taglib 的参数，参考 [taglib 文档](https://github.com/taglib/taglib/blob/master/INSTALL.md)

AFL_CC_COMPILE=LTO 是指定 AFL++ 使用 LTO 模式进行插装（instrument）。此模式是官方推荐优先选择的插装模式，详情参考文档[ fuzzing in depth ](https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/fuzzing_in_depth.md)。

## Corpus

有了 harness 还需要找支持的 Corpus(样本文件) 才能开始 Fuzzing，taglib 的单元测试中附带了几个文件，目前我就选择这几个文件作为种子样本。以后有时间了，还可以采用从 互联网（google，github）爬取更多的文件，毕竟 AFL++ 只是在做一些高度优化过的爆破，多搞一个样本应该还是会节省很多算力的。另外我目前只提取了其中的 MP3 文件，打算先专注 Fuzzing 一种文件格式，希望可以把算力集中在触发这种文件格式的解析代码路径上。

还有重要的一点是要对样本进行蒸馏（Corpus Distillation），Fuzzing 过程中会对每个进行逐字节/逐x位的处理，所以如果一个样本不能触发新的代码路径的话，把它加到种子中，反倒会降低 Fuzzing 的效率。AFL++ 提供了 afl-cmin、afl-tmin 来精简样本。afl-cmin 用来缩减样本数量，仅留下能触发不同代码路径的样本。afl-tmin 用来缩减样本体积，将样本裁剪成等价但是更小的文件。因为我的种子本来就是象征性的找了几个文件，数量体积都不大，我只是象征性的用 afl-cmin 处理了一下。如果以后真的用爬虫在互联网爬取样本的话，可以在爬取脚本后面接一个自动蒸馏的功能。

其实还有一个可选参数是字典，因为有些代码路径可能要文件内容符合正确的魔法数标识后才能进入，如果是单纯的去爆破，可能要花很长时间，如果有一个已知魔法数组成的字典，没准可以更快的触发到这些路径，但对于我选择的 LTO 插装模式来说，文档指出 AFL++ 会在编译过程中自动的识别并生成字典，我就没再关注这个参数了。

## 启动 afl-fuzz

准备好上面的材料，就可以启动 afl-fuzz 试下效果了：

```
$ afl-fuzz -i corpus-cmin -o fuzzout -- ./tagreader @@
```

- 输入文件夹是 corpus-cmin 里面存放了 afl-cmin 过滤好的样本
- 输出文件夹是 fuzzout，AFL++ 会把 fuzzing 的状态，新样本等内容都存到这里
- -- 用来之后是 harness 的命令行，@@ 占位符用来指代需要 AFL++ 替换成文件路径的部分

看到 afl-fuzz 可以正常运行后，我们可以改进一下，利用好 afl++ 提供的多种功能。[官方推荐](https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/fuzzing_in_depth.md#c-using-multiple-cores)的方式是使用 -M/-S 参数，利用主从模式开启多个 afl-fuzz，每个实例可以使用不同参数或是使用不同的构建选项的 harness，这样所有的实例之间会同步样本，互相配合扬长避短。
- harness 开启不同的 sanitizer, 开启 sanitizer 会减慢运行速度，但是可以发现正常情况下不会触发崩溃的问题
- harness 使用 CMPLOG 选项编译，尝试自动解决魔法数/校验和的问题，详见 [README.cmdlog.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/instrumentation/README.cmplog.md)
- harness 使用 laf-intel 选项编译，采用不同的方案尝试解决魔法数的问题，详见 [README.laf-intel.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/instrumentation/README.laf-intel.md)
- 尝试不同的文件突变算法

我的 afl-fuzz 都跑在一个廉价单核 vps 上，CPU 算力不是很够用，勉强开了 4 个实例：
- 一个没有额外参数的主实例 `afl-fuzz -M master -i corpus-cmin -o fuzzout -- ./tagreader.lto.afl @@`
- llvm 模式插装并开启 CMPLOG，这个是因为 taglib 在 lto 模式下开启 CMPLOG 编译会出错
- lto 模式开启 la-intel 的 harness
- lto 模式开启 ASAN 的 harness




