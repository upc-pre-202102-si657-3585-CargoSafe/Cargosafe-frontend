import { useState, useCallback } from "react";
import { ApiResponse } from "@/app/interfaces";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  skipContentType?: boolean;
}

interface UseFetchReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  fetch: (url: string, options?: FetchOptions) => Promise<T | null>;
  post: <R>(url: string, body: any, options?: FetchOptions) => Promise<R | null>;
  put: <R>(url: string, body: any, options?: FetchOptions) => Promise<R | null>;
  patch: <R>(url: string, body: any, options?: FetchOptions) => Promise<R | null>;
  remove: (url: string, options?: FetchOptions) => Promise<boolean>;
  reset: () => void;
}

/**
 * Hook personalizado para realizar peticiones HTTP
 * @param mockData - Datos de ejemplo para usar en desarrollo
 * @param useMockOnError - Si es true, se usarán los datos de ejemplo cuando ocurra un error
 * @returns Objeto con métodos para realizar peticiones HTTP
 */
export function useMethodsHttp<T>(
  mockData?: T,
  useMockOnError: boolean = true
): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para simular una petición con datos de ejemplo
   */
  const simulateFetch = async <R>(mockResponse?: R): Promise<R | null> => {
    // Simulamos un retraso para imitar una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (mockResponse) {
      return mockResponse;
    }
    if (mockData) {
      return mockData as unknown as R;
    }
    return null;
  };

  /**
   * Función para construir la URL con parámetros
   */
  const buildUrl = (url: string, params?: Record<string, string>): string => {
    if (!params) return url;
    
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    return `${url}${url.includes('?') ? '&' : '?'}${queryParams.toString()}`;
  };

  /**
   * Función para procesar la respuesta HTTP
   */
  const processResponse = async <R>(response: Response): Promise<R> => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    let responseText;
    try {
      responseText = await response.text();
      
      // Verificamos que la respuesta no esté vacía
      if (!responseText || responseText.trim() === '') {
        console.warn(`[API] Respuesta vacía recibida de: ${response.url}`);
        throw new Error('Respuesta vacía del servidor');
      }
      
      try {
        // Parseamos la respuesta como JSON
        const parsedData = JSON.parse(responseText);
        
        // Verificamos si la respuesta es un array o un objeto
        if (Array.isArray(parsedData)) {
          // Si es un array, lo devolvemos directamente
          console.info('[API] Respuesta recibida como array JSON');
          return parsedData as R;
        } else if (parsedData && typeof parsedData === 'object') {
          // Verificamos si la respuesta sigue el formato ApiResponse
          if ('success' in parsedData && 'data' in parsedData) {
            // Es una ApiResponse
            const apiResponse = parsedData as ApiResponse<R>;
            if (apiResponse.success && apiResponse.data) {
              return apiResponse.data;
            } else {
              throw new Error(apiResponse.message || 'Error en la respuesta del servidor');
            }
          } else {
            // Si no es ApiResponse pero es un objeto válido, asumimos que es la data directamente
            console.info('[API] Respuesta recibida como objeto JSON');
            return parsedData as R;
          }
        } else {
          throw new Error('Formato de respuesta desconocido');
        }
      } catch (jsonError) {
        console.error('[API] Error al analizar JSON:', jsonError);
        console.log('[API] Texto de respuesta recibido:', responseText);
        throw new Error('Error al procesar la respuesta del servidor como JSON');
      }
    } catch (error) {
      console.error('[API] Error al procesar respuesta:', error);
      console.log('[API] Texto de respuesta completo:', responseText);
      throw error;
    }
  };

  /**
   * Función para realizar peticiones HTTP
   */
  const fetchData = async <R>(
    url: string,
    method: HttpMethod,
    options?: FetchOptions,
    body?: any
  ): Promise<R | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificamos si debemos usar datos de ejemplo directamente
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        console.info(`[API] Usando datos de ejemplo directamente para ${method} ${url}`);
        return await simulateFetch<R>(body as R);
      }
      
      // Construimos las opciones de la petición
      const fetchOptions: RequestInit = {
        method,
        headers: {
          ...(!options?.skipContentType ? { 'Content-Type': 'application/json' } : {}),
          ...(options?.headers || {})
        } as HeadersInit
      };
      
      // Si hay cuerpo, lo añadimos a las opciones
      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }
      
      // Construimos la URL con los parámetros
      const fullUrl = buildUrl(url, options?.params);
      
      console.info(`[API] Enviando petición ${method} a ${fullUrl}`);
      
      try {
        // Realizamos la petición
        const response = await window.fetch(fullUrl, fetchOptions);
        
        // Procesamos la respuesta
        const result = await processResponse<R>(response);
        console.info(`[API] Respuesta exitosa de ${method} ${url}`);
        setData(result as unknown as T);
        return result;
      } catch (networkError) {
        // Capturamos específicamente los errores de red o servidor
        if (networkError instanceof TypeError && networkError.message.includes('Failed to fetch')) {
          console.error(`[API] Error de conexión al servidor: ${url}`);
          throw new Error(`No se pudo conectar con el servidor. Verifique su conexión a internet o si el servidor está en funcionamiento.`);
        }
        throw networkError;
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido al realizar la petición';
      
      console.error(`[API] Error en petición ${method} ${url}:`, error);
      setError(errorMessage);
      
      // Si useMockOnError es true y hay datos de ejemplo, los usamos
      if (useMockOnError && mockData) {
        console.info(`[API] Usando datos de ejemplo como fallback tras error en ${method} ${url}`);
        return await simulateFetch<R>();
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Método GET
  const fetch = useCallback(
    async (url: string, options?: FetchOptions) => {
      return fetchData<T>(url, "GET", options);
    },
    []
  );

  // Método POST
  const post = useCallback(
    async <R>(url: string, body: any, options?: FetchOptions) => {
      return fetchData<R>(url, "POST", options, body);
    },
    []
  );

  // Método PUT
  const put = useCallback(
    async <R>(url: string, body: any, options?: FetchOptions) => {
      return fetchData<R>(url, "PUT", options, body);
    },
    []
  );

  // Método PATCH
  const patch = useCallback(
    async <R>(url: string, body: any, options?: FetchOptions) => {
      return fetchData<R>(url, "PATCH", options, body);
    },
    []
  );

  // Método DELETE
  const remove = useCallback(
    async (url: string, options?: FetchOptions) => {
      const result = await fetchData<boolean>(url, "DELETE", options);
      return result !== null;
    },
    []
  );

  // Resetear el estado
  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    fetch,
    post,
    put,
    patch,
    remove,
    reset
  };
}
