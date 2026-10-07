import { Match3Engine, ArcorProductInfo } from '../minigame/Match3Engine.ts';
import { Match3Renderer } from '../minigame/Match3Renderer.ts';
import { MetaProgressionBridge } from '../gameplay/MetaProgressionBridge.ts';
import { soundManager } from '../core/SoundManager.ts';
import { gameState } from '../gameplay/GameState.ts';
import { progressionState } from '../gameplay/ProgressionState.ts';
import { candySpriteAtlas } from '../minigame/CandySpriteAtlas.ts';

export class Match3HUD {
  public element: HTMLElement;
  private engine: Match3Engine;
  private renderer: Match3Renderer | null = null;
  private bridge: MetaProgressionBridge;
  private canvas: HTMLCanvasElement | null = null;

  // Elementos de UI
  private levelTitleEl: HTMLElement | null = null;
  private scoreEl: HTMLElement | null = null;
  private movesEl: HTMLElement | null = null;
  private star1El: HTMLElement | null = null;
  private star2El: HTMLElement | null = null;
  private star3El: HTMLElement | null = null;
  private objectivesContainer: HTMLElement | null = null;

  // Boosters
  private hammerCountEl: HTMLElement | null = null;
  private swapCountEl: HTMLElement | null = null;
  private rockletCountEl: HTMLElement | null = null;
  private hammerBtnEl: HTMLElement | null = null;
  private swapBtnEl: HTMLElement | null = null;
  private rockletBtnEl: HTMLElement | null = null;

  // Modales de fin de nivel y desbloqueo
  private winModal: HTMLElement | null = null;
  private loseModal: HTMLElement | null = null;
  private brokenCandyCanvas: HTMLCanvasElement | null = null;
  private brokenCandyAnimId: number | null = null;
  private unlockModal: HTMLElement | null = null;
  private unlockCanvas: HTMLCanvasElement | null = null;
  private unlockAnimId: number | null = null;
  private seenUnlocks: Set<string> = new Set();

  public onClose?: () => void;
  public onOpenQuizRequested?: () => void;

  constructor(engine: Match3Engine, bridge: MetaProgressionBridge) {
    this.engine = engine;
    this.bridge = bridge;
    this.element = this.render();
    this.setupEngineSubscriptions();

    progressionState.subscribe(() => {
      if (this.loseModal && this.loseModal.style.display === 'flex') {
        const lives = progressionState.getLives();
        const quizBtn = this.loseModal.querySelector<HTMLElement>('#btn-lose-quiz');
        const retryBtn = this.loseModal.querySelector<HTMLElement>('#btn-lose-retry');
        if (lives <= 0) {
          if (quizBtn) quizBtn.style.display = 'inline-flex';
          const sub = retryBtn?.querySelector('.btn-retry-sub');
          if (sub) sub.textContent = '(Sin vidas suficientes)';
        } else {
          if (quizBtn) quizBtn.style.display = 'none';
          const sub = retryBtn?.querySelector('.btn-retry-sub');
          if (sub) sub.textContent = '(Gasta 1 Vida)';
        }
      }
    });
  }

  private render(): HTMLElement {
    const root = document.createElement('div');
    root.className = 'match3-fullscreen-overlay';
    root.style.display = 'none';

    root.innerHTML = `
      <!-- Fondo Escénico Panorámico 16:9 de Fábrica de Chocolate y Dulces ARCOR -->
      <div class="match3-scenic-backdrop"></div>
      <div class="match3-scenic-vignette"></div>

      <div class="match3-main-container">
        <!-- Barra Superior: Nivel, Logo Arcor y Movimientos -->
        <div class="match3-top-bar">
          <!-- Widget Izquierdo: Nivel, Estrellas y Puntaje -->
          <div class="match3-header-card level-card">
            <div class="header-card-title" id="m3-level-title">Nivel 1</div>
            <div class="m3-stars-row">
              <span class="m3-star" id="m3-star-1">⭐</span>
              <span class="m3-star" id="m3-star-2">⭐</span>
              <span class="m3-star" id="m3-star-3">⭐</span>
            </div>
            <div class="header-card-sub">Puntaje: <span id="m3-score-val" class="highlight-gold">0</span></div>
          </div>

          <!-- Logo Central Arcor Oficial -->
          <div class="match3-center-logo">
            <img src="./arcor_logo.png" alt="ARCOR" class="m3-arcor-logo" />
            <span class="m3-arcor-slogan">Un mundo más dulce ♡</span>
          </div>

          <!-- Widget Derecho: Movimientos Restantes -->
          <div class="match3-header-card moves-card">
            <div class="header-card-title">Movimientos</div>
            <div class="m3-moves-number" id="m3-moves-val">22</div>
            <button class="m3-btn-exit interactive" id="m3-btn-exit" title="Volver a la Fábrica">✕</button>
          </div>
        </div>

        <!-- Área Central: Panel de Objetivos + Tablero Canvas + Boosters -->
        <div class="match3-play-area">
          <!-- Lateral Izquierdo: Objetivos del Nivel -->
          <div class="match3-sidebar objectives-sidebar">
            <div class="sidebar-plaque-header"><span class="plaque-sparkle">🎯</span> OBJETIVO</div>
            <div class="objectives-list" id="m3-objectives-list">
              <!-- Renderizado dinámico de objetivos -->
            </div>
            <div class="sidebar-wood-signs">
              <span class="wood-sign">CHOCOLATES</span>
              <span class="wood-sign">CARAMELOS</span>
              <span class="wood-sign">GALLETITAS</span>
              <span class="wood-sign">TU MOMENTO ♡</span>
            </div>
          </div>

          <!-- Tablero Central con Marco de Chocolate Moldeado -->
          <div class="match3-board-frame">
            <canvas id="match3-canvas" class="match3-canvas interactive"></canvas>
          </div>

          <!-- Lateral Derecho: Boosters Táctiles -->
          <div class="match3-sidebar boosters-sidebar">
            <div class="sidebar-plaque-header"><span class="plaque-sparkle">✨</span> AYUDAS</div>
            <div class="boosters-list">
              <!-- 1. MARTILLO DE CARAMELO -->
              <div class="booster-item-card" data-booster-type="hammer">
                <button class="booster-info-trigger interactive" data-booster-info="hammer" title="¿Para qué sirve el Martillo?">
                  <span class="info-trigger-icon">i</span>
                </button>
                <button class="booster-btn booster-btn-hammer interactive" id="booster-hammer" title="Martillo de Caramelo - ¡Destruye cualquier caramelo o bloqueador!">
                  <div class="booster-aura-ring"></div>
                  <div class="booster-sheen-sweep"></div>
                  <div class="booster-icon-wrap">
                    <span class="booster-icon">🔨</span>
                  </div>
                  <span class="booster-badge" id="booster-hammer-count">+3</span>
                  <span class="booster-active-tag">¡ACTIVO!</span>
                </button>
                <div class="booster-name-pill pill-hammer">MARTILLO</div>

                <!-- Tarjetita de Información Flotante -->
                <div class="booster-info-card card-theme-hammer" id="booster-info-card-hammer">
                  <div class="info-card-pointer"></div>
                  <div class="info-card-header">
                    <div class="info-icon-badge">🔨</div>
                    <div class="info-header-texts">
                      <h4 class="info-card-title">Martillo de Caramelo</h4>
                      <span class="info-card-tag">ROMPE CASILLA • NO GASTA TURNO</span>
                    </div>
                    <button class="info-card-close-btn interactive" data-close-info="hammer" title="Cerrar tarjeta">✕</button>
                  </div>
                  <div class="info-card-body">
                    <div class="info-section">
                      <span class="info-section-title">¿PARA QUÉ SIRVE?</span>
                      <p class="info-section-desc">
                        Rompe y elimina al instante <strong>cualquier caramelo, chocolate o bloqueador</strong> que toques en el tablero <strong>sin gastar movimientos</strong>.
                      </p>
                    </div>
                    <div class="info-tip-box">
                      <span class="info-tip-icon">💡</span>
                      <div class="info-tip-content">
                        <strong>Modo de uso:</strong> Tocá el martillo y después la casilla exacta que quieras destruir.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. MEGA ROCKLET ARCOÍRIS -->
              <div class="booster-item-card" data-booster-type="rocklet">
                <button class="booster-info-trigger interactive" data-booster-info="rocklet" title="¿Para qué sirve el Rocklet?">
                  <span class="info-trigger-icon">i</span>
                </button>
                <button class="booster-btn booster-btn-rocklet interactive" id="booster-rocklet" title="Mega Rocklet - ¡Elimina todos los caramelos de un color!">
                  <div class="booster-aura-ring"></div>
                  <div class="booster-sheen-sweep"></div>
                  <div class="booster-icon-wrap">
                    <span class="booster-icon">🌈</span>
                  </div>
                  <span class="booster-badge" id="booster-rocklet-count">+3</span>
                  <span class="booster-active-tag">¡ACTIVO!</span>
                </button>
                <div class="booster-name-pill pill-rocklet">ROCKLET</div>

                <!-- Tarjetita de Información Flotante -->
                <div class="booster-info-card card-theme-rocklet" id="booster-info-card-rocklet">
                  <div class="info-card-pointer"></div>
                  <div class="info-card-header">
                    <div class="info-icon-badge">🌈</div>
                    <div class="info-header-texts">
                      <h4 class="info-card-title">Mega Rocklet</h4>
                      <span class="info-card-tag">BARRIDO MULTICOLOR TOTAL</span>
                    </div>
                    <button class="info-card-close-btn interactive" data-close-info="rocklet" title="Cerrar tarjeta">✕</button>
                  </div>
                  <div class="info-card-body">
                    <div class="info-section">
                      <span class="info-section-title">¿PARA QUÉ SIRVE?</span>
                      <p class="info-section-desc">
                        Desata un rayo que <strong>elimina todos los caramelos de un mismo color</strong> en todo el tablero, provocando grandes cascadas y combos masivos.
                      </p>
                    </div>
                    <div class="info-tip-box">
                      <span class="info-tip-icon">💡</span>
                      <div class="info-tip-content">
                        <strong>Modo de uso:</strong> Activá el Rocklet y tocá un caramelo: ¡todos los de ese color estallarán!
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. GUANTE MÁGICO DE INTERCAMBIO -->
              <div class="booster-item-card" data-booster-type="swap">
                <button class="booster-info-trigger interactive" data-booster-info="swap" title="¿Para qué sirve el Guante Mágico?">
                  <span class="info-trigger-icon">i</span>
                </button>
                <button class="booster-btn booster-btn-swap interactive" id="booster-swap" title="Guante Mágico - ¡Intercambia dos caramelos contiguos sin gastar movimiento!">
                  <div class="booster-aura-ring"></div>
                  <div class="booster-sheen-sweep"></div>
                  <div class="booster-icon-wrap">
                    <span class="booster-icon">🧤</span>
                  </div>
                  <span class="booster-badge" id="booster-swap-count">+3</span>
                  <span class="booster-active-tag">¡ACTIVO!</span>
                </button>
                <div class="booster-name-pill pill-swap">GUANTE</div>

                <!-- Tarjetita de Información Flotante -->
                <div class="booster-info-card card-theme-swap" id="booster-info-card-swap">
                  <div class="info-card-pointer"></div>
                  <div class="info-card-header">
                    <div class="info-icon-badge">🧤</div>
                    <div class="info-header-texts">
                      <h4 class="info-card-title">Guante Mágico</h4>
                      <span class="info-card-tag">INTERCAMBIO LIBRE SIN GASTO</span>
                    </div>
                    <button class="info-card-close-btn interactive" data-close-info="swap" title="Cerrar tarjeta">✕</button>
                  </div>
                  <div class="info-card-body">
                    <div class="info-section">
                      <span class="info-section-title">¿PARA QUÉ SIRVE?</span>
                      <p class="info-section-desc">
                        Te permite <strong>intercambiar dos caramelos contiguos</strong> entre sí sin consumir turnos, <strong>incluso si no forman una combinación</strong> de 3.
                      </p>
                    </div>
                    <div class="info-tip-box">
                      <span class="info-tip-icon">💡</span>
                      <div class="info-tip-content">
                        <strong>Modo de uso:</strong> Activá el guante y seleccioná los dos caramelos contiguos a cambiar.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="sidebar-wood-signs footer-sign">
              <span class="wood-sign mini">Un mundo más dulce es posible ♡</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pantalla Modal de Victoria -->
      <div class="match3-end-dialog" id="m3-win-dialog" style="display: none;">
        <div class="end-dialog-content win-theme">
          <div class="end-trophy-icon">🏆</div>
          <h2 class="end-title">¡NIVEL COMPLETADO!</h2>
          <div class="end-stars-awarded" id="end-stars-awarded">⭐⭐⭐</div>
          <div class="end-reward-box">
            <div class="end-reward-item">
              <span class="reward-icon">⭐</span>
              <span class="reward-val">+1 Estrella Histórica</span>
            </div>
            <div class="end-reward-item">
              <span class="reward-icon">💵</span>
              <span class="reward-val" id="end-coins-val">+$350 USD</span>
            </div>
          </div>
          <button class="btn btn-primary btn-win-continue interactive" id="btn-win-continue">
            Continuar al Camino 🗺️
          </button>
        </div>
      </div>

      <!-- Pantalla Modal de Derrota Renovada: Sin Movimientos y Caramelo Roto -->
      <div class="match3-end-dialog" id="m3-lose-dialog" style="display: none;">
        <div class="end-dialog-content lose-theme">
          <!-- Ribbon de Ánimo -->
          <div class="lose-ribbon-badge">⚠️ ¡A UN PASO DE LA GLORIA!</div>

          <!-- Caramelo Roto Real Arcor con Chispas y Destellos -->
          <div class="lose-broken-candy-wrap">
            <div class="candy-ambient-glow"></div>
            <div class="candy-dark-backing"></div>
            <img src="./real_broken_candy.jpg" alt="Caramelo Real Quebrado Arcor" class="real-broken-candy-img" />
            <canvas id="lose-broken-candy-canvas" width="220" height="150"></canvas>
          </div>

          <!-- Título y Nivel/Año -->
          <h2 class="lose-title">¡SIN MOVIMIENTOS!</h2>
          <div class="lose-subtitle" id="lose-level-indicator">Nivel 1 • Año 1951</div>

          <!-- Caja de Consejo Histórico de Don Fulvio -->
          <div class="lose-history-box">
            <div class="lose-history-header">
              <span class="lose-history-icon">🍬</span>
              <span class="lose-history-title">CONSEJO DEL MAESTRO DULCERO</span>
            </div>
            <p class="lose-history-text" id="lose-history-text">
              En 1951, a Don Fulvio se le pegaron las primeras pailas antes de lograr el caramelo perfecto. ¡Los grandes maestros vuelven a encender el fuego con más ganas!
            </p>
          </div>

          <!-- Resumen de objetivos pendientes -->
          <div class="lose-objectives-summary" id="lose-objectives-summary"></div>

          <!-- Acciones -->
          <div class="end-lose-actions">
            <button class="btn btn-primary btn-lose-quiz interactive" id="btn-lose-quiz" style="display: none;">
              <span class="quiz-icon">💡</span>
              <span class="quiz-text">RECUPERAR VIDAS (QUIZ)</span>
            </button>

            <button class="btn-retry-glow interactive" id="btn-lose-retry">
              <span class="btn-retry-icon">🔄</span>
              <span class="btn-retry-text">¡REINTENTAR NIVEL!</span>
              <span class="btn-retry-sub">(Gasta 1 Vida)</span>
            </button>

            <button class="btn-extra-moves interactive" id="btn-lose-extra-moves" title="+5 Movimientos para ganar">
              <span class="extra-icon">✨</span>
              <span class="extra-text">+5 Movimientos Extra</span>
            </button>

            <button class="btn btn-secondary interactive" id="btn-lose-exit">
              Volver al Camino 🗺️
            </button>
          </div>
        </div>
      </div>

      <!-- Pantalla Modal de Desbloqueo de Producto Histórico -->
      <div class="match3-end-dialog" id="m3-unlock-dialog" style="display: none;">
        <div class="end-dialog-content unlock-product-theme">
          <div class="unlock-ribbon">¡NUEVO DULCE DESBLOQUEADO!</div>
          <div class="unlock-year-badge" id="unlock-product-year">AÑO 1984</div>
          <div class="unlock-product-avatar-wrap">
            <canvas id="unlock-product-canvas" width="160" height="160"></canvas>
          </div>
          <h2 class="unlock-name" id="unlock-product-name">Bon o Bon</h2>
          <div class="unlock-banner-tag" id="unlock-product-category">BOMBÓN HISTÓRICO DE ARCOR</div>
          <p class="unlock-desc" id="unlock-product-desc">
            El hito mundial de Arcor: oblea crocante, relleno de maní y baño de chocolate con leche.
          </p>
          <div class="unlock-tip">✨ ¡Disponible en el tablero de juego a partir de este nivel!</div>
          <button class="btn btn-primary btn-win-continue interactive" id="btn-unlock-play">
            ¡A Jugar con este Dulce! 🍬
          </button>
        </div>
      </div>
    `;

    this.levelTitleEl = root.querySelector('#m3-level-title');
    this.scoreEl = root.querySelector('#m3-score-val');
    this.movesEl = root.querySelector('#m3-moves-val');
    this.star1El = root.querySelector('#m3-star-1');
    this.star2El = root.querySelector('#m3-star-2');
    this.star3El = root.querySelector('#m3-star-3');
    this.objectivesContainer = root.querySelector('#m3-objectives-list');

    this.hammerCountEl = root.querySelector('#booster-hammer-count');
    this.swapCountEl = root.querySelector('#booster-swap-count');
    this.rockletCountEl = root.querySelector('#booster-rocklet-count');
    this.hammerBtnEl = root.querySelector('#booster-hammer');
    this.rockletBtnEl = root.querySelector('#booster-rocklet');
    this.swapBtnEl = root.querySelector('#booster-swap');

    this.winModal = root.querySelector('#m3-win-dialog');
    this.loseModal = root.querySelector('#m3-lose-dialog');
    this.brokenCandyCanvas = root.querySelector('#lose-broken-candy-canvas');
    this.unlockModal = root.querySelector('#m3-unlock-dialog');
    this.unlockCanvas = root.querySelector('#unlock-product-canvas');

    // Listeners de cierre y botones
    root.querySelector('#m3-btn-exit')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    root.querySelector('#btn-win-continue')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    root.querySelector('#btn-lose-quiz')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.onOpenQuizRequested) {
        this.onOpenQuizRequested();
      }
    });

    root.querySelector('#btn-lose-retry')?.addEventListener('click', () => {
      soundManager.playClick();
      const lives = progressionState.getLives();
      if (lives <= 0) {
        if (this.onOpenQuizRequested) {
          this.onOpenQuizRequested();
          return;
        }
        progressionState.refillLives();
      }
      this.hideLoseModal();
      progressionState.useLife();
      const cfg = this.bridge.getLevelConfig(this.engine.currentLevel);
      this.engine.startLevel(cfg);
    });

    root.querySelector('#btn-lose-extra-moves')?.addEventListener('click', () => {
      soundManager.playFanfare();
      this.hideLoseModal();
      this.engine.addExtraMoves(5);
    });

    root.querySelector('#btn-lose-exit')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hideLoseModal();
      this.hide();
    });

    root.querySelector('#btn-unlock-play')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hideProductUnlock();
    });

    // Listeners de Boosters con activación, cancelación y reembolso
    const toggleBooster = (type: 'hammer' | 'mega_rocklet' | 'swap', prop: 'hammer' | 'rocklet' | 'swap') => {
      if (!this.renderer) return;
      const data = gameState.getData() as any;
      if (!data.match3Boosters) {
        data.match3Boosters = { hammer: 3, rocklet: 3, swap: 3 };
      }

      // Si ya está activo este mismo booster, lo cancela y reembolsa
      if (this.renderer.activeBooster === type) {
        soundManager.playClick();
        this.renderer.activeBooster = null;
        data.match3Boosters[prop]++;
        this.updateBoostersDisplay();
        return;
      }

      // Si había otro booster activo, reembolsar ese primero
      if (this.renderer.activeBooster) {
        if (this.renderer.activeBooster === 'hammer') data.match3Boosters.hammer++;
        else if (this.renderer.activeBooster === 'mega_rocklet') data.match3Boosters.rocklet++;
        else if (this.renderer.activeBooster === 'swap') data.match3Boosters.swap++;
        this.renderer.activeBooster = null;
      }

      // Verificar si quedan existencias
      if ((data.match3Boosters[prop] || 0) > 0) {
        soundManager.playCoin();
        this.renderer.activeBooster = type;
        data.match3Boosters[prop]--;
        this.updateBoostersDisplay();
      } else {
        soundManager.playClick();
      }
    };

    // Función para cerrar todas las tarjetas de información abiertas
    const closeAllInfoCards = () => {
      root.querySelectorAll('.booster-info-card.is-open').forEach(card => {
        card.classList.remove('is-open');
      });
    };

    // Botones (ⓘ) para abrir / alternar la tarjetita de información
    root.querySelectorAll<HTMLButtonElement>('[data-booster-info]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundManager.playClick();
        const type = btn.getAttribute('data-booster-info');
        const targetCard = root.querySelector<HTMLElement>(`#booster-info-card-${type}`);
        if (!targetCard) return;

        const wasOpen = targetCard.classList.contains('is-open');
        closeAllInfoCards();
        if (!wasOpen) {
          targetCard.classList.add('is-open');
        }
      });
    });

    // Botones (✕) para cerrar las tarjetas de información
    root.querySelectorAll<HTMLButtonElement>('[data-close-info]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundManager.playClick();
        const type = btn.getAttribute('data-close-info');
        const targetCard = root.querySelector<HTMLElement>(`#booster-info-card-${type}`);
        targetCard?.classList.remove('is-open');
      });
    });

    // Cerrar tarjetas al hacer clic en cualquier parte exterior
    root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.booster-info-card') && !target.closest('.booster-info-trigger')) {
        closeAllInfoCards();
      }
    });

    this.hammerBtnEl?.addEventListener('click', () => {
      closeAllInfoCards();
      toggleBooster('hammer', 'hammer');
    });
    this.rockletBtnEl?.addEventListener('click', () => {
      closeAllInfoCards();
      toggleBooster('mega_rocklet', 'rocklet');
    });
    this.swapBtnEl?.addEventListener('click', () => {
      closeAllInfoCards();
      toggleBooster('swap', 'swap');
    });

    return root;
  }

  private setupEngineSubscriptions(): void {
    this.engine.onStateChanged = () => {
      this.updateHUD();
    };

    this.engine.onLevelWon = (stars, score, coins) => {
      const res = this.bridge.registerLevelVictory(this.engine.currentLevel, stars, score, coins);
      progressionState.recordVictory(this.engine.currentLevel, stars, score);

      if (this.winModal) {
        const starsEl = this.winModal.querySelector('#end-stars-awarded');
        const coinsEl = this.winModal.querySelector('#end-coins-val');
        if (starsEl) starsEl.textContent = '⭐'.repeat(stars);
        if (coinsEl) coinsEl.textContent = `+$${res.coinsEarned} USD`;
        this.winModal.style.display = 'flex';
      }
    };

    this.engine.onLevelLost = () => {
      this.showLoseModal();
    };
  }

  /**
   * Abre la pantalla del Match-3 e inicializa el nivel
   */
  public show(levelNumber?: number): void {
    const data = gameState.getData();
    const lvl = levelNumber || data.match3CurrentLevel || 1;

    this.element.style.display = 'flex';
    if (this.winModal) this.winModal.style.display = 'none';
    this.hideLoseModal();
    if (this.unlockModal) this.unlockModal.style.display = 'none';

    // Inicializar Renderer en el canvas
    if (!this.renderer) {
      this.canvas = this.element.querySelector('#match3-canvas');
      if (this.canvas) {
        this.renderer = new Match3Renderer(this.canvas, this.engine);
        this.renderer.onBoosterChanged = () => {
          this.updateBoosterActiveStates();
        };
      }
    }

    const cfg = this.bridge.getLevelConfig(lvl);
    this.engine.startLevel(cfg);

    // Celebración histórica si desbloquea un nuevo dulce Arcor
    if (cfg.newUnlockedProduct) {
      const prodType = cfg.newUnlockedProduct.type;
      const alreadySaved = data.unlockedMatch3Candies?.includes(prodType);
      if (!alreadySaved || !this.seenUnlocks.has(prodType)) {
        this.seenUnlocks.add(prodType);
        if (!alreadySaved) {
          if (!data.unlockedMatch3Candies) {
            (data as any).unlockedMatch3Candies = [];
          }
          data.unlockedMatch3Candies.push(prodType);
        }
        this.showProductUnlock(cfg.newUnlockedProduct);
      }
    }

    setTimeout(() => {
      if (this.renderer) this.renderer.resize();
    }, 50);

    setTimeout(() => {
      if (this.renderer) this.renderer.resize();
    }, 180);

    this.updateHUD();
    this.updateBoostersDisplay();
  }

  public hide(): void {
    this.hideProductUnlock();
    this.hideLoseModal();
    this.element.style.display = 'none';
    if (this.onClose) this.onClose();
  }

  private showLoseModal(): void {
    if (!this.loseModal) return;

    soundManager.playLose();

    const lvlNum = this.engine.currentLevel;
    const levelDef = progressionState.getLevelDefinition(lvlNum);

    const loseYearEl = this.loseModal.querySelector('#lose-level-indicator');
    const loseTextEl = this.loseModal.querySelector('#lose-history-text');
    const loseObjectivesEl = this.loseModal.querySelector('#lose-objectives-summary');

    if (loseYearEl) {
      loseYearEl.textContent = `NIVEL ${lvlNum} • AÑO ${levelDef.year} (${levelDef.decadeTitle})`;
    }

    if (loseTextEl) {
      loseTextEl.textContent = `En el año ${levelDef.year}, los maestros de Arcor aprendieron que las recetas más dulces nacen de la perseverancia. ¡Estuviste muy cerca de completar la producción!`;
    }

    // Resumen de objetivos pendientes
    if (loseObjectivesEl) {
      loseObjectivesEl.innerHTML = '';
      this.engine.objectives.forEach(obj => {
        const remaining = Math.max(0, obj.target - obj.current);
        const chip = document.createElement('div');
        chip.className = `lose-obj-chip ${remaining === 0 ? 'done' : 'pending'}`;

        const miniCanvas = document.createElement('canvas');
        miniCanvas.width = 36;
        miniCanvas.height = 36;
        miniCanvas.className = 'lose-chip-canvas';
        const ctx = miniCanvas.getContext('2d');
        if (ctx) {
          candySpriteAtlas.draw(ctx, obj.type, 18, 18, 30);
        }

        const span = document.createElement('span');
        span.className = 'lose-chip-text';
        span.textContent = remaining === 0 ? `✓ ¡Listo!` : `Faltan ${remaining}`;

        chip.appendChild(miniCanvas);
        chip.appendChild(span);
        loseObjectivesEl.appendChild(chip);
      });
    }

    this.loseModal.style.display = 'flex';
    this.startBrokenCandyAnimation();

    const lives = progressionState.getLives();
    const quizBtn = this.loseModal.querySelector<HTMLElement>('#btn-lose-quiz');
    const retryBtn = this.loseModal.querySelector<HTMLElement>('#btn-lose-retry');
    if (lives <= 0) {
      if (quizBtn) quizBtn.style.display = 'inline-flex';
      const sub = retryBtn?.querySelector('.btn-retry-sub');
      if (sub) sub.textContent = '(Sin vidas suficientes)';
    } else {
      if (quizBtn) quizBtn.style.display = 'none';
      const sub = retryBtn?.querySelector('.btn-retry-sub');
      if (sub) sub.textContent = '(Gasta 1 Vida)';
    }
  }

  private hideLoseModal(): void {
    this.stopBrokenCandyAnimation();
    if (this.loseModal) {
      this.loseModal.style.display = 'none';
    }
  }

  /**
   * Partículas vivas de azúcar glaseada, cristales y destellos sobre el Caramelo Real Arcor
   */
  private startBrokenCandyAnimation(): void {
    if (!this.brokenCandyCanvas) return;
    const ctx = this.brokenCandyCanvas.getContext('2d');
    if (!ctx) return;

    this.stopBrokenCandyAnimation();

    let t = 0;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number; spark: boolean }[] = [];

    // Nube de micro-cristales de azúcar y chispas doradas flotando alrededor del caramelo real
    for (let i = 0; i < 28; i++) {
      particles.push({
        x: 110 + (Math.random() - 0.5) * 190,
        y: 75 + (Math.random() - 0.5) * 85,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.7 - 0.25,
        r: Math.random() * 2.2 + 0.8,
        color: ['#ffd700', '#fff3e0', '#ffffff', '#ffb300', '#ff8a80', '#ffe082'][Math.floor(Math.random() * 6)],
        alpha: Math.random() * 0.8 + 0.2,
        spark: Math.random() > 0.45
      });
    }

    const animate = () => {
      t += 0.032;
      ctx.clearRect(0, 0, 220, 150);

      // Partículas y destellos de azúcar brillante
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Rebote suave / reaparición dentro del marco del caramelo
        if (p.x < 10 || p.x > 210 || p.y < 8 || p.y > 142) {
          p.x = 110 + (Math.random() - 0.5) * 110;
          p.y = 75 + (Math.random() - 0.5) * 50;
        }

        const pulseAlpha = p.alpha * (0.6 + Math.sin(t * 3.5 + p.x * 0.5) * 0.4);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, pulseAlpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Destello en cruz de 4 puntas estilo confitería mágica
        if (p.spark && p.r > 1.6) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.9;
          const crossSize = 3.5 + Math.sin(t * 4 + p.y) * 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x - crossSize, p.y);
          ctx.lineTo(p.x + crossSize, p.y);
          ctx.moveTo(p.x, p.y - crossSize);
          ctx.lineTo(p.x, p.y + crossSize);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      this.brokenCandyAnimId = requestAnimationFrame(animate);
    };

    animate();
  }

  private stopBrokenCandyAnimation(): void {
    if (this.brokenCandyAnimId) {
      cancelAnimationFrame(this.brokenCandyAnimId);
      this.brokenCandyAnimId = null;
    }
  }

  private showProductUnlock(product: ArcorProductInfo): void {
    if (!this.unlockModal) return;

    soundManager.playFanfare();

    const yearEl = this.unlockModal.querySelector('#unlock-product-year');
    const nameEl = this.unlockModal.querySelector('#unlock-product-name');
    const catEl = this.unlockModal.querySelector('#unlock-product-category');
    const descEl = this.unlockModal.querySelector('#unlock-product-desc');

    if (yearEl) yearEl.textContent = `AÑO DE CREACIÓN: ${product.year}`;
    if (nameEl) nameEl.textContent = product.name;
    if (catEl) catEl.textContent = `${product.category.toUpperCase()} HISTÓRICO DE ARCOR`;
    if (descEl) descEl.textContent = product.description;

    this.unlockModal.style.display = 'flex';

    // Animar la pieza 3D en unlockCanvas
    if (this.unlockCanvas) {
      const ctx = this.unlockCanvas.getContext('2d');
      if (ctx) {
        if (this.unlockAnimId) cancelAnimationFrame(this.unlockAnimId);

        let t = 0;
        const animate = () => {
          t += 0.04;
          ctx.clearRect(0, 0, 160, 160);

          // Aura dorada brillante
          const auraGrad = ctx.createRadialGradient(80, 80, 20, 80, 80, 75);
          auraGrad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
          auraGrad.addColorStop(0.6, 'rgba(255, 180, 0, 0.2)');
          auraGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(80, 80, 75, 0, Math.PI * 2);
          ctx.fill();

          // Sombra suave en la base
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(80, 134, 45, 14, 0, 0, Math.PI * 2);
          ctx.fill();

          // Flotación y respiración
          const floatY = Math.sin(t) * 7;
          const wobble = Math.sin(t * 0.8) * 0.08;
          const scale = 1 + Math.sin(t * 1.2) * 0.04;

          candySpriteAtlas.draw(ctx, product.type, 80, 75 + floatY, 115, wobble, scale);

          this.unlockAnimId = requestAnimationFrame(animate);
        };
        animate();
      }
    }
  }

  private hideProductUnlock(): void {
    if (this.unlockAnimId) {
      cancelAnimationFrame(this.unlockAnimId);
      this.unlockAnimId = null;
    }
    if (this.unlockModal) {
      this.unlockModal.style.display = 'none';
    }
  }

  public updateHUD(): void {
    if (this.levelTitleEl) {
      const ldef = progressionState.getLevelDefinition(this.engine.currentLevel);
      this.levelTitleEl.textContent = `Nivel ${this.engine.currentLevel} • Año ${ldef.year}${ldef.isSpecialMilestone ? ' 🏆' : ''}`;
    }
    if (this.scoreEl) this.scoreEl.textContent = this.engine.score.toLocaleString();
    if (this.movesEl) this.movesEl.textContent = `${this.engine.movesRemaining}`;

    // Alerta de últimos movimientos
    const movesCard = this.movesEl?.closest('.moves-card');
    if (movesCard) {
      if (this.engine.movesRemaining <= 5) {
        movesCard.classList.add('moves-critical');
      } else {
        movesCard.classList.remove('moves-critical');
      }
    }

    // Estrellas
    const stars = this.engine.getCurrentStars();
    if (this.star1El) this.star1El.className = `m3-star ${stars >= 1 ? 'earned' : ''}`;
    if (this.star2El) this.star2El.className = `m3-star ${stars >= 2 ? 'earned' : ''}`;
    if (this.star3El) this.star3El.className = `m3-star ${stars >= 3 ? 'earned' : ''}`;

    // Objetivos con preview 3D
    if (this.objectivesContainer) {
      this.objectivesContainer.innerHTML = '';
      this.engine.objectives.forEach(obj => {
        const item = document.createElement('div');
        const isDone = obj.current >= obj.target;
        item.className = `objective-badge ${isDone ? 'done' : ''}`;

        // Mini canvas con la pieza en 3D con alta resolución
        const miniCanvas = document.createElement('canvas');
        miniCanvas.width = 56;
        miniCanvas.height = 56;
        miniCanvas.className = 'obj-mini-canvas';
        const ctx = miniCanvas.getContext('2d');
        if (ctx) {
          const drawn = candySpriteAtlas.draw(ctx, obj.type, 28, 28, 48);
          if (!drawn) {
            candySpriteAtlas.initLoad().then(() => {
              const retryCtx = miniCanvas.getContext('2d');
              if (retryCtx) candySpriteAtlas.draw(retryCtx, obj.type, 28, 28, 48);
            });
          }
        }

        const countSpan = document.createElement('span');
        countSpan.className = 'obj-text';
        countSpan.textContent = `${obj.current}/${obj.target}`;

        item.appendChild(miniCanvas);
        item.appendChild(countSpan);
        if (isDone) {
          const checkSpan = document.createElement('span');
          checkSpan.className = 'obj-check';
          checkSpan.textContent = '✓';
          item.appendChild(checkSpan);
        }
        this.objectivesContainer?.appendChild(item);
      });
    }
  }

  public updateBoosterActiveStates(): void {
    const active = this.renderer?.activeBooster || null;
    this.hammerBtnEl?.classList.toggle('is-active-booster', active === 'hammer');
    this.rockletBtnEl?.classList.toggle('is-active-booster', active === 'mega_rocklet');
    this.swapBtnEl?.classList.toggle('is-active-booster', active === 'swap');
  }

  public updateBoostersDisplay(): void {
    const data = gameState.getData();
    if (this.hammerCountEl) this.hammerCountEl.textContent = `+${data.match3Boosters?.hammer || 0}`;
    if (this.swapCountEl) this.swapCountEl.textContent = `+${data.match3Boosters?.swap || 0}`;
    if (this.rockletCountEl) this.rockletCountEl.textContent = `+${data.match3Boosters?.rocklet || 0}`;
    this.updateBoosterActiveStates();
  }
}
