import { ERAS_DEFINITION, HistoricalEvent, getAllChronologicalEvents } from './historyEras.ts';
import { gameState, LEVEL_YEARS } from './GameState.ts';

export type EventCompletedListener = (event: HistoricalEvent) => void;
export type DecisionRequiredListener = (event: HistoricalEvent) => void;

/**
 * QuestManager: Gestiona los hitos históricos activos vinculados directamente
 * a la progresión lineal de Arcor Crush (Niveles 1 a 12).
 */
export class QuestManager {
  private allEvents: HistoricalEvent[];
  private completedEventIds: Set<string> = new Set();
  private onEventCompletedListeners: Set<EventCompletedListener> = new Set();
  private onDecisionRequiredListeners: Set<DecisionRequiredListener> = new Set();

  constructor(initialCompletedIds: string[] = []) {
    this.allEvents = getAllChronologicalEvents();
    this.completedEventIds = new Set(initialCompletedIds);
  }

  /**
   * Obtiene el hito histórico correspondiente al nivel actual de Arcor Crush
   */
  public getCurrentEvent(): HistoricalEvent | null {
    const data = gameState.getData();
    const currentLevel = data.match3CurrentLevel || 1;
    const targetYear = LEVEL_YEARS[currentLevel] || 1951;

    // Buscar el evento histórico verificado para este año
    const found = this.allEvents.find(e => e.year === targetYear)
      || this.allEvents.find(e => Math.abs(e.year - targetYear) <= 2)
      || this.allEvents[Math.min(currentLevel, this.allEvents.length - 1)];

    return found || null;
  }

  /**
   * Obtiene el progreso del hito histórico actual (si se completó el nivel de Arcor Crush)
   */
  public getCurrentProgress(): { current: number; target: number; percentage: number } {
    const data = gameState.getData();
    const currentLevel = data.match3CurrentLevel || 1;
    const stars = data.match3LevelStars?.[currentLevel] || 0;
    const isCompleted = stars > 0;

    return {
      current: isCompleted ? 1 : 0,
      target: 1,
      percentage: isCompleted ? 100 : 0
    };
  }

  public subscribeEventCompleted(listener: EventCompletedListener): () => void {
    this.onEventCompletedListeners.add(listener);
    return () => this.onEventCompletedListeners.delete(listener);
  }

  public subscribeDecisionRequired(listener: DecisionRequiredListener): () => void {
    this.onDecisionRequiredListeners.add(listener);
    return () => this.onDecisionRequiredListeners.delete(listener);
  }

  /**
   * Completa el hito histórico del nivel superado y notifica a los suscriptores
   */
  public completeMilestoneForLevel(level: number): HistoricalEvent | null {
    const targetYear = LEVEL_YEARS[level] || 1951;
    const event = this.allEvents.find(e => e.year === targetYear)
      || this.allEvents.find(e => Math.abs(e.year - targetYear) <= 2);

    if (event) {
      if (this.completedEventIds.has(event.id)) {
        return null;
      }
      this.completedEventIds.add(event.id);
      gameState.addCompletedQuest(event.id);
      this.onEventCompletedListeners.forEach(cb => cb(event));
      return event;
    }
    return null;
  }

  /**
   * Compatibilidad hacia atrás (stubs seguros sin microgestión)
   */
  public trackProduction(_resource: string, _amount: number): {
    completedEvent: HistoricalEvent | null;
    isDecisionPending: boolean;
  } {
    return { completedEvent: null, isDecisionPending: false };
  }

  public resolveDecision(acceptedHonorably: boolean): { completedEvent: HistoricalEvent | null; rewardReputation: number } {
    const active = this.getCurrentEvent();
    if (!active || !active.isDecisionEvent) return { completedEvent: null, rewardReputation: 0 };

    if (acceptedHonorably) {
      this.completedEventIds.add(active.id);
      gameState.addCompletedQuest(active.id);
      this.onEventCompletedListeners.forEach(cb => cb(active));
      return { completedEvent: active, rewardReputation: 100 };
    }
    return { completedEvent: null, rewardReputation: 0 };
  }

  public getCompletedIds(): string[] {
    return Array.from(this.completedEventIds);
  }

  public getCurrentEra(): { eraId: number; eraName: string; startYear: number; endYear: number } {
    const ev = this.getCurrentEvent();
    if (!ev) {
      const last = ERAS_DEFINITION[ERAS_DEFINITION.length - 1];
      return { eraId: last.eraId, eraName: last.eraName, startYear: last.startYear, endYear: last.endYear };
    }
    const era = ERAS_DEFINITION.find(e => ev.year >= e.startYear && ev.year <= e.endYear) || ERAS_DEFINITION[1];
    return { eraId: era.eraId, eraName: era.eraName, startYear: era.startYear, endYear: era.endYear };
  }
}

