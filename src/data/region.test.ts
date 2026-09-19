import { describe, expect, it } from 'vitest'
import caribbeanCsv from './caribbean.csv?raw'
import { parseCsv } from '@engine'
import { region, REGION_VIEWBOX } from './region'

const territoryNames = parseCsv(caribbeanCsv).map((row) => row.pays)

describe('region (carte composite)', () => {
  it('covers every territory of the bundled dataset', () => {
    for (const name of territoryNames) expect(region, name).toHaveProperty(name)
  })

  it('gives every entry a centroid inside the shared viewBox', () => {
    const [, , w, h] = REGION_VIEWBOX.split(' ').map(Number)
    for (const [name, shape] of Object.entries(region)) {
      expect(shape.cx, name).toBeGreaterThanOrEqual(0)
      expect(shape.cx, name).toBeLessThanOrEqual(w)
      expect(shape.cy, name).toBeGreaterThanOrEqual(0)
      expect(shape.cy, name).toBeLessThanOrEqual(h)
    }
  })

  it('gives a non-dot-only entry a drawable shape', () => {
    for (const [name, shape] of Object.entries(region)) {
      if (!shape.dotOnly) expect(shape.d, name).toMatch(/^M/)
    }
  })

  it('keeps a shape for a dot-only territory too — it still needs to appear as background', () => {
    // Guadeloupe/Martinique etc. sont `dotOnly` (silhouette trop petite pour rester lisible
    // colorée quand elles sont elles-mêmes le sujet) mais restent des repères de fond bien réels
    // sur la carte des territoires voisins : `d` ne doit jamais être vidé pour cette seule raison.
    expect(region['Guadeloupe'].dotOnly).toBe(true)
    expect(region['Guadeloupe'].d).toMatch(/^M/)
    expect(region['Martinique'].dotOnly).toBe(true)
    expect(region['Martinique'].d).toMatch(/^M/)
  })

  it('flags the smallest territories as dot-only, keeps the large ones as shapes', () => {
    expect(region['Cuba'].dotOnly).toBe(false)
    expect(region['Mexique'].dotOnly).toBe(false)
    expect(region['Saint-Barthélemy'].dotOnly).toBe(true)
    expect(region['Sint Maarten'].dotOnly).toBe(true)
  })
})
