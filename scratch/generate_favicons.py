import os
from PIL import Image, ImageDraw, ImageFont

def create_favicon(size, style="brand"):
    # Create image with RGBA
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    radius = int(size * 0.22)
    
    if style == "emerald_badge":
        # Solid Emerald Accent Background
        bg_color = (0, 220, 130, 255) # #00DC82
        draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=radius, fill=bg_color)
        
        # Draw "MC" in obsidian black
        # Font size proportional to canvas
        font_size = int(size * 0.52)
        font = None
        font_candidates = [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/System/Library/Fonts/SFPro-Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/Library/Fonts/SF-Pro-Text-Bold.otf",
            "/System/Library/Fonts/Supplemental/Futura.ttc"
        ]
        for fpath in font_candidates:
            if os.path.exists(fpath):
                try:
                    font = ImageFont.truetype(fpath, font_size)
                    break
                except Exception:
                    continue
        if font is None:
            font = ImageFont.load_default()
            
        text = "MC"
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        x = (size - tw) / 2 - bbox[0]
        y = (size - th) / 2 - bbox[1] - (size * 0.02)
        
        draw.text((x, y), text, fill=(6, 18, 11, 255), font=font)
        
    elif style == "terminal_dark":
        # Deep Obsidian Background
        bg_color = (12, 14, 18, 255)
        border_color = (0, 220, 130, 255)
        
        # Subtle outer border
        border_width = max(1, int(size * 0.06))
        draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=radius, fill=bg_color, outline=border_color, width=border_width)
        
        font_size = int(size * 0.48)
        font = None
        font_candidates = [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/System/Library/Fonts/SFPro-Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/Library/Fonts/SF-Pro-Text-Bold.otf"
        ]
        for fpath in font_candidates:
            if os.path.exists(fpath):
                try:
                    font = ImageFont.truetype(fpath, font_size)
                    break
                except Exception:
                    continue
        if font is None:
            font = ImageFont.load_default()
            
        text = "MC"
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        x = (size - tw) / 2 - bbox[0]
        y = (size - th) / 2 - bbox[1] - (size * 0.02)
        
        draw.text((x, y), text, fill=(0, 220, 130, 255), font=font)
        
    return img

if __name__ == "__main__":
    assets_dir = "/Users/dhrubojyoti/Projects/portfolio/email_signature/assets"
    root_dir = "/Users/dhrubojyoti/Projects/portfolio/email_signature"
    os.makedirs(assets_dir, exist_ok=True)
    
    # We will generate high resolution versions
    img_512 = create_favicon(512, "emerald_badge")
    img_192 = create_favicon(192, "emerald_badge")
    img_180 = create_favicon(180, "emerald_badge")
    img_64 = create_favicon(64, "emerald_badge")
    img_32 = create_favicon(32, "emerald_badge")
    img_16 = create_favicon(16, "emerald_badge")
    
    img_512.save(os.path.join(assets_dir, "icon-512.png"))
    img_192.save(os.path.join(assets_dir, "icon-192.png"))
    img_180.save(os.path.join(assets_dir, "apple-touch-icon.png"))
    img_32.save(os.path.join(assets_dir, "favicon-32x32.png"))
    img_16.save(os.path.join(assets_dir, "favicon-16x16.png"))
    
    # Also save to root apple-touch-icon
    img_180.save(os.path.join(root_dir, "apple-touch-icon.png"))
    
    # Save multi-size favicon.ico
    img_32.save(os.path.join(root_dir, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    img_32.save(os.path.join(assets_dir, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    
    print("Favicons generated successfully!")
