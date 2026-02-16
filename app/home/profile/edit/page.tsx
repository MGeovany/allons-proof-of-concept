import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function EditProfilePage() {
  return (
    <div className="flex flex-1 flex-col px-4 pb-24">
      <header className="flex items-center justify-between py-4">
        <Link
          href="/home/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
          aria-label="Volver"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Editar perfil</h1>
        <div className="w-10" aria-hidden />
      </header>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Próximamente podrás editar tu nombre, foto y ubicación.
      </p>
    </div>
  )
}
