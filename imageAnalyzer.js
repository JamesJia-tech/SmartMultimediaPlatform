const sharp = require('sharp');
const imageSizeLib = require('image-size');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// 确保正确获取sizeOf函数
const sizeOf = (imageSizeLib && typeof imageSizeLib.default === 'function') 
    ? imageSizeLib.default 
    : imageSizeLib;

/**
 * 图片分析模块
 * 提供图片的基本信息分析和简单的内容描述
 */
class ImageAnalyzer {
    constructor() {
        // 预定义的图片描述模板
        this.colorDescriptions = {
            red: '温暖的红色调',
            orange: '活力的橙色调',
            yellow: '明亮的黄色调',
            green: '清新的绿色调',
            blue: '宁静的蓝色调',
            purple: '神秘的紫色调',
            pink: '浪漫的粉色调',
            brown: '温馨的棕色调',
            gray: '优雅的灰色调',
            black: '深邃的黑色调',
            white: '纯净的白色调'
        };

        this.aspectRatioDescriptions = {
            square: '方形构图',
            landscape: '横向构图',
            portrait: '纵向构图',
            panoramic: '全景构图'
        };

        this.sizeDescriptions = {
            small: '小尺寸图片',
            medium: '中等尺寸图片',
            large: '大尺寸图片',
            huge: '超大尺寸图片'
        };

        // 内容类型识别模板
        this.contentTypes = {
            nature: ['风景', '自然', '户外'],
            portrait: ['人像', '肖像', '人物'],
            architecture: ['建筑', '城市', '房屋'],
            food: ['美食', '食物', '餐饮'],
            technology: ['科技', '电子', '设备'],
            art: ['艺术', '绘画', '创作'],
            animal: ['动物', '宠物', '野生动物'],
            vehicle: ['交通工具', '汽车', '飞机'],
            text: ['文档', '文字', '标识'],
            abstract: ['抽象', '图案', '纹理']
        };

        // 场景识别关键词
        this.sceneKeywords = {
            indoor: ['室内', '房间', '家居', '办公室', '商店'],
            outdoor: ['户外', '街道', '公园', '海滩', '山脉'],
            nature: ['森林', '湖泊', '天空', '草地', '花朵'],
            urban: ['城市', '建筑群', '街景', '商业区'],
            night: ['夜景', '灯光', '月亮', '星空'],
            day: ['白天', '阳光', '明亮', '清晰']
        };

        // 情感色调描述
        this.emotionalTones = {
            warm: '温暖舒适',
            cool: '清新凉爽',
            energetic: '充满活力',
            calm: '宁静平和',
            dramatic: '戏剧性强',
            mysterious: '神秘莫测',
            cheerful: '欢快愉悦',
            melancholic: '忧郁深沉'
        };

        // 物体识别模板
        this.objectPatterns = {
            // 人物识别特征 - 更严格的条件
            person: {
                keywords: ['人', '人物', '人像', '肖像'],
                colorPatterns: ['skin', 'flesh'],
                aspectRatios: [0.6, 0.9], // 更严格的人像比例
                sizeThresholds: { min: 0.3, max: 8 }, // 人物通常占一定比例
                requiredFeatures: ['organic_shapes', 'medium_complexity'],
                excludeFeatures: ['high_metallic', 'geometric_dominant']
            },
            // 车辆识别特征 - 更精确的特征
            vehicle: {
                keywords: ['汽车', '车辆', '交通工具'],
                colorPatterns: ['metallic', 'bright', 'dark_metallic'],
                aspectRatios: [1.8, 3.5], // 更典型的车辆比例
                sizeThresholds: { min: 0.2, max: 15 },
                requiredFeatures: ['geometric_shapes', 'horizontal_dominant'],
                excludeFeatures: ['organic_texture', 'skin_tones']
            },
            // 建筑识别特征
            building: {
                keywords: ['建筑', '房屋', '大楼'],
                colorPatterns: ['gray', 'white', 'brown', 'concrete'],
                aspectRatios: [0.4, 2.5],
                sizeThresholds: { min: 1, max: 50 },
                requiredFeatures: ['vertical_structures', 'geometric_shapes'],
                excludeFeatures: ['organic_texture', 'small_scale']
            },
            // 自然景观 - 更准确的自然特征
            nature: {
                keywords: ['自然', '风景', '山水'],
                colorPatterns: ['green', 'blue', 'earth_tones'],
                aspectRatios: [1.2, 3.0],
                sizeThresholds: { min: 0.5, max: 50 },
                requiredFeatures: ['organic_texture', 'natural_colors'],
                excludeFeatures: ['geometric_dominant', 'artificial_lighting']
            },
            // 动物识别 - 更细致的特征
            animal: {
                keywords: ['动物', '宠物', '猫', '狗'],
                colorPatterns: ['fur_colors', 'natural_tones'],
                aspectRatios: [0.7, 2.5],
                sizeThresholds: { min: 0.1, max: 8 },
                requiredFeatures: ['organic_shapes', 'fur_texture'],
                excludeFeatures: ['geometric_shapes', 'metallic_colors']
            },
            // 食物识别
            food: {
                keywords: ['食物', '美食', '餐饮'],
                colorPatterns: ['food_colors', 'warm_tones'],
                aspectRatios: [0.7, 1.8],
                sizeThresholds: { min: 0.05, max: 3 },
                requiredFeatures: ['close_up', 'rich_colors'],
                excludeFeatures: ['large_scale', 'geometric_dominant']
            },
            // 文字文档
            text: {
                keywords: ['文字', '文档', '书籍'],
                colorPatterns: ['high_contrast', 'monochrome'],
                aspectRatios: [0.6, 1.6],
                sizeThresholds: { min: 0.1, max: 10 },
                requiredFeatures: ['high_contrast', 'structured_layout'],
                excludeFeatures: ['natural_colors', 'organic_shapes']
            }
        };
    }

    /**
     * 分析单张图片
     * @param {string} imagePath - 图片文件路径
     * @returns {Promise<Object>} 分析结果
     */
    async analyzeImage(imagePath) {
        try {
            const analysis = {
                basicInfo: {},
                colorInfo: {},
                description: '',
                tags: [],
                analysisTime: new Date().toISOString()
            };

            // 获取基本图片信息
            analysis.basicInfo = await this.getBasicInfo(imagePath);
            
            // 分析颜色信息
            analysis.colorInfo = await this.analyzeColors(imagePath);
            
            // 分析图片内容和场景
            analysis.contentAnalysis = await this.analyzeContent(imagePath);
            
            // 智能物体识别
            analysis.objectDetection = await this.detectObjects(imagePath);
            
            // 生成描述
            analysis.description = this.generateDescription(analysis);
            
            // 生成标签
            analysis.tags = this.generateTags(analysis);

            return analysis;
        } catch (error) {
            console.error('图片分析失败:', error);
            return {
                error: '图片分析失败: ' + error.message,
                basicInfo: {},
                colorInfo: {},
                description: '无法分析此图片',
                tags: ['分析失败'],
                analysisTime: new Date().toISOString()
            };
        }
    }

    /**
     * 获取图片基本信息
     */
    async getBasicInfo(imagePath) {
        console.log('getBasicInfo被调用，sizeOf类型:', typeof sizeOf);
        const stats = await fs.promises.stat(imagePath);
        const buffer = await fs.promises.readFile(imagePath);
        const dimensions = sizeOf(buffer);
        const sharpMeta = await sharp(imagePath).metadata();

        return {
            filename: path.basename(imagePath),
            format: sharpMeta.format || dimensions.type,
            width: dimensions.width,
            height: dimensions.height,
            size: stats.size,
            channels: sharpMeta.channels,
            hasAlpha: sharpMeta.hasAlpha,
            orientation: sharpMeta.orientation,
            density: sharpMeta.density,
            aspectRatio: dimensions.width / dimensions.height,
            megapixels: Math.round((dimensions.width * dimensions.height) / 1000000 * 100) / 100
        };
    }

    /**
     * 分析图片颜色信息
     */
    async analyzeColors(imagePath) {
        try {
            // 使用sharp获取图片统计信息
            const { dominant } = await sharp(imagePath)
                .resize(100, 100) // 缩小图片以提高分析速度
                .removeAlpha() // 移除透明通道
                .raw()
                .toBuffer({ resolveWithObject: true });

            // 计算主要颜色（简化版本）
            const stats = await sharp(imagePath).stats();
            
            const dominantColor = this.getDominantColor(stats);
            const brightness = this.calculateBrightness(stats);
            const contrast = this.calculateContrast(stats);

            return {
                dominantColor,
                brightness,
                contrast,
                colorfulness: this.calculateColorfulness(stats)
            };
        } catch (error) {
            console.error('颜色分析失败:', error);
            return {
                dominantColor: 'unknown',
                brightness: 'medium',
                contrast: 'medium',
                colorfulness: 'medium'
            };
        }
    }

    /**
     * 获取主导颜色
     */
    getDominantColor(stats) {
        if (!stats.channels) return 'unknown';

        const channels = stats.channels;
        if (channels.length >= 3) {
            const r = channels[0].mean;
            const g = channels[1].mean;
            const b = channels[2].mean;

            // 简单的颜色分类逻辑
            if (r > g && r > b) {
                if (r - Math.max(g, b) > 50) return 'red';
                if (g > 100) return 'orange';
                return 'pink';
            } else if (g > r && g > b) {
                if (g - Math.max(r, b) > 50) return 'green';
                if (r > 100) return 'yellow';
                return 'green';
            } else if (b > r && b > g) {
                if (b - Math.max(r, g) > 50) return 'blue';
                if (r > 100) return 'purple';
                return 'blue';
            } else {
                const avg = (r + g + b) / 3;
                if (avg < 50) return 'black';
                if (avg > 200) return 'white';
                return 'gray';
            }
        }
        return 'unknown';
    }

    /**
     * 计算亮度
     */
    calculateBrightness(stats) {
        if (!stats.channels || stats.channels.length === 0) return 'medium';
        
        const avgBrightness = stats.channels.reduce((sum, channel) => sum + channel.mean, 0) / stats.channels.length;
        
        if (avgBrightness < 85) return 'dark';
        if (avgBrightness > 170) return 'bright';
        return 'medium';
    }

    /**
     * 计算对比度
     */
    calculateContrast(stats) {
        if (!stats.channels || stats.channels.length === 0) return 'medium';
        
        const avgStd = stats.channels.reduce((sum, channel) => sum + channel.stdev, 0) / stats.channels.length;
        
        if (avgStd < 30) return 'low';
        if (avgStd > 60) return 'high';
        return 'medium';
    }

    /**
     * 计算色彩丰富度
     */
    calculateColorfulness(stats) {
        if (!stats.channels || stats.channels.length < 3) return 'low';
        
        const [r, g, b] = stats.channels.slice(0, 3);
        const colorVariance = Math.sqrt(
            Math.pow(r.stdev, 2) + Math.pow(g.stdev, 2) + Math.pow(b.stdev, 2)
        );
        
        if (colorVariance < 20) return 'low';
        if (colorVariance > 50) return 'high';
        return 'medium';
    }

    /**
     * 分析图片内容和场景
     */
    async analyzeContent(imagePath) {
        try {
            const { basicInfo, colorInfo } = await this.getAnalysisData(imagePath);
            
            const content = {
                scene: this.detectScene(basicInfo, colorInfo),
                contentType: this.detectContentType(basicInfo, colorInfo),
                composition: this.analyzeComposition(basicInfo),
                lighting: this.analyzeLighting(colorInfo),
                mood: this.detectMood(colorInfo),
                quality: this.assessQuality(basicInfo, colorInfo),
                technicalDetails: this.getTechnicalInsights(basicInfo)
            };

            return content;
        } catch (error) {
            console.error('内容分析失败:', error);
            return {
                scene: 'unknown',
                contentType: 'general',
                composition: 'standard',
                lighting: 'natural',
                mood: 'neutral',
                quality: 'good',
                technicalDetails: []
            };
        }
    }

    /**
     * 获取分析所需的基础数据
     */
    async getAnalysisData(imagePath) {
        const basicInfo = await this.getBasicInfo(imagePath);
        const colorInfo = await this.analyzeColors(imagePath);
        return { basicInfo, colorInfo };
    }

    /**
     * 场景检测
     */
    detectScene(basicInfo, colorInfo) {
        const { aspectRatio, width, height } = basicInfo;
        const { dominantColor, brightness, colorfulness } = colorInfo;

        // 基于颜色和构图判断场景
        if (dominantColor === 'blue' && brightness === 'bright') {
            return 'sky_outdoor';
        }
        if (dominantColor === 'green' && colorfulness === 'high') {
            return 'nature_outdoor';
        }
        if (brightness === 'dark' && colorfulness === 'low') {
            return 'indoor_night';
        }
        if (aspectRatio > 2) {
            return 'panoramic_landscape';
        }
        if (aspectRatio < 0.8) {
            return 'portrait_close';
        }
        
        return 'general_scene';
    }

    /**
     * 内容类型检测
     */
    detectContentType(basicInfo, colorInfo) {
        const { aspectRatio, megapixels } = basicInfo;
        const { dominantColor, brightness, contrast } = colorInfo;

        // 基于技术特征推断内容类型
        if (aspectRatio < 0.8 && contrast === 'high') {
            return 'portrait';
        }
        if (aspectRatio > 1.5 && dominantColor === 'green') {
            return 'landscape';
        }
        if (brightness === 'bright' && contrast === 'high') {
            return 'architecture';
        }
        if (dominantColor === 'black' && contrast === 'high') {
            return 'text_document';
        }
        if (megapixels > 5 && contrast === 'high') {
            return 'photography';
        }
        
        return 'general';
    }

    /**
     * 构图分析
     */
    analyzeComposition(basicInfo) {
        const { aspectRatio, width, height } = basicInfo;
        
        if (Math.abs(aspectRatio - 1) < 0.1) {
            return 'square_centered';
        }
        if (aspectRatio > 2) {
            return 'panoramic_wide';
        }
        if (aspectRatio < 0.7) {
            return 'vertical_portrait';
        }
        if (aspectRatio > 1.2 && aspectRatio < 1.8) {
            return 'horizontal_landscape';
        }
        
        return 'standard_composition';
    }

    /**
     * 光线分析
     */
    analyzeLighting(colorInfo) {
        const { brightness, contrast } = colorInfo;
        
        if (brightness === 'bright' && contrast === 'high') {
            return 'strong_directional';
        }
        if (brightness === 'bright' && contrast === 'low') {
            return 'soft_diffused';
        }
        if (brightness === 'dark' && contrast === 'high') {
            return 'dramatic_shadow';
        }
        if (brightness === 'dark' && contrast === 'low') {
            return 'low_ambient';
        }
        
        return 'natural_balanced';
    }

    /**
     * 情绪检测
     */
    detectMood(colorInfo) {
        const { dominantColor, brightness, colorfulness } = colorInfo;
        
        if (dominantColor === 'red' || dominantColor === 'orange') {
            return brightness === 'bright' ? 'energetic' : 'warm';
        }
        if (dominantColor === 'blue') {
            return brightness === 'bright' ? 'calm' : 'melancholic';
        }
        if (dominantColor === 'green') {
            return 'peaceful';
        }
        if (dominantColor === 'purple') {
            return 'mysterious';
        }
        if (brightness === 'dark') {
            return 'dramatic';
        }
        if (colorfulness === 'high') {
            return 'vibrant';
        }
        
        return 'neutral';
    }

    /**
     * 图片质量评估
     */
    assessQuality(basicInfo, colorInfo) {
        const { megapixels, hasAlpha } = basicInfo;
        const { contrast } = colorInfo;
        
        let score = 0;
        
        if (megapixels > 5) score += 2;
        else if (megapixels > 2) score += 1;
        
        if (contrast === 'high') score += 1;
        if (hasAlpha) score += 1;
        
        if (score >= 3) return 'excellent';
        if (score >= 2) return 'good';
        if (score >= 1) return 'fair';
        return 'basic';
    }

    /**
     * 技术细节分析
     */
    getTechnicalInsights(basicInfo) {
        const insights = [];
        const { width, height, megapixels, hasAlpha, format } = basicInfo;
        
        if (megapixels > 10) {
            insights.push('超高分辨率适合打印');
        } else if (megapixels > 5) {
            insights.push('高分辨率适合专业用途');
        }
        
        if (hasAlpha) {
            insights.push('包含透明通道');
        }
        
        if (format.toLowerCase() === 'png') {
            insights.push('无损压缩格式');
        } else if (format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg') {
            insights.push('有损压缩格式');
        }
        
        if (width > 3000 || height > 3000) {
            insights.push('适合大幅面展示');
        }
        
        return insights;
    }

    /**
     * 使用高级AI进行物体识别（Node.js版本）
     */
    async performAdvancedAnalysis(imagePath) {
        try {
            // 使用sharp进行高级图像分析
            const metadata = await sharp(imagePath).metadata();
            const stats = await sharp(imagePath).stats();
            
            // 多尺度分析
            const multiScaleFeatures = await this.multiScaleAnalysis(imagePath);
            
            // 颜色直方图分析
            const colorHistogram = await this.analyzeColorHistogram(imagePath);
            
            // 纹理分析
            const textureFeatures = await this.advancedTextureAnalysis(imagePath);
            
            // 边缘检测
            const edgeFeatures = await this.edgeDetection(imagePath);
            
            // 基于这些特征进行智能识别
            const detections = this.intelligentObjectDetection({
                metadata,
                stats,
                multiScale: multiScaleFeatures,
                colorHist: colorHistogram,
                texture: textureFeatures,
                edges: edgeFeatures
            });
            
            return {
                success: true,
                objects: detections.objects,
                primary_objects: detections.primaryObjects,
                confidence_summary: detections.confidenceSummary,
                total_detections: detections.objects.length,
                ai_description: detections.description
            };
            
        } catch (error) {
            console.error('高级分析失败:', error);
            return null;
        }
    }

    /**
     * 多尺度图像分析
     */
    async multiScaleAnalysis(imagePath) {
        const scales = [50, 100, 200]; // 不同的缩放尺寸
        const features = [];
        
        for (const scale of scales) {
            try {
                const resized = await sharp(imagePath)
                    .resize(scale, scale, { fit: 'inside' })
                    .raw()
                    .toBuffer({ resolveWithObject: true });
                
                const stats = await sharp(imagePath)
                    .resize(scale, scale, { fit: 'inside' })
                    .stats();
                
                features.push({
                    scale,
                    stats,
                    variance: this.calculateVariance(stats),
                    entropy: this.calculateEntropy(stats)
                });
            } catch (error) {
                console.error(`尺度${scale}分析失败:`, error);
            }
        }
        
        return features;
    }

    /**
     * 颜色直方图分析
     */
    async analyzeColorHistogram(imagePath) {
        try {
            // 获取图像统计信息
            const stats = await sharp(imagePath).stats();
            
            // 计算颜色分布
            const colorDistribution = this.calculateColorDistribution(stats);
            
            // 计算颜色复杂度
            const colorComplexity = this.calculateColorComplexity(stats);
            
            return {
                distribution: colorDistribution,
                complexity: colorComplexity,
                dominantColors: this.extractDominantColors(stats),
                colorfulness: this.calculateAdvancedColorfulness(stats)
            };
        } catch (error) {
            console.error('颜色直方图分析失败:', error);
            return null;
        }
    }

    /**
     * 高级纹理分析
     */
    async advancedTextureAnalysis(imagePath) {
        try {
            // 应用不同的滤波器来分析纹理
            const sobel = await sharp(imagePath)
                .greyscale()
                .convolve({
                    width: 3,
                    height: 3,
                    kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1]
                })
                .stats();
            
            const laplacian = await sharp(imagePath)
                .greyscale()
                .convolve({
                    width: 3,
                    height: 3,
                    kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0]
                })
                .stats();
            
            return {
                sobelResponse: this.calculateFilterResponse(sobel),
                laplacianResponse: this.calculateFilterResponse(laplacian),
                textureEnergy: this.calculateTextureEnergy(sobel, laplacian),
                directionalVariance: this.calculateDirectionalVariance(sobel)
            };
        } catch (error) {
            console.error('纹理分析失败:', error);
            return null;
        }
    }

    /**
     * 边缘检测分析
     */
    async edgeDetection(imagePath) {
        try {
            // 使用边缘检测算子
            const edges = await sharp(imagePath)
                .greyscale()
                .convolve({
                    width: 3,
                    height: 3,
                    kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
                })
                .stats();
            
            return {
                edgeStrength: this.calculateEdgeStrength(edges),
                edgeDensity: this.calculateEdgeDensity(edges),
                edgeDirection: this.calculateEdgeDirection(edges)
            };
        } catch (error) {
            console.error('边缘检测失败:', error);
            return null;
        }
    }

    /**
     * 智能物体检测
     */
    intelligentObjectDetection(features) {
        const detections = [];
        
        // 人物检测 - 基于更精确的特征
        const personScore = this.detectPersonAdvanced(features);
        if (personScore > 0.5) {
            detections.push({
                object: 'person',
                chinese_name: '人物',
                category: 'person',
                confidence: personScore,
                features: ['肤色特征', '纵向构图', '中等复杂度']
            });
        }
        
        // 车辆检测 - 基于几何特征
        const vehicleScore = this.detectVehicleAdvanced(features);
        if (vehicleScore > 0.5) {
            detections.push({
                object: 'vehicle',
                chinese_name: '车辆',
                category: 'vehicle',
                confidence: vehicleScore,
                features: ['几何形状', '金属质感', '水平构图']
            });
        }
        
        // 建筑检测
        const buildingScore = this.detectBuildingAdvanced(features);
        if (buildingScore > 0.5) {
            detections.push({
                object: 'building',
                chinese_name: '建筑',
                category: 'building',
                confidence: buildingScore,
                features: ['垂直结构', '几何规整', '大尺度']
            });
        }
        
        // 自然景观检测
        const natureScore = this.detectNatureAdvanced(features);
        if (natureScore > 0.5) {
            detections.push({
                object: 'nature',
                chinese_name: '自然景观',
                category: 'nature',
                confidence: natureScore,
                features: ['有机形状', '自然色彩', '纹理丰富']
            });
        }
        
        // 动物检测
        const animalScore = this.detectAnimalAdvanced(features);
        if (animalScore > 0.5) {
            detections.push({
                object: 'animal',
                chinese_name: '动物',
                category: 'animal',
                confidence: animalScore,
                features: ['毛发纹理', '有机形状', '中等尺度']
            });
        }
        
        // 食物检测
        const foodScore = this.detectFoodAdvanced(features);
        if (foodScore > 0.5) {
            detections.push({
                object: 'food',
                chinese_name: '食物',
                category: 'food',
                confidence: foodScore,
                features: ['暖色调', '近距拍摄', '丰富色彩']
            });
        }
        
        // 排序并选择主要物体
        const sortedDetections = detections.sort((a, b) => b.confidence - a.confidence);
        const primaryObjects = sortedDetections.slice(0, 3);
        
        // 计算置信度统计
        const confidences = detections.map(d => d.confidence);
        const confidenceSummary = {
            max_confidence: confidences.length > 0 ? Math.max(...confidences) : 0,
            avg_confidence: confidences.length > 0 ? confidences.reduce((a, b) => a + b) / confidences.length : 0,
            high_confidence: confidences.filter(c => c > 0.7).length,
            medium_confidence: confidences.filter(c => c >= 0.5 && c <= 0.7).length,
            low_confidence: confidences.filter(c => c < 0.5).length
        };
        
        // 生成描述
        const description = this.generateAdvancedDescription(primaryObjects);
        
        return {
            objects: detections,
            primaryObjects,
            confidenceSummary,
            description
        };
    }

    /**
     * 智能物体检测（增强版）
     */
    async detectObjects(imagePath) {
        try {
            const { basicInfo, colorInfo } = await this.getAnalysisData(imagePath);
            
            // 获取图像的详细特征
            const imageFeatures = await this.extractImageFeatures(imagePath);
            
            // 尝试使用高级分析
            console.log('开始高级AI物体识别...');
            const advancedResult = await this.performAdvancedAnalysis(imagePath);
            
            let detectedObjects = [];
            let confidence = {};
            let aiObjects = [];
            
            // 如果高级分析成功，优先使用高级结果
            if (advancedResult && advancedResult.success && advancedResult.objects && advancedResult.objects.length > 0) {
                console.log('高级AI识别成功，检测到', advancedResult.objects.length, '个物体');
                
                // 将高级AI结果转换为我们的格式
                for (const aiObj of advancedResult.primary_objects.slice(0, 5)) { // 取前5个最可能的
                    if (aiObj.confidence > 0.5) { // 置信度阈值
                        const category = aiObj.category;
                        if (category && !detectedObjects.includes(category)) {
                            detectedObjects.push(category);
                            confidence[category] = Math.min(aiObj.confidence, 1.0);
                            aiObjects.push({
                                name: aiObj.chinese_name,
                                category: category,
                                confidence: aiObj.confidence,
                                features: aiObj.features || [],
                                source: '高级AI'
                            });
                        }
                    }
                }
            }
            
            // 如果高级AI没有结果，或者结果置信度较低，使用传统方法作为补充
            const traditionalResults = await this.detectObjectsTraditional(basicInfo, colorInfo, imageFeatures);
            
            // 合并结果
            for (const [objectType, score] of Object.entries(traditionalResults.confidence)) {
                if (score > 0.3 && !detectedObjects.includes(objectType)) {
                    detectedObjects.push(objectType);
                    confidence[objectType] = Math.min(score * 0.8, 0.9); // 传统方法的结果置信度稍低
                }
            }
            
            // 生成物体描述
            const objects = this.generateObjectDescriptions(detectedObjects, confidence);
            
            // 添加高级AI识别的详细信息
            if (aiObjects.length > 0) {
                objects.forEach(obj => {
                    const aiMatch = aiObjects.find(ai => ai.category === obj.object);
                    if (aiMatch) {
                        obj.aiDetails = {
                            specificName: aiMatch.name,
                            aiConfidence: aiMatch.confidence,
                            features: aiMatch.features,
                            source: '高级AI深度分析'
                        };
                    }
                });
            }
            
            return {
                detectedObjects,
                confidence,
                objectDescriptions: objects,
                primaryObject: this.getPrimaryObject(detectedObjects, confidence),
                objectCount: detectedObjects.length,
                aiAnalysis: advancedResult ? {
                    success: true,
                    totalDetections: advancedResult.total_detections || 0,
                    maxConfidence: advancedResult.confidence_summary?.max_confidence || 0,
                    avgConfidence: advancedResult.confidence_summary?.avg_confidence || 0,
                    aiDescription: advancedResult.ai_description || ''
                } : null
            };
        } catch (error) {
            console.error('增强物体检测失败:', error);
            // 如果失败，回退到传统方法
            const { basicInfo, colorInfo } = await this.getAnalysisData(imagePath);
            const imageFeatures = await this.extractImageFeatures(imagePath);
            return await this.detectObjectsTraditional(basicInfo, colorInfo, imageFeatures);
        }
    }

    /**
     * 将AI类别映射到本地类别
     */
    mapAICategoryToLocal(aiCategory) {
        const mapping = {
            'person': 'person',
            'vehicle': 'vehicle',
            'animal': 'animal',
            'building': 'building',
            'nature': 'nature',
            'food': 'food',
            'technology': 'text', // 科技产品暂时映射到文本类别
            'furniture': 'building', // 家具暂时映射到建筑类别
            'other': null
        };
        
        return mapping[aiCategory] || null;
    }

    /**
     * 传统物体检测方法（作为备用）
     */
    async detectObjectsTraditional(basicInfo, colorInfo, imageFeatures) {
        const detectedObjects = [];
        const confidence = {};
        
        // 遍历所有物体模式进行匹配
        for (const [objectType, pattern] of Object.entries(this.objectPatterns)) {
            const score = this.calculateObjectScore(basicInfo, colorInfo, imageFeatures, pattern);
            
            if (score > 0.3) { // 置信度阈值
                detectedObjects.push(objectType);
                confidence[objectType] = Math.min(score, 1.0);
            }
        }
        
        // 根据检测结果生成描述
        const objects = this.generateObjectDescriptions(detectedObjects, confidence);
        
        return {
            detectedObjects,
            confidence,
            objectDescriptions: objects,
            primaryObject: this.getPrimaryObject(detectedObjects, confidence),
            objectCount: detectedObjects.length
        };
    }

    /**
     * 提取图像特征
     */
    async extractImageFeatures(imagePath) {
        try {
            const metadata = await sharp(imagePath).metadata();
            const stats = await sharp(imagePath).stats();
            
            // 分析图像纹理和结构特征
            const features = {
                hasHighFrequency: this.detectHighFrequency(stats),
                hasVerticalStructures: this.detectVerticalStructures(metadata),
                hasHorizontalStructures: this.detectHorizontalStructures(metadata),
                hasCircularShapes: this.detectCircularShapes(stats),
                hasOrganicShapes: this.detectOrganicShapes(stats),
                edgeComplexity: this.calculateEdgeComplexity(stats),
                colorVariation: this.calculateColorVariation(stats),
                symmetry: this.detectSymmetry(metadata),
                textureType: this.classifyTexture(stats)
            };
            
            return features;
        } catch (error) {
            console.error('特征提取失败:', error);
            return {
                hasHighFrequency: false,
                hasVerticalStructures: false,
                hasHorizontalStructures: false,
                hasCircularShapes: false,
                hasOrganicShapes: false,
                edgeComplexity: 0,
                colorVariation: 0,
                symmetry: 0,
                textureType: 'unknown'
            };
        }
    }

    /**
     * 计算物体识别得分
     */
    calculateObjectScore(basicInfo, colorInfo, features, pattern) {
        let score = 0;
        let penalties = 0;
        
        // 首先检查排除特征 - 如果有排除特征存在，大幅降低得分
        if (pattern.excludeFeatures) {
            for (const excludeFeature of pattern.excludeFeatures) {
                if (this.hasFeature(basicInfo, colorInfo, features, excludeFeature)) {
                    penalties += 0.4; // 每个排除特征扣0.4分
                }
            }
        }
        
        // 检查必需特征 - 必需特征必须存在
        if (pattern.requiredFeatures) {
            let requiredCount = 0;
            for (const requiredFeature of pattern.requiredFeatures) {
                if (this.hasFeature(basicInfo, colorInfo, features, requiredFeature)) {
                    requiredCount++;
                    score += 0.3; // 每个必需特征加0.3分
                }
            }
            // 如果必需特征不足一半，直接返回0
            if (requiredCount < pattern.requiredFeatures.length / 2) {
                return 0;
            }
        }
        
        // 宽高比匹配 - 更严格
        if (pattern.aspectRatios) {
            const ratio = basicInfo.aspectRatio;
            const inRange = ratio >= pattern.aspectRatios[0] && ratio <= pattern.aspectRatios[1];
            if (inRange) {
                score += 0.25;
            } else {
                // 如果宽高比完全不匹配，大幅扣分
                const deviation = Math.min(
                    Math.abs(ratio - pattern.aspectRatios[0]),
                    Math.abs(ratio - pattern.aspectRatios[1])
                ) / Math.max(pattern.aspectRatios[0], pattern.aspectRatios[1]);
                if (deviation > 0.5) {
                    penalties += 0.3;
                }
            }
        }
        
        // 颜色模式匹配 - 改进的颜色匹配
        if (pattern.colorPatterns) {
            const colorScore = this.matchColorPatterns(colorInfo, pattern.colorPatterns);
            score += colorScore;
        }
        
        // 尺寸匹配
        if (pattern.sizeThresholds) {
            const size = basicInfo.megapixels;
            if (size >= pattern.sizeThresholds.min && size <= pattern.sizeThresholds.max) {
                score += 0.15;
            } else {
                // 尺寸不匹配扣分
                penalties += 0.2;
            }
        }
        
        // 应用惩罚
        score = Math.max(0, score - penalties);
        
        return Math.min(score, 1.0);
    }

    /**
     * 检查特征是否存在
     */
    hasFeature(basicInfo, colorInfo, features, featureName) {
        switch (featureName) {
            // 有机形状特征
            case 'organic_shapes':
                return features.hasOrganicShapes && features.edgeComplexity > 0.3;
            
            // 几何形状特征
            case 'geometric_shapes':
                return features.hasVerticalStructures || features.hasHorizontalStructures || features.symmetry > 0.6;
            
            // 金属质感
            case 'high_metallic':
                return ['gray', 'white', 'black'].includes(colorInfo.dominantColor) && 
                       colorInfo.brightness === 'bright' && colorInfo.contrast === 'high';
            
            // 几何主导
            case 'geometric_dominant':
                return features.symmetry > 0.7 && features.edgeComplexity > 0.6;
            
            // 水平主导
            case 'horizontal_dominant':
                return basicInfo.aspectRatio > 1.5 && features.hasHorizontalStructures;
            
            // 垂直结构
            case 'vertical_structures':
                return features.hasVerticalStructures && basicInfo.aspectRatio < 1.5;
            
            // 有机纹理
            case 'organic_texture':
                return features.textureType === 'organic' && features.colorVariation > 0.3;
            
            // 肤色调
            case 'skin_tones':
                return ['pink', 'brown', 'yellow'].includes(colorInfo.dominantColor) && 
                       colorInfo.brightness !== 'dark';
            
            // 自然色彩
            case 'natural_colors':
                return ['green', 'blue', 'brown'].includes(colorInfo.dominantColor) &&
                       colorInfo.colorfulness === 'high';
            
            // 人工照明
            case 'artificial_lighting':
                return colorInfo.brightness === 'bright' && colorInfo.contrast === 'high';
            
            // 毛发纹理
            case 'fur_texture':
                return features.textureType === 'organic' && 
                       ['brown', 'gray', 'black', 'white'].includes(colorInfo.dominantColor);
            
            // 金属色彩
            case 'metallic_colors':
                return ['gray', 'white', 'black'].includes(colorInfo.dominantColor) &&
                       colorInfo.contrast === 'high';
            
            // 近景拍摄
            case 'close_up':
                return basicInfo.megapixels < 3 && colorInfo.brightness !== 'dark';
            
            // 丰富色彩
            case 'rich_colors':
                return colorInfo.colorfulness === 'high';
            
            // 大尺度
            case 'large_scale':
                return basicInfo.megapixels > 5;
            
            // 高对比度
            case 'high_contrast':
                return colorInfo.contrast === 'high';
            
            // 结构化布局
            case 'structured_layout':
                return features.symmetry > 0.5 && features.edgeComplexity > 0.4;
            
            // 中等复杂度
            case 'medium_complexity':
                return features.edgeComplexity > 0.3 && features.edgeComplexity < 0.7;
            
            // 小尺度
            case 'small_scale':
                return basicInfo.megapixels < 1;
            
            default:
                return false;
        }
    }

    /**
     * 颜色模式匹配
     */
    matchColorPatterns(colorInfo, patterns) {
        let score = 0;
        const { dominantColor, brightness, colorfulness } = colorInfo;
        
        for (const pattern of patterns) {
            switch (pattern) {
                case 'skin':
                case 'flesh':
                    if (['pink', 'brown', 'yellow'].includes(dominantColor) && brightness !== 'dark') {
                        score += 0.3;
                    }
                    break;
                case 'metallic':
                    if (['gray', 'white', 'black'].includes(dominantColor) && brightness === 'bright') {
                        score += 0.2;
                    }
                    break;
                case 'fur':
                    if (['brown', 'gray', 'black', 'white'].includes(dominantColor)) {
                        score += 0.2;
                    }
                    break;
                case 'colorful':
                    if (colorfulness === 'high') {
                        score += 0.2;
                    }
                    break;
                case 'highContrast':
                    if (colorInfo.contrast === 'high') {
                        score += 0.2;
                    }
                    break;
                default:
                    if (dominantColor === pattern) {
                        score += 0.2;
                    }
            }
        }
        
        return Math.min(score, 0.4);
    }

    /**
     * 形状特征匹配
     */
    matchShapeHints(features, hints) {
        let score = 0;
        
        for (const hint of hints) {
            switch (hint) {
                case 'rectangular':
                case 'geometric':
                    if (features.hasVerticalStructures && features.hasHorizontalStructures) {
                        score += 0.2;
                    }
                    break;
                case 'circular':
                    if (features.hasCircularShapes) {
                        score += 0.2;
                    }
                    break;
                case 'organic':
                    if (features.hasOrganicShapes) {
                        score += 0.2;
                    }
                    break;
            }
        }
        
        return Math.min(score, 0.3);
    }

    /**
     * 结构特征匹配
     */
    matchStructuralHints(features, hints) {
        let score = 0;
        
        for (const hint of hints) {
            switch (hint) {
                case 'vertical':
                    if (features.hasVerticalStructures) {
                        score += 0.15;
                    }
                    break;
                case 'geometric':
                    if (features.symmetry > 0.5) {
                        score += 0.15;
                    }
                    break;
                case 'structured':
                    if (features.edgeComplexity > 0.6) {
                        score += 0.15;
                    }
                    break;
            }
        }
        
        return Math.min(score, 0.2);
    }

    /**
     * 纹理特征匹配
     */
    matchTextureHints(features, hints) {
        let score = 0;
        
        for (const hint of hints) {
            switch (hint) {
                case 'organic':
                case 'natural':
                    if (features.textureType === 'organic') {
                        score += 0.15;
                    }
                    break;
                case 'uniform':
                case 'structured':
                    if (features.textureType === 'uniform') {
                        score += 0.15;
                    }
                    break;
            }
        }
        
        return Math.min(score, 0.2);
    }

    /**
     * 上下文特征匹配
     */
    matchContextHints(basicInfo, colorInfo, hints) {
        let score = 0;
        
        for (const hint of hints) {
            switch (hint) {
                case 'indoor':
                    if (colorInfo.brightness !== 'bright') {
                        score += 0.1;
                    }
                    break;
                case 'close':
                    if (basicInfo.megapixels < 5) {
                        score += 0.1;
                    }
                    break;
            }
        }
        
        return Math.min(score, 0.2);
    }

    // 图像特征检测辅助方法
    detectHighFrequency(stats) {
        if (!stats.channels) return false;
        const avgStd = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
        return avgStd > 50;
    }

    detectVerticalStructures(metadata) {
        return metadata.height > metadata.width * 1.2;
    }

    detectHorizontalStructures(metadata) {
        return metadata.width > metadata.height * 1.2;
    }

    detectCircularShapes(stats) {
        // 简化的圆形检测逻辑
        return stats.channels && stats.channels.length >= 3;
    }

    detectOrganicShapes(stats) {
        if (!stats.channels) return false;
        const colorVariance = this.calculateColorVariation(stats);
        return colorVariance > 0.3;
    }

    calculateEdgeComplexity(stats) {
        if (!stats.channels) return 0;
        const avgStd = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
        return Math.min(avgStd / 100, 1);
    }

    calculateColorVariation(stats) {
        if (!stats.channels || stats.channels.length < 3) return 0;
        const means = stats.channels.map(ch => ch.mean);
        const variance = means.reduce((sum, mean) => {
            const diff = mean - (means.reduce((a, b) => a + b) / means.length);
            return sum + diff * diff;
        }, 0) / means.length;
        return Math.min(variance / 10000, 1);
    }

    detectSymmetry(metadata) {
        // 简化的对称性检测
        const ratio = metadata.width / metadata.height;
        return Math.abs(ratio - 1) < 0.1 ? 0.8 : 0.3;
    }

    classifyTexture(stats) {
        if (!stats.channels) return 'unknown';
        const avgStd = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
        
        if (avgStd < 20) return 'uniform';
        if (avgStd > 60) return 'complex';
        return 'organic';
    }

    // 高级检测算法辅助方法
    calculateVariance(stats) {
        if (!stats.channels) return 0;
        return stats.channels.reduce((sum, ch) => sum + Math.pow(ch.stdev, 2), 0) / stats.channels.length;
    }

    calculateEntropy(stats) {
        if (!stats.channels) return 0;
        // 简化的熵计算
        const variance = this.calculateVariance(stats);
        return Math.log2(1 + variance);
    }

    calculateColorDistribution(stats) {
        if (!stats.channels || stats.channels.length < 3) return {};
        const [r, g, b] = stats.channels.slice(0, 3);
        return {
            redDominance: r.mean / (r.mean + g.mean + b.mean),
            greenDominance: g.mean / (r.mean + g.mean + b.mean),
            blueDominance: b.mean / (r.mean + g.mean + b.mean),
            colorBalance: Math.abs(r.mean - g.mean) + Math.abs(g.mean - b.mean) + Math.abs(b.mean - r.mean)
        };
    }

    calculateColorComplexity(stats) {
        if (!stats.channels) return 0;
        const variations = stats.channels.map(ch => ch.stdev);
        return variations.reduce((sum, v) => sum + v, 0) / variations.length;
    }

    extractDominantColors(stats) {
        if (!stats.channels || stats.channels.length < 3) return [];
        const [r, g, b] = stats.channels.slice(0, 3);
        const colors = [];
        
        if (r.mean > g.mean && r.mean > b.mean) colors.push('red');
        if (g.mean > r.mean && g.mean > b.mean) colors.push('green');
        if (b.mean > r.mean && b.mean > g.mean) colors.push('blue');
        
        return colors;
    }

    calculateAdvancedColorfulness(stats) {
        if (!stats.channels || stats.channels.length < 3) return 0;
        const [r, g, b] = stats.channels.slice(0, 3);
        const rg = r.mean - g.mean;
        const yb = (r.mean + g.mean) / 2 - b.mean;
        return Math.sqrt(rg * rg + yb * yb);
    }

    calculateFilterResponse(stats) {
        if (!stats.channels) return 0;
        return stats.channels[0].mean;
    }

    calculateTextureEnergy(sobel, laplacian) {
        const sobelEnergy = sobel.channels ? sobel.channels[0].stdev : 0;
        const laplacianEnergy = laplacian.channels ? laplacian.channels[0].stdev : 0;
        return Math.sqrt(sobelEnergy * sobelEnergy + laplacianEnergy * laplacianEnergy);
    }

    calculateDirectionalVariance(stats) {
        if (!stats.channels) return 0;
        return stats.channels[0].stdev;
    }

    calculateEdgeStrength(stats) {
        if (!stats.channels) return 0;
        return stats.channels[0].mean;
    }

    calculateEdgeDensity(stats) {
        if (!stats.channels) return 0;
        return stats.channels[0].stdev / 255;
    }

    calculateEdgeDirection(stats) {
        if (!stats.channels) return 'unknown';
        const strength = stats.channels[0].mean;
        if (strength > 100) return 'strong';
        if (strength > 50) return 'medium';
        return 'weak';
    }

    // 高级物体检测方法
    detectPersonAdvanced(features) {
        let score = 0;
        
        // 检查颜色分布（肤色特征）
        if (features.colorHist && features.colorHist.distribution) {
            const dist = features.colorHist.distribution;
            if (dist.redDominance > 0.3 && dist.redDominance < 0.6) {
                score += 0.3;
            }
        }
        
        // 检查宽高比（人像特征）
        if (features.metadata) {
            const aspectRatio = features.metadata.width / features.metadata.height;
            if (aspectRatio > 0.6 && aspectRatio < 1.0) {
                score += 0.25;
            }
        }
        
        // 检查纹理复杂度（中等复杂度）
        if (features.texture && features.texture.textureEnergy) {
            if (features.texture.textureEnergy > 20 && features.texture.textureEnergy < 80) {
                score += 0.2;
            }
        }
        
        // 检查边缘特征
        if (features.edges && features.edges.edgeStrength) {
            if (features.edges.edgeStrength > 30 && features.edges.edgeStrength < 100) {
                score += 0.15;
            }
        }
        
        // 多尺度一致性
        if (features.multiScale && features.multiScale.length > 0) {
            const consistency = this.calculateMultiScaleConsistency(features.multiScale);
            if (consistency > 0.6) {
                score += 0.1;
            }
        }
        
        return Math.min(score, 1.0);
    }

    detectVehicleAdvanced(features) {
        let score = 0;
        
        // 检查几何特征
        if (features.metadata) {
            const aspectRatio = features.metadata.width / features.metadata.height;
            if (aspectRatio > 1.5 && aspectRatio < 3.5) {
                score += 0.3;
            }
        }
        
        // 检查金属色彩特征
        if (features.colorHist && features.colorHist.distribution) {
            const dist = features.colorHist.distribution;
            if (dist.colorBalance < 50) { // 色彩相对单调
                score += 0.25;
            }
        }
        
        // 检查边缘密度（几何形状有较强边缘）
        if (features.edges && features.edges.edgeDensity) {
            if (features.edges.edgeDensity > 0.3) {
                score += 0.2;
            }
        }
        
        // 检查方向性特征
        if (features.texture && features.texture.directionalVariance) {
            if (features.texture.directionalVariance > 40) {
                score += 0.15;
            }
        }
        
        // 颜色复杂度检查（车辆通常颜色相对简单）
        if (features.colorHist && features.colorHist.complexity < 40) {
            score += 0.1;
        }
        
        return Math.min(score, 1.0);
    }

    detectBuildingAdvanced(features) {
        let score = 0;
        
        // 检查垂直结构
        if (features.metadata) {
            const aspectRatio = features.metadata.width / features.metadata.height;
            if (aspectRatio < 1.5) { // 更可能是建筑
                score += 0.2;
            }
        }
        
        // 检查几何规整性
        if (features.edges && features.edges.edgeStrength > 50) {
            score += 0.25;
        }
        
        // 检查纹理的方向性
        if (features.texture && features.texture.directionalVariance > 60) {
            score += 0.2;
        }
        
        // 检查多尺度特征一致性
        if (features.multiScale) {
            const largeScaleFeatures = features.multiScale.find(f => f.scale === 200);
            if (largeScaleFeatures && largeScaleFeatures.variance > 1000) {
                score += 0.2;
            }
        }
        
        // 检查颜色分布（建筑通常色彩相对单调）
        if (features.colorHist && features.colorHist.complexity < 35) {
            score += 0.15;
        }
        
        return Math.min(score, 1.0);
    }

    detectNatureAdvanced(features) {
        let score = 0;
        
        // 检查绿色主导
        if (features.colorHist && features.colorHist.distribution) {
            if (features.colorHist.distribution.greenDominance > 0.4) {
                score += 0.3;
            }
        }
        
        // 检查有机纹理特征
        if (features.texture && features.texture.textureEnergy) {
            if (features.texture.textureEnergy > 50) { // 自然场景纹理丰富
                score += 0.25;
            }
        }
        
        // 检查颜色复杂度（自然场景颜色丰富）
        if (features.colorHist && features.colorHist.complexity > 45) {
            score += 0.2;
        }
        
        // 检查边缘的有机性（边缘不规则）
        if (features.edges && features.edges.edgeDirection === 'medium') {
            score += 0.15;
        }
        
        // 多尺度纹理变化
        if (features.multiScale && features.multiScale.length > 0) {
            const textureVariation = this.calculateTextureVariation(features.multiScale);
            if (textureVariation > 0.5) {
                score += 0.1;
            }
        }
        
        return Math.min(score, 1.0);
    }

    detectAnimalAdvanced(features) {
        let score = 0;
        
        // 检查毛发/皮肤色彩
        if (features.colorHist && features.colorHist.distribution) {
            const dist = features.colorHist.distribution;
            if (dist.redDominance > 0.25 && dist.redDominance < 0.5) {
                score += 0.25;
            }
        }
        
        // 检查有机形状特征
        if (features.texture && features.texture.textureEnergy > 30 && features.texture.textureEnergy < 70) {
            score += 0.25;
        }
        
        // 检查尺寸特征
        if (features.metadata) {
            const megapixels = (features.metadata.width * features.metadata.height) / 1000000;
            if (megapixels > 0.5 && megapixels < 8) {
                score += 0.2;
            }
        }
        
        // 检查边缘特征（有机边缘）
        if (features.edges && features.edges.edgeDirection === 'medium') {
            score += 0.15;
        }
        
        // 颜色变化特征
        if (features.colorHist && features.colorHist.colorfulness > 30) {
            score += 0.15;
        }
        
        return Math.min(score, 1.0);
    }

    detectFoodAdvanced(features) {
        let score = 0;
        
        // 检查暖色调
        if (features.colorHist && features.colorHist.distribution) {
            const dist = features.colorHist.distribution;
            if (dist.redDominance > 0.3 || (dist.redDominance + dist.greenDominance) > 0.6) {
                score += 0.3;
            }
        }
        
        // 检查近距拍摄特征
        if (features.metadata) {
            const megapixels = (features.metadata.width * features.metadata.height) / 1000000;
            if (megapixels < 3) {
                score += 0.25;
            }
        }
        
        // 检查颜色丰富度
        if (features.colorHist && features.colorHist.colorfulness > 40) {
            score += 0.2;
        }
        
        // 检查纹理细节
        if (features.texture && features.texture.textureEnergy > 25 && features.texture.textureEnergy < 60) {
            score += 0.15;
        }
        
        // 检查边缘柔和度
        if (features.edges && features.edges.edgeDirection === 'weak') {
            score += 0.1;
        }
        
        return Math.min(score, 1.0);
    }

    // 辅助计算方法
    calculateMultiScaleConsistency(multiScaleFeatures) {
        if (multiScaleFeatures.length < 2) return 0;
        
        const variances = multiScaleFeatures.map(f => f.variance);
        const mean = variances.reduce((a, b) => a + b) / variances.length;
        const stdDev = Math.sqrt(variances.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / variances.length);
        
        return 1 - (stdDev / mean); // 一致性越高，标准差相对均值越小
    }

    calculateTextureVariation(multiScaleFeatures) {
        if (multiScaleFeatures.length < 2) return 0;
        
        const entropies = multiScaleFeatures.map(f => f.entropy);
        const maxEntropy = Math.max(...entropies);
        const minEntropy = Math.min(...entropies);
        
        return (maxEntropy - minEntropy) / maxEntropy;
    }

    generateAdvancedDescription(primaryObjects) {
        if (!primaryObjects || primaryObjects.length === 0) {
            return "高级AI分析未能识别出明确的物体特征";
        }
        
        const main = primaryObjects[0];
        let description = `高级AI分析识别出${main.chinese_name}`;
        
        // 添加置信度描述
        if (main.confidence > 0.8) {
            description += "（高置信度）";
        } else if (main.confidence > 0.6) {
            description += "（中等置信度）";
        } else {
            description += "（较低置信度）";
        }
        
        // 添加特征描述
        if (main.features && main.features.length > 0) {
            description += `，主要特征包括：${main.features.join('、')}`;
        }
        
        // 添加其他识别结果
        if (primaryObjects.length > 1) {
            const others = primaryObjects.slice(1, 3).map(obj => obj.chinese_name);
            description += `。同时还检测到可能的${others.join('、')}`;
        }
        
        return description + "。";
    }

    /**
     * 生成物体描述
     */
    generateObjectDescriptions(detectedObjects, confidence) {
        const descriptions = {
            person: '检测到人物',
            vehicle: '检测到车辆',
            building: '检测到建筑物',
            nature: '检测到自然景观',
            animal: '检测到动物',
            food: '检测到食物',
            text: '检测到文字内容'
        };
        
        return detectedObjects.map(obj => ({
            object: obj,
            description: descriptions[obj] || `检测到${obj}`,
            confidence: confidence[obj] || 0
        }));
    }

    /**
     * 获取主要物体
     */
    getPrimaryObject(detectedObjects, confidence) {
        if (detectedObjects.length === 0) return null;
        
        let maxConfidence = 0;
        let primaryObject = null;
        
        for (const obj of detectedObjects) {
            if (confidence[obj] > maxConfidence) {
                maxConfidence = confidence[obj];
                primaryObject = obj;
            }
        }
        
        return primaryObject;
    }

    /**
     * 生成图片描述
     */
    generateDescription(analysis) {
        const { basicInfo, colorInfo, contentAnalysis, objectDetection } = analysis;
        let description = '';

        // 如果有内容分析，使用高级描述
        if (contentAnalysis) {
            description = this.generateAdvancedDescription(basicInfo, colorInfo, contentAnalysis, objectDetection);
        } else {
            description = this.generateBasicDescription(basicInfo, colorInfo);
        }

        return description;
    }

    /**
     * 生成高级描述（包含内容分析）
     */
    generateAdvancedDescription(basicInfo, colorInfo, contentAnalysis, objectDetection) {
        let description = '';
        
        // 如果有AI分析结果，优先使用
        if (objectDetection && objectDetection.aiAnalysis && objectDetection.aiAnalysis.aiDescription) {
            description = objectDetection.aiAnalysis.aiDescription;
            
            // 移除结尾的句号，以便添加更多信息
            if (description.endsWith('。')) {
                description = description.slice(0, -1);
            }
            
            // 添加技术分析信息
            if (contentAnalysis) {
                const compositionDescriptions = {
                    'square_centered': '，采用正方形居中构图',
                    'panoramic_wide': '，使用全景式宽幅构图',
                    'vertical_portrait': '，运用垂直肖像构图',
                    'horizontal_landscape': '，采用水平风景构图',
                    'standard_composition': '，构图规整'
                };
                description += compositionDescriptions[contentAnalysis.composition] || '';

                // 光线和色彩描述
                const lightingDescriptions = {
                    'strong_directional': '，光线强烈且具有方向性',
                    'soft_diffused': '，光线柔和且均匀扩散',
                    'dramatic_shadow': '，明暗对比强烈',
                    'low_ambient': '，环境光线较暗',
                    'natural_balanced': '，光线自然平衡'
                };
                description += lightingDescriptions[contentAnalysis.lighting] || '';
                
                // 添加AI分析的置信度信息
                if (objectDetection.aiAnalysis.maxConfidence > 0.8) {
                    description += '（AI高置信度识别）';
                } else if (objectDetection.aiAnalysis.maxConfidence > 0.5) {
                    description += '（AI中等置信度识别）';
                }
            }
            
            return description;
        }
        
        // 如果检测到物体，优先描述物体
        if (objectDetection && objectDetection.detectedObjects.length > 0) {
            const primaryObj = objectDetection.primaryObject;
            const objDescriptions = {
                'person': '这是一张包含人物的照片',
                'vehicle': '这是一张包含车辆的图片',
                'building': '这是一张建筑摄影作品',
                'nature': '这是一张自然风景照片',
                'animal': '这是一张包含动物的图片',
                'food': '这是一张美食摄影作品',
                'text': '这是一张包含文字的文档图片'
            };
            
            description += objDescriptions[primaryObj] || '这是一张图片';
            
            // 检查是否有AI增强的具体识别结果
            const primaryObjDesc = objectDetection.objectDescriptions.find(obj => obj.object === primaryObj);
            if (primaryObjDesc && primaryObjDesc.aiDetails) {
                description += `（AI识别为：${primaryObjDesc.aiDetails.specificName}）`;
            }
            
            // 添加其他检测到的物体
            if (objectDetection.detectedObjects.length > 1) {
                const otherObjects = objectDetection.detectedObjects
                    .filter(obj => obj !== primaryObj)
                    .slice(0, 2); // 最多显示2个其他物体
                
                if (otherObjects.length > 0) {
                    const objNames = {
                        'person': '人物',
                        'vehicle': '车辆',
                        'building': '建筑',
                        'nature': '自然景观',
                        'animal': '动物',
                        'food': '食物',
                        'text': '文字'
                    };
                    
                    const others = otherObjects.map(obj => objNames[obj] || obj).join('和');
                    description += `，同时包含${others}`;
                }
            }
        } else if (contentAnalysis) {
            // 如果没有检测到明确物体，使用原有内容类型描述
            const contentDescriptions = {
                'portrait': '这是一张人像照片',
                'landscape': '这是一张风景照片',
                'architecture': '这是一张建筑摄影作品',
                'text_document': '这是一份文档图片',
                'photography': '这是一张摄影作品',
                'general': '这是一张图片'
            };
            
            description += contentDescriptions[contentAnalysis.contentType] || '这是一张图片';
        } else {
            description = '这是一张图片';
        }
        
        // 添加场景描述等其他信息
        if (contentAnalysis) {
            const sceneDescriptions = {
                'sky_outdoor': '，拍摄于户外天空场景',
                'nature_outdoor': '，展现了自然户外环境',
                'indoor_night': '，拍摄于室内夜晚环境',
                'panoramic_landscape': '，呈现全景式的广阔视野',
                'portrait_close': '，采用近距离人像构图',
                'general_scene': '，场景构图合理'
            };

            description += sceneDescriptions[contentAnalysis.scene] || '';

            // 构图描述
            const compositionDescriptions = {
                'square_centered': '，采用正方形居中构图',
                'panoramic_wide': '，使用全景式宽幅构图',
                'vertical_portrait': '，运用垂直肖像构图',
                'horizontal_landscape': '，采用水平风景构图',
                'standard_composition': '，构图规整'
            };
            description += compositionDescriptions[contentAnalysis.composition] || '';

            // 光线和色彩描述
            const lightingDescriptions = {
                'strong_directional': '，光线强烈且具有方向性',
                'soft_diffused': '，光线柔和且均匀扩散',
                'dramatic_shadow': '，明暗对比强烈，阴影效果戏剧化',
                'low_ambient': '，环境光线较暗',
                'natural_balanced': '，光线自然平衡'
            };
            description += lightingDescriptions[contentAnalysis.lighting] || '';

            // 情绪和色调
            const moodDescriptions = {
                'energetic': '，整体氛围充满活力',
                'warm': '，散发温暖舒适的感觉',
                'calm': '，给人宁静平和的感受',
                'melancholic': '，透露出忧郁深沉的情调',
                'peaceful': '，营造出平静祥和的氛围',
                'mysterious': '，带有神秘莫测的色彩',
                'dramatic': '，具有强烈的戏剧性效果',
                'vibrant': '，色彩鲜艳生动',
                'neutral': '，色调中性平衡'
            };
            description += moodDescriptions[contentAnalysis.mood] || '';

            // 技术质量
            const qualityDescriptions = {
                'excellent': '，图片质量极佳',
                'good': '，图片质量良好',
                'fair': '，图片质量中等',
                'basic': '，图片质量基础'
            };
            description += qualityDescriptions[contentAnalysis.quality] || '';

            // 添加技术细节
            if (contentAnalysis.technicalDetails && contentAnalysis.technicalDetails.length > 0) {
                description += '，' + contentAnalysis.technicalDetails.join('，');
            }
        }

        return description + '。';
    }

    /**
     * 生成基础描述（向后兼容）
     */
    generateBasicDescription(basicInfo, colorInfo) {
        let description = '';

        // 尺寸描述
        const sizeCategory = this.getSizeCategory(basicInfo.width, basicInfo.height);
        description += this.sizeDescriptions[sizeCategory] || '图片';

        // 比例描述
        const aspectCategory = this.getAspectCategory(basicInfo.aspectRatio);
        description += '，' + (this.aspectRatioDescriptions[aspectCategory] || '');

        // 颜色描述
        if (colorInfo.dominantColor && this.colorDescriptions[colorInfo.dominantColor]) {
            description += '，以' + this.colorDescriptions[colorInfo.dominantColor] + '为主';
        }

        // 亮度描述
        switch (colorInfo.brightness) {
            case 'bright':
                description += '，画面明亮';
                break;
            case 'dark':
                description += '，画面较暗';
                break;
            default:
                description += '，光线适中';
        }

        // 对比度描述
        switch (colorInfo.contrast) {
            case 'high':
                description += '，对比鲜明';
                break;
            case 'low':
                description += '，色调柔和';
                break;
        }

        // 色彩丰富度描述
        switch (colorInfo.colorfulness) {
            case 'high':
                description += '，色彩丰富';
                break;
            case 'low':
                description += '，色彩简洁';
                break;
        }

        // 技术信息
        if (basicInfo.megapixels > 5) {
            description += '，高像素图片';
        }

        return description + '。';
    }

    /**
     * 生成标签
     */
    generateTags(analysis) {
        const { basicInfo, colorInfo, contentAnalysis, objectDetection } = analysis;
        const tags = [];

        // 格式标签
        tags.push(basicInfo.format.toUpperCase());

        // 尺寸标签
        const sizeCategory = this.getSizeCategory(basicInfo.width, basicInfo.height);
        tags.push(sizeCategory);

        // 比例标签
        const aspectCategory = this.getAspectCategory(basicInfo.aspectRatio);
        tags.push(aspectCategory);

        // 颜色标签
        if (colorInfo.dominantColor) {
            tags.push(colorInfo.dominantColor);
        }

        // 质量标签
        tags.push(colorInfo.brightness);
        tags.push(colorInfo.contrast + '-contrast');
        tags.push(colorInfo.colorfulness + '-colorful');

        // 物体检测标签
        if (objectDetection && objectDetection.detectedObjects.length > 0) {
            // 添加检测到的物体标签
            objectDetection.detectedObjects.forEach(obj => {
                tags.push(obj);
                
                // 添加置信度标签
                const confidence = objectDetection.confidence[obj];
                if (confidence > 0.7) {
                    tags.push(`high-confidence-${obj}`);
                } else if (confidence > 0.5) {
                    tags.push(`medium-confidence-${obj}`);
                }
            });
            
            // 添加主要物体标签
            if (objectDetection.primaryObject) {
                tags.push(`primary-${objectDetection.primaryObject}`);
            }
            
            // 添加物体数量标签
            if (objectDetection.objectCount > 1) {
                tags.push('multiple-objects');
            } else if (objectDetection.objectCount === 1) {
                tags.push('single-object');
            }
        }

        // 像素标签
        if (basicInfo.megapixels > 10) {
            tags.push('high-resolution');
        } else if (basicInfo.megapixels < 1) {
            tags.push('low-resolution');
        }

        // 透明度标签
        if (basicInfo.hasAlpha) {
            tags.push('transparent');
        }

        // 内容分析标签
        if (contentAnalysis) {
            tags.push(contentAnalysis.contentType);
            tags.push(contentAnalysis.scene);
            tags.push(contentAnalysis.composition);
            tags.push(contentAnalysis.lighting);
            tags.push(contentAnalysis.mood);
            tags.push(contentAnalysis.quality + '-quality');
            
            // 添加技术标签
            if (contentAnalysis.technicalDetails) {
                contentAnalysis.technicalDetails.forEach(detail => {
                    if (detail.includes('高分辨率')) tags.push('professional');
                    if (detail.includes('透明通道')) tags.push('alpha-channel');
                    if (detail.includes('无损')) tags.push('lossless');
                    if (detail.includes('打印')) tags.push('print-ready');
                });
            }
        }

        return tags;
    }

    /**
     * 获取尺寸分类
     */
    getSizeCategory(width, height) {
        const area = width * height;
        if (area < 100000) return 'small';      // < 0.1MP
        if (area < 2000000) return 'medium';    // < 2MP
        if (area < 8000000) return 'large';     // < 8MP
        return 'huge';                          // >= 8MP
    }

    /**
     * 获取比例分类
     */
    getAspectCategory(ratio) {
        if (Math.abs(ratio - 1) < 0.1) return 'square';
        if (ratio > 2) return 'panoramic';
        if (ratio > 1.2) return 'landscape';
        return 'portrait';
    }

    /**
     * 批量分析图片
     */
    async analyzeMultipleImages(imagePaths) {
        const results = [];
        for (const imagePath of imagePaths) {
            try {
                const analysis = await this.analyzeImage(imagePath);
                results.push({
                    path: imagePath,
                    analysis
                });
            } catch (error) {
                results.push({
                    path: imagePath,
                    error: error.message
                });
            }
        }
        return results;
    }
}

module.exports = ImageAnalyzer;
