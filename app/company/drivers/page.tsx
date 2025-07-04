"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {  AuthUtils } from "@/app/config/api";
import { DriverService } from "@/app/services/driver-service";

import { Driver } from "@/app/interfaces";

import {
  DriversHeader,
  DriversSearch,
  DriversList,

  DriverFormValues
} from "./components";
import { AddDriverDialog } from "./dialogs/AddDriverDialog";
import { EditDriverDialog } from "./dialogs/EditDriverDialog";
import { DeleteDriverDialog } from "./dialogs/DeleteDriverDialog";



export default function DriversPage() {
  const router = useRouter();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [authError, setAuthError] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingDriverId, setDeletingDriverId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = AuthUtils.isAuthenticated();
      console.log("🔐 Estado de autenticación:", isAuth);
      
      if (!isAuth) {
        console.log("🔒 Usuario no autenticado, redirigiendo a inicio de sesión");
        setAuthError(true);

      }
      
      AuthUtils.syncToken();
    }
  }, [router]);

  useEffect(() => {
    if (authError) return;
    
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        console.log("👤 Iniciando carga de conductores...");
        console.log("🔐 Autenticado:", AuthUtils.isAuthenticated());
        const data = await DriverService.getDrivers();
        console.log("👤 Conductores obtenidos después del procesamiento:", data);
        
        if (data && Array.isArray(data)) {
          console.log(`👤 Se encontraron ${data.length} conductores`);
          for (let i = 0; i < data.length; i++) {
            console.log(`👤 Conductor ${i+1}:`, data[i]);
          }
        } else {
          console.log("👤 No se recibieron conductores o el formato no es correcto");
        }
        
        const validatedDrivers = (data || []).map(driver => {
          return {
            id: driver?.id || 0,
            name: driver?.name || "Nombre desconocido",
            dni: driver?.dni || "Sin DNI",
            license: driver?.license || "Sin licencia",
            contactNum: driver?.contactNum || "Sin contacto",
            photoUrl: driver?.photoUrl || ""
          };
        });
        
        console.log("👤 Conductores validados:", validatedDrivers);
        setDrivers(validatedDrivers);
      } catch (error) {
        console.error("❌ Error al cargar conductores:", error);
        setDrivers([]); 
        toast.error("Error", {
          description: "No se pudieron cargar los conductores",
          action: {
            label: "Reintentar",
            onClick: () => fetchDrivers()
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [authError]);


  const filteredDrivers = drivers.filter(
    (driver) =>
      (driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (driver?.dni?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (driver?.license?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );


  const handleAddDriver = async (data: DriverFormValues) => {
    try {
      setIsSubmitting(true);
      const driverData = {
        ...data,
        photoUrl: data.photoUrl || ""
      };
      console.log("Datos de conductor a crear:", driverData);
      const newDriver = await DriverService.createDriver(driverData);
      console.log("Conductor creado:", newDriver);
      setDrivers([...drivers, newDriver]);
      setIsAddDialogOpen(false);
      toast.success("Conductor agregado", {
        description: "El conductor se ha agregado correctamente"
      });
    } catch (error) {
      console.error("Error al agregar conductor:", error);
      toast.error("Error", {
        description: "No se pudo agregar el conductor"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDriver = async (data: DriverFormValues) => {
    if (!editingDriver) return;
    
    try {
      setIsSubmitting(true);
      const driverData = {
        ...data,
        photoUrl: data.photoUrl || "" 
      };
      console.log("Datos de conductor a actualizar:", driverData);
      const updatedDriver = await DriverService.updateDriver(editingDriver.id, driverData);
      console.log("Conductor actualizado:", updatedDriver);
      
      setDrivers(
        drivers.map((driver) =>
          driver.id === editingDriver.id ? updatedDriver : driver
        )
      );
      
      setEditingDriver(null);
      toast.success("Conductor actualizado", {
        description: "El conductor se ha actualizado correctamente"
      });
    } catch (error) {
      console.error("Error al actualizar conductor:", error);
      toast.error("Error", {
        description: "No se pudo actualizar el conductor"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDriver = async () => {
    if (!deletingDriverId) return;
    
    try {
      await DriverService.deleteDriver(deletingDriverId);
      setDrivers(drivers.filter((driver) => driver.id !== deletingDriverId));
      setDeletingDriverId(null);
      setIsDeleteDialogOpen(false);
      toast.success("Conductor eliminado", {
        description: "El conductor se ha eliminado correctamente"
      });
    } catch (error) {
      console.error("Error al eliminar conductor:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el conductor"
      });
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingDriverId(id);
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
            <Button onClick={() => router.push('/sign-in?redirect=/company/drivers')}>
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

        <DriversHeader totalDrivers={drivers.length}>
          <AddDriverDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSubmit={handleAddDriver}
            isSubmitting={isSubmitting}
          />
        </DriversHeader>


        <div className="mb-6">
          <DriversSearch 
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>


        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Conductores</CardTitle>
            <CardDescription>
              {filteredDrivers.length} {filteredDrivers.length === 1 ? 'conductor' : 'conductores'} registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DriversList
              drivers={filteredDrivers}
              loading={loading}
              searchQuery={searchQuery}
              onEdit={setEditingDriver}
              onDelete={confirmDelete}
              clearSearch={clearSearch}
            />
          </CardContent>
        </Card>
      </motion.div>


      {editingDriver && (
        <EditDriverDialog
          driver={editingDriver}
          isOpen={Boolean(editingDriver)}
          onOpenChange={(open) => !open && setEditingDriver(null)}
          onSubmit={handleUpdateDriver}
          isSubmitting={isSubmitting}
        />
      )}


      <DeleteDriverDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteDriver}
        driverName={drivers.find(d => d.id === deletingDriverId)?.name || ""}
      />
    </div>
  );
} 