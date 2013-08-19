var self;
var waiter;

module.exports = {
    init: function (module, waiterConf) {
        self = module;
        waiter =  $(waiterConf, self.dom);
    },
    start: function () {
        if (!waiter) { return; }
        waiter.fadeIn();
    },
    stop: function () {
        if (!waiter) { return; }
        waiter.fadeOut();
    }
};
