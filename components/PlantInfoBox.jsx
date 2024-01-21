export const PlantInfoBox = ({ plant }) => {
  return (
    <div className="plant-info-box">
      <h2>{plant.name}</h2>
      <hr></hr>
      <div className="info-grid">
        <div>
          <strong>Fuel:</strong>
        </div>
        <div>{plant.primary_fuel}</div>
        <div>
          <strong>Capacity:</strong>
        </div>
        <div>{(+plant.capacity_mw).toLocaleString()} MW</div>
        <div>
          <strong>Country:</strong>
        </div>
        <div>{plant.country_long}</div>
      </div>
    </div>
  );
};
