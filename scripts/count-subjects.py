#!/usr/bin/env python3
"""
分析学科选择器中的按钮数量
通过分析特定区域的像素颜色变化来估计按钮数量
"""
from PIL import Image
import sys

def count_subjects(image_path):
    """分析学科按钮数量"""
    img = Image.open(image_path)
    width, height = img.size
    print(f"图片尺寸: {width}x{height}")
    
    # 学科选择器大约在页面顶部 25%-35% 处
    # 分析该区域的水平像素变化
    
    # 查找学科按钮（蓝色选中 + 白色未选中）
    # 通过分析多行的颜色变化来找到按钮边界
    
    y_ranges = [
        (int(height * 0.28), int(height * 0.32)),  # 学科按钮区域
        (int(height * 0.32), int(height * 0.36)),
        (int(height * 0.36), int(height * 0.40)),
    ]
    
    for y_start, y_end in y_ranges:
        print(f"\n分析区域: y={y_start}-{y_end}")
        
        # 分析该区域的颜色变化
        colors = []
        for x in range(0, width, 2):
            # 取该列的平均颜色
            r_sum, g_sum, b_sum, count = 0, 0, 0, 0
            for y in range(y_start, y_end, 2):
                pixel = img.getpixel((x, y))
                r_sum += pixel[0]
                g_sum += pixel[1]
                b_sum += pixel[2]
                count += 1
            avg_color = (r_sum//count, g_sum//count, b_sum//count)
            colors.append((x, avg_color))
        
        # 找到颜色变化点（按钮边界）
        boundaries = []
        prev_color = None
        for x, color in colors:
            if prev_color is not None:
                diff = abs(color[0]-prev_color[0]) + abs(color[1]-prev_color[1]) + abs(color[2]-prev_color[2])
                if diff > 60:  # 颜色变化阈值
                    boundaries.append((x, prev_color, color))
            prev_color = color
        
        print(f"  颜色变化点数量: {len(boundaries)}")
        for x, c1, c2 in boundaries[:10]:
            print(f"    x={x}: {c1} -> {c2}")
        
        # 统计蓝色区域（选中的学科按钮）
        blue_count = sum(1 for x, color in colors if 90 < color[0] < 115 and 115 < color[1] < 140 and 220 < color[2] < 245)
        print(f"  蓝色像素列数: {blue_count}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python count-subjects.py <图片路径>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    count_subjects(image_path)
