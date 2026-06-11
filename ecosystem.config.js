// PM2 konfiguratsiyasi — O'quv Markaz Mini App
// Ishga tushirish (serverda, loyiha papkasida):
//   pm2 start ecosystem.config.js
//   pm2 save && pm2 startup   # server qayta yuklanganda avtomatik ko'tariladi
//
// Ikki process:
//   oquv-app  — Next.js ilova + API (localhost:3000, nginx shunga proxy qiladi)
//   oquv-bot  — Telegram bot (long-polling, tashqi port kerak emas)
//
// .env fayli avtomatik o'qiladi (Next.js o'zi, bot esa `dotenv/config` orqali).

module.exports = {
  apps: [
    {
      name: "oquv-app",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "oquv-bot",
      script: "node_modules/.bin/tsx",
      args: "bot/index.ts",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
