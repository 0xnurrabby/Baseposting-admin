<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=Baseposting+Admin&fontSize=44&fontColor=000000&fontAlignY=38&desc=Admin+dashboard+for+managing+BasePosting+Redis+data+and+stats&descAlignY=58&descSize=14&animation=fadeIn" width="100%"/>

<div align="center">

[![License](https://img.shields.io/badge/MIT-bbf7d0?style=for-the-badge&logoColor=000)](LICENSE)
[![Platform](https://img.shields.io/badge/Next.js-bfdbfe?style=for-the-badge&logoColor=000)]()
[![Tech](https://img.shields.io/badge/TypeScript%20%2B%20Tailwind-fde68a?style=for-the-badge&logoColor=000)]()

</div>

<div align="center">
<i>A protected admin panel for BasePosting that lets you view Redis stats, inspect keys, manage leaderboard data, and monitor usage charts.</i>
</div>

---

## ✦ Features

<div align="center">

| | Feature | What it does |
|:---:|---|---|
| 🔐 | Password-protected login | Session-based auth before any data is visible |
| 📊 | KPI cards | Shows total keys, memory usage, connected clients |
| 📈 | Charts | Line and pie charts for usage patterns over time |
| 🔑 | Key browser | Search and filter Redis keys by pattern and type |
| 🔍 | Key detail panel | Inspect individual key values, TTL, and type info |
| 🗑️ | Key management | View and delete keys from the admin interface |

</div>

---

## ✦ Download & Run

**Step 1** .... Clone the repo

```bash
git clone https://github.com/0xnurrabby/Baseposting-admin
cd Baseposting-admin
```

**Step 2** .... Install and configure

```bash
npm install
# or
bun install

cp .env.example .env.local
# Fill in your Redis and auth credentials
```

**Step 3** .... Start dev server

```bash
npm run dev
# or
bun dev
# Open http://localhost:3000
```

---

## ✦ Setup

```
1. Clone the repo
2. Run npm install (or bun install)
3. Copy .env.example to .env.local
4. Fill in:
   UPSTASH_REDIS_REST_URL=your_url
   UPSTASH_REDIS_REST_TOKEN=your_token
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD=your_password
5. Run npm run dev
6. Open http://localhost:3000 and log in
```

---

## ✦ Project Structure

```
Baseposting-admin/
  app/
    api/              ->  Next.js API routes (auth, dashboard, keys)
    components/       ->  UI components (KeyList, KpiCard, ChartCard, etc.)
    lib/              ->  types, utilities
    page.tsx          ->  main dashboard page
    layout.tsx        ->  root layout
    globals.css
  middleware.ts        ->  session auth middleware
  next.config.mjs
  tailwind.config.ts
  package.json
```

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer&animation=fadeIn" width="100%"/>

<div align="center">MIT License .... built by <a href="https://github.com/0xnurrabby">0xnurrabby</a></div>
