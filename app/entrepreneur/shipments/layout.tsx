"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/sidebar';
import { UserRole } from '@/app/interfaces';

export default function ShipmentsLayout({
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
          email="Emprendedor" 
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          showMenuButton={true}
        />
        
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
