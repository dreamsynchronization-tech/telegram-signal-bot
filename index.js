const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let users = [];
let latestSignal = "No signal yet.";

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    if (!users.includes(chatId)) {
        users.push(chatId);
    }

    bot.sendMessage(chatId, "⚡ DREAMSYNC SIGNAL SYSTEM ⚡", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔥 THE SIGNAL", callback_data: "signal" }]
            ]
        }
    });
});

bot.on("callback_query", (query) => {
    if (query.data === "signal") {
        bot.sendMessage(query.message.chat.id, latestSignal);
    }
});

bot.onText(/\/alpha (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    if (chatId.toString() !== process.env.ADMIN_ID) return;

    latestSignal = "🚨 ALPHA ALERT 🚨\n" + match[1];

    users.forEach(user => {
        bot.sendMessage(user, latestSignal);
    });
});
