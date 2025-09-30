#!/usr/bin/env node

/**
 * Movies API server entrypoint (Express)
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { routes } from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js'
import { corsMiddleware } from './middleware/cors.middleware.js'
import { appConfig } from './config/app.config.js'
import { DatabaseConnection } from './database/connection.js'

class MoviesApp {
  private app = express()
  private server: any
  private db = DatabaseConnection.getInstance()

  constructor() {
    this.setupMiddleware()
    this.setupRoutes()
    this.setupErrors()
  }

  private setupMiddleware(): void {
    this.app.use(cors())
    this.app.use(corsMiddleware)
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true }))
  }

  private setupRoutes(): void {
    this.app.use(routes)
    this.app.get('/', (_req, res) => {
      res.json({ success: true, message: 'Movies API Server', ts: new Date().toISOString() })
    })
  }

  private setupErrors(): void {
    this.app.use(notFoundHandler)
    this.app.use(errorHandler)
  }

  public async start(): Promise<void> {
    await this.db.connect()
    const basePort = appConfig.port

    const listen = (port: number) => {
      this.server = this.app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`Listening on port: ${port}`)
      })
      this.server.on('error', (err: any) => {
        if (err?.code === 'EADDRINUSE') {
          // eslint-disable-next-line no-console
          console.log(`Port ${port} is in use, trying port ${port + 1}`)
          listen(port + 1)
        } else {
          // eslint-disable-next-line no-console
          console.error('Server error:', err)
        }
      })
    }

    listen(basePort)
  }

  public async stop(): Promise<void> {
    if (this.server) this.server.close()
    await this.db.disconnect()
  }
}

const app = new MoviesApp()
app.start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err)
  process.exit(1)
})

export default app
