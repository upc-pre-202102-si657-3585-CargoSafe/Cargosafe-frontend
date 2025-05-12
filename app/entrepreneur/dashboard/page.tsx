'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EntrepreneurDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Emprendedor</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Mis Envíos</CardTitle>
            <CardDescription>Seguimiento de sus cargas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Visualice el estado de sus envíos activos.</p>
            <Button asChild className="w-full">
              <Link href="/entrepreneur/shipments">Ver Envíos</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Solicitar Transporte</CardTitle>
            <CardDescription>Cree una nueva solicitud</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Solicite un nuevo servicio de transporte para su carga.</p>
            <Button asChild className="w-full">
              <Link href="/entrepreneur/request-service">Nueva Solicitud</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
            <CardDescription>Historial de servicios</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Consulte todos sus servicios realizados anteriormente.</p>
            <Button asChild className="w-full">
              <Link href="/entrepreneur/history">Ver Historial</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
