from PIL import Image, ImageDraw, ImageFont
import math

# Canvas size
W, H = 1200, 630

# Colors
BG = "#000000"
PRIMARY = "#2a3fe5"
SECONDARY = "#f4b9b0"
WARNING = "#d97706"
DANGER = "#dc2626"
CYAN = "#00ffff"
WHITE = "#ffffff"
TEXT_DIM = "#8888a0"

# Create image
img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# Load fonts
try:
    font_title = ImageFont.truetype("PressStart2P-Regular.ttf", 52)
    font_sub = ImageFont.truetype("PressStart2P-Regular.ttf", 22)
    font_small = ImageFont.truetype("PressStart2P-Regular.ttf", 14)
except:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_small = ImageFont.load_default()

# ===== Draw dot grid background =====
spacing = 32
for y in range(0, H, spacing):
    for x in range(0, W, spacing):
        # Skip center area for text readability
        cx, cy = W // 2, H // 2
        if abs(x - cx) < 350 and abs(y - cy) < 120:
            continue
        size = 2
        alpha = 0.25
        color_val = int(244 * alpha), int(185 * alpha), int(176 * alpha)
        draw.ellipse([x - size, y - size, x + size, y + size], fill=color_val)

# ===== Draw maze walls (decorative) =====
wall_color = PRIMARY
# Top border
draw.rectangle([40, 40, W - 40, 48], fill=wall_color)
# Bottom border
draw.rectangle([40, H - 48, W - 40, H - 40], fill=wall_color)
# Left border
draw.rectangle([40, 40, 48, H - 40], fill=wall_color)
# Right border
draw.rectangle([W - 48, 40, W - 40, H - 40], fill=wall_color)

# Corner brackets
corner_size = 24
draw.rectangle([40, 40, 40 + corner_size, 48], fill=SECONDARY)
draw.rectangle([40, 40, 48, 40 + corner_size], fill=SECONDARY)
draw.rectangle([W - 40 - corner_size, 40, W - 40, 48], fill=SECONDARY)
draw.rectangle([W - 48, 40, W - 40, 40 + corner_size], fill=SECONDARY)
draw.rectangle([40, H - 48, 40 + corner_size, H - 40], fill=SECONDARY)
draw.rectangle([40, H - 40 - corner_size, 48, H - 40], fill=SECONDARY)
draw.rectangle([W - 40 - corner_size, H - 48, W - 40, H - 40], fill=SECONDARY)
draw.rectangle([W - 48, H - 40 - corner_size, W - 40, H - 40], fill=SECONDARY)

# ===== Draw Pac-Man =====
def draw_pacman(cx, cy, size, mouth_open, angle=0):
    # Body
    draw.pieslice(
        [cx - size, cy - size, cx + size, cy + size],
        start=mouth_open + angle,
        end=360 - mouth_open + angle,
        fill=WARNING
    )
    # Mouth triangle (black)
    points = []
    steps = 10
    for i in range(steps + 1):
        a = math.radians(mouth_open + angle + (360 - 2 * mouth_open) * i / steps)
        points.append((cx + size * math.cos(a), cy + size * math.sin(a)))
    points.append((cx, cy))
    draw.polygon(points, fill=BG)

# Pac-Man at bottom left
draw_pacman(180, H - 120, 35, 35, 0)

# ===== Draw Ghosts =====
def draw_ghost(cx, cy, size, color):
    # Body
    body_top = cy - size
    body_bottom = cy + size * 0.7
    draw.pieslice([cx - size, body_top, cx + size, cy + size * 0.3], start=0, end=180, fill=color)
    draw.rectangle([cx - size, cy - size * 0.1, cx + size, body_bottom], fill=color)
    # Wavy bottom
    wave_w = size * 2 / 3
    for i in range(3):
        wx = cx - size + wave_w * (i + 0.5)
        draw.polygon([
            (wx - wave_w / 2, body_bottom),
            (wx, body_bottom + size * 0.25),
            (wx + wave_w / 2, body_bottom)
        ], fill=color)
    # Eyes
    eye_r = size * 0.22
    pupil_r = size * 0.1
    eye_y = cy - size * 0.15
    # Left eye
    draw.ellipse([cx - size * 0.35 - eye_r, eye_y - eye_r, cx - size * 0.35 + eye_r, eye_y + eye_r], fill=WHITE)
    draw.ellipse([cx - size * 0.35 - pupil_r + 2, eye_y - pupil_r + 1, cx - size * 0.35 + pupil_r + 2, eye_y + pupil_r + 1], fill=BG)
    # Right eye
    draw.ellipse([cx + size * 0.15 - eye_r, eye_y - eye_r, cx + size * 0.15 + eye_r, eye_y + eye_r], fill=WHITE)
    draw.ellipse([cx + size * 0.15 - pupil_r + 2, eye_y - pupil_r + 1, cx + size * 0.15 + pupil_r + 2, eye_y + pupil_r + 1], fill=BG)

# Ghosts
draw_ghost(W - 180, H - 120, 30, DANGER)   # Blinky
draw_ghost(W - 110, H - 120, 30, SECONDARY) # Pinky
draw_ghost(W - 250, H - 120, 30, CYAN)      # Inky

# ===== Draw dots line =====
dot_y = H - 120
for x in range(260, W - 300, 28):
    draw.ellipse([x - 4, dot_y - 4, x + 4, dot_y + 4], fill=SECONDARY)

# ===== Draw title =====
title_text = "SECKIN BULGUR"
# Measure text
bbox = draw.textbbox((0, 0), title_text, font=font_title)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
tx = (W - tw) // 2
ty = H // 2 - th - 20

# Text shadow (blue)
draw.text((tx + 5, ty + 5), title_text, font=font_title, fill=PRIMARY)
# Main text (white)
draw.text((tx, ty), title_text, font=font_title, fill=WHITE)

# ===== Draw subtitle =====
sub_text = ".NET & C# Developer"
bbox2 = draw.textbbox((0, 0), sub_text, font=font_sub)
sw = bbox2[2] - bbox2[0]
sh = bbox2[3] - bbox2[1]
sx = (W - sw) // 2
sy = H // 2 + 20

draw.text((sx, sy), sub_text, font=font_sub, fill=SECONDARY)

# ===== Draw small tagline =====
tag_text = "PORTFOLIO | seckinbulgur.com"
bbox3 = draw.textbbox((0, 0), tag_text, font=font_small)
tgw = bbox3[2] - bbox3[0]
tgx = (W - tgw) // 2
tgy = H // 2 + 80

draw.text((tgx, tgy), tag_text, font=font_small, fill=TEXT_DIM)

# ===== Draw INSERT COIN at top =====
coin_text = "INSERT COIN"
bbox4 = draw.textbbox((0, 0), coin_text, font=font_small)
cw = bbox4[2] - bbox4[0]
cx = (W - cw) // 2
cy_top = 80

draw.text((cx, cy_top), coin_text, font=font_small, fill=WARNING)

# ===== Draw corner decorations =====
# Small dots in corners
for pos in [(80, 80), (W - 80, 80), (80, H - 80), (W - 80, H - 80)]:
    draw.ellipse([pos[0] - 6, pos[1] - 6, pos[0] + 6, pos[1] + 6], fill=SECONDARY)

# ===== Draw tech tags at bottom center =====
tags = [".NET", "C#", "SQL", "REACT", "FLUTTER"]
tag_font = font_small
tag_y = H - 60
total_tag_width = 0
tag_spaces = []
for tag in tags:
    bbox_t = draw.textbbox((0, 0), tag, font=tag_font)
    tw_t = bbox_t[2] - bbox_t[0]
    tag_spaces.append(tw_t)
    total_tag_width += tw_t
total_tag_width += (len(tags) - 1) * 30  # spacing

current_x = (W - total_tag_width) // 2
for i, tag in enumerate(tags):
    draw.text((current_x, tag_y), tag, font=tag_font, fill=WHITE)
    current_x += tag_spaces[i] + 30

# Save
img.save("og-image.jpg", "JPEG", quality=95)
print("og-image.jpg created successfully: 1200x630")
