# 更新记录

本项目的所有重要更改都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## v0.1.3 (2026-05-23)

### 新增

- 漫画编辑功能：删除当前页、在当前位置插入新页，直接写入 CBZ 源文件
- 漫画滑动翻页模式：手指滑动切换页面，支持触摸屏/移动端
- 漫画内置目录（右上角按钮，左侧弹出，与小说一致）
- 小说 TXT 在线编辑保存功能
- 屏蔽含 `[ ]` 的标签（ComicInfo.xml 中的作者标记）
- 作者搜索支持：点击作者名可按作者筛选作品
- 本地网络 + 外部网络访问支持（Vite 绑定 0.0.0.0）
- Docker NAS 部署配置完善（端口 7788 + books 卷）

### 修复

- 修复全屏状态下单页/双页/滑动模式底部内容被截断（改用 fixed + absolute 定位）
- 修复滑动模式触摸滑动无效（handleTouchMove 中 y 坐标未记录导致比较失效）
- 修复编辑模式无法保存（Fastify 子作用域封装导致 multipart PUT 路由不可达）
- 修复漫画删除页面后 React key 冲突导致的显示错乱（改用唯一页面标识作为 key）
- 修复修改保存后当前设备仍显示旧内容（URL 加时间戳 + Cache-Control 改为 no-cache）
- 修复小说保存失败（Fastify bodyLimit 默认 1MB 不足，改为 50MB）
- 修复收藏页面漫画无收藏时小说收藏也不显示的 bug
- 修复小说详情页无目录的问题
- 修复手机端"继续阅读/收藏/编辑"按钮竖排不换行（添加 flex-wrap）
- 修复小说扫描路径错误（修正为 server/books）

### 变更

- 默认端口从 8080 改为 7788
- Vite 构建输出从 web/dist 改为 server/static（开发/生产统一）
- 小说目录路径改为 `D:\GongZuo\ComicReader\server\books`
- 漫画移除批注功能
- 漫画目录改为右上角按钮 + 左侧弹出（与小说一致）

### 新增

- 漫画库管理：扫描 CBZ/CBR/ZIP/RAR/图片文件夹，自动提取 ComicInfo.xml 元数据
- 图书库管理：扫描 EPUB/PDF/TXT/MOBI/AZW3，自动提取 EPUB 元数据
- 漫画阅读器：单页/双页/滚动/Webtoon 四种模式，LTR/RTL 翻页方向
- 图书阅读器：EPUB 阅读器（epubjs）、PDF 阅读器（pdfjs-dist）
- 分类和标签系统：多级分类、自由标签，漫画和图书共用
- 评分系统：5星评分 + 阅读状态（想读/在读/已读/弃读）
- 随机发现：随机推荐漫画和图书
- 阅读进度：自动保存，继续阅读列表
- 图书笔记和书签功能
- 统一搜索：同时搜索漫画和图书
- 暗色主题
- 响应式设计（手机/平板/桌面）
- Docker 部署支持
- Windows 一键启动脚本
- Android 客户端配置（Capacitor）
- Windows 桌面端配置（Tauri）
- 鸿蒙端规划（Web 壳 + ArkTS 原生）

### 修复

- 修复 ComicInfo.xml 中 Series 字段包含作者标记 `[...]` 的问题，自动清理
- 修复漫画封面生成逻辑，优先使用文件夹中的 cover.jpg/cover.png
- 修复 .env 文件中文路径编码问题（需 UTF-8 编码保存）
- 修复前端 BookCard/BookDetailPage 中 StarRating 组件接口不匹配
- 修复 epubjs 类型声明缺失问题
- 修复首页缺少图书区域的问题
- 修复搜索功能只搜索漫画不搜索图书的问题

## v0.1.1 (2026-05-20)

### 新增

- 漫画阅读器设置面板：阅读模式（单页/双页/上下滚动/Webtoon）、翻页方向（从左到右/从右到左）、缩放
- 漫画阅读器触摸滑动翻页支持
- TXT 阅读器：字体大小调整、行间距调整、目录自动生成（匹配第X章模式）、阅读进度保存
- 所有图书格式支持在线阅读：EPUB/PDF/TXT/MOBI/AZW3
- 鸿蒙端 ArkTS 原生代码：漫画库、图书库、设置页、阅读器（Web组件）
- Android 客户端 Capacitor 配置完善
- Windows 桌面端 Tauri 配置完善

### 修复

- 修复启动.bat 无法启动的问题（改用 node dist/index.js 直接启动）
- 修复漫画阅读器翻页不工作的问题（点击翻页始终可用，不受控制栏状态影响）
- 修复漫画阅读器顶部显示碍眼字符的问题（控制栏默认隐藏，3秒自动消失）
- 修复图书文件流式传输返回空内容的问题（改用 return stream 替代 reply.send）
- 修复 TXT 文件 Content-Type 缺少 charset=utf-8 的问题

## v0.1.2 (2026-05-21)

### 新增

- 封面管理功能：支持上传自定义封面图片，支持从漫画章节中选择任一页作为封面
- 漫画扫描时自动使用第一页作为封面（当没有 cover.jpg/cover.png 时）
- TXT 阅读器翻页模式：按页浏览（3000字/页），支持左右点击翻页、键盘翻页、触摸滑动翻页
- TXT 阅读器自动目录识别：正则匹配第X章/Chapter/序言/前言/后记/楔子/番外/附录等模式
- TXT 阅读器阅读进度保存：记录当前页/总页数/百分比
- 启动.bat 构建配置完善：添加 @libsql/client 到 externals，确保原生模块正确加载

### 修复

- **修复漫画无法翻页的根本原因**：`GET /api/chapters/:id/pages` 返回 `{ pages: string[] }` 但前端期望 `{ pages: number }`，导致 `totalPages` 被设为数组（NaN），翻页条件永远不满足
- 修复 TXT 阅读器加载慢、操作卡的问题：改为按页渲染（每次只渲染约3000字），原先按行渲染150K+个 `<p>` 元素导致严重卡顿
- 修复 ComicDetailPage 封面 URL 缺失路由的问题：添加 `GET /api/comics/:id/cover` 端点
- 修复 tsup 构建缺少 `@libsql/client` 外部声明的问题
