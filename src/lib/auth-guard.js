import { auth } from "@/lib/auth"

export async function requireOwnership(resourceUserId) {
  const session = await auth()
  
  if (!session?.user?.id) {
    const error = new Error("Not authenticated")
    error.status = 401
    throw error
  }
  
  if (resourceUserId && session.user.id !== resourceUserId) {
    const error = new Error("Forbidden")
    error.status = 403
    throw error
  }
  
  return session
}

export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user?.id) {
    const error = new Error("Not authenticated")
    error.status = 401
    throw error
  }
  
  return session
}
