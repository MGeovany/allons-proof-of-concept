"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { registerWithEmail, loginWithGoogle } from "@/lib/auth-actions";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

const MIN_NAME_LENGTH = 2;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [values, setValues] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function validate(formData: FormData): string | null {
    const name = (formData.get("name") as string)?.trim() ?? "";
    const username = (formData.get("username") as string)?.trim() ?? "";
    const email = (formData.get("email") as string)?.trim() ?? "";
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name) return "El nombre es obligatorio";
    if (name.length < MIN_NAME_LENGTH) return "El nombre es muy corto";
    if (!username) return "El nombre de usuario es obligatorio";
    if (username.length < MIN_NAME_LENGTH)
      return "El nombre de usuario es muy corto";
    if (!email) return "El correo electrónico es obligatorio";
    if (!EMAIL_REGEX.test(email))
      return "Introduce un correo electrónico válido";
    if (!password) return "La contraseña es obligatoria";
    if (password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres";
    if (password !== confirmPassword) return "Las contraseñas no coinciden";

    return null;
  }

  async function handleSubmit(formData: FormData) {
    const validationError = validate(formData);
    if (validationError) {
      setError(validationError);
      setValues({
        name: (formData.get("name") as string) ?? "",
        username: (formData.get("username") as string) ?? "",
        email: (formData.get("email") as string) ?? "",
        password: (formData.get("password") as string) ?? "",
        confirmPassword: (formData.get("confirmPassword") as string) ?? "",
      });
      return;
    }
    setLoading(true);
    setError(null);
    const result = await registerWithEmail(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      setValues({
        name: (formData.get("name") as string) ?? "",
        username: (formData.get("username") as string) ?? "",
        email: (formData.get("email") as string) ?? "",
        password: (formData.get("password") as string) ?? "",
        confirmPassword: (formData.get("confirmPassword") as string) ?? "",
      });
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    const result = await loginWithGoogle(next);
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

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="pt-2">
          <Image
            src="/images/logo-orange.png"
            alt="Allons"
            width={200}
            height={64}
            className="h-auto w-40 object-contain sm:w-48"
          />
        </div>

        <form action={handleSubmit} className="flex w-full flex-col gap-3.5">
          {next && <input type="hidden" name="next" value={next} />}
          <input
            name="name"
            type="text"
            placeholder="Nombre"
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            className="w-full rounded-lg bg-white px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
          <input
            name="username"
            type="text"
            placeholder="Nombre de usuario"
            required
            value={values.username}
            onChange={(e) =>
              setValues((v) => ({ ...v, username: e.target.value }))
            }
            className="w-full rounded-lg bg-white px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
          <input
            name="email"
            type="email"
            placeholder="Correo Electronico"
            required
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            className="w-full rounded-lg bg-white px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-primary"
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contrasena"
              required
              minLength={6}
              value={values.password}
              onChange={(e) =>
                setValues((v) => ({ ...v, password: e.target.value }))
              }
              className="w-full rounded-lg bg-white pr-12 pl-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff className="h-6 w-6" strokeWidth={2} aria-hidden />
              ) : (
                <Eye className="h-6 w-6" strokeWidth={2} aria-hidden />
              )}
            </button>
          </div>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar Contrasena"
              required
              minLength={6}
              value={values.confirmPassword}
              onChange={(e) =>
                setValues((v) => ({ ...v, confirmPassword: e.target.value }))
              }
              className="w-full rounded-lg bg-white pr-12 pl-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label={
                showConfirmPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-6 w-6" strokeWidth={2} aria-hidden />
              ) : (
                <Eye className="h-6 w-6" strokeWidth={2} aria-hidden />
              )}
            </button>
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <div className="flex w-full flex-col gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-orange-primary py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Continuar"}
            </button>
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
              Registrar con Google
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col items-center pb-10 pt-4">
        <p className="text-sm text-muted-foreground">
          {"Ya tienes una cuenta? "}
          <Link
            href="/auth/login"
            className="font-semibold italic text-orange-primary hover:underline"
          >
            Inicia Sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
