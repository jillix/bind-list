var self;
var waiter;

module.exports = {
    init: function (module, waiterConf) {
        self = module;
        waiter =  $(waiterConf, self.dom);
    },
    start: function () {
        if (!waiter) { return; }
        waiter.stop(true, false).slideDown();
    },
    stop: function () {
        if (!waiter) { return; }
        waiter.stop(true, false).slideUp();
    }
};
