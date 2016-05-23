//test
$(function () {
    var viz = new Map3({
        container: "#treemap",
        label: "value",
        size: "size"
    });

    viz.config({
        time: {
            "value": "year",
            "solo": [2011, 2013]
        }
    });

    viz.data(data);
});
