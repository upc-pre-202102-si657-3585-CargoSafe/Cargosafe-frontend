"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/sidebar';
import { UserRole } from '@/app/interfaces';

export default function RequestServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        userRole={UserRole.ENTREPRENEUR} 
        email="Emprendedor"
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <main className="flex-1 overflow-y-auto">
        <Navbar 
          username="Emprendedor" 
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          showMenuButton={true}
        />
        
        <div className="flex justify-center items-start min-h-[80vh] py-10 px-2 bg-background">
      <div className="w-full max-w-3xl">{children}</div>
    </div>
      </main>
    </div>
  );
}
