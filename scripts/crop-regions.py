#!/usr/bin/env python3
"""
裁剪截图的不同区域，分析页面布局
"""
from PIL import Image
import sys

def crop_regions(image_path):
    """裁剪并分析截图区域"""
    img = Image.open(image_path)
    width, height = img.size
    print(f"图片尺寸: {width}x{height}")
    
    # 裁剪顶部区域（header）
    top = img.crop((0, 0, width, int(height * 0.15)))
    top.save('docs/crop-top.png')
    
    # 裁剪上部区域（学科选择器）
    upper = img.crop((0, int(height * 0.15), width, int(height * 0.35)))
    upper.save('docs/crop-upper.png')
    
    # 裁剪中部区域（年级选择器）
    middle = img.crop((0, int(height * 0.35), width, int(height * 0.55)))
    middle.save('docs/crop-middle.png')
    
    # 裁剪下部区域（知识点列表）
    lower = img.crop((0, int(height * 0.55), width, height))
    lower.save('docs/crop-lower.png')
    
    print("已保存裁剪图片到 docs/ 目录")
    
    # 分析各区域的颜色
    for name, region in [("顶部", top), ("上部", upper), ("中部", middle), ("下部", lower)]:
        colors = region.getcolors(maxcolors=100000)
        if colors:
            # 按像素数排序
            colors.sort(key=lambda x: -x[0])
            top_colors = colors[:5]
            print(f"\n{name}区域主要颜色:")
            for count, color in top_colors:
                print(f"  {color}: {count} 像素")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python crop-regions.py <图片路径>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    crop_regions(image_path)
