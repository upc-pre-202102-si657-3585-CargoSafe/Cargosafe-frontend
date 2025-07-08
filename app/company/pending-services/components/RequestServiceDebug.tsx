"use client";

import React from "react";
import { RequestService, StatusName } from "@/app/interfaces";

interface RequestServiceDebugProps {
  services: RequestService[];
}

export function RequestServiceDebug({ services }: RequestServiceDebugProps) {
  if (!services || services.length === 0) {
    return (
      <div className="p-4 border rounded bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 my-4">
        <h3 className="font-medium">Información de diagnóstico</h3>
        <p>No se han recibido servicios de la API.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-gray-50 dark:bg-gray-900/50 my-4 overflow-auto max-h-[500px]">
      <h3 className="font-medium mb-2">Información de diagnóstico - {services.length} servicios recibidos</h3>
      
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="border p-3 rounded text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div><strong>ID:</strong> {service.id || "No disponible"}</div>
              <div><strong>Tipo:</strong> {service.type || "No disponible"}</div>
              <div><strong>Estado ID:</strong> {service.status?.id || "No disponible"}</div>
              <div><strong>Estado:</strong> {service.status?.name || "No disponible"}</div>
              <div><strong>Titular:</strong> {service.holderName || "No disponible"}</div>
              <div><strong>Fecha:</strong> {service.unloadDate || "No disponible"}</div>
              <div><strong>Paquetes:</strong> {service.numberPackages || "0"}</div>
              <div><strong>Distancia:</strong> {service.distance || "0"} km</div>
              <div><strong>Origen:</strong> {service.pickupAddress || "No disponible"}</div>
              <div><strong>Destino:</strong> {service.destinationAddress || "No disponible"}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium">Resumen por estado:</p>
        <ul className="text-sm space-y-1 mt-1">
          <li>PENDING: {services.filter(s => s.status?.name === StatusName.PENDING).length}</li>
          <li>ACCEPTED: {services.filter(s => s.status?.name === StatusName.ACCEPTED).length}</li>
          <li>IN_PROGRESS: {services.filter(s => s.status?.name === StatusName.IN_PROGRESS).length}</li>
          <li>COMPLETED: {services.filter(s => s.status?.name === StatusName.COMPLETED).length}</li>
          <li>REJECTED: {services.filter(s => s.status?.name === StatusName.REJECTED).length}</li>
          <li>Sin estado: {services.filter(s => !s.status || !s.status.name).length}</li>
        </ul>
      </div>
    </div>
  );
} 