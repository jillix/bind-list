define(["adioo/bind/repeater"], function(Repeater) {
    
    var List = {
        
        
    };
    
    /*
        config = {
            
            source: {
                
            },
            bind: [
                {
                    
                }
            ]
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
        
        return list;
    }
});