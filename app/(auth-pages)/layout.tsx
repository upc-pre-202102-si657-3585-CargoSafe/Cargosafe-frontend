import NavbarAuth from "../auth/components/navbar-auth";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<NavbarAuth />
			<main className="w-full">
				{children}
			</main>
		</>
	);
}