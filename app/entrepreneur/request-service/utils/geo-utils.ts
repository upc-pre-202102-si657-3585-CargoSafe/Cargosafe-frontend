import { LatLng, loadGoogleMapsScript } from "@/lib/map-service";

/**
 * Calcula la distancia aproximada entre dos puntos en línea recta
 * y aplica un factor de ruta para aproximar la distancia real
 */
export const calculateRouteDistance = (origin: LatLng, destination: LatLng): number => {
  // Calcular distancia en línea recta (km)
  const R = 6371; // Radio de la Tierra en km
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLon = (destination.lng - origin.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Factor de ruta (las rutas reales son más largas que la línea recta)
  const routeFactor = 1.3;
  return Math.round(distance * routeFactor * 10) / 10;
};

export interface LocationDetails {
  coords: LatLng;
  country: string;
  department: string;
  district: string;
}

// Valores predeterminados de ubicación para Lima, Perú
export const DEFAULT_ORIGIN_LOCATION: LocationDetails = {
  coords: {
    lat: -12.0464,
    lng: -77.0428
  },
  country: "Perú",
  department: "Lima",
  district: "Lima"
};

export const DEFAULT_DESTINATION_LOCATION: LocationDetails = {
  coords: {
    lat: -12.1219,
    lng: -77.0305
  },
  country: "Perú",
  department: "Lima",
  district: "Miraflores"
};

/**
 * Extrae información de ubicación a partir de resultados de geocodificación
 */
export const extractLocationDetails = (geocoderResults: any): LocationDetails | null => {
  if (!geocoderResults || !geocoderResults.length) return null;
  
  try {
    const result = geocoderResults[0];
    const coords = {
      lat: result.geometry.location.lat(),
      lng: result.geometry.location.lng()
    };
    
    // Extraer detalles de dirección
    let country = "Perú"; // Valor por defecto
    let department = "Lima"; // Valor por defecto
    let district = ""; // Valor por defecto
    
    // Extraer componentes de la dirección
    if (result.address_components) {
      for (const component of result.address_components) {
        if (component.types.includes("country")) {
          country = component.long_name;
        }
        
        if (component.types.includes("administrative_area_level_1")) {
          department = component.long_name;
        }
        
        if (component.types.includes("administrative_area_level_2") || 
            component.types.includes("locality") ||
            component.types.includes("sublocality_level_1")) {
          district = component.long_name;
        }
      }
    }
    
    return {
      coords,
      country,
      department,
      district
    };
  } catch (error) {
    console.error("Error al extraer detalles de ubicación:", error);
    return null;
  }
};

/**
 * Geocodifica las direcciones de origen y destino
 */
export const geocodeLocations = async (
  pickupAddress: string, 
  destinationAddress: string
): Promise<{
  origin: LocationDetails | null;
  destination: LocationDetails | null;
}> => {
  let origin: LocationDetails | null = null;
  let destination: LocationDetails | null = null;

  try {
    // Cargar Google Maps primero
    await loadGoogleMapsScript();
    
    if (pickupAddress.length > 5) {
      try {
        const pickupResult = await geocodeAddressWithDetails(pickupAddress + ", Perú");
        origin = pickupResult;
      } catch (error) {
        console.error("Error geocodificando dirección de origen:", error);
        origin = DEFAULT_ORIGIN_LOCATION;
      }
    } else {
      origin = DEFAULT_ORIGIN_LOCATION;
    }
  } catch (error) {
    console.error("Error al cargar Google Maps:", error);
    origin = DEFAULT_ORIGIN_LOCATION;
  }
  
  try {
    if (destinationAddress.length > 5) {
      try {
        const destinationResult = await geocodeAddressWithDetails(destinationAddress + ", Perú");
        destination = destinationResult;
      } catch (error) {
        console.error("Error geocodificando dirección de destino:", error);
        destination = DEFAULT_DESTINATION_LOCATION;
      }
    } else {
      destination = DEFAULT_DESTINATION_LOCATION;
    }
  } catch (error) {
    console.error("Error geocodificando dirección de destino:", error);
    destination = DEFAULT_DESTINATION_LOCATION;
  }

  return {
    origin,
    destination
  };
};

/**
 * Versión de geocodeAddress que devuelve información detallada de la ubicación
 */
export const geocodeAddressWithDetails = async (address: string): Promise<LocationDetails | null> => {
  try {
    // Asegurarse de que Google Maps está cargado
    if (typeof window === 'undefined') {
      throw new Error("Entorno del servidor no soportado para geocodificación");
    }
    
    // Intentar cargar Google Maps si no está disponible
    if (!window.google || !window.google.maps) {
      await loadGoogleMapsScript();
    }
    
    // Verificar nuevamente si Google Maps se cargó correctamente
    if (!window.google || !window.google.maps) {
      throw new Error("No se pudo cargar Google Maps");
    }
    
    return new Promise((resolve, reject) => {
      try {
        const geocoder = new window.google.maps.Geocoder();
        
        geocoder.geocode({ address }, (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const locationDetails = extractLocationDetails(results);
            resolve(locationDetails);
          } else {
            reject(new Error(`Error en geocoding: ${status}`));
          }
        });
      } catch (error) {
        reject(new Error(`Error al crear geocoder: ${error}`));
      }
    });
  } catch (error) {
    console.error("Error en geocodeAddressWithDetails:", error);
    throw error;
  }
}; 