"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  TruckIcon, 
  ClipboardCheckIcon, 
  UserIcon, 
 
  LogOutIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  BoxesIcon,
  UsersIcon,
  HistoryIcon,
  MapIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserRole } from '@/app/interfaces';
import { AnimatePresence, motion } from 'framer-motion';

// Tipo para los enlaces de navegación
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

// Props para el componente Sidebar
interface SidebarProps {
  userRole?: UserRole;
  email?: string;
  avatarUrl?: string;
  onLogout?: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  
}

export function Sidebar({ 
  userRole = UserRole.ENTREPRENEUR, 
  email = "usuario@correo.com",
  avatarUrl = "",
  onLogout,
  mobileOpen,
  setMobileOpen
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  // Control del estado de apertura móvil, con soporte para control externo
  const mobileSidebarOpen = mobileOpen !== undefined ? mobileOpen : internalMobileOpen;
  const toggleMobileSidebar = () => {
    if (setMobileOpen) {
      setMobileOpen(!mobileSidebarOpen);
    } else {
      setInternalMobileOpen(!internalMobileOpen);
    }
  };

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        // No colapsamos automáticamente en móvil para mostrar los títulos
        setCollapsed(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Elementos de navegación comunes a todos los roles
  const commonNavItems: NavItem[] = [
    {
      title: 'Inicio',
      href: '/dashboard',
      icon: <HomeIcon size={20} />,
      roles: [UserRole.ENTREPRENEUR, UserRole.COMPANY, UserRole.ADMIN]
    },
    {
      title: 'Mi Perfil',
      href: '/profile',
      icon: <UserIcon size={20} />,
      roles: [UserRole.ENTREPRENEUR, UserRole.COMPANY, UserRole.ADMIN]
    }
  ];

  // Elementos de navegación específicos para Emprendedores
  const entrepreneurNavItems: NavItem[] = [
    {
      title: 'Mis Envíos',
      href: '/entrepreneur/shipments',
      icon: <BoxesIcon size={20} />,
      roles: [UserRole.ENTREPRENEUR]
    },
    {
      title: 'Solicitar Transporte',
      href: '/entrepreneur/request-service',
      icon: <TruckIcon size={20} />,
      roles: [UserRole.ENTREPRENEUR]
    },
    {
      title: 'Historial',
      href: '/entrepreneur/history',
      icon: <HistoryIcon size={20} />,
      roles: [UserRole.ENTREPRENEUR]
    }
  ];

  // Elementos de navegación específicos para Empresas
  const companyNavItems: NavItem[] = [
    {
      title: 'Gestión de Viajes',
      href: '/company/trips',
      icon: <TruckIcon size={20} />,
      roles: [UserRole.COMPANY]
    },
    {
      title: 'Vehículos',
      href: '/company/vehicles',
      icon: <TruckIcon size={20} />,
      roles: [UserRole.COMPANY]
    },
    {
      title: 'Seguimiento',
      href: '/company/vehicle-tracking',
      icon: <MapIcon size={20} />,
      roles: [UserRole.COMPANY]
    },
    {
      title: 'Conductores',
      href: '/company/drivers',
      icon: <UsersIcon size={20} />,
      roles: [UserRole.COMPANY]
    },
    {
      title: 'Servicios Pendientes',
      href: '/company/pending-services',
      icon: <ClipboardCheckIcon size={20} />,
      roles: [UserRole.COMPANY]
    }
  ];

  // Filtrar los elementos de navegación según el rol del usuario
  const navItems = [
    ...commonNavItems,
    ...(userRole === UserRole.ENTREPRENEUR ? entrepreneurNavItems : []),
    ...(userRole === UserRole.COMPANY ? companyNavItems : [])
  ].filter(item => item.roles.includes(userRole));

  // Determinar la URL base según el rol
  const getBaseUrl = () => {
    if (userRole === UserRole.ENTREPRENEUR) return '/entrepreneur';
    if (userRole === UserRole.COMPANY) return '/company';
    return '';
  };

  // Verificar si una ruta está activa
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  // Toggle del sidebar en escritorio
  const toggleSidebar = () => {
    if (isMobile) {
      toggleMobileSidebar();
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Variantes de animación para el texto
  const textVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
  };

  // Variantes de animación para el overlay
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } }
  };

  // Variantes de animación para el sidebar móvil
  const mobileSidebarVariants = {
    hidden: { x: "-100%", opacity: 0.5 },
    visible: { x: "0%", opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  // Componente del sidebar para móvil
  const MobileSidebar = () => (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          <motion.div 
            className="fixed inset-0 bg-white/50 dark:bg-black/50 z-40"
            onClick={toggleMobileSidebar}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
          />
          <motion.div 
            className="fixed inset-y-0 left-0 w-64 bg-background text-foreground border-r border-border z-50 shadow-lg flex flex-col"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileSidebarVariants}
          >
            <SidebarContent showTitles={true} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Componente del contenido del sidebar
  const SidebarContent = ({ showTitles = false }: { showTitles?: boolean }) => (
    <>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {(!collapsed || showTitles) && (
            <motion.span 
              className="font-bold text-lg text-foreground"
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              CargoSafe
            </motion.span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:flex hidden">
          {collapsed ? <ChevronRightIcon size={18} /> : <ChevronLeftIcon size={18} />}
        </Button>
      </div>
      
      <Separator />
      
      <div className="flex flex-col gap-1 p-3">
        {navItems.map((item, index) => (
          <TooltipProvider key={item.href} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start h-10 w-full text-foreground",
                    collapsed ? "px-2" : "px-3",
                  )}
                >
                  <Link href={item.href}>
                    <span className="flex items-center gap-3 text-foreground">
                      {item.icon}
                      {(!collapsed || showTitles || isMobile) && (
                        <motion.span
                          initial="hidden"
                          animate="visible"
                          variants={textVariants}
                          // Agregamos un delay escalonado para que se animen en secuencia
                          transition={{ delay: index * 0.03 }}
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </span>
                  </Link>
                </Button>
              </TooltipTrigger>
              {collapsed && !showTitles && !isMobile && (
                <TooltipContent side="right">
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      
      <div className="mt-auto">
        <Separator />
        <div className="p-3">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-md",
            collapsed && !showTitles && !isMobile ? "justify-center" : "justify-start"
          )}>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {avatarUrl ? (
                <img src={avatarUrl} alt={email} className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserIcon size={15} />
              )}
            </div>
            {(!collapsed || showTitles || isMobile) && (
              <motion.div 
                className="flex flex-col"
                initial="hidden"
                animate="visible"
                variants={textVariants}
              >
                <span className="text-sm font-medium text-foreground">{email}</span>
                <span className="text-xs text-muted-foreground">
                  {userRole === UserRole.ENTREPRENEUR ? 'Emprendedor' : 'Empresa'}
                </span>
              </motion.div>
            )}
          </div>
          
          <Button
            variant="ghost"
            className={cn(
              "justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10 w-full mt-2",
              collapsed ? "px-2" : "px-3"
            )}
            onClick={onLogout}
          >
            <span className="flex items-center gap-3">
              <LogOutIcon size={18} />
              {(!collapsed || showTitles || isMobile) && (
                <motion.span
                  initial="hidden"
                  animate="visible"
                  variants={textVariants}
                >
                  Cerrar Sesión
                </motion.span>
              )}
            </span>
          </Button>
        </div>
      </div>
    </>
  );

  // Renderizar el sidebar según la vista
  return (
    <>
      {isMobile ? (
        <MobileSidebar />
      ) : (
        <motion.div
          className={cn(
            "h-screen sticky top-0 left-0 bg-background border-r border-border flex flex-col text-foreground",
            collapsed ? "w-[70px]" : "w-[240px]"
          )}
          layout
          transition={{ 
            duration: 0.3, 
            type: "spring", 
            stiffness: 350, 
            damping: 25 
          }}
        >
          <SidebarContent />
        </motion.div>
      )}
    </>
  );
}
