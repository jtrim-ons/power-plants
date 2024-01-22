// This script reads the GPPD CSV, calculates dot positions for various zoom levels
// using force layout, and saves only the required fields to a JSON file. 

import * as fs from 'fs';
import * as d3 from 'd3';
import { fuelGroupMap, dotConfig } from "../pages/config.mjs";
import aq from 'arquero';
const { op } = aq;

const gppdPath = './global_power_plant_database_v_1_3/global_power_plant_database.csv';
const outJsonFilename = './pages/data/global_power_plant_database.json';

const projection = d3.geoEqualEarth().scale(220);

let gppd = d3.csvParse(fs.readFileSync(gppdPath, 'utf8'));
for (const plant of gppd) {
  plant.fuel_group = fuelGroupMap[plant.primary_fuel];
}

let gppdCountries = aq.from(gppd)
  .groupby('country_long')
  .derive({
    latitude: d => op.mean(d.latitude),
    longitude: d => op.mean(d.longitude),
  })
  .groupby('country_long', 'fuel_group')
  .rollup({
    capacity_mw: d => op.sum(d.capacity_mw),
    latitude: d => op.mean(d.latitude),  // all lat, lng per country should already be equal
    longitude: d => op.mean(d.longitude),
  })
  .derive({
    name: d => `${d.country_long}, ${d.fuel_group}`,
    primary_fuel: d => d.fuel_group
  })
  .objects();

fs.writeFileSync(outJsonFilename, JSON.stringify({
  plants: processGppd(gppd, false),
  countries: processGppd(gppdCountries, true)
}));

function processGppd(gppd, packTightly) {
  gppd = JSON.parse(JSON.stringify(gppd));   //avoid mutating the data
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

  // remove unused fields from plant objects
  return gppd.map(({
    country_long, name, capacity_mw, primary_fuel, fuel_group, forcedLocations
  }) => ({
    country_long, name, capacity_mw, sqrt_capacity: Math.sqrt(capacity_mw),
    primary_fuel, fuel_group, forcedLocations: [...forcedLocations].reverse()
  }));
}

function forceLayoutPoints(gppd, projection, logZoomLevel) {
  // Note: this function modifies gppd. It moves the projected x and y coordinates,
  // and adds forcedLng_${logZoomLevel} and forcedLat_${logZoomLevel} fields.

  const zoomLevel = Math.pow(2, logZoomLevel / dotConfig.logZoomMultiplier);
  const padding = packTightly ? 1 : dotConfig.layoutPadding;

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
        .radius((d) => Math.sqrt(d.capacity_mw) * dotConfig.baseRadius / Math.sqrt(zoomLevel) * padding)
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
