const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

const bot = new TelegramBot(token, { polling: true });

let users = new Set();
let approvedUsers = new Set();

let latestSignal = "No signal yet.";
let latestSignalCA = "";
let signalMessages = [];



/* =========================
   UI FUNCTIONS
========================= */

function showMainMenu(chatId, messageId = null) {

    const text =
`𓁿 SIGNAL ONLINE ᯤ

Blockchain Scanning...

⚠︎ 알림을 켜두지 않으면 시그널을 놓칠 수 있습니다.`;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "ⓘ Info", callback_data: "info" }]
            ]
        }
    };

    if (messageId) {
        bot.editMessageText(text, {
            chat_id: chatId,
            message_id: messageId,
            ...options
        });
    } else {
        bot.sendMessage(chatId, text, options);
    }
}



function showInfo(chatId, messageId) {

    const text =
`𓁿 SIGNAL PROTOCOL

이 시스템은
암호화폐 네트워크를
실시간으로 스캔합니다.

이상 움직임이 감지되면
SIGNAL이 전송됩니다.

━━━━━━━━━━━━

사용 방법

1) 알림을 켜두세요

2) SIGNAL이 도착하면
BUY 버튼을 누르세요

3) Phantom 지갑으로
즉시 구매할 수 있습니다.

Phantom 지갑에
Solana가 준비되어 있으면
더 빠르게 실행됩니다.

SIGNAL은
언제든 나타날 수 있습니다.`;

    bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔙 Back", callback_data: "menu" }]
            ]
        }
    });
}



/* =========================
   START COMMAND
========================= */

bot.onText(/\/start/, async (msg) => {

    const chatId = msg.chat.id;

    const scan = await bot.sendMessage(chatId,
`01001010 10100101 01001010
11001010 01010101 00101010
01010101 01001010 11010101
10101010 01010101 01010101

SYSTEM SCANNING...`
);

    setTimeout(() => {

        bot.editMessageText(
`01001010 10100101 01001010
11001010 01010101 00101010
01010101 01001010 11010101

LANGUAGE DETECTED

KOREAN`,
        {
            chat_id: chatId,
            message_id: scan.message_id
        });

    }, 2000);


    setTimeout(() => {

        bot.editMessageText(
`𓁿 SIGNAL 시스템 접속 요청

이 봇은 암호화폐 시그널을 제공합니다.

모든 투자 책임은
사용자에게 있습니다.

시스템에 접속하시겠습니까?`,
        {
            chat_id: chatId,
            message_id: scan.message_id,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "⚷ 시스템 접속", callback_data: "agree" }]
                ]
            }
        });

    }, 4000);

});



/* =========================
   BUTTON HANDLER
========================= */

bot.on("callback_query", async (query) => {

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    bot.answerCallbackQuery(query.id);



    // 시스템 접속
    if (query.data === "agree") {

        users.add(chatId);
        approvedUsers.add(chatId);

        showMainMenu(chatId);
    }



    // Info
    if (query.data === "info") {
        showInfo(chatId, messageId);
    }



    // Back to Menu
    if (query.data === "menu") {
        showMainMenu(chatId, messageId);
    }



    // SIGNAL 확인
    if (query.data === "signal") {

        if (!approvedUsers.has(chatId)) {
            bot.sendMessage(chatId, "⚠️ 먼저 시스템 접속 필요");
            return;
        }

        bot.sendMessage(chatId, latestSignal, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "⛁ ₿UY",
                            url: `https://phantom.com/tokens/solana/${latestSignalCA}`
                        }
                    ]
                ]
            }
        });

    }

});



/* =========================
   ADMIN SIGNAL
========================= */

bot.onText(/\/alpha (.+)/, async (msg, match) => {

    const chatId = msg.chat.id;

    if (chatId.toString() !== ADMIN_ID) return;

    const ca = match[1];

    latestSignalCA = ca;

    latestSignal =
`🚨 SIGNAL DETECTED 🚨

CA
\`${ca}\`

Tap to copy`;


    // 이전 시그널 삭제
    for (const m of signalMessages) {
        try {
            await bot.deleteMessage(m.chatId, m.messageId);
        } catch {}
    }

    signalMessages = [];


    // 유저에게 전송
    for (const user of users) {

        try {

            const sent = await bot.sendMessage(user, latestSignal, {

                parse_mode: "Markdown",

                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "⛁ ₿UY",
                                url: `https://phantom.com/tokens/solana/${ca}`
                            }
                        ]
                    ]
                }

            });

            signalMessages.push({
                chatId: user,
                messageId: sent.message_id
            });

        } catch {}

    }

});
