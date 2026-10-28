import { applySchemaConfig, createRemoteDataset, inferSchema } from '@engine'
import type { CategoryGroup, DataInfo, Dataset, FicheDecorator, QuizAppSpec, Row, SchemaConfig, SpeechTemplates, SubjectFilter } from '@engine'
import caribbeanCsv from './data/caribbean.csv?raw'
import { shapes } from './data/shapes'
import { aliases } from './data/aliases'
import { caribbeanI18n } from './data/caribbean.i18n'
import { region, REGION_VIEWBOX } from './data/region'
import { regionContext } from './data/regionContext'
import { CaribbeanBackground } from './components/CaribbeanBackground'
import { RegionDecor, ShapeDecor } from './components/FicheDecor'
import { lazy, Suspense } from 'react'

// La grande carte (≈ 12 Ko) n'est chargée qu'à l'ouverture de la vue ou d'une question « Cliquez sur X ».
const RegionOverviewPage = lazy(() => import('./components/RegionOverviewPage').then((m) => ({ default: m.RegionOverviewPage })))

const CAPITAL_COLUMN = 'capitale'

// Mêmes clés/ordre que les en-têtes de src/data/caribbean.csv — la table Supabase en est un
// miroir éditable (colonne par colonne, tout en texte), pour pouvoir corriger une donnée sans
// reconstruire/redéployer l'appli.
const remote = createRemoteDataset({
  rows: 'caribbean_dataset',
  key: 'pays',
  schema: 'caribbean_schema',
  columns: [
    'pays', 'article', 'capitale', 'latitude_deg', 'longitude_deg', 'population', 'superficie_km2',
    'densite_hab_km2', 'pib_mds_usd', 'point_culminant', 'altitude_m', 'monnaie', 'langues',
    'indicatif_telephonique', 'domaine_internet', 'president', 'premier_ministre', 'independance',
    'regime_politique', 'organisations', 'religions', 'drapeau', 'noms_indigenes', 'pays_de_rattachement', 'groupe_geographique',
    'fete_nationale', 'grandes_villes',
    'principales_ressources', 'fuseau_horaire',
  ],
})

/** Regroupement des catégories sur l'accueil (une catégorie = une colonne du CSV, plus `silhouette` et `map`). Une colonne
 *  ajoutée plus tard et non citée ici apparaît dans « Autres » : rien ne disparaît. */
const categoryGroups: CategoryGroup[] = [
  {
    id: 'geographie',
    labels: { fr: 'Géographie', en: 'Geography', es: 'Geografía', nl: 'Geografie', ht: 'Jewografi' },
    categories: ['capitale', 'grandes_villes', 'latitude_deg', 'longitude_deg', 'superficie_km2', 'point_culminant', 'altitude_m', 'groupe_geographique'],
  },
  {
    id: 'politique',
    labels: { fr: 'Politique', en: 'Politics', es: 'Política', nl: 'Politiek', ht: 'Politik' },
    categories: ['president', 'premier_ministre', 'regime_politique', 'independance', 'fete_nationale', 'pays_de_rattachement', 'organisations'],
  },
  {
    id: 'economie',
    labels: { fr: 'Économie', en: 'Economy', es: 'Economía', nl: 'Economie', ht: 'Ekonomi' },
    categories: ['pib_mds_usd', 'monnaie', 'principales_ressources'],
  },
  {
    id: 'societe',
    labels: { fr: 'Société', en: 'Society', es: 'Sociedad', nl: 'Samenleving', ht: 'Sosyete' },
    categories: ['population', 'densite_hab_km2', 'langues', 'religions', 'noms_indigenes'],
  },
  {
    id: 'pratique',
    labels: { fr: 'Infos pratiques', en: 'Practical info', es: 'Datos prácticos', nl: 'Praktisch', ht: 'Enfòmasyon pratik' },
    categories: ['indicatif_telephonique', 'domaine_internet', 'fuseau_horaire'],
  },
  {
    id: 'visuel',
    labels: { fr: 'Visuel', en: 'Visual', es: 'Visual', nl: 'Visueel', ht: 'Vizyèl' },
    categories: ['drapeau', 'silhouette', 'map'],
  },
]

/** Date de mise à jour de l'ensemble des données (CSV et table Supabase) et leurs sources, affichées sur les fiches, la page Fiches, l'accueil et la
 *  correction. **À mettre à jour** à chaque révision des données (voir « Données » dans le README). */
const DATA_INFO: DataInfo = {
  updatedAt: '2026-10-27',
  sources: [
    { label: 'Wikimedia Commons (drapeaux et armoiries)', url: 'https://commons.wikimedia.org' },
    { label: 'Natural Earth (contours et carte)', url: 'https://www.naturalearthdata.com' },
  ],
}

/** Les questions visuelles (drapeau, silhouette, « Cliquez sur X ») ne pèsent que 38 questions chacune contre ~190 pour une catégorie chiffrée,
 *  alors que ce sont les plus ludiques : dans une partie « toutes catégories », elles font environ une question sur dix. */
const VISUAL_BOOST = { categories: ['drapeau', 'silhouette', 'map'], share: 0.1 }

/** Filtre « Territoires » de l'accueil : raccourcis par groupe géographique et par pays de rattachement (France = les Antilles
 *  françaises, Pays-Bas = les Antilles néerlandaises…), puis choix un par un. Le défi du jour ne l'utilise pas : il reste sur l'ensemble. */
const subjectFilter: SubjectFilter = {
  labels: { fr: 'Territoires', en: 'Territories', es: 'Territorios', nl: 'Gebieden', ht: 'Teritwa' },
  by: [
    { column: 'groupe_geographique', labels: { fr: 'Groupe géographique', en: 'Geographic group', es: 'Grupo geográfico', nl: 'Geografische groep', ht: 'Gwoup jewografik' } },
    { column: 'pays_de_rattachement', labels: { fr: 'Pays de rattachement', en: 'Parent country', es: 'País de adscripción', nl: 'Land waartoe het behoort', ht: 'Peyi ki gen otorite sou li' } },
  ],
}

/** Silhouette avant le nom, position sur la carte régionale après (le drapeau vient du moteur). */
const ficheDecor: FicheDecorator = (row, { canonical, name }) => ({
  lead: shapes[canonical] ? <ShapeDecor svg={shapes[canonical]} name={name} /> : undefined,
  trail: region[canonical] ? <RegionDecor canonical={canonical} name={name} capitalValue={(row[CAPITAL_COLUMN] ?? '').trim()} i18n={caribbeanI18n} /> : undefined,
})

/** Ce que le bouton « Écouter » d'une fiche déclame (syntaxe : voir `SpeechTemplates` dans le moteur). Une phrase saute
 *  quand la donnée manque (territoire sans président, sans indépendance…). Français, anglais, espagnol et néerlandais ; le
 *  créole haïtien (pas de voix créole : lu par la voix française). Les possessifs s'accordent avec le nom qu'ils qualifient (« sa capitale », « son PIB »),
 *  d'où l'absence de pronom sujet, dont le genre dépendrait du territoire. */
const speech: SpeechTemplates = {
  fr: [
    '{Name}, un territoire des Caraïbes.',
    'Sa capitale est {capitale}.',
    'Autres grandes villes : {grandes_villes}.',
    'Pays de rattachement : {pays_de_rattachement}.',
    'Groupe géographique : {groupe_geographique}.',
    'Son régime politique : {regime_politique}.',
    'Sa population est d’environ {population} habitants.',
    'Sa superficie est de {superficie_km2} kilomètres carrés.',
    'Sa densité est de {densite_hab_km2} habitants au kilomètre carré.',
    'Son PIB est d’environ {pib_mds_usd} milliards de dollars.',
    'Son point culminant est {point_culminant}[, à {altitude_m} mètres d’altitude].',
    'Sa monnaie : {monnaie}.',
    'Ses principales ressources : {principales_ressources}.',
    'Son fuseau horaire : {fuseau_horaire}.',
    'On y parle {langues}.',
    'Son indépendance date de {independance}.',
    'Sa fête nationale est le {fete_nationale}.',
    'Son président est {president}.',
    'Son Premier ministre est {premier_ministre}.',
    'Organisations : {organisations}.',
    'Principaux groupes religieux : {religions:2}.',
  ],
  en: [
    '{Name}, a Caribbean territory.',
    'Its capital is {capitale}.',
    'Other major cities: {grandes_villes}.',
    'It belongs to {pays_de_rattachement}.',
    'Geographic group: {groupe_geographique}.',
    'Political system: {regime_politique}.',
    'Its population is about {population}.',
    'Its area is {superficie_km2} square kilometres.',
    'Its density is {densite_hab_km2} inhabitants per square kilometre.',
    'Its GDP is about {pib_mds_usd} billion dollars.',
    'Its highest point is {point_culminant}[, at {altitude_m} metres above sea level].',
    'Its currency: {monnaie}.',
    'Its main resources and exports: {principales_ressources}.',
    'Its time zone: {fuseau_horaire}.',
    'People there speak {langues}.',
    'It gained independence in {independance}.',
    'Its national day is {fete_nationale}.',
    'Its president is {president}.',
    'Its prime minister is {premier_ministre}.',
    'Organisations: {organisations}.',
    'Largest religious groups: {religions:2}.',
  ],
  es: [
    '{Name}, un territorio del Caribe.',
    'Su capital es {capitale}.',
    'Otras ciudades importantes: {grandes_villes}.',
    'Pertenece a {pays_de_rattachement}.',
    'Grupo geográfico: {groupe_geographique}.',
    'Su régimen político: {regime_politique}.',
    'Su población es de unos {population} habitantes.',
    'Su superficie es de {superficie_km2} kilómetros cuadrados.',
    'Su densidad es de {densite_hab_km2} habitantes por kilómetro cuadrado.',
    'Su PIB es de unos {pib_mds_usd} mil millones de dólares.',
    'Su punto más alto es {point_culminant}[, a {altitude_m} metros de altitud].',
    'Su moneda: {monnaie}.',
    'Sus principales recursos y exportaciones: {principales_ressources}.',
    'Su huso horario: {fuseau_horaire}.',
    'Allí se habla {langues}.',
    'Obtuvo la independencia en {independance}.',
    'Su fiesta nacional es el {fete_nationale}.',
    'Su presidente es {president}.',
    'Su primer ministro es {premier_ministre}.',
    'Organizaciones: {organisations}.',
    'Los grupos religiosos más numerosos son {religions:2}.',
  ],
  nl: [
    '{Name}, een gebied in het Caribisch gebied.',
    'De hoofdstad is {capitale}.',
    'Andere grote steden: {grandes_villes}.',
    'Het behoort tot {pays_de_rattachement}.',
    'Geografische groep: {groupe_geographique}.',
    'Staatsvorm: {regime_politique}.',
    'Er wonen ongeveer {population} mensen.',
    'De oppervlakte is {superficie_km2} vierkante kilometer.',
    'De bevolkingsdichtheid is {densite_hab_km2} inwoners per vierkante kilometer.',
    'Het bbp bedraagt ongeveer {pib_mds_usd} miljard dollar.',
    'Het hoogste punt is {point_culminant}[, op {altitude_m} meter hoogte].',
    'De munteenheid: {monnaie}.',
    'Belangrijkste hulpbronnen en export: {principales_ressources}.',
    'De tijdzone is {fuseau_horaire}.',
    'Men spreekt er {langues}.',
    'De onafhankelijkheid dateert van {independance}.',
    'De nationale feestdag is {fete_nationale}.',
    'De president is {president}.',
    'De premier is {premier_ministre}.',
    'Organisaties: {organisations}.',
    'De grootste religieuze groepen zijn {religions:2}.',
  ],
  // Première version, à faire relire par un locuteur natif (comme les gabarits de quiz en créole). Pas de voix
  // créole : la voix française lit ce texte, à peu près comme le créole s'écrit (orthographe IPN, plutôt phonétique).
  ht: [
    '{Name}, yon teritwa nan Karayib la.',
    'Kapital li se {capitale}.',
    'Lòt gwo vil: {grandes_villes}.',
    'Li fè pati {pays_de_rattachement}.',
    'Gwoup jewografik: {groupe_geographique}.',
    'Rejim politik li: {regime_politique}.',
    'Gen apeprè {population} moun ki rete la.',
    'Sipèfisi li se {superficie_km2} kilomèt kare.',
    'Dansite li se {densite_hab_km2} moun pou chak kilomèt kare.',
    'PIB li se apeprè {pib_mds_usd} milya dola.',
    'Pwen li ki pi wo a se {point_culminant}[, ki fè {altitude_m} mèt wotè].',
    'Lajan li : {monnaie}.',
    'Prensipal resous ak ekspòtasyon li yo: {principales_ressources}.',
    'Fiz orè li: {fuseau_horaire}.',
    'Yo pale {langues} nan teritwa a.',
    'Li te vin endepandan an {independance}.',
    'Fèt nasyonal li se {fete_nationale}.',
    'Prezidan li se {president}.',
    'Premye minis li se {premier_ministre}.',
    'Òganizasyon: {organisations}.',
    'Pi gwo gwoup relijye yo se {religions:2}.',
  ],
}

// Présentation générale de la carte (bouton « Écouter » de la page d'accueil, pas d'une fiche) :
// géographie, peuplement précolonial, colonisation, statuts politiques actuels. `{COUNT}` est
// remplacé par le nombre réel de territoires (`buildIntro`) pour ne pas se désynchroniser du CSV.
// Créole haïtien : première version, à faire relire par un locuteur natif (comme `speech` plus haut).
const introTemplate: SpeechTemplates = {
  fr: [
    "La mer des Caraïbes s'étend entre les côtes de l'Amérique centrale, l'Amérique du Sud et les Grandes et Petites Antilles.",
    "Elle réunit des dizaines d'îles et quelques territoires continentaux, sur un arc qui va de Cuba à Trinité-et-Tobago.",
    "Avant l'arrivée des Européens, la région était peuplée par les Taïnos, les Kalinagos et d'autres peuples autochtones — plusieurs de leurs noms survivent encore aujourd'hui.",
    "À partir du seizième siècle, Espagnols, Français, Britanniques et Néerlandais s'y sont installés, souvent au prix de la déportation de millions d'Africains réduits en esclavage.",
    "Certains territoires sont devenus des républiques indépendantes, comme Cuba, Haïti ou la Jamaïque ; d'autres restent rattachés à la France, aux Pays-Bas, au Royaume-Uni ou aux États-Unis.",
    "On y parle espagnol, anglais, français, néerlandais, et plusieurs langues créoles nées de ce brassage.",
    'Ce quiz explore {COUNT} de ces territoires : leur capitale, leur histoire, leur langue, et bien plus encore.',
  ],
  en: [
    'The Caribbean Sea stretches between the coasts of Central America, South America, and the Greater and Lesser Antilles.',
    'It brings together dozens of islands and a few mainland territories, along an arc running from Cuba to Trinidad and Tobago.',
    'Before Europeans arrived, the region was home to the Taíno, the Kalinago, and other Indigenous peoples — many of their names survive to this day.',
    'From the sixteenth century onward, Spanish, French, British, and Dutch settlers arrived, often at the cost of deporting millions of enslaved Africans.',
    'Some territories became independent republics, like Cuba, Haiti, or Jamaica; others remain tied to France, the Netherlands, the United Kingdom, or the United States.',
    'Spanish, English, French, and Dutch are all spoken here, along with several Creole languages born from this mix of cultures.',
    'This quiz explores {COUNT} of these territories: their capital, their history, their languages, and much more.',
  ],
  es: [
    'El mar Caribe se extiende entre las costas de América Central, América del Sur y las Antillas Mayores y Menores.',
    'Reúne decenas de islas y algunos territorios continentales, a lo largo de un arco que va de Cuba a Trinidad y Tobago.',
    'Antes de la llegada de los europeos, la región estaba habitada por los taínos, los kalinagos y otros pueblos indígenas — muchos de sus nombres perduran hasta hoy.',
    'A partir del siglo dieciséis, españoles, franceses, británicos y neerlandeses se establecieron allí, a menudo a costa de la deportación de millones de africanos esclavizados.',
    'Algunos territorios se convirtieron en repúblicas independientes, como Cuba, Haití o Jamaica; otros siguen vinculados a Francia, los Países Bajos, el Reino Unido o los Estados Unidos.',
    'Allí se hablan español, inglés, francés, neerlandés, y varias lenguas criollas nacidas de esta mezcla.',
    'Este quiz explora {COUNT} de estos territorios: su capital, su historia, su idioma, y mucho más.',
  ],
  nl: [
    'De Caribische Zee strekt zich uit tussen de kusten van Midden-Amerika, Zuid-Amerika en de Grote en Kleine Antillen.',
    'Ze omvat tientallen eilanden en enkele gebieden op het vasteland, langs een boog die loopt van Cuba tot Trinidad en Tobago.',
    "Voor de komst van de Europeanen woonden er de Taíno's, de Kalinago's en andere inheemse volkeren — veel van hun namen bestaan nog steeds.",
    'Vanaf de zestiende eeuw vestigden zich er Spanjaarden, Fransen, Britten en Nederlanders, vaak ten koste van de deportatie van miljoenen tot slaaf gemaakte Afrikanen.',
    'Sommige gebieden werden onafhankelijke republieken, zoals Cuba, Haïti of Jamaica; andere blijven verbonden met Frankrijk, Nederland, het Verenigd Koninkrijk of de Verenigde Staten.',
    'Er wordt Spaans, Engels, Frans en Nederlands gesproken, samen met verschillende creoolse talen die uit deze vermenging zijn ontstaan.',
    'Deze quiz verkent {COUNT} van deze gebieden: hun hoofdstad, hun geschiedenis, hun taal, en nog veel meer.',
  ],
  ht: [
    'Lanmè Karayib la ap laji ant kòt Amerik Santral, Amerik disid, ak Gran ak Ti Zantiy yo.',
    'Li gen plizyè douzèn zile ak kèk teritwa sou kontinan an, sou yon liy ki soti Kiba rive Trinite-e-Tobago.',
    'Anvan Ewopeyen yo te rive, se Taino yo, Kalinago yo, ak lòt pèp endijèn ki te viv nan rejyon an — anpil nan non yo toujou la jodi a.',
    'Apati sèzyèm syèk la, Panyòl, Franse, Britanik, ak Olandè te enstale la, souvan sou do depòtasyon plizyè milyon Afriken yo te fè tounen esklav.',
    'Kèk teritwa vin repiblik endepandan, tankou Kiba, Ayiti oswa Jamayik ; lòt yo rete atache ak Lafrans, Peyi Ba, Wayòm Ini a, oswa Etazini.',
    'Yo pale panyòl, anglè, franse, olandè, ansanm ak plizyè lang kreyòl ki fèt nan melanj sa a.',
    'Kiz sa a eksplore {COUNT} nan teritwa sa yo: kapital yo, istwa yo, lang yo, ak plis toujou.',
  ],
}

const buildIntro = (count: number): SpeechTemplates => Object.fromEntries(
  Object.entries(introTemplate).map(([loc, sentences]) => [loc, (sentences ?? []).map((s) => s.replace('{COUNT}', String(count)))]),
) as SpeechTemplates

/** Construit le jeu de données Caraïbes à partir de lignes CSV — même forme que `rows` viennent du
 *  fichier embarqué (démarrage) ou de Supabase (bascule silencieuse une fois le fetch arrivé) :
 *  shapes/i18n/aliases/region restent du code statique, indexés par le nom exact des territoires
 *  et certaines valeurs de cellules. */
function buildDataset(rows: Row[], schemaConfig: SchemaConfig | null): Dataset {
  const baseSchema = { ...inferSchema(rows), noun: 'territoire', title: 'Autour de la mer des Caraïbes' }
  const schema = applySchemaConfig(baseSchema, schemaConfig)
  return {
    rows,
    schema,
    shapes,
    aliases,
    i18n: caribbeanI18n,
    nouns: { fr: 'territoire', en: 'territory', es: 'territorio', nl: 'gebied', ht: 'teritwa' },
    titles: {
      fr: 'Autour de la mer des Caraïbes',
      en: 'Around the Caribbean Sea',
      es: 'Alrededor del mar Caribe',
      nl: 'Rond de Caribische Zee',
      ht: 'Toutalantou lanmè Karayib la',
    },
    editable: true,
    ficheDecor,
    speech,
    categoryGroups,
    subjectFilter,
    // « Abinader » suffit pour « Luis Abinader » (le prénom seul reste refusé).
    lastNameCategories: ['president', 'premier_ministre'],
    boost: VISUAL_BOOST,
    dataInfo: DATA_INFO,
    intro: buildIntro(rows.length),
    // « Cliquez sur X » : tous les territoires ayant une silhouette ou un point sur la carte régionale.
    map: {
      targets: Object.keys(region),
      render: ({ selected, onPick }) => (
        <Suspense fallback={null}><RegionOverviewPage
          rows={rows}
          schema={schema}
          region={region}
          regionContext={regionContext}
          regionViewBox={REGION_VIEWBOX}
          capitalColumn={CAPITAL_COLUMN}
          latitudeColumn="latitude_deg"
          longitudeColumn="longitude_deg"
          i18n={caribbeanI18n}
          pick={{ selected, onPick }}
        /></Suspense>
      ),
    },
    views: [{
      id: 'map',
      icon: '🧭',
      labelKey: 'nav.map',
      entry: 'atlas',
      render: ({ dataset, openFiche, back }) => (
        <Suspense fallback={null}><RegionOverviewPage
          rows={dataset.rows}
          schema={dataset.schema}
          region={region}
          regionContext={regionContext}
          regionViewBox={REGION_VIEWBOX}
          capitalColumn={CAPITAL_COLUMN}
          latitudeColumn="latitude_deg"
          longitudeColumn="longitude_deg"
          i18n={dataset.i18n}
          onOpenFiche={openFiche}
          onBack={back}
        /></Suspense>
      ),
    }],
  }
}

export const appSpec: QuizAppSpec = {
  seed: 'caribbean',
  fallbackTitle: 'Quiz Caraïbes',
  bundledCsv: caribbeanCsv,
  buildDataset,
  remote,
  Background: CaribbeanBackground,
}
