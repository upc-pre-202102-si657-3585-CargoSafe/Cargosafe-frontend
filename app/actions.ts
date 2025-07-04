"use server";

import { SignInRequest, SignUpRequest, UserRole } from "@/app/interfaces";
import { Message } from "@/app/components/form-message";
import { AuthService } from "@/lib/auth";

/**
 * Acción para registrar un nuevo usuario
 * Versión optimizada con manejo de errores mejorado y mejor rendimiento
 */
export async function signUpAction(formData: FormData): Promise<Message> {
  const startTime = performance.now();
  console.log("[SignUp] Iniciando proceso de registro...");

  try {
    // Extrae datos del formulario
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string || UserRole.ENTREPRENEUR;

    if (!email || !password) {
      return {
        type: "error",
        text: "Email y contraseña son requeridos"
      };
    }

    // Preparar la solicitud según la interfaz SignUpRequest
    const signUpData: SignUpRequest = {
      username: email,
      password: password,
      roles: [role] // Utiliza el rol seleccionado por el usuario
    };

    try {
      // Usar el servicio de autenticación optimizado
      const data = await AuthService.signUp(signUpData);
      
      // Registrar tiempo total de procesamiento
      const endTime = performance.now();
      console.log(`[SignUp] Registro completado en ${Math.round(endTime - startTime)}ms`);
      
      return {
        type: "success",
        text: "Usuario registrado correctamente. Ahora puedes iniciar sesión."
      };
    } catch (error) {
      console.error('[SignUp] Error detallado:', error);
      
      // Manejo de errores mejorado
      let errorMessage = "Error de conexión al servidor";
      
      if (error instanceof Error) {
        if (error.message.includes('409') || error.message.includes('conflict')) {
          errorMessage = "Este correo electrónico ya está registrado. Por favor usa otro.";
        } else if (error.message.includes('400') || error.message.includes('bad request')) {
          errorMessage = "Datos de registro inválidos. Verifica la información proporcionada.";
        } else if (error.message.includes('500')) {
          errorMessage = "Error en el servidor. Inténtalo más tarde.";
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        type: "error",
        text: errorMessage
      };
    }
  } catch (error) {
    return {
      type: "error",
      text: "Ocurrió un error durante el registro"
    };
  }
}

/**
 * Acción para iniciar sesión de un usuario
 * Versión optimizada con manejo de errores mejorado y mejor rendimiento
 */
export async function signInAction(formData: FormData): Promise<Message | { success: true, redirectTo: string, userData: { token: string, id: string, username: string, role: string, rememberMe: boolean } }> {
  const startTime = performance.now();
  console.log("[SignIn] Iniciando proceso de login...");

  try {
    // Extrae datos del formulario
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("remember-me") === "on";

    if (!email || !password) {
      return {
        type: "error",
        text: "Email y contraseña son requeridos"
      };
    }

    // Preparar la solicitud según la interfaz SignInRequest
    const signInData: SignInRequest = {
      username: email,
      password: password
    };

    try {
      // Usar el servicio de autenticación optimizado
      const data = await AuthService.signIn(signInData);

      console.log("[SignIn] Inicio de sesión exitoso para:", data.username);
      
      // Establecer opciones de la cookie
      const cookieExpirySeconds = rememberMe ? 30 * 24 * 60 * 60 : undefined; // 30 días si "recordarme" está activado
      
      // Determinar el rol principal del usuario (el primero en la lista)
      const userRole = data.role;
      // Determinar ruta de redirección
      let redirectPath = '/';
      
      if (userRole === UserRole.COMPANY) {
        redirectPath = '/company/dashboard';
      } else if (userRole === UserRole.ENTREPRENEUR) {
        redirectPath = '/entrepreneur/dashboard';
      }
      
      // Registrar tiempo total de procesamiento
      const endTime = performance.now();
      console.log(`[SignIn] Proceso completado en ${Math.round(endTime - startTime)}ms. Redirigiendo a: ${redirectPath}`);
      
      // En lugar de establecer cookies del lado del servidor, pasamos los datos al cliente
      // y dejamos que el cliente establezca las cookies
      return {
        success: true,
        redirectTo: redirectPath,
        userData: {
          token: data.token,
          id: String(data.id),
          username: data.username,
          role: userRole,
          rememberMe: rememberMe
        }
      };
    } catch (error) {
      // Manejo de errores mejorado con mensajes más específicos
      let errorMessage = "Error de conexión al servidor. Por favor, intenta más tarde.";
      
      if (error instanceof Error) {
        if (error.message.includes('excedió el tiempo de espera')) {
          errorMessage = "El servidor está tardando demasiado en responder. Por favor, intenta más tarde.";
        } else if (error.message.includes('404')) {
          errorMessage = "Usuario no encontrado. Verifica tus credenciales.";
        } else if (error.message.includes('401')) {
          errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña.";
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        type: "error",
        text: errorMessage
      };
    }
  } catch (error) {
    return {
      type: "error",
      text: "Ocurrió un error durante el inicio de sesión"
    };
  }
} 