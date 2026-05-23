import { Telegraf } from 'telegraf';
import axios from 'axios';
import { ACCOUNTS } from './accounts.js';

// Функция для запуска процесса
async function runRankProcess(env, chatId = null) {
  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
  let successCount = 0;

  for (const acc of ACCOUNTS) {
    try {
      const token = await login(acc.email, acc.password, env.FIREBASE_LOGIN_URL);
      if (token) {
        if (await setRank(token, env.RANK_URL)) successCount++;
      }
    } catch (e) { console.log(`Error: ${acc.email}`); }
  }

  const message = (successCount === ACCOUNTS.length) 
    ? '✅ KI. N G RANK установлен' 
    : `❌ KI NG RAN K ошибка в установке (${successCount}/${ACCOUNTS.length} успешно)`;

  // Если передали chatId (ручной запуск), отвечаем в контексте
  // Если не передали (авто-запуск), шлем сообщение владельцу
  if (chatId) {
    return message;
  } else {
    await bot.telegram.sendMessage(env.ADMIN_CHAT_ID, message);
  }
}

export default {
  async fetch(request, env) {
    const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
    
    bot.command('start_rank', async (ctx) => {
      await ctx.reply('🚀 Запуск KING RANK');
      const result = await runRankProcess(env, ctx.chat.id);
      await ctx.reply(result);
    });

    try {
      await bot.handleUpdate(await request.json());
      return new Response("OK", { status: 200 });
    } catch (err) { return new Response("OK", { status: 200 }); }
  },

  async scheduled(event, env, ctx) {
    await runRankProcess(env);
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
