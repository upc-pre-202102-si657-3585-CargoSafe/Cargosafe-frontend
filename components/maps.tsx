"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { loadGoogleMapsScript, calculateRoute, LatLng, RouteInfo } from "@/lib/map-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Navigation, Info } from "lucide-react";

// Declarar window.google como any para evitar errores de tipado
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
    googleMapsLoaded: boolean;
  }
}

interface MapsProps {
  originCoords: LatLng;
  destinationCoords: LatLng;
  originName?: string;
  destinationName?: string;
  showRoute?: boolean;
  height?: string;
  className?: string;
}

/**
 * Componente de Google Maps para mostrar ubicaciones y rutas
 */
const Maps: React.FC<MapsProps> = ({
  originCoords,
  destinationCoords,
  originName = "Origen",
  destinationName = "Destino",
  showRoute = true,
  height = "400px",
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Referencias para los marcadores y el renderizador de rutas
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  
  // ID único para este componente de mapa
  const mapId = useMemo(() => `map-${Math.random().toString(36).substr(2, 9)}`, []);
  
  // Limpiar marcadores y rutas
  const clearMap = () => {
    try {
      // Primero limpiar el renderer de direcciones
      if (directionsRendererRef.current) {
        try {
          directionsRendererRef.current.setMap(null);
        } catch (e) {
          console.warn("Error al limpiar directionsRenderer:", e);
        }
        directionsRendererRef.current = null;
      }

      // Después limpiar marcadores
      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          if (marker) {
            try {
              // Los marcadores AdvancedMarkerElement usan .map = null
              // mientras que los marcadores Marker usan .setMap(null)
              if (typeof marker.setMap === 'function') {
                marker.setMap(null);
              } else {
                // Para AdvancedMarkerElement
                marker.map = null;
              }
            } catch (e) {
              // Ignorar errores al limpiar marcadores individuales
              console.warn("Error al limpiar marcador individual:", e);
            }
          }
        });
        markersRef.current = [];
      }
    } catch (err) {
      console.error("Error al limpiar el mapa:", err);
    }
  };

  // Cargar el script de Google Maps y inicializar el mapa
  useEffect(() => {
    let isMounted = true;
    let mapObjectInstance: any = null;
    
    const initMap = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        
        // Cargar el script de Google Maps
        try {
          await loadGoogleMapsScript();
        } catch (err) {
          console.error("Error al cargar Google Maps:", err);
          if (isMounted) {
            setError("No se pudo cargar Google Maps. Por favor, intenta de nuevo más tarde.");
            setLoading(false);
          }
          return;
        }
        
        if (!mapRef.current || !isMounted) return;
        
        // Verificar que Google Maps esté disponible
        if (!window.google || !window.google.maps) {
          console.error("Google Maps no está disponible después de cargar");
          if (isMounted) {
            setError("No se pudo inicializar Google Maps. Por favor, intenta de nuevo más tarde.");
            setLoading(false);
          }
          return;
        }
        
        // Crear el mapa
        const mapOptions = {
          center: originCoords,
          zoom: 12,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        };
        
        try {
          mapObjectInstance = new window.google.maps.Map(mapRef.current, mapOptions);
          
          if (isMounted) {
            setMapInstance(mapObjectInstance);
            setLoading(false);
          }
        } catch (err) {
          console.error("Error al crear instancia del mapa:", err);
          if (isMounted) {
            setError("No se pudo inicializar el mapa. Por favor, intenta de nuevo más tarde.");
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error al inicializar el mapa:", err);
        if (isMounted) {
          setError("No se pudo cargar el mapa. Por favor, intenta de nuevo más tarde.");
          setLoading(false);
        }
      }
    };

    initMap();
    
    // Limpieza al desmontar
    return () => {
      isMounted = false;
      clearMap();
      
      // Asegurarnos de que el mapa se desconecte completamente
      if (mapObjectInstance) {
        try {
          // Eliminar explícitamente listeners que podrían estar asociados al mapa
          if (window.google && window.google.maps && window.google.maps.event) {
            window.google.maps.event.clearInstanceListeners(mapObjectInstance);
          }
        } catch (e) {
          console.warn("Error al limpiar listeners del mapa:", e);
        }
      }
      
      setMapInstance(null);
    };
  }, []);

  // Dibujar marcadores y ruta en el mapa cuando cambian las coordenadas
  useEffect(() => {
    if (!mapInstance) return;
    
    let isMounted = true;
    
    const updateMap = async () => {
      try {
        // Limpiar marcadores y rutas anteriores
        clearMap();
  
        // Centrar mapa
        mapInstance.setCenter(originCoords);
  
        // Crear marcadores
        let originMarker, destinationMarker;

        // Intentar usar siempre AdvancedMarkerElement, incluso con try-catch para compatibilidad
        try {
          // Verificar si la versión avanzada está disponible
          if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
            // Usar el nuevo AdvancedMarkerElement
            originMarker = new window.google.maps.marker.AdvancedMarkerElement({
              position: originCoords,
              map: mapInstance,
              title: originName,
            });

            destinationMarker = new window.google.maps.marker.AdvancedMarkerElement({
              position: destinationCoords,
              map: mapInstance,
              title: destinationName,
            });
          } else {
            throw new Error("AdvancedMarkerElement no disponible");
          }
        } catch (e) {
          // Fallback al marcador tradicional solo si es necesario
          console.warn("Fallback a marcadores tradicionales:", e);
          originMarker = new window.google.maps.Marker({
            position: originCoords,
            map: mapInstance,
            title: originName,
          });

          destinationMarker = new window.google.maps.Marker({
            position: destinationCoords,
            map: mapInstance,
            title: destinationName,
          });
        }
        
        // Guardar referencias a los marcadores
        if (isMounted) {
          markersRef.current = [originMarker, destinationMarker];
        }
  
        // Ajustar la vista para que se vean ambos marcadores
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(originCoords);
        bounds.extend(destinationCoords);
        mapInstance.fitBounds(bounds);
  
        // Dibujar la ruta si es necesario
        if (showRoute && isMounted) {
          try {
            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer({
              map: mapInstance,
              suppressMarkers: true, // Para usar nuestros propios marcadores
              preserveViewport: true, // Para evitar que el mapa haga zoom automáticamente
            });
            
            // Guardar referencia al renderer
            if (isMounted) {
              directionsRendererRef.current = directionsRenderer;
            }
    
            directionsService.route(
              {
                origin: originCoords,
                destination: destinationCoords,
                travelMode: window.google.maps.TravelMode.DRIVING,
              },
              (result: any, status: any) => {
                if (!isMounted) return;
                
                if (status === window.google.maps.DirectionsStatus.OK && result) {
                  directionsRenderer.setDirections(result);
                  
                  // Extraer la información de la ruta
                  const route = result.routes[0];
                  const leg = route.legs[0];
                  
                  setRouteInfo({
                    distance: leg.distance ? leg.distance.value / 1000 : 0, // Convertir a km
                    duration: leg.duration ? leg.duration.value / 60 : 0,  // Convertir a minutos
                    polyline: route.overview_polyline.points,
                  });
                } else {
                  console.error("Error al calcular la ruta:", status);
                  if (isMounted) {
                    // Calcular distancia aproximada si falla la ruta
                    try {
                      const distance = Math.sqrt(
                        Math.pow((destinationCoords.lat - originCoords.lat) * 111, 2) + 
                        Math.pow((destinationCoords.lng - originCoords.lng) * 111 * Math.cos(originCoords.lat * Math.PI / 180), 2)
                      );
                      
                      setRouteInfo({
                        distance: distance * 1.3, // Factor de ruta aproximado
                        duration: distance * 1.3 / 50 * 60, // Estimación de tiempo (50 km/h)
                        polyline: "",
                      });
                    } catch (e) {
                      console.error("Error al calcular distancia alternativa:", e);
                    }
                  }
                }
              }
            );
          } catch (routeError) {
            console.error("Error al configurar la ruta:", routeError);
          }
        }
      } catch (err) {
        console.error("Error al dibujar en el mapa:", err);
        if (isMounted) {
          setError("Ocurrió un error al mostrar el mapa. Por favor, intenta de nuevo.");
        }
      }
    };
    
    updateMap();
    
    return () => {
      isMounted = false;
      // Realizar una limpieza segura al cambiar coordenadas
      clearMap();
    };
  }, [mapInstance, originCoords, destinationCoords, originName, destinationName, showRoute]);

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      clearMap();
      
      // Asegurarnos de que no queden referencias al mapInstance
      setMapInstance(null);
    };
  }, []);

  if (error) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <div 
          className="bg-muted/50 flex items-center justify-center" 
          style={{ height }}
        >
          <div className="text-center p-6">
            <Info className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error al cargar el mapa</h3>
            <p className="text-muted-foreground max-w-md">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Contenedor del mapa */}
      <div 
        id={mapId}
        ref={mapRef} 
        style={{ height }} 
        className="relative w-full"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Información de la ruta (opcional) */}
      {showRoute && routeInfo && !loading && (
        <div className="p-3 border-t bg-muted/20">
          <div className="flex items-center text-sm">
            <Navigation className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground mr-2">Distancia:</span>
            <span className="font-medium">{routeInfo.distance.toFixed(1)} km</span>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="text-muted-foreground mr-2">Tiempo estimado:</span>
            <span className="font-medium">{Math.round(routeInfo.duration)} min</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export { Maps };
export default Maps; 