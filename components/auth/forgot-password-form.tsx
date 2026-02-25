"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-actions";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await requestPasswordReset(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-muted/30 px-4 py-6 text-center">
        <p className="text-sm text-foreground">
          Revisa tu correo. Si existe una cuenta con ese email, recibirás un
          enlace para restablecer tu contraseña.
        </p>
        <Link
          href="/auth/login"
          className="text-sm font-semibold text-orange-primary hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <input
        name="email"
        type="email"
        placeholder="Correo electrónico"
        required
        className="w-full rounded-lg bg-input px-4 py-3.5 text-sm text-input-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-primary"
      />
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-orange-primary py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Enviando…" : "Enviar enlace"}
      </button>
    </form>
  );
}
