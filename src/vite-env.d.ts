/// <reference types="vite/client" />

/** Hash court du commit courant, injecté au build (`vite.config.ts`). */
declare const __COMMIT_HASH__: string

declare module '*.csv?raw' {
  const content: string
  export default content
}

declare module '*.svg?raw' {
  const content: string
  export default content
}
