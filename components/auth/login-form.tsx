"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { loginWithEmail, loginWithGoogle } from "@/lib/auth-actions";
import { loginAsProvider } from "@/lib/provider-actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const asProvider = searchParams.get("as") === "provider";

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = asProvider
      ? await loginAsProvider(formData)
      : await loginWithEmail(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    const result = await loginWithGoogle();
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col py-2">
      <Link
        href="/"
        className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-3 text-sm font-semibold text-white transition-opacity hover:bg-white/15 active:opacity-80"
        aria-label="Volver"
      >
        <ChevronLeft className="h-5 w-5 shrink-0" />
      </Link>

      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        <div className="pt-2">
          <Image
            src="/images/logo-orange.png"
            alt="Allons"
            width={200}
            height={64}
            className="h-auto w-40 object-contain sm:w-48"
          />
        </div>

        {asProvider && (
          <p className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
            Acceso para proveedores. Solo el correo autorizado puede entrar.
          </p>
        )}
        {registered && !asProvider && (
          <p className="w-full rounded-lg bg-orange-primary/15 px-4 py-3 text-center text-sm text-orange-primary">
            Revisa tu correo para confirmar tu cuenta y luego inicia sesión.
          </p>
        )}

        <form action={handleSubmit} className="flex w-full flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Correo Electronico"
            required
            className="w-full rounded-lg bg-input px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contrasena"
              required
              className="w-full rounded-lg bg-input pr-10 pl-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200/80 hover:text-neutral-800"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={2} aria-hidden />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
              )}
            </button>
          </div>
          {!asProvider && (
            <div className="mt-1.5 flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-muted-foreground hover:text-orange-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <div className="flex flex-col items-center gap-2 pt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-orange-primary py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Cargando..." : asProvider ? "Entrar como proveedor" : "Continuar"}
            </button>
            {!asProvider && (
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white py-3.5 text-sm font-semibold text-neutral-900 transition-opacity hover:bg-white/95 active:opacity-90 disabled:opacity-50"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </button>
            )}
          </div>
        </form>
      </div>

      <div className="flex flex-col items-center gap-2 pb-10 pt-6">
        <p className="text-sm text-muted-foreground">
          {"No tienes una cuenta? "}
          <Link
            href="/auth/register"
            className="font-semibold text-orange-primary hover:underline"
          >
            Registrarme
          </Link>
        </p>
        <Link
          href={asProvider ? "/auth/login" : "/auth/login?as=provider"}
          className="text-sm text-muted-foreground hover:underline"
        >
          {asProvider
            ? "Iniciar sesión como usuario"
            : "Iniciar sesión como proveedor"}
        </Link>
      </div>
    </div>
  );
}
