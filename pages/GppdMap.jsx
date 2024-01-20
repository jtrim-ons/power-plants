import { useEffect, useRef } from "react";
import * as d3 from "d3";
import zoom from "./lib/map-zoom.js";
import { fuelGroupToColour } from "./config.js";

import countries from "pages/data/ne_110m_admin_0_countries.json";

export const GppdMap = ({ gppd }) => {
  const chartRef = useRef();

  useEffect(() => {
    const projection = d3.geoMercator().precision(0.1);

    var width = 1152,
      height = 1152;
    var canvas = d3
      .select(chartRef.current)
      .append("canvas")
      .attr("width", width)
      .attr("height", height);

    var context = canvas.node().getContext("2d");

    const render = () =>
      renderMapToCanvas({
        gppd,
        countries,
        projection,
        context,
        width,
        height,
      });

    d3.select(context.canvas)
      .call(zoom(projection).on("zoom.render", render).on("end.render", render))
      .call(render);
  }, [gppd]);

  return (
    <>
      <div ref={chartRef} />
      <p>hi!</p>
    </>
  );
};

function renderMapToCanvas({
  gppd,
  countries,
  projection,
  context,
  width,
  height,
}) {
  const path = d3.geoPath(projection, context);

  //context.clearRect(0, 0, width, height);
  context.fillStyle = "#d9ebfb";
  context.fillRect(0, 0, width, height);

  context.beginPath();
  path(countries);
  context.fillStyle = "#fff";
  context.strokeStyle = "#aaa";
  context.fill();
  context.stroke();

  const zoomLevel = projection.scale() / projection._scale;

  context.globalAlpha = 0.7;
  for (const plant of gppd) {
    context.beginPath();
    context.fillStyle = fuelGroupToColour[plant.fuel_group];
    const [x, y] = projection([plant.longitude, plant.latitude]);
    const radius = Math.sqrt(plant.capacity_mw) * 0.05 * Math.sqrt(zoomLevel);
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
  }
  context.globalAlpha = 1;
}
