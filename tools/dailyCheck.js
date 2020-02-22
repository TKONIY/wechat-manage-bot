const db = require("../model/db.js")
const config = require("../control/config.js")

//已经测试，需要定时启动
//每日定点或手动检查数据库
//输入日期，更新，然后回调函数后续处理：比如提醒/踢人,callback没有参数
function lazyCount(dateStr, callback) {
    db.find(
        config.db,
        config.colls.msg,
        { date: dateStr },//查找当前日期的记录
        {}, (docs) => {
            //寻找所有当前日期的msg，将用户编号存入数组
            docsToArr(docs, "index", (clockInArr) => {
                console.log("今天已打卡共" + clockInArr.length + "人: " + clockInArr.sort());
            })//打印打卡的人的编号
            updateUser(0, docs, callback);//将所有该日期未打卡用户的lazyday+1
        }
    )
}

//lazyCount中的递归函数
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
                (result) => {
                    console.log("lazydays更新完成:" + JSON.stringify(result.result));
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
                    console.log(i + "# 打卡状态已登记");
                    updateUser(i + 1, docs, callback);
                }
            )
        }
    }
}
//1. 找到两天没打卡的人进行,返回docs
//2. 将所有status:200，lazyday:3的人status设置为404，在lazycount的callback中调用
//callback回调函数参数为lazy2docs和lazy3docs，前者提醒后者踢出。
function setStatus(callback) {
    db.find(//找到两天没打卡的人进行提醒
        config.db,
        config.colls.user,
        {
            "status": 200,
            "lazyday": 2
        }, {},
        (lazy2docs) => {
            //callback(lazy2docs);
            //下一步，找到三天没打卡的人，将他们404并返回lazy3docs，直接踢出群
            db.find(
                config.db,
                config.colls.user,
                {
                    "status": 200,
                    "lazyday": 3
                }, {},
                (lazy3docs) => {//下一步将这些人全部404
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
                            callback(lazy2docs, lazy3docs);
                        }
                    )
                }
            )
        }
    )

}

//将记录数组中的某个key的value提取出来转换为数组的函数,回调参数为array
//参数为docs，query:"index" or "name"，字符串
function docsToArr(docs, query, callback) {
    var array = [];
    (function iter(i) {
        if (i >= docs.length) {//递归结束
            callback(array);
            return;
        } else {                //递归
            array.push(docs[i][query])//直接根据键值查找
            iter(i + 1);//遍历下一个
        }
    })(0)
}


//将记录数组中的名字提取出来转换为数组的函数

//暴露接口
exports.lazyCount = lazyCount;
exports.setStatus = setStatus;
exports.docsToArr = docsToArr;

// const date = (new Date()).toLocaleDateString();


// console.log(date);

//※※主程序※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
function dailyCheck(date, callback) {
    lazyCount(date, () => {                                 //更新lazyday
        setStatus((lazy2docs, lazy3docs) => {               //更新status         
            docsToArr(lazy2docs, "index", (lazy2arr) => {   //提取要提醒和要踢出的index名单
                docsToArr(lazy3docs, "index", (lazy3arr) => {
                    console.log("2天没打卡共" + lazy2arr.length + "人: " + lazy2arr.sort());
                    console.log("3天没打卡共" + lazy3arr.length + "人: " + lazy3arr.sort());
                    callback(lazy2arr, lazy3arr)
                })
            })
        })
    })
}
exports.dailyCheck = dailyCheck
//该脚本提供的借口可单独手动调用
dailyCheck((new Date()).toLocaleDateString())
