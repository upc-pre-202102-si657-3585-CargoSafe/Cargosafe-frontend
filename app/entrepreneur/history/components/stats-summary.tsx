"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
import { itemVariants } from '../constants';

interface StatsProps {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  cancelled: number;
  completionRate: number;
}

export function StatsSummary({
  total,
  completed,
  inProgress,
  pending,
  completionRate
}: StatsProps) {
  return (
    <motion.div variants={itemVariants} className="mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Resumen de Servicios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Completados</p>
              <p className="text-2xl font-bold text-green-600">{completed}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">En Progreso</p>
              <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{pending}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">Tasa de Completado</span>
              <span className="text-sm font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 