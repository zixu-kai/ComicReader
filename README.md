# OwnShelf（私阁）—— 个人漫画阅读器

**OwnShelf（私阁）** 是一款开源的本地漫画阅读器，让你在浏览器中轻松管理和阅读你的私人漫画收藏。

---

## 📌 最近更新（v1.1.3）

- **操作进度**：扫描库显示实时进度条（正在处理 X/N + 百分比）；删除漫画/标签显示"删除中"状态
- **标签拖动排序**：标签管理页按住手柄拖动即可调整顺序
- **搜索栏合并**：顶部栏统一放置搜索框 + 筛选按钮（带筛选计数），漫画库筛选面板可由顶部按钮展开/收起
- **按子文件夹扫描**：漫画目录按序号子文件夹（1/2/3…）组织时，可选择只扫某一个文件夹，或选"全部"一次性扫描；互不影响
- **继续阅读修复**：读完中间章节不再误判为"已完结"；翻到上一章从末尾开始
- **ComicInfo.xml 双向同步**：编辑信息、删除标签都会同步写回 ComicInfo.xml；删除漫画同步删除文件夹
- 更早版本更新记录见 [CHANGELOG.md](CHANGELOG.md)

---

## ✨ 特性

- 📚 **漫画阅读** — 支持 CBZ、CBR、ZIP、RAR 和图片文件夹格式的漫画，提供单页/双页/滑动/上下滚动四种阅读模式
- 🏷️ **分类与标签** — 自由创建分类目录，为作品添加标签，支持拖动排序与多选删除
- ⭐ **评分与书签** — 给喜欢的作品打分，收藏精彩作品
- 📌 **阅读进度** — 自动记录阅读进度，首页"继续阅读"无缝续读
- 🎲 **随机推荐** — 选择困难？让随机功能帮你决定今天看什么
- 🔍 **全文搜索** — 顶部搜索框快速搜索书名、作者，配合分类/标签/状态/作者筛选
- 🧹 **元数据同步** — 编辑书名/作者/简介/标签等会同步写回 ComicInfo.xml，重新扫描不丢失
- ✂️ **章节编辑** — 在阅读器中直接删除/插入页面，修改实时写回源文件
- 🌐 **响应式设计** — 适配桌面端和移动端浏览器，随时随地阅读
- 🐳 **Docker 部署** — GitHub Releases 部署包 + GHCR 镜像两种方式，适合绿联/群晖等 NAS
- 🪶 **轻量级** — 基于 SQLite 数据库，无需额外安装数据库服务

---

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/zixu-kai/ComicReader.git
cd ComicReader

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
| `DB_PATH` | SQLite 数据库文件路径 | `./data/ownshelf.db` |
| `COVERS_DIR` | 封面缓存目录 | `./data/covers` |
| `JWT_SECRET` | JWT 签名密钥（**生产环境务必修改**） | `change-me-in-production` |
| `PUID` | 运行用户 UID（留空则以 root 运行） | 空 |
| `PGID` | 运行用户 GID（留空则以 root 运行） | 空 |

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
| [Lucide React](https://lucide.dev/) | 图标库 |

### 后端

| 技术 | 用途 |
|------|------|
| [Fastify 5](https://fastify.dev/) | HTTP 服务器框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [Drizzle ORM](https://orm.drizzle.team/) | 数据库 ORM |
| [libSQL / SQLite](https://turso.tech/libsql) | 嵌入式数据库 |
| [Sharp](https://sharp.pixelplumbing.com/) | 图片处理（封面生成） |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT 认证 |
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

### 方式一：GitHub Releases 下载部署（推荐 NAS 用户）

适用于绿联、群晖、威联通等 NAS，或任何支持 Docker Compose 的环境。

1. 打开 [Releases](https://github.com/zixu-kai/ComicReader/releases)，下载最新的 `OwnShelf-vX.Y.Z.zip`
2. 解压后，将整个 `OwnShelf-vX.Y.Z` 文件夹上传到 NAS（如绿联上传到 `/volume1/docker/ownshelf/`）
3. 修改文件夹内 `docker-compose.yaml`：
   - `/volume1/comics` → 你的漫画目录实际路径
   - `JWT_SECRET` → 改为随机字符串
   - （可选）取消注释 `AUTH_ENABLED` / `AUTH_PASSWORD` 开启访问密码
4. 在绿联 Docker 管理器中，先**停止并删除旧的 ownshelf 容器和镜像**，再用「项目」功能选择该文件夹
5. 绿联会识别 `docker-compose.yaml` 并自动构建镜像、启动容器
6. 访问 `http://NAS的IP:7788`，点击扫描按钮开始扫描

> **重要**：每次更新后必须先删除旧镜像再重新部署，否则绿联会使用缓存的旧镜像。

### 方式二：GitHub 镜像部署

项目通过 GitHub Actions 自动构建 Docker 镜像并推送到 GHCR：

```bash
docker pull ghcr.io/zixu-kai/comicreader:latest
```

### 绿联（UGREEN）NAS 部署

绿联使用可视化 Docker 管理，**必须使用 `docker-compose.yaml` 文件**（`.yaml` 后缀）：

1. 将部署文件夹完整上传到 NAS
2. 打开绿联 Docker 管理器 → 停止并删除已有的 ownshelf 容器和镜像
3. 使用「项目」或「docker-compose」功能，选择上传的文件夹
4. 绿联会识别 `docker-compose.yaml` 并自动构建镜像、启动容器
5. 在绿联 Docker 管理器中修改卷映射路径为你实际的漫画目录
6. 访问 `http://NAS的IP:7788` 打开页面，点击扫描按钮开始扫描

> **重要**：每次更新代码后，必须先删除旧镜像再重新部署，否则绿联会使用缓存的旧镜像。

### docker-compose.yaml 配置说明

> **⚠️ 重要**：漫画目录的挂载**必须可读写**（不要加 `:ro`），否则容器无法删除漫画文件夹、也无法把编辑/删标签同步写回 ComicInfo.xml。

```yaml
services:
  ownshelf:
    build: .
    container_name: ownshelf
    ports:
      - "7788:7788"
    volumes:
      - ./data:/app/data          # 数据库和封面缓存（勿改）
      - /volume1/comics:/comics   # 改为你的漫画目录路径（可读写，勿加 :ro）
    environment:
      - COMICS_DIR=/comics
      - DB_PATH=/app/data/ownshelf.db
      - COVERS_DIR=/app/data/covers
      - HOST=0.0.0.0
      - PORT=7788
      - JWT_SECRET=change-me-in-production  # 务必修改为随机字符串
      - PUID=                    # 留空以 root 运行，或填入用户 UID
      - PGID=                    # 留空以 root 运行，或填入用户 GID
      - NODE_ENV=production
      - TZ=Asia/Shanghai
    restart: unless-stopped
```

| 配置项 | 说明 |
|--------|------|
| `JWT_SECRET` | **务必修改**为随机字符串 |
| `/volume1/comics` | 改为你的漫画存放路径（绿联 NAS 通常为 `/volume1/共享文件夹名`），**必须可读写** |
| `PUID` / `PGID` | 留空以 root 运行；填入 UID:GID 可降权运行（需确保该用户有权限读写漫画目录） |

### 通过 GHCR 镜像部署（无需本地构建）

如果不想从源码构建，可直接拉取官方镜像（amd64 + arm64）：

```yaml
services:
  ownshelf:
    image: ghcr.io/zixu-kai/comicreader:latest
    pull_policy: always
    container_name: ownshelf
    ports:
      - "7788:7788"
    volumes:
      - ./data:/app/data
      - /volume1/comics:/comics   # 可读写
    environment:
      - COMICS_DIR=/comics
      - DB_PATH=/app/data/ownshelf.db
      - COVERS_DIR=/app/data/covers
      - HOST=0.0.0.0
      - PORT=7788
      - JWT_SECRET=change-me-in-production
      - TZ=Asia/Shanghai
    restart: unless-stopped
```

### 支持的文件格式

| 类型 | 支持格式 |
|------|---------|
| 漫画 | CBZ、CBR、ZIP、RAR、图片文件夹（JPG/PNG/WebP/GIF 等） |

### 更新部署

```bash
# 代码更新后重新构建并重启
docker compose down
docker compose build --no-cache
docker compose up -d
```

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
