@echo off
echo ====================================
echo    智能多媒体平台 GitHub 上传脚本
echo ====================================
echo.

REM 设置Git路径
set GIT_PATH="C:\Users\jiazhiqu\AppData\Local\Programs\Git\bin\git.exe"

echo [1/4] 检查Git状态...
%GIT_PATH% status
echo.

echo [2/4] 准备上传到GitHub...
echo 请确保您已在GitHub上创建了仓库: SmartMultimediaPlatform
echo.

REM 提示用户输入GitHub仓库URL
set /p REPO_URL="请输入您的GitHub仓库URL (例如: https://github.com/yourusername/SmartMultimediaPlatform.git): "

echo.
echo [3/4] 添加远程仓库...
%GIT_PATH% remote add origin %REPO_URL%

echo.
echo [4/4] 推送到GitHub...
echo 注意: 如果您想要私有仓库，请在GitHub上创建仓库时选择 "Private"
echo.

%GIT_PATH% branch -M main
%GIT_PATH% push -u origin main

echo.
echo ====================================
echo         上传完成！
echo ====================================
echo.
echo 您的项目已成功上传到GitHub!
echo 仓库地址: %REPO_URL%
echo.
echo 如需要设置为私有仓库，请在GitHub网站上进行以下操作:
echo 1. 访问您的仓库页面
echo 2. 点击 Settings
echo 3. 滚动到页面底部的 "Danger Zone"
echo 4. 点击 "Change repository visibility"
echo 5. 选择 "Make private"
echo.
pause
