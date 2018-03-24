(function (global) {
    global.GeometryUtil = {
        lineLength: function (pointA, pointB) {
            var x1 = pointA.x, y1 = pointA.y;
            var x2 = pointB.x, y2 = pointB.y;

            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        },
        pointToLineDistance: function (linePointA, linePointB, point) {
            var x1 = linePointA.x, y1 = linePointA.y;
            var x2 = linePointB.x, y2 = linePointB.y;
            var x3 = point.x, y3 = point.y;

            var y4 = NaN, x4 = NaN;

            if (x2 - x1 === 0) {
                y4 = y3;
                x4 = x2;
            } else if (y2 - y1 === 0) {
                x4 = x3;
                y4 = y2;
            } else {
                var k = (y2 - y1) / (x2 - x1);

                y4 = (k * x3 + k * k * y3 - k * x1 + y1) / (k * k + 1);
                x4 = x3 - k * y4 + k * y3;
            }

            return this.lineLength(point, { x: x4, y: y4 });
        },
        pointToSegementDistance: function (segPointA, segPointB, point) {
            var distanceA = this.lineLength(point, segPointA);
            var distanceB = this.lineLength(point, segPointB);

            var x1 = segPointA.x, y1 = segPointA.y;
            var x2 = segPointB.x, y2 = segPointB.y;
            var x3 = point.x, y3 = point.y;

            var y4 = NaN, x4 = NaN;

            if (x2 - x1 === 0) {
                y4 = y3;
                x4 = x2;
            } else if (y2 - y1 === 0) {
                x4 = x3;
                y4 = y2;
            } else {
                var k = (y2 - y1) / (x2 - x1);

                y4 = (k * x3 + k * k * y3 - k * x1 + y1) / (k * k + 1);
                x4 = x3 - k * y4 + k * y3;
            }

            var ymax = y1 > y2 ? y1 : y2, ymin = y1 > y2 ? y2 : y1;
            var xmax = x1 > x2 ? x1 : x2, xmin = x1 > x2 ? x2 : x1;

            if (x4 >= xmin && x4 <= xmax && y4 >= ymin && y4 <= ymax) {
                var lineLen = this.lineLength({ x: x3, y: y3 }, { x: x4, y: y4 });
                return Math.min(distanceA, distanceB, lineLen);
            } else {
                return Math.min(distanceA, distanceB);
            }

        }
    };
})(this);