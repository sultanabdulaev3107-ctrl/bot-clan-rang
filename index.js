import { Bot } from "https://deno.land/x/grammy@v1.22.4/mod.ts";
import { webhookCallback } from "https://deno.land/x/grammy@v1.22.4/mod.ts";

const bot = new Bot("8633981336:AAG6axtOHmnOwnVdbToFsMQqb3tzvmEqpeE");

bot.command("start", (ctx) => ctx.reply("Бот успешно запущен на Cloudflare!"));

// Слушаем запросы от Telegram
export default {
  fetch: webhookCallback(bot, "cloudflare-mod"),
};
