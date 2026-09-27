import { useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { makeDatasetI18n, useLocale, useT } from '@engine'
import type { DataI18n, GenSchema, Row } from '@engine'
import { formatNumber } from '@engine/utils/number'
import type { RegionShape } from '../data/region'
import { lonLatToView, viewToLonLat } from '../utils/regionProjection'

interface RegionOverviewPageProps {
  rows: Row[]
  schema: GenSchema
  region: Record<string, RegionShape>
  regionViewBox: string
  capitalColumn?: string
  latitudeColumn?: string
  longitudeColumn?: string
  i18n?: DataI18n
  onBack: () => void
  /** Ouvre la fiche du territoire survolé au clic. Reçoit la valeur FR canonique. */
  onOpenFiche?: (name: string) => void
}

interface CapitalPoint {
  canonical: string
  name: string
  capital: string
  x: number
  y: number
}

// Sous ce carré de distance (unités de viewBox²), le curseur « accroche » au point le plus
// proche. Plus petit que sur la petite icône des fiches : ici la carte occupe tout l'écran, donc
// la même distance en unités de viewBox correspond à beaucoup plus de pixels réels.
const SNAP_DISTANCE_SQ = 9

// Largeur/hauteur (unités de viewBox) de la zone que la loupe grossit, centrée sur le curseur.
// Volontairement serré : des groupes comme Saint-Martin/Sint Maarten/Saint-Barthélemy/Anguilla
// sont à moins de 2 unités les uns des autres sur la carte d'ensemble (juste des points, à cette
// échelle) — la loupe doit vraiment les écarter visuellement, pas juste grossir un peu.
const LENS_SPAN = 8

/** Grande carte de la région (vue d'ensemble, tous les territoires à la fois) : survoler un pays
 * (sa silhouette, ou son point pour les toutes petites îles) affiche son nom et sa capitale ; le
 * curseur donne ses coordonnées géographiques en continu. Les points sont placés sur les
 * coordonnées réelles de la capitale (pas le centroïde du territoire, moins précis, utilisé par
 * la petite carte des fiches). */
export function RegionOverviewPage({ rows, schema, region, regionViewBox, capitalColumn, latitudeColumn, longitudeColumn, i18n, onBack, onOpenFiche }: RegionOverviewPageProps) {
  const t = useT()
  const locale = useLocale()
  const data = useMemo(() => makeDatasetI18n(i18n, locale), [i18n, locale])
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [coords, setCoords] = useState<[number, number] | null>(null)
  const [lensPos, setLensPos] = useState<[number, number] | null>(null)

  const [, , vw, vh] = regionViewBox.split(' ').map(Number)
  const { subjectColumn } = schema

  const points = useMemo<CapitalPoint[]>(() => {
    if (!latitudeColumn || !longitudeColumn) return []
    return rows.flatMap((row) => {
      const canonical = row[subjectColumn] ?? ''
      const lat = Number((row[latitudeColumn] ?? '').trim().replace(',', '.'))
      const lon = Number((row[longitudeColumn] ?? '').trim().replace(',', '.'))
      if (!canonical || !Number.isFinite(lat) || !Number.isFinite(lon)) return []
      const [x, y] = lonLatToView(lon, lat)
      const capital = capitalColumn ? data.value((row[capitalColumn] ?? '').trim()) : ''
      return [{ canonical, name: data.value(canonical), capital, x, y }]
    })
  }, [rows, subjectColumn, latitudeColumn, longitudeColumn, capitalColumn, data])

  // Position SVG d'un événement souris OU tactile (un tap déclenche aussi onClick) — factorisé
  // car le clic doit retrouver le point le plus proche par lui-même, sans dépendre d'un survol
  // préalable : sur tactile, il n'y a pas toujours de mousemove avant le tap.
  const toSvgPoint = (event: ReactMouseEvent<SVGSVGElement>): DOMPoint | null => {
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return null
    const pt = svg.createSVGPoint()
    pt.x = event.clientX
    pt.y = event.clientY
    return pt.matrixTransform(ctm.inverse())
  }

  const nearestAt = (loc: DOMPoint): string | null => {
    let nearest: string | null = null
    let best = SNAP_DISTANCE_SQ
    for (const p of points) {
      const dx = loc.x - p.x
      const dy = loc.y - p.y
      const dist2 = dx * dx + dy * dy
      if (dist2 < best) { best = dist2; nearest = p.canonical }
    }
    return nearest
  }

  // Un pays avec une vraie silhouette (`<path data-name>`) répond sur toute sa surface, pas
  // seulement près du point de sa capitale — plus confortable pour les grands pays, et surtout
  // sur tactile où viser un point de quelques pixels est difficile. `nearestAt` reste le repli
  // pour les toutes petites îles (pas de silhouette, juste un point) et les clics à côté.
  const resolveId = (event: ReactMouseEvent<SVGSVGElement>, loc: DOMPoint): string | null => {
    const target = event.target
    if (target instanceof SVGElement && target.dataset.name) return target.dataset.name
    return nearestAt(loc)
  }

  const handleMove = (event: ReactMouseEvent<SVGSVGElement>) => {
    const loc = toSvgPoint(event)
    if (!loc) return
    setCoords(viewToLonLat(loc.x, loc.y))
    setLensPos([loc.x, loc.y])
    setHoverId(resolveId(event, loc))
  }

  const handleLeave = () => { setHoverId(null); setCoords(null); setLensPos(null) }

  const handleClick = (event: ReactMouseEvent<SVGSVGElement>) => {
    const loc = toSvgPoint(event)
    if (!loc) return
    const id = resolveId(event, loc)
    if (id) onOpenFiche?.(id)
  }
  const hoverPoint = points.find((p) => p.canonical === hoverId)
  const capitalAbove = hoverPoint ? (hoverPoint.y / vh) > 0.62 : false
  // Ancre de l'étiquette décalée vers l'intérieur près des bords (le point, lui, reste exact) :
  // sinon un territoire proche du bord ferait déborder le texte hors de la carte.
  const labelLeft = hoverPoint ? Math.min(88, Math.max(12, (hoverPoint.x / vw) * 100)) : 0

  // Silhouettes + points, factorisés : rendus une fois pour la carte, une seconde fois (viewBox
  // différent, plus serré) dans la loupe — même contenu, juste une fenêtre de recadrage différente.
  const mapLayers = (
    <>
      <g className="region-land">
        {Object.entries(region).map(([name, shape]) => shape.d && (
          <path key={name} data-name={name} d={shape.d} className={name === hoverId ? 'region-hl' : undefined} />
        ))}
      </g>
      <g>
        {points.map((p) => (
          <circle
            key={p.canonical}
            data-name={p.canonical}
            cx={p.x}
            cy={p.y}
            className={p.canonical === hoverId ? 'region-overview-dot is-active' : 'region-overview-dot'}
          />
        ))}
      </g>
    </>
  )

  return (
    <section className="region-overview">
      <div className="stats-header">
        <h2>{t('regionOverview.title')}</h2>
        <button type="button" className="secondary" onClick={onBack}>{t('common.back')}</button>
      </div>
      <p>{t('regionOverview.hint')}</p>
      <div className="region-overview-map">
        <div className="region-overview-coords">
          {coords ? `${formatNumber(coords[1], locale, 1)}°, ${formatNumber(coords[0], locale, 1)}°` : t('regionOverview.coordsHint')}
        </div>
        <svg
          ref={svgRef}
          viewBox={regionViewBox}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          onClick={handleClick}
          className={onOpenFiche && hoverId ? 'is-clickable' : undefined}
          role="img"
          aria-label={t('regionOverview.title')}
        >
          {mapLayers}
        </svg>
        {lensPos && (
          <div
            className="region-overview-lens"
            style={{ left: `${(lensPos[0] / vw) * 100}%`, top: `${(lensPos[1] / vh) * 100}%` }}
          >
            <svg
              viewBox={`${lensPos[0] - LENS_SPAN / 2} ${lensPos[1] - LENS_SPAN / 2} ${LENS_SPAN} ${LENS_SPAN}`}
              aria-hidden="true"
            >
              {mapLayers}
            </svg>
          </div>
        )}
        {hoverPoint && (
          <>
            <span className="region-overview-title" style={{ left: `${labelLeft}%`, top: `${(hoverPoint.y / vh) * 100}%` }}>
              {hoverPoint.name}
            </span>
            {hoverPoint.capital && (
              <span
                className={capitalAbove ? 'region-capital region-capital-above' : 'region-capital region-capital-below'}
                style={{ left: `${labelLeft}%`, top: `${(hoverPoint.y / vh) * 100}%` }}
              >
                {hoverPoint.capital}
              </span>
            )}
          </>
        )}
      </div>
    </section>
  )
}
