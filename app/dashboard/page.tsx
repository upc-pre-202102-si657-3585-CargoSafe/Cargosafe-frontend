'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ModeToggle } from '@/app/components/mode-toggle';

export default function Dashboard() {
  const [username, setUsername] = useState<string>('');
  
  useEffect(() => {
    setUsername('Usuario');
  }, []);

  const handleLogout = async () => {
    document.cookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/sign-in';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-neutral-900/80 z-10">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="h-5 w-5 text-white"
              >
                <path 
                  fillRule="evenodd" 
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.28 9.22a.75.75 0 000 1.06l3 3a.75.75 0 101.06-1.06l-1.72-1.72h5.69a.75.75 0 000-1.5h-5.69l1.72-1.72a.75.75 0 00-1.06-1.06l-3 3z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">CargoSafe</span>
          </Link>

          <div className="flex items-center gap-4">
            <ModeToggle />
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hola, {username}</span>
              <button 
                onClick={handleLogout} 
                className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Contenido principal */}
      <main className="container mx-auto px-4 pt-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Tarjeta de bienvenida */}
          <div className="col-span-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-800">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Bienvenido, {username}
            </h1>
            
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Esta es tu página de dashboard. Desde aquí podrás gestionar todos los aspectos de tu cuenta y servicios.
            </p>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/profile"
                className="rounded-lg bg-primary px-4 py-2 text-black hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Mi perfil
              </Link>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
} 