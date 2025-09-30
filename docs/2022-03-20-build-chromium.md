---
title: "构建 Chromium（墙内）"
tags: [Chromium, Pwn, v8]
comments: true
---

# 构建 Chromium（墙内）

本文记录在 Windows 系统构建 Chromium 的过程，方法完全抄袭自 [官方文档](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/windows_build_instructions.md)，仅加入一些代理配置相关的内容。

## 致谢

多谢 GFW，把简单的事情变得复杂，让我们人生多了一些历练的机会🙃。

## Visual Studio

- 至少需要 VS 2017，推荐使用 VS 2019，我用的版本是 VS 2019 Version 16.11.9。
- 需要装 Desktop development with C++、MFC、ATL 这几个组件
- Windows SDK 版本要高于 10.0.19041，对于 VS 2019 来说默认就是满足的，不放心的话构建前可以先更新下。
- 如果是编译 2019 年左右的旧版本，首选 VS 2017，我在用 VS 2019 编译旧版本时遇到了兼容问题，可以安装多个版本，构建时显示指定使用的版本。

## depot_tools

depot_tools 是开发 Chromium 所需的一系列工具、脚本的集合。

### 安装

- 下载 [https://storage.googleapis.com/chrome-infra/depot_tools.zip](https://storage.googleapis.com/chrome-infra/depot_tools.zip)。
- 解压到任意位置，例如 d:/depot_tools。\
  多年的采坑经验告诉我，解压路径层级少一点，不要超长，不要包含中文、空格，就不容易遇到奇怪的问题。
- 解压完成后，要检查一下 depot_tools 目录，确认存在 .git 子目录，如果不存需要换一个解压工具，例如 7z。

### 配置 Git （可选）

```bash
# 提交代码需要
> git config --global user.name "ReplaceWithYourUserName"
> git config --global user.email "ReplaceWithYourEmail@chromium.org"
# git 自动转换换行回车
> git config --global core.autocrlf false
# git 不存储文件权限
> git config --global core.filemode false
# 使用 rebase 合并拉取的代码
> git config --global branch.autosetuprebase always
```

### 环境变量

- 将 depot_tools 目录加到 PATH，要确保加到 Python 的安装目录前，例如 PATH 的第一项。这会使 depot_tools 目录中的 Python 替代本地安装的 Python，如果你修改的是持久化的环境变量配置，用完后要改回去。
- DEPOT_TOOLS_WIN_TOOLCHAIN 设置为 0，使用本地的 Visual Studio 工具构建 Chrome
- (可选) vs2019_install/vs2017_install/vs2022_install: 设置为 Visual Studio 的安装目录。
  depot_tools 会自动搜索 Visual Studio 安装目录，如果对搜索结果不满意可以用此环境变量显示指定版本和安装目录
  例如，机器上安装了多个 Visual Studio，默认搜索到的可能是 VS 2019，如果你想用 VS 2022 的话，就可以指定 vs2022_install 环境变量。

```bash
# 这个 URL 目前不需要挂代理，需要代理可以改成:
# Invoke-WebRequest -URI `
#   https://storage.googleapis.com/chrome-infra/depot_tools.zip `
#   -Proxy "http://127.0.0.1:8001" -OutFile ./depot_tools.zip
> Invoke-WebRequest -URI `
>   https://storage.googleapis.com/chrome-infra/depot_tools.zip `
>   -OutFile ./depot_tools.zip
# 解压，需要安装7zip
> 7z x .\depot_tools.zip -odepot_tools
# 检查.git子目录存在
> ls .\depot_tools\.git
> cd .\depot_tools\
# 修改环境变量, 仅当前会话生效
> $env:PATH="$PWD/;$env:PATH"
> $env:DEPOT_TOOLS_WIN_TOOLCHAIN=0
# $env:vs2019_install= `
#   "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community"
```

### 配置代理

depot_tools 需要挂代理才能正常运行，它是多个工具、脚本的集合，代理设置也需要配置多项。

#### CIPD

CIPD 是一个包管理工具，depot_tools 用它来下载依赖项，它能够读取环境变量中的代理设置。

```bash
> $env:HTTP_PRXOY='http://127.0.0.1:8001'
> $env:HTTPS_PRXOY='http://127.0.0.1:8001'
```

用完后清除代理

```bash
> $env:HTTP_PRXOY=''
> $env:HTTPS_PROXY=''
```
#### Git

Git 也支持从环境变量读取代理配置，无需额外配置。

如果环境变量不生效的话，也可以用下面的命令显示给 Git 指定代理。

```bash
> git config --global http.proxy "http://127.0.0.1:8001"
> git config --global https.proxy "http://127.0.0.1:8001"
```

用完后清除代理

```bash
> git config --global --unset-all http.proxy
> git config --global --unset-all https.proxy
```

还可以参考 https://gist.github.com/evantoli/f8c23a37eb3558ab8765 的办法，仅对 googlesource.com 这个域名设置代理，这样就可以一次设置永久使用了。(域名可能发生变化，以你的实际情况为准)
#### gsutil

gsutil 是 Google 云存储的客户端，被 depot_tools 用来下载依赖，也需要额外配置代理。

* 创建如下.boto文件
```
[Boto]
proxy = 127.0.0.1
proxy_port = 8001
proxy_type = http
```
* 设置环境变量 NO_AUTH_BOTO_CONFIG，为 .boto 文件的全路径
```bash
> $env:NO_AUTH_BOTO_CONFIG="$PWD/.boto"
```

### 初始化

设置好代理后，第一次运行 gclient，gclient 会自动安装所需的依赖。如果代理设置的都没有问题的话，稍等一会就会看到 gclient 输出使用帮助。

```bash
> gclient
WARNING: Your metrics.cfg file was invalid or nonexistent. A new one will be created.
Usage: gclient.py <command> [options]

Meta checkout dependency manager for Git.

Commands are:
  config   creates a .gclient file in the current directory
  diff     displays local diff for every dependencies
  fetch    fetches upstream commits for all modules
  flatten  flattens the solutions into a single DEPS file
  getdep   gets revision information and variable values from a DEPS file
  grep     greps through git repos managed by gclient
  help     prints list of commands or help for a specific command
  metrics  reports, and optionally modifies, the status of metric collection
  pack     generates a patch which can be applied at the root of the tree
  recurse  operates [command args ...] on all the dependencies
  revert   reverts all modifications in every dependencies
  revinfo  outputs revision info mapping for the client and its dependencies
  root     outputs the solution root (or current dir if there isn't one)
  runhooks runs hooks for files that have been modified in the local working copy
  setdep   modifies dependency revisions and variable values in a DEPS file
  status   shows modification status for every dependencies
  sync     checkout/update all modules
  validate validates the .gclient and DEPS syntax
  verify   verifies the DEPS file deps are only from allowed_hosts

Options:
  --version             show program's version number and exit
  -h, --help            show this help message and exit
  -j JOBS, --jobs=JOBS  Specify how many SCM commands can run in parallel;
                        defaults to 12 on this machine
  -v, --verbose         Produces additional output for diagnostics. Can be
                        used up to three times for more logging info.
  --gclientfile=CONFIG_FILENAME
                        Specify an alternate .gclient file
  --spec=SPEC           create a gclient file containing the provided string.
                        Due to Cygwin/Python brokenness, it can't contain any
                        newlines.
  --no-nag-max          Ignored for backwards compatibility.
```

---

**ℹ️NOTE**

- 文档要求在 cmd.exe 中构建 Chromium，但我介绍的都是在 PWSH 中运行的方法，我使用的 PWSH 版本如下：
```bash
> $PSVersionTable
Name                           Value
----                           -----
PSVersion                      7.2.1
PSEdition                      Core
GitCommitId                    7.2.1
OS                             Microsoft Windows 10.0.19043
Platform                       Win32NT
PSCompatibleVersions           {1.0, 2.0, 3.0, 4.0…}
PSRemotingProtocolVersion      2.3
SerializationVersion           1.1.0.1
WSManStackVersion              3.0
```
- 整个过程中需要走代理的流量还是很大的，如果你使用的是按流量计费的代理，代理提供商一般有提供不记流量的低速节点。
- 附上 depot 的[读音](https://youglish.com/pronounce/depot/english/us?)

---

## 下载Chromium源码

- 在任意位置，新建 Chromium 目录，例如 D:/Chromium。
- 切换到新创建的目录，使用 fetch 命令下载代码，网络不好的话，可以指定 \--no-history 命令行，忽略 commit 历史，减小了要下载文件的体积，命令执行成功后代码在 src 子目录

```bash
> mkdir chromium && cd chromium
> fetch --no-history chromium
```

看到代码拉取正常开始以后，就可以去看一季电视剧了😂。不知道是不是我的代理网络太慢了，我用了 5 个小时左右才完成。

## 构建

- 确认磁盘有足够的空间，我这里构建完成后 out/Default 目录占用 52 GiB，depot_tools + chromium 总共占用 74 GiB 左右
- `cd src` 切换到 src 目录
- `gn args out/Default` ，在弹出的记事本中填入下面的配置，保存后关闭记事本
```
is_component_build = true
enable_nacl = false
v8_optimized_debug = false
```
- 等待 GN 执行，GN 会在 out/Default 目录，生成构建所需的文件
- (可选) 把 chromium 目录，加入到杀毒软件的白名单，防止杀毒软件在构建过程中不断扫描构建产物，拖慢构建速度
- `autoninja -C out\Default chrome` 用 ninja 构建 chrome，又需要几个小时。
- 构建期间已经不再需要代理了。

编译完成后，可以在 out/Default 目录找到编译好的 chrome.exe。


默认编译出来的是 Debug 版，要编译 Release 版的话，配置改成：

```
is_component_build = true
is_debug = false
enable_nacl = false
dcheck_always_on = true
```

Debug 版和 Release 版可以在两个不同的目录中共存，例如把两个版本分别放到 out/Default 和 out/Release。是否可以同时编译，这个我还没试过，有需求的读者可以测试一下。

---

**ℹ️NOTE**

- Chromium 构建用到了 GN 和 Ninja 两个构建工具。\
  GN 属于元构建工具，它并不实际执行构建，而是输出 Ninja、VS 等工具使用的描述文件，GN 的优点是描述文件适合手工编写。 \
  Ninja 则侧重供底层构建能力，提升构建速度，一般配合 GN、CMake 之类的元构建工具使用。
- GN 仅需运行一次，之后仅执行 Ninja 命令即可，Ninja 会在必要时自动调用 GN。

---

## 生成 Visual Studio 解决方案 （可选）

可以用 `gn gen --ide=vs` 生成包含所有代码的 VS 解决方案，但是这样生成的解决方案太大了，使用起来很不方便，推荐用 \--filter 和 \--no-deps 命令行限定解决方案包含的范围。

例如：用如下命令生成包含 v8、base 和 blink 的解决方案 out/Default/v8_blink.sln。

```bash
> gn gen --ide=vs --filters='//v8/*;//base/*;//third_party//blink/*' `
  --no-deps --sln=blink_v8 out\Default
```

推荐阅读[ GN 的帮助](https://gn.googlesource.com/gn/+/master/docs/reference.md#cmd_gen) 和 [VisualStudio Tricks](https://www.chromium.org/developers/how-tos/visualstudio-tricks/) 了解更多技巧。
