#!/usr/bin/env python3
"""
检测截图中的学科按钮
通过检测圆角矩形区域来识别按钮
"""
from PIL import Image
import sys

def detect_buttons(image_path):
    """检测学科按钮"""
    img = Image.open(image_path)
    width, height = img.size
    print(f"图片尺寸: {width}x{height}")
    
    # 转换为灰度图
    gray = img.convert('L')
    
    # 学科按钮区域（扩大范围）
    y_start = int(height * 0.45)
    y_end = int(height * 0.80)
    
    print(f"分析区域: y={y_start}-{y_end}")
    
    # 检测水平线上的深色像素（按钮边框或文字）
    # 学科按钮有边框，颜色比背景深
    
    # 分析每一行的深色像素分布
    for y in range(y_start, y_end, 10):
        dark_pixels = []
        for x in range(0, width, 2):
            pixel = gray.getpixel((x, y))
            if pixel < 200:  # 深色像素
                dark_pixels.append(x)
        
        if dark_pixels:
            # 找到深色像素的连续区域
            regions = []
            start = dark_pixels[0]
            prev = dark_pixels[0]
            for x in dark_pixels[1:]:
                if x - prev > 20:  # 间隔大于20像素，认为是新区域
                    regions.append((start, prev))
                    start = x
                prev = x
            regions.append((start, prev))
            
            print(f"y={y}: 找到 {len(regions)} 个深色区域: {regions[:10]}")
    
    # 统计整个区域的深色像素分布
    print("\n按列统计深色像素:")
    col_counts = {}
    for y in range(y_start, y_end, 5):
        for x in range(0, width, 2):
            pixel = gray.getpixel((x, y))
            if pixel < 200:
                col_counts[x] = col_counts.get(x, 0) + 1
    
    # 找到深色像素较多的列（按钮边框）
    button_cols = [x for x, count in col_counts.items() if count > 5]
    if button_cols:
        button_cols.sort()
        # 分组
        groups = []
        start = button_cols[0]
        prev = button_cols[0]
        for x in button_cols[1:]:
            if x - prev > 30:
                groups.append((start, prev))
                start = x
            prev = x
        groups.append((start, prev))
        
        print(f"\n按钮边界组数: {len(groups)}")
        for i, (s, e) in enumerate(groups):
            print(f"  组{i+1}: x={s}-{e} (宽度={e-s})")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python detect-buttons.py <图片路径>")
        sys.exit(1)
    
    detect_buttons(sys.argv[1])
