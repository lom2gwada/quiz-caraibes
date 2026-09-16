import { supabase } from './supabase'
import type { GenSchema, Row } from './quizGenerator'

// Mêmes clés/ordre que les en-têtes de src/data/caribbean.csv — la table Supabase en est un
// miroir éditable (colonne par colonne, tout en texte), pour pouvoir corriger une donnée sans
// reconstruire/redéployer l'appli.
const COLUMNS = [
  'pays', 'article', 'capitale', 'latitude_deg', 'longitude_deg', 'population', 'superficie_km2',
  'densite_hab_km2', 'pib_mds_usd', 'point_culminant', 'altitude_m', 'monnaie', 'langues',
  'indicatif_telephonique', 'domaine_internet', 'president', 'premier_ministre', 'independance',
  'regime_politique', 'organisations', 'religions', 'drapeau',
]

/** Version éditable (dashboard Supabase, ou depuis l'appli pour les admins — cf. updateCaribbeanRow)
 *  du dataset embarqué `caribbean.csv` — mêmes lignes/colonnes, en base plutôt que dans le code.
 *  `null` si indisponible (hors-ligne, RLS…) : l'appli reste alors sur le CSV embarqué, jamais
 *  bloquée par ce fetch. */
export async function fetchCaribbeanDataset(): Promise<Row[] | null> {
  const { data, error } = await supabase
    .from('quiz_forge_caribbean_dataset')
    .select(COLUMNS.join(','))
    .order('row_order', { ascending: true })
  if (error || !data?.length) return null
  return data as unknown as Row[]
}

/** Met à jour les champs d'un territoire existant (`pays` = clé, non modifiable ici — renommer un
 *  territoire sortirait du périmètre : shapes/region/i18n/aliases restent indexés par ce nom exact).
 *  Réservé aux admins côté RLS (policy UPDATE sur quiz_forge_caribbean_dataset). Un refus RLS ne
 *  remonte pas d'erreur PostgREST (juste 0 ligne affectée) : on le détecte nous-mêmes via `.select()`
 *  pour ne jamais rapporter un succès silencieusement faux à l'appelant. */
export async function updateCaribbeanRow(pays: string, patch: Partial<Row>): Promise<void> {
  const { data, error } = await supabase.from('quiz_forge_caribbean_dataset').update(patch).eq('pays', pays).select('pays')
  if (error) throw error
  if (!data?.length) throw new Error('Mise à jour refusée (droits insuffisants ou territoire introuvable).')
}

/** Réglages du panneau de génération (GeneratorPanel) qui ont du sens à partager : nom/titre et,
 *  par colonne, seulement ce qu'on peut y ajuster (`include`/`multivalueSeparator`) — pas
 *  kind/isYear/unique/label/unit, qui restent dérivés des données par `inferSchema` à chaque fetch.
 *  Volontairement sans `subjectColumn` : le changer casserait capitalColumn/latitudeColumn/
 *  longitudeColumn/shapes/region (buildCaribbeanDataset, App.tsx), tous indexés sur `pays`. */
export interface CaribbeanSchemaConfig {
  noun: string
  title: string
  columns: Record<string, { include?: boolean; multivalueSeparator?: string }>
}

const SCHEMA_ROW_ID = 1

/** `null` si indisponible (hors-ligne, table pas encore seedée…) : l'appli retombe alors sur le
 *  schéma auto-inféré, comme avant l'existence de cette table. */
export async function fetchCaribbeanSchemaConfig(): Promise<CaribbeanSchemaConfig | null> {
  const { data, error } = await supabase
    .from('quiz_forge_caribbean_schema')
    .select('noun,title,columns')
    .eq('id', SCHEMA_ROW_ID)
    .maybeSingle()
  if (error || !data) return null
  return { noun: data.noun, title: data.title, columns: data.columns ?? {} }
}

/** Réservé aux admins côté RLS (policy UPDATE sur quiz_forge_caribbean_schema) — même détection du
 *  refus silencieux RLS que updateCaribbeanRow. */
export async function updateCaribbeanSchemaConfig(config: CaribbeanSchemaConfig): Promise<void> {
  const { data, error } = await supabase
    .from('quiz_forge_caribbean_schema')
    .update({ noun: config.noun, title: config.title, columns: config.columns, updated_at: new Date().toISOString() })
    .eq('id', SCHEMA_ROW_ID)
    .select('id')
  if (error) throw error
  if (!data?.length) throw new Error('Mise à jour refusée (droits insuffisants).')
}

/** Complète un schéma auto-inféré avec les réglages partagés (nom/titre, include/séparateur par
 *  colonne) — les colonnes absentes de `config.columns` gardent leurs valeurs inférées. */
export function applyCaribbeanSchemaConfig(inferred: GenSchema, config: CaribbeanSchemaConfig | null): GenSchema {
  if (!config) return inferred
  const columns: GenSchema['columns'] = { ...inferred.columns }
  for (const [col, override] of Object.entries(config.columns)) {
    if (!columns[col]) continue
    columns[col] = { ...columns[col], ...override }
  }
  return { ...inferred, noun: config.noun || inferred.noun, title: config.title || inferred.title, columns }
}

/** Extrait d'un GenSchema la config partageable (l'inverse d'applyCaribbeanSchemaConfig), pour
 *  sauvegarder l'état courant du panneau. */
export function toCaribbeanSchemaConfig(schema: GenSchema): CaribbeanSchemaConfig {
  const columns: CaribbeanSchemaConfig['columns'] = {}
  for (const [col, spec] of Object.entries(schema.columns)) columns[col] = { include: spec.include, multivalueSeparator: spec.multivalueSeparator }
  return { noun: schema.noun, title: schema.title, columns }
}
