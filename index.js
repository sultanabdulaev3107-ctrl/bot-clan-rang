import { Bot, webhookCallback } from "grammy";

const bot = new Bot("8633981336:AAG6axtOHmnOwnVdbToFsMQqb3tzvmEqpeE");

bot.command("start", (ctx) => ctx.reply("Бот успешно запущен на Cloudflare!"));

export default {
  fetch: webhookCallback(bot, "cloudflare-mod"),
};
