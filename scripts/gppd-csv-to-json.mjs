// This script reads the GPPD CSV, calculates dot positions for various zoom levels
// using force layout, and saves only the required fields to a JSON file. 

import * as fs from 'fs';
import * as d3 from 'd3';
import { dotConfig } from "../pages/config.mjs";

const gppdPath = './global_power_plant_database_v_1_3/global_power_plant_database.csv';
const outJsonFilename = './pages/data/global_power_plant_database.json';

const projection = d3.geoEqualEarth();

let gppd = d3.csvParse(fs.readFileSync(gppdPath, 'utf8'));

for (const plant of gppd) {
  [plant.actualX, plant.actualY] = projection([plant.longitude, plant.latitude]);
  [plant.x, plant.y] = [plant.actualX, plant.actualY];

  // plant.forcedLocations will contain one force-directed location for each
  // log-zoom level. They are added in reverse order because the highest zoom
  // levels require the least movement, but we'll save them to file in the
  // correct order.
  plant.forcedLocations = [];
}

for (let logZoomLevel = dotConfig.maxLogZoom; logZoomLevel >= 0; logZoomLevel--) {
  forceLayoutPoints(gppd, projection, logZoomLevel);
}
const gppdSelectedFields = gppd.map(({
  country_long, name, capacity_mw, latitude, longitude, primary_fuel, forcedLocations
}) => ({
  country_long, name, capacity_mw, sqrt_capacity: Math.sqrt(capacity_mw),
  latitude, longitude, primary_fuel,
  forcedLocations: [...forcedLocations].reverse()
}));

fs.writeFileSync(outJsonFilename, JSON.stringify(gppdSelectedFields));

function forceLayoutPoints(gppd, projection, logZoomLevel) {
  // Note: this function modifies gppd. It moves the projected x and y coordinates,
  // and adds forcedLng_${logZoomLevel} and forcedLat_${logZoomLevel} fields.

  const zoomLevel = Math.pow(2, logZoomLevel / dotConfig.logZoomMultiplier);

  d3.forceSimulation(gppd)
    .force(
      "x",
      d3.forceX(d => d.actualX)
    )
    .force(
      "y",
      d3.forceY(d => d.actualY)
    )
    .force(
      "collide",
      d3.forceCollide()
        .radius((d) => Math.sqrt(d.capacity_mw) * dotConfig.baseRadius / Math.sqrt(zoomLevel))
        .iterations(5)
    ) // collide
    .stop()
    .tick(dotConfig.forceTickCount);

  for (const plant of gppd) {
    const location = projection.invert([plant.x, plant.y])
      .map(d => +d.toFixed(6));  // store fewer decimal places to reduce file size
    plant.forcedLocations.push(location);
  }
}
