"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updatePassword } from "@/lib/auth-actions";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(true);
      if (!session) setInvalidLink(true);
    });
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await updatePassword(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  if (!ready) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Cargando…
      </p>
    );
  }

  if (invalidLink) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-muted/30 px-4 py-6 text-center">
        <p className="text-sm text-foreground">
          El enlace no es válido o ha expirado. Solicita uno nuevo desde la
          pantalla de inicio de sesión.
        </p>
        <a
          href="/auth/forgot-password"
          className="text-sm font-semibold text-orange-primary hover:underline"
        >
          Restablecer contraseña
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Nueva contraseña"
          required
          minLength={6}
          className="w-full rounded-lg bg-input pr-12 pl-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-primary"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-neutral-500 hover:text-neutral-700"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" aria-hidden />
          ) : (
            <Eye className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>
      <div className="relative">
        <input
          name="confirmPassword"
          type={showConfirm ? "text" : "password"}
          placeholder="Confirmar contraseña"
          required
          minLength={6}
          className="w-full rounded-lg bg-input pr-12 pl-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-primary"
        />
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-neutral-500 hover:text-neutral-700"
          aria-label={
            showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"
          }
        >
          {showConfirm ? (
            <EyeOff className="h-5 w-5" aria-hidden />
          ) : (
            <Eye className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-orange-primary py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
