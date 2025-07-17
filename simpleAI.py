#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化版AI图像识别模块
使用传统计算机视觉技术进行物体检测和分类
"""

import sys
import json
import os
from PIL import Image, ImageStat, ImageFilter
import colorsys

class SimpleImageAI:
    def __init__(self):
        """初始化AI模型"""
        # 基于颜色和形状的简单识别规则
        self.detection_rules = {
            'person': {
                'colors': ['pink', 'brown', 'beige', 'flesh'],
                'aspect_ratios': [(0.6, 1.0)],  # 人像比例
                'size_range': (0.3, 8),  # 相对大小
                'complexity': 'medium',
                'description': '人物'
            },
            'vehicle': {
                'colors': ['gray', 'black', 'white', 'red', 'blue'],
                'aspect_ratios': [(1.5, 3.5)],  # 车辆比例
                'size_range': (0.2, 15),
                'complexity': 'geometric',
                'description': '车辆'
            },
            'animal': {
                'colors': ['brown', 'black', 'white', 'gray', 'orange'],
                'aspect_ratios': [(0.8, 2.5)],
                'size_range': (0.1, 8),
                'complexity': 'organic',
                'description': '动物'
            },
            'nature': {
                'colors': ['green', 'blue', 'brown'],
                'aspect_ratios': [(1.0, 3.0)],
                'size_range': (0.5, 50),
                'complexity': 'organic',
                'description': '自然景观'
            },
            'building': {
                'colors': ['gray', 'white', 'brown', 'red'],
                'aspect_ratios': [(0.4, 2.0)],
                'size_range': (1.0, 50),
                'complexity': 'geometric',
                'description': '建筑物'
            },
            'food': {
                'colors': ['red', 'yellow', 'orange', 'brown', 'white'],
                'aspect_ratios': [(0.7, 1.8)],
                'size_range': (0.05, 3),
                'complexity': 'medium',
                'description': '食物'
            }
        }

    def analyze_image_content(self, image_path):
        """分析图像内容"""
        try:
            if not os.path.exists(image_path):
                return {
                    'success': False,
                    'message': f'图像文件不存在: {image_path}',
                    'objects': [],
                    'categories': {},
                    'primary_objects': [],
                    'confidence_summary': {}
                }

            # 打开并分析图像
            with Image.open(image_path) as img:
                # 转换为RGB
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # 获取图像基本信息
                width, height = img.size
                aspect_ratio = width / height
                megapixels = (width * height) / 1000000
                
                # 分析颜色
                color_analysis = self.analyze_colors(img)
                
                # 分析复杂度
                complexity = self.analyze_complexity(img)
                
                # 检测物体
                detections = self.detect_objects(aspect_ratio, megapixels, color_analysis, complexity)
                
                # 生成结果
                if detections:
                    primary_objects = sorted(detections, key=lambda x: x['confidence'], reverse=True)[:3]
                    
                    # 按类别分组
                    categories = {}
                    for detection in detections:
                        category = detection['category']
                        if category not in categories:
                            categories[category] = []
                        categories[category].append(detection)
                    
                    # 置信度统计
                    confidences = [d['confidence'] for d in detections]
                    confidence_summary = {
                        'high_confidence': len([c for c in confidences if c > 0.7]),
                        'medium_confidence': len([c for c in confidences if 0.4 <= c <= 0.7]),
                        'low_confidence': len([c for c in confidences if c < 0.4]),
                        'max_confidence': max(confidences),
                        'avg_confidence': sum(confidences) / len(confidences)
                    }
                    
                    # 生成描述
                    ai_description = self.generate_description(primary_objects, categories)
                    
                    return {
                        'success': True,
                        'objects': detections,
                        'categories': categories,
                        'primary_objects': primary_objects,
                        'confidence_summary': confidence_summary,
                        'total_detections': len(detections),
                        'ai_description': ai_description
                    }
                else:
                    return {
                        'success': True,
                        'objects': [],
                        'categories': {},
                        'primary_objects': [],
                        'confidence_summary': {
                            'high_confidence': 0,
                            'medium_confidence': 0,
                            'low_confidence': 0,
                            'max_confidence': 0,
                            'avg_confidence': 0
                        },
                        'total_detections': 0,
                        'ai_description': '无法识别出具体物体'
                    }
                    
        except Exception as e:
            return {
                'success': False,
                'message': f'分析失败: {str(e)}',
                'objects': [],
                'categories': {},
                'primary_objects': [],
                'confidence_summary': {}
            }

    def analyze_colors(self, img):
        """分析图像颜色特征"""
        # 缩小图像以提高处理速度
        small_img = img.resize((100, 100))
        
        # 获取统计信息
        stat = ImageStat.Stat(small_img)
        
        # 计算主要颜色
        r, g, b = stat.mean
        
        # 转换到HSV空间
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        
        # 确定主要颜色
        dominant_color = self.get_color_name(h, s, v)
        
        # 计算亮度和饱和度
        brightness = 'bright' if v > 0.7 else 'dark' if v < 0.3 else 'medium'
        saturation = 'high' if s > 0.6 else 'low' if s < 0.3 else 'medium'
        
        return {
            'dominant_color': dominant_color,
            'brightness': brightness,
            'saturation': saturation,
            'rgb_mean': (r, g, b),
            'hsv_mean': (h, s, v)
        }

    def get_color_name(self, h, s, v):
        """根据HSV值确定颜色名称"""
        if v < 0.2:
            return 'black'
        if s < 0.2:
            if v > 0.8:
                return 'white'
            else:
                return 'gray'
        
        # 根据色相确定颜色
        h_deg = h * 360
        if h_deg < 15 or h_deg >= 345:
            return 'red'
        elif h_deg < 45:
            return 'orange'
        elif h_deg < 75:
            return 'yellow'
        elif h_deg < 150:
            return 'green'
        elif h_deg < 210:
            return 'cyan'
        elif h_deg < 270:
            return 'blue'
        elif h_deg < 330:
            return 'purple'
        else:
            return 'pink'

    def analyze_complexity(self, img):
        """分析图像复杂度"""
        # 转换为灰度图
        gray = img.convert('L')
        
        # 计算边缘
        edges = gray.filter(ImageFilter.FIND_EDGES)
        edge_stat = ImageStat.Stat(edges)
        edge_mean = edge_stat.mean[0]
        
        # 根据边缘强度判断复杂度
        if edge_mean > 50:
            return 'geometric'  # 几何形状多
        elif edge_mean > 20:
            return 'medium'     # 中等复杂度
        else:
            return 'organic'    # 有机形状

    def detect_objects(self, aspect_ratio, megapixels, color_analysis, complexity):
        """基于规则检测物体"""
        detections = []
        
        for obj_type, rules in self.detection_rules.items():
            confidence = 0
            
            # 检查颜色匹配
            if color_analysis['dominant_color'] in rules['colors']:
                confidence += 0.3
            
            # 检查宽高比
            for ar_min, ar_max in rules['aspect_ratios']:
                if ar_min <= aspect_ratio <= ar_max:
                    confidence += 0.3
                    break
            
            # 检查尺寸
            size_min, size_max = rules['size_range']
            if size_min <= megapixels <= size_max:
                confidence += 0.2
            
            # 检查复杂度
            if rules['complexity'] == complexity:
                confidence += 0.2
            
            # 如果置信度足够高，添加到检测结果
            if confidence > 0.4:
                detections.append({
                    'object': obj_type,
                    'chinese_name': rules['description'],
                    'category': obj_type,
                    'confidence': min(confidence, 1.0),
                    'class_id': obj_type
                })
        
        return detections

    def generate_description(self, primary_objects, categories):
        """生成AI描述"""
        if not primary_objects:
            return "无法识别出具体物体"
        
        main_obj = primary_objects[0]
        description = f"通过AI分析，这张图片主要包含{main_obj['chinese_name']}"
        
        # 添加置信度
        confidence_level = "高" if main_obj['confidence'] > 0.7 else "中等" if main_obj['confidence'] > 0.5 else "较低"
        description += f"（识别置信度：{confidence_level}）"
        
        # 添加其他物体
        if len(primary_objects) > 1:
            other_objects = [obj['chinese_name'] for obj in primary_objects[1:3]]
            description += f"，同时还可能包含{', '.join(other_objects)}"
        
        return description

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': '请提供图像路径'}, ensure_ascii=False))
        return
    
    image_path = sys.argv[1]
    
    try:
        ai = SimpleImageAI()
        result = ai.analyze_image_content(image_path)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(json.dumps({'error': f'分析失败: {str(e)}'}, ensure_ascii=False))

if __name__ == "__main__":
    main()
