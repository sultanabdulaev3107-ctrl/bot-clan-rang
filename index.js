import { Bot, webhookCallback } from "grammy";

const bot = new Bot("8633981336:AAG6axtOHmnOwnVdbToFsMQqb3tzvmEqpeE");

// Бот отвечает "Привет!" на любое текстовое сообщение
bot.on("message", (ctx) => ctx.reply("Привет!"));

export default {
  fetch: webhookCallback(bot, "cloudflare-mod"),
};
