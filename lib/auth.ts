import { fetchClient } from '@/lib/fetchClient';
import { API_ENDPOINTS } from '@/app/config/api';
import { SignInRequest, SignInResponse, SignUpRequest, SignUpResponse } from '@/app/interfaces';

/**
 * Servicio optimizado de autenticación
 */
export const AuthService = {
  /**
   * Inicia sesión con credenciales
   * @param credentials - Credenciales de usuario
   * @returns Respuesta de autenticación
   */
  async signIn(credentials: SignInRequest): Promise<SignInResponse> {
    try {
      return await fetchClient<SignInResponse>(API_ENDPOINTS.AUTHENTICATION.SIGN_IN, {
        method: 'POST',
        body: JSON.stringify(credentials),
        timeout: 5000, // Tiempo de espera reducido para mejor UX
      });
    } catch (error) {
      console.error('Error de autenticación:', error);
      throw error;
    }
  },

  /**
   * Registra un nuevo usuario
   * @param userData - Datos del usuario a registrar
   * @returns Respuesta del registro
   */
  async signUp(userData: SignUpRequest): Promise<SignUpResponse> {
    try {
      return await fetchClient<SignUpResponse>(API_ENDPOINTS.AUTHENTICATION.SIGN_UP, {
        method: 'POST',
        body: JSON.stringify(userData),
        timeout: 5000,
      });
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  /**
   * Verifica si el token de autenticación es válido
   * @returns True si el token es válido
   */
  async verifyToken(): Promise<boolean> {
    try {
      // Esta sería una URL para verificar la validez del token
      // Normalmente sería un endpoint como API_ENDPOINTS.AUTH.VERIFY_TOKEN (no hardcodear la URL)
      // Aquí usamos users como aproximación
      await fetchClient(API_ENDPOINTS.USERS.BASE, {
        timeout: 3000,
        useCache: true, 
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Precarga recursos necesarios para la autenticación
   * Mejora percepción de rendimiento
   */
  preloadAuthResources() {
    // Precargar endpoints de autenticación
    Promise.all([
      fetchClient(API_ENDPOINTS.AUTHENTICATION.SIGN_IN, { 
        method: 'OPTIONS', 
        useCache: true,
        timeout: 2000
      }).catch(() => {}),
      fetchClient(API_ENDPOINTS.AUTHENTICATION.SIGN_UP, { 
        method: 'OPTIONS', 
        useCache: true,
        timeout: 2000
      }).catch(() => {})
    ]).catch(() => {
      // Ignorar errores, es solo optimización
    });
  }
}; 