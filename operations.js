var send = require(CONFIG.root + "/core/send.js").send;

exports.getData = function(link) {
    
    CONFIG.orient.DB.command(link.params.query, function(err, result) {
        
        if (err) {
            
            send.internalservererror(link.res, err);
            return;
        }
        
        var data = [];
        
        for (var i = 0, l = result.length; i < l; ++i) {
            
            data.push({
                
                val: result[i][link.params.nameField],
                events: {
            
                    mouseup: {
                        
                        method: "event",
                        args: [link.params.obsName, link.params.eventName, result[i]]
                    }
                }
            });
        }
        
        send.ok(link.res, data);
    });
};