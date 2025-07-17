#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高级AI图像识别模块
使用预训练的深度学习模型进行物体检测和分类
"""

import sys
import json
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2, VGG16, ResNet50
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import warnings
warnings.filterwarnings('ignore')

class AdvancedImageAI:
    def __init__(self):
        """初始化AI模型"""
        self.model = None
        self.load_model()
        
        # ImageNet类别到中文的映射（部分常见类别）
        self.class_mapping = {
            'person': '人物',
            'car': '汽车',
            'truck': '卡车',
            'bus': '公交车',
            'motorcycle': '摩托车',
            'bicycle': '自行车',
            'dog': '狗',
            'cat': '猫',
            'bird': '鸟',
            'horse': '马',
            'cow': '牛',
            'elephant': '大象',
            'airplane': '飞机',
            'train': '火车',
            'boat': '船',
            'building': '建筑',
            'house': '房屋',
            'tree': '树',
            'flower': '花',
            'food': '食物',
            'pizza': '披萨',
            'sandwich': '三明治',
            'cake': '蛋糕',
            'apple': '苹果',
            'banana': '香蕉',
            'orange': '橙子',
            'computer': '电脑',
            'laptop': '笔记本电脑',
            'phone': '手机',
            'camera': '相机',
            'book': '书',
            'chair': '椅子',
            'table': '桌子',
            'bed': '床',
            'sofa': '沙发'
        }
        
        # 物体类别分组
        self.category_groups = {
            'person': ['person', 'man', 'woman', 'child', 'baby'],
            'vehicle': ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'airplane', 'train', 'boat'],
            'animal': ['dog', 'cat', 'bird', 'horse', 'cow', 'elephant', 'tiger', 'lion', 'bear'],
            'building': ['building', 'house', 'castle', 'church', 'tower'],
            'nature': ['tree', 'flower', 'grass', 'mountain', 'sky', 'cloud', 'water'],
            'food': ['pizza', 'sandwich', 'cake', 'apple', 'banana', 'orange', 'bread', 'meat'],
            'technology': ['computer', 'laptop', 'phone', 'camera', 'television', 'monitor'],
            'furniture': ['chair', 'table', 'bed', 'sofa', 'desk', 'cabinet']
        }

    def load_model(self):
        """加载预训练模型"""
        try:
            # 使用MobileNetV2，平衡了准确性和速度
            self.model = MobileNetV2(weights='imagenet', include_top=True)
            print("AI模型加载成功: MobileNetV2")
        except Exception as e:
            print(f"模型加载失败: {e}")
            self.model = None

    def preprocess_image(self, image_path):
        """预处理图像"""
        try:
            # 加载图像
            img = Image.open(image_path)
            
            # 转换为RGB（如果是RGBA或其他格式）
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # 调整尺寸到224x224（MobileNetV2的输入尺寸）
            img = img.resize((224, 224))
            
            # 转换为numpy数组
            img_array = np.array(img)
            img_array = np.expand_dims(img_array, axis=0)
            
            # 预处理
            img_array = preprocess_input(img_array)
            
            return img_array
        except Exception as e:
            print(f"图像预处理失败: {e}")
            return None

    def predict_objects(self, image_path, top_k=10):
        """使用AI模型预测图像中的物体"""
        if self.model is None:
            return []
        
        try:
            # 预处理图像
            processed_img = self.preprocess_image(image_path)
            if processed_img is None:
                return []
            
            # 进行预测
            predictions = self.model.predict(processed_img, verbose=0)
            
            # 解码预测结果
            decoded_predictions = decode_predictions(predictions, top=top_k)[0]
            
            # 转换为我们的格式
            results = []
            for class_id, class_name, confidence in decoded_predictions:
                # 只保留置信度高于阈值的预测
                if confidence > 0.1:  # 10%置信度阈值
                    chinese_name = self.get_chinese_name(class_name)
                    category = self.get_category(class_name)
                    
                    results.append({
                        'object': class_name,
                        'chinese_name': chinese_name,
                        'category': category,
                        'confidence': float(confidence),
                        'class_id': class_id
                    })
            
            return results
            
        except Exception as e:
            print(f"AI预测失败: {e}")
            return []

    def get_chinese_name(self, class_name):
        """获取类别的中文名称"""
        # 首先检查直接映射
        if class_name in self.class_mapping:
            return self.class_mapping[class_name]
        
        # 检查部分匹配
        for key, value in self.class_mapping.items():
            if key in class_name.lower() or class_name.lower() in key:
                return value
        
        # 如果没有找到映射，返回英文名称
        return class_name.replace('_', ' ').title()

    def get_category(self, class_name):
        """获取物体所属的大类别"""
        class_lower = class_name.lower()
        
        for category, items in self.category_groups.items():
            for item in items:
                if item in class_lower or class_lower in item:
                    return category
        
        return 'other'

    def analyze_image_content(self, image_path):
        """综合分析图像内容"""
        predictions = self.predict_objects(image_path)
        
        if not predictions:
            return {
                'success': False,
                'message': '无法识别图像内容',
                'objects': [],
                'categories': {},
                'primary_objects': [],
                'confidence_summary': {}
            }
        
        # 按类别分组
        categories = {}
        for pred in predictions:
            category = pred['category']
            if category not in categories:
                categories[category] = []
            categories[category].append(pred)
        
        # 获取主要物体（置信度最高的几个）
        primary_objects = sorted(predictions, key=lambda x: x['confidence'], reverse=True)[:3]
        
        # 置信度统计
        confidence_summary = {
            'high_confidence': len([p for p in predictions if p['confidence'] > 0.5]),
            'medium_confidence': len([p for p in predictions if 0.2 <= p['confidence'] <= 0.5]),
            'low_confidence': len([p for p in predictions if p['confidence'] < 0.2]),
            'max_confidence': max([p['confidence'] for p in predictions]),
            'avg_confidence': sum([p['confidence'] for p in predictions]) / len(predictions)
        }
        
        return {
            'success': True,
            'objects': predictions,
            'categories': categories,
            'primary_objects': primary_objects,
            'confidence_summary': confidence_summary,
            'total_detections': len(predictions)
        }

    def generate_description(self, analysis_result):
        """基于AI分析结果生成中文描述"""
        if not analysis_result['success']:
            return "无法识别图像内容"
        
        primary_objects = analysis_result['primary_objects']
        categories = analysis_result['categories']
        
        if not primary_objects:
            return "图像内容不明确"
        
        # 获取最主要的物体
        main_object = primary_objects[0]
        description = f"这张图片主要包含{main_object['chinese_name']}"
        
        # 添加置信度信息
        confidence_level = "高" if main_object['confidence'] > 0.7 else "中等" if main_object['confidence'] > 0.4 else "较低"
        description += f"（识别置信度：{confidence_level}）"
        
        # 添加其他重要物体
        if len(primary_objects) > 1:
            other_objects = [obj['chinese_name'] for obj in primary_objects[1:3]]
            description += f"，同时还识别到{', '.join(other_objects)}"
        
        # 添加类别信息
        if len(categories) > 1:
            category_names = {
                'person': '人物',
                'vehicle': '交通工具',
                'animal': '动物',
                'building': '建筑',
                'nature': '自然景观',
                'food': '食物',
                'technology': '科技产品',
                'furniture': '家具'
            }
            main_categories = [category_names.get(cat, cat) for cat in list(categories.keys())[:3]]
            description += f"。图像涵盖了{', '.join(main_categories)}等类别"
        
        description += "。"
        return description

def main():
    """主函数，用于命令行调用"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': '请提供图像路径'}, ensure_ascii=False))
        return
    
    image_path = sys.argv[1]
    
    try:
        ai = AdvancedImageAI()
        result = ai.analyze_image_content(image_path)
        
        if result['success']:
            # 生成描述
            description = ai.generate_description(result)
            result['ai_description'] = description
        
        # 输出JSON结果
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(json.dumps({'error': f'分析失败: {str(e)}'}, ensure_ascii=False))

if __name__ == "__main__":
    main()
