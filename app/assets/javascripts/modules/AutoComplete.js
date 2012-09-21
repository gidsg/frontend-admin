define(["Common"], function (Common) {

    var autocomplete = $('#autocomplete')
        , hide = function () {
            autocomplete.hide();
            autocomplete.empty();
            }
        , container = '<ul class="dropdown-menu">%s</ul>'
        , item = '<li><a href="#" data-id="%s">%s</a></li>'
        , render = function(search, inputElement) {

             var results = search.results.splice(0,10).map(function (result) {
                 return item.replace(/\%s/gi, result.id);
             })

             if (results.length > 0) {
                // move to under correct form element
                $('#autocomplete').insertAfter(inputElement).show();
             } else {
                $('#autocomplete').hide();
             }

             var html = container.replace("%s", results.join(''), "gm");
             document.getElementById("autocomplete").innerHTML = html;
        };

    hide();

    Common.mediator.addListener('ui:autocomplete:keydown', hide);
    Common.mediator.addListener('modules:autocomplete:selected', hide);
    Common.mediator.addListener('modules:tagsearch:success', render)

    // autocomplete item selected
    autocomplete.click(function (e) {
        var id = e.target.getAttribute('data-id');
        Common.mediator.emitEvent('modules:autocomplete:selected', [id, autocomplete.prev()]);
        e.preventDefault();
    })

    return {}

});

