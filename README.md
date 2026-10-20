# SuOrbit QR Studio - Pro High-Res QR Code Generator & Scanner

**SuOrbit QR Studio** is a modern, privacy-first web application designed to generate and scan high-resolution, branded QR codes. Built with Vanilla HTML5, modern CSS3 design tokens, and lightweight client-side JavaScript, it runs statically on GitHub Pages with zero server dependencies, no tracking, and no paywalls.

🌐 **Live Website**: [suorbit.top](https://suorbit.top)

---

## ✨ Features & Capabilities

- 🎨 **Rich Customization & Aesthetics**:
  - Linear and radial two-tone color gradients
  - Custom foreground, background, and corner eye colors
  - Transparent background export mode (ideal for packaging and graphic design)
  - Dot & pattern styles: Rounded, Dots, Classy, Classy Rounded, Square
  - Eye frame shapes: Extra-Rounded, Dot, Square
  - Center dot shapes: Dot, Square

- 🖼️ **Logo & Brand Integration**:
  - Upload custom PNG, SVG, or JPG brand logos
  - Built-in social & utility icons (GitHub, X/Twitter, Instagram, YouTube, WhatsApp, LinkedIn, Wi-Fi, Web)
  - Logo scale slider and background dot clearing to prevent scanning interference

- 🏷️ **Frames & Templates**:
  - "SCAN ME" bottom banner, Polaroid cards, and clean badges
  - 6 instant one-click designer presets (Modern Indigo, Cyberpunk Neon, Emerald Brand, Obsidian Minimal, Sunset Flame, Royal Amber)

- 📥 **High-Resolution Exports**:
  - **Vector SVG**: Infinitely scalable for professional print (billboards, menus, business cards)
  - **4K PNG & WEBP**: High-resolution raster output up to 2048x2048 px
  - **Direct Clipboard Copy**: Copy PNG directly to system clipboard for instant pasting
  - **Direct Print / PDF**: Formatted clean print preview

- 📷 **Built-in QR Code Scanner**:
  - Drag-and-drop or file upload decoder
  - Real-time device camera scanning with visual viewfinder
  - One-click "Open Link", "Copy Content", or "Re-style in Generator"

- 🔒 **100% Client-Side Privacy**:
  - Zero external tracking cookies or backend storage
  - Wi-Fi keys, vCards, and notes never leave the user's browser
  - Local history library stored in `localStorage`

- 🌓 **Dual Themes**:
  - Sleek dark studio mode & crisp light mode with smooth CSS variable transitions

---

## 📁 Repository Structure

```
/
├── index.html           # Main QR Studio Application (Generator + Scanner)
├── 404.html             # Custom 404 Page
├── privacy.html         # Privacy Policy
├── terms.html           # Terms of Service
├── robots.txt           # Search Engine Directives
├── sitemap.xml          # XML Sitemap
├── CNAME                # Custom Domain Configuration (suorbit.top)
├── README.md            # Documentation
│
└── assets/
    ├── css/
    │   └── style.css    # Unified Modern CSS Design System
    ├── js/
    │   └── app.js       # QR Generation, Scanner, Styling & History Logic
    └── images/
        └── logo.svg     # SuOrbit Studio Brand Logo
```

---

## 🚀 Local Development

To run or preview locally, you can serve the folder using any static web server:

```bash
# Python 3
python -m http.server 8000

# or simply open index.html in any modern browser!
```

---

## 📄 License

Open source and free for personal and commercial usage.
