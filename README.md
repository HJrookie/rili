# 📅 雅致日历 · Sophisticated Lunar Calendar

<div align="center">

一款基于 **Vue 3** + **Vite** + **Ant Design Vue** + **lunar-javascript** 构建的现代国风农历与时辰日历 Web 应用。

融合现代毛玻璃（Glassmorphism）极简质感与东方传统历法美学，内置 8 款精美预制国风主题，支持农历公历对照、二十四节气、干支生肖、每日宜忌与古法十二时辰养生指引。

[在线演示](#-部署指南) · [功能特性](#-核心特性) · [主题一览](#-精选主题) · [快速开始](#-快速上手)

</div>

---

## ✨ 核心特性

- 🎨 **8 款国风艺术主题**：预制「林野深呼吸」、「紫禁朱华」、「远山黛蓝」、「江南烟雨」、「玄墨星河（暗黑）」等 8 款艺术配色，支持气泡预览一键切换。
- 🔮 **动态 CSS 变量与 AntD 算法**：主题切换平滑无刷新过渡，自动同步 Ant Design Vue 算法（包含暗黑模式与亮色模式深度适配）。
- 💾 **主题本地持久化**：使用 `localStorage` 自动记忆用户偏好，并支持浏览器多标签页（`storage` 事件）跨窗口实时同步。
- 📜 **全功能中华历法**：
  - 基于高精度 `lunar-javascript` 引擎。
  - 公历与农历（阴历）日期精密对照。
  - 天干地支（年柱、月柱、日柱）与十二生肖属相呈现。
  - 二十四节气（立春、冬至等）与传统法定节日智能识别与高亮标牌。
  - 传统黄历「每日宜忌」吉凶提炼展示。
- ⏳ **实时时钟与十二时辰**：
  - 秒级精准实时时钟动态跳动。
  - 根据当前时刻推算古法「十二时辰」（子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥）。
  - 配套对应的时辰时段与传统中医脏腑经络养生建议（如「午时心经气行宜小憩」）。
- 💎 **高级毛玻璃拟物美学**：
  - 40px 大圆角悬浮毛玻璃容器、多层柔和拟态投影与高斯模糊背景。
  - 月份切换全场淡入淡出动效，大号日期数字缩放动效。
- 🧭 **便捷导航与年月跳转**：
  - 支持 1900 ~ 2100 年跨度年月快速下拉跳转。
  - 快速前进/后退翻月与一键「今天」归位。
  - 日历网格点击非本月日期自动跨月联动。

---

## 🎨 精选主题

| 图标 | 主题名称 | 英文名称 | 风格分类 | 设计意境 / 特点 |
| :---: | :--- | :--- | :--- | :--- |
| 🌲 | **林野深呼吸** *(默认)* | Forest Breeze | 清新自然 | 翠竹生机 · 苍翠自然，护眼青绿色调 |
| 🏮 | **紫禁朱华** | Forbidden Crimson | 东方典雅 | 宫墙朱红 · 盛世华章，沉稳端庄中国红 |
| 🏔️ | **远山黛蓝** | Misty Mountain | 水墨文人 | 烟波浩渺 · 黛瓦墨蓝，文人墨客雅致蓝 |
| 🌅 | **落日暖阳** | Sunset Amber | 温暖明媚 | 晚霞流金 · 岁暮向暖，温馨活力琥珀金 |
| 🍇 | **暮雪幽紫** | Twilight Lavender | 浪漫静谧 | 浮光掠影 · 暮色幽梦，宁静神秘幽香紫 |
| 🍃 | **江南烟雨** | Jiangnan Mist | 雅致天青 | 雨过天青 · 云破处处，温润古典天青色 |
| 🌌 | **玄墨星河** | Cosmic Obsidian | 极客暗黑 | 曜石苍穹 · 银河流转，护眼沉浸暗夜模式 |
| 🌸 | **樱粉浅酌** | Sakura Blossom | 甜美温润 | 花开灼灼 · 浅黛初春，柔美浪漫初春粉 |

---

## 🛠️ 技术栈

| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | [Vue 3](https://vuejs.org/) (`v3.5+`) | Options API / 响应式驱动 |
| **构建工具** | [Vite](https://vitejs.dev/) (`v7.2+`) | 现代极速前端构建引擎与冷启动工具 |
| **UI 组件库** | [Ant Design Vue](https://antdv.com/) (`v4.2+`) | 企业级高质量 UI 组件与主题定制引擎 |
| **历法计算** | [lunar-javascript](https://github.com/6tail/lunar-javascript) (`v1.7+`) | 业界权威的阳历、阴历、干支、节气转换库 |
| **日期工具** | [Day.js](https://day.js.org/) (`v1.11+`) | 轻量现代日期处理与格式化库 |
| **路由管理** | [Vue Router](https://router.vuejs.org/) (`v4+`) | 单页面路由管理器 |
| **样式预处理** | [Sass / SCSS](https://sass-lang.com/) | SCSS 模块化与原生 CSS 自定义变量混编 |

---

## 📁 项目结构

```bash
rili/
├── public/                 # 静态资源目录
├── src/
│   ├── assets/             # 静态图片/矢量资源
│   ├── constants/
│   │   └── themes.js       # 8 套主题配置数据、CSS变量转换工具与存储常量
│   ├── router/
│   │   └── index.js        # Vue Router 路由配置
│   ├── views/
│   │   └── Home.vue        # 日历主页面（网格生成、时辰推算、宜忌解析、切换逻辑）
│   ├── App.vue             # 根视图组件
│   ├── main.js             # 应用程序入口（组件库及路由注册）
│   └── style.css           # 全局基础样式与 CSS Reset
├── auto.sh                 # 快捷 Git 提交与同步推送脚本
├── index.html              # HTML 页面模板
├── netlify.toml            # Netlify 静态托管与 SPA 重定向配置
├── package.json            # 项目依赖说明与脚本指令
├── pnpm-lock.yaml          # pnpm 依赖锁文件
└── vite.config.js          # Vite 构建配置（端口设置 4820、代码分割打包）
```

---

## 🚀 快速上手

### 1. 环境准备

推荐使用最新 LTS 版本的 Node.js 及 pnpm 包管理器：

- **Node.js**: `>= 18.0.0` (推荐 `v20+` / `v22+`)
- **pnpm**: `>= 8.0.0` (推荐 `v9+`)

### 2. 获取代码与安装依赖

```bash
# 克隆仓库（或进入本地目录）
cd rili

# 安装依赖（推荐使用 pnpm）
pnpm install
```

> **提示**：如果国内网络下载较慢，可先设置淘宝镜像源：
> ```bash
> pnpm config set registry https://registry.npmmirror.com/
> ```

### 3. 本地启动开发服务器

```bash
pnpm dev
```

启动成功后，在浏览器中打开：[http://localhost:4820](http://localhost:4820) 即可预览。

### 4. 项目构建与预览

```bash
# 构建生产产物（生成文件位于 dist/ 目录）
pnpm build

# 本地预览生产构建产物
pnpm preview
```

---

## 🌐 部署指南

本项目为纯前端静态 Web 应用程序，无需额外服务端支持，可轻松部署至任何静态托管平台：

### 部署至 Netlify
项目根目录下已包含 `netlify.toml`，配置了 SPA 路由重定向：
1. 将代码推送到 GitHub / GitLab / Gitee。
2. 登录 [Netlify](https://www.netlify.com/) 并选择 `Add new site` -> `Import an existing project`。
3. 构建命令填入 `pnpm build`，发布目录填入 `dist` 即可自动完成部署。

### 部署至 Nginx
构建生成 `dist` 目录后，将内容上传至服务器，并配置 Nginx：
```nginx
server {
    listen       80;
    server_name  your-domain.com;

    location / {
        root   /path/to/dist;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 💡 后续规划

- [ ] 支持日历备忘录与个人日程事件添加/编辑
- [ ] 支持日历导出为图片（海报卡片）或桌面壁纸
- [ ] 增加更多传统节日自定义放假/补班标记
- [ ] 支持 PWA (Progressive Web Apps) 离线桌面应用安装

---

## 📄 开源许可

本项目遵循 MIT 开源协议，欢迎学习、交流与自由使用。
