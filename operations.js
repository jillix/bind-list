var send = require(CONFIG.root + "/core/send.js").send;

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

    var results = items;

    send.ok(link.res, results);
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
