$(function() {
    $( ".pickable-tag" ).autocomplete({
        source: function( request, response ) {
            $.ajax({
                url: "http://content.guardianapis.com/tags?q=" + encodeURIComponent($("#tag").val())  + "&format=json&page-size=50&api-key=" + apiKey,
                dataType: "jsonp",
                success: function( data ) {
                    response($.map(data.response.results, function(tag){
                        return {
                            label: tag.webTitle + " (" + tag.id + ")",
                            value: tag.webTitle,
                            id: tag.id
                        }
                    }));
                }
            });
        },
        minLength: 3,
        select: function( event, ui ) {
            $("#tag-id").val(ui.item.id);
        },
        open: function() {
            $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
        },
        close: function() {
            $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
        }
    });
});