"use client";

import React from "react";
import { DatePicker as GlobalDatePicker } from "@/components/date-picker";

interface DatePickerProps {
  date: Date | undefined; 
  setDate: (date: Date | undefined) => void;
}

export function DatePicker({ date, setDate }: DatePickerProps) {
  return (
    <GlobalDatePicker
      selected={date}
      onSelect={setDate}
      placeholder="Seleccionar fecha de entrega"
    />
  );
} 