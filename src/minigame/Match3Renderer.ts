import { Match3Engine, CandyPiece, CandyType } from './Match3Engine.ts';
import { candySpriteAtlas } from './CandySpriteAtlas.ts';
import { gameState } from '../gameplay/GameState.ts';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'spark' | 'star' | 'confetti' | 'ring';
  rot?: number;
  vrot?: number;
}

interface AmbientMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  color: string;
}

interface FloatText {
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  scale: number;
  isPraise?: boolean;
}

export class Match3Renderer {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private engine: Match3Engine;

  private tileSize: number = 72;
  private boardPixelSize: number = 576;
  private particles: Particle[] = [];
  private floatTexts: FloatText[] = [];
  private ambientMotes: AmbientMote[] = [];

  // Tiempo y animaciones vivas
  private animTime: number = 0;
  private idleTime: number = 0;
  private currentHint: { r1: number; c1: number; r2: number; c2: number } | null = null;
  private shakeIntensity: number = 0;

  // Interacción táctil y arrastre
  private selectedCell: { row: number; col: number } | null = null;
  private dragStartPos: { x: number; y: number } | null = null;
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
  private isDragging: boolean = false;

  // Estado del booster activo
  public activeBooster: 'hammer' | 'swap' | 'mega_rocklet' | null = null;
  public onBoosterChanged?: (active: 'hammer' | 'swap' | 'mega_rocklet' | null) => void;
  private firstSwapCell: { row: number; col: number } | null = null;

  // Animación loop y resize listener
  private animId: number = 0;
  private lastTime: number = 0;
  private isPaused: boolean = false;
  private onWindowResize = () => this.resize();
  private onVisibilityChange = () => {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  };

  constructor(canvas: HTMLCanvasElement, engine: Match3Engine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.engine = engine;

    this.initAmbientMotes();
    this.setupListeners();
    this.setupEngineHooks();
    this.resize();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.startRenderLoop();
  }

  private initAmbientMotes(): void {
    this.ambientMotes = [];
    for (let i = 0; i < 24; i++) {
      this.ambientMotes.push({
        x: Math.random() * 600,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 14,
        vy: -14 - Math.random() * 22,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.45 ? '#ffd700' : '#ffe0b2'
      });
    }
  }

  public resize(): void {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const isMobilePortrait = vw <= 768 && vh > vw;

    let targetSize: number;
    if (isMobilePortrait) {
      // En formato celular vertical (9:16): maximizar tablero hasta el ancho útil o alto disponible
      const availWidth = vw - 28;
      const availHeight = vh - 220;
      const maxDim = Math.min(availWidth, availHeight, 420);
      targetSize = Math.max(260, Math.floor(maxDim));
    } else {
      // Formato escritorio o apaisado: hasta 740px o 78% del alto de pantalla
      const maxDim = Math.min(vh * 0.78, vw * 0.52, 740);
      targetSize = Math.max(340, Math.floor(maxDim));
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.boardPixelSize = targetSize;
    this.tileSize = targetSize / Match3Engine.COLS;

    this.canvas.width = targetSize * dpr;
    this.canvas.height = targetSize * dpr;
    this.canvas.style.width = `${targetSize}px`;
    this.canvas.style.height = `${targetSize}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  public addScreenShake(intensity: number): void {
    this.shakeIntensity = Math.min(15, this.shakeIntensity + intensity);
  }

  private setupEngineHooks(): void {
    this.engine.onMatchTriggered = (pieces, combo) => {
      this.addScreenShake(Math.min(12, 4 + combo * 2.5));
      pieces.forEach(p => {
        const px = (p.col + 0.5) * this.tileSize;
        const py = (p.row + 0.5) * this.tileSize;
        this.spawnBurstParticles(px, py, this.getCandyMainColor(p.type));
      });
    };

    this.engine.onSpecialTriggered = (_type, row, col) => {
      this.addScreenShake(10);
      const px = (col + 0.5) * this.tileSize;
      const py = (row + 0.5) * this.tileSize;
      this.spawnSpecialExplosion(px, py);
    };

    this.engine.onScoreFloat = (text, x, y, color) => {
      const isPraise = text.includes('¡') || text.includes('★') || text.includes('⭐');
      this.floatTexts.push({
        text,
        x: x * this.tileSize,
        y: y * this.tileSize,
        color: color || '#fff8e7',
        alpha: 1,
        life: 0,
        scale: isPraise ? 1.6 : 1.2,
        isPraise
      });
    };
  }

  private setupListeners(): void {
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      this.idleTime = 0;
      this.currentHint = null;
      if (this.engine.isBusy || this.engine.isGameOver) return;
      const pos = getPos(e);
      const col = Math.floor(pos.x / this.tileSize);
      const row = Math.floor(pos.y / this.tileSize);

      if (row >= 0 && row < Match3Engine.ROWS && col >= 0 && col < Match3Engine.COLS) {
        // Manejo de Boosters (se descuentan únicamente al ejecutarse en el tablero - M3-04)
        if (this.activeBooster === 'hammer') {
          if (gameState.useMatch3Booster('hammer')) {
            this.engine.useBoosterHammer(row, col);
          }
          this.activeBooster = null;
          this.onBoosterChanged?.(null);
          return;
        }

        if (this.activeBooster === 'mega_rocklet') {
          if (gameState.useMatch3Booster('rocklet')) {
            this.engine.useBoosterMegaRocklet(row, col);
          }
          this.activeBooster = null;
          this.onBoosterChanged?.(null);
          return;
        }

        if (this.activeBooster === 'swap') {
          if (!this.firstSwapCell) {
            this.firstSwapCell = { row, col };
            this.onBoosterChanged?.('swap');
          } else {
            if (this.firstSwapCell.row !== row || this.firstSwapCell.col !== col) {
              if (gameState.useMatch3Booster('swap')) {
                this.engine.useBoosterSwap(this.firstSwapCell.row, this.firstSwapCell.col, row, col);
              }
            }
            this.firstSwapCell = null;
            this.activeBooster = null;
            this.onBoosterChanged?.(null);
          }
          return;
        }

        // Intercambio por tap/click previo
        if (this.selectedCell) {
          const dist = Math.abs(this.selectedCell.row - row) + Math.abs(this.selectedCell.col - col);
          if (dist === 1) {
            this.engine.trySwap(this.selectedCell.row, this.selectedCell.col, row, col);
            this.selectedCell = null;
            this.isDragging = false;
            return;
          }
        }

        this.selectedCell = { row, col };
        this.dragStartPos = pos;
        this.dragOffset = { x: 0, y: 0 };
        this.isDragging = true;
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      this.idleTime = 0;
      if (!this.isDragging || !this.selectedCell || !this.dragStartPos) return;
      const pos = getPos(e);
      const dx = pos.x - this.dragStartPos.x;
      const dy = pos.y - this.dragStartPos.y;

      // Deslizar con umbral para disparar swap
      const threshold = this.tileSize * 0.40;

      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        let targetRow = this.selectedCell.row;
        let targetCol = this.selectedCell.col;

        if (Math.abs(dx) > Math.abs(dy)) {
          targetCol += dx > 0 ? 1 : -1;
        } else {
          targetRow += dy > 0 ? 1 : -1;
        }

        if (targetRow >= 0 && targetRow < Match3Engine.ROWS && targetCol >= 0 && targetCol < Match3Engine.COLS) {
          this.engine.trySwap(this.selectedCell.row, this.selectedCell.col, targetRow, targetCol);
        }

        this.isDragging = false;
        this.selectedCell = null;
        this.dragStartPos = null;
        this.dragOffset = { x: 0, y: 0 };
      } else {
        this.dragOffset = { x: dx * 0.4, y: dy * 0.4 };
      }
    };

    const onPointerUp = () => {
      this.idleTime = 0;
      this.isDragging = false;
      this.dragOffset = { x: 0, y: 0 };
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
    window.addEventListener('touchcancel', onPointerUp, { passive: true });
    window.addEventListener('blur', onPointerUp);

    window.addEventListener('resize', this.onWindowResize);
  }

  // =========================================================================
  // MOTOR DE RENDERIZADO Y LOOP DE ANIMACIÓN
  // =========================================================================

  private startRenderLoop(): void {
    const loop = (timestamp: number) => {
      if (this.isPaused) return;

      const settings = gameState.getData().settings;
      const targetFps = settings?.fps60 ? 60 : 30;
      const minInterval = (1000 / targetFps) - 2;

      if (this.lastTime && (timestamp - this.lastTime) < minInterval) {
        this.animId = requestAnimationFrame(loop);
        return;
      }

      const dt = this.lastTime ? Math.min(0.1, (timestamp - this.lastTime) / 1000) : 0.016;
      this.lastTime = timestamp;

      this.updatePhysics(dt);
      this.render();

      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  public pause(): void {
    if (this.isPaused) return;
    this.isPaused = true;
    cancelAnimationFrame(this.animId);
  }

  public resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.startRenderLoop();
  }

  public destroy(): void {
    this.pause();
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  private updatePhysics(dt: number): void {
    this.animTime += dt;
    this.idleTime += dt;

    // Buscar sugerencia/pista si el jugador está inactivo por 3.5 segundos
    if (this.idleTime > 3.5 && !this.currentHint && !this.engine.isBusy && !this.engine.isGameOver) {
      this.currentHint = this.engine.findPossibleMove();
    }

    // Decaimiento del screen shake
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 26);
    }

    // Actualizar partículas ambientales dulces
    for (let i = 0; i < this.ambientMotes.length; i++) {
      const m = this.ambientMotes[i];
      m.y += m.vy * dt;
      m.x += Math.sin(this.animTime * 2 + m.phase) * 16 * dt + m.vx * dt;
      if (m.y < -15) {
        m.y = this.boardPixelSize + 15;
        m.x = Math.random() * this.boardPixelSize;
      }
    }

    // 1. Interpolar posiciones visuales con gravedad y rebote elástico
    for (let r = 0; r < Match3Engine.ROWS; r++) {
      for (let c = 0; c < Match3Engine.COLS; c++) {
        const p = this.engine.grid[r][c];
        if (!p) continue;

        // X
        const diffX = c - p.visualX;
        p.visualX += diffX * Math.min(1, dt * 16);

        // Y (gravedad y rebote)
        if (p.visualY < r) {
          p.fallVelocity += 34 * dt;
          p.visualY += p.fallVelocity * dt;
          if (p.visualY >= r) {
            p.visualY = r;
            p.fallVelocity = -p.fallVelocity * 0.28; // Rebote elástico jugoso
            if (Math.abs(p.fallVelocity) < 0.6) p.fallVelocity = 0;
          }
        } else if (p.visualY > r) {
          p.visualY += (r - p.visualY) * Math.min(1, dt * 18);
        }

        // Pop en match
        if (p.isMatched) {
          p.scale = Math.max(0, p.scale - dt * 4.5);
          p.alpha = Math.max(0, p.alpha - dt * 4.0);
        }
      }
    }

    // 2. Partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      if (pt.shape !== 'ring') {
        pt.vy += 380 * dt; // Gravedad
      } else {
        pt.size += 60 * dt; // Expansión de onda de choque
      }
      if (pt.rot !== undefined && pt.vrot !== undefined) {
        pt.rot += pt.vrot * dt;
      }
      pt.life += dt;
      pt.alpha = Math.max(0, 1 - pt.life / pt.maxLife);
      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // 3. Textos flotantes
    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const ft = this.floatTexts[i];
      ft.y -= (ft.isPraise ? 30 : 45) * dt;
      ft.life += dt;
      const maxLife = ft.isPraise ? 1.4 : 1.1;
      ft.alpha = Math.max(0, 1 - ft.life / maxLife);
      ft.scale = (ft.isPraise ? 1.6 : 1.2) + Math.sin(ft.life * 7) * 0.12;
      if (ft.life >= maxLife) {
        this.floatTexts.splice(i, 1);
      }
    }
  }

  private render(): void {
    const ctx = this.ctx;
    const w = this.boardPixelSize;
    const h = this.boardPixelSize;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    // Screen Shake dinámico cuando hay combos o explosiones
    if (this.shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(sx, sy);
    }

    // 1. Fondo del tablero (Caja de chocolate con relieve de lujo)
    this.renderBoardBackground(ctx, w, h);

    // 2. Partículas ambientales dulces
    this.renderAmbientMotes(ctx);

    // 3. Renderizar casillas del tablero
    this.renderBoardCells(ctx);

    // 4. Indicador de pista animada (si existe)
    if (this.currentHint) {
      this.renderHintIndicator(ctx);
    }

    // 5. Renderizar piezas de golosinas Arcor vivas
    for (let r = 0; r < Match3Engine.ROWS; r++) {
      for (let c = 0; c < Match3Engine.COLS; c++) {
        const p = this.engine.grid[r][c];
        if (!p || p.isMatched && p.scale <= 0.01) continue;

        let drawX = (p.visualX + 0.5) * this.tileSize;
        let drawY = (p.visualY + 0.5) * this.tileSize;

        // Si está siendo arrastrado por el dedo
        if (this.isDragging && this.selectedCell && this.selectedCell.row === r && this.selectedCell.col === c) {
          drawX += this.dragOffset.x;
          drawY += this.dragOffset.y;
        }

        this.drawCandyPiece(ctx, drawX, drawY, p);
      }
    }

    // 6. Indicador de celda seleccionada (Aura dorada radiante)
    if (this.selectedCell) {
      const sx = this.selectedCell.col * this.tileSize;
      const sy = this.selectedCell.row * this.tileSize;
      const ts = this.tileSize;
      ctx.save();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ffea00';
      ctx.shadowBlur = 12;
      this.strokeRoundRect(ctx, sx + 4, sy + 4, ts - 8, ts - 8, 14);

      // Esquinas brillantes
      ctx.fillStyle = '#ffffff';
      [
        [sx + 4, sy + 4],
        [sx + ts - 4, sy + 4],
        [sx + 4, sy + ts - 4],
        [sx + ts - 4, sy + ts - 4]
      ].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 7. Partículas y chispas
    this.renderParticles(ctx);

    // 8. Textos flotantes
    this.renderFloatTexts(ctx);

    // 9. Banner de ayuda/booster activo
    if (this.activeBooster) {
      this.renderActiveBoosterBanner(ctx, w);
    }

    ctx.restore();
  }

  private renderActiveBoosterBanner(ctx: CanvasRenderingContext2D, w: number): void {
    ctx.save();
    const bannerH = 34;
    const bannerY = 10;
    const padX = 14;

    let text = '';
    let bgColor = 'rgba(194, 12, 54, 0.95)';
    let borderColor = '#ffaec1';

    if (this.activeBooster === 'hammer') {
      text = '🔨 ¡Toca cualquier caramelo para destruirlo!';
      bgColor = 'rgba(194, 12, 54, 0.95)';
      borderColor = '#ffaec1';
    } else if (this.activeBooster === 'mega_rocklet') {
      text = '🌈 ¡Toca un caramelo para eliminar su color!';
      bgColor = 'rgba(123, 31, 162, 0.95)';
      borderColor = '#e1bee7';
    } else if (this.activeBooster === 'swap') {
      if (!this.firstSwapCell) {
        text = '🧤 ¡Toca el primer caramelo a intercambiar!';
      } else {
        text = '🧤 ¡Toca el segundo caramelo a intercambiar!';
      }
      bgColor = 'rgba(4, 120, 87, 0.95)';
      borderColor = '#6ee7b7';
    }

    ctx.font = 'bold 13px sans-serif';
    const textW = ctx.measureText(text).width;
    const boxW = Math.min(w - 24, textW + padX * 2);
    const boxX = (w - boxW) / 2;

    // Sombra del cartel
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = bgColor;
    this.fillRoundRect(ctx, boxX, bannerY, boxW, bannerH, 12);

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    this.strokeRoundRect(ctx, boxX, bannerY, boxW, bannerH, 12);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, bannerY + bannerH / 2);

    ctx.restore();
  }

  private renderAmbientMotes(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let i = 0; i < this.ambientMotes.length; i++) {
      const m = this.ambientMotes[i];
      ctx.globalAlpha = m.alpha * (0.6 + Math.sin(this.animTime * 3 + m.phase) * 0.4);
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderHintIndicator(ctx: CanvasRenderingContext2D): void {
    if (!this.currentHint) return;
    const ts = this.tileSize;
    const x1 = (this.currentHint.c1 + 0.5) * ts;
    const y1 = (this.currentHint.r1 + 0.5) * ts;
    const x2 = (this.currentHint.c2 + 0.5) * ts;
    const y2 = (this.currentHint.r2 + 0.5) * ts;

    ctx.save();
    const pulseAlpha = 0.35 + Math.sin(this.animTime * 7) * 0.25;
    ctx.strokeStyle = `rgba(255, 215, 0, ${pulseAlpha})`;
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  private fillRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.fill();
  }

  private strokeRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.stroke();
  }

  private renderBoardBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Fondo de chocolate oscuro con textura de bombonera
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
    bgGrad.addColorStop(0, '#2e180d');
    bgGrad.addColorStop(0.7, '#1f0f08');
    bgGrad.addColorStop(1, '#140905');

    ctx.fillStyle = bgGrad;
    this.fillRoundRect(ctx, 0, 0, w, h, 20);

    // Borde biselado de chocolate
    ctx.strokeStyle = '#4a2817';
    ctx.lineWidth = 6;
    this.strokeRoundRect(ctx, 3, 3, w - 6, h - 6, 20);

    // Filete dorado interior
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 1.5;
    this.strokeRoundRect(ctx, 7, 7, w - 14, h - 14, 16);
  }

  private renderBoardCells(ctx: CanvasRenderingContext2D): void {
    const ts = this.tileSize;
    for (let r = 0; r < Match3Engine.ROWS; r++) {
      for (let c = 0; c < Match3Engine.COLS; c++) {
        const x = c * ts;
        const y = r * ts;
        const pad = 3.5;
        const cellW = ts - pad * 2;
        const cellH = ts - pad * 2;
        const cx = x + pad;
        const cy = y + pad;

        // 1. Bisel exterior de chocolate con leche en relieve
        const bevelGrad = ctx.createLinearGradient(cx, cy, cx + cellW, cy + cellH);
        bevelGrad.addColorStop(0, '#542914');
        bevelGrad.addColorStop(0.5, '#3a1b0c');
        bevelGrad.addColorStop(1, '#240e05');
        ctx.fillStyle = bevelGrad;
        this.fillRoundRect(ctx, cx, cy, cellW, cellH, 12);

        // 2. Filete dorado tenue en el reborde del molde
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.lineWidth = 1.2;
        this.strokeRoundRect(ctx, cx + 0.5, cy + 0.5, cellW - 1, cellH - 1, 12);

        // 3. Pozo hundido / Cavidad del molde (chocolate oscuro satinado con profundidad)
        const inPad = 4;
        const inW = cellW - inPad * 2;
        const inH = cellH - inPad * 2;
        const inX = cx + inPad;
        const inY = cy + inPad;

        const cavityGrad = ctx.createRadialGradient(inX + inW / 2, inY + inH / 2, 2, inX + inW / 2, inY + inH / 2, inW * 0.7);
        cavityGrad.addColorStop(0, '#261107');
        cavityGrad.addColorStop(0.65, '#170904');
        cavityGrad.addColorStop(1, '#0e0502');
        ctx.fillStyle = cavityGrad;
        this.fillRoundRect(ctx, inX, inY, inW, inH, 8);

        // 4. Sombra interior superior para dar profundidad 3D de cavidad de bombón
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.fillRoundRect(ctx, inX, inY, inW, 4.5, 3);
      }
    }
  }

  // =========================================================================
  // DIBUJO DE GOLOSINAS ARCOR DE ALTA FIDELIDAD 3D (SPRITES Y ANIMACIONES)
  // =========================================================================

  private drawCandyPiece(ctx: CanvasRenderingContext2D, cx: number, cy: number, p: CandyPiece): void {
    const isHintPiece = this.currentHint && (
      (this.currentHint.r1 === p.row && this.currentHint.c1 === p.col) ||
      (this.currentHint.r2 === p.row && this.currentHint.c2 === p.col)
    );
    const isSelected = this.selectedCell && this.selectedCell.row === p.row && this.selectedCell.col === p.col;

    let pieceScale = p.scale;
    let pieceRot = 0;

    if (isSelected) {
      pieceScale *= 1.15 + Math.sin(this.animTime * 8) * 0.05;
    } else if (isHintPiece) {
      pieceScale *= 1 + Math.sin(this.animTime * 8) * 0.12;
      pieceRot = Math.sin(this.animTime * 8) * 0.08;
    } else {
      // Respiración sutil orgánica de cada caramelo
      pieceScale *= 1 + Math.sin(this.animTime * 2.4 + p.row * 0.7 + p.col * 1.2) * 0.03;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(pieceRot);
    ctx.scale(pieceScale, pieceScale);
    ctx.globalAlpha = p.alpha;

    const r = this.tileSize * 0.39;

    // Halo activo si está seleccionada
    if (isSelected) {
      const halo = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.4);
      halo.addColorStop(0, 'rgba(255, 215, 0, 0.65)');
      halo.addColorStop(1, 'rgba(255, 170, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. Intentar dibujar con el atlas 3D de alta definición de Nano Banana
    const drawn3D = candySpriteAtlas.draw(
      ctx,
      p.type,
      0,
      0,
      r * 2.3, // tamaño generoso para envoltorios y tabletas
      0,
      1,
      1
    );

    // 2. Si todavía no cargó la textura, usar renderizado de respaldo
    if (!drawn3D) {
      switch (p.type) {
        case 'bonobon':
          this.drawBonOBon(ctx, r);
          break;
        case 'caramelo_1951':
        case 'caramelo_miel':
        case 'caramelo_frutal':
          this.drawBonOBon(ctx, r);
          break;
        case 'cofler':
          this.drawCofler(ctx, r);
          break;
        case 'rocklets':
          this.drawRocklets(ctx, r);
          break;
        case 'aguila':
          this.drawAguila(ctx, r);
          break;
        case 'mogul':
          this.drawMogulBear(ctx, r);
          break;
        case 'buttertoffe':
          this.drawButterToffees(ctx, r);
          break;
        case 'toffee_cubo':
          this.drawCofler(ctx, r);
          break;
        case 'minty':
        default:
          this.drawMinty(ctx, r);
          break;
      }
    }

    // Efectos especiales de pieza (Rayado, Bomba, Disco) sobre el sprite 3D
    if (p.special === 'striped_h') {
      this.drawStripedOverlay(ctx, r, true);
    } else if (p.special === 'striped_v') {
      this.drawStripedOverlay(ctx, r, false);
    } else if (p.special === 'wrapped_bomb') {
      this.drawWrappedBombOverlay(ctx, r);
    } else if (p.special === 'disco_rocklet') {
      this.drawDiscoOverlay(ctx, r);
    }

    ctx.restore();
  }

  /** 1. Bon o Bon: Bombón esférico envuelto con moños dorados laterales */
  private drawBonOBon(ctx: CanvasRenderingContext2D, r: number): void {
    // Moño envoltorio izquierdo
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, 0);
    ctx.lineTo(-r * 1.35, -r * 0.65);
    ctx.lineTo(-r * 1.25, 0);
    ctx.lineTo(-r * 1.35, r * 0.65);
    ctx.closePath();
    ctx.fill();

    // Moño envoltorio derecho
    ctx.beginPath();
    ctx.moveTo(r * 0.7, 0);
    ctx.lineTo(r * 1.35, -r * 0.65);
    ctx.lineTo(r * 1.25, 0);
    ctx.lineTo(r * 1.35, r * 0.65);
    ctx.closePath();
    ctx.fill();

    // Sombra del bombón
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Esfera dorada brillante central
    const sphereGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r * 0.85);
    sphereGrad.addColorStop(0, '#fff59d');
    sphereGrad.addColorStop(0.35, '#ffca28');
    sphereGrad.addColorStop(0.85, '#e65100');
    sphereGrad.addColorStop(1, '#bf360c');

    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
    ctx.fill();

    // Círculo rojo central del logo
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.48, 0, Math.PI * 2);
    ctx.fill();

    // Texto "bon o bon"
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(r * 0.25)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('bon', 0, -r * 0.16);
    ctx.fillText('bon', 0, r * 0.16);

    // Brillo especular superior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.25, r * 0.12, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  /** 2. Cofler: Tableta de chocolate marrón con relieve */
  private drawCofler(ctx: CanvasRenderingContext2D, r: number): void {
    const size = r * 1.55;

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    this.fillRoundRect(ctx, -size / 2, -size / 2 + 3, size, size, 8);

    // Cuerpo de chocolate con leche
    const chocGrad = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
    chocGrad.addColorStop(0, '#5d3822');
    chocGrad.addColorStop(0.5, '#442614');
    chocGrad.addColorStop(1, '#2c160a');

    ctx.fillStyle = chocGrad;
    this.fillRoundRect(ctx, -size / 2, -size / 2, size, size, 8);

    // Bisel superior iluminado
    ctx.strokeStyle = '#7c4d32';
    ctx.lineWidth = 1.8;
    this.strokeRoundRect(ctx, -size / 2 + 1, -size / 2 + 1, size - 2, size - 2, 8);

    // Cuadrícula biselada de tableta
    const inSize = size * 0.72;
    ctx.strokeStyle = '#231106';
    ctx.lineWidth = 1.5;
    this.strokeRoundRect(ctx, -inSize / 2, -inSize / 2, inSize, inSize, 4);

    // Relieve "Cofler"
    ctx.fillStyle = '#d7b297';
    ctx.font = `italic bold ${Math.round(r * 0.38)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Cofler', 0, 0);

    // Brillo satinado
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.ellipse(-size * 0.2, -size * 0.2, size * 0.25, size * 0.08, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
  }

  /** 3. Rocklets: Disco de chocolate negro con confites de colores */
  private drawRocklets(ctx: CanvasRenderingContext2D, r: number): void {
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 3, r * 0.88, 0, Math.PI * 2);
    ctx.fill();

    // Base de chocolate negro
    const diskGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r * 0.9);
    diskGrad.addColorStop(0, '#362215');
    diskGrad.addColorStop(0.7, '#1a0d06');
    diskGrad.addColorStop(1, '#0c0502');

    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
    ctx.fill();

    // Confites de colores incrustados alrededor (rojo, amarillo, cyan, verde, naranja)
    const confiteColors = ['#f44336', '#ffeb3b', '#00e5ff', '#4caf50', '#ff9800', '#e91e63'];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = r * 0.52;
      const cx = Math.cos(angle) * dist;
      const cy = Math.sin(angle) * dist;

      // Confite
      ctx.fillStyle = confiteColors[i];
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Brillo en el confite
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(cx - r * 0.06, cy - r * 0.06, r * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }

    // Arco de texto "ROCKLETS"
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(r * 0.26)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ROCKLETS', 0, 0);
  }

  /** 4. Águila: Chocolate macizo fino con silueta de montaña */
  private drawAguila(ctx: CanvasRenderingContext2D, r: number): void {
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 3, r * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Medallón de chocolate oscuro puro
    const pureGrad = ctx.createLinearGradient(-r, -r, r, r);
    pureGrad.addColorStop(0, '#f2ece4');
    pureGrad.addColorStop(0.5, '#e4d6c3');
    pureGrad.addColorStop(1, '#caa789');

    ctx.fillStyle = pureGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Borde cincelado
    ctx.strokeStyle = '#7c583f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
    ctx.stroke();

    // Silueta de tres picos montañosos Águila
    ctx.fillStyle = '#4a2f1c';
    ctx.beginPath();
    ctx.moveTo(-r * 0.38, r * 0.05);
    ctx.lineTo(-r * 0.2, -r * 0.28);
    ctx.lineTo(0, -r * 0.02);
    ctx.lineTo(r * 0.2, -r * 0.28);
    ctx.lineTo(r * 0.38, r * 0.05);
    ctx.closePath();
    ctx.fill();

    // Texto "ÁGUILA"
    ctx.fillStyle = '#3a2010';
    ctx.font = `bold ${Math.round(r * 0.22)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ÁGUILA', 0, r * 0.28);
  }

  /** 5. Mogul: Osito de gomita frutal translúcido */
  private drawMogulBear(ctx: CanvasRenderingContext2D, r: number): void {
    // Color rojo o verde esmeralda
    const isRed = true;
    const baseColor = isRed ? '#e53935' : '#43a047';
    const lightColor = isRed ? '#ff8a80' : '#b9f6ca';

    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.2, r * 0.6, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orejas
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(-r * 0.36, -r * 0.55, r * 0.2, 0, Math.PI * 2);
    ctx.arc(r * 0.36, -r * 0.55, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cabeza
    ctx.beginPath();
    ctx.arc(0, -r * 0.25, r * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo
    ctx.beginPath();
    ctx.ellipse(0, r * 0.25, r * 0.52, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pancita translúcida
    const bellyGrad = ctx.createRadialGradient(0, r * 0.2, 0, 0, r * 0.2, r * 0.35);
    bellyGrad.addColorStop(0, lightColor);
    bellyGrad.addColorStop(1, baseColor);
    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.arc(0, r * 0.2, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Hocico y ojos
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-r * 0.14, -r * 0.3, r * 0.05, 0, Math.PI * 2);
    ctx.arc(r * 0.14, -r * 0.3, r * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Texto "MOGUL"
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(r * 0.18)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MOGUL', 0, r * 0.22);

    // Chispas de azúcar cristalina
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    [-0.3, 0.2, -0.1, 0.3].forEach((ox, i) => {
      ctx.fillRect(ox * r, (i * 0.2 - 0.2) * r, 1.8, 1.8);
    });
  }

  /** 6. Butter Toffees: Caramelo toffee envuelto en dorado y azul */
  private drawButterToffees(ctx: CanvasRenderingContext2D, r: number): void {
    // Moños azules metalizados
    ctx.fillStyle = '#1565c0';
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, 0);
    ctx.lineTo(-r * 1.25, -r * 0.5);
    ctx.lineTo(-r * 1.15, 0);
    ctx.lineTo(-r * 1.25, r * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(r * 0.6, 0);
    ctx.lineTo(r * 1.25, -r * 0.5);
    ctx.lineTo(r * 1.15, 0);
    ctx.lineTo(r * 1.25, r * 0.5);
    ctx.closePath();
    ctx.fill();

    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 2, r * 0.75, r * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo dorado de toffee
    const goldGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r * 0.8);
    goldGrad.addColorStop(0, '#fffde7');
    goldGrad.addColorStop(0.4, '#ffd54f');
    goldGrad.addColorStop(0.85, '#ff8f00');
    goldGrad.addColorStop(1, '#b26a00');

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.75, r * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Texto "Butter Toffees"
    ctx.fillStyle = '#1a237e';
    ctx.font = `bold italic ${Math.round(r * 0.22)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Butter', 0, -r * 0.12);
    ctx.fillText('Toffees', 0, r * 0.14);
  }

  /** 7. Minty: Caramelo de menta verde refrescante */
  private drawMinty(ctx: CanvasRenderingContext2D, r: number): void {
    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(0, 2, r * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo esmeralda
    const mintGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r * 0.8);
    mintGrad.addColorStop(0, '#a7ffeb');
    mintGrad.addColorStop(0.4, '#00bfa5');
    mintGrad.addColorStop(0.85, '#00796b');
    mintGrad.addColorStop(1, '#004d40');

    ctx.fillStyle = mintGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Remolino blanco
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 1.3);
    ctx.stroke();

    // Texto "Minty"
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(r * 0.26)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Minty', 0, 0);
  }

  // =========================================================================
  // EFECTOS ESPECIALES DE PIEZAS (RAYADO, BOMBA, DISCO)
  // =========================================================================

  private drawStripedOverlay(ctx: CanvasRenderingContext2D, r: number, isHorizontal: boolean): void {
    ctx.save();
    const pulse = 0.75 + Math.sin(this.animTime * 6) * 0.25;
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;

    const offset = Math.sin(this.animTime * 4) * (r * 0.1);

    if (isHorizontal) {
      [-r * 0.38 + offset, offset, r * 0.38 + offset].forEach(y => {
        ctx.beginPath();
        ctx.moveTo(-r * 0.8, y);
        ctx.lineTo(r * 0.8, y);
        ctx.stroke();
      });
    } else {
      [-r * 0.38 + offset, offset, r * 0.38 + offset].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, -r * 0.8);
        ctx.lineTo(x, r * 0.8);
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  private drawWrappedBombOverlay(ctx: CanvasRenderingContext2D, r: number): void {
    ctx.save();
    // Halo pulsante de advertencia
    const bombPulse = 1 + Math.sin(this.animTime * 6) * 0.12;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.98 * bombPulse, 0, Math.PI * 2);
    ctx.stroke();

    // Chispas del detonador
    ctx.fillStyle = '#ff3d00';
    ctx.shadowColor = '#ff6e40';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(r * 0.45, -r * 0.45, 4 + Math.sin(this.animTime * 14) * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.font = `bold ${Math.round(r * 0.35)}px sans-serif`;
    ctx.fillText('💣', r * 0.38, -r * 0.38);
    ctx.restore();
  }

  private drawDiscoOverlay(ctx: CanvasRenderingContext2D, r: number): void {
    ctx.save();
    // Halo arcoíris rotativo
    ctx.rotate(this.animTime * 1.8);
    const aura = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.2);
    aura.addColorStop(0, 'rgba(255, 235, 59, 0.45)');
    aura.addColorStop(0.35, 'rgba(0, 229, 255, 0.45)');
    aura.addColorStop(0.7, 'rgba(233, 30, 99, 0.4)');
    aura.addColorStop(1, 'rgba(156, 39, 176, 0)');

    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Estrellas orbitales en giro
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const ox = Math.cos(angle) * (r * 0.9);
      const oy = Math.sin(angle) * (r * 0.9);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      this.drawStar(ctx, ox, oy, 4, 5, 2);
    }
    ctx.restore();
  }

  // =========================================================================
  // SISTEMA DE PARTÍCULAS Y TEXTOS FLOTANTES
  // =========================================================================

  private spawnBurstParticles(x: number, y: number, color: string): void {
    // 1. Onda de choque circular
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 10,
      color: '#ffffff',
      alpha: 0.9,
      life: 0,
      maxLife: 0.28,
      shape: 'ring'
    });

    // 2. Chispas, confetis y estrellas
    for (let i = 0; i < 22; i++) {
      const angle = (i / 22) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 90 + Math.random() * 220;
      const isGold = Math.random() > 0.6;
      const shapes: Particle['shape'][] = ['star', 'confetti', 'spark', 'circle'];
      const chosenShape = shapes[Math.floor(Math.random() * shapes.length)];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        size: 3.5 + Math.random() * 5,
        color: isGold ? '#ffd700' : color,
        alpha: 1,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.35,
        shape: chosenShape,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 12
      });
    }
  }

  public spawnSpecialExplosion(x: number, y: number): void {
    // Onda de choque grande
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 15,
      color: '#ffd700',
      alpha: 1,
      life: 0,
      maxLife: 0.38,
      shape: 'ring'
    });

    const rainbow = ['#ff1744', '#ffea00', '#00e5ff', '#76ff03', '#d500f9', '#ff9100'];

    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 120 + Math.random() * 280;
      const color = rainbow[i % rainbow.length];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: 4 + Math.random() * 6,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
        shape: Math.random() > 0.4 ? 'star' : 'confetti',
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 16
      });
    }
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'star') {
        this.drawStar(ctx, p.x, p.y, 4, p.size * 1.5, p.size * 0.6);
      } else if (p.shape === 'confetti') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        ctx.fillRect(-p.size / 2, -p.size * 0.8, p.size, p.size * 1.6);
      } else if (p.shape === 'spark') {
        const speed = Math.hypot(p.vx, p.vy) || 1;
        const len = Math.min(18, p.size * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - (p.vx / speed) * len, p.y - (p.vy / speed) * len);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private renderFloatTexts(ctx: CanvasRenderingContext2D): void {
    this.floatTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;

      if (ft.isPraise) {
        // Elogio de combo con banner dorado glorioso
        const fontSize = Math.round(28 * ft.scale);
        ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textMetrics = ctx.measureText(ft.text);
        const bgWidth = textMetrics.width + 36;
        const bgHeight = fontSize + 16;

        // Placa de fondo con sombra
        ctx.fillStyle = 'rgba(25, 10, 4, 0.88)';
        ctx.shadowColor = '#ffb300';
        ctx.shadowBlur = 18;
        this.fillRoundRect(ctx, ft.x - bgWidth / 2, ft.y - bgHeight / 2, bgWidth, bgHeight, 14);

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        this.strokeRoundRect(ctx, ft.x - bgWidth / 2, ft.y - bgHeight / 2, bgWidth, bgHeight, 14);

        // Texto con degradado dorado
        const grad = ctx.createLinearGradient(0, ft.y - fontSize / 2, 0, ft.y + fontSize / 2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#ffea79');
        grad.addColorStop(0.8, '#ff9800');
        grad.addColorStop(1, '#ff6d00');

        ctx.fillStyle = grad;
        ctx.fillText(ft.text, ft.x, ft.y);
      } else {
        ctx.font = `bold ${Math.round(22 * ft.scale)}px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Sombra oscura
        ctx.fillStyle = '#000000';
        ctx.fillText(ft.text, ft.x + 2, ft.y + 2);

        // Texto brillante
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.restore();
    });
  }

  private getCandyMainColor(type: CandyType): string {
    switch (type) {
      case 'caramelo_1951': return '#d32f2f';
      case 'caramelo_miel': return '#f59e0b';
      case 'caramelo_frutal': return '#ea580c';
      case 'bonobon': return '#ffd700';
      case 'cofler': return '#5d3822';
      case 'rocklets': return '#00e5ff';
      case 'aguila': return '#3e2723';
      case 'mogul': return '#e53935';
      case 'buttertoffe': return '#1565c0';
      case 'toffee_cubo': return '#ff8f00';
      case 'minty': return '#00bfa5';
      default: return '#ffd54f';
    }
  }
}
