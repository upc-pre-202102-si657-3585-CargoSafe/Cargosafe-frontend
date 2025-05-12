"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { Package, MapPin, Truck } from "lucide-react";

// Componentes de formulario
import { CargoInfoForm } from "./components/cargo-info-form";
import { LocationForm } from "./components/location-form";
import { ConfirmationForm } from "./components/confirmation-form";
import { SuccessMessage } from "./components/success-message";

// Utilidades y constantes
import { 
  requestServiceSchema, 
  FormValues, 
  containerVariants, 
  itemVariants, 
  fadeInVariants 
} from "./constants";
import { 
  geocodeLocations, 
  calculateRouteDistance, 
  LocationDetails, 
  DEFAULT_ORIGIN_LOCATION, 
  DEFAULT_DESTINATION_LOCATION 
} from "./utils/geo-utils";

// API Config
import { API_ENDPOINTS, AuthUtils } from "@/app/config/api";
import { RequestServiceManager } from "@/app/services/request-service";
import { loadGoogleMapsScript } from "@/lib/map-service";

export default function RequestServicePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true); // Mostrar mapa por defecto
  
  // Coordenadas y detalles de ubicación
  const [originLocation, setOriginLocation] = useState<LocationDetails | null>(DEFAULT_ORIGIN_LOCATION);
  const [destinationLocation, setDestinationLocation] = useState<LocationDetails | null>(DEFAULT_DESTINATION_LOCATION);
  const [routeDistance, setRouteDistance] = useState<number | null>(calculateRouteDistance(DEFAULT_ORIGIN_LOCATION.coords, DEFAULT_DESTINATION_LOCATION.coords));
  
  // Verificar y sincronizar autenticación al cargar
  useEffect(() => {
    // Sincronizar token entre cookies y localStorage
    if (typeof window !== 'undefined') {
      AuthUtils.syncToken();
      
      // Verificar autenticación después de sincronizar
      const isAuth = AuthUtils.isAuthenticated();
      console.log("Estado de autenticación al cargar:", isAuth);
      
      if (!isAuth) {
        setSubmitError("Necesitas iniciar sesión para crear solicitudes. Por favor inicia sesión primero.");
      } else {
        // Limpiar cualquier error previo si ya está autenticado
        setSubmitError(null);
      }
    }
  }, []);
  
  // Form
  // Inicializar el formulario con React Hook Form y Zod para validación
  const form = useForm<FormValues>({
    resolver: zodResolver(requestServiceSchema),
    defaultValues: {
      type: "",
      numberPackages: 1,
      weight: "",
      loadDetail: "",
      pickupAddress: "",
      destinationAddress: "",
      holderName: "",
      country: "Perú",
      department: "Lima",
      district: "",
      unloadDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
  });

  // Navegar a la siguiente pestaña
  const goToNextTab = () => {
    if (activeTab === "info") {
      setActiveTab("location");
    } else if (activeTab === "location") {
      setActiveTab("confirmation");
    }
  };

  // Navegar a la pestaña anterior
  const goToPreviousTab = () => {
    if (activeTab === "confirmation") {
      setActiveTab("location");
    } else if (activeTab === "location") {
      setActiveTab("info");
    }
  };

  // Observar cambios en las direcciones para geocodificar
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'pickupAddress' || name === 'destinationAddress') {
        handleAddressChange();
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Gestionar cambios en las direcciones
  const handleAddressChange = async () => {
    const pickupAddress = form.watch('pickupAddress');
    const destinationAddress = form.watch('destinationAddress');

    // Solo proceder si ambas direcciones tienen al menos 5 caracteres
    if (pickupAddress.length < 5 || destinationAddress.length < 5) {
      return;
    }

    try {
      // Geocodificar direcciones
      const { origin, destination } = await geocodeLocations(pickupAddress, destinationAddress);

      // Actualizar estado con las ubicaciones
      setOriginLocation(origin);
      setDestinationLocation(destination);

      // Mostrar mapa si ambas ubicaciones están disponibles
      if (origin && destination) {
        setShowMap(true);

        // Calcular distancia de ruta
        const distance = calculateRouteDistance(origin.coords, destination.coords);
        setRouteDistance(distance);
      }
    } catch (error) {
      console.error("Error al geocodificar direcciones:", error);
    }
  };

  // Enviar el formulario
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Sincronizar token primero para asegurar autenticación actualizada
      AuthUtils.syncToken();
      
      // Verificar autenticación primero para evitar procesar datos innecesariamente
      if (!AuthUtils.isAuthenticated()) {
        setIsSubmitting(false);
        setSubmitError("Necesitas iniciar sesión para crear solicitudes de servicio. Serás redirigido al inicio de sesión...");
        
        // Redirigir a login después de 3 segundos
        setTimeout(() => {
          router.push("/sign-in?redirect=" + encodeURIComponent("/entrepreneur/request-service"));
        }, 3000);
        
        return;
      }

      // Asegurarse de que las ubicaciones estén disponibles
      if (!originLocation || !destinationLocation) {
        throw new Error("No se pudieron determinar las ubicaciones correctamente");
      }

      // Log de validación antes de crear el objeto
      console.log("Validando datos antes de crear la solicitud:");
      console.log("- Tipo de servicio:", data.type, typeof data.type);
      console.log("- Dirección de entrega:", data.destinationAddress, typeof data.destinationAddress);
      console.log("- Fecha de entrega:", data.unloadDate, typeof data.unloadDate);
      
      // Verificar fecha correcta
      const formattedDate = data.unloadDate.toISOString().split('T')[0];
      console.log("- Fecha formateada:", formattedDate);

      // Extraer datos para la solicitud y asegurar que los tipos sean correctos
      // Estructura exacta requerida por el backend
      const requestData = {
        unloadDirection: data.destinationAddress,
        type: data.type,
        numberPackages: Number(data.numberPackages),
        country: originLocation.country || "Perú",
        department: originLocation.department || "Lima",
        district: originLocation.district || "Lima",
        destination: destinationLocation.district || "Lima",
        unloadLocation: `${destinationLocation.district}, ${destinationLocation.department}`,
        unloadDate: formattedDate,
        distance: Number(routeDistance || 0),
        statusId: 1, // Estado inicial: Pendiente
        holderName: data.holderName,
        pickupAddress: data.pickupAddress,
        pickupLat: Number(originLocation.coords.lat),
        pickupLng: Number(originLocation.coords.lng),
        destinationAddress: data.destinationAddress,
        destinationLat: Number(destinationLocation.coords.lat),
        destinationLng: Number(destinationLocation.coords.lng),
        loadDetail: data.loadDetail,
        weight: data.weight
      };

      // Validación final de datos
      const requiredFields = ['type', 'unloadDirection', 'unloadDate', 'numberPackages', 'holderName'];
      const missingFields = requiredFields.filter(field => !requestData[field as keyof typeof requestData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
      }

      // Imprimir el JSON completo antes de enviar
      console.log("Datos a enviar al servidor:", JSON.stringify(requestData, null, 2));

      try {
        // Enviar la solicitud al servidor
        const response = await RequestServiceManager.createRequestService(requestData);
        console.log("Respuesta del servidor:", response);

        // Simular un pequeño retardo para la experiencia del usuario
        setTimeout(() => {
          setSubmitSuccess(true);
          setIsSubmitting(false);
        }, 1000);
      } catch (apiError: any) {
        console.error("Error específico de la API:", apiError);
        
        // Verificar si es un error de autenticación y manejarlo adecuadamente
        if (apiError.message && (
            apiError.message.includes("sesión") || 
            apiError.message.includes("token") ||
            apiError.message.includes("autenticación") ||
            apiError.message.includes("iniciar sesión")
        )) {
          setSubmitError("Necesitas iniciar sesión para enviar solicitudes. Por favor, inicia sesión y vuelve a intentarlo.");
          
          // Redirigir a login después de 3 segundos
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else if (apiError.response?.data?.message) {
          setSubmitError(`Error del servidor: ${apiError.response.data.message}`);
        } else if (apiError.message) {
          setSubmitError(apiError.message);
        } else {
          setSubmitError("Ocurrió un error al procesar tu solicitud. Verifica tu conexión e intenta nuevamente.");
        }
        
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("Error al preparar la solicitud:", error);
      setSubmitError(`Error al preparar tu solicitud: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
      <motion.div
          className="container max-w-3xl py-8 px-4 md:px-0"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold tracking-tight">Solicitar Servicio</h1>
          <p className="text-muted-foreground mt-2">
            Completa el formulario para solicitar un servicio de transporte de carga.
          </p>
        </motion.div>

        {submitSuccess ? (
            <SuccessMessage />
        ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit as any)}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <motion.div variants={itemVariants}>
                    <TabsList className="grid grid-cols-3 mb-8">
                      <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Package className="mr-2 h-4 w-4" />
                        Información
                      </TabsTrigger>
                      <TabsTrigger value="location" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        Ubicación
                      </TabsTrigger>
                      <TabsTrigger value="confirmation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Truck className="mr-2 h-4 w-4" />
                        Confirmación
                      </TabsTrigger>
                    </TabsList>
                  </motion.div>

                  <motion.div variants={fadeInVariants}>
                    <TabsContent value="info" className="mt-0">
                      <CargoInfoForm form={form} onNext={goToNextTab} />
                    </TabsContent>

                    <TabsContent value="location" className="mt-0">
                      <LocationForm
                          form={form}
                          onNext={goToNextTab}
                          onPrevious={goToPreviousTab}
                          showMap={showMap}
                          originLocation={originLocation}
                          destinationLocation={destinationLocation}
                          routeDistance={routeDistance}
                      />
                    </TabsContent>

                    <TabsContent value="confirmation" className="mt-0">
                      <ConfirmationForm
                          form={form}
                          onPrevious={goToPreviousTab}
                          isSubmitting={isSubmitting}
                          submitError={submitError}
                          originLocation={originLocation}
                          destinationLocation={destinationLocation}
                          routeDistance={routeDistance}
                      />
                    </TabsContent>
                  </motion.div>
                </Tabs>
              </form>
            </Form>
        )}
      </motion.div>
  );
}