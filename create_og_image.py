from PIL import Image, ImageDraw, ImageFont
import math
import random
import os

# Canvas size
W, H = 1200, 630

# Corporate color palette
BG_TOP = "#020617"
BG_BOTTOM = "#0f172a"
PRIMARY = "#1e3a8a"
PRIMARY_LIGHT = "#3b82f6"
TEXT = "#ffffff"
TEXT_DIM = "#cbd5e1"
ACCENT = "#38bdf8"
PARTICLE = "#94a3b8"

# Create image with gradient background
img = Image.new("RGB", (W, H), BG_TOP)
draw = ImageDraw.Draw(img)

# Draw vertical gradient
for y in range(H):
    ratio = y / H
    r = int(int(BG_TOP[1:3], 16) * (1 - ratio) + int(BG_BOTTOM[1:3], 16) * ratio)
    g = int(int(BG_TOP[3:5], 16) * (1 - ratio) + int(BG_BOTTOM[3:5], 16) * ratio)
    b = int(int(BG_TOP[5:7], 16) * (1 - ratio) + int(BG_BOTTOM[5:7], 16) * ratio)
    draw.line([(0, y), (W, y)], fill=(r, g, b))


# Try to load system fonts
def load_font(name, size, fallback_size=None):
    font_paths = [
        f"C:/Windows/Fonts/{name}",
        f"/usr/share/fonts/truetype/{name}",
        f"/System/Library/Fonts/{name}",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


font_title = load_font("segoeuib.ttf", 72)
font_sub = load_font("segoeui.ttf", 36)
font_tag = load_font("segoeui.ttf", 24)
font_small = load_font("segoeui.ttf", 20)

# ===== Draw subtle particle network =====
random.seed(42)
particles = []
particle_count = 50
connection_distance = 130
max_connections = 3

for _ in range(particle_count):
    x = random.randint(50, W - 50)
    y = random.randint(50, H - 50)
    # Keep center area relatively clear for text
    cx, cy = W // 2, H // 2
    if abs(x - cx) < 320 and abs(y - cy) < 130:
        continue
    particles.append((x, y))

# Draw connections
for i in range(len(particles)):
    connections = 0
    for j in range(i + 1, len(particles)):
        dx = particles[i][0] - particles[j][0]
        dy = particles[i][1] - particles[j][1]
        dist = math.sqrt(dx * dx + dy * dy)
        if dist < connection_distance and connections < max_connections:
            alpha = int((1 - dist / connection_distance) * 40)
            draw.line(
                [particles[i], particles[j]],
                fill=(int(int(PARTICLE[1:3], 16)), int(int(PARTICLE[3:5], 16)), int(int(PARTICLE[5:7], 16)), alpha),
                width=1,
            )
            connections += 1

# Draw particles
for x, y in particles:
    size = 2
    draw.ellipse([x - size, y - size, x + size, y + size], fill=PARTICLE)


# ===== Draw corner accents =====
accent_length = 40
accent_thickness = 3
margin = 50
accent_color = PRIMARY_LIGHT

# Top-left
draw.line([(margin, margin), (margin + accent_length, margin)], fill=accent_color, width=accent_thickness)
draw.line([(margin, margin), (margin, margin + accent_length)], fill=accent_color, width=accent_thickness)
# Top-right
draw.line([(W - margin - accent_length, margin), (W - margin, margin)], fill=accent_color, width=accent_thickness)
draw.line([(W - margin, margin), (W - margin, margin + accent_length)], fill=accent_color, width=accent_thickness)
# Bottom-left
draw.line([(margin, H - margin), (margin + accent_length, H - margin)], fill=accent_color, width=accent_thickness)
draw.line([(margin, H - margin - accent_length), (margin, H - margin)], fill=accent_color, width=accent_thickness)
# Bottom-right
draw.line([(W - margin - accent_length, H - margin), (W - margin, H - margin)], fill=accent_color, width=accent_thickness)
draw.line([(W - margin, H - margin - accent_length), (W - margin, H - margin)], fill=accent_color, width=accent_thickness)


# ===== Draw title =====
title_text = "Seckin Bulgur"
bbox = draw.textbbox((0, 0), title_text, font=font_title)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
tx = (W - tw) // 2
ty = H // 2 - th - 30

draw.text((tx, ty), title_text, font=font_title, fill=TEXT)

# ===== Draw subtitle =====
sub_text = ".NET & C# Developer"
bbox2 = draw.textbbox((0, 0), sub_text, font=font_sub)
sw = bbox2[2] - bbox2[0]
sh = bbox2[3] - bbox2[1]
sx = (W - sw) // 2
sy = H // 2 + 10

draw.text((sx, sy), sub_text, font=font_sub, fill=PRIMARY_LIGHT)

# ===== Draw tagline =====
tag_text = "Backend-focused Software Engineer"
bbox3 = draw.textbbox((0, 0), tag_text, font=font_tag)
tgw = bbox3[2] - bbox3[0]
tgx = (W - tgw) // 2
tgy = H // 2 + sh + 30

draw.text((tgx, tgy), tag_text, font=font_tag, fill=TEXT_DIM)

# ===== Draw URL at bottom =====
url_text = "seckinbulgur.com"
bbox4 = draw.textbbox((0, 0), url_text, font=font_small)
uw = bbox4[2] - bbox4[0]
ux = (W - uw) // 2
uy = H - 70

draw.text((ux, uy), url_text, font=font_small, fill=ACCENT)

# Save
img.save("og-image.jpg", "JPEG", quality=95)
print("og-image.jpg created successfully: 1200x630")
