import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <main className="flex flex-1 flex-col px-6">
      <Suspense fallback={<div className="flex flex-1 items-center justify-center">Cargando...</div>}>
        <RegisterForm />
      </Suspense>
    </main>
  )
}
