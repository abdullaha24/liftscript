import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import ProgramWizard from "@/components/ProgramWizard/index"

export default async function SetupPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { setupDone: true }
  })

  if (user?.setupDone) {
    redirect("/journal")
  }

  return (
    <main className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <ProgramWizard />
    </main>
  )
}
