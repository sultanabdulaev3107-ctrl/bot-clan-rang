export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("OK");

    const BOT_TOKEN = "8633981336:AAFW5LLkttd6yzwTUq0rJtIB7K4FVQALLEQ";
    const OWNER_ID = 8732464021;
    const CHAT_ID = 8732464021;
    const MY_CLAN_IDS = ["ddlcbcdj", "qnxouqwo"];

    const update = await request.json();
    if (!update.message) return new Response("no message");

    const msg = update.message;
    const text = msg.text || "";
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const username = msg.from.username ? `@${msg.from.username}` : "NoUsername";

    async function send(t) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: t
        })
      });
    }

    async function sendToOwner(t) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: t
        })
      });
    }

    async function isAdmin(id) {
      if (id === OWNER_ID) return true;
      const kv = await env.BOT_KV.get(`admin_${id}`);
      return kv === "true";
    }

    if (text === "/start") {
      await send(
        `🏷️ имя: ${msg.from.first_name}\n🪪 user: ${username}\n🌐 tg id: ${userId}\n💰 balance: unlimited\n\n📧 ВВЕДИ ACCESS TOKEN`
      );
      return new Response("ok");
    }

    if (text === "/level") {
      if (!(await isAdmin(userId))) {
        await send("🛑 у вас нет доступа");
        return new Response("no");
      }

      await send("🚀 Запуск KING RANK...");
      await send("👑 KING RANK установлены!");

      return new Response("ok");
    }

    if (text.startsWith("+admin")) {
      if (!(await isAdmin(userId))) {
        await send("🛑 у вас нет доступа");
        return new Response("no");
      }

      const id = text.replace("+admin", "").trim();
      if (/^\d+$/.test(id)) {
        await env.BOT_KV.put(`admin_${id}`, "true");
        await send(`✅ Админ добавлен: ${id}`);
      }

      return new Response("ok");
    }

    if (text.startsWith("-admin")) {
      if (!(await isAdmin(userId))) {
        await send("🛑 у вас нет доступа");
        return new Response("no");
      }

      const id = text.replace("-admin", "").trim();
      if (/^\d+$/.test(id)) {
        await env.BOT_KV.delete(`admin_${id}`);
        await send(`❌ Админ удалён: ${id}`);
      }

      return new Response("ok");
    }

    if (text === "/admin") {
      if (!(await isAdmin(userId))) {
        await send("🛑 у вас нет доступа");
        return new Response("no");
      }

      await send("🛡️ Админы хранятся в KV");
      return new Response("ok");
    }

    if (text === "ACCESS TOKEN") {
      if (userId !== OWNER_ID && !MY_CLAN_IDS.includes("ddlcbcdj")) {
        await send("❌️ Вы не являетесь участником LEVEL PERFORMANCE 🔴🟣🔵");
        return new Response("no clan");
      }

      await send("✅ Готово!");
      return new Response("ok");
    }

    return new Response("ignored");
  },

  async scheduled(event, env, ctx) {
    const BOT_TOKEN = "PASTE_YOUR_BOT_TOKEN_HERE";
    const CHAT_ID = 123456789;

    async function send(t) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: t
        })
      });
    }

    await send("🚀 AUTO LEVEL START");
    await send("👑 KING RANK установлены автоматически");
  }
};
