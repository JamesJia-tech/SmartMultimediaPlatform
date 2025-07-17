# 🎯 智能多媒体平台

一个功能丰富的Web应用平台，集成了图片AI分析、视频播放、网页代理、迷你浏览器和智能游戏等多项功能。基于Node.js和Express框架开发，提供现代化的用户体验。

## ✨ 核心功能

### � 图片中心
- **智能上传**：支持拖拽上传和点击上传多种图片格式
- **AI分析**：集成多种AI模型进行图像识别和分析
- **特征提取**：物体识别、场景分析、文字识别等
- **画廊展示**：响应式网格布局，支持全屏预览
- **管理功能**：删除、下载、文件信息查看

### 🎬 视频中心
- **多格式支持**：支持MP4、MKV、AVI等主流视频格式
- **在线播放**：HTML5视频播放器，支持全屏和播放控制
- **视频管理**：上传、删除、重命名等管理功能
- **响应式设计**：完美适配各种设备

### 🌐 在线播放
- **YouTube集成**：支持YouTube视频链接播放
- **多平台支持**：兼容各大视频平台
- **嵌入播放**：无需跳转即可观看视频

### 🌍 迷你浏览器
- **iframe浏览**：在应用内浏览外部网站
- **YouTube特化**：特别优化的YouTube浏览体验
- **企业网络检测**：智能检测网络环境并提供建议

### 🔗 智能网页代理
- **CORS突破**：使用多重代理技术突破跨域限制
- **内容提取**：智能提取网页主要内容
- **页面截图**：生成网页截图预览
- **内容分析**：分析网站结构和元数据
- **特殊处理**：针对YouTube、GitHub等网站的特殊优化

### � 计算24游戏
- **智能算法**：自动生成24点数学题目
- **多种玩法**：支持不同难度级别
- **实时计算**：即时验证答案正确性

## 🚀 快速开始

### 环境要求

- Node.js (版本 14 或更高)
- npm 或 yarn
- Python 3.8+ (用于AI功能)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd PicWebsite
   ```

2. **安装Node.js依赖**
   ```bash
   npm install
   ```

3. **安装Python依赖** (可选，用于AI功能)
   ```bash
   pip install opencv-python pillow tensorflow numpy
   ```

4. **启动服务器**
   ```bash
   npm start
   # 或者使用
   node server.js
   ```

5. **访问应用**
   打开浏览器访问：http://localhost:3000

## �️ 技术栈

### 前端技术
- **HTML5/CSS3**：现代化响应式设计
- **JavaScript ES6+**：原生JS实现交互功能
- **响应式布局**：Grid + Flexbox布局
- **动画效果**：CSS3动画和过渡效果

### 后端技术
- **Node.js**：服务器运行环境
- **Express.js**：Web应用框架
- **Multer**：文件上传中间件
- **EJS**：模板引擎
- **CORS**：跨域资源共享处理

### AI技术
- **OpenCV**：计算机视觉处理
- **TensorFlow**：机器学习模型
- **PIL/Pillow**：图像处理库
- **Python集成**：AI功能Python脚本

## �📁 项目结构

```
PicWebsite/
├── server.js              # Express服务器主文件
├── package.json           # Node.js项目配置
├── imageAnalyzer.js       # AI图像分析模块
├── testAI.js             # AI功能测试脚本
├── advancedAI.py         # 高级AI分析Python脚本
├── simpleAI.py           # 简单AI分析Python脚本
├── public/               # 静态资源目录
│   ├── mini-browser.html    # 迷你浏览器页面
│   ├── web-proxy.html       # 智能网页代理
│   ├── game24.html          # 24点游戏
│   ├── file-input-test.html # 文件上传测试
│   ├── test-video-upload.html # 视频上传测试
│   ├── video-player.html   # 视频播放器
│   └── styles.css          # 全局样式
├── views/                # EJS模板目录
│   ├── index.ejs            # 图片中心主页
│   └── videos.ejs          # 视频中心页面
├── uploads/              # 文件上传目录
└── .vscode/             # VS Code配置
    └── tasks.json          # 构建任务配置
├── uploads/           # 上传的图片存储目录
├── public/            # 静态资源目录
│   └── styles.css     # 额外的CSS样式
└── views/             # 模板文件目录
    └── index.ejs      # 主页模板
```

## 🛠️ 技术栈

### 后端技术
- **Node.js** - JavaScript运行环境
- **Express** - Web应用框架
- **Multer** - 文件上传中间件
- **EJS** - 模板引擎
- **fs-extra** - 文件系统增强库
- **CORS** - 跨域资源共享

### 前端技术
- **HTML5** - 结构标记
- **CSS3** - 样式设计（包含Flexbox、Grid、动画）
- **JavaScript (ES6+)** - 交互逻辑
- **响应式设计** - 移动端适配

## 🎯 主要功能说明

### 照片上传
- 支持多种图片格式：JPG、JPEG、PNG、GIF、WebP
- 文件大小限制：最大5MB
- 支持批量上传
- 拖拽上传体验
- 实时上传进度显示

### 照片展示
- 响应式网格布局
- 图片懒加载
- 悬停效果和动画
- 图片信息显示（文件名、大小、上传时间）

### 图片操作
- 全屏预览模态框
- 下载原图功能
- 删除确认机制
- 键盘快捷键支持（ESC关闭预览）

## 🔧 配置选项

### 服务器配置
```javascript
const PORT = process.env.PORT || 3000; // 端口号
```

### 上传限制
```javascript
limits: {
  fileSize: 5 * 1024 * 1024 // 5MB文件大小限制
}
```

### 支持的图片格式
```javascript
const allowedTypes = /jpeg|jpg|png|gif|webp/;
```

## 🌐 API接口

### 获取图片列表
- **URL**: `GET /api/images`
- **描述**: 获取所有上传的图片信息
- **响应**: JSON格式的图片列表

### 上传图片
- **URL**: `POST /upload`
- **描述**: 上传单张图片
- **参数**: `photo` (文件)
- **响应**: 上传结果JSON

### 删除图片
- **URL**: `DELETE /delete/:filename`
- **描述**: 删除指定的图片文件
- **参数**: `filename` (文件名)
- **响应**: 删除结果JSON

## 🎨 界面特色

- **现代化设计**：使用渐变背景和圆角设计
- **动画效果**：页面加载动画、悬停效果、过渡动画
- **用户体验**：直观的操作界面、清晰的状态反馈
- **可访问性**：支持键盘导航、高对比度模式

## 📱 响应式支持

- **桌面端**：多列网格布局，丰富的交互效果
- **平板端**：自适应列数，优化的触控体验
- **手机端**：单列布局，触控友好的按钮设计

## 🔒 安全特性

- 文件类型验证
- 文件大小限制
- 路径安全检查
- 错误处理机制

## 🚧 未来计划

- [ ] 用户认证系统
- [ ] 图片分类和标签
- [ ] 图片搜索功能
- [ ] 批量下载
- [ ] 图片编辑功能
- [ ] 社交分享功能
- [ ] 数据库存储
- [ ] 云存储集成

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 开发者

由 GitHub Copilot 协助开发

---

**享受使用照片分享网站！** 🎉
