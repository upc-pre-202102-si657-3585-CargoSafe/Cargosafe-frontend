'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Truck, History, ClipboardList } from 'lucide-react';

// Simulación: obtener correo del usuario autenticado (reemplaza por tu lógica real)
const userEmail = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('userInfo') || '{}').username || 'usuario@correo.com') : 'usuario@correo.com';

export default function EntrepreneurDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">¡Hola, <span className="text-primary">{userEmail}</span>!</h1>
        <p className="text-lg text-muted-foreground">Bienvenido a tu panel de control. Gestiona y haz seguimiento de tus servicios de transporte de manera fácil y rápida.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <span className="bg-primary/10 p-3 rounded-full"><ClipboardList className="h-7 w-7 text-primary" /></span>
            <div>
              <CardTitle className="text-lg">Mis Envíos</CardTitle>
              <CardDescription>Seguimiento de tus cargas</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">Visualiza el estado de tus envíos activos y su progreso en tiempo real.</p>
            <Button asChild className="w-full" aria-label="Ver Envíos">
              <Link href="/entrepreneur/shipments"><Truck className="mr-2 h-5 w-5" />Ver Envíos</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <span className="bg-primary/10 p-3 rounded-full"><Truck className="h-7 w-7 text-primary" /></span>
            <div>
              <CardTitle className="text-lg">Solicitar Transporte</CardTitle>
              <CardDescription>Crea una nueva solicitud</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">Solicita un nuevo servicio de transporte para tu carga de forma sencilla y rápida.</p>
            <Button asChild className="w-full" aria-label="Nueva Solicitud">
              <Link href="/entrepreneur/request-service"><Truck className="mr-2 h-5 w-5" />Nueva Solicitud</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <span className="bg-primary/10 p-3 rounded-full"><History className="h-7 w-7 text-primary" /></span>
            <div>
              <CardTitle className="text-lg">Historial</CardTitle>
              <CardDescription>Historial de servicios</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">Consulta todos tus servicios realizados anteriormente y revisa los detalles de cada uno.</p>
            <Button asChild className="w-full" aria-label="Ver Historial">
              <Link href="/entrepreneur/history"><History className="mr-2 h-5 w-5" />Ver Historial</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
