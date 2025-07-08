"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LatLng, loadGoogleMapsScript } from "@/lib/map-service";

// Asegura que los tipos globales estén disponibles
// import "@/types/google-maps"; // No es necesario si está en types/

interface MapContainerProps {
  originCoords: LatLng;
  destinationCoords: LatLng;
  originName?: string;
  destinationName?: string;
  height?: string;
  className?: string;
}

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
  const [loading, setLoading] = useState(true);
  const [ setDistance] = useState<number | null>(null);
  const [ setDuration] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    let mapInstance: google.maps.Map | null = null;
    let markers: google.maps.Marker[] = [];
    let directionsRenderer: google.maps.DirectionsRenderer | null = null;

    const cleanupResources = () => {
      try {
        if (markers.length > 0) {
          markers.forEach(marker => {
            if (marker) {
              marker.setMap(null);
            }
          });
          markers = [];
        }
        if (directionsRenderer) {
          directionsRenderer.setMap(null);
          directionsRenderer = null;
        }
        mapInstance = null;
      } catch (error) {
        console.error("Error limpiando recursos de mapa:", error);
      }
    };

    const loadMap = async () => {
      try {
        cleanupResources();
        if (!document.getElementById(mapContainerId.current)) {
          const container = document.createElement('div');
          container.id = mapContainerId.current;
          container.style.width = '100%';
          container.style.height = height;
          const parentContainer = containerRef.current;
          if (parentContainer) {
            parentContainer.appendChild(container);
          }
        }
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          initializeMap();
          return;
        }
        try {
          await loadGoogleMapsScript();
          if (mounted) {
            initializeMap();
          }
        } catch (error) {
          console.error("Error al cargar Google Maps API:", error);
          if (mounted) setLoading(false);
        }
      } catch (error) {
        console.error("Error cargando el mapa:", error);
        if (mounted) setLoading(false);
      }
    };

    const initializeMap = () => {
      try {
        if (typeof window === 'undefined' || !window.google || !window.google.maps) {
          if (mounted) setLoading(false);
          return;
        }
        const mapContainer = document.getElementById(mapContainerId.current);
        if (!mapContainer) {
          if (mounted) setLoading(false);
          return;
        }
        mapInstance = new window.google.maps.Map(mapContainer, {
          center: originCoords,
          zoom: 12,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });
        const originMarker = new window.google.maps.Marker({
          position: originCoords,
          map: mapInstance,
          title: originName,
          animation: window.google.maps.Animation.DROP,
        });
        const destinationMarker = new window.google.maps.Marker({
          position: destinationCoords,
          map: mapInstance,
          title: destinationName,
          animation: window.google.maps.Animation.DROP,
        });
        markers = [originMarker, destinationMarker];
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(originCoords);
        bounds.extend(destinationCoords);
        mapInstance.fitBounds(bounds);
        const directionsService = new window.google.maps.DirectionsService();
        directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: true,
          preserveViewport: true,
        });
        directionsService.route({
          origin: originCoords,
          destination: destinationCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result, status) => {
          if (!mounted) return;
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            // @ts-expect-error: directionsRenderer expects google.maps.DirectionsResult, but our type is compatible
            directionsRenderer!.setDirections(result);
            const route = result.routes[0];
            const leg = route.legs[0];
            if (mounted) {
              setDistance(leg.distance ? leg.distance.value / 1000 : 0);
              setDuration(leg.duration ? leg.duration.value / 60 : 0);
              setLoading(false);
              updateRouteInfo(
                leg.distance ? leg.distance.value / 1000 : 0,
                leg.duration ? leg.duration.value / 60 : 0
              );
            }
          } else {
            console.error("Error calculando la ruta:", status);
            if (mounted) setLoading(false);
          }
        });
      } catch (error) {
        console.error("Error inicializando el mapa:", error);
        if (mounted) setLoading(false);
      }
    };

    const updateRouteInfo = (distance: number, duration: number) => {
      try {
        let infoContainer = document.getElementById(infoContainerId.current);
        if (!infoContainer) {
          infoContainer = document.createElement('div');
          infoContainer.id = infoContainerId.current;
          infoContainer.className = 'p-3 border-t bg-muted/20';
          const parentContainer = containerRef.current;
          if (parentContainer && !document.getElementById(infoContainerId.current)) {
            parentContainer.appendChild(infoContainer);
          }
        }
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

    loadMap();
    return () => {
      mounted = false;
      try {
        if (markers.length > 0) {
          markers.forEach(marker => {
            if (marker) {
              marker.setMap(null);
            }
          });
        }
        if (directionsRenderer) {
          directionsRenderer.setMap(null);
        }
        mapInstance = null;
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