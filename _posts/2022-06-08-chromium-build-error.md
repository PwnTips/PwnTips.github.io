---
layout: post
title: "Chrome 构建错误"
---

## lld-link: error: invalid timestamp: -2142000. Expected 32-bit integer

build\\util\\LASTCHANGE.committime 文件内容为 0 导致的。
此文件里记录的应该是从 git 日志中提取的上次 commit 的时间戳，如果获取失败了默认填入 0。
手工改成合理的时间戳( epoch ) 再重新执行 gn 即可。

## openssl config gailed: error:25078067

```
FAILED: gen/chrome/browser/resources/settings/vulcanized.html gen/chrome/browser/resources/settings/lazy_load.vulcanized.html gen/chrome/browser/resources/settings/crisper.js gen/chrome/browser/resources/settings/lazy_load.crisper.js
d:/depot_tools/bootstrap-2@3_8_10_chromium_23_bin/python/bin/python.exe ../../chrome/browser/resources/optimize_webui.py --host settings --input gen/chrome/browser/resources/settings/settings_resources.unpak --out_folder gen/chrome/browser/resources/settings --depfile gen/chrome/browser/resources/settings/build.d --js_out_files crisper.js lazy_load.crisper.js --exclude chrome://resources/mojo/chromeos/services/network_config/public/mojom/cros_network_config.mojom.html --html_in_files settings.html lazy_load.html --html_out_files vulcanized.html lazy_load.vulcanized.html --insert_in_head "<base href=\"chrome://settings\">"
Traceback (most recent call last):
  File "../../chrome/browser/resources/optimize_webui.py", line 363, in <module>
    main(sys.argv[1:])
  File "../../chrome/browser/resources/optimize_webui.py", line 346, in main
    manifest_out_path = _optimize(args.input, args)
  File "../../chrome/browser/resources/optimize_webui.py", line 300, in _optimize
    manifest_out_path, args, excludes)
  File "../../chrome/browser/resources/optimize_webui.py", line 273, in _bundle_v2
    '--js', os.path.join(tmp_out_dir, js_out_file)])
  File "..\..\third_party\node\node.py", line 27, in RunNode
    raise RuntimeError('%s failed: %s' % (cmd, stderr))
RuntimeError: ..\..\third_party\node\win\node.exe ..\..\third_party\node\node_modules\crisper\bin\crisper --source D:/chromium2/src/out/CVE-2020-6418/gen/chrome/browser/resources/settings/bundled\settings.html --script-in-head false --html D:/chromium2/src/out/CVE-2020-6418/gen/chrome/browser/resources/settings/bundled\vulcanized.html --js D:/chromium2/src/out/CVE-2020-6418/gen/chrome/browser/resources/settings/bundled\crisper.js failed: openssl config failed: error:25078067:DSO support routines:win32_load:could not load the shared library
```

出现这个错误是因为设置了 `OPENSSL_CONF` 环境变量，把这个环境变量置空可以解决。

