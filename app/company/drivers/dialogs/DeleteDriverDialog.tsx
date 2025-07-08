import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface DeleteDriverDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  driverName: string;
}

export function DeleteDriverDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  driverName,
}: DeleteDriverDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-3">
            ¿Estás seguro de que deseas eliminar al conductor {" "}
            <span className="font-medium text-foreground">{driverName}</span>?
          </AlertDialogDescription>
          <div className="mt-3 text-sm bg-amber-50 border border-amber-200 p-3 rounded-md">
            Esta acción no se puede deshacer. El conductor será eliminado permanentemente
            de nuestros servidores.
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 