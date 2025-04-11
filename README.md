# AI Prompts Hub

AI Prompts Hub 是一个收集和展示高质量AI Prompt案例的网站。按照不同类别（文本类、作图类、自媒体素材、创作类、编程类和通用类）展示Prompt案例及其效果，帮助用户更好地使用AI工具。

## 特性

- 按类别展示各类Prompt案例
- 展示Prompt内容和对应效果（文本、图片、代码等）
- 标识每个Prompt适用的AI模型（如ChatGPT, Claude, Midjourney等）
- 提供来源链接，方便追溯和学习
- 管理员后台，支持Prompt案例的增删改查
- 响应式设计，适配各种设备
- 使用Supabase作为数据库
- 部署在Vercel平台

## 技术栈

- **前端**：Next.js 14+ + TypeScript + Tailwind CSS
- **后端**：Next.js API Routes
- **数据库**：Supabase
- **部署**：Vercel

## 本地开发

1. 克隆项目

```bash
git clone https://github.com/yourusername/aipromptshub.git
cd aipromptshub
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

创建`.env.local`文件，添加以下内容：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. 在Supabase中创建数据表

创建`prompts`表，包含以下字段：
- `id` (uuid, primary key)
- `category` (text)
- `prompt` (text)
- `effect` (text)
- `imageurl` (text, nullable)
- `sourceurl` (text)
- `iscode` (boolean, default: false)
- `createdat` (timestamp with time zone)
- `aimodel` (text, nullable) - 用于标识适用的AI模型

5. 启动开发服务器

```bash
npm run dev
```

6. 访问 [http://localhost:3000](http://localhost:3000) 查看网站

## 项目结构

```
├── app/                # 应用目录
│   ├── admin/          # 管理界面
│   ├── api/            # API 路由
│   │   └── prompts/    # Prompt 相关API
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 全局布局
│   └── page.tsx        # 首页
├── lib/                # 通用库
│   └── supabase.ts     # Supabase 客户端
├── public/             # 静态资源
├── .env.local          # 环境变量（本地开发）
├── package.json        # 依赖配置
└── README.md           # 项目说明
```

## 部署

### Vercel 部署

1. Fork 或克隆此仓库到你的 GitHub 账户
2. 在 Vercel 中导入你的仓库
3. 设置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. 部署完成后，可访问网站 (如：https://aipromptshub.art)

### 自定义域名

1. 在 Vercel 项目设置中添加自定义域名
2. 按照 Vercel 提供的指导更新 DNS 记录
3. 等待 DNS 传播完成

## 使用指南

### 普通用户

1. 访问网站首页
2. 通过分类按钮筛选感兴趣的Prompt类别
3. 浏览Prompt内容和效果
4. 点击"来源链接"获取更多信息

### 管理员

1. 访问方式：
   - 方式一：访问首页并添加参数 `/?adminToken=aiPrompts2024`，将显示管理入口
   - 方式二：直接访问 `/admin` 路径，使用密码 `aiPrompts2024Admin` 登录
2. 在管理界面中添加、编辑和删除Prompt案例
3. 可以指定Prompt所适用的AI模型（如ChatGPT、Claude、Midjourney等）
4. 使用"退出登录"按钮安全离开管理模式

## 安全说明

- 管理功能通过简单的密码保护，适合个人或小团队使用
- 管理员登录状态会保存在浏览器本地存储中
- 对于生产环境，建议考虑实现更强的身份验证机制

## 贡献

欢迎提交Issue或Pull Request来改进此项目。

## 许可

MIT
