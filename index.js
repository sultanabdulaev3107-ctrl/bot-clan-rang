import { Telegraf } from 'telegraf';
import axios from 'axios';
import { ACCOUNTS as PART1 } from './accounts_1.js';
import { ACCOUNTS as PART2 } from './accounts_2.js';
import { ACCOUNTS as PART3 } from './accounts_3.js';

// Объединяем все аккаунты из трех файлов
const ALL_ACCOUNTS = [...PART1, ...PART2, ...PART3];

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
    
    await bot.telegram.sendMessage(chatId, `🚀 Запуск рангов на всех аккаунтах (${ALL_ACCOUNTS.length} шт.)...`);

    const results = await Promise.all(ALL_ACCOUNTS.map(async (acc) => {
      try {
        const token = await login(acc.email, acc.password, env.FIREBASE_LOGIN_URL);
        return token && await setRank(token, env.RANK_URL);
      } catch (e) { return false; }
    }));

    const success = results.filter(Boolean).length;
    const msg = (success === ALL_ACCOUNTS.length) 
      ? '✅ Ранги успешно установлены на всех аккаунтах' 
      : `❌ Ошибка! Успешно: ${success}/${ALL_ACCOUNTS.length}`;
      
    await bot.telegram.sendMessage(chatId, msg);
  }
};
