---
layout: post
title: "DynamoRIO 常用参数"
---

很多 Fuzzing 相关的工具，诸如 winAFL、lighthouse 都涉及到 DynamoRIO 的使用，记录一些常用的 DynamoRIO 参数便于解决在使用这些工具时遇到的问题。

drrun 的参数
- -no_follow_children: 
	默认情况下 DynamoRIO 会插装目标整个进程树，很多时候这并不是我们希望的动作，指定此参数后仅插装目标进程，忽略子进程。
	还可以指定仅插装指定的子进程
- -msgbox_mask _0xN：
	在指定事件发生时弹出消息窗，一般用在调试过程中。
	例如：发现目标进程运行一会就会崩溃，可以指定 -msgbox_mask 15, 这样目标进程启动后会弹出一个消息框，便于我们附加到目标进程上。
- 更参数见 [DynamoRIO Runtime Options](https://dynamorio.org/page_deploy.html#sec_options) 部分

 