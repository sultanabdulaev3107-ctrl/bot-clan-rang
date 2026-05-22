import { Bot } from "https://deno.land/x/grammy@v1.22.4/mod.ts";
import { webhookCallback } from "https://deno.land/x/grammy@v1.22.4/mod.ts";

const bot = new Bot("ВАШ_ТОКЕН_БОТА");

bot.command("start", (ctx) => ctx.reply("Бот успешно запущен на Cloudflare!"));

// Слушаем запросы от Telegram
export default {
  fetch: webhookCallback(bot, "cloudflare-mod"),
};
