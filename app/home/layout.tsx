import { BottomNav } from '@/components/bottom-nav'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">{children}</div>
      <BottomNav />
    </div>
  )
}
