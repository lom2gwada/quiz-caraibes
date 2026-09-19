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
 *  quand la donnée manque (territoire sans président, sans indépendance…). Français et anglais ; les autres langues
 *  retombent sur le français. Les possessifs s'accordent avec le nom qu'ils qualifient (« sa capitale », « son PIB »),
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
    'Religions principales : {religions:2}.',
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
    'The main religions are {religions:2}.',
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
