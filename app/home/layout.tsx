import { HomeLayoutClient } from '@/components/home/home-layout-client'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <HomeLayoutClient>{children}</HomeLayoutClient>
}
