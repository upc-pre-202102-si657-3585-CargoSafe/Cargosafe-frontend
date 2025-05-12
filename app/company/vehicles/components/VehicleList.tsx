import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Vehicle } from "@/app/interfaces";
import { Loader2 } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import VehicleRow from "./VehicleRow";
import { Button } from "@/components/ui/button";

interface VehicleListProps {
  vehicles: Vehicle[];
  loading: boolean;
  searchQuery: string;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onClearSearch: () => void;
}


const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  loading,
  searchQuery,
  onEdit,
  onDelete,
  onClearSearch
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No se encontraron vehículos</p>
        {searchQuery && (
          <Button variant="link" onClick={onClearSearch}>
            Limpiar búsqueda
          </Button>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vehículo</TableHead>
          <TableHead>Placa</TableHead>
          <TableHead className="hidden md:table-cell">Carga Máx.</TableHead>
          <TableHead className="hidden md:table-cell">Volumen</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <AnimatePresence mode="popLayout">
          {vehicles.map((vehicle) => (
            <VehicleRow
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={() => onEdit(vehicle)}
              onDelete={() => onDelete(vehicle.id)}
            />
          ))}
        </AnimatePresence>
      </TableBody>
    </Table>
  );
};

export default VehicleList; 