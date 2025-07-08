import axios from 'axios';
import { API_ENDPOINTS, APP_CONFIG, AuthUtils } from '@/app/config/api';
import { Vehicle, CreateVehicleRequest } from '@/app/interfaces';

// Configurar axios con timeout extendido
axios.defaults.timeout = APP_CONFIG.API_TIMEOUTS;

/**
 * Servicio para gestionar los vehículos en la API
 */
export const VehicleService = {
  /**
   * Obtiene todos los vehículos registrados
   * @returns Promise con el listado de vehículos
   */
  getVehicles: async (): Promise<Vehicle[]> => {
    try {
      console.log('Realizando petición GET a:', API_ENDPOINTS.VEHICLES.BASE);
      
      // Obtener headers con autenticación
      const headers = AuthUtils.createAuthHeaders();
      console.log('Headers de autenticación:', headers);
      
      // Intentar tres veces con diferentes configuraciones si es necesario
      let response;
      try {
        response = await axios.get(API_ENDPOINTS.VEHICLES.BASE, {
          timeout: APP_CONFIG.API_TIMEOUTS,
          headers
        });
      } catch {
        console.warn('Primer intento fallido, reintentando con timeout más largo...');
        response = await axios.get(API_ENDPOINTS.VEHICLES.BASE, { 
          timeout: APP_CONFIG.API_TIMEOUTS * 2,
          headers 
        });
      }
      
      console.log('⭐ Status code:', response.status);
      console.log('⭐ Headers:', response.headers);
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
        console.log('✅ La respuesta es un array directo de vehículos');
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        console.log('La respuesta es un objeto, intentando extraer vehículos...');
        
        // Si la respuesta tiene el formato ApiResponse<Vehicle[]>
        if (Array.isArray(response.data.data)) {
          console.log('✅ Encontrados vehículos en response.data.data');
          return response.data.data;
        }
        
        // Si la respuesta tiene un formato { data: Vehicle[] }
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log('✅ Encontrados vehículos en response.data.data (anidado)');
          return response.data.data;
        }
        
        // Formato { content: Vehicle[] } (como en Spring Data)
        if (response.data.content && Array.isArray(response.data.content)) {
          console.log('✅ Encontrados vehículos en response.data.content');
          return response.data.content;
        }
        
        // Última opción: intentar parsear la respuesta como texto JSON
        if (typeof response.data === 'string') {
          try {
            console.log('Intentando parsear respuesta como JSON...');
            const parsedData = JSON.parse(response.data);
            if (Array.isArray(parsedData)) {
              console.log('✅ Datos parseados son un array');
              return parsedData;
            } else if (parsedData && typeof parsedData === 'object') {
              // Buscar en propiedades del objeto parseado
              for (const key in parsedData) {
                if (Array.isArray(parsedData[key])) {
                  console.log(`✅ Encontrados vehículos en parsedData.${key}`);
                  return parsedData[key];
                }
              }
            }
          } catch (parseError) {
            console.error('Error al parsear respuesta como JSON:', parseError);
          }
        }
        
        // Último intento - buscar cualquier propiedad que tenga un array
        console.log('Buscando cualquier propiedad con array en la respuesta...');
        for (const key in response.data) {
          console.log(`- Revisando propiedad: ${key}, tipo:`, typeof response.data[key]);
          if (Array.isArray(response.data[key])) {
            console.log(`✅ Encontrados vehículos en response.data.${key}`);
            return response.data[key];
          }
        }
      }
      
      // Si no se pudo reconocer el formato, devolver array vacío
      console.warn('❌ No se pudo extraer los vehículos de la respuesta o la respuesta está vacía.');
      
      // Crear vehículos de prueba para desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Modo desarrollo: Devolviendo vehículos de prueba');
        return [
          {
            id: 1,
            model: "Camión de prueba",
            plate: "ABC-123",
            maxLoad: 5000,
            volume: 20,
            photoUrl: ""
          },
          {
            id: 2,
            model: "Furgoneta de prueba",
            plate: "XYZ-789",
            maxLoad: 1500,
            volume: 8,
            photoUrl: ""
          }
        ];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error al obtener vehículos:', error);
      // Mostrar más detalles del error si están disponibles
      if (axios.isAxiosError(error)) {
        console.error('URL:', error.config?.url);
        console.error('Método:', error.config?.method);
        console.error('Status:', error.response?.status);
        console.error('Mensaje de error:', error.response?.data);
      }
      
      // En modo desarrollo, devolver datos de prueba si hay error
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Modo desarrollo: Devolviendo vehículos de prueba debido a error');
        return [
          {
            id: 1,
            model: "Camión de prueba (error)",
            plate: "ABC-123",
            maxLoad: 5000,
            volume: 20,
            photoUrl: ""
          },
          {
            id: 2,
            model: "Furgoneta de prueba (error)",
            plate: "XYZ-789",
            maxLoad: 1500,
            volume: 8,
            photoUrl: ""
          }
        ];
      }
      
      throw error;
    }
  },

  /**
   * Obtiene un vehículo por su ID
   * @param id ID del vehículo
   * @returns Promise con el vehículo encontrado
   */
  getVehicleById: async (id: number): Promise<Vehicle> => {
    try {
      console.log(`Solicitando vehículo con ID ${id} a:`, API_ENDPOINTS.VEHICLES.BY_ID(id));
      const headers = AuthUtils.createAuthHeaders();
      const response = await axios.get<Vehicle>(API_ENDPOINTS.VEHICLES.BY_ID(id), { headers });
      console.log(`Vehículo ${id} recibido:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener vehículo con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo vehículo
   * @param vehicleData Datos del vehículo a crear
   * @returns Promise con el vehículo creado
   */
  createVehicle: async (vehicleData: CreateVehicleRequest): Promise<Vehicle> => {
    try {
      // Asegurarse de que photoUrl no sea undefined antes de enviar
      const dataToSend = {
        ...vehicleData,
        photoUrl: vehicleData.photoUrl || ""
      };
      
      console.log('Creando vehículo con datos:', dataToSend);
      console.log('URL de creación:', API_ENDPOINTS.VEHICLES.BASE);
      
      const headers = AuthUtils.createAuthHeaders();
      console.log('Headers de autenticación para creación:', headers);
      
      const response = await axios.post(API_ENDPOINTS.VEHICLES.BASE, dataToSend, { headers });
      console.log('Respuesta de creación:', response);
      
      // Manejar el caso de respuesta vacía pero status 200
      if (response.status === 200 && (!response.data || response.data === '')) {
        console.log('Vehículo creado exitosamente, pero la respuesta está vacía. Intentando obtener el vehículo creado...');
        
        // Esperar un poco para dar tiempo a que el servidor procese
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Intentar obtener la lista actualizada de vehículos
          const vehicles = await VehicleService.getVehicles();
          
          // Buscar el vehículo recién creado por sus propiedades
          const newVehicle = vehicles.find(v => 
            v.model === dataToSend.model && 
            v.plate === dataToSend.plate
          );
          
          if (newVehicle) {
            console.log('Vehículo encontrado después de creación:', newVehicle);
            return newVehicle;
          }
          
          // Si no lo encontramos, crear un objeto temporal con ID generado
          const tempVehicle: Vehicle = {
            ...dataToSend,
            id: Date.now() // ID temporal
          };
          console.log('Creando objeto de vehículo temporal:', tempVehicle);
          return tempVehicle;
        } catch (fetchError) {
          console.error('Error al intentar obtener el vehículo después de crearlo:', fetchError);
        }
      }
      
      console.log('Vehículo creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear vehículo:', error);
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
   * Actualiza un vehículo existente
   * @param id ID del vehículo a actualizar
   * @param vehicleData Datos actualizados del vehículo
   * @returns Promise con el vehículo actualizado
   */
  updateVehicle: async (id: number, vehicleData: Partial<CreateVehicleRequest>): Promise<Vehicle> => {
    try {
      // Asegurarse de que photoUrl no sea undefined antes de enviar
      const dataToSend = {
        ...vehicleData,
        photoUrl: vehicleData.photoUrl || ""
      };
      
      console.log(`Actualizando vehículo ID ${id} con datos:`, dataToSend);
      console.log('URL de actualización:', API_ENDPOINTS.VEHICLES.BY_ID(id));
      
      const headers = AuthUtils.createAuthHeaders();
      const response = await axios.put(API_ENDPOINTS.VEHICLES.BY_ID(id), dataToSend, { headers });
      console.log('Respuesta de actualización:', response);
      
      // Manejar el caso de respuesta vacía pero status 200
      if (response.status === 200 && (!response.data || response.data === '')) {
        console.log('Vehículo actualizado exitosamente, pero la respuesta está vacía. Intentando obtener el vehículo actualizado...');
        
        try {
          const updatedVehicle = await VehicleService.getVehicleById(id);
          return updatedVehicle;
        } catch (fetchError) {
          console.error(`Error al intentar obtener el vehículo ${id} después de actualizarlo:`, fetchError);
        }
        
        // Si no podemos obtener el vehículo actualizado, devolver un objeto con los datos enviados
        const tempVehicle: Vehicle = {
          id,
          model: dataToSend.model || "",
          plate: dataToSend.plate || "",
          maxLoad: dataToSend.maxLoad || 0,
          volume: dataToSend.volume || 0,
          photoUrl: dataToSend.photoUrl || ""
        };
        
        console.log('Usando objeto de vehículo temporal para actualización:', tempVehicle);
        return tempVehicle;
      }
      
      console.log('Vehículo actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al actualizar vehículo con ID ${id}:`, error);
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
   * Elimina un vehículo
   * @param id ID del vehículo a eliminar
   * @returns Promise vacío si la eliminación fue exitosa
   */
  deleteVehicle: async (id: number): Promise<void> => {
    try {
      console.log(`Eliminando vehículo ID ${id}`);
      console.log('URL de eliminación:', API_ENDPOINTS.VEHICLES.BY_ID(id));
      
      const headers = AuthUtils.createAuthHeaders();
      await axios.delete(API_ENDPOINTS.VEHICLES.BY_ID(id), { headers });
      console.log(`Vehículo ID ${id} eliminado correctamente`);
    } catch (error) {
      console.error(`❌ Error al eliminar vehículo con ID ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('URL:', error.config?.url);
        console.error('Status:', error.response?.status);
        console.error('Mensaje de error:', error.response?.data);
      }
      throw error;
    }
  }
}; 