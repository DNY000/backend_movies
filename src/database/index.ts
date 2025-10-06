import 'dotenv/config'
import mongoose from 'mongoose'
import { DatabaseConnection } from './connection.js'
// Import all models so mongoose builds their indexes if needed
import './models/index.js'

async function main() {
  const db = DatabaseConnection.getInstance()
  await db.connect()

  // Ensure indexes are created for all registered models
  const modelNames = mongoose.modelNames()
  for (const name of modelNames) {
    try {
      await mongoose.model(name).syncIndexes()
      // eslint-disable-next-line no-console
      console.log(`Synced indexes for model: ${name}`)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Failed syncing indexes for model ${name}:`, err)
    }
  }

  // Optional: basic seed to verify connection (safe no-op if exists)
  // Add your seed logic here if desired.

  await mongoose.disconnect()
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error('Database init failed:', err)
  process.exit(1)
})

// Database index file
export * from './connection.js'
export * from './repositories/index.js'
