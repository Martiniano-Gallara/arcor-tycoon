export type TimeSpeed = 0 | 1 | 2;

export interface TimeState {
  currentDay: number;
  currentMonth: number;
  currentYear: number;
  speed: TimeSpeed;
  isPaused: boolean;
  dayProgress: number; // 0 a 1
}

export type DayTickCallback = (day: number, month: number, year: number) => void;
export type MonthTickCallback = (month: number, year: number) => void;
export type YearTickCallback = (year: number) => void;
export type SpeedChangeCallback = (speed: TimeSpeed, isPaused: boolean) => void;

/**
 * TimeManager: Calibrador del tiempo histórico del juego.
 * 
 * FÓRMULA TYCOON BALANCEADA:
 * - 1 DÍA DE JUEGO = 5.0 segundos reales (en velocidad 1x)
 * - 1 MES DE JUEGO = 30.0 segundos reales (6 días representativos por mes)
 * - 1 AÑO COMPLETO = 360.0 segundos reales (6 minutos de juego activo)
 * - 1 DÉCADA = ~60 minutos de juego activo equilibrado
 */
export class TimeManager {
  // Constantes de calibración
  public static readonly SECONDS_PER_DAY = 5.0;
  public static readonly DAYS_PER_MONTH = 6;
  public static readonly MONTHS_PER_YEAR = 12;

  private speed: TimeSpeed = 1;
  private isPaused: boolean = false;

  private dayAccumulator: number = 0;
  private currentDay: number = 1;

  private onDayTickCallbacks: Set<DayTickCallback> = new Set();
  private onMonthTickCallbacks: Set<MonthTickCallback> = new Set();
  private onYearTickCallbacks: Set<YearTickCallback> = new Set();
  private onSpeedChangeCallbacks: Set<SpeedChangeCallback> = new Set();

  constructor() {}

  public subscribeDay(cb: DayTickCallback): () => void {
    this.onDayTickCallbacks.add(cb);
    return () => this.onDayTickCallbacks.delete(cb);
  }

  public subscribeMonth(cb: MonthTickCallback): () => void {
    this.onMonthTickCallbacks.add(cb);
    return () => this.onMonthTickCallbacks.delete(cb);
  }

  public subscribeYear(cb: YearTickCallback): () => void {
    this.onYearTickCallbacks.add(cb);
    return () => this.onYearTickCallbacks.delete(cb);
  }

  public subscribeSpeed(cb: SpeedChangeCallback): () => void {
    this.onSpeedChangeCallbacks.add(cb);
    return () => this.onSpeedChangeCallbacks.delete(cb);
  }

  public setSpeed(newSpeed: TimeSpeed): void {
    this.speed = newSpeed;
    this.isPaused = (newSpeed === 0);
    this.notifySpeedChange();
  }

  public pause(): void {
    this.isPaused = true;
    this.notifySpeedChange();
  }

  public resume(): void {
    this.isPaused = false;
    if (this.speed === 0) this.speed = 1;
    this.notifySpeedChange();
  }

  public togglePause(): boolean {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
    return this.isPaused;
  }

  public getSpeed(): TimeSpeed {
    return this.speed;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public getEffectiveMultiplier(): number {
    if (this.isPaused) return 0;
    return this.speed; // 1.0 o 2.0
  }

  public getCurrentDay(): number {
    return this.currentDay;
  }

  public getDayProgress(): number {
    return Math.min(1, this.dayAccumulator / TimeManager.SECONDS_PER_DAY);
  }

  /**
   * Actualización en cada frame del bucle principal
   */
  public update(delta: number, currentMonth: number, currentYear: number): void {
    if (this.isPaused || this.speed === 0) return;

    const scaledDelta = delta * this.speed;
    this.dayAccumulator += scaledDelta;

    while (this.dayAccumulator >= TimeManager.SECONDS_PER_DAY) {
      this.dayAccumulator -= TimeManager.SECONDS_PER_DAY;
      this.currentDay += 1;

      // Disparar evento de nuevo día
      this.onDayTickCallbacks.forEach(cb => cb(this.currentDay, currentMonth, currentYear));

      // Si se completaron los días del mes (6 días = 30 segundos)
      if (this.currentDay > TimeManager.DAYS_PER_MONTH) {
        this.currentDay = 1;
        
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > TimeManager.MONTHS_PER_YEAR) {
          nextMonth = 1;
          nextYear += 1;
          this.onYearTickCallbacks.forEach(cb => cb(nextYear));
        }

        // Disparar evento de nuevo mes
        this.onMonthTickCallbacks.forEach(cb => cb(nextMonth, nextYear));
      }
    }
  }

  private notifySpeedChange(): void {
    this.onSpeedChangeCallbacks.forEach(cb => cb(this.speed, this.isPaused));
  }
}

export const timeManager = new TimeManager();
