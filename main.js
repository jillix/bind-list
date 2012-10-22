define(["github/adioo/bind-list/v0.1.0/list"], function(List) {

    function init(config) {

        // user configuration
        var listConfig = {
            // (mandatory) what to render fot each data item
            template: {
                type: "selector", // "url", "html"
                value: ".template",
                binds: []
            },
            // (options) where to display rendered items
            container: ".content",
            // (mandatory) the CRUD operations are module operations
            crud: {
                create: "create",
                read:   "read",
                update: "update",
                delete: "remove"
            },
            // (optional) options
            options: {
                selection: "multiple", // "single", "multiple"
                classes: {
                    selected: "selected"
                }
            },
            controls: {
                add: ".create",
                delete: ".delete"
            },
            binds: [
                {
                    target: "create",
                    on: [{
                        name: "click",
                        emit: "newItem"
                    }]
                }
            ]
        };

        listConfig.template.binds = [
            {
                target: ".delete",
                on: [{
                    name: "click",
                    handler: "removeItem"
                }]
            },
            {
                on: [{
                    name: "click",
                    handler: "selectItem"
                }]
            },
            {
                attr: [
                    {
                        name: "id",
                        value: {
                            source: "id",
                            filter: [
                                { name: "prefix", args: "itm", library: "/aasdsda" }
                            ]
                        }
                    }
                ],
            },
            {
                target: ".itemText",
                html: {
                    source: "text"
                }
            }
        ]

        var self = List(this, listConfig);
        self.read();
        self.emit("newItem", { text: "Dynamic text" });
    }
    
    return init;
});

