import { fuelGroupColours, capacitiesForLegend } from "./config.mjs";
import { Fragment, useEffect, useRef } from "react";

export const LegendBox = ({ zoomLevel }) => {
  return (
    <div className="legend-box">
      <h1>The World&apos;s Power Plants</h1>
      <hr></hr>
      <div className="colour-legend-columns">
        <ColourLegendColumn
          items={fuelGroupColours.slice(0, 4)}
        ></ColourLegendColumn>
        <ColourLegendColumn
          items={fuelGroupColours.slice(4)}
        ></ColourLegendColumn>
      </div>
      <div className="size-legend-grid">
        {capacitiesForLegend.map((capacity) => (
          <Fragment key={capacity}>
            <SizeKeyCanvas
              capacity={capacity}
              zoomLevel={zoomLevel}
            ></SizeKeyCanvas>
            <div>{mwToString(capacity)}</div>
          </Fragment>
        ))}
      </div>
      <p>
        Plants are shown as close as possible to their location while avoiding
        overlaps.
      </p>
      <div className="source-text">
        Source:{" "}
        <a href="https://datasets.wri.org/dataset/globalpowerplantdatabase">
          Global Power Plant Database
        </a>
        . Note that the database has less than 50% coverage for wind and solar.
      </div>
    </div>
  );
};

const mwToString = (capacity) => {
  if (capacity < 1000) return `${capacity} MW`;
  return `${capacity / 1000} GW`;
};

const SizeKeyCanvas = ({ capacity, zoomLevel }) => {
  const canvasRef = useRef(null);

  const radius = Math.sqrt(capacity) * zoomLevel.radiusMultiplier;

  const width = 25,
    height = width;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, width, height);
    context.beginPath();
    context.fillStyle = "#fff";
    const position = Math.max(radius, width / 2);
    context.arc(position, position, radius, 0, 2 * Math.PI);
    context.fill();
  }, [capacity, zoomLevel, height, radius]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

const ColourLegendColumn = ({ items }) => {
  return (
    <div className="colour-legend-grid">
      {items.map(({ group, colour }) => (
        <Fragment key={group}>
          <div className="legend-swatch" style={{ "--colour": colour }}></div>
          <div>{group}</div>
        </Fragment>
      ))}
    </div>
  );
};
