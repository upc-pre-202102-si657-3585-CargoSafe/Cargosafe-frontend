"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/Navbar";
import { UserRole } from "@/app/interfaces";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        userRole={UserRole.COMPANY} 
        username="Empresa Demo"
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <div className="flex flex-col flex-1">
        <Navbar 
          username="Empresa Demo" 
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          showMenuButton={true}
        />
        
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 