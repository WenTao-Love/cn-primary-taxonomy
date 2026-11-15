#!/usr/bin/env python3
"""
分析截图，找到标签栏的位置
"""
from PIL import Image
import sys

def find_tabs(image_path):
    """分析截图找到标签栏位置"""
    img = Image.open(image_path)
    width, height = img.size
    print(f"图片尺寸: {width}x{height}")
    
    # 分析页面顶部区域（header下方）
    # 标签栏通常是三个按钮：搜索知识点 | 按年级册章 | 整册诊断
    
    # 查找蓝色按钮（选中的标签）
    blue_pixels = []
    for y in range(0, height, 2):
        for x in range(0, width, 2):
            pixel = img.getpixel((x, y))
            r, g, b = pixel[:3]
            # 蓝色: #667eea (102, 126, 234)
            if 90 < r < 115 and 115 < g < 140 and 220 < b < 245:
                blue_pixels.append((x, y))
    
    if blue_pixels:
        print(f"找到 {len(blue_pixels)} 个蓝色像素")
        # 找到蓝色像素的边界
        min_x = min(p[0] for p in blue_pixels)
        max_x = max(p[0] for p in blue_pixels)
        min_y = min(p[1] for p in blue_pixels)
        max_y = max(p[1] for p in blue_pixels)
        print(f"蓝色区域: x={min_x}-{max_x}, y={min_y}-{max_y}")
        print(f"蓝色区域大小: {max_x-min_x}x{max_y-min_y}")
        
        # 分析蓝色区域周围的白色按钮
        # 标签栏通常在蓝色区域的同一行
        tab_y = (min_y + max_y) // 2
        print(f"\n标签栏Y坐标: {tab_y}")
        
        # 分析该行的颜色分布
        row_colors = []
        for x in range(0, width, 5):
            pixel = img.getpixel((x, tab_y))
            row_colors.append((x, pixel[:3]))
        
        # 找到颜色变化点（按钮边界）
        print("\n标签栏颜色变化:")
        prev_color = None
        for x, color in row_colors:
            if prev_color is None or (abs(color[0]-prev_color[0]) > 30 or abs(color[1]-prev_color[1]) > 30 or abs(color[2]-prev_color[2]) > 30):
                print(f"  x={x}: {color}")
            prev_color = color
    else:
        print("未找到蓝色像素")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python find-tabs.py <图片路径>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    find_tabs(image_path)
