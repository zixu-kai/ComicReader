# ComicReader - 多端客户端

本目录包含各平台客户端源码，均需先启动服务端（`启动.bat`），然后按需构建各端。

## 客户端一览

| 平台 | 技术栈 | 目录 | 构建输出 |
|------|--------|------|----------|
| Web (浏览器) | React + Vite | `../web/` | 内置在服务端 |
| Windows 桌面 | Tauri 2 + Rust | `desktop/` | `.exe` 安装包 |
| Android | Capacitor | `android/` | `.apk` |
| HarmonyOS 原生 | ArkTS | `harmony-native/` | `.hap` |
| HarmonyOS Web壳 | H5 + WebView | `harmony-web/` | `.hap` |

## Web (浏览器)

无需额外构建，服务端启动后直接访问 http://localhost:8080

## Windows 桌面端 (Tauri)

### 前置依赖

- [Rust](https://rustup.rs/) + `cargo`
- [Tauri CLI](https://tauri.app/) v2

### 构建步骤

```bash
cd clients/desktop
pnpm install
pnpm tauri build   # 生成 .exe 到 src-tauri/target/release/
```

### 开发调试

```bash
cd clients/desktop
pnpm tauri dev
```

> 注意：确保服务端在 `http://localhost:8080` 运行

## Android 端 (Capacitor)

### 前置依赖

- [Android Studio](https://developer.android.com/studio)
- Java JDK 17+

### 构建步骤

```bash
cd clients/android
pnpm install
npx cap add android           # 首次需生成 Android 项目
npx cap sync
npx cap open android          # 用 Android Studio 打开，然后 Build → APK
```

### 开发调试

```bash
cd clients/android
pnpm dev                      # 启动开发模式
npx cap copy
npx cap open android          # Android Studio 中 Run
```

## HarmonyOS 原生端 (ArkTS)

### 前置依赖

- [DevEco Studio](https://developer.harmonyos.com/cn/develop/deveco-studio) 5.0+

### 构建步骤

1. 用 DevEco Studio 打开 `clients/harmony-native/` 目录
2. File → Project Structure 配置 SDK
3. Build → Build Hap(s)

### 源码文件

```
harmony-native/entry/src/main/ets/
├── pages/
│   ├── Index.ets          # 首页
│   ├── LibraryPage.ets     # 漫画库
│   ├── ReaderPage.ets      # 阅读器
│   ├── BookLibraryPage.ets # 图书库
│   ├── BookReaderPage.ets  # 图书阅读
│   └── CategoryPage.ets    # 分类
├── services/
│   └── ApiService.ets      # API 服务
├── models/
│   └── ComicModel.ets      # 数据模型
├── components/
│   ├── ComicCard.ets       # 漫画卡片
│   └── StarRating.ets      # 评分组件
└── entryability/
    └── EntryAbility.ets    # 入口
```

## HarmonyOS Web壳

### 构建步骤

```bash
cd clients/harmony-web
pnpm install
pnpm build        # 生成 H5 资源到 dist/
```

然后用 DevEco Studio 新建一个 WebView 项目，将 `dist/` 内容放入 `rawfile/` 目录。

## 通用说明

- 所有客户端通过 HTTP API 与 `http://localhost:8080` 通信
- 移动端需将 `localhost` 替换为 NAS/服务器 IP 地址
- 详见 [../USAGE.md](../USAGE.md)