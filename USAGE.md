# ComicReader 使用文档

## 安装和首次启动

### 前置条件

- Node.js 20 或更高版本
- pnpm 包管理器（项目会自动安装）

### Windows 用户

1. 确保已安装 Node.js 20+
2. 双击运行项目根目录下的 `启动.bat`，或运行 `scripts\start-windows.bat`
3. 脚本会自动完成以下步骤：
   - 检查并安装 pnpm
   - 安装项目依赖
   - 初始化数据库
   - 构建前端
   - 启动服务
4. 启动成功后，浏览器访问 http://localhost:7788

### 手动安装

```bash
# 1. 安装依赖
pnpm install

# 2. 初始化数据库
pnpm --filter server db:push

# 3. 构建前端
pnpm --filter web build

# 4. 将前端产物复制到服务端静态目录
cp -r web/dist server/static

# 5. 启动服务
pnpm --filter server start
```

### 开发模式

```bash
# 同时启动前端开发服务器和后端 API 服务
pnpm dev
```

- 前端热更新：http://localhost:3000
- 后端 API：http://localhost:7788

## 目录结构说明

项目启动后，服务端目录下需要准备以下文件夹：

```
server/
├── comics/          # 漫画文件目录
│   ├── 漫画名称A/   # 每个漫画一个文件夹
│   │   ├── ComicInfo.xml   # 漫画元数据（可选）
│   │   ├── cover.jpg       # 封面图片（可选）
│   │   ├── 第1话.cbz
│   │   └── 第2话.cbz
│   └── 漫画名称B/
│       └── ...
├── books/           # 图书文件目录
│   ├── 书名A.epub
│   ├── 书名B.pdf
│   └── 书名C.txt
└── data/            # 自动生成
    ├── comicreader.db      # SQLite 数据库
    └── covers/             # 封面缓存
```

漫画和图书目录可通过环境变量 `COMICS_DIR` 和 `BOOKS_DIR` 自定义。

## 漫画格式支持

### 支持的格式

| 格式 | 扩展名 | 说明 |
|------|--------|------|
| CBZ | .cbz | 最常用的漫画归档格式，本质是 ZIP 压缩包 |
| CBR | .cbr | 基于 RAR 的漫画归档格式 |
| ZIP | .zip | 标准 ZIP 压缩包 |
| RAR | .rar | 标准 RAR 压缩包 |
| 图片文件夹 | （文件夹） | 包含图片的文件夹，按文件名排序 |

### 漫画目录组织方式

每个漫画对应 `comics/` 目录下的一个子文件夹，文件夹内包含该漫画的所有章节文件。

```
comics/
└── [作者]漫画标题/
    ├── ComicInfo.xml
    ├── cover.jpg
    ├── 第1话.cbz
    ├── 第2话.cbz
    └── 第3话.cbz
```

也支持单文件漫画（整个漫画打包在一个 CBZ/CBR 文件中）：

```
comics/
└── [作者]漫画标题.cbz
```

### ComicInfo.xml 说明

ComicInfo.xml 是 ComicRack 定义的漫画元数据标准，广泛被各类漫画管理工具支持。放置在漫画文件夹根目录下，扫描时会自动读取。

支持的元数据字段：

```xml
<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
  <Title>漫画标题</Title>
  <Series>系列名称</Series>
  <Writer>作者</Writer>
  <Penciller>画师</Penciller>
  <Summary>简介</Summary>
  <Genre>类型</Genre>
  <Tags>标签1, 标签2</Tags>
  <LanguageISO>zh</LanguageISO>
  <Year>2024</Year>
  <Status>ongoing|completed|unknown</Status>
  <PageCount>24</PageCount>
</ComicInfo>
```

如果漫画文件夹中没有 ComicInfo.xml，系统会使用文件夹名称作为漫画标题。

### 图片文件夹格式

如果不使用 CBZ/CBR 归档，也可以直接使用图片文件夹：

```
comics/
└── 漫画标题/
    ├── 001.jpg
    ├── 002.jpg
    ├── 003.png
    └── ...
```

图片按文件名自然排序，支持 JPG/PNG/WebP/BMP/GIF 等常见格式。

## 图书格式支持

| 格式 | 扩展名 | 说明 |
|------|--------|------|
| EPUB | .epub | 标准电子书格式，支持流式排版，自动提取元数据 |
| PDF | .pdf | 便携文档格式 |
| TXT | .txt | 纯文本格式 |
| MOBI | .azw, .mobi | Kindle 格式 |
| AZW3 | .azw3 | Kindle 新格式 |

### EPUB 元数据提取

扫描 EPUB 文件时，系统会自动从 OPF 元数据中提取以下信息：

- 标题（dc:title）
- 作者（dc:creator）
- 简介（dc:description）
- 出版社（dc:publisher）
- 出版日期（dc:date）
- ISBN（dc:identifier）
- 语言（dc:language）

### 图书目录组织

图书文件直接放置在 `books/` 目录下即可，不需要按文件夹组织：

```
books/
├── 三体.epub
├── 百年孤独.pdf
├── 1984.txt
└── 银河帝国.mobi
```

## 扫描库的使用

### 手动扫描

1. 将漫画文件放入 `comics/` 目录，图书文件放入 `books/` 目录
2. 在 Web 界面中点击"扫描库"按钮
3. 或通过 API 触发扫描：
   - 漫画：`POST /api/comics/scan`
   - 图书：`POST /api/books/scan`

### 自动扫描

系统默认每 5 分钟（300000 毫秒）自动扫描一次漫画和图书目录。可通过环境变量 `SCAN_INTERVAL` 调整间隔时间。

### 扫描行为

- 扫描时会检测新增文件并添加到数据库
- 已存在的文件不会重复添加（基于文件路径去重）
- 自动提取元数据和生成封面
- 删除文件后需要手动从数据库中移除对应记录

## 分类和标签管理

### 分类

分类采用树形结构，支持多级嵌套。

**创建分类：**

1. 进入"分类"页面
2. 点击"新建分类"按钮
3. 填写分类名称、描述，可选设置父分类
4. 保存

**为漫画/图书设置分类：**

在漫画或图书详情页中，可以将其添加到一个或多个分类中。

### 标签

标签是扁平结构，漫画和图书共用同一套标签。

**创建标签：**

1. 进入标签管理区域
2. 输入标签名称并创建

**为漫画/图书添加标签：**

在详情页中点击标签区域，从已有标签中选择或创建新标签。

## 评分和阅读状态

### 评分系统

支持 1-5 星评分：

- 1 星：很差
- 2 星：较差
- 3 星：一般
- 4 星：推荐
- 5 星：强烈推荐

### 阅读状态

| 状态 | 说明 |
|------|------|
| 想读 | 标记为想要阅读 |
| 在读 | 正在阅读中 |
| 已读 | 已经读完 |
| 弃读 | 放弃阅读 |

在漫画或图书详情页中可以设置评分和阅读状态，还可以添加个人笔记。

## 漫画阅读器使用

### 阅读模式

| 模式 | 说明 |
|------|------|
| 单页 | 一次显示一页，适合普通漫画 |
| 双页 | 一次显示两页，模拟实体书翻页效果 |
| 滑动 | 手指滑动翻页，适合触屏设备 |
| 上下滚动 | 垂直滚动浏览所有页面 |

### 翻页方向

| 方向 | 说明 |
|------|------|
| LTR（从左到右） | 点击右侧翻到下一页，适合中文/英文漫画 |
| RTL（从右到左） | 点击左侧翻到下一页，适合日文漫画 |

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| 右箭头 / D | 下一页（LTR 模式） |
| 左箭头 / A | 上一页（LTR 模式） |
| 空格 | 下一页 |
| Home | 跳到第一页 |
| End | 跳到最后一页 |
| F | 切换全屏 |
| M | 显示/隐藏控制栏 |
| Escape | 退出阅读器 |

### 鼠标操作

在单页/双页模式下：
- 点击页面左侧 1/3 区域：翻到上一页（LTR 模式）
- 点击页面右侧 1/3 区域：翻到下一页（LTR 模式）
- 点击页面中间 1/3 区域：显示/隐藏控制栏

### 缩放

- 使用控制栏中的 +/- 按钮调整缩放比例
- 缩放范围：50% - 300%

### 页面跳转

- 使用底部进度条拖动跳转
- 在页码输入框中输入目标页码并点击"跳转"

### 章节编辑

在阅读器中点击"编辑"按钮进入编辑模式，支持：

- **删除当前页**：移除当前显示的页面
- **插入新页**：在当前页位置插入本地图片
- **保存修改**：确认修改后直接写入源文件（CBZ/图片文件夹）
- **放弃修改**：退出编辑模式，不保存任何更改

> 修改保存后会立即写回源文件，其他设备刷新即可看到更新。

### 封面管理

在漫画详情页中，将鼠标悬停在封面上会显示"更换封面"按钮，点击后可：

1. **上传封面图片**：点击上传区域选择本地图片文件，支持 JPG/PNG/WebP 等常见格式
2. **从章节中选择封面**：浏览第一个章节的页面缩略图（最多显示48页），点击任一页即可设为封面

> 注意：扫描漫画时，如果没有 cover.jpg/cover.png，系统会自动使用第一页作为封面。

### 阅读进度

- 阅读进度每 10 秒自动保存一次
- 翻页时也会保存进度
- 在首页的"继续阅读"列表中可以快速回到上次阅读位置

## 图书阅读器使用

### EPUB 阅读器

基于 epubjs 实现，支持：

- 流式排版，自适应屏幕
- 字体大小调整
- 主题切换
- 目录导航
- 阅读进度自动保存（基于 CFI 定位）
- 添加笔记和书签

### PDF 阅读器

基于 pdfjs-dist 实现，支持：

- 页面渲染和翻页
- 缩放控制
- 页面跳转

### TXT 阅读器

TXT 阅读器采用按页浏览模式，每页约 3000 字，避免大文件渲染卡顿。

#### 翻页操作

| 操作 | 功能 |
|------|------|
| 点击页面左侧 1/3 | 上一页 |
| 点击页面右侧 1/3 | 下一页 |
| 左右箭头键盘按钮 | 翻页导航 |
| 键盘左右箭头 / 空格 | 上/下一页 |
| PageUp / PageDown | 翻页 |
| 触摸滑动 | 移动端翻页 |

#### 自动目录识别

阅读器会自动识别以下章节模式：

- `第X章`、`第X节`、`第X回`、`第X卷`（支持中文数字）
- `Chapter X`、`CHAPTER X`
- 序章、序言、前言、后记、尾声、楔子、番外、附录

识别出的目录会显示在左侧面板中，点击即可跳转到对应章节。

#### 阅读设置

- 字体大小：14px - 28px
- 行间距：1.2 - 3.0

#### 阅读进度

- 翻页时自动保存当前页/总页数/百分比
- 下次打开时从上次阅读位置继续

## 随机发现功能

在"随机"页面中：

1. 系统会随机推荐漫画和图书
2. 可以设置推荐数量
3. 漫画推荐支持按分类筛选
4. 点击刷新按钮获取新的随机推荐

## 搜索功能

### 使用方式

在页面顶部的搜索栏中输入关键词，系统会同时搜索漫画和图书的标题、作者等字段。

### 搜索范围

- 漫画：标题、作者、画师
- 图书：标题、作者

## Docker 部署

### 项目结构

部署文件位于 `release/OwnShelf-v1.0.0/` 下：

| 目录 | 说明 |
|------|------|
| `nas/` | 通用 NAS 部署（群晖 / 威联通） |
| `nas-nodonate/` | 不带捐赠页面的 NAS 部署 |
| `win-nodonate/` | Windows 免安装版 |

每个部署目录包含：

| 文件 | 用途 |
|------|------|
| `Dockerfile` | Docker 镜像构建文件 |
| `docker-compose.yml` | 通用 docker-compose 配置 |
| `docker-compose.yaml` | 绿联 NAS 使用的配置 |
| `package-lock.json` | 依赖锁定文件（确保一致性） |
| `deploy.bat` / `deploy.sh` | 一键构建部署脚本 |
| `dist/` | 后端构建产物 |
| `static/` | 前端构建产物 |

### 构建说明

Dockerfile 基于 Alpine Linux，构建流程：

1. 安装编译依赖（vips、python3、make、g++）
2. 复制构建产物和 `package-lock.json`
3. 使用 `npm ci --omit=dev` 精确安装生产依赖（通过 lockfile 确保一致性）
4. 重新编译 native 模块（sharp、libsql）
5. 清理编译依赖减小镜像体积

### 快速启动

```bash
cd release/OwnShelf-v1.0.0/nas

# 一键部署
bash deploy.sh          # Linux / macOS
deploy.bat              # Windows

# 或手动执行
docker compose down
docker compose build --no-cache
docker compose up -d
```

服务将在 http://localhost:7788 启动。

### 自定义配置

编辑 `docker-compose.yml`：

```yaml
services:
  ownshelf:
    build: .
    image: ownshelf:latest
    container_name: ownshelf
    ports:
      - "7788:7788"           # 修改端口映射
    volumes:
      - ./data:/app/data      # 数据持久化
      - /volume1/comics:/comics  # 修改漫画目录映射
      - /volume1/books:/books    # 修改图书目录映射
    environment:
      - COMICS_DIR=/comics
      - BOOKS_DIR=/books
      - DB_PATH=/app/data/ownshelf.db
      - COVERS_DIR=/app/data/covers
      - HOST=0.0.0.0
      - PORT=7788
      - JWT_SECRET=change-me-in-production  # 修改 JWT 密钥
    restart: unless-stopped
```

### 数据持久化

Docker 部署时需要挂载以下目录：

- `/app/data`：数据库和封面缓存
- `/comics`：漫画文件
- `/books`：图书文件

### 常用命令

```bash
# 构建并启动
docker compose build --no-cache
docker compose up -d

# 查看日志
docker compose logs -f ownshelf

# 停止服务
docker compose down

# 重新构建（代码更新后）
docker compose down
docker compose build --no-cache
docker compose up -d
```

## NAS 部署

### 群晖（Synology）

1. 将 `release/OwnShelf-v1.0.0/nas` 文件夹复制到 NAS
2. 在 Container Manager 中创建项目，选择该文件夹
3. 修改 `docker-compose.yml` 中的路径和 JWT_SECRET
4. 构建并启动

```yaml
services:
  ownshelf:
    build: .
    image: ownshelf:latest
    container_name: ownshelf
    ports:
      - "7788:7788"
    volumes:
      - ./data:/app/data
      - /volume1/comics:/comics
      - /volume1/books:/books
    environment:
      - COMICS_DIR=/comics
      - BOOKS_DIR=/books
      - DB_PATH=/app/data/ownshelf.db
      - COVERS_DIR=/app/data/covers
      - HOST=0.0.0.0
      - PORT=7788
      - JWT_SECRET=your-secure-secret
    restart: unless-stopped
```

启动后通过 `http://NAS-IP:7788` 访问。

### 威联通（QNAP）

1. 在 Container Station 中创建应用
2. 使用与群晖相同的 docker-compose 配置
3. 将共享文件夹映射到容器内的 `/comics` 和 `/books` 目录

### 绿联（UGREEN）

绿联使用可视化 Docker 管理，**注意文件后缀必须为 `.yaml`**：

1. 将 `release/OwnShelf-v1.0.0/nas-nodonate` 文件夹完整复制到 NAS
2. 打开绿联 Docker 管理界面
3. **停止并删除**已有的 ownshelf 容器和 `ownshelf:latest` 镜像
4. 使用「项目」或「docker-compose」部署功能，选择复制过去的文件夹
5. 绿联会识别 `docker-compose.yaml` 并自动构建镜像、启动容器

> **重要**：
> - 每次更新代码后，必须先**删除旧镜像**再重新部署，否则绿联会使用缓存的旧镜像
> - 绿联只识别 `docker-compose.yaml`，不识别 `docker-compose.yml`

### 注意事项

- NAS 部署时建议将 `JWT_SECRET` 修改为安全的随机字符串
- 确保挂载的漫画/图书目录有读取权限
- 大量文件首次扫描可能需要较长时间
- 更新部署时务必使用 `--no-cache` 或删除旧镜像，否则依赖可能安装不完整

## Windows 服务部署

### 方式一：一键启动脚本

使用项目提供的脚本：

```bash
# 生产模式启动
scripts\启动生产模式.bat

# 开发模式启动
scripts\启动开发环境.bat

# 停止所有服务
scripts\停止所有服务.bat
```

### 方式二：创建桌面快捷方式

运行 `scripts\创建桌面快捷方式.ps1`，会在桌面创建快捷方式，双击即可启动。

### 方式三：注册为 Windows 服务

使用 [nssm](https://nssm.cc/) 将 Node.js 服务注册为 Windows 服务：

```bash
# 安装 nssm
choco install nssm

# 注册服务
nssm install ComicReader "C:\Program Files\nodejs\node.exe" "D:\GongZuo\ComicReader\server\dist\index.js"
nssm set ComicReader AppDirectory "D:\GongZuo\ComicReader\server"
nssm set ComicReader DisplayName "ComicReader Service"
nssm set ComicReader Start SERVICE_AUTO_START

# 启动服务
nssm start ComicReader
```

## 常见问题排查

### 端口被占用

**症状**：启动时报错 `EADDRINUSE`

**解决**：

```bash
# 查看占用 7788 端口的进程
# Windows
netstat -ano | findstr :7788

# 修改端口
# 编辑 server/.env 文件，将 PORT 改为其他可用端口
PORT=9090
```

### 漫画扫描不到

**可能原因**：

1. 漫画文件路径不正确 -- 检查 `COMICS_DIR` 环境变量是否指向正确的目录
2. 文件格式不支持 -- 确认文件扩展名为 .cbz/.cbr/.zip/.rar 或为图片文件夹
3. 文件权限不足 -- 确保服务进程有读取漫画目录的权限

### 封面不显示

**可能原因**：

1. 首次扫描时封面生成需要时间
2. `data/covers` 目录没有写入权限
3. Sharp 图像处理库安装异常 -- 尝试重新安装依赖

```bash
pnpm install
```

### 数据库错误

**症状**：启动时报数据库相关错误

**解决**：

```bash
# 重新初始化数据库
pnpm --filter server db:push
```

注意：此操作会重置数据库，已有数据会丢失。建议先通过 `/api/backup/export` 导出备份。

### Docker 中漫画目录为空

**解决**：检查 docker-compose.yml 中的 volumes 映射是否正确，确保宿主机目录路径存在且包含文件。

```bash
# 验证容器内目录
docker compose exec comicreader ls /comics
```

### 图书阅读器加载失败

**可能原因**：

1. EPUB 文件损坏 -- 尝试用其他阅读器打开确认
2. PDF 文件过大 -- 大型 PDF 可能需要较长加载时间
3. 文件路径包含特殊字符 -- 尝试重命名文件

### 移动端访问

在同一局域网内，使用手机或平板访问 `http://服务器IP:7788` 即可。界面已做响应式适配。

如果无法访问：

1. 检查防火墙是否放行了 7788 端口
2. 确认服务绑定地址为 `0.0.0.0`（而非 `127.0.0.1`）
3. 确保设备在同一网络下
