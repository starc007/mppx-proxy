import { createApp } from './app'

// Cloudflare Workers entry point.
// For local Bun dev, use src/server.ts via `bun dev`.
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const { app } = createApp(env)
    return app.fetch(request, env)
  },
}
