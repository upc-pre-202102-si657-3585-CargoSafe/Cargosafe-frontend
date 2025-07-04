'use client';

import { signInAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { GoogleSignInButton } from "@/app/auth/components/google-sign-in-button";
import { FormMessage, Message } from "@/app/components/form-message";
import { SubmitButton } from "@/app/components/submit-button";
import NavbarAuth from "@/app/auth/components/navbar-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { LoadingOverlay } from "@/app/components/loading-overlay";
import { useFormStatus } from 'react-dom';
import { useOptimizedForm } from "@/hooks/useOptimizedForm";
import { API_ENDPOINTS } from "@/app/config/api";

function setCookie(name: string, value: string, days?: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict";
}

function FormStatusIndicator() {
  const { pending } = useFormStatus();

  return (
    <LoadingOverlay
      isLoading={pending}
      message="Iniciando sesión, por favor espera..."
    />
  );
}

export default function SignIn() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<Message>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { formRef, handleSubmit } = useOptimizedForm({
    endpointUrl: API_ENDPOINTS.AUTHENTICATION.SIGN_IN,
    onSubmitStart: () => {
      setIsSubmitting(true);
      setMessage({});
    },
    onSubmitEnd: () => {
      setIsSubmitting(false);
      router.refresh();
    },
    skipPrefetch: true
  });

  useEffect(() => {
    const messageText = searchParams?.get('message');
    const messageType = searchParams?.get('type') as 'error' | 'success';

    if (messageText) {
      setMessage({
        text: messageText,
        type: messageType || 'error',
      });
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 dark:from-neutral-950 dark:to-neutral-900 dark:text-gray-100">
      <NavbarAuth />

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full blur-md bg-primary/30"></div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg">
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
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Acceso Seguro
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Administra tus proyectos y colabora con tu equipo en un entorno protegido y confiable.
            </p>
          </div>

          <div className="mt-8 space-y-4 bg-white/80 dark:bg-neutral-800/50 p-6 rounded-xl backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Acceso rápido y seguro a tu cuenta</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Protección avanzada de datos personales</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Colaboración en tiempo real con tu equipo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <Card className="w-full max-w-md bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm shadow-md border-0 relative">
          <FormStatusIndicator />

          <CardHeader className="space-y-1">
            <div className="flex justify-center lg:justify-start mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/90 shadow-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <CardTitle className="text-2xl font-bold tracking-tight text-center lg:text-left">
              Bienvenido de nuevo
            </CardTitle>
            <CardDescription className="text-center lg:text-left">
              ¿No tienes una cuenta?{" "}
              <Link
                className="font-medium text-primary transition-colors hover:text-primary/80 dark:hover:text-primary/80 underline-offset-4 hover:underline"
                href="/sign-up"
              >
                Regístrate
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-1 gap-3">
              <GoogleSignInButton />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 dark:bg-neutral-800 dark:text-gray-400">
                  O continúa con correo
                </span>
              </div>
            </div>

            <form
              className="space-y-5"
              action={async (formData) => {
                try {
                  const result = await signInAction(formData);
                  console.log("Resultado login:", result);

                  if (!('success' in result) ) {
                    setMessage(result);
                  }
                  else if ('success' in result && result.success === true) {
                    const { token, id, username, role, rememberMe } = result.userData;

                    const expiryDays = rememberMe ? 30 : undefined;

                    setCookie('authToken', token, expiryDays);

                    const userInfo = { id, username, role };
                    setCookie('userInfo', JSON.stringify(userInfo), expiryDays);

                    try {
                      localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    } catch (e) {
                      console.error('Error al guardar información del usuario:', e);
                    }

                    router.push(result.redirectTo);

                    setTimeout(() => {
                      window.location.href = result.redirectTo;
                    }, 300);
                  }
                } catch (error) {
                  console.error("Error durante el envío:", error);
                  setMessage({
                    type: "error",
                    text: "Ocurrió un error durante el inicio de sesión"
                  });
                }
              }}
              ref={formRef}
              onSubmit={handleSubmit}
            >
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Correo electrónico
                </Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-lg border border-gray-200 px-4
                    text-gray-900 placeholder-gray-400 focus:border-primary
                    focus:ring focus:ring-primary/20 transition-all
                    dark:border-gray-700 dark:bg-neutral-800/80 dark:text-gray-100
                    dark:placeholder-gray-500 dark:focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Contraseña
                  </Label>
                  <Link
                    className="text-xs font-medium text-primary hover:text-primary/90 hover:underline underline-offset-4 transition-colors"
                    href="/forgot-password"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  required
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-lg border border-gray-200 px-4
                    text-gray-900 placeholder-gray-400 focus:border-primary
                    focus:ring focus:ring-primary/20 transition-all
                    dark:border-gray-700 dark:bg-neutral-800/80 dark:text-gray-100
                    dark:placeholder-gray-500 dark:focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" name="remember-me" disabled={isSubmitting} />
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-200"
                >
                  Mantener sesión iniciada
                </label>
              </div>

              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-lg bg-primary font-medium text-black transition-colors hover:bg-primary/90 focus:outline-none focus:ring focus:ring-primary/20"
              >
                {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>

              <div className="text-center">
                <FormMessage message={message} />
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Al iniciar sesión, aceptas nuestros{" "}
              <Link
                href="/terms"
                className="text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
              >
                Términos de servicio
              </Link>{" "}
              y{" "}
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