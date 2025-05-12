'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { prefetchUrl } from '@/lib/fetchClient';

interface UseOptimizedFormProps {
  endpointUrl: string;
  onSubmitStart?: () => void;
  onSubmitEnd?: () => void;
  skipPrefetch?: boolean; // Nueva opción para desactivar el prefetch
}

/**
 * Hook personalizado para optimizar el manejo de formularios
 * - Implementa prefetching para mejorar la velocidad percibida
 * - Proporciona eventos de ciclo de vida del envío
 * - Optimiza el manejo del estado del formulario
 */
export function useOptimizedForm({ 
  endpointUrl, 
  onSubmitStart, 
  onSubmitEnd,
  skipPrefetch = false // Por defecto, no saltar prefetch
}: UseOptimizedFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();
  const previousPendingRef = useRef(false);

  // Prefetch de la URL al cargar el componente
  useEffect(() => {
    // Omitir prefetch si se especifica
    if (skipPrefetch) return;

    // Usar un setTimeout para diferir el prefetch y evitar problemas durante la hidratación
    const timeoutId = setTimeout(() => {
      try {
        // Precargar la URL del endpoint para mejorar la velocidad percibida
        prefetchUrl(endpointUrl, { 
          timeout: 3000,
          // El método OPTIONS es menos probable que falle y es más ligero 
          method: 'OPTIONS',
          suppressErrors: true // Asegurar que los errores estén siempre suprimidos
        }).catch(() => {
          // Ignorar errores en prefetch, es solo una optimización
          console.log('[useOptimizedForm] Prefetch silenciosamente ignorado');
        });
      } catch (e) {
        // Captura adicional por si acaso
        console.log('[useOptimizedForm] Error en prefetch manejado');
      }
    }, 1000); // Aumentar el retraso a 1 segundo para evitar problemas de red iniciales

    // Limpiar el timeout si el componente se desmonta
    return () => clearTimeout(timeoutId);
  }, [endpointUrl, skipPrefetch]);

  // Detectar cambios en el estado pending
  useEffect(() => {
    // Si pending cambió de false a true, se inició el envío
    if (pending && !previousPendingRef.current) {
      onSubmitStart?.();
    }
    
    // Si pending cambió de true a false, finalizó el envío
    if (!pending && previousPendingRef.current) {
      onSubmitEnd?.();
    }
    
    previousPendingRef.current = pending;
  }, [pending, onSubmitStart, onSubmitEnd]);

  // Manejar envío de formulario con opciones optimizadas
  const handleSubmit = useCallback((event?: React.FormEvent<HTMLFormElement>) => {
    // No es necesario prevenir el comportamiento predeterminado
  }, []);

  return {
    formRef,
    handleSubmit,
    isSubmitting: pending
  };
} 