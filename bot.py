import os
import telebot
from telebot import types

TOKEN = os.getenv("BOT_TOKEN")
ADMIN_ID = int(os.getenv("ADMIN_ID"))

bot = telebot.TeleBot(TOKEN)

links = [
    "https://b2b-garant.vercel.app",
    "https://crmb2b-garant.vercel.app",
    "https://b2b-garantcrm.vercel.app",
    "https://b2b-crmgarant.vercel.app",
    "https://crm-garant.vercel.app"
]

users_data = {}
current_link_index = 0

@bot.message_handler(commands=['start'])
def start(message):
    markup = types.InlineKeyboardMarkup()

    yes_btn = types.InlineKeyboardButton("✅ Да", callback_data="yes")
    no_btn = types.InlineKeyboardButton("❌ Нет", callback_data="no")

    markup.add(yes_btn, no_btn)

    bot.send_message(
        message.chat.id,
        f"Привет, {message.from_user.first_name}!\n\nХотите получить ссылку для доступа к CRM компании?",
        reply_markup=markup
    )

@bot.callback_query_handler(func=lambda call: True)
def callback(call):

    if call.data == "yes":
        msg = bot.send_message(call.message.chat.id, "Введите ваше имя")
        bot.register_next_step_handler(msg, get_name)

    elif call.data == "no":
        bot.send_message(
            call.message.chat.id,
            "Хорошо 🙂 Если передумаете — нажмите /start"
        )

def get_name(message):
    users_data[message.chat.id] = {
        "name": message.text
    }

    msg = bot.send_message(
        message.chat.id,
        "Введите свой рабочий номер телефона"
    )

    bot.register_next_step_handler(msg, get_phone)

def get_phone(message):
    global current_link_index

    phone = message.text
    name = users_data[message.chat.id]["name"]

    link = links[current_link_index]

    current_link_index += 1

    if current_link_index >= len(links):
        current_link_index = 0

    bot.send_message(
        message.chat.id,
        f"Отлично, ваша временная ссылка готова:\n\n{link}"
    )

    username = message.from_user.username

    if username:
        username_text = f"@{username}"
    else:
        username_text = "нет username"

    bot.send_message(
        ADMIN_ID,
        f"Новая заявка:\n\n👤 Имя: {name}\n📞 Телефон: {phone}\n🆔 Username: {username_text}"
    )

bot.infinity_polling()
