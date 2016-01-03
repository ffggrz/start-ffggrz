/*
* FeedEk jQuery RSS/ATOM Feed Plugin v2.0
* http://jquery-plugins.net/FeedEk/FeedEk.html  https://github.com/enginkizil/FeedEk
* Author: Engin KIZIL http://www.enginkizil.com
* Modified by: anoymouserver
*/

(function ($) {
    $.fn.FeedEk = function (opt)
	{
        var def = $.extend({
            FeedUrl: "",
            MaxCount: 5,
            ShowDesc: true,
            ShowPubDate: true,
            CharacterLimit: 0,
            TitleLinkTarget: "_blank",
            DateLocale: "en-GB",
			ErrorString: "Feed could not be retrieved!"
        }, opt);

        var id = $(this).attr("id"), i, s = "",dt;
        //$("#" + id).empty().append('<img src="loader.gif" />');

        $.ajax({
            url: "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=" + def.MaxCount + "&output=json&q=" + encodeURIComponent(def.FeedUrl) + "&hl=en&callback=?",
            dataType: "json",
            success: function (data) {
                $("#" + id).empty();
                $.each(data.responseData.feed.entries, function (e, item)
				{
                    s += '<li><div class="itemTitle"><a href="' + item.link + '" target="' + def.TitleLinkTarget + '" >' + item.title + "</a></div>";
                    
                    if (def.ShowPubDate) {
                        dt = new Date(item.publishedDate);
                        s += '<div class="itemDate">' + dt.toLocaleDateString(def.DateLocale, {year: 'numeric', month: '2-digit', day: '2-digit'}) + "</div>";                       
                    }
                    if (def.ShowDesc) {
                        if (def.DescCharacterLimit > 0 && item.content.length > def.DescCharacterLimit) {
                            s += '<div class="itemContent">' + item.content.substr(0, def.DescCharacterLimit) + "...</div>";
                        }
                        else {
                            s += '<div class="itemContent">' + item.content + "</div>";
                        }
                    }
                });
                $("#" + id).append('<ul class="feedEkList">' + s + "</ul>");
            },
			error: function() {
                $("#" + id).append('<p>' + def.ErrorString + "</p>");
			}
        });
    };
})(jQuery);
