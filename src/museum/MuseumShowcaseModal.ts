import { MuseumExhibit } from './MuseumData.ts';
import { soundManager } from '../core/SoundManager.ts';
import { gameState } from '../gameplay/GameState.ts';

export class MuseumShowcaseModal {
  public element: HTMLElement;
  private currentExhibit: MuseumExhibit | null = null;
  private onCollectedCallback?: (exhibitId: string) => void;
  private isCollected: boolean = false;

  constructor(onCollected?: (exhibitId: string) => void) {
    this.onCollectedCallback = onCollected;
    this.element = this.render();
  }

  private render(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'museum-modal-backdrop';
    backdrop.style.display = 'none';

    backdrop.innerHTML = `
      <div class="museum-showcase-dialog">
        <!-- Haz de luz superior cenital (Spotlight) -->
        <div class="showcase-spotlight-beam"></div>

        <!-- Botón cerrar con diseño de latón antiguo -->
        <button class="museum-close-btn interactive" id="showcase-close-btn" title="Cerrar vitrina">✕</button>

        <div class="showcase-content-grid">
          <!-- Columna izquierda: Vitrina 3D con caramelo giratorio iluminado -->
          <div class="showcase-pedestal-column">
            <div class="showcase-glass-bell">
              <div class="glass-reflection-streak"></div>
              <div class="candy-3d-stage" id="showcase-candy-stage">
                <!-- Caramelo 3D renderizado dinámicamente -->
              </div>
              <div class="showcase-pedestal-base">
                <div class="pedestal-plaque" id="showcase-pedestal-year">AÑO 1960</div>
              </div>
            </div>
            <div class="showcase-hint-rotate">✨ Toca o mueve para admirar el brillo del caramelo</div>
          </div>

          <!-- Columna derecha: Placa explicativa del Museo en madera y bronce -->
          <div class="showcase-info-column">
            <div class="showcase-era-tag" id="showcase-era-tag">DÉCADA DE 1960</div>
            <h2 class="showcase-candy-title" id="showcase-title">Caramelos Holanda</h2>
            <div class="showcase-subtitle-row">
              <span class="showcase-year-pill" id="showcase-year-pill">Lanzamiento: 1960</span>
              <span class="showcase-icon-badge" id="showcase-icon-badge">🍬</span>
            </div>

            <!-- Sección: ¿Por qué es importante? -->
            <div class="showcase-importance-box">
              <div class="importance-header">
                <span class="importance-icon">⭐</span>
                <strong>¿POR QUÉ ES IMPORTANTE?</strong>
              </div>
              <p class="importance-text" id="showcase-importance">
                El primer gran clásico de dulce de leche que conquistó a generaciones enteras.
              </p>
            </div>

            <!-- Sección: Historia documentada -->
            <div class="showcase-description-box">
              <p class="description-text" id="showcase-description">
                Descripción histórica documentada...
              </p>
            </div>

            <!-- Curiosidad histórica -->
            <div class="showcase-funfact-row">
              <span class="funfact-bulb">💡</span>
              <span class="funfact-text" id="showcase-funfact">Dato curioso histórico.</span>
            </div>

            <!-- Footer: Botón de Colección y Recompensa -->
            <div class="showcase-action-footer">
              <button class="btn-collect-candy interactive" id="btn-collect-candy">
                <span class="btn-collect-icon">⭐</span>
                <span class="btn-collect-label" id="btn-collect-label">¡DESCUBRIR EN EL MUSEO! (+300 🪙)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    backdrop.querySelector('#showcase-close-btn')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        soundManager.playClick();
        this.hide();
      }
    });

    backdrop.querySelector('#btn-collect-candy')?.addEventListener('click', () => {
      if (!this.currentExhibit || this.isCollected) return;
      this.collectCurrentExhibit();
    });

    return backdrop;
  }

  public show(exhibit: MuseumExhibit, isAlreadyCollected: boolean = false): void {
    this.currentExhibit = exhibit;
    this.isCollected = isAlreadyCollected;

    const el = this.element;
    const eraTagEl = el.querySelector('#showcase-era-tag');
    const titleEl = el.querySelector('#showcase-title');
    const yearPillEl = el.querySelector('#showcase-year-pill');
    const iconBadgeEl = el.querySelector('#showcase-icon-badge');
    const importanceEl = el.querySelector('#showcase-importance');
    const descEl = el.querySelector('#showcase-description');
    const funfactEl = el.querySelector('#showcase-funfact');
    const pedestalYearEl = el.querySelector('#showcase-pedestal-year');
    const collectBtn = el.querySelector('#btn-collect-candy') as HTMLButtonElement;
    const collectLabel = el.querySelector('#btn-collect-label');
    const candyStage = el.querySelector('#showcase-candy-stage') as HTMLElement;

    if (eraTagEl) eraTagEl.textContent = exhibit.eraTag;
    if (titleEl) titleEl.textContent = exhibit.title;
    if (yearPillEl) yearPillEl.textContent = `Lanzamiento: ${exhibit.year} (${exhibit.decade})`;
    if (iconBadgeEl) iconBadgeEl.textContent = exhibit.candyIcon;
    if (importanceEl) importanceEl.textContent = exhibit.importance;
    if (descEl) descEl.textContent = exhibit.description;
    if (funfactEl) funfactEl.textContent = exhibit.funFact;
    if (pedestalYearEl) pedestalYearEl.textContent = `AÑO ${exhibit.year}`;

    // Estado del botón coleccionar
    if (collectBtn && collectLabel) {
      if (this.isCollected) {
        collectBtn.classList.add('already-collected');
        collectLabel.textContent = '✓ DESCUBIERTO EN TU COLECCIÓN';
      } else {
        collectBtn.classList.remove('already-collected');
        collectLabel.textContent = `¡DESCUBRIR EN EL MUSEO! (+${exhibit.rewardCoins} 🪙)`;
      }
    }

    // Renderizado 3D estilizado del caramelo gigante giratorio
    this.render3DCandy(candyStage, exhibit);

    this.element.style.display = 'flex';
    soundManager.playClick();
  }

  private render3DCandy(container: HTMLElement, exhibit: MuseumExhibit): void {
    container.innerHTML = '';

    if (exhibit.candyPhoto) {
      const showcaseWrap = document.createElement('div');
      showcaseWrap.className = 'showcase-candy-photo-stage';
      showcaseWrap.innerHTML = `
        <div class="showcase-photo-halo" style="--candy-glow: ${exhibit.candyColor};"></div>
        <img 
          src="${exhibit.candyPhoto}" 
          alt="${exhibit.candyName}" 
          class="showcase-candy-photo-img" 
          draggable="false"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="museum-3d-candy shape-${exhibit.candyShape}" style="display: none; background: ${exhibit.candyGradient}; box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 25px ${exhibit.candyColor}66;">
          <div class="candy-wrapper-knot knot-left"></div>
          <div class="candy-gloss-sheen"></div>
          <div class="candy-wrapper-brand">
            <span class="candy-brand-text">${exhibit.wrapperText}</span>
          </div>
          <div class="candy-wrapper-knot knot-right"></div>
        </div>
        <div class="showcase-pedestal-cast-shadow"></div>
        <div class="candy-sparkle-stars">✨</div>
      `;
      container.appendChild(showcaseWrap);
      return;
    }

    const candyWrapper = document.createElement('div');
    candyWrapper.className = `museum-3d-candy shape-${exhibit.candyShape}`;
    candyWrapper.style.background = exhibit.candyGradient;
    candyWrapper.style.boxShadow = `0 10px 30px rgba(0,0,0,0.6), 0 0 25px ${exhibit.candyColor}66`;

    // Envoltorio con moños laterales o diseño realista
    candyWrapper.innerHTML = `
      <div class="candy-wrapper-knot knot-left"></div>
      <div class="candy-gloss-sheen"></div>
      <div class="candy-wrapper-brand">
        <span class="candy-brand-text">${exhibit.wrapperText}</span>
      </div>
      <div class="candy-wrapper-knot knot-right"></div>
      <div class="candy-sparkle-stars">✨</div>
    `;

    container.appendChild(candyWrapper);
  }

  private collectCurrentExhibit(): void {
    if (!this.currentExhibit) return;
    this.isCollected = true;

    // Otorgar recompensa en GameState
    const coins = this.currentExhibit.rewardCoins || 300;
    gameState.addMoney(coins);
    soundManager.playFanfare();

    const collectBtn = this.element.querySelector('#btn-collect-candy');
    const collectLabel = this.element.querySelector('#btn-collect-label');
    if (collectBtn && collectLabel) {
      collectBtn.classList.add('already-collected');
      collectLabel.textContent = '✓ ¡DESCUBRIMIENTO REGISTRADO! ⭐';
    }

    // Efecto de celebración con confeti de estrellas
    this.spawnRewardBurst();

    if (this.onCollectedCallback) {
      this.onCollectedCallback(this.currentExhibit.id);
    }
  }

  private spawnRewardBurst(): void {
    const dialog = this.element.querySelector('.museum-showcase-dialog');
    if (!dialog) return;

    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'museum-reward-sparkle';
      p.textContent = ['⭐', '✨', '🍬', '🪙', '🌟'][i % 5];
      p.style.left = `${45 + (Math.random() * 20 - 10)}%`;
      p.style.top = `${50 + (Math.random() * 20 - 10)}%`;
      p.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`);
      p.style.setProperty('--dy', `${(Math.random() - 0.5) * 160 - 40}px`);
      dialog.appendChild(p);

      setTimeout(() => p.remove(), 1200);
    }
  }

  public hide(): void {
    this.element.style.display = 'none';
  }
}
