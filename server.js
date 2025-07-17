const express = require('express');
// 文件过滤器 - 图片和视频
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件 (JPEG, JPG, PNG, GIF, WebP)'));
  }
};

// 视频文件过滤器
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /video/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('只允许上传视频文件 (MP4, AVI, MOV, WMV, FLV, WebM, MKV)'));
  }
};

// 通用文件过滤器
const generalFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const videoTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
  const extname = path.extname(file.originalname).toLowerCase();
  
  const isImage = imageTypes.test(extname) && /image/.test(file.mimetype);
  const isVideo = videoTypes.test(extname) && /video/.test(file.mimetype);

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    cb(new Error('只允许上传图片或视频文件'));
  }
};

const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 每次都重新加载ImageAnalyzer以确保使用最新代码
function getImageAnalyzer() {
    console.log('正在重新加载ImageAnalyzer模块...');
    delete require.cache[require.resolve('./imageAnalyzer')];
    const ImageAnalyzer = require('./imageAnalyzer');
    console.log('ImageAnalyzer模块已重新加载');
    return new ImageAnalyzer();
}

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名，保留原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器，只允许图片文件
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('只能上传图片文件！'), false);
  }
};

// 创建multer实例
const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB限制
  }
});

const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB限制
  }
});

const uploadGeneral = multer({
  storage: storage,
  fileFilter: generalFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB限制
  }
});

// 保持向后兼容
const upload = uploadImage;

// 路由

// 测试上传页面
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-upload.html'));
});

// 首页 - 显示照片画廊
app.get('/', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    
    // 确保uploads目录存在
    await fs.ensureDir(uploadsDir);
    
    // 读取uploads目录中的所有文件
    const files = await fs.readdir(uploadsDir);
    
    // 过滤出图片文件
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    // 获取文件信息和分析结果
    const images = await Promise.all(
      imageFiles.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);
        
        // 尝试读取分析结果
        let analysis = null;
        const analysisPath = path.join(uploadsDir, filename + '.analysis.json');
        try {
          if (await fs.pathExists(analysisPath)) {
            analysis = await fs.readJSON(analysisPath);
          }
        } catch (error) {
          console.error('读取分析结果失败:', error);
        }

        return {
          filename,
          uploadDate: stats.birthtime,
          size: stats.size,
          analysis: analysis
        };
      })
    );

    // 按上传时间排序（最新的在前）
    images.sort((a, b) => b.uploadDate - a.uploadDate);

    res.render('index', { images });
  } catch (error) {
    console.error('读取图片时出错:', error);
    res.render('index', { images: [] });
  }
});

// 视频页面路由
app.get('/videos', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    
    // 确保uploads目录存在
    await fs.ensureDir(uploadsDir);
    
    // 读取uploads目录中的所有文件
    const files = await fs.readdir(uploadsDir);
    
    // 过滤出视频文件
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'].includes(ext);
    });

    // 获取视频文件信息
    const videos = await Promise.all(
      videoFiles.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);

        return {
          filename,
          uploadDate: stats.birthtime,
          size: Math.round(stats.size / 1024 / 1024 * 100) / 100, // MB
          duration: null // 可以后续添加视频时长检测
        };
      })
    );

    // 按上传时间排序（最新的在前）
    videos.sort((a, b) => b.uploadDate - a.uploadDate);

    res.render('videos', { videos });
  } catch (error) {
    console.error('读取视频时出错:', error);
    res.render('videos', { videos: [] });
  }
});

// 计算24点游戏页面路由
app.get('/game24', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game24.html'));
});

// 在线视频播放器页面路由
app.get('/video-player', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'video-player.html'));
});

// 迷你浏览器页面路由
app.get('/mini-browser', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mini-browser.html'));
});

// 网页代理页面路由
app.get('/web-proxy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'web-proxy.html'));
});

// 网页代理API路由（演示版本）
app.post('/api/fetch-webpage', express.json(), async (req, res) => {
  try {
    const { url, mode } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: '缺少URL参数'
      });
    }
    
    // 这里是演示版本，实际应用中需要实现真正的网页抓取
    // 可以使用puppeteer、axios、cheerio等库
    
    const hostname = new URL(url).hostname;
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let result = {
      success: true,
      url: url,
      hostname: hostname,
      mode: mode,
      timestamp: new Date().toISOString()
    };
    
    switch (mode) {
      case 'content':
        result.content = `这是来自 ${hostname} 的内容摘要...`;
        result.links = Math.floor(Math.random() * 50) + 10;
        break;
      case 'screenshot':
        result.screenshot = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
        break;
      case 'analysis':
        result.analysis = {
          title: `${hostname} 分析报告`,
          keywords: ['网页', '内容', '分析'],
          links: Math.floor(Math.random() * 30) + 5,
          language: '自动检测',
          mobile: '适配良好'
        };
        break;
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('网页代理错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误: ' + error.message
    });
  }
});

// 视频上传路由
app.post('/upload-video', uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传视频文件'
      });
    }

    console.log('视频上传成功:', req.file.filename);

    res.json({
      success: true,
      message: '视频上传成功！',
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('视频上传失败:', error);
    res.status(500).json({
      success: false,
      message: '视频上传失败: ' + error.message
    });
  }
});

// 删除视频
app.delete('/delete-video/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('删除视频失败:', err);
      res.json({ success: false, message: '删除视频失败' });
    } else {
      console.log(`视频删除成功: ${filename}`);
      res.json({ success: true, message: '视频删除成功' });
    }
  });
});

// 上传图片
app.post('/upload', upload.single('photo'), async (req, res) => {
  console.log('收到上传请求');
  console.log('请求文件:', req.file);
  console.log('请求体:', req.body);
  
  try {
    if (!req.file) {
      console.log('没有接收到文件');
      return res.status(400).json({ 
        success: false, 
        message: '请选择要上传的图片文件' 
      });
    }

    console.log('文件上传成功:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // 分析图片内容
    console.log('开始分析图片内容...');
    const imagePath = path.join(__dirname, 'uploads', req.file.filename);
    const imageAnalyzer = getImageAnalyzer();
    const analysis = await imageAnalyzer.analyzeImage(imagePath);
    console.log('图片分析完成:', analysis.description);

    // 将分析结果保存到JSON文件
    const analysisPath = path.join(__dirname, 'uploads', req.file.filename + '.analysis.json');
    await fs.writeJSON(analysisPath, analysis, { spaces: 2 });

    res.json({
      success: true,
      message: '图片上传成功！',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      analysis: {
        description: analysis.description,
        tags: analysis.tags,
        basicInfo: analysis.basicInfo
      }
    });
  } catch (error) {
    console.error('上传图片时出错:', error);
    res.status(500).json({
      success: false,
      message: '上传失败，请重试'
    });
  }
});

// 删除图片
app.delete('/delete/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    // 检查文件是否存在
    if (await fs.pathExists(filePath)) {
      await fs.unlink(filePath);
      res.json({ success: true, message: '图片删除成功' });
    } else {
      res.status(404).json({ success: false, message: '图片不存在' });
    }
  } catch (error) {
    console.error('删除图片时出错:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// 获取图片分析信息
app.get('/api/analysis/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const analysisPath = path.join(__dirname, 'uploads', filename + '.analysis.json');
    const imagePath = path.join(__dirname, 'uploads', filename);
    
    // 检查图片文件是否存在
    if (!(await fs.pathExists(imagePath))) {
      return res.status(404).json({ success: false, message: '图片不存在' });
    }
    
    // 检查是否有分析文件，如果有且没有错误，就返回
    if (await fs.pathExists(analysisPath)) {
      const analysis = await fs.readJSON(analysisPath);
      // 如果分析没有错误，直接返回
      if (!analysis.error) {
        return res.json({ success: true, analysis });
      }
      // 如果有错误，删除旧的分析文件并重新分析
      console.log('发现错误的分析文件，删除并重新分析:', filename);
      await fs.remove(analysisPath);
    }
    
    // 重新分析图片
    console.log('重新分析图片:', filename);
    const imageAnalyzer = getImageAnalyzer();
    const analysis = await imageAnalyzer.analyzeImage(imagePath);
    await fs.writeJSON(analysisPath, analysis, { spaces: 2 });
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('获取分析信息失败:', error);
    res.status(500).json({ success: false, message: '获取分析信息失败' });
  }
});

// 获取图片列表 API
app.get('/api/images', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    await fs.ensureDir(uploadsDir);
    
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    const images = await Promise.all(
      imageFiles.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);
        return {
          filename,
          uploadDate: stats.birthtime,
          size: stats.size,
          url: `/uploads/${filename}`
        };
      })
    );

    images.sort((a, b) => b.uploadDate - a.uploadDate);
    res.json(images);
  } catch (error) {
    console.error('获取图片列表时出错:', error);
    res.status(500).json({ error: '获取图片列表失败' });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('错误处理中间件捕获到错误:', error);
  
  if (error instanceof multer.MulterError) {
    console.log('Multer错误:', error.code, error.message);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超过限制（最大5MB）'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: '上传的字段名不正确，请使用photo字段'
      });
    }
  }
  
  if (error.message === '只能上传图片文件！') {
    console.log('文件类型错误');
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  console.error('未处理的服务器错误:', error);
  res.status(500).json({
    success: false,
    message: '服务器内部错误: ' + error.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`照片分享网站运行在 http://localhost:${PORT}`);
  console.log('功能包括：');
  console.log('- 上传照片');
  console.log('- 照片画廊展示');
  console.log('- 删除照片');
  console.log('- 响应式设计');
});

module.exports = app;
