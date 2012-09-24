define(["Config", "Common"], function (Config, Common) {

    // http://stackoverflow.com/questions/1909441/jquery-keyup-delay
    var delay = (function(){
         var timer = 0;
         return function(callback, ms){
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
            };
         })();

    return {

        init: function(opts) {

            // add keyhandler to entry form
            opts.nodeList.keyup(function (e) {

                var that = this;

                Common.mediator.emitEvent('ui:autocomplete:keydown', [this.value]);

                if (this.value.length <= 2)
                    return false;

                delay(function () {
                    Common.mediator.emitEvent('modules:oncomplete', [that]);
                }, 700)

            });

            opts.nodeList.change(function () {
                Common.mediator.emitEvent('modules:tagentry:onchange', [this.value]);
            })

            // populate input when autocomplete is selected
            Common.mediator.addListener('modules:autocomplete:selected', function (tag, element) {
                element.val(tag).change();
                Common.mediator.emitEvent('ui:networkfronttool:tagid:selected', [{}, element]);
            });

            // style tag input element on success/error
            Common.mediator.addListener('modules:tagvalidation:success', function(element, tagData) {
                $(element).removeClass('invalid');
                // populate title input field
                // TODO - better to split this into a seperate module?
                if (tagData && tagData.webTitle) {
                    $(element).siblings('[name=tag-title]').val(tagData.webTitle);
                }
            });

            Common.mediator.addListener('modules:tagvalidation:failure', function(element) {
                $(element).addClass('invalid');
            });

        }
    }
});
