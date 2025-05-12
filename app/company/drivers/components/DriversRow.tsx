import React from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Driver } from '@/app/interfaces';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface DriversRowProps {
  driver: Driver;
  onEdit: (driver: Driver) => void;
  onDelete: (id: number) => void;
}

export function DriversRow({ driver, onEdit, onDelete }: DriversRowProps) {

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 hover:bg-accent/40 rounded-md transition-colors">
      <div className="flex items-center gap-3 w-full">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={driver.photoUrl || ''} alt={driver.name} />
          <AvatarFallback>{getInitials(driver.name)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5">
          <p className="text-sm font-medium">{driver.name}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <p>DNI: {driver.dni}</p>
            <span>•</span>
            <p>Licencia: {driver.license}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center ml-auto gap-2">
        <p className="text-xs text-muted-foreground">{driver.contactNum}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(driver)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(driver.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
