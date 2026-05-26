import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function createResponseAdapter(res) {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value
      res.setHeader(name, value)
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      if (!res.headersSent) {
        res.statusCode = this.statusCode
        res.setHeader('Content-Type', 'application/json')
      }
      res.end(JSON.stringify(payload))
    },
  }
}

function localApiPlugin() {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use('/api/ai', (req, res) => {
        const chunks = []
        req.on('data', (chunk) => chunks.push(chunk))
        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8')
            req.body = rawBody ? JSON.parse(rawBody) : {}
            const { default: handler } = await import('./api/ai.js')
            await handler(req, createResponseAdapter(res))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: error.message || 'Local API failed.' }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), localApiPlugin()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chart-vendor': ['recharts'],
            'motion-vendor': ['framer-motion'],
            'icons-vendor': ['lucide-react'],
          },
        },
      },
    },
  }
})
