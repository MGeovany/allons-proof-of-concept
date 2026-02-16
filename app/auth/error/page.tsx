import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <h1 className="mb-4 text-2xl font-bold text-foreground">
        Error de autenticacion
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        Hubo un problema al iniciar sesion. Por favor, intenta de nuevo.
      </p>
      <Link
        href="/"
        className="rounded-full px-8 py-3 font-semibold text-primary-foreground bg-orange-primary"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
