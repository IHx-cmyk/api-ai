const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// ─── Rate Limiter (in-memory) ─────────────────────────────────────────────────
const rateLimitMap = new Map()
const RATE_LIMIT = 30
const RATE_WINDOW = 60 * 1000

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown'
  const now = Date.now()
  let entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW }
    rateLimitMap.set(ip, entry)
  }

  entry.count++
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT)
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - entry.count))
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000))

  if (entry.count > RATE_LIMIT) {
    return res.status(429).json({
      status: false,
      message: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetAt - now) / 1000)}s`
    })
  }
  next()
}

setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip)
  }
}, 5 * 60 * 1000)

// ─── Response Cache (in-memory) ───────────────────────────────────────────────
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

function getCacheKey(route, query) {
  return `${route}::${JSON.stringify(query)}`
}

function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') return next()

  const key = getCacheKey(req.path, req.query)
  const cached = cache.get(key)

  if (cached && Date.now() < cached.expireAt) {
    res.setHeader('X-Cache', 'HIT')
    res.setHeader('Content-Type', cached.contentType || 'application/json')
    return res.send(cached.data)
  }

  const origJson = res.json.bind(res)
  const origSend = res.send.bind(res)

  res.json = (data) => {
    cache.set(key, {
      data: JSON.stringify(data),
      expireAt: Date.now() + CACHE_TTL,
      contentType: 'application/json'
    })
    res.setHeader('X-Cache', 'MISS')
    return origJson(data)
  }

  res.send = (data) => {
    if (res.statusCode < 400 && Buffer.isBuffer(data)) {
      cache.set(key, {
        data,
        expireAt: Date.now() + CACHE_TTL,
        contentType: res.getHeader('Content-Type') || 'application/octet-stream'
      })
      res.setHeader('X-Cache', 'MISS')
    }
    return origSend(data)
  }

  next()
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expireAt) cache.delete(key)
  }
}, 10 * 60 * 1000)

// ─── Timeout Wrapper ──────────────────────────────────────────────────────────
const GLOBAL_TIMEOUT = 20000

function withTimeout(handler) {
  return async (req, res) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({ status: false, message: 'Request timeout (20s)' })
      }
    }, GLOBAL_TIMEOUT)

    try {
      await handler(req, res)
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({ status: false, message: err.message || 'Internal Server Error' })
      }
    } finally {
      clearTimeout(timer)
    }
  }
}

// ─── Handler Routes Config ────────────────────────────────────────────────────
const HANDLER_ROUTES = {
  'Aoshi':       { route: '/api/aoshi',       param: 'q',        type: 'chat' },
  'Copilot':     { route: '/api/copilot',     param: 'q',        type: 'chat' },
  'Dolphinai':   { route: '/api/dolphin',     param: 'q',        type: 'chat' },
  'Publicai':    { route: '/api/publicai',    param: 'q',        type: 'chat' },
  'bibleai':     { route: '/api/bibleai',     param: 'q',        type: 'chat' },
  'blackbox':    { route: '/api/blackbox',    param: 'q',        type: 'chat' },
  'bypassai':    { route: '/api/bypassai',    param: 'q',        type: 'chat' },
  'chathub':     { route: '/api/chathub',     param: 'q',        type: 'chat' },
  'claude':      { route: '/api/claude',      param: 'text',     type: 'chat' },
  'deepai':      { route: '/api/deepai',      param: 'q',        type: 'chat' },
  'deepseek':    { route: '/api/deepseek',    param: 'q',        type: 'chat' },
  'dyronai':     { route: '/api/dyronai',     param: 'q',        type: 'chat' },
  'esp':         { route: '/api/esp',         param: 'q',        type: 'chat' },
  'gemini':      { route: '/api/gemini',      param: 'q',        type: 'chat' },
  'genweb':      { route: '/api/genweb',      param: 'q',        type: 'chat' },
  'gita':        { route: '/api/gita',        param: 'q',        type: 'chat' },
  'gpt':         { route: '/api/gpt',         param: 'q',        type: 'chat' },
  'grok':        { route: '/api/grok',        param: 'q',        type: 'chat' },
  'heckai':      { route: '/api/heckai',      param: 'q',        type: 'chat' },
  'iask':        { route: '/api/iask',        param: 'q',        type: 'chat' },
  'kimi':        { route: '/api/kimi',        param: 'q',        type: 'chat' },
  'metaai':      { route: '/api/metaai',      param: 'q',        type: 'chat' },
  'muslimai':    { route: '/api/muslimai',    param: 'q',        type: 'chat' },
  'nanobanana':  { route: '/api/nanobanana',  param: 'imageUrl', type: 'image' },
  'notegpt':     { route: '/api/notegpt',     param: 'q',        type: 'chat' },
  'openai':      { route: '/api/openai',      param: 'q',        type: 'chat' },
  'scite':       { route: '/api/scite',       param: 'q',        type: 'chat' },
  'soymascol':   { route: '/api/soymascol',   param: 'q',        type: 'chat' },
  'svara':       { route: '/api/svara',       param: 'q',        type: 'chat' },
  'talkai':      { route: '/api/talkai',      param: 'q',        type: 'chat' },
  'turboseek':   { route: '/api/turboseek',   param: 'q',        type: 'chat' },
  'venice':      { route: '/api/venice',      param: 'q',        type: 'chat' },
  'zerogpt':     { route: '/api/zerogpt',     param: 'q',        type: 'chat' },
  'fluximg':     { route: '/api/fluximg',     param: 'prompt',   type: 'image' },
  'text2img':    { route: '/api/text2img',    param: 'q',        type: 'image' },
  'petimg':      { route: '/api/petimg',      param: 'q',        type: 'image' },
  'imgtoprompt': { route: '/api/imgtoprompt', param: 'url',      type: 'image' },
  'seaart':      { route: '/api/seaart',      param: 'q',        type: 'image' },
}

// ─── Auto-load handlers ───────────────────────────────────────────────────────
const handlersDir = path.join(__dirname, 'dist', 'handlers')
const loadedRoutes = []
const failedRoutes = []

if (!fs.existsSync(handlersDir)) {
  console.error('❌ Folder dist/handlers/ tidak ditemukan. Jalankan: npm run build')
  process.exit(1)
}

for (const [filename, info] of Object.entries(HANDLER_ROUTES)) {
  const filePath = path.join(handlersDir, `${filename}.js`)

  if (!fs.existsSync(filePath)) {
    failedRoutes.push({ name: filename, route: info.route, reason: 'file tidak ditemukan' })
    continue
  }

  try {
    const mod = require(filePath)
    const handler = mod.default || mod

    if (typeof handler !== 'function') {
      failedRoutes.push({ name: filename, route: info.route, reason: 'export bukan function' })
      continue
    }

    app.get(info.route, rateLimit, cacheMiddleware, withTimeout(handler))
    app.post(info.route, rateLimit, withTimeout(handler))
    loadedRoutes.push({ name: filename, route: info.route, type: info.type, param: info.param })
  } catch (err) {
    failedRoutes.push({ name: filename, route: info.route, reason: err.message })
  }
}

// ─── /api - daftar semua route ────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    status: true,
    loaded: loadedRoutes.length,
    failed: failedRoutes.length,
    routes: loadedRoutes,
    errors: failedRoutes
  })
})

// ─── /api/status - cek semua scraper ─────────────────────────────────────────
app.get('/api/status', async (req, res) => {
  const results = []
  const checks = loadedRoutes.map(async (r) => {
    const testQuery = r.type === 'image' ? 'cat' : 'hi'
    const url = `http://localhost:${PORT}${r.route}?${r.param}=${encodeURIComponent(testQuery)}`
    const start = Date.now()
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8000)
      const resp = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)
      results.push({ name: r.name, route: r.route, status: resp.ok ? 'up' : 'error', ms: Date.now() - start, code: resp.status })
    } catch (err) {
      results.push({ name: r.name, route: r.route, status: 'down', ms: Date.now() - start, error: err.message })
    }
  })

  await Promise.all(checks)

  const up = results.filter(r => r.status === 'up').length
  res.json({
    status: true,
    summary: { up, down: results.length - up, total: results.length },
    results
  })
})

// ─── /api/cache/clear ─────────────────────────────────────────────────────────
app.post('/api/cache/clear', (req, res) => {
  const size = cache.size
  cache.clear()
  res.json({ status: true, message: `Cleared ${size} cached entries` })
})

// ─── Serve frontend ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 AI Hub running at http://localhost:${PORT}`)
  console.log(`\n✅ Loaded (${loadedRoutes.length}):`)
  loadedRoutes.forEach(r => {
    const icon = r.type === 'image' ? '🖼️ ' : '💬'
    console.log(`   ${icon} ${r.route.padEnd(22)} ← ${r.name}`)
  })
  if (failedRoutes.length > 0) {
    console.log(`\n❌ Failed (${failedRoutes.length}):`)
    failedRoutes.forEach(r => console.log(`   ⚠️  ${r.name}: ${r.reason}`))
  }
  console.log(`\n📋 Routes  : http://localhost:${PORT}/api`)
  console.log(`📡 Status  : http://localhost:${PORT}/api/status`)
  console.log(`🌐 Web UI  : http://localhost:${PORT}\n`)
})
