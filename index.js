import { Telegraf } from 'telegraf';
import axios from 'axios';
import { ACCOUNTS } from './accounts.js';

export default {
  async fetch(request, env) {
    const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

    bot.command('start_rank', async (ctx) => {
      await ctx.reply('🚀 Запуск KING RANK');
      
      let successCount = 0;
      
      // Используем цикл с await для большей стабильности, чем Promise.all
      for (const acc of ACCOUNTS) {
        try {
          const token = await login(acc.email, acc.password, env.FIREBASE_LOGIN_URL);
          if (token) {
            const isSet = await setRank(token, env.RANK_URL);
            if (isSet) successCount++;
          }
        } catch (e) {
          console.log(`Error processing ${acc.email}:`, e.message);
        }
      }

      if (successCount === ACCOUNTS.length) {
        await ctx.reply('✅ KING RANK установлены');
      } else {
        await ctx.reply(`❌ KING RANK ошибка в установке (${successCount}/${ACCOUNTS.length} успешно)`);
      }
    });

    try {
      await bot.handleUpdate(await request.json());
      return new Response("OK", { status: 200 });
    } catch (err) {
      return new Response("OK", { status: 200 });
    }
  }
};

async function login(email, password, url) {
  try {
    const response = await axios.post(url, {
      clientType: "CLIENT_TYPE_ANDROID",
      email: email,
      password: password,
      returnSecureToken: true
    }, {
      headers: { 
        "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 12)",
        "Content-Type": "application/json"
      }
    });
    return response?.data?.idToken || null;
  } catch (e) {
    console.log(`Login error for ${email}:`, e.response?.data?.error?.message || e.message);
    return null;
  }
}

async function setRank(token, url) {
  const ratingData = {};
  [
    "cars", "car_fix", "car_collided", "car_exchange", "car_trade", "car_wash",
    "slicer_cut", "drift_max", "drift", "cargo", "delivery", "taxi", "levels",
    "gifts", "fuel", "offroad", "speed_banner", "reactions", "police", "run",
    "real_estate", "t_distance", "treasure", "block_post", "push_ups",
    "burnt_tire", "passanger_distance"
  ].forEach(k => ratingData[k] = 100000);
  ratingData["time"] = 10000000000;
  ratingData["race_win"] = 3000;

  try {
    const response = await axios.post(url, 
      { data: JSON.stringify({ RatingData: ratingData }) },
      { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "okhttp/3.12.13" } }
    );
    return response.status === 200;
  } catch (e) {
    console.log("SetRank error:", e.response?.data || e.message);
    return false;
  }
    }
