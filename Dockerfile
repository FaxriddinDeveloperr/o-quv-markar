# O'quv Markaz Mini App — production image
# Debian-slim (Prisma uchun alpine'dan ko'ra muammosizroq)
FROM node:20-slim

WORKDIR /app

# Prisma engine OpenSSL talab qiladi
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Avval bog'liqliklar (cache uchun).
# prisma/ ham kerak — chunki `postinstall` skripti `prisma generate` ishlatadi.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# Manba kod
COPY . .

# prisma generate + next build (package.json "build" skripti).
# Build paytida BOT_TOKEN/DATABASE_URL kerak emas (faqat modul yuklash uchun
# vaqtinchalik qiymat) — haqiqiy qiymatlar runtime'da .env'dan keladi.
RUN BOT_TOKEN="0:build-placeholder" \
    DATABASE_URL="postgresql://u:p@localhost:5432/db?schema=public" \
    npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Standart: Next.js serverini ishga tushirish.
# Bot konteyneri buni docker-compose'da "npm run bot" bilan almashtiradi.
CMD ["npm", "start"]
