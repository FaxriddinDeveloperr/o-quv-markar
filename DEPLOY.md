# 🚀 Serverga qo'yish (Deploy) — O'quv Markaz Mini App

Bu yo'riqnoma loyihani **Docker** yordamida serverga qo'yadi:
**Next.js ilova + Telegram bot (polling) + PostgreSQL + Caddy (avtomatik bepul SSL)**.

> **Muhim:** Telegram Mini App faqat **HTTPS + haqiqiy domen** bilan ishlaydi.
> Domeningiz bo'lmasa, server IP'sidan bepul **`nip.io`** subdomenini ishlatamiz
> (masalan `203.0.113.45.nip.io`) — Caddy unga avtomatik Let's Encrypt sertifikat oladi.

---

## 0. Talablar
- Linux server (Ubuntu/Debian tavsiya), **root** yoki `sudo` huquqi
- Serverning **ommaviy (public) IP** manzili
- **80** va **443** portlari ochiq (SSL sertifikat olish uchun shart)

---

## 1. Docker o'rnatish (agar yo'q bo'lsa)

Serverga SSH bilan kiring va bajaring:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER     # docker'ni sudo'siz ishlatish uchun
# Shundan keyin SSH'dan chiqib, qayta kiring (yoki: newgrp docker)
docker --version
docker compose version
```

---

## 2. Loyihani serverga ko'chirish

Lokal kompyuteringizdan (loyiha papkasidan):

```bash
# 1-variant: rsync (tezkor, node_modules va .next'siz)
rsync -avz --exclude node_modules --exclude .next --exclude .git \
  ./ user@SERVER_IP:/opt/oquv-markaz/

# 2-variant: git (agar repoga yuklangan bo'lsa)
# ssh user@SERVER_IP 'git clone <repo-url> /opt/oquv-markaz'
```

Keyin serverda:

```bash
cd /opt/oquv-markaz
```

---

## 3. `.env` faylini sozlash

```bash
cp .env.production.example .env
nano .env
```

To'ldirish kerak bo'lganlar:

| O'zgaruvchi | Qiymat |
|---|---|
| `APP_DOMAIN` | `SERVER_IP.nip.io` (masalan `203.0.113.45.nip.io`) yoki o'z domeningiz |
| `NEXT_PUBLIC_APP_URL` | `https://SERVER_IP.nip.io` (APP_DOMAIN bilan bir xil host) |
| `BOT_TOKEN` | BotFather'dan olingan token |
| `BOT_USERNAME` | bot username (`@`siz) |
| `POSTGRES_PASSWORD` | kuchli parol o'ylab toping |
| `DATABASE_URL` | parolni `POSTGRES_PASSWORD` bilan **bir xil** qiling |
| `JWT_SECRET` | `openssl rand -hex 32` natijasini qo'ying |
| `ADMIN_PASSWORD` | admin panel paroli |

> 💡 IP'ni bilmasangiz: `curl -s ifconfig.me`

---

## 4. Build va ishga tushirish

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Bu: image'ni quradi, PostgreSQL, ilova, bot va Caddy'ni ishga tushiradi.
Birinchi build 2–5 daqiqa olishi mumkin.

---

## 5. Ma'lumotlar bazasini tayyorlash (faqat BIR MARTA)

Jadvallarni yaratish va boshlang'ich ma'lumot (viloyatlar, demo markazlar, admin) qo'shish:

```bash
docker compose -f docker-compose.prod.yml run --rm app \
  sh -c "npx prisma db push && npm run db:seed"
```

> Keyinchalik schema o'zgartirsangiz yana `npx prisma db push` qiling.
> `db:seed` ni faqat birinchi marta ishlating (qayta ishlatsangiz demo data takrorlanishi mumkin).

---

## 6. Tekshirish

```bash
docker compose -f docker-compose.prod.yml ps          # hammasi "running" bo'lsin
docker compose -f docker-compose.prod.yml logs -f caddy   # SSL olgani ko'rinadi
```

Brauzerda oching: **https://SERVER_IP.nip.io**
"🔒 xavfsiz" (yashil qulf) ko'rinsa — SSL ishladi.

---

## 7. Telegram'da Mini App'ni ulash

1. Telegram'da **@BotFather** ga kiring
2. `/setmenubutton` → botingizni tanlang → URL sifatida **`https://SERVER_IP.nip.io`** kiriting → tugma nomi: `O'quv markazlar`
3. Botingizga `/start` yuboring — "📚 O'quv markazlarni ochish" tugmasi chiqadi va ilova ochiladi ✅

Bot allaqachon polling rejimida konteynerda ishlab turibdi (`oquv-bot`).

---

## 8. Foydali buyruqlar

```bash
# Loglar
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f bot

# Qayta ishga tushirish
docker compose -f docker-compose.prod.yml restart

# To'xtatish
docker compose -f docker-compose.prod.yml down

# Kod yangilangach qayta deploy (data saqlanadi)
git pull   # yoki rsync bilan yangilang
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 9. Muammolar (Troubleshooting)

**SSL olinmadi / sayt ochilmayapti**
- 80 va 443 portlari ochiqligini tekshiring (provayder firewall + `ufw`):
  ```bash
  sudo ufw allow 80 && sudo ufw allow 443
  ```
- `docker compose ... logs caddy` da xatoni ko'ring.
- `nip.io` ba'zan Let's Encrypt limitiga uchraydi. U holda bepul **DuckDNS** ishlating:
  duckdns.org → subdomen oching → IP'ni qo'ying → `.env` da
  `APP_DOMAIN=siz.duckdns.org`, `NEXT_PUBLIC_APP_URL=https://siz.duckdns.org` →
  `docker compose -f docker-compose.prod.yml up -d`.

**Bot javob bermayapti / 409 xatosi**
- Avval webhook qo'yilgan bo'lsa, polling ishlamaydi. Tozalash:
  ```bash
  curl "https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook"
  docker compose -f docker-compose.prod.yml restart bot
  ```

**Mini App tugmasi chiqmayapti**
- `NEXT_PUBLIC_APP_URL` `https://` bilan boshlanishi shart. O'zgartirsangiz:
  `docker compose -f docker-compose.prod.yml up -d --build` (bot env'ni qayta o'qishi uchun restart).

**Bazaga ulanmayapti**
- `.env` da `DATABASE_URL` paroli `POSTGRES_PASSWORD` bilan bir xilmi tekshiring,
  host `db`, port `5432` bo'lishi kerak.
