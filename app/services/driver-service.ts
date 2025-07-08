import axios from 'axios';
import { API_ENDPOINTS, APP_CONFIG, AuthUtils } from '@/app/config/api';
import { Driver, CreateDriverRequest } from '@/app/interfaces';

// Configurar axios con timeout extendido
axios.defaults.timeout = APP_CONFIG.API_TIMEOUTS;

/**
 * Servicio para gestionar los conductores en la API
 */
export const DriverService = {
  /**
   * Obtiene todos los conductores registrados
   * @returns Promise con el listado de conductores
   */
  getDrivers: async (): Promise<Driver[]> => {
    try {
      console.log('Realizando petición GET a:', API_ENDPOINTS.DRIVERS.BASE);
      
      // Obtener headers con autenticación
      const headers = AuthUtils.createAuthHeaders();
      console.log('Headers de autenticación:', headers);
      
      // Realizar petición
      let response;
      try {
        response = await axios.get(API_ENDPOINTS.DRIVERS.BASE, {
          timeout: APP_CONFIG.API_TIMEOUTS,
          headers
        });
      } catch {
        console.warn('Primer intento fallido, reintentando con timeout más largo...');
        response = await axios.get(API_ENDPOINTS.DRIVERS.BASE, { 
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
        console.log('✅ La respuesta es un array directo de conductores');
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        console.log('La respuesta es un objeto, intentando extraer conductores...');
        
        // Si la respuesta tiene formato ApiResponse<Driver[]>
        if (Array.isArray(response.data.data)) {
          console.log('✅ Encontrados conductores en response.data.data');
          return response.data.data;
        }
        
        // Si la respuesta tiene formato { data: Driver[] }
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log('✅ Encontrados conductores en response.data.data (anidado)');
          return response.data.data;
        }
        
        // Si la respuesta tiene formato { content: Driver[] } (común en Spring)
        if (response.data.content && Array.isArray(response.data.content)) {
          console.log('✅ Encontrados conductores en response.data.content');
          return response.data.content;
        }
        
        // Buscar cualquier propiedad que sea un array
        for (const key in response.data) {
          console.log(`- Revisando propiedad: ${key}, tipo:`, typeof response.data[key]);
          if (Array.isArray(response.data[key])) {
            console.log(`✅ Encontrados conductores en response.data.${key}`);
            return response.data[key];
          }
        }
      }
      
      // Si no se pudo reconocer el formato, devolver array vacío
      console.warn('❌ No se pudo extraer los conductores de la respuesta o la respuesta está vacía.');
      
      // Crear conductores de prueba para desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Modo desarrollo: Devolviendo conductores de prueba');
        return [
          {
            id: 1,
            name: "Juan Pérez",
            dni: "12345678",
            license: "A-123456",
            contactNum: "987654321",
            photoUrl: ""
          },
          {
            id: 2,
            name: "María García",
            dni: "87654321",
            license: "B-654321",
            contactNum: "123456789",
            photoUrl: ""
          }
        ];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error al obtener conductores:', error);
      // Mostrar más detalles del error si están disponibles
      if (axios.isAxiosError(error)) {
        console.error('URL:', error.config?.url);
        console.error('Método:', error.config?.method);
        console.error('Status:', error.response?.status);
        console.error('Mensaje de error:', error.response?.data);
      }
      
      // En modo desarrollo, devolver datos de prueba si hay error
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Modo desarrollo: Devolviendo conductores de prueba debido a error');
        return [
          {
            id: 1,
            name: "Juan Pérez (error)",
            dni: "12345678",
            license: "A-123456",
            contactNum: "987654321",
            photoUrl: ""
          },
          {
            id: 2,
            name: "María García (error)",
            dni: "87654321",
            license: "B-654321",
            contactNum: "123456789",
            photoUrl: ""
          }
        ];
      }
      
      throw error;
    }
  },

  /**
   * Obtiene un conductor por su ID
   * @param id ID del conductor
   * @returns Promise con el conductor encontrado
   */
  getDriverById: async (id: number): Promise<Driver> => {
    try {
      console.log(`Solicitando conductor con ID ${id} a:`, API_ENDPOINTS.DRIVERS.BY_ID(id));
      const headers = AuthUtils.createAuthHeaders();
      const response = await axios.get<Driver>(API_ENDPOINTS.DRIVERS.BY_ID(id), { headers });
      console.log(`Conductor ${id} recibido:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener conductor con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo conductor
   * @param driverData Datos del conductor a crear
   * @returns Promise con el conductor creado
   */
  createDriver: async (driverData: CreateDriverRequest): Promise<Driver> => {
    try {
      // Asegurarse de que photoUrl no sea undefined antes de enviar
      const dataToSend = {
        ...driverData,
        photoUrl: driverData.photoUrl || ""
      };
      
      console.log('Creando conductor con datos:', dataToSend);
      console.log('URL de creación:', API_ENDPOINTS.DRIVERS.BASE);
      
      const headers = AuthUtils.createAuthHeaders();
      console.log('Headers de autenticación para creación:', headers);
      
      const response = await axios.post(API_ENDPOINTS.DRIVERS.BASE, dataToSend, { headers });
      console.log('Respuesta de creación:', response);
      
      // Manejar el caso de respuesta vacía pero status 200
      if (response.status === 200 && (!response.data || response.data === '')) {
        console.log('Conductor creado exitosamente, pero la respuesta está vacía. Intentando obtener el conductor creado...');
        
        // Esperar un poco para dar tiempo a que el servidor procese
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Intentar obtener la lista actualizada de conductores
          const drivers = await DriverService.getDrivers();
          
          // Buscar el conductor recién creado por sus propiedades
          const newDriver = drivers.find(d => 
            d.name === dataToSend.name && 
            d.dni === dataToSend.dni
          );
          
          if (newDriver) {
            console.log('Conductor encontrado después de creación:', newDriver);
            return newDriver;
          }
          
          // Si no lo encontramos, crear un objeto temporal con ID generado
          const tempDriver: Driver = {
            ...dataToSend,
            id: Date.now() // ID temporal
          };
          console.log('Creando objeto de conductor temporal:', tempDriver);
          return tempDriver;
        } catch (fetchError) {
          console.error('Error al intentar obtener el conductor después de crearlo:', fetchError);
        }
      }
      
      console.log('Conductor creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear conductor:', error);
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
   * Actualiza un conductor existente
   * @param id ID del conductor a actualizar
   * @param driverData Datos actualizados del conductor
   * @returns Promise con el conductor actualizado
   */
  updateDriver: async (id: number, driverData: Partial<CreateDriverRequest>): Promise<Driver> => {
    try {
      // Asegurarse de que photoUrl no sea undefined antes de enviar
      const dataToSend = {
        ...driverData,
        photoUrl: driverData.photoUrl || ""
      };
      
      console.log(`Actualizando conductor ID ${id} con datos:`, dataToSend);
      console.log('URL de actualización:', API_ENDPOINTS.DRIVERS.BY_ID(id));
      
      const headers = AuthUtils.createAuthHeaders();
      const response = await axios.put(API_ENDPOINTS.DRIVERS.BY_ID(id), dataToSend, { headers });
      console.log('Respuesta de actualización:', response);
      
      // Manejar el caso de respuesta vacía pero status 200
      if (response.status === 200 && (!response.data || response.data === '')) {
        console.log('Conductor actualizado exitosamente, pero la respuesta está vacía. Intentando obtener el conductor actualizado...');
        
        try {
          const updatedDriver = await DriverService.getDriverById(id);
          return updatedDriver;
        } catch (fetchError) {
          console.error(`Error al intentar obtener el conductor ${id} después de actualizarlo:`, fetchError);
        }
        
        // Si no podemos obtener el conductor actualizado, devolver un objeto con los datos enviados
        const tempDriver: Driver = {
          id,
          name: dataToSend.name || "",
          dni: dataToSend.dni || "",
          license: dataToSend.license || "",
          contactNum: dataToSend.contactNum || "",
          photoUrl: dataToSend.photoUrl || ""
        };
        
        console.log('Usando objeto de conductor temporal para actualización:', tempDriver);
        return tempDriver;
      }
      
      console.log('Conductor actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al actualizar conductor con ID ${id}:`, error);
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
   * Elimina un conductor
   * @param id ID del conductor a eliminar
   * @returns Promise vacío si la eliminación fue exitosa
   */
  deleteDriver: async (id: number): Promise<void> => {
    try {
      console.log(`Eliminando conductor ID ${id}`);
      console.log('URL de eliminación:', API_ENDPOINTS.DRIVERS.BY_ID(id));
      
      const headers = AuthUtils.createAuthHeaders();
      await axios.delete(API_ENDPOINTS.DRIVERS.BY_ID(id), { headers });
      console.log(`Conductor ID ${id} eliminado correctamente`);
    } catch (error) {
      console.error(`❌ Error al eliminar conductor con ID ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('URL:', error.config?.url);
        console.error('Status:', error.response?.status);
        console.error('Mensaje de error:', error.response?.data);
      }
      throw error;
    }
  }
};
