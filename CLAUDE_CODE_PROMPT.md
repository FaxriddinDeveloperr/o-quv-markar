# Claude Code uchun To'liq Promt — O'quv Markazlar Telegram Mini App

> Bu faylni Claude Code ishga tushgan papkada beraman. Claude Code STEP-MA-STEP ishlasin, har bosqichni tugatib menga ko'rsatib, tasdiqdan keyin keyingisiga o'tsin.

---

## 0. UMUMIY KONTEKST (Claude Code, avval shuni o'qi)

Men O'zbekiston uchun **Telegram Mini App** (Web App) quryapman. Maqsad: foydalanuvchilar yaqin atrofdagi va tumanlar bo'yicha o'quv markazlarni topishi, ularning kurslari, narxlari, joylashuvi va telefon raqamini ko'rishi.

Loyiha 3 qismdan iborat:
1. **Telegram Bot** — ro'yxatga olish + Mini App'ni ochish
2. **Mini App (frontend)** — foydalanuvchi ko'radigan chiroyli interfeys
3. **Admin Panel** — markazlar, tumanlar, kurslarni boshqarish

**MUHIM QOIDALAR:**
- Har bir bosqichni alohida bajar, kod yozgandan keyin nima qilganingni qisqa tushuntir va menga "davom etamizmi?" deb so'ra.
- Kerakli **skill**lardan foydalan: frontend dizayn uchun `frontend-design` skill, hujjat kerak bo'lsa tegishli skill. Avval SKILL.md ni o'qib chiq.
- TypeScript ishlatamiz, `any` ishlatma, toza tiplar yoz.
- Har bosqichda `npm run build` xatosiz o'tishini tekshir.
- UI O'zbekistonlik yoshlar uchun: zamonaviy, toza, mobil-birinchi (mobile-first), chunki Telegram Mini App asosan telefonda ochiladi.

---

## 1. TEXNOLOGIYA STACK

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Bot:** grammY (Node.js Telegram bot framework)
- **Database:** PostgreSQL + Prisma ORM (lokal dev uchun Docker yoki Supabase)
- **Xarita:** Leaflet + react-leaflet (OpenStreetMap, bepul). Geolokatsiya bilan "yaqin atrofdagi" markazlarni Haversine formula bilan hisobla.
- **Telegram Mini App SDK:** `@telegram-apps/sdk-react` (foydalanuvchi ma'lumotini olish, theme, haptic)
- **Deploy:** Vercel (frontend+API) + Supabase (DB). Bot uchun webhook.
- **Validatsiya:** Zod
- **State:** React Query (TanStack Query) server data uchun

---

## 2. STEP-MA-STEP REJA

### STEP 1 — Loyiha skeleti
- Next.js 14 + TypeScript + Tailwind o'rnat.
- shadcn/ui sozla.
- Papka tuzilmasi yarat:
  ```
  /app
    /(miniapp)        → foydalanuvchi mini app
    /admin            → admin panel
    /api              → API routes
  /bot                → grammY bot
  /lib                → db, utils, telegram auth
  /prisma             → schema
  /components/ui      → shadcn komponentlar
  ```
- `.env.example` yarat (BOT_TOKEN, DATABASE_URL, NEXT_PUBLIC_APP_URL).
- TUGAGACH: build qil, tuzilmani ko'rsat, to'xta.

### STEP 2 — Database (Prisma schema)
Quyidagi modellarni yarat:
- **User**: id, telegramId (unique), firstName, lastName, phone, username, createdAt
- **District** (Tuman): id, name, nameRu, order
- **Center** (O'quv markaz): id, name, description, descriptionRu, districtId, address, latitude, longitude, phone, logoUrl, photos[], rating, isActive, createdAt
- **Course** (Kurs/Fan): id, centerId, name, nameRu, price, durationMonths, description
- **CenterResult** (Natijalar/Sertifikatlar): id, centerId, title, imageUrl
- **Favorite**: id, userId, centerId (foydalanuvchi saqlagan markazlar)
- **Admin**: id, username, passwordHash, role

Migration yarat, seed fayl yoz (3 tuman: Chilonzor, Mirobod, Yunusobod; har birida 2-3 markaz: Everest, IELTS Zone, Result; har markazda kurslar: Rus tili 600000, English 650000 va h.k. real koordinatalar bilan Toshkent ichida).
- TUGAGACH: `npx prisma studio` da ma'lumot ko'rinishini ayt, to'xta.

### STEP 3 — Telegram Bot (grammY)
- `/start` bosilganda: foydalanuvchini DB'da yarat/yangila (Telegram'dan firstName, lastName, username avtomatik).
- Telefon raqamini `requestContact` tugmasi bilan so'ra → DB'ga saqla.
- Ro'yxatdan o'tgach: chiroyli xush kelibsiz xabari + **"📚 O'quv markazlarni ochish"** Web App tugmasi (Mini App URL bilan).
- O'zbek tilida, do'stona ton.
- initData validatsiyasini (HMAC) `/lib/telegram-auth.ts` da yoz — har API so'rovda foydalanuvchini tekshirish uchun.
- TUGAGACH: botni lokal webhook/polling'da test qil, to'xta.

### STEP 4 — Mini App: Asosiy sahifa (Menyu)
> Bu yerda `frontend-design` SKILL.md ni o'qib, dizayn tokenlaridan foydalan.
- Telegram theme'ga moslash (dark/light avtomatik).
- Yuqorida: salomlash ("Salom, {ism} 👋"), qidiruv bar.
- 2 ta katta tugma/karta: **"🗺 Xaritadan qidirish"** va **"📍 Tumanlar bo'yicha"**.
- Pastda: mashhur/tavsiya markazlar gorizontal scroll.
- Animatsiyalar silliq (framer-motion ixtiyoriy), skeleton loading.
- TUGAGACH: skrinshot mantiqini ayt, to'xta.

### STEP 5 — Tumanlar → Markazlar ro'yxati
- Tumanlar ro'yxati (karta ko'rinishida, har birida nechta markaz borligi).
- Tuman tanlanganda → o'sha tumandagi markazlar ro'yxati (logo, nom, rating, eng arzon kurs narxi, masofa agar geo ruxsat berilgan bo'lsa).
- Filtr: fan bo'yicha, narx bo'yicha saralash.
- TUGAGACH: to'xta.

### STEP 6 — Markaz to'liq sahifasi
Sening chizmangga moslab:
- Foto galereya / logo.
- Tab yoki bo'limlar: **Fanlar (narxlar bilan)**, **Lokatsiya (mini xarita)**, **Bog'lanish (tel: link, Telegram)**, **Natijalar (sertifikat rasmlari)**.
- "Qo'ng'iroq qilish" va "Yo'nalish (xaritada ochish)" tugmalari.
- Favoritga qo'shish (yurakcha).
- Haptic feedback tugmalarga.
- TUGAGACH: to'xta.

### STEP 7 — Xaritadan qidirish (geolokatsiya)
- Leaflet xarita, foydalanuvchi joylashuvini so'ra.
- Yaqin atrofdagi markazlarni marker bilan ko'rsat (Haversine bilan masofa).
- Markerga bosilganda — mini karta (nom, masofa, "Batafsil" tugmasi).
- "Mendan X km" ko'rsatkichi.
- TUGAGACH: to'xta.

### STEP 8 — API routes
- Barcha API'lar initData orqali himoyalangan.
- Endpointlar: districts, centers (by district / by location / search), center detail, favorites (add/remove/list), register.
- Zod validatsiya, to'g'ri error handling.
- React Query bilan frontend'ga ulang.
- TUGAGACH: to'xta.

### STEP 9 — ADMIN PANEL (eng muhim, xatosiz)
- `/admin` — login (username/parol, JWT yoki session, bcrypt).
- Dashboard: statistika (jami foydalanuvchilar, markazlar, eng ko'p ko'rilgan).
- CRUD: Tumanlar, Markazlar (rasm yuklash, xaritada nuqta tanlash), Kurslar, Natijalar.
- Markaz qo'shishda xaritadan koordinata tanlash (klik bilan).
- Jadval ko'rinishi: qidiruv, saralash, sahifalash (pagination).
- Foydalanuvchilar ro'yxati (faqat ko'rish).
- shadcn/ui bilan toza, professional admin UI.
- TUGAGACH: to'xta.

### STEP 10 — Sayqal va deploy
- Til almashtirish (UZ/RU) — i18n.
- Loading, empty, error holatlari hamma joyda.
- SEO/meta, favicon, manifest.
- Mobil responsivlikni tekshir.
- README yoz: o'rnatish, env, deploy (Vercel + Supabase + bot webhook) qadamlari.
- TUGAGACH: yakuniy build, deploy yo'riqnomasi.

---

## 3. DIZAYN TALABLARI (UI/UX)
- **Mobile-first**, Telegram ichida ochilishini hisobga ol (safe area, theme).
- Rang palitra: zamonaviy, bitta asosiy accent rang (masalan ko'k yoki binafsha gradient), ko'p oq bo'sh joy.
- Kartalar: yumshoq soyalar, yumaloq burchaklar (rounded-2xl), silliq hover/tap.
- Tipografiya: aniq ierarxiya, o'qilishi oson.
- Har bir tugma uchun haptic feedback.
- Skeleton loaderlar, silliq o'tishlar.
- Bo'sh holatlar (empty state) chiroyli illyustratsiya/matn bilan.
- Hech qanday "generic AI" ko'rinish bo'lmasin — `frontend-design` skill qoidalariga amal qil.

## 4. QO'SHIMCHA (men so'ramagan, lekin kerakli) takliflar
- Markazni **ulashish** (Telegram orqali do'stga yuborish).
- **Ko'rishlar soni** (har markaz necha marta ochilgan) — admin statistikasi uchun.
- **Reyting/sharhlar** (keyingi versiyada).
- **"Qo'ng'iroqqa buyurtma"** — foydalanuvchi raqam qoldiradi, admin ko'radi (lead yig'ish).
- Push/bildirishnoma bot orqali (yangi markaz qo'shilganda).

---

## 5. BOSHLASH
Claude Code, iltimos **STEP 1**dan boshla. Avval kerakli SKILL.md fayllarni o'qib chiq (ayniqsa frontend-design). Har bosqich oxirida to'xtab, menga natijani ko'rsat va tasdig'imni so'ra.
