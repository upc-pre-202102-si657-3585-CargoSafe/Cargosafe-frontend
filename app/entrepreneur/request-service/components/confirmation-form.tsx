"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Map as MapIcon, Package2, MapPin, Navigation, Pin } from "lucide-react";
import { MapContainer } from "@/components/map-container";
import { Maps } from "@/components/maps";
import { FormValues } from "../constants";
import { LatLng } from "@/lib/map-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationDetails } from "../utils/geo-utils";
import { AuthUtils } from "@/app/config/api";
import Link from "next/link";

interface ConfirmationFormProps {
  form: UseFormReturn<FormValues>;
  onPrevious: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  originLocation: LocationDetails | null;
  destinationLocation: LocationDetails | null;
  routeDistance: number | null;
}

export function ConfirmationForm({ 
  form, 
  onPrevious, 
  isSubmitting, 
  submitError, 
  originLocation, 
  destinationLocation, 
  routeDistance 
}: ConfirmationFormProps) {
  const [showMap, setShowMap] = useState(false);
  const [showLocationsMap, setShowLocationsMap] = useState(false);
  const [mapMode, setMapMode] = useState<"route" | "pickup" | "delivery">("route");

  // Manejar el botón de mostrar/ocultar mapa
  const handleToggleMap = useCallback(() => {
    setShowMap(prev => !prev);
  }, []);

  // Manejar el botón de mostrar/ocultar mapa de ubicaciones
  const handleToggleLocationsMap = useCallback(() => {
    setShowLocationsMap(prev => !prev);
  }, []);

  // Componente de mapa memorizado para evitar re-renders innecesarios
  const mapComponent = useMemo(() => {
    if (!showMap || !originLocation || !destinationLocation) return null;
    
    return (
      <MapContainer
        originCoords={originLocation.coords}
        destinationCoords={destinationLocation.coords}
        originName={form.watch("pickupAddress")}
        destinationName={form.watch("destinationAddress")}
        height="350px"
      />
    );
  }, [showMap, originLocation, destinationLocation, form]);

  // Componente de mapa de ubicaciones memorizado
  const locationsMapComponent = useMemo(() => {
    if (!showLocationsMap || !originLocation || !destinationLocation) return null;
    
    // Mostrar mapa según el modo seleccionado
    if (mapMode === "route") {
      return (
        <Maps
          originCoords={originLocation.coords}
          destinationCoords={destinationLocation.coords}
          originName={form.watch("pickupAddress")}
          destinationName={form.watch("destinationAddress")}
          showRoute={true}
          height="350px"
        />
      );
    } else if (mapMode === "pickup") {
      // Para la ubicación de recogida, usamos solo ese punto
      return (
        <Maps
          originCoords={originLocation.coords}
          destinationCoords={originLocation.coords}
          originName={form.watch("pickupAddress")}
          destinationName=""
          showRoute={false}
          height="350px"
        />
      );
    } else {
      // Para la ubicación de entrega, usamos solo ese punto
      return (
        <Maps
          originCoords={destinationLocation.coords}
          destinationCoords={destinationLocation.coords}
          originName={form.watch("destinationAddress")}
          destinationName=""
          showRoute={false}
          height="350px"
        />
      );
    }
  }, [showLocationsMap, originLocation, destinationLocation, form, mapMode]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmación de Servicio</CardTitle>
        <CardDescription>
          Revisa los detalles de tu solicitud antes de enviarla.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Package2 className="h-5 w-5 text-primary" />
              Información de la Carga
            </h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Titular:</p>
                <p>{form.watch("holderName") || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de Servicio:</p>
                <p>{form.watch("type") || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Número de Paquetes:</p>
                <p>{form.watch("numberPackages") || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peso Aproximado:</p>
                <p>{form.watch("weight") || "No especificado"}</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-muted-foreground">Descripción:</p>
              <p>{form.watch("loadDetail") || "No especificado"}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Ubicaciones
            </h3>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dirección de Recogida:</p>
                <p>{form.watch("pickupAddress") || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dirección de Entrega:</p>
                <p>{form.watch("destinationAddress") || "No especificado"}</p>
              </div>
              {originLocation && destinationLocation && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ubicación de recogida:</p>
                  <p>{originLocation.district}, {originLocation.department}, {originLocation.country}</p>
                  <p className="text-sm font-medium text-muted-foreground mt-2">Ubicación de entrega:</p>
                  <p>{destinationLocation.district}, {destinationLocation.department}, {destinationLocation.country}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de Entrega:</p>
                <p>
                  {form.watch("unloadDate") 
                    ? new Date(form.watch("unloadDate")).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : "No especificado"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleToggleMap}
                  disabled={!originLocation || !destinationLocation}
                >
                  <MapIcon className="mr-2 h-4 w-4" />
                  {showMap ? "Ocultar ruta" : "Ver ruta"}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleToggleLocationsMap}
                  disabled={!originLocation || !destinationLocation}
                >
                  <Pin className="mr-2 h-4 w-4" />
                  {showLocationsMap ? "Ocultar ubicaciones" : "Ver ubicaciones"}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Mapa interactivo con la ruta */}
          {mapComponent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              {mapComponent}
            </motion.div>
          )}
          
          {/* Mapa interactivo para ver ubicaciones */}
          {showLocationsMap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div className="mb-2">
                <Tabs 
                  value={mapMode} 
                  onValueChange={(value) => setMapMode(value as "route" | "pickup" | "delivery")}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="route" className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      <span>Ruta</span>
                    </TabsTrigger>
                    <TabsTrigger value="pickup" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Recogida</span>
                    </TabsTrigger>
                    <TabsTrigger value="delivery" className="flex items-center gap-1">
                      <Pin className="h-3 w-3" />
                      <span>Entrega</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {locationsMapComponent}
            </motion.div>
          )}
          
          {/* Distancia estimada y tiempo */}
          {routeDistance && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium">Información de la Ruta</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Distancia Aproximada:</p>
                  <p>{routeDistance} km</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tiempo Estimado:</p>
                  <p>{Math.ceil(routeDistance / 50 * 60)} minutos</p>
                </div>
              </div>
            </div>
          )}
          
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{submitError}</p>
                
                {/* Mostrar botón de inicio de sesión si el error está relacionado con autenticación */}
                {submitError.toLowerCase().includes("iniciar sesión") && (
                  <div className="pt-2">
                    <Button asChild variant="outline" size="sm" className="bg-white/50 hover:bg-white/80 text-black">
                      <Link href="/sign-in?redirect=/entrepreneur/request-service">
                        Iniciar Sesión
                      </Link>
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !AuthUtils.isAuthenticated()}
          title={!AuthUtils.isAuthenticated() ? "Debes iniciar sesión primero" : ""}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : !AuthUtils.isAuthenticated() ? (
            "Inicia Sesión para Enviar"
          ) : (
            "Enviar Solicitud"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 