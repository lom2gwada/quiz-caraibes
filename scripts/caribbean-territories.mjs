// Table commune nom CSV (français) -> prédicat sur les properties Natural Earth (10m admin-0
// map subunits). Partagée par build-shapes.mjs (silhouette individuelle) et build-region.mjs
// (carte régionale composite) pour que les deux restent alignés sur le même jeu de territoires.
export const MATCH = {
  'Cuba': p => p.ADMIN === 'Cuba',
  'Haïti': p => p.ADMIN === 'Haiti',
  'République dominicaine': p => p.ADMIN === 'Dominican Republic',
  'Jamaïque': p => p.ADMIN === 'Jamaica',
  'Bahamas': p => p.ADMIN === 'The Bahamas',
  'Trinité-et-Tobago': p => p.ADMIN === 'Trinidad and Tobago',
  'Îles Caïmans': p => p.ADMIN === 'Cayman Islands',
  'Porto Rico': p => p.ADMIN === 'Puerto Rico',
  'Guadeloupe': p => p.NAME === 'Guadeloupe',
  'Martinique': p => p.NAME === 'Martinique',
  'Saint-Martin': p => p.ADMIN === 'Saint Martin',
  'Saint-Barthélemy': p => p.ADMIN === 'Saint Barthelemy',
  'Sint Maarten': p => p.ADMIN === 'Sint Maarten',
  'Aruba': p => p.ADMIN === 'Aruba',
  'Curaçao': p => p.ADMIN === 'Curaçao',
  // Regroupée par Natural Earth avec Saba et Sint Eustatius sous un seul multipolygone
  // (« Caribbean Netherlands ») : RING_FILTER isole l'anneau de Bonaire (les deux autres
  // îles, bien plus au nord, ne sont pas dans ce jeu de données).
  'Bonaire': p => p.NAME === 'Caribbean Netherlands',
  'Montserrat': p => p.ADMIN === 'Montserrat',
  'Anguilla': p => p.ADMIN === 'Anguilla',
  'Îles Vierges britanniques': p => p.ADMIN === 'British Virgin Islands',
  'Îles Vierges américaines': p => p.ADMIN === 'United States Virgin Islands',
  'Îles Turques-et-Caïques': p => p.ADMIN === 'Turks and Caicos Islands',
  'Antigua-et-Barbuda': p => p.ADMIN === 'Antigua and Barbuda',
  'Dominique': p => p.ADMIN === 'Dominica',
  'Grenade': p => p.ADMIN === 'Grenada',
  'Saint-Christophe-et-Niévès': p => p.ADMIN === 'Saint Kitts and Nevis',
  'Sainte-Lucie': p => p.ADMIN === 'Saint Lucia',
  'Saint-Vincent-et-les-Grenadines': p => p.ADMIN === 'Saint Vincent and the Grenadines',
  'Barbade': p => p.ADMIN === 'Barbados',
  'Belize': p => p.ADMIN === 'Belize',
  'Guatemala': p => p.ADMIN === 'Guatemala',
  'Honduras': p => p.ADMIN === 'Honduras',
  'Nicaragua': p => p.ADMIN === 'Nicaragua',
  'Costa Rica': p => p.ADMIN === 'Costa Rica',
  'Panama': p => p.ADMIN === 'Panama',
  'Colombie': p => p.ADMIN === 'Colombia',
  'Venezuela': p => p.ADMIN === 'Venezuela',
  'Mexique': p => p.ADMIN === 'Mexico',
}

// Filtre d'anneaux optionnel (par territoire) : appliqué APRÈS extraction des anneaux extérieurs
// des features matchées par MATCH, avant tri/simplification — pour isoler une île précise dans un
// multipolygone qui en regroupe plusieurs (cf. Bonaire ci-dessus).
export const RING_FILTER = {
  'Bonaire': (ring) => ring.every(([lon]) => lon < -66), // Bonaire (~-68°) ; Saba/Sint Eustatius (~-63°) écartées
}

export const NE_SOURCE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_map_subunits.geojson'
