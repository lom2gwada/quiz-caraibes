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
  base: '/quiz-forge/',
  // Le moteur commun vit dans le sous-module git `engine/` (dépôt quiz-engine) : `@engine` = son index,
  // `@engine/...` = ses sources.
  resolve: {
    alias: [
      { find: /^@engine$/, replacement: fileURLToPath(new URL('./engine/src/index.ts', import.meta.url)) },
      { find: /^@engine\//, replacement: fileURLToPath(new URL('./engine/src/', import.meta.url)) },
    ],
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
