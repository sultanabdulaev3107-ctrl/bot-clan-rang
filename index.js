import { Telegraf } from 'telegraf';
import axios from 'axios';
import { ACCOUNTS as PART1 } from './accounts_1.js';
import { ACCOUNTS as PART2 } from './accounts_2.js';
import { ACCOUNTS as PART3 } from './accounts_3.js';

async function processBatch(accounts, label, env) {
  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
  let success = 0;
  for (const acc of accounts) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const token = await login(acc.email, acc.password, env.FIREBASE_LOGIN_URL);
      if (token && await setRank(token, env.RANK_URL)) success++;
    } catch (e) {}
  }
  await bot.telegram.sendMessage(env.ADMIN_CHAT_ID, `✅ ${label}: ${success}/${accounts.length} успешно`);
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
  async scheduled(event, env, ctx) {
    // Утренние запуски
    if (event.cron === "20 0 * * *") await processBatch(PART1, "Утро Ч1", env);
    else if (event.cron === "45 0 * * *") await processBatch(PART2, "Утро Ч2", env);
    else if (event.cron === "10 1 * * *") await processBatch(PART3, "Утро Ч3", env);
    // Вечерние запуски
    else if (event.cron === "0 20 * * *") await processBatch(PART1, "Вечер Ч1", env);
    else if (event.cron === "30 20 * * *") await processBatch(PART2, "Вечер Ч2", env);
    else if (event.cron === "59 20 * * *") await processBatch(PART3, "Вечер Ч3", env);
  }
};
