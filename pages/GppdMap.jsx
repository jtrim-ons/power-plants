import { useLayoutEffect, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import zoom from "./lib/map-zoom.js";

import countries50 from "pages/data/ne_50m_admin_0_countries.json";
import countries110 from "pages/data/ne_110m_admin_0_countries.json";

export const GppdMap = ({ gppd, zoomCallback }) => {
  const chartRef = useRef();
  const windowSize = useWindowSize();

  useEffect(() => {
    var width = windowSize[0],
      height = windowSize[1];
    console.log(width, height);

    const projection = d3
      .geoEqualEarth()
      .scale(220)
      .translate([width / 2, height / 2])
      .precision(0.1);

    const chartDivRef = chartRef.current;

    var canvas = d3
      .select(chartDivRef)
      .append("canvas")
      .attr("width", width)
      .attr("height", height);

    var context = canvas.node().getContext("2d");

    const render = (isFastVersion) => () =>
      renderMapToCanvas({
        gppd,
        isFastVersion,
        projection,
        context,
        width,
        height,
        zoomCallback,
      });

    d3.select(context.canvas)
      .call(
        zoom(projection)
          .on("zoom.render", render(true))
          .on("end.render", render(false))
      )
      .call(render(false))
      .on("wheel", (event) => event.preventDefault());

    return () => {
      d3.select(chartDivRef).selectAll("*").remove();
    };
  }, [gppd, windowSize]);

  return <div ref={chartRef} />;
};

function renderMapToCanvas({
  gppd,
  isFastVersion,
  projection,
  context,
  width,
  height,
  zoomCallback,
}) {
  const path = d3.geoPath(projection, context);

  //context.clearRect(0, 0, width, height);
  //context.fillStyle = "#d9ebfb";
  context.clearRect(0, 0, width, height);

  context.beginPath();
  path(isFastVersion ? countries110 : countries50);
  context.fillStyle = "#230d41";
  context.strokeStyle = "#aaa";
  context.fill();
  context.stroke();

  const zoomLevel = projection.scale() / projection._scale;
  let logZoomLevel = Math.log2(zoomLevel) * 2;
  logZoomLevel = Math.min(10, Math.max(0, logZoomLevel)); // clamp between bounds
  const radiusMultiplier = 0.06 * Math.sqrt(zoomLevel);
  zoomCallback({ zoomLevel, logZoomLevel, radiusMultiplier });

  const zoomInt = Math.floor(logZoomLevel);
  const zoomFrac = logZoomLevel % 1;

  context.beginPath();

  let count = 0;
  for (const plant of gppd) {
    let radius = plant.sqrt_capacity * radiusMultiplier;
    if (isFastVersion && radius < 0.5) continue;

    ++count;
    const [x0, y0] = projection(plant.forcedLocations[zoomInt]);
    const [x1, y1] = projection(plant.forcedLocations[zoomInt + 1]);
    const [x, y] = [
      x0 * (1 - zoomFrac) + x1 * zoomFrac,
      y0 * (1 - zoomFrac) + y1 * zoomFrac,
    ];
    if (
      x > -radius &&
      y > -radius &&
      x < width + radius &&
      y < height + radius
    ) {
      // for efficiency, don't plot circles that tiny or out of view
      if (plant.colour !== context.fillStyle) {
        // for efficiency, draw in batches of the same colour when possible
        context.fill();
        context.beginPath();
        context.fillStyle = plant.colour;
      }
      context.moveTo(x + radius, y);
      context.arc(x, y, radius, 0, 2 * Math.PI);
    }
  }
  context.fill();
}

function useWindowSize() {
  // https://stackoverflow.com/a/19014495
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}
