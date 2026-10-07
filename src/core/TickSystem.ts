export type TickCallback = (deltaTime: number) => void;

export class TickSystem {
  private accumulator: number = 0;
  private readonly tickInterval: number = 1.5; // Segundos por tick de simulación
  private isPaused: boolean = true;
  private callbacks: Set<TickCallback> = new Set();

  public subscribe(cb: TickCallback): () => void {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  public update(delta: number): void {
    if (this.isPaused) return;

    this.accumulator += delta;
    while (this.accumulator >= this.tickInterval) {
      this.accumulator -= this.tickInterval;
      this.callbacks.forEach(cb => cb(this.tickInterval));
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public toggle(): boolean {
    this.isPaused = !this.isPaused;
    return !this.isPaused;
  }

  public getPaused(): boolean {
    return this.isPaused;
  }
}

export const tickSystem = new TickSystem();
