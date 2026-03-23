import { db } from "@/lib/db"
import bcrypt from "bcrypt"

const rateLimiter = new Map()

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    // Simplistic in-memory rate limiting: 5 requests per 15 mins per IP
    const record = rateLimiter.get(ip) || { count: 0, timestamp: now }
    if (now - record.timestamp > 15 * 60 * 1000) {
      record.count = 0
      record.timestamp = now
    }
    record.count++
    rateLimiter.set(ip, record)

    if (record.count > 5) {
      return Response.json({ error: "Too many attempts" }, { status: 429 })
    }

    const { username, password } = await req.json()

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return Response.json({ error: "Username is required" }, { status: 400 })
    }
    
    if (!password || typeof password !== "string" || password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const trimmedUsername = username.trim()

    const existingUser = await db.user.findUnique({
      where: { username: trimmedUsername }
    })

    if (existingUser) {
      return Response.json({ error: "Username already taken" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        username: trimmedUsername,
        password: hashedPassword
      }
    })

    return Response.json({ success: true, user: { id: user.id, username: user.username } })
  } catch (error) {
    console.error("Registration error:", error)
    return Response.json({ error: "Something went wrong" }, { status: 500 })
  }
}
