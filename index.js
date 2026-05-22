import { Bot, webhookCallback } from "grammy";

const bot = new Bot("8633981336:AAGBk-3ACu7io50TTZegTegq5qQzRgvvWhI");

// Бот отвечает "Привет!" на любое текстовое сообщение
bot.on("message", (ctx) => ctx.reply("Привет!"));

export default {
  fetch: webhookCallback(bot, "cloudflare-mod"),
};
