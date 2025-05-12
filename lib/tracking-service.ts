/**
 * Servicio para la simulación de seguimiento de vehículos en tiempo real
 */

import { LatLng } from "./map-service";

// Interfaz para los datos de ubicación de vehículos
export interface VehicleLocation extends LatLng {
  id: string;
  label: string;
  lastUpdated: Date;
}

// Lista de vehículos simulados para demostración
const demoVehicles: VehicleLocation[] = [
  {
    id: "V001",
    label: "Camión 001",
    lat: -12.0545,
    lng: -77.0444,
    lastUpdated: new Date()
  },
  {
    id: "V002",
    label: "Camión 002",
    lat: -12.0464, 
    lng: -77.0428,
    lastUpdated: new Date()
  },
  {
    id: "V003",
    label: "Furgoneta 001",
    lat: -12.0489,
    lng: -77.0529,
    lastUpdated: new Date()
  }
];

// Variable para almacenar los datos simulados
let simulatedVehicles: VehicleLocation[] = [...demoVehicles];

// Función para simular pequeños movimientos aleatorios
const simulateMovement = (location: LatLng): LatLng => {
  // Simular un movimiento aleatorio de hasta 0.002 grados (aproximadamente 200m)
  const latDelta = (Math.random() - 0.5) * 0.001;
  const lngDelta = (Math.random() - 0.5) * 0.001;
  
  return {
    lat: location.lat + latDelta,
    lng: location.lng + lngDelta
  };
};

/**
 * Obtener ubicaciones de vehículos simuladas
 * @param companyId ID de la empresa (opcional, para filtrar vehículos)
 * @returns Lista de ubicaciones de vehículos
 */
export const getVehicleLocations = async (companyId?: string): Promise<VehicleLocation[]> => {
  // Simular un retardo de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Actualizar las ubicaciones simuladas
  simulatedVehicles = simulatedVehicles.map(vehicle => {
    const newPosition = simulateMovement(vehicle);
    return {
      ...vehicle,
      lat: newPosition.lat,
      lng: newPosition.lng,
      lastUpdated: new Date()
    };
  });
  
  return simulatedVehicles;
};

/**
 * Obtener la ubicación de un vehículo específico
 * @param vehicleId ID del vehículo
 * @returns Datos de ubicación del vehículo o null si no se encuentra
 */
export const getVehicleLocation = async (vehicleId: string): Promise<VehicleLocation | null> => {
  // Simular un retardo de red
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const vehicle = simulatedVehicles.find(v => v.id === vehicleId);
  
  if (!vehicle) return null;
  
  // Actualizar la posición del vehículo
  const newPosition = simulateMovement(vehicle);
  const updatedVehicle = {
    ...vehicle,
    lat: newPosition.lat,
    lng: newPosition.lng,
    lastUpdated: new Date()
  };
  
  // Actualizar en la lista simulada
  simulatedVehicles = simulatedVehicles.map(v => 
    v.id === vehicleId ? updatedVehicle : v
  );
  
  return updatedVehicle;
};

/**
 * Agregar un nuevo vehículo para seguimiento (simulado)
 */
export const addVehicle = async (vehicle: Omit<VehicleLocation, 'lastUpdated'>): Promise<VehicleLocation> => {
  // Simular un retardo de red
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const newVehicle: VehicleLocation = {
    ...vehicle,
    lastUpdated: new Date()
  };
  
  simulatedVehicles.push(newVehicle);
  
  return newVehicle;
};

/**
 * Eliminar un vehículo de seguimiento (simulado)
 */
export const removeVehicle = async (vehicleId: string): Promise<boolean> => {
  // Simular un retardo de red
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const initialLength = simulatedVehicles.length;
  simulatedVehicles = simulatedVehicles.filter(v => v.id !== vehicleId);
  
  return simulatedVehicles.length < initialLength;
};

/**
 * Reiniciar a los vehículos simulados por defecto
 */
export const resetVehicles = (): void => {
  simulatedVehicles = [...demoVehicles];
}; 