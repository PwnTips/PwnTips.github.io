---
layout: post
title: "渐进式的开发一个 fuzzer (WIP)"
---

最近看了一些增量开发编译器的文章后，我就想到我也可以增量开发一个 fuzzer：

- 开发过程由很多轮的迭代组成
- 每一轮迭代周期都尽量短，根据每轮的复杂度可能是几小时到几周时间
- 每一轮迭代产出的都是一个可用的 fuzzer
- 每轮迭代的产出不需要是一个完美的解决方案，首先保证可用性，复杂的问题甚至可以先考虑部分解。
- 为了保证每一轮迭代开发工作量尽可能少，我会倾向于先使用开源的库，如果有必要的话，再把开源的库替换成自己开发的。
- 
- 我选择的目标是开源项目 mujs，给它写一个 generation-based fuzzer，开发语言选择 python

---
⚠️ 增量开发编译的文章：
- [An Incremental Approach to Compiler Construction](http://scheme2006.cs.uchicago.edu/11-ghuloum.pdf)
- [用 Rust 开发编程语言](https://github.com/awesome-kusion/rust-toy-lang-book)

---

## 准备

## 第一轮

babystep 一定要走稳，第一轮就只实现用 mujs 执行一段固定的程序，监控一下 mujs 是否崩溃即可。