import * as fs from 'fs';
import * as d3 from 'd3';
import { log } from 'console';

const gppdPath = './global_power_plant_database_v_1_3/global_power_plant_database.csv';
const countriesPath = './pages/data/ne_50m_admin_0_countries.json';

const projection = d3.geoEqualEarth();

let gppd = d3.csvParse(fs.readFileSync(gppdPath, 'utf8'));
let countries = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));   // GeoJSON

for (const plant of gppd) {
  [plant.actualX, plant.actualY] = projection([plant.longitude, plant.latitude]);
  [plant.x, plant.y] = [plant.actualX, plant.actualY];

  // plant.forcedLocations will contain one force-directed location for each
  // log-zoom level. They are added in reverse order because the highest zoom
  // levels require the least movement, but we'll save them to file in the
  // correct order.
  plant.forcedLocations = [];
}

for (let logZoomLevel = 10; logZoomLevel >= 0; logZoomLevel--) {
  forceLayoutPoints(gppd, projection, logZoomLevel);
}
//const reshapedCountries = reshapeCountries(countries, gppd, projection);

const gppdSelectedFields = gppd.map(({
  country_long, name, capacity_mw, latitude, longitude, primary_fuel, forcedLocations
}) => ({
  country_long, name, capacity_mw, sqrt_capacity: Math.sqrt(capacity_mw),
  latitude, longitude, primary_fuel,
  forcedLocations: [...forcedLocations].reverse()
}));

fs.writeFileSync('./pages/data/global_power_plant_database.json', JSON.stringify(gppdSelectedFields));
//fs.writeFileSync('./pages/data/reshaped-countries.json', JSON.stringify(reshapedCountries));

function forceLayoutPoints(gppd, projection, logZoomLevel) {
  // Note: this function modifies gppd. It moves the projected x and y coordinates,
  // and adds forcedLng_${logZoomLevel} and forcedLat_${logZoomLevel} fields.

  const zoomLevel = Math.pow(2, logZoomLevel / 2);

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
      d3.forceCollide().radius((d) => Math.sqrt(d.capacity_mw) * 0.06 / Math.sqrt(zoomLevel) + 0.01)
    ) // collide
    .stop()
    .tick(2);

  for (const plant of gppd) {
    const location = projection.invert([plant.x, plant.y])
      .map(d => +d.toFixed(6));  // store fewer decimal places to reduce file size
    plant.forcedLocations.push(location);
  }
}

function reshapeCountries(countries, gppd, projection) {
  const reshapedCountries = JSON.parse(JSON.stringify(countries));

  const gppdPointsQuadtree = d3.quadtree(
    gppd,
    (d) => d.actualX,
    (d) => d.actualY
  );

  function movePoint(p) {
    // Modify the point's position, in place.
    const [x, y] = projection(p);
    const nearestPlant = gppdPointsQuadtree.find(x, y);
    const xMove = nearestPlant.x - nearestPlant.actualX;
    const yMove = nearestPlant.y - nearestPlant.actualY;
    const xDist = x - nearestPlant.x;
    const yDist = y - nearestPlant.y;
    const dist = Math.hypot(xDist, yDist);

    // moveFactor is:
    //   1 if the point has the same location as its nearest plant,
    //   0 if it's at least 10 units away,
    //   a value between 0 and 1 otherwise.
    const moveFactor = Math.max(1 - dist / 10, 0);

    // Move the point in the same direction as its nearest plant,
    // but only if the nearest plant is quite nearby.
    [p[0], p[1]] = projection.invert([
      x + xMove * moveFactor,
      y + yMove * moveFactor
    ]);
  }

  function movePolygon(polygon) {
    // Modify the position of all of the polygon's points, in place.
    for (const ring of polygon) {
      for (const point of ring) {
        movePoint(point);
      }
    }
  }

  for (const feature of reshapedCountries.features) {
    const g = feature.geometry;
    if (g.type === "Polygon") {
      movePolygon(g.coordinates);
    } else if (g.type === "MultiPolygon") {
      for (const polygon of g.coordinates) {
        movePolygon(polygon);
      }
    }
  }

  return reshapedCountries;
}