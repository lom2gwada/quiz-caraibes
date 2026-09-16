import { supabase } from './supabase'
import type { Row } from './quizGenerator'

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
