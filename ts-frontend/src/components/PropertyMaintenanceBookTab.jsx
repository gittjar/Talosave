import React from 'react';
import Huoltokirja from './Huoltokirja.jsx';

const PropertyMaintenanceBookTab = ({ propertyId }) => {
  return (
    <div>
      <Huoltokirja propertyId={propertyId} />
    </div>
  );
};

export default PropertyMaintenanceBookTab;
