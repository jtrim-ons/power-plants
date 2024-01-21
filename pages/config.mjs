export const fuelGroupColours = ([
  { group: "Coal", colour: "#888" },
  { group: "Other fossil", colour: "#f0f0f0" },
  { group: "Nuclear", colour: "#a774d5" /*"#9467bd"*/ },
  { group: "Hydro", colour: "#1f77b4" },
  { group: "Wind", colour: "#2ca02c" },
  { group: "Solar", colour: "#ff7f0e" },
  { group: "Other", colour: "#f4da00" }
]);

export const capacitiesForLegend = [
  10,
  100,
  1000,
  10000
];

export const dotConfig = {
  baseRadius: 0.06,
  logZoomMultiplier: 3,
  maxZoom: 20,
  maxLogZoom: 13,
  forceTickCount: 5
};