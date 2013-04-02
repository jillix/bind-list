
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
        link.send(400, { status: "Missing data" });
        return;
    }

    // if this is a sample list
    if (link.params && link.params.ds === "testDS") {
        var itemData = createSampleItem(link.data);
        link.send(200, itemData);
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(400, err);
            return;
        }

        M.database.open(ds, function(err, db) {

            if (err) {
                link.send(400, err);
                return;
            }

            db.collection(ds.collection, function(err, collection) {

                if (err) {
                    link.send(400, err);
                    return;
                }

                collection.insert(link.data, function(err, docs) {

                    if (err) { return console.error(err); }
                    if (!docs[0] || !docs.length) { return link.send(500, "No data inserted."); }

                    link.send(200, docs[0]);
                });
            });
        });
    });
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
        
        link.send(200, itemsToSend);
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(400, err);
            return;
        }

        M.database.open(ds, function(err, db) {

            if (err) {
                link.send(400, err);
                return;
            }

            db.collection(ds.collection, function(err, collection) {

                if (err) {
                    link.send(400, err);
                    return;
                }

                collection.find(filter, options).toArray(function(err, docs) {

                    if (err) { return console.error(err); }

                    link.send(200, docs || []);
                });
            });
        });
    });
};

exports.update = function(link) {
    link.send(200, { status: "OK" });
};

exports.getPages = function(link) {
    var pagesNr = 0;
    
    var data = link.data || {};
    var size = data.size;
    
    var filter = data.filter || {};
    var options = data.options || {};
        
    if (link.params && link.params.ds === "testDS") {
        pagesNr = Math.ceil(sampleItems.length / size);
        
        link.send(200, "" + (pagesNr || 0));
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(400, err);
            return;
        }

        M.database.open(ds, function(err, db) {

            if (err) {
                link.send(400, err);
                return;
            }

            db.collection(ds.collection, function(err, collection) {

                if (err) {
                    link.send(400, err);
                    return;
                }

                collection.count(filter, function(err, length) {

                    if (err) { return console.error(err); }
                    
                    pagesNr = Math.ceil(length / size);

                    link.send(200, pagesNr);
                });
            });
        });
    });
};

exports.remove = function(link) {

    if (!link.data) {
        link.send(400, { status: "Missing data" });
    }

    // test data
    if (link.params && link.params.ds === "testDS") {
        removeSampleItems(link.data);
        link.send(200, { status: "OK" });
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(400, err);
            return;
        }

        M.database.open(ds, function(err, db) {

            if (err) {
                link.send(400, err);
                return;
            }

            db.collection(ds.collection, function(err, collection) {

                if (err) {
                    link.send(400, err);
                    return;
                }

                var key = Object.keys(link.data)[0];
                var values = link.data[key] || [];

                // if the special mongo ID is the key, convert it to ObjectID
                if (key === '_id') {
                    for (var i in values) {
                        values[i] = M.mongo.ObjectID(values[i]);
                    }
                }

                var filter = {};
                filter[key] = { $in: values };

                collection.remove(filter, function(err, docs) {

                    if (err) { return console.error(err); }

                    link.send(200);
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

