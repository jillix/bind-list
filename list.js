define(["github/adioo/bind/v0.2.4/bind", "github/adioo/events/v0.1.2/events", "/jquery.js"], function(Bind, Events) {

    var self;
    var config;
    var container;
    var template;

    function List(module) {

        function processConfig(config) {
            config.template.binds = config.template.binds || [];

            config.options = config.options || {};
            config.options.sort = config.options.sort || {};
            config.options.id = config.options.id || "id";
    
            config.options.pagination = config.options.pagination || {};
            config.options.pagination.controls = config.options.pagination.controls || {};
            
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
                                emit: "requestNewItem",
                                handler: "createItem"
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

            if (config.options.pagination) {
                disabledClass = config.options.pagination.controls.disable
                
                for (var i in config.options.pagination.controls) {
                    switch (i) {
                        case "next":
                            binds.push({
                                target: config.options.pagination.controls.next,
                                on: [{
                                    name: "click",
                                    handler: "goToNextPage"
                                }]
                            });
                            break;
                        
                        case "previous":
                            binds.push({
                                target: config.options.pagination.controls.previous,
                                on: [{
                                    name: "click",
                                    handler: "goToPrevPage"
                                }]
                            });
                            break;
                    }
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
                if (!config.options.pagination) {
                    self.read({}, { sort: config.options.sort });    
                }
                else {
                    showPage(1);
                }
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

            newItem.attr('id', item[config.options.id]);
        }

        function clearList() {
            $("." + config.options.classes.item, container).remove();
        }

        // ********************************
        // Pagination functions ***********
        // ********************************
        var page = 1;
        var disabledClass;
        
        function setDisabled() {
            getPages(config.options.pagination.size, function(err, pagesNr) {
                if (err) { return; }
                
                var controls = config.options.pagination.controls;

                if (page <= 1) {
                    $(controls.previous).attr(disabledClass, "");
                }
                else {
                    $(controls.previous).removeAttr(disabledClass);
                }

                if (page >= pagesNr) {
                    $(controls.next).attr(disabledClass, "");
                }
                else {
                    $(controls.next).removeAttr(disabledClass);
                }    
            });
        }
        
        function getPages(size, callback) {
            self.link("getPages", { data: { size: size } }, function(err, pagesNr) {
                if (err) { 
                    callback(err);
                    return;
                }
                
                callback(null, pagesNr);
            });
        }
        
        // ********************************
        // Public functions ***************
        // ********************************

          /////////////////////
         // LIST FUNCTIONS
        /////////////////////
        function read(filter, options) {

            clearList();

            var data = {
                options: options || {}
            }

            // add the configured sorting
            if (!data.options.sort) {
                data.options.sort = config.options.sort;
            }

            // merge the configured filters
            if (config.options.filters && typeof config.options.filters === 'object') {
                data.filter = config.options.filters;
            } else {
                data.filter = {};
            }

            for (var i in filter) {
                data.filter[i] = filter[i];
            }
            
            self.link(config.crud.read, { data: data }, function(err, data) {

                if (err) { return; }

                if (!data || !(data.length > 0)) {
                    return;
                }

                for (var i in data) {
                    render.call(self, data[i]);
                }

                var autoselect = config.options.autoselect;
                switch (autoselect) {
                    case "first":
                        selectItem(data[0]);
                        break;
                    case "last":
                        selectItem(data[data.length - 1]);
                        break;
                    default:
                        if (typeof autoselect === "number") {
                            selectItem(data[autoselect]);
                        }
                }
            });
        }

        function createItem(itemData) {
            self.link(config.crud.create, { data: itemData }, function(err, data) {
                if (err) { return; }
                if (!config.options.pagination) {
                    render.call(self, data);    
                }
                else {
                    showPage(page);
                }
            });
        }

        function _sendRemove(itemData) {
            var data = {};
            data[config.options.id] = [itemData[config.options.id]];
            self.link(config.crud['delete'], { data: data }, function(err, data) {
                if (err) { return; }
                $("#" + itemData[config.options.id]).remove();
            });
        }

        function removeItem(itemData) {
            if (!config.options.deleteConfirmation) {
                _sendRemove(itemData);
                return;
            }

            self.emit("requestRemoveItem", itemData, function(err, confirmation) {
                if (confirmation) {
                    _sendRemove(itemData);
                }
            });
        }

        function removeSelected() {
            var ids = [];
            var selectedClass = config.options.classes.selected;
            $("." + selectedClass, container).each(function() {
                ids.push($(this).attr("id"));
            });

            var filter = {};
            filter.data = {};
            filter.data[config.options.id] = ids; 

            self.link(config.crud['delete'], filter, function(err, data) {
                if (err) { return; }
                $("." + selectedClass, container).remove();
            });
        }

        function selectItem(dataItem) {

            if (!dataItem) {
                return;
            }

            var selectedClass = config.options.classes.selected;

            switch (config.options.selection) {

                case "single":
                    var currentItem = $("#" + dataItem[config.options.id], container);
                    if (currentItem.hasClass(selectedClass)) {
                        break;
                    }

                    $("." + selectedClass, container).removeClass(selectedClass);
                    $("#" + dataItem[config.options.id], container).addClass(selectedClass);
                    self.emit("selectionChanged", dataItem);
                    break;

                case "multiple":
                    $("#" + dataItem[config.options.id], module.dom).toggleClass(selectedClass);
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

          //////////////////////////////
         // PAGINATION PUBLIC FUNCTIONS
        //////////////////////////////
        function goToNextPage() {
            showPage(++page);
        }
        
        function goToPrevPage() {
            showPage(--page);
        }
        
        function showPage(number) {            
            var size = config.options.pagination.size;
            var skip = (number - 1) * size;
            read(null, { skip: skip, limit: size });
            
            setDisabled();
        }

        return {
            init: init,
            read: read,
            createItem: createItem,
            removeItem: removeItem,
            removeSelected: removeSelected,
            selectItem: selectItem,
            goToNextPage: goToNextPage,
            goToPrevPage: goToPrevPage,
            showPage: showPage,
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