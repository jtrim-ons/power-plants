export const PlantInfoBox = ({ plant }) => {
  return (
    <div className="plant-info-box">
      <h2>{plant.name}</h2>
      <hr></hr>
      <p>
        <strong>Fuel:</strong> {plant.primary_fuel}
      </p>
      <p>
        <strong>Capacity:</strong> {(+plant.capacity_mw).toLocaleString()} MW
      </p>
      <p>
        <strong>Country:</strong> {plant.country_long}
      </p>
    </div>
  );
};
