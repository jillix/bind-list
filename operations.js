var send = require(CONFIG.root + "/core/send.js").send;

exports.create = function(link) {
    send.ok(link.res, { status: "OK" });
};

exports.read = function(link) {
    send.ok(link.res, { status: "OK" });
};

exports.update = function(link) {
    send.ok(link.res, { status: "OK" });
};

exports.remove = function(link) {
    send.ok(link.res, { status: "OK" });
};
