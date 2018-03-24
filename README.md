# ArcGIS SDK extensions
Collection of ArcGIS SDK extensions.

## ArcGIS JS SDK
* layers/DotDensityLayer
> A layer inherits GraphicsLayer that can control visible graphic count depends on the map zoom level.

* helpers/DotDensityWrapper
> Wrap a GraphicsLayer to control visible graphic count depends on map zoom level.It's function is the same function with DotDensityLayer.

* helpers/GraphicsLayerEventsHelper
> When ArcGIS JS SDK uses canvas as it's render,GraphicsLayer has no event support,GraphicsLayerEventsHelper provide a way to support click event. 
>> To use Canvas as it's render you need to add the following before you add ArcGIS JS SDK to you HTML:
    `<script type="text/javascript">
        var djConfig = {
            parseOnLoad: true,
            gfxRenderer: "canvas,svg,vml,silverlight"
        }
    </script>`
