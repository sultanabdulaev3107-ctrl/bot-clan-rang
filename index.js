import { Telegraf } from 'telegraf';
import axios from 'axios';
import { ACCOUNTS } from './accounts.js';

export default {
  async fetch(request, env) {
    // 1. Инициализируем бота с токеном из переменных окружения
    const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

    // 2. Определяем команду
    bot.command('start_rank', async (ctx) => {
      await ctx.reply('🚀 Запуск процесса накрутки рангов, подождите...');
      
      let report = "📊 Результаты работы:\n\n";
      
      for (const acc of ACCOUNTS) {
        const token = await login(acc.email, acc.password, env.FIREBASE_LOGIN_URL);
        
        if (token) {
          const success = await setRank(token, env.RANK_URL);
          report += `📧 ${acc.email}: ${success ? "✅ Успешно" : "❌ Ошибка запроса"}\n`;
        } else {
          report += `📧 ${acc.email}: ❌ Ошибка логина\n`;
        }
      }
      
      await ctx.reply(report);
    });

    // 3. Обработка входящего Webhook запроса от Telegram
    try {
      const update = await request.json();
      await bot.handleUpdate(update);
      return new Response("OK", { status: 200 });
    } catch (err) {
      // Если пришел не JSON или ошибка, возвращаем 200, чтобы Телеграм не спамил
      return new Response("OK", { status: 200 });
    }
  }
};

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

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
    return null;
  }
}

async function setRank(token, url) {
  const ratingKeys = [
    "cars", "car_fix", "car_collided", "car_exchange", "car_trade", "car_wash",
    "slicer_cut", "drift_max", "drift", "cargo", "delivery", "taxi", "levels",
    "gifts", "fuel", "offroad", "speed_banner", "reactions", "police", "run",
    "real_estate", "t_distance", "treasure", "block_post", "push_ups",
    "burnt_tire", "passanger_distance"
  ];

  let ratingData = {};
  ratingKeys.forEach(key => ratingData[key] = 100000);
  ratingData["time"] = 10000000000;
  ratingData["race_win"] = 3000;

  try {
    const response = await axios.post(url, 
      { data: JSON.stringify({ RatingData: ratingData }) },
      { 
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Content-Type": "application/json",
          "User-Agent": "okhttp/3.12.13" 
        } 
      }
    );
    return response.status === 200;
  } catch (e) {
    return false;
  }
}
