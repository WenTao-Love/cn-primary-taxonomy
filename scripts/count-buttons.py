#!/usr/bin/env python3
"""
分析学科按钮数量
通过检测按钮边界（蓝色选中按钮 + 白色未选中按钮）
"""
from PIL import Image
import sys

def count_buttons(image_path):
    """统计学科按钮数量"""
    img = Image.open(image_path)
    width, height = img.size
    print(f"图片尺寸: {width}x{height}")
    
    # 学科按钮区域（根据find-tabs结果，标签栏在y=560）
    # 学科选择器应该在标签栏下方，大约 y=650-750
    y_start = int(height * 0.60)
    y_end = int(height * 0.70)
    
    print(f"\n分析区域: y={y_start}-{y_end}")
    
    # 分析该区域的按钮
    # 学科按钮：选中=蓝色(#667eea)，未选中=白色带边框
    
    # 逐列分析颜色
    button_colors = []
    for x in range(0, width, 5):
        # 取该列在区域内的平均颜色
        r_sum, g_sum, b_sum, count = 0, 0, 0, 0
        for y in range(y_start, y_end, 3):
            pixel = img.getpixel((x, y))
            r_sum += pixel[0]
            g_sum += pixel[1]
            b_sum += pixel[2]
            count += 1
        avg = (r_sum//count, g_sum//count, b_sum//count)
        button_colors.append((x, avg))
    
    # 检测按钮边界（颜色变化）
    print("\n按钮颜色变化:")
    prev_color = None
    transitions = []
    for x, color in button_colors:
        if prev_color is not None:
            diff = abs(color[0]-prev_color[0]) + abs(color[1]-prev_color[1]) + abs(color[2]-prev_color[2])
            if diff > 80:
                transitions.append((x, prev_color, color))
        prev_color = color
    
    print(f"颜色变化次数: {len(transitions)}")
    for x, c1, c2 in transitions[:20]:
        print(f"  x={x}: {c1} -> {c2}")
    
    # 统计蓝色区域（选中按钮）
    blue_cols = [x for x, color in button_colors if 90 < color[0] < 115 and 115 < color[1] < 140 and 220 < color[2] < 245]
    print(f"\n蓝色列数: {len(blue_cols)}")
    if blue_cols:
        print(f"蓝色区域: x={min(blue_cols)}-{max(blue_cols)}")
    
    # 统计白色区域（未选中按钮）
    white_cols = [x for x, color in button_colors if color[0] > 240 and color[1] > 240 and color[2] > 240]
    print(f"白色列数: {len(white_cols)}")
    if white_cols:
        print(f"白色区域: x={min(white_cols)}-{max(white_cols)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python count-buttons.py <图片路径>")
        sys.exit(1)
    
    count_buttons(sys.argv[1])
