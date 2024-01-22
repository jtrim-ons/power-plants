import { useState } from "react";
import { Map } from "react-map-gl";
import { GppdMap } from "../components/GppdMap.jsx";
import { LegendBox } from "../components/LegendBox.jsx";
import { PlantInfoBox } from "../components/PlantInfoBox.jsx";

import { fuelGroupColours } from "./config.mjs";

import "mapbox-gl/dist/mapbox-gl.css";

import gppd from './data/global_power_plant_database.json';
import fuelGroupMap from './data/fuel-group-map.json';

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

export default function Home() {
  const [hoveredPlant, setHoveredPlant] = useState(null);
  let [zoomLevel, setZoomLevel] = useState(0);

  const zoomCallback = zoom => { setZoomLevel(zoom) };

  const [plantDisplayPositions, setPlantDisplayPositions] = useState(gppd.map(_ => [0, 0, -1]));

  const handleMouseMove = ev => {
    const mouseX = ev.pageX;
    const mouseY = ev.pageY;
    for (let i = 0; i < gppd.length; i++) {
      const [x, y, radius] = plantDisplayPositions[i];
      const dist = Math.hypot(x - mouseX, y - mouseY);
      if (dist < radius) {
        setHoveredPlant(gppd[i]);
        return;
      }
    }
    setHoveredPlant(null);
  };

  return (
    <div onMouseMove={(ev) => handleMouseMove(ev)}>
      <main style={{}}>
        <LegendBox zoomLevel={zoomLevel} />
        <GppdMap gppd={gppd} zoomCallback={zoomCallback}
          setPlantDisplayPositions={setPlantDisplayPositions}></GppdMap>
        {hoveredPlant && <PlantInfoBox plant={hoveredPlant}></PlantInfoBox>}
      </main>
    </div>
  );
}
