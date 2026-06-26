# Getting Started

## Prerequisites

- A modern web browser (Chrome 90+, Firefox 88+, Edge 90+)
- No build tools or package managers required
- For local serving: Python 3 or any HTTP server

## Installation

### 1. Clone or download

```bash
git clone https://github.com/YOUR_USERNAME/physics-playground.git
cd physics-playground
```

### 2. Serve locally

The project uses ES modules and dynamic script loading, so a local HTTP server is recommended. There are several ways to start one:

**Option A — Use the provided batch file (Windows):**
```batch
serve.bat
```

**Option B — Use the shell script (Linux/macOS/WSL):**
```bash
chmod +x serve.sh
./serve.sh
```

**Option C — Python:**
```bash
python -m http.server 8000
```

**Option D — Node.js (if installed):**
```bash
npx serve .
```

### 3. Open in browser

Navigate to `http://localhost:8000` (or whatever port your server uses).

## First Time User Guide

1. **Start at the hub** (`index.html`) — you'll see 16 lab cards
2. **Begin with Module 00** — "From Crystal to Quantum" is the introductory experience
3. **Follow the timeline** — click timeline nodes at the top to jump between sections
4. **Earn XP** — complete challenges within each module to progress
5. **Watch your level grow** — the hero panel shows your current level and XP bar

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank screen | Open browser console (F12) to check for JS errors |
| Plotly not loading | Check internet connection (CDN-loaded) |
| Math not rendering | MathJax loads asynchronously — give it a second |
| CORS errors | You must use an HTTP server, not `file://` protocol |
