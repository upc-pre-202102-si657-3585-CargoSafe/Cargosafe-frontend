'use client';

import React from 'react';


export default function CompanyDashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-screen bg-background">
		
			<div className="flex flex-col flex-1">
				
				<main className="flex-1 p-4 md:p-6 overflow-y-auto">
					{children}
				</main>
			</div>
		</div>
	);
}