'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}


export function LoadingOverlay({
  isLoading,
  message = 'Cargando...',
  fullScreen = false,
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity duration-300',
        fullScreen ? 'inset-0' : 'rounded-lg',
        !fullScreen && 'absolute top-0 left-0 right-0 bottom-0',
        className
      )}
    >
      <div className="flex flex-col items-center p-6 gap-4">
        {/* Spinner SVG optimizado */}
        <div className="h-12 w-12 animate-spin">
          <svg
            className="text-primary"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        
        <p className="text-white font-medium text-center max-w-xs">{message}</p>
      </div>
    </div>
  );
} 