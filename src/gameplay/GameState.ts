import { SaveManager, GameSaveData, createDefaultSaveData, PlacedBuildingSave, WorkerSaveData } from '../core/SaveManager.ts';
import { ERAS_DEFINITION, EraDefinition, HistoricalEvent } from './historyEras.ts';
import { QuestManager } from './QuestManager.ts';
import { LogisticsSystem, DeliveryContract } from './LogisticsSystem.ts';
import { soundManager } from '../core/SoundManager.ts';
import { proceduralMusic } from '../audio/ProceduralMusic.ts';
import { achievementsManager } from './AchievementsManager.ts';
import { customizationManager } from './CustomizationManager.ts';

export type StateListener = (state: GameSaveData) => void;

/**
 * Mapeo exacto entre cada nivel verificado de Arcor Crush y su año histórico
 */
/**
 * Mapeo exacto entre cada nivel verificado de Arcor Crush (1 a 75) y su año histórico (1951 a 2025)
 */
export const LEVEL_YEARS: Record<number, number> = {};
for (let lvl = 1; lvl <= 75; lvl++) {
  LEVEL_YEARS[lvl] = 1950 + lvl;
}

export class GameState {
  private data: GameSaveData;
  private listeners: Set<StateListener> = new Set();
  public questManager: QuestManager;
  public logisticsSystem: LogisticsSystem;

  private passiveIncomeTimer: number = 0;
  private saveDebounceTimer: any = null;
  public onFactoryProduced?: (building: PlacedBuildingSave, productKey: string, amount: number) => void;

  constructor() {
    this.data = SaveManager.load();

    // Sincronización multi-pestaña en tiempo real (PER-01)
    SaveManager.onExternalChange((incoming) => {
      if ((incoming.savedAt || 0) > (this.data.savedAt || 0)) {
        this.data = incoming;
        this.listeners.forEach(cb => cb(this.data));
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushSave());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flushSave();
        }
      });
    }

    // Asegurar 2.500 USD por defecto para iniciar con buen impulso
    if (!this.data.hasReceivedDefault2500USD) {
      this.data.money = Math.max(2500, (this.data.money || 0) + 2000);
      this.data.hasReceivedDefault2500USD = true;
      SaveManager.save(this.data);
    }

    // Sincronizar año actual con el nivel alcanzado en Arcor Crush
    const curLevel = this.data.match3CurrentLevel || 1;
    const targetYear = LEVEL_YEARS[curLevel] || 1951;
    this.data.currentYear = Math.max(this.data.currentYear || 1951, targetYear);

    this.questManager = new QuestManager(this.data.completedQuests);
    this.logisticsSystem = new LogisticsSystem();

    // Configuración inicial de audio
    soundManager.setSfxVolume(this.data.settings.sfxVolume);
    soundManager.setMusicVolume(this.data.settings.musicVolume);
    proceduralMusic.setVolume(this.data.settings.musicVolume);

    // Guardar al completar eventos
    this.questManager.subscribeEventCompleted((event) => {
      this.data.money += event.quest.rewardCoins;
      this.data.reputation += event.quest.rewardReputation;
      this.data.completedQuests = this.questManager.getCompletedIds();
      this.unlockCard(event.id);
      this.notify();
    });

    // Escuchar despachos de contratos
    this.logisticsSystem.onContractFinished = (contract: DeliveryContract) => {
      this.data.money += contract.rewardMoney;
      this.data.reputation += contract.rewardReputation;
      soundManager.playFanfare();
      this.notify();
    };
  }

  public getData(): Readonly<GameSaveData> {
    return this.data;
  }

  public getCurrentEra(): EraDefinition {
    const activeEv = this.questManager.getCurrentEvent();
    if (!activeEv) return ERAS_DEFINITION[1];
    return ERAS_DEFINITION.find(era => activeEv.year >= era.startYear && activeEv.year <= era.endYear) || ERAS_DEFINITION[1];
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.data);
    return () => this.listeners.delete(listener);
  }

  public flushSave(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
      this.saveDebounceTimer = null;
    }
    this.data.lastActiveTimestamp = Date.now();
    SaveManager.save(this.data);
  }

  public notify(options?: { immediate?: boolean }): void {
    this.data.lastActiveTimestamp = Date.now();
    // Siempre notificamos la UI de memoria de inmediato
    this.listeners.forEach(cb => cb(this.data));

    if (options?.immediate) {
      this.flushSave();
    } else {
      // Debounce para escrituras de disco en localStorage (PERF-01 / PER-01)
      if (!this.saveDebounceTimer) {
        this.saveDebounceTimer = setTimeout(() => {
          this.flushSave();
        }, 4000);
      }
    }
  }

  public advanceMonth(): void {
    this.data.currentMonth += 1;
    if (this.data.currentMonth > 12) {
      this.data.currentMonth = 1;
    }
    this.notify();
  }

  public unlockBranch(branchId: string, cost: number, repBonus: number): boolean {
    if (this.data.money < cost) return false;
    if (this.data.unlockedCards.includes(branchId)) return false;

    this.data.money -= cost;
    this.data.reputation += repBonus;
    this.unlockCard(branchId);
    return true;
  }

  // Métodos stubs retrocompatibles
  public hireWorker(_role: keyof WorkerSaveData): boolean {
    return true;
  }

  public fireWorker(_role: keyof WorkerSaveData): boolean {
    return true;
  }

  public buyRawMaterial(_material: string, _count: number = 5): { success: boolean; message: string } {
    return { success: true, message: 'La fábrica funciona automáticamente mediante Arcor Crush.' };
  }

  public buySugar(_count: number = 5): { success: boolean; message: string } {
    return { success: true, message: 'La fábrica funciona automáticamente mediante Arcor Crush.' };
  }

  public produceCandies(): { success: boolean; message: string; completedEvent: HistoricalEvent | null } {
    return { success: true, message: 'Supera niveles de Arcor Crush para expandir la historia.', completedEvent: null };
  }

  public produceMilkCandies(): { success: boolean; message: string } {
    return { success: true, message: 'La producción se realiza automáticamente.' };
  }

  public produceBonOBon(): { success: boolean; message: string } {
    return { success: true, message: 'La producción se realiza automáticamente.' };
  }

  public setHasSeenPrologue(seen: boolean): void {
    this.data.hasSeenPrologue = seen;
    this.notify();
  }

  public sellCandies(_count: number = 25): { success: boolean; message: string } {
    return { success: true, message: 'Tus ingresos se generan pasivamente por segundo.' };
  }

  public spend(amount: number): boolean {
    if (amount <= 0) return true;
    if (!Number.isFinite(amount)) return false;
    if ((this.data.money || 0) < amount) return false;
    this.data.money = Math.max(0, (this.data.money || 0) - amount);
    this.notify();
    return true;
  }

  public addMoney(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const MAX_MONEY = 1e12;
    this.data.money = Math.min(MAX_MONEY, (this.data.money || 0) + amount);
    this.notify();
  }

  // =========================================================================
  // INGRESOS PASIVOS CONTINUOS DE LA FÁBRICA (ECO-03 UNIFICADO)
  // =========================================================================
  public getIdleIncomePerSecond(): number {
    const levelBonus = (this.data.match3CurrentLevel || 1) * 2;
    const buildingsCount = (this.data.buildings && this.data.buildings.length) || 1;
    const buildingBonus = buildingsCount * 5;
    return 15 + levelBonus + buildingBonus;
  }

  public tick(delta: number, _speedMult: number = 1.0): void {
    this.passiveIncomeTimer += delta;
    if (this.passiveIncomeTimer >= 1.0) {
      const seconds = Math.floor(this.passiveIncomeTimer);
      this.passiveIncomeTimer -= seconds;

      const rate = this.getIdleIncomePerSecond();
      this.addMoney(rate * seconds);
    }
  }

  public checkOfflineGains(): {
    offlineSeconds: number;
    earnedMoney: number;
    earnedCandies: number;
    boxesShipped: number;
  } | null {
    const now = Date.now();
    const last = this.data.lastActiveTimestamp || now;

    // Protección anti-trampa de reloj hacia atrás (TIME-01)
    if (now < last) {
      this.data.lastActiveTimestamp = now;
      this.flushSave();
      return null;
    }

    const diffSeconds = Math.floor((now - last) / 1000);
    if (diffSeconds < 30) {
      this.data.lastActiveTimestamp = now;
      return null;
    }

    // Tope máximo de 8 horas offline (28800 segundos)
    const effectiveSeconds = Math.min(diffSeconds, 28800);
    const rate = this.getIdleIncomePerSecond();
    const earnedMoney = Math.floor(rate * effectiveSeconds * 0.7); // 70% de eficiencia sobre la tasa unificada

    this.data.lastActiveTimestamp = now;
    this.addMoney(earnedMoney);
    this.flushSave();

    return {
      offlineSeconds: effectiveSeconds,
      earnedMoney,
      earnedCandies: Math.floor(effectiveSeconds / 10),
      boxesShipped: Math.floor(effectiveSeconds / 60)
    };
  }

  public unlockCard(cardId: string): void {
    if (!this.data.unlockedCards.includes(cardId)) {
      this.data.unlockedCards.push(cardId);
      this.notify({ immediate: true });
    }
  }

  public resetGame(): void {
    this.data = createDefaultSaveData();
    SaveManager.reset();
    achievementsManager.reset();
    customizationManager.reset();
    SaveManager.save(this.data);
    this.notify({ immediate: true });
  }

  public updateSettings(settings: Partial<GameSaveData['settings']>): void {
    this.data.settings = { ...this.data.settings, ...settings };
    if (typeof settings.sfxVolume === 'number') soundManager.setSfxVolume(settings.sfxVolume);
    if (typeof settings.musicVolume === 'number') {
      soundManager.setMusicVolume(settings.musicVolume);
      proceduralMusic.setVolume(settings.musicVolume);
    }
    SaveManager.save(this.data);
    this.notify();
  }

  // =========================================================================
  // PROGRESIÓN VINCULADA: ARCOR CRUSH ➔ HITOS HISTÓRICOS ➔ CONSTRUCCIÓN
  // =========================================================================
  public setMatch3Level(level: number): void {
    const capped = Math.max(1, Math.min(75, level));
    this.data.match3CurrentLevel = capped;
    const year = LEVEL_YEARS[capped] || 1951;
    this.data.currentYear = Math.max(this.data.currentYear || 1951, year);
    this.notify({ immediate: true });
  }

  public addMatch3Stars(amount: number): void {
    this.data.match3Stars = (this.data.match3Stars || 0) + amount;
    this.notify();
  }

  public useMatch3Stars(amount: number): boolean {
    if ((this.data.match3Stars || 0) >= amount) {
      this.data.match3Stars -= amount;
      this.notify();
      return true;
    }
    return false;
  }

  public setMatch3LevelStars(level: number, stars: number): void {
    if (!this.data.match3LevelStars) this.data.match3LevelStars = {};
    const prev = this.data.match3LevelStars[level] || 0;
    if (stars > prev) {
      this.data.match3LevelStars[level] = stars;
      this.notify();
    }
  }

  public useMatch3Booster(booster: 'hammer' | 'swap' | 'rocklet' | 'bomb'): boolean {
    if (!this.data.match3Boosters) {
      this.data.match3Boosters = { hammer: 3, swap: 3, bomb: 3, rocklet: 3 };
    }
    if ((this.data.match3Boosters[booster] || 0) > 0) {
      this.data.match3Boosters[booster]--;
      this.notify();
      return true;
    }
    return false;
  }

  public setCurrentYear(year: number): void {
    this.data.currentYear = Math.max(this.data.currentYear, year);
    this.notify();
  }

  public addCompletedQuest(questId: string): void {
    if (!this.data.completedQuests.includes(questId)) {
      this.data.completedQuests.push(questId);
      this.notify();
    }
  }

  // =========================================================================
  // MUSEO DEL SABOR - 75 AÑOS DE ARCOR
  // =========================================================================
  public discoverMuseumCandy(candyId: string): boolean {
    if (!this.data.discoveredMuseumCandies) {
      this.data.discoveredMuseumCandies = [];
    }
    if (!this.data.discoveredMuseumCandies.includes(candyId)) {
      this.data.discoveredMuseumCandies.push(candyId);
      this.notify();
      return true;
    }
    return false;
  }

  public isMuseumCandyDiscovered(candyId: string): boolean {
    return (this.data.discoveredMuseumCandies || []).includes(candyId);
  }

  public getDiscoveredMuseumCandies(): string[] {
    return this.data.discoveredMuseumCandies || [];
  }

  // =========================================================================
  // QUIZ HISTÓRICO Y LOGROS
  // =========================================================================
  public recordQuizStats(correctCountDelta: number, scoreDelta: number): void {
    this.data.totalQuizCorrect = (this.data.totalQuizCorrect || 0) + correctCountDelta;
    this.data.totalQuizScore = (this.data.totalQuizScore || 0) + scoreDelta;
    SaveManager.save(this.data);
    this.notify();
  }
}

export const gameState = new GameState();
