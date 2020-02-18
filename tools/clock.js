//刚刚安装的定时器
const schedule = require("node-schedule");

//传入时间参数
/**
 * 
 * @param {六位数字:秒,分,时,日,月,周几} frequency 
 * @param {没有参数,回调函数} callback(void)
 * https://www.npmjs.com/package/node-schedule
 */
function clockFunction(frequency, callback){
    schedule.scheduleJob(frequency,(fireDate)=>{
        // console.log(fireDate.toLocaleString());
        callback();
    })
}

//暴露接口
exports.clockFunction = clockFunction;

//  "*/1 * * * *" 每分钟执行.
// clockFunction("*/1 * * * *",()=>{
//     console.log((new Date).toLocaleString())
// })