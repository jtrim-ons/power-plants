import { useEffect, useRef } from "react";
import * as d3 from "d3";
import zoom from "./lib/map-zoom.js";

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

  context.clearRect(0, 0, width, height);

  context.beginPath();
  path(countries);
  context.fillStyle = "#ccc";
  context.strokeStyle = "#fff";
  context.fill();
  context.stroke();

  for (const plant of gppd.slice(1000)) {
    context.beginPath();
    context.strokeStyle = "steelblue";
    const [x, y] = projection([plant.longitude, plant.latitude]);
    context.arc(x, y, 4, 0, 2 * Math.PI);
    context.stroke();
  }
}
