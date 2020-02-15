const db = require("../model/db.js")
const config = require("../control/config.js")

//每日定点或手动检查数据库
//输入日期，更新，然后回调函数后续处理：比如提醒/踢人
exports.dailyCheck = (dateStr, callback) => {
    db.find(
        config.db,
        config.colls.msg,
        { date: dateStr },//查找当前日期的记录
        {}, (docs) => {
            //寻找所有当前日期的msg，将用户编号存入数组
            docs = unique(docs);//去重
            updateUser(0, docs);//将所有该日期未打卡用户的lazyday+1
        }
    )
}

//递归函数
function updateUser(i, docs) {
    {  //递归
        if (i >= docs.length) {
            //全部
            db.update(
                config.db,
                config.colls.user,
                {},
                { $inc: { lazyday: 1 } },//所有lazyday+1
                { multi: true },
                (reqsult) => {
                    console.log("lazydays更新完成");
                    return;
                }
            )
        } else {//每个打卡的-1
            db.update(
                config.db,
                config.colls.user,
                {                         //通过name和index匹配，防止错误
                    name: docs[i].name,
                    index: docs[i].index
                },
                { $inc: { lazyday: -1 } },//打卡的lazyday-1
                { multi: false },
                (result) => {
                    console.log(result)
                    updateUser(i + 1, docs);
                }
            )
        }
    }
}