import React from 'react';
import { PlusCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DriversHeaderProps {
  children?: React.ReactNode;
}

export function DriversHeader({ children }: DriversHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Conductores
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestiona los conductores de tu empresa
        </p>
      </div>
      <div className="flex-shrink-0">
        <Button className="gap-1.5" onClick={() => document.getElementById('add-driver-trigger')?.click()}>
          <PlusCircle className="h-4 w-4" />
          <span>Agregar Conductor</span>
        </Button>
      </div>
      {children}
    </div>
  );
}
