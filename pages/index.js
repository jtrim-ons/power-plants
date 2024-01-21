import { useState } from "react";
import { Map } from "react-map-gl";
import { GppdMap } from "./GppdMap.jsx";
import { LegendBox } from "./LegendBox.jsx";

import { fuelGroupColours } from "./config.js";

import "mapbox-gl/dist/mapbox-gl.css";

import gppd from './data/global_power_plant_database.json';
import fuelGroupMap from './data/fuel-group-map.json';

export default function Home() {
  const fuelGroupToColourMap = Object.fromEntries(
    fuelGroupColours.map(({ group, colour }) => [group, colour])
  );

  for (const plant of gppd) {
    // Summarise fuel type (e.g. "Coal", "Other", etc.)
    plant.fuel_group = fuelGroupMap[plant.primary_fuel];
    plant.colour = fuelGroupToColourMap[plant.fuel_group];
  }

  // avoid plotting large plants on top of small ones
  gppd.sort((a, b) => b.capacity_mw - a.capacity_mw);

  let [zoomLevel, setZoomLevel] = useState(0);
  const zoomCallback = zoom => { setZoomLevel(zoom) };

  return (
    <>
      <main style={{}}>
        <LegendBox zoomLevel={zoomLevel} />
        <GppdMap gppd={gppd} zoomCallback={zoomCallback}></GppdMap>
      </main>
    </>
  );
}
