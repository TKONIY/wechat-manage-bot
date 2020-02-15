const db = require("../model/db.js")
const config = require("../control/config.js")

//已经测试，需要定时启动
//每日定点或手动检查数据库
//输入日期，更新，然后回调函数后续处理：比如提醒/踢人,callback没有参数
function dailyCheck(dateStr, callback) {
    db.find(
        config.db,
        config.colls.msg,
        { date: dateStr },//查找当前日期的记录
        {}, (docs) => {
            //寻找所有当前日期的msg，将用户编号存入数组
            updateUser(0, docs, callback);//将所有该日期未打卡用户的lazyday+1
            console.log(docs);
        }
    )
}

//dailyCheck中的递归函数
function updateUser(i, docs, callback) {
    {  //递归
        if (i >= docs.length) {
            //全部
            db.update(
                config.db,
                config.colls.user,
                { status: 200 },//仅对打卡状态的用户进行操作
                { $inc: { lazyday: 1 } },//所有lazyday+1
                { multi: true },
                (reqsult) => {
                    console.log("lazydays更新完成");
                    callback();
                    return;
                }
            )
        } else {//每个打卡的-1
            db.update(
                config.db,
                config.colls.user,
                { index: docs[i].index },//仅通过index匹配，防止错误
                { $inc: { lazyday: -1 } },//打卡的lazyday-1
                { multi: false },
                (result) => {
                    console.log(i);
                    updateUser(i + 1, docs, callback);
                }
            )
        }
    }
}

//将所有status:200，lazyday:3的人status设置为404，在dailyCheck的callback中调用
//callback回调函数没有参数，里面可以调用踢出群聊函数，router里面写吧
function setStatus(callback) {
    db.update(
        config.db,
        config.colls.user,
        {
            "status": 200,
            "lazyday": 3
        },
        { $set: { "status": 404 } },
        { multi: true },
        (result) => {
            console.log("已经将3天不打卡的人404")
            callback()
        }
    )
}//未测试

//暴露接口
exports.dailyCheck = dailyCheck;
exports.setStatus = setStatus;
// dailyCheck("2020-2-16", () => {
//     return;
// })