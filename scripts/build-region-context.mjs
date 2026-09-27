// Génère src/data/regionContext.ts : contours (silhouette simple, non interactive) du reste du
// continent visible dans le cadre de la carte régionale composite (region.ts) — États-Unis,
// Équateur, etc. — pour ne pas laisser un vide autour des 37 territoires du quiz. Étendue et
// échelle INCHANGÉES : la projection (k/scale/ox/oy) est re-dérivée ici à l'identique, depuis les
// mêmes entrées déterministes que build-region.mjs (jamais copiée à la main), et le cadrage vient
// simplement du viewBox du SVG — tout ce qui tombe hors de region.ts/REGION_VIEWBOX n'est jamais
// dessiné, pas de découpe géométrique des polygones ici.
// Usage : node scripts/build-region-context.mjs
import fs from 'node:fs'
import { MATCH, NE_SOURCE, RING_FILTER } from './caribbean-territories.mjs'

const OUT = new URL('../src/data/regionContext.ts', import.meta.url)
const VIEW_W = 320, VIEW_H = 220
const PAD = 6
const RDP_EPS = 0.35
const MIN_RING_FRAC = 0.01
const MAX_RINGS = 10
const MIN_AREA = 0.15

const ringArea = r => {
  let a = 0
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] * r[i][1]) - (r[i][0] * r[j][1])
  return Math.abs(a) / 2
}

const rdp = (pts, eps) => {
  if (pts.length < 3) return pts
  const [a, b] = [pts[0], pts[pts.length - 1]]
  let idx = -1, max = 0
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / len
    if (d > max) { max = d; idx = i }
  }
  if (max <= eps) return [a, b]
  return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)]
}

const rdpRing = (ring, eps) => {
  const r = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1] ? ring.slice(0, -1) : ring
  if (r.length < 4) return r
  let far = 0, max = 0
  for (let i = 1; i < r.length; i++) {
    const d = Math.hypot(r[i][0] - r[0][0], r[i][1] - r[0][1])
    if (d > max) { max = d; far = i }
  }
  const half1 = rdp([...r.slice(0, far + 1)], eps)
  const half2 = rdp([...r.slice(far), r[0]], eps)
  return [...half1.slice(0, -1), ...half2.slice(0, -1)]
}

const gj = await fetch(NE_SOURCE).then((r) => r.json())

// 1-3) MÊME dérivation que build-region.mjs (mêmes entrées, même algorithme) -> k/scale/ox/oy
// forcément identiques à ceux déjà dans region.ts, sans les recopier à la main.
const byTerritory = {}
const matchedFeatures = new Set()
for (const [frName, pred] of Object.entries(MATCH)) {
  const feats = gj.features.filter(f => pred(f.properties))
  feats.forEach(f => matchedFeatures.add(f))
  if (!feats.length) continue
  let rings = []
  for (const f of feats) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
    for (const poly of polys) rings.push(poly[0].map(([x, y]) => [x, y]))
  }
  if (RING_FILTER[frName]) rings = rings.filter(RING_FILTER[frName])
  rings.sort((a, b) => ringArea(b) - ringArea(a))
  const maxA = ringArea(rings[0])
  rings = rings.filter(r => ringArea(r) >= maxA * MIN_RING_FRAC).slice(0, MAX_RINGS)
  byTerritory[frName] = rings
}
const allLonLat = Object.values(byTerritory).flat().flat()
const latC = allLonLat.reduce((s, p) => s + p[1], 0) / allLonLat.length
const k = Math.cos(latC * Math.PI / 180)
const proj = {}
for (const [name, rings] of Object.entries(byTerritory)) {
  proj[name] = rings.map(r => r.map(([lon, lat]) => [lon * k, -lat]))
}
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
for (const rings of Object.values(proj)) for (const p of rings.flat()) {
  minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]); maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1])
}
const scale = Math.min((VIEW_W - 2 * PAD) / (maxX - minX), (VIEW_H - 2 * PAD) / (maxY - minY))
const ox = (VIEW_W - (maxX - minX) * scale) / 2 - minX * scale
const oy = (VIEW_H - (maxY - minY) * scale) / 2 - minY * scale
const toView = ([lon, lat]) => [lon * k * scale + ox, -lat * scale + oy]

// Cadre visible, en lon/lat (inverse de toView) : filtre rapide avant projection, pour ne pas
// transformer point par point les continents entiers (Asie, Europe…) qu'on va de toute façon jeter.
const LON_MIN = -ox / (k * scale), LON_MAX = (VIEW_W - ox) / (k * scale)
const LAT_MAX = oy / scale, LAT_MIN = (oy - VIEW_H) / scale

// 4) reste du monde : toutes les features NON matchées par MATCH (donc pas déjà un territoire
// coloré du quiz), anneaux dont la bbox lon/lat touche le cadre visible.
let seen = 0, kept = 0
const contextRings = []
for (const f of gj.features) {
  if (matchedFeatures.has(f)) continue
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : []
  for (const poly of polys) {
    const ring = poly[0]
    if (!ring || ring.length < 4) continue
    seen++
    let rlonMin = Infinity, rlonMax = -Infinity, rlatMin = Infinity, rlatMax = -Infinity
    for (const [lon, lat] of ring) {
      rlonMin = Math.min(rlonMin, lon); rlonMax = Math.max(rlonMax, lon)
      rlatMin = Math.min(rlatMin, lat); rlatMax = Math.max(rlatMax, lat)
    }
    if (rlonMax < LON_MIN || rlonMin > LON_MAX || rlatMax < LAT_MIN || rlatMin > LAT_MAX) continue
    contextRings.push(ring.map(toView))
    kept++
  }
}

// 5) simplification, filtre des anneaux trop petits pour rester visibles à cette échelle
const simplified = contextRings.map(r => rdpRing(r, RDP_EPS)).filter(r => r.length >= 3 && ringArea(r) >= MIN_AREA)
const d = simplified.map(r => 'M' + r.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z').join('')

const lines = [
  '// Contours du reste du continent visibles dans le cadre de la carte régionale (region.ts) —',
  '// États-Unis, Équateur… Décoratif et non interactif (pas de nom, pas de survol) : juste pour ne',
  '// pas laisser un vide géographique autour des 37 territoires du quiz. Étendue/échelle inchangées :',
  '// même projection que region.ts, re-dérivée ici à l\'identique (voir build-region-context.mjs) ;',
  '// tout ce qui tombe hors de REGION_VIEWBOX n\'est simplement jamais dessiné (clip par le viewBox).',
  '// Régénérer : node scripts/build-region-context.mjs',
  '',
  `export const regionContext = ${JSON.stringify(d)}`,
  '',
]
fs.writeFileSync(OUT, lines.join('\n'))
console.log(`features Natural Earth vues (hors territoires du quiz) : ${seen}, anneaux dans le cadre : ${kept}, après simplification : ${simplified.length}`)
console.log(`\n→ src/data/regionContext.ts  (${(lines.join('\n').length / 1024).toFixed(1)} Ko)`)
