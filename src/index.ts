import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// let client: ReturnType<typeof neon>

// export async function getClient() {
//   if (!process.env.VITE_DATABASE_URL) {
//     return undefined
//   }
//   if (!client) {
//     client = await neon(process.env.VITE_DATABASE_URL!)
//   }
//   return client
// }
