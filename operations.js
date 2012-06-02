var send = require(CONFIG.root + "/core/send.js").send;
var data = [
    
    {
        val: "Domain 1",
        events: {
            
            mouseup: {
                
                method: "event",
                args: ["vertex_detail", "showDetails", {name: "domain1.com", application: "#11:0"}]
            }
        }
    },
    {
        val: "Domain 2",
        events: {
            
            mouseup: {
                
                method: "event",
                args: ["vertex_detail", "showDetails", {name: "domain2.com", application: "#11:1"}]
            }
        }
    },
    {
        val: "Domain 3",
        events: {
            
            mouseup: {
                
                method: "event",
                args: ["vertex_detail", "showDetails", {name: "domain3.com", application: "#11:2"}]
            }
        }
    },
    {
        val: "Domain 4",
        events: {
            
            mouseup: {
                
                method: "event",
                args: ["vertex_detail", "showDetails", {name: "domain4.com", application: "#11:3"}]
            }
        }
    },
    {
        val: "Domain 5",
        events: {
            
            mouseup: {
                
                method: "event",
                args: ["vertex_detail", "showDetails", {name: "domain5.com", application: "#11:4"}]
            }
        }
    },
];

exports.getData = function(link) {
    
    send.ok(link.res, data);
};