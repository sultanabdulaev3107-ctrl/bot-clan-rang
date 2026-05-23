import { Telegraf } from 'telegraf';
import axios from 'axios';
import { ACCOUNTS as PART1 } from './accounts_1.js';
import { ACCOUNTS as PART2 } from './accounts_2.js';
import { ACCOUNTS as PART3 } from './accounts_3.js';

// Универсальная функция для обработки списка
async function processBatch(accounts, env) {
  let success = 0;
  for (const acc of accounts) {
    await new Promise(r => setTimeout(r, 600)); // Задержка для стабильности
    try {
      const token = await login(acc.email, acc.password, env.FIREBASE_LOGIN_URL);
      if (token && await setRank(token, env.RANK_URL)) success++;
    } catch (e) { console.log(`Error: ${acc.email}`); }
  }
  return { success, total: accounts.length };
}

// Главный управляющий метод
async function runFullProcess(env, chatId = null) {
  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
  
  if (chatId) await bot.telegram.sendMessage(chatId, '🚀 Запуск KING RANK на всех аккаунтах...');
  else await bot.telegram.sendMessage(env.ADMIN_CHAT_ID, '🚀 Запуск KING RANK на всех аккаунтах...');

  const results = [
    await processBatch(PART1, env),
    await processBatch(PART2, env),
    await processBatch(PART3, env)
  ];

  const totalSuccess = results.reduce((sum, r) => sum + r.success, 0);
  const totalCount = results.reduce((sum, r) => sum + r.total, 0);

  const message = (totalSuccess === totalCount) 
    ? '✅ KING RANK установлен на всех аккаунтах' 
    : `❌ KING RANK ошибка в установке (${totalSuccess}/${totalCount} успешно)`;

  if (chatId) await bot.telegram.sendMessage(chatId, message);
  else await bot.telegram.sendMessage(env.ADMIN_CHAT_ID, message);
}

export default {
  async fetch(request, env) {
    const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
    bot.command('start_rank', async (ctx) => {
      // Запускаем без await, чтобы не держать соединение открытым, 
      // но для простоты здесь оставим вызов
      await runFullProcess(env, ctx.chat.id);
    });
    return bot.handleUpdate(await request.json()).then(() => new Response("OK"));
  },

  async scheduled(event, env, ctx) {
    await runFullProcess(env);
  }
};

async function login(email, password, url) {
  try {
    const res = await axios.post(url, { clientType: "CLIENT_TYPE_ANDROID", email: email, password: password, returnSecureToken: true }, 
    { headers: { "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 12)", "Content-Type": "application/json" } });
    return res?.data?.idToken || null;
  } catch (e) { return null; }
}

async function setRank(token, url) {
  const ratingData = {};
  ["cars", "car_fix", "car_collided", "car_exchange", "car_trade", "car_wash", "slicer_cut", "drift_max", "drift", "cargo", "delivery", "taxi", "levels", "gifts", "fuel", "offroad", "speed_banner", "reactions", "police", "run", "real_estate", "t_distance", "treasure", "block_post", "push_ups", "burnt_tire", "passanger_distance"].forEach(k => ratingData[k] = 100000);
  ratingData["time"] = 10000000000;
  ratingData["race_win"] = 3000;
  try {
    const res = await axios.post(url, { data: JSON.stringify({ RatingData: ratingData }) }, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } });
    return res.status === 200;
  } catch (e) { return false; }
}
