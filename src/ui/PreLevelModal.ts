import { progressionState, LevelDefinition } from '../gameplay/ProgressionState.ts';
import { MetaProgressionBridge } from '../gameplay/MetaProgressionBridge.ts';
import { soundManager } from '../core/SoundManager.ts';
import { gameState } from '../gameplay/GameState.ts';
import { candySpriteAtlas } from '../minigame/CandySpriteAtlas.ts';

export class PreLevelModal {
  public element: HTMLElement;
  private currentLevelDef: LevelDefinition | null = null;
  private bridge: MetaProgressionBridge;
  private onPlayCallback: (level: number) => void;
  public onOpenQuizRequested?: () => void;

  constructor(bridge: MetaProgressionBridge, onPlay: (level: number) => void) {
    this.bridge = bridge;
    this.onPlayCallback = onPlay;
    this.element = this.render();
  }

  private render(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'prelevel-modal-overlay';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="prelevel-dialog-frame">
        <!-- Decoraciones festivas de golosinas en esquinas -->
        <div class="prelevel-candy-sparkle sparkle-top-left">🍬</div>
        <div class="prelevel-candy-sparkle sparkle-top-right">🍫</div>

        <!-- Botón de Cierre -->
        <button class="prelevel-close-btn interactive" id="prelevel-btn-close" title="Cerrar">✕</button>

        <!-- Cabecera Festiva con Badges de Nivel, Año y Época -->
        <div class="prelevel-header">
          <div class="prelevel-ribbon-row">
            <div class="prelevel-ribbon level-badge">
              <span class="ribbon-text" id="prelevel-ribbon-text">NIVEL 1</span>
            </div>
            <div class="prelevel-ribbon year-badge">
              <span class="ribbon-text" id="prelevel-year-text">📅 AÑO 1951</span>
            </div>
            <div class="prelevel-ribbon era-badge">
              <span class="ribbon-text" id="prelevel-era-text">🏭 NACIMIENTO DE ARCOR</span>
            </div>
          </div>

          <!-- Banner especial de Hito Histórico -->
          <div class="prelevel-milestone-banner" id="prelevel-milestone-banner" style="display: none;">
            <span class="milestone-badge-icon">👑</span>
            <span class="milestone-badge-title" id="prelevel-milestone-title">HITO HISTÓRICO DESTACADO</span>
          </div>

          <h2 class="prelevel-title" id="prelevel-title">Arroyito: El Sueño del Caramelo</h2>
          <div class="prelevel-decade" id="prelevel-decade">El Nacimiento de un Gigante</div>
        </div>

        <!-- Contenedor scrolleable intermedio -->
        <div class="prelevel-body-scroll">
          <!-- Tarjeta de Pistas y Rumores de Anticipación Histórica (1-3 niveles previos a un hito) -->
          <div class="prelevel-hint-card" id="prelevel-hint-card" style="display: none;">
            <div class="hint-card-header">
              <span class="hint-card-icon">🔮</span>
              <span class="hint-card-title">RUMORES DE LA ÉPOCA</span>
              <span class="hint-card-badge">ANTICIPACIÓN</span>
            </div>
            <p class="hint-card-text" id="prelevel-hint-text"></p>
          </div>

          <!-- Tarjeta de Contexto Histórico Dinámico y Divertido -->
          <div class="prelevel-history-card">
            <div class="history-card-header">
              <span class="history-card-clock">🕰️</span>
              <span class="history-card-tag" id="prelevel-history-tag">VIAJE EN EL TIEMPO: AÑO 1951</span>
            </div>
            <h3 class="history-headline" id="prelevel-story-headline">¡Estás en el año 1951 y nace el sueño en Arroyito!</h3>
            <p class="history-body" id="prelevel-story-body">
              Don Fulvio Salvador Pagani y un grupo de jóvenes pioneros encienden la primera paila de cobre en un modesto taller de Arroyito, Córdoba.
            </p>

            <!-- Cápsula Divertida de ¿Sabías que...? -->
            <div class="history-funfact-box" id="prelevel-funfact-box">
              <span class="funfact-bulb">💡</span>
              <div class="funfact-content">
                <strong class="funfact-title">¿SABÍAS QUE...?</strong>
                <span class="funfact-text" id="prelevel-funfact-text">El nombre "ARCOR" nació de la combinación de AR y COR.</span>
              </div>
            </div>

            <!-- Frase histórica inspiradora de Don Fulvio -->
            <div class="history-quote-box">
              <span class="quote-mark">“</span>
              <span class="quote-text" id="prelevel-quote">Un pequeño comienzo, un gran futuro...</span>
              <span class="quote-mark">”</span>
            </div>
          </div>

          <!-- Panel de Objetivos con Piezas 3D -->
          <div class="prelevel-section">
            <div class="section-title">
              <span class="section-title-icon">🎯</span> OBJETIVOS DEL NIVEL
            </div>
            <div class="prelevel-objectives-row" id="prelevel-objectives">
              <!-- Rellenado dinámicamente con mini-canvases 3D -->
            </div>
          </div>

          <!-- Panel de Boosters Recomendados -->
          <div class="prelevel-section">
            <div class="section-title">
              <span class="section-title-icon">⚡</span> AYUDAS DISPONIBLES
            </div>
            <div class="prelevel-boosters-row" id="prelevel-boosters">
              <div class="prelevel-booster-chip">
                <span class="booster-icon">🔨</span>
                <span class="booster-name">Martillo</span>
                <span class="booster-count" id="pre-booster-hammer">+3</span>
              </div>
              <div class="prelevel-booster-chip">
                <span class="booster-icon">🌈</span>
                <span class="booster-name">Rocklet</span>
                <span class="booster-count" id="pre-booster-rocklet">+3</span>
              </div>
              <div class="prelevel-booster-chip">
                <span class="booster-icon">🧤</span>
                <span class="booster-name">Guante</span>
                <span class="booster-count" id="pre-booster-swap">+3</span>
              </div>
            </div>
          </div>

          <!-- Resumen de Estrellas Ganadas Previamente -->
          <div class="prelevel-stars-preview" id="prelevel-stars-preview">
            <span class="preview-star" id="p-star-1">★</span>
            <span class="preview-star" id="p-star-2">★</span>
            <span class="preview-star" id="p-star-3">★</span>
          </div>
        </div>

        <!-- Botón de Acción Principal (Siempre visible al pie de la tarjeta) -->
        <div class="prelevel-actions">
          <button class="btn-prelevel-play interactive" id="btn-prelevel-play">
            <span class="btn-play-heart">❤️</span>
            <span class="btn-play-text">¡JUGAR!</span>
            <span class="btn-play-cost">(Gasta 1 Vida)</span>
          </button>
        </div>
      </div>
    `;

    // Listeners
    modal.querySelector('#prelevel-btn-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hide();
      }
    });

    modal.querySelector('#btn-prelevel-play')?.addEventListener('click', () => {
      if (!this.currentLevelDef) return;

      const lives = progressionState.getLives();
      if (lives <= 0) {
        soundManager.playClick();
        if (this.onOpenQuizRequested) {
          this.onOpenQuizRequested();
        } else {
          progressionState.refillLives();
        }
        this.updatePlayButton();
        return;
      }

      // Consumir 1 vida e iniciar
      progressionState.useLife();
      soundManager.playFanfare();
      const lvl = this.currentLevelDef.levelNumber;
      this.hide();
      this.onPlayCallback(lvl);
    });

    return modal;
  }

  public show(levelDef: LevelDefinition): void {
    this.currentLevelDef = levelDef;
    const lvlNum = levelDef.levelNumber;

    // Actualizar Badges y Títulos
    const ribbonEl = this.element.querySelector('#prelevel-ribbon-text');
    const yearTextEl = this.element.querySelector('#prelevel-year-text');
    const eraTextEl = this.element.querySelector('#prelevel-era-text');
    const titleEl = this.element.querySelector('#prelevel-title');
    const decadeEl = this.element.querySelector('#prelevel-decade');

    if (ribbonEl) ribbonEl.textContent = `NIVEL ${lvlNum}`;
    if (yearTextEl) yearTextEl.textContent = `📅 AÑO ${levelDef.year}`;
    if (eraTextEl) eraTextEl.textContent = levelDef.eraTag || '🏭 FÁBRICA ARCOR';
    if (titleEl) titleEl.textContent = levelDef.title.includes(':') ? levelDef.title.split(':')[1]?.trim() : levelDef.title;
    if (decadeEl) decadeEl.textContent = levelDef.decadeTitle;

    // Banner de Hito Histórico Especial
    const milestoneBannerEl = this.element.querySelector('#prelevel-milestone-banner') as HTMLElement | null;
    const milestoneTitleEl = this.element.querySelector('#prelevel-milestone-title');
    if (milestoneBannerEl) {
      if (levelDef.isSpecialMilestone) {
        milestoneBannerEl.style.display = 'inline-flex';
        if (milestoneTitleEl) {
          milestoneTitleEl.textContent = levelDef.milestoneTitle ? `🏆 HITO: ${levelDef.milestoneTitle}` : '👑 HITO HISTÓRICO ESPECIAL';
        }
      } else {
        milestoneBannerEl.style.display = 'none';
      }
    }

    // Pista de Anticipación (Rumores de la época 1-3 niveles previos)
    const hintCardEl = this.element.querySelector('#prelevel-hint-card') as HTMLElement | null;
    const hintTextEl = this.element.querySelector('#prelevel-hint-text');
    if (hintCardEl) {
      if (levelDef.hint) {
        hintCardEl.style.display = 'block';
        if (hintTextEl) hintTextEl.textContent = levelDef.hint;
      } else {
        hintCardEl.style.display = 'none';
      }
    }

    // Actualizar Historia y Contexto Histórico
    const historyTagEl = this.element.querySelector('#prelevel-history-tag');
    const storyHeadlineEl = this.element.querySelector('#prelevel-story-headline');
    const storyBodyEl = this.element.querySelector('#prelevel-story-body');
    const funfactTextEl = this.element.querySelector('#prelevel-funfact-text');
    const quoteEl = this.element.querySelector('#prelevel-quote');

    if (historyTagEl) historyTagEl.textContent = `VIAJE EN EL TIEMPO: AÑO ${levelDef.year}`;
    if (storyHeadlineEl) storyHeadlineEl.textContent = levelDef.storyHeadline || `¡Estás en el año ${levelDef.year}!`;
    if (storyBodyEl) storyBodyEl.textContent = levelDef.storyBody || levelDef.description;
    if (funfactTextEl) funfactTextEl.textContent = levelDef.funFact || 'Cada golosina Arcor se elabora con ingredientes puros y dedicación artesanal.';
    if (quoteEl) quoteEl.textContent = levelDef.quote.replace(/"/g, '');

    // Objetivos desde el motor Match-3 con preview de pieza 3D
    const cfg = this.bridge.getLevelConfig(lvlNum);
    const objContainer = this.element.querySelector('#prelevel-objectives');
    if (objContainer) {
      objContainer.innerHTML = '';
      cfg.objectives.forEach(obj => {
        const item = document.createElement('div');
        item.className = 'prelevel-target-card';

        // Mini canvas con la pieza en 3D
        const miniCanvas = document.createElement('canvas');
        miniCanvas.width = 40;
        miniCanvas.height = 40;
        miniCanvas.className = 'prelevel-target-mini-canvas';
        const ctx = miniCanvas.getContext('2d');
        if (ctx) {
          const drawn = candySpriteAtlas.draw(ctx, obj.type, 20, 20, 36);
          if (!drawn) {
            candySpriteAtlas.initLoad().then(() => {
              const retryCtx = miniCanvas.getContext('2d');
              if (retryCtx) candySpriteAtlas.draw(retryCtx, obj.type, 20, 20, 36);
            });
          }
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'target-info';
        infoDiv.innerHTML = `
          <span class="target-name">${obj.name}</span>
          <span class="target-qty">${obj.target} unidades</span>
        `;

        item.appendChild(miniCanvas);
        item.appendChild(infoDiv);
        objContainer.appendChild(item);
      });
    }

    // Boosters disponibles
    const data = gameState.getData();
    const hammerEl = this.element.querySelector('#pre-booster-hammer');
    const rockletEl = this.element.querySelector('#pre-booster-rocklet');
    const swapEl = this.element.querySelector('#pre-booster-swap');

    if (hammerEl) hammerEl.textContent = `+${data.match3Boosters?.hammer ?? 3}`;
    if (rockletEl) rockletEl.textContent = `+${data.match3Boosters?.rocklet ?? 3}`;
    if (swapEl) swapEl.textContent = `+${data.match3Boosters?.swap ?? 3}`;

    // Estrellas ganadas en este nivel
    const stars = progressionState.getLevelStars(lvlNum);
    for (let i = 1; i <= 3; i++) {
      const starEl = this.element.querySelector(`#p-star-${i}`);
      if (starEl) {
        if (i <= stars) {
          starEl.classList.add('earned');
        } else {
          starEl.classList.remove('earned');
        }
      }
    }

    this.updatePlayButton();
    this.element.style.display = 'flex';
  }

  public hide(): void {
    this.element.style.display = 'none';
  }

  private updatePlayButton(): void {
    const playBtn = this.element.querySelector('#btn-prelevel-play');
    if (!playBtn) return;

    const lives = progressionState.getLives();
    const lvlNum = this.currentLevelDef?.levelNumber || 1;
    if (lives > 0) {
      playBtn.classList.remove('no-lives');
      playBtn.innerHTML = `
        <span class="btn-play-heart">❤️</span>
        <span class="btn-play-text">¡JUGAR NIVEL ${lvlNum}!</span>
        <span class="btn-play-cost">(Gasta 1 Vida)</span>
      `;
    } else {
      playBtn.classList.add('no-lives');
      playBtn.innerHTML = `
        <span class="btn-play-heart">💡</span>
        <span class="btn-play-text">RECUPERAR VIDA (QUIZ)</span>
        <span class="btn-play-cost">(Trivia de Arcor)</span>
      `;
    }
  }
}
