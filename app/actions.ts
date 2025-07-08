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
      await AuthService.signUp(signUpData);
      
      // Registrar tiempo total de procesamiento
      const endTime = performance.now();
      console.log(`[SignUp] Registro completado en ${Math.round(endTime - startTime)}ms`);
      
      return {
        type: "success",
        text: "Usuario registrado correctamente. Ahora puedes iniciar sesión."
      };
    } catch (apiError) {
      console.error('[SignUp] Error detallado:', apiError);
      
      // Manejo de errores mejorado
      let errorMessage = "Error de conexión al servidor";
      
      if (apiError instanceof Error) {
        if (apiError.message.includes('409') || apiError.message.includes('conflict')) {
          errorMessage = "Este correo electrónico ya está registrado. Por favor usa otro.";
        } else if (apiError.message.includes('400') || apiError.message.includes('bad request')) {
          errorMessage = "Datos de registro inválidos. Verifica la información proporcionada.";
        } else if (apiError.message.includes('500')) {
          errorMessage = "Error en el servidor. Inténtalo más tarde.";
        } else {
          errorMessage = apiError.message;
        }
      }
      
      return {
        type: "error",
        text: errorMessage
      };
    }
  } catch (generalError) {
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
      const userData = await AuthService.signIn(signInData);

      console.log("[SignIn] Inicio de sesión exitoso para:", userData.username);
      
      // Determinar el rol principal del usuario (el primero en la lista)
      const userRole = userData.role;
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
          token: userData.token,
          id: String(userData.id),
          username: userData.username,
          role: userRole,
          rememberMe: rememberMe
        }
      };
    } catch (apiError) {
      // Manejo de errores mejorado con mensajes más específicos
      console.error("[SignIn] Error de autenticación:", apiError);
      const errorMessage = "Error de conexión al servidor. Por favor, intenta más tarde.";
      
      return {
        type: "error",
        text: errorMessage
      };
    }
  } catch (generalError) {
    console.error("[SignIn] Error general:", generalError);
    return {
      type: "error",
      text: "Ocurrió un error durante el inicio de sesión"
    };
  }
} 