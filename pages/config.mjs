export const fuelGroupMap = ({
  "Coal": "Coal",
  "Gas": "Other fossil",
  "Hydro": "Hydro",
  "Nuclear": "Nuclear",
  "Wind": "Wind",
  "Oil": "Other fossil",
  "Solar": "Solar",
  "Biomass": "Other",
  "Waste": "Other",
  "Geothermal": "Other",
  "Cogeneration": "Other",
  "Other": "Other",
  "Petcoke": "Other fossil",
  "Storage": "Other",
  "Wave and Tidal": "Other"
});

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

//export const dotConfig = {
//  baseRadius: 0.055,
//  logZoomMultiplier: 3,
//  maxZoom: 80,
//  maxLogZoom: 19,
//  forceTickCount: 100
//};
export const dotConfig = {
  baseRadius: 0.055,
  logZoomMultiplier: 1,
  maxZoom: 20,
  maxLogZoom: 3,
  forceTickCount: 3,
  layoutPadding: 1.1
};
