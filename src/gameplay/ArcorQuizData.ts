/**
 * ARCOR QUIZ DATA: BANCO DE PREGUNTAS HISTÓRICAS Y TÉCNICAS REALES
 * 
 * Contiene información histórica real verificada sobre:
 * - Fundación y pioneros de Arcor (1951, Arroyito, Córdoba)
 * - Productos emblemáticos (Bon o Bon, Mogul, Rocklets, Butter Toffees, Tortuguita, etc.)
 * - Marcas históricas del grupo (Bagley, La Campagnola, Cartocor)
 * - Modelo de autoabastecimiento e integración vertical (azúcar, maíz, energía, envases)
 * - Liderazgo global y presencia en más de 120 países
 * 
 * Diseñado para ser extensible agregando nuevos elementos al array ARCOR_QUIZ_QUESTIONS.
 */

export type QuizDifficulty = 'facil' | 'media' | 'dificil';

export type QuizCategory = 'historia' | 'arroyito' | 'productos' | 'marcas' | 'curiosidades' | 'produccion';

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2 o 3
  explanation: string;
  difficulty: QuizDifficulty;
  category: QuizCategory;
  icon: string;
}

export const ARCOR_QUIZ_QUESTIONS: QuizQuestion[] = [
  // =========================================================================
  // DIFICULTAD: FÁCIL (Preguntas icónicas y cultura general de Arcor)
  // =========================================================================
  {
    id: 'q_facil_1',
    question: '¿En qué ciudad de Córdoba nació la primera fábrica de Arcor en 1951?',
    options: ['Villa Carlos Paz', 'Arroyito', 'Río Cuarto', 'Cosquín'],
    correctIndex: 1,
    explanation: 'El 5 de julio de 1951, un grupo de jóvenes emprendedores inauguró la primera planta de caramelos en Arroyito, Córdoba.',
    difficulty: 'facil',
    category: 'arroyito',
    icon: '🏭'
  },
  {
    id: 'q_facil_2',
    question: '¿Qué famoso bombón con relleno de maní y oblea crocante creó Arcor en 1984?',
    options: ['Mantecol', 'Cabsha', 'Bon o Bon', 'Marroc'],
    correctIndex: 2,
    explanation: 'Bon o Bon nació en 1984 como un bombón accesible y delicioso, convirtiéndose en el más vendido de América Latina y un éxito mundial.',
    difficulty: 'facil',
    category: 'productos',
    icon: '🍫'
  },
  {
    id: 'q_facil_3',
    question: '¿Qué famosa tradición argentina impulsó Arcor con el lema "Una golosina por un beso"?',
    options: ['Semana de la Dulzura', 'Día de la Primavera', 'Mes del Chocolate', 'Noche de los Caramelos'],
    correctIndex: 0,
    explanation: 'En julio de 1989 nació la "Semana de la Dulzura", una iniciativa para compartir afecto regalando una golosina a cambio de un beso.',
    difficulty: 'facil',
    category: 'curiosidades',
    icon: '💋'
  },
  {
    id: 'q_facil_4',
    question: '¿Cuál es la reconocida marca de gomitas de gelatina con jugo de fruta de Arcor?',
    options: ['Yummy', 'Mogul', 'Gummy Bear', 'Fizz'],
    correctIndex: 1,
    explanation: 'Mogul es la marca líder de gomitas en Argentina, elaboradas con jugo de frutas natural y textura suave inconfundible.',
    difficulty: 'facil',
    category: 'productos',
    icon: '🐻'
  },
  {
    id: 'q_facil_5',
    question: '¿Cómo se llaman los confites de chocolate con cubierta azucarada crocante de colores de Arcor?',
    options: ['Lentejas', 'Rocklets', 'Smarties', 'M&M'],
    correctIndex: 1,
    explanation: 'Rocklets son los emblemáticos confites de chocolate rellenos con colores brillantes favoritos en tortas y cumpleaños.',
    difficulty: 'facil',
    category: 'productos',
    icon: '🌈'
  },
  {
    id: 'q_facil_6',
    question: '¿Qué caramelo de leche masticable premium de Arcor se destaca por su textura suave y cremosa?',
    options: ['Media Hora', 'Butter Toffees', 'Palito de la Selva', 'Sugus'],
    correctIndex: 1,
    explanation: 'Butter Toffees es el clásico caramelo suave de leche con combinaciones de chocolate, café, menta y dulce de leche.',
    difficulty: 'facil',
    category: 'productos',
    icon: '🍬'
  },
  {
    id: 'q_facil_7',
    question: '¿Cuál de estas famosas galletitas de chocolate es la base clásica de la "Chocotorta"?',
    options: ['Criollitas', 'Chocolinas', 'Rumba', 'Sonrisas'],
    correctIndex: 1,
    explanation: 'Chocolinas (de Bagley / Grupo Arcor) fue el ingrediente original de la receta de la Chocotorta inventada en 1982.',
    difficulty: 'facil',
    category: 'marcas',
    icon: '🍪'
  },
  {
    id: 'q_facil_8',
    question: '¿Cuál era el producto original con el que comenzó la producción en la fábrica de Arroyito en 1951?',
    options: ['Caramelos duros', 'Turrones navideños', 'Helados de crema', 'Chocolates en barra'],
    correctIndex: 0,
    explanation: 'Arcor comenzó elaborando caramelos duros en pailas de cobre con una producción inicial de 5.000 kg diarios.',
    difficulty: 'facil',
    category: 'historia',
    icon: '🍭'
  },
  {
    id: 'q_facil_9',
    question: '¿Cómo se llama el simpático chupetín de chocolate con forma de animalito de Arcor?',
    options: ['ChocoOso', 'Tortuguita', 'Sapito', 'Delfincito'],
    correctIndex: 1,
    explanation: 'Tortuguita de Arcor es uno de los chocolates infantiles más queridos de la marca con su forma y relleno cremoso.',
    difficulty: 'facil',
    category: 'productos',
    icon: '🐢'
  },

  // =========================================================================
  // DIFICULTAD: MEDIA (Historia industrial, hitos y desarrollo del grupo)
  // =========================================================================
  {
    id: 'q_media_1',
    question: '¿Quién fue el principal fundador y líder histórico de Grupo Arcor?',
    options: ['Enrique Shaw', 'Fulvio Salvador Pagani', 'Torcuato Di Tella', 'Otto Bemberg'],
    correctIndex: 1,
    explanation: 'Fulvio Salvador Pagani, junto a sus hermanos y socios, fundó Arcor a los 23 años con la visión de llegar al mundo entero.',
    difficulty: 'media',
    category: 'historia',
    icon: '🎖️'
  },
  {
    id: 'q_media_2',
    question: '¿De dónde surge la palabra "ARCOR"?',
    options: [
      'De "Arcoíris y Color"',
      'De la unión de "ARroyito" y "CÓRdoba"',
      'Del apellido de su primer socio',
      'De "Argentina Corporación"'
    ],
    correctIndex: 1,
    explanation: 'El nombre ARCOR es un acrónimo formado por las primeras letras de "ARroyito" y "CÓRdoba".',
    difficulty: 'media',
    category: 'historia',
    icon: '📜'
  },
  {
    id: 'q_media_3',
    question: '¿En qué año Arcor creó su propia empresa de envases de cartón corrugado llamada Cartocor?',
    options: ['1960', '1970', '1980', '1995'],
    correctIndex: 2,
    explanation: 'En 1980 Arcor fundó Cartocor para garantizar cajas y embalajes de máxima calidad, convirtiéndose en el mayor fabricante de cartón de Argentina.',
    difficulty: 'media',
    category: 'produccion',
    icon: '📦'
  },
  {
    id: 'q_media_4',
    question: '¿Qué histórica empresa centenaria de galletitas formó una alianza estratégica (joint venture) con Arcor en 2004?',
    options: ['Terrabusi', 'Bagley', 'Canale', 'Fargo'],
    correctIndex: 1,
    explanation: 'En 2004 se creó la sociedad Bagley Latinoamérica junto al grupo Danone, consolidando a Arcor como líder en galletitas de la región.',
    difficulty: 'media',
    category: 'marcas',
    icon: '🤝'
  },
  {
    id: 'q_media_5',
    question: '¿Qué famosa empresa de conservas de tomate, frutas y pescados incorporó Arcor a su grupo en 2005?',
    options: ['La Campagnola', 'Marolio', 'Arcor Alimentos', 'Molto'],
    correctIndex: 0,
    explanation: 'En 2005 Arcor adquirió La Campagnola, potenciando su liderazgo en mermeladas, salsas, tomates y atún.',
    difficulty: 'media',
    category: 'marcas',
    icon: '🍅'
  },
  {
    id: 'q_media_6',
    question: '¿Cómo se llama el modelo donde Arcor produce su propio azúcar, leche, energía y envases?',
    options: ['Monopolio puro', 'Integración vertical y autoabastecimiento', 'Comercio justo', 'Franquicia descentralizada'],
    correctIndex: 1,
    explanation: 'El modelo de autoabastecimiento e integración vertical permite a Arcor asegurar la pureza, calidad y costos desde la materia prima hasta el consumidor.',
    difficulty: 'media',
    category: 'produccion',
    icon: '⚙️'
  },
  {
    id: 'q_media_7',
    question: '¿En qué provincia argentina se encuentra el Ingenio La Providencia, donde Arcor produce su propia azúcar?',
    options: ['Salta', 'Jujuy', 'Tucumán', 'Misiones'],
    correctIndex: 2,
    explanation: 'El Ingenio La Providencia está situado en Tucumán y abastece de azúcar de máxima pureza a las fábricas de Arcor, además de generar bioenergía.',
    difficulty: 'media',
    category: 'produccion',
    icon: '🌱'
  },
  {
    id: 'q_media_8',
    question: '¿Cuál fue el primer país fuera de Argentina donde Arcor instaló una planta de producción propia en 1979?',
    options: ['Brasil', 'Chile', 'Uruguay', 'Paraguay'],
    correctIndex: 0,
    explanation: 'En 1979 Arcor instaló su primera fábrica internacional en Río Claro, San Pablo, Brasil, iniciando su expansión multinacional.',
    difficulty: 'media',
    category: 'historia',
    icon: '🌎'
  },
  {
    id: 'q_media_9',
    question: '¿Qué reconocimiento oficial tiene la ciudad de Arroyito gracias al impacto de Arcor?',
    options: [
      'Capital Nacional de la Leche',
      'Ciudad Dulce del País',
      'Cuna del Alfajor',
      'Capital Histórica del Trigo'
    ],
    correctIndex: 1,
    explanation: 'Arroyito es formalmente reconocida como la "Ciudad Dulce del País" por la trascendencia de su industria confitera.',
    difficulty: 'media',
    category: 'curiosidades',
    icon: '👑'
  },

  // =========================================================================
  // DIFICULTAD: DIFÍCIL (Datos específicos de ingeniería, hitos y récords)
  // =========================================================================
  {
    id: 'q_dificil_1',
    question: '¿A cuántos países de los 5 continentes exporta regularmente sus productos Grupo Arcor?',
    options: ['Más de 20', 'Más de 50', 'Más de 120', 'Aproximadamente 40'],
    correctIndex: 2,
    explanation: 'Arcor llega con sus golosinas, chocolates y alimentos a más de 120 países en todo el planeta.',
    difficulty: 'dificil',
    category: 'historia',
    icon: '🌐'
  },
  {
    id: 'q_dificil_2',
    question: '¿Qué posición ostenta Grupo Arcor en el ranking mundial de producción de caramelos duros?',
    options: [
      'Top 10 mundial',
      'Tercer productor mundial',
      'Principal (1°) productor mundial de caramelos duros',
      'Quinto productor mundial'
    ],
    correctIndex: 2,
    explanation: 'Arcor es el primer productor mundial de caramelos duros del planeta por volumen y capacidad instalada.',
    difficulty: 'dificil',
    category: 'produccion',
    icon: '🏆'
  },
  {
    id: 'q_dificil_3',
    question: '¿Qué cereal procesa Arcor en Arroyito en su planta de molienda húmeda para obtener jarabe de glucosa y fructosa?',
    options: ['Trigo', 'Cebada', 'Maíz', 'Arroz'],
    correctIndex: 2,
    explanation: 'En su complejo de molienda húmeda de maíz en Arroyito, Arcor procesa cientos de toneladas diarias para obtener glucosa, almidones y jarabes.',
    difficulty: 'dificil',
    category: 'produccion',
    icon: '🌽'
  },
  {
    id: 'q_dificil_4',
    question: '¿En qué año se fundó la Fundación Arcor, dedicada al desarrollo de la infancia y educación?',
    options: ['1975', '1985', '1991', '2001'],
    correctIndex: 2,
    explanation: 'La Fundación Arcor nació en diciembre de 1991 como canal del compromiso social y educativo de la empresa con la niñez.',
    difficulty: 'dificil',
    category: 'historia',
    icon: '🎓'
  },
  {
    id: 'q_dificil_5',
    question: '¿Cuál de los siguientes no fue uno de los socios fundadores originales de Arcor en 1951?',
    options: ['Fulvio Salvador Pagani', 'Renzo Pagani', 'Roberto Noble', 'Elio Maranzana'],
    correctIndex: 2,
    explanation: 'Roberto Noble fue fundador del diario Clarín. Los pioneros de Arcor fueron Fulvio, Renzo, Amos y Mirno Pagani, junto a Elio Maranzana, Modesto Maranzana, Mario Seveso y otros amigos.',
    difficulty: 'dificil',
    category: 'historia',
    icon: '👥'
  },
  {
    id: 'q_dificil_6',
    question: '¿Qué compromiso ambiental y energético pionero adoptó el complejo industrial de Arcor en Arroyito?',
    options: [
      'Generación de energía por cogeneración térmica y biomasa',
      'Uso exclusivo de carbón mineral',
      'Importación de energía nuclear',
      'Desactivación total de calderas'
    ],
    correctIndex: 0,
    explanation: 'Arcor fue pionera en plantas de cogeneración de energía eléctrica y vapor en Arroyito, utilizando además bagazo de caña en Tucumán.',
    difficulty: 'dificil',
    category: 'curiosidades',
    icon: '⚡'
  },
  {
    id: 'q_dificil_7',
    question: '¿En qué año Arcor inauguró su ultramoderna planta de producción en Luanda, Angola, para abastecer al continente africano?',
    options: ['2000', '2010', '2015', '2022'],
    correctIndex: 3,
    explanation: 'En 2022 Arcor inauguró una fábrica de última generación en Luanda (Angola) en alianza con Grupo Webcor, fabricando Bon o Bon y galletas en África.',
    difficulty: 'dificil',
    category: 'historia',
    icon: '🌍'
  },
  {
    id: 'q_dificil_8',
    question: '¿Cuántos años de historia celebra Grupo Arcor con la conmemoración iniciada en 1951?',
    options: ['50 Años', '60 Años', '70 Años', '75 Años (1951 - 2026)'],
    correctIndex: 3,
    explanation: 'Desde su modesto inicio en 1951 hasta el presente, Arcor celebra 75 años de trayectoria industrial y orgullo argentino.',
    difficulty: 'dificil',
    category: 'historia',
    icon: '⭐'
  }
];
