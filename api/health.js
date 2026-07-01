export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const groqConfigured = Boolean(process.env.GROQ_API_KEY)
  const openRouterEnabled = process.env.OPENROUTER_ENABLED === 'true'
  const openRouterConfigured = Boolean(process.env.OPENROUTER_API_KEY)
  const supabaseConfigured = Boolean(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)
    && (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)
  )

  response.setHeader('Cache-Control', 'no-store')
  return response.status(200).json({
    status: 'ok',
    generatedAt: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'local',
    supabase: {
      configured: supabaseConfigured,
    },
    ai: {
      providerConfigured: groqConfigured || (openRouterEnabled && openRouterConfigured),
      groqConfigured,
      openRouterEnabled,
      openRouterConfigured,
      authRequired: process.env.AI_REQUIRE_AUTH === 'true',
      remoteRateLimitConfigured: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    },
    build: {
      commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    },
  })
}
