/**
 * Interactive treemap based on d3plus treemap.
 
 * @param {Object} options 
 * @config {string} container target container.
 * @config {string|array} label the json attribute name that determines the label of the box.
 * @config {string} size the json attribute name that determines the size of the box.
 * @config {string}[time] the json attribute name that determines the timeline of the view.
 */
var Map3 = function (options) {
    this.initialize(options);
    this.build();
}

/**
 * Constructor of class.
 * @param {Object} options 
 * @config {string} container target container.
 * @config {string|array} label the json attribute name that determines the label of the box.
 * @config {string} size the json attribute name that determines the size of the box.
 */
Map3.prototype.initialize = function (options) {
    for (var attr in options) {
        this[attr] = options[attr];
    }
    this.label = typeof this.label == "string" ? [this.label] : this.label;
    this.treemap = d3plus.viz();
}

/**
 * This method build the base of the treemap.
 */
Map3.prototype.build = function () {
    var thiz = this;

    this.config({
        container: this.container,
        type: "tree_map",
        id: this.label,
        labels: {
            "align": "center",
            "valign": "top"
        },

        size: {
            value: thiz.size,
            threshold: false
        },

        color: {
            scale: thiz.color()
        },
        zoom: true,
        tooltip: {
            "html": function (e) {
                return "";
            }
        },
        mouse: {
            "move": true,
            "click": function (d, viz) {
                thiz.zoom(d);
            }
        },
        format: {
            text: function (text, params) {
                if (typeof params !== "undefined" && typeof params.data !== "undefined" && params.key == thiz.label) {
                    //se invoca al método que formatea los labels
                    return thiz.textFormat(params.data);
                }
                return d3plus.string.title(text, params);
            },
            number: function (number, params) {
                if (typeof params !== "undefined" && typeof params.data !== "undefined" && params.key == thiz.size) {
                    return thiz.sizeFormat(params.data);
                }
                return d3plus.number.format(number, params);
            }
        }
    });
}



/**
 * Wrapper method
 */
Map3.prototype.config = function (options) {
    for (var key in options) {
        this.treemap[key](options[key]);
    }
}

/**
 *
 */
Map3.prototype.textFormat = function (data) {
    var text = data[this.label];
    return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
}

/**
 *
 */
Map3.prototype.sizeFormat = function (data) {
    var n = data[this.size];
    return n;
}

/**
 * This method set the data and draw the treemap.
 */
Map3.prototype.data = function (data) {
    this.treemap.data(data);
    this.treemap.draw();

}

/**
 *
 */
Map3.prototype.color = function () {
    return [
        "#fdae6b",
        "#EACE3F",
        "#cba47d",
        "#f88710",
        "#d2ffb7",
        "#a1d99b",
        "#7197a0",
        "#fdd0a2",
        "#bcbddc",
        "#e89c89",
        "#5b7781",
        "#afd5e8",
        "#f7ba77",
        "#aeb8bc",
        "#d1d392",
        "#c6dbef",
        "#e099cf",
        "#889ca3"
    ];
}

/**
 *
 * @function
 *
 * @public
 * @name views.TreemapView#animate
 
 */
Map3.prototype.animate = function ($el, attrs, speed, callback) {
    // duration in ms
    speed = speed || 400;
    if ($el.length == 0) {
        return;
    }
    var start = {}, // object to store initial state of attributes
        timeout = 20, // interval between rendering loop in ms
        steps = Math.floor(speed / timeout), // number of cycles required
        cycles = steps; // counter for cycles left

    // populate the object with the initial state
    $.each(attrs, function (k, v) {
        start[k] = $el.attr(k);
    });

    (function loop() {
        $.each(attrs, function (k, v) { // cycle each attribute
            var pst;
            if (k == "transform") {
                var translate = function (value) {
                    var valueXY = value.replace("translate(", "").replace(")scale(1)");
                    valueXY = valueXY.split(",");
                    var pst = {};
                    pst.x = parseFloat(valueXY[0]);
                    pst.y = parseFloat(valueXY[1]);
                    return pst;
                }
                var pst = translate(start[k]);
                pst.x = (-pst.x) / steps;
                pst.y = (-pst.y) / steps;

                $el.attr(k, function (i, old) {
                    var oldVal = translate(old);
                    var cx = oldVal.x + pst.x;
                    var cy = oldVal.y + pst.y;
                    return "translate(" + cx + "," + cy + ")scale(1)";
                });
                return;
            }

            var getNumber = function (val) {
                var value = typeof val !== "undefined" ? val : 0;
                if (isNaN(value)) {
                    value = parseFloat(value.replace("px"));
                }
                return value;
            }
            var value = getNumber(start[k]);
            v = getNumber(v);
            pst = (v - value) / steps; // how much to add at each step
            //se verfica si el dato tenía un sufijo
            var sufix = value == start[k] ? "" : "px";
            $el.attr(k, function (i, old) {
                var result = +getNumber(old) + pst;
                return result + sufix; // add value do the old one

            });
        });

        if (--cycles) { // call the loop if counter is not exhausted
            setTimeout(loop, timeout);
        } else { // otherwise set final state to avoid floating point values
            $el.attr(attrs);
            if (callback) {
                callback($el, attrs);
            }
        }

    })(); // start the loop
}

/**
 * Este método se encarga de redimensionar los cuadros del treemap para dar el efecto de zoom.
 * @function
 *
 * @public
 * @name views.TreemapView#zoom
 */
Map3.prototype.zoom = function (data) {
    // se obtiene la referencia al elemento seleccionado. D3plus utiliza transform para transladar
    // las coordenadas del svg, se busca por el elemento que coincida con el translate del g 
    var $g = $('[transform*="translate(' + data.d3plus.x + ',' + data.d3plus.y + ')"]');
    //se obtiene el tamaño del contenedor para calcular el tamaño de la tipografía.
    var w = $(this.container).css("width").replace("px", "");
    var h = $(this.container).css("height").replace("px", "");
    w = parseFloat(w) + 50;
    h = parseFloat(h) + 50;
    var half = w / 2;
    var time = 250;
    //se obtienen las referencias
    var $target = $g.clone();
    //se elimina el texto del share
    var $share = $target.find("text.d3plus_share");
    //se extrae el color de del texto
    var textColor = $share.attr("fill");

    $share.remove();
    //se obtiene el texto
    var $text = $target.find("text");
    var textValue = this.textFormat(data);
    if ($text.length == 0) {
        var $rect = $target.find(".d3plus_data");
        textColor = d3plus.color.lighter($rect.attr("fill"), -0.6);
        //textColor = d3plus.color.lighter(textColor, 0.1);
        $text = d3.select($target[0])
            .append("text")
            .attr("font-size", "40px")
            .attr("text-anchor", "middle")
            .attr("stroke", "none")
            .attr("fill", textColor);

        $text.append("tspan")
            .attr("x", "0px")
            .attr("dy", "44px")
            .attr("dominant-baseline", "alphabetic")
            .text(textValue);

        $text = $rect.find("text");

    } else if ($text.length == 1) {
        var $tspan = $target.find("tspan");
        $tspan.text(textValue);

    }
    //se obtienen los tspan y el rect del item del treemap
    var $rect = $target.find("rect");
    var $tspam = $target.find("tspan");
    //se recalcula el tamaño de los textos
    var lineCount = $tspam.length;
    var chartCount = $tspam.first().text().trim().length;
    //font-size define el heigth de la tipografía y no el width, se estima
    // por pruebas que el width es igual al 50% del heigth del font.
    var tmpSize = (w / chartCount) * (100 / 50);
    tmpSize = parseInt(tmpSize);
    // si el texto cuenta con  más de 7 líneas hará overflow. Se recalcula
    // el tamaño de la tipografía para que se tenga en cuenta el alto del cuado
    // y la cantidad de líneas a desplegar.
    tmpSize = lineCount > 7 ? (h / (2 * lineCount)) : tmpSize;
    //para evitar que la tipografía sea muy grande, se pone un límite de 50px
    tmpSize = tmpSize > 50 ? 50 : tmpSize;
    var fontSize = tmpSize + "px";
    //si el texto cuenta con más de 5 líneas se modifica su posición incial para que no haga 
    //overflow el texto.
    var textPosition = lineCount <= 5 ? "100px" : "10px";

    //se hace un resize al rect que contiene el cuadrado principal
    this.animate($rect, {
        width: w,
        height: h,
        x: 0,
        y: 0
    }, time, function ($el, attrs) {
        $rect.attr("style", "opacity:0.9;");
    });

    //se mueve el cuadrado desde su origen hasta las coordenadas 0, 0
    this.animate($target, {
        transform: "translate(0,0)scale(1)"
    }, time);

    //para  la ubicación de los textos
    this.animate($tspam, {
        x: half + "px",
        dy: (tmpSize + 4) + "px",
        dx: "0px",
    }, time);

    //se manejan los tamaño de los textos
    $text.removeAttr("style");
    this.animate($text, {
        "font-size": fontSize,
        y: textPosition
    }, time, function ($el, attrs) {
        $text.attr("style", "opacity:1;");
    });

    //se setea el id del elemento manipulado
    $target.attr("id", "tmp-zoom-g");
    $("#d3plus_viz").append($target);
}
