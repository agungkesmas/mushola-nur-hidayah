# Mushola Nur Hidayah

> Aplikasi Al-Qur'an & ibadah untuk jamaah **Mushola Nur Hidayah** — Griya Lurah Asri.

Fork dari [Quran Saku](https://github.com/ahlanhabib/Quran-Saku) yang di-rebrand dan dilengkapi integrasi Supabase serta konfigurasi Vercel untuk deployment cepat.

## Fitur

- Al-Qur'an digital (mushaf, terjemah, tafsir, audio murattal)
- Jadwal sholat otomatis (MyQuran API)
- Pengingat ibadah rutin + notifikasi push (web push)
- Tasbih counter, arah kiblat, kalender Hijriyah
- Khutbah Jumat generator (Google Gemini AI)
- Tanya Ustadz AI
- Doa harian, dzikir pagi/petang, asmaul husna, kisah 25 nabi
- Jurnal ibadah harian
- Radio Islam streaming
- Kalkulator zakat & waris
- Profil mushola: **Mushola Nur Hidayah — Griya Lurah Asri**

## Stack

| Layer        | Tech                                           |
|--------------|------------------------------------------------|
| Frontend     | React 19 + Vite 6 + Tailwind CSS 4             |
| Backend      | Express (serverless on Vercel)                 |
| Database     | Supabase (Postgres + RLS)                      |
| AI           | Google Gemini                                  |
| Push         | web-push (VAPID)                               |
| Mobile       | Capacitor (Android/iOS — optional)             |
| Hosting      | Vercel                                         |

## Struktur Folder

```
.
├── api/
│   └── [[...slug]].ts        # Vercel serverless entry (catch-all)
├── src/
│   ├── server/
│   │   └── app.ts            # Express app factory (getApp)
│   ├── components/           # React components
│   ├── lib/
│   │   └── supabase.ts       # Supabase browser client
│   ├── data/                 # Static data (doa, fikih, etc.)
│   ├── App.tsx               # Main app shell
│   ├── data.ts
│   ├── types.ts
│   └── main.tsx
├── supabase/
│   ├── config.toml           # Supabase CLI config
│   ├── migrations/           # SQL migrations
│   └── seed.sql              # Seed data
├── public/                   # Static assets
├── server.ts                 # Local dev entrypoint
├── vite.config.ts
├── vercel.json               # Vercel deployment config + cron
├── .env.example
└── package.json
```

## Setup Lokal

1. **Clone & install:**
   ```bash
   npm install
   ```

2. **Salin env:**
   ```bash
   cp .env.example .env.local
   # Isi GEMINI_API_KEY dan VITE_SUPABASE_* bila perlu
   ```

3. **Jalankan dev server:**
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000

## Setup Supabase

Migrasi sudah disiapkan di `supabase/migrations/`. Untuk menerapkan:

```bash
# Install Supabase CLI bila belum
npm install -g supabase

# Link ke project (gunakan DB password Anda)
supabase link --project-ref YOUR_PROJECT_REF

# Push schema
supabase db push

# Atau jalankan seed manual
supabase db execute --file supabase/seed.sql
```

Atau jalankan langsung SQL via Dashboard > SQL Editor.

## Deploy ke Vercel

Repo ini sudah dikonfigurasi untuk Vercel:

1. Import repo ke Vercel (auto-detect Vite + `vercel.json`)
2. Set Environment Variables:
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy

Vercel Cron otomatis memanggil `/api/push/trigger-cron` setiap menit untuk pengiriman notifikasi sholat.

## Lisensi

Mengikuti repo asli [Quran Saku](https://github.com/ahlanhabib/Quran-Saku).
