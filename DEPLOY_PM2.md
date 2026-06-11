# 🚀 PM2 bilan serverga qo'yish — O'quv Markaz Mini App

Bu yo'l: **PostgreSQL → Docker**, **Next.js ilova + Telegram bot → PM2**, **HTTPS/proxy → mavjud nginx**.

---

## 0. Talablar (serverda)
- **Node.js 20+** va **npm**
- **PM2**:  `npm i -g pm2`
- **Docker** (faqat baza uchun):  `curl -fsSL https://get.docker.com | sh`
- **nginx** (sizda allaqachon bor)

---

## 1. Loyihani serverga ko'chirish

Lokal kompyuterdan (loyiha papkasidan):

```bash
rsync -avz --exclude node_modules --exclude .next --exclude .git \
  ./ user@SERVER_IP:/opt/oquv-markaz/
```

Keyin serverda:
```bash
cd /opt/oquv-markaz
```

---

## 2. `.env` ni sozlash

```bash
cp .env.pm2.example .env
nano .env
```
To'ldiring: `NEXT_PUBLIC_APP_URL`, `BOT_TOKEN`, `BOT_USERNAME`, `POSTGRES_PASSWORD`
(va `DATABASE_URL` dagi parol bir xil bo'lsin), `JWT_SECRET`, `ADMIN_PASSWORD`.

> `JWT_SECRET` uchun:  `openssl rand -hex 32`

---

## 3. Bazani ko'tarish (Docker)

```bash
docker compose -f docker-compose.db.yml up -d
docker compose -f docker-compose.db.yml ps      # "healthy" bo'lsin
```
Baza faqat `127.0.0.1:5433` da ochiladi (tashqaridan ulanib bo'lmaydi).

---

## 4. Bog'liqliklar + build

```bash
npm install            # tsx va prisma endi dependencies'da
npm run build          # prisma generate + next build
```

---

## 5. Bazani tayyorlash (faqat BIR MARTA)

```bash
npm run db:push        # jadvallarni yaratadi
npm run db:seed        # viloyatlar, demo markazlar, admin
```

---

## 6. PM2 bilan ishga tushirish

```bash
pm2 start ecosystem.config.js
pm2 save               # joriy ro'yxatni saqlaydi
pm2 startup            # chiqqan buyruqni nusxalab bajaring (reboot'da avto-start)
```

Tekshirish:
```bash
pm2 status             # oquv-app va oquv-bot "online" bo'lsin
pm2 logs oquv-bot      # "@bot ishga tushdi" ko'rinadi
pm2 logs oquv-app
```

---

## 7. nginx (ilovaga proxy)

`oquv-app` `localhost:3000` da. nginx server bloki:

```nginx
server {
    listen 80;
    server_name markaz.uz;          # domeningiz yoki IP

    client_max_body_size 10M;        # admin rasm yuklashi uchun

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

SSL bo'lsa (Mini App tugmasi chiqishi uchun HTTPS kerak):
```bash
sudo certbot --nginx -d markaz.uz
```
Keyin nginx'ni qayta yuklang:  `sudo nginx -t && sudo systemctl reload nginx`

---

## 8. Telegram'da Mini App'ni ulash

1. **@BotFather** → `/setmenubutton` → botingiz → URL = `NEXT_PUBLIC_APP_URL` (HTTPS) → tugma nomi.
2. Botga `/start` yuboring.

> Webhook qolgan bo'lsa polling 409 beradi. Tozalash:
> `curl "https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook"`

---

## 9. Yangilash (kod o'zgargach)

```bash
rsync ... user@SERVER_IP:/opt/oquv-markaz/   # yoki git pull
cd /opt/oquv-markaz
npm install
npm run build
npx prisma db push        # schema o'zgargan bo'lsa
pm2 reload ecosystem.config.js
```

---

## Foydali buyruqlar

```bash
pm2 restart oquv-bot          # botni restart
pm2 reload all                # uzilishsiz qayta yuklash
pm2 logs                      # barcha loglar
pm2 monit                     # resurs monitoringi
docker compose -f docker-compose.db.yml logs -f db   # baza loglari
```
