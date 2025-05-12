"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Package2, MapPin, Map as MapIcon } from "lucide-react";
import { RequestService } from "@/app/interfaces";
import { MapContainer } from "@/components/map-container";
import { formatDateConsistently } from "../utils/dateUtils";


const expandVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { 
    opacity: 1, 
    height: "auto", 
    transition: { 
      duration: 0.3, 
      ease: "easeInOut" 
    } 
  },
  exit: { 
    opacity: 0, 
    height: 0, 
    transition: { 
      duration: 0.2 
    } 
  }
};

interface ServiceDetailProps {
  service: RequestService;
  onReject: (id: number) => void;
  onAccept: (id: number) => void;
}

export const ServiceDetail = ({ service, onReject, onAccept }: ServiceDetailProps) => {
  const [showMap, setShowMap] = useState(false);
  

  const componentId = useMemo(() => `service-detail-${service.id}-${Math.random().toString(36).substr(2, 9)}`, [service.id]);


  const hasValidCoordinates = useMemo(() => !!(
    service.pickupLat && service.pickupLng && 
    service.destinationLat && service.destinationLng &&
    !isNaN(service.pickupLat) && !isNaN(service.pickupLng) &&
    !isNaN(service.destinationLat) && !isNaN(service.destinationLng)
  ), [service]);


  const originCoords = useMemo(() => ({
    lat: service.pickupLat || 0,
    lng: service.pickupLng || 0
  }), [service.pickupLat, service.pickupLng]);
  
  const destinationCoords = useMemo(() => ({
    lat: service.destinationLat || 0,
    lng: service.destinationLng || 0
  }), [service.destinationLat, service.destinationLng]);


  const handleToggleMap = useCallback(() => {
    setShowMap(prev => !prev);
  }, []);


  const mapComponent = useMemo(() => {
    if (!showMap || !hasValidCoordinates) return null;
    
    return (
      <MapContainer
        originCoords={originCoords}
        destinationCoords={destinationCoords}
        originName={service.pickupAddress || "Origen"}
        destinationName={service.destinationAddress || "Destino"}
        height="350px"
      />
    );
  }, [showMap, hasValidCoordinates, originCoords, destinationCoords, service.pickupAddress, service.destinationAddress]);

  return (
    <motion.div
      variants={expandVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="bg-muted/50 rounded-md p-4 mt-4 space-y-4"
      id={componentId}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Package2 className="h-4 w-4 text-primary" />
            Detalles de la Carga
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span>{service.type || "No especificado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paquetes:</span>
              <span>{service.numberPackages || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peso:</span>
              <span>{service.weight || "No especificado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contenido:</span>
              <span>{service.loadDetail || "No especificado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha entrega:</span>
              <span>{formatDateConsistently(service.unloadDate)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Ubicaciones
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground block">Recogida:</span>
              <span className="block">{service.pickupAddress || "No especificado"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Entrega:</span>
              <span className="block">{service.destinationAddress || "No especificado"}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Distancia:</span>
              <span>{service.distance ? `${service.distance.toFixed(1)} km` : "No disponible"}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleToggleMap}
                disabled={!hasValidCoordinates}
              >
                <MapIcon className="mr-2 h-4 w-4" />
                {showMap ? "Ocultar mapa" : "Ver en mapa"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      

      {mapComponent && (
        <div className="mt-4">
          {mapComponent}
        </div>
      )}
      
      <Separator />
      
      <div className="flex flex-col sm:flex-row gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          className="group"
          onClick={() => onReject(service.id)}
        >
          <ThumbsDown className="mr-2 h-4 w-4 group-hover:text-red-500 transition-colors" />
          <span className="group-hover:text-red-500 transition-colors">Rechazar</span>
        </Button>
        <Button
          size="sm"
          className="group bg-green-600 hover:bg-green-700"
          onClick={() => onAccept(service.id)}
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          <span>Aceptar</span>
        </Button>
      </div>
    </motion.div>
  );
}; 