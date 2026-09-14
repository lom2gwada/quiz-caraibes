import type { Profile, Theme } from '../types/profile'
import { resolveLocale } from '../i18n/locale'
import { supabase } from './supabase'

const KEY = 'quiz-forge:profile'

// Anciennes valeurs de thème (dark/light) migrées vers lagon/carte.
const LEGACY_THEME: Record<string, Theme> = { dark: 'lagon', light: 'carte' }

function fetchLocalProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const profile = JSON.parse(raw) as Partial<Profile>
    return {
      pseudo: profile.pseudo ?? '',
      avatar: profile.avatar ?? '',
      theme: LEGACY_THEME[profile.theme ?? ''] ?? (profile.theme as Theme) ?? 'lagon',
      locale: resolveLocale(profile.locale), // profils d'avant l'i18n : locale déduite du navigateur
    }
  } catch {
    return null
  }
}

function saveLocalProfile({ pseudo, avatar, theme, locale }: Profile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ pseudo, avatar, theme, locale }))
  } catch {
    /* quota dépassé ou navigation privée : on abandonne silencieusement */
  }
}

interface CloudProfileRow {
  pseudo: string
  avatar: string
  theme: string
  locale: string
}

function fromCloudRow(row: CloudProfileRow): Profile {
  return {
    pseudo: row.pseudo,
    avatar: row.avatar,
    theme: LEGACY_THEME[row.theme] ?? (row.theme as Theme),
    locale: resolveLocale(row.locale),
  }
}

async function pushCloudProfile(userId: string, { pseudo, avatar, theme, locale }: Profile): Promise<void> {
  const { error } = await supabase.from('quiz_forge_profiles').upsert({ id: userId, pseudo, avatar, theme, locale, updated_at: new Date().toISOString() })
  if (error) throw error
}

/** Profil local (toujours dispo hors-ligne), synchronisé avec `quiz_forge_profiles` si connecté :
 *  un profil cloud existant l'emporte (autre appareil), sinon le profil local y est poussé. */
export async function fetchProfile(userId?: string | null): Promise<Profile | null> {
  const local = fetchLocalProfile()
  if (!userId) return local
  try {
    const { data } = await supabase.from('quiz_forge_profiles').select('pseudo,avatar,theme,locale').eq('id', userId).maybeSingle()
    if (data) {
      const remote = fromCloudRow(data)
      saveLocalProfile(remote)
      return remote
    }
    if (local) await pushCloudProfile(userId, local).catch(() => {})
    return local
  } catch {
    return local
  }
}

export async function saveProfile(profile: Profile, userId?: string | null): Promise<void> {
  saveLocalProfile(profile)
  if (userId) await pushCloudProfile(userId, profile)
}
