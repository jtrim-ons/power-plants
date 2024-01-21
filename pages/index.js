import { useState } from "react";
import { Map } from "react-map-gl";
import { GppdMap } from "./GppdMap.jsx";
import { LegendBox } from "./LegendBox.jsx";

import "mapbox-gl/dist/mapbox-gl.css";

import gppd from './data/global_power_plant_database.json';
import fuelGroupMap from './data/fuel-group-map.json';

export default function Home() {
  // Summaries fuel type (e.g. "Fossil fuel", "Other", etc.)
  gppd.forEach(d => { d.fuel_group = fuelGroupMap[d.primary_fuel] });

  // avoid plotting large plants on top of small ones
  gppd.sort((a, b) => b.capacity_mw - a.capacity_mw);

  let [zoomLevel, setZoomLevel] = useState(0);
  const zoomCallback = zoom => { setZoomLevel(zoom) };

  return (
    <>
      <main style={{}}>
        <p>The zoom level is {zoomLevel}</p>
        <LegendBox zoomLevel={zoomLevel} />
        <GppdMap gppd={gppd} zoomCallback={zoomCallback}></GppdMap>
      </main>
    </>
  );
}
