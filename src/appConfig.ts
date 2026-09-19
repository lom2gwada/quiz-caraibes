import type { EngineConfig } from '@engine'
import { messages } from './messages'

export const appConfig: EngineConfig = {
  appId: 'quiz-forge',
  tablePrefix: 'quiz_forge',
  appName: 'Quiz Forge',
  messages,
}
