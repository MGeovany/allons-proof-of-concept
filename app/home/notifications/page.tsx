import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
      <Bell className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-xl font-bold text-foreground">Notificaciones</h1>
      <p className="text-balance text-center text-sm text-muted-foreground">
        No tienes notificaciones nuevas.
      </p>
    </div>
  )
}
