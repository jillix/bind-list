define(["adioo/bind/repeater"], function(Repeater) {
    
    var List = {
        
        event: function(miid, eventName, data) {
            
            N.obs(miid).f(eventName, data);
        }
    };
    
    /*
        config = {
            
            target: "#selector",
            source: {},
            bind: [{}]
        }
        
        
    i18n: false, //true is default,
    addItem: "#addItemButton",
    removeItem: "#removeItemButton",
    paging: 33,
    search: [
        {
            elm: "#searchField",
            ??
        }
    ]
        
    // TODO:
    - locale change
    - add item
    - remove item
    - paging
    - search data
    */
    
    function init(config) {
        
        var list = N.clone(List, Repeater(this), config);
        
        list.target = list.dom.querySelector(list.target);
        
        if (list.source) {
            
            list.fetch();
        }
        
        if (list.bind) {
            
            list.render(list.bind);
        }
        
        return list;
    }
    
    return init;
});