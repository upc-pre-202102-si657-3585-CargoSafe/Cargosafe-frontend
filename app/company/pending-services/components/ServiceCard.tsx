"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RequestService, StatusName } from "@/app/interfaces";
import { Eye, MapPin, Package, Calendar, Weight } from "lucide-react";
import { ServiceDetail } from "./ServiceDetail";
import { formatDateConsistently } from "../utils/dateUtils";
import { StaticMap } from "@/components/static-map";


const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  }),
  exit: { 
    opacity: 0, 
    x: -100, 
    transition: { 
      duration: 0.3 
    } 
  }
};

interface ServiceCardProps {
  service: RequestService;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelection: (id: number) => void;
  onToggleExpansion: (id: number) => void;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}


const MemoizedStaticMap = memo(StaticMap);

export const ServiceCard = ({ 
  service, 
  index, 
  isSelected, 
  isExpanded, 
  onToggleSelection, 
  onToggleExpansion,
  onAccept,
  onReject
}: ServiceCardProps) => {

  if (!service || !service.id) {
    console.error("Servicio inválido o sin ID", service);
    return null;
  }
  
  console.log(`Renderizando ServiceCard para servicio ID: ${service.id}, Estado: ${service?.status?.name || "No definido"}`);
  
  const hasValidCoordinates = !!(
    service.pickupLat && service.pickupLng && 
    service.destinationLat && service.destinationLng &&
    !isNaN(service.pickupLat) && !isNaN(service.pickupLng) &&
    !isNaN(service.destinationLat) && !isNaN(service.destinationLng)
  );

  const originCoords = {
    lat: service.pickupLat || 0,
    lng: service.pickupLng || 0
  };
  
  const destinationCoords = {
    lat: service.destinationLat || 0,
    lng: service.destinationLng || 0
  };


  const statusName = service?.status?.name || "PENDING";
  const statusLabel = statusName === "PENDING" ? "Pendiente" : 
                      statusName === "ACCEPTED" ? "Aceptado" : 
                      statusName === "IN_PROGRESS" ? "En progreso" : 
                      statusName === "COMPLETED" ? "Completado" : 
                      statusName === "CANCELLED" ? "Cancelado" : "Pendiente";
  
  const statusColor = statusName === "PENDING" ? "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-300" : 
                     statusName === "ACCEPTED" ? "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300" : 
                     statusName === "IN_PROGRESS" ? "bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300" : 
                     statusName === "COMPLETED" ? "bg-purple-500/20 text-purple-700 dark:bg-purple-500/30 dark:text-purple-300" : 
                     statusName === "CANCELLED" ? "bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300" : 
                     "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-300";

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={cardVariants}
      layoutId={`service-${service.id}`}
      className="mb-4"
    >
      <Card 
        className={`border-l-4 transition-all duration-300 ${
          isSelected ? 'border-l-primary shadow-md' : 'border-l-muted-foreground/30'
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Checkbox 
                id={`service-${service.id}`}
                checked={isSelected}
                onCheckedChange={() => onToggleSelection(service.id)}
                className="mt-1"
              />
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {service.holderName || "Usuario anónimo"}
                  <Badge className={`ml-2 ${statusColor} hover:opacity-90`}>
                    {statusLabel}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  Servicio #{service.id} - {service.loadDetail || "Sin descripción"}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={() => onToggleExpansion(service.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid grid-cols-2 md:col-span-2 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{service.district || service.department || service.destination || "Ubicación no especificada"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>{service.numberPackages || 0} paquetes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDateConsistently(service.unloadDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Weight className="h-4 w-4 text-muted-foreground" />
                <span>{service.weight || "No especificado"}</span>
              </div>
            </div>
            
            {/* Mapa estático de previsualización */}
            <div className="hidden md:block">
              {!isExpanded && hasValidCoordinates && (
                <MemoizedStaticMap 
                  originCoords={originCoords}
                  destinationCoords={destinationCoords}
                  width={150}
                  height={80}
                  zoom={10}
                  className="rounded-md overflow-hidden"
                  key={`static-map-${service.id}`}
                />
              )}
              {!isExpanded && !hasValidCoordinates && (
                <div className="w-[150px] h-[80px] bg-muted rounded-md flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Mapa no disponible</span>
                </div>
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <ServiceDetail 
                service={service} 
                onAccept={onAccept}
                onReject={onReject}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 