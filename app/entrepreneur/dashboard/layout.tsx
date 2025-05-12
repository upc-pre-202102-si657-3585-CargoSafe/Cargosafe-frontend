'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/Navbar';
import { UserRole } from '@/app/interfaces';

export default function EntrepreneurDashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleLogout = () => {
		console.log('Cerrar sesión');
		window.location.href = '/sign-in';
	};

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar 
				userRole={UserRole.ENTREPRENEUR}
				username="Emprendedor Demo"
				onLogout={handleLogout}
				mobileOpen={mobileMenuOpen}
				setMobileOpen={setMobileMenuOpen}
			/>
			<div className="flex flex-col flex-1">
				<Navbar 
					username="Emprendedor Demo"
					showMenuButton={true}
					onMenuToggle={toggleMobileMenu}
				/>
				<main className="flex-1 p-4 md:p-6 overflow-y-auto">
					{children}
				</main>
			</div>
		</div>
	);
}