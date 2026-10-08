/**
 * ESQUEMA DE DATOS HISTÓRICOS OFICIALES - GRUPO ARCOR (1924 - 2015+)
 * Basado estrictamente en los hitos reales y documentados del Grupo Arcor.
 */

export interface HistoricalEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  imagePlaceholder?: string;
  historicalCard: {
    quoteOrFact: string;
    unlockedLore: string;
  };
  quest: {
    objective: string;
    targetResource: string;
    targetAmount: number;
    rewardCoins: number;
    rewardReputation: number;
  };
  unlocks: {
    buildings?: string[];
    products?: string[];
    regions?: string[];
  };
  isDecisionEvent?: boolean; // Para eventos con bifurcación moral/comercial (e.g. Incidente de 1968)
}

export interface EraDefinition {
  eraId: number;
  eraName: string;
  startYear: number;
  endYear: number;
  ambientTheme: string; // Colores de época, niebla, estilo visual 3D
  events: HistoricalEvent[];
}

export const ERAS_DEFINITION: EraDefinition[] = [
  {
    eraId: 0,
    eraName: 'Prólogo: Los Orígenes en Arroyito',
    startYear: 1924,
    endYear: 1950,
    ambientTheme: 'sepia_vintage',
    events: [
      {
        id: 'event-1924-amos-pagani',
        year: 1924,
        title: 'La Llegada de Amos Pagani',
        description: 'Amos Pagani emigra desde Italia e instala su primera panadería artesanal en el pueblo de Arroyito, Córdoba.',
        imagePlaceholder: '🥖',
        historicalCard: {
          quoteOrFact: 'El espíritu de trabajo artesanal y dedicación de la familia Pagani sentó las bases de la cultura industrial de Arroyito.',
          unlockedLore: 'En 1928 nace en Arroyito su hijo, Fulvio Salvador Pagani, quien desde niño creció entre hornos de pan, sacos de harina y carameleras.'
        },
        quest: {
          objective: 'Honrar la tradición familiar amasando las primeras provisiones de trigo y azúcar.',
          targetResource: 'harina',
          targetAmount: 20,
          rewardCoins: 50,
          rewardReputation: 5
        },
        unlocks: {
          buildings: ['Panadería Familiar'],
          products: ['Pan Criollo'],
          regions: ['Pueblo de Arroyito']
        }
      }
    ]
  },
  {
    eraId: 1,
    eraName: 'Nivel 1: Fundación y el Sueño de Arroyito',
    startYear: 1951,
    endYear: 1957,
    ambientTheme: 'warm_golden_hour',
    events: [
      {
        id: 'event-1951-fundacion',
        year: 1951,
        title: '5 de Julio: Nacimiento de ARCOR',
        description: 'Fulvio, Renzo y Elio Pagani junto a Modesto, Pablo y Vicente Maranzana, Mario Seveso y Enrique Brizio fundan la fábrica con el lema: "Dar a todos caramelos de calidad accesible".',
        imagePlaceholder: '🏭',
        historicalCard: {
          quoteOrFact: 'ARCOR nace de unir las primeras letras de ARroyito y CÓRdoba.',
          unlockedLore: 'Comenzaron en un modesto galpón con una capacidad inicial de 5.000 kg diarios de caramelos cristalinos, cargando ellos mismos el azúcar en las pailas de bronce.'
        },
        quest: {
          objective: 'Comprar 10 sacos de azúcar y elaborar el primer lote de 50 caramelos cristalinos en la paila de cobre.',
          targetResource: 'caramelos',
          targetAmount: 50,
          rewardCoins: 150,
          rewardReputation: 15
        },
        unlocks: {
          buildings: ['Primer Galpón de 1951', 'Paila de Cobre'],
          products: ['Caramelo Cristalino'],
          regions: ['San Justo, Córdoba']
        }
      },
      {
        id: 'event-1953-capacidad-inicial',
        year: 1953,
        title: 'Consolidación de los 5.000 kg Diarios',
        description: 'El camión de reparto recorre los almacenes de Córdoba llevando los primeros caramelos duros de menta y miel.',
        imagePlaceholder: '🚚',
        historicalCard: {
          quoteOrFact: 'La consigna de Don Fulvio era clara: "Si producimos en volumen, bajamos los costos y democratizamos la golosina".',
          unlockedLore: 'Pronto la demanda de los almacenes de ramos generales superó la producción inicial, exigiendo sumar más pailas mecánicas y maestros confiteros.'
        },
        quest: {
          objective: 'Alcanzar una reserva de 100 caramelos cristalinos y abastecer los comercios cordobeses.',
          targetResource: 'caramelos',
          targetAmount: 100,
          rewardCoins: 250,
          rewardReputation: 25
        },
        unlocks: {
          buildings: ['Muelle de Carga Ampliado'],
          products: ['Caramelo de Miel y Eucalipto'],
          regions: ['Córdoba Capital']
        }
      }
    ]
  },
  {
    eraId: 2,
    eraName: 'Nivel 2: Integración Vertical y Primeras Exportaciones',
    startYear: 1958,
    endYear: 1969,
    ambientTheme: 'industrial_copper',
    events: [
      {
        id: 'event-1958-integracion-vertical',
        year: 1958,
        title: '60.000 kg Diarios e Integración Vertical',
        description: 'La fábrica alcanza los 60.000 kg diarios. Ante la falta de insumos, Arcor decide fabricar su propia glucosa de maíz, papel y energía.',
        imagePlaceholder: '🌽',
        historicalCard: {
          quoteOrFact: 'Para no frenar las máquinas, Arcor integró toda la cadena productiva: del grano de maíz al caramelo envuelto.',
          unlockedLore: 'La molienda propia de maíz garantizó almidones y jarabe de glucosa continuo al costo más competitivo de América del Sur.'
        },
        quest: {
          objective: 'Montar la molienda húmeda de maíz y producir 200 caramelos integrados.',
          targetResource: 'caramelos',
          targetAmount: 200,
          rewardCoins: 500,
          rewardReputation: 40
        },
        unlocks: {
          buildings: ['Molienda Húmeda de Maíz', 'Generador Eléctrico Propio'],
          products: ['Jarabe de Glucosa', 'Caramelo Relleno'],
          regions: ['Región Centro Argentina']
        }
      },
      {
        id: 'event-1964-exportacion-europa',
        year: 1964,
        title: 'Primeras Ventas a Europa',
        description: 'Arcor concreta sus primeras ventas transatlánticas exportando subproductos derivados de la glucosa hacia el viejo continente.',
        imagePlaceholder: '🚢',
        historicalCard: {
          quoteOrFact: 'Los estándares de calidad de Arroyito alcanzaron las exigentes normas europeas de pureza alimenticia.',
          unlockedLore: 'Fue el primer hito de exportación intercontinental de la empresa, abriendo las rutas marítimas desde el puerto de Rosario y Buenos Aires.'
        },
        quest: {
          objective: 'Procesar un lote especial de 300 unidades para los primeros pedidos europeos.',
          targetResource: 'caramelos',
          targetAmount: 300,
          rewardCoins: 750,
          rewardReputation: 60
        },
        unlocks: {
          buildings: ['Oficina de Comercio Exterior'],
          products: ['Glucosa Grado Farmacéutico'],
          regions: ['Europa (Rotterdam / Génova)']
        }
      },
      {
        id: 'event-1967-distribuidores-oficiales',
        year: 1967,
        title: 'Red de Distribuidores Oficiales',
        description: 'Se formaliza la red de distribución capilar exclusiva impulsada por viajantes mayoristas, cubriendo cada rincón del país.',
        imagePlaceholder: '🗺️',
        historicalCard: {
          quoteOrFact: 'La fuerza de Arcor residió en llegar donde nadie más llegaba: cada quiosco, almacén y pulpería del país.',
          unlockedLore: 'Los viajantes de comercio de Arcor se convirtieron en socios estratégicos, garantizando entrega en menos de 48 horas.'
        },
        quest: {
          objective: 'Despachar 400 caramelos a la nueva red de distribuidores mayoristas.',
          targetResource: 'caramelos',
          targetAmount: 400,
          rewardCoins: 900,
          rewardReputation: 75
        },
        unlocks: {
          buildings: ['Centro de Logística Capilar'],
          products: ['Caramelos en Bolsón Familiar'],
          regions: ['Red Nacional Argentina']
        }
      },
      {
        id: 'event-1968-incidente-ecuador',
        year: 1968,
        title: '1968: El Incidente del Ecuador (EE.UU.)',
        description: 'Un contenedor con destino a EE.UU. sufre calor extremo en el paso por la línea del Ecuador y los caramelos de leche se derriten.',
        imagePlaceholder: '☀️',
        historicalCard: {
          quoteOrFact: 'Don Fulvio asumió el 100% del costo del cargamento derretido. La palabra y la confianza valían más que cualquier contrato.',
          unlockedLore: 'Al ver que Arcor respondía sin dudar y pagaba la factura de reposición, el comprador estadounidense cerró un contrato exclusivo de largo plazo, abriendo las puertas definitivas de Norteamérica.'
        },
        quest: {
          objective: 'Tomar la decisión corporativa frente al reclamo del cliente norteamericano y reponer el lote.',
          targetResource: 'caramelos',
          targetAmount: 150,
          rewardCoins: 1200,
          rewardReputation: 100
        },
        unlocks: {
          buildings: ['Terminal Marítima de Exportación'],
          products: ['Caramelos de Leche Cremosos'],
          regions: ['Estados Unidos (Nueva York / Miami)']
        },
        isDecisionEvent: true
      },
      {
        id: 'event-1970-feria-ism-colonia',
        year: 1970,
        title: 'Stand en la Feria ISM de Colonia (Alemania)',
        description: 'Arcor participa por primera vez con stand propio en la feria de golosinas más importante del mundo y desembarca con fuerza en Buenos Aires.',
        imagePlaceholder: '🎪',
        historicalCard: {
          quoteOrFact: 'En Colonia, Alemania, la bandera argentina ondeó entre las multinacionales dulceras más tradicionales de Europa.',
          unlockedLore: 'Con los contactos cosechados en la ISM, Arcor comenzó a tejer alianzas de exportación hacia Medio Oriente y el norte de África.'
        },
        quest: {
          objective: 'Preparar 500 caramelos de exhibición para la feria internacional de Colonia.',
          targetResource: 'caramelos',
          targetAmount: 500,
          rewardCoins: 1500,
          rewardReputation: 120
        },
        unlocks: {
          buildings: ['Pabellón de Exposiciones'],
          products: ['Caramelo Cristal ISM Edition'],
          regions: ['Alemania (Feria ISM)']
        }
      }
    ]
  },
  {
    eraId: 3,
    eraName: 'Nivel 3: Complejo Industrial, Cartocor y Cono Sur',
    startYear: 1970,
    endYear: 1989,
    ambientTheme: 'golden_confectionery',
    events: [
      {
        id: 'event-1970-1975-expansion-plantas',
        year: 1972,
        title: 'Complejo Industrial Federal',
        description: 'Apertura de plantas estratégicas en Tucumán (1970), San Rafael Mendoza (1972), Villa del Totoral Córdoba (1975 y 1979) y San Pedro (1975).',
        imagePlaceholder: '🏗️',
        historicalCard: {
          quoteOrFact: 'Arcor instaló sus fábricas cerca de los productores de caña en el norte y de frutales en cuyo para industrializar en origen.',
          unlockedLore: 'La planta de San Rafael permitió elaborar pulpas y mermeladas de durazno, ciruela y membrillo con fruta recién cosechada.'
        },
        quest: {
          objective: 'Coordinar la producción de 600 unidades integrando las plantas regionales.',
          targetResource: 'caramelos',
          targetAmount: 600,
          rewardCoins: 2000,
          rewardReputation: 150
        },
        unlocks: {
          buildings: ['Planta San Rafael', 'Planta Villa del Totoral'],
          products: ['Mermeladas y Dulces de Fruta'],
          regions: ['Cuyo y Noroeste Argentino']
        }
      },
      {
        id: 'event-1976-cono-sur',
        year: 1976,
        title: 'Radicación en el Cono Sur',
        description: 'Comienza la expansión regional con presencia industrial directa en Paraguay (1976), Uruguay (1979), Brasil (1981) y Chile (1989).',
        imagePlaceholder: '🌎',
        historicalCard: {
          quoteOrFact: 'Arcor dejó de ser solo una empresa argentina para convertirse en la fábrica de golosinas de todo el Cono Sur.',
          unlockedLore: 'Las filiales en Asunción, Montevideo y San Pablo adaptaron los sabores a los paladares de cada país sin perder la esencia cordobesa.'
        },
        quest: {
          objective: 'Despachar 800 unidades hacia las filiales de Paraguay y Uruguay.',
          targetResource: 'caramelos',
          targetAmount: 800,
          rewardCoins: 2500,
          rewardReputation: 180
        },
        unlocks: {
          buildings: ['Filial San Pablo (Brasil)', 'Filial Santiago (Chile)'],
          products: ['Dulce de Guayaba y Chupetines'],
          regions: ['Paraguay', 'Uruguay', 'Brasil', 'Chile']
        }
      },
      {
        id: 'event-1980-cartocor',
        year: 1980,
        title: 'Nacimiento de Cartocor (Paraná, Entre Ríos)',
        description: 'Se funda Cartocor para autoabastecerse de cajas de cartón corrugado, convirtiéndose luego en el mayor fabricante de envases de la región.',
        imagePlaceholder: '📦',
        historicalCard: {
          quoteOrFact: 'Cartocor nació para que los caramelos llegaran intactos a destino y revolucionó la industria del embalaje.',
          unlockedLore: 'Ubicada en Paraná, la planta proveyó embalajes no solo para Arcor sino para las mayores exportadoras de carne, fruta y vino del país.'
        },
        quest: {
          objective: 'Fabricar 1.000 cajas de cartón corrugado para envasar la producción.',
          targetResource: 'caramelos',
          targetAmount: 1000,
          rewardCoins: 3000,
          rewardReputation: 200
        },
        unlocks: {
          buildings: ['Planta Cartocor Paraná'],
          products: ['Cajas Corrugadas de Exportación'],
          regions: ['Entre Ríos y Litoral']
        }
      },
      {
        id: 'event-1984-bonobon',
        year: 1984,
        title: '1984: El Nacimiento de Bon o Bon',
        description: 'Nace Bon o Bon: un bombón de oblea relleno con pasta de maní y bañado en chocolate con leche que revolucionó el mercado.',
        imagePlaceholder: '🍫',
        historicalCard: {
          quoteOrFact: 'Un bombón fino para todos, en cada quiosco, transformado en símbolo universal de afecto.',
          unlockedLore: 'Hoy se producen más de 3.000 millones de unidades al año y es el bombón líder en toda América Latina y Asia.'
        },
        quest: {
          objective: 'Elaborar el primer lote de 1.200 bombones Bon o Bon en la línea de oblea y chocolate.',
          targetResource: 'caramelos',
          targetAmount: 1200,
          rewardCoins: 4000,
          rewardReputation: 250
        },
        unlocks: {
          buildings: ['Línea Automatizada de Bombones'],
          products: ['Bombón Bon o Bon Clásico', 'Bon o Bon Blanco'],
          regions: ['Mercado Masivo Regional']
        }
      },
      {
        id: 'event-1986-gomitas-mogul',
        year: 1986,
        title: '1986: Lanzamiento de Gomitas Mogul',
        description: 'Arcor crea Mogul e inaugura la primera planta industrial argentina de caramelos de goma masticables a base de gelatina y jugo de frutas.',
        imagePlaceholder: '🐻',
        historicalCard: {
          quoteOrFact: 'Mogul convirtió la golosina en juego: ositos, tiburones y frutitas masticables para todas las edades.',
          unlockedLore: 'El uso de jugo natural de frutas y gelatina de máxima pureza instaló a Mogul como el líder indiscutido de caramelos blandos.'
        },
        quest: {
          objective: 'Moldear y empaquetar 1.500 gomitas Mogul.',
          targetResource: 'caramelos',
          targetAmount: 1500,
          rewardCoins: 4500,
          rewardReputation: 300
        },
        unlocks: {
          buildings: ['Planta de Gelatinas y Gomas'],
          products: ['Gomitas Mogul Ositos', 'Mogul Eucalipto'],
          regions: ['Mercados Escolares']
        }
      },
      {
        id: 'event-1989-semana-dulzura',
        year: 1989,
        title: '1989: "Una Golosina por un Beso"',
        description: 'Arcor instituye junto a la Asociación de Distribuidores de Golosinas la "Semana de la Dulzura", convertida en hito cultural popular.',
        imagePlaceholder: '❤️',
        historicalCard: {
          quoteOrFact: '"Una golosina por un beso" del 1 al 7 de julio transformó el afecto en tradición popular.',
          unlockedLore: 'Durante esa semana, las ventas de golosinas en quioscos se triplicaron, consolidando la cercanía emocional de la marca con la gente.'
        },
        quest: {
          objective: 'Proveer a los quioscos con 2.000 golosinas durante la Semana de la Dulzura.',
          targetResource: 'caramelos',
          targetAmount: 2000,
          rewardCoins: 5000,
          rewardReputation: 350
        },
        unlocks: {
          buildings: ['Campaña Nacional de Marketing'],
          products: ['Cofler Chocolates', 'Chupetines Corazón'],
          regions: ['Quioscos de Toda la Argentina']
        }
      }
    ]
  },
  {
    eraId: 4,
    eraName: 'Nivel 4: Era Luis Pagani, Adquisiciones y Globalización',
    startYear: 1990,
    endYear: 2004,
    ambientTheme: 'corporate_blue_gold',
    events: [
      {
        id: 'event-1990-1993-legado-luis-pagani',
        year: 1993,
        title: 'Presidencia de Luis A. Pagani y Fundación Arcor (1991)',
        description: 'Tras la partida de Don Fulvio (1990), Luis Pagani asume el liderazgo en 1993. Se crea Fundación Arcor para educación de la infancia.',
        imagePlaceholder: '🤝',
        historicalCard: {
          quoteOrFact: 'Crecer con responsabilidad social: cada fábrica de Arcor debe ser motor de desarrollo de su comunidad.',
          unlockedLore: 'Fundación Arcor apoyó miles de proyectos educativos en escuelas rurales y jardines de infantes de Argentina y la región.'
        },
        quest: {
          objective: 'Asignar fondos comunitarios produciendo 2.500 unidades para los programas sociales.',
          targetResource: 'caramelos',
          targetAmount: 2500,
          rewardCoins: 6000,
          rewardReputation: 400
        },
        unlocks: {
          buildings: ['Sede Fundación Arcor'],
          products: ['Alimentos Nutricionales'],
          regions: ['Comunidades Escolares']
        }
      },
      {
        id: 'event-1993-1998-grandes-adquisiciones',
        year: 1994,
        title: 'Adquisición de Águila Saint, Noel y Planta Caroya',
        description: 'Adquisición de marcas históricas como Águila Saint (1993), Noel (1994), LIA (1997) y Dos en Uno de Chile (1998). Planta modelo en Colonia Caroya.',
        imagePlaceholder: '🦅',
        historicalCard: {
          quoteOrFact: 'Incorporar a Águila Saint (fundada en 1880) unió a la empresa más antigua de chocolate con la más dinámica de América Latina.',
          unlockedLore: 'La planta de chocolates de Colonia Caroya fue inaugurada como el centro más moderno de molienda de cacao y conchado del hemisferio sur.'
        },
        quest: {
          objective: 'Integrar las líneas de Águila y Noel elaborando 3.000 chocolates y dulces.',
          targetResource: 'caramelos',
          targetAmount: 3000,
          rewardCoins: 8000,
          rewardReputation: 500
        },
        unlocks: {
          buildings: ['Planta Modelo Colonia Caroya', 'Planta Salto (Galletitas)'],
          products: ['Chocolate Taza Águila', 'Dulces Noel'],
          regions: ['Perú (Planta Chancay)']
        }
      },
      {
        id: 'event-1999-braganca-internacional',
        year: 1999,
        title: 'Planta Bragança Paulista y Apertura en EE.UU.',
        description: 'Inauguración de la mega-planta de chocolates en Bragança Paulista (Brasil), oficinas en EE.UU. y renovación de la identidad visual.',
        imagePlaceholder: '🇧🇷',
        historicalCard: {
          quoteOrFact: 'Bragança Paulista se convirtió en el polo de exportación chocolatera hacia todo el Mercosur y Norteamérica.',
          unlockedLore: 'El isotipo del sol y el óvalo azul y dorado se consolidaron como sello de calidad en las góndolas de más de 100 países.'
        },
        quest: {
          objective: 'Producir 4.000 unidades con la nueva identidad visual corporativa.',
          targetResource: 'caramelos',
          targetAmount: 4000,
          rewardCoins: 10000,
          rewardReputation: 600
        },
        unlocks: {
          buildings: ['Planta Bragança Paulista', 'Oficinas Arcor USA'],
          products: ['Tortuguita Chocolates', 'Poosh Chicles'],
          regions: ['México', 'Colombia', 'Canadá', 'España']
        }
      }
    ]
  },
  {
    eraId: 5,
    eraName: 'Nivel 5: Megamarcas, Alianzas y Líder Multicategoría',
    startYear: 2005,
    endYear: 2026,
    ambientTheme: 'modern_global_empire',
    events: [
      {
        id: 'event-2005-bagley-helados-campagnola',
        year: 2005,
        title: 'Bagley Latinoamérica, Helados y La Campagnola',
        description: 'Asociación con Danone creando Bagley Latinoamérica (Criollitas, Chocolinas). Lanzamiento de Helados Arcor y compra de Benvenuto S.A.C.I. (La Campagnola).',
        imagePlaceholder: '🍦',
        historicalCard: {
          quoteOrFact: 'Al sumar La Campagnola y Bagley, Arcor se transformó en el líder de alimentos de la mesa familiar.',
          unlockedLore: 'Con las cámaras frigoríficas instaladas en los quioscos para Helados Arcor, se logró la mayor red de frío comercial del país.'
        },
        quest: {
          objective: 'Producir 5.000 productos multicategoría (helados, galletitas y mermeladas).',
          targetResource: 'caramelos',
          targetAmount: 5000,
          rewardCoins: 15000,
          rewardReputation: 800
        },
        unlocks: {
          buildings: ['División Helados Industriales', 'Planta Bagley Salto'],
          products: ['Chocolinas', 'Mermelada La Campagnola', 'Helados Arcor'],
          regions: ['Sudáfrica', 'China', 'México (Alianza Bimbo)']
        }
      },
      {
        id: 'event-2009-arcorito-momentos-magicos',
        year: 2009,
        title: 'Nacimiento de "Arcorito" y "Momentos Mágicos"',
        description: 'Lanzamiento de la mascota institucional Arcorito (con capa azul y mechón rojo) y del lema "Alimentando Momentos Mágicos".',
        imagePlaceholder: '⭐',
        historicalCard: {
          quoteOrFact: 'Arcorito representa la alegría, la magia y la calidez que un dulce despierta en grandes y chicos.',
          unlockedLore: 'La mascota se convirtió en el embajador de las visitas escolares al Museo Arcor de Arroyito y de los programas deportivos y culturales.'
        },
        quest: {
          objective: 'Repartir 6.000 Momentos Mágicos guiados por Arcorito en todo el país.',
          targetResource: 'caramelos',
          targetAmount: 6000,
          rewardCoins: 20000,
          rewardReputation: 1000
        },
        unlocks: {
          buildings: ['Museo Interactivo Arcor Arroyito'],
          products: ['Golosinas Edición Momentos Mágicos'],
          regions: ['Red Global de Alimentos']
        }
      },
      {
        id: 'event-2015-coca-cola-alianza',
        year: 2015,
        title: 'Alianzas Globales (Coca-Cola, Mastellone) y Proyección Internacional',
        description: 'Co-branding con Coca-Cola (Menthoplus-Powerade, Topline-Sprite). Asociación con Mastellone y Planta Bicentenario en Chile.',
        imagePlaceholder: '🌍',
        historicalCard: {
          quoteOrFact: 'De un modesto galpón en Arroyito a alimentar sonrisas en más de 120 países de los cinco continentes.',
          unlockedLore: 'Las marcas de Arcor se integraron con líderes mundiales para democratizar alimentos nutritivos y de calidad global.'
        },
        quest: {
          objective: 'Supera el Nivel 65 de Arcor Crush para sellar las grandes alianzas internacionales.',
          targetResource: 'crush_level',
          targetAmount: 65,
          rewardCoins: 4200,
          rewardReputation: 1200
        },
        unlocks: {
          buildings: ['Planta Bicentenario (Chile)', 'Centro de Innovación Tecnológica'],
          products: ['Topline Sprite', 'Menthoplus Powerade'],
          regions: ['Red Global de Alimentos']
        }
      },
      {
        id: 'event-2021-inauguracion-angola',
        year: 2021,
        title: '2021: Inauguración Planta Luanda (África) y Compromiso Sustentable',
        description: 'Inauguración oficial de la megafábrica en Luanda (Angola), la primera planta de Arcor fuera de América Latina, junto con la estrategia de sustentabilidad y envases 100% reciclables.',
        imagePlaceholder: '🌍',
        historicalCard: {
          quoteOrFact: 'Llevar el corazón de Arroyito al continente africano: la primera planta industrial argentina en África subsahariana.',
          unlockedLore: 'Con tecnología de última generación, la planta de Luanda abastece a toda la región con Bon o Bon, galletitas y golosinas elaboradas localmente.'
        },
        quest: {
          objective: 'Supera el Nivel 71 de Arcor Crush para inaugurar la planta de Angola y expandir la sustentabilidad.',
          targetResource: 'crush_level',
          targetAmount: 71,
          rewardCoins: 4600,
          rewardReputation: 1500
        },
        unlocks: {
          buildings: ['Mega-Planta de Luanda (Angola)', 'Parque de Energía Solar Sustentable'],
          products: ['Bon o Bon África', 'Galletitas Luanda'],
          regions: ['África Subsahariana']
        }
      },
      {
        id: 'event-2026-arcor-75-aniversario',
        year: 2026,
        title: '2026: 75° Aniversario de Arcor • El Gran Complejo Industrial de Hoy',
        description: '75 años de historia ininterrumpida. Arcor celebra tres cuartos de siglo como el mayor exportador de caramelos del mundo, con más de 45 plantas industriales y presencia en más de 120 naciones.',
        imagePlaceholder: '👑',
        historicalCard: {
          quoteOrFact: '75 años uniendo generaciones con dulzura, desde el primer fuego en Arroyito hasta las mesas de todo el planeta.',
          unlockedLore: 'El sueño de Don Fulvio y sus pioneros en 1951 es hoy una realidad gigante que enorgullece a toda la Argentina y al mundo.'
        },
        quest: {
          objective: 'Supera el Nivel 75 de Arcor Crush para coronar el 75° Aniversario de Arcor y completar el imperio dulce.',
          targetResource: 'crush_level',
          targetAmount: 75,
          rewardCoins: 5000,
          rewardReputation: 2000
        },
        unlocks: {
          buildings: ['Megacomplejo Central Arcor 2026', 'Monumento Histórico Fundadores'],
          products: ['Edición Bicentenario Arcor', 'Gran Colección 75 Años'],
          regions: ['Presencia Global Consolidada (+120 Países)']
        }
      }
    ]
  }
];

// Helper para búsqueda rápida de eventos
export function getHistoricalEventById(eventId: string): HistoricalEvent | null {
  for (const era of ERAS_DEFINITION) {
    const found = era.events.find(e => e.id === eventId);
    if (found) return found;
  }
  return null;
}

// Helper para obtener todos los eventos cronológicos en array plano
export function getAllChronologicalEvents(): HistoricalEvent[] {
  return ERAS_DEFINITION.flatMap(era => era.events);
}
