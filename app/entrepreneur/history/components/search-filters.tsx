"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/date-picker";
import { 
  Search, 
  Calendar, 
  FileDown,
  X
} from "lucide-react";
import { itemVariants } from '../constants';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  clearDateFilters: () => void;
  downloadHistory: () => void;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  clearDateFilters,
  downloadHistory
}: SearchFiltersProps) {
  return (
    <motion.div variants={itemVariants} className="mb-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-auto md:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por ID, titular o dirección..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Filtro rápido por período */}
          <Select value={dateFilter} onValueChange={(value) => {
            setDateFilter(value);
            setStartDate(undefined);
            setEndDate(undefined);
          }}>
            <SelectTrigger className="w-full md:w-[180px]">
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por período" />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los períodos</SelectItem>
              <SelectItem value="last-month">Último mes</SelectItem>
              <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
              <SelectItem value="this-year">Este año</SelectItem>
            </SelectContent>
          </Select>

          {/* Botón para descargar */}
          <Button variant="outline" size="icon" onClick={downloadHistory}>
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtro por fecha específica usando DatePicker */}
      <div className="mt-4 border rounded-md p-4 bg-background">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Filtrar por fechas específicas</h3>
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={clearDateFilters} className="h-7 px-2">
              <X className="h-3.5 w-3.5 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date" className="text-sm text-muted-foreground mb-1.5 block">
              Fecha inicial
            </Label>
            <DatePicker
              selected={startDate}
              onSelect={(date) => {
                if (date) {
                  setStartDate(date);
                  setDateFilter("all");
                }
              }}
              placeholder="Seleccionar fecha inicial"
            />
          </div>
          <div>
            <Label htmlFor="end-date" className="text-sm text-muted-foreground mb-1.5 block">
              Fecha final
            </Label>
            <DatePicker
              selected={endDate}
              onSelect={(date) => {
                if (date) {
                  setEndDate(date);
                  setDateFilter("all");
                }
              }}
              placeholder="Seleccionar fecha final"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 