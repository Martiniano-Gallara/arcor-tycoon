import { gameState, LEVEL_YEARS } from './GameState.ts';
import { ERAS_DEFINITION, HistoricalEvent } from './historyEras.ts';
import { LevelConfig, LevelObjective, CandyType, ARCOR_HISTORIC_PRODUCTS, ArcorProductInfo } from '../minigame/Match3Engine.ts';
import { soundManager } from '../core/SoundManager.ts';
import { soundFX } from '../audio/SoundFXManager.ts';
import { SAGA_LEVELS } from './ProgressionState.ts';

export class MetaProgressionBridge {
  public onMilestoneUnlocked?: (event: HistoricalEvent) => void;
  public onFactoryUpgradeUnlocked?: (event: HistoricalEvent) => void;

  constructor() {
    this.initIdleTick();
  }

  /**
   * Generación pasiva continua de monedas (Idle Factory)
   */
  private initIdleTick(): void {
    setInterval(() => {
      const incomePerSec = gameState.getIdleIncomePerSecond();
      gameState.addMoney(incomePerSec);
    }, 1000);
  }

  /**
   * Obtiene la tasa de ingresos pasivos por segundo
   */
  public getIdleRatePerSecond(): number {
    return gameState.getIdleIncomePerSecond();
  }

  /**
   * Registra la victoria de un nivel Match-3
   */
  public registerLevelVictory(level: number, stars: number, _score: number, coins: number): {
    newStarsEarned: number;
    coinsEarned: number;
    nextLevel: number;
    milestoneEvent?: HistoricalEvent;
  } {
    const data = gameState.getData();
    const currentMaxLevel = data.match3CurrentLevel || 1;

    // Validar nivel jugado (no permitir saltos arbitrarios de nivel)
    if (level > currentMaxLevel) {
      console.warn(`[MetaProgressionBridge] Nivel inválido: ${level} (actual: ${currentMaxLevel})`);
      return {
        newStarsEarned: 0,
        coinsEarned: 0,
        nextLevel: currentMaxLevel
      };
    }

    const prevStars = data.match3LevelStars[level] || 0;
    const isNewClear = prevStars === 0;

    // 1. Acreditar dinero ganado ($ USD): Recompensa completa solo en primera victoria (ECO-02)
    const earnedCoins = isNewClear ? Math.max(coins || 0, 750 + (level * 350)) : Math.min(coins || 0, 50);
    if (earnedCoins > 0) {
      gameState.addMoney(earnedCoins);
    }

    // 2. Acreditar Estrellas de victoria y avanzar nivel
    if (stars > prevStars) {
      gameState.setMatch3LevelStars(level, stars);
    }

    if (isNewClear) {
      gameState.addMatch3Stars(1);
    }

    // Avanzamos al nivel siguiente si ganamos el nivel actual alcanzado, con tope en nivel 75 (PRG-02)
    if (level === currentMaxLevel && level < 75) {
      gameState.setMatch3Level(level + 1);
    }

    // 3. Desbloquear automáticamente el Hito Histórico Verificado correspondiente a este nivel
    const levelYear = LEVEL_YEARS[level] || 1951;
    let matchedEvent: HistoricalEvent | null = null;
    for (const era of ERAS_DEFINITION) {
      for (const ev of era.events) {
        if (ev.year === levelYear || Math.abs(ev.year - levelYear) <= 2) {
          matchedEvent = ev;
          break;
        }
      }
      if (matchedEvent) break;
    }

    let newlyUnlockedMilestone: HistoricalEvent | undefined;
    if (matchedEvent) {
      const completed = gameState.questManager.completeMilestoneForLevel(level);
      if (completed) {
        newlyUnlockedMilestone = completed;
        this.applyAutomatedFactoryExpansion(completed);
        if (this.onMilestoneUnlocked) {
          this.onMilestoneUnlocked(completed);
        }
      }
    }

    return {
      newStarsEarned: isNewClear ? 1 : 0,
      coinsEarned: earnedCoins,
      nextLevel: gameState.getData().match3CurrentLevel,
      milestoneEvent: newlyUnlockedMilestone
    };
  }

  /**
   * Obtiene la configuración del nivel Match-3
   */
  /**
   * Obtiene la configuración del nivel Match-3 según la cronología histórica real de Arcor (1 a 75)
   */
  public getLevelConfig(level: number): LevelConfig {
    const safeLevel = Math.max(1, Math.min(75, level));
    const levelDef = SAGA_LEVELS.find(l => l.levelNumber === safeLevel) || SAGA_LEVELS[0];

    // Catálogo de definiciones de dulces
    const candyDefs: Record<CandyType, { icon: string; name: string; year: number }> = {
      caramelo_1951: { icon: '🍬', name: 'Caramelo Arcor (1951)', year: 1951 },
      minty: { icon: '🌿', name: 'Cristal Menta (1951)', year: 1951 },
      caramelo_miel: { icon: '🍯', name: 'Caramelo Miel (1951)', year: 1951 },
      caramelo_frutal: { icon: '🍊', name: 'Caramelo Frutal (1951)', year: 1951 },
      toffee_cubo: { icon: '🧈', name: 'Toffee Tradicional (1960)', year: 1960 },
      aguila: { icon: '🍫', name: 'Trufa Águila (1970)', year: 1970 },
      mogul: { icon: '🐻', name: 'Gomitas Mogul (1983)', year: 1983 },
      bonobon: { icon: '✨', name: 'Bon o Bon (1984)', year: 1984 },
      buttertoffe: { icon: '👑', name: 'Butter Toffees (1985)', year: 1985 },
      cofler: { icon: '🍫', name: 'Tableta Cofler (1993)', year: 1993 },
      rocklets: { icon: '🌈', name: 'Confites Rocklets (1996)', year: 1996 }
    };

    // Identificar si este nivel desbloquea un nuevo producto Arcor oficial (hito histórico)
    let newUnlockedProduct: ArcorProductInfo | undefined;
    for (const prod of Object.values(ARCOR_HISTORIC_PRODUCTS)) {
      if (prod.unlockedAtLevel === safeLevel) {
        // En nivel 1 destacamos el Caramelo Clásico fundacional
        if (safeLevel === 1 && prod.type !== 'caramelo_1951') continue;
        newUnlockedProduct = prod;
        break;
      }
    }

    // 1. Obtener TODOS los caramelos que ya han sido desbloqueados hasta safeLevel
    const unlockedTypes = (Object.keys(ARCOR_HISTORIC_PRODUCTS) as CandyType[]).filter(
      type => ARCOR_HISTORIC_PRODUCTS[type].unlockedAtLevel <= safeLevel
    );

    // 2. Filtrar objetivos definidos en SagaLevelsData: NUNCA permitir dulces de niveles futuros
    const rawTargets = (levelDef.targetCandies || []) as CandyType[];
    const validTargetsFromDef = rawTargets.filter(
      type => ARCOR_HISTORIC_PRODUCTS[type] && ARCOR_HISTORIC_PRODUCTS[type].unlockedAtLevel <= safeLevel
    );

    // 3. Determinar objetivos del nivel (mínimo 2, hasta 3)
    const targetTypes: CandyType[] = [];
    // Si este nivel desbloquea un dulce histórico, colocarlo como primer objetivo para celebrarlo
    if (newUnlockedProduct && safeLevel > 1) {
      targetTypes.push(newUnlockedProduct.type);
    }
    for (const t of validTargetsFromDef) {
      if (targetTypes.length >= 3) break;
      if (!targetTypes.includes(t)) targetTypes.push(t);
    }
    while (targetTypes.length < (safeLevel >= 3 ? 3 : 2)) {
      for (const c of unlockedTypes) {
        if (!targetTypes.includes(c)) {
          targetTypes.push(c);
          break;
        }
      }
    }

    // 4. Determinar allowedCandies:
    // REGLA CRÍTICA ABSOLUTA: Ningún caramelo puede aparecer en el tablero antes de su nivel de desbloqueo.
    // Variedad requerida:
    // Niveles 1-9: 4 variedades (los 4 dulces iniciales de 1951)
    // Niveles 10-32: 4-5 variedades
    // Niveles 33-54: 5 variedades
    // Niveles 55+: 5-6 variedades
    const allowedSet = new Set<CandyType>();

    // Primero agregamos todos los targetTypes del nivel
    for (const t of targetTypes) {
      allowedSet.add(t);
    }
    // Si hay un dulce recién desbloqueado, asegurar su presencia
    if (newUnlockedProduct) {
      allowedSet.add(newUnlockedProduct.type);
    }

    // Variedad equilibrada (4 colores al inicio, máximo 5 colores para mantener fluidez y combos)
    const desiredVarietyCount = safeLevel < 10 ? 4 : 5;

    // Rellenar desde unlockedTypes rotando para asegurar frescura y variedad sin filtrar futuros
    const offset = safeLevel % unlockedTypes.length;
    const rotatedPool = [...unlockedTypes.slice(offset), ...unlockedTypes.slice(0, offset)];

    for (const cand of rotatedPool) {
      if (allowedSet.size >= desiredVarietyCount) break;
      allowedSet.add(cand);
    }
    // Si aún no se alcanza la variedad mínima, rellenar de unlockedTypes
    for (const cand of unlockedTypes) {
      if (allowedSet.size >= Math.min(unlockedTypes.length, 4)) break;
      allowedSet.add(cand);
    }

    const allowedCandies = Array.from(allowedSet);

    // Movimientos equilibrados: 28 a 38 movimientos para progresión justa (PRG-01)
    const baseMoves = Math.min(38, Math.max(28, Math.round(28 + (safeLevel - 1) * (10 / 74))));
    const moves = levelDef.isSpecialMilestone ? baseMoves + 4 : baseMoves;

    // Cantidades requeridas calibradas para ritmo justo (de ~32 piezas totales en Nivel 1 a ~76 en Nivel 75)
    const baseTargetQty = Math.round(18 + (safeLevel - 1) * (14 / 74));

    const objectives: LevelObjective[] = targetTypes.map((t, idx) => {
      let qty = baseTargetQty;
      if (idx === 1) qty = Math.max(12, Math.round(baseTargetQty * 0.8));
      else if (idx === 2) qty = Math.max(10, Math.round(baseTargetQty * 0.65));
      const def = candyDefs[t] || { icon: '🍬', name: t, year: 1951 };
      return {
        type: t,
        target: qty,
        current: 0,
        ...def
      };
    });

    // Puntuación de estrellas adaptada al ritmo de juego completo
    const starScores: [number, number, number] = [
      Math.round(4500 + safeLevel * 350),
      Math.round(10000 + safeLevel * 750),
      Math.round(17500 + safeLevel * 1200)
    ];

    return {
      levelNumber: safeLevel,
      moves,
      objectives,
      starScores,
      allowedCandies,
      newUnlockedProduct
    };
  }

  /**
   * Obtiene el próximo hito histórico disponible para desbloquear con estrellas
   */
  public getNextStoryMilestone(): HistoricalEvent | null {
    const data = gameState.getData();
    const completed = new Set(data.completedQuests || []);

    for (const era of ERAS_DEFINITION) {
      for (const event of era.events) {
        if (!completed.has(event.id)) {
          return event;
        }
      }
    }
    return null;
  }

  /**
   * Ejecuta la mejora automática de la fábrica al gastar 1 Estrella ⭐
   */
  public progressStoryMilestone(): { success: boolean; event?: HistoricalEvent; message: string } {
    const data = gameState.getData();

    if ((data.match3Stars || 0) < 1) {
      return { success: false, message: 'Necesitas al menos 1 Estrella ⭐ ganada en Match-3.' };
    }

    const nextEvent = this.getNextStoryMilestone();
    if (!nextEvent) {
      return { success: false, message: '¡Has completado todos los hitos históricos de Arcor!' };
    }

    // 1. Deducir estrella y registrar hito completado
    gameState.useMatch3Stars(1);
    gameState.addCompletedQuest(nextEvent.id);
    gameState.setCurrentYear(nextEvent.year);
    gameState.unlockCard(nextEvent.id);

    // 2. Aplicar mejoras automáticas al diorama 3D
    this.applyAutomatedFactoryExpansion(nextEvent);

    soundManager.playFanfare();
    soundFX.playLevelWin();

    if (this.onMilestoneUnlocked) {
      this.onMilestoneUnlocked(nextEvent);
    }

    return {
      success: true,
      event: nextEvent,
      message: `¡Hito ${nextEvent.year} desbloqueado! La fábrica se expande automáticamente.`
    };
  }

  /**
   * Desencadena la mejora visual en la fábrica histórica animada
   */
  private applyAutomatedFactoryExpansion(event: HistoricalEvent): void {
    soundManager.playFanfare();
    if (this.onFactoryUpgradeUnlocked) {
      this.onFactoryUpgradeUnlocked(event);
    }
  }
}
