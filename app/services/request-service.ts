import axios from 'axios';
import { API_ENDPOINTS, APP_CONFIG, AuthUtils } from '@/app/config/api';
import { RequestService as RequestServiceType, CreateRequestServiceRequest } from '@/app/interfaces';
import { StatusName } from "@/app/interfaces";
// Configurar axios con timeout extendido
axios.defaults.timeout = APP_CONFIG.API_TIMEOUTS;

/**
 * Servicio para gestionar las solicitudes de servicio en la API
 */
export const RequestServiceManager = {
    /**
     * Obtiene todas las solicitudes de servicio registradas
     * @returns Promise con el listado de solicitudes de servicio
     */
    getRequestServices: async (): Promise<RequestServiceType[]> => {
        try {
            // Verificar autenticación
            if (!AuthUtils.isAuthenticated()) {
                throw new Error("Se requiere autenticación para acceder a esta función");
            }

            console.log('Realizando petición GET a:', API_ENDPOINTS.REQUEST_SERVICES.BASE);

            // Obtener headers con autenticación
            const headers = AuthUtils.createAuthHeaders();
            console.log('Headers de autenticación:', headers);

            // Realizar petición
            let response;
            try {
                response = await axios.get(API_ENDPOINTS.REQUEST_SERVICES.BASE, {
                    timeout: APP_CONFIG.API_TIMEOUTS,
                    headers
                });
            } catch (firstError: unknown) {
                console.warn('Primer intento fallido, verificando causa del error...');
                
                // Si es un error de autenticación (401), no reintentar
                if (axios.isAxiosError(firstError) && firstError.response?.status === 401) {
                    console.error('Error de autenticación:', firstError.response.data);
                    // Limpiar el token para forzar un nuevo inicio de sesión
                    AuthUtils.removeToken();
                    throw new Error("Tu sesión ha expirado. Por favor inicia sesión nuevamente para continuar.");
                }
                
                // Reintentar solo para errores de timeout o conexión
                console.warn('Reintentando con timeout más largo...');
                response = await axios.get(API_ENDPOINTS.REQUEST_SERVICES.BASE, {
                    timeout: APP_CONFIG.API_TIMEOUTS * 2,
                    headers
                });
            }

            console.log('⭐ Status code:', response.status);
            console.log('⭐ Tipo de datos recibidos:', typeof response.data);

            // Si la respuesta está vacía, devolver array vacío
            if (!response.data) {
                console.log('✅ Respuesta vacía, devolviendo array vacío');
                return [];
            }

            // Si la respuesta es un texto vacío, devolver array vacío
            if (typeof response.data === 'string' && response.data.trim() === '') {
                console.log('✅ Respuesta de texto vacío, devolviendo array vacío');
                return [];
            }

            console.log('⭐ Datos recibidos:', response.data);

            // Verificar múltiples formatos posibles de respuesta
            if (Array.isArray(response.data)) {
                console.log('✅ La respuesta es un array directo de solicitudes');
                return response.data;
            } else if (response.data && typeof response.data === 'object') {
                console.log('La respuesta es un objeto, intentando extraer solicitudes...');

                // Si la respuesta tiene formato ApiResponse<RequestService[]>
                if (Array.isArray(response.data.data)) {
                    console.log('✅ Encontradas solicitudes en response.data.data');
                    return response.data.data;
                }

                // Si la respuesta tiene formato { data: RequestService[] }
                if (response.data.data && Array.isArray(response.data.data)) {
                    console.log('✅ Encontradas solicitudes en response.data.data (anidado)');
                    return response.data.data;
                }

                // Si la respuesta tiene formato { content: RequestService[] } (común en Spring)
                if (response.data.content && Array.isArray(response.data.content)) {
                    console.log('✅ Encontradas solicitudes en response.data.content');
                    return response.data.content;
                }

                // Buscar cualquier propiedad que sea un array
                for (const key in response.data) {
                    console.log(`- Revisando propiedad: ${key}, tipo:`, typeof response.data[key]);
                    if (Array.isArray(response.data[key])) {
                        console.log(`✅ Encontradas solicitudes en response.data.${key}`);
                        return response.data[key];
                    }
                }
            }

            // Si no se pudo reconocer el formato, devolver array vacío
            console.warn('❌ No se pudo extraer las solicitudes de la respuesta o la respuesta está vacía.');
            return [];
        } catch (error) {
            console.error('❌ Error al obtener solicitudes de servicio:', error);
            // Mostrar más detalles del error si están disponibles
            if (axios.isAxiosError(error)) {
                console.error('URL:', error.config?.url);
                console.error('Método:', error.config?.method);
                console.error('Status:', error.response?.status);
                console.error('Mensaje de error:', error.response?.data);
                
                // Si es un error de autenticación, indicarlo claramente
                if (error.response?.status === 401) {
                    throw new Error("Se requiere iniciar sesión para acceder a esta información");
                }
            }
            throw error;
        }
    },

    /**
     * Obtiene una solicitud de servicio por su ID
     * @param id ID de la solicitud
     * @returns Promise con la solicitud encontrada
     */
    getRequestServiceById: async (id: number): Promise<RequestServiceType> => {
        try {
            // Verificar autenticación
            if (!AuthUtils.isAuthenticated()) {
                throw new Error("Se requiere autenticación para acceder a esta función");
            }
            
            console.log(`Solicitando servicio con ID ${id} a:`, API_ENDPOINTS.REQUEST_SERVICES.BY_ID(id));
            const headers = AuthUtils.createAuthHeaders();
            const response = await axios.get<RequestServiceType>(API_ENDPOINTS.REQUEST_SERVICES.BY_ID(id), { headers });
            console.log(`Solicitud ${id} recibida:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ Error al obtener solicitud con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crea una nueva solicitud de servicio
     * @param requestData Datos de la solicitud a crear
     * @returns Promise con la solicitud creada
     */
    createRequestService: async (requestData: CreateRequestServiceRequest): Promise<RequestServiceType> => {
        try {
            if (typeof window !== 'undefined') {
                AuthUtils.syncToken();
            }
            if (!AuthUtils.isAuthenticated()) {
                throw new Error("Se requiere iniciar sesión para crear solicitudes de servicio");
            }
            if (!requestData.type || !requestData.unloadDirection || !requestData.unloadDate) {
                throw new Error("Faltan campos requeridos: tipo de servicio, dirección de descarga o fecha");
            }
            // Obtener el userId autenticado desde cookie/localStorage
            let userId: number | null = null;
            if (typeof window !== "undefined") {
                let userInfo = null;
                const userInfoCookie = AuthUtils.getCookie("userInfo");
                if (userInfoCookie) {
                    try {
                        userInfo = JSON.parse(decodeURIComponent(userInfoCookie));
                    } catch {}
                } else {
                    const userInfoStorage = localStorage.getItem("userInfo");
                    if (userInfoStorage) {
                        try {
                            userInfo = JSON.parse(userInfoStorage);
                        } catch {}
                    }
                }
                userId = userInfo?.id ? Number(userInfo.id) : null;
            }
            if (!userId) throw new Error("No se pudo obtener el userId autenticado");

            // Armar el body exactamente como el ejemplo
            const formattedData = {
                unloadDirection: String(requestData.unloadDirection).trim(),
                type: String(requestData.type).trim(),
                numberPackages: Number(requestData.numberPackages),
                country: String(requestData.country || "Perú").trim(),
                department: String(requestData.department || "Lima").trim(),
                district: String(requestData.district || "").trim(),
                destination: String(requestData.destination || "").trim(),
                unloadLocation: String(requestData.unloadLocation || "").trim(),
                unloadDate: String(requestData.unloadDate).trim(),
                distance: Number(requestData.distance || 0),
                statusId: Number(requestData.statusId || 3), // 3 = Pending por defecto
                holderName: String(requestData.holderName || "").trim(),
                pickupAddress: String(requestData.pickupAddress || "").trim(),
                pickupLat: Number(requestData.pickupLat || 0),
                pickupLng: Number(requestData.pickupLng || 0),
                destinationAddress: String(requestData.destinationAddress || "").trim(),
                destinationLat: Number(requestData.destinationLat || 0),
                destinationLng: Number(requestData.destinationLng || 0),
                loadDetail: String(requestData.loadDetail || "").trim(),
                weight: String(requestData.weight || "").trim(),
                userId
            };
            
            console.log('Creando solicitud de servicio con datos:', formattedData);
            console.log('URL de creación:', API_ENDPOINTS.REQUEST_SERVICES.BASE);
            
            // Obtener el token actual para analizar su validez
            const token = AuthUtils.getToken();
            if (!token) {
                throw new Error("No se encontró token de autenticación. Por favor inicia sesión nuevamente.");
            }
            
            // Crear los headers con el token vigente
            const headers = AuthUtils.createAuthHeaders();
            console.log('Headers de autenticación:', headers);
            
            // Verificar que el header de autenticación esté presente y tenga el formato correcto
            const authHeader = headers[APP_CONFIG.AUTH.TOKEN_HEADER as keyof typeof headers];
            if (!authHeader) {
                throw new Error("No se pudo generar el header de autenticación. Por favor inicia sesión nuevamente.");
            }
            
            if (typeof authHeader === 'string' && !authHeader.startsWith(APP_CONFIG.AUTH.TOKEN_PREFIX)) {
                throw new Error("El formato del token de autenticación es incorrecto. Por favor inicia sesión nuevamente.");
            }
            
            // Log adicional para debugging
            if (typeof authHeader === 'string') {
                console.log(`Token utilizado: ${authHeader.substring(0, 15)}...`);
            }
            
            try {
                // Realizar petición POST con body claramente transformado a JSON
                const jsonData = JSON.stringify(formattedData);
                console.log('JSON a enviar:', jsonData);
                
                const response = await axios.post(
                    API_ENDPOINTS.REQUEST_SERVICES.BASE,
                    jsonData,
                    { 
                        headers: {
                            ...headers,
                            'Content-Type': 'application/json;charset=UTF-8'
                        }, 
                        timeout: APP_CONFIG.API_TIMEOUTS * 2 
                    }
                );
                
                console.log('Respuesta de creación - Status:', response.status);
                console.log('Respuesta de creación - Data:', response.data);
                
                // Manejar el caso de respuesta vacía pero status 200
                if (response.status === 200 && (!response.data || response.data === '')) {
                    console.log('Solicitud creada exitosamente, pero la respuesta está vacía. Intentando obtener la solicitud creada...');
                    
                    // Esperar un poco para dar tiempo a que el servidor procese
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    try {
                        // Intentar obtener la lista actualizada de solicitudes
                        const requestServices = await RequestServiceManager.getRequestServices();
                        
                        // Buscar la solicitud recién creada por sus propiedades
                        const newService = requestServices.find(s => 
                            s.holderName === formattedData.holderName && 
                            s.type === formattedData.type &&
                            s.destinationAddress === formattedData.destinationAddress
                        );
                        
                        if (newService) {
                            console.log('Solicitud encontrada después de creación:', newService);
                            return newService;
                        }
                        
                        console.log('No se pudo encontrar la solicitud recién creada');
                    } catch (fetchError) {
                        console.error('Error al intentar obtener la solicitud después de crearla:', fetchError);
                    }
                    
                    // Retornar un objeto construido con los datos de entrada y un ID generado
                    return {
                        id: Date.now(), // ID temporal hasta que se actualice la vista
                        ...formattedData,
                        status: {
                            id: formattedData.statusId,
                            name: StatusName.PENDING
                        },
                        statuses: []
                    };
                }
                
                console.log('Solicitud creada:', response.data);
                return response.data;
            } catch (apiError: unknown) {
                console.error("Error en el intento de creación:", apiError);
                
                // Si es un error de autenticación (401), informar al usuario
                if (axios.isAxiosError(apiError) && apiError.response?.status === 401) {
                    console.error("Error de autenticación 401. Headers enviados:", apiError.config?.headers);
                    // Eliminar el token inválido para forzar un nuevo inicio de sesión
                    AuthUtils.removeToken();
                    throw new Error("Tu sesión ha expirado o es inválida. Por favor inicia sesión nuevamente para continuar.");
                }
                
                // Si es un error de formato o contenido, dar información más detallada
                if (axios.isAxiosError(apiError) && 
                    (apiError.response?.status === 400 || apiError.response?.status === 415)) {
                    let errorMessage = "Error en el formato de los datos: ";
                    
                    if (apiError.response?.data?.message) {
                        errorMessage += apiError.response.data.message;
                    } else if (apiError.message) {
                        errorMessage += apiError.message;
                    } else {
                        errorMessage += "Verifica los campos ingresados e intenta nuevamente.";
                    }
                    
                    throw new Error(errorMessage);
                }
                
                // Si la solicitud ni siquiera llegó al servidor (error de red)
                if (axios.isAxiosError(apiError) && !apiError.response) {
                    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.");
                }
                
                // Reenviar el error original
                throw apiError;
            }
        } catch (error) {
            console.error("❌ Error al crear solicitud de servicio:", error);
            if (axios.isAxiosError(error)) {
                console.error('URL:', error.config?.url);
                console.error('Datos enviados:', error.config?.data);
                console.error('Status:', error.response?.status);
                console.error('Mensaje de error:', error.response?.data);
                console.error('Headers enviados:', error.config?.headers);
            }
            throw error;
        }
    },

    /**
     * Actualiza una solicitud existente
     * @param id ID de la solicitud a actualizar
     * @param requestData Datos actualizados de la solicitud
     * @returns Promise con la solicitud actualizada
     */
    updateRequestService: async (id: number, requestData: Partial<CreateRequestServiceRequest>): Promise<RequestServiceType> => {
        try {
            // Verificar autenticación
            if (!AuthUtils.isAuthenticated()) {
                throw new Error("Se requiere autenticación para acceder a esta función");
            }
            
            // Convertir valores numéricos apropiadamente
            const dataToSend: unknown = { ...requestData };

            if (dataToSend.numberPackages !== undefined) dataToSend.numberPackages = Number(dataToSend.numberPackages);
            if (dataToSend.distance !== undefined) dataToSend.distance = Number(dataToSend.distance);
            if (dataToSend.statusId !== undefined) dataToSend.statusId = Number(dataToSend.statusId);
            if (dataToSend.pickupLat !== undefined) dataToSend.pickupLat = Number(dataToSend.pickupLat);
            if (dataToSend.pickupLng !== undefined) dataToSend.pickupLng = Number(dataToSend.pickupLng);
            if (dataToSend.destinationLat !== undefined) dataToSend.destinationLat = Number(dataToSend.destinationLat);
            if (dataToSend.destinationLng !== undefined) dataToSend.destinationLng = Number(dataToSend.destinationLng);

            console.log(`Actualizando solicitud ID ${id} con datos:`, dataToSend);
            console.log('URL de actualización:', API_ENDPOINTS.REQUEST_SERVICES.BY_ID(id));

            // Crear headers con autenticación correctamente
            const headers = AuthUtils.createAuthHeaders();
            console.log(`Headers de autenticación para actualizar solicitud ${id}:`, headers);
            
            const response = await axios.put(API_ENDPOINTS.REQUEST_SERVICES.BY_ID(id), dataToSend, { headers });
            console.log('Respuesta de actualización:', response);

            // Manejar el caso de respuesta vacía pero status 200
            if (response.status === 200 && (!response.data || response.data === '')) {
                console.log('Solicitud actualizada exitosamente, pero la respuesta está vacía. Intentando obtener la solicitud actualizada...');

                try {
                    const updatedService = await RequestServiceManager.getRequestServiceById(id);
                    return updatedService;
                } catch (fetchError) {
                    console.error(`Error al intentar obtener la solicitud ${id} después de actualizarla:`, fetchError);

                    // Si no podemos obtener la solicitud actualizada, intentar recuperar los datos originales
                    try {
                        const originalService = await RequestServiceManager.getRequestServiceById(id);
                        const updatedService = {
                            ...originalService,
                            ...dataToSend
                        };
                        return updatedService;
                    } catch (origError) {
                        console.error(`Error al intentar obtener la solicitud original ${id}:`, origError);
                    }
                }
            }

            console.log('Solicitud actualizada:', response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ Error al actualizar solicitud con ID ${id}:`, error);
            if (axios.isAxiosError(error)) {
                console.error('URL:', error.config?.url);
                console.error('Datos enviados:', error.config?.data);
                console.error('Status:', error.response?.status);
                console.error('Mensaje de error:', error.response?.data);
            }
            throw error;
        }
    },

    /**
     * Elimina una solicitud de servicio
     * @param id ID de la solicitud a eliminar
     * @returns Promise vacío si la eliminación fue exitosa
     */
    deleteRequestService: async (id: number): Promise<void> => {
        try {
            // Verificar autenticación
            if (!AuthUtils.isAuthenticated()) {
                throw new Error("Se requiere autenticación para acceder a esta función");
            }
            
            console.log(`Eliminando solicitud ID ${id}`);
            console.log('URL de eliminación:', API_ENDPOINTS.REQUEST_SERVICES.BY_ID(id));

            // Crear headers con autenticación correctamente
            const headers = AuthUtils.createAuthHeaders();
            console.log(`Headers de autenticación para eliminar solicitud ${id}:`, headers);
            
            await axios.delete(API_ENDPOINTS.REQUEST_SERVICES.BY_ID(id), { headers });
            console.log(`Solicitud ID ${id} eliminada correctamente`);
        } catch (error) {
            console.error(`❌ Error al eliminar solicitud con ID ${id}:`, error);
            if (axios.isAxiosError(error)) {
                console.error('URL:', error.config?.url);
                console.error('Status:', error.response?.status);
                console.error('Mensaje de error:', error.response?.data);
            }
            throw error;
        }
    }
};