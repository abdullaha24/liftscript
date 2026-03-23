import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import AuthForm from "@/components/AuthForm"

export default async function LandingPage() {
  const session = await auth()
  
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { setupDone: true }
    })
    
    if (user?.setupDone) {
      redirect("/journal")
    } else {
      redirect("/setup")
    }
  }

  return (
    <main className="container flex items-center justify-center" style={{ minHeight: '100vh' }}>
      <AuthForm />
    </main>
  )
}
