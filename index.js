const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let users = [];
let approvedUsers = [];
let latestSignal = "No signal yet.";
let latestSignalCA = "";
let signalMessages = [];


// START
bot.onText(/\/start/, async (msg) => {

    const chatId = msg.chat.id;

    const scan = await bot.sendMessage(chatId,
`01001010 10100101 01001010
11001010 01010101 00101010
01010101 01001010 11010101
10101010 01010101 01010101

SYSTEM SCANNING...
`);

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
                    [{ text: "🔓 시스템 접속", callback_data: "agree" }]
                ]
            }
        });

    }, 4000);

});



// 버튼 시스템
bot.on("callback_query", async (query) => {

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;



// 시스템 접속
if (query.data === "agree") {

    if (!users.includes(chatId)) users.push(chatId);
    if (!approvedUsers.includes(chatId)) approvedUsers.push(chatId);

    bot.sendMessage(chatId,
`𓁿 SIGNAL ONLINE

Blockchain Scanning...

⚠️ 알림 켜두세요`,
{
    reply_markup: {
        inline_keyboard: [
            [{ text: "𖥂 READ", callback_data: "access" }]
        ]
    }
});

}



// HOW IT WORKS
if (query.data === "access") {

    const loading = await bot.sendMessage(chatId,
`ACCESSING PROTOCOL...`
);

    setTimeout(() => {

        bot.editMessageText(
`𓁿 SIGNAL PROTOCOL

Solana 네트워크 실시간 스캔

━━━━━━━━━━━━━━

사용 방법

1️⃣ 봇 열어두기

2️⃣ 알림 켜기

3️⃣ 시그널 오면
🔥 BUY 버튼 클릭

━━━━━━━━━━━━━━

차트를 계속 볼 필요 없습니다.

시그널이 감지되면
시스템이 먼저 알려줍니다.

다음 시그널은
언제든 나타날 수 있습니다.`,
{
    chat_id: chatId,
    message_id: loading.message_id,
    reply_markup: {
        inline_keyboard: [
            [{ text: "🔙 BACK", callback_data: "back" }]
        ]
    }
});

    }, 1200);

}



// BACK 버튼
if (query.data === "back") {

    bot.sendMessage(chatId,
`𓁿 SIGNAL ONLINE

Blockchain Scanning...

⚠️ 알림 켜두세요`,
{
    reply_markup: {
        inline_keyboard: [
            [{ text: "𖥂 READ", callback_data: "access" }]
        ]
    }
});

}



// SIGNAL 확인 버튼
if (query.data === "signal") {

    if (!approvedUsers.includes(chatId)) {
        bot.sendMessage(chatId, "⚠️ 먼저 시스템 접속 필요");
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




// 관리자 시그널 전송
bot.onText(/\/alpha (.+)/, async (msg, match) => {

    const chatId = msg.chat.id;

    if (chatId.toString() !== process.env.ADMIN_ID) return;

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
        } catch (e) {}
    }

    signalMessages = [];


    // 모든 유저에게 전송
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
