/**
 * Cliente fetch optimizado para las solicitudes API con caché y mejores opciones por defecto
 */

// Caché global para almacenar respuestas (mejora el rendimiento)
const apiCache = new Map<string, { data: unknown; timestamp: number }>();
// Tiempo de expiración de la caché en milisegundos (5 minutos)
const CACHE_EXPIRY = 5 * 60 * 1000;
// Timeout por defecto para las solicitudes (8 segundos)
const DEFAULT_TIMEOUT = 8000;

type FetchOptions = RequestInit & {
  timeout?: number;
  useCache?: boolean;
  cacheKey?: string;
  cacheTime?: number;
  suppressErrors?: boolean; // Opción para suprimir errores de consola y rethrows
};

/**
 * Cliente fetch optimizado que incluye timeout, caché y manejo de errores mejorado
 */
export async function fetchClient<T = unknown>(url: string, options: FetchOptions = {}): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    useCache = false,
    cacheKey = url,
    cacheTime = CACHE_EXPIRY,
    suppressErrors = false,
    ...fetchOptions
  } = options;

  // Si se habilita la caché y existe una entrada válida, devolverla
  if (useCache) {
    const cached = apiCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < cacheTime) {
      console.log(`[fetchClient] Usando respuesta en caché para: ${url}`);
      return cached.data as T;
    }
  }

  // Configurar timeout para la petición
  let controller: AbortController | null = null;
  let timeoutId: NodeJS.Timeout | null = null;
  
  // Solo usar AbortController si es un entorno que lo soporta (navegador)
  if (typeof AbortController !== 'undefined') {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      controller?.abort();
    }, timeout);
  }

  try {
    // Configuración por defecto mejorada
    const mergedOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      credentials: 'include',
      ...(controller ? { signal: controller.signal } : {}),
      ...fetchOptions,
    };

    const startTime = Date.now();
    if (!suppressErrors) {
      console.log(`[fetchClient] Iniciando solicitud a: ${url}`);
    }

    // Realizar la solicitud con manejo mejorado de errores de red
    let response;
    try {
      response = await fetch(url, mergedOptions);
    } catch (networkError) {
      throw new Error(`Error de conexión: No se pudo conectar al servidor. Verifica tu red.`);
    }
    
    // Tiempo que tomó la solicitud
    const requestTime = Date.now() - startTime;
    if (!suppressErrors) {
      console.log(`[fetchClient] Solicitud completada en ${requestTime}ms`);
    }

    // Verificar si la respuesta fue correcta
    if (!response.ok) {
      let errorMessage: string;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Parsear y almacenar en caché si es necesario
    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Para otros tipos de contenido como texto, devolver la respuesta como texto
      data = await response.text() as unknown as T;
    }

    // Si se habilita caché, guardar resultado
    if (useCache) {
      apiCache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  } catch (error) {
    if (!suppressErrors) {
      console.error(`[fetchClient] Error en solicitud a ${url}:`, error);
    }
    
    // Determinar el tipo de error para mejores mensajes
    let errorMessage = `Error en la solicitud a ${url}`;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = `La solicitud a ${url} excedió el tiempo de espera (${timeout}ms)`;
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = `No se puede conectar al servidor. Verifica tu conexión o si el servidor está disponible.`;
      } else if (error.message.includes('cors') || error.message.includes('CORS')) {
        errorMessage = `Error de permisos CORS en la solicitud a ${url}`;
      } else {
        errorMessage = error.message;
      }
      
      // Solo relanzar si no estamos suprimiendo errores
      if (!suppressErrors) {
        throw new Error(errorMessage);
      } else {
        // En caso de supresión, simplemente devolver un objeto vacío o similar
        throw error;
      }
    }
    
    // Error genérico
    if (!suppressErrors) {
      throw new Error(errorMessage);
    }
    throw error;
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Limpiar la caché por clave o completa
 */
export function clearCache(key?: string): void {
  if (key) {
    apiCache.delete(key);
  } else {
    apiCache.clear();
  }
}

/**
 * Precargar una URL para tenerla disponible en caché (mejora percepción de velocidad)
 */
export async function prefetchUrl(url: string, options: FetchOptions = {}): Promise<void> {
  try {
    // Siempre usar opciones seguras para prefetch
    const prefetchOptions = {
      ...options,
      useCache: true,
      suppressErrors: true,  // Siempre suprimir errores para prefetch
      method: options.method || 'GET', 
      timeout: options.timeout || 3000  // Timeout más corto para prefetch
    };
    
    // Intentar la precarga
    await fetchClient(url, prefetchOptions);
    console.log(`[fetchClient] URL precargada exitosamente: ${url}`);
  } catch (error) {
    // No mostrar errores detallados en prefetch, es solo optimización
    console.log(`[fetchClient] Prefetch para ${url} ignorado: Es solo optimización.`);
  }
} 