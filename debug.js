// 测试上传功能的简单脚本
const fs = require('fs');
const path = require('path');

console.log('=== 上传功能调试信息 ===');

// 检查uploads目录
const uploadsDir = path.join(__dirname, 'uploads');
console.log('uploads目录路径:', uploadsDir);
console.log('uploads目录是否存在:', fs.existsSync(uploadsDir));

if (fs.existsSync(uploadsDir)) {
    try {
        const stats = fs.statSync(uploadsDir);
        console.log('uploads目录信息:');
        console.log('- 是否为目录:', stats.isDirectory());
        console.log('- 创建时间:', stats.birthtime);
        console.log('- 修改时间:', stats.mtime);
        
        // 测试写入权限
        const testFile = path.join(uploadsDir, 'test.txt');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('- 写入权限: ✓ 正常');
    } catch (error) {
        console.log('- 写入权限: ✗ 错误 -', error.message);
    }
} else {
    console.log('正在创建uploads目录...');
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('uploads目录创建成功');
    } catch (error) {
        console.log('创建uploads目录失败:', error.message);
    }
}

// 检查依赖包
console.log('\n=== 依赖包检查 ===');
const requiredPackages = ['express', 'multer', 'path', 'fs-extra', 'cors', 'ejs'];

requiredPackages.forEach(pkg => {
    try {
        const packagePath = pkg === 'path' ? 'path' : `node_modules/${pkg}`;
        if (pkg === 'path' || fs.existsSync(packagePath)) {
            console.log(`${pkg}: ✓ 已安装`);
        } else {
            console.log(`${pkg}: ✗ 未找到`);
        }
    } catch (error) {
        console.log(`${pkg}: ✗ 错误 - ${error.message}`);
    }
});

console.log('\n=== 测试完成 ===');
