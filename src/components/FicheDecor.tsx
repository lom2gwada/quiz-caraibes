import { HoverPreview, QuestionShape, makeDatasetI18n, useLocale, useT } from '@engine'
import type { DataI18n } from '@engine'
import { region, REGION_VIEWBOX } from '../data/region'
import { RegionMap } from './RegionMap'

/** Silhouette du territoire, avant son nom dans l'en-tête de fiche (agrandie au survol). */
export function ShapeDecor({ svg, name }: { svg: string; name: string }) {
  const t = useT()
  return (
    <HoverPreview
      className="fiche-shape-wrap"
      label={t('fiche.silhouetteLabel', { name })}
      trigger={<QuestionShape svg={svg} className="fiche-shape" />}
      preview={<QuestionShape svg={svg} />}
    />
  )
}

/** Position du territoire sur la carte de la région, après son nom (agrandie au survol, avec sa capitale). */
export function RegionDecor({ canonical, name, capitalValue, i18n }: { canonical: string; name: string; capitalValue: string; i18n?: DataI18n }) {
  const t = useT()
  const locale = useLocale()
  const capital = makeDatasetI18n(i18n, locale).value(capitalValue)
  return (
    <HoverPreview
      className="fiche-region-wrap"
      label={t('fiche.regionLabel', { name })}
      trigger={<RegionMap data={region} viewBox={REGION_VIEWBOX} highlight={canonical} className="fiche-region" />}
      preview={<RegionMap data={region} viewBox={REGION_VIEWBOX} highlight={canonical} label={{ territory: name, capital }} />}
    />
  )
}
