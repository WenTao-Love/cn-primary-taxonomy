#!/usr/bin/env python3
"""
分析截图内容，检查是否有调试信息
"""
from PIL import Image
import sys

def analyze_screenshot(image_path):
    """分析截图内容"""
    try:
        img = Image.open(image_path)
        print(f"图片尺寸: {img.size}")
        print(f"图片模式: {img.mode}")
        
        # 检查图片是否包含大量内容
        # 通过计算图片的熵来判断
        import math
        from collections import Counter
        
        pixels = list(img.getdata())
        total_pixels = len(pixels)
        
        # 计算颜色分布
        color_counts = Counter(pixels)
        unique_colors = len(color_counts)
        
        print(f"总像素数: {total_pixels}")
        print(f"唯一颜色数: {unique_colors}")
        
        # 计算熵
        entropy = 0
        for count in color_counts.values():
            p = count / total_pixels
            entropy -= p * math.log2(p)
        
        print(f"图片熵: {entropy:.2f}")
        
        # 如果熵很高，说明图片包含大量内容
        if entropy > 7:
            print("图片包含大量内容，页面可能正在渲染")
        elif entropy > 5:
            print("图片包含一些内容")
        else:
            print("图片内容很少，页面可能是空白的")
            
        # 检查是否有黄色、红色或绿色的调试信息
        # 黄色: (255, 255, 0)
        # 红色: (255, 0, 0)
        # 绿色: (0, 128, 0) 或 (0, 255, 0)
        yellow_count = sum(1 for p in pixels if isinstance(p, tuple) and len(p) >= 3 and p[0] > 200 and p[1] > 200 and p[2] < 100)
        red_count = sum(1 for p in pixels if isinstance(p, tuple) and len(p) >= 3 and p[0] > 200 and p[1] < 100 and p[2] < 100)
        green_count = sum(1 for p in pixels if isinstance(p, tuple) and len(p) >= 3 and p[0] < 100 and p[1] > 100 and p[2] < 100)
        
        print(f"黄色像素数: {yellow_count}")
        print(f"红色像素数: {red_count}")
        print(f"绿色像素数: {green_count}")
        
        if yellow_count > 1000:
            print("检测到黄色调试信息！数据加载成功！")
        if red_count > 1000:
            print("检测到红色错误信息！数据加载失败！")
        if green_count > 1000:
            print("检测到绿色调试信息！选择器已渲染！")
            
    except Exception as e:
        print(f"错误: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python analyze-screenshot.py <图片路径>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    analyze_screenshot(image_path)
