import { Map } from "react-map-gl";

import "mapbox-gl/dist/mapbox-gl.css";

import gppd from './data/global_power_plant_database.json';

// This token will expire soon after the test is completed and reviewed
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiZWxlY3RyaWNqdWljZSIsImEiOiJjbG9yNTdld2cwcTVsMnhwZWhxc3dpcXQ1In0.Ho-nI24QrecF76N4jAr0cA";

export default function Home() {
  return (
    <>
      <main style={{ height: 300 }}>
        <Map
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          projection="mercator"
          mapStyle="mapbox://styles/mapbox/dark-v11"
          initialViewState={{
            longitude: 0,
            latitude: 0,
            zoom: 1,
          }}
        />
        {/* <GppdMap gppd={gppd}></GppdMap> */}
      </main>
    </>
  );
}
