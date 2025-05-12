"use client";

import React, { useState, useEffect } from "react";
import { getVehicleLocations, VehicleLocation } from "@/lib/tracking-service";
import TrackingMap from "@/components/tracking-map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TruckIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VehicleTrackingPage() {
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchVehicleData();
  }, []);

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      const data = await getVehicleLocations();
      setVehicles(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error obteniendo datos de vehículos:", err);
      setError("No se pudieron cargar los datos de los vehículos. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seguimiento de Vehículos</h1>
          <p className="text-muted-foreground">
            Monitoree la ubicación en tiempo real de sus vehículos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {lastUpdated ? (
              <>
                Última actualización: {lastUpdated.toLocaleTimeString()}
              </>
            ) : (
              "Sin actualizar"
            )}
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchVehicleData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Mapa de Seguimiento</CardTitle>
              <CardDescription>
                Ubicación en tiempo real de los vehículos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-center p-4">
                  <AlertCircle className="h-12 w-12 text-destructive mb-2" />
                  <p className="text-lg font-medium text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={fetchVehicleData}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (
                <TrackingMap
                  vehicleLocations={vehicles}
                  onRefresh={fetchVehicleData}
                  refreshInterval={60000} 
                  height="500px"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Detalles de Vehículos</CardTitle>
              <CardDescription>
                Información detallada de cada vehículo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="list">Lista</TabsTrigger>
                  <TabsTrigger value="status">Estado</TabsTrigger>
                </TabsList>
                
                <TabsContent value="list" className="mt-4 space-y-4">
                  {vehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <TruckIcon className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {loading ? "Cargando vehículos..." : "No hay vehículos disponibles"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vehicles.map(vehicle => (
                        <Card key={vehicle.id} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TruckIcon className="h-5 w-5 text-primary" />
                                <h3 className="font-medium">{vehicle.label}</h3>
                              </div>
                              <Badge variant="outline">{vehicle.id}</Badge>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              <p>Coordenadas: {vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}</p>
                              <p>Actualizado: {new Date(vehicle.lastUpdated).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="status" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="flex items-center justify-center bg-primary/10 rounded-full w-12 h-12 mb-2">
                          <TruckIcon className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-2xl font-bold">{vehicles.length}</p>
                        <p className="text-sm text-muted-foreground">Vehículos en ruta</p>
                      </Card>
                      
                      <Card className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="flex items-center justify-center bg-green-500/10 rounded-full w-12 h-12 mb-2">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{vehicles.length}</p>
                        <p className="text-sm text-muted-foreground">En tiempo</p>
                      </Card>
                    </div>
                    
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Resumen de Actividad</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Última actualización:</span>
                          <span>{lastUpdated ? lastUpdated.toLocaleTimeString() : "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Próxima actualización:</span>
                          <span>{lastUpdated ? new Date(lastUpdated.getTime() + 60000).toLocaleTimeString() : "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estado del sistema:</span>
                          <span className="text-green-500 font-medium">Activo</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 