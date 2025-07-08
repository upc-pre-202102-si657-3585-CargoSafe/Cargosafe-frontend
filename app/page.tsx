import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige al usuario a la página de registro
  redirect('/sign-up');
  
  // Esto no se renderizará debido a la redirección
  return null;
}
