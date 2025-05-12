import React from "react";

interface VehicleHeaderProps {
  totalVehicles: number;
  children?: React.ReactNode;
}


const VehicleHeader: React.FC<VehicleHeaderProps> = ({ totalVehicles, children }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Vehículos</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona la flota de vehículos para transporte de carga
        </p>
      </div>
      {children}
    </div>
  );
};

export default VehicleHeader; 