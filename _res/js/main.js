// +---------------------------------------------------------------------------
// |  File: main.js    UTF-8
// |  Author: anoymouserver
// |  Status:
// |  Revision: 2016/04/02
// +---------------------------------------------------------------------------

'use strict';

var app = {};

app.config = {
    file: "./config.json",
    data: undefined,
    get: function() {
        $.getJSON(app.config.file, function (data) {
            app.config.data = data;
            $(document).trigger("config_loaded");
        })
        .fail(function (j, s, e) {
            console.log('Request failed (config): ' + s + ', ' + e)
        });
    }
};

$(document).ready(function () {
    app.config.get();
})
.on("config_loaded", function () {
    document.title = app.config.data.page.title;
    $("#pagetitle").text(app.config.data.page.title);
    app.services.init();
    app.menu.init();
    app.community.init();
    app.sidebar.init();
});

app.services = {
    target: '#services',
    isInternal: false,

    init: function() {
        if (app.config.data.page.domains)
          if (window.location.host == app.config.data.page.domains.internal)
              app.services.isInternal = true;
          else if (window.location.host != app.config.data.page.domains.external)
              console.log("Site loaded from wrong domain! " + window.location.host + " vs. (" + app.config.data.page.domains.external + "|" + app.config.data.page.domains.internal + ")");

        $.getJSON(app.config.data.services.url, function (data) {
            var count = 0;
            $(app.services.target).empty();
            $.each(data, function (x,y) {
                $(app.services.createItem(y)).appendTo(app.services.target);
                if (++count%2 == 0)
                    $("<div/>", {class:'clearfix hidden-xs'}).appendTo(app.services.target);
            })
        })
        .fail(function (j, s, e) {
            console.log('Request failed (services): ' + s + ', ' + e)
        });
    },


    createItem: function(data) {
        var url;
        if (typeof data.url === 'object') {     // if external and/or internal links then
            if (app.services.isInternal) {      // if site is loaded internaly
                if (data.url.internal) {        // and interal site is exists
                    url = data.url.internal;    // use internal URL
                    data.public = false;
                } else {
                    url = data.url.external;    // else use external URL
                    data.public = true;
                }
            } else {                            // if site is loaded externaly
                if (data.url.external) {        // if external site exist then use it
                    url = data.url.external;
                    data.public = true;
                }
            }
        }
        else                                    // else if url has only old-style strukt
            url = data.url;

        var out = "\
        <div class='col-sm-6 col-xs-12 entry" + (typeof url !== 'undefined' ? "" : " text-muted") + "'>\
            <div class='media'>\
                <div class='media-left'>\
                    <i class='fa fa-fw fa-2x fa-"+data.symbol+"'></i>\
                </div>\
                <div class='media-body'>\
                    " + (typeof url !== 'undefined' ? "<a href='"+url+"' target='_blank' class='text-primary'>" : "<span>") + "\
                        <h3 class='media-heading'>" + data.name + (data.public ? " <small class='fa fa-external-link'></small>" : "") + "</h3>\
                    " + (typeof url !== 'undefined' ? "</a>" : "</span>") + "\
                    <span>"+data.comment+"</span>\
                </div>\
            </div>\
        </div>";
        
        return out;
    }
};

app.menu = {    
    target: "#menu > .navbar-left",

    init: function() {
        $.each(app.config.data.menu, function (x,y) {
            $(app.menu.createItem(y)).appendTo(app.menu.target);
        })
    },

    createItem: function(data) {
        var out = "\
        <li>\
            <a href='"+data.url+"' target='_blank'>"+data.name+"</a>\
        </li>";
        
        return out;
    }
};

app.sidebar = {    
    target: "#sidebar",

    init: function() {
        var self = this;
        $.each(app.config.data.sidebar, function (x,y) {
            $(app.sidebar.createItem(y)).appendTo(app.sidebar.target);
            switch (y.type) {
                case "stats":
                    self.stats.init(y);
                    break;
                case "status":
                    self.status.init(y);
                    break;
                case "feed":
                    self.feed.init(y);
                    break;
            }
        })
    },

    createItem: function(data) {
        var out = "\
        <div class='panel panel-default' id='"+data.type+"'>\
            <div class='panel-heading'><i class='fa fa-fw fa-"+data.symbol+"'></i> "+data.name+"</div>\
            <div class='panel-body "+(data.scrollBox?"scroll-box":"")+"'>\
            </div>\
        </div>";
        return out;
    }
};

app.sidebar.stats = {
    data: {
        nodesTotal: 0,
        nodesOnline: 0,
        users: 0
    },

    init: function(item) {
        var target = "#"+item.type+" .panel-body";
        
        $.post("./_res/cgi/proxy.php", {url: ""+item.data.url+""})
        .done(function(data) {
            var nodes = $.map(data.nodes, function(e) {return e;});
            var stats_tmp = {};

            stats_tmp.nodesOnline = nodes.filter(function (d) {
                    return d.flags.online && !d.flags.gateway;
                }).length;
            stats_tmp.nodesTotal = nodes.filter(function (d) {
                    return !d.flags.gateway;
                }).length;
            stats_tmp.users = nodes.reduce(function (previousValue, currentValue) {
                    if (typeof(previousValue) !== "number") {
                        previousValue = 0;
                    }
                    return previousValue + currentValue.statistics.clients;
                });

            if (app.sidebar.stats.data !== stats_tmp) {
                $(target).empty();
                var html = app.sidebar.stats.createItem(stats_tmp);
                $(html).appendTo(target);
                app.sidebar.stats.data = stats_tmp;
            }
                
        })
        .fail(function (j, s, e) {
            console.log('Request failed ('+item.type+'): ' + s + ', ' + e)
        });
        
        setTimeout(function(){app.sidebar.stats.init(item)}, item.data.updateInterval * 1000);
    },

    createItem: function(data) {
        var out = "\
        <table class=\"table-condensed\" style=\"width:100%\">\
            <tr><td>Nodes (gesamt):</td><td class=\"text-right\">"+data.nodesTotal+"</td></tr>\
            <tr><td>Nodes (online):</td><td class=\"text-right\">"+data.nodesOnline+"</td></tr>\
            <tr><td>Benutzer:</td><td class=\"text-right\">"+data.users+"</td></tr>\
        </table>";

        return out;
    }

};

app.sidebar.status = {
    init: function(item) {
        var target = "#"+item.type+" .panel-body";
        
        $.post("./_res/cgi/proxy.php", {url: ""+item.data.url+""})
        .done(function(data) {
            $(target).empty();
            var html = "<small class='center-block'>" + data + "</small>";
            $(html).appendTo(target);
        })
        .fail(function (j, s, e) {
            console.log('Request failed ('+item.type+'): ' + s + ', ' + e)
        });
    }
}

app.sidebar.feed = {
    init: function(item) {
        var target = "#"+item.type+" .panel-body";
        
        $.post("./_res/cgi/proxy.php", {url: ""+item.data.url+""})
        .done(function(data) {
            $(target).empty();
            var html = "<ul>",
                feed = $(data),
                count = 0;
            
            feed.find("item").each(function() {
                var feedItem = $(this);
                var itemData = {
                        title: feedItem.find("title").text(),
                        link: feedItem.find("link").text(),
                        description: feedItem.find("description").text(),
                        pubDate: feedItem.find("pubDate").text(),
                        author: feedItem.find("author").text()
                };
                html += app.sidebar.feed.createItem(itemData);
                if (++count == item.data.maxCount)
                    return false;
            });
            
            html += "</ul>";
            $(html).appendTo(target);
        })
        .fail(function (j, s, e) {
            console.log('Request failed ('+item.type+'): ' + s + ', ' + e)
        });
    },

    createItem: function(data) {
        var date = new Date (data.pubDate);
        var out = "\
        <li>\
            <div><a href='"+data.link+"' target='_blank'>"+data.title+"</a></div>\
            <div><small>"+date.toLocaleDateString('de-DE', {year: 'numeric', month: '2-digit', day: '2-digit'})+"</small></div>\
            <div>"+data.description+"</div>\
        </li>";

        return out;
    }
};

app.community = {    
    target: "#community",

    init: function() {
        $.each(app.config.data.community, function (x,y) {
            $(app.community.createItem(y)).appendTo(app.community.target);
        })
    },

    createItem: function(data) {
        var out = "\
        <li class='text-muted'>\
            <a href='"+data.url+"' target='_blank'><i class='fa fa-fw fa-"+data.symbol+"'></i> "+data.name+"</a>\
        </li>";
        
        return out;
    }
};
