<div align="center">

# 🛡️ Cyber Shield

**An Arabic web platform that helps people detect phishing and suspicious links before it's too late.**

![HTML5](https://img.shields.io/badge/HTML5-0b1730?style=for-the-badge&logo=html5&color=0b1730&labelColor=0b1730&logoColor=c9ced8) ![CSS3](https://img.shields.io/badge/CSS3-0b1730?style=for-the-badge&logo=css3&color=0b1730&labelColor=0b1730&logoColor=c9ced8) ![JavaScript](https://img.shields.io/badge/JavaScript-0b1730?style=for-the-badge&logo=javascript&color=0b1730&labelColor=0b1730&logoColor=c9ced8) ![MIT_License](https://img.shields.io/badge/MIT_License-0b1730?style=for-the-badge&logo=opensourceinitiative&color=0b1730&labelColor=0b1730&logoColor=c9ced8)

</div>

---

## 📸 Screenshots

| Home | Link check — high risk |
|------|------------------------|
| ![Home](screenshots/desktop-hero.png) | ![High risk](screenshots/desktop-checker-high-risk.png) |

| Features | Mobile |
|----------|--------|
| ![Features](screenshots/desktop-features.png) | ![Mobile](screenshots/mobile-hero.png) |


## 🗂️ Phishing database

Besides analysing the shape of the link, the checker looks the domain up in a database of **reported phishing domains** built from public feeds:

| Source | Content |
|---|---|
| [OpenPhish](https://openphish.com/) | Live phishing URLs (community feed) |
| [Phishing.Database](https://github.com/Phishing-Database/Phishing.Database) | Active phishing domains |

`scripts/build-threat-db.js` downloads the feeds, removes duplicates and splits the hosts into 256 small shard files (`data/threats/`). The browser downloads only the one shard that can contain the domain, so lookups stay fast and the link never leaves the user's device.

The deploy workflow rebuilds the database **every day** and on every push. To build it locally:

```bash
npm run build:threats
npm start
```

## ✨ Features

- **Link checker** — paste any link and get a safety score (0–100%), a risk level (safe / medium / high) and the reasons behind it.
- **Smart heuristics** — phishing keywords, risky domain extensions (`.top`, `.xyz`, …), plain HTTP, IP-address hosts, `@` tricks, punycode, URL shorteners, brand look-alikes and more.
- **Statistics** with animated counters.
- **Customer reviews** — visitors can add their own review (saved in the browser).
- **FAQ accordion** and a validated **contact form**.
- Fully **responsive**, RTL Arabic layout, animated background, no frameworks.

> The analysis runs 100% in the browser. Links are never sent to a server. It is a heuristic check meant for awareness, not a replacement for a full security scanner.

## 🚀 Getting Started

No build step and no dependencies.

```bash
git clone https://github.com/fay-naif/Cyber-Shield.git
cd Cyber-Shield
# open index.html in your browser, or serve it:
npx serve .
```

Run the analyzer tests (Node 18+):

```bash
npm test
```

## 🧠 How the score works

Every link starts at **100%**. Each warning sign removes points, for example:

| Signal | Points |
|--------|--------|
| Phishing keyword (`verify`, `bank`, `secure`, `login` …) | −15 each |
| Risky extension (`.top`, `.xyz`, `.zip` …) | −20 |
| No HTTPS | −15 |
| IP address instead of a domain | −30 |
| `@` in the link | −25 |
| Brand look-alike (e.g. `paypal-support.help`) | −30 |

`≥ 80%` safe · `50–79%` medium risk · `< 50%` high risk.
Example: `https://secure-bank-verify.top` → **35% — high risk** (`verify - bank - secure`).

## 🛠️ Tech Stack

- HTML5 · CSS3 (custom properties, grid, flexbox) · Vanilla JavaScript (ES6+)
- Canvas API for the background · IntersectionObserver for animations · localStorage for reviews

## 📁 Project Structure

```
Cyber-Shield/
├── index.html
├── assets/
│   └── icons/            # SVG icons + favicon
├── css/
│   ├── variables.css     # colours, spacing, fonts
│   ├── base.css          # reset + base elements
│   ├── layout.css        # containers & sections
│   ├── animations.css
│   ├── responsive.css
│   ├── components/       # buttons, cards, forms, toast
│   └── sections/         # header, hero, stats, features, checker, reviews, faq, footer
├── js/
│   ├── main.js           # entry point
│   ├── core/
│   │   └── link-analyzer.js   # URL risk scoring (pure logic)
│   ├── modules/          # navigation, particles, reveal, counters, link-checker, reviews, faq, contact-form
│   └── utils/            # dom, storage, toast helpers
├── tests/
│   └── link-analyzer.test.mjs
├── docs/
│   └── ARCHITECTURE.md
└── screenshots/
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## 👩‍💻 Author

**Fay Naif** — [GitHub](https://github.com/fay-naif)

## 📄 License

Released under the [MIT License](LICENSE).
