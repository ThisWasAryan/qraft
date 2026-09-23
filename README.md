# QRaft 

**QRaft** is a privacy-first, local-only QR code generator built with React and Vite. It provides an unlimited canvas for styling QR codes with gradients, custom logos, dynamic patterns, and advanced reliability checks — entirely within your browser. 

No data is sent to external servers, and no tracking is involved.

## ✨ Features

- **Privacy-First Architecture:** 100% client-side generation. Your data never leaves your device.
- **Advanced Styling Engine:**
  - Solid colors and complex gradients (Linear & Radial).
  - Customizable module shapes (Squares, Dots, Rounded).
  - Custom Eye frame and center configurations.
  - Image logo support with customizable backgrounds and padding.
- **Smart Reliability Engine:**
  - Real-time contrast checking with dynamic matrix calculations.
  - Generates a "Scan Reliability Score" as you customize.
  - Smart Tiered Auto-Fix: Automatically resolves quiet-zone and contrast issues while preserving as much of your design intent as possible.
  - Payload density checks ensuring EC levels match payload capacity.
- **Multiple Payload Types:** URLs, plain text, Wi-Fi configuration, Emails, and Phone Numbers.
- **Generative Design:** Click the randomize button for mathematically-generated, vibrant, and unique design combinations.
- **Time Travel:** Full undo/redo history stack so you never lose a design iteration.
- **High-Resolution Export:** Export up to ultra-high resolutions in SVG, PNG, or JPEG formats.

## 🚀 Deployment Guide

QRaft is a standard Vite + React Single Page Application (SPA). It is ready out of the box to be deployed on any static hosting provider like GitHub Pages, Cloudflare Pages, or Vercel.

### GitHub Pages

1. In your `vite.config.ts`, ensure `base` is set correctly. If deploying to `https://<USERNAME>.github.io/<REPO>/`, set `base: '/<REPO>/'`. If deploying to a custom domain, you can omit the base or set it to `/`.
2. Commit your code and push to GitHub.
3. In your repository settings, go to **Pages**.
4. Set the source to **GitHub Actions**.
5. GitHub will automatically detect the Vite app or you can use the standard Node.js workflow to build `npm run build` and deploy the `dist` directory.

### Vercel

1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your QRaft repository.
4. Vercel will automatically detect Vite and configure the build settings (`npm run build` and `dist` output directory).
5. Click **Deploy**.

### Cloudflare Pages

1. Push your repository to GitHub.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Pages**.
3. Click **Create a project** -> **Connect to Git**.
4. Select your QRaft repository.
5. In the build settings, set the **Framework preset** to **None** or **Create React App / Vite**.
6. Set the **Build command** to `npm run build`.
7. Set the **Build output directory** to `dist`.
8. Click **Save and Deploy**.

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn or pnpm

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/qraft.git
cd qraft

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build for Production
```bash
npm run build
```
The output will be generated in the `dist` folder.

## 📄 License
MIT License
