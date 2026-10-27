import type { DataI18n } from '@engine'

// Traductions du jeu de données caribéen. Source = `caribbean.csv` (français). On ne liste que
// ce qui diffère réellement du français. Locales : en (relu), es / nl / ht (à faire relire par
// un locuteur natif). À maintenir en même temps que le CSV.

const MONTHS: Record<string, [string, string, string, string]> = {
  janvier: ['January', 'enero', 'januari', 'janvye'], février: ['February', 'febrero', 'februari', 'fevriye'],
  mars: ['March', 'marzo', 'maart', 'mas'], avril: ['April', 'abril', 'april', 'avril'], mai: ['May', 'mayo', 'mei', 'me'],
  juin: ['June', 'junio', 'juni', 'jen'], juillet: ['July', 'julio', 'juli', 'jiyè'], août: ['August', 'agosto', 'augustus', 'out'],
  septembre: ['September', 'septiembre', 'september', 'septanm'], octobre: ['October', 'octubre', 'oktober', 'oktòb'],
  novembre: ['November', 'noviembre', 'november', 'novanm'], décembre: ['December', 'diciembre', 'december', 'desanm'],
}
const FETES = [
  '1er janvier', '7 février', '22 février', '27 février', '18 mars', '5 juillet', '10 juillet', '20 juillet', '6 août', '31 août',
  '15 septembre', '16 septembre', '19 septembre', '21 septembre', '10 octobre', '27 octobre', '1er novembre', '3 novembre',
  '11 novembre', '30 novembre',
]

/** Traduit les dates de fête nationale du CSV (« 1er janvier », « 15 septembre »). */
function dateValues(): DataI18n['values'] {
  return Object.fromEntries(FETES.map((fr) => {
    const [dayText, month] = fr.split(' ')
    const day = parseInt(dayText, 10)
    const [en, es, nl, ht] = MONTHS[month]
    return [fr, { en: `${day} ${en}`, es: `${day} de ${es}`, nl: `${day} ${nl}`, ht: `${day === 1 ? '1ye' : day} ${ht}` }]
  }))
}

const values: DataI18n['values'] = {
  // — noms de territoires —
  'Antigua-et-Barbuda': { en: 'Antigua and Barbuda', es: 'Antigua y Barbuda', nl: 'Antigua en Barbuda', ht: 'Antigwa ak Barbouda' },
  Bahamas: { ht: 'Bahamas' },
  Barbade: { en: 'Barbados', es: 'Barbados', nl: 'Barbados', ht: 'Barbad' },
  Cuba: { ht: 'Kiba' },
  Dominique: { en: 'Dominica', es: 'Dominica', nl: 'Dominica', ht: 'Dominik' },
  Grenade: { en: 'Grenada', es: 'Granada', nl: 'Grenada', ht: 'Grenad' },
  Haïti: { en: 'Haiti', es: 'Haití', ht: 'Ayiti' },
  Jamaïque: { en: 'Jamaica', es: 'Jamaica', nl: 'Jamaica', ht: 'Jamayik' },
  'République dominicaine': { en: 'Dominican Republic', es: 'República Dominicana', nl: 'Dominicaanse Republiek', ht: 'Repiblik Dominikèn' },
  'Saint-Christophe-et-Niévès': { en: 'Saint Kitts and Nevis', es: 'San Cristóbal y Nieves', nl: 'Saint Kitts en Nevis', ht: 'Sen Kristòf ak Nevis' },
  'Sainte-Lucie': { en: 'Saint Lucia', es: 'Santa Lucía', nl: 'Saint Lucia', ht: 'Sent Lisi' },
  'Saint-Vincent-et-les-Grenadines': { en: 'Saint Vincent and the Grenadines', es: 'San Vicente y las Granadinas', nl: 'Saint Vincent en de Grenadines', ht: 'Sen Vensan ak Grenadin yo' },
  'Trinité-et-Tobago': { en: 'Trinidad and Tobago', es: 'Trinidad y Tobago', nl: 'Trinidad en Tobago', ht: 'Trinidad ak Tobago' },
  Guadeloupe: { es: 'Guadalupe', ht: 'Gwadloup' },
  Martinique: { es: 'Martinica', ht: 'Matinik' },
  'Saint-Martin': { en: 'Saint Martin', es: 'San Martín', ht: 'Sen Maten' },
  'Saint-Barthélemy': { es: 'San Bartolomé', ht: 'Sen Batèlmi' },
  'Sint Maarten': {},
  Aruba: { ht: 'Awouba' },
  Curaçao: { es: 'Curazao', ht: 'Kirasao' },
  'Porto Rico': { en: 'Puerto Rico', es: 'Puerto Rico', nl: 'Puerto Rico', ht: 'Pòtoriko' },
  'Îles Caïmans': { en: 'Cayman Islands', es: 'Islas Caimán', nl: 'Kaaimaneilanden', ht: 'Zile Kayiman' },
  Belize: { es: 'Belice', ht: 'Beliz' },
  Guatemala: { ht: 'Gwatemala' },
  Honduras: { ht: 'Ondiras' },
  Salvador: { en: 'El Salvador', es: 'El Salvador', nl: 'El Salvador', ht: 'Salvadò' },
  Nicaragua: { ht: 'Nikaragwa' },
  'Costa Rica': { ht: 'Kostarika' },
  Panama: { es: 'Panamá' },
  Colombie: { en: 'Colombia', es: 'Colombia', nl: 'Colombia', ht: 'Kolonbi' },
  Venezuela: { ht: 'Venezyela' },
  Mexique: { en: 'Mexico', es: 'México', nl: 'Mexico', ht: 'Meksik' },
  'Îles Vierges britanniques': { en: 'British Virgin Islands', es: 'Islas Vírgenes Británicas', nl: 'Britse Maagdeneilanden', ht: 'Zile Vyèj Britanik yo' },
  'Îles Vierges américaines': { en: 'United States Virgin Islands', es: 'Islas Vírgenes de los Estados Unidos', nl: 'Amerikaanse Maagdeneilanden', ht: 'Zile Vyèj Ameriken yo' },
  'Îles Turques-et-Caïques': { en: 'Turks and Caicos Islands', es: 'Islas Turcas y Caicos', nl: 'Turks- en Caicoseilanden', ht: 'Zile Tik ak Kayik yo' },

  // — grandes villes (les capitales sont traduites plus bas) —
  'Belize City': { es: 'Ciudad de Belice', ht: 'Beliz Siti' },
  'Les Abymes': { ht: 'Labim' },
  'Pointe-à-Pitre': { ht: 'Pwentapit' },
  'Cap-Haïtien': { ht: 'Okap' },
  Gonaïves: { ht: 'Gonayiv' },
  'Santiago de los Caballeros': { ht: 'Santyago' },
  Guadalajara: { ht: 'Gwadalajara' },

  // — pays de rattachement —
  France: { en: 'France', es: 'Francia', nl: 'Frankrijk', ht: 'Lafrans' },
  'Pays-Bas': { en: 'Netherlands', es: 'Países Bajos', nl: 'Nederland', ht: 'Peyi Ba' },
  'Royaume-Uni': { en: 'United Kingdom', es: 'Reino Unido', nl: 'Verenigd Koninkrijk', ht: 'Wayòm Ini' },
  'États-Unis': { en: 'United States', es: 'Estados Unidos', nl: 'Verenigde Staten', ht: 'Etazini' },

  // — principales ressources —
  tourisme: { en: 'tourism', es: 'turismo', nl: 'toerisme', ht: 'touris' },
  'services financiers': { en: 'financial services', es: 'servicios financieros', nl: 'financiële diensten', ht: 'sèvis finansye' },
  nickel: { en: 'nickel', es: 'níquel', nl: 'nikkel', ht: 'nikèl' },
  banane: { en: 'bananas', es: 'banano', nl: 'bananen', ht: 'bannann' },
  muscade: { en: 'nutmeg', es: 'nuez moscada', nl: 'nootmuskaat', ht: 'nwa miskad' },
  textile: { en: 'textiles', es: 'textiles', nl: 'textiel', ht: 'tekstil' },
  bauxite: { en: 'bauxite', es: 'bauxita', nl: 'bauxiet', ht: 'boksit' },
  or: { en: 'gold', es: 'oro', nl: 'goud', ht: 'lò' },
  pétrole: { en: 'oil', es: 'petróleo', nl: 'aardolie', ht: 'petwòl' },
  'gaz naturel': { en: 'natural gas', es: 'gas natural', nl: 'aardgas', ht: 'gaz natirèl' },
  rhum: { en: 'rum', es: 'ron', nl: 'rum', ht: 'ròm' },
  raffinage: { en: 'oil refining', es: 'refinado de petróleo', nl: 'olieraffinage', ht: 'rafinaj' },
  pharmaceutique: { en: 'pharmaceuticals', es: 'productos farmacéuticos', nl: 'farmaceutische producten', ht: 'pwodwi famasetik' },
  café: { en: 'coffee', es: 'café', nl: 'koffie', ht: 'kafe' },
  sucre: { en: 'sugar', es: 'azúcar', nl: 'suiker', ht: 'sik' },
  'dispositifs médicaux': { en: 'medical devices', es: 'dispositivos médicos', nl: 'medische hulpmiddelen', ht: 'aparèy medikal' },
  'canal de Panama': { en: 'Panama Canal', es: 'Canal de Panamá', nl: 'Panamakanaal', ht: 'Kanal Panama' },
  automobile: { en: 'automobiles', es: 'automóviles', nl: 'auto’s', ht: 'otomobil' },
  électronique: { en: 'electronics', es: 'electrónica', nl: 'elektronica', ht: 'elektwonik' },
  pêche: { en: 'fishing', es: 'pesca', nl: 'visserij', ht: 'lapèch' },

  // — groupes géographiques —
  'Grandes Antilles': { en: 'Greater Antilles', es: 'Antillas Mayores', nl: 'Grote Antillen', ht: 'Gran Zantiy' },
  'Petites Antilles': { en: 'Lesser Antilles', es: 'Antillas Menores', nl: 'Kleine Antillen', ht: 'Ti Zantiy' },
  'Archipel des Lucayes': { en: 'Lucayan Archipelago', es: 'Archipiélago Lucayo', nl: 'Lucayaanse archipel', ht: 'Achipèl Lukayo' },
  'Amérique centrale': { en: 'Central America', es: 'América Central', nl: 'Midden-Amerika', ht: 'Amerik Santral' },
  'Amérique du Sud': { en: 'South America', es: 'América del Sur', nl: 'Zuid-Amerika', ht: 'Amerik disid' },
  'Amérique du Nord': { en: 'North America', es: 'América del Norte', nl: 'Noord-Amerika', ht: 'Amerik di nò' },

  // — fêtes nationales (« 1er novembre » → « 1 November », « 1 de noviembre »…) —
  ...dateValues(),

  // — capitales —
  'La Havane': { en: 'Havana', es: 'La Habana', nl: 'Havana', ht: 'Lavàn' },
  'Saint-Georges': { en: "St. George's", es: "Saint George's", nl: "Saint George's", ht: 'Sen Jòj' },
  'Saint-Domingue': { en: 'Santo Domingo', es: 'Santo Domingo', nl: 'Santo Domingo', ht: 'Sendomeng' },
  "Port-d'Espagne": { en: 'Port of Spain', es: 'Puerto España', nl: 'Port of Spain', ht: 'Pòtdespay' },
  'Port-au-Prince': { ht: 'Pòtoprens' },
  'Basse-Terre': { ht: 'Bastè' },
  'Fort-de-France': { ht: 'Fòdefrans' },
  Mexico: { en: 'Mexico City', es: 'Ciudad de México', nl: 'Mexico-Stad', ht: 'Meksiko' },

  // — monnaies (sans article : la phrase qui les cite le porte) —
  'dollar des Caraïbes orientales': { en: 'East Caribbean dollar', es: 'dólar del Caribe Oriental', nl: 'Oost-Caribische dollar', ht: 'dola Karayib de Lès' },
  'dollar bahaméen': { en: 'Bahamian dollar', es: 'dólar bahameño', nl: 'Bahamaanse dollar', ht: 'dola Bahamas' },
  'dollar barbadien': { en: 'Barbadian dollar', es: 'dólar de Barbados', nl: 'Barbadiaanse dollar', ht: 'dola Barbad' },
  'peso cubain': { en: 'Cuban peso', es: 'peso cubano', nl: 'Cubaanse peso', ht: 'peso kiben' },
  'dollar jamaïcain': { en: 'Jamaican dollar', es: 'dólar jamaicano', nl: 'Jamaicaanse dollar', ht: 'dola jamayiken' },
  'peso dominicain': { en: 'Dominican peso', es: 'peso dominicano', nl: 'Dominicaanse peso', ht: 'peso dominiken' },
  'gourde': { en: 'gourde', es: 'gourde', nl: 'gourde', ht: 'goud' },
  'dollar de Trinité-et-Tobago': { en: 'Trinidad and Tobago dollar', es: 'dólar de Trinidad y Tobago', nl: 'Trinidad en Tobago-dollar', ht: 'dola Trinidad ak Tobago' },
  'euro': { en: 'euro', es: 'euro', nl: 'euro', ht: 'ero' },
  'florin des Antilles néerlandaises': { en: 'Netherlands Antillean guilder', es: 'florín de las Antillas Neerlandesas', nl: 'Nederlands-Antilliaanse gulden', ht: 'florin Antiy Neyèlandè' },
  'florin arubais': { en: 'Aruban florin', es: 'florín arubeño', nl: 'Arubaanse florin', ht: 'florin arouba' },
  'dollar américain': { en: 'US dollar', es: 'dólar estadounidense', nl: 'Amerikaanse dollar', ht: 'dola ameriken' },
  'dollar des îles Caïmans': { en: 'Cayman Islands dollar', es: 'dólar de las Islas Caimán', nl: 'Kaaimaneilandse dollar', ht: 'dola Zile Kayiman' },
  'dollar bélizien': { en: 'Belize dollar', es: 'dólar de Belice', nl: 'Belizaanse dollar', ht: 'dola beliz' },
  'quetzal': { en: 'quetzal', es: 'quetzal', nl: 'quetzal', ht: 'ketsal' },
  'lempira': { en: 'lempira', es: 'lempira', nl: 'lempira', ht: 'lempira' },
  'córdoba': { en: 'córdoba', es: 'córdoba', nl: 'córdoba', ht: 'kòdoba' },
  'colón costaricien': { en: 'Costa Rican colón', es: 'colón costarricense', nl: 'Costa Ricaanse colón', ht: 'kolon kostariken' },
  'balboa': { en: 'balboa', es: 'balboa', nl: 'balboa', ht: 'balboa' },
  'peso colombien': { en: 'Colombian peso', es: 'peso colombiano', nl: 'Colombiaanse peso', ht: 'peso kolonbyen' },
  'bolívar': { en: 'bolívar', es: 'bolívar', nl: 'bolívar', ht: 'bolivar' },
  'peso mexicain': { en: 'Mexican peso', es: 'peso mexicano', nl: 'Mexicaanse peso', ht: 'peso meksiken' },

  // Transitoire : tant que la table Supabase `caribbean_dataset` garde les monnaies avec article (« le peso cubain »), on les traduit aussi.
  // À supprimer une fois la colonne `monnaie` mise à jour en base.
  'le dollar des Caraïbes orientales': { en: 'East Caribbean dollar', es: 'dólar del Caribe Oriental', nl: 'Oost-Caribische dollar', ht: 'dola Karayib de Lès' },
  'le dollar bahaméen': { en: 'Bahamian dollar', es: 'dólar bahameño', nl: 'Bahamaanse dollar', ht: 'dola Bahamas' },
  'le dollar barbadien': { en: 'Barbadian dollar', es: 'dólar de Barbados', nl: 'Barbadiaanse dollar', ht: 'dola Barbad' },
  'le peso cubain': { en: 'Cuban peso', es: 'peso cubano', nl: 'Cubaanse peso', ht: 'peso kiben' },
  'le dollar jamaïcain': { en: 'Jamaican dollar', es: 'dólar jamaicano', nl: 'Jamaicaanse dollar', ht: 'dola jamayiken' },
  'le peso dominicain': { en: 'Dominican peso', es: 'peso dominicano', nl: 'Dominicaanse peso', ht: 'peso dominiken' },
  'la gourde': { en: 'gourde', es: 'gourde', nl: 'gourde', ht: 'goud' },
  'le dollar de Trinité-et-Tobago': { en: 'Trinidad and Tobago dollar', es: 'dólar de Trinidad y Tobago', nl: 'Trinidad en Tobago-dollar', ht: 'dola Trinidad ak Tobago' },
  "l'euro": { en: 'euro', es: 'euro', nl: 'euro', ht: 'ero' },
  'le florin des Antilles néerlandaises': { en: 'Netherlands Antillean guilder', es: 'florín de las Antillas Neerlandesas', nl: 'Nederlands-Antilliaanse gulden', ht: 'florin Antiy Neyèlandè' },
  'le florin arubais': { en: 'Aruban florin', es: 'florín arubeño', nl: 'Arubaanse florin', ht: 'florin arouba' },
  'le dollar américain': { en: 'US dollar', es: 'dólar estadounidense', nl: 'Amerikaanse dollar', ht: 'dola ameriken' },
  'le dollar des îles Caïmans': { en: 'Cayman Islands dollar', es: 'dólar de las Islas Caimán', nl: 'Kaaimaneilandse dollar', ht: 'dola Zile Kayiman' },
  'le dollar bélizien': { en: 'Belize dollar', es: 'dólar de Belice', nl: 'Belizaanse dollar', ht: 'dola beliz' },
  'le quetzal': { en: 'quetzal', es: 'quetzal', nl: 'quetzal', ht: 'ketsal' },
  'le lempira': { en: 'lempira', es: 'lempira', nl: 'lempira', ht: 'lempira' },
  'le córdoba': { en: 'córdoba', es: 'córdoba', nl: 'córdoba', ht: 'kòdoba' },
  'le colón costaricien': { en: 'Costa Rican colón', es: 'colón costarricense', nl: 'Costa Ricaanse colón', ht: 'kolon kostariken' },
  'le balboa': { en: 'balboa', es: 'balboa', nl: 'balboa', ht: 'balboa' },
  'le peso colombien': { en: 'Colombian peso', es: 'peso colombiano', nl: 'Colombiaanse peso', ht: 'peso kolonbyen' },
  'le bolívar': { en: 'bolívar', es: 'bolívar', nl: 'bolívar', ht: 'bolivar' },
  'le peso mexicain': { en: 'Mexican peso', es: 'peso mexicano', nl: 'Mexicaanse peso', ht: 'peso meksiken' },

  // — langues (chaque atome d'une cellule multivaleur) —
  anglais: { en: 'English', es: 'inglés', nl: 'Engels', ht: 'angle' },
  espagnol: { en: 'Spanish', es: 'español', nl: 'Spaans', ht: 'panyòl' },
  français: { en: 'French', es: 'francés', nl: 'Frans', ht: 'franse' },
  néerlandais: { en: 'Dutch', es: 'neerlandés', nl: 'Nederlands', ht: 'olandè' },
  papiamento: { en: 'Papiamento', nl: 'Papiaments', ht: 'papyamento' },
  'créole antillais': { en: 'Antillean Creole', es: 'criollo antillano', nl: 'Antilliaans Creools', ht: 'kreyòl antiye' },
  'créole haïtien': { en: 'Haitian Creole', es: 'criollo haitiano', nl: 'Haïtiaans Creools', ht: 'kreyòl ayisyen' },
  'créole guadeloupéen': { en: 'Guadeloupean Creole', es: 'criollo guadalupeño', nl: 'Guadeloups Creools', ht: 'kreyòl gwadloup' },
  'créole martiniquais': { en: 'Martinican Creole', es: 'criollo martiniqués', nl: 'Martinikaans Creools', ht: 'kreyòl matinik' },
  'créole saint-lucien': { en: 'Saint Lucian Creole', es: 'criollo santalucense', nl: 'Saint Luciaans Creools', ht: 'kreyòl sent lisi' },

  // — points culminants (seuls ceux qui portent un mot français) —
  'Mont Obama': { en: 'Mount Obama', es: 'Monte Obama', nl: 'Mount Obama', ht: 'Mòn Obama' },
  'Mont Hillaby': { en: 'Mount Hillaby', es: 'Monte Hillaby', nl: 'Mount Hillaby', ht: 'Mòn Hillaby' },
  'Mont Sainte-Catherine': { en: 'Mount Saint Catherine', es: 'Monte Santa Catalina', nl: 'Mount Saint Catherine', ht: 'Mòn Sent Katrin' },
  'Mont Liamuiga': { en: 'Mount Liamuiga', es: 'Monte Liamuiga', nl: 'Mount Liamuiga', ht: 'Mòn Liamuiga' },
  'Mont Gimie': { en: 'Mount Gimie', es: 'Monte Gimie', nl: 'Mount Gimie', ht: 'Mòn Gimie' },
  'Montagne Pelée': { en: 'Mount Pelée', es: 'Montaña Pelada', ht: 'Mòn Pele' },
  'Pic la Selle': { ht: 'Pik la Sèl' },
  'Morne Diablotins': { ht: 'Mòn Dyabloten' },
  'Morne du Vitet': { ht: 'Mòn Vitèt' },
  'Pic Paradis': { ht: 'Pik Paradi' },

  // — régimes politiques —
  'monarchie constitutionnelle': { en: 'constitutional monarchy', es: 'monarquía constitucional', nl: 'constitutionele monarchie', ht: 'monachi konstitisyonèl' },
  'monarchie constitutionnelle fédérale': { en: 'federal constitutional monarchy', es: 'monarquía constitucional federal', nl: 'federale constitutionele monarchie', ht: 'monachi konstitisyonèl federal' },
  'république parlementaire': { en: 'parliamentary republic', es: 'república parlamentaria', nl: 'parlementaire republiek', ht: 'repiblik palmantè' },
  'république socialiste à parti unique': { en: 'one-party socialist republic', es: 'república socialista de partido único', nl: 'socialistische eenpartijrepubliek', ht: 'repiblik sosyalis yon sèl pati' },
  'république semi-présidentielle': { en: 'semi-presidential republic', es: 'república semipresidencial', nl: 'semipresidentiële republiek', ht: 'repiblik semi-prezidansyèl' },
  'république présidentielle': { en: 'presidential republic', es: 'república presidencial', nl: 'presidentiële republiek', ht: 'repiblik prezidansyèl' },
  'république fédérale présidentielle': { en: 'federal presidential republic', es: 'república federal presidencial', nl: 'federale presidentiële republiek', ht: 'repiblik federal prezidansyèl' },
  "département et région d'outre-mer français": { en: 'French overseas department and region', es: 'departamento y región de ultramar francés', nl: 'Frans overzees departement en regio', ht: 'depatman ak rejyon lòtbò lanmè fransè' },
  'collectivité territoriale unique française': { en: 'French single territorial authority', es: 'colectividad territorial única francesa', nl: 'Franse territoriale eenheidsgemeenschap', ht: 'kolektivite teritoryal inik fransè' },
  "collectivité d'outre-mer française": { en: 'French overseas collectivity', es: 'colectividad de ultramar francesa', nl: 'Franse overzeese gemeenschap', ht: 'kolektivite lòtbò lanmè fransè' },
  'pays constitutif du royaume des Pays-Bas': { en: 'constituent country of the Kingdom of the Netherlands', es: 'país constitutivo del Reino de los Países Bajos', nl: 'land binnen het Koninkrijk der Nederlanden', ht: 'peyi ki fè pati Wayòm Peyi Ba yo' },
  "territoire non incorporé des États-Unis": { en: 'unincorporated territory of the United States', es: 'territorio no incorporado de los Estados Unidos', nl: 'niet-geïncorporeerd gebied van de Verenigde Staten', ht: 'teritwa Etazini ki pa enkòpore' },
  "territoire britannique d'outre-mer": { en: 'British Overseas Territory', es: 'territorio británico de ultramar', nl: 'Brits overzees gebied', ht: 'teritwa britanik lòtbò lanmè' },
  'commune à statut particulier des Pays-Bas': { en: 'special municipality of the Netherlands', es: 'municipio especial de los Países Bajos', nl: 'bijzondere gemeente van Nederland', ht: 'minisipalite espesyal Peyi Ba yo' },

  // — organisations internationales (chaque atome d'une cellule multivaleur) —
  ONU: { en: 'UN', nl: 'VN' },
  OEA: { en: 'OAS', nl: 'OAS' },
  UE: { en: 'EU', nl: 'EU' },

  // — religions (chaque atome, hors pourcentage entre parenthèses — jamais traduit, cf. `splitAnnotation`) —
  protestantisme: { en: 'Protestantism', es: 'protestantismo', nl: 'protestantisme', ht: 'Pwotestantis' },
  catholicisme: { en: 'Catholicism', es: 'catolicismo', nl: 'katholicisme', ht: 'Katolisis' },
  'protestantisme évangélique': { en: 'evangelical Protestantism', es: 'protestantismo evangélico', nl: 'evangelisch protestantisme', ht: 'Pwotestantis Evanjelik' },
  'sans religion ou autre': { en: 'No religion or other', es: 'sin religión u otra', nl: 'geen religie of anders', ht: 'San relijyon oswa lòt' },
  rastafari: { en: 'Rastafari', ht: 'Rastafari' },
  vaudou: { en: 'Vodou', es: 'vudú', nl: 'voodoo', ht: 'Vodou' },
  hindouisme: { en: 'Hinduism', es: 'hinduismo', nl: 'hindoeïsme', ht: 'Endouyis' },
  islam: { en: 'Islam', ht: 'Islam' },
  santería: { en: 'Santería', ht: 'Senteria' },
}

const articles: DataI18n['articles'] = {
  Bahamas: { en: 'the', es: 'las', nl: 'de' },
  'Îles Caïmans': { en: 'the', es: 'las', nl: 'de' },
  'République dominicaine': { en: 'the', es: 'la', nl: 'de' },
  'Îles Vierges britanniques': { en: 'the', es: 'las', nl: 'de' },
  'Îles Vierges américaines': { en: 'the', es: 'las', nl: 'de' },
  'Îles Turques-et-Caïques': { en: 'the', es: 'las', nl: 'de' },
}

// Les libellés FR auto-dérivés des en-têtes CSV (ASCII, tout en minuscules) sont parfois faux :
// on les corrige ici pour `fr` aussi (accents, acronymes).
const columnLabels: DataI18n['columnLabels'] = {
  capitale: { en: 'capital', es: 'capital', nl: 'hoofdstad', ht: 'kapital' },
  latitude: { fr: 'latitude de la capitale', en: 'latitude of the capital', es: 'latitud de la capital', nl: 'breedtegraad van de hoofdstad', ht: 'latitid kapital la' },
  longitude: { fr: 'longitude de la capitale', en: 'longitude of the capital', es: 'longitud de la capital', nl: 'lengtegraad van de hoofdstad', ht: 'lonjitid kapital la' },
  population: { en: 'population', es: 'población', nl: 'bevolking', ht: 'popilasyon' },
  superficie: { en: 'area', es: 'superficie', nl: 'oppervlakte', ht: 'sipèfisi' },
  densite: { fr: 'densité', en: 'density', es: 'densidad', nl: 'dichtheid', ht: 'dansite' },
  pib: { fr: 'PIB', en: 'GDP', es: 'PIB', nl: 'bbp', ht: 'PIB' },
  'point culminant': { en: 'highest point', es: 'punto más alto', nl: 'hoogste punt', ht: 'pwen ki pi wo' },
  altitude: { fr: 'altitude du point culminant', en: 'elevation of the highest point', es: 'altitud del punto más alto', nl: 'hoogte van het hoogste punt', ht: 'altitid pwen ki pi wo a' },
  monnaie: { en: 'currency', es: 'moneda', nl: 'munt', ht: 'lajan' },
  langues: { en: 'languages', es: 'idiomas', nl: 'talen', ht: 'lang' },
  'indicatif telephonique': { fr: 'indicatif téléphonique', en: 'dialing code', es: 'prefijo telefónico', nl: 'landnummer', ht: 'endikatif telefòn' },
  'domaine internet': { en: 'internet domain', es: 'dominio de internet', nl: 'internetdomein', ht: 'domèn entènèt' },
  president: { fr: 'président', en: 'president', es: 'presidente', nl: 'president', ht: 'prezidan' },
  'premier ministre': { en: 'prime minister', es: 'primer ministro', nl: 'premier', ht: 'premye minis' },
  independance: { fr: 'indépendance', en: 'independence', es: 'independencia', nl: 'onafhankelijkheid', ht: 'endepandans' },
  'regime politique': { fr: 'régime politique', en: 'political system', es: 'régimen político', nl: 'politiek regime', ht: 'rejim politik' },
  organisations: { en: 'international organisations', es: 'organizaciones internacionales', nl: 'internationale organisaties', ht: 'òganizasyon entènasyonal' },
  religions: { en: 'religions', es: 'religiones', nl: 'religies', ht: 'relijyon' },
  drapeau: { en: 'flag', es: 'bandera', nl: 'vlag', ht: 'drapo' },
  'pays de rattachement': { en: 'parent country', es: 'país de adscripción', nl: 'moederland', ht: 'peyi rataman' },
  'principales ressources': { en: 'main resources and exports', es: 'principales recursos y exportaciones', nl: 'belangrijkste hulpbronnen en export', ht: 'prensipal resous ak ekspòtasyon' },
  'fuseau horaire': { en: 'time zone', es: 'huso horario', nl: 'tijdzone', ht: 'fiz orè' },
  'groupe geographique': { fr: 'groupe géographique', en: 'geographic group', es: 'grupo geográfico', nl: 'geografische groep', ht: 'gwoup jewografik' },
  'fete nationale': { fr: 'fête nationale', en: 'national day', es: 'fiesta nacional', nl: 'nationale feestdag', ht: 'fèt nasyonal' },
  'grandes villes': { fr: 'autres grandes villes', en: 'other major cities', es: 'otras ciudades importantes', nl: 'andere grote steden', ht: 'lòt gwo vil' },
  'noms indigenes': { fr: 'noms indigènes', en: 'indigenous names', es: 'nombres indígenas', nl: 'inheemse namen', ht: 'non endijèn' },
}

const units: DataI18n['units'] = {
  'Mds $': { en: 'bn $', es: 'mil M$', nl: 'mld $', ht: 'milya $' },
  'hab/km²': { en: 'pop./km²', nl: 'inw./km²', ht: 'moun/km²' }, // es : « hab/km² » identique
}

export const caribbeanI18n: DataI18n = { values, articles, columnLabels, units }
