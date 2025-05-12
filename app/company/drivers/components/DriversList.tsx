import React from 'react';
import { Driver } from '@/app/interfaces';
import { Loader2, AlertCircle, Users, Search } from 'lucide-react';
import { DriversRow } from './DriversRow';
import { Button } from '@/components/ui/button';

interface DriversListProps {
  drivers: Driver[];
  loading: boolean;
  searchQuery: string;
  onEdit: (driver: Driver) => void;
  onDelete: (id: number) => void;
  clearSearch?: () => void;
}

export function DriversList({ 
  drivers, 
  loading, 
  searchQuery,
  onEdit, 
  onDelete,
  clearSearch
}: DriversListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando conductores...</p>
      </div>
    );
  }

  if (drivers.length === 0 && !searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay conductores registrados</h3>
        <p className="text-muted-foreground mt-1 mb-4">
          Agrega conductores para comenzar a gestionarlos.
        </p>
        <Button onClick={() => document.getElementById('add-driver-trigger')?.click()}>
          Agregar conductor
        </Button>
      </div>
    );
  }

  if (drivers.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No se encontraron resultados</h3>
        <p className="text-muted-foreground mt-1 mb-4">
          No hay conductores que coincidan con &quot;{searchQuery}&quot;
        </p>
        {clearSearch && (
          <Button variant="outline" onClick={clearSearch}>
            Limpiar búsqueda
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {drivers.map((driver) => (
        <DriversRow
          key={driver.id}
          driver={driver}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
