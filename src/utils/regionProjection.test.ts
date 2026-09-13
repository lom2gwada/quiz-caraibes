import { describe, expect, it } from 'vitest'
import { lonLatToView, viewToLonLat } from './regionProjection'

describe('regionProjection', () => {
  it('round-trips lon/lat through the view projection and back', () => {
    for (const [lon, lat] of [[-82.3666, 23.1136], [-99.1332, 19.4326], [-61.5019, 10.6549], [0, 0]]) {
      const [x, y] = lonLatToView(lon, lat)
      const [lon2, lat2] = viewToLonLat(x, y)
      expect(lon2).toBeCloseTo(lon, 6)
      expect(lat2).toBeCloseTo(lat, 6)
    }
  })

  it('places a Caribbean capital inside the shared viewBox', () => {
    const [x, y] = lonLatToView(-82.3666, 23.1136) // La Havane
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(320)
    expect(y).toBeGreaterThanOrEqual(0)
    expect(y).toBeLessThanOrEqual(220)
  })
})
