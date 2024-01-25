import { useState } from "react";
import { Map } from "react-map-gl";
import { GppdMap } from "../components/GppdMap.jsx";
import { LegendBox } from "../components/LegendBox.jsx";
import { PlantInfoBox } from "../components/PlantInfoBox.jsx";

import { fuelGroupColours } from "./config.mjs";

import gppd from './data/global_power_plant_database.json';

const fuelGroupToColourMap = Object.fromEntries(
  fuelGroupColours.map(({ group, colour }) => [group, colour])
);

for (const datasetName of ['plants', 'countries']) {
  for (const dataPoint of gppd[datasetName]) {
    dataPoint.colour = fuelGroupToColourMap[dataPoint.fuel_group];
    dataPoint.isCountryDot = datasetName === 'countries';
  }

  // avoid plotting large plants on top of small ones
  gppd[datasetName].sort((a, b) => b.capacity_mw - a.capacity_mw);
}

const allDots = [...gppd['countries'], ...gppd['plants']];

export default function Home() {
  const [hoveredPlant, setHoveredPlant] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [showCountryDots, setShowCountryDots] = useState(false);

  const [plantDisplayPositions, setPlantDisplayPositions] = useState(allDots.map(_ => [0, 0, -1]));

  const handleMouseMove = ev => {
    const mouseX = ev.pageX;
    const mouseY = ev.pageY;
    for (let i = 0; i < allDots.length; i++) {
      const [x, y, radius] = plantDisplayPositions[i];
      const dist = Math.hypot(x - mouseX, y - mouseY);
      if (dist < radius) {
        setHoveredPlant(allDots[i]);
        return;
      }
    }
    setHoveredPlant(null);
  };

  return (
    <div onMouseMove={(ev) => handleMouseMove(ev)}>
      <main style={{}}>
        <LegendBox zoomLevel={zoomLevel} setShowCountryDots={setShowCountryDots} />
        <GppdMap gppd={allDots} showCountryDots={showCountryDots} zoomCallback={setZoomLevel}
          setPlantDisplayPositions={setPlantDisplayPositions}></GppdMap>
        {hoveredPlant && <PlantInfoBox plant={hoveredPlant}></PlantInfoBox>}
      </main>
    </div>
  );
}
