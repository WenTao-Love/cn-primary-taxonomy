#!/usr/bin/env python3
"""
分析截图中的学科按钮数量
通过分析特定区域的像素颜色变化来估计按钮数量
"""
from PIL import Image
import sys

def analyze_subjects(image_path):
    """分析学科选择区域"""
    img = Image.open(image_path)
    width, height = img.size
    print(f"图片尺寸: {width}x{height}")
    
    # 学科选择器大约在页面上部 1/4 处
    # 分析该区域的水平像素变化
    y_start = int(height * 0.25)
    y_end = int(height * 0.40)
    
    # 分析该区域的颜色变化
    colors = []
    for y in range(y_start, y_end, 5):
        row_colors = []
        for x in range(0, width, 10):
            pixel = img.getpixel((x, y))
            row_colors.append(pixel)
        colors.append(row_colors)
    
    # 统计蓝色像素（选中的学科按钮）
    blue_count = 0
    white_count = 0
    for row in colors:
        for pixel in row:
            r, g, b = pixel[:3]
            # 蓝色: #667eea (102, 126, 234)
            if 80 < r < 120 and 100 < g < 150 and 200 < b < 250:
                blue_count += 1
            # 白色
            elif r > 240 and g > 240 and b > 240:
                white_count += 1
    
    print(f"蓝色像素数（选中按钮）: {blue_count}")
    print(f"白色像素数（未选中按钮）: {white_count}")
    
    # 估计按钮数量
    if blue_count > 100:
        print("检测到有选中的学科按钮（蓝色）")
    if white_count > 100:
        print("检测到有未选中的学科按钮（白色）")
    
    # 分析按钮颜色变化（检测不同按钮的边界）
    # 通过检测蓝色区域的数量来估计学科按钮数量
    blue_regions = 0
    prev_blue = False
    for y in range(y_start, y_end, 3):
        has_blue = False
        for x in range(0, width, 5):
            pixel = img.getpixel((x, y))
            r, g, b = pixel[:3]
            if 80 < r < 120 and 100 < g < 150 and 200 < b < 250:
                has_blue = True
                break
        if has_blue and not prev_blue:
            blue_regions += 1
        prev_blue = has_blue
    
    print(f"蓝色区域数量（估计学科按钮数）: {blue_regions}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python analyze-subjects.py <图片路径>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    analyze_subjects(image_path)
