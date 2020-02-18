
const { Wechaty } = require("wechaty");
const qrt = require("qrcode-terminal");
const router = require("./control/router.js");
const config = require("./control/config.js");
const clock = require("./tools/clock.js");
const dailyCheck = require("./tools/dailyCheck.js");

//设置一个bot
const bot = new Wechaty({ profile: "test" });
//扫描二维码
bot.on('scan', router.showQrCode)
//登录
bot.on('login', user => {
    console.log(`${user}登录成功❤`);
})
//接受信息
bot.on('message', (msg) => {
    //监视打卡群的消息
    if (msg.room()) {
        msg.room().topic().then((topic) => {
            if (topic == config.clockInRoom) router.clockInMsg(msg);
        })
    }
    //监视其他消息
})
//启动
bot.start()


//定时任务,保持登录
clock.clockFunction("*/1 * * * *", () => {
    const contact = bot.Contact.load(config.toolId);//找到文件传输助手
    if (contact) {
        const timeMsg = (new Date).toLocaleString();//定义时间
        contact //发送时间
            .say(timeMsg)
            .then(() => {
                console.log(timeMsg);
            });
    }
})

//定时任务每天晚上23:58:30开始检查
clock.clockFunction("30 58 23 * * *", () => {
    const date = (new Date()).toLocaleDateString();
    dailyCheck.dailyCheck(date)
})







// const { Wechaty } = require('wechaty') // import { Wechaty } from 'wechaty'

// Wechaty.instance() // Global Instance
//     .on('scan', (qrcode, status) => console.log(`Scan QR Code to login: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`))
//     .on('login', user => console.log(`User ${user} logined`))
//     .on('message', message => console.log(`Message: ${message}`))
//     .start()
