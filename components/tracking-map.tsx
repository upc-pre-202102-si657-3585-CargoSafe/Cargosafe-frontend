"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Locate } from 'lucide-react';
import { loadGoogleMapsScript, LatLng } from '@/lib/map-service';

// Eliminar interfaces GoogleMapsInstance y GoogleMapsMarker

interface VehicleLocation extends LatLng {
  id: string;
  label: string;
  lastUpdated: Date;
}

interface TrackingMapProps {
  vehicleLocations: VehicleLocation[];
  centerLocation?: LatLng;
  height?: string;
  className?: string;
  onRefresh?: () => void;
  refreshInterval?: number; // en milisegundos
  showCurrentLocation?: boolean;
}

type MaybeAdvancedMarker = { map?: google.maps.Map | null };

const TrackingMap: React.FC<TrackingMapProps> = ({
  vehicleLocations,
  centerLocation,
  height = "500px",
  className = "",
  onRefresh,
  refreshInterval = 30000, // Por defecto, actualizar cada 30 segundos
  showCurrentLocation = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  
  // Referencias para los marcadores
  const markersRef = useRef<Array<google.maps.Marker | google.maps.marker.AdvancedMarkerElement>>([]);
  const userMarkerRef = useRef<google.maps.Marker | google.maps.marker.AdvancedMarkerElement | null>(null);
  
  // ID único para este componente de mapa, generado solo en el cliente
  const [mapId, setMapId] = useState<string | null>(null);
  
  useEffect(() => {
    setMapId(`tracking-map-${Math.random().toString(36).substr(2, 9)}`);
  }, []);
  
  // Limpiar marcadores
  const clearMarkers = useCallback(() => {
    try {
      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          if (marker && typeof marker === 'object') {
            try {
              if ('setMap' in marker && typeof (marker as google.maps.Marker).setMap === 'function') {
                (marker as google.maps.Marker).setMap(null);
              } else if ('map' in marker && !(marker instanceof google.maps.Marker)) {
                // Solo para AdvancedMarkerElement
                (marker as MaybeAdvancedMarker).map = null;
              }
            } catch (e) {
              console.warn("Error al limpiar marcador individual:", e);
            }
          }
        });
        markersRef.current = [];
      }

      // Limpiar marcador de usuario
      if (userMarkerRef.current && typeof userMarkerRef.current === 'object') {
        try {
          if ('setMap' in userMarkerRef.current && typeof (userMarkerRef.current as google.maps.Marker).setMap === 'function') {
            (userMarkerRef.current as google.maps.Marker).setMap(null);
          } else if ('map' in userMarkerRef.current && !(userMarkerRef.current instanceof google.maps.Marker)) {
            (userMarkerRef.current as MaybeAdvancedMarker).map = null;
          }
          userMarkerRef.current = null;
        } catch (e) {
          console.warn("Error al limpiar marcador de usuario:", e);
        }
      }
    } catch (err) {
      console.error("Error al limpiar los marcadores:", err);
    }
  }, []);

  // Obtener la ubicación actual del usuario
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error("Geolocalización no está soportada por este navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        
        // Si el mapa ya está cargado, centrar en la ubicación del usuario
        if (mapInstance && showCurrentLocation) {
          mapInstance.setCenter(location);
          mapInstance.setZoom(14);
          
          // Actualizar marcador de usuario
          updateUserLocationMarker(location);
        }
      },
      (error) => {
        console.error("Error obteniendo la ubicación:", error);
      }
    );
  }, [mapInstance, showCurrentLocation]);

  // Actualizar marcador de ubicación del usuario
  const updateUserLocationMarker = useCallback((location: LatLng) => {
    if (!mapInstance) return;
    
    // Eliminar marcador anterior si existe
    if (userMarkerRef.current) {
      try {
        if ('setMap' in userMarkerRef.current && typeof (userMarkerRef.current as google.maps.Marker).setMap === 'function') {
          (userMarkerRef.current as google.maps.Marker).setMap(null);
        } else if ('map' in userMarkerRef.current && !(userMarkerRef.current instanceof google.maps.Marker)) {
          (userMarkerRef.current as MaybeAdvancedMarker).map = null;
        }
      } catch (e) {
        console.warn("Error al eliminar marcador de usuario:", e);
      }
    }
    
    try {
      // Intentar usar AdvancedMarkerElement si está disponible
      if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        // Crear elemento HTML personalizado para el marcador
        const markerElement = document.createElement('div');
        markerElement.className = 'user-location-marker';
        markerElement.innerHTML = `
          <div style="
            background-color: rgba(37, 99, 235, 0.9);
            border: 2px solid white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
          ">
            <div style="
              background-color: white;
              width: 8px;
              height: 8px;
              border-radius: 50%;
            "></div>
          </div>
        `;
        
        // Crear marcador avanzado
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: location,
          map: mapInstance,
          title: "Tu ubicación",
          content: markerElement
        });
        
        userMarkerRef.current = marker;
      } else {
        // Fallback a marcador tradicional
        const marker = new window.google.maps.Marker({
          position: location,
          map: mapInstance,
          title: "Tu ubicación",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#2563eb",
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 2
          },
          zIndex: 1000
        });
        
        userMarkerRef.current = marker;
      }
    } catch (e) {
      console.warn("Error al crear marcador de usuario:", e);
    }
  }, [mapInstance]);

  // Actualizar marcadores de vehículos
  const updateVehicleMarkers = useCallback(() => {
    if (!mapInstance) return;
    
    // Limpiar marcadores existentes
    clearMarkers();
    
    // Crear nuevos marcadores para cada vehículo
    const newMarkers = vehicleLocations.map(vehicle => {
      let marker;
      
      try {
        // Intentar usar AdvancedMarkerElement si está disponible
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          // Crear elemento HTML personalizado para el marcador
          const markerElement = document.createElement('div');
          markerElement.className = 'vehicle-marker';
          markerElement.innerHTML = `
            <div style="
              position: relative;
              width: 30px;
              height: 30px;
              display: flex;
              justify-content: center;
              align-items: center;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" style="width: 26px; height: 26px; background-color: white; border-radius: 50%; padding: 2px; box-shadow: 0 0 5px rgba(0,0,0,0.2);">
                <path d="M16 3H1v18h15m5-18 3 9h-3m-5-7v10m0-10 1-2m3-1h1c1 0 1 1 1 1v7c0 1-1 1-1 1h-1" />
              </svg>
              <div style="
                position: absolute;
                bottom: -20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                white-space: nowrap;
                pointer-events: none;
              ">
                ${vehicle.label}
              </div>
            </div>
          `;
          
          // Crear marcador avanzado
          marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: vehicle,
            map: mapInstance,
            title: vehicle.label,
            content: markerElement
          });
        } else {
          // Fallback a marcador tradicional
          marker = new window.google.maps.Marker({
            position: vehicle,
            map: mapInstance,
            title: vehicle.label,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" width="24" height="24">
                  <path d="M16 3H1v18h15m5-18 3 9h-3m-5-7v10m0-10 1-2m3-1h1c1 0 1 1 1 1v7c0 1-1 1-1 1h-1"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 12)
            }
          });
        }
        
        return marker;
      } catch (e) {
        console.warn("Error al crear marcador de vehículo:", e);
        return null;
      }
    }).filter(Boolean) as Array<google.maps.Marker | google.maps.marker.AdvancedMarkerElement>;
    
    markersRef.current = newMarkers;
    
    // Ajustar el mapa para mostrar todos los marcadores
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      
      // Agregar ubicaciones de vehículos
      vehicleLocations.forEach(vehicle => {
        bounds.extend(vehicle);
      });
      
      // Agregar ubicación del usuario si está disponible
      if (userLocation && showCurrentLocation) {
        bounds.extend(userLocation);
      }
      
      mapInstance.fitBounds(bounds);
      
      // Si solo hay un marcador, hacer zoom adecuado
      if (newMarkers.length === 1 && !userLocation && !centerLocation) {
        mapInstance.setZoom(14);
      }
    } else if (userLocation && showCurrentLocation) {
      // Si no hay vehículos pero sí ubicación de usuario, centrar en ella
      mapInstance.setCenter(userLocation);
      mapInstance.setZoom(14);
    } else if (centerLocation) {
      // Si hay una ubicación central definida, usarla
      mapInstance.setCenter(centerLocation);
      mapInstance.setZoom(12);
    }
  }, [mapInstance, vehicleLocations, userLocation, showCurrentLocation, centerLocation, clearMarkers]);

  // Cargar el script de Google Maps y inicializar el mapa
  useEffect(() => {
    let isMounted = true;
    let mapObjectInstance: google.maps.Map | null = null;
    
    const initMap = async () => {
      try {
        if (isMounted) setLoading(true);
        
        // Cargar el script de Google Maps
        await loadGoogleMapsScript();
        
        if (!mapRef.current || !isMounted) return;
        
        // Determinar el centro inicial del mapa
        let initialCenter = { lat: -12.0464, lng: -77.0428 }; // Lima por defecto
        if (centerLocation) {
          initialCenter = centerLocation;
        } else if (vehicleLocations.length > 0) {
          initialCenter = vehicleLocations[0];
        }
        
        // Crear el mapa
        const mapOptions = {
          center: initialCenter,
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
            
            // Obtener ubicación del usuario si es necesario
            if (showCurrentLocation) {
              getCurrentLocation();
            }
            
            // Actualizar los marcadores de vehículos
            setTimeout(() => {
              if (isMounted) {
                updateVehicleMarkers();
              }
            }, 100);
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
    
    // Configurar intervalo de actualización si se proporciona
    let refreshTimer: NodeJS.Timeout | null = null;
    if (refreshInterval && onRefresh) {
      refreshTimer = setInterval(() => {
        if (isMounted && onRefresh) {
          onRefresh();
        }
      }, refreshInterval);
    }
    
    // Limpieza al desmontar
    return () => {
      isMounted = false;
      
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
      
      clearMarkers();
      
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
  }, [centerLocation, getCurrentLocation, onRefresh, refreshInterval, showCurrentLocation, updateVehicleMarkers, vehicleLocations, clearMarkers]);

  // Actualizar marcadores cuando cambian las ubicaciones de los vehículos
  useEffect(() => {
    if (mapInstance) {
      updateVehicleMarkers();
    }
  }, [updateVehicleMarkers]);

  return (
    <Card className={className}>
      <div className="relative" style={{ height }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="text-center p-4">
              <p className="text-destructive font-medium">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </div>
        )}
        
        <div 
          ref={mapRef} 
          id={mapId || undefined}
          className="w-full h-full"
        />
        
        {showCurrentLocation && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 z-10 shadow-md"
            onClick={getCurrentLocation}
          >
            <Locate className="h-4 w-4 mr-1" />
            Mi ubicación
          </Button>
        )}
        
        {onRefresh && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 left-4 z-10 shadow-md"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
        )}
      </div>
    </Card>
  );
};

export default TrackingMap; 