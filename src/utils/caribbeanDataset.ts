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

/** Version éditable (via l'éditeur de table Supabase) du dataset embarqué `caribbean.csv` — mêmes
 *  lignes/colonnes, en base plutôt que dans le code. `null` si indisponible (hors-ligne, RLS…) :
 *  l'appli reste alors sur le CSV embarqué, jamais bloquée par ce fetch. */
export async function fetchCaribbeanDataset(): Promise<Row[] | null> {
  const { data, error } = await supabase
    .from('quiz_forge_caribbean_dataset')
    .select(COLUMNS.join(','))
    .order('row_order', { ascending: true })
  if (error || !data?.length) return null
  return data as unknown as Row[]
}
