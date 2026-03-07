const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const token = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

const bot = new TelegramBot(token, { polling: true });

/* =========================
   STORAGE
========================= */

const USERS_FILE = "/data/users.json";
const INVITE_FILE = "/data/invites.json";

if (!fs.existsSync("/data")) {
    fs.mkdirSync("/data", { recursive: true });
}

let users = new Set();
let invites = {};

if (fs.existsSync(USERS_FILE)) {
    users = new Set(JSON.parse(fs.readFileSync(USERS_FILE)));
}

if (fs.existsSync(INVITE_FILE)) {
    invites = JSON.parse(fs.readFileSync(INVITE_FILE));
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify([...users]));
}

function saveInvites() {
    fs.writeFileSync(INVITE_FILE, JSON.stringify(invites));
}

/* =========================
   SIGNAL DATA
========================= */

let signalMessages = [];

/* =========================
   MAIN MENU
========================= */

function showMainMenu(chatId, messageId=null) {

const text =
`𓁿 SIGNAL ONLINE

Blockchain scanning...

⚠ 알림을 켜두세요`;

const keyboard = {
reply_markup:{
inline_keyboard:[
[
{ text:"ⓘ Info", callback_data:"info" },
{ text:"💰 Earn", callback_data:"earn" }
]
]
}
};

if(messageId){
bot.editMessageText(text,{
chat_id:chatId,
message_id:messageId,
...keyboard
});
}else{
bot.sendMessage(chatId,text,keyboard);
}

}

/* =========================
   INFO
========================= */

function showInfo(chatId,messageId){

const text =
`𓁿 SIGNAL PROTOCOL

이 시스템은
암호화폐 네트워크를
실시간으로 스캔합니다.

이상 움직임 감지시
SIGNAL 전송됩니다.`;

bot.editMessageText(text,{
chat_id:chatId,
message_id:messageId,
reply_markup:{
inline_keyboard:[
[{text:"🔙 Back",callback_data:"menu"}]
]
}
});

}

/* =========================
   EARN
========================= */

function showEarn(chatId,messageId){

const inviteCount = invites[chatId] || 0;

const text =
`💰 EARN SYSTEM

Invite 3 friends
Earn 1 dice 🎲

🎯 6이 3번 연속 나오면
₩10,000,000

Your invites: ${inviteCount}

Invite link:
https://t.me/${process.env.BOT_USERNAME}?start=${chatId}`;

bot.editMessageText(text,{
chat_id:chatId,
message_id:messageId,
reply_markup:{
inline_keyboard:[
[
{ text:"🎲 Roll Dice",callback_data:"dice" }
],
[
{ text:"🔙 Back",callback_data:"menu"}
]
]
}
});

}

/* =========================
   START
========================= */

bot.onText(/\/start(.*)/, async(msg,match)=>{

const chatId = msg.chat.id;

const ref = match[1].trim();

if(ref && ref !== chatId.toString()){

invites[ref] = (invites[ref] || 0) + 1;
saveInvites();

}

users.add(chatId);
saveUsers();

showMainMenu(chatId);

});

/* =========================
   BUTTON HANDLER
========================= */

bot.on("callback_query",async(query)=>{

const chatId = query.message.chat.id;
const messageId = query.message.message_id;

bot.answerCallbackQuery(query.id);

if(query.data === "menu"){
showMainMenu(chatId,messageId);
}

if(query.data === "info"){
showInfo(chatId,messageId);
}

if(query.data === "earn"){
showEarn(chatId,messageId);
}

if(query.data === "dice"){

const inviteCount = invites[chatId] || 0;

if(inviteCount < 3){
bot.sendMessage(chatId,"Invite 3 friends first.");
return;
}

bot.sendDice(chatId);

}

});

/* =========================
   ADMIN USERS
========================= */

bot.onText(/\/users/,msg=>{

if(msg.chat.id.toString() !== ADMIN_ID) return;

bot.sendMessage(msg.chat.id,
`👥 Total Users: ${users.size}`
);

});

/* =========================
   BROADCAST
========================= */

bot.onText(/\/broadcast (.+)/,async(msg,match)=>{

if(msg.chat.id.toString() !== ADMIN_ID) return;

const text = match[1];

for(const user of users){

try{

await bot.sendMessage(user,text);

}catch{

users.delete(user);
saveUsers();

}

}

});

/* =========================
   SIGNAL
========================= */

bot.onText(/\/alpha (.+)/, async (msg, match) => {

if (msg.chat.id.toString() !== ADMIN_ID) return;

const args = match[1].split(" ");

const ca = args[0];
const price = args[1] || null;

let signalText =
`🚨 SIGNAL DETECTED

CA
\`${ca}\``;

if(price){
signalText += `

현재 가격: ${price}`;
}

/* 이전 시그널 삭제 */

for(const m of signalMessages){

try{
await bot.deleteMessage(m.chatId,m.messageId);
}catch{}

}

signalMessages = [];

/* 전송 */

for(const user of users){

try{

const sent = await bot.sendMessage(user,signalText,{

parse_mode:"Markdown",

reply_markup:{
inline_keyboard:[
[
{
text:"⛁ Buy",
url:`https://phantom.com/tokens/solana/${ca}`
}
]
]
}

});

signalMessages.push({
chatId:user,
messageId:sent.message_id
});

}catch{

users.delete(user);
saveUsers();

}

}

});
