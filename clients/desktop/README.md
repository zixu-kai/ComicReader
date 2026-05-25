# ComicReader 桌面端

基于 Tauri 的 Windows 桌面漫画阅读器，将 Web 前端打包为轻量级原生桌面应用。

## 前置要求

- Node.js >= 18
- Rust >= 1.70 (安装: https://rustup.rs)
- Microsoft Visual Studio C++ Build Tools
- WebView2 Runtime (Windows 10/11 已预装)

## 构建步骤

1. 安装依赖：

```bash
cd clients/desktop
npm install
```

2. 开发模式运行（需要先启动 Web 前端开发服务器）：

```bash
# 先在 web 目录启动开发服务器
cd ../../web
npm run dev

# 然后在 desktop 目录启动 Tauri 开发模式
cd ../clients/desktop
npm run tauri:dev
```

3. 构建生产版本：

```bash
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录下。

## 项目结构

```
clients/desktop/
├── package.json              # Node.js 依赖和脚本
├── src-tauri/
│   ├── Cargo.toml            # Rust 依赖配置
│   ├── tauri.conf.json       # Tauri 核心配置
│   ├── build.rs              # 构建脚本
│   ├── src/
│   │   └── main.rs           # Tauri 入口
│   └── icons/                # 应用图标
└── README.md
```

## 配置说明

- `devUrl`: 开发模式连接 `http://localhost:3000`
- `frontendDist`: 生产构建使用 `../../web/dist` 目录
- 窗口默认大小 1200x800，最小 800x600
- 已配置文件系统访问权限，允许读写应用数据目录和下载目录
