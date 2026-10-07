export interface GlobalBranch {
  id: string;
  name: string;
  location: string;
  country: string;
  year: number;
  icon: string;
  description: string;
  costMoney: number;
  passiveEarningsPerMinute: number;
  reputationBonus: number;
}

export const GLOBAL_BRANCHES: GlobalBranch[] = [
  {
    id: 'branch-arroyito',
    name: 'Sede Central Arroyito',
    location: 'Arroyito, Córdoba',
    country: 'Argentina',
    year: 1951,
    icon: '🏛️',
    description: 'El corazón fundacional de Arcor donde nació el sueño de Don Fulvio Salvador Pagani.',
    costMoney: 0,
    passiveEarningsPerMinute: 60,
    reputationBonus: 1
  },
  {
    id: 'branch-tucuman',
    name: 'Ingenio Azucarero La Providencia',
    location: 'Río Seco, Tucumán',
    country: 'Argentina',
    year: 1970,
    icon: '🌾',
    description: 'Integración vertical: producción propia de caña de azúcar y jarabes de maíz.',
    costMoney: 2500,
    passiveEarningsPerMinute: 150,
    reputationBonus: 2
  },
  {
    id: 'branch-mendoza',
    name: 'Agroindustria San Rafael',
    location: 'San Rafael, Mendoza',
    country: 'Argentina',
    year: 1972,
    icon: '🍑',
    description: 'Molienda húmeda de frutas, pulpas y tomates para conservas y caramelos rellenos.',
    costMoney: 4000,
    passiveEarningsPerMinute: 240,
    reputationBonus: 3
  },
  {
    id: 'branch-cartocor-parana',
    name: 'Complejo Cartocor Paraná',
    location: 'Paraná, Entre Ríos',
    country: 'Argentina',
    year: 1980,
    icon: '📦',
    description: 'Mayor planta papelera y de envases de cartón corrugado de Sudamérica.',
    costMoney: 6500,
    passiveEarningsPerMinute: 380,
    reputationBonus: 4
  },
  {
    id: 'branch-chile',
    name: 'Filial Dos en Uno Chile',
    location: 'Santiago de Chile',
    country: 'Chile',
    year: 1998,
    icon: '🇨🇱',
    description: 'Adquisición histórica de Dos en Uno. Líder en caramelos y chicles en la región andina.',
    costMoney: 9000,
    passiveEarningsPerMinute: 550,
    reputationBonus: 5
  },
  {
    id: 'branch-brasil',
    name: 'Megaplanta Bragança Paulista',
    location: 'São Paulo',
    country: 'Brasil',
    year: 1999,
    icon: '🇧🇷',
    description: 'La planta de chocolates y golosinas más moderna de América Latina.',
    costMoney: 12000,
    passiveEarningsPerMinute: 800,
    reputationBonus: 7
  },
  {
    id: 'branch-angola',
    name: 'Planta Industrial Luanda',
    location: 'Luanda',
    country: 'Angola (África)',
    year: 2021,
    icon: '🚢',
    description: 'Puerta comercial de Arcor a todo el continente africano con fabricación propia.',
    costMoney: 18000,
    passiveEarningsPerMinute: 1400,
    reputationBonus: 10
  }
];
