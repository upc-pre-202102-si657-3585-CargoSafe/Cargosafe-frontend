"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, MapPin, Calendar, User2, Package2, AlertCircle } from "lucide-react";
import { API_ENDPOINTS, AuthUtils } from "@/app/config/api";
import { useRouter } from "next/navigation";
import type { RequestService } from "@/app/interfaces";

export default function TripsPage() {
  const [trips, setTrips] = useState<RequestService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchTrips = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_ENDPOINTS.REQUEST_SERVICES.BASE, {
        headers: AuthUtils.createAuthHeaders(),
      });
      if (!res.ok) throw new Error("No se pudieron obtener los viajes");
      const data = await res.json();
      setTrips(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      let errorMsg = "Error al cargar los viajes";
      if (
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof (e as { message?: unknown }).message === "string"
      ) {
        errorMsg = (e as { message: string }).message;
      }
      setError(errorMsg);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Package2 className="h-6 w-6 text-primary" /> Flota de Viajes
          </CardTitle>
          <CardDescription>
            Visualiza y gestiona todos los servicios de transporte registrados en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Cargando viajes...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-10 w-10 text-destructive mb-2" />
              <p className="text-destructive font-medium mb-4">{error}</p>
              <Button variant="outline" onClick={fetchTrips}>Reintentar</Button>
            </div>
          ) : trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <MapPin className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground font-medium">No hay viajes registrados</p>
              <p className="text-sm text-muted-foreground mb-4">Cuando se registren servicios de transporte, aparecerán aquí.</p>
              <Button variant="outline" onClick={fetchTrips}>Actualizar</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Titular</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id} className="hover:bg-accent/40 transition-colors">
                      <TableCell className="font-medium">{trip.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User2 className="h-4 w-4 text-muted-foreground" />
                          {trip.holderName || "-"}
                        </div>
                      </TableCell>
                      <TableCell>{trip.type || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          {trip.destination || trip.destinationAddress || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {trip.unloadDate ? new Date(trip.unloadDate).toLocaleDateString() : "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {trip.status?.name?.toLowerCase() || "pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/company/trips/${trip.id}`)}
                          aria-label="Ver detalles"
                        >
                          <Eye className="h-4 w-4 mr-1" /> Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
