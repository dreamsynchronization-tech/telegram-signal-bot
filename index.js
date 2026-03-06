const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let users = [];
let approvedUsers = [];
let latestSignal = "No signal yet.";
let signalMessages = [];

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

bot.on("callback_query", (query) => {

    const chatId = query.message.chat.id;

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
                        { text: "🔥 BUY", url: `https://phantom.com/tokens/solana/${latestSignalCA}` }
                    ]
                ]
            }
        });
    }

});

let latestSignalCA = "";

bot.onText(/\/alpha (.+)/, async (msg, match) => {

    const chatId = msg.chat.id;

    if (chatId.toString() !== process.env.ADMIN_ID) return;

    const ca = match[1];
    latestSignalCA = ca;

    latestSignal = `🚨 ALPHA ALERT 🚨

CA:
\`${ca}\`

Tap to copy ↑
`;

    // 이전 SIGNAL 삭제
    for (const m of signalMessages) {
        try {
            await bot.deleteMessage(m.chatId, m.messageId);
        } catch (e) {}
    }

    signalMessages = [];

    // 새로운 SIGNAL 전송
    users.forEach(async (user) => {

        try {

            const sent = await bot.sendMessage(user, latestSignal, {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "🔥 BUY", url: `https://phantom.com/tokens/solana/${ca}` }
                        ]
                    ]
                }
            });

            signalMessages.push({
                chatId: user,
                messageId: sent.message_id
            });

        } catch (e) {}

    });

});
