const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const token = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const BOT_USERNAME = process.env.BOT_USERNAME;

const bot = new TelegramBot(token,{polling:true});

/* =========================
STORAGE
========================= */

if(!fs.existsSync("/data")){
fs.mkdirSync("/data",{recursive:true});
}

const USERS_FILE="/data/users.json";
const INVITES_FILE="/data/invites.json";
const DICE_FILE="/data/dice.json";

let users=new Set();
let invites={};
let diceBalance={};
let diceHistory={};

if(fs.existsSync(USERS_FILE)){
users=new Set(JSON.parse(fs.readFileSync(USERS_FILE)));
}

if(fs.existsSync(INVITES_FILE)){
invites=JSON.parse(fs.readFileSync(INVITES_FILE));
}

if(fs.existsSync(DICE_FILE)){
diceBalance=JSON.parse(fs.readFileSync(DICE_FILE));
}

function saveUsers(){
fs.writeFileSync(USERS_FILE,JSON.stringify([...users]));
}

function saveInvites(){
fs.writeFileSync(INVITES_FILE,JSON.stringify(invites));
}

function saveDice(){
fs.writeFileSync(DICE_FILE,JSON.stringify(diceBalance));
}

/* =========================
MENU
========================= */

function showMainMenu(chatId,messageId=null){

const text=`𓁿 SIGNAL ONLINE ᯤ

Blockchain scanning...

⚠ 알림을 켜두지 않으면 시그널을 놓칠 수 있습니다.`;

const options={
reply_markup:{
inline_keyboard:[
[
{ text:"ⓘ Info",callback_data:"info"},
{ text:"Ⰶ Earn",callback_data:"earn"}
]
]
}
};

if(messageId){
bot.editMessageText(text,{
chat_id:chatId,
message_id:messageId,
...options
});
}else{
bot.sendMessage(chatId,text,options);
}

}

/* =========================
INFO
========================= */

function showInfo(chatId,messageId){

const text=`𓁿 SIGNAL PROTOCOL

이 시스템은
암호화폐 네트워크를
실시간으로 스캔합니다.

이상 움직임 감지시
SIGNAL 전송됩니다.

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

const inviteCount=invites[chatId]||0;
const dice=diceBalance[chatId]||0;

const text=`Ⰶ EARN SYSTEM

Invite 3 friends → 1 Dice 🎲

🎯 Jackpot
Roll 6 three times in a row
Win ₩10,000,000

━━━━━━━━━━

Invites: ${inviteCount}
Dice Balance: ${dice}

Invite link
https://t.me/${BOT_USERNAME}?start=${chatId}`;

bot.editMessageText(text,{
chat_id:chatId,
message_id:messageId,
reply_markup:{
inline_keyboard:[
[{text:"🎲 Roll Dice",callback_data:"dice"}],
[{text:"🔙 Back",callback_data:"menu"}]
]
}
});

}

/* =========================
START
========================= */

bot.onText(/\/start(.*)/,async(msg,match)=>{

const chatId=msg.chat.id;
const ref=match[1].trim();

/* invite */

if(ref && ref!==chatId.toString()){

invites[ref]=(invites[ref]||0)+1;

if(invites[ref]%3===0){

diceBalance[ref]=(diceBalance[ref]||0)+1;
saveDice();

bot.sendMessage(ref,
`🎁 Invite reward!

You earned 1 Dice 🎲

Dice Balance: ${diceBalance[ref]}`
);

}

saveInvites();
}

/* scanning animation */

const scan=await bot.sendMessage(chatId,
`01001010 10100101 01001010
11001010 01010101 00101010
01010101 01001010 11010101
10101010 01010101 01010101

SYSTEM SCANNING...`
);

setTimeout(()=>{

bot.editMessageText(
`01001010 10100101 01001010
11001010 01010101 00101010

LANGUAGE DETECTED

KOREAN`,
{
chat_id:chatId,
message_id:scan.message_id
});

},2000);

setTimeout(()=>{

bot.editMessageText(
`𓁿 SIGNAL 시스템 접속 요청

이 봇은 암호화폐 시그널을 제공합니다.

모든 투자 책임은
사용자에게 있습니다.

동의하시고 시스템에 접속하시겠습니까?`,
{
chat_id:chatId,
message_id:scan.message_id,
reply_markup:{
inline_keyboard:[
[{text:"⚷ 시스템 접속",callback_data:"agree"}]
]
}
});

},4000);

});

/* =========================
BUTTONS
========================= */

bot.on("callback_query",async(query)=>{

const chatId=query.message.chat.id;
const messageId=query.message.message_id;

bot.answerCallbackQuery(query.id);

if(query.data==="agree"){

users.add(chatId);
saveUsers();

showMainMenu(chatId);

}

if(query.data==="menu"){
showMainMenu(chatId,messageId);
}

if(query.data==="info"){
showInfo(chatId,messageId);
}

if(query.data==="earn"){
showEarn(chatId,messageId);
}

/* dice */

if(query.data==="dice"){

const balance=diceBalance[chatId]||0;

if(balance<=0){
bot.sendMessage(chatId,"❌ You have no dice.");
return;
}

diceBalance[chatId]-=1;
saveDice();

/* history */

if(!diceHistory[chatId]){
diceHistory[chatId]=[];
}

/* telegram dice */

let diceMsg=await bot.sendDice(chatId);
let roll=diceMsg.dice.value;

/* 6 6 상태면 6 방지 */

if(
diceHistory[chatId].length>=2 &&
diceHistory[chatId][diceHistory[chatId].length-1]===6 &&
diceHistory[chatId][diceHistory[chatId].length-2]===6 &&
roll===6
){

diceMsg=await bot.sendDice(chatId);
roll=diceMsg.dice.value;

}

/* 기록 */

diceHistory[chatId].push(roll);

if(diceHistory[chatId].length>3){
diceHistory[chatId].shift();
}

setTimeout(()=>{

bot.sendMessage(chatId,
`🎲 Dice Result

You rolled: ${roll}

Dice Left: ${diceBalance[chatId]}`
);

},2000);

}

});

/* =========================
ADMIN USERS
========================= */

bot.onText(/\/users/,msg=>{

if(msg.chat.id.toString()!==ADMIN_ID) return;

bot.sendMessage(msg.chat.id,
`👥 Total Users: ${users.size}`
);

});

/* =========================
BROADCAST
========================= */

bot.onText(/\/broadcast (.+)/,async(msg,match)=>{

if(msg.chat.id.toString()!==ADMIN_ID) return;

const text=match[1];

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

bot.onText(/\/alpha (.+)/,async(msg,match)=>{

if(msg.chat.id.toString()!==ADMIN_ID) return;

const args=match[1].split(" ");
const ca=args[0];
const price=args[1];

let text=`🚨 SIGNAL DETECTED

CA
\`${ca}\``;

if(price){
text+=`\n\n현재 가격: ${price}`;
}

for(const user of users){

try{

await bot.sendMessage(user,text,{
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

}catch{

users.delete(user);
saveUsers();

}

}

});
