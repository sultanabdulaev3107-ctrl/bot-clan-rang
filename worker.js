import axios from 'axios';
import { ACCOUNTS } from './accounts.js';

export default {
  async fetch(request, env) {
    const results = [];

    // Цикл обработки каждого аккаунта из списка
    for (const acc of ACCOUNTS) {
      const token = await login(acc.email, acc.password, env.FIREBASE_LOGIN_URL);
      
      if (token) {
        const success = await setRank(token, env.RANK_URL);
        results.push({ email: acc.email, status: success ? "✅ Success" : "❌ Failed" });
      } else {
        results.push({ email: acc.email, status: "❌ Login Failed" });
      }
    }

    return new Response(JSON.stringify(results, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Функция авторизации через Firebase
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
    
    if (response.status === 200 && response.data.idToken) {
      return response.data.idToken;
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Функция установки ранга
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
