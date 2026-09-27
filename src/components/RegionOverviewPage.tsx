import { useEffect, useMemo, useRef, useState } from 'react'
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

// Loupe « boutons » : chaque clic multiplie/divise le niveau de zoom par ce facteur, jusqu'à
// ZOOM_MAX. Au-delà de 1, on recadre le viewBox autour d'un centre déplaçable (glisser la carte) —
// utile pour les groupes de petites îles quasi superposés à l'échelle de la carte d'ensemble
// (Saint-Martin/Sint Maarten/Saint-Barthélemy/Anguilla, à moins de 2 unités les uns des autres).
const ZOOM_STEP = 1.6
const ZOOM_MAX = 8

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

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

  const [, , vw, vh] = regionViewBox.split(' ').map(Number)
  const { subjectColumn } = schema

  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([vw / 2, vh / 2])
  const [dragging, setDragging] = useState(false)
  // Pendant un glisser : position souris + centre au dernier événement traité (mis à jour en
  // continu, pas seulement au clic de départ — sinon un aller-retour hors du SVG en cours de
  // glisser provoquerait un bond au retour). `wasDraggedRef` distingue un vrai glisser d'un simple
  // clic (tolérance de quelques pixels) pour ne pas ouvrir une fiche par erreur en fin de glisser —
  // survit à `handleUp` (qui vide `dragRef` avant que `onClick` ne se déclenche).
  const dragRef = useRef<{ x: number; y: number; cx: number; cy: number; scaleX: number; scaleY: number } | null>(null)
  const wasDraggedRef = useRef(false)

  // Fenêtre actuellement visible du viewBox partagé : plein cadre à zoom 1 (le centre reste alors
  // figé au milieu, min === max ci-dessous), un recadrage plus serré au-delà.
  const viewW = vw / zoom
  const viewH = vh / zoom
  const viewCx = clamp(center[0], viewW / 2, vw - viewW / 2)
  const viewCy = clamp(center[1], viewH / 2, vh - viewH / 2)
  const viewMinX = viewCx - viewW / 2
  const viewMinY = viewCy - viewH / 2

  useEffect(() => {
    if (!dragging) return
    const stop = () => { dragRef.current = null; setDragging(false) }
    window.addEventListener('mouseup', stop)
    return () => window.removeEventListener('mouseup', stop)
  }, [dragging])

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
    if (loc) {
      setCoords(viewToLonLat(loc.x, loc.y))
      setHoverId(resolveId(event, loc))
    }
    const drag = dragRef.current
    if (!drag) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) wasDraggedRef.current = true
    const nextCx = drag.cx - dx / drag.scaleX
    const nextCy = drag.cy - dy / drag.scaleY
    drag.x = event.clientX; drag.y = event.clientY; drag.cx = nextCx; drag.cy = nextCy
    setCenter([nextCx, nextCy])
  }

  const handleLeave = () => { setHoverId(null); setCoords(null) }

  // Démarre un glisser (recadrage) quand la carte est zoomée — à zoom 1 la fenêtre visible occupe
  // tout le viewBox, glisser n'aurait aucun effet.
  const handleDown = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (zoom <= 1) return
    const ctm = svgRef.current?.getScreenCTM()
    if (!ctm) return
    dragRef.current = { x: event.clientX, y: event.clientY, cx: center[0], cy: center[1], scaleX: ctm.a, scaleY: ctm.d }
    setDragging(true)
  }

  const handleUp = () => { dragRef.current = null; setDragging(false) }

  const handleClick = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (wasDraggedRef.current) { wasDraggedRef.current = false; return }
    const loc = toSvgPoint(event)
    if (!loc) return
    const id = resolveId(event, loc)
    if (id) onOpenFiche?.(id)
  }

  const handleZoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP))
  const handleZoomOut = () => setZoom((z) => Math.max(1, z / ZOOM_STEP))
  const handleZoomReset = () => { setZoom(1); setCenter([vw / 2, vh / 2]) }

  const hoverPoint = points.find((p) => p.canonical === hoverId)
  const capitalAbove = hoverPoint ? ((hoverPoint.y - viewMinY) / viewH) > 0.62 : false
  // Ancre de l'étiquette décalée vers l'intérieur près des bords (le point, lui, reste exact) :
  // sinon un territoire proche du bord ferait déborder le texte hors de la carte.
  const labelLeft = hoverPoint ? Math.min(88, Math.max(12, ((hoverPoint.x - viewMinX) / viewW) * 100)) : 0

  let svgClass = zoom > 1 ? (dragging ? 'is-dragging' : 'is-pannable') : undefined
  if (!dragging && onOpenFiche && hoverId) svgClass = svgClass ? `${svgClass} is-clickable` : 'is-clickable'

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
        <div className="region-overview-zoom">
          <button type="button" onClick={handleZoomOut} disabled={zoom <= 1} title={t('regionOverview.zoomOut')} aria-label={t('regionOverview.zoomOut')}>−</button>
          <button type="button" onClick={handleZoomIn} disabled={zoom >= ZOOM_MAX} title={t('regionOverview.zoomIn')} aria-label={t('regionOverview.zoomIn')}>+</button>
          {zoom > 1 && (
            <button type="button" onClick={handleZoomReset} title={t('regionOverview.zoomReset')} aria-label={t('regionOverview.zoomReset')}>↺</button>
          )}
        </div>
        <svg
          ref={svgRef}
          viewBox={`${viewMinX} ${viewMinY} ${viewW} ${viewH}`}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          onMouseDown={handleDown}
          onMouseUp={handleUp}
          onClick={handleClick}
          className={svgClass}
          role="img"
          aria-label={t('regionOverview.title')}
        >
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
        </svg>
        {hoverPoint && (
          <>
            <span className="region-overview-title" style={{ left: `${labelLeft}%`, top: `${((hoverPoint.y - viewMinY) / viewH) * 100}%` }}>
              {hoverPoint.name}
            </span>
            {hoverPoint.capital && (
              <span
                className={capitalAbove ? 'region-capital region-capital-above' : 'region-capital region-capital-below'}
                style={{ left: `${labelLeft}%`, top: `${((hoverPoint.y - viewMinY) / viewH) * 100}%` }}
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
