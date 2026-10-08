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
  savedAt?: number;
  revision?: number;
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
  },
  savedAt: Date.now(),
  revision: 1
};

// Congelar el default para prevenir mutaciones accidentales (PER-02)
function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.keys(obj).forEach(prop => {
    const val = (obj as any)[prop];
    if (val !== null && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  });
  return Object.freeze(obj);
}
deepFreeze(DEFAULT_SAVE_DATA);

/**
 * Devuelve una copia limpia y desacoplada del estado por defecto (PER-02)
 */
export function createDefaultSaveData(): GameSaveData {
  return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
}

/**
 * Sanitiza y valida exhaustivamente cualquier objeto de guardado contra el esquema (PER-03, PER-05)
 */
export function sanitizeSave(raw: any): GameSaveData {
  const def = createDefaultSaveData();
  if (!raw || typeof raw !== 'object') {
    return def;
  }

  // Validación numérica y bounds de dinero (PER-05)
  let money = Number(raw.money);
  if (!Number.isFinite(money) || money < 0) {
    money = def.money;
  } else {
    money = Math.min(1e12, money);
  }

  // Validación de nivel y estrellas
  let level = Math.floor(Number(raw.match3CurrentLevel));
  if (!Number.isFinite(level) || level < 1 || level > 75) {
    level = Math.max(1, Math.min(75, Number.isFinite(level) ? level : 1));
  }

  let stars = Math.floor(Number(raw.match3Stars));
  if (!Number.isFinite(stars) || stars < 0) stars = 0;
  stars = Math.min(225, stars);

  let lives = Math.floor(Number(raw.lives));
  if (!Number.isFinite(lives) || lives < 0) lives = 5;
  lives = Math.min(5, Math.max(0, lives));

  let year = Math.floor(Number(raw.currentYear));
  if (!Number.isFinite(year) || year < 1951 || year > 2026) year = 1951;

  let month = Math.floor(Number(raw.currentMonth));
  if (!Number.isFinite(month) || month < 1 || month > 12) month = 6;

  let rep = Number(raw.reputation);
  if (!Number.isFinite(rep) || rep < 0) rep = 1;

  // Arrays seguros
  const completedQuests = Array.isArray(raw.completedQuests)
    ? raw.completedQuests.filter((id: any) => typeof id === 'string')
    : [...def.completedQuests];

  const unlockedCards = Array.isArray(raw.unlockedCards)
    ? raw.unlockedCards.filter((id: any) => typeof id === 'string')
    : [...def.unlockedCards];

  const unlockedParcels = Array.isArray(raw.unlockedParcels)
    ? raw.unlockedParcels.filter((id: any) => typeof id === 'string')
    : [...def.unlockedParcels];

  const buildings = Array.isArray(raw.buildings)
    ? raw.buildings.filter((b: any) => b && typeof b.id === 'string' && typeof b.typeId === 'string')
    : [...def.buildings];

  const roads = Array.isArray(raw.roads)
    ? raw.roads.filter((r: any) => r && typeof r.gridX === 'number' && typeof r.gridZ === 'number')
    : [...def.roads];

  // Boosters acotados
  const boosters = raw.match3Boosters && typeof raw.match3Boosters === 'object' ? raw.match3Boosters : {};
  const clampBooster = (val: any) => Math.max(0, Math.min(99, Number.isFinite(Number(val)) ? Math.floor(Number(val)) : 3));

  // Estrellas por nivel (1..75 -> 0..3)
  const levelStars: Record<number, number> = {};
  if (raw.match3LevelStars && typeof raw.match3LevelStars === 'object') {
    for (const [k, v] of Object.entries(raw.match3LevelStars)) {
      const numKey = Number(k);
      const starVal = Number(v);
      if (Number.isFinite(numKey) && numKey >= 1 && numKey <= 75 && Number.isFinite(starVal)) {
        levelStars[numKey] = Math.max(0, Math.min(3, Math.floor(starVal)));
      }
    }
  }

  // Dulces desbloqueados acorde al nivel actual
  let unlockedMatch3Candies = Array.isArray(raw.unlockedMatch3Candies)
    ? raw.unlockedMatch3Candies.filter((cand: any) => {
        const prod = ARCOR_HISTORIC_PRODUCTS[cand as CandyType];
        return prod && prod.unlockedAtLevel <= level;
      })
    : [];
  if (unlockedMatch3Candies.length === 0) {
    unlockedMatch3Candies = [...def.unlockedMatch3Candies];
  }

  // Settings
  const sfxVolume = Number.isFinite(Number(raw.settings?.sfxVolume)) ? Math.max(0, Math.min(1, Number(raw.settings.sfxVolume))) : 0.8;
  const musicVolume = Number.isFinite(Number(raw.settings?.musicVolume)) ? Math.max(0, Math.min(1, Number(raw.settings.musicVolume))) : 0.5;
  const quality = ['low', 'medium', 'high'].includes(raw.settings?.quality) ? raw.settings.quality : 'high';
  const fps60 = typeof raw.settings?.fps60 === 'boolean' ? raw.settings.fps60 : true;

  return {
    ...def,
    version: 2,
    currentYear: year,
    currentMonth: month,
    currentEraId: typeof raw.currentEraId === 'string' ? raw.currentEraId : 'era-1951',
    money,
    reputation: rep,
    completedQuests,
    unlockedCards,
    hasSeenPrologue: Boolean(raw.hasSeenPrologue),
    lastActiveTimestamp: Number.isFinite(Number(raw.lastActiveTimestamp)) ? Number(raw.lastActiveTimestamp) : Date.now(),
    buildings,
    roads,
    unlockedParcels,
    match3CurrentLevel: level,
    match3Stars: stars,
    match3LevelStars: levelStars,
    match3Boosters: {
      hammer: clampBooster(boosters.hammer),
      swap: clampBooster(boosters.swap),
      bomb: clampBooster(boosters.bomb),
      rocklet: clampBooster(boosters.rocklet)
    },
    unlockedMatch3Candies,
    lives,
    maxLives: 5,
    lastLifeLostTimestamp: Number.isFinite(Number(raw.lastLifeLostTimestamp)) ? Number(raw.lastLifeLostTimestamp) : Date.now(),
    discoveredMuseumCandies: Array.isArray(raw.discoveredMuseumCandies)
      ? raw.discoveredMuseumCandies.filter((x: any) => typeof x === 'string')
      : [],
    totalQuizCorrect: Math.max(0, Math.floor(Number(raw.totalQuizCorrect) || 0)),
    totalQuizScore: Math.max(0, Math.floor(Number(raw.totalQuizScore) || 0)),
    settings: {
      sfxVolume,
      musicVolume,
      quality,
      fps60
    },
    savedAt: Number(raw.savedAt) || Date.now(),
    revision: Number(raw.revision) || 1
  };
}

export class SaveManager {
  private static externalListeners: Set<(data: GameSaveData) => void> = new Set();
  private static initializedStorageListener = false;
  private static onSaveErrorListener?: (err: unknown) => void;

  public static onSaveError(listener: (err: unknown) => void): void {
    this.onSaveErrorListener = listener;
  }

  public static onExternalChange(listener: (data: GameSaveData) => void): () => void {
    this.ensureStorageListener();
    this.externalListeners.add(listener);
    return () => this.externalListeners.delete(listener);
  }

  private static ensureStorageListener(): void {
    if (this.initializedStorageListener || typeof window === 'undefined') return;
    this.initializedStorageListener = true;

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const sanitized = sanitizeSave(parsed);
          this.externalListeners.forEach(cb => cb(sanitized));
        } catch (err) {
          console.warn('[SaveManager] Cambio externo en storage contenía JSON inválido:', err);
        }
      }
    });
  }

  public static load(): GameSaveData {
    this.ensureStorageListener();
    const BACKUP_KEY = `${STORAGE_KEY}_backup`;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Si no hay guardado principal, verificar si hay un respaldo
        const rawBackup = localStorage.getItem(BACKUP_KEY);
        if (rawBackup) {
          try {
            return sanitizeSave(JSON.parse(rawBackup));
          } catch {
            // Ignorar y continuar al default
          }
        }
        return createDefaultSaveData();
      }

      const parsed = JSON.parse(raw);
      return sanitizeSave(parsed);
    } catch (e) {
      console.warn('[SaveManager] Error o archivo corrupto en guardado principal. Activando recuperación (PER-04):', e);
      try {
        // Archivar el guardado corrupto para no destruirlo silenciosamente
        const corruptedRaw = localStorage.getItem(STORAGE_KEY);
        if (corruptedRaw) {
          localStorage.setItem(`${STORAGE_KEY}_corrupted_${Date.now()}`, corruptedRaw);
        }
        // Intentar rescatar el respaldo anterior
        const backupRaw = localStorage.getItem(BACKUP_KEY);
        if (backupRaw) {
          const rescued = sanitizeSave(JSON.parse(backupRaw));
          console.info('[SaveManager] Partida recuperada exitosamente desde el respaldo.');
          return rescued;
        }
      } catch (backupErr) {
        console.error('[SaveManager] Respaldo también inaccesible:', backupErr);
      }
      return createDefaultSaveData();
    }
  }

  public static save(data: GameSaveData): boolean {
    const BACKUP_KEY = `${STORAGE_KEY}_backup`;
    try {
      data.savedAt = Date.now();
      data.revision = (data.revision || 0) + 1;
      const jsonStr = JSON.stringify(data);

      // Rotación de respaldo seguro: guardar copia previa antes de sobreescribir (PER-04)
      const current = localStorage.getItem(STORAGE_KEY);
      if (current && current !== jsonStr) {
        try {
          localStorage.setItem(BACKUP_KEY, current);
        } catch {
          // Ignorar fallo de cuota en el respaldo
        }
      }

      localStorage.setItem(STORAGE_KEY, jsonStr);
      return true;
    } catch (e) {
      console.error('[SaveManager] Error crítico guardando en localStorage:', e);
      if (this.onSaveErrorListener) {
        this.onSaveErrorListener(e);
      }
      return false;
    }
  }

  public static reset(): GameSaveData {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}_backup`);
      localStorage.removeItem('arcor_tycoon_save');
      localStorage.removeItem('arcor_achievements_v1');
      localStorage.removeItem('arcor_custom_products');
      localStorage.removeItem('arcor_gift_boxes');
      localStorage.removeItem('arcor_quiz_recent_ids');
      localStorage.removeItem('arcor_quiz_daily_lives');
    } catch (e) {
      console.error('[SaveManager] Error al resetear partida:', e);
    }
    return createDefaultSaveData();
  }

  public static exportJSON(data: GameSaveData): string {
    return JSON.stringify(data, null, 2);
  }

  public static importJSON(jsonStr: string): GameSaveData | null {
    try {
      const parsed = JSON.parse(jsonStr);
      // Validación y saneamiento estricto (PER-03)
      if (parsed && typeof parsed === 'object') {
        const sanitized = sanitizeSave(parsed);
        this.save(sanitized);
        return sanitized;
      }
    } catch (e) {
      console.error('[SaveManager] JSON de guardado importado inválido:', e);
    }
    return null;
  }
}
