import { TicketIcon } from 'lucide-react'

export default function TicketsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
      <TicketIcon className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-xl font-bold text-foreground">Mis Tickets</h1>
      <p className="text-balance text-center text-sm text-muted-foreground">
        Aqui encontraras tus eventos reservados. Reserva un evento para ver tu ticket aqui.
      </p>
    </div>
  )
}
