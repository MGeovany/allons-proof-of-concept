import { redirect } from 'next/navigation'
import { getProfileForEdit } from '@/lib/profile-actions'
import { EditProfileForm } from '@/components/home/edit-profile-form'

export default async function EditProfilePage() {
  const profile = await getProfileForEdit()
  if (profile === null) redirect('/auth/login')

  return <EditProfileForm profile={profile} />
}
