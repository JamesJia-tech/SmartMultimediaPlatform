@echo off
echo ====================================
echo    GitHub Desktop 上传指南
echo ====================================
echo.
echo 由于网络连接问题，推荐使用GitHub Desktop进行上传
echo.
echo 🔽 步骤1: 下载GitHub Desktop
echo    访问: https://desktop.github.com/
echo    下载并安装GitHub Desktop
echo.
echo 🔑 步骤2: 登录GitHub账户
echo    打开GitHub Desktop，使用您的GitHub账户登录
echo.
echo 📁 步骤3: 添加现有仓库
echo    1. 点击 "Add an Existing Repository from your hard drive"
echo    2. 选择文件夹: %~dp0
echo    3. 点击 "Add Repository"
echo.
echo 🚀 步骤4: 发布到GitHub
echo    1. 点击 "Publish repository"
echo    2. 确认仓库名: SmartMultimediaPlatform
echo    3. ✅ 勾选 "Keep this code private" (重要!)
echo    4. 点击 "Publish Repository"
echo.
echo ✨ 完成! 您的私有仓库已成功上传到GitHub
echo.
echo 📍 仓库地址: https://github.com/JamesJia-tech/SmartMultimediaPlatform
echo.
echo ====================================
echo.
pause
echo.
echo 🌐 正在打开GitHub Desktop下载页面...
start https://desktop.github.com/
