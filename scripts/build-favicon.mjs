// Génère public/favicon.svg à partir des vraies silhouettes de src/data/region.ts (mer des
// Caraïbes), recadrées sur le seul arc insulaire (Mexique/Amérique centrale/Colombie/Venezuela
// exclus : leur inclusion étire l'icône en une bande diagonale illisible à taille favicon).
// Usage : node scripts/build-favicon.mjs
import fs from 'node:fs'

const REGION_TS = new URL('../src/data/region.ts', import.meta.url)
const OUT = new URL('../public/favicon.svg', import.meta.url)

const MAINLAND = new Set(['Belize', 'Guatemala', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama', 'Colombie', 'Venezuela', 'Mexique'])
const CANVAS = 320
const PAD = 4
const DOT_R = 6
const BG = '#04212b' // --bg (thème lagon)
const FG = '#2dd4bf' // --accent (thème lagon)

const src = fs.readFileSync(REGION_TS, 'utf8')
const start = src.indexOf('export const region')
const braceStart = src.indexOf('{', start)
let depth = 0
let i = braceStart
for (; i < src.length; i++) {
  if (src[i] === '{') depth++
  else if (src[i] === '}') { depth--; if (depth === 0) break }
}
const objText = src.slice(braceStart, i + 1).replace(/,(\s*})/g, '$1')
const region = JSON.parse(objText)

const islands = Object.entries(region).filter(([name]) => !MAINLAND.has(name))

// Bounding box calculée sur les vraies coordonnées des tracés (pas les centroïdes) pour un
// recadrage exact.
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
const numPairRe = /(-?[\d.]+),(-?[\d.]+)/g
for (const [, shape] of islands) {
  const points = shape.d ? [...shape.d.matchAll(numPairRe)].map((m) => [Number(m[1]), Number(m[2])]) : [[shape.cx, shape.cy]]
  for (const [x, y] of points) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
}
minX -= PAD; minY -= PAD; maxX += PAD; maxY += PAD
const bboxW = maxX - minX
const bboxH = maxY - minY
const scale = CANVAS / Math.max(bboxW, bboxH)
const offX = (CANVAS - bboxW * scale) / 2 - minX * scale
const offY = (CANVAS - bboxH * scale) / 2 - minY * scale

const shapes = islands.map(([, shape]) => (
  shape.d ? `<path d="${shape.d}"/>` : `<circle cx="${shape.cx}" cy="${shape.cy}" r="${DOT_R}"/>`
)).join('')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}">
  <rect width="${CANVAS}" height="${CANVAS}" rx="56" fill="${BG}"/>
  <g transform="translate(${offX.toFixed(2)},${offY.toFixed(2)}) scale(${scale.toFixed(4)})" fill="${FG}">${shapes}</g>
</svg>
`

fs.writeFileSync(OUT, svg)
console.log('favicon.svg écrit', `(${(svg.length / 1024).toFixed(1)} Ko, ${islands.length} territoires)`)
