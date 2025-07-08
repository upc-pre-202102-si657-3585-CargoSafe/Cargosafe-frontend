"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapContainer } from "@/components/map-container";
import { FormValues } from "../constants";
import { DatePicker } from "./date-picker";
import { LocationDetails } from "../utils/geo-utils";

interface LocationFormProps {
  form: UseFormReturn<FormValues>;
  onNext: () => void;
  onPrevious: () => void;
  showMap: boolean;
  originLocation: LocationDetails | null;
  destinationLocation: LocationDetails | null;
  routeDistance: number | null;
}

export function LocationForm({ 
  form, 
  onNext, 
  onPrevious, 
  showMap, 
  originLocation, 
  destinationLocation, 
  routeDistance 
}: LocationFormProps) {
  // Actualizar los campos del formulario cuando cambien las ubicaciones
  useEffect(() => {
    if (originLocation) {
      form.setValue("country", originLocation.country);
      form.setValue("department", originLocation.department);
      form.setValue("district", originLocation.district);
    }
  }, [originLocation, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la Ubicación</CardTitle>
        <CardDescription>
          Proporciona información sobre los puntos de recogida y entrega.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="pickupAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Recogida</FormLabel>
                <FormControl>
                  <Input placeholder="Av. Javier Prado 2465" {...field} />
                </FormControl>
                <FormDescription>
                  Dirección completa donde se recogerá la carga
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="destinationAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Entrega</FormLabel>
                <FormControl>
                  <Input placeholder="Av. Benavides 1880" {...field} />
                </FormControl>
                <FormDescription>
                  Dirección completa donde se entregará la carga
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="unloadDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Entrega</FormLabel>
                <DatePicker 
                  date={field.value} 
                  setDate={field.onChange} 
                />
                <FormDescription>
                  Selecciona la fecha en que deseas que la carga sea entregada
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Mostrar información de ubicación detectada de manera más limpia */}
        {(originLocation || destinationLocation) && (
          <div className="p-3 border rounded-md bg-muted/10">
            <h4 className="font-medium mb-2">Ubicaciones Detectadas</h4>
            {originLocation && (
              <div className="text-sm space-y-1 mb-2">
                <p className="text-muted-foreground">Ubicación de recogida:</p>
                <p className="font-medium">{originLocation.district}, {originLocation.department}, {originLocation.country}</p>
              </div>
            )}
            
            {destinationLocation && (
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Ubicación de entrega:</p>
                <p className="font-medium">{destinationLocation.district}, {destinationLocation.department}, {destinationLocation.country}</p>
              </div>
            )}
          </div>
        )}
        
        {showMap && originLocation && destinationLocation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            <p className="text-sm text-muted-foreground mb-2">
              Visualización de la ruta (distancia aproximada: {routeDistance} km)
            </p>
            <MapContainer
              originCoords={originLocation.coords}
              destinationCoords={destinationLocation.coords}
              originName="Punto de recogida"
              destinationName="Punto de entrega"
              height="300px"
            />
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button type="button" onClick={onNext}>
          Siguiente
        </Button>
      </CardFooter>
    </Card>
  );
} 