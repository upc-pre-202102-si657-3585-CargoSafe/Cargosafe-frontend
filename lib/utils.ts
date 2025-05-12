import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilidad para combinar clases de Tailwind de forma segura
 * Evita conflictos y duplicación de clases
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
