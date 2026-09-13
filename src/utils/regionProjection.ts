import { REGION_PROJECTION } from '../data/region'

/** Convertit une coordonnée lon/lat réelle en unités de la viewBox partagée (`REGION_VIEWBOX`).
 * Même projection équirectangulaire que `scripts/build-region.mjs` — permet de placer un point
 * précis (ex. une capitale) sur la carte composite sans reconstruire les silhouettes. */
export function lonLatToView(lon: number, lat: number): [number, number] {
  const { k, scale, ox, oy } = REGION_PROJECTION
  return [lon * k * scale + ox, -lat * scale + oy]
}

/** Inverse de `lonLatToView` : un point de la viewBox (ex. sous le curseur) vers lon/lat réel. */
export function viewToLonLat(x: number, y: number): [number, number] {
  const { k, scale, ox, oy } = REGION_PROJECTION
  return [(x - ox) / (k * scale), -(y - oy) / scale]
}
