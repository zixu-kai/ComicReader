# ComicReader Android 客户端

基于 Capacitor 的 Android 漫画阅读器客户端，将 Web 前端打包为原生 Android 应用。

## 前置要求

- Node.js >= 18
- Android Studio
- Android SDK (API Level 33+)
- JDK 17

## 构建步骤

1. 安装依赖：

```bash
cd clients/android
npm install
```

2. 构建 Web 前端并同步到 Android 项目：

```bash
npm run build
```

3. 首次运行时添加 Android 平台：

```bash
npx cap add android
```

4. 用 Android Studio 打开项目：

```bash
npm run open
```

5. 在 Android Studio 中选择模拟器或连接真机，点击运行。

## 开发流程

- 修改 Web 前端代码后，执行 `npm run build` 重新构建并同步
- 在 Android Studio 中重新运行应用即可看到更新
- 如需调试 Web 内容，在 Chrome 中打开 `chrome://inspect` 连接设备调试

## 连接本地服务器

应用默认通过 HTTPS 连接服务器。如需连接自签名证书的服务器，在 `capacitor.config.ts` 中已配置允许混合内容。

在 Android 的 `network_security_config.xml` 中需要添加自签名证书的域名信任配置。
