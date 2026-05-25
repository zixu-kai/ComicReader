# OwnShelf（私阁）—— 个人漫画和小说阅读器

**OwnShelf（私阁）** 是一款开源的本地漫画与电子书阅读器，让你在浏览器中轻松管理和阅读你的私人收藏。

---

## ✨ 特性

- 📚 **漫画阅读** — 支持 CBZ、ZIP 和图片文件夹格式的漫画，提供流畅的翻页阅读体验
- 📖 **电子书阅读** — 支持 EPUB、PDF、TXT 三种格式，内置专业阅读器
- 🏷️ **分类与标签** — 自由创建分类目录，为作品添加标签，轻松管理成千上万本藏书
- ⭐ **评分与书签** — 给喜欢的作品打分，添加书签收藏精彩片段
- 📌 **阅读进度** — 自动记录阅读进度，下次打开无缝续读
- 🎲 **随机推荐** — 选择困难？让随机功能帮你决定今天看什么
- 🔍 **全文搜索** — 快速搜索书名、作者、标签，找到想看的内容
- 🌐 **响应式设计** — 适配桌面端和移动端浏览器，随时随地阅读
- 🐳 **Docker 部署** — 一条命令即可在 NAS 或服务器上运行
- 🪶 **轻量级** — 基于 SQLite 数据库，无需额外安装数据库服务

---

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-username/own-shelf.git
cd own-shelf

# 安装依赖
pnpm install

# 配置环境变量（复制示例文件后按需修改）
cp .env.example .env

# 同时启动前端和后端开发服务器
pnpm dev
```

启动后：
- 前端开发服务器：`http://localhost:5173`
- 后端 API 服务器：`http://localhost:7788`

也可以分别启动：

```bash
# 仅启动后端
pnpm dev:server

# 仅启动前端
pnpm dev:web
```

### 生产构建

```bash
# 构建所有子包
pnpm build

# 启动生产服务
pnpm start
```

---

## 📁 项目结构

```
OwnShelf/
├── server/                  # 后端服务（Fastify + TypeScript）
│   ├── src/
│   │   ├── config/          # 配置管理
│   │   ├── db/              # 数据库 Schema 和连接
│   │   ├── middleware/      # 中间件（JWT 认证等）
│   │   ├── routes/          # API 路由
│   │   ├── services/        # 业务逻辑层
│   │   ├── types/           # 类型定义
│   │   └── utils/           # 工具函数
│   └── drizzle.config.ts    # Drizzle ORM 配置
├── web/                     # 前端应用（React + TypeScript + Vite）
│   ├── src/
│   │   ├── components/      # 可复用 UI 组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API 请求封装
│   │   ├── stores/          # Zustand 状态管理
│   │   └── styles/          # 全局样式（TailwindCSS）
│   └── vite.config.ts       # Vite 配置
├── shared/                  # 前后端共享类型定义
├── docker/                  # Docker 部署配置
├── release/                 # 发布打包文件
├── clients/                 # 客户端应用（桌面端、移动端、鸿蒙）
├── package.json             # 根 monorepo 配置
├── pnpm-workspace.yaml      # pnpm 工作空间配置
└── .env.example             # 环境变量示例
```

---

## ⚙️ 配置文件说明（`.env`）

后端服务通过 `.env` 文件进行配置，支持以下环境变量：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 后端服务监听端口 | `7788` |
| `HOST` | 绑定地址 | `0.0.0.0` |
| `COMICS_DIR` | 漫画文件存放目录 | `./comics` |
| `BOOKS_DIR` | 电子书文件存放目录 | `./books` |
| `DB_PATH` | SQLite 数据库文件路径 | `./data/ownshelf.db` |
| `JWT_SECRET` | JWT 签名密钥（**生产环境务必修改**） | `change-me-in-production` |
| `SCAN_INTERVAL` | 自动扫描间隔（毫秒） | `300000`（5 分钟） |

> **⚠️ 安全提醒**：`JWT_SECRET` 在生产环境中必须修改为随机字符串，否则存在安全隐患。

---

## 🛠️ 技术栈

### 前端

| 技术 | 用途 |
|------|------|
| [React 19](https://react.dev/) | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [TailwindCSS 4](https://tailwindcss.com/) | CSS 框架 |
| [Zustand](https://zustand-demo.pmnd.rs/) | 状态管理 |
| [React Router 7](https://reactrouter.com/) | 路由 |
| [Radix UI](https://www.radix-ui.com/) | 无样式 UI 组件 |
| [Lucide React](https://lucide.dev/) | 图标库 |
| [EPUB.js](https://github.com/futurepress/epub.js/) | EPUB 阅读器 |
| [PDF.js](https://mozilla.github.io/pdf.js/) | PDF 阅读器 |

### 后端

| 技术 | 用途 |
|------|------|
| [Fastify 5](https://fastify.dev/) | HTTP 服务器框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [Drizzle ORM](https://orm.drizzle.team/) | 数据库 ORM |
| [libSQL / SQLite](https://turso.tech/libsql) | 嵌入式数据库 |
| [Sharp](https://sharp.pixelplumbing.com/) | 图片处理（封面生成） |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT 认证 |
| [archiver](https://github.com/archiverjs/node-archiver) | 文件打包（下载） |
| [tsup](https://tsup.egoist.dev/) | TypeScript 构建打包 |

### 工程化

| 技术 | 用途 |
|------|------|
| [pnpm](https://pnpm.io/) | 包管理器 + Monorepo |
| [Docker](https://www.docker.com/) | 容器化部署 |

---

## 💻 开发命令

```bash
# ─────── 根目录命令 ───────
pnpm dev              # 同时启动前端和后端开发服务
pnpm dev:server       # 仅启动后端开发服务
pnpm dev:web          # 仅启动前端开发服务
pnpm build            # 构建所有子包（生产模式）
pnpm build:server     # 仅构建后端
pnpm build:web        # 构建前端（普通模式）
pnpm build:web:github # 构建前端（GitHub Pages 模式）

# ─────── 后端命令 ───────
cd server
pnpm dev              # 开发模式（热重载）
pnpm build            # 构建生产版本
pnpm start            # 运行生产版本
pnpm db:generate      # 生成数据库迁移文件
pnpm db:migrate       # 执行数据库迁移
pnpm db:push          # 直接推送 Schema 到数据库
pnpm db:studio        # 启动 Drizzle Studio 数据库管理界面

# ─────── 前端命令 ───────
cd web
pnpm dev              # 开发模式（热重载）
pnpm build            # 构建生产版本
pnpm preview          # 预览生产构建结果
```

---

## 🐳 Docker 部署

项目提供了两种 Docker 部署方式，适用于不同 NAS 系统。

### 通用部署（群晖 / 威联通 / 命令行 Docker）

```bash
# 进入 release 目录下的 nas 文件夹
cd release/OwnShelf-v1.0.0/nas

# 修改 docker-compose.yml 中的挂载路径和 JWT_SECRET

# 构建并启动（--no-cache 确保从头构建）
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 绿联（UGREEN）NAS 部署

绿联使用可视化 Docker 管理，**必须使用 `docker-compose.yaml` 文件**（`.yaml` 后缀）：

1. 将 `release/OwnShelf-v1.0.0/nas-nodonate` 文件夹完整复制到 NAS
2. 打开绿联 Docker → 停止并删除已有的 ownshelf 容器和镜像
3. 使用「项目」或「docker-compose」功能，选择复制过去的文件夹
4. 绿联会识别 `docker-compose.yaml` 并自动构建镜像、启动容器

> **重要**：每次更新代码后，必须先删除旧镜像再重新部署，否则绿联会使用缓存的旧镜像。

### 配置说明

部署前请修改 `docker-compose.yml`（或 `.yaml`）中的以下配置：

| 配置项 | 说明 |
|--------|------|
| `JWT_SECRET` | 务必修改为随机字符串 |
| `/volume1/comics` | 改为你的漫画存放路径 |
| `/volume1/books` | 改为你的图书存放路径 |

### 更新部署

```bash
# 代码更新后重新构建并重启
docker compose down
docker compose build --no-cache
docker compose up -d
```

详细部署说明请参考[发布版文档](release/OwnShelf-v1.0.0/README.md)。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m '添加了某某功能'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

Copyright (c) 2026 OwnShelf