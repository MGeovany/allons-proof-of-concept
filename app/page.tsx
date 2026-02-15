import Link from "next/link";
import Image from "next/image";

export default function SplashPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8">
      <div className="flex flex-1 items-center justify-center">
        <Image
          src="/images/logo-white.png"
          alt="Allons"
          width={390}
          height={100}
          className="h-auto w-[390px] object-contain"
          priority
        />
      </div>

      <div className="flex w-full flex-col items-center gap-4 pb-16">
        <Link
          href="/auth/register"
          className="flex w-72 items-center justify-center rounded-2xl bg-orange-primary py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          Registrar
        </Link>
        <Link
          href="/auth/login"
          className="flex w-72 items-center justify-center rounded-2xl bg-orange-primary py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          Iniciar Sesion
        </Link>
      </div>
    </main>
  );
}
