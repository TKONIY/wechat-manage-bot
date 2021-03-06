const db = require("../model/db.js")
const config = require("../control/config.js")

//测试使用，将所有status和lazyday重置。callback无参数。
function resetUser(callback) {
    db.update(
        config.db,
        config.colls.user,
        {},
        {
            $set: {
                "status": 200,
                "lazyday": 0
            }
        },
        { multi: true },
        (result) => {
            console.log("resetUser => result: " + JSON.stringify(result.result));
            callback();
        }
    )
}

//暴露
exports.resetUser = resetUser;

//该脚本仅限于手动单独调用
resetUser(() => { return });