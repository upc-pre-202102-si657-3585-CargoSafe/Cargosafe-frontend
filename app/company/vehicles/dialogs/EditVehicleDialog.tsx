import React from "react";
import { Vehicle } from "@/app/interfaces";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VehicleForm, { VehicleFormValues } from "../components/VehicleForm";
interface EditVehicleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onSubmit: (data: VehicleFormValues) => void;
  isSubmitting: boolean;
}



const EditVehicleDialog: React.FC<EditVehicleDialogProps> = ({
  isOpen,
  onOpenChange,
  vehicle,
  onSubmit,
  isSubmitting
}) => {
  if (!vehicle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Vehículo</DialogTitle>
          <DialogDescription>
            Modifica los detalles del vehículo.
          </DialogDescription>
        </DialogHeader>
        <VehicleForm
          defaultValues={{
            model: vehicle.model,
            plate: vehicle.plate,
            maxLoad: vehicle.maxLoad,
            volume: vehicle.volume,
            photoUrl: vehicle.photoUrl || "",
          }}
          onSubmit={onSubmit}
          buttonText="Actualizar Vehículo"
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditVehicleDialog; 