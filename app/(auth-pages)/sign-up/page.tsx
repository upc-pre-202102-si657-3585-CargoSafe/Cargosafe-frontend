'use client';

import { useState, useEffect, Suspense } from 'react';
import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/app/components/form-message";
import { SubmitButton } from "@/app/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import NavbarAuth from "@/app/auth/components/navbar-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/app/interfaces";
import { useRouter, useSearchParams } from 'next/navigation';

export default function Page() {
  return (
    <Suspense>
      <SignUp />
    </Suspense>
  );
}

function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<Message>({});
  const [selectedRole, setSelectedRole] = useState<string>(UserRole.ENTREPRENEUR);

  useEffect(() => {
    if (searchParams?.get('message')) {
      setMessage({
        text: searchParams.get('message') || '',
        type: (searchParams.get('type') as 'error' | 'success') || 'error',
      });
      console.log("[SignUp] Mensaje detectado en parámetros:", searchParams.get('message'));
    }
  }, [searchParams]);

  const handleSubmit = async (formData: FormData) => {
    try {
      console.log("[SignUp] Enviando formulario de registro");
      
      formData.set('role', selectedRole);
      
      const email = formData.get('email');
      const password = formData.get('password');
      console.log(`[SignUp] Datos del formulario - Email: ${email}, Rol: ${selectedRole}, Password length: ${password ? (password as string).length : 0}`);
      
      if (!email || !password) {
        setMessage({
          type: 'error',
          text: 'Email y contraseña son requeridos'
        });
        return;
      }
      
      if (!String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        setMessage({
          type: 'error',
          text: 'Por favor, introduce un email válido'
        });
        return;
      }
      
      if ((password as string).length < 6) {
        setMessage({
          type: 'error',
          text: 'La contraseña debe tener al menos 6 caracteres'
        });
        return;
      }
      
      setMessage({
        type: 'loading',
        text: 'Registrando usuario...'
      });
      
      try {
        const result = await signUpAction(formData);
        
        console.log("[SignUp] Resultado de la acción:", result);
        
        if (result) {
          if (result.type === 'error') {
            setMessage(result);
          } else {
            setMessage({
              type: 'success',
              text: 'Usuario registrado correctamente. Redirigiendo...'
            });
            
            setTimeout(() => {
              router.push('/sign-in?message=Usuario registrado correctamente. Ahora puedes iniciar sesión.&type=success');
            }, 2000);
          }
        }
      } catch (error: unknown) {
        let isRedirect = false;
        let errorMessage = 'Error al registrar usuario. Por favor, inténtalo de nuevo.';
        if (typeof error === 'object' && error !== null) {
          if ('digest' in error && typeof (error as { digest?: unknown }).digest === 'string' && (error as { digest: string }).digest.includes('NEXT_REDIRECT')) {
            isRedirect = true;
          }
          if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
            errorMessage = (error as { message: string }).message;
          }
        }
        if (isRedirect) {
          console.log("[SignUp] Registro exitoso con redirección");
          setMessage({
            type: 'success',
            text: 'Usuario registrado correctamente. Redirigiendo...'
          });
          setTimeout(() => {
            router.push('/sign-in?message=Usuario registrado correctamente. Ahora puedes iniciar sesión.&type=success');
          }, 2000);
          return;
        }
        console.error("[SignUp] Error en la acción:", error);
        setMessage({
          type: 'error',
          text: errorMessage
        });
      }
    } catch (error: unknown) {
      console.error("[SignUp] Error al procesar el formulario:", error);
      let errorMessage = 'Ocurrió un error al procesar el formulario. Por favor, inténtalo de nuevo.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    }
  };

  const handleRoleChange = (value: string) => {
    console.log("[SignUp] Rol seleccionado:", value);
    setSelectedRole(value);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground dark:bg-background dark:text-foreground">
      <NavbarAuth />

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full blur-md bg-primary/30"></div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-card-foreground">
              Crea tu cuenta
            </h2>
            <p className="text-lg text-muted-foreground">
              Regístrate para gestionar tus proyectos y colaborar con tu equipo de forma segura.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <Card className="w-full max-w-md bg-card/90 dark:bg-card/90 backdrop-blur-sm shadow-md border border-border rounded-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center lg:justify-start mb-4">
              <div className="h-12 w-12 rounded-full bg-primary shadow-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            <CardTitle className="text-2xl font-bold tracking-tight text-center lg:text-left text-card-foreground">
              Bienvenido
            </CardTitle>
            <CardDescription className="text-center lg:text-left text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/sign-in"
                className="font-medium text-primary transition-colors hover:text-primary/80 underline-offset-4 hover:underline"
              >
                Inicia sesión
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/90 px-2 text-muted-foreground">
                  Completa tus datos
                </span>
              </div>
            </div>

            <form action={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  Correo electrónico
                </Label>
                <Input
                  name="email"
                  id="email"
                  placeholder="tu@ejemplo.com"
                  required
                  className="h-11 w-full rounded-md border border-input px-4
                    text-foreground placeholder-muted-foreground
                    focus:border-primary focus:ring focus:ring-primary/20
                    transition-all bg-input dark:bg-input dark:text-foreground dark:placeholder-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                  Contraseña
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Tu contraseña"
                  required
                  className="h-11 w-full rounded-md border border-input px-4
                    text-foreground placeholder-muted-foreground
                    focus:border-primary focus:ring focus:ring-primary/20
                    transition-all bg-input dark:bg-input dark:text-foreground dark:placeholder-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-muted-foreground">
                  Tipo de usuario
                </Label>
                <Select name="role" defaultValue={UserRole.ENTREPRENEUR} onValueChange={handleRoleChange}>
                  <SelectTrigger className="h-11 w-full rounded-md border border-input
                    text-foreground focus:border-primary focus:ring focus:ring-primary/20
                    transition-all bg-input dark:bg-input dark:text-foreground dark:placeholder-muted-foreground">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border text-foreground">
                    <SelectItem 
                      value={UserRole.ENTREPRENEUR} 
                      className="text-foreground focus:bg-primary/10 focus:text-foreground"
                    >
                      Emprendedor
                    </SelectItem>
                    <SelectItem 
                      value={UserRole.COMPANY} 
                      className="text-foreground focus:bg-primary/10 focus:text-foreground"
                    >
                      Empresa
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Este rol determinará tus permisos y funcionalidades disponibles
                </p>
              </div>

              <SubmitButton
                pendingText="Registrando..."
                className="h-11 w-full rounded-md bg-primary text-primary-foreground
                  font-medium transition-colors hover:bg-primary/90 focus:outline-none
                  focus:ring focus:ring-primary/20"
              >
                Registrarse
              </SubmitButton>

              <div className="text-center">
                <FormMessage message={message} />
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col text-center">
            <p className="text-xs text-muted-foreground">
              Al registrarte, aceptas nuestros{' '}
              <Link
                href="/terms"
                className="text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
              >
                Términos de servicio
              </Link>{' '}
              y{' '}
              <Link
                href="/privacy"
                className="text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
              >
                Política de privacidad
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
