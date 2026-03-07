const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let users = [];
let approvedUsers = [];
let latestSignal = "No signal yet.";
let signalMessages = [];

bot.onText(/\/start/, async (msg) => {

    const chatId = msg.chat.id;

    // 1️⃣ Matrix 숫자 출력
    const scan = await bot.sendMessage(chatId,
`01001010 10100101 01001010
11001010 01010101 00101010
01010101 01001010 11010101
10101010 01010101 01010101

SYSTEM SCANNING...
`);

    // 2️⃣ 2초 후 업데이트
    setTimeout(() => {

        bot.editMessageText(
`01001010 10100101 01001010
11001010 01010101 00101010
01010101 01001010 11010101

LANGUAGE DETECTED

KOREAN
`,
        {
            chat_id: chatId,
            message_id: scan.message_id
        });

    }, 2000);


    // 3️⃣ 4초 후 한국어 메시지
    setTimeout(() => {

        bot.editMessageText(
`𓁿 SIGNAL 시스템 접속 요청

이 봇은 암호화폐 시그널을 제공합니다.

모든 투자 결정과 책임은
전적으로 사용자에게 있습니다.

동의하시고, 시스템에 접속하시겠습니까?`,
        {
            chat_id: chatId,
            message_id: scan.message_id,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🔓 시스템 접속", callback_data: "agree" }]
                ]
            }
        });

    }, 4000);

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
`𓁿 SIGNAL 온라인 🟢`,
{
    reply_markup: {
        inline_keyboard: [
            [{ text: "SCANNING...", callback_data: "signal" }]
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
