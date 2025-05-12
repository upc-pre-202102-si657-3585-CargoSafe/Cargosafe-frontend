import { z } from "zod";

// Schema de validación
export const requestServiceSchema = z.object({
  type: z.string().min(1, { message: "Selecciona un tipo de servicio" }),
  numberPackages: z.coerce.number().min(1, { message: "Indica el número de paquetes" }),
  weight: z.string().min(1, { message: "Indica el peso aproximado" }),
  loadDetail: z.string().min(3, { message: "Describe brevemente el contenido" }),
  pickupAddress: z.string().min(5, { message: "Ingresa una dirección de recogida válida" }),
  destinationAddress: z.string().min(5, { message: "Ingresa una dirección de destino válida" }),
  holderName: z.string().min(3, { message: "Ingresa el nombre del titular" }),
  country: z.string().optional(),
  department: z.string().optional(),
  district: z.string().optional(),
  unloadDate: z.date({ required_error: "Selecciona una fecha de entrega" }),
});

export type FormValues = z.infer<typeof requestServiceSchema>;

// Tipos de servicio disponibles
export const serviceTypes = [
  "Carga General", 
  "Carga Frágil", 
  "Carga Pesada", 
  "Documentos", 
  "Alimentos", 
  "Equipos Electrónicos"
];

// Distritos de Lima (para simplificar)
export const districts = [
  "Miraflores", "San Isidro", "Barranco", "San Borja", "La Molina",
  "Santiago de Surco", "Jesús María", "Magdalena", "San Miguel", 
  "Lince", "Pueblo Libre", "Callao", "Chorrillos", "Ate", "Santa Anita",
  "Los Olivos", "San Martín de Porres", "Independencia", "Comas"
];

// Variantes de animación
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  },
};

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
}; 