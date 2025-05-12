import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const vehicleFormSchema = z.object({
  model: z.string().min(2, { message: "El modelo debe tener al menos 2 caracteres" }),
  plate: z.string().min(5, { message: "La placa debe tener un formato válido" }),
  maxLoad: z.coerce.number().min(1, { message: "La carga máxima debe ser mayor a 0" }),
  volume: z.coerce.number().min(1, { message: "El volumen debe ser mayor a 0" }),
  photoUrl: z.string().url({ message: "Debe ser una URL válida" }).optional().or(z.literal("")),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  defaultValues?: Partial<VehicleFormValues>;
  onSubmit: (data: VehicleFormValues) => void;
  buttonText: string;
  isSubmitting: boolean;
}


const VehicleForm: React.FC<VehicleFormProps> = ({ 
  defaultValues, 
  onSubmit, 
  buttonText, 
  isSubmitting 
}) => {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: defaultValues || {
      model: "",
      plate: "",
      maxLoad: 0,
      volume: 0,
      photoUrl: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo</FormLabel>
              <FormControl>
                <Input placeholder="Hyundai H100" {...field} />
              </FormControl>
              <FormDescription>
                Marca y modelo del vehículo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa</FormLabel>
              <FormControl>
                <Input placeholder="ABC-123" {...field} />
              </FormControl>
              <FormDescription>
                Número de placa del vehículo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxLoad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carga Máxima (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volumen (m³)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Foto</FormLabel>
              <FormControl>
                <Input placeholder="https://ejemplo.com/foto.jpg" {...field} />
              </FormControl>
              <FormDescription>
                URL de una imagen del vehículo (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </form>
    </Form>
  );
};

export default VehicleForm; 