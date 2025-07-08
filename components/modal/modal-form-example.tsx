"use client";

import React, { useState } from 'react';
import { ModalForm } from '@/components/modal/modal-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Esquema de validación con Zod
const formSchema = z.object({
  nombre: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor ingrese un correo electrónico válido.',
  }),
  tipo: z.string({
    required_error: 'Por favor seleccione un tipo.',
  }),
  mensaje: z.string().min(10, {
    message: 'El mensaje debe tener al menos 10 caracteres.',
  }).max(500, {
    message: 'El mensaje no puede superar los 500 caracteres.',
  }),
  acepto: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar los términos y condiciones.',
  }),
});

export function ModalFormExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Inicializar React Hook Form con Zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      email: '',
      tipo: '',
      mensaje: '',
      acepto: false,
    },
  });

  // Manejar el envío exitoso del formulario
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setSubmitted(true);
    
    // Restablecer formulario después de 1.5 segundos
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      form.reset();
    }, 1500);
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Modal Form Ejemplo</CardTitle>
        <CardDescription>
          Demostración de un modal con formulario y validaciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Haga clic en el botón para abrir un modal con un formulario que incluye validación, campos de diferentes tipos y animaciones.
        </p>
        <Button onClick={() => setIsOpen(true)}>Abrir Formulario</Button>
      </CardContent>

      <ModalForm
        isOpen={isOpen}
        onClose={() => {
          if (!submitted) {
            setIsOpen(false);
          }
        }}
        title="Formulario de Contacto"
        description="Complete todos los campos para enviar su solicitud"
        size="lg"
      >
        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg 
                className="h-8 w-8 text-green-600" 
                fill="none" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">¡Enviado con éxito!</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Gracias por completar el formulario. Nos pondremos en contacto contigo pronto.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="tu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Solicitud</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="consulta">Consulta</SelectItem>
                        <SelectItem value="sugerencia">Sugerencia</SelectItem>
                        <SelectItem value="problema">Reporte de Problema</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mensaje"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Escribe tu mensaje aquí..." 
                        className="resize-none"
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Máximo 500 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="acepto"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Acepto los términos y condiciones
                      </FormLabel>
                      <FormDescription>
                        Al marcar esta casilla, aceptas nuestros términos de servicio y política de privacidad.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Enviar Formulario</Button>
              </div>
            </form>
          </Form>
        )}
      </ModalForm>
    </Card>
  );
} 