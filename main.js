define(["github/adioo/bind-list/v0.1.1/list"], function(List) {

    function init(config) {

        var list = Object.extend(List, this);

        alert("list initialized");
    }
    
    return init;
});

