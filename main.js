define(["github/adioo/bind-list/v0.1.1/list"], function(List) {

    var self;

    function init(config) {

if (!config) {
        // user configuration
        config = {
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

        config.template.binds = [
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
}

        config.crud = {
            create: "create",
            read:   "read",
            update: "update",
            delete: "remove"
        }

        self = List(this, config);
        self.lang = "de";
    }
    
    return init;
});

