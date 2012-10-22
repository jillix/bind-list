define(["github/adioo/bind/v0.2.0/bind", "/jquery.js"], function(Bind) {

    function List(module) {

        var self;
        var config;
        var container;
        var template;

        function processConfig(config) {
            config.options = config.options || {};
            config.template.binds = config.template.binds || [];

            var optClasses = config.options.classes || {}
            optClasses.selected = optClasses.selected || "selected";
            config.options.classes = optClasses;

            return config;
        }

        function init(conf) {

            // initialize the globals
            self = this;
            config = processConfig(conf);
            if (config.container) {
                container = $(config.container, module.dom);
            } else {
                container = module.dom;
            }
            template = $(config.template.value, module.dom);

            // **************************************
            // generate general binds from the config
            var binds = [];

            for (var i in config.controls) {
                switch (i) {
                    case "add":
                        binds.push({
                            target: ".create",
                            context: ".controls",
                            on: [{
                                name: "click",
                                emit: "requestNewItem"
                            }]
                        });
                        break;
                    case "delete":
                        binds.push({
                            target: ".delete",
                            context: ".controls",
                            on: [{
                                name: "click",
                                handler: "removeSelected"
                            }]
                        });
                        break;
                }
            }

            // run the internal binds
            for (var i in binds) {
                Bind.call(self, binds[i]);
            }

            // run the binds
            for (var i in config.binds) {
                Bind.call(self, config.binds[i]);
            }

            self.on("newItem", createItem);
        }

        function render(item) {
            switch (config.template.type) {
                case "selector":
                    renderSelector.call(self, item);
                case "html":
                    // TODO
                case "url":
                    // TODO
            }
        }

        function renderSelector(item) {
            var newItem = $(template).clone();
            newItem
                .removeClass("template")
                .appendTo(container)
                .show();

            for (var i in config.template.binds) {
                var bindObj = config.template.binds[i];
                bindObj.context = newItem;
                Bind.call(self, bindObj, item);
            }
        }

        // ********************************
        // Public functions ***************
        // ********************************

        function read() {
            module.link(config.crud.read, function(err, data) {

                if (err) { return; }

                for (var i in data) {
                    render.call(self, data[i]);
                }
            });
        }

        function createItem(itemData) {
            self.link(config.crud.create, { data: itemData }, function(err, data) {
                if (err) { return; }
            });
        }

        function removeItem(itemData) {
            self.link(config.crud.delete, { data: { id: itemData.id } }, function(err, data) {
                if (err) { return; }
                $("#" + itemData.id).remove();
            });
        }

        function removeSelected() {
            var ids = [];
            var selectedClass = config.options.classes.selected;
            $("." + selectedClass, container).each(function() {
                ids.push($(this).attr("id"));
            });

            self.link(config.crud.delete, { data: { ids: ids } }, function(err, data) {
                if (err) { return; }
                $("." + selectedClass, container).remove();
            });
        }

        function selectItem(dataItem) {
            var selectedClass = config.options.classes.selected;
            switch (config.options.selection) {
                case "single":
                    $("." + selectedClass, container).removeClass(selectedClass);
                    $("#" + dataItem.id, module.dom).addClass(selectedClass);
                    break;
                case "multiple":
                    $("#" + dataItem.id, module.dom).toggleClass(selectedClass);
                default: // none
            }
        }

         return {
            init: init,
            read: read,
            removeItem: removeItem,
            removeSelected: removeSelected,
            selectItem: selectItem
        };
    }

    return function(module, config) {

        var list = new List(module);
        for (var i in list) {
            list[i] = module[i] || list[i];
        }
        list = Object.extend(list, module);

        list.init(config);

        return list;
    }
});

