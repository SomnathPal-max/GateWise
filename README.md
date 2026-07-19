# GateWise 🎟️

**AI Fan Navigator** — a smart stadium companion that helps fans navigate live crowd conditions, find the fastest routes, and stay informed during events.

🔗 **Live demo:** [gate-wise-liard.vercel.app](https://gate-wise-liard.vercel.app/)

---

## Overview

GateWise is an AI-powered fan experience app for stadiums and large venues. It combines **live crowd density data**, **an AI concierge**, and **real-time incident alerts** to help fans get to their seats safely and quickly — even when gates close unexpectedly or crowds spike.

Built as a Google AI Studio app, GateWise blends a conversational AI interface with live operational data to act as a personal stadium guide.

---

## ✨ Features

### 🗺️ Stadium Pulse (Live Map)
- Real-time **crowd density heatmap** of the venue (color-coded by concourse/section)
- **Forecast overlay** showing predicted density 30 minutes ahead
- Live **match/event clock**
- One-tap **incident reporting**

### 💬 Ask GateWise (AI Concierge)
- Conversational AI assistant that answers questions like *"What's the best route to Section 214?"*
- Personalized recommendations based on the fan's profile and seat section
- Transparent reasoning — shows *why* a route was suggested, based on live data
- Quick actions like **"Find Least Crowded Gate"**

### 🔔 Proactive Alerts
- Push-style **incident alerts** (e.g., gate closures, security checks)
- Severity tagging (e.g., `CRITICAL`)
- Timestamped alert feed

### 👤 Fan Profile
- Set your **seat section** for personalized routing
- **Live Beacon GPS** toggle for auto-refreshing location
- **Accessibility mode** for step-free route requirements
- Language selection

### 🧪 Dev Data Console (Jury/Demo Mode)
- Simulate live stadium conditions manually or via pasted JSON state
- **Crowd density forecast vs. historical** chart per concourse
- **Gate capacity simulators** — sliders to test different load scenarios per gate
- Test feed / test nudge buttons for demoing alerts without live data

---

## 🖼️ Screenshots

| Live Map | AI Concierge |
|---|---|
| Crowd density heatmap with forecast overlay | Personalized routing with reasoning |

| Alerts | Fan Profile | Dev Console |
|---|---|---|
| Real-time incident alerts | Seat, GPS & accessibility settings | Simulate crowd data & gate capacity |

---

## 🛠️ Tech Stack

> Built with [Google AI Studio](https://ai.google.dev/aistudio) and deployed on [Vercel](https://vercel.com/).

- Frontend: *(update with your stack — e.g., React, TypeScript, Tailwind CSS)*
- AI: Google AI Studio / Gemini-powered concierge
- Hosting: Vercel

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/<your-username>/gatewise.git
cd gatewise

# Install dependencies
npm install

# Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 📦 Environment Variables

> If your AI concierge relies on an API key, list it here, e.g.:

```
GEMINI_API_KEY=your_api_key_here
```

---

## 🗂️ Project Structure

```
gatewise/
├── components/       # UI components (map, chat, alerts, profile)
├── pages/            # App routes
├── public/            # Static assets
└── ...
```

*(Update this section to match your actual folder layout.)*

---

## 🧭 Roadmap

- [ ] Live GPS beacon integration
- [ ] Multi-language support expansion
- [ ] Real-time crowd data ingestion from venue sensors
- [ ] Push notifications for mobile

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/<your-username>/gatewise/issues).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgments

- Built with Google AI Studio
- Deployed on Vercel
