/**
 * Formatea una fecha en formato DD/MM/YYYY para asegurar consistencia entre cliente y servidor
 * @param dateString Cadena de fecha en formato ISO o similar
 * @returns Fecha formateada en DD/MM/YYYY
 */
export function formatDateConsistently(dateString: string | null | undefined): string {
  try {

    if (!dateString) {
      return 'Fecha no disponible';
    }
    

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return 'Fecha no disponible';
  }
} 