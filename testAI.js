const ImageAnalyzer = require('./imageAnalyzer');
const fs = require('fs');

async function testAdvancedAI() {
    const analyzer = new ImageAnalyzer();
    
    console.log('🤖 测试高级AI图像识别系统');
    console.log('='.repeat(50));
    
    // 获取测试图片
    const uploadsDir = 'uploads';
    const imageFiles = fs.readdirSync(uploadsDir)
        .filter(f => (f.endsWith('.jpg') || f.endsWith('.png')) && !f.includes('.analysis.json'))
        .slice(0, 3); // 测试前3张图片
    
    for (const file of imageFiles) {
        const imagePath = `uploads/${file}`;
        console.log(`\n📸 分析图片: ${file}`);
        console.log('-'.repeat(40));
        
        try {
            const result = await analyzer.analyzeImage(imagePath);
            
            if (result.objectDetection) {
                console.log('🎯 物体检测结果:');
                
                // 显示AI分析信息
                if (result.objectDetection.aiAnalysis && result.objectDetection.aiAnalysis.success) {
                    console.log(`  🧠 AI分析状态: 成功`);
                    console.log(`  📊 检测数量: ${result.objectDetection.aiAnalysis.totalDetections}`);
                    console.log(`  📈 最高置信度: ${(result.objectDetection.aiAnalysis.maxConfidence * 100).toFixed(1)}%`);
                    console.log(`  📊 平均置信度: ${(result.objectDetection.aiAnalysis.avgConfidence * 100).toFixed(1)}%`);
                    if (result.objectDetection.aiAnalysis.aiDescription) {
                        console.log(`  💬 AI描述: ${result.objectDetection.aiAnalysis.aiDescription}`);
                    }
                } else {
                    console.log('  🧠 AI分析: 使用传统方法');
                }
                
                // 显示检测到的物体
                if (result.objectDetection.objectDescriptions && result.objectDetection.objectDescriptions.length > 0) {
                    console.log('\n  🔍 检测到的物体:');
                    result.objectDetection.objectDescriptions.forEach((obj, index) => {
                        console.log(`    ${index + 1}. ${obj.object} (置信度: ${(obj.confidence * 100).toFixed(1)}%)`);
                        if (obj.aiDetails) {
                            console.log(`       🎯 AI增强: ${obj.aiDetails.specificName}`);
                            if (obj.aiDetails.features && obj.aiDetails.features.length > 0) {
                                console.log(`       🔧 特征: ${obj.aiDetails.features.join(', ')}`);
                            }
                        }
                    });
                } else {
                    console.log('  ❌ 未检测到明确物体');
                }
                
                // 显示主要物体
                if (result.objectDetection.primaryObject) {
                    console.log(`\n  🏆 主要物体: ${result.objectDetection.primaryObject}`);
                }
            }
            
            // 显示描述
            if (result.description) {
                console.log(`\n  📝 综合描述: ${result.description}`);
            }
            
        } catch (error) {
            console.error(`❌ 分析失败: ${error.message}`);
        }
    }
    
    console.log('\n🎉 测试完成！');
}

// 运行测试
testAdvancedAI().catch(console.error);
