// ─── Playwright Layout Extraction Server ─────────────────────

import express from 'express'
import cors from 'cors'
import { extractLayoutRoute } from './routes/extract-layout.js'
import { closeBrowser } from './modules/extract.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests de qualquer localhost (qualquer porta)
      if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true)
      } else {
        callback(new Error('CORS not allowed'))
      }
    },
  }),
)
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'playwright-layout-server' })
})

// Pipeline principal
app.post('/api/extract-layout', extractLayoutRoute)

// Graceful shutdown
const shutdown = async () => {
  console.log('[server] Shutting down...')
  await closeBrowser()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

app.listen(PORT, () => {
  console.log(`[playwright-server] Listening on http://localhost:${PORT}`)
  console.log(`[playwright-server] POST /api/extract-layout`)
})
