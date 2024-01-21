import { fuelGroupToColour } from "./config.js";
import { Fragment } from "react";

export const LegendBox = ({ zoomLevel }) => {
  return (
    <div className="legend-box">
      <div className="colour-legend-grid">
        {fuelGroupToColour.map(({ group, colour }) => (
          <Fragment key={group}>
            <div className="legend-swatch" style={{ "--colour": colour }}></div>
            <div>{group}</div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
