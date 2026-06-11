import { webhookCallback } from "grammy";
import { bot } from "@/bot/bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Telegram webhook -> grammY
const handleUpdate = webhookCallback(bot, "std/http");

export async function POST(req: Request): Promise<Response> {
  try {
    return await handleUpdate(req);
  } catch (err) {
    console.error("Webhook xatosi:", err);
    return new Response("error", { status: 500 });
  }
}
