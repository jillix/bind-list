var send = require(CONFIG.root + "/core/send.js").send;

var mongo = require("mongodb");
var Server = mongo.Server;
var Db = mongo.Db;

var dataSources = {
    categoriesDS: {
        type: "mongo",
        db: "aktionshop",
        collection: "categories"
    },
    articlesDS: {
        type: "mongo",
        db: "aktionshop",
        collection: "articles"
    }
}

var databases = {};

var sampleItems = [];
var sampleIndex = 0;

function initSampleItems() {
    sampleItems = [];
    for (var i = 0; i < 10; i++) {
        sampleItems.push({
            id: ++sampleIndex,
            text: "Static item " + (i + 1)
        });
    }
}

initSampleItems();

exports.create = function(link) {

    if (!link.data) {
        send.badrequest(link, { status: "Missing data" });
        return;
    }

    // if this is a sample list
    if (link.params && link.params.ds === "testDS") {
        var itemData = createSampleItem(link.data);
        send.ok(link.res, itemData);
        return;
    }

    // TODO add create functionality

    send.ok(link.res, itemData);
};

exports.read = function(link) {

    var data = link.data || {};
    var filter = data.filter || {};
    var options = data.options || {};

    if (link.params && link.params.ds === "testDS") {
        
        var itemsToSend = sampleItems;
        
        if (options.skip >= 0 && options.limit >= 0) {

            var begin = options.skip;
            var end = begin + options.limit;
            
            if (end > itemsToSend.length) {
                end = itemsToSend.length;
            }
            
            itemsToSend = itemsToSend.slice(begin, end);
        }
        
        send.ok(link.res, itemsToSend);
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

                collection.find(filter, options).toArray(function(err, docs) {

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

exports.getPages = function(link) {
    var pagesNr = 0;
    
    var data = link.data || {};
    var size = data.size;
        
    if (link.params && link.params.ds === "testDS") {
        pagesNr = Math.ceil(sampleItems.length / size);
        
        send.ok(link.res, pagesNr || 0);
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

                collection.count(function(err, length) {

                    if (err) { return console.error(err); }
                    
                    pagesNr = Math.ceil(length / size);

                    send.ok(link.res, pagesNr);
                });
            });
        });
    });
};

exports.remove = function(link) {

    if (!link.data) {
        send.badrequest(link, { status: "Missing data" });
    }

    // test data
    if (link.params && link.params.ds === "testDS") {
        removeSampleItems(link.data);
        send.ok(link.res, { status: "OK" });
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

                var key = Object.keys(link.data)[0];
                var values = link.data[key] || [];

                // if the special mongo ID is the key, convert it to ObjectID
                if (key === '_id') {
                    for (var i in values) {
                        values[i] = mongo.ObjectID(values[i]);
                    }
                }

                var filter = {};
                filter[key] = { $in: values };

                collection.remove(filter, function(err, docs) {

                    if (err) { return console.error(err); }

                    send.ok(link.res);
                });
            });
        });
    });
};

function createSampleItem(data) {

    if (sampleItems.length >= 20) {
        initSampleItems();
    }

    var itemData = data;
    itemData.id = ++sampleIndex;
    itemData.text = "Dynamic item " + itemData.id;
    sampleItems.push(itemData);

    return itemData;
}

function removeSampleItems(data) { 

    var keys = Object.keys(data);
    var key = keys[0];
    var ids = data[key] || [];

    for (var j in ids) {
        for (var i in sampleItems) {
            if (sampleItems[i] && (sampleItems[i].id + "") == (ids[j] + "")) {
                sampleItems.splice(i, 1);
                break;
            }
        }
    }

    if (sampleItems.length == 0) {
        initSampleItems();
    }
}

function resolveDataSource(link, callback) {

    if (!link.params || !link.params.ds) {
        return callback("This operation is missing the data source.");
    }

    // TODO here comes the API that gets the data source for application/user
    var ds = dataSources[link.params.ds];

    if (!ds) {
        return callback("Invalid data source for this application: " + link.params.ds);
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