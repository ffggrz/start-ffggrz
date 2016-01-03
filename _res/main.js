// +---------------------------------------------------------------------------
// |  File: main.js    UTF-8
// |  Author: anoymouserver
// |  Status:
// |  Revision: 2016/01/03
// +---------------------------------------------------------------------------

'use strict';

var app = {};

app.configFile = "./config.json";

app.targets = {
	services: '#services',
	feed: '#feed',
	info: '#info',
	footer: '#footerLinks'
};

app.configData = undefined;

app.getConfig = function () {
    $.getJSON(app.configFile, function (data) {
		app.configData = data;
		$(document).trigger("gotData");
	})
	.fail(function (j, s, e) {
		console.log('Request failed: ' + s + ', ' + e)
	});
};

$(document).ready(function () {
    app.getConfig();
})
.on("gotData", function () {
    app.showServices();
	app.getStats();
	app.showFooterLinks();
	app.showFeed();
})
.on("statsupdated", function () {
	app.showStats();
});

app.showServices = function () {
	var count = 0;
	$.each(app.configData.services, function (x,y) {
		$(app.getServiceBlock(y)).appendTo(app.targets.services);
		if (++count%2 == 0)
			$("<div/>", {class:'clearfix hidden-xs'}).appendTo(app.targets.services);
	})
};

app.showStats = function () {
	$('#nodes-total').text(app.stats.nodesTotal);
    $('#nodes-online').text(app.stats.nodesOnline);
    $('#users-online').text(app.stats.users);
}

app.showFeed = function () {
	$(app.targets.feed).FeedEk({
		FeedUrl: app.configData.sidebar.feed.url,
		MaxCount: app.configData.sidebar.feed.maxCount,
		TitleLinkTarget: '_blank',
		DateLocale: 'de-DE',
		ErrorString: "Feed konnte nicht abgerufen werden."
	});
}

app.showFooterLinks = function () {
	$.each(app.configData.footer, function (x,y) {
		$(app.getFooterLink(y)).appendTo(app.targets.footer);
	})
}

app.getServiceBlock = function (data) {
	var out = "\
	<div class='col-sm-6 col-xs-12 entry'>\
		<div class='media'>\
			<div class='media-left'>\
				<i class='fa fa-fw fa-2x fa-"+data.symbol+"'></i>\
			</div>\
			<div class='media-body'>\
				<a href='"+data.url+"' target='_blank' class='text-primary'>\
					<h3 class='media-heading'>"+data.name+((data.public)?" <small class='fa fa-external-link'></small>":"")+"</h3>\
				</a>\
				<span>"+data.comment+"</span>\
			</div>\
		</div>\
	</div>";
	
	return out;
};

app.stats = {
    nodesTotal: 0,
    nodesOnline: 0,
    users: 0,
};

app.getStats = function () {
	$.getJSON(app.configData.sidebar.stats.url, function (data) {
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

        if (app.stats !== stats_tmp) {
            app.stats = stats_tmp;
            $(document).trigger("statsupdated");
        }
			
	})
	.fail(function (j, s, e) {
		console.log('Request failed: ' + s + ', ' + e)
	});
	
	setTimeout(function(){app.getStats()}, app.configData.sidebar.stats.updateInterval * 1000);
}

app.getFooterLink = function (data) {
	var out = "\
	<p class='footer-text text-muted'>\
		<i class='fa fa-"+data.symbol+"'></i> <a href='"+data.url+"' target='_blank'>"+data.name+"</a>\
	</p>";
	
	return out;
}
