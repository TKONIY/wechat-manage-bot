const config = require("./config.js");
const db = require("../model/db.js");


//扫码
exports.showQrCode = (qrcode, status) => {
    if (status == 0) {
        qrt.generate(qrcode, { small: true });
    }
    const qrcodeImageUrl = [
        'https://api.qrserver.com/v1/create-qr-code/?data=',
        encodeURIComponent(qrcode)
    ].join('')
    console.log(qrcodeImageUrl)
}

//接受指定群聊的群聊信息（现在是打卡群
exports.clockInMsg = (msg) => {
    //接受信息
    var text = msg.text().replace(/\s*/g, "");//去掉全部空格
    //设置正则表达式，+表示至少一个，*表示至少0次
    const regEn = /^(\d+)#([\s\S]*)$/;//中文符号＃
    const regCn = /^(\d+)＃([\s\S]*)$/;//英文符号#
    text = regEn.exec(text) || regCn.exec(text);//提取关键值

    if (text) {//如果匹配

        const index = parseInt(text[1]);//提取数字
        const content = text[2]//提取内容
        const date = (new Date()).toLocaleDateString();//年月日
        const name = msg.from().name();//用户名

        const doc = {   //定义存入数据库的记录
            "date": date,
            "name": name,
            "index": index,
            "content": content
        }

        console.log(doc);
        //如果今天已经打卡，那就这次的就不算。
        db.find(
            config.db,
            config.colls.msg,
            { "date": date, "index": index },
            {}, (docs) => {
                if (docs.length == 0) {//如果今天还没打
                    db.insertOne(
                        config.db,//插入数据库
                        config.colls.msg,
                        doc, (err, result) => {
                            if (err) console.log(err);
                            else console.log(index + " 已打卡, 日期为 " + date);
                        }
                    )
                    //临时函数！修改名单为微信用户名，差不多都修改完了就可以注释掉这里了>>>>>>>>>>>>>>>>>>
                    db.update(
                        config.db,
                        config.colls.user,
                        { "index": index },
                        { $set: { "name": name } },
                        {}, (result) => {
                            console.log("user已更正" + name + "的用户名。");
                        }
                    )
                    ///<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< 
                }
            }
        )
    }
    //接受来源
    //提取编号
    //判断该信息源是否和之前某一个来源拥有了同样的编号，如果是，那么回复：@id1 你的编号和 @id2 的冲突。
    //没有问题则存入数据库
}

