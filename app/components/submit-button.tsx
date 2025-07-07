'use client';

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  spinnerClassName?: string;
  showSpinner?: boolean;
};


export function SubmitButton({ 
  children, 
  pendingText = "Enviando...", 
  className = "",
  formAction,
  disabled = false,
  size = 'default',
  variant = 'default',
  spinnerClassName,
  showSpinner = true,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isPending = pending;
  
  return (
    <Button
      type="submit"
      className={cn(
        className,
        isPending && "relative"
      )}
      formAction={formAction}
      disabled={isPending || disabled}
      aria-disabled={isPending || disabled}
      size={size}
      variant={variant}
    >
      {/* Spinner de carga */}
      {isPending && showSpinner && (
        <span className="absolute left-0 inset-y-0 flex items-center justify-center w-10">
          <svg
            className={cn("animate-spin h-5 w-5", 
              variant === 'default' ? "text-white" : "text-primary",
              spinnerClassName
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      )}
      
      {/* Texto condicional según el estado */}
      <span className={cn(isPending && showSpinner && "pl-6")}>
        {isPending ? pendingText : children}
      </span>
    </Button>
  );
} 