var send = require(CONFIG.root + "/core/send.js").send;

var mongo = require("mongodb");
var Server = mongo.Server;
var Db = mongo.Db;

var dataSources = {
    categoriesDS: {
        type: "mongo",
        db: "truckshop",
        collection: "categories"
    },
    articlesDS: {
        type: "mongo",
        db: "truckshop",
        collection: "articles"
    }
}

var databases = {};

var items = [];
var index = 0;

function initItems() {
    items = [];
    for (var i = 0; i < 10; i++) {
        items.push({
            id: ++index,
            text: "Static text" + (i + 1)
        });
    }
}

initItems();

exports.create = function(link) {

    if (!link.data) {
        send.badrequest(link, { status: "Missing data" });
    }

    if (items.length >= 20) {
        initItems();
    }

    var itemData = link.data;
    itemData.id = ++index;
    itemData.text = itemData.text + " "  + itemData.id;
    items.push(itemData);
    send.ok(link.res, itemData);
};

exports.read = function(link) {

    if (link.params && link.params.ds === "testDS") {
        send.ok(link.res, items);
        return;
    }

    resolveDataSource(link, function(err, ds) {

        if (err) {
            send.badrequest(link, err);
            return;
        }

        openDatabase(ds, function(err, db) {

            if (err) {
                send.badrequest(link, err);
                return;
            }

            db.collection(ds.collection, function(err, collection) {

                if (err) {
                    send.badrequest(link, err);
                    return;
                }

                collection.find().toArray(function(err, docs) {

                    if (err) { return console.error(err); }

                    send.ok(link.res, docs || []);
                });
            });
        });
    });
};

exports.update = function(link) {
    send.ok(link.res, { status: "OK" });
};

exports.remove = function(link) {

    if (!link.data) {
        send.badrequest(link, { status: "Missing data" });
    }

    if (link.data.ids) {
        var ids = link.data.ids;
        for (var i in ids) {
            removeItem(ids[i]);
        }
    } else {
        removeItem(link.data.id);
    }

    send.ok(link.res, { status: "OK" });
};

function removeItem(id) {
    for (var i in items) {
        if (items[i] && (items[i].id + "") == (id + "")) {
            items.splice(i, 1);
            break;
        }
    }
}

function resolveDataSource(link, callback) {

    if (!link.params || !link.params.ds) {
        return callback("This operation is missing the data source.");
    }

    // TODO here comes the API that gets the data source for application/user
    var ds = dataSources[link.params.ds];

    if (!ds) {
        return callback("Invalid data sourcefor this application: " + link.params.ds);
    }

    callback(null, ds);
}

function openDatabase(dataSource, callback) {

    if (!dataSource || !dataSource.db) {
        return callback("Invalid data source.");
    }

    switch (dataSource.type) {
        case "mongo":

            // check the cache first maybe we have it already
            if (databases[dataSource.db]) {
                callback(null, databases[dataSource.db]);
                return;
            }

            // open a new connection to the database
            var server = new Server('localhost', 27017, { auto_reconnect: true, poolSize: 5 });
            var db = new Db(dataSource.db, server, { safe: false });

            // cache this db connection
            databases[dataSource.db] = db;

            db.open(callback);
            return;

        default:
            return callback("Invalid data source type: " + dataSource.type);
    }

}

