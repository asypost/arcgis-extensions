(function (global) {
    global.GraphicsLayerEventHelper = function (map, options) {
        this.options = options ? options : {
            collisionDistance: 6 //碰撞距离
        };
        this.map = map;
        this.onFn = this.map.on;
        this.map.on = this.wrapMapOnFn(); //劫持map.on方法
        this.registeredEventHandlers = {}; //已经监听的事件处理对象
        dojo.require("esri.geometry.geometryEngine");
        this.attachEvents();
    };

    global.GraphicsLayerEventHelper.prototype = {
        constructor: global.GraphicsLayerEventHelper,

        //劫持Map.on方法保证本对象的事件处理方法总在最后执行
        wrapMapOnFn: function () {
            var self = this;
            return function (event, callback) {
                var oldHandler = self.registeredEventHandlers[event];
                if (typeof oldHandler !== "undefined") {
                    var fn = oldHandler.advice;
                    oldHandler.remove();
                    var handler = self.onFn.call(self.map, event, callback);
                    self.registeredEventHandlers[event] = self.onFn.call(self.map, event, fn);
                    return handler;
                }
                else {
                    return self.onFn.call(self.map, event, callback);
                }
            }
        },

        attachEvents: function () {
            this.attachClick();
        },

        attachClick: function () {
            var self = this;
            this.registeredEventHandlers["click"] = this.onFn.call(this.map, "click",
                function (event) {
                    self.onMapClick(event);
                });
        },

        //监听map的点击事件，逐一监测地图中的GraphicsLayer中的Graphic是否被点中
        //目的是在地图的render是canvas-2d时模拟arcgis未提供的GraphicsLayer事件处理
        onMapClick: function (event) {
            var map = this.map;
            var geometryEngine = esri.geometry.geometryEngine;
            var collisionDistance = this.options.collisionDistance;
            var layerIds = map.graphicsLayerIds;
            for (var index = layerIds.length - 1; index >= 0; index--) {
                var layerId = layerIds[index];
                var layer = map._layers[layerId];

                var fireEvent = false;
                if (layer instanceof esri.layers.GraphicsLayer) {
                    if (layer.surfaceType.indexOf("canvas") === -1) continue;
                    if (!layer.visible) continue;

                    for (var i = 0; i < layer.graphics.length; i++) {
                        var graphic = layer.graphics[i];
                        var geometry = graphic.geometry;
                        var mouseMapPoint = event.mapPoint;
                        if (geometry.type === "point") {
                            var mapContainer = map.container;

                            var geoScreenPoint = esri.geometry.toScreenPoint(map.extent,
                                    mapContainer.clientWidth,
                                    mapContainer.clientHeight,
                                    geometry);

                            var distance = GeometryUtil.lineLength(geoScreenPoint, event.screenPoint);

                            if (distance < collisionDistance) {
                                fireEvent = true;
                            }
                        } else if (geometry.type === "polyline") {
                            for (var pathIndex = 0; pathIndex < geometry.paths.length; pathIndex++) {
                                var path = geometry.paths[pathIndex];
                                for (var pointIndex = 1; pointIndex < path.length; pointIndex++) {
                                    var gpointA = geometry.getPoint(pathIndex, pointIndex - 1);
                                    var gpointB = geometry.getPoint(pathIndex, pointIndex);

                                    var pointA = esri.geometry.toScreenPoint(map.extent,
                                                        mapContainer.clientWidth,
                                                        mapContainer.clientHeight,
                                                        gpointA);

                                    var pointB = esri.geometry.toScreenPoint(map.extent,
                                                        mapContainer.clientWidth,
                                                        mapContainer.clientHeight,
                                                        gpointB);


                                    if (GeometryUtil.pointToSegementDistance(pointA, pointB, event.screenPoint) < collisionDistance) {
                                        fireEvent = true;
                                        break;
                                    }
                                }
                                if (fireEvent) {
                                    break;
                                }
                            }
                        } else {
                            if (esri.geometry.geometryEngine.intersects(mouseMapPoint, geometry)) {
                                fireEvent = true;
                            }
                        }
                        if (fireEvent) {
                            layer.emit("click", {
                                graphic: graphic,
                                mapPoint: mouseMapPoint,
                                screenPoint: event.screenPoint
                            });
                            break;
                        }
                    }
                }
                if (fireEvent) {
                    break;
                }
            }
        }
    }

})(this);

