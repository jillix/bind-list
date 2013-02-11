define(["github/adioo/bind-list/v0.1.8/list"], function(List) {

    var self;

    function init(config) {

        config.crud = {
            create: "create",
            read:   "read",
            update: "update",
            'delete': "remove"
        }

        if (config.sample) {
            // this reads the sample configuration if this is a sample list
            buildSampleConfig(config);
        }

        self = List(this, config);
    }

    function buildSampleConfig(config) {

        // (mandatory) what to render fot each data item
        config.template = {
            type: "selector", // "url", "html"
            value: ".template",
            binds: [
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
        };

        // (mandatory) where to display rendered items
        config.container = ".content";

        // (mandatory) the CRUD operations are module operations
        config.crud = {
            create: "create",
            read:   "read",
            update: "update",
            'delete': "remove"
        };

        // (optional) options
        config.options = {
            selection: "multiple", // "single", "multiple"
            autofetch: true,
            classes: {
                selected: "selected"
            }
        };

        // (optional) selectors as handles for core list operations
        config.controls = {
            add: ".create",
            'delete': ".delete"
        };

        // (optional) additional functionality through bind objects
        config.binds = [
            {
                target: "create",
                on: [{
                    name: "click",
                    emit: "newItem"
                }]
            }
        ];
    }

    return init;
});

