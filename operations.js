var send = require(CONFIG.root + "/core/send.js").send;
var data = [
    
    {
        val: "Domains",
        tabId: "domains",
        events: {
            
            "mouseup": {
            
                method: "show",
                args: ["domains", "domain_manager"]
            }
        }
    }
];

exports.getData = function(link) {
    
    send.ok(link.res, data);
};