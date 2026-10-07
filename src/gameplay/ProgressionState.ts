import { gameState } from './GameState.ts';
import { achievementsManager } from './AchievementsManager.ts';

export interface LevelDefinition {
  levelNumber: number;
  title: string;
  year: number;
  decadeTitle: string;
  xPercent: number;
  yPercent: number;
  description: string;
  quote: string;
  targetCandies: string[];
  historicalCardId?: string;
  eraTag?: string;
  storyHeadline?: string;
  storyBody?: string;
  funFact?: string;
  isSpecialMilestone?: boolean;
  milestoneTitle?: string;
  hint?: string;
}

export interface MilestoneBannerDefinition {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  xPercent: number;
  yPercent: number;
  cardId: string;
}

export interface ArcorProductSpot {
  id: string;
  name: string;
  year: number;
  decade: string;
  xPercent: number;
  yPercent: number;
  icon: string;
  tagline: string;
  description: string;
  funFact: string;
}

export { SAGA_LEVELS } from './SagaLevelsData.ts';
import { SAGA_LEVELS } from './SagaLevelsData.ts';

export const MILESTONE_BANNERS: MilestoneBannerDefinition[] = [
  {
    id: 'banner-1951',
    title: '1951',
    subtitle: 'Nace Arcor en Arroyito, Córdoba',
    year: 1951,
    xPercent: 5.5,
    yPercent: 26.0,
    cardId: 'card-fundacion-1951'
  },
  {
    id: 'banner-primeros',
    title: 'Primeros Caramelos',
    subtitle: 'El sabor de un sueño',
    year: 1953,
    xPercent: 37.0,
    yPercent: 26.0,
    cardId: 'card-primer-galpon'
  },
  {
    id: 'banner-80s',
    title: 'Años 80',
    subtitle: 'La dulzura llega a más hogares',
    year: 1984,
    xPercent: 8.5,
    yPercent: 62.0,
    cardId: 'card-bonobon-1984'
  },
  {
    id: 'banner-2000s',
    title: 'Años 2000',
    subtitle: 'Innovación para un mundo más dulce',
    year: 2004,
    xPercent: 88.0,
    yPercent: 71.0,
    cardId: 'card-alianza-bagley-2004'
  },
  {
    id: 'banner-2020s',
    title: 'Años 2020',
    subtitle: 'Llegamos más lejos',
    year: 2021,
    xPercent: 72.0,
    yPercent: 55.0,
    cardId: 'card-sostenibilidad-2020'
  },
  {
    id: 'banner-hoy',
    title: '75 Años',
    subtitle: 'Un mundo más dulce, para todos ♡',
    year: 2025,
    xPercent: 92.0,
    yPercent: 24.0,
    cardId: 'card-arcor-hoy'
  }
];

export const ARCOR_PRODUCTS: ArcorProductSpot[] = [
  {
    id: 'prod-miel',
    name: 'Caramelos Miel & Arcor',
    year: 1951,
    decade: 'Años 50',
    xPercent: 5.0,
    yPercent: 38.0,
    icon: '🍯',
    tagline: 'El dulce origen de Arroyito',
    description: 'Los primeros caramelos artesanales elaborados con miel pura cordobesa y azúcar cristal.',
    funFact: 'En 1951, Fulvio Pagani y sus amigos fundaron la fábrica con la meta de producir 5.000 kg diarios de caramelos.'
  },
  {
    id: 'prod-buttertoffee',
    name: 'Butter Toffees',
    year: 1964,
    decade: 'Años 60',
    xPercent: 52.5,
    yPercent: 36.0,
    icon: '🍬',
    tagline: 'El caramelo de leche más suave',
    description: 'Textura cremosa inconfundible con leche condensada y manteca, envuelto en su clásico papel dorado.',
    funFact: 'Es el caramelo relleno más vendido de Argentina y se degusta en más de 80 países.'
  },
  {
    id: 'prod-bonobon',
    name: 'Bon o Bon',
    year: 1984,
    decade: 'Años 80',
    xPercent: 22.0,
    yPercent: 61.0,
    icon: '🍫',
    tagline: 'Un Bon o Bon por un beso',
    description: 'El bombón de chocolate con leche y oblea crocante relleno con auténtica crema de maní.',
    funFact: 'Es el líder indiscutido de bombones en América Latina e inspiró la Semana de la Dulzura.'
  },
  {
    id: 'prod-mogul',
    name: 'Gomitas Mogul',
    year: 1982,
    decade: 'Años 80',
    xPercent: 33.0,
    yPercent: 67.0,
    icon: '🐻',
    tagline: 'La dulzura más divertida',
    description: 'Gomitas frutales masticables con forma de osito y jugo natural de frutas.',
    funFact: 'Mogul revolucionó el mercado argentino incorporando jugo de fruta real en cada golosina.'
  },
  {
    id: 'prod-aguila',
    name: 'Chocolate Águila & Holanda',
    year: 1988,
    decade: 'Años 80',
    xPercent: 24.0,
    yPercent: 91.0,
    icon: '🍫',
    tagline: 'El auténtico sabor del chocolate',
    description: 'La marca chocolatera más antigua de Argentina (desde 1880), pilar de la repostería familiar.',
    funFact: 'Águila nació en 1880 y Arcor la convirtió en el referente definitivo del chocolate caliente y tortas caseras.'
  },
  {
    id: 'prod-cofler',
    name: 'Cofler & Rocklets',
    year: 1993,
    decade: 'Años 90',
    xPercent: 52.0,
    yPercent: 84.5,
    icon: '🌈',
    tagline: 'La felicidad no tiene horario',
    description: 'Tabletas de chocolate con leche macizo y confites de chocolate confitados multicolores.',
    funFact: 'Rocklets es famoso por sus entrañables personajes animados y su centro crocante de chocolate.'
  },
  {
    id: 'prod-saladix',
    name: 'Saladix & Galletitas Arcor',
    year: 2004,
    decade: 'Años 2000',
    xPercent: 88.0,
    yPercent: 63.0,
    icon: '🍪',
    tagline: 'Sabor crocante que une momentos',
    description: 'Snacks salados horneados y galletitas dulces que expandieron las meriendas de generaciones.',
    funFact: 'Con la alianza Bagley-Arcor en 2004, la empresa se convirtió en el mayor fabricante de galletitas de América del Sur.'
  }
];

export class ProgressionState {
  private static instance: ProgressionState;

  public static readonly MAX_LEVEL = 75;
  public static readonly MAX_LIVES = 5;
  public static readonly REGEN_TIME_SECONDS = 20 * 60; // 20 minutos por vida

  private listeners: Set<() => void> = new Set();
  private timerHandle: number | null = null;

  private constructor() {
    this.checkRegeneration();
    this.timerHandle = window.setInterval(() => {
      this.checkRegeneration();
    }, 1000);
  }

  public static getInstance(): ProgressionState {
    if (!ProgressionState.instance) {
      ProgressionState.instance = new ProgressionState();
    }
    return ProgressionState.instance;
  }

  public destroy(): void {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(cb => cb());
  }

  // =========================================================================
  // GESTIÓN DE NIVELES Y ESTRELLAS (75 NIVELES = 75 AÑOS DE HISTORIA)
  // =========================================================================
  public getCurrentLevel(): number {
    const data = gameState.getData();
    return Math.max(1, Math.min(ProgressionState.MAX_LEVEL, data.match3CurrentLevel || 1));
  }

  public getLevelStars(level: number): number {
    const data = gameState.getData();
    return data.match3LevelStars?.[level] || 0;
  }

  public getTotalStars(): number {
    const data = gameState.getData();
    const map = data.match3LevelStars || {};
    let total = 0;
    for (const lvl in map) {
      total += map[lvl] || 0;
    }
    return total;
  }

  public isLevelUnlocked(level: number): boolean {
    return level <= this.getCurrentLevel();
  }

  public isLevelCompleted(level: number): boolean {
    return this.getLevelStars(level) > 0;
  }

  public getLevelDefinition(level: number): LevelDefinition {
    const found = SAGA_LEVELS.find(l => l.levelNumber === level);
    if (found) return found;
    return SAGA_LEVELS[SAGA_LEVELS.length - 1];
  }

  public getTimelineProgress(): {
    currentLevel: number;
    maxLevel: number;
    currentYear: number;
    percentage: number;
    decade: string;
    isSpecialMilestone: boolean;
    milestoneTitle?: string;
  } {
    const curLvl = this.getCurrentLevel();
    const def = this.getLevelDefinition(curLvl);
    return {
      currentLevel: curLvl,
      maxLevel: ProgressionState.MAX_LEVEL,
      currentYear: def.year,
      percentage: Math.round((curLvl / ProgressionState.MAX_LEVEL) * 100),
      decade: def.decadeTitle,
      isSpecialMilestone: !!def.isSpecialMilestone,
      milestoneTitle: def.milestoneTitle
    };
  }

  public recordVictory(level: number, stars: number, _score: number): {
    isNewLevelUnlocked: boolean;
    starsAwarded: number;
    nextLevel: number;
  } {
    const data = gameState.getData();
    const prevStars = data.match3LevelStars?.[level] || 0;
    const isFirstTime = prevStars === 0;

    gameState.setMatch3LevelStars(level, Math.max(stars, prevStars));

    let isNewLevelUnlocked = false;
    if (level === data.match3CurrentLevel && level < ProgressionState.MAX_LEVEL) {
      gameState.setMatch3Level(level + 1);
      isNewLevelUnlocked = true;
    }

    if (isFirstTime) {
      gameState.addMatch3Stars(1);
    }

    this.notify();
    achievementsManager.checkAll();

    return {
      isNewLevelUnlocked,
      starsAwarded: stars,
      nextLevel: this.getCurrentLevel()
    };
  }

  // =========================================================================
  // SISTEMA DE VIDAS / ENERGÍA (❤️)
  // =========================================================================
  public getLives(): number {
    const data = gameState.getData();
    return Math.max(0, Math.min(ProgressionState.MAX_LIVES, data.lives ?? 5));
  }

  public useLife(): boolean {
    const lives = this.getLives();
    if (lives <= 0) return false;

    const data = gameState.getData() as any;
    data.lives = lives - 1;
    if (lives === ProgressionState.MAX_LIVES) {
      data.lastLifeLostTimestamp = Date.now();
    }
    gameState.notify();
    this.notify();
    return true;
  }

  public refillLives(): void {
    const data = gameState.getData() as any;
    data.lives = ProgressionState.MAX_LIVES;
    data.lastLifeLostTimestamp = Date.now();
    gameState.notify();
    this.notify();
    achievementsManager.checkAll();
  }

  public addLives(amount: number): void {
    const data = gameState.getData() as any;
    data.lives = Math.min(ProgressionState.MAX_LIVES, (data.lives || 0) + amount);
    gameState.notify();
    this.notify();
    achievementsManager.checkAll();
  }

  private checkRegeneration(): void {
    const data = gameState.getData() as any;
    const currentLives = data.lives ?? 5;
    if (currentLives >= ProgressionState.MAX_LIVES) return;

    const lastTime = data.lastLifeLostTimestamp || Date.now();
    const elapsedSeconds = Math.floor((Date.now() - lastTime) / 1000);

    if (elapsedSeconds >= ProgressionState.REGEN_TIME_SECONDS) {
      const recovered = Math.floor(elapsedSeconds / ProgressionState.REGEN_TIME_SECONDS);
      data.lives = Math.min(ProgressionState.MAX_LIVES, currentLives + recovered);
      data.lastLifeLostTimestamp = Date.now() - ((elapsedSeconds % ProgressionState.REGEN_TIME_SECONDS) * 1000);
      gameState.notify();
      this.notify();
    }
  }

  public getRegenCountdown(): { isFull: boolean; text: string; secondsRemaining: number } {
    const lives = this.getLives();
    if (lives >= ProgressionState.MAX_LIVES) {
      return { isFull: true, text: 'Lleno', secondsRemaining: 0 };
    }

    const data = gameState.getData();
    const lastTime = data.lastLifeLostTimestamp || Date.now();
    const elapsed = Math.floor((Date.now() - lastTime) / 1000);
    const rem = Math.max(0, ProgressionState.REGEN_TIME_SECONDS - (elapsed % ProgressionState.REGEN_TIME_SECONDS));

    const mins = Math.floor(rem / 60);
    const secs = rem % 60;
    const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    return { isFull: false, text: formatted, secondsRemaining: rem };
  }
}

export const progressionState = ProgressionState.getInstance();
