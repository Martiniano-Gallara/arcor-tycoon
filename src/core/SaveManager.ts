import { ARCOR_HISTORIC_PRODUCTS, CandyType } from '../minigame/Match3Engine.ts';

export interface PlacedBuildingSave {
  id: string;
  typeId: string;
  gridX: number;
  gridZ: number;
  rotation: number;
  level: number;
}

export interface PlacedRoadSave {
  gridX: number;
  gridZ: number;
  type: 'dirt' | 'cobblestone';
}

export interface WorkerSaveData {
  caramelistas: number;
  acarreadores: number;
  mecanicos: number;
}

export interface GameSaveData {
  version: number;
  currentYear: number;
  currentMonth: number;
  currentEraId: string;
  money: number;
  
  reputation: number;
  completedQuests: string[];
  unlockedCards: string[];
  hasSeenPrologue: boolean;
  lastActiveTimestamp?: number;
  hasReceivedDefault500USD?: boolean;
  hasReceivedDefault2500USD?: boolean;

  // Grid y Tycoon expansivo
  buildings: PlacedBuildingSave[];
  roads: PlacedRoadSave[];
  unlockedParcels: string[];

  // Match-3 Narrativo ("Arcor Crush")
  match3CurrentLevel: number;
  match3Stars: number;
  match3LevelStars: Record<number, number>;
  match3Boosters: {
    hammer: number;
    swap: number;
    bomb: number;
    rocklet: number;
  };
  unlockedMatch3Candies: string[];

  // Saga Map & Hearts
  lives: number;
  maxLives: number;
  lastLifeLostTimestamp: number;
  levelHighScores?: Record<number, number>;

  // Museo del Sabor - 75 Años de Arcor
  discoveredMuseumCandies?: string[];

  // Quiz y Logros
  totalQuizCorrect?: number;
  totalQuizScore?: number;

  settings: {
    sfxVolume: number;
    musicVolume: number;
    quality: 'low' | 'medium' | 'high';
    fps60: boolean;
  };

  // Campos legacy
  workers: WorkerSaveData;
  sugar: number;
  glucose: number;
  milk: number;
  cocoa: number;
  flour: number;
  peanuts: number;
  hardCandies: number;
  milkCandies: number;
  bonOBon: number;
  cookies: number;
  cannedGoods: number;
}

const STORAGE_KEY = 'arcor_tycoon_save_v2';

export const DEFAULT_SAVE_DATA: GameSaveData = {
  version: 2,
  currentYear: 1951,
  currentMonth: 6,
  currentEraId: 'era-1951',
  money: 2500, // 2.500 USD por defecto para iniciar con buen impulso
  hasReceivedDefault500USD: true,
  hasReceivedDefault2500USD: true,
  lastActiveTimestamp: Date.now(),
  
  // Insumos
  sugar: 25,
  glucose: 10,
  milk: 0,
  cocoa: 0,
  flour: 0,
  peanuts: 0,

  // Productos
  hardCandies: 0,
  milkCandies: 0,
  bonOBon: 0,
  cookies: 0,
  cannedGoods: 0,

  reputation: 1,
  completedQuests: [],
  unlockedCards: ['card-fundacion-1951', 'card-primer-galpon'],
  hasSeenPrologue: false,

  // Edificios iniciales en la parcela central
  buildings: [
    {
      id: 'b-init-workshop',
      typeId: 'hard-candy-workshop',
      gridX: 0,
      gridZ: 0,
      rotation: 0,
      level: 1
    },
    {
      id: 'b-init-admin',
      typeId: 'admin-hq',
      gridX: -3,
      gridZ: 0,
      rotation: 0,
      level: 1
    }
  ],
  roads: [
    { gridX: 2, gridZ: 0, type: 'dirt' },
    { gridX: 2, gridZ: 1, type: 'dirt' },
    { gridX: 2, gridZ: 2, type: 'dirt' },
    { gridX: 2, gridZ: 3, type: 'dirt' },
    { gridX: 1, gridZ: 2, type: 'dirt' },
    { gridX: 0, gridZ: 2, type: 'dirt' },
    { gridX: -1, gridZ: 2, type: 'dirt' }
  ],
  unlockedParcels: ['parcel-core'],
  workers: {
    caramelistas: 1,
    acarreadores: 1,
    mecanicos: 0
  },

  // Sprint 8: Match-3
  match3CurrentLevel: 1,
  match3Stars: 0,
  match3LevelStars: {},
  match3Boosters: {
    hammer: 3,
    swap: 3,
    bomb: 3,
    rocklet: 3
  },
  unlockedMatch3Candies: ['caramelo_1951', 'minty', 'caramelo_miel', 'caramelo_frutal'],

  // Sprint 9: Saga Map & Hearts
  lives: 5,
  maxLives: 5,
  lastLifeLostTimestamp: Date.now(),
  levelHighScores: {},

  // Museo del Sabor - 75 Años de Arcor
  discoveredMuseumCandies: [],

  // Quiz y Logros
  totalQuizCorrect: 0,
  totalQuizScore: 0,

  settings: {
    sfxVolume: 0.8,
    musicVolume: 0.5,
    quality: 'high',
    fps60: true
  }
};

export class SaveManager {
  public static load(): GameSaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE_DATA };
      const parsed = JSON.parse(raw) as Partial<GameSaveData>;
      const data: GameSaveData = {
        ...DEFAULT_SAVE_DATA,
        ...parsed,
        match3Boosters: {
          ...DEFAULT_SAVE_DATA.match3Boosters,
          ...(parsed.match3Boosters || {})
        },
        match3LevelStars: {
          ...DEFAULT_SAVE_DATA.match3LevelStars,
          ...(parsed.match3LevelStars || {})
        },
        levelHighScores: {
          ...DEFAULT_SAVE_DATA.levelHighScores,
          ...(parsed.levelHighScores || {})
        },
        settings: {
          ...DEFAULT_SAVE_DATA.settings,
          ...(parsed.settings || {})
        }
      };

      if (data.match3CurrentLevel === undefined) data.match3CurrentLevel = 1;
      if (data.match3Stars === undefined) data.match3Stars = 0;
      if (data.lives === undefined) data.lives = 5;
      if (data.maxLives === undefined) data.maxLives = 5;
      if (!data.lastLifeLostTimestamp) data.lastLifeLostTimestamp = Date.now();
      if (!data.unlockedMatch3Candies || data.unlockedMatch3Candies.length === 0) {
        data.unlockedMatch3Candies = [...DEFAULT_SAVE_DATA.unlockedMatch3Candies];
      } else {
        // Sanitizar partida existente para que ningún dulce aparezca como desbloqueado antes de su nivel real
        const currentLvl = data.match3CurrentLevel || 1;
        data.unlockedMatch3Candies = data.unlockedMatch3Candies.filter(cand => {
          const prod = ARCOR_HISTORIC_PRODUCTS[cand as CandyType];
          return prod && prod.unlockedAtLevel <= currentLvl;
        });
        if (data.unlockedMatch3Candies.length === 0) {
          data.unlockedMatch3Candies = [...DEFAULT_SAVE_DATA.unlockedMatch3Candies];
        }
      }

      return data;
    } catch (e) {
      console.warn('Error cargando partida, usando valores por defecto:', e);
      return { ...DEFAULT_SAVE_DATA };
    }
  }

  public static save(data: GameSaveData): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
      return false;
    }
  }

  public static reset(): GameSaveData {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error al resetear partida:', e);
    }
    return { ...DEFAULT_SAVE_DATA };
  }

  public static exportJSON(data: GameSaveData): string {
    return JSON.stringify(data, null, 2);
  }

  public static importJSON(jsonStr: string): GameSaveData | null {
    try {
      const parsed = JSON.parse(jsonStr) as GameSaveData;
      if (typeof parsed.currentYear === 'number' && typeof parsed.money === 'number') {
        this.save(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('JSON de guardado inválido:', e);
    }
    return null;
  }
}
