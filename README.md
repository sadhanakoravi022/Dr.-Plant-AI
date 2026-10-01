# Dr. Plant AI 🌿

> Instant on-device disease diagnosis for Indian farms — designed for zero-connectivity digital dead zones.

Dr. Plant AI provides real-time crop disease diagnosis using quantized on-device neural inference, an offline treatment vault with botanical recipes and knapsack sprayer dilution calculators, on-device SQLite ledger persistence, and offline regional speech synthesis.

---

## 🌟 Key Features

- **On-Device Inference**: Fast, sub-second leaf disease identification running locally in the browser with zero cloud dependencies.
- **Tomato & Potato Focus**: Specialized pathology detection covering Early Blight, Late Blight, Bacterial Spot, Leaf Curl, and Healthy specimens.
- **Clean Camera Viewfinder**: Unobstructed viewfinder with direct camera stream capture and gallery photo upload.
- **Offline Treatment Vault**: Comprehensive guide with botanical organic recipes (Neem oil, Jeevamrutha, Trichoderma) and exact 10L/15L/20L knapsack sprayer dilution ratios.
- **Multilingual TTS Audio**: Regional speech playback in 7 languages (English, Hindi, Marathi, Telugu, Tamil, Kannada, Bengali).
- **On-Device Pathology Ledger**: Persistent scan history stored locally with instant JSON export.
- **Dark Green Agricultural Theme**: Clean, high-contrast visual design optimized for outdoor sunlight visibility.

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/dr-plant-ai.git
   cd dr-plant-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build

To build the static production bundle:

```bash
npm run build
```

The optimized static assets will be output to the `dist/` directory, ready to be hosted on Vercel, Netlify, Cloud Run, or GitHub Pages.

---

## 📱 Build Android APK via GitHub (No Android Studio Needed!)

This repository comes pre-configured with a **GitHub Actions automated APK build workflow** (`.github/workflows/build-apk.yml`) powered by Capacitor.

### How to get your `.apk` file:

1. **Push or Export this repository to your GitHub account**.
2. On your GitHub repository page, click the **Actions** tab at the top.
3. You will see the **"Build Android APK"** workflow running automatically.
   - You can also click **"Build Android APK"** in the left sidebar &rarr; click **"Run workflow"** at any time.
4. When the build finishes (approx. 2–3 minutes):
   - Click on the completed workflow run.
   - Scroll down to the **Artifacts** section at the bottom of the summary page.
   - Click **`DrPlantAI-Android-APK`** to download the ready-to-install `.apk` zip file!
5. Transfer or download the APK directly to any Android smartphone, tap to install, and test in the field with zero internet connection.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion

---

## 📄 License

MIT License. Designed for farmers and agricultural communities.
