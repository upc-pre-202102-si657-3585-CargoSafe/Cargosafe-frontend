"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Badge 
} from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Truck, 
  Package, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle,
  Clock3,
  RefreshCw,
  MapIcon,
  ArrowUpDown,
  BookOpen
} from "lucide-react";
import { RequestService, StatusName } from "@/app/interfaces";
import { MapContainer } from "@/components/map-container";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Datos de ejemplo
const mockShipments: RequestService[] = [
  {
    id: 1,
    unloadDirection: "Av. Principal 123",
    type: "Carga General",
    numberPackages: 3,
    country: "Perú",
    department: "Lima",
    district: "Miraflores",
    destination: "Miraflores",
    unloadLocation: "Lima",
    unloadDate: "2023-07-20",
    distance: 15.4,
    holderName: "Juan Pérez",
    pickupAddress: "Av. Arequipa 1520",
    pickupLat: -12.0464,
    pickupLng: -77.0428,
    destinationAddress: "Av. Benavides 1944",
    destinationLat: -12.1219,
    destinationLng: -77.0302,
    loadDetail: "Muebles pequeños para oficina",
    weight: "50kg",
    status: { id: 2, name: StatusName.ACCEPTED },
    statuses: []
  },
  {
    id: 2,
    unloadDirection: "Jr. Los Pinos 456",
    type: "Carga Frágil",
    numberPackages: 1,
    country: "Perú",
    department: "Lima",
    district: "San Isidro",
    destination: "San Isidro",
    unloadLocation: "Lima",
    unloadDate: "2023-07-22",
    distance: 8.7,
    holderName: "María González",
    pickupAddress: "Av. Javier Prado 2400",
    pickupLat: -12.0901,
    pickupLng: -76.9756,
    destinationAddress: "Calle Las Begonias 450",
    destinationLat: -12.0977,
    destinationLng: -77.0282,
    loadDetail: "Equipos electrónicos delicados",
    weight: "15kg",
    status: { id: 3, name: StatusName.IN_PROGRESS },
    statuses: []
  },
  {
    id: 3,
    unloadDirection: "Av. La Marina 890",
    type: "Documentos",
    numberPackages: 2,
    country: "Perú",
    department: "Lima",
    district: "San Miguel",
    destination: "San Miguel",
    unloadLocation: "Lima",
    unloadDate: "2023-07-18",
    distance: 12.3,
    holderName: "Carlos Rodríguez",
    pickupAddress: "Av. Brasil 3500",
    pickupLat: -12.0778,
    pickupLng: -77.0824,
    destinationAddress: "Av. La Marina 2000",
    destinationLat: -12.0776,
    destinationLng: -77.0908,
    loadDetail: "Documentos legales importantes",
    weight: "2kg",
    status: { id: 4, name: StatusName.COMPLETED },
    statuses: []
  }
];

// Componente de tarjeta de envío
const ShipmentCard = ({ shipment }: { shipment: RequestService }) => {
  const [expanded, setExpanded] = useState(false);

  const getBadgeColor = (status: StatusName) => {
    switch (status) {
      case StatusName.PENDING:
        return "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-300";
      case StatusName.ACCEPTED:
        return "bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300";
      case StatusName.IN_PROGRESS:
        return "bg-purple-500/20 text-purple-700 dark:bg-purple-500/30 dark:text-purple-300";
      case StatusName.COMPLETED:
        return "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300";
      case StatusName.CANCELLED:
        return "bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300";
      default:
        return "bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-300";
    }
  };

  const getStatusText = (status: StatusName) => {
    switch (status) {
      case StatusName.PENDING: return "Pendiente";
      case StatusName.ACCEPTED: return "Aceptado";
      case StatusName.IN_PROGRESS: return "En Progreso";
      case StatusName.COMPLETED: return "Completado";
      case StatusName.CANCELLED: return "Cancelado";
      default: return "Desconocido";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {shipment.holderName}
                <Badge className={`ml-2 ${getBadgeColor(shipment.status.name)}`}>
                  {getStatusText(shipment.status.name)}
                </Badge>
              </CardTitle>
              <CardDescription>
                Envío #{shipment.id} - {shipment.type}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? "Ocultar detalles" : "Ver detalles"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>{shipment.numberPackages} paquetes</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{shipment.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(shipment.unloadDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>{shipment.distance.toFixed(1)} km</span>
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      Detalles de la Carga
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span>{shipment.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paquetes:</span>
                        <span>{shipment.numberPackages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Peso:</span>
                        <span>{shipment.weight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contenido:</span>
                        <span>{shipment.loadDetail}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Ubicaciones
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground block">Recogida:</span>
                        <span className="block">{shipment.pickupAddress}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Entrega:</span>
                        <span className="block">{shipment.destinationAddress}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Distancia:</span>
                        <span>{shipment.distance.toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <MapContainer
                    originCoords={{ lat: shipment.pickupLat, lng: shipment.pickupLng }}
                    destinationCoords={{ lat: shipment.destinationLat, lng: shipment.destinationLng }}
                    originName={shipment.pickupAddress}
                    destinationName={shipment.destinationAddress}
                    height="250px"
                  />
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  {shipment.status.name === StatusName.IN_PROGRESS && (
                    <Button variant="outline" size="sm" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Ver detalles de viaje
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="text-xs">
                    <MapIcon className="h-3 w-3 mr-1" />
                    Seguir ruta
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente principal de la página
export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<RequestService[]>(mockShipments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [activeTab, setActiveTab] = useState("all");

  // Filtrar envíos por estado y búsqueda
  const filteredShipments = shipments
    .filter(shipment => {
      // Filtrar por pestaña activa
      if (activeTab === "active" && shipment.status.name !== StatusName.IN_PROGRESS) return false;
      if (activeTab === "pending" && shipment.status.name !== StatusName.ACCEPTED) return false;
      if (activeTab === "completed" && shipment.status.name !== StatusName.COMPLETED) return false;
      
      // Filtrar por estado si no es "all"
      if (statusFilter !== "all" && shipment.status.name !== statusFilter) return false;
      
      // Filtrar por texto de búsqueda
      const searchText = searchQuery.toLowerCase();
      return (
        shipment.holderName.toLowerCase().includes(searchText) ||
        shipment.type.toLowerCase().includes(searchText) ||
        shipment.destination.toLowerCase().includes(searchText) ||
        shipment.loadDetail.toLowerCase().includes(searchText)
      );
    })
    .sort((a, b) => {
      // Ordenar según el criterio seleccionado
      if (sortBy === "date") {
        return new Date(b.unloadDate).getTime() - new Date(a.unloadDate).getTime();
      } else if (sortBy === "distance") {
        return b.distance - a.distance;
      } else {
        return a.id - b.id;
      }
    });

  // Contar envíos por estado
  const counts = {
    active: shipments.filter(s => s.status.name === StatusName.IN_PROGRESS).length,
    pending: shipments.filter(s => s.status.name === StatusName.ACCEPTED).length,
    completed: shipments.filter(s => s.status.name === StatusName.COMPLETED).length,
    all: shipments.length
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Envíos</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y haz seguimiento de todos tus envíos activos
            </p>
          </div>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Todos
              <Badge variant="secondary" className="ml-2">{counts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock3 className="h-4 w-4 mr-1" />
              En progreso
              <Badge variant="secondary" className="ml-2">{counts.active}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="h-4 w-4 mr-1" />
              Pendientes
              <Badge variant="secondary" className="ml-2">{counts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completados
              <Badge variant="secondary" className="ml-2">{counts.completed}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, tipo o destino..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value={StatusName.PENDING}>Pendiente</SelectItem>
                  <SelectItem value={StatusName.ACCEPTED}>Aceptado</SelectItem>
                  <SelectItem value={StatusName.IN_PROGRESS}>En Progreso</SelectItem>
                  <SelectItem value={StatusName.COMPLETED}>Completado</SelectItem>
                  <SelectItem value={StatusName.CANCELLED}>Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Fecha de entrega</SelectItem>
                  <SelectItem value="distance">Distancia</SelectItem>
                  <SelectItem value="id">ID de envío</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <AnimatePresence>
              {filteredShipments.length > 0 ? (
                filteredShipments.map(shipment => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">No se encontraron envíos que coincidan con los filtros.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="active" className="mt-0">
            <AnimatePresence>
              {filteredShipments.length > 0 ? (
                filteredShipments.map(shipment => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">No tienes envíos en progreso actualmente.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            <AnimatePresence>
              {filteredShipments.length > 0 ? (
                filteredShipments.map(shipment => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">No tienes envíos pendientes actualmente.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <AnimatePresence>
              {filteredShipments.length > 0 ? (
                filteredShipments.map(shipment => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">No tienes envíos completados que coincidan con los filtros.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
