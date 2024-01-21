// Enable zooming on a d3 map.
// Source: https://observablehq.com/@fil/map-pan-zoom

import * as d3 from "d3";

export default function zoom(
  projection,
  {
    // Capture the projection’s original scale, before any zooming.
    scale = projection._scale === undefined
      ? (projection._scale = projection.scale())
      : projection._scale,
    scaleExtent = [1, 20],
    translate = projection
      .translate()
      .map((d) => d / (projection.scale() / scale)),
  } = {}
) {
  const zoom = d3
    .zoom()
    .scaleExtent(scaleExtent.map((x) => x * scale))
    .on("start", zoomstarted)
    .on("zoom", zoomed);

  function zoomstarted() { }

  function zoomed(event) {
    const { k, x, y } = event.transform;
    projection
      .scale(k)
      .translate([
        translate[0] * (k / scale) + x,
        translate[1] * (k / scale) + y,
      ]);
  }

  return Object.assign(
    (selection) =>
      selection
        .property("__zoom", d3.zoomIdentity.scale(projection.scale()))
        .call(zoom),
    {
      on(type, ...options) {
        return options.length
          ? (zoom.on(type, ...options), this)
          : zoom.on(type);
      },
      filter() {
        return zoom.filter(...arguments), this;
      },
    }
  );
}