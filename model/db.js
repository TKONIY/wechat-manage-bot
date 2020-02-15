//DAO层，记得每个操作都要db.close()或client.close()
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

//连接数据库client不暴露给外部，供内部增删改查使用
function connectClient(callback) {
    var url = "mongodb://localhost:27017";
    var client = new MongoClient(url, { useUnifiedTopology: true });

    client.connect(function (err) {
        assert.equal(null, err);
        callback(client);//返回client.db给回调函数
    })
}

//插入数据DAO 
//注意，将insertOne()函数的callback原封不动地返回到API中，(result)
//这里的回调函数只返回result,如果出现错误需要render一些什么页面再返回err，暂时err由inertOne函数处理
exports.insertOne = (dbName, collectionName, json, callback) => {
    connectClient((client) => {//回调函数接收client对象
        var db = client.db(dbName);//获取db
        db.collection(collectionName).insertOne(json, (err, result) => {
            callback(err, result);//插入一条数据，返回err和result
            client.close();//关闭数据库
        });
    })
}

//find一个collection下的分页的docs(filter={})/部分doc
exports.find = function (dbName, collectionName, filter, args, callback) {

    //args= {pageamount, page}每页的条目数,第几页，find函数读取这一页的数据返回
    if (JSON.stringify(args) == '{}') {//传空的参数表示读全部
        var skip = 0;
        var limit = 0;
    }
    else {
        var skip = args.pageamount * args.page;
        var limit = args.pageamount;
    }

    connectClient((client) => {//连接client
        //获取db和collection
        var db = client.db(dbName);
        var collection = db.collection(collectionName);
        //将结果作为数组传回callback
        collection.find(filter)
            .skip(skip)
            .limit(limit)
            .toArray((err, docs) => {
                assert.equal(null, err);

                callback(docs);//传回docs
                client.close();//close()
            })
    })
}

//删除
exports.deleteMany = (dbName, collectionName, filter, callback) => {
    connectClient((client) => {
        var db = client.db(dbName);
        var collection = db.collection(collectionName);
        //根据filter删除
        collection.deleteMany(filter, (err, result) => {
            assert.equal(null, err);
            callback(result);
            client.close();
        })
    })
}

//修改
exports.update = (dbName, collectionName, selector, update, options, callback) => {
    connectClient((client) => {
        var db = client.db(dbName);
        var collection = db.collection(collectionName);
        // 进行修改
        collection.update(selector, update, options, (err, result) => {
            assert.equal(null, err);
            callback(result);
            client.close()
        })
    })
}