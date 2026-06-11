// Telegram webhook'ni o'rnatish (production uchun).
// Foydalanish: npm run bot:webhook
import "dotenv/config";
import { bot } from "./bot";

async function main() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL ko'rsatilmagan");

  const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/bot`;

  await bot.api.setMyCommands([
    { command: "start", description: "Botni ishga tushirish" },
    { command: "app", description: "O'quv markazlar ilovasi" },
    { command: "help", description: "Yordam" },
  ]);

  await bot.api.setWebhook(webhookUrl, {
    drop_pending_updates: true,
  });

  const info = await bot.api.getWebhookInfo();
  console.log("✅ Webhook o'rnatildi:", webhookUrl);
  console.log("ℹ️  Holat:", info);
}

main().catch((e) => {
  console.error("Webhook o'rnatishda xato:", e);
  process.exit(1);
});
