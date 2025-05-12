"use client";

import React from 'react';
import { RequestService, StatusName } from "@/app/interfaces";
import { 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package2, 
  Calendar, 
  MapPin
} from "lucide-react";
import { StaticMap } from "@/components/static-map";
import { statusColors, statusLabels, getStatusIcon } from "../constants";

interface ServiceDetailsDialogProps {
  service: RequestService;
  formatDate: (dateString: string) => string;
}

export function ServiceDetailsDialog({ service, formatDate }: ServiceDetailsDialogProps) {
  // Verificar que el servicio sea válido
  if (!service || !service.id) {
    return (
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Información no disponible</DialogTitle>
          <DialogDescription>
            No se pudieron cargar los detalles del servicio
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    );
  }
  
  // Verificar si hay coordenadas válidas para mostrar el mapa
  const hasValidCoordinates = !!(
    service.pickupLat && service.pickupLng && 
    service.destinationLat && service.destinationLng &&
    !isNaN(service.pickupLat) && !isNaN(service.pickupLng) &&
    !isNaN(service.destinationLat) && !isNaN(service.destinationLng)
  );
  
  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center gap-2">
          <Package2 className="h-5 w-5 text-primary" />
          Servicio #{service.id} - {service.type || 'Sin tipo'}
        </DialogTitle>
        <DialogDescription>
          Detalles completos del servicio de transporte
        </DialogDescription>
      </DialogHeader>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          {service?.status?.name ? (
            <Badge variant="outline" className={statusColors[service.status.name] || ""}>
              {React.createElement(getStatusIcon(service.status.name), { className: "h-4 w-4 mr-1" })}
              {statusLabels[service.status.name] || "Estado desconocido"}
            </Badge>
          ) : (
            <Badge variant="outline">Estado no disponible</Badge>
          )}
          <span className="text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 inline mr-1" />
            {service.unloadDate ? formatDate(service.unloadDate) : 'Fecha no disponible'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Información de la Carga</CardTitle>
              </CardHeader>
              <CardContent>
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
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Información de la Ruta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-muted-foreground">Punto de Recogida:</div>
                    <div className="flex items-start mt-1">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5 mr-1" />
                      <span>{service.pickupAddress || 'No especificado'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Punto de Entrega:</div>
                    <div className="flex items-start mt-1">
                      <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5 mr-1" />
                      <span>{service.destinationAddress || 'No especificado'}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                    <div className="text-muted-foreground">Departamento:</div>
                    <div>{service.department || 'No especificado'}</div>
                    
                    <div className="text-muted-foreground">Distrito:</div>
                    <div>{service.district || 'No especificado'}</div>
                    
                    <div className="text-muted-foreground">País:</div>
                    <div>{service.country || 'No especificado'}</div>
                    
                    <div className="text-muted-foreground">Distancia:</div>
                    <div>{service.distance ? `${service.distance.toFixed(1)} km` : 'No disponible'}</div>
                    
                    <div className="text-muted-foreground">Fecha de entrega:</div>
                    <div>{service.unloadDate ? formatDate(service.unloadDate) : 'No disponible'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Mapa de Ruta</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {hasValidCoordinates ? (
                  <StaticMap
                    originCoords={{
                      lat: service.pickupLat!,
                      lng: service.pickupLng!
                    }}
                    destinationCoords={{
                      lat: service.destinationLat!,
                      lng: service.destinationLng!
                    }}
                    width={400}
                    height={300}
                    className="w-full"
                    alt={`Ruta de ${service.pickupAddress || ''} a ${service.destinationAddress || ''}`}
                  />
                ) : (
                  <div className="bg-muted w-full h-[200px] flex items-center justify-center rounded-md">
                    <p className="text-muted-foreground">No hay coordenadas disponibles para mostrar el mapa</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Estado del Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {service?.status?.name ? (
                      <Badge variant="outline" className={statusColors[service.status.name] || ""}>
                        {React.createElement(getStatusIcon(service.status.name), { className: "h-4 w-4 mr-1" })}
                        {statusLabels[service.status.name] || "Estado desconocido"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Estado no disponible</Badge>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <div className="text-muted-foreground text-sm mb-2">Progreso del Servicio:</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Solicitud</span>
                        <span>En ruta</span>
                        <span>Entrega</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        {service?.status?.name === StatusName.PENDING && (
                          <div className="absolute left-0 top-0 h-full w-1/4 bg-primary rounded-full"></div>
                        )}
                        {service?.status?.name === StatusName.ACCEPTED && (
                          <div className="absolute left-0 top-0 h-full w-2/4 bg-primary rounded-full"></div>
                        )}
                        {service?.status?.name === StatusName.IN_PROGRESS && (
                          <div className="absolute left-0 top-0 h-full w-3/4 bg-primary rounded-full"></div>
                        )}
                        {service?.status?.name === StatusName.COMPLETED && (
                          <div className="absolute left-0 top-0 h-full w-full bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DialogContent>
  );
} 