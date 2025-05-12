import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import VehicleForm, { VehicleFormValues } from "../components/VehicleForm";

interface AddVehicleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehicleFormValues) => void;
  isSubmitting: boolean;
}


const AddVehicleDialog: React.FC<AddVehicleDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Vehículo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Vehículo</DialogTitle>
          <DialogDescription>
            Ingresa los detalles del nuevo vehículo de transporte.
          </DialogDescription>
        </DialogHeader>
        <VehicleForm 
          onSubmit={onSubmit} 
          buttonText="Añadir Vehículo"
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog; 