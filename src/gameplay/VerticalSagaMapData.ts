/**
 * VerticalSagaMapData.ts
 * Definición de las 9 Zonas Históricas Temáticas y Configuración del Camino Sinuoso
 * para el mapa vertical interactivo estilo Farm Heroes Saga / Candy Crush Saga (75 Niveles).
 */

export interface SagaZoneInfo {
  id: string;
  zoneIndex: number;
  name: string;
  eraName: string;
  startLevel: number;
  endLevel: number;
  startYear: number;
  endYear: number;
  themeTitle: string;
  themeSubtitle: string;
  description: string;
  accentColor: string;
  bgGradient: string;
  bgImage?: string;
  milestone?: {
    level: number;
    year: number;
    title: string;
    subtitle: string;
    cardId: string;
  };
  sceneryElements: Array<{
    id: string;
    type: string;
    xPercent: number; // 0-100%
    yPercent: number; // 0-100% dentro de la zona
    title: string;
    icon?: string;
  }>;
}

export const SAGA_ZONES: SagaZoneInfo[] = [
  {
    id: 'zone-1',
    zoneIndex: 1,
    name: 'Arroyito 1951',
    eraName: 'El Nacimiento Artesanal',
    startLevel: 1,
    endLevel: 8,
    startYear: 1951,
    endYear: 1958,
    themeTitle: 'El Taller de Cobre & Primeros Caramelos',
    themeSubtitle: 'Arroyito, Córdoba · La Primera Paila',
    description: 'Don Fulvio Pagani y un grupo de jóvenes pioneros encienden el fuego bajo la primera paila de cobre para crear caramelos duros de miel y menta.',
    accentColor: '#f59e0b',
    bgGradient: 'linear-gradient(180deg, #1f0d04 0%, #351708 30%, #46200c 70%, #30170a 100%)',
    bgImage: '/saga_zone1_bg.jpg',
    milestone: {
      level: 1,
      year: 1951,
      title: '1951: Fundación de Arcor',
      subtitle: 'Nace el sueño en un modesto taller de Arroyito',
      cardId: 'card-fundacion-1951'
    },
    sceneryElements: [
      { id: 'chimenea-arroyito', type: 'brick-chimney', xPercent: 26, yPercent: 32, title: 'Chimenea Histórica de Arroyito', icon: '🏭' },
      { id: 'rio-xanaes', type: 'river-stream', xPercent: 52, yPercent: 58, title: 'Río Xanaes (Segundo)', icon: '🌊' }
    ]
  },
  {
    id: 'zone-2',
    zoneIndex: 2,
    name: 'Década de 1960',
    eraName: 'Integración Agrícola',
    startLevel: 9,
    endLevel: 16,
    startYear: 1959,
    endYear: 1968,
    themeTitle: 'Cañaverales, Azúcar & Glucosa Propia',
    themeSubtitle: 'Tucumán y Lules · Autoabastecimiento',
    description: 'Arcor cultiva su propia caña de azúcar y monta su primera planta de molienda y glucosa para garantizar materias primas puras.',
    accentColor: '#84cc16',
    bgGradient: 'linear-gradient(180deg, #30170a 0%, #223412 35%, #1b3814 70%, #273010 100%)',
    bgImage: '/saga_zone2_bg.jpg',
    milestone: {
      level: 10,
      year: 1960,
      title: '1960: Primera Fábrica de Glucosa',
      subtitle: 'Independencia productiva e integración agroindustrial',
      cardId: 'card-primer-galpon'
    },
    sceneryElements: [
      { id: 'canaveral-tucuman', type: 'sugarcane-field', xPercent: 16, yPercent: 20, title: 'Cañaveral de Azúcar Lules', icon: '🌾' },
      { id: 'molino-glucosa', type: 'glucose-mill', xPercent: 80, yPercent: 44, title: 'Planta de Molienda de Maíz', icon: '🌽' },
      { id: 'vias-ferrocarril', type: 'train-railway', xPercent: 22, yPercent: 68, title: 'Vías del Tren de Azúcar', icon: '🚂' },
      { id: 'cristal-candies', type: 'sugar-crystals', xPercent: 78, yPercent: 88, title: 'Caramelos Cristalinos', icon: '🍬' }
    ]
  },
  {
    id: 'zone-3',
    zoneIndex: 3,
    name: 'Década de 1970',
    eraName: 'La Era del Chocolate',
    startLevel: 17,
    endLevel: 25,
    startYear: 1969,
    endYear: 1978,
    themeTitle: 'Nacimiento de Chocolates & Colonia Caroya',
    themeSubtitle: 'Córdoba · Puro Chocolate con Leche',
    description: 'Apertura de la emblemática planta de chocolates en Colonia Caroya: nacen las tabletas Cofler, turrones y las primeras coberturas finas.',
    accentColor: '#d97706',
    bgGradient: 'linear-gradient(180deg, #273010 0%, #30180d 35%, #421c0b 70%, #33150d 100%)',
    bgImage: '/saga_zone3_bg.jpg',
    milestone: {
      level: 18,
      year: 1970,
      title: '1970: Planta Colonia Caroya',
      subtitle: 'Comienza la gran historia del chocolate Arcor',
      cardId: 'card-planta-caroya'
    },
    sceneryElements: [
      { id: 'planta-caroya-facade', type: 'caroya-castle', xPercent: 80, yPercent: 16, title: 'Planta Colonia Caroya', icon: '🍫' },
      { id: 'cascada-chocolate', type: 'chocolate-waterfall', xPercent: 20, yPercent: 42, title: 'Cascada de Cacao Templado', icon: '🍯' },
      { id: 'bloque-cofler', type: 'cofler-slab', xPercent: 82, yPercent: 66, title: 'Tabletas Cofler de Puro Chocolate', icon: '🍫' },
      { id: 'cacao-beans', type: 'cacao-pods', xPercent: 14, yPercent: 82, title: 'Granos de Cacao Seleccionados', icon: '🌰' }
    ]
  },
  {
    id: 'zone-4',
    zoneIndex: 4,
    name: 'Década de 1980',
    eraName: 'El Fenómeno Bon o Bon',
    startLevel: 26,
    endLevel: 34,
    startYear: 1979,
    endYear: 1988,
    themeTitle: 'Bon o Bon & Semana de la Dulzura',
    themeSubtitle: '1984 · Un bombón al alcance de todos',
    description: 'En 1984 nace Bon o Bon: oblea crocante, pasta de maní y chocolate. En 1989 nace la tradicional Semana de la Dulzura ("Un Bon o Bon por un beso").',
    accentColor: '#f43f5e',
    bgGradient: 'linear-gradient(180deg, #33150d 0%, #4c1122 35%, #59162c 70%, #3b0f22 100%)',
    bgImage: '/saga_zone4_bg.jpg',
    milestone: {
      level: 28,
      year: 1980,
      title: '1980: El Nacimiento de Bon o Bon',
      subtitle: 'Un hito que conquistó a la Argentina y al mundo',
      cardId: 'card-bonobon-1984'
    },
    sceneryElements: [
      { id: 'bonobon-pedestal', type: 'giant-bonobon', xPercent: 16, yPercent: 22, title: 'Monumento al Bon o Bon', icon: '✨' },
      { id: 'globo-beso', type: 'sweet-kiss-balloon', xPercent: 78, yPercent: 44, title: 'Globo "Por un Beso"', icon: '🎈' },
      { id: 'corazones-dulzura', type: 'sweetness-hearts', xPercent: 20, yPercent: 68, title: 'Semana de la Dulzura', icon: '💖' },
      { id: 'export-latam', type: 'latam-airplane', xPercent: 78, yPercent: 88, title: 'Cruzando Fronteras en Latinoamérica', icon: '✈️' }
    ]
  },
  {
    id: 'zone-5',
    zoneIndex: 5,
    name: 'Década de 1990',
    eraName: 'Universo Galletitas & Golosinas',
    startLevel: 35,
    endLevel: 43,
    startYear: 1989,
    endYear: 1998,
    themeTitle: 'Bagley, Galletitas Doradas, Mogul & Rocklets',
    themeSubtitle: 'Alianza Histórica y Explosión de Color',
    description: 'Arcor se asocia con Danone para potenciar Bagley (Criollitas, Opera, Rumba, Chocolinas) e introduce las famosas gomitas Mogul y confites Rocklets.',
    accentColor: '#8b5cf6',
    bgGradient: 'linear-gradient(180deg, #3b0f22 0%, #281442 35%, #1e1550 70%, #171c4c 100%)',
    bgImage: '/saga_zone5_bg.jpg',
    milestone: {
      level: 37,
      year: 1990,
      title: '1990: Alianza Bagley, Mogul & Rocklets',
      subtitle: 'Líderes indiscutidos en galletitas y golosinas coloridas',
      cardId: 'card-alianza-bagley-2004'
    },
    sceneryElements: [
      { id: 'castillo-bagley', type: 'bagley-clocktower', xPercent: 82, yPercent: 18, title: 'Molinos y Planta Bagley', icon: '🍪' },
      { id: 'bosque-mogul', type: 'mogul-bears-forest', xPercent: 16, yPercent: 42, title: 'Bosque de Ositos Mogul', icon: '🐻' },
      { id: 'arcoiris-rocklets', type: 'rocklets-rainbow', xPercent: 84, yPercent: 66, title: 'Arcoíris de Confites Rocklets', icon: '🌈' },
      { id: 'galletitas-rumba', type: 'chocolinas-tower', xPercent: 20, yPercent: 88, title: 'Chocolinas y Galletitas Rumba', icon: '🥨' }
    ]
  },
  {
    id: 'zone-6',
    zoneIndex: 6,
    name: 'Década de 2000',
    eraName: 'Alimentos & La Campagnola',
    startLevel: 44,
    endLevel: 52,
    startYear: 1999,
    endYear: 2008,
    themeTitle: 'Tomates, Mermeladas, Conservas & Lácteos',
    themeSubtitle: 'Mendoza & San Jerónimo · La Mesa Familiar',
    description: 'Incorporación de La Campagnola, liderazgo en conservas de tomates, mermeladas puras, tambos lecheros y alimentos nutritivos para todos.',
    accentColor: '#ea580c',
    bgGradient: 'linear-gradient(180deg, #171c4c 0%, #331f12 35%, #46260f 70%, #2b1f13 100%)',
    bgImage: '/saga_zone6_bg.jpg',
    milestone: {
      level: 46,
      year: 2000,
      title: '2000: La Campagnola & Alimentos',
      subtitle: 'La dulzura y nutrición llegan a cada comida familiar',
      cardId: 'card-alianza-bagley-2004'
    },
    sceneryElements: [
      { id: 'huerta-tomates', type: 'campagnola-orchard', xPercent: 18, yPercent: 20, title: 'Huertas de Tomate Mendocino', icon: '🍅' },
      { id: 'mermeladas-fruta', type: 'fruit-jams', xPercent: 82, yPercent: 42, title: 'Mermeladas Artesanales de Fruta', icon: '🍓' },
      { id: 'tambo-lechero', type: 'dairy-farm', xPercent: 18, yPercent: 66, title: 'Tambo San Jerónimo y Leche Fresca', icon: '🥛' },
      { id: 'conservas-pescado', type: 'canned-goods', xPercent: 80, yPercent: 88, title: 'Conservas de Atún y Vegetales', icon: '🥫' }
    ]
  },
  {
    id: 'zone-7',
    zoneIndex: 7,
    name: 'Década de 2010',
    eraName: 'Helados & Biotecnología',
    startLevel: 53,
    endLevel: 60,
    startYear: 2009,
    endYear: 2018,
    themeTitle: 'Heladería, Enzimas & Alimentos Saludables',
    themeSubtitle: 'Nutrición Equilibrada & Sin TACC',
    description: 'Lanzamiento de los Helados Arcor, producción de enzimas naturales en Arroyito y un fuerte compromiso con alimentos libres de gluten (Sin TACC).',
    accentColor: '#06b6d4',
    bgGradient: 'linear-gradient(180deg, #2b1f13 0%, #0d2f36 35%, #0b3d39 70%, #092c2e 100%)',
    bgImage: '/saga_zone7_bg.jpg',
    milestone: {
      level: 55,
      year: 2010,
      title: '2010: Helados & Innovación Saludable',
      subtitle: 'Lanzamiento de Helados y liderazgo en alimentos Sin TACC',
      cardId: 'card-sostenibilidad-2020'
    },
    sceneryElements: [
      { id: 'glaciar-helados', type: 'ice-cream-peak', xPercent: 82, yPercent: 20, title: 'Monte de Helados Bon o Bon & Cofler', icon: '🍦' },
      { id: 'laboratorio-enzimas', type: 'biotech-lab', xPercent: 18, yPercent: 45, title: 'Complejo de Enzimas y Biotecnología', icon: '🧪' },
      { id: 'sintacc-wheat', type: 'gluten-free-badge', xPercent: 80, yPercent: 68, title: 'Línea de Alimentos Sin TACC', icon: '🌾' },
      { id: 'paletas-frutales', type: 'fruit-popsicles', xPercent: 20, yPercent: 90, title: 'Paletas de Helado Frutales', icon: '🍧' }
    ]
  },
  {
    id: 'zone-8',
    zoneIndex: 8,
    name: 'Década de 2020',
    eraName: 'Sustentabilidad & Mundo',
    startLevel: 61,
    endLevel: 70,
    startYear: 2019,
    endYear: 2024,
    themeTitle: 'Energía Renovable, Cuidado Personal & Globalización',
    themeSubtitle: 'Más de 120 países · Compromiso Verde',
    description: 'Parques eólicos y biomasa abastecen las fábricas; empaques 100% reciclables; exportaciones récord a los 5 continentes.',
    accentColor: '#10b981',
    bgGradient: 'linear-gradient(180deg, #092c2e 0%, #08283d 35%, #092338 70%, #101c2e 100%)',
    bgImage: '/saga_zone8_bg.jpg',
    milestone: {
      level: 63,
      year: 2020,
      title: '2020: Compromiso 100% Renovable',
      subtitle: 'Energía limpia, empaques sustentables y presencia global',
      cardId: 'card-sostenibilidad-2020'
    },
    sceneryElements: [
      { id: 'parque-eolico', type: 'wind-turbines', xPercent: 18, yPercent: 18, title: 'Parque de Energía Eólica Limpia', icon: '🌬️' },
      { id: 'globo-mundial', type: 'global-globe', xPercent: 82, yPercent: 42, title: 'Presente en más de 120 Países', icon: '🌍' },
      { id: 'packaging-reciclable', type: 'eco-packaging', xPercent: 18, yPercent: 66, title: 'Envases 100% Reciclables y Biodegradables', icon: '♻️' },
      { id: 'cuidado-personal', type: 'hygiene-line', xPercent: 80, yPercent: 88, title: 'Línea de Cuidado Personal y Familiar', icon: '🧴' }
    ]
  },
  {
    id: 'zone-9',
    zoneIndex: 9,
    name: '¡Celebración 75 Años!',
    eraName: 'El Legado Eterno (1951 — 2026)',
    startLevel: 71,
    endLevel: 75,
    startYear: 2025,
    endYear: 2026,
    themeTitle: '75 Años de Arcor: Haciendo un Mundo más Dulce',
    themeSubtitle: 'Podio Dorado de Honor · ¡Cumbre de la Saga!',
    description: '¡Festejo final! Gran escenario de gala, trofeo dorado conmemorativo, lluvia de confeti y el agradecimiento a todas las familias que hicieron grande este sueño.',
    accentColor: '#ffd700',
    bgGradient: 'linear-gradient(180deg, #101c2e 0%, #261405 30%, #462200 65%, #241103 100%)',
    bgImage: '/saga_zone9_bg.jpg',
    milestone: {
      level: 75,
      year: 2026,
      title: '75 AÑOS DE HISTORIA ARCOR',
      subtitle: '¡Gracias por compartir 75 años de magia y dulzura!',
      cardId: 'card-arcor-hoy'
    },
    sceneryElements: [
      { id: 'gran-trofeo-75', type: 'golden-trophy-stage', xPercent: 50, yPercent: 28, title: 'Trofeo Dorado de los 75 Años', icon: '🏆' },
      { id: 'arco-triunfal', type: 'triumphal-arch', xPercent: 20, yPercent: 55, title: 'Arco de Honor Arcor', icon: '👑' },
      { id: 'fuegos-artificiales', type: 'confetti-fireworks', xPercent: 80, yPercent: 55, title: 'Fuegos Artificiales Estelares', icon: '🎆' },
      { id: 'podio-arcorito', type: 'podium-mascot', xPercent: 50, yPercent: 85, title: 'Arcorito Chef de Gala', icon: '⭐' }
    ]
  }
];

export interface SagaMilestoneInfo {
  level: number;
  year: number;
  title: string;
  subtitle: string;
  icon: string;
  cardId: string;
}

/**
 * Hitos históricos rigurosamente alineados con el nivel correspondiente en la saga
 */
export const SAGA_HISTORICAL_MILESTONES: SagaMilestoneInfo[] = [
  {
    level: 1,
    year: 1951,
    title: 'Fundación & Primera Paila',
    subtitle: 'Nace Arcor en Arroyito, Córdoba',
    icon: '🔥',
    cardId: 'card-fundacion-1951'
  },
  {
    level: 3,
    year: 1953,
    title: 'Primer Camión Ford Verde',
    subtitle: 'Distribución directa y sin intermediarios',
    icon: '🚚',
    cardId: 'card-distribucion-1953'
  },
  {
    level: 8,
    year: 1958,
    title: 'Primera Molienda de Maíz',
    subtitle: 'Integración vertical y glucosa pura',
    icon: '🌽',
    cardId: 'card-molienda-1958'
  },
  {
    level: 10,
    year: 1960,
    title: 'Fábrica de Glucosa Lules',
    subtitle: 'Autoabastecimiento en Tucumán',
    icon: '🏭',
    cardId: 'card-primer-galpon'
  },
  {
    level: 14,
    year: 1964,
    title: 'Primeras Exportaciones',
    subtitle: 'Salto al comercio exterior',
    icon: '🌐',
    cardId: 'card-export-1964'
  },
  {
    level: 18,
    year: 1968,
    title: 'Llegada a Mercado de EE.UU.',
    subtitle: 'Consolidación internacional',
    icon: '🗽',
    cardId: 'card-usa-1968'
  },
  {
    level: 20,
    year: 1970,
    title: 'Planta Colonia Caroya',
    subtitle: 'Nacen los chocolates Arcor y Cofler',
    icon: '🍫',
    cardId: 'card-planta-caroya'
  },
  {
    level: 24,
    year: 1974,
    title: 'Inauguración Misky S.A.',
    subtitle: 'Gran complejo de confitería en Tucumán',
    icon: '🍬',
    cardId: 'card-misky-1974'
  },
  {
    level: 30,
    year: 1980,
    title: 'Cartocor & Expansión Brasil',
    subtitle: 'Envases propios y fábrica en Brasil',
    icon: '📦',
    cardId: 'card-cartocor-1980'
  },
  {
    level: 33,
    year: 1983,
    title: 'Lanzamiento de Mogul',
    subtitle: 'Las primeras gomitas de fruta',
    icon: '🐻',
    cardId: 'card-mogul-1983'
  },
  {
    level: 34,
    year: 1984,
    title: 'Nace Bon o Bon',
    subtitle: 'El bombón insignia al mundo',
    icon: '✨',
    cardId: 'card-bonobon-1984'
  },
  {
    level: 35,
    year: 1985,
    title: 'Lanzamiento Butter Toffees',
    subtitle: 'Caramelos y toffees de leche',
    icon: '🧈',
    cardId: 'card-toffee-1985'
  },
  {
    level: 39,
    year: 1989,
    title: 'Semana de la Dulzura',
    subtitle: '"Una golosina por un beso" & Chile',
    icon: '💖',
    cardId: 'card-semana-dulzura'
  },
  {
    level: 41,
    year: 1991,
    title: 'Creación Fundación Arcor',
    subtitle: 'Compromiso social con la niñez',
    icon: '🤝',
    cardId: 'card-fundacion-social'
  },
  {
    level: 43,
    year: 1993,
    title: 'Luis Pagani & Águila',
    subtitle: 'Presidencia de Luis Pagani y Águila',
    icon: '🦅',
    cardId: 'card-aguila-1993'
  },
  {
    level: 46,
    year: 1996,
    title: 'Lanzamiento de Rocklets',
    subtitle: 'Confites de chocolate crocantes',
    icon: '🌈',
    cardId: 'card-rocklets-1996'
  },
  {
    level: 48,
    year: 1998,
    title: 'Adquisición Dos en Uno',
    subtitle: 'Liderazgo en golosinas en Chile',
    icon: '🇨🇱',
    cardId: 'card-dosenuno-1998'
  },
  {
    level: 51,
    year: 2001,
    title: 'Cincuentenario (50 Años)',
    subtitle: 'Medio siglo de historia y magia',
    icon: '🏆',
    cardId: 'card-cincuentenario'
  },
  {
    level: 54,
    year: 2004,
    title: 'Bagley Latinoamérica',
    subtitle: 'Criollitas, Chocolinas, Opera, Rumba',
    icon: '🍪',
    cardId: 'card-alianza-bagley-2004'
  },
  {
    level: 55,
    year: 2005,
    title: 'La Campagnola & Helados',
    subtitle: 'Mermeladas, conservas y heladería',
    icon: '🍅',
    cardId: 'card-campagnola-2005'
  },
  {
    level: 60,
    year: 2010,
    title: 'Sustentabilidad & Sin TACC',
    subtitle: 'Compromiso verde y alimentos seguros',
    icon: '🌿',
    cardId: 'card-sintacc-2010'
  },
  {
    level: 65,
    year: 2015,
    title: 'Alianza La Serenísima',
    subtitle: 'Inversión en Mastellone Hermanos',
    icon: '🥛',
    cardId: 'card-mastellone-2015'
  },
  {
    level: 67,
    year: 2017,
    title: 'Adquisición Zucamor',
    subtitle: 'Liderazgo en papel y envases',
    icon: '📦',
    cardId: 'card-zucamor-2017'
  },
  {
    level: 68,
    year: 2018,
    title: 'Alianza Laboratorios Bagó',
    subtitle: 'Línea Simple de nutrición avanzada',
    icon: '💊',
    cardId: 'card-bago-2018'
  },
  {
    level: 70,
    year: 2020,
    title: 'Energía 100% Renovable',
    subtitle: 'Parques eólicos y cuidado del planeta',
    icon: '🌬️',
    cardId: 'card-sostenibilidad-2020'
  },
  {
    level: 71,
    year: 2021,
    title: '70° Aniversario Arcor',
    subtitle: 'Siete décadas de dulzura mundial',
    icon: '⭐',
    cardId: 'card-70aniversario'
  },
  {
    level: 72,
    year: 2022,
    title: 'Planta en Luanda, Angola',
    subtitle: 'Primera fábrica industrial en África',
    icon: '🌍',
    cardId: 'card-angola-2022'
  },
  {
    level: 75,
    year: 2026,
    title: '¡75 AÑOS DE DULZURA ARCOR!',
    subtitle: '1951 — 2026 · Gracias por hacer este sueño realidad',
    icon: '🏆',
    cardId: 'card-arcor-hoy'
  }
];

export interface LevelPathPoint {
  levelNumber: number;
  year: number;
  zoneIndex: number;
  xPercent: number; // 18% a 82%
  yPx: number; // Posición vertical en píxeles absolutos
  isSpecialMilestone: boolean;
  milestoneTitle?: string;
}

/**
 * Genera las coordenadas exactas de los 75 niveles a lo largo del sendero sinuoso vertical
 */
export function generateVerticalSagaLevels(): LevelPathPoint[] {
  const points: LevelPathPoint[] = [];
  const TOTAL_LEVELS = 75;
  const START_Y = 175; // Espacio inicial superior en píxeles (cómodo y sin superposiciones con la placa de zona)
  const STEP_Y = 104;  // Separación vertical equilibrada y espaciosa entre niveles

  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    const t = (i - 1) / (TOTAL_LEVELS - 1);
    const yPx = START_Y + (i - 1) * STEP_Y;

    // Curva sinuosa armónica estilo casual game:
    // Clampeada entre 25% y 75% para garantizar margen generoso respecto a los bordes
    const primaryWave = Math.sin((i - 1) * 0.44) * 23;
    const secondaryWave = Math.cos((i - 1) * 0.22) * 4;
    const xPercent = Math.max(25, Math.min(75, 50 + primaryWave + secondaryWave));

    // Determinar zona correspondiente
    let zoneIndex = 1;
    for (const z of SAGA_ZONES) {
      if (i >= z.startLevel && i <= z.endLevel) {
        zoneIndex = z.zoneIndex;
        break;
      }
    }

    const milestoneInfo = SAGA_HISTORICAL_MILESTONES.find(m => m.level === i);
    const isSpecial = !!milestoneInfo;
    const year = milestoneInfo ? milestoneInfo.year : (1951 + Math.floor(t * 74));

    points.push({
      levelNumber: i,
      year,
      zoneIndex,
      xPercent,
      yPx,
      isSpecialMilestone: isSpecial,
      milestoneTitle: milestoneInfo ? milestoneInfo.title : undefined
    });
  }

  return points;
}

/**
 * Genera el string SVG path continuo 'd' conectando todos los 75 puntos con curvas Bezier suaves
 */
export function generateGoldenPathSvgD(points: LevelPathPoint[], canvasWidth: number): string {
  if (points.length < 2) return '';

  let d = '';

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const px = (pt.xPercent / 100) * canvasWidth;
    const py = pt.yPx;

    if (i === 0) {
      d += `M ${px.toFixed(1)} ${py.toFixed(1)}`;
    } else {
      const prevPt = points[i - 1];
      const prevX = (prevPt.xPercent / 100) * canvasWidth;
      const prevY = prevPt.yPx;

      const midY = (prevY + py) / 2;
      // Curva Bezier cúbica con puntos de control verticales
      d += ` C ${prevX.toFixed(1)} ${midY.toFixed(1)}, ${px.toFixed(1)} ${midY.toFixed(1)}, ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
  }

  if (points.length > 0) {
    const lastPt = points[points.length - 1];
    const lastX = (lastPt.xPercent / 100) * canvasWidth;
    d += ` L ${lastX.toFixed(1)} ${(lastPt.yPx + 70).toFixed(1)}`;
  }

  return d;
}
