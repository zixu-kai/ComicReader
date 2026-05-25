# ComicReader 鸿蒙原生 ArkTS 客户端

基于鸿蒙 ArkTS 的原生漫画阅读器客户端，逐步实现原生 UI 和功能。

## 开发环境

- **DevEco Studio**: 5.0.3.800 或更高版本
- **HarmonyOS SDK**: API 12 或更高版本
- **HarmonyOS NEXT**: 支持纯鸿蒙应用开发
- **构建工具**: Hvigor (DevEco Studio 内置)
- **语言**: ArkTS (TypeScript 扩展)

## 项目结构规划

```
harmony-native/
├── entry/
│   └── src/main/
│       ├── ets/
│       │   ├── entryability/
│       │   │   └── EntryAbility.ets       # 应用入口，生命周期管理
│       │   ├── pages/
│       │   │   ├── Index.ets              # 首页 - 书架/漫画列表
│       │   │   ├── ReaderPage.ets         # 阅读器页面
│       │   │   ├── DetailPage.ets         # 漫画详情页
│       │   │   ├── SettingsPage.ets       # 设置页面
│       │   │   └── ServerConfigPage.ets   # 服务器配置页
│       │   ├── components/
│       │   │   ├── ComicGrid.ets          # 漫画网格组件
│       │   │   ├── ComicCard.ets          # 漫画卡片组件
│       │   │   ├── PageIndicator.ets      # 页码指示器
│       │   │   ├── ReaderToolbar.ets      # 阅读器工具栏
│       │   │   └── SearchBar.ets          # 搜索栏组件
│       │   ├── model/
│       │   │   ├── Comic.ets              # 漫画数据模型
│       │   │   ├── Chapter.ets            # 章节数据模型
│       │   │   └── ServerConfig.ets       # 服务器配置模型
│       │   ├── service/
│       │   │   ├── ApiService.ets         # API 请求服务
│       │   │   ├── ImageCacheService.ets  # 图片缓存服务
│       │   │   └── PreferenceService.ets  # 偏好存储服务
│       │   ├── utils/
│       │   │   ├── HttpUtil.ets           # HTTP 请求工具
│       │   │   ├── ImageUtil.ets          # 图片处理工具
│       │   │   └── GestureUtil.ets        # 手势识别工具
│       │   └── common/
│       │       ├── Constants.ets          # 常量定义
│       │       └── Theme.ets             # 主题配置
│       ├── module.json5                   # 模块配置
│       └── resources/
│           ├── base/
│           │   ├── element/
│           │   │   ├── color.json         # 颜色资源
│           │   │   └── string.json        # 字符串资源
│           │   ├── media/                 # 图片资源
│           │   └── profile/
│           │       └── main_pages.json    # 页面路由配置
│           └── rawfile/                   # 原始资源文件
├── build-profile.json5                    # 构建配置
├── hvigorfile.ts                          # Hvigor 构建脚本
├── oh-package.json5                       # 依赖管理
└── README.md
```

## 阶段一：WebView 壳应用

初期使用 `@ohos.web.webview` 组件加载服务端 Web 页面，快速实现基本功能。

### 核心实现

- 使用 Web 组件加载 ComicReader 服务器 URL
- 通过 `javaScriptProxy` 注册原生方法供前端调用
- 通过 `runJavaScript` 从原生端调用前端方法
- 实现服务器地址配置和持久化存储

### 原生增强

- 状态栏和导航栏控制（沉浸式阅读）
- 手势识别和传递（左右滑动翻页）
- 文件系统访问（下载漫画到本地）
- 通知和提醒

## 阶段二：混合模式

逐步将关键页面替换为原生 ArkTS 实现，保留部分页面使用 WebView。

### 优先原生化的页面

1. **阅读器页面** - 性能最关键，优先原生化
   - 原生图片渲染和缓存
   - 原生手势处理（滑动翻页、缩放）
   - 原生动画效果
2. **首页/书架** - 使用频率最高
   - 原生列表和网格布局
   - 原生下拉刷新
3. **设置页面** - 交互简单，适合练手

### 数据层

- 封装统一的 API 服务层，同时供原生页面和 WebView 使用
- 实现本地数据缓存（`@ohos.data.relationalStore`）
- 实现图片缓存（`@ohos.file.cache`）

## 阶段三：完全原生化

所有页面使用 ArkTS 原生实现，移除 WebView 依赖。

### 目标功能

- 完整的原生 UI 组件库
- 离线阅读支持
- 本地漫画库管理
- 高性能图片加载和渲染
- 原生动画和转场效果
- 系统级集成（分享、通知、小组件）

### 性能优化

- 图片预加载和智能缓存
- 列表虚拟滚动
- 内存管理和图片回收
- 后台任务处理

## 原生化路线图

| 阶段 | 时间 | 内容 | WebView 占比 |
|------|------|------|-------------|
| 阶段一 | 第 1-2 周 | WebView 壳 + 原生桥接 | 100% |
| 阶段二 | 第 3-6 周 | 阅读器原生化 + API 层 | 60% |
| 阶段三 | 第 7-10 周 | 所有页面原生化 | 0% |
| 优化 | 第 11-12 周 | 性能优化 + 离线支持 | 0% |

## API 对接

ComicReader 服务端 API 基础路径示例：

```
GET  /api/comics          # 获取漫画列表
GET  /api/comics/:id      # 获取漫画详情
GET  /api/comics/:id/pages # 获取漫画页面
GET  /api/search?q=       # 搜索漫画
GET  /api/categories      # 获取分类
```

原生客户端通过 `@ohos.net.http` 模块请求 API，图片通过 `@ohos.net.http` 下载并缓存到本地。
