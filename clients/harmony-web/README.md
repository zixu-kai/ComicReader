# ComicReader 鸿蒙 Web 壳应用

基于鸿蒙 WebView 的漫画阅读器客户端，通过 WebView 加载服务端 URL 实现。

## 实现方式

本方案使用鸿蒙的 `@ohos.web.webview` 组件加载 ComicReader 服务端的 Web 页面，将 Web 前端直接嵌入鸿蒙应用中运行。

### 核心架构

```
┌─────────────────────────────┐
│     HarmonyOS Application   │
│  ┌───────────────────────┐  │
│  │   WebView Container   │  │
│  │  ┌─────────────────┐  │  │
│  │  │  ComicReader    │  │  │
│  │  │  Web Frontend   │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
│      Native Bridge Layer    │
└─────────────────────────────┘
         │
         ▼
   ComicReader Server
   (HTTP/HTTPS)
```

### 关键功能

#### 1. WebView 加载服务端 URL

使用 `@ohos.web.webview` 组件加载服务端地址：

- 应用启动时从配置中读取服务器地址
- 支持 HTTP 和 HTTPS 协议
- 支持自签名 HTTPS 证书（需在 `module.json5` 中配置网络安全策略）
- 支持服务器地址动态配置和保存

#### 2. 全屏阅读

- 隐藏系统状态栏和导航栏
- WebView 占满全屏
- 支持沉浸式阅读模式
- 通过 JS Bridge 与 Web 前端通信控制全屏切换

#### 3. 手势翻页

- 左右滑动手势识别
- 将手势事件通过 JS Bridge 传递给 Web 前端
- Web 前端根据手势事件执行翻页操作
- 支持手势灵敏度配置

#### 4. 服务器地址配置

- 首次启动引导用户输入服务器地址
- 支持局域网 IP 和域名
- 地址持久化存储（使用 `@ohos.data.preferences`）
- 支持地址格式校验和连接测试

### 项目结构

```
harmony-web/
├── entry/
│   └── src/main/
│       ├── ets/
│       │   ├── entryability/
│       │   │   └── EntryAbility.ets    # 应用入口
│       │   ├── pages/
│       │   │   ├── Index.ets           # WebView 主页面
│       │   │   └── Settings.ets        # 服务器配置页面
│       │   ├── common/
│       │   │   ├── ServerConfig.ets    # 服务器配置管理
│       │   │   └── JsBridge.ets       # JS 桥接通信
│       │   └── model/
│       │       └── GestureHandler.ets  # 手势处理
│       ├── module.json5                # 模块配置
│       └── resources/                  # 资源文件
├── package.json
└── README.md
```

## 开发要求

- DevEco Studio 5.0+
- HarmonyOS SDK API 12+
- 鸿蒙真机或模拟器

## 构建步骤

1. 使用 DevEco Studio 打开 `harmony-web` 目录
2. 配置签名证书
3. 连接鸿蒙设备或启动模拟器
4. 点击运行

## 注意事项

- WebView 加载本地服务时需确保设备与服务器在同一局域网
- 自签名 HTTPS 需要在 `module.json5` 的 `networkConfig` 中配置域名安全策略
- 手势事件需要与 Web 前端约定通信协议
