# 🎓 O'quv Markazlar — Telegram Mini App

O'zbekiston uchun o'quv markazlarni topish platformasi. Foydalanuvchilar Telegram orqali yaqin atrofdagi va tumanlar bo'yicha o'quv markazlarni topadi, kurslar, narxlar, lokatsiya va telefon raqamlarini ko'radi.

Loyiha **3 qismdan** iborat:

1. **Telegram Bot** (grammY) — ro'yxatga olish + Mini App'ni ochish
2. **Mini App** (Next.js) — foydalanuvchi interfeysi
3. **Admin Panel** — markazlar, hududlar, kurslarni boshqarish

---

## ✨ Imkoniyatlar

**Foydalanuvchi (Mini App):**
- 🗺 Xaritadan qidirish (geolokatsiya + Haversine masofa)
- 📍 Viloyat → Tuman → Markaz ierarxiyasi (butun O'zbekiston: 14 hudud, 200+ tuman)
- 🔍 Qidiruv, fan bo'yicha filtr, narx/reyting bo'yicha saralash
- 🏫 Markaz sahifasi: fotogalereya, kurslar+narxlar, mini xarita, bog'lanish, natijalar
- ❤️ Saqlanganlar (favorites)
- 📞 "Qo'ng'iroqqa buyurtma" (lead yig'ish)
- 📤 Markazni ulashish, haptic feedback, UZ/RU tillari, dark/light mavzu

**Admin panel:**
- 🔐 Login (bcrypt + JWT cookie, middleware himoyasi)
- 📊 Dashboard: statistika, eng ko'p ko'rilgan markazlar, so'nggi so'rovlar
- 🏢 Markazlar CRUD: rasm yuklash, xaritada nuqta tanlash, kurslar/natijalar
- 🗺 Viloyatlar va tumanlar CRUD
- 📋 So'rovlar (lead) boshqaruvi, foydalanuvchilar ro'yxati
- 📄 Jadval: qidiruv, saralash, sahifalash

---

## 🛠 Texnologiyalar

| Qism | Texnologiya |
|------|-------------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Bot | grammY |
| DB | PostgreSQL + Prisma ORM |
| Xarita | Leaflet + react-leaflet (OpenStreetMap) |
| Server state | TanStack Query (React Query) |
| Validatsiya | Zod |
| Auth (admin) | jose (JWT) + bcryptjs |
| Animatsiya | Framer Motion |

---

## 📁 Papka tuzilmasi

```
app/
  (miniapp)/        → foydalanuvchi Mini App (home, districts, centers, center, map, search, favorites)
  admin/            → admin panel (login, dashboard, CRUD)
  api/              → API routes (public + /api/admin/* himoyalangan)
bot/                → grammY bot (index.ts polling, bot.ts logika, webhook-set.ts)
components/         → UI komponentlar (ui/, admin/, va h.k.)
lib/                → prisma, utils, i18n, telegram-auth, server/ yordamchilar
prisma/             → schema.prisma, seed.ts, uzbekistan.ts (hududlar)
middleware.ts       → /admin va /api/admin himoyasi
```

---

## 🚀 O'rnatish (lokal)

### 1. Talablar
- Node.js 20+
- Docker (PostgreSQL uchun) yoki tayyor PostgreSQL

### 2. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 3. Ma'lumotlar bazasi (Docker)
```bash
docker compose up -d        # PostgreSQL'ni localhost:5433 da ishga tushiradi
```

### 4. Muhit o'zgaruvchilari
`.env.example`'dan nusxa oling:
```bash
cp .env.example .env
```
`.env` ni to'ldiring:
```env
BOT_TOKEN="BotFather'dan olingan token"
DATABASE_URL="postgresql://oquv:oquv123@localhost:5433/oquv_markaz?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"   # prod'da HTTPS domeningiz
JWT_SECRET="uzun-tasodifiy-maxfiy-kalit"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

### 5. Schema va seed
```bash
npm run db:push       # schema'ni DB'ga yuklaydi
npm run db:seed       # 14 hudud, 200+ tuman, demo markazlar va admin yaratadi
```

### 6. Ishga tushirish
```bash
npm run dev           # Mini App + admin: http://localhost:3000
npm run bot           # Telegram bot (polling rejimi)
```

- **Mini App:** http://localhost:3000
- **Admin panel:** http://localhost:3000/admin (login: `admin` / `admin123`)
- **Prisma Studio:** `npm run db:studio`

---

## 🤖 Telegram Bot

1. [@BotFather](https://t.me/BotFather)'dan bot yarating, `BOT_TOKEN` oling.
2. `.env`'ga token va `NEXT_PUBLIC_APP_URL` (HTTPS) qo'ying.
3. **Lokal:** `npm run bot` (polling).
4. **Production (webhook):** deploy qilgach `npm run bot:webhook` — webhook'ni `{APP_URL}/api/bot` ga o'rnatadi.
5. BotFather'da **Menu Button**'ni Mini App URL'ingizga sozlang.

> ⚠️ Telegram Web App tugmasi **faqat HTTPS** URL bilan ishlaydi. Lokal test uchun `ngrok` yoki Vercel preview ishlatish mumkin.

---

## ☁️ Deploy (Vercel + Supabase)

### Ma'lumotlar bazasi (Supabase)
1. [supabase.com](https://supabase.com)'da loyiha yarating.
2. Connection string'ni oling → `DATABASE_URL`.
3. `npm run db:push && npm run db:seed` (lokal'dan Supabase URL bilan).

### Frontend + API (Vercel)
1. Repozitoriyni Vercel'ga ulang.
2. Environment Variables qo'shing: `BOT_TOKEN`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL` (Vercel domeni), `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
3. Deploy. `build` buyrug'i avtomatik `prisma generate` ni ishga tushiradi.

### Bot webhook
Deploy tugagach, lokal terminalda (prod `.env` bilan):
```bash
npm run bot:webhook
```

> 📤 Rasm yuklash lokalda `public/uploads/` ga saqlanadi. Vercel'da fayl tizimi vaqtinchalik — production uchun S3/Supabase Storage/UploadThing kabi xizmatni ulang.

---

## 📜 Skriptlar

| Buyruq | Vazifa |
|--------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Prod build (+ prisma generate) |
| `npm run start` | Prod server |
| `npm run bot` | Bot (polling) |
| `npm run bot:webhook` | Webhook o'rnatish |
| `npm run db:push` | Schema'ni DB'ga yuklash |
| `npm run db:seed` | Seed ma'lumotlar |
| `npm run db:studio` | Prisma Studio |

---

## 🔒 Xavfsizlik

- Mini App API'lari Telegram `initData` HMAC imzosi bilan tekshiriladi (`lib/telegram-auth.ts`).
- Admin API'lari JWT cookie + `middleware.ts` orqali himoyalangan.
- Parollar bcrypt bilan hash qilinadi.
- Production'da `JWT_SECRET` ni albatta uzun tasodifiy qiymatga o'zgartiring.
