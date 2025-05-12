"use client";

import React from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { fadeInVariants } from "../constants";

export function SuccessMessage() {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      className="my-8"
    >
      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-300">¡Solicitud enviada con éxito!</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          Tu solicitud de servicio ha sido registrada. Pronto nos pondremos en contacto contigo.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
} 