/**
 * ACHIEVEMENTS MANAGER: SISTEMA GLOBAL DE LOGROS Y RECOMPENSAS
 * 
 * Monitorea el progreso en Candy Crush, Quiz, Creación de Productos, Cajas Obsequio y Colección.
 * Dispara notificaciones toast doradas con sonido y otorga recompensas reclamables.
 */

import { gameState } from './GameState.ts';
import { soundManager } from '../core/SoundManager.ts';
import { customizationManager } from './CustomizationManager.ts';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'juego' | 'quiz' | 'taller' | 'coleccion';
  rewardText: string;
  rewardCoins: number;
  maxProgress: number;
}

export interface AchievementProgress {
  unlocked: boolean;
  claimed: boolean;
  currentProgress: number;
  unlockedAt?: number;
}

export const ACHIEVEMENTS_CATALOG: AchievementDef[] = [
  {
    id: 'ach_level_1',
    title: 'Primer Dulce Industrial',
    description: 'Completar el Nivel 1 de Arcor Crush (Arroyito 1951).',
    icon: '🍬',
    category: 'juego',
    rewardText: '+$200 USD',
    rewardCoins: 200,
    maxProgress: 1
  },
  {
    id: 'ach_level_10',
    title: 'Maestro de la Paila',
    description: 'Superar con éxito el Nivel 10 de Arcor Crush.',
    icon: '🏭',
    category: 'juego',
    rewardText: '+$500 USD',
    rewardCoins: 500,
    maxProgress: 10
  },
  {
    id: 'ach_quiz_1',
    title: 'Curioso de Arroyito',
    description: 'Responder correctamente tu primera pregunta en la Trivia Arcor.',
    icon: '💡',
    category: 'quiz',
    rewardText: '+$150 USD',
    rewardCoins: 150,
    maxProgress: 1
  },
  {
    id: 'ach_quiz_10',
    title: 'Historiador Oficial Arcor',
    description: 'Acertar 10 preguntas de historia y producción en la Trivia.',
    icon: '🎓',
    category: 'quiz',
    rewardText: '+$600 USD',
    rewardCoins: 600,
    maxProgress: 10
  },
  {
    id: 'ach_quiz_points',
    title: 'Mente Brillante',
    description: 'Acumular 1.000 puntos o más en la Trivia Arcor.',
    icon: '⭐',
    category: 'quiz',
    rewardText: '+$750 USD',
    rewardCoins: 750,
    maxProgress: 1000
  },
  {
    id: 'ach_first_product',
    title: 'Diseñador Industrial',
    description: 'Crear y personalizar tu primer producto Arcor en el Taller.',
    icon: '🎨',
    category: 'taller',
    rewardText: '+$300 USD',
    rewardCoins: 300,
    maxProgress: 1
  },
  {
    id: 'ach_three_products',
    title: 'Línea de Producción Propia',
    description: 'Diseñar y guardar 3 productos personalizados en tu colección.',
    icon: '📦',
    category: 'taller',
    rewardText: '+$500 USD',
    rewardCoins: 500,
    maxProgress: 3
  },
  {
    id: 'ach_first_box',
    title: 'El Regalo Más Dulce',
    description: 'Armar tu primera caja obsequio con dedicatoria y moño.',
    icon: '🎁',
    category: 'taller',
    rewardText: '+$300 USD',
    rewardCoins: 300,
    maxProgress: 1
  },
  {
    id: 'ach_three_boxes',
    title: 'Embajador del Afecto',
    description: 'Diseñar y cerrar 3 cajas obsequio con distintas temáticas.',
    icon: '🎀',
    category: 'taller',
    rewardText: '+$600 USD',
    rewardCoins: 600,
    maxProgress: 3
  },
  {
    id: 'ach_five_unlocks',
    title: 'Coleccionista 75 Años',
    description: 'Desbloquear 5 elementos creativos (packagings, stickers o cajas).',
    icon: '🔓',
    category: 'coleccion',
    rewardText: '+$400 USD',
    rewardCoins: 400,
    maxProgress: 5
  },
  {
    id: 'ach_full_lives',
    title: 'Energía al Máximo',
    description: 'Tener tus 5 vidas completas listas para jugar Match-3.',
    icon: '❤️',
    category: 'juego',
    rewardText: '+$250 USD',
    rewardCoins: 250,
    maxProgress: 5
  },
  {
    id: 'ach_collection_master',
    title: 'El Gran Imperio Dulce',
    description: 'Alcanzar el 75% o más de toda la colección de elementos de Arcor.',
    icon: '👑',
    category: 'coleccion',
    rewardText: '+$1.500 USD y Trofeo 75 Años',
    rewardCoins: 1500,
    maxProgress: 75
  }
];

export class AchievementsManager {
  private static instance: AchievementsManager;

  private progressMap: Record<string, AchievementProgress> = {};
  private static STORAGE_KEY = 'arcor_achievements_state_v1';

  // Listeners
  private onUnlockedListeners: Set<(ach: AchievementDef) => void> = new Set();

  private constructor() {
    this.load();
    if (typeof gameState !== 'undefined' && gameState?.onReset) {
      gameState.onReset(() => this.reset());
    } else {
      setTimeout(() => {
        if (typeof gameState !== 'undefined' && gameState?.onReset) {
          gameState.onReset(() => this.reset());
        }
      }, 0);
    }
  }

  public static getInstance(): AchievementsManager {
    if (!AchievementsManager.instance) {
      AchievementsManager.instance = new AchievementsManager();
    }
    return AchievementsManager.instance;
  }

  private load(): void {
    this.progressMap = {};

    try {
      const raw = localStorage.getItem(AchievementsManager.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          this.progressMap = parsed;
        } else {
          console.warn('[AchievementsManager] Clave corrupta en achievements state. Poniendo en cuarentena (F-02).');
          localStorage.setItem(`${AchievementsManager.STORAGE_KEY}_corrupted_${Date.now()}`, raw);
        }
      }
    } catch (e) {
      console.warn('Error loading achievements:', e);
      try {
        const raw = localStorage.getItem(AchievementsManager.STORAGE_KEY);
        if (raw) localStorage.setItem(`${AchievementsManager.STORAGE_KEY}_corrupted_${Date.now()}`, raw);
      } catch {}
    }

    // Garantizar que this.progressMap siempre sea un objeto válido
    if (!this.progressMap || typeof this.progressMap !== 'object' || Array.isArray(this.progressMap)) {
      this.progressMap = {};
    }

    // Inicializar achievements no presentes
    ACHIEVEMENTS_CATALOG.forEach(ach => {
      const existing = this.progressMap[ach.id];
      if (!existing || typeof existing !== 'object') {
        this.progressMap[ach.id] = {
          unlocked: false,
          claimed: false,
          currentProgress: 0
        };
      }
    });
  }

  private save(): void {
    try {
      localStorage.setItem(AchievementsManager.STORAGE_KEY, JSON.stringify(this.progressMap));
    } catch (e) {
      console.warn('Error saving achievements:', e);
    }
  }

  public reset(): void {
    this.progressMap = {};
    ACHIEVEMENTS_CATALOG.forEach(ach => {
      this.progressMap[ach.id] = {
        unlocked: false,
        claimed: false,
        currentProgress: 0
      };
    });
    this.save();
  }

  public onAchievementUnlocked(cb: (ach: AchievementDef) => void): () => void {
    this.onUnlockedListeners.add(cb);
    return () => this.onUnlockedListeners.delete(cb);
  }

  public getProgress(achId: string): AchievementProgress {
    return this.progressMap[achId] || { unlocked: false, claimed: false, currentProgress: 0 };
  }

  /**
   * Actualiza el progreso de un logro
   */
  public reportProgress(achId: string, currentVal: number): void {
    const ach = ACHIEVEMENTS_CATALOG.find(a => a.id === achId);
    if (!ach) return;

    let p = this.progressMap[achId];
    if (!p) {
      p = { unlocked: false, claimed: false, currentProgress: 0 };
      this.progressMap[achId] = p;
    }

    p.currentProgress = Math.max(p.currentProgress, currentVal);

    if (!p.unlocked && p.currentProgress >= ach.maxProgress) {
      p.unlocked = true;
      p.unlockedAt = Date.now();
      this.save();
      this.triggerUnlockedNotification(ach);
    } else {
      this.save();
    }
  }

  /**
   * Dispara verificación masiva de logros
   */
  public checkAll(): void {
    const data = gameState.getData() as any;
    const stats = customizationManager.getCollectionStatistics();

    // 1. Niveles
    const curLvl = data.match3CurrentLevel || 1;
    this.reportProgress('ach_level_1', curLvl > 1 ? 1 : 0);
    this.reportProgress('ach_level_10', curLvl >= 10 ? 10 : curLvl);

    // 2. Quiz
    const quizCorrect = data.totalQuizCorrect || 0;
    const quizScore = data.totalQuizScore || 0;
    this.reportProgress('ach_quiz_1', quizCorrect >= 1 ? 1 : 0);
    this.reportProgress('ach_quiz_10', Math.min(10, quizCorrect));
    this.reportProgress('ach_quiz_points', Math.min(1000, quizScore));

    // 3. Taller
    const prodsCount = stats.customProductsCreated;
    const boxesCount = stats.giftBoxesCreated;
    this.reportProgress('ach_first_product', prodsCount >= 1 ? 1 : 0);
    this.reportProgress('ach_three_products', Math.min(3, prodsCount));
    this.reportProgress('ach_first_box', boxesCount >= 1 ? 1 : 0);
    this.reportProgress('ach_three_boxes', Math.min(3, boxesCount));

    // 4. Colección: solo contar elementos desbloqueados mediante logros o progresión (LOGR-01)
    this.reportProgress('ach_five_unlocks', Math.min(5, stats.unlockedByProgressionItems));
    this.reportProgress('ach_collection_master', stats.percentage);

    // 5. Vidas: requiere que el jugador haya comenzado a jugar activamente (LOGR-01)
    const hasPlayed = (data.match3CurrentLevel || 1) > 1 || (data.match3Stars || 0) > 0 || (data.completedQuests && data.completedQuests.length > 0);
    const lives = data.lives ?? 5;
    if (hasPlayed && lives >= 5) {
      this.reportProgress('ach_full_lives', 5);
    }
  }

  /**
   * Reclama la recompensa de un logro desbloqueado
   */
  public claimReward(achId: string): boolean {
    const ach = ACHIEVEMENTS_CATALOG.find(a => a.id === achId);
    const p = this.progressMap[achId];
    if (!ach || !p || !p.unlocked || p.claimed) return false;

    p.claimed = true;
    this.save();

    // Otorgar dinero real en el estado del juego
    gameState.addMoney(ach.rewardCoins);
    soundManager.playFanfare();

    return true;
  }

  /**
   * Notificación visual y sonora cuando se desbloquea un logro
   */
  private triggerUnlockedNotification(ach: AchievementDef): void {
    soundManager.playFanfare();
    this.onUnlockedListeners.forEach(cb => cb(ach));
    this.showToastAchievement(ach);
  }

  private showToastAchievement(ach: AchievementDef): void {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast-card';
    toast.innerHTML = `
      <div class="ach-toast-icon">${ach.icon}</div>
      <div class="ach-toast-body">
        <span class="ach-toast-tag">🏆 ¡LOGRO DESBLOQUEADO!</span>
        <h4 class="ach-toast-title">${ach.title}</h4>
        <span class="ach-toast-reward">${ach.rewardText}</span>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 4200);
  }

  public getSummary(): { total: number; unlocked: number; claimed: number } {
    let unlocked = 0;
    let claimed = 0;
    ACHIEVEMENTS_CATALOG.forEach(a => {
      const p = this.progressMap[a.id];
      if (p?.unlocked) unlocked++;
      if (p?.claimed) claimed++;
    });
    return {
      total: ACHIEVEMENTS_CATALOG.length,
      unlocked,
      claimed
    };
  }
}

export const achievementsManager = AchievementsManager.getInstance();
