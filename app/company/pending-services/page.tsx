"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { RequestService, StatusName } from "@/app/interfaces";
import { ActionsHeader } from "./components/ActionsHeader";
import { SearchBar } from "./components/SearchBar";
import { ServiceCard } from "./components/ServiceCard";
import { EmptyState } from "./components/EmptyState";
import { MobileActionBar } from "./components/MobileActionBar";
import { RequestServiceManager } from "@/app/services/request-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { AuthUtils } from "@/app/config/api";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { RequestServiceDebug } from "./components/RequestServiceDebug";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function PendingServicesPage() {
  const router = useRouter();
  const [pendingServices, setPendingServices] = useState<RequestService[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  
  const [debugMode, setDebugMode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      AuthUtils.syncToken();
      
      const isAuth = AuthUtils.isAuthenticated();
      console.log("🔐 Estado de autenticación:", isAuth);
      
      if (!isAuth) {
        console.log("🔒 Usuario no autenticado");
        setAuthError(true);
        return;
      }
    }
    
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      
      try {

        const services = await RequestServiceManager.getRequestServices();
        console.log("Servicios obtenidos de la API:", services);
        
        setPendingServices(services);
        
        /*
        // Filtrar solo las solicitudes con estado PENDING
        // Algunos servicios pueden no tener un estado definido o tener una estructura diferente
        const pendingOnly = services.filter(service => {
          // Log para depuración
          console.log("Servicio:", service.id, "Estado:", service?.status?.name || "No definido");
          
          // Si el servicio no tiene estado, lo incluimos (asumimos que es pendiente)
          if (!service.status || !service.status.name) {
            return true;
          }
          
          // Si el estado es PENDING, lo incluimos
          return service.status.name === StatusName.PENDING;
        });
        
        console.log("Servicios pendientes filtrados:", pendingOnly);
        
        // Si no hay servicios pendientes pero sí hay servicios, mostrar todos
        if (pendingOnly.length === 0 && services.length > 0) {
          console.log("No se encontraron servicios PENDING, mostrando todos los servicios");
          setPendingServices(services);
        } else {
          setPendingServices(pendingOnly);
        }
        */
      } catch (err: any) {
        console.error("Error al obtener servicios pendientes:", err);
        setError(err.message || "Error al cargar los servicios pendientes");
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  const filteredServices = pendingServices.filter(service => 
    (service.holderName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (service.destination?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (service.loadDetail?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (service.id && service.id.toString().includes(searchQuery))
  );

  const toggleServiceSelection = (id: number) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(serviceId => serviceId !== id) : [...prev, id]
    );
  };

  const toggleServiceExpansion = (id: number) => {
    setExpandedService(prev => prev === id ? null : id);
  };

  const handleAcceptService = async (id: number) => {
    try {
      const serviceToUpdate = pendingServices.find(service => service.id === id);
      if (!serviceToUpdate) return;
      
      await RequestServiceManager.updateRequestService(id, {
        statusId: 2, 
      });
      
      setPendingServices(prev => 
        prev.map(service => 
          service.id === id 
            ? { ...service, status: { id: 2, name: StatusName.ACCEPTED } } 
            : service
        )
      );
      
      setSelectedServices(prev => prev.filter(serviceId => serviceId !== id));
    } catch (err: any) {
      console.error("Error al aceptar el servicio:", err);
      setError(`Error al aceptar el servicio: ${err.message}`);
    }
  };

  const handleRejectService = async (id: number) => {
    try {
      const serviceToUpdate = pendingServices.find(service => service.id === id);
      if (!serviceToUpdate) return;
      
      await RequestServiceManager.updateRequestService(id, {
        statusId: 5, 
      });
      
      setPendingServices(prev => 
        prev.filter(service => service.id !== id)
      );
      
      setSelectedServices(prev => prev.filter(serviceId => serviceId !== id));
    } catch (err: any) {
      console.error("Error al rechazar el servicio:", err);
      setError(`Error al rechazar el servicio: ${err.message}`);
    }
  };

  const handleAcceptAllSelected = async () => {
    const servicesToAccept = [...selectedServices];
    
    for (const id of servicesToAccept) {
      await handleAcceptService(id);
    }
  };

  const handleRejectAllSelected = async () => {
    const servicesToReject = [...selectedServices];
    
    for (const id of servicesToReject) {
      await handleRejectService(id);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const services = await RequestServiceManager.getRequestServices();
      const pendingOnly = services.filter(service => 
        service?.status?.name === StatusName.PENDING
      );
      setPendingServices(pendingOnly);
    } catch (err: any) {
      console.error("Error al actualizar servicios:", err);
      setError(err.message || "Error al actualizar los servicios");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/sign-in?redirect=/company/pending-services');
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
            <Button onClick={() => router.push('/sign-in?redirect=/company/pending-services')}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando solicitudes de servicio...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{error}</p>
            {error.includes("iniciar sesión") && (
              <Button variant="outline" onClick={handleLogin}>
                Iniciar sesión
              </Button>
            )}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={handleRefresh}>
          Intentar nuevamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ActionsHeader 
        selectedCount={selectedServices.length}
        onAcceptAll={handleAcceptAllSelected}
        onRejectAll={handleRejectAllSelected}
      />
      
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setDebugMode(!debugMode)}
          className="text-xs"
        >
          {debugMode ? "Ocultar diagnóstico" : "Mostrar diagnóstico"}
        </Button>
      </div>
      
      {debugMode && <RequestServiceDebug services={pendingServices} />}
      
      <AnimatePresence>
        {filteredServices.length > 0 ? (
          filteredServices.map((service, index) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              index={index}
              isSelected={selectedServices.includes(service.id)}
              isExpanded={expandedService === service.id}
              onToggleSelection={toggleServiceSelection}
              onToggleExpansion={toggleServiceExpansion}
              onAccept={handleAcceptService}
              onReject={handleRejectService}
            />
          ))
        ) : (
          <EmptyState key="empty-state" onRefresh={handleRefresh} />
        )}
      </AnimatePresence>
      
      {filteredServices.length > 0 && selectedServices.length > 0 && (
        <MobileActionBar 
          count={selectedServices.length}
          onAcceptAll={handleAcceptAllSelected}
          onRejectAll={handleRejectAllSelected}
        />
      )}
    </div>
  );
}
