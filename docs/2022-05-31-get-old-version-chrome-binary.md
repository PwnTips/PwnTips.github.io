---
title: "获取旧版本的 Chrome"
tags: [Chromium, Pwn, v8]
---

复现 Chrome 漏洞肯定需要要先拿到受影响的旧版程序，本文记录两种获取任意版本 Chrome 文件的方法：
- 从源码构建，优点是可以得到 Debug 版的文件便于调试，缺点是需要花很长时间。
- Chromium 团队维护了一份旧版 Chrome 的备份，包含调试符号，可以用来调试。缺点是备份只有 Release 版，且有部分版本是没有备份的，需要用临近版本替代。

## 构建

构建方法参考了[官方文档](https://chromium.googlesource.com/chromium/src/+/master/docs/building_old_revisions.md)和[ StackOverflow 上的回答](https://stackoverflow.com/questions/47087970/how-to-checkout-and-build-specific-chromium-tag-branch-without-download-the-full)。

### 获取指定版本的源码

由于网络环境恶略，我只下载指定 Tag 的代码，不下载历史 Commit。
网络环境好的话，可以去掉 `--deph 1` 选项，下载完整的 Commit 记录，避免不必要的问题。

```bash
# 把tags/ 和 chromium_ 后面的 Major.Minor.Patch.Build 形式的版本号替换成你需要的版本
> git fetch `
>  https://chromium.googlesource.com/chromium/src.git `
>  +refs/tags/59.0.3071.115:chromium_59.0.3071.115 --depth 1
> git checkout tags/59.0.3071.115
```

---

**ℹ️NOTE**: 构建脚本需要从上一个 Commit 获取时间戳，不下载历史 Commit 就需要在构建时手工修正这个时间戳，后面会介绍修正方法。

---

### depot_tools 切换到对应的版本（可选）

把 depot_tools 切换到和源码对应的版本，防止兼容性问题。

```bash
# chrome 源码的时间戳
~/chrome/src > git log -n 1 --pretty=format:%ci
```

```bash
# depot_tools 切换到对应时间的 commit
~/depot_tools > git rev-list -n 1 --before="上一步获取的时间戳" main
~/depot_tools > git checkout 上一步获取的 Commit
# 禁用 depot_tools 自动更新
~/depot_tools > $env:DEPOT_TOOLS_UPDATE=0
```

### 同步依赖

```bash
# 清理历史文件
> git clean -ffd
# 下载依赖
> gclient syn -D --force --reset
```

### 构建

参考 [墙内构建 Chromium](2022-03-20-build-chromium.md)用 GN 和 Ninja 执行构建。

## 下载官方备份

Google 也提供了旧版 Chrome 备份的下载，包括多个平台，而且包含调试符号，可以进行源码调试，唯一的缺点是只备份了 Release 版。

### 第三方工具

- 直接在第三方工具 https://vikyd.github.io/download-chromium-history-version/ ，查找某个版本对应的镜像下载地址，下载地址都是 Google 官方的备份，可以放心使用。
- 同样功能的项目还有很多 https://github.com/Bugazelle/chromium-all-old-stable-versions

### 手工查找

也可以按照 [官方文档](https://www.chromium.org/getting-involved/download-chromium/)中介绍的方法手工查找下载地址：

- (可选）在 [Chrome 发布记录](https://chromereleases.googleblog.com/search/label/Stable%20updates) 查询到历史版本的完整版本号
  例如，搜索 "Chrome 76" 可以搜到 76.0.3809.87 的发布记录
- 利用 [omahaproxy](https://omahaproxy.appspot.com/) 页面的 Version Information 功能，搜索版本号对应的 Position
- 在 [commondatastorage](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html) 页面，选择你的系统对应的目录
  例如，我选择 Win_x64
- 在 Filter 输入框中填入 Position
	- 如果查到对应的目录，按需下载此目录内的文件即可
	  例如：Chrome-win.zip（主程序）和 Chrome-win32-syms.zip（调试符号）
	- 没找到说明此版本没有对应的备份，需要调整版本号，下载近似版本的备份
- 上一节提到的工具，也是基于这个思路开发的，还有版本号模糊搜索的能力，推荐直接使用工具
