"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PendingServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="h-full max-w-[1800px] mx-auto"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
      {children}
    </motion.div>
  );
}
