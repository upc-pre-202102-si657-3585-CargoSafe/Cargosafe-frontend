"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface EmptyStateProps {
  onRefresh: () => void;
}

export const EmptyState = ({ onRefresh }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.5 }}
    className="text-center py-12 px-4"
  >
    <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
      <Package className="h-8 w-8 text-yellow-600 dark:text-yellow-300" />
    </div>
    <h3 className="text-lg font-medium mb-2">No hay servicios disponibles</h3>
    <p className="text-muted-foreground max-w-md mx-auto mb-6">
      En este momento no hay solicitudes de servicio en el sistema.
    </p>
    <Button onClick={onRefresh}>Actualizar</Button>
  </motion.div>
); 