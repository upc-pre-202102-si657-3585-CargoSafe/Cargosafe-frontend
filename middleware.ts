import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que son accesibles para todos, incluso sin autenticación
const publicRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/terms', '/privacy'];

// Rutas que son accesibles solo para usuarios autenticados
const commonProtectedRoutes = ['/profile', '/settings'];

// Rutas específicas para empresas
const companyRoutes = ['/company'];

// Rutas específicas para emprendedores
const entrepreneurRoutes = ['/entrepreneur'];

// Función para crear una redirección limpia
function createCleanRedirect(request: NextRequest, path: string) {
  // Crear una nueva URL basada en la URL de origen pero con el nuevo path
  const url = new URL(path, request.url);
  // Eliminar cualquier parámetro de búsqueda que pudiera existir
  url.search = '';
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificamos si hay un token en las cookies
  const hasToken = request.cookies.has('authToken');
  
  // Si el usuario no está autenticado y está intentando acceder a una ruta protegida
  if (!hasToken && (
      commonProtectedRoutes.some(route => pathname.startsWith(route)) ||
      companyRoutes.some(route => pathname.startsWith(route)) ||
      entrepreneurRoutes.some(route => pathname.startsWith(route))
    )) {
    // Redirigir a la página de inicio de sesión con URL limpia
    return createCleanRedirect(request, '/sign-in');
  }
  
  // Si el usuario está autenticado y está intentando acceder a una ruta de autenticación
  if (hasToken && publicRoutes.some(route => pathname === route)) {
    // Obtener información del usuario y su rol desde la cookie
    const userInfoCookie = request.cookies.get('userInfo');
    
    if (userInfoCookie?.value) {
      try {
        const userInfo = JSON.parse(userInfoCookie.value);
        const userRole = userInfo.role;
        
        // Redirigir según el rol
        let redirectPath = '/';
        
        if (userRole === 'ROLE_COMPANY') {
          redirectPath = '/company/dashboard';
        } else if (userRole === 'ROLE_ENTREPRENEUR') {
          redirectPath = '/entrepreneur/dashboard';
        }
        
        return createCleanRedirect(request, redirectPath);
      } catch (error) {
        console.error('Error parsing userInfo cookie:', error);
      }
    }
    
    // Si no puede determinar el rol, redirigir a la página principal
    return createCleanRedirect(request, '/');
  }
  
  // Verificar el acceso basado en roles para rutas específicas
  if (hasToken) {
    const userInfoCookie = request.cookies.get('userInfo');
    
    if (userInfoCookie?.value) {
      try {
        const userInfo = JSON.parse(userInfoCookie.value);
        const userRole = userInfo.role;
        
        // Verificar acceso a rutas de empresa
        if (pathname.startsWith('/company') && userRole !== 'ROLE_COMPANY') {
          // Si es emprendedor, redirigir a su dashboard
          if (userRole === 'ROLE_ENTREPRENEUR') {
            return createCleanRedirect(request, '/entrepreneur/dashboard');
          } else {
            return createCleanRedirect(request, '/');
          }
        }
        
        // Verificar acceso a rutas de emprendedor
        if (pathname.startsWith('/entrepreneur') && userRole !== 'ROLE_ENTREPRENEUR') {
          // Si es empresa, redirigir a su dashboard
          if (userRole === 'ROLE_COMPANY') {
            return createCleanRedirect(request, '/company/dashboard');
          } else {
            return createCleanRedirect(request, '/');
          }
        }
      } catch (error) {
        console.error('Error parsing userInfo cookie:', error);
      }
    }
  }
  
  // En otros casos, permitir la solicitud
  return NextResponse.next();
}

// Configurar en qué rutas se debe ejecutar el middleware
export const config = {
  matcher: [
    // Rutas que coinciden con el middleware
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 