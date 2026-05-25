import { Telegraf } from 'telegraf';
import axios from 'axios';
import { ACCOUNTS as PART1 } from './accounts_1.js';
import { ACCOUNTS as PART2 } from './accounts_2.js';
import { ACCOUNTS as PART3 } from './accounts_3.js';

async function login(email, password, url) {
  try {
    const res = await axios.post(url, { clientType: "CLIENT_TYPE_ANDROID", email, password, returnSecureToken: true }, 
    { headers: { "User-Agent": "Dalvik/2.1.0", "Content-Type": "application/json" } });
    return res?.data?.idToken || null;
  } catch (e) { return null; }
}

async function setRank(token, url) {
  const ratingData = {
    cars: 100000, car_fix: 100000, car_collided: 100000, car_exchange: 100000, 
    car_trade: 100000, car_wash: 100000, slicer_cut: 100000, drift_max: 100000, 
    drift: 100000, cargo: 100000, delivery: 100000, taxi: 100000, levels: 100000, 
    gifts: 100000, fuel: 100000, offroad: 100000, speed_banner: 100000, 
    reactions: 100000, police: 100000, run: 100000, real_estate: 100000, 
    t_distance: 100000, treasure: 100000, block_post: 100000, push_ups: 100000, 
    burnt_tire: 100000, passanger_distance: 100000, time: 10000000000, race_win: 3000
  };
  try {
    const res = await axios.post(url, { data: JSON.stringify({ RatingData: ratingData }) }, { 
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } 
    });
    return res.status === 200;
  } catch (e) { return false; }
}

export default {
  async scheduled(event, env, ctx) {
    const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
    const chatId = env.ADMIN_CHAT_ID;
    
    const minute = new Date(event.scheduledTime).getUTCMinutes();
    let accounts = [];
    let name = "";

    // Определяем какой файл запускать по минуте
    if (minute === 1) { accounts = PART1; name = "PART1 (Файл 1)"; }
    else if (minute === 11) { accounts = PART2; name = "PART2 (Файл 2)"; }
    else if (minute === 21) { accounts = PART3; name = "PART3 (Файл 3)"; }

    if (accounts.length > 0) {
      await bot.telegram.sendMessage(chatId, `🚀 Запуск рангов для ${name}...`);
      
      let success = 0;
      for (const acc of accounts) {
        const token = await login(acc.email, acc.password, env.FIREBASE_LOGIN_URL);
        if (token && await setRank(token, env.RANK_URL)) success++;
      }
      
      const status = (success === accounts.length) ? "✅ Успешно" : `❌ Ошибка (${success}/${accounts.length})`;
      await bot.telegram.sendMessage(chatId, `${status} для ${name}`);
    }
  }
};
    
