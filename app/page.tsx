import { redirect } from 'next/navigation';
import Image from "next/image";
import styles from "./page.module.css";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Redirige al usuario a la página de registro
  redirect('/sign-up');
  
  // Esto no se renderizará debido a la redirección
  return null;
}
