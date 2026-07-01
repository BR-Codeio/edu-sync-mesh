# 🚀 Edu-Sync Mesh

**Offline-first AI tutoring platform bridging the rural-urban learning gap in Zimbabwe.**

Built for the All-University IT Hackathon 2026.

![Status](https://img.shields.io/badge/status-hackathon%20prototype-B85042)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Tailwind-2E7D32)

---

## The Problem

Rural Zimbabwean students face a 43-point ZIMSEC pass rate gap compared to urban students (35% vs 78%), driven by data costs (1GB ≈ 20% of a rural family's weekly income), unreliable electricity, and lack of internet infrastructure — not lack of willingness to learn.

## The Solution

Edu-Sync Mesh brings the cloud to the village instead of trying to bring the internet to the village:

1. **Village Hub** — a $50 Raspberry Pi running a local Wi-Fi hotspot, hosting the ZIMSEC curriculum and a quantized offline LLM tutor. No internet connection required, runs on a car battery.
2. **Data Mule Sync** — teachers or commuters carry updates between town and village automatically via their phones; no fiber cable needed.
3. **Gamified P2P Sharing** — students share downloaded lessons with each other over Wi-Fi Direct and earn "Edu-Coins."

This repo contains the interactive prototype (PWA) used to demo those three ideas.

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- lucide-react (icons)

## Getting Started

```bash
git clone https://github.com/brightonrusere87-coder/edu-sync-mesh.git
cd edu-sync-mesh
npm install
npm run dev
```

Then open the local URL Vite prints (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Project Structure

```
edu-sync-mesh/
├── src/
│   ├── App.jsx        # Main application (Home, Library, AI Tutor, P2P Share tabs)
│   ├── main.jsx        # React entry point
│   └── index.css       # Tailwind entry
├── public/
│   └── favicon.svg
├── docs/
│   ├── TECHNICAL_DOCUMENTATION.md   # Full architecture, deployment & business plan
│   └── Edu-Sync-Mesh-Hackathon-Pitch.pptx  # Pitch deck
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## What's Demoed in the Prototype

- **Home** — impact stats, feature overview, continue-learning list
- **Library** — offline-downloaded ZIMSEC lessons, share-to-earn-coins
- **AI Tutor** — simulated offline chatbot responding in Shona and English
- **P2P Share** — Wi-Fi Direct-style content sharing with an Edu-Coins leaderboard
- **Data Mule Sync** — simulated sync progress bar for the Village Hub

> Note: The AI responses, sync progress, and network status in this prototype are simulated in the frontend for demo purposes. `docs/TECHNICAL_DOCUMENTATION.md` describes how the real Raspberry Pi Village Hub, offline LLM, and CouchDB/PouchDB sync layer would be implemented.

## Documentation

Full technical architecture, deployment roadmap, business model, and the hackathon pitch script live in [`docs/TECHNICAL_DOCUMENTATION.md`](docs/TECHNICAL_DOCUMENTATION.md).

## License

MIT — see [LICENSE](LICENSE).

## Author

Brighton — Zimbabwe Open University, BSc Information Technology.
