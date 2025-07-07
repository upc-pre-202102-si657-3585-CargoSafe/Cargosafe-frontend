/**
 * Servicio para gestionar funcionalidades relacionadas con Google Maps
 */

// Interfaces para las coordenadas y rutas
export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteInfo {
  distance: number; // en kilómetros
  duration: number; // en minutos
  polyline: string; // encoded polyline
}

// Tipos para Google Maps, definidos localmente
interface GoogleMapsLatLng {
  lat(): number;
  lng(): number;
}

interface GoogleMapsDistance {
  text: string;
  value: number;
}

interface GoogleMapsDuration {
  text: string;
  value: number;
}

interface GoogleMapsDirectionsLeg {
  distance: GoogleMapsDistance;
  duration: GoogleMapsDuration;
  steps: any[];
}

interface GoogleMapsPolyline {
  points: string;
}

interface GoogleMapsDirectionsRoute {
  legs: GoogleMapsDirectionsLeg[];
  overview_polyline: GoogleMapsPolyline;
}

interface GoogleMapsDirectionsResult {
  routes: GoogleMapsDirectionsRoute[];
}

interface GoogleMapsGeocoderResult {
  geometry: {
    location: GoogleMapsLatLng;
  };
}

// Declarar window.google como any para evitar errores de tipado
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
    googleMapsLoaded: boolean;
  }
}

// Bandera para evitar cargas múltiples
let isLoadingScript = false;
let scriptLoadPromise: Promise<void> | null = null;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;


/**
 * Carga el script de Google Maps de forma asíncrona
 * Con control para evitar cargas múltiples y reintentos
 */
export const loadGoogleMapsScript = (): Promise<void> => {
  // Si ya está cargado, devolver inmediatamente
  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    console.log("Google Maps ya está cargado, devolviendo Promise resuelta");
    return Promise.resolve();
  }

  // Si ya está cargando, devolver la promesa existente
  if (isLoadingScript && scriptLoadPromise) {
    console.log("Google Maps ya está cargando, devolviendo promesa existente");
    return scriptLoadPromise;
  }

  // Crear una nueva promesa de carga
  isLoadingScript = true;
  loadAttempts++;
  
  console.log(`Intentando cargar Google Maps (intento ${loadAttempts} de ${MAX_LOAD_ATTEMPTS})`);
  
  scriptLoadPromise = new Promise((resolve, reject) => {
    // Función para limpiar en caso de falla
    const cleanupOnFailure = (error: Error) => {
      isLoadingScript = false;
      scriptLoadPromise = null;
      
      // Si no se ha superado el máximo de intentos, reintentar
      if (loadAttempts < MAX_LOAD_ATTEMPTS) {
        console.log(`Reintentando cargar Google Maps (${loadAttempts + 1}/${MAX_LOAD_ATTEMPTS})`);
        setTimeout(() => {
          resolve(loadGoogleMapsScript());
        }, 1000); // Esperar 1 segundo antes de reintentar
      } else {
        console.error("Se alcanzó el número máximo de intentos de carga de Google Maps");
        reject(error);
      }
    };
    
    // Verificar si ya existe un script de Google Maps
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      // Si ya existe un script pero Google Maps no está definido, esperar a que se cargue
      if (typeof window.google === 'undefined' || typeof window.google.maps === 'undefined') {
        console.log("El script de Google Maps ya existe pero aún no se ha cargado completamente");
        
        // Definir la función de callback
        window.initGoogleMaps = () => {
          console.log("Google Maps cargado a través de callback de script existente");
          window.googleMapsLoaded = true;
          isLoadingScript = false;
          resolve();
        };
        return;
      }
      
      // Si Google Maps ya está definido, resolver inmediatamente
      console.log("El script de Google Maps ya existe y Google Maps está definido");
      window.googleMapsLoaded = true;
      isLoadingScript = false;
      resolve();
      return;
    }

    // Obtener la API key desde las variables de entorno
    let apiKey = process.env.NEXT_PUBLIC_API_GOOGLE;
    
    // Si no hay API key definida, usar la predeterminada
    if (!apiKey) {
      console.warn('API_GOOGLE no está definida en el archivo .env, usando clave alternativa');
      apiKey = process.env.NEXT_PUBLIC_API_GOOGLE
    }

    // Definir la función de callback
    window.initGoogleMaps = () => {
      console.log("Google Maps cargado correctamente a través de callback");
      window.googleMapsLoaded = true;
      isLoadingScript = false;
      resolve();
    };

    // Crear el script y agregarlo al documento
    try {
      const script = document.createElement('script');
      const GOOGLE_MAPS_JS_API_BASE_URL = "https://maps.googleapis.com/maps/api/js";
      script.src = `${GOOGLE_MAPS_JS_API_BASE_URL}?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps&loading=async`;
      script.async = true;
      script.defer = true;

      // Manejar errores
      script.onerror = (event) => {
        console.error("Error al cargar el script de Google Maps:", event);
        cleanupOnFailure(new Error('Error al cargar Google Maps API'));
      };

      // Establecer un timeout para detectar problemas de carga
      const timeout = setTimeout(() => {
        if (!window.google || !window.google.maps) {
          console.error("Tiempo de espera agotado para cargar Google Maps");
          cleanupOnFailure(new Error('Tiempo de espera agotado para cargar Google Maps'));
        }
      }, 10000); // 10 segundos de timeout

      // Limpiar el timeout cuando se carga correctamente
      window.initGoogleMaps = () => {
        clearTimeout(timeout);
        console.log("Google Maps cargado correctamente a través de callback");
        window.googleMapsLoaded = true;
        isLoadingScript = false;
        resolve();
      };

      document.head.appendChild(script);
      console.log("Script de Google Maps agregado al documento");
    } catch (error) {
      console.error("Error al agregar el script de Google Maps al documento:", error);
      cleanupOnFailure(new Error(`Error al agregar script: ${error}`));
    }
  });

  return scriptLoadPromise;
};

/**
 * Calcula la ruta entre dos puntos utilizando Google Maps Directions API
 */
export const calculateRoute = async (origin: LatLng, destination: LatLng): Promise<RouteInfo> => {
  // Asegurarse de que Google Maps está cargado
  if (!window.google || !window.google.maps) {
    try {
      await loadGoogleMapsScript();
    } catch (error) {
      console.error("No se pudo cargar Google Maps para calcular la ruta:", error);
      
      // Devolver una estimación aproximada en lugar de fallar
      const distance = Math.sqrt(
        Math.pow((destination.lat - origin.lat) * 111, 2) + 
        Math.pow((destination.lng - origin.lng) * 111 * Math.cos(origin.lat * Math.PI / 180), 2)
      );
      
      return {
        distance: distance * 1.3, // Factor de ruta aproximado
        duration: distance * 1.3 / 50 * 60, // Estimación de tiempo (50 km/h)
        polyline: ""
      };
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: GoogleMapsDirectionsResult, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            const route = result.routes[0];
            const leg = route.legs[0];
            
            // Extraer la información de la ruta
            const routeInfo: RouteInfo = {
              distance: leg.distance ? leg.distance.value / 1000 : 0, // Convertir a km
              duration: leg.duration ? leg.duration.value / 60 : 0,  // Convertir a minutos
              polyline: route.overview_polyline.points
            };
            
            resolve(routeInfo);
          } else {
            console.error("Error en DirectionsService:", status);
            
            // Calcular distancia aproximada en línea recta como fallback
            const distance = Math.sqrt(
              Math.pow((destination.lat - origin.lat) * 111, 2) + 
              Math.pow((destination.lng - origin.lng) * 111 * Math.cos(origin.lat * Math.PI / 180), 2)
            );
            
            resolve({
              distance: distance * 1.3, // Factor de ruta aproximado
              duration: distance * 1.3 / 50 * 60, // Estimación de tiempo (50 km/h)
              polyline: ""
            });
          }
        }
      );
    } catch (error) {
      console.error("Error al calcular la ruta:", error);
      
      // Calcular distancia aproximada en línea recta como fallback
      const distance = Math.sqrt(
        Math.pow((destination.lat - origin.lat) * 111, 2) + 
        Math.pow((destination.lng - origin.lng) * 111 * Math.cos(origin.lat * Math.PI / 180), 2)
      );
      
      resolve({
        distance: distance * 1.3, // Factor de ruta aproximado
        duration: distance * 1.3 / 50 * 60, // Estimación de tiempo (50 km/h)
        polyline: ""
      });
    }
  });
};

/**
 * Obtener las coordenadas de una dirección utilizando geocoding
 */
export const geocodeAddress = async (address: string): Promise<LatLng> => {
  // Valores predeterminados para Lima, Perú en caso de fallo
  const DEFAULT_LOCATION: LatLng = { lat: -12.0464, lng: -77.0428 };
  
  try {
    // Asegurarse de que Google Maps está cargado
    if (!window.google || !window.google.maps) {
      await loadGoogleMapsScript();
    }
    
    // Verificar nuevamente si se pudo cargar Google Maps
    if (!window.google || !window.google.maps) {
      console.error("No se pudo cargar Google Maps para geocodificación");
      return DEFAULT_LOCATION;
    }

    return new Promise((resolve, reject) => {
      try {
        const geocoder = new window.google.maps.Geocoder();
        
        geocoder.geocode(
          { address }, 
          (results: GoogleMapsGeocoderResult[], status: any) => {
            if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
              const location = results[0].geometry.location;
              resolve({
                lat: location.lat(),
                lng: location.lng()
              });
            } else {
              console.error(`Error en geocoding: ${status}`);
              resolve(DEFAULT_LOCATION);
            }
          }
        );
      } catch (error) {
        console.error("Error al crear geocoder:", error);
        resolve(DEFAULT_LOCATION);
      }
    });
  } catch (error) {
    console.error("Error en geocodeAddress:", error);
    return DEFAULT_LOCATION;
  }
};
