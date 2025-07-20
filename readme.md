# 🧠 Metadata Extractor Web App

The **Metadata Extractor Web App** is a fast, user-friendly tool built with **React + TypeScript + Vite** that enables users to upload various file types and view their metadata instantly in the browser. It's optimized for performance, styled with TailwindCSS, and powered by powerful JavaScript libraries to handle metadata processing efficiently.

---

## 🚀 Features

- 🔍 Extracts metadata from image, audio, and PDF files
- ⚡ Fast and lightweight – built on Vite + React
- 🎨 Clean and responsive UI with Tailwind CSS
- 🔒 Uses modern libraries like `exif-js`, `file-type`, and `crypto-js`
- 🧩 Easy to integrate or expand for more formats

---

## 🛠 Tech Stack

- **Framework:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Lucide Icons
- **Metadata Libraries:**
  - [`exif-js`](https://github.com/exif-js/exif-js) – for image EXIF metadata
  - [`file-type`](https://github.com/sindresorhus/file-type) – for file type detection
  - [`crypto-js`](https://github.com/brix/crypto-js) – for optional file hashing

---

## 📁 Supported File Types

| File Type | Extensions              | Extracted Metadata            |
|-----------|--------------------------|-------------------------------|
| Image     | `.jpg`, `.jpeg`, `.png`  | EXIF tags (camera, date, etc.)|
| Audio     | `.mp3`, `.wav`           | Basic metadata (title, artist)|
| PDF       | `.pdf`                   | Header info (version, type)   |

> 📌 DOCX and video formats can be added in future versions.

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/metadata-extractor.git
cd metadata-extractor
npm install
npm run dev
```
## Project structure
```
.
├── public/
├── src/
│   ├── components/         # UI Components
│   ├── utils/              # Metadata parser helpers
│   ├── App.tsx             # Main App Component
│   ├── main.tsx            # Entry point
├── tailwind.config.js      # Tailwind setup
├── index.html              # HTML Template
├── package.json            # Project config
└── tsconfig.json           # TypeScript config
```
