/**
 * Configuration file for API endpoints.
 * This file defines the base URL for the API and the specific endpoints for various resources.
 * It is used throughout the application to standardize API calls and ensure consistency.
 */

// Obtener la URL base de la API desde variable de entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


export const APP_CONFIG = {
  DEBUG: true, 
  API_TIMEOUTS: 30000,
  CONTENT_TYPE: 'application/json;charset=UTF-8',
  AUTH: {
    TOKEN_KEY: 'auth_token', 
    REFRESH_TOKEN_KEY: 'refresh_token', 
    TOKEN_HEADER: 'Authorization', 
    TOKEN_PREFIX: 'Bearer ' 
  }
};


export const AuthUtils = {
  /**
   * Guarda el token de autenticación en localStorage
   * @param token Token JWT a guardar
   */
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      if (!token || token.trim() === '') {
        console.error('Error: Intentando guardar un token vacío');
        return;
      }
      
      try {
        const tokenData = {
          value: token,
          timestamp: new Date().getTime()
        };
        localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, JSON.stringify(tokenData));
        console.log('Token guardado correctamente');
      } catch (error) {
        console.error('Error al guardar token en localStorage:', error);
      }
    }
  },

  /**
   * Obtiene una cookie por su nombre
   * @param name Nombre de la cookie
   * @returns Valor de la cookie o null si no existe
   */
  getCookie: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.indexOf(name + "=") === 0) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  },

  /**
   * Obtiene el token de autenticación de localStorage o cookies
   * @returns Token JWT o null si no existe
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      try {
        // Primero intentar obtener el token de la cookie (prioridad)
        const cookieToken = AuthUtils.getCookie('authToken');
        if (cookieToken) {
          console.log('Token encontrado en cookies');
          return cookieToken;
        }
        
        // Si no está en cookies, buscar en localStorage
        const tokenData = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
        
        // Si no hay token, retornar null
        if (!tokenData) {
          return null;
        }
        
        // Intentar parsear el objeto JSON
        try {
          const { value, timestamp } = JSON.parse(tokenData);
          
          // Si el token tiene más de 12 horas, considerarlo expirado
          const now = new Date().getTime();
          const twelveHoursMs = 12 * 60 * 60 * 1000;
          
          if (now - timestamp > twelveHoursMs) {
            console.warn('Token expirado por tiempo (12h). Se requiere nuevo inicio de sesión');
            AuthUtils.removeToken();
            return null;
          }
          
          return value;
        } catch {
          // Si no se puede parsear, podría ser un token legacy (solo string)
          return tokenData;
        }
      } catch (error) {
        console.error('Error al obtener token de localStorage:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Elimina el token de autenticación de localStorage
   */
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      try {
        // Eliminar de localStorage
        localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
        
        // Eliminar de cookies (estableciendo expiración en el pasado)
        document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict";
        
        console.log('Token eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar token de localStorage:', error);
      }
    }
  },

  /**
   * Crea los headers de autenticación para peticiones
   * @returns Objeto con headers incluyendo Authorization si hay token
   */
  createAuthHeaders: () => {
    const token = AuthUtils.getToken();
    // Registro detallado para depurar problemas de autenticación
    if (APP_CONFIG.DEBUG && token) {
      console.log(`Token disponible para autenticación: ${token.substring(0, 10)}...`);
    } else if (APP_CONFIG.DEBUG) {
      console.warn('No hay token disponible para crear headers de autenticación');
    }
    
    return {
      'Accept': 'application/json',
      'Content-Type': APP_CONFIG.CONTENT_TYPE,
      ...(token ? { [APP_CONFIG.AUTH.TOKEN_HEADER]: `${APP_CONFIG.AUTH.TOKEN_PREFIX}${token}` } : {})
    };
  },

  /**
   * Verifica si hay un token de autenticación
   * @returns true si existe un token, false en caso contrario
   */
  isAuthenticated: (): boolean => {
    const hasToken = !!AuthUtils.getToken();
    if (APP_CONFIG.DEBUG) {
      console.log(`Estado de autenticación: ${hasToken ? 'Autenticado' : 'No autenticado'}`);
    }
    return hasToken;
  },
  
  /**
   * Sincroniza el token entre cookies y localStorage
   * Útil para garantizar consistencia entre ambos métodos de almacenamiento
   */
  syncToken: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      // Intentar obtener de cookies primero
      const cookieToken = AuthUtils.getCookie('authToken');
      if (cookieToken) {
        // Si hay token en cookies pero no en localStorage, guardarlo
        AuthUtils.setToken(cookieToken);
        console.log('Token sincronizado de cookies a localStorage');
        return;
      }
      
      // Si no hay en cookies pero sí en localStorage, actualizar cookies
      const localToken = AuthUtils.getToken();
      if (localToken) {
        document.cookie = `authToken=${encodeURIComponent(localToken)}; path=/; SameSite=Strict; max-age=${30*24*60*60}`;
        console.log('Token sincronizado de localStorage a cookies');
      }
    } catch (error) {
      console.error('Error al sincronizar token:', error);
    }
  }
};

/**
 * Object containing the endpoints for different resources in the API.
 * Each property represents a specific resource and its corresponding endpoint.
 */
export const API_ENDPOINTS = {
  /**
   * Endpoints for driver management operations
   */
  DRIVERS: {
    BASE: `${API_BASE_URL}/drivers`,
    BY_ID: (driverId: string | number) => `${API_BASE_URL}/drivers/${driverId}`
  },

  /**
   * Endpoints for evidence management operations
   */
  EVIDENCE: {
    BASE: `${API_BASE_URL}/evidence`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/evidence/${id}`
  },

  /**
   * Endpoints for expense operations
   */
  EXPENSE: {
    BASE: `${API_BASE_URL}/expense`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/expense/${id}`
  },

  /**
   * Endpoints for vehicle management operations
   */
  VEHICLES: {
    BASE: `${API_BASE_URL}/vehicles`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/vehicles/${id}`
  },

  /**
   * Endpoints for company management operations
   */
  COMPANIE: {
    BASE: `${API_BASE_URL}/companie`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/companie/${id}`
  },

  /**
   * Endpoints for payment card operations
   */
  PAYMENT_CARD: {
    BASE: `${API_BASE_URL}/payment-card`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/payment-card/${id}`
  },

  /**
   * Endpoints for user management operations
   */
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    BY_ID: (userId: string | number) => `${API_BASE_URL}/users/${userId}`
  },

  /**
   * Endpoints for request service operations
   */
  REQUEST_SERVICES: {
 
    BASE: `${API_BASE_URL}/requestServices`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/requestServices/${id}`,
    STATUS: (id: string | number) => `${API_BASE_URL}/requestServices/${id}/status`,
    UPDATE_STATUS: (id: string | number) => `${API_BASE_URL}/requestServices/${id}/status`
  },

  /**
   * Endpoints for on-going trip management operations
   */
  ON_GOING_TRIPS: {
    BASE: `${API_BASE_URL}/on-going-trip`,
    BY_ID: (onGoingTripId: string | number) => `${API_BASE_URL}/on-going-trip/${onGoingTripId}`
  },

  /**
   * Endpoints for profile management operations
   */
  PROFILES: {
    BASE: `${API_BASE_URL}/profiles`,
    BY_ID: (profileId: string | number) => `${API_BASE_URL}/profiles/${profileId}`,
    BY_USER_ID: (userId: string | number) => `${API_BASE_URL}/profiles/${userId}`,
    BY_USERNAME: (username: string) => `${API_BASE_URL}/profiles/username/${username}`
  },

  /**
   * Endpoints for role management operations
   */
  ROLES: {
    BASE: `${API_BASE_URL}/roles`
  },

  /**
   * Endpoints for authentication operations
   */
  AUTHENTICATION: {
    SIGN_UP: `${API_BASE_URL}/authentication/sign-up`,
    SIGN_IN: `${API_BASE_URL}/authentication/sign-in`
  },

  /**
   * Endpoints for trip management operations
   */
  TRIPS: {
    BASE: `${API_BASE_URL}/trips`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/trips/${id}`
  },

  /**
   * Endpoints for alert management operations
   */
  ALERT: {
    BASE: `${API_BASE_URL}/alert`,
    BY_ID: (id: string | number) => `${API_BASE_URL}/alert/${id}`
  }
};