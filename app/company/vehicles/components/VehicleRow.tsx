import React from "react";
import { motion } from "framer-motion";
import { Vehicle } from "@/app/interfaces";
import { Truck, MoreVertical, Pencil, Trash, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell } from "@/components/ui/table";

interface VehicleRowProps {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
}


const VehicleRow: React.FC<VehicleRowProps> = ({ vehicle, onEdit, onDelete }) => {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="border-b"
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p>{vehicle.model}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{vehicle.plate}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{vehicle.maxLoad} kg</TableCell>
      <TableCell className="hidden md:table-cell">{vehicle.volume} m³</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              Ver detalles
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  );
};

export default VehicleRow; 