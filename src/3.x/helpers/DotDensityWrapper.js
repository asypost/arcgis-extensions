(function (global) {
    global.DotDensityWrapper = function (map, layer, options) {
        this._eventHandlers = [];
        this._layer = layer;
        this._map = map;
        this._addFn = layer.add;
        layer.add = this.wrappedLayerAddFn();
        this.options = options ? options : {
            itemSize: 16 //一个元素占用16个像素
        };
        this.init();
    };

    global.DotDensityWrapper.prototype = {
        init: function () {
            var layer = this._layer;
            var self = this;
            this._refreshGraphics();
            var handler = this._map.on("zoom-end", function () {
                self._refreshGraphics();
            });
            this._eventHandlers.push(handler);
            handler = this._map.on("layer-remove", function (layer) {
                if (layer === self._layer) {
                    while (self._eventHandlers.length > 0) {
                        self._eventHandlers.pop().remove();
                    }
                }
            });
        },
        _refreshGraphics: function () {
            var visibleGraphics = [];
            for (var i = 0; i < this._layer.graphics.length; i++) {
                var g = this._layer.graphics[i];
                var pointA = this._toScreenPoint(g.geometry);
                var visible = true;
                for (var j = 0; j < visibleGraphics.length; j++) {
                    var pointB = this._toScreenPoint(visibleGraphics[j].geometry);
                    if (this._pointTopointDistance(pointA, pointB) <= this.options.itemSize) {
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
        wrappedLayerAddFn: function () {
            var self = this;
            var layer = this._layer;

            return function (p) {
                var geometry = p.geometry;
                if (geometry.type !== "point") {
                    console.warn("Graphic must be point");
                }
                var pointA = self._toScreenPoint(geometry);
                var visible = true;
                for (var i = 0; i < layer.graphics.length; i++) {
                    var g = layer.graphics[i];
                    if (!g.visible) continue;
                    var pointB = self._toScreenPoint(g.geometry);
                    if (self._pointTopointDistance(pointA, pointB) <= self.options.itemSize) {
                        visible = false;
                        break;
                    }
                }
                if (visible) {
                    p.show();
                } else {
                    p.hide();
                }
                return self._addFn.call(layer, p);
            }
        },
        _toScreenPoint: function (point) {
            return esri.geometry.toScreenPoint(
                this._map.extent,
                this._map.container.clientWidth,
                this._map.container.clientHeight, point);
        },
        _pointTopointDistance(pointA, pointB) {
            return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
        },
    };
})(this);