define(["github/adioo/bind/v0.2.0/bind", "github/adioo/events/v0.1.0/events", "/jquery.js"], function(Bind, Events) {

    function List(module) {

        var self;
        var config;
        var container;
        var template;

        function processConfig(config) {
            config.template.binds = config.template.binds || [];

            config.options = config.options || {};

            config.options.sort = config.options.sort || {};

            var optClasses = config.options.classes || {}
            optClasses.item = optClasses.item || "item";
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
                            target: config.controls[i],
                            context: ".controls",
                            on: [{
                                name: "click",
                                emit: "requestNewItem"
                            }]
                        });
                        break;
                    case "delete":
                        binds.push({
                            target: config.controls[i],
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

            Events.call(self, config);

            if (config.options.autofetch) {
                self.read({}, { sort: config.options.sort });
            }
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
                .addClass(config.options.classes.item)
                .appendTo(container)
                .show();

            for (var i in config.template.binds) {
                var bindObj = config.template.binds[i];
                bindObj.context = newItem;
                Bind.call(self, bindObj, item);
            }
        }

        function clearList() {
            $("." + config.options.classes.item, container).remove();
        }

        // ********************************
        // Public functions ***************
        // ********************************

        function read(filter, options) {

            clearList();

            var data = {
                filter: filter,
                options: options
            }

            self.link(config.crud.read, { data: data }, function(err, data) {

                if (err) { return; }

                for (var i in data) {
                    render.call(self, data[i]);
                }
            });
        }

        function createItem(itemData) {
            self.link(config.crud.create, { data: itemData }, function(err, data) {
                if (err) { return; }
                render.call(self, data);
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
                    var currentItem = $("#" + dataItem.id, container);
                    if (currentItem.hasClass(selectedClass)) {
                        break;
                    }

                    $("." + selectedClass, container).removeClass(selectedClass);
                    $("#" + dataItem.id, container).addClass(selectedClass);
                    self.emit("selectionChanged", dataItem);
                    break;

                case "multiple":
                    $("#" + dataItem.id, module.dom).toggleClass(selectedClass);
                    break;

                default: // none
            }
        }

        function show() {
            $(self.dom).parent().show();
        }

        function hide() {
            $(self.dom).parent().hide();
        }

         return {
            init: init,
            read: read,
            createItem: createItem,
            removeItem: removeItem,
            removeSelected: removeSelected,
            selectItem: selectItem,
            show: show,
            hide: hide
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

