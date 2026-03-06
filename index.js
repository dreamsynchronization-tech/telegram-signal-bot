const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let users = [];
let approvedUsers = [];

let latestSignal = "No signal yet.";
let latestCA = "";


// START
bot.onText(/\/start/, (msg) => {

    const chatId = msg.chat.id;

    bot.sendMessage(chatId,
`⚠️ DREAMSYNC SIGNAL SYSTEM

This bot shares crypto signals.

There is NO guarantee of profit.

All investment decisions and risks
are entirely your responsibility.

Do you agree to use this bot?`,
{
    reply_markup: {
        inline_keyboard: [
            [{ text: "✅ YES", callback_data: "agree" }]
        ]
    }
});

});


// BUTTON HANDLER
bot.on("callback_query", (query) => {

    const chatId = query.message.chat.id;


    // USER AGREES
    if (query.data === "agree") {

        if (!users.includes(chatId)) {
            users.push(chatId);
        }

        if (!approvedUsers.includes(chatId)) {
            approvedUsers.push(chatId);
        }

        bot.sendMessage(chatId,
`⚡ DREAMSYNC SIGNAL SYSTEM ⚡`,
{
    reply_markup: {
        inline_keyboard: [
            [{ text: "🔥 THE SIGNAL", callback_data: "signal" }]
        ]
    }
});

    }


    // SIGNAL BUTTON
    if (query.data === "signal") {

        if (!approvedUsers.includes(chatId)) {
            bot.sendMessage(chatId, "⚠️ You must agree first.");
            return;
        }

        bot.sendMessage(chatId, latestSignal, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🔥 BUY", url: `https://phantom.com/tokens/solana/${latestCA}` }
                    ],
                ]
            }
        });

    }

});


// ADMIN SIGNAL COMMAND
bot.onText(/\/alpha (.+)/, (msg, match) => {

    const chatId = msg.chat.id;

    // ADMIN CHECK
    if (chatId.toString() !== process.env.ADMIN_ID) return;

    const ca = match[1];

    latestCA = ca;

    latestSignal = `🚨 ALPHA ALERT 🚨

CA: \`${ca}\`

Tap to copy ↑
`;

    users.forEach(user => {

        bot.sendMessage(user, latestSignal, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🔥 BUY", url: `https://phantom.com/tokens/solana/${ca}` }
                    ],
                ]
            }
        });

    });

});
