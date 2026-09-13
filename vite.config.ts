import { execSync } from 'node:child_process'
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
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash()),
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/utils/quizValidation.ts', 'src/utils/quizGenerator.ts', 'src/utils/shuffle.ts', 'src/utils/time.ts', 'src/utils/sound.ts', 'src/components/ResultPage.tsx'],
    },
  },
})
