import { soundManager } from '../core/SoundManager.ts';
import { proceduralMusic } from '../audio/ProceduralMusic.ts';
import { gameState } from '../gameplay/GameState.ts';
import { progressionState } from '../gameplay/ProgressionState.ts';

export interface TitleScreenCallbacks {
  onContinueGame: () => void;
  onNewGame: () => void;
  onOpenMuseum?: () => void;
  onOpenSettings?: () => void;
}

/**
 * TitleScreen: Pantalla de inicio cinematográfica AAA con imagen de fondo profunda y difuminada,
 * branding oficial limpio de Arcor, mascota Arcorito, frase fundacional y botones de acceso rápido.
 */
export class TitleScreen {
  public element: HTMLElement;
  private callbacks: TitleScreenCallbacks;
  private isEntering: boolean = false;

  constructor(callbacks: TitleScreenCallbacks) {
    this.callbacks = callbacks;
    this.element = this.render();
    this.setupTouchRipple();
  }

  private render(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'title-screen-overlay';

    overlay.innerHTML = `
      <!-- Imagen de Fondo: Fábrica Histórica Arroyito 1951 (sin modificar) -->
      <div class="title-bg-image-layer">
        <img src="./factory_nanobanana_1951.jpg" alt="Fábrica Arcor Arroyito 1951" class="title-bg-img" />
      </div>

      <!-- Capa Parallax: Nubes (drift lateral suave) -->
      <div class="title-parallax-clouds">
        <div class="parallax-cloud c1"></div>
        <div class="parallax-cloud c2"></div>
        <div class="parallax-cloud c3"></div>
      </div>

      <!-- Capa Parallax: Humo de Chimenea (ascenso oscilante) -->
      <div class="title-parallax-smoke">
        <div class="parallax-smoke-puff s1"></div>
        <div class="parallax-smoke-puff s2"></div>
        <div class="parallax-smoke-puff s3"></div>
      </div>

      <!-- Capa Parallax: Vegetación (balanceo lateral) -->
      <div class="title-parallax-vegetation">
        <div class="parallax-leaf l1"></div>
        <div class="parallax-leaf l2"></div>
        <div class="parallax-leaf l3"></div>
      </div>

      <!-- Capa de Iluminación Cinemática -->
      <div class="title-lighting-layer"></div>

      <!-- ═══════════════════════════════════════════════
           BARRA SUPERIOR
           ═══════════════════════════════════════════════ -->
      <header class="ts-topbar">
        <!-- Ubicación (izquierda) -->
        <div class="ts-location">
          <span>ARROYITO,</span>
          <span>CÓRDOBA</span>
          <span>ARGENTINA</span>
          <div class="ts-location-line"></div>
        </div>

        <!-- Botón Museo (derecha) -->
        <div class="ts-topbar-right">
          <button class="ts-museum-pill interactive" id="btn-top-museum" title="Entrar al Museo del Sabor">
            <span class="ts-museum-icon">🏛️</span>
            <span class="ts-museum-label">MUSEO DEL SABOR</span>
            <span class="ts-museum-arrow">›</span>
          </button>
          <div class="ts-tagline">
            <span>HACIENDO</span>
            <span>MÁS DULCES</span>
            <span>TUS MOMENTOS</span>
            <div class="ts-tagline-line"></div>
          </div>
        </div>
      </header>

      <!-- ═══════════════════════════════════════════════
           HERO CENTRAL
           ═══════════════════════════════════════════════ -->
      <main class="ts-hero">
        <!-- Logo Arcor flotante -->
        <div class="ts-logo-wrap">
          <div class="ts-logo-glow"></div>
          <img src="./arcor_logo.png" alt="Arcor" class="ts-logo-img" />
          <div class="ts-logo-shimmer"></div>
        </div>

        <!-- Presenta -->
        <div class="ts-presenta">— PRESENTA —</div>

        <!-- Título principal -->
        <h1 class="ts-main-title">EL DULCE IMPERIO</h1>
        <p class="ts-main-subtitle">LA HISTORIA VIVA DE UN PIONERO INDUSTRIAL</p>

        <!-- Botón CTA principal: COMENZAR -->
        <button class="ts-btn-comenzar interactive" id="btn-continue-game">
          <span class="ts-comenzar-play">▶</span>
          <span class="ts-comenzar-txt">COMENZAR</span>
          <div class="ts-comenzar-gloss"></div>
        </button>

        <!-- Botones secundarios -->
        <div class="ts-secondary-row">
          <button class="ts-btn-secondary interactive" id="btn-title-museum">
            <span>📖</span>
            <span>HISTORIA</span>
          </button>
          <button class="ts-btn-secondary interactive" id="btn-new-game">
            <span>🏆</span>
            <span>LOGROS</span>
          </button>
          <button class="ts-btn-secondary interactive" id="btn-config-title">
            <span>⚙️</span>
            <span>CONFIGURACIÓN</span>
          </button>
        </div>
      </main>

      <!-- ═══════════════════════════════════════════════
           CITA AL PIE
           ═══════════════════════════════════════════════ -->
      <footer class="ts-quote-footer">
        <p class="ts-quote-text">"Un grupo de jóvenes soñadores se reúne para encender la primera caldera artesanal, con un ideal inquebrantable: hacer llegar los mejores dulces a cada rincón de la tierra."</p>
        <span class="ts-quote-author">Fulvio Salvador Pagani, 1951</span>
      </footer>
    `;


    // Listeners principales
    overlay.querySelector('#btn-continue-game')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleContinueGame();
    });

    overlay.querySelector('#btn-new-game')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleNewGame();
    });

    const enterMuseum = (e: Event) => {
      e.stopPropagation();
      soundManager.playClick();
      if (this.callbacks.onOpenMuseum) {
        this.callbacks.onOpenMuseum();
      }
    };

    overlay.querySelector('#btn-top-museum')?.addEventListener('click', enterMuseum);
    overlay.querySelector('#btn-title-museum')?.addEventListener('click', enterMuseum);

    overlay.querySelector('#btn-config-title')?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      if (this.callbacks.onOpenSettings) {
        this.callbacks.onOpenSettings();
      }
    });

    // Bloquear desplazamiento / scroll en la pantalla de inicio
    overlay.addEventListener('wheel', (e) => {
      e.preventDefault();
    }, { passive: false });

    overlay.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    return overlay;
  }

  /**
   * Efecto táctil de onda expansiva dorada (Touch Ripple) al tocar la pantalla
   */
  private setupTouchRipple(): void {
    this.element.addEventListener('pointerdown', (e: PointerEvent) => {
      if (this.isEntering) return;

      const ripple = document.createElement('div');
      ripple.className = 'touch-ripple-effect';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      this.element.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 700);
    });
  }

  private handleContinueGame(): void {
    if (this.isEntering) return;
    this.isEntering = true;

    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }

    proceduralMusic.initContext();
    if (!proceduralMusic.getIsMuted()) {
      proceduralMusic.start();
    }
    soundManager.playFanfare();

    this.dismiss();
    this.callbacks.onContinueGame();
  }

  private handleNewGame(): void {
    soundManager.playClick();
    proceduralMusic.initContext();
    if (!proceduralMusic.getIsMuted()) {
      proceduralMusic.start();
    }
    this.callbacks.onNewGame();
  }

  public refreshInfo(): void {
    const data = gameState.getData();
    const currentYear = data.currentYear || 1951;
    const currentMoney = (data.money || 2500).toLocaleString();
    const currentLevel = progressionState.getCurrentLevel();
    const hasProgress = currentYear > 1951 || data.currentMonth > 6 || (data.completedQuests && data.completedQuests.length > 0) || currentLevel > 1;

    const subEl = this.element.querySelector('#title-continue-sub');
    if (subEl) {
      subEl.textContent = hasProgress ? `Año ${currentYear} • Nivel ${currentLevel} • $${currentMoney} USD` : 'Continuar desde Arroyito 1951';
    }
  }

  /**
   * Transición cinemática de desvanecimiento hacia el juego
   */
  public dismiss(onComplete?: () => void): void {
    this.element.classList.add('fade-dive');

    setTimeout(() => {
      this.element.style.display = 'none';
      if (onComplete) {
        onComplete();
      }
    }, 1100);
  }

  public show(): void {
    this.isEntering = false;
    this.refreshInfo();
    this.element.style.display = 'flex';
    this.element.classList.remove('fade-dive');
  }
}
