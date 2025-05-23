"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Button 
} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Bell, 
  Shield, 
  History,
  Settings,
  Edit,
  Save,
  Upload,
  X,
  Check,
  Lock,
  Mail,
  Phone
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";

// Esquemas de validación para los formularios
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(9, { message: "Número de teléfono inválido" }),
  address: z.string().optional(),
  bio: z.string().optional()
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Ingrese su contraseña actual" }),
  newPassword: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
  confirmPassword: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Componente para la pestaña de Perfil
const ProfileTab = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState("/avatars/01.png");

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "Carlos Rodríguez",
      email: "carlos.rodriguez@example.com",
      phone: "+51 987 654 321",
      address: "Av. La Marina 2000, San Miguel, Lima",
      bio: "Emprendedor apasionado por la logística y el transporte de carga. Buscando siempre soluciones eficientes para mis envíos."
    },
  });

  const onSubmit = (data: z.infer<typeof profileFormSchema>) => {
    console.log(data);
    setIsEditing(false);
    // Aquí iría la lógica para guardar los datos en el backend
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-24 w-24 border-2 border-primary/20">
            <AvatarImage src={avatarSrc} alt="Avatar" />
            <AvatarFallback>CR</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{form.watch("fullName")}</h2>
            <p className="text-muted-foreground">Emprendedor</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button size="sm" onClick={form.handleSubmit(onSubmit)}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" {...field} disabled={!isEditing} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+51 123 456 789" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu dirección" {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biografía</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Cuéntanos un poco sobre ti"
                    className="min-h-32"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEditing && (
            <div className="flex justify-end">
              <Button type="submit">Guardar Cambios</Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

// Componente para la pestaña de Notificaciones
const NotificationsTab = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [appNotifs, setAppNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Preferencias de Notificación</h3>
        <p className="text-sm text-muted-foreground">
          Configura cómo quieres recibir tus notificaciones.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <h4 className="font-medium">Notificaciones por Email</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Recibe alertas sobre tus envíos en tu correo electrónico.
            </p>
          </div>
          <Switch
            checked={emailNotifs}
            onCheckedChange={setEmailNotifs}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
              <h4 className="font-medium">Notificaciones en la Aplicación</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Recibe notificaciones dentro de la aplicación CargoSafe.
            </p>
          </div>
          <Switch
            checked={appNotifs}
            onCheckedChange={setAppNotifs}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <h4 className="font-medium">Notificaciones SMS</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Recibe alertas por mensaje de texto en tu teléfono.
            </p>
          </div>
          <Switch
            checked={smsNotifs}
            onCheckedChange={setSmsNotifs}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Correos de Marketing</h4>
            <p className="text-sm text-muted-foreground">
              Recibe información sobre nuevas características y promociones.
            </p>
          </div>
          <Switch
            checked={marketingEmails}
            onCheckedChange={setMarketingEmails}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button>Guardar Preferencias</Button>
      </div>
    </div>
  );
};

// Componente para la pestaña de Seguridad
const SecurityTab = () => {
  const form = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
  });

  const onSubmit = (data: z.infer<typeof securityFormSchema>) => {
    console.log(data);
    form.reset();
    // Aquí iría la lógica para cambiar la contraseña
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Seguridad de la Cuenta</h3>
        <p className="text-sm text-muted-foreground">
          Actualiza tu contraseña y configura la seguridad de tu cuenta.
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña Actual</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormDescription>
                    Debe tener al menos 8 caracteres.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Cambiar Contraseña</Button>
          </div>
        </form>
      </Form>

      <Separator />

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Sesiones Activas</h4>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Sesión Actual</p>
                    <p className="text-sm text-muted-foreground">Lima, Perú • Chrome en Windows</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                  Activa
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="destructive">Cerrar todas las sesiones</Button>
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de Actividad
const ActivityTab = () => {
  const activities = [
    { 
      id: 1, 
      action: "Inicio de sesión", 
      date: "Hoy, 09:45 AM", 
      device: "Chrome en Windows", 
      location: "Lima, Perú" 
    },
    { 
      id: 2, 
      action: "Envío creado", 
      date: "Ayer, 15:30 PM", 
      details: "Envío #2839 - Documentos" 
    },
    { 
      id: 3, 
      action: "Cambio de contraseña", 
      date: "15 Jul 2023, 10:15 AM", 
      device: "Chrome en Windows", 
      location: "Lima, Perú" 
    },
    { 
      id: 4, 
      action: "Envío completado", 
      date: "10 Jul 2023, 18:22 PM", 
      details: "Envío #2725 - Carga General" 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Actividad Reciente</h3>
        <p className="text-sm text-muted-foreground">
          Historial de actividad de tu cuenta.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{activity.action}</p>
                  {activity.details && (
                    <p className="text-sm">{activity.details}</p>
                  )}
                  {activity.device && (
                    <p className="text-sm text-muted-foreground">
                      {activity.device} • {activity.location}
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{activity.date}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Cargar más actividad</Button>
      </div>
    </div>
  );
};

// Componente principal de la página
export default function ProfilePage() {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-4xl"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Actividad</span>
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="p-6">
              <TabsContent value="profile" className="mt-0">
                <ProfileTab />
              </TabsContent>
              <TabsContent value="notifications" className="mt-0">
                <NotificationsTab />
              </TabsContent>
              <TabsContent value="security" className="mt-0">
                <SecurityTab />
              </TabsContent>
              <TabsContent value="activity" className="mt-0">
                <ActivityTab />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </motion.div>
    </div>
  );
}
