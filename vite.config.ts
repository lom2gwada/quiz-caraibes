import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Hash court du commit courant, injecté au build : affiché en pied de page pour vérifier
// qu'une page ouverte reflète bien le dernier déploiement (pas de versioning manuel à tenir
// à jour — ce projet déploie en continu, à chaque commit sur master).
function commitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  plugins: [react()],
  base: '/quiz-caraibes/',
  // Le moteur commun vit dans le sous-module git `engine/` (dépôt quiz-engine) : `@engine` = son index,
  // `@engine/...` = ses sources.
  resolve: {
    alias: [
      { find: /^@engine$/, replacement: fileURLToPath(new URL('./engine/src/index.ts', import.meta.url)) },
      { find: /^@engine\//, replacement: fileURLToPath(new URL('./engine/src/', import.meta.url)) },
    ],
  },
  build: {
    rollupOptions: {
      output: {
        // Bibliothèques à part : elles ne changent presque jamais, donc restent en cache du navigateur quand seul le code de l'appli est redéployé
        // (supabase-js ≈ 220 Ko, React ≈ 150 Ko : près de la moitié du JS au démarrage).
        manualChunks(id: string) {
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase'
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) return 'vendor-react'
        },
      },
    },
  },
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash()),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'engine/src/**/*.test.{ts,tsx}'],
    setupFiles: ['./engine/src/testing/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['engine/src/utils/quizValidation.ts', 'engine/src/utils/quizGenerator.ts', 'engine/src/utils/shuffle.ts', 'engine/src/utils/time.ts', 'engine/src/utils/sound.ts', 'engine/src/components/ResultPage.tsx'],
    },
  },
})
