import { Telegraf } from 'telegraf';
import axios from 'axios';
import { ACCOUNTS as PART1 } from './accounts_1.js';
import { ACCOUNTS as PART2 } from './accounts_2.js';
import { ACCOUNTS as PART3 } from './accounts_3.js';

// Объединяем все аккаунты в один список
const ALL_ACCOUNTS = [...PART1, ...PART2, ...PART3];

async function runFullProcess(env, chatId) {
  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
  await bot.telegram.sendMessage(chatId, '🚀 Запуск процесса установки рангов на всех аккаунтах...');

  let success = 0;
  for (const acc of ALL_ACCOUNTS) {
    await new Promise(r => setTimeout(r, 150)); // Минимальная задержка для скорости
    try {
      const token = await login(acc.email, acc.password, env.FIREBASE_LOGIN_URL);
      if (token && await setRank(token, env.RANK_URL)) success++;
    } catch (e) {}
  }

  const message = (success === ALL_ACCOUNTS.length) 
    ? '✅ Ранги установлены на всех 50+ аккаунтах' 
    : `❌ Ранги установлены с ошибками: ${success}/${ALL_ACCOUNTS.length} успешно`;
  
  await bot.telegram.sendMessage(chatId, message);
}

async function login(email, password, url) {
  try {
    const res = await axios.post(url, { clientType: "CLIENT_TYPE_ANDROID", email, password, returnSecureToken: true }, 
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

export default {
  async fetch(request, env) {
    const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
    bot.command('start_rank', async (ctx) => {
      // Запускаем процесс (не ждем завершения, чтобы не было ошибки таймаута)
      runFullProcess(env, ctx.chat.id);
    });
    return bot.handleUpdate(await request.json()).then(() => new Response("OK"));
  },

  async scheduled(event, env, ctx) {
    // Автозапуски: бот берет все аккаунты сразу
    await runFullProcess(env, env.ADMIN_CHAT_ID);
  }
};
