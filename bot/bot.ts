import { Bot, type Context, InlineKeyboard, Keyboard } from "grammy";
import { prisma } from "../lib/prisma";
import { isAdminTelegramId } from "../lib/admin-telegram";

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN .env faylida ko'rsatilmagan");
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com";

export const bot = new Bot(token);

// Foydalanuvchini DB'da yaratish yoki yangilash
async function upsertUser(ctx: Context) {
  const from = ctx.from;
  if (!from) return null;
  return prisma.user.upsert({
    where: { telegramId: BigInt(from.id) },
    update: {
      firstName: from.first_name,
      lastName: from.last_name ?? null,
      username: from.username ?? null,
      languageCode: from.language_code ?? "uz",
    },
    create: {
      telegramId: BigInt(from.id),
      firstName: from.first_name,
      lastName: from.last_name ?? null,
      username: from.username ?? null,
      languageCode: from.language_code ?? "uz",
    },
  });
}

const isHttps = APP_URL.startsWith("https://");

// HTTPS bo'lsa — Web App tugmasi. Aks holda undefined (lokal http test uchun).
function openAppKeyboard() {
  if (isHttps) {
    return new InlineKeyboard().webApp("📚 O'quv markazlarni ochish", APP_URL);
  }
  return undefined;
}

// Admin panelni Mini App sifatida ochuvchi tugma (initData orqali avto-kirish).
// /admin/tg sahifasi Telegram initData'ni tekshirib, admin cookie'ni o'rnatadi.
function adminAppKeyboard() {
  if (isHttps) {
    return new InlineKeyboard().webApp(
      "🛠 Admin panelni ochish",
      `${APP_URL}/admin/tg`,
    );
  }
  return undefined;
}

// http (lokal) holatda tugma o'rniga matnli eslatma
const localHint = isHttps
  ? ""
  : `\n\n⚠️ Mini App tugmasi faqat HTTPS manzilda ishlaydi. Lokal test uchun ilovani brauzerda oching:\n${APP_URL}`;

// Admin foydalanuvchiga darhol admin panel tugmasini yuborish
async function sendAdminPanel(ctx: Context) {
  if (isHttps) {
    await ctx.reply(
      "🛠 *Admin panel*\n\nQuyidagi tugma orqali to'g'ridan-to'g'ri kiring 👇",
      { parse_mode: "Markdown", reply_markup: adminAppKeyboard() },
    );
  } else {
    await ctx.reply(
      "🛠 Admin panel (HTTPS kerak). Brauzerda oching va login/parol bilan kiring:\n" +
        `${APP_URL}/admin/login`,
    );
  }
}

function contactKeyboard() {
  return new Keyboard()
    .requestContact("📱 Telefon raqamni yuborish")
    .resized()
    .oneTime();
}

bot.command("start", async (ctx) => {
  const user = await upsertUser(ctx);
  const name = ctx.from?.first_name ?? "do'stim";

  // Admin bo'lsa — darhol admin panel tugmasini yuboramiz
  if (ctx.from && isAdminTelegramId(ctx.from.id)) {
    await sendAdminPanel(ctx);
    return;
  }

  if (!user?.phone) {
    // Telefon raqami hali yo'q — so'raymiz
    await ctx.reply(
      `Assalomu alaykum, ${name}! 👋\n\n` +
        `🎓 *O'quv markazlar* botiga xush kelibsiz!\n\n` +
        `Bu yerda siz Toshkent va boshqa viloyatlardagi eng yaxshi o'quv markazlarni topishingiz mumkin:\n` +
        `• 🗺 Xaritadan yaqin atrofdagilarni\n` +
        `• 📍 Tuman bo'yicha\n` +
        `• 💰 Kurslar narxlari va 📞 telefon raqamlari\n\n` +
        `Boshlash uchun, iltimos, telefon raqamingizni yuboring 👇`,
      {
        parse_mode: "Markdown",
        reply_markup: contactKeyboard(),
      },
    );
    return;
  }

  await ctx.reply(
    `Xush kelibsiz, ${name}! 🎉\n\n` +
      `Eng yaxshi o'quv markazlarni topishga tayyormisiz?` +
      (isHttps ? " Quyidagi tugmani bosing 👇" : "") +
      localHint,
    { reply_markup: openAppKeyboard() },
  );
});

// Telefon raqami qabul qilish
bot.on("message:contact", async (ctx) => {
  const contact = ctx.message.contact;
  const from = ctx.from;
  if (!from) return;

  // Faqat o'z raqamini saqlaymiz (boshqa odamniki emas)
  if (contact.user_id && contact.user_id !== from.id) {
    await ctx.reply("Iltimos, o'zingizning raqamingizni yuboring 🙏");
    return;
  }

  await prisma.user.update({
    where: { telegramId: BigInt(from.id) },
    data: { phone: contact.phone_number },
  });

  await ctx.reply(
    `Rahmat! ✅ Ro'yxatdan o'tdingiz.\n\n` +
      `Endi o'quv markazlarni ko'rishingiz mumkin 👇`,
    { reply_markup: { remove_keyboard: true } },
  );
  await ctx.reply("📚 Ilovani oching:" + localHint, {
    reply_markup: openAppKeyboard(),
  });
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    `ℹ️ *Yordam*\n\n` +
      `/start — botni ishga tushirish va ilovani ochish\n` +
      `/app — o'quv markazlar ilovasini ochish\n\n` +
      `Savollar bo'lsa: @admin`,
    { parse_mode: "Markdown" },
  );
});

bot.command("app", async (ctx) => {
  await ctx.reply("📚 O'quv markazlar ilovasi:" + localHint, {
    reply_markup: openAppKeyboard(),
  });
});

// Admin panel buyrug'i — faqat adminlar uchun
bot.command("admin", async (ctx) => {
  if (!ctx.from || !isAdminTelegramId(ctx.from.id)) {
    await ctx.reply("Bu buyruq faqat adminlar uchun.");
    return;
  }
  await sendAdminPanel(ctx);
});

// Boshqa har qanday xabar
bot.on("message", async (ctx) => {
  await ctx.reply(
    "Ilovani ochish uchun /start yoki /app buyrug'ini yuboring 👇" + localHint,
    { reply_markup: openAppKeyboard() },
  );
});

bot.catch((err) => {
  console.error("Bot xatosi:", err.error);
});
