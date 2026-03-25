# AI HUB 🤖

Multi AI scraper backend + web UI. Semua AI dalam satu tempat.

## Struktur Project

```
ai-hub/
├── index.js              ← Server utama (JS)
├── package.json
├── tsconfig.json
├── setup.sh              ← Script setup otomatis
├── src/
│   └── handlers/         ← Scraper TS asli (taruh di sini)
│       ├── gpt.ts
│       ├── gemini.ts
│       ├── deepseek.ts
│       └── ... (semua .ts)
├── dist/
│   └── handlers/         ← Hasil compile TS → JS (auto-generated)
└── public/
    └── index.html        ← Web UI
```

## Setup di Termux

### 1. Copy semua file scraper TS ke src/handlers/
```bash
cp /path/to/scrapers/*.ts src/handlers/
```

### 2. Jalankan setup otomatis
```bash
bash setup.sh
```

Script ini akan:
- Install semua npm dependencies
- Compile TypeScript → JavaScript ke `dist/handlers/`

### 3. Jalankan server
```bash
node index.js
```

### 4. Buka web UI
Buka browser, akses: `http://localhost:3000`

---

## Manual Setup (kalau setup.sh gagal)

```bash
# Install deps
npm install

# Compile TS
npx tsc

# Jalankan
node index.js
```

---

## API Endpoints

| Endpoint | Method | Param | Keterangan |
|----------|--------|-------|------------|
| `GET /api` | GET | - | List semua route yang loaded |
| `GET /api/gpt` | GET | `q` | GPT-4o |
| `GET /api/gemini` | GET | `q` | Google Gemini |
| `GET /api/deepseek` | GET | `q` | DeepSeek |
| `GET /api/grok` | GET | `q` | Grok |
| `GET /api/kimi` | GET | `q` | Kimi K2 |
| `GET /api/claude` | GET | `text` | Claude Haiku |
| `GET /api/fluximg` | GET | `prompt` | Flux image gen |
| `GET /api/text2img` | GET | `q` | Text to image |
| `GET /api/petimg` | GET | `q` | Pet image gen |
| `GET /api/nanobanana` | GET | `imageUrl&prompt` | Magic eraser |
| `GET /api/seaart` | GET | `q` | SeaArt chat |
| ... | | | |

Cek semua route yang berhasil load: `GET /api`

---

## Troubleshooting

### Error: `dist/handlers/ tidak ditemukan`
Belum compile. Jalankan:
```bash
npx tsc
```

### Handler gagal load
Cek `/api` untuk lihat error per handler. Biasanya karena:
- TypeScript compile error di file tsnya
- Dependency kurang

### Port sudah dipakai
```bash
PORT=4000 node index.js
```
