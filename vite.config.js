import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createBotDispatchHandler, localGitHubCredential } from './server/trendingBotDispatch.js'
import { resolveFirebaseConfig } from './src/lib/firebaseConfig.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), {
      name: 'local-bot-dispatch',
      configureServer(server) {
        const handle = createBotDispatchHandler({
          projectId: resolveFirebaseConfig(env).projectId,
          getToken: () => env.GITHUB_BOT_TOKEN || localGitHubCredential(),
        })
        server.middlewares.use('/api/bot/dispatch', handle)
      },
    }],
  }
})
