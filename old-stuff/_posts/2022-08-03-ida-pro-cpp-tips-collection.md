---
layout: post
title: "IDA Pro Tips 整理"
---

## 来源

这里记录的 Tips 都是从网上其他地方看到的，来源包括以下：
- https://swarm.ptsecurity.com/ida-pro-tips/
- https://hex-rays.com/blog/tag/idatips/

## 逆向 CPP 对象

- IDA 内置了对 CPP 虚函数表的支持，只要把结构体中虚表对应的成员名为设置为 \_\_vtable，类型名设置为 Xxx\_vtbl 即可: https://www.hex-rays.com/products/ida/support/idadoc/1691.shtml
- 快速创建结构体：https://hex-rays.com/blog/igor-tip-of-the-week-11-quickly-creating-structures/
	- 选中的常量数据，右键菜单创建结构体
	- 在 local types 窗口，用 C 代码创建
- 逆向 CPP 代码时，经常可以在构造函数之前的 new 语句处得知对象的总大小，但不知道每个成员的意义和大小，可以用 https://hex-rays.com/blog/igor-tip-of-the-week-12-creating-structures-with-known-size/ 介绍的方法先创建出一组哑成员，后面再慢慢的逆向出各成员的意义
