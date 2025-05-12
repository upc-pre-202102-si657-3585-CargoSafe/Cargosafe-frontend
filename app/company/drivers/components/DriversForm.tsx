import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Driver } from '@/app/interfaces';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const driverSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(100, { message: 'El nombre no puede exceder los 100 caracteres' }),
  dni: z
    .string()
    .min(8, { message: 'El DNI debe tener al menos 8 caracteres' })
    .max(20, { message: 'El DNI no puede exceder los 20 caracteres' }),
  license: z
    .string()
    .min(3, { message: 'La licencia debe tener al menos 3 caracteres' })
    .max(20, { message: 'La licencia no puede exceder los 20 caracteres' }),
  contactNum: z
    .string()
    .min(9, { message: 'El número de contacto debe tener al menos 9 caracteres' })
    .max(15, { message: 'El número de contacto no puede exceder los 15 caracteres' }),
  photoUrl: z
    .string()
    .url({ message: 'Debe ser una URL válida' })
    .or(z.literal(''))
    .optional(),
});

export type DriverFormValues = z.infer<typeof driverSchema>;

interface DriversFormProps {
  defaultValues?: Partial<DriverFormValues>;
  onSubmit: (data: DriverFormValues) => void;
  isSubmitting?: boolean;
}

export function DriversForm({ defaultValues, onSubmit, isSubmitting = false }: DriversFormProps) {

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: '',
      dni: '',
      license: '',
      contactNum: '',
      photoUrl: '',
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
                </FormControl>
                <FormDescription>
                  Nombre completo del conductor
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} />
                  </FormControl>
                  <FormDescription>
                    Documento de identidad
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Licencia de conducir</FormLabel>
                  <FormControl>
                    <Input placeholder="A-123456" {...field} />
                  </FormControl>
                  <FormDescription>
                    Número de licencia de conducir
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="contactNum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de contacto</FormLabel>
                <FormControl>
                  <Input placeholder="999888777" {...field} />
                </FormControl>
                <FormDescription>
                  Número de teléfono móvil del conductor
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="photoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de foto (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://ejemplo.com/foto.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  URL de la foto del conductor
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {defaultValues?.name ? 'Actualizar' : 'Crear'} conductor
          </Button>
        </div>
      </form>
    </Form>
  );
}
