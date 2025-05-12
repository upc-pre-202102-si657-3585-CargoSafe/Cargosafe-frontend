import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DriversForm, DriverFormValues } from "../components/DriversForm";

interface AddDriverDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DriverFormValues) => void;
  isSubmitting?: boolean;
}

export function AddDriverDialog({ 
  isOpen, 
  onOpenChange, 
  onSubmit,
  isSubmitting = false
}: AddDriverDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          id="add-driver-trigger"
          variant="ghost"
          className="hidden"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Agregar Conductor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agregar Conductor</DialogTitle>
          <DialogDescription>
            Ingresa los datos del nuevo conductor. Todos los campos marcados son obligatorios.
          </DialogDescription>
        </DialogHeader>
        
        <DriversForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
} 