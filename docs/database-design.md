# 数据库设计
## 高层
| 对象       | 类别       |
| ---------- | ---------- |
| wechat     | db         |
| clockInMsg | collection |
| users      | collection |
## document
* clockInMsg: 
```json
{
    date: 日期如"2020-2-14"
    name: "用户名",
    index: 用户编号,
    text: "文本内容"
}
```
* user:
```json
{
    name:"用户名",
    index: 用户编号,
    status: 404/200/502 
    lazyday: 0/1/2/3
}
```
> * 404退群，502请假，200正常
> * status为200的人如果偷懒就将lazyday+1
