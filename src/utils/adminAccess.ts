import { supabase } from './supabase'

/** Vrai si le compte connecté est admin quiz-forge (table quiz_forge_admins, non gérable depuis
 *  l'appli — cf. migration). `false` pour tout le monde par défaut, y compris hors-ligne/erreur. */
export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_quiz_forge_admin')
  if (error) return false
  return data === true
}
