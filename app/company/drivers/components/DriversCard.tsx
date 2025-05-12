import React from 'react';
import { Driver } from '@/app/interfaces';
import { MoreHorizontal, Pencil, Trash2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface DriversCardProps {
  driver: Driver;
  onEdit: (driver: Driver) => void;
  onDelete: (id: number) => void;
}

export function DriversCard({ driver, onEdit, onDelete }: DriversCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-4 pt-4">
          <Badge variant="outline" className="font-normal">
            {driver.dni}
          </Badge>
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
        <div className="p-6 pt-0 flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 mt-2 mb-3 border-2">
            <AvatarImage src={driver.photoUrl || ''} alt={driver.name} />
            <AvatarFallback className="text-lg">{getInitials(driver.name)}</AvatarFallback>
          </Avatar>
          <h3 className="font-medium text-base mb-1">{driver.name}</h3>
          <p className="text-sm text-muted-foreground">Licencia: {driver.license}</p>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 flex items-center justify-between p-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Phone className="mr-2 h-4 w-4" />
          {driver.contactNum}
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8"
          onClick={() => onEdit(driver)}
        >
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Editar
        </Button>
      </CardFooter>
    </Card>
  );
}
