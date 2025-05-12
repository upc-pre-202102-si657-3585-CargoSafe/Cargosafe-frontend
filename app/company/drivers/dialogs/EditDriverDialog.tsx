import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DriversForm, DriverFormValues } from "../components/DriversForm";
import { Driver } from "@/app/interfaces";

interface EditDriverDialogProps {
  driver: Driver;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DriverFormValues) => void;
  isSubmitting?: boolean;
}

export function EditDriverDialog({
  driver,
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: EditDriverDialogProps) {
  const defaultValues: DriverFormValues = {
    name: driver.name,
    dni: driver.dni,
    license: driver.license,
    contactNum: driver.contactNum || "",
    photoUrl: driver.photoUrl || "",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Conductor</DialogTitle>
          <DialogDescription>
            Actualiza los datos del conductor. Todos los campos marcados son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <DriversForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
} 