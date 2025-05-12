"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface MobileActionBarProps {
  count: number;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

export const MobileActionBar = ({ count, onAcceptAll, onRejectAll }: MobileActionBarProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t p-4 shadow-lg z-10"
  >
    <div className="flex gap-2 justify-between items-center">
      <span className="font-medium">
        {count} seleccionados
      </span>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={onRejectAll}
        >
          <XCircle className="h-3 w-3" />
          <span>Rechazar</span>
        </Button>
        <Button 
          size="sm" 
          className="gap-1 bg-green-600 hover:bg-green-700"
          onClick={onAcceptAll}
        >
          <CheckCircle2 className="h-3 w-3" />
          <span>Aceptar</span>
        </Button>
      </div>
    </div>
  </motion.div>
); 