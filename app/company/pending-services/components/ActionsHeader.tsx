"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface ActionsHeaderProps {
  selectedCount: number;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

export const ActionsHeader = ({ selectedCount, onAcceptAll, onRejectAll }: ActionsHeaderProps) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex justify-between items-center"
  >
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
      <p className="text-muted-foreground">
        Gestiona las solicitudes de servicio que requieren tu atención
      </p>
    </div>
    
    <div className="hidden md:flex gap-2">
      {selectedCount > 0 && (
        <>
          <Button 
            variant="outline" 
            className="gap-2 group"
            onClick={onRejectAll}
          >
            <XCircle className="h-4 w-4 group-hover:text-red-500 transition-colors" />
            <span className="group-hover:text-red-500 transition-colors">
              Rechazar seleccionados
            </span>
          </Button>
          <Button 
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={onAcceptAll}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Aceptar seleccionados</span>
          </Button>
        </>
      )}
    </div>
  </motion.div>
); 