"use client";

import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { LatLng } from "@/lib/map-service";

interface StaticMapProps {
  originCoords: LatLng;
  destinationCoords: LatLng;
  width?: number;
  height?: number;
  zoom?: number;
  className?: string;
  showMarkers?: boolean;
  showRoute?: boolean;
  alt?: string;
  priority?: boolean;
}

/**
 * Componente para mostrar un mapa estático con Google Maps Static API
 * Útil para vistas previas de mapas sin interacción
 */
export const StaticMap: React.FC<StaticMapProps> = ({
  originCoords,
  destinationCoords,
  width = 400,
  height = 200,
  zoom = 13,
  className = "",
  showMarkers = true,
  showRoute = true,
  alt = "Mapa de ruta",
  priority = true
}) => {
  // Verificar que las coordenadas sean válidas
  const hasValidCoords = 
    originCoords && 
    destinationCoords && 
    typeof originCoords.lat === 'number' && 
    typeof originCoords.lng === 'number' && 
    typeof destinationCoords.lat === 'number' && 
    typeof destinationCoords.lng === 'number';
  
  // Obtener la API key desde las variables de entorno
  const apiKey = process.env.NEXT_PUBLIC_API_GOOGLE;
  
  if (!apiKey || !hasValidCoords) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <div 
          className="bg-muted/50 flex items-center justify-center"
          style={{ width, height }}
        >
          <p className="text-sm text-muted-foreground">
            {!apiKey ? "API Key no disponible" : "Coordenadas no válidas"}
          </p>
        </div>
      </Card>
    );
  }

  // Construir la URL del mapa estático
  let staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=${width}x${height}&zoom=${zoom}&key=${apiKey}`;
  
  // Añadir marcadores si es necesario
  if (showMarkers) {
    staticMapUrl += `&markers=color:red|label:A|${originCoords.lat},${originCoords.lng}`;
    staticMapUrl += `&markers=color:green|label:B|${destinationCoords.lat},${destinationCoords.lng}`;
  }
  
  // Añadir ruta si es necesario
  if (showRoute) {
    staticMapUrl += `&path=color:0x0000ff|weight:5|${originCoords.lat},${originCoords.lng}|${destinationCoords.lat},${destinationCoords.lng}`;
  }
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative" style={{ width, height }}>
        <Image
          src={staticMapUrl}
          alt={alt}
          fill
          sizes={`${width}px`}
          className="object-cover"
          priority={priority}
        />
      </div>
    </Card>
  );
}; 