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
└── data/            # 自动生成
    ├── ownshelf.db      # SQLite 数据库
    └── covers/          # 封面缓存
```

漫画目录可通过环境变量 `COMICS_DIR` 自定义。

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

## 扫描库的使用

### 手动扫描

1. 将漫画文件放入 `comics/` 目录
2. 在 Web 界面中点击"扫描库"按钮
3. 或通过 API 触发扫描：`POST /api/comics/scan`

### 自动扫描

系统默认每 5 分钟（300000 毫秒）自动扫描一次漫画目录。可通过环境变量 `SCAN_INTERVAL` 调整间隔时间。

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

**为漫画设置分类：**

在漫画详情页中，可以将其添加到一个或多个分类中。

### 标签

标签是扁平结构。

**创建标签：**

1. 进入标签管理区域
2. 输入标签名称并创建

**为漫画添加标签：**

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

在漫画详情页中可以设置评分和阅读状态。

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

- 使用阅读设置中的滑块调整缩放比例
- 缩放范围：50% - 300%

### 页面跳转

- 使用底部进度条拖动跳转

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

## 随机发现功能

在"随机"页面中，系统会随机推荐一部漫画，点击按钮获取新的随机推荐。

## 搜索功能

### 使用方式

在页面顶部的搜索栏中输入关键词，系统会搜索漫画的标题、作者、画师等字段。

### 搜索范围

- 漫画：标题、作者、画师、简介

## Docker 部署

### 快速启动

```bash
# 构建并启动
docker compose build --no-cache
docker compose up -d
```

服务将在 http://localhost:7788 启动。

### 自定义配置

编辑 `docker-compose.yaml`：

```yaml
services:
  ownshelf:
    image: ownshelf:latest
    container_name: ownshelf
    ports:
      - "7788:7788"           # 修改端口映射
    volumes:
      - ./data:/app/data      # 数据持久化
      - /volume1/comics:/comics  # 修改漫画目录映射
    environment:
      - COMICS_DIR=/comics
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

**解决**：检查 docker-compose.yaml 中的 volumes 映射是否正确，确保宿主机目录路径存在且包含文件。

```bash
# 验证容器内目录
docker compose exec ownshelf ls /comics
```

### 移动端访问

在同一局域网内，使用手机或平板访问 `http://服务器IP:7788` 即可。界面已做响应式适配。

如果无法访问：

1. 检查防火墙是否放行了 7788 端口
2. 确认服务绑定地址为 `0.0.0.0`（而非 `127.0.0.1`）
3. 确保设备在同一网络下
