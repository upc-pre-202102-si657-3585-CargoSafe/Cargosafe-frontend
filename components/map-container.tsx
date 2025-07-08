"use client";

import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LatLng, loadGoogleMapsScript } from "@/lib/map-service";

interface MapContainerProps {
  originCoords: LatLng;
  destinationCoords: LatLng;
  originName?: string;
  destinationName?: string;
  height?: string;
  className?: string;
}

/**
 * Componente de contenedor de mapa que usa un approach diferente para renderizar mapas
 * en lugar de depender del ciclo de vida de React
 */
export function MapContainer({
  originCoords,
  destinationCoords,
  originName = "Origen",
  destinationName = "Destino",
  height = "400px",
  className = ""
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerId = useRef<string>(`map-container-${Math.random().toString(36).substring(2, 9)}`);
  const infoContainerId = useRef<string>(`map-info-${Math.random().toString(36).substring(2, 9)}`);
  const [loading, setLoading] = React.useState(true);
  const [ setDistance] = React.useState<number | null>(null);
  const [ setDuration] = React.useState<number | null>(null);

  // Solo se ejecuta una vez al montar el componente
  useEffect(() => {
    let mounted = true;
    let mapInstance: any = null;
    let markers: any[] = [];
    let directionsRenderer: any = null;

    // Función para limpiar recursos
    const cleanupResources = () => {
      try {
        if (markers.length > 0) {
          markers.forEach(marker => {
            if (marker) {
              // Los marcadores AdvancedMarkerElement usan .map = null
              // mientras que los marcadores Marker usan .setMap(null)
              if (typeof marker.setMap === 'function') {
                marker.setMap(null);
              } else {
                // Para AdvancedMarkerElement
                marker.map = null;
              }
            }
          });
          markers = [];
        }
        
        if (directionsRenderer) {
          directionsRenderer.setMap(null);
          directionsRenderer = null;
        }
        
        if (mapInstance) {
          // No intentamos eliminar directamente elementos del DOM
          // Solo desvinculamos el mapa y liberamos recursos internos
          mapInstance = null;
        }
      } catch (error) {
        console.error("Error limpiando recursos de mapa:", error);
      }
    };

    // Función para crear el script de Google Maps y cargar el mapa
    const loadMap = async () => {
      try {
        // Asegurarse de que no haya recursos previos
        cleanupResources();
        
        // Crear el contenedor del mapa si no existe
        if (!document.getElementById(mapContainerId.current)) {
          const container = document.createElement('div');
          container.id = mapContainerId.current;
          container.style.width = '100%';
          container.style.height = height;
          
          const parentContainer = containerRef.current;
          if (parentContainer) {
            // No manipulamos directamente los nodos hijos de React
            // Simplemente agregamos nuestro nodo
            parentContainer.appendChild(container);
          }
        }
        
        // Verificar si ya existe el script de Google Maps
        if (window.google && window.google.maps) {
          initializeMap();
          return;
        }
        
        // Cargar el script de Google Maps usando nuestro servicio
        try {
          await loadGoogleMapsScript();
          if (mounted) {
            initializeMap();
          }
        } catch (error) {
          console.error("Error al cargar Google Maps API:", error);
          if (mounted) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error cargando el mapa:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    // Inicializar el mapa
    const initializeMap = () => {
      try {
        const mapContainer = document.getElementById(mapContainerId.current);
        
        if (!mapContainer || !window.google || !window.google.maps) {
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        // Crear el mapa
        mapInstance = new window.google.maps.Map(mapContainer, {
          center: originCoords,
          zoom: 12,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });
        
        // Intentar usar AdvancedMarkerElement si está disponible, de lo contrario usar Marker
        let originMarker, destinationMarker;
        
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
          // Fallback al marcador tradicional
          originMarker = new window.google.maps.Marker({
            position: originCoords,
            map: mapInstance,
            title: originName,
            animation: window.google.maps.Animation.DROP,
          });
          
          destinationMarker = new window.google.maps.Marker({
            position: destinationCoords,
            map: mapInstance,
            title: destinationName,
            animation: window.google.maps.Animation.DROP,
          });
        }
        
        markers = [originMarker, destinationMarker];
        
        // Ajustar la vista para ver ambos marcadores
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(originCoords);
        bounds.extend(destinationCoords);
        mapInstance.fitBounds(bounds);
        
        // Dibujar la ruta
        const directionsService = new window.google.maps.DirectionsService();
        directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: true, // Para usar nuestros propios marcadores
          preserveViewport: true, // Para mantener el zoom y la posición actual
        });
        
        directionsService.route({
          origin: originCoords,
          destination: destinationCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result: any, status: any) => {
          if (!mounted) return;
          
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
            
            // Extraer información de la ruta
            const route = result.routes[0];
            const leg = route.legs[0];
            
            if (mounted) {
              setDistance(leg.distance ? leg.distance.value / 1000 : 0); // km
              setDuration(leg.duration ? leg.duration.value / 60 : 0); // min
              setLoading(false);
              
              // Actualizar la información de la ruta
              updateRouteInfo(
                leg.distance ? leg.distance.value / 1000 : 0,
                leg.duration ? leg.duration.value / 60 : 0
              );
            }
          } else {
            console.error("Error calculando la ruta:", status);
            if (mounted) {
              setLoading(false);
            }
          }
        });
      } catch (error) {
        console.error("Error inicializando el mapa:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    // Actualizar la información de la ruta en el DOM
    const updateRouteInfo = (distance: number, duration: number) => {
      try {
        // Crear o actualizar el contenedor de info
        let infoContainer = document.getElementById(infoContainerId.current);
        
        if (!infoContainer) {
          infoContainer = document.createElement('div');
          infoContainer.id = infoContainerId.current;
          infoContainer.className = 'p-3 border-t bg-muted/20';
          
          const parentContainer = containerRef.current;
          if (parentContainer && !document.getElementById(infoContainerId.current)) {
            // Solo agregamos el elemento si no existe ya
            parentContainer.appendChild(infoContainer);
          }
        }
        
        // Actualizar el contenido
        if (infoContainer) {
          infoContainer.innerHTML = `
            <div class="flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-muted-foreground h-4 w-4">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              <span class="text-muted-foreground mr-2">Distancia:</span>
              <span class="font-medium">${distance.toFixed(1)} km</span>
              <span class="mx-2 text-muted-foreground">•</span>
              <span class="text-muted-foreground mr-2">Tiempo estimado:</span>
              <span class="font-medium">${Math.round(duration)} min</span>
            </div>
          `;
        }
      } catch (error) {
        console.error("Error actualizando información de ruta:", error);
      }
    };
    
    // Iniciar la carga del mapa
    loadMap();
    
    // Limpieza al desmontar
    return () => {
      mounted = false;
      
      try {
        // Limpiar explícitamente los recursos de Google Maps
        if (markers.length > 0) {
          markers.forEach(marker => {
            if (marker) {
              // Los marcadores AdvancedMarkerElement usan .map = null
              // mientras que los marcadores Marker usan .setMap(null)
              if (typeof marker.setMap === 'function') {
                marker.setMap(null);
              } else {
                // Para AdvancedMarkerElement
                marker.map = null;
              }
            }
          });
        }
        
        if (directionsRenderer) {
          directionsRenderer.setMap(null);
        }
        
        if (mapInstance) {
          mapInstance = null;
        }
        
        // No eliminamos los elementos del DOM - dejamos que React se encargue de esto
      } catch (error) {
        console.error("Error limpiando recursos de mapa:", error);
      }
    };
  }, [originCoords, destinationCoords, originName, destinationName, height]);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div 
        ref={containerRef}
        className="relative w-full"
        style={{ minHeight: height }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {/* El mapa y la información se insertarán aquí dinámicamente */}
      </div>
    </Card>
  );
} 