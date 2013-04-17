define(["github/adioo/bind-list/dev/list"], function(List) {

    function init(config) {

        config.crud = {
            create: "create",
            read:   "read",
            update: "update",
            // "delete" is considered a keywork by some browsers
            "delete": "remove"
        }

        if (config.sample) {
            // this reads the sample configuration if this is a sample list
            buildSampleConfig(config);
        }

        List(this, config);
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
            "delete": "remove"
        };

        // (optional) options
        config.options = {
            selection: "multiple", // "single", "multiple"
            autofetch: true,
            classes: {
                selected: "selected"
            },
            // When we use a real database, we can use _id.
            // Also, if we use a database we can have the id key. *
            // e.g.: { "id": 1, "text": "This is a sample item" }
            // * default: "id"
            id: "id",
            // (optional) pagination
            pagination: {
                size: 2,
                container: ".pagination",
                // (optional) numbers
                numbers: {
                    template: ".pagination-template",
                    classes: {
                        active: "active",
                        item: "pagination-item",
                        before: ".prepend-before"
                    },
                    keywords: {
                        pageNumber: "@pageNr@",
                        active: "@active@"
                    },
                    options: {
                        max: 4, // Can be 0, 1, 2, 3, or greather
                        alwaysFirst: true,
                        alwaysLast: true
                    }
                },
                controls: {
                    next: ".next",
                    previous: ".prev",
                    disable: "disabled",
                },
                classes: {
                    disable: "disabled"
                }
            }
        };

        // (optional) selectors as handles for core list operations
        config.controls = {
            add: ".create",
            "delete": ".delete"
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

