import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createBotDispatchHandler, localGitHubCredential } from './server/trendingBotDispatch.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), {
      name: 'local-bot-dispatch',
      configureServer(server) {
        const handle = createBotDispatchHandler({
          projectId: env.VITE_FIREBASE_PROJECT_ID,
          getToken: () => env.GITHUB_BOT_TOKEN || localGitHubCredential(),
        })
        server.middlewares.use('/api/bot/dispatch', handle)
      },
    }],
  }
})
