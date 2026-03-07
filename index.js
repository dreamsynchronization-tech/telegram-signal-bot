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


bot.on("callback_query", async (query) => {

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // 시스템 접속
    if (query.data === "agree") {

        if (!users.includes(chatId)) {
            users.push(chatId);
        }

        if (!approvedUsers.includes(chatId)) {
            approvedUsers.push(chatId);
        }

        bot.sendMessage(chatId,
`𓁿 SIGNAL ONLINE 🟢

Solana Network Scanning...

이 시스템은 자동으로
시그널을 감지합니다.

시그널이 발견되면
즉시 알림이 전송됩니다.

알림을 켜두세요.`,
{
    reply_markup: {
        inline_keyboard: [
            [{ text: "🔓 ACCESS", callback_data: "access" }]
        ]
    }
});

    }

    // ACCESS 메뉴
    if (query.data === "access") {

        bot.sendMessage(chatId,
`𓁿 SIGNAL ACCESS

System modules detected.`,
{
    reply_markup: {
        inline_keyboard: [
            [{ text: "📡 HOW IT WORKS", callback_data: "how" }],
            [{ text: "👥 INVITE", callback_data: "invite" }],
            [{ text: "🎲 DICE", callback_data: "dice" }]
        ]
    }
});

    }

    // HOW IT WORKS
    if (query.data === "how") {

        const loading = await bot.sendMessage(chatId,
`ACCESSING MODULE...`
);

        setTimeout(() => {

            bot.editMessageText(
`SYSTEM MODULE: SIGNAL_PROTOCOL

01010110 01001001 01000101
01010111 00100000 01010011
01001001 01000111 01001110
01000001 01001100

DECODING PROTOCOL...

TRANSLATED

━━━━━━━━━━━━━━

𓁿 SIGNAL 프로토콜

이 시스템은
Solana 네트워크를
실시간으로 스캔합니다.

이상 움직임이 감지되면
즉시 시그널이 전송됩니다.

━━━━━━━━━━━━━━

사용 방법

1️⃣ 봇을 열어두세요

2️⃣ 알림을 켜두세요

3️⃣ 시그널이 도착하면
🔥 BUY 버튼으로
바로 구매할 수 있습니다

━━━━━━━━━━━━━━

차트를 계속 볼 필요 없습니다.

시그널이 감지되면
시스템이 먼저 알려줍니다.

다음 시그널은
언제든 나타날 수 있습니다.`,
            {
                chat_id: chatId,
                message_id: loading.message_id
            }
        );

        }, 1500);

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
