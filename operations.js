var Mongo = require("./providers/mongo");
var Orient = require("./providers/orient");

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

        switch (ds.type) {
            case "mongo":
                Mongo.create(link, ds, function(err, data) {
                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, data);
                });
                break;
            
            case "orient":
                Orient.create(ds, function(err, data) {
                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, data);
                });
                break;

            break;
        }

    });
};

exports.read = function(link) {

    if (link.params && link.params.ds === "testDS") {
        
        var itemsToSend = sampleItems;
        
        var data = link.data || {};
        var filter = data.filter || {};
        var options = data.options || {};

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
        
        switch (ds.type) {
            case "mongo":
                Mongo.read(link, ds, function(err, data) {
                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, data);
                });
                break;
            
            case "orient":
                Orient.read(link, ds, function(err, data) {
                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, data);
                });
                break;
        }
    });
};

exports.update = function(link) {

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(400, err);
            return;
        }
        
        switch (ds.type) {
            case "mongo":
                Mongo.update(ds, function(err, data) {
                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, data);
                });
                break;
            
            case "orient":
                Orient.update(ds, function(err, data) {
                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, data);
                });
                break;
        }
    });
};

exports.getPages = function(link) {
    
    if (link.params && link.params.ds === "testDS") {

        var data = link.data || {};
        var size = data.size;

        pagesNr = Math.ceil(sampleItems.length / size);
        
        link.send(200, "" + (pagesNr || 0));
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(400, err);
            return;
        }

        switch (ds.type) {
            case "mongo":
                Mongo.getPages(link, ds, function(err, data) {
                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, data);
                });
                break;
            
            case "orient":
                Orient.getPages(ds, function(err, data) {
                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, data);
                });
                break;
        }
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

        switch (ds.type) {
            case "mongo":
                Mongo.remove(link, ds, function(err, data) {
                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, data);
                });
                break;
            
            case "orient":
                Orient.remove(ds, function(err, data) {
                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, data);
                });
                break;
        }
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

