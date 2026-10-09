猫眼录屏 CatEye — 纯静态 HTML 产品官网
================================================

这份交付不需要 Node.js、npm、构建工具、Python、数据库或后台服务。
HTML 就是可直接编辑的源代码，也是可以直接上线的网页。

1. 本地查看
双击 index.html，或用浏览器打开。浏览器对 file:// 模式的剪贴板权限可能
有限；复制地址失败时，页面会显示选中的下载地址，支持手动复制。

2. 部署上线
把本文件所在文件夹中的全部内容上传到静态网站空间，确保 index.html
位于站点根目录，保留 assets/ 目录。可部署到 Nginx、Apache、IIS 或
GitHub Pages 等静态托管。无需安装任何依赖，无需执行构建命令。
GitHub Pages 可选择从分支根目录发布；空 .nojekyll 文件已包含。

3. 页面结构
index.html          中文产品首页（主入口）
index-en.html       English product home
download.html       中文下载页
download-en.html    English download page
guide.html          中文使用指南
guide-en.html       English guide
assets/css/main.css  全站自定义样式与自适应规则
assets/js/main.js    原生 JavaScript 交互与动效
assets/js/downloads.js GitHub 最新版本获取、直接下载与复制地址
assets/vendor/      本地 Bootstrap CSS 与图标授权
assets/images/      真实软件界面、产品 Logo、三张场景照片
assets/CREDITS.txt   图片与开源资源来源
docs/设计与部署说明.html  用户体验、信息架构、视觉与交互说明

4. 修改方式
页面文字：直接编辑对应 HTML。下载地址和安装包文件名无需手动维护。
风格、间距、字体、断点、动效：编辑 assets/css/main.css。
交互提示文字和逻辑：编辑 assets/js/main.js。
所有页面使用相对路径，可部署在域名根目录或子目录。

5. 软件版本更新与直接下载
首页和指南中的下载按钮、页脚下载、顶部下载按钮全部直接请求下载；
仅顶部桌面导航与手机菜单中的“下载”跳转到独立下载页。
页面打开时从 GitHub /repos/greatworks/CatEyeScreenRecorder/releases/latest
获取正式发布的版本号、体积和文件格式。每次点击下载或复制地址再次查询，
使用 cache: no-store；仅合并同时进行的请求，不持久缓存安装包链接。
优先选取最新正式发布中的 Windows x64 EXE/MSI 安装包；没有安装器时回退到
同一最新版的便携 ZIP，并同步切换解压说明。不回退到旧版，也不写死版本
标签或文件名。只接受该仓库 HTTPS GitHub Release 资产，不包含源码包。
获取超时（9 秒）、API 限流、缺少匹配文件等异常会提示重试和最新发布页。
关闭 JavaScript 时，“下载”链接前往 GitHub 最新发布页，需手动选择文件。
GitHub 下载需要联网；所有展示资源仍在本地包内。可在 HTTP 或 file:// 下
打开，能否访问 GitHub API 取决于浏览器与网络的跨域策略。
本轮已依据 2026-10-09 GitHub 正式发布 V2.3.1 更新声音与安装功能说明；
同时更新手动检查与录制中推迟更新提示的说明。功能文案需在重大功能更新后同步维护，下载文件与版本信息会自动获取。

6. 无构建 / 无 CDN 依赖
Bootstrap 已作为本地 CSS 随包提供，Lucide SVG 内嵌在 HTML 中，照片和软件
界面图片也在包内。网页的展示不依赖第三方图片链接、在线字体或 JS CDN。
软件本体的下载与发布记录仍链接到 GitHub，需要用户联网访问。

7. 验证范围
六个业务页面已检查 1440、768、393、320px 宽度，无横向溢出。
已验证导航、语言切换、图片放大、画质切换、录制步骤、FAQ 与动效开关。
浏览器验证使用 HTTP 本地预览，并已验证 file:// 直接打开首页可获取真实
GitHub 最新版本信息。相对资源与无模块页面实现已检查；最新下载使用 fetch。
并非实体 iPhone、Android 或全部浏览器真机验收。

English summary
---------------
Open index-en.html for English. These are editable, production-ready static HTML
files. Upload the entire folder to a static web host; no build, Node.js, npm or
backend is required. All visual assets, Bootstrap CSS and SVG icons are local.
Edit the HTML directly and keep the assets directory in place.
