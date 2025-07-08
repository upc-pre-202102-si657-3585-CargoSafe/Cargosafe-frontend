import {
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck,
  LucideIcon
} from "lucide-react";

import { StatusName } from "@/app/interfaces";

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  },
};

interface StatusColorMap {
  [key: string]: string;
}

interface StatusLabelMap {
  [key: string]: string;
}

export const statusColors: StatusColorMap = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900",
  ACCEPTED: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900",
  IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900",
  COMPLETED: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900",
  CANCELLED: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
};

export const getStatusIcon = (status: string): LucideIcon => {
  const icons: Record<string, LucideIcon> = {
    PENDING: Clock,
    ACCEPTED: CheckCircle2,
    IN_PROGRESS: Truck,
    COMPLETED: CheckCircle2,
    CANCELLED: XCircle,
  };
  return icons[status] || Clock;
};

export const statusLabels: StatusLabelMap = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptado",
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
}; 