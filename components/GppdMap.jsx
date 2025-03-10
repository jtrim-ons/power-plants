import { useLayoutEffect, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import zoom from "./lib/map-zoom.js";
import { dotConfig } from "../pages/config.mjs";

import countries50 from "pages/data/ne_50m_admin_0_countries.json";
import countries110 from "pages/data/ne_110m_admin_0_countries.json";
import populated_places from "pages/data/ne_50m_populated_places_simple.json";

// Try to show large city labels first
populated_places.features.sort((a, b) => b.pop_max - a.pop_max);

export const GppdMap = ({
  gppd,
  showCountryDots,
  zoomCallback,
  setPlantDisplayPositions,
}) => {
  const chartRef = useRef();
  const windowSize = useWindowSize();
  const zoomableMap = useRef(null);

  useEffect(() => {
    zoomableMap.current = new ZoomableMap(
      gppd,
      setPlantDisplayPositions,
      windowSize,
      zoomCallback,
      chartRef
    );

    return () => {
      d3.select(zoomableMap.current.chartDivRef).selectAll("*").remove();
    };
  }, [gppd, setPlantDisplayPositions, windowSize, zoomCallback]);

  useEffect(() => {
    if (!zoomableMap.current) return;
    zoomableMap.current.showCountryDots = showCountryDots;
    zoomableMap.current.render(false)();
  }, [
    gppd,
    setPlantDisplayPositions,
    windowSize,
    zoomCallback,
    showCountryDots,
  ]);

  return <div ref={chartRef} />;
};

class ZoomableMap {
  constructor(
    gppd,
    setPlantDisplayPositions,
    windowSize,
    zoomCallback,
    chartRef
  ) {
    const [width, height] = windowSize;

    const projection = d3
      .geoEqualEarth()
      .scale(220)
      .translate([width / 2, height / 2])
      .precision(0.1);

    this.chartDivRef = chartRef.current;

    var canvas = d3
      .select(this.chartDivRef)
      .append("canvas")
      .attr("width", width)
      .attr("height", height);

    var context = canvas.node().getContext("2d");

    this.render = (isFastVersion) => () => {
      renderMapToCanvas({
        gppd,
        isFastVersion,
        projection,
        context,
        width,
        height,
        showCountryDots: this.showCountryDots,
        zoomCallback,
        setPlantDisplayPositions,
      });
    };

    d3.select(context.canvas)
      .call(
        zoom(projection)
          .on("zoom.render", this.render(true))
          .on("end.render", this.render(false))
      )
      .on("wheel", (event) => event.preventDefault());
  }
}

function renderMapToCanvas({
  gppd,
  isFastVersion,
  projection,
  context,
  width,
  height,
  showCountryDots,
  zoomCallback,
  setPlantDisplayPositions,
}) {
  const path = d3.geoPath(projection, context);

  context.clearRect(0, 0, width, height);

  // display the background map
  context.beginPath();
  path(isFastVersion ? countries110 : countries50);
  context.fillStyle = "#230d41";
  context.strokeStyle = "#aaa";
  context.fill();
  context.stroke();

  const zoomLevel = projection.scale() / projection._scale;
  let logZoomLevel = Math.log2(zoomLevel) * dotConfig.logZoomMultiplier;
  logZoomLevel = Math.max(0, logZoomLevel);
  const radiusMultiplier = dotConfig.baseRadius * Math.sqrt(zoomLevel);
  zoomCallback({ zoomLevel, logZoomLevel, radiusMultiplier });

  const zoomInt = Math.floor(logZoomLevel);
  const zoomFrac = logZoomLevel % 1;

  context.beginPath();

  const plantDisplayPositions = [];

  // display the plant or country dots
  for (const plant of gppd) {
    if (showCountryDots !== plant.isCountryDot) {
      // don't show tooltip for this plant/country
      plantDisplayPositions.push([-1, -1, -1]);
      continue;
    }

    let radius = plant.sqrt_capacity * radiusMultiplier;

    const [x0, y0] = projection(plant.forcedLocations[zoomInt]);
    const [x1, y1] = projection(plant.forcedLocations[zoomInt + 1]);
    const [x, y] = [
      x0 * (1 - zoomFrac) + x1 * zoomFrac,
      y0 * (1 - zoomFrac) + y1 * zoomFrac,
    ];
    plantDisplayPositions.push([x, y, radius]);

    if (isFastVersion && radius < 0.5) continue;

    // for efficiency, don't plot circles that are tiny or out of view
    if (x < -radius || y < -radius || x > width + radius || y > height + radius)
      continue;

    if (plant.colour !== context.fillStyle) {
      // for efficiency, draw in batches of the same colour when possible
      context.fill();
      context.beginPath();
      context.fillStyle = plant.colour;
    }
    context.moveTo(x + radius, y);
    context.arc(x, y, radius, 0, 2 * Math.PI);
  }
  context.fill();
  setPlantDisplayPositions(plantDisplayPositions);

  if (zoomLevel > 15) {
    displayCities(context, projection);
  }
}

function displayCities(context, projection) {
  context.strokeStyle = "#e8e4ef";
  context.fillStyle = "#e8e4ef";
  context.font = "16px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (const city of populated_places.features) {
    const cityProps = city.properties;
    const [x, y] = projection([cityProps.longitude, cityProps.latitude]);
    const w = 8;
    context.fillText(cityProps.name, x, y);
  }
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
