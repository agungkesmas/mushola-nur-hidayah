import express, { Request, Response, NextFunction } from "express";
import path from "path";
import webpush from "web-push";
import fs from "fs";

// =====================================================================
// Groq API client (OpenAI-compatible REST)
// =====================================================================
// Groq exposes an OpenAI-compatible /v1/chat/completions endpoint.
// We use plain fetch() so no extra SDK dependency is required.
// Default model: llama-3.3-70b-versatile (fast, capable, Indonesian OK).
//
// Server-side key is injected via GROQ_API_KEY env var. Clients may
// also pass `apiKey` in the request body to override (legacy support).

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callGroq(
  messages: GroqMessage[],
  options: {
    apiKey?: string;
    model?: string;
    temperature?: number;
    jsonMode?: boolean;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const apiKey = (options.apiKey || process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY belum dikonfigurasi di server.");
  }

  const body: Record<string, unknown> = {
    model: options.model || GROQ_DEFAULT_MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
  };
  if (options.maxTokens) body.max_tokens = options.maxTokens;
  if (options.jsonMode) body.response_format = { type: "json_object" };

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    let errMessage = `Groq API ${response.status} ${response.statusText}`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson?.error?.message) errMessage = errJson.error.message;
    } catch {
      if (errText) errMessage += ` — ${errText.slice(0, 300)}`;
    }
    throw new Error(errMessage);
  }

  const data: any = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned empty response");
  return text as string;
}

// V2 to V3 City ID Map and resolver
const V2_TO_V3_MAP: Record<string, string> = {
  "1301": "58a2fc6ed39fd083f55d4182bf88826d", // KOTA JAKARTA
  "1210": "c1f71dfbc62b7ff017f7872f0dbb2247", // KOTA BANDUNG
  "1638": "4734ba6f3de83d861c3176a6273cac6d", // KOTA SURABAYA
  "1430": "577ef1154f3240ad5b9b413aa7346a1e", // KOTA YOGYAKARTA
  "0115": "2838023a778dfaecdc212708f721b788", // KOTA MEDAN
  "2212": "b7b16ecf8ca53723593894116071700c", // KOTA MAKASSAR
  "1708": "6a9aeddfc689c1d0e3b9ccc3ab651bc5", // KOTA DENPASAR
  "1505": "e96ed478dab8595a7dbda4cbcbee168f", // KAB. SEMARANG
  "0814": "1afa34a7f984eeabdbb0a7d494132ee5", // KOTA PALEMBANG
  "1810": "00411460f7c92d2124a67ea0f4cb5f85", // KOTA BALIKPAPAN
  "2115": "550a141f12de6341fba65b0ad0433500"  // KOTA MANADO
};

function resolveCityId(id: string): string {
  if (V2_TO_V3_MAP[id]) {
    return V2_TO_V3_MAP[id];
  }
  if (/^\d+$/.test(id)) {
    return "58a2fc6ed39fd083f55d4182bf88826d"; // Fallback KOTA JAKARTA
  }
  return id;
}

let vapidKeys: { publicKey: string; privateKey: string } | null = null;

async function setupSystem() {
  // Try to load VAPID keys from Supabase (system_config table).
  // Falls back to local vapid.json or ephemeral in-memory keys.
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("system_config").select("value").eq("key", "vapidKeys").maybeSingle();
      if (!error && data?.value) {
        vapidKeys = data.value as { publicKey: string; privateKey: string };
        console.log("[setupSystem] Loaded VAPID keys from Supabase system_config");
      }
    } catch (e) {
      console.warn("[setupSystem] Supabase VAPID key lookup failed:", (e as Error)?.message);
    }
  }

  // Fallback: generate or load from local file
  if (!vapidKeys) {
    try {
      // On Vercel serverless, the filesystem is read-only — we cannot
      // persist vapid.json. Generate ephemeral keys instead.
      if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        vapidKeys = webpush.generateVAPIDKeys();
        console.log("[setupSystem] Generated ephemeral VAPID keys (serverless)");
      } else if (fs.existsSync("vapid.json")) {
        vapidKeys = JSON.parse(fs.readFileSync("vapid.json", "utf8"));
      } else {
        vapidKeys = webpush.generateVAPIDKeys();
        try {
          fs.writeFileSync("vapid.json", JSON.stringify(vapidKeys));
        } catch (writeErr) {
          console.warn("[setupSystem] Could not persist vapid.json:", (writeErr as Error)?.message);
        }
      }

      // Persist the freshly generated keys to Supabase for reuse
      if (sb && vapidKeys) {
        try {
          await sb.from("system_config").upsert({
            key: "vapidKeys",
            value: vapidKeys,
            updated_at: new Date().toISOString(),
          }, { onConflict: "key" });
          console.log("[setupSystem] Persisted new VAPID keys to Supabase system_config");
        } catch (e) {
          console.warn("[setupSystem] Could not persist VAPID keys to Supabase:", (e as Error)?.message);
        }
      }
    } catch (e) {
      console.warn("[setupSystem] VAPID key generation fallback failed, generating in-memory:", (e as Error)?.message);
      vapidKeys = webpush.generateVAPIDKeys();
    }
  }

  // Configure web-push with the resolved VAPID keys
  try {
    const vapidSubject =
      process.env.VAPID_SUBJECT ||
      "mailto:agung.kesmas@gmail.com";
    webpush.setVapidDetails(
      vapidSubject,
      vapidKeys!.publicKey,
      vapidKeys!.privateKey
    );
  } catch (e) {
    console.error("[setupSystem] webpush.setVapidDetails failed:", (e as Error)?.message);
    // Don't rethrow — the app should still respond to API requests
    // even if push notifications are unavailable.
  }
}

// ============================================
// SUPABASE FOR SUBSCRIPTIONS (replaces Firebase Firestore)
// ============================================
// We use Supabase for persistent storage of push subscriptions and
// system config (VAPID keys). The client is created lazily so that
// missing credentials don't crash the function at module load time.
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[supabase] SUPABASE_URL or SUPABASE_*_KEY not set, running in memory-only mode");
    return null;
  }
  try {
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return supabaseClient;
  } catch (e) {
    console.warn("[supabase] Failed to init Supabase client:", (e as Error)?.message);
    return null;
  }
}

// In-Memory map just as a fallback or cache
let subscriptions: Record<string, any> = {};

function endpointToId(endpoint: string): string {
  return Buffer.from(endpoint).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// We will fetch subscriptions dynamically from Supabase when running the cron.
async function getAllSubscriptions() {
  const sb = getSupabase();
  if (!sb) return subscriptions; // fallback
  try {
    const { data, error } = await sb.from("push_subscriptions").select("id, subscription, city_id, selected_city, sholat_schedule, rutin_reminders, timezone");
    if (error) throw error;
    const subs: Record<string, any> = {};
    for (const row of data || []) {
      // Reconstruct the same shape Firestore used to return
      subs[row.subscription?.endpoint || row.id] = {
        subscription: row.subscription,
        cityId: row.city_id,
        selectedCity: row.selected_city,
        sholatSchedule: row.sholat_schedule,
        rutinReminders: row.rutin_reminders,
        timezone: row.timezone,
      };
    }
    return subs;
  } catch (e) {
    console.warn("[supabase] Error fetching subscriptions:", (e as Error)?.message);
    return subscriptions; // fallback
  }
}

async function saveSubscription(endpoint: string, data: any) {
  subscriptions[endpoint] = data; // update local instantly
  const sb = getSupabase();
  if (!sb) return;
  try {
    const safeId = endpointToId(endpoint);
    const row = {
      id: safeId,
      endpoint,
      subscription: data.subscription,
      city_id: data.cityId || null,
      selected_city: data.selectedCity || null,
      sholat_schedule: data.sholatSchedule || null,
      rutin_reminders: data.rutinReminders || {},
      timezone: data.timezone || "Asia/Jakarta",
      updated_at: new Date().toISOString(),
    };
    const { error } = await sb.from("push_subscriptions").upsert(row, { onConflict: "id" });
    if (error) throw error;
  } catch (e) {
    console.warn("[supabase] Error saving subscription:", (e as Error)?.message);
  }
}

async function removeSubscription(endpoint: string) {
  delete subscriptions[endpoint];
  const sb = getSupabase();
  if (!sb) return;
  try {
    const safeId = endpointToId(endpoint);
    const { error } = await sb.from("push_subscriptions").delete().eq("id", safeId);
    if (error) throw error;
  } catch (e) {
    console.warn("[supabase] Error removing subscription:", (e as Error)?.message);
  }
}
// ------------------------

let _app: express.Application | null = null;
let _initPromise: Promise<express.Application> | null = null;

/**
 * Build (and lazily initialise) the Express application.
 * Safe to call multiple times — initialisation runs once.
 * Used by Vercel serverless entrypoint `api/[[...slug]].ts`.
 */
export async function getApp(): Promise<express.Application> {
  if (_app) return _app;
  if (!_initPromise) {
    _initPromise = (async () => {
      try {
        await setupSystem();
      } catch (e) {
        // setupSystem failures must not crash the whole function —
        // the API can still respond (push notifications may be degraded)
        console.error("[getApp] setupSystem failed (non-fatal):", (e as Error)?.message);
      }
      const app = express();
      app.use(express.json());
      try {
        registerRoutes(app);
      } catch (e) {
        console.error("[getApp] registerRoutes failed:", (e as Error)?.message);
        throw e;
      }
      _app = app;
      return app;
    })();
  }
  return _initPromise;
}

/**
 * Register all API routes on the given Express app.
 * Kept as a separate function so it can be reused in tests or
 * alternative entrypoints.
 */
function registerRoutes(app: express.Application) {

  // ---- WEB PUSH ENDPOINTS ----
  app.get("/api/push/public-key", (req, res) => {
    if (!vapidKeys) {
      return res.status(503).json({
        status: "error",
        message: "VAPID keys not yet initialised. Try again in a moment.",
      });
    }
    res.json({ publicKey: vapidKeys.publicKey });
  });

  app.post("/api/push/subscribe", async (req, res) => {
    const { subscription, cityId, rutinReminders, sholatSchedule, selectedCity, timezone } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Invalid subscription" });
    }
    
    // Fetch all current subscriptions to get existing data for merge
    const currentSubs = await getAllSubscriptions();
    const existing = currentSubs[subscription.endpoint] || {};

    const newData = { 
      ...existing,
      subscription, 
      cityId: cityId || existing.cityId, 
      rutinReminders: rutinReminders || existing.rutinReminders,
      sholatSchedule: sholatSchedule || existing.sholatSchedule,
      selectedCity: selectedCity || existing.selectedCity,
      timezone: timezone || existing.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      updatedAt: new Date().toISOString()
    };
    
    await saveSubscription(subscription.endpoint, newData);
    
    res.status(201).json({ status: "success" });
  });

  app.post("/api/push/unsubscribe", async (req, res) => {
    const { endpoint } = req.body;
    if (endpoint) {
      await removeSubscription(endpoint);
    }
    res.json({ status: "success" });
  });

  const runCronJobs = async () => {
    const now = new Date();
    const currentSubscriptions = await getAllSubscriptions();
    
    for (const [endpoint, data] of Object.entries(currentSubscriptions)) {
       const sub = data.subscription;
       if (!sub) continue;
       
       const userTz = data.timezone || "Asia/Jakarta";
       
       const formatTime = (d: Date) => {
           const parts = new Intl.DateTimeFormat("en-GB", { timeZone: userTz, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
           let hr = parts.find(p => p.type === 'hour')?.value || '00';
           if (hr === '24') hr = '00';
           const mn = parts.find(p => p.type === 'minute')?.value || '00';
           return `${hr}:${mn}`;
       };
       
       const timeStr = formatTime(now);
       const futureTimeStr = formatTime(new Date(now.getTime() + 15 * 60000));
       
       const dayStr = new Intl.DateTimeFormat("en-US", { timeZone: userTz, weekday: 'short' }).format(now).substring(0,3);
       const daysMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
       const day = daysMap[dayStr] ?? now.getDay();
       
       const dParts = new Intl.DateTimeFormat("en-US", { timeZone: userTz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
       const targetDateString = `${dParts.find(p => p.type === 'year')?.value}-${dParts.find(p => p.type === 'month')?.value}-${dParts.find(p => p.type === 'day')?.value}`;
       
       const rutin = data.rutinReminders || {};
       let jadwalToUse = data.sholatSchedule || {};
       const cityName = data.selectedCity?.lokasi || "wilayah Anda";
       const userCityId = data.cityId || data.selectedCity?.id;
       
       // Compare rutin times
       for (const key of Object.keys(rutin)) {
          const reminder = rutin[key];
          if (reminder.enable && reminder.time === timeStr) {
             if (reminder.days && Array.isArray(reminder.days) && !reminder.days.includes(day)) {
               continue;
             }

             // Custom, more meaningful messages for Dhuha & Tahajud
             let title = `Waktunya ${reminder.name}!`;
             let body = `Saatnya menunaikan kegiatan ibadah rutin Anda: ${reminder.name}.`;
             let extra: Record<string, any> = {};

             if (key === "dhuha") {
               title = "🌅 Waktu Shalat Dhuha";
               body = "Saatnya shalat Dhuha, minimal 2 rakaat. 'Setiap pagi, setiap ruas jasad setiap manusia wajib bersedekah.' (HR. Muslim)";
               extra.isAdhan = false;
               extra.prayerName = "Dhuha";
               extra.requireInteraction = false;
             } else if (key === "tahajud") {
               title = "🌙 Waktu Bangun untuk Tahajud";
               body = "Bangunlah, ambil wudhu, lalu shalat Tahajud. 'Shalat malam itu sebaik-baik shalat sunnah setelah shalat fardhu.' (HR. Muslim)";
               extra.isAdhan = false;
               extra.prayerName = "Tahajud";
               extra.requireInteraction = false;
             } else if (key === "dzikirPagi") {
               title = "🌅 Waktunya Dzikir Pagi";
               body = "Mari awali pagi dengan dzikir & wirid. 'Mereka yang berdzikir kepada Allah sambil berdiri, duduk, atau berbaring...' (QS. Ali Imran: 191)";
             } else if (key === "dzikirPetang") {
               title = "🌆 Waktunya Dzikir Petang";
               body = "Mari tutup sore dengan dzikir & wirid sebelum malam tiba.";
             } else if (key === "bacaQuran") {
               title = "📖 Waktunya Tadarus Al-Qur'an";
               body = "Jadwalkan waktu khusus membaca Al-Qur'an malam ini. 'Bacalah Al-Qur'an, sesungguhnya ia akan datang pada hari kiamat sebagai pemberi syafaat.' (HR. Muslim)";
             } else if (key === "terbit") {
               title = "🌄 Matahari Telah Terbit";
               body = "Sudah masuk waktu syuruq. Dhuha dianjurkan ~15 menit setelah syuruq.";
             } else if (key === "puasaSeninKamis") {
               title = "🍽️ Waktu Sahur (Puasa Senin-Kamis)";
               body = "Mari sahur untuk puasa sunnah hari ini. 'Amal-amal itu diserahkan kepada Allah pada hari Senin dan Kamis.' (HR. Tirmidzi)";
             }

             webpush.sendNotification(sub, JSON.stringify({
                title,
                body,
                icon: "/icons/icon-192x192.png",
                tag: `rutin-${key}`,
                ...extra,
             })).catch(async err => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                   await removeSubscription(endpoint);
                } else {
                   console.error("Push Error (Rutin):", err);
                }
             });
          }
       }
       
       // Process Sholat Schedule Push (Adhan & 15 mins Prep)
       // We only process if today matches the schedule 'date'
       if (userCityId && jadwalToUse && jadwalToUse.date !== targetDateString) {
           try {
               const resolvedId = resolveCityId(userCityId);
               const res = await fetch(`https://api.myquran.com/v3/sholat/jadwal/${resolvedId}/${targetDateString}`);
               if (res.ok) {
                   const v3Data = await res.json();
                   if (v3Data.status && v3Data.data?.jadwal) {
                       const singleJadwal = v3Data.data.jadwal[targetDateString];
                       if (singleJadwal) {
                           singleJadwal.date = targetDateString;
                           jadwalToUse = singleJadwal;
                           data.sholatSchedule = singleJadwal;
                           await saveSubscription(endpoint, data);
                       }
                   }
               }
           } catch(e) {}
       }
       
       if (jadwalToUse && jadwalToUse.date === targetDateString) {
          const mainPrayers = [
            { name: "Subuh", time: jadwalToUse.subuh },
            { name: "Dhuha", time: jadwalToUse.dhuha },
            { name: "Dzuhur", time: jadwalToUse.dzuhur },
            { name: "Ashar", time: jadwalToUse.ashar },
            { name: "Maghrib", time: jadwalToUse.maghrib },
            { name: "Isya", time: jadwalToUse.isya }
          ];
          
          for (const prayer of mainPrayers) {
            if (!prayer.time) continue;
            
            // 1. Sholat time
            if (prayer.time === timeStr) {
              webpush.sendNotification(sub, JSON.stringify({
                  title: `Waktu Sholat ${prayer.name}`,
                  body: `Telah masuk waktu sholat ${prayer.name} untuk wilayah ${cityName}.`,
                  icon: "/icons/icon-192x192.png",
                  tag: `sholat-${prayer.name.toLowerCase()}`,
                  isAdhan: true,
                  prayerName: prayer.name,
                  requireInteraction: true,
                  vibrate: [500, 200, 500, 200, 500, 200, 500, 200, 500]
              })).catch(err => console.error(err));
            }
            
            // 2. Preparation (15 mins prior)
            // Skip prep for Dhuha
            if (prayer.time === futureTimeStr && prayer.name !== "Dhuha") {
              webpush.sendNotification(sub, JSON.stringify({
                  title: `🕌 15 Menit Menuju ${prayer.name}`,
                  body: `Segera bersiap, ambil wudhu. Waktu ${prayer.name} akan masuk sebentar lagi di wilayah ${cityName}.`,
                  icon: "/icons/icon-192x192.png",
                  tag: `prep-sholat-${prayer.name.toLowerCase()}`
              })).catch(err => console.error(err));
            }
          }
       }
    }
  };

  // ---- TRIGGER CRON PUSH NOTIFICATIONS ----
  // NOTE: node-cron is intentionally disabled on Vercel serverless.
  // Use Vercel Cron Jobs (see vercel.json) to hit /api/push/trigger-cron
  // every minute, or call this endpoint manually.
  if (process.env.ENABLE_NODE_CRON === "true") {
    // Loaded lazily via dynamic require so the node-cron package is
    // only imported when explicitly enabled (it's not in package.json
    // deps by default). Cast to any to avoid TS errors when the dep
    // is absent.
    try {
      const cron = (eval('require') as (m: string) => any)("node-cron");
      cron.schedule("* * * * *", runCronJobs);
      console.log("[Mushola Nur Hidayah] node-cron scheduler enabled");
    } catch (e) {
      console.warn("[Mushola Nur Hidayah] node-cron not available, skipping");
    }
  }

  app.get("/api/push/trigger-cron", async (req, res) => {
    try {
      await runCronJobs();
      res.json({ status: "success", message: "Cron jobs manually triggered" });
    } catch (e: any) {
      res.status(500).json({ status: "error", message: e.message });
    }
  });
  // ----------------------------------------

  // API Route - Get all Sholat Cities (MyQuran v3)
  app.get("/api/sholat/kota/semua", async (req, res) => {
    try {
      const response = await fetch("https://api.myquran.com/v3/sholat/kota/semua");
      if (!response.ok) throw new Error("Gagal mengambil data kota");
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  });

  // API Route - Search Sholat City (MyQuran v3)
  app.get("/api/sholat/kota/cari/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const response = await fetch(`https://api.myquran.com/v3/sholat/kota/cari/${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Gagal mencari kota");
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  });

  // API Route - Get Sholat Schedule for specific city and date (MyQuran v3 translated to v2 format)
  app.get("/api/sholat/jadwal/:id_kota/:tahun/:bulan/:tanggal", async (req, res) => {
    try {
      const { id_kota, tahun, bulan, tanggal } = req.params;
      const resolvedId = resolveCityId(id_kota);
      const dateKey = `${tahun}-${bulan}-${tanggal}`;
      const response = await fetch(`https://api.myquran.com/v3/sholat/jadwal/${resolvedId}/${dateKey}`);
      if (!response.ok) throw new Error("Gagal mengambil jadwal sholat");
      
      const v3Data = await response.json();
      if (v3Data.status && v3Data.data?.jadwal) {
        const singleJadwal = v3Data.data.jadwal[dateKey];
        if (singleJadwal) {
          singleJadwal.date = dateKey;
          return res.json({
            status: true,
            message: "success",
            data: {
              id: v3Data.data.id,
              lokasi: v3Data.data.kabko,
              daerah: v3Data.data.prov,
              jadwal: singleJadwal
            }
          });
        }
      }
      throw new Error("Jadwal sholat tanggal tersebut tidak ditemukan");
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  });

  // API Route - Get Sholat Schedule for specific city and full month (MyQuran v3 translated to v2 format)
  app.get("/api/sholat/jadwal/:id_kota/:tahun/:bulan", async (req, res) => {
    try {
      const { id_kota, tahun, bulan } = req.params;
      const resolvedId = resolveCityId(id_kota);
      const monthKey = `${tahun}-${bulan}`;
      const response = await fetch(`https://api.myquran.com/v3/sholat/jadwal/${resolvedId}/${monthKey}`);
      if (!response.ok) throw new Error("Gagal mengambil jadwal sholat bulanan");
      
      const v3Data = await response.json();
      if (v3Data.status && v3Data.data?.jadwal) {
        // Translate to flat array if needed, or proxy directly.
        // Usually v2 returns a list of items. Let's build a compatible list.
        const list = Object.entries(v3Data.data.jadwal).map(([date, item]: [string, any]) => {
          return {
            ...item,
            date
          };
        });
        return res.json({
          status: true,
          message: "success",
          data: {
            id: v3Data.data.id,
            lokasi: v3Data.data.kabko,
            daerah: v3Data.data.prov,
            jadwal: list
          }
        });
      }
      throw new Error("Jadwal sholat bulanan tidak ditemukan");
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  });

  // API Route - Get all Quran Surahs (EQuran v2 API)
  app.get("/api/quran/surah", async (req, res) => {
    try {
      const response = await fetch("https://api.quran.gading.dev/surah");
      if (!response.ok) throw new Error("Gagal mengambil daftar surah");
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  });

  // API Route - Get Single Quran Surah Details
  app.get("/api/quran/surah/:nomor", async (req, res) => {
    try {
      const { nomor } = req.params;
      const response = await fetch(`https://api.quran.gading.dev/surah/${nomor}`);
      if (!response.ok) throw new Error(`Gagal mengambil detail surah nomor ${nomor}`);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  });

  // API Route - Get Quran Surah Tafsir (EQuran v2 API)
  app.get("/api/equran/surat", async (req, res) => {
    try {
      const response = await fetch("https://equran.id/api/v2/surat");
      if (!response.ok) throw new Error("Gagal mengambil daftar surat");
      res.json(await response.json());
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  });

  app.get("/api/equran/surat/:nomor", async (req, res) => {
    try {
      const { nomor } = req.params;
      const response = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
      if (!response.ok) throw new Error(`Gagal mengambil detail surat nomor ${nomor}`);
      res.json(await response.json());
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  });

  app.get("/api/equran/tafsir/:nomor", async (req, res) => {
    try {
      const { nomor } = req.params;
      const response = await fetch(`https://equran.id/api/v2/tafsir/${nomor}`);
      if (!response.ok) throw new Error(`Gagal mengambil tafsir surah nomor ${nomor}`);
      res.json(await response.json());
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  });

  // API Route - Reverse Geocode
  app.get("/api/ext/reverse-geocode", async (req, res) => {
    try {
      const q = new URLSearchParams(req.query as Record<string, string>).toString();
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${q}`);
      if (!response.ok) throw new Error("Gagal mengambil alokasi geocode");
      res.json(await response.json());
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  });

  // API Route - Aladhan Timings
  app.get("/api/ext/aladhan/timings/:date", async (req, res) => {
    try {
      const q = new URLSearchParams(req.query as Record<string, string>).toString();
      const response = await fetch(`https://api.aladhan.com/v1/timings/${req.params.date}?${q}`);
      if (!response.ok) throw new Error("Gagal");
      res.json(await response.json());
    } catch (error: any) {
       res.status(500).json({ status: false, message: error.message });
    }
  });

  // API Route - Aladhan Calendar
  app.get("/api/ext/aladhan/calendar/:month/:year", async (req, res) => {
    try {
      const response = await fetch(`https://api.aladhan.com/v1/gToHCalendar/${req.params.month}/${req.params.year}`);
      if (!response.ok) throw new Error("Gagal");
      res.json(await response.json());
    } catch (error: any) {
       res.status(500).json({ status: false, message: error.message });
    }
  });

  // API Route - Hadith
  app.get("/api/ext/hadith/books", async (req, res) => {
    try {
      const response = await fetch("https://hadis-api-id.vercel.app/hadith");
      if (!response.ok) throw new Error("Gagal mengambil data perawi");
      const data = await response.json();
      
      const formattedData = data.map((perawi: any) => ({
        id: perawi.slug,
        name: perawi.name,
        available: perawi.total
      }));
      
      res.json({ code: 200, data: formattedData });
    } catch (error: any) {
       res.status(500).json({ status: false, message: error.message });
    }
  });

  app.get("/api/ext/hadith/books/:id", async (req, res) => {
    try {
      const rangeParams = (req.query as Record<string, string>).range as string;
      let start = 1;
      let end = 50;
      if (rangeParams) {
        const parts = rangeParams.split('-');
        if (parts.length === 2) {
          start = parseInt(parts[0], 10) || 1;
          end = parseInt(parts[1], 10) || 50;
        }
      }
      
      const { id } = req.params;
      
      const limit = end - start + 1;
      const page = Math.floor((start - 1) / limit) + 1;
      
      const response = await fetch(`https://hadis-api-id.vercel.app/hadith/${id}?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("Gagal mengambil data hadits");
      const data = await response.json();
      
      const hadiths = (data.items || []).map((i: any) => ({
         number: i.number,
         arab: i.arab,
         id: i.id
      }));
      
      res.json({
         code: 200,
         data: { id, hadiths }
      });
    } catch (error: any) {
       res.status(500).json({ status: false, message: error.message });
    }
  });

  // API Route - Generate Khutbah (Groq)
  app.post("/api/generate-khutbah", async (req, res) => {
    try {
      const { tema, judul, apiKey, tanyaUstadzContext } = req.body;

      // Determine which key to use — server-side GROQ_API_KEY takes
      // priority; client-supplied apiKey is a fallback.
      const effectiveKey = (process.env.GROQ_API_KEY || apiKey || "").trim();
      if (!effectiveKey) {
        return res.status(401).json({
          error: "GROQ_API_KEY belum dikonfigurasi di server. Tambahkan key di Vercel Project Settings > Environment Variables.",
        });
      }

      const promptText = `
Anda adalah seorang ulama tingkat tinggi dan penulis naskah Khutbah Jumat profesional di Indonesia.
Tugas Anda: Buatkan naskah Khutbah Jumat yang lengkap, mendalam, dan terstruktur sesuai sunnah dengan tema: "${tema}" ${judul ? `(Judul: ${judul})` : ''}.
${tanyaUstadzContext ? `\nRiwayat percakapan jamaah sebelumnya mengenai topik ini:\n"${tanyaUstadzContext}"\nSilakan jadikan riwayat pertanyaan dan jawaban tersebut sebagai landasan cerita atau bahasan utama dalam isi khutbah Anda.\n` : ""}
Pastikan panjangnya cukup untuk khutbah nyata (sekitar 10-15 menit dibaca). Gunakan bahasa Indonesia yang baku, menyentuh hati, namun tegas.

Struktur Output JSON yang HARUS dikembalikan persis seperti ini:
{
  "title": "Judul Khutbah (Singkat dan Menarik)",
  "author": "AI Ustadz / Nama Anda",
  "tema": "Topik ringkas (Maksimal 2-3 kata)",
  "ringkasan": "Satu kalimat ringkasan",
  "muqaddimah": "الْحَمْدُ لِلَّهِ الَّذِي... (Teks Arab lengkap Muqaddimah: memuat Tahmid, Shalawat, Syahadat, dan Wasiat Takwa)",
  "content": [
    // Array dari block konten. Kombinasikan "text" (paragraf narasi), "quran" (ayat), "hadith" (hadis), "points" (poin-poin pesan), dan selalu diakhiri dengan "doa" (doa bahasa Indonesia di akhir khutbah pertama).
  ],
  "penutup": "بَارَكَ اللهُ لِيْ وَلَكُمْ فِي الْقُرْآنِ الْعَظِيْمِ... (Teks Arab lengkap Penutup / Khutbah Kedua)"
}

Untuk "content", struktur block yang diijinkan adalah:
1. Text biasa: { "type": "text", "text": "Paragraf narasi khutbah yang mendalam..." }
2. Kutipan Qur'an: { "type": "quran", "arabic": "tulisan arab ayat", "translation": "terjemahan", "source": "QS. Nama Surat: Ayat" }
3. Kutipan Hadis: { "type": "hadith", "arabic": "tulisan arab hadis", "translation": "terjemahan", "source": "HR. Sesuatu" }
4. Poin-poin/Penjelasan: { "type": "points", "intro": "Berikut adalah kiat-kiat:", "items": [ { "title": "1. Poin Satu", "desc": "Penjelasan" } ] }
5. Doa Penutup Khutbah Pertama: { "type": "doa", "text": "Ya Allah, jadikanlah kami..." }

PENTING:
- Di dalam array "content", HARUS memuat minimal 2-3 dalil (Quran/Hadis).
- Di akhir array "content", SELALU letakkan block "doa" yang berisi doa merenung/intropeksi berbahasa Indonesia untuk menutup khutbah pertama sebelum duduk di antara dua khutbah.
- Kembalikan HANYA JSON valid. Jangan gunakan markdown block (\`\`\`json).`;

      const responseText = await callGroq(
        [
          {
            role: "system",
            content: "Anda adalah asisten AI yang ahli dalam penyusunan naskah Khutbah Jumat Islami. Selalu kembalikan output sebagai JSON valid sesuai struktur yang diminta, tanpa pembungkus markdown.",
          },
          { role: "user", content: promptText },
        ],
        {
          apiKey: effectiveKey,
          temperature: 0.7,
          jsonMode: true,
          maxTokens: 8000,
        }
      );

      if (!responseText) {
        throw new Error("Empty response from Groq");
      }

      let parsedKhutbah: any;
      try {
        parsedKhutbah = JSON.parse(responseText);
      } catch (err) {
        // Try to extract JSON from possible markdown wrappers
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedKhutbah = JSON.parse(jsonMatch[0]);
          } catch {
            throw new Error("Gagal mengurai format JSON dari AI. Raw: " + responseText.slice(0, 300));
          }
        } else {
          throw new Error("Gagal mengurai format JSON dari AI. Raw: " + responseText.slice(0, 300));
        }
      }

      parsedKhutbah.id = Date.now();
      parsedKhutbah.provider = "groq";
      res.json(parsedKhutbah);
    } catch (error: any) {
      console.error("[generate-khutbah] AI Error:", error);
      res.status(500).json({ error: error.message || "Terjadi kesalahan saat membuat khutbah." });
    }
  });

  // API Route - Ask AI Scholar about verse or spiritual guidance (Groq)
  app.post("/api/ask-ai", async (req, res) => {
    try {
      const { prompt, verseText, context, apiKey } = req.body;
      const effectiveKey = (process.env.GROQ_API_KEY || apiKey || "").trim();

      if (!effectiveKey) {
        return res.status(403).json({
          status: false,
          message: "GROQ_API_KEY belum dikonfigurasi di server. Tambahkan key di Vercel Project Settings > Environment Variables.",
          isConfigured: false,
        });
      }

      const queryPrompt = `
Konteks: ${context || "Tanya Umum tentang Al-Qur'an"}
${verseText ? `Ayat Al-Qur'an Yang Sedang Dibahas:\n"${verseText}"` : ""}

Pertanyaan Pengguna:
${prompt}

Tolong jawab pertanyaan ini dengan hikmah, berikan referensi spesifik dari Al-Qur'an maupun sabda Rasulullah (Hadits) yang relevan secara tegas beserta porsi teks asli dan maknanya agar menguatkan keimanan. Pastikan mencantumkan nama Surah dan nomor ayat (misal: QS. Al-Baqarah: 255) atau perawi Hadits (misal: HR. Bukhari).
`;

      const systemInstruction =
        "Anda adalah asisten AI 'Tanya Ustadz AI' di dalam aplikasi 'Mushola Nur Hidayah'. Anda adalah seorang Ulama Mufassir yang sangat berpengetahuan tentang Al-Qur'an, asbabun nuzul, serta ilmu Hadits. Tugas Anda adalah: memberikan jawaban Islami secara komprehensif yang WAJIB merujuk pada ayat-ayat suci Al-Qur'an dan juga menyertakan riwayat Hadits yang selaras (Kutubus Sittah) dalam menjawab isu umat. Di setiap jawaban yang melibatkan saran, doa, atau dalil, berikan kutipan bahasa Arab, terjemahan Indonesia, serta referensi letaknya (contoh: QS. Al-Baqarah: 120 atau HR. Bukhari). Formatlah teks menggunakan Markdown dengan rapi.";

      let retries = 2;
      let finalResponse: string | null = null;
      let lastError: any = null;

      while (retries > 0) {
        try {
          finalResponse = await callGroq(
            [
              { role: "system", content: systemInstruction },
              { role: "user", content: queryPrompt },
            ],
            {
              apiKey: effectiveKey,
              temperature: 0.7,
              maxTokens: 4000,
            }
          );
          break; // Success, exit loop
        } catch (error: any) {
          lastError = error;
          const msg = (error?.message || "").toLowerCase();
          // Retry on transient Groq errors (529 = overloaded, 503, rate-limit)
          if (msg.includes("529") || msg.includes("503") || msg.includes("overloaded") || msg.includes("rate limit")) {
            retries--;
            if (retries > 0) {
              console.log("[ask-ai] Groq transient error. Retrying in 1.5s...", error?.message);
              await new Promise((r) => setTimeout(r, 1500));
            }
          } else {
            throw error;
          }
        }
      }

      if (!finalResponse && lastError) {
        throw lastError;
      }

      res.json({
        status: true,
        answer: finalResponse || "",
        isConfigured: true,
        provider: "groq",
      });
    } catch (error: any) {
      console.error("[ask-ai] AI Error:", error);
      let errorMsg = error.message;
      if (errorMsg?.includes("529") || errorMsg?.includes("overloaded")) {
        errorMsg = "Server Groq saat ini sedang sibuk (overloaded). Mohon coba beberapa saat lagi.";
      }
      res.status(500).json({ status: false, message: errorMsg });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", url: req.url, originalUrl: req.originalUrl, path: req.path });
  });

  app.get("/debug-url", (req, res) => {
    res.json({ url: req.url, originalUrl: req.originalUrl, path: req.path });
  });

  // In production (Vercel), static files are served by the CDN.
  // We still register a SPA fallback for non-API routes so that
  // serverless invocations for unknown paths return index.html.
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    // Don't intercept API routes
    if (req.path.startsWith("/api/")) return next();
    const indexFile = path.join(distPath, "index.html");
    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      next();
    }
  });
}

// ============================================================================
// Vercel Function handler (inlined — do NOT remove this comment)
// ============================================================================

// Suppress the local-server listen block on Vercel
const _origHandler = async (req: any, res: any) => {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err: any) {
    console.error("[vercel-handler] error:", err);
    res.status(500).json({
      status: "error",
      message: err?.message || "Unknown error",
      time: new Date().toISOString(),
    });
  }
};

export default async function handler(req: any, res: any) {
  // Vercel's rewrite from /api/:path* to /api preserves the original
  // URL in req.url but appends ?path=<captured> as an extra query
  // parameter. Strip that extra param so Express sees clean URLs.
  if (req.url && req.url.includes("?path=")) {
    req.url = req.url.replace(/\?path=[^&]*/, "").replace(/\?$/, "");
  }
  return _origHandler(req, res);
}
