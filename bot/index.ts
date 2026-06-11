// Lokal ishlab chiqish uchun: long-polling rejimida botni ishga tushirish.
// Foydalanish: npm run bot
import "dotenv/config";
import { bot } from "./bot";

async function main() {
  console.log("🤖 Bot polling rejimida ishga tushmoqda...");
  await bot.api.setMyCommands([
    { command: "start", description: "Botni ishga tushirish" },
    { command: "app", description: "O'quv markazlar ilovasi" },
    { command: "help", description: "Yordam" },
  ]);
  bot.start({
    onStart: (info) => console.log(`✅ @${info.username} ishga tushdi`),
  });
}

main().catch((e) => {
  console.error("Botni ishga tushirishda xato:", e);
  process.exit(1);
});
