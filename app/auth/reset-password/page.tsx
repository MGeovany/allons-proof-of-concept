import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex flex-1 flex-col px-6">
      <div className="flex flex-1 flex-col py-2">
        <Link
          href="/auth/login"
          className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-3 text-sm font-semibold text-white transition-opacity hover:bg-white/15 active:opacity-80"
          aria-label="Volver al inicio de sesión"
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

          <div className="w-full max-w-sm text-center">
            <h1 className="text-lg font-semibold text-white">
              Nueva contraseña
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Elige una contraseña segura de al menos 6 caracteres.
            </p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
