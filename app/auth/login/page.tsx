import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col px-6">
      <Suspense fallback={<div className="flex flex-1 items-center justify-center">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
