"use client";

import React, { useState, useEffect } from 'react';
import { BellIcon, MenuIcon, UserIcon } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { AuthUtils } from '@/app/config/api';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavbarProps {
  username?: string;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export function Navbar({ 
  username, 
  onMenuToggle,
  showMenuButton = false
}: NavbarProps) {
  const [currentUser, setCurrentUser] = useState<string>(username || "Usuario");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Obtener información del usuario al cargar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Sincronizar tokens para asegurar coherencia
      AuthUtils.syncToken();
      
      // Verificar autenticación
      const isAuth = AuthUtils.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      try {
        // Intentar obtener información del usuario desde cookies
        const userInfoCookie = AuthUtils.getCookie('userInfo');
        if (userInfoCookie) {
          const userInfo = JSON.parse(decodeURIComponent(userInfoCookie));
          setCurrentUser(userInfo.username || "Usuario");
          return;
        }
        
        // Alternativa: obtener desde localStorage
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          setCurrentUser(userInfo.username || "Usuario");
          return;
        }
      } catch (error) {
        console.error('Error al obtener información del usuario:', error);
      }
    }
  }, [username]);

  // Función para cerrar sesión
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      AuthUtils.removeToken();
      setIsAuthenticated(false);
      setCurrentUser("Usuario");
      // Redireccionar a la página de inicio
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        {showMenuButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onMenuToggle}
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        )}
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <BellIcon className="h-5 w-5" />
                  <span className="sr-only">Notificaciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>No tienes notificaciones nuevas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <ModeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentUser.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:block">
                    {isAuthenticated ? currentUser : "Invitado"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuGroup>
                  {isAuthenticated ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Perfil</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">Configuración</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                        Cerrar sesión
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/sign-in">Iniciar sesión</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/sign-up">Registrarse</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
} 