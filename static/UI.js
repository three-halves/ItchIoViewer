export class UI {
    // htmelement as string with placeholders defined with curly braces
    constructor(template) {
        this.template = template;
        this.render = this.render.bind(this);
        this.format = this.format.bind(this);
    }

    // render template with parameters and return innerhtml string
    render(params) {
        return this.template.format(params);
    }

    format() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
        };
}

String.prototype.format = String.prototype.format ||
function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};
