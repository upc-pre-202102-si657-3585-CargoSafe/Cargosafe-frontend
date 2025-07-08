import React from "react";
import { Truck } from "lucide-react";
import { Vehicle } from "@/app/interfaces";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
}


const VehicleCard: React.FC<VehicleCardProps> = ({ 
  vehicle, 
  onEdit, 
  onDelete 
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 rounded-full p-2">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{vehicle.model}</CardTitle>
          </div>
          <Badge variant="outline" className="ml-2">
            {vehicle.plate}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Carga máxima:</span>
            <span className="font-medium">{vehicle.maxLoad} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Volumen:</span>
            <span className="font-medium">{vehicle.volume} m³</span>
          </div>
          
          {vehicle.photoUrl && (
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-md">
              <img 
                src={vehicle.photoUrl} 
                alt={`Vehículo ${vehicle.model}`} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder-vehicle.png";
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard; 