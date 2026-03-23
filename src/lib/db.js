import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Simple backup routine for SQLite
export function backupDb() {
  try {
    const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db')
    const backupPath = path.resolve(process.cwd(), 'prisma', 'dev.db.bak')
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath)
      console.log('Database backup created successfully.')
    }
  } catch (error) {
    console.error('Failed to backup database:', error)
  }
}
