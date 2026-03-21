import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { Sidebar } from '@/components/shared/Sidebar'
import { ModalProvider } from '@/components/shared/ModalProvider'

async function getUserOnboardingStatus(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1'}/users/me`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' },
    )
    if (!res.ok) return true // on error, don't block
    const data = await res.json()
    return data.onboardingCompleted ?? true
  } catch {
    return true
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const accessToken = (session as any).accessToken as string | undefined
  if (accessToken) {
    const done = await getUserOnboardingStatus(accessToken)
    if (!done) redirect('/onboarding')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
      <ModalProvider />
    </div>
  )
}
