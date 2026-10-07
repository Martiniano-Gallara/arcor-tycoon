/**
 * Base de datos oficial y verificada del Museo del Sabor - 75 Años de Arcor (1951 - 2026)
 * Datos rigurosamente documentados con base en la historia real de Grupo Arcor.
 */

export interface MuseumExhibit {
  id: string;
  levelTrigger?: number;
  title: string;
  year: number;
  decade: string;
  importance: string;
  description: string;
  candyKey: string;
  candyName: string;
  candyIcon: string;
  candyColor: string;
  candyGradient: string;
  candyShape: 'oval' | 'round' | 'twist' | 'cube' | 'bonobon' | 'bar';
  wrapperText: string;
  funFact: string;
  candyPhoto?: string;
  archivalPhoto?: string;
  rewardCoins: number;
  eraTag: string;
  vitrinePosition: { x: number; y: number };
}

export interface MuseumDecadeStation {
  year: number;
  decadeTitle: string;
  subTitle: string;
  motto: string;
  historicalMilestone: string;
  description: string;
  icon: string;
  xPercent: number;
  yPercent: number;
  unlockedByDefault: boolean;
}

export interface ArchiveBookPage {
  pageNumber: number;
  title: string;
  yearLabel: string;
  subtitle: string;
  imagePath: string;
  imageCaption: string;
  storyBody: string[];
  historicalQuote: string;
  authorQuote: string;
}

// ---------------------------------------------------------------------------
// 1. EXHIBICIONES Y CARAMELOS HISTÓRICOS DE LAS VITRINAS
// ---------------------------------------------------------------------------
export const MUSEUM_EXHIBITS: MuseumExhibit[] = [
  {
    id: 'exhibit-miel-1951',
    title: 'Primeros Caramelos Artesanales de Miel',
    year: 1951,
    decade: 'Años 50',
    importance: 'El sabor del primer hervor en la paila de cobre de Arroyito',
    description: 'El 5 de julio de 1951, Don Fulvio Pagani y sus jóvenes socios encendieron la primera paila de cobre en Arroyito, Córdoba. Estos caramelos duros elaborados con miel pura cordobesa y azúcar cristal marcaron el nacimiento de una promesa: hacer llegar golosinas de calidad a un precio justo para todos los hogares.',
    candyKey: 'caramelo_1951',
    candyName: 'Caramelo de Miel 1951',
    candyIcon: '🍯',
    candyColor: '#e69500',
    candyGradient: 'radial-gradient(circle at 35% 30%, #fff0b3 0%, #ffbb33 45%, #cc7a00 80%, #663d00 100%)',
    candyShape: 'twist',
    wrapperText: 'ARCOR 1951',
    candyPhoto: '/candies/caramelo_arcor.png',
    funFact: 'Los fundadores cargaban personalmente bolsas de azúcar de 50 kg para encender la cocción.',
    archivalPhoto: './fabrica_arroyito_1951.jpg',
    rewardCoins: 250,
    eraTag: '🏭 EL NACIMIENTO EN ARROYITO',
    vitrinePosition: { x: 12, y: 56 }
  },
  {
    id: 'exhibit-holanda-1960',
    title: 'Caramelos Holanda',
    year: 1960,
    decade: 'Años 60',
    importance: 'El primer gran clásico de dulce de leche que conquistó a generaciones',
    description: 'Nacido en los albores de la década de 1960, el caramelo Holanda introdujo una textura blanda inconfundible con el sabor auténtico del dulce de leche argentino. Envuelto en su tradicional papel blanco, rojo y azul a rayas, se convirtió en un ícono de los kioscos y almacenes de ramos generales.',
    candyKey: 'holanda',
    candyName: 'Caramelo Holanda',
    candyIcon: '🍬',
    candyColor: '#d62828',
    candyGradient: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #ff5252 50%, #b71c1c 85%, #4a0000 100%)',
    candyShape: 'oval',
    wrapperText: 'HOLANDA',
    candyPhoto: '/candies/holanda.png',
    funFact: 'Su receta requirió desarrollar ollas especiales de cocción continua para evitar que la leche se quemara.',
    rewardCoins: 300,
    eraTag: '🥛 DULCE DE LECHE TRADICIONAL',
    vitrinePosition: { x: 34, y: 48 }
  },
  {
    id: 'exhibit-butter-1964',
    title: 'Butter Toffees',
    year: 1964,
    decade: 'Años 60',
    importance: 'El caramelo de leche suave más vendido del país y embajador global',
    description: 'En 1964, Arcor revoluciona la confitería nacional lanzando Butter Toffees: una crema toffee elaborada con manteca fresca y leche condensada seleccionada. Su característico envoltorio dorado con moños laterales es reconocido en más de 80 países.',
    candyKey: 'buttertoffee',
    candyName: 'Butter Toffees',
    candyIcon: '🍬',
    candyColor: '#ffd700',
    candyGradient: 'radial-gradient(circle at 35% 30%, #fffbe6 0%, #ffd700 45%, #e6a100 80%, #805500 100%)',
    candyShape: 'twist',
    wrapperText: 'BUTTER TOFFEES',
    candyPhoto: '/candies/butter_toffees.png',
    funFact: 'Se degusta en más de 80 países de los 5 continentes y es líder absoluto en su segmento.',
    rewardCoins: 350,
    eraTag: '🧈 SUAVIDAD Y MANTECA FRESCA',
    vitrinePosition: { x: 72, y: 48 }
  },
  {
    id: 'exhibit-frutales-1970',
    title: 'Caramelos Frutales Arcor',
    year: 1970,
    decade: 'Años 70',
    importance: 'El color de la alegría y la mayor variedad frutal de América Latina',
    description: 'A comienzos de los años 70, la fábrica de Arroyito estandarizó la línea de Frutales Arcor: naranja, limón, frutilla, uva y ananá. Sus colores vivos y el papel satinado transparente llenaron de alegría los cumpleaños infantiles y los tarros de vidrio de los almacenes.',
    candyKey: 'frutales',
    candyName: 'Frutales Arcor',
    candyIcon: '🍓',
    candyColor: '#ff007f',
    candyGradient: 'radial-gradient(circle at 35% 30%, #ffe6f0 0%, #ff1a8c 50%, #b30059 85%, #4d0026 100%)',
    candyShape: 'round',
    wrapperText: 'FRUTALES',
    candyPhoto: '/candies/frutales.png',
    funFact: 'En 1970, Arcor ya producía más de 60.000 kg diarios de caramelos para abastecer a todo el Cono Sur.',
    rewardCoins: 300,
    eraTag: '🍊 COLOR Y VARIEDAD',
    vitrinePosition: { x: 47, y: 48 }
  },
  {
    id: 'exhibit-menta-1975',
    title: 'Menta Cristal',
    year: 1975,
    decade: 'Años 70',
    importance: 'La frescura natural en cada encuentro cotidiano',
    description: 'Elaborado con aceites esenciales puros de menta piperita, Menta Cristal se consolidó como el caramelo duro de sobremesa por excelencia. Su transparencia de cristal y su frescura intensa lo convirtieron en un infaltable en bolsillos y carteras de varias generaciones.',
    candyKey: 'menta',
    candyName: 'Menta Cristal',
    candyIcon: '🌿',
    candyColor: '#00cc66',
    candyGradient: 'radial-gradient(circle at 35% 30%, #e6fff2 0%, #00e673 45%, #00994d 80%, #004d26 100%)',
    candyShape: 'oval',
    wrapperText: 'MENTA',
    candyPhoto: '/candies/menta_cristal.png',
    funFact: 'Los fundadores instalaron su propia destilería de esencias para garantizar pureza cristalina.',
    rewardCoins: 300,
    eraTag: '❄️ FRESCURA CRISTALINA',
    vitrinePosition: { x: 59, y: 48 }
  },
  {
    id: 'exhibit-mogul-1982',
    title: 'Gomitas Mogul',
    year: 1982,
    decade: 'Años 80',
    importance: 'Las primeras gomitas con auténtico jugo natural de frutas en Argentina',
    description: 'En 1982, Arcor introduce la marca Mogul, transformando el mercado con figuras de ositos masticables enriquecidas con jugo de frutas reales. Mogul redefinió la golosina lúdica, convirtiéndose en el estándar de ternura y sabor frutal.',
    candyKey: 'mogul',
    candyName: 'Gomitas Mogul',
    candyIcon: '🐻',
    candyColor: '#ff8000',
    candyGradient: 'radial-gradient(circle at 35% 30%, #fff0e6 0%, #ff8000 50%, #cc6600 85%, #663300 100%)',
    candyShape: 'round',
    wrapperText: 'MOGUL',
    candyPhoto: '/candies/mogul_gomitas.png',
    funFact: 'La fábrica de gomitas Mogul utiliza almidón alimenticio en moldes que imprimen los detalles de las caritas de los ositos.',
    rewardCoins: 400,
    eraTag: '🐻 DIVERSIÓN Y JUGO REAL',
    vitrinePosition: { x: 28, y: 64 }
  },
  {
    id: 'exhibit-bonobon-1984',
    title: 'Bon o Bon',
    year: 1984,
    decade: 'Años 80',
    importance: 'El bombón líder de Latinoamérica e inspirador de la Semana de la Dulzura',
    description: 'Creado en 1984 por iniciativa de Don Fulvio Pagani, Bon o Bon unió tres placeres en una sola esfera: una oblea crocante, relleno suave de crema de maní tostado y un baño de puro chocolate con leche. En 1989 inspiró la campaña "Un Bon o Bon por un beso", dando vida a la Semana de la Dulzura cada primer semana de julio.',
    candyKey: 'bonobon',
    candyName: 'Bon o Bon',
    candyIcon: '🍫',
    candyColor: '#b32400',
    candyGradient: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #ff4d4d 45%, #b30000 80%, #4d0000 100%)',
    candyShape: 'bonobon',
    wrapperText: 'BON O BON',
    candyPhoto: '/candies/bonobon_leche.png',
    funFact: 'Es el bombón más consumido de toda América Latina y se produce en plantas de Argentina, Brasil y México.',
    rewardCoins: 500,
    eraTag: '💋 UN BON O BON POR UN BESO',
    vitrinePosition: { x: 50, y: 64 }
  },
  {
    id: 'exhibit-aguila-1988',
    title: 'Chocolate Águila',
    year: 1988,
    decade: 'Años 80',
    importance: 'La marca chocolatera más antigua del país (desde 1880), pilar de la repostería familiar',
    description: 'En 1988, Arcor adquiere la histórica fábrica Águila Saint, fundada en 1880. Arcor modernizó sus instalaciones preservando el sabor centenario del chocolate para taza semiamargo, icono de los submarinos invernales y tortas caseras de todas las familias argentinas.',
    candyKey: 'aguila',
    candyName: 'Chocolate Águila Semiamargo',
    candyIcon: '🦅',
    candyColor: '#3e2723',
    candyGradient: 'radial-gradient(circle at 35% 30%, #8d6e63 0%, #4e342e 50%, #2b1b17 85%, #000000 100%)',
    candyShape: 'bar',
    wrapperText: 'ÁGUILA 1880',
    candyPhoto: '/candies/aguila.png',
    funFact: 'Águila fue la primera chocolatería a vapor de Buenos Aires en el siglo XIX.',
    rewardCoins: 450,
    eraTag: '🍫 TRADICIÓN DESDE 1880',
    vitrinePosition: { x: 72, y: 64 }
  },
  {
    id: 'exhibit-rocklets-1993',
    title: 'Rocklets',
    year: 1993,
    decade: 'Años 90',
    importance: 'Confites crocantes de chocolate multicolores con personajes inolvidables',
    description: 'Lanzados en 1993, los confites Rocklets conquistaron de inmediato al público joven. Con su centro de chocolate con leche macizo y su cubierta crocante de azúcar en tonos vibrantes, Rocklets se consagró con divertidos personajes animados en televisión y cine.',
    candyKey: 'rocklets',
    candyName: 'Rocklets',
    candyIcon: '🌈',
    candyColor: '#0055ff',
    candyGradient: 'radial-gradient(circle at 35% 30%, #e6f0ff 0%, #3385ff 45%, #0047b3 80%, #002266 100%)',
    candyShape: 'round',
    wrapperText: 'ROCKLETS',
    candyPhoto: '/candies/rocklets.png',
    funFact: 'El nombre Rocklets nació para evocar ritmo, alegría y el sonido crocante al morder cada confite.',
    rewardCoins: 400,
    eraTag: '🎨 COLOR Y CROCANCIA',
    vitrinePosition: { x: 84, y: 48 }
  },
  {
    id: 'exhibit-cofler-1995',
    title: 'Chocolates Cofler',
    year: 1995,
    decade: 'Años 90',
    importance: 'La felicidad no tiene horario: tabletas macizas y rellenas para todos los días',
    description: 'En 1995 nace Cofler bajo el lema "La felicidad no tiene horario". Con tabletas aireadas, rellenas de dulce de leche, almendras y maní, Cofler democratizó el chocolate macizo de alta calidad en kioscos de todo el país.',
    candyKey: 'cofler',
    candyName: 'Cofler Chocolate con Leche',
    candyIcon: '🍫',
    candyColor: '#4a2c11',
    candyGradient: 'radial-gradient(circle at 35% 30%, #b08968 0%, #6f4e37 55%, #3d2314 90%, #1a0f08 100%)',
    candyShape: 'bar',
    wrapperText: 'COFLER',
    candyPhoto: '/candies/cofler.png',
    funFact: 'La planta de Colonia Caroya donde se elabora Cofler es una de las más tecnificadas de Sudamérica.',
    rewardCoins: 450,
    eraTag: '✨ LA FELICIDAD NO TIENE HORARIO',
    vitrinePosition: { x: 92, y: 56 }
  },
  {
    id: 'exhibit-bagley-2004',
    title: 'Alianza Bagley & Galletitas',
    year: 2004,
    decade: 'Años 2000',
    importance: 'Nace el grupo de galletitas más grande de América del Sur',
    description: 'En 2004, Arcor sella una histórica alianza estratégica con Danone para unificar las operaciones de Bagley en Argentina, Brasil y Chile. Criollitas, Opera, Rumba, Chocolinas y Sonrisas pasan a integrar la gran familia Arcor.',
    candyKey: 'bagley',
    candyName: 'Familia Bagley & Arcor',
    candyIcon: '🍪',
    candyColor: '#d48800',
    candyGradient: 'radial-gradient(circle at 35% 30%, #fff4cc 0%, #ffc04d 45%, #cc7a00 80%, #663d00 100%)',
    candyShape: 'cube',
    wrapperText: 'BAGLEY 1864',
    candyPhoto: '/candies/bagley.png',
    funFact: 'Bagley es la marca de galletitas más antigua del país, fundada por Melville Sewell Bagley en 1864.',
    rewardCoins: 500,
    eraTag: '🥇 LIDERAZGO EN GALLETITAS',
    vitrinePosition: { x: 38, y: 78 }
  },
  {
    id: 'exhibit-75anos-2025',
    title: '75 Años de Historias que nos Unen',
    year: 2025,
    decade: '2020 - Hoy',
    importance: 'La cumbre histórica: desde una paila de cobre en Arroyito hasta el liderazgo mundial',
    description: 'Al cumplir 75 años (1951 - 2026), Grupo Arcor cuenta con más de 45 plantas industriales, 21.000 trabajadores y exportaciones a más de 120 países en los 5 continentes. La paila encendida por Don Fulvio en 1951 sigue brillando con el mismo compromiso: hacer un mundo más dulce para todos.',
    candyKey: 'arcor_75',
    candyName: 'Edición 75º Aniversario',
    candyIcon: '🏆',
    candyColor: '#ffd700',
    candyGradient: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #ffe680 35%, #d4af37 70%, #806600 100%)',
    candyShape: 'bonobon',
    wrapperText: '75 AÑOS ARCOR',
    candyPhoto: '/candies/arcor_75.png',
    funFact: 'El camión Ford verde de 1953 sigue funcionando perfectamente en el Museo Arcor de Arroyito.',
    rewardCoins: 1000,
    eraTag: '🌟 75 AÑOS DE HISTORIA Y FUTURO',
    vitrinePosition: { x: 62, y: 78 }
  }
];

// ---------------------------------------------------------------------------
// 2. LÍNEA TEMPORAL DE 9 DÉCADAS (EL CAMINO DORADO DEL MUSEO)
// ---------------------------------------------------------------------------
export const MUSEUM_DECADES: MuseumDecadeStation[] = [
  {
    year: 1950,
    decadeTitle: '1950: Orígenes',
    subTitle: 'Todo comenzó con un sueño',
    motto: 'Arroyito + Córdoba = ARCOR',
    historicalMilestone: 'Fundación de Arcor el 5 de julio de 1951 por Fulvio Pagani y socios.',
    description: 'En un pequeño pueblo cordobés se enciende la primera paila de cobre con una meta audaz: 5.000 kg de caramelos artesanales por día.',
    icon: '🏭',
    xPercent: 12,
    yPercent: 32,
    unlockedByDefault: true
  },
  {
    year: 1960,
    decadeTitle: '1960: Grandes Sabores',
    subTitle: 'El nacimiento de grandes sabores',
    motto: 'Autoabastecimiento e innovación',
    historicalMilestone: 'Lanzamiento de Holanda (1960) y Butter Toffees (1964). Fábricas de glucosa y envases.',
    description: 'Para garantizar calidad absoluta, Arcor comienza a fabricar su propia glucosa de maíz y cartón corrugado (Cartocor).',
    icon: '🌽',
    xPercent: 22,
    yPercent: 32,
    unlockedByDefault: true
  },
  {
    year: 1970,
    decadeTitle: '1970: Expansión',
    subTitle: 'El color de la alegría',
    motto: 'Rutas argentinas y primeras exportaciones',
    historicalMilestone: 'Red de distribución exclusiva Arcor y desembarco en Estados Unidos.',
    description: 'Los Frutales y Menta Cristal llegan a cada rincón del país gracias al sistema de distribuidores independientes.',
    icon: '🚚',
    xPercent: 33,
    yPercent: 32,
    unlockedByDefault: true
  },
  {
    year: 1980,
    decadeTitle: '1980: Nuevos Clásicos',
    subTitle: 'Un frescor que acompaña',
    motto: 'Un Bon o Bon por un beso',
    historicalMilestone: 'Lanzamiento de Mogul (1982), Bon o Bon (1984) e incorporación de Chocolates Águila (1988).',
    description: 'La década dorada que vio nacer la Semana de la Dulzura y el bombón más querido de Latinoamérica.',
    icon: '🍫',
    xPercent: 44,
    yPercent: 32,
    unlockedByDefault: true
  },
  {
    year: 1990,
    decadeTitle: '1990: Crecimiento',
    subTitle: 'Más variedad para compartir',
    motto: 'La conquista de América del Sur',
    historicalMilestone: 'Lanzamiento de Rocklets y Cofler. Construcción de plantas en Brasil, Chile y Perú.',
    description: 'Arcor se consolida como líder regional latinoamericano, llevando sus marcas a millones de hogares.',
    icon: '🌈',
    xPercent: 55,
    yPercent: 32,
    unlockedByDefault: true
  },
  {
    year: 2000,
    decadeTitle: '2000: Innovación',
    subTitle: 'Innovar también es tradición',
    motto: 'La gran alianza Bagley',
    historicalMilestone: 'Unión con Danone para liderar el mercado de galletitas (2004) y joint venture en México.',
    description: 'Se integra la legendaria Bagley, uniendo a Chocolinas, Criollitas y Rumba al universo Arcor.',
    icon: '🍪',
    xPercent: 66,
    yPercent: 32,
    unlockedByDefault: true
  },
  {
    year: 2010,
    decadeTitle: '2010: Sustentabilidad',
    subTitle: 'Cuidando el mañana',
    motto: 'Compromiso con el valor compartido',
    historicalMilestone: 'Certificaciones agrícolas, energía renovable y reducción de huella ambiental.',
    description: 'Compromiso integral con la nutrición, los productores locales y la energía limpia en cada planta.',
    icon: '🌿',
    xPercent: 77,
    yPercent: 32,
    unlockedByDefault: true
  },
  {
    year: 2020,
    decadeTitle: '2020: Presencia Global',
    subTitle: 'Un futuro más dulce',
    motto: 'Llegando a los cinco continentes',
    historicalMilestone: 'Inauguración de la megaplanta en Luanda, Angola (África) y plataforma Arcor en Casa.',
    description: 'Arcor cruza el océano Atlántico para producir localmente en África y digitaliza su distribución.',
    icon: '🌍',
    xPercent: 88,
    yPercent: 32,
    unlockedByDefault: true
  },
  {
    year: 2025,
    decadeTitle: '2025: 75 Años',
    subTitle: '75 años de historias que nos unen',
    motto: 'Celebración del 75º Aniversario',
    historicalMilestone: 'El primer productor mundial de caramelos duros celebra sus bodas de brillantes.',
    description: 'Desde Arroyito hacia el mundo: 75 años demostrando que los sueños nobles con trabajo incansable se hacen realidad.',
    icon: '🏆',
    xPercent: 96,
    yPercent: 32,
    unlockedByDefault: true
  }
];

// ---------------------------------------------------------------------------
// 3. ARCHIVO HISTÓRICO: PÁGINAS DEL LIBRO "NUESTRA HISTORIA"
// ---------------------------------------------------------------------------
export const ARCHIVE_BOOK_PAGES: ArchiveBookPage[] = [
  {
    pageNumber: 1,
    title: 'El Sueño de la Paila de Cobre',
    yearLabel: '1951 — Arroyito, Córdoba',
    subtitle: 'El nacimiento de una pasión confitera',
    imagePath: './fabrica_arroyito_1951.jpg',
    imageCaption: 'La primera fábrica de Arcor en Arroyito con su histórica chimenea, julio de 1951.',
    storyBody: [
      'El 5 de julio de 1951, Fulvio Salvador Pagani, junto a sus hermanos Renzo y Elio, y sus amigos Enrique Brizio, Modesto Maranzana y Mario Seveso, encendieron el fuego bajo la primera paila de cobre.',
      'En un modesto galpón de Arroyito, una pequeña localidad del este cordobés, nacía una visión revolucionaria: producir 5.000 kg diarios de caramelos para que la dulzura estuviera al alcance de todas las familias trabajadoras argentinas.'
    ],
    historicalQuote: 'Dar a todos caramelos de calidad a un precio justo para que la dulzura llegue a cada hogar.',
    authorQuote: 'Fulvio Salvador Pagani (1928 - 1990)'
  },
  {
    pageNumber: 2,
    title: 'El Legendario Camión Verde',
    yearLabel: '1953 — Red de Rutas Nacionales',
    subtitle: 'Llegar directo a los almacenes de ramos generales',
    imagePath: './title_bg.jpg',
    imageCaption: 'El primer camión de reparto Ford 1953, símbolo del compromiso logístico de Arcor.',
    storyBody: [
      'Para evitar depender de intermediarios que encarecían el producto o descuidaban su frescura, en 1953 Arcor adquiere su primer camión de reparto propio, un icónico Ford verde.',
      'Don Fulvio y sus colaboradores salían a recorrer las huellas de tierra santafesinas y cordobesas, entregando las latas de caramelos directamente a los almacenes de ramos generales.'
    ],
    historicalQuote: 'Llegar donde otros no llegan, con el producto recién salido de fábrica.',
    authorQuote: 'Archivo Histórico Arcor'
  },
  {
    pageNumber: 3,
    title: 'Autoabastecimiento e Integración',
    yearLabel: '1958 - 1968 — Desarrollo Industrial',
    subtitle: 'Una fábrica que produce su propia energía y papel',
    imagePath: './fabrica_arroyito_1951.jpg',
    imageCaption: 'Crecimiento de la Planta Modelo Arroyito y tendido de líneas energéticas propias.',
    storyBody: [
      'Fiel a su principio de autosuficiencia, Arcor fundó su propia fábrica de molienda de maíz para extraer glucosa y almidón en 1958, y en 1968 inauguró Cartocor para fabricar sus propios envases de cartón corrugado.',
      'Incluso construyó su propia central termoeléctrica para que el pueblo de Arroyito y la fábrica contaran con energía ininterrumpida.'
    ],
    historicalQuote: 'El desarrollo de la industria debe transformar y engrandecer a su propia comunidad.',
    authorQuote: 'Documentos Fundacionales'
  },
  {
    pageNumber: 4,
    title: 'El Fenómeno Bon o Bon',
    yearLabel: '1984 - 1989 — Revolución del Chocolate',
    subtitle: 'Un bombón que inauguró la Semana de la Dulzura',
    imagePath: './arcor_candies_spritesheet.jpg',
    imageCaption: 'Bon o Bon: la esfera perfecta de chocolate, oblea y crema de maní tostado.',
    storyBody: [
      'En 1984 se presenta Bon o Bon, un bombón esférico de oblea crocante bañado en chocolate con leche y relleno de suave crema de maní.',
      'En 1989, Arcor crea la campaña "Un Bon o Bon por un beso" en la primera semana de julio, instaurando en el calendario cultural argentino la tradicional "Semana de la Dulzura".'
    ],
    historicalQuote: 'Un Bon o Bon por un beso: la dulzura como puente entre las personas.',
    authorQuote: 'Campaña Nacional 1989'
  },
  {
    pageNumber: 5,
    title: 'La Cumbre de 75 Años',
    yearLabel: '1951 - 2026 — Liderazgo Global',
    subtitle: 'De Arroyito al corazón del mundo entero',
    imagePath: './saga_map_16_9.jpg',
    imageCaption: 'El camino de 75 años de historia de Arcor: desde la primera paila a coloso mundial.',
    storyBody: [
      'Hoy, al conmemorar 75 años de vida ininterrumpida, Grupo Arcor es el primer productor mundial de caramelos duros y el principal exportador de golosinas de Argentina, Brasil, Chile y Perú.',
      'Con presencia en más de 120 países y millones de sonrisas cosechadas a diario, el sueño que encendieron aquellos jóvenes en 1951 sigue vivo en cada bocado.'
    ],
    historicalQuote: 'Haciendo más dulce tu mundo ♡',
    authorQuote: 'Lema Institucional de Grupo Arcor'
  }
];

// ---------------------------------------------------------------------------
// 4. DIÁLOGOS DE ARCORITO COMO GUÍA DEL MUSEO
// ---------------------------------------------------------------------------
export const ARCORITO_MUSEUM_DIALOGUES = {
  welcome: [
    '¡Hola! ¡Te doy la bienvenida al Museo del Sabor! 🏛️✨ Acá vas a descubrir los 75 años de historias, aromas y recuerdos que hicieron grande a Arcor.',
    '¡Fijate en las vitrinas de cristal! Hacé clic en los caramelos para verlos girar de cerca y conocer su historia.',
    '¡Mirá el muro de 1950 a la izquierda! Ahí está la foto real de nuestra primera fábrica en Arroyito cuando todo recién empezaba.'
  ],
  photo1950: [
    '¡Mirá esa foto en blanco y negro! Es la fábrica original de 1951 en Arroyito, Córdoba. ¿Viste la chimenea de ladrillo y el logo en la pared?',
    'Don Fulvio Pagani y sus amigos pioneros empezaron con una sola paila de cobre... ¡y hoy llegamos a más de 120 países!',
    '¡El nombre ARCOR nació juntando las dos primeras letras de ARroyito y las tres de CÓRdoba!'
  ],
  candyDiscovered: [
    '¡Qué delicia! ¡Descubriste un clásico inolvidable! 🍬⭐ Sumaste este sabor a tu vitrina de coleccionista.',
    '¡Este sabor acompañó las meriendas de millones de familias argentinas! ¡Excelente hallazgo!',
    '¡Buenísimo! ¿Seguimos explorando? Todavía quedan muchas décadas y secretos por descubrir.'
  ],
  timelineClick: [
    '¡Viajamos en el tiempo! Esta década trajo grandes revoluciones en sabores, envases y exportaciones.',
    'Cada hito en este camino dorado representa un año de esfuerzo, trabajo conjunto y cariño por lo que hacemos.'
  ],
  bookOpened: [
    '¡Abriste el libro de archivo "Nuestra Historia"! Pasá las páginas para ver documentos y fotografías reales de los fundadores.',
    'Las pequeñas grandes cosas hacen grandes historias... ¡y acá están documentadas día por día!'
  ],
  allCandiesFound: [
    '¡EXTRAORDINARIO! 🏆✨ ¡Descubriste todos los caramelos emblemáticos del Museo del Sabor! Sos un auténtico Maestro Confitero de los 75 Años de Arcor.'
  ]
};
