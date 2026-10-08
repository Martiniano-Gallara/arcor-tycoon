export type RenderCallback = (delta: number, elapsed: number) => void;

export class GameLoop {
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private renderCallbacks: Set<RenderCallback> = new Set();
  private maxDelta: number = 0.1; // Para prevenir saltos tras inactividad en tab

  public add(cb: RenderCallback): () => void {
    this.renderCallbacks.add(cb);
    return () => this.renderCallbacks.delete(cb);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop(currentTime: number): void {
    if (!this.isRunning) return;

    // Reprogramar el siguiente frame primero para evitar que una excepción detenga el bucle (F-04)
    this.animationFrameId = requestAnimationFrame(this.loop);

    let delta = (currentTime - this.lastTime) / 1000;
    if (delta > this.maxDelta) delta = this.maxDelta;
    this.lastTime = currentTime;

    const elapsed = currentTime / 1000;
    for (const cb of this.renderCallbacks) {
      try {
        cb(delta, elapsed);
      } catch (err) {
        console.error('Error en callback de render de GameLoop:', err);
      }
    }
  }
}

export const gameLoop = new GameLoop();
