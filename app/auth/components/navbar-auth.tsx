'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ModeToggle } from '@/app/components/mode-toggle';

export default function NavbarAuth() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-neutral-900/80 z-10">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
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
          {mounted && <ModeToggle />}
          
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            <Link 
              href="/sign-up" 
              className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Registrarse
            </Link>
            <Link 
              href="/sign-in" 
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black shadow-sm transition-colors hover:bg-primary/90"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 