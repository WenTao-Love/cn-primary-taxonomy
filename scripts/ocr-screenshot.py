#!/usr/bin/env python3
"""
使用OCR读取截图内容
"""
import sys

try:
    from PIL import Image
    import pytesseract
except ImportError:
    print("需要安装依赖: pip install pillow pytesseract")
    sys.exit(1)

def ocr_image(image_path):
    """OCR识别图片中的文字"""
    try:
        # 打开图片
        image = Image.open(image_path)
        
        # 转换为RGB（如果需要）
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # 使用Tesseract OCR识别中文
        text = pytesseract.image_to_string(image, lang='chi_sim+eng')
        
        return text
    except Exception as e:
        return f"OCR错误: {e}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python ocr-screenshot.py <图片路径>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    result = ocr_image(image_path)
    print(result)
