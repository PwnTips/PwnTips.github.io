---
layout: post
title: 在国内连接 OSCP 的 Universal VPN
tags:
---
TLDR 版：openvpn 支持 socks5 代理，改一下配置，使用 socks5 代理连接 VPN 服务器。

最近购买了 offsec 的 PEN 200/OSCP 课程，发现在国内连它的 Universal VPN 很不稳定，不用多说又是 GFW 的原因。

最开始我是买了个国外的 VPS 上面装了 KALI，然后配合 SSH 端口转发使用，但是买的廉价 VPS 硬盘还有内存都比较小，还是各种不方便，就还是想解决一下，试了官方说的改网卡的 MTU，没什么效果，觉得还是要从墙的方向解决问题，就搜了一下，发现 OpenVPN 是支持 socks5 代理的，改一下配置文件就好。

```
socks-proxy 127.0.0.1 10808
```

或者在 Windows 版的 GUI OpenVPN 客户端上也是可以设置代理的。

![](/assets/images/Pasted%20image%2020241230180724.png)

设置了代理以后，连接速度稳定了很多，以前用 RDP 完全不能用，现在已经可以正常使用了，但是稍有延迟。

但是还有个问题，每次进行第一次连接时很不稳定，要重连多次才能得到一个可用的连接。现象就是虽然 OpenVPN 连接成功但是，并不能 ping 通目标机器，Window 客户端的话托盘图标有时候会变成黄色，有时会有下面的提示信息：

```
Mon Dec 30 16:36:09 2024 WARNING: Received unknown control message: * OFFSEC LABS NOTICE: Mon Dec 30 16:36:09 2024 WARNING: Received unknown control message: * Managing Universal VPN, please wait... Mon Dec 30 16:36:09 2024 Connection reset command was pushed by server ('')
```

目前搜到一个可能的[解决方案](https://www.hardwork.cn/html/archives/381.html)， 说是 persist-tun 配置造成的，目前不确认是否这个问题，还在观望中。

因为这个问题，我现在都是连上 Universal VPN， 然后开一台机器测试一下能不能实际 PING 通，不能的话，就要重连几次，直到能 PING 通为止。但是只要连接成功以后，就可以稳定使用了。