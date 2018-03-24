define(["dojo/_base/declare",
    "dojo/_base/connect",

    "esri/layers/GraphicsLayer",
    "esri/geometry/screenUtils"
], function (
    declare,
    connect,
    GraphicsLayer,
    screenUtils
) {
    return declare([GraphicsLayer], {
        constructor: function (options) {
            // options:
            //  itemSize:  Number?
            //   How many pixels a point should use,default is 16

            options = options ? options : {
                itemSize: 16
            };

            this._graphicTolerance = options.itemSize ? options.itemSize : 16;

            //Hold the event handlers.
            this._eventHandlers = [];
        },
        _setMap: function (map, surface) {
            var container = this.inherited(arguments);

            //Redraw graphics when map zoom end.
            var zoomEndHandler = connect.connect(this.getMap(), "onZoomEnd", this, function () {
                this._reDrawGraphics();
            });
            this._eventHandlers.push(zoomEndHandler);
            this._reDrawGraphics();

            return container;
        },
        _unsetMap: function () {
            this.inherited(arguments);
            while (this._eventHandlers.length > 0) {
                connect.disconnect(this._eventHandlers.pop());
            }
        },
        add: function (g) {
            var geometry = g.geometry;
            if (geometry.type !== "point") {
                console.warn("Graphic must be Point");
                return this.inherited(arguments);
            }

            if(!this.getMap()){
                return this.inherited(arguments);
            }

            var pointA = this._toScreenPoint(geometry);
            var visible = true;
            for (var i = 0; i < this.graphics.length; i++) {
                var g2 = this.graphics[i];
                if (!g2.visible) continue;

                var pointB = this._toScreenPoint(g2.geometry);
                if (this._distance(pointA, pointB) <= self._graphicTolerance) {
                    visible = false;
                    break;
                }
            }

            if (visible) {
                g.show();
            } else {
                g.hide();
            }

            return this.inherited(arguments);
        },
        _reDrawGraphics: function () {
            var visibleGraphics = [];
            for (var i = 0; i < this.graphics.length; i++) {
                var g = this.graphics[i];
                if (g.geometry.type !== "point") continue;

                var pointA = this._toScreenPoint(g.geometry);
                var visible = true;
                for (var j = 0; j < visibleGraphics.length; j++) {
                    var pointB = this._toScreenPoint(visibleGraphics[j].geometry);
                    if (this._distance(pointA, pointB) <= this._graphicTolerance) {
                        visible = false;
                        break;
                    }
                }

                if (visible) {
                    visibleGraphics.push(g);
                    g.show();
                } else {
                    g.hide();
                }
            }
            delete visibleGraphics;
        },
        _toScreenPoint: function (point) {
            var map = this.getMap();
            return screenUtils.toScreenPoint(
                map.extent,
                map.container.clientWidth,
                map.container.clientHeight, point
            );
        },
        _distance: function (pointA, pointB) {
            return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) +
                Math.pow(pointA.y - pointB.y, 2));
        }
    });
});