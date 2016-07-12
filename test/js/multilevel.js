//test
$(function () {
    var viz = new Map3({
        container: "#treemap",
        label: "value",
        size: "size",
        levels: ["Nivel", "Entidad"],
        time: "year",
        locale: {
            region: "es_ES",
            translate: {
                "size": "Monto total"
            }
        }
    });

    viz.on("drill-down", function (d) {
        console.log(d.data);
        setTimeout(function () {
            viz.redraw(data)
        }, 1000);
    });

    viz.on("drill-up", function (d) {
        console.log(d);
    });

    viz.data(data0);
});
