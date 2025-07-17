@echo off
echo ========================================
echo    智能多媒体平台 - GitHub上传脚本
echo ========================================
echo.

REM 检查Git是否安装
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到Git安装
    echo.
    echo 请先安装Git:
    echo 1. 访问 https://git-scm.com/
    echo 2. 下载并安装Git for Windows
    echo 3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✅ Git已安装
echo.

REM 初始化Git仓库
echo 📁 初始化Git仓库...
git init

REM 添加所有文件
echo 📤 添加项目文件...
git add .

REM 提交代码
echo 💾 提交代码...
git commit -m "🎯 初始提交: 智能多媒体平台完整功能"

REM 设置主分支
echo 🌿 设置主分支...
git branch -M main

echo.
echo ========================================
echo    ⚠️  重要提示
echo ========================================
echo.
echo 1. 请先在GitHub上创建私有仓库:
echo    - 访问 https://github.com
echo    - 点击 New repository
echo    - Repository name: smart-multimedia-platform
echo    - 选择 Private
echo    - 点击 Create repository
echo.
echo 2. 然后输入您的GitHub用户名:
set /p username="请输入GitHub用户名: "

if "%username%"=="" (
    echo ❌ 用户名不能为空
    pause
    exit /b 1
)

REM 添加远程仓库
echo 🔗 连接到远程仓库...
git remote add origin https://github.com/%username%/smart-multimedia-platform.git

REM 推送到GitHub
echo 🚀 推送到GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败，可能的原因:
    echo 1. GitHub仓库不存在或名称错误
    echo 2. 网络连接问题
    echo 3. 认证失败
    echo.
    echo 💡 解决方案:
    echo 1. 确保在GitHub上创建了名为 smart-multimedia-platform 的仓库
    echo 2. 检查用户名拼写是否正确
    echo 3. 确保GitHub账户有推送权限
    echo.
) else (
    echo.
    echo ========================================
    echo        🎉 上传成功！
    echo ========================================
    echo.
    echo 📍 仓库地址: https://github.com/%username%/smart-multimedia-platform
    echo.
    echo 🎯 项目包含功能:
    echo   • 📸 图片中心 - AI智能分析
    echo   • 🎬 视频中心 - 多格式播放
    echo   • 🌐 在线播放 - YouTube集成
    echo   • 🌍 迷你浏览器 - iframe浏览
    echo   • 🔗 网页代理 - CORS突破
    echo   • 🎯 计算24游戏 - 智能算法
    echo.
)

pause
