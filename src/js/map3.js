/**
 * Interactive treemap based on d3plus treemap.

 * @param {Object} options
 * @config {string} container target container.
 * @config {string|array} label the json attribute name that determines the label of the box.
 * @config {string} size the json attribute name that determines the size of the box.
 * @config {string}[time] the json attribute name that determines the timeline of the view.
 * @config {array}[levels]
 * @config {number}[zoomTime]
 * @config {string}[timeContainer] default footer
 */
var Map3 = function (options) {
    this.locale = {
        region: "en_US",
        translate: {}
    }
    this.totales = {};
    this.first = true;
    this.timeArray = [];
    this.timeSelection = [];
    this.dataMap = {};
    this.dataMapTable = {};
    this.timeContainer = "footer";
    this.initialize(options);
    this.build();
    this.breadcrumbs();
}

/**
 * Constructor of class.
 * @param {Object} options
 * @config {string} container target container.
 * @config {string|array} label the json attribute name that determines the label of the box.
 * @config {string} size the json attribute name that determines the size of the box.
 * @config {array}[levels]
 * @config {number}[zoomTime]
 * @config {String}[locale]
 */
Map3.prototype.initialize = function (options) {
    this.zoomTime = 250;
    for (var attr in options) {
        this[attr] = options[attr];
    }
    this.events = {};
    this.cargs = {};
    this.level = 0;
    this.label = typeof this.label == "string" ? [this.label] : this.label;
    this.levels = typeof this.levels == "undefined" ? [] : this.levels;
    //se prepara el container de la visualización
    this.prepareContainer();
}

Map3.prototype.prepareContainer = function () {
    var scope = this.container.replace("#", "");
    this.vizId = scope + "-viz";
    this.footerId = scope + "-footer";
    this.headerId = scope + "-header";
    this.scope = "#" + this.vizId;
    var $header = $("<div />");
    $header.attr("id", this.headerId);

    var $viz = $("<div />");
    $viz.attr("id", this.vizId);

    var $footer = $("<div />");
    $footer.attr("id", this.footerId);

    $(this.config.container).addClass("map3-chart");
    $viz.addClass("map3-viz");

    $(this.container).append($header);
    $(this.container).append($viz);
    $(this.container).append($footer);
}

/**
 * This method build the base of the treemap.
 */
Map3.prototype.build = function () {
    this.treemap = d3plus.viz();
    var thiz = this;
    /*
     * base configuration of the visualization.
     */
    this.treemap.config({
        container: this.scope,
        type: "tree_map",
        id: this.label,
        labels: {
            "align": "center",
            "valign": "top"
        },
        size: {
            value: thiz.size,
            threshold: false
        }
    });

    /*
     * Bind the data formatter
     */
    this.treemap.format({
        locale: thiz.locale.region,
        text: function (text, params) {
            if (typeof params !== "undefined" && typeof params.data !== "undefined" && params.key == thiz.label) {
                //se invoca al método que formatea los labels
                return thiz.textFormat(params.data);
            } else if (text && thiz.locale.translate) {
                text = typeof thiz.locale.translate[text] !== "undefined" ? thiz.locale.translate[text] : text;
            }
            return d3plus.string.title(text, params);
        },
        number: function (number, params) {
            if (typeof params !== "undefined" && typeof params.data !== "undefined" && params.key == thiz.size) {
                return thiz.sizeFormat(params.data);
            }
            return d3plus.number.format(number, params);
        }
    });

    /*
     * bind click event to the treemap
     */
    this.treemap.mouse({
        "move": true,
        "click": function (d, viz) {
            thiz.beforeClick(d, viz);
        }
    });
    //se mejoran los bordes para que sean realativos al tamaño del box
    this.processBorders();
}

/**
 *
 */
Map3.prototype.on = function (event, handler) {
    this.events[event] = handler;
}

/**
 *
 */
Map3.prototype.trigger = function (event, data) {
    if (typeof this.events[event] !== "undefined") {
        this.events[event](data);
    }
}

/**
 *
 */
Map3.prototype.beforeClick = function (d, viz) {
    if (this.level < this.levels.length - 1 && this.levels.length != 0) {
        var data = this.getData(this.level, d);
        data = $.extend({}, data, d);
        this.zoom(data);
        this.updateBreadcrumbs(data);
        this.level += 1;
        if (typeof this.time != "undefined") {
            this.time.solo = data[this.time.value];
        }
        this.trigger("drill-down", data);
    }
}

/**
 * Wrapper method
 */
Map3.prototype.config = function (options) {
    for (var key in options) {
        this.treemap[key](options[key]);
        this.cargs[key] = options[key];
    }
}

/**
 * Simple text formatter.
 */
Map3.prototype.textFormat = function (data) {
    var text = data[this.label];
    return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
}

/**
 * Simple number formater.
 */
Map3.prototype.sizeFormat = function (data) {
    var n = data[this.size];
    return n;
}

Map3.prototype.redraw = function (data) {
    $(this.scope).html("");
    this.build();
    this.data(data);
    this.config(this.cargs);
}

/**
 * This method set the data and draw the treemap.
 */
Map3.prototype.data = function (data) {
    this.processData(data);
    var d = this.groupingData(data);
    if (this.first) {
        this.buildTotales(this.level, data);
    }
    this.treemap.data(d);
    this.treemap.draw();
    var total = this.treemap.total();
    if (typeof this.time !== "undefined" && this.timeSelection.length == 0) {
        this.timeline();
    }
    this.calcularTotal();
}


Map3.prototype.processData = function (data) {
    this.dataMapTable[this.level] = {};
    this.dataMap[this.level] = data;
    for (var i = 0; i < data.length; i++) {
        var key = d3plus.string.strip(data[i][this.label]);
        this.dataMapTable[this.level][key] = data[i];
    }
}

Map3.prototype.getData = function (level, data) {
    var key = d3plus.string.strip(data[this.label]);
    return this.dataMapTable[level][key];
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


Map3.prototype.getEl = function (data) {
    return $('[transform*="translate(' + data.d3plus.x + ',' + data.d3plus.y + ')"]');
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
    var $g = this.getEl(data);
    //se obtiene el tamaño del contenedor para calcular el tamaño de la tipografía.
    var w = $(this.scope).css("width").replace("px", "");
    var h = $(this.scope).css("height").replace("px", "");
    w = parseFloat(w) + 50;
    h = parseFloat(h) + 50;
    var half = w / 2;
    var time = this.zoomTime;
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
        textColor = d3plus.color.text($rect.attr("fill"));
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
        //se obtiene la referencia al texto
        $text = $rect.find("text");

    } else if ($text.length == 1) {
        var $tspan = $target.find("tspan");
        for (var i = 1; i < $tspan.length; i++) {
            $($tspan[i]).remove();
        }

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

/**
 * buil a breadcrumbs
 */
Map3.prototype.breadcrumbs = function () {
    var $top = $("<div class='top-note'></div>");
    $top.append($("<span class='text'>Total: </span>"));
    $top.append($("<span class='note' id='map3-total-0'></span>"));
    var $ul = $("<ul class='map3-hierarchies'/>");
    var $liTmpl = $("<li / >");
    var $aTmpl = $("<a class='map3-levels disable'/>");
    for (var i = 0; i < this.levels.length; i++) {
        var $li = $liTmpl.clone();
        var aId = "map3-li-lvl-" + i;
        var $a = $aTmpl.clone();
        $a.attr("data-level", i);
        $a.attr("id", aId);
        $a.attr("data-name", this.levels[i]);
        $a.text(this.levels[i]);
        $li.append($a);
        $ul.append($li);
    }
    // leyenda del breadcrumbs
    var $ol = $("<ol class='map3-breadcrumbs' />");
    //se añade los elementos
    $(this.container).prepend($ol);
    $(this.container).prepend($ul);
    $(this.container).prepend($top);

    var thiz = this;
    $ul.find("li").on("click", function () {
        if (!$(this).find("a").hasClass("disable")) {
            thiz.onDrillUp($(this));
        }
    });
}

Map3.prototype.processBorders = function () {
    var thiz = this;
    setTimeout(function () {
        //se elimina el zoom
        $("#tmp-zoom-g").remove();
        //se elimnan todos los text con font-size negativas.
        $(".d3plus_rect text[font-size^=-]").each(function () {
            $(this).attr("font-size", "0px");
        });

        $("rect:not(.no-border)").each(function () {
            var w = $(this).attr("width");
            var h = $(this).attr("height");
            w = parseInt((w + "").replace("px"));
            h = parseInt((h + "").replace("px"));
            if (w <= 1 || h <= 1) {
                $(this).attr("data-border", "0");
            } else if (w <= 5 || h <= 5) {
                $(this).attr("data-border", "1");
            } else if (w <= 10 || h <= 10) {
                $(this).attr("data-border", "2");
            }
        });
    }, 500);
}

/**
 *
 */
Map3.prototype.onDrillUp = function ($li) {
    var $a = $li.find("a");
    var level = $a.attr("data-level");
    this.level = parseInt(level);
    var $labels = $(this.container).find(".map3-breadcrumbs");
    var $brumbs = $(this.container).find(".map3-hierarchies");
    var len = $brumbs.find("[data-level]").length;
    for (var i = level; i < len; i++) {
        $labels.find("[data-level='" + i + "']").remove();
        var $aEl = $brumbs.find("[data-level='" + i + "']");
        var aId = $aEl.attr("id");
        $aEl.addClass("disable");
        $("." + aId).remove();
    }
    var d = this.dataMap[this.level];
    var data = {};
    data.childs = $.extend({}, d);
    data.level = level;
    if (typeof this.time != "undefined" && data.data != null) {
        data[this.time.value] = this.time.solo;
    }
    this.redraw(d);
    this.trigger("drill-up", data);
}

/**
 *
 */
Map3.prototype.updateBreadcrumbs = function (data) {
    var $target = this.getEl(data);
    var fill = $target.find("rect").attr("fill");
    var textColor = d3plus.color.text(fill);
    var $brumbs = $(this.container).find(".map3-hierarchies");
    var $a = $brumbs.find("[data-level='" + this.level + "']");
    var aId = $a.attr("id");
    $a.removeClass("disable");
    //se aplican los estilos al breadcrums
    var aStyle = "<style class='{id}'>";
    aStyle += "a#{id}::before {border-color: {fill} {fill} {fill} transparent;}";
    aStyle += "li:last-child a#{id}::after {border-color: {fill} {fill} {fill} {fill};}";
    aStyle += "li a#{id}::after {border-left: 1em solid {fill};}";
    aStyle += "a#{id}{background-color: {fill}; color:{text}}";
    aStyle += "li:first-child a#{id}::before{border-color: {fill} {fill} {fill} {fill};}";
    aStyle += "</style>";
    aStyle = aStyle.replace(/{id}/g, aId).replace(/{fill}/g, fill).replace(/{text}/g, textColor);
    $a.append($(aStyle));

    var $labels = $(this.container).find(".map3-breadcrumbs");
    var $li = $("<li/>");
    $li.attr("data-level", this.level);
    var $span = $("<span class='text'/>");
    var $div = $("<div class='note'/>");
    $div.attr("id", "map3-total-" + (this.level + 1));
    $span.text(this.textFormat(data));
    $div.text(this.sizeFormat(data));
    $li.append($span);
    //TODO se desabilita los totales ya que falta implementar el filtrado por año.
    $li.append($("<br/>"));
    $li.append($div);
    $labels.append($li);
}

/**
 * Build a timeline for the visualization
 */
Map3.prototype.timeline = function () {
    // create list
    var containersMap = {
        "header": this.headerId,
        "footer": this.footerId
    }
    var timeId = typeof containersMap[this.timeContainer] == "undefined" ? this.timeContainer : containersMap[this.timeContainer];
    timeId = "#" + timeId;
    $(timeId).html("");

    if (this.timeSelection.length == 0) {
        this.timeSelection = this.timeArray.sort().map(function (d) {
            return d
        });
    }

    var ul = d3.select(timeId)
        .append('ul')
        .attr("class", "timeline")
        .attr('tabindex', 1);

    var thiz = this;
    var time = this.timeArray.sort().map(function (d) {
        var data = {
            "time": d
        };

        if (thiz.timeSelection.length == 0 || thiz.timeSelection.indexOf(d) >= 0) {
            data["_selected"] = true;
        }
        return data;
    });

    var li = ul.selectAll('li')
        .data(time)
        .enter()
        .append('li')
        .attr("class", "entry")
        .classed('selected', function (d) {
            return d._selected;
        })
        .append('a')
        .text(function (d) {
            return d.time;
        });

    d3.selectable(ul, li, function (e) {
        var selections = [];
        ul.selectAll('li')
            .classed('selected', function (d) {
                if (d._selected) {
                    selections.push(d);
                }
                return d._selected;
            })

        if (thiz.timeSelection.length == 1 && selections.length == 1) {
            if (thiz.timeSelection.indexOf(selections[0].time) >= 0) {
                return;
            }
        }

        //se establecen la selecciones
        thiz.timeSelection = selections.map(function (d) {
            return d.time;
        });

        thiz.onChange();
        thiz.trigger("timechange", thiz.timeSelection);
    });
}

/**
 * Prepare the data for the vizualization
 */
Map3.prototype.roolup = function (v, sample) {
    var data = {};
    var thiz = this;
    for (var attr in sample) {
        if (attr == this.time) {
            data[attr] = v.map(function (d) {
                if (thiz.timeArray.indexOf(d[attr]) == -1) {
                    thiz.timeArray.push(d[attr]);
                }
                return d[attr];
            });
        } else if (attr == this.label) {
            data[attr] = v[0][attr];
        } else if (typeof sample[attr] == "number") {
            data[attr] = d3.sum(v, function (d) {
                return d[attr];
            });
        } else if (attr == "children") {
            data[attr] = data[attr] ? data[attr] : [];
            for (var i = 0; i < v.length; i++) {
                for (var j = 0; j < v[i][attr].length; j++) {
                    data[attr].push(v[i][attr][j]);
                }
            }
        } else {
            data[attr] = v.map(function (d) {
                return d[attr];
            });
        }
    }
    return data;
}

/**
 * Groupping the array for the visualization
 */
Map3.prototype.groupingData = function (data) {
    var thiz = this;
    var sampleObj = null;
    var tmp = data.filter(function (d) {
        var show = true;
        if (typeof d[thiz.time] == "undefined") {
            return true;
        } else if (typeof d[thiz.time] == "number") {
            show = thiz.timeSelection.indexOf(d[thiz.time]) >= 0;
        } else {
            for (var i = 0; i < d[thiz.time].length; i++) {
                show = show && thiz.timeSelection.indexOf(d[thiz.time][i]) >= 0;
            }
        }
        return thiz.timeSelection.length == 0 || show;
    });

    var filters = d3.nest()
        .key(function (d) {
            sampleObj = d;
            return d[thiz.label];
        })
        .rollup(function (v) {
            return thiz.roolup(v, sampleObj);
        }).entries(tmp);

    var dataA = filters.map(function (d) {
        return d.values;
    });

    return dataA;
}

/**
 *
 * Este metodo se encarga de calcular la suma de todos los tamaños del treemap
 * @function
 *
 */
Map3.prototype.calcularTotal = function () {
    var anhos = this.timeSelection; //typeof this.timeSelection == "undefined" ? ["NaN"] : this.timeSelection;
    anhos = anhos.length == 0 ? ["NaN"] : anhos;
    var thiz = this;

    function sum(jerarquia, anho) {
        var val = 0;
        //se verifica si existen datos para la jeraquía, tipo de moneda y el año
        //actual
        if (typeof thiz.totales[jerarquia] == "undefined" ||
            typeof thiz.totales[jerarquia][anho] == "undefined") {
            val = 0;
        } else {
            val = thiz.totales[jerarquia][anho];
        }
        return val;
    }

    for (var jerarquia in this.totales) {
        var tmp = 0;
        for (var i = 0; i < anhos.length; i++) {
            tmp += sum(jerarquia, anhos[i]);
        }
        var d = {};
        d[this.size]=tmp;
        $("#map3-total-" + jerarquia).text(this.sizeFormat(d));
    }
}

/**
 * Se encarga de construir el Json que tiene la inforación de los totales por año,
 * tipo de moneda y jerarquia. Donde el Json tiene la siguiente estructura.
 * <code>
 * {
 *   "0":{
 *       "2012":34132428986,
 *       "2013":18821743400,
 *       "2014":23010078400
 *   },
 *   "1":{
 *       "2012":5533832700,
 *       "2013":1541915000,
 *       "2014":2811060000
 *   }
 * }
 * </code>
 */
Map3.prototype.buildTotales = function (jerarquia, data) {
    this.totales[jerarquia] = {};
    for (var i = 0; i < data.length; i++) {
        var model = data[i];
        if (typeof jerarquia !== "undefined") {
            var tmpYear = model[this.time] ? model[this.time] : "NaN";
            if (typeof this.totales[jerarquia][tmpYear] == "undefined") {
                this.totales[jerarquia][tmpYear] = 0;
            }
            this.totales[jerarquia][tmpYear] += model[this.size];
        }
    }
}


/**
 * Tieline change handler
 */
Map3.prototype.onChange = function () {
    var data = $.extend([], this.dataMap[this.level], true);
    this.redraw(data);

}
