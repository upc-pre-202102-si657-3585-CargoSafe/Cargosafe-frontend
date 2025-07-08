'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TruckIcon, UsersIcon, MapPinIcon, BarChart3Icon } from "lucide-react";
import { VehicleService } from '@/app/services/vehicle-service';
import { RequestServiceManager } from '@/app/services/request-service';
import { DriverService } from '@/app/services/driver-service';
import type { Vehicle, Driver, RequestService } from '@/app/interfaces';

export default function CompanyDashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [services, setServices] = useState<RequestService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [veh, drv, req] = await Promise.all([
          VehicleService.getVehicles(),
          DriverService.getDrivers(),
          RequestServiceManager.getRequestServices()
        ]);
        setVehicles(veh);
        setDrivers(drv);
        setServices(req);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Error al cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingServices = services.filter((service: RequestService) => service.status?.name === 'PENDING');
  const completedTrips = services.filter((service: RequestService) => service.status?.name === 'COMPLETED');

  if (loading) {
    return <div className="text-center py-8">Cargando datos...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">Bienvenido a CargoSafe, su plataforma de gestión de transporte</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              Vehículos registrados en el sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conductores</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">
              Conductores activos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes</CardTitle>
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips.length}</div>
            <p className="text-xs text-muted-foreground">
              Viajes completados este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length > 0 ? `${Math.round((completedTrips.length / services.length) * 100)}%` : '0%'}</div>
            <p className="text-xs text-muted-foreground">
              Eficiencia de entregas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Flota</CardTitle>
            <CardDescription>Administre sus vehículos y conductores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Acciones rápidas</h3>
              <div className="grid gap-2 grid-cols-2">
                <Button asChild>
                  <Link href="/company/vehicles" className="flex items-center gap-2">
                    <TruckIcon className="h-4 w-4" />
                    Ver Vehículos
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/company/drivers" className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    Ver Conductores
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Servicios Pendientes</CardTitle>
            <CardDescription>Solicitudes de servicio por atender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                <p className="text-sm">Tienes {pendingServices.length} solicitudes de servicio pendientes de revisión.</p>
                <Button asChild variant="outline" className="mt-2 w-full">
                  <Link href="/company/pending-services" className="flex items-center justify-center gap-2">
                    <span>Ver solicitudes</span>
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
