"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { format, isAfter, isBefore, isEqual, startOfDay, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Clock3, ClipboardList, Truck, CheckCircle2, XCircle } from "lucide-react";

// API Config
import { API_ENDPOINTS, AuthUtils } from "@/app/config/api";
import { RequestService, StatusName } from "@/app/interfaces";

// Componentes segregados
import { ServiceCard } from './components/service-card';
import { StatsSummary } from './components/stats-summary';
import { SearchFilters } from './components/search-filters';
import { PageHeader } from './components/page-header';
import { containerVariants, itemVariants } from './constants';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [services, setServices] = useState<RequestService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  
  // Estadísticas sobre los servicios
  const stats = {
    total: Array.isArray(services) ? services.length : 0,
    completed: Array.isArray(services) ? services.filter(s => s?.status?.name === StatusName.COMPLETED).length : 0,
    inProgress: Array.isArray(services) ? services.filter(s => s?.status?.name === StatusName.IN_PROGRESS || s?.status?.name === StatusName.ACCEPTED).length : 0,
    pending: Array.isArray(services) ? services.filter(s => s?.status?.name === StatusName.PENDING).length : 0,
    cancelled: Array.isArray(services) ? services.filter(s => s?.status?.name === StatusName.CANCELLED).length : 0,
  };

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;
  
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (typeof window !== 'undefined') {
          AuthUtils.syncToken();
        }
        
        if (!AuthUtils.isAuthenticated()) {
          setError("Necesitas iniciar sesión para ver tu historial de servicios");
          setIsLoading(false);
          return;
        }
        
        const headers = AuthUtils.createAuthHeaders();
        
        const response = await axios.get(API_ENDPOINTS.REQUEST_SERVICES.BASE, { headers });
        console.log("Respuesta de API:", response.data);
        
        if (Array.isArray(response.data)) {
          setServices(response.data);
        } else if (response.data && typeof response.data === 'object') {

          if (Array.isArray(response.data.content)) {
            setServices(response.data.content);
          } else if (Array.isArray(response.data.data)) {
            setServices(response.data.data);
          } else {
            let foundArray = false;
            for (const key in response.data) {
              if (Array.isArray(response.data[key])) {
                setServices(response.data[key]);
                foundArray = true;
                break;
              }
            }
            
            if (!foundArray) {
              setError("El formato de respuesta de la API no es compatible");
              setServices([]);
            }
          }
        } else {
          setError("No se recibieron datos del servidor");
          setServices([]);
        }
      } catch (error: any) {
        console.error("Error al cargar los servicios:", error);
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          } else if (error.response?.status === 403) {
            setError("No tienes permisos para acceder a estos recursos.");
          } else if (error.response?.status === 404) {
            setError("No se encontró el recurso solicitado.");
          } else if (error.message.includes('Network Error')) {
            setError("Error de conexión. Verifica tu conexión a Internet.");
          } else {
            setError(`Error del servidor: ${error.response?.statusText || error.message}`);
          }
        } else {
          setError("Ocurrió un error al cargar los servicios.");
        }
        
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);
  
  const filteredServices = Array.isArray(services) ? services.filter(service => {
    if (!service || typeof service !== 'object') return false;
    
    const statusMatch = 
      activeTab === "all" || 
      (activeTab === "active" && (service?.status?.name === StatusName.IN_PROGRESS || service?.status?.name === StatusName.ACCEPTED)) ||
      (activeTab === "pending" && service?.status?.name === StatusName.PENDING) ||
      (activeTab === "completed" && service?.status?.name === StatusName.COMPLETED) ||
      (activeTab === "cancelled" && service?.status?.name === StatusName.CANCELLED);
    
    const searchMatch = 
      searchTerm === "" ||
      (service.holderName && service.holderName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.loadDetail && service.loadDetail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.pickupAddress && service.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.destinationAddress && service.destinationAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.id && service.id.toString().includes(searchTerm));
    
    let dateMatch = true;
    if (service.unloadDate && (startDate || endDate)) {
      const serviceDate = new Date(service.unloadDate);
      
      if (startDate && endDate) {
        dateMatch = (isAfter(serviceDate, startOfDay(startDate)) || isEqual(serviceDate, startOfDay(startDate))) && 
                   (isBefore(serviceDate, startOfDay(endDate)) || isEqual(serviceDate, startOfDay(endDate)));
      } else if (startDate) {
        dateMatch = isAfter(serviceDate, startOfDay(startDate)) || isEqual(serviceDate, startOfDay(startDate));
      } else if (endDate) {
        dateMatch = isBefore(serviceDate, startOfDay(endDate)) || isEqual(serviceDate, startOfDay(endDate));
      }
    } else if (service.unloadDate && dateFilter !== "all") {
      const serviceDate = new Date(service.unloadDate);
      const now = new Date();
      
      if (dateFilter === "last-month") {
        const lastMonth = subMonths(now, 1);
        dateMatch = isAfter(serviceDate, lastMonth) && isBefore(serviceDate, now);
      } else if (dateFilter === "last-3-months") {
        const last3Months = subMonths(now, 3);
        dateMatch = isAfter(serviceDate, last3Months) && isBefore(serviceDate, now);
      } else if (dateFilter === "this-year") {
        dateMatch = serviceDate.getFullYear() === now.getFullYear();
      }
    }
    
    return statusMatch && searchMatch && dateMatch;
  }) : [];
  
  const toggleServiceDetails = (serviceId: number) => {
    if (expandedServiceId === serviceId) {
      setExpandedServiceId(null);
    } else {
      
      if (expandedServiceId !== null) {
        setExpandedServiceId(null);
        
        setTimeout(() => {
          setExpandedServiceId(serviceId);
        }, 350); 
      } else {
        setExpandedServiceId(serviceId);
      }
    }
  };
  
  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    try {
      // Verificar si dateString es null, undefined o string vacío
      if (!dateString) {
        return 'Fecha no disponible';
      }
      
      // Verificar si la fecha es válida
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return format(date, "d 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return 'Fecha no disponible';
    }
  };
  
  // Descargar historial como CSV
  const downloadHistory = () => {
    if (!Array.isArray(filteredServices) || filteredServices.length === 0) {
      console.warn("No hay servicios para descargar");
      return;
    }

    const headers = ["ID", "Titular", "Tipo", "Estado", "Origen", "Destino", "Fecha", "Distancia", "Paquetes"];
    const csvContent = [
      headers.join(","),
      ...filteredServices.map(service => [
        service.id,
        service.holderName,
        service.type,
        service.status?.name || "Sin estado",
        service.pickupAddress,
        service.destinationAddress,
        service.unloadDate,
        service.distance,
        service.numberPackages
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historial_servicios_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
  };

  // Limpiar filtros de fecha
  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setDateFilter("all");
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container max-w-4xl mx-auto py-8 px-4"
    >
      <PageHeader 
        title="Historial de Servicios" 
        description="Revisa tus solicitudes de servicio anteriores y su estado actual." 
      />
      
      <StatsSummary 
        total={stats.total}
        completed={stats.completed}
        inProgress={stats.inProgress}
        pending={stats.pending}
        cancelled={stats.cancelled}
        completionRate={completionRate}
      />
      
      <SearchFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        clearDateFilters={clearDateFilters}
        downloadHistory={downloadHistory}
      />
      
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5 mb-6">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              <ClipboardList className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Todos</span>
              <span className="md:hidden">Todos</span>
              {stats.total > 0 && <span className="ml-1 text-xs">({stats.total})</span>}
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs md:text-sm">
              <Truck className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Activos</span>
              <span className="md:hidden">Activ.</span>
              {stats.inProgress > 0 && <span className="ml-1 text-xs">({stats.inProgress})</span>}
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs md:text-sm">
              <Clock3 className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Pendientes</span>
              <span className="md:hidden">Pend.</span>
              {stats.pending > 0 && <span className="ml-1 text-xs">({stats.pending})</span>}
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs md:text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Completados</span>
              <span className="md:hidden">Comp.</span>
              {stats.completed > 0 && <span className="ml-1 text-xs">({stats.completed})</span>}
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs md:text-sm">
              <XCircle className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Cancelados</span>
              <span className="md:hidden">Canc.</span>
              {stats.cancelled > 0 && <span className="ml-1 text-xs">({stats.cancelled})</span>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
                <h3 className="text-lg font-medium">{error}</h3>
                {error.includes("sesión") && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.href = '/sign-in?redirect=/entrepreneur/history'}
                  >
                    Iniciar sesión
                  </Button>
                )}
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No se encontraron servicios</h3>
                <p className="text-sm text-muted-foreground mt-1">Ajusta los filtros o realiza una nueva búsqueda</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4"
                >
                  {filteredServices.map(service => (
                    <motion.div key={service.id} variants={itemVariants}>
                      <ServiceCard
                        service={service}
                        formatDate={formatDate}
                        expandedServiceId={expandedServiceId}
                        toggleServiceDetails={toggleServiceDetails}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
