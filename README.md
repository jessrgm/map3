# Map3
Javascript library to implement a interactive zoomable treemap.


## Usage
Below is quick example how to use :

*Download the latest version library and include it in your html.*

```html
<script src="js/jquery.js"></script>
<script src="js/d3.min.js"></script>
<script src="js/d3plus.min.js"></script>
<script src="js/map3.js"></script>
<link href="map3.css" rel="stylesheet">

```

*Add a container in your html :*

```html
...
<div id="treemap"></div>
```

*This code build a simple treemap*
```javascript
...
var viz = new Map3({
    container: "#treemap",
    label: "value",
    size: "size"
});

viz.data(vizData);
```


## Options
The available configuration options from a treemap:

#### options.container
Type: `String`

Container where the list will build. 


#### options.label
Type: `Array|String`

The json attribute name that determines the label of the box.

#### options.size
Type: `Array`

The json attribute name that determines the size of the box.

#### options[levels]
Type: `Array|String`

The Array of attributes that define the hierarchy of treemap.

#### options[time]
Type: `d3plus.time`

Define the timeline of the treemap. [See d3plus](https://github.com/alexandersimoes/d3plus/wiki/Visualizations#time-false--string--function--object-)

#### options[locale]
Type: `Options`

* `{String}region`:  [See d3plus location](https://github.com/alexandersimoes/d3plus/wiki/Localization).
* `{Object}translate`: the translation map.
        
Support specifying a locale to use for translating common interface words and phrases into a different language.


```javascript
    var viz = new Map3({
        container: "#treemap",
        ...
        locale: {
            region: "es_ES",
            translate: {
                "size": "Monto"
            }
        }
    });
```

## Functions
The available functions to interact with the treemap:

#### Map3.data(data)
Type: `Function`
* `{Array}data`: the visualization data.

Sets the data associated with your visualization.

```javascript
var vizData =  [{
    "value": "Data1",
    "size": 2065724632,
}, {
    "value": "Data2",
    "size": 141765766652,
}, {
    "value": "Data3",
    "size": 48130171902,
}];

var viz = new Map3({
    container: "#treemap",
    label: "value",
    size: "size"
});

//do someting

//setting data
viz.data(vizData);
```
#### Map3.redraw(data)
Type: `Function`
* `{Array}data`: the visualization data.

Redraw the visualization with new data.

#### Map3.config(options)
Type: `Function`

* `{Object} options`: the value to format.

Wrapper method for [d3plus.config](https://github.com/alexandersimoes/d3plus/wiki/Visualizations#config-object-).

```javascript
var viz = new Map3({...});

viz.config({
    color: {
        scale: [
            "#fdae6b",
            "#EACE3F",
            ...
            "#e099cf",
            "#889ca3"
        ]
    }
});

//setting data
viz.data(vizData);
```

#### Map3.on(event, handler)
Type: `Function`

* `{String}event`: the name of the event.
* `{Function}handler`: handler function.

The events available are:

* `drill-down` : triggered when a box of the multilevel treemap is clicked.
* `drill-up` : triggered when a element of breadcrumb is clicked.

```javascript 
var viz = new Map3({...});

viz.on("drill-down", function (d) {
    //do someting
    console.log(d);
});

viz.on("drill-up", function (d) {
    //do someting
    console.log(d);
});
//setting data
viz.data(vizData);
```

## Want to contribute?

If you've found a bug or have a great idea for new feature let me know by [adding your suggestion]
(http://github.com/mbaez/3map/issues/new) to [issues list](https://github.com/mbaez/3map/issues).
