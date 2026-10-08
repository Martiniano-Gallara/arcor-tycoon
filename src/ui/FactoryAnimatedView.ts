import { gameState } from '../gameplay/GameState.ts';
import { progressionState } from '../gameplay/ProgressionState.ts';
import { soundManager } from '../core/SoundManager.ts';

interface SmokePuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  life: number;
  maxLife: number;
  rot: number;
  rotSpeed: number;
}

interface AromaSparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  phase: number;
}

interface Bird {
  x: number;
  y: number;
  speed: number;
  wingPhase: number;
  scale: number;
}

interface FloatingPopup {
  x: number;
  y: number;
  text: string;
  emoji: string;
  life: number;
  maxLife: number;
}

interface FallingLeaf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  size: number;
  color: string;
  swayPhase: number;
  swaySpeed: number;
}

interface SunMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
}

/**
 * FactoryAnimatedView:
 * Representación artística animada ultra HD estilo Pixar / Nanobanana 3D Cartoon de la Fábrica Arcor.
 * - Basada en la emblemática ilustración de la planta de Arroyito con chimenea, camión azul, operarios y dulces.
 * - Animaciones vivas: humo volumétrico de chimenea, rayos de sol pulsantes, bandada de pájaros volando,
 *   destellos de caramelo en los canastos de chocolate, y efectos interactivos al hacer clic en camión y operarios.
 * - Efectos ambientales nostálgicos 1993: hojas mecidas por la brisa, motas doradas de luz solar y chimenea activa.
 * - Modo Día / Noche con iluminación cálida de faroles, ventanas y luciérnagas.
 */
export class FactoryAnimatedView {
  public element: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private bgImage: HTMLImageElement | null = null;
  private isImageLoaded: boolean = false;

  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private animTime: number = 0;

  private currentYear: number = 1993;
  private currentLevel: number = 1;

  private smokePuffs: SmokePuff[] = [];
  private sparkles: AromaSparkle[] = [];
  private birds: Bird[] = [];
  private leaves: FallingLeaf[] = [];
  private sunMotes: SunMote[] = [];
  private popups: FloatingPopup[] = [];

  private chimneyTimer: number = 0;
  private isNightMode: boolean = false;
  private isPaused: boolean = false;
  private onVisibilityChange = () => {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  };

  // Parámetros de ajuste y escalado de imagen
  private imgBounds = { x: 0, y: 0, w: 0, h: 0 };

  // Interacción táctil
  public onFactoryClicked?: () => void;
  public onTruckClicked?: () => void;

  public toggleNightMode(): boolean {
    this.isNightMode = !this.isNightMode;
    return this.isNightMode;
  }

  public getIsNightMode(): boolean {
    return this.isNightMode;
  }

  public getCurrentYear(): number {
    return this.currentYear;
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'factory-animated-container';

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'factory-animated-canvas';
    this.ctx = this.canvas.getContext('2d', { alpha: false })!;

    this.element.appendChild(this.canvas);

    // Overlay de información de época y logros
    const overlay = document.createElement('div');
    overlay.className = 'factory-era-overlay';
    overlay.innerHTML = `
      <div class="factory-era-pill">
        <span class="factory-era-icon">🏭</span>
        <div class="factory-era-text-group">
          <span class="factory-era-title" id="factory-overlay-title">FÁBRICA ARCOR • ARROYITO 1993</span>
          <span class="factory-era-sub" id="factory-overlay-sub">Época Dorada: Bon o Bon, Chocolates y Expansión Continental</span>
        </div>
        <span class="factory-era-badge" id="factory-overlay-lvl">NIVEL 1</span>
      </div>
    `;
    this.element.appendChild(overlay);

    this.loadBackgroundArtwork();
    this.initBirds();
    this.initSparkles();
    this.initLeaves();
    this.initSunMotes();
    this.initListeners();
    this.syncWithState();
    this.resize();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.startLoop();
  }

  private loadBackgroundArtwork(): void {
    this.bgImage = new Image();
    this.bgImage.onload = () => {
      this.isImageLoaded = true;
      this.resize();
    };
    this.bgImage.onerror = () => {
      // Fallback si la imagen tarda en cargar
      this.bgImage!.src = './factory_nanobanana_1951.jpg';
    };
    this.bgImage.src = './factory_tycoon_1993.jpg';
    if (this.bgImage.complete && this.bgImage.naturalWidth) {
      this.isImageLoaded = true;
      this.resize();
    }
  }

  private initBirds(): void {
    this.birds = [
      { x: -50, y: 0.14, speed: 45, wingPhase: 0, scale: 0.8 },
      { x: -120, y: 0.17, speed: 42, wingPhase: 1.2, scale: 0.65 },
      { x: -180, y: 0.12, speed: 48, wingPhase: 2.5, scale: 0.75 },
      { x: -240, y: 0.20, speed: 39, wingPhase: 3.8, scale: 0.55 }
    ];
  }

  private initLeaves(): void {
    this.leaves = [];
    const leafColors = ['#4ade80', '#22c55e', '#a3e635', '#facc15', '#fb923c', '#15803d'];
    for (let i = 0; i < 20; i++) {
      this.leaves.push({
        x: Math.random() * 1.2 - 0.1,
        y: Math.random(),
        vx: 18 + Math.random() * 26,
        vy: 14 + Math.random() * 22,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2.8,
        size: 5 + Math.random() * 6,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 1.5 + Math.random() * 2.0
      });
    }
  }

  private initSunMotes(): void {
    this.sunMotes = [];
    for (let i = 0; i < 30; i++) {
      this.sunMotes.push({
        x: 0.4 + Math.random() * 0.58,
        y: Math.random() * 0.75,
        vx: (Math.random() - 0.5) * 12,
        vy: -8 - Math.random() * 14,
        radius: 1.5 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  private initSparkles(): void {
    this.sparkles = [];
    for (let i = 0; i < 28; i++) {
      this.sparkles.push({
        x: Math.random(),
        y: Math.random() * 0.4 + 0.6,
        vx: (Math.random() - 0.5) * 8,
        vy: -15 - Math.random() * 25,
        size: 2 + Math.random() * 3.5,
        color: ['#ffd700', '#ffeb3b', '#ff8a80', '#ffffff', '#ff80ab'][Math.floor(Math.random() * 5)],
        alpha: Math.random(),
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  private initListeners(): void {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleInteractiveClick(x, y);
    });

    progressionState.subscribe(() => {
      this.syncWithState();
    });

    gameState.subscribe(() => {
      this.syncWithState();
    });
  }

  public syncWithState(): void {
    const data = gameState.getData();
    const lvl = progressionState.getCurrentLevel();
    const yr = data.currentYear || 1951;
    this.setYearAndLevel(yr, lvl);
  }

  public setYearAndLevel(year: number, level: number): void {
    this.currentYear = year;
    this.currentLevel = level;

    const titleEl = this.element.querySelector('#factory-overlay-title');
    const subEl = this.element.querySelector('#factory-overlay-sub');
    const lvlEl = this.element.querySelector('#factory-overlay-lvl');

    if (titleEl) {
      titleEl.textContent = `FÁBRICA ARCOR • ARROYITO ${year}`;
    }

    if (lvlEl) {
      lvlEl.textContent = `NIVEL ${level}`;
    }

    if (subEl) {
      if (year < 1958) {
        subEl.textContent = 'Etapa 1: Galpón Fundacional, Caldera y Primer Camión de Reparto';
      } else if (year < 1970) {
        subEl.textContent = 'Etapa 2: Integración con Silos de Molienda de Maíz y Glucosa';
      } else if (year < 1980) {
        subEl.textContent = 'Etapa 3: Gran Nave de Chocolates y Caramelos Rellenos';
      } else if (year < 2000) {
        subEl.textContent = 'Etapa 4: Automatización Industrial y Exportación Internacional';
      } else {
        subEl.textContent = 'Etapa 5: 75º Aniversario • Megacomplejo Dulce Líder de América';
      }
    }
  }

  public resize(): void {
    const rect = this.element.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    // Calcular límites de imagen para centrado cinemático
    if (this.bgImage && this.bgImage.complete && this.bgImage.naturalWidth) {
      const imgW = this.bgImage.naturalWidth;
      const imgH = this.bgImage.naturalHeight;
      const imgAspect = imgW / imgH;
      const screenAspect = w / h;

      let drawW: number;
      let drawH: number;
      let drawX: number;
      let drawY: number;

      if (screenAspect > imgAspect) {
        drawW = w;
        drawH = w / imgAspect;
        drawX = 0;
        drawY = (h - drawH) * 0.5;
      } else {
        drawH = h;
        drawW = h * imgAspect;
        drawX = (w - drawW) * 0.5;
        drawY = 0;
      }

      this.imgBounds = { x: drawX, y: drawY, w: drawW, h: drawH };
    } else {
      this.imgBounds = { x: 0, y: 0, w, h };
    }
  }

  private handleInteractiveClick(clientX: number, clientY: number): void {
    soundManager.playClick();

    // Normalizar coordenadas respecto a la imagen ilustrada
    const relX = (clientX - this.imgBounds.x) / this.imgBounds.w;
    const relY = (clientY - this.imgBounds.y) / this.imgBounds.h;

    // 1. Clic en el Camión Azul de Reparto (relX ~ 0.48 a 0.72, relY ~ 0.58 a 0.88)
    if (relX >= 0.48 && relX <= 0.72 && relY >= 0.58 && relY <= 0.88) {
      this.spawnPopup(clientX, clientY, '¡Bocina Arcor! Despachando cajas de caramelos', '🚚');
      this.triggerTruckCheer();
      return;
    }

    // 2. Clic en los Operarios / Muchacho del centro (izquierda y derecha del patio)
    if ((relX >= 0.04 && relX <= 0.46 && relY >= 0.60 && relY <= 0.90) ||
        (relX >= 0.72 && relX <= 0.95 && relY >= 0.62 && relY <= 0.90)) {
      this.spawnPopup(clientX, clientY, '¡Orgullo artesanal y pasión de Arroyito!', '🧑‍🍳');
      this.triggerWorkerCheer();
      return;
    }

    // 3. Clic en los Canastos de Bombones y Golosinas en primer plano (inferior)
    if (relY >= 0.80) {
      this.spawnPopup(clientX, clientY, '¡Bombones y caramelos recién confeccionados!', '🍫');
      this.burstCandySparkles(clientX, clientY);
      return;
    }

    // 4. Clic en la Chimenea / Caldera (relX ~ 0.68 a 0.78, relY <= 0.50)
    if (relX >= 0.68 && relX <= 0.78 && relY <= 0.50) {
      this.spawnPopup(clientX, clientY, '¡Caldera fundacional a pleno vapor!', '🔥');
      this.burstChimneyPuffs();
      return;
    }

    // Clic general en la fábrica
    this.spawnPopup(clientX, clientY, 'Fábrica Arcor: Creciendo con cada nivel', '✨');
  }

  private spawnPopup(x: number, y: number, text: string, emoji: string): void {
    this.popups.push({
      x,
      y: y - 10,
      text,
      emoji,
      life: 0,
      maxLife: 2.2
    });
  }

  private triggerTruckCheer(): void {
    soundManager.playFanfare();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 60 + Math.random() * 80;
      this.sparkles.push({
        x: (this.imgBounds.x + this.imgBounds.w * 0.60) / (this.canvas.width / (window.devicePixelRatio || 1)),
        y: (this.imgBounds.y + this.imgBounds.h * 0.73) / (this.canvas.height / (window.devicePixelRatio || 1)),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 3,
        color: '#60a5fa',
        alpha: 1,
        phase: Math.random() * Math.PI
      });
    }
  }

  private triggerWorkerCheer(): void {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 90;
      this.sparkles.push({
        x: (this.imgBounds.x + this.imgBounds.w * 0.14) / (this.canvas.width / (window.devicePixelRatio || 1)),
        y: (this.imgBounds.y + this.imgBounds.h * 0.75) / (this.canvas.height / (window.devicePixelRatio || 1)),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: 4 + Math.random() * 4,
        color: '#ff4081',
        alpha: 1,
        phase: Math.random() * Math.PI
      });
    }
  }

  private burstCandySparkles(x: number, y: number): void {
    const dpr = window.devicePixelRatio || 1;
    const normX = x / (this.canvas.width / dpr);
    const normY = y / (this.canvas.height / dpr);
    for (let i = 0; i < 16; i++) {
      this.sparkles.push({
        x: normX,
        y: normY,
        vx: (Math.random() - 0.5) * 120,
        vy: -40 - Math.random() * 80,
        size: 3 + Math.random() * 5,
        color: ['#ffd700', '#ff1744', '#ff80ab', '#ffffff', '#ff9100'][Math.floor(Math.random() * 5)],
        alpha: 1,
        phase: Math.random() * Math.PI
      });
    }
  }

  private burstChimneyPuffs(): void {
    const chimX = this.imgBounds.x + this.imgBounds.w * 0.738;
    const chimY = this.imgBounds.y + this.imgBounds.h * 0.088;
    for (let i = 0; i < 6; i++) {
      this.spawnChimneyPuff(chimX, chimY, true);
    }
  }

  private startLoop(): void {
    const loop = (time: number) => {
      if (this.isPaused) return;

      const settings = gameState.getData().settings;
      const targetFps = settings?.fps60 ? 60 : 30;
      const minInterval = (1000 / targetFps) - 2;

      if (this.lastTime && (time - this.lastTime) < minInterval) {
        this.animFrameId = requestAnimationFrame(loop);
        return;
      }

      const dt = this.lastTime ? Math.min((time - this.lastTime) / 1000, 0.1) : 0.016;
      this.lastTime = time;
      this.animTime += dt;

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public pause(): void {
    if (this.isPaused) return;
    this.isPaused = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.startLoop();
  }

  public destroy(): void {
    this.pause();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  private spawnChimneyPuff(x: number, y: number, isBurst: boolean = false): void {
    const angle = -Math.PI * 0.5 + (Math.random() - 0.2) * 0.6;
    const speed = isBurst ? 55 + Math.random() * 40 : 25 + Math.random() * 25;
    const wind = 15 + Math.sin(this.animTime * 0.5) * 5;

    this.smokePuffs.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 4,
      vx: Math.cos(angle) * speed + wind,
      vy: Math.sin(angle) * speed,
      radius: isBurst ? 16 + Math.random() * 10 : 12 + Math.random() * 8,
      maxRadius: isBurst ? 70 + Math.random() * 35 : 55 + Math.random() * 25,
      alpha: 0.85,
      life: 0,
      maxLife: isBurst ? 4.5 : 3.8,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.8
    });
  }

  private update(dt: number): void {
    const quality = gameState.getData().settings?.quality || 'medium';

    // 1. Spawner continuo de humo de chimenea
    this.chimneyTimer += dt;
    const baseInterval = quality === 'low' ? 0.75 : quality === 'medium' ? 0.42 : 0.32;
    const puffInterval = Math.max(0.18, baseInterval - (this.currentLevel * 0.003));
    if (this.chimneyTimer >= puffInterval) {
      this.chimneyTimer = 0;
      const chimX = this.imgBounds.x + this.imgBounds.w * 0.738;
      const chimY = this.imgBounds.y + this.imgBounds.h * 0.088;
      this.spawnChimneyPuff(chimX, chimY);
    }

    // 2. Actualizar partículas de humo
    for (let i = this.smokePuffs.length - 1; i >= 0; i--) {
      const p = this.smokePuffs[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.radius += (p.maxRadius - p.radius) * dt * 0.65;
      p.rot += p.rotSpeed * dt;
      p.alpha = Math.max(0, 0.8 * (1 - p.life / p.maxLife));

      if (p.life >= p.maxLife || p.alpha <= 0.01) {
        this.smokePuffs.splice(i, 1);
      }
    }

    // 3. Actualizar pájaros volando
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    for (let b of this.birds) {
      b.x += b.speed * dt;
      b.wingPhase += dt * 9;
      if (b.x > w + 100) {
        b.x = -150 - Math.random() * 200;
        b.y = 0.08 + Math.random() * 0.16;
      }
    }

    // 4. Actualizar chispas de caramelo
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    for (let sp of this.sparkles) {
      sp.y += (sp.vy / h) * dt;
      sp.x += (Math.sin(this.animTime * 2.5 + sp.phase) * 15 / w) * dt;
      if (sp.y < 0.3) {
        sp.y = 0.75 + Math.random() * 0.25;
        sp.x = Math.random();
      }
    }

    // 5. Actualizar hojas mecidas por el viento de Arroyito
    for (let l of this.leaves) {
      l.swayPhase += dt * l.swaySpeed;
      l.x += (l.vx + Math.sin(l.swayPhase) * 16) * dt / w;
      l.y += l.vy * dt / h;
      l.rotation += l.rotSpeed * dt;
      if (l.y > 1.05 || l.x > 1.15) {
        l.y = -0.05 - Math.random() * 0.1;
        l.x = Math.random() * 1.0 - 0.2;
      }
    }

    // 6. Actualizar motas doradas de luz solar
    for (let m of this.sunMotes) {
      m.phase += dt * 1.5;
      m.x += (m.vx + Math.sin(m.phase) * 8) * dt / w;
      m.y += m.vy * dt / h;
      if (m.y < -0.05 || m.x < 0.2 || m.x > 1.05) {
        m.y = 0.75 + Math.random() * 0.25;
        m.x = 0.35 + Math.random() * 0.65;
      }
    }

    // 7. Actualizar popups de texto flotante
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.life += dt;
      pop.y -= dt * 25;
      if (pop.life >= pop.maxLife) {
        this.popups.splice(i, 1);
      }
    }
  }

  private render(): void {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;
    if (!w || !h) return;

    this.ctx.clearRect(0, 0, w, h);

    // 1. Dibujar la Ilustración Base Ultra HD con suave respiración panorámica
    this.drawArtworkWithCinematicBreathe(w, h);

    // 2. Rayos de sol animados y resplandor
    this.drawSunGlowAndRays();

    // 2b. Motas doradas de polvo solar flotantes
    this.drawSunMotes(w, h);

    // 3. Bocanadas de humo volumétrico de chimenea
    this.drawVolumetricSmoke();

    // 3b. Hojas mecidas por la brisa de Arroyito
    this.drawFallingLeaves(w, h);

    // 4. Bandada de pájaros volando en el cielo
    this.drawFlockOfBirds(w, h);

    // 5. Destellos mágicos en los bombones y operarios
    this.drawSweetAromaSparkles(w, h);

    // 6. Efectos de Modo Noche (si está activo)
    if (this.isNightMode) {
      this.drawNightIllumination(w, h);
    }

    // 7. Popups de diálogo flotante al tocar elementos
    this.drawFloatingPopups();

    // 8. Viñeta cinematográfica de calidez Arcor
    this.drawCinematicVignette(w, h);
  }

  private drawArtworkWithCinematicBreathe(w: number, h: number): void {
    if (this.isImageLoaded && this.bgImage && this.bgImage.complete && this.bgImage.naturalWidth) {
      // Sutil movimiento de respiración cinemática (zoom lento 1.00 a 1.018)
      const breatheScale = 1.0 + Math.sin(this.animTime * 0.5) * 0.012;
      const bW = this.imgBounds.w * breatheScale;
      const bH = this.imgBounds.h * breatheScale;
      const bX = this.imgBounds.x - (bW - this.imgBounds.w) * 0.5;
      const bY = this.imgBounds.y - (bH - this.imgBounds.h) * 0.5;

      if (!isNaN(bX) && !isNaN(bY) && bW > 0 && bH > 0) {
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.drawImage(this.bgImage, bX, bY, bW, bH);
      }
    } else {
      // Fondo cálido degradado provisional mientras carga
      const grad = this.ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#5fa8d3');
      grad.addColorStop(0.5, '#fde68a');
      grad.addColorStop(1, '#166534');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    }
  }

  private drawSunGlowAndRays(): void {
    const sunX = this.imgBounds.x + this.imgBounds.w * 0.12;
    const sunY = this.imgBounds.y + this.imgBounds.h * 0.14;

    // Pulso del sol
    const pulse = Math.sin(this.animTime * 1.8) * 0.15 + 1.0;
    const radius = 95 * pulse;

    const sunGrad = this.ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, radius);
    sunGrad.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
    sunGrad.addColorStop(0.25, 'rgba(255, 235, 150, 0.55)');
    sunGrad.addColorStop(0.65, 'rgba(255, 200, 100, 0.20)');
    sunGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.fillStyle = sunGrad;
    this.ctx.beginPath();
    this.ctx.arc(sunX, sunY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Rayos tenues giratorios de luz
    this.ctx.translate(sunX, sunY);
    this.ctx.rotate(this.animTime * 0.08);
    this.ctx.strokeStyle = 'rgba(255, 245, 180, 0.12)';
    this.ctx.lineWidth = 14;
    for (let a = 0; a < 8; a++) {
      this.ctx.beginPath();
      this.ctx.moveTo(25, 0);
      this.ctx.lineTo(radius * 1.6, 0);
      this.ctx.stroke();
      this.ctx.rotate((Math.PI * 2) / 8);
    }
    this.ctx.restore();
  }

  private drawSunMotes(w: number, h: number): void {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    for (let m of this.sunMotes) {
      const px = m.x * w;
      const py = m.y * h;
      const pulse = Math.sin(m.phase) * 0.35 + 0.65;
      const alpha = m.alpha * pulse;

      const grad = this.ctx.createRadialGradient(px, py, 0, px, py, m.radius * 2.8);
      grad.addColorStop(0, `rgba(255, 245, 190, ${alpha})`);
      grad.addColorStop(0.45, `rgba(255, 215, 110, ${alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(255, 190, 60, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(px, py, m.radius * 2.8, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  private drawFallingLeaves(w: number, h: number): void {
    this.ctx.save();
    for (let l of this.leaves) {
      const px = l.x * w;
      const py = l.y * h;

      this.ctx.save();
      this.ctx.translate(px, py);
      this.ctx.rotate(l.rotation);

      // Dibujar hoja estilizada cartoon con volumen y relieve suave
      this.ctx.fillStyle = l.color;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, l.size, l.size * 0.52, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Resplandor cálido en el borde de la hoja
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(-l.size * 0.65, 0);
      this.ctx.lineTo(l.size * 0.65, 0);
      this.ctx.stroke();

      this.ctx.restore();
    }
    this.ctx.restore();
  }

  private drawVolumetricSmoke(): void {
    this.ctx.save();
    for (let p of this.smokePuffs) {
      const grad = this.ctx.createRadialGradient(
        p.x - p.radius * 0.2,
        p.y - p.radius * 0.2,
        p.radius * 0.05,
        p.x,
        p.y,
        p.radius
      );

      // Tonalidad del humo: blanco cálido y denso
      grad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
      grad.addColorStop(0.5, `rgba(240, 235, 225, ${p.alpha * 0.85})`);
      grad.addColorStop(0.85, `rgba(215, 205, 195, ${p.alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(200, 190, 180, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  private drawFlockOfBirds(_w: number, _h: number): void {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(75, 55, 40, 0.75)';
    this.ctx.lineWidth = 1.8;
    this.ctx.lineCap = 'round';

    for (let b of this.birds) {
      const actualY = this.imgBounds.y + this.imgBounds.h * b.y;
      const wingY = Math.sin(b.wingPhase) * 4 * b.scale;

      this.ctx.beginPath();
      // Ala izquierda
      this.ctx.moveTo(b.x - 9 * b.scale, actualY + wingY);
      this.ctx.quadraticCurveTo(b.x - 4 * b.scale, actualY - 6 * b.scale, b.x, actualY);
      // Ala derecha
      this.ctx.quadraticCurveTo(b.x + 4 * b.scale, actualY - 6 * b.scale, b.x + 9 * b.scale, actualY + wingY);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private drawSweetAromaSparkles(w: number, h: number): void {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';

    for (let sp of this.sparkles) {
      const actualX = sp.x * w;
      const actualY = sp.y * h;
      const pulse = Math.sin(this.animTime * 4 + sp.phase) * 0.5 + 0.5;

      this.ctx.fillStyle = sp.color;
      this.ctx.globalAlpha = sp.alpha * (0.4 + pulse * 0.6);

      // Dibujar estrellita de 4 puntas
      this.ctx.beginPath();
      this.ctx.arc(actualX, actualY, sp.size * (0.8 + pulse * 0.5), 0, Math.PI * 2);
      this.ctx.fill();

      // Cruz de brillo reluciente
      this.ctx.strokeStyle = sp.color;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(actualX - sp.size * 1.8, actualY);
      this.ctx.lineTo(actualX + sp.size * 1.8, actualY);
      this.ctx.moveTo(actualX, actualY - sp.size * 1.8);
      this.ctx.lineTo(actualX, actualY + sp.size * 1.8);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private drawNightIllumination(w: number, h: number): void {
    this.ctx.save();
    // Velo azul noche semitransparente
    this.ctx.fillStyle = 'rgba(10, 18, 42, 0.72)';
    this.ctx.fillRect(0, 0, w, h);

    // Luz cálida en las ventanas del galpón central (relX ~ 0.52 a 0.62, relY ~ 0.55 a 0.65)
    const winX = this.imgBounds.x + this.imgBounds.w * 0.57;
    const winY = this.imgBounds.y + this.imgBounds.h * 0.62;
    const glowGrad = this.ctx.createRadialGradient(winX, winY, 10, winX, winY, 110);
    glowGrad.addColorStop(0, 'rgba(255, 230, 120, 0.85)');
    glowGrad.addColorStop(0.5, 'rgba(255, 180, 50, 0.35)');
    glowGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');

    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.fillStyle = glowGrad;
    this.ctx.beginPath();
    this.ctx.arc(winX, winY, 110, 0, Math.PI * 2);
    this.ctx.fill();

    // Faroles de camión encendidos
    const truckX = this.imgBounds.x + this.imgBounds.w * 0.31;
    const truckY = this.imgBounds.y + this.imgBounds.h * 0.77;
    const headGrad = this.ctx.createRadialGradient(truckX, truckY, 5, truckX + 35, truckY, 65);
    headGrad.addColorStop(0, 'rgba(255, 255, 220, 0.95)');
    headGrad.addColorStop(0.4, 'rgba(255, 220, 100, 0.45)');
    headGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    this.ctx.fillStyle = headGrad;
    this.ctx.beginPath();
    this.ctx.arc(truckX + 20, truckY, 65, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  private drawFloatingPopups(): void {
    this.ctx.save();
    for (let pop of this.popups) {
      const progress = pop.life / pop.maxLife;
      const alpha = progress < 0.1 ? progress / 0.1 : progress > 0.75 ? (1 - progress) / 0.25 : 1.0;

      this.ctx.globalAlpha = alpha;
      this.ctx.font = 'bold 14px "Inter", -apple-system, sans-serif';
      const text = `${pop.emoji} ${pop.text}`;
      const metrics = this.ctx.measureText(text);
      const pad = 10;
      const boxW = metrics.width + pad * 2;
      const boxH = 28;

      // Caja de texto con borde dorado
      this.ctx.fillStyle = 'rgba(20, 10, 5, 0.90)';
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 1.5;

      const rx = pop.x - boxW * 0.5;
      const ry = pop.y - boxH;

      this.ctx.beginPath();
      this.ctx.roundRect(rx, ry, boxW, boxH, 14);
      this.ctx.fill();
      this.ctx.stroke();

      // Texto
      this.ctx.fillStyle = '#fffbeb';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(text, pop.x, ry + boxH * 0.5);
    }
    this.ctx.restore();
  }

  private drawCinematicVignette(w: number, h: number): void {
    const vigGrad = this.ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      Math.min(w, h) * 0.5,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.8
    );
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(0.7, 'rgba(15, 8, 4, 0.18)');
    vigGrad.addColorStop(1, 'rgba(10, 5, 2, 0.65)');

    this.ctx.save();
    this.ctx.fillStyle = vigGrad;
    this.ctx.fillRect(0, 0, w, h);
    this.ctx.restore();
  }
}
