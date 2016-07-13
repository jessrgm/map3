//test
$(function () {
    var viz = new Map3({
        container: "#treemap",
        label: "value",
        size: "size",
        levels: ["Entidad", "Descripción"],
        time: "year",
        timeContainer: "header",
    });

    viz.config({
        color: {
            scale: [
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
            ]
        }
    });

    viz.on("drill-down", function (d) {
        console.log(d);
        setTimeout(function () {
            viz.redraw(data)
        }, 1000);
    });
    viz.on("drill-up", function (d) {
        console.log(d);
        viz.redraw(data0)
    });

    viz.data(data0);
});
