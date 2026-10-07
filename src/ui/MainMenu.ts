import { gameState } from '../gameplay/GameState.ts';
import { soundManager } from '../core/SoundManager.ts';
import { pwaNotifier } from './PWANotifier.ts';

export interface MainMenuCallbacks {
  onStartGame: () => void;
  onOpenArchive: () => void;
  onOpenSettings: () => void;
}

export class MainMenu {
  public element: HTMLElement;
  private callbacks: MainMenuCallbacks;
  private startBtn: HTMLElement | null = null;
  private eraTagEl: HTMLElement | null = null;

  constructor(callbacks: MainMenuCallbacks) {
    this.callbacks = callbacks;
    this.element = this.render();

    gameState.subscribe(() => {
      this.updateState();
    });
  }

  private render(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'main-menu-overlay';

    overlay.innerHTML = `
      <!-- Top Status Bar -->
      <div class="menu-top-bar">
        <div class="badge-era-tag">
          <span class="badge-era-dot"></span>
          <span id="menu-era-text">ERA 1 • 1951: ARROYITO</span>
        </div>
      </div>

      <!-- Center Brand Plaque -->
      <div class="menu-header-center">
        <div class="menu-brand-plaque">
          <img src="./arcor_logo.png" alt="Arcor" class="menu-brand-logo" />
          <span class="brand-established">DESDE 1951 • CÓRDOBA</span>
          <h1 class="brand-main-title">ARCOR</h1>
          <p class="brand-sub-title">La Gran Fábrica • El Dulce Imperio</p>
        </div>
      </div>

      <!-- Center Spacer to showcase 3D Scene -->
      <div class="menu-center-spacer"></div>

      <!-- Action Buttons (Mobile-First Touch Target) -->
      <div class="menu-actions-container">
        <button class="btn btn-primary btn-start-game interactive" id="btn-start-game">
          ▶ COMENZAR HISTORIA
        </button>

        <div class="menu-secondary-row">
          <button class="btn btn-secondary interactive" id="btn-archive">
            📜 ARCHIVO
          </button>
          <button class="btn btn-secondary interactive" id="btn-settings">
            ⚙️ AJUSTES
          </button>
        </div>

        <div class="menu-pwa-banner interactive" id="pwa-install-banner" style="display: none;">
          <span>📲 Instalar versión PWA</span>
          <button class="btn btn-secondary" style="min-height: 32px; padding: 4px 10px; font-size: 0.75rem;">
            Instalar
          </button>
        </div>

        <p class="menu-footer-credits">Simulador Industrial Histórico • Grupo Arcor</p>
      </div>
    `;

    this.startBtn = overlay.querySelector('#btn-start-game');
    this.eraTagEl = overlay.querySelector('#menu-era-text');

    // Botón Iniciar
    this.startBtn?.addEventListener('click', () => {
      soundManager.playClick();
      this.callbacks.onStartGame();
    });

    // Botón Archivo
    overlay.querySelector('#btn-archive')?.addEventListener('click', () => {
      soundManager.playClick();
      this.callbacks.onOpenArchive();
    });

    // Botón Ajustes
    overlay.querySelector('#btn-settings')?.addEventListener('click', () => {
      soundManager.playClick();
      this.callbacks.onOpenSettings();
    });

    // Registrar botón de instalación PWA
    const pwaBanner = overlay.querySelector('#pwa-install-banner') as HTMLElement;
    if (pwaBanner) {
      pwaNotifier.registerButton(pwaBanner);
    }

    this.updateState();
    return overlay;
  }

  private updateState(): void {
    const data = gameState.getData();
    if (this.startBtn) {
      this.startBtn.textContent = data.hasSeenPrologue
        ? `▶ CONTINUAR (AÑO ${data.currentYear})`
        : '▶ COMENZAR HISTORIA (1951)';
    }
    if (this.eraTagEl) {
      const era = gameState.getCurrentEra();
      this.eraTagEl.textContent = `${era.eraName.toUpperCase()} (${data.currentYear})`;
    }
  }

  public show(): void {
    this.updateState();
    this.element.classList.remove('hidden');
  }

  public hide(): void {
    this.element.classList.add('hidden');
  }
}
