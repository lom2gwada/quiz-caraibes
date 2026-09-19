import { applySchemaConfig, createRemoteDataset, inferSchema } from '@engine'
import type { Dataset, FicheDecorator, QuizAppSpec, Row, SchemaConfig, SpeechTemplates } from '@engine'
import caribbeanCsv from './data/caribbean.csv?raw'
import { shapes } from './data/shapes'
import { aliases } from './data/aliases'
import { caribbeanI18n } from './data/caribbean.i18n'
import { region, REGION_VIEWBOX } from './data/region'
import { CaribbeanBackground } from './components/CaribbeanBackground'
import { RegionDecor, ShapeDecor } from './components/FicheDecor'
import { RegionOverviewPage } from './components/RegionOverviewPage'

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
    'regime_politique', 'organisations', 'religions', 'drapeau',
  ],
})

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
    'Son régime politique : {regime_politique}.',
    'Sa population est d’environ {population} habitants.',
    'Sa superficie est de {superficie_km2} kilomètres carrés.',
    'Sa densité est de {densite_hab_km2} habitants au kilomètre carré.',
    'Son PIB est d’environ {pib_mds_usd} milliards de dollars.',
    'Son point culminant est {point_culminant}[, à {altitude_m} mètres d’altitude].',
    'Sa monnaie est {monnaie}.',
    'On y parle {langues}.',
    'Son indépendance date de {independance}.',
    'Son président est {president}.',
    'Son Premier ministre est {premier_ministre}.',
    'Organisations : {organisations}.',
    'Principaux groupes religieux : {religions:2}.',
  ],
  en: [
    '{Name}, a Caribbean territory.',
    'Its capital is {capitale}.',
    'Political system: {regime_politique}.',
    'Its population is about {population}.',
    'Its area is {superficie_km2} square kilometres.',
    'Its density is {densite_hab_km2} inhabitants per square kilometre.',
    'Its GDP is about {pib_mds_usd} billion dollars.',
    'Its highest point is {point_culminant}[, at {altitude_m} metres above sea level].',
    'Its currency is {monnaie}.',
    'People there speak {langues}.',
    'It gained independence in {independance}.',
    'Its president is {president}.',
    'Its prime minister is {premier_ministre}.',
    'Organisations: {organisations}.',
    'Largest religious groups: {religions:2}.',
  ],
  es: [
    '{Name}, un territorio del Caribe.',
    'Su capital es {capitale}.',
    'Su régimen político: {regime_politique}.',
    'Su población es de unos {population} habitantes.',
    'Su superficie es de {superficie_km2} kilómetros cuadrados.',
    'Su densidad es de {densite_hab_km2} habitantes por kilómetro cuadrado.',
    'Su PIB es de unos {pib_mds_usd} mil millones de dólares.',
    'Su punto más alto es {point_culminant}[, a {altitude_m} metros de altitud].',
    'Su moneda es {monnaie}.',
    'Allí se habla {langues}.',
    'Obtuvo la independencia en {independance}.',
    'Su presidente es {president}.',
    'Su primer ministro es {premier_ministre}.',
    'Organizaciones: {organisations}.',
    'Los grupos religiosos más numerosos son {religions:2}.',
  ],
  nl: [
    '{Name}, een gebied in het Caribisch gebied.',
    'De hoofdstad is {capitale}.',
    'Staatsvorm: {regime_politique}.',
    'Er wonen ongeveer {population} mensen.',
    'De oppervlakte is {superficie_km2} vierkante kilometer.',
    'De bevolkingsdichtheid is {densite_hab_km2} inwoners per vierkante kilometer.',
    'Het bbp bedraagt ongeveer {pib_mds_usd} miljard dollar.',
    'Het hoogste punt is {point_culminant}[, op {altitude_m} meter hoogte].',
    'De munteenheid is {monnaie}.',
    'Men spreekt er {langues}.',
    'De onafhankelijkheid dateert van {independance}.',
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
    'Rejim politik li: {regime_politique}.',
    'Gen apeprè {population} moun ki rete la.',
    'Sipèfisi li se {superficie_km2} kilomèt kare.',
    'Dansite li se {densite_hab_km2} moun pou chak kilomèt kare.',
    'PIB li se apeprè {pib_mds_usd} milya dola.',
    'Pwen li ki pi wo a se {point_culminant}[, ki fè {altitude_m} mèt wotè].',
    'Lajan li se {monnaie}.',
    'Yo pale {langues} nan teritwa a.',
    'Li te vin endepandan an {independance}.',
    'Prezidan li se {president}.',
    'Premye minis li se {premier_ministre}.',
    'Òganizasyon: {organisations}.',
    'Pi gwo gwoup relijye yo se {religions:2}.',
  ],
}

/** Construit le jeu de données Caraïbes à partir de lignes CSV — même forme que `rows` viennent du
 *  fichier embarqué (démarrage) ou de Supabase (bascule silencieuse une fois le fetch arrivé) :
 *  shapes/i18n/aliases/region restent du code statique, indexés par le nom exact des territoires
 *  et certaines valeurs de cellules. */
function buildDataset(rows: Row[], schemaConfig: SchemaConfig | null): Dataset {
  const baseSchema = { ...inferSchema(rows), noun: 'territoire', title: 'Autour de la mer des Caraïbes' }
  return {
    rows,
    schema: applySchemaConfig(baseSchema, schemaConfig),
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
    views: [{
      id: 'map',
      icon: '🧭',
      labelKey: 'nav.map',
      entry: 'atlas',
      render: ({ dataset, openFiche, back }) => (
        <RegionOverviewPage
          rows={dataset.rows}
          schema={dataset.schema}
          region={region}
          regionViewBox={REGION_VIEWBOX}
          capitalColumn={CAPITAL_COLUMN}
          latitudeColumn="latitude_deg"
          longitudeColumn="longitude_deg"
          i18n={dataset.i18n}
          onOpenFiche={openFiche}
          onBack={back}
        />
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
