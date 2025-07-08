"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { AuthUtils } from "@/app/config/api";
import { VehicleService } from "@/app/services/vehicle-service";

import { Vehicle } from "@/app/interfaces";

import {
  VehicleHeader,
  VehicleSearch,
  VehicleList,
  AddVehicleDialog,
  EditVehicleDialog,
  DeleteVehicleDialog,
  VehicleFormValues
} from "./components";


export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [authError, setAuthError] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = AuthUtils.isAuthenticated();
      console.log("🔐 Estado de autenticación:", isAuth);
      
      if (!isAuth) {
        console.log("🔒 Usuario no autenticado, redirigiendo a inicio de sesión");
        setAuthError(true);
        // Se puede redirigir inmediatamente o mostrar un mensaje antes
        // router.push('/sign-in?redirect=/company/vehicles');
      }
      
      AuthUtils.syncToken();
    }
  }, [router]);

  useEffect(() => {
    if (authError) return;
    
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        console.log("🚚 Iniciando carga de vehículos...");
        console.log("🔐 Autenticado:", AuthUtils.isAuthenticated());
        const data = await VehicleService.getVehicles();
        console.log("🚚 Vehículos obtenidos después del procesamiento:", data);
        
        if (data && Array.isArray(data)) {
          console.log(`🚚 Se encontraron ${data.length} vehículos`);
          for (let i = 0; i < data.length; i++) {
            console.log(`🚚 Vehículo ${i+1}:`, data[i]);
          }
        } else {
          console.log("🚚 No se recibieron vehículos o el formato no es correcto");
        }
        
        const validatedVehicles = (data || []).map(vehicle => {
          return {
            id: vehicle?.id || 0,
            model: vehicle?.model || "Modelo desconocido",
            plate: vehicle?.plate || "Sin placa",
            maxLoad: vehicle?.maxLoad || 0,
            volume: vehicle?.volume || 0,
            photoUrl: vehicle?.photoUrl || ""
          };
        });
        
        console.log("🚚 Vehículos validados:", validatedVehicles);
        setVehicles(validatedVehicles);
      } catch (error) {
        console.error("❌ Error al cargar vehículos:", error);
        setVehicles([]); 
        toast.error("Error", {
          description: "No se pudieron cargar los vehículos",
          action: {
            label: "Reintentar",
            onClick: () => fetchVehicles()
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [authError]);

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      (vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (vehicle?.plate?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  const handleAddVehicle = async (data: VehicleFormValues) => {
    try {
      setIsSubmitting(true);
      const vehicleData = {
        ...data,
        maxLoad: Number(data.maxLoad),
        volume: Number(data.volume),
        photoUrl: data.photoUrl || "" 
      };
      console.log("Datos de vehículo a crear:", vehicleData);
      const newVehicle = await VehicleService.createVehicle(vehicleData);
      console.log("Vehículo creado:", newVehicle);
      setVehicles([...vehicles, newVehicle]);
      setIsAddDialogOpen(false);
      toast.success("Vehículo agregado", {
        description: "El vehículo se ha agregado correctamente"
      });
    } catch (error) {
      console.error("Error al agregar vehículo:", error);
      toast.error("Error", {
        description: "No se pudo agregar el vehículo"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVehicle = async (data: VehicleFormValues) => {
    if (!editingVehicle) return;
    
    try {
      setIsSubmitting(true);

      const vehicleData = {
        ...data,
        maxLoad: Number(data.maxLoad),
        volume: Number(data.volume),
        photoUrl: data.photoUrl || "" 
      };
      console.log("Datos de vehículo a actualizar:", vehicleData);
      const updatedVehicle = await VehicleService.updateVehicle(editingVehicle.id, vehicleData);
      console.log("Vehículo actualizado:", updatedVehicle);
      
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle.id === editingVehicle.id ? updatedVehicle : vehicle
        )
      );
      
      setEditingVehicle(null);
      toast.success("Vehículo actualizado", {
        description: "El vehículo se ha actualizado correctamente"
      });
    } catch (error) {
      console.error("Error al actualizar vehículo:", error);
      toast.error("Error", {
        description: "No se pudo actualizar el vehículo"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deletingVehicleId) return;
    
    try {
      await VehicleService.deleteVehicle(deletingVehicleId);
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== deletingVehicleId));
      setDeletingVehicleId(null);
      setIsDeleteDialogOpen(false);
      toast.success("Vehículo eliminado", {
        description: "El vehículo se ha eliminado correctamente"
      });
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el vehículo"
      });
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingVehicleId(id);
    setIsDeleteDialogOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (authError) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Acceso Restringido</CardTitle>
            <CardDescription className="text-center">
              Necesitas iniciar sesión para acceder a esta página
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">
              Esta sección está disponible solo para usuarios autenticados.
            </p>
            <Button onClick={() => router.push('/sign-in?redirect=/company/vehicles')}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >

        <VehicleHeader>
          <span className="text-muted-foreground">{vehicles.length} vehículos</span>
          <AddVehicleDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSubmit={handleAddVehicle}
            isSubmitting={isSubmitting}
          />
        </VehicleHeader>

        <div className="mb-6">
          <VehicleSearch 
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Flota de Vehículos</CardTitle>
            <CardDescription>
              {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehículo' : 'vehículos'} registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VehicleList
              vehicles={filteredVehicles}
              loading={loading}
              searchQuery={searchQuery}
              onEdit={setEditingVehicle}
              onDelete={confirmDelete}
              onClearSearch={clearSearch}
            />
          </CardContent>
        </Card>

        <EditVehicleDialog
          isOpen={!!editingVehicle}
          onOpenChange={(open) => {
            if (!open) setEditingVehicle(null);
          }}
          vehicle={editingVehicle}
          onSubmit={handleUpdateVehicle}
          isSubmitting={isSubmitting}
        />

        <DeleteVehicleDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteVehicle}
          vehicleId={deletingVehicleId}
        />
      </motion.div>
    </div>
  );
} 