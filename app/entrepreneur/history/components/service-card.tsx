"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RequestService } from "@/app/interfaces";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Package2, 
  Calendar, 
  MapPin,
  Truck,
  Eye,
  FileText,
  Map as MapIcon
} from "lucide-react";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { MapContainer } from "@/components/map-container";
import { statusColors, statusLabels, getStatusIcon } from "../constants";
import { ServiceDetailsDialog } from "../dialogs/service-details";

interface ServiceCardProps {
  service: RequestService;
  formatDate: (dateString: string) => string;
  expandedServiceId: number | null;
  toggleServiceDetails: (serviceId: number) => void;
}

export function ServiceCard({ 
  service, 
  formatDate, 
  expandedServiceId, 
  toggleServiceDetails 
}: ServiceCardProps) {
  if (!service || !service.id) {
    return null;
  }
  
  const isExpanded = expandedServiceId === service.id;
  const prevExpandedRef = useRef(isExpanded);
  const [showMap, setShowMap] = useState(false);
  
  useEffect(() => {
    if (isExpanded && !showMap) {
      const timer = setTimeout(() => {
        setShowMap(true);
      }, 100);
      return () => clearTimeout(timer);
    } else if (!isExpanded && showMap) {
      setShowMap(false);
    }
    
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, showMap]);
  
  const hasValidCoordinates = !!(
    service.pickupLat && service.pickupLng && 
    service.destinationLat && service.destinationLng &&
    !isNaN(service.pickupLat) && !isNaN(service.pickupLng) &&
    !isNaN(service.destinationLat) && !isNaN(service.destinationLng)
  );
  
  return (
    <motion.div
      key={service.id.toString()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {service?.status?.name ? (
                  <Badge variant="outline" className={statusColors[service.status.name] || ""}>
                    {React.createElement(getStatusIcon(service.status.name), { className: "h-4 w-4 mr-1" })}
                    {statusLabels[service.status.name] || "Estado desconocido"}
                  </Badge>
                ) : (
                  <Badge variant="outline">Estado no disponible</Badge>
                )}
                <span className="text-sm text-muted-foreground">ID: {service.id}</span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {service.unloadDate ? formatDate(service.unloadDate) : 'Fecha no disponible'}
              </div>
            </div>
            
            <h3 className="font-medium text-lg">{service.type || 'Sin tipo'} - {service.loadDetail || 'Sin detalles'}</h3>
            
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5 mr-1" />
                <div>
                  <span className="text-muted-foreground">Origen: </span>
                  <span className="font-medium">{service.pickupAddress || 'No especificado'}</span>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5 mr-1" />
                <div>
                  <span className="text-muted-foreground">Destino: </span>
                  <span className="font-medium">{service.destinationAddress || 'No especificado'}</span>
                </div>
              </div>
              <div className="flex items-center">
                <Package2 className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-muted-foreground mr-1">Paquetes:</span>
                <span>{service.numberPackages || 0}</span>
              </div>
              <div className="flex items-center">
                <Truck className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-muted-foreground mr-1">Distancia:</span>
                <span>{service.distance ? `${service.distance.toFixed(1)} km` : 'No disponible'}</span>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm mr-2"
                  >
                    <FileText className="mr-1 h-3.5 w-3.5" />
                    Detalles completos
                  </Button>
                </DialogTrigger>
                <ServiceDetailsDialog service={service} formatDate={formatDate} />
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleServiceDetails(service.id)}
                className="text-sm"
                disabled={!hasValidCoordinates}
                title={!hasValidCoordinates ? "No hay coordenadas disponibles para mostrar el mapa" : ""}
              >
                <Eye className="mr-1 h-3.5 w-3.5" />
                {isExpanded ? "Ocultar detalles" : "Ver mapa"}
              </Button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                key={`expanded-${service.id}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Separator />
                <div className="p-4 bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Detalles del Servicio</h4>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Titular:</div>
                          <div>{service.holderName || 'No especificado'}</div>
                          
                          <div className="text-muted-foreground">Tipo:</div>
                          <div>{service.type || 'No especificado'}</div>
                          
                          <div className="text-muted-foreground">Contenido:</div>
                          <div>{service.loadDetail || 'No especificado'}</div>
                          
                          <div className="text-muted-foreground">Peso:</div>
                          <div>{service.weight || 'No especificado'}</div>
                          
                          <div className="text-muted-foreground">Paquetes:</div>
                          <div>{service.numberPackages || 0}</div>
                          
                          <div className="text-muted-foreground">Fecha entrega:</div>
                          <div>{service.unloadDate ? formatDate(service.unloadDate) : 'No disponible'}</div>
                          
                          <div className="text-muted-foreground">Estado:</div>
                          <div>
                            {service?.status?.name ? (
                              <Badge variant="outline" className={statusColors[service.status.name] || ""}>
                                {React.createElement(getStatusIcon(service.status.name), { className: "h-4 w-4 mr-1" })}
                                {statusLabels[service.status.name] || "Estado desconocido"}
                              </Badge>
                            ) : (
                              <span>No disponible</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <MapIcon className="h-4 w-4 text-primary" />
                        Mapa de Ruta
                      </h4>
                      {hasValidCoordinates ? (
                        <>
                          {showMap && (
                            <MapContainer
                              originCoords={{
                                lat: service.pickupLat!,
                                lng: service.pickupLng!
                              }}
                              destinationCoords={{
                                lat: service.destinationLat!,
                                lng: service.destinationLng!
                              }}
                              originName={service.pickupAddress || "Origen"}
                              destinationName={service.destinationAddress || "Destino"}
                              height="250px"
                              className="w-full"
                            />
                          )}
                        </>
                      ) : (
                        <div className="bg-muted w-full h-[200px] flex items-center justify-center rounded-md">
                          <p className="text-muted-foreground">No hay coordenadas disponibles para mostrar el mapa</p>
                        </div>
                      )}
                      <div className="mt-2 text-sm text-muted-foreground">
                        Distancia aproximada: {service.distance ? `${service.distance.toFixed(1)} km` : 'No disponible'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
} 