import { progressionState } from '../gameplay/ProgressionState.ts';
import { LevelNodeComponent } from './LevelNodeComponent.ts';
import { PreLevelModal } from './PreLevelModal.ts';
import { MetaProgressionBridge } from '../gameplay/MetaProgressionBridge.ts';
import { HistoricalCardModal } from './HistoricalCardModal.ts';
import { ProductCardModal } from './ProductCardModal.ts';
import { soundManager } from '../core/SoundManager.ts';
import { proceduralMusic } from '../audio/ProceduralMusic.ts';
import { ERAS_DEFINITION, HistoricalEvent } from '../gameplay/historyEras.ts';
import { gameState } from '../gameplay/GameState.ts';
import {
  SAGA_ZONES,
  SAGA_HISTORICAL_MILESTONES,
  generateVerticalSagaLevels,
  generateGoldenPathSvgD,
  LevelPathPoint
} from '../gameplay/VerticalSagaMapData.ts';

/**
 * SagaMapEngine: Mapa de videojuego vertical e interactivo estilo Farm Heroes Saga / Candy Crush.
 * - Viewport con relación móvil vertical (9:16) y scroll vertical suave y continuo.
 * - 75 niveles interactivos independientes a lo largo de un sendero dorado sinuoso.
 * - 9 Zonas temáticas ilustradas que representan la evolución histórica de Arcor (1951 - 75 Años).
 * - Elementos de escenografía interactivos y animados (agua, hojas, chispas, humo, chocolate, confeti).
 * - Hitos históricos en 1951, 1960, 1970, 1980, 1990, 2000, 2010, 2020 y 75 Años.
 * - Gran zona ceremonial de celebración de los 75 años en la cumbre del nivel 75.
 */
export class SagaMapEngine {
  public element: HTMLElement;
  private scrollContainer!: HTMLElement;
  private pathSvgEl: SVGPathElement | null = null;
  private pathShadowEl: SVGPathElement | null = null;
  private pathCurbEl: SVGPathElement | null = null;
  private pathDashEl: SVGPathElement | null = null;

  // Header UI
  private livesCountEl: HTMLElement | null = null;
  private livesTimerEl: HTMLElement | null = null;
  private starsCountEl: HTMLElement | null = null;
  private moneyCountEl: HTMLElement | null = null;
  private playCtaTxtEl: HTMLElement | null = null;

  // Nodos y componentes
  private nodes: LevelNodeComponent[] = [];
  private pathPoints: LevelPathPoint[] = [];
  public preLevelModal: PreLevelModal;
  public productModal: ProductCardModal;
  private bridge: MetaProgressionBridge;
  private cardModal: HistoricalCardModal;

  // Callbacks de navegación externa
  public onPlayLevelRequested?: (level: number) => void;
  public onOpenFactoryRequested?: () => void;
  public onOpenSettingsRequested?: () => void;
  public onOpenMuseumRequested?: () => void;
  public onOpenQuizRequested?: () => void;
  public onOpenProductCreatorRequested?: () => void;
  public onOpenGiftBoxRequested?: () => void;
  public onOpenCollectionRequested?: (tab?: 'products' | 'boxes' | 'unlocks' | 'achievements') => void;

  constructor(bridge: MetaProgressionBridge, cardModal: HistoricalCardModal) {
    this.bridge = bridge;
    this.cardModal = cardModal;
    this.productModal = new ProductCardModal();

    this.preLevelModal = new PreLevelModal(this.bridge, (lvl) => {
      if (this.onPlayLevelRequested) {
        this.onPlayLevelRequested(lvl);
      }
    });
    this.preLevelModal.onOpenQuizRequested = () => {
      if (this.onOpenQuizRequested) {
        this.onOpenQuizRequested();
      }
    };

    // Pre-calcular puntos del sendero sinuoso vertical
    this.pathPoints = generateVerticalSagaLevels();

    this.element = this.render();
    this.element.appendChild(this.preLevelModal.element);
    this.element.appendChild(this.productModal.element);

    this.scrollContainer = this.element.querySelector('#saga-vertical-scroll') as HTMLElement;

    this.initHeaderElements();
    this.initTimelineNavigation();
    this.buildWorldZones();
    this.buildGoldenTrailPath();
    this.initLevelNodes();
    this.initMilestones();
    this.initSmoothScrollEngine();

    // Suscribirse a cambios de vidas y progreso
    progressionState.subscribe(() => {
      this.updateHeader();
      this.nodes.forEach(n => n.update());
      this.updatePlayCtaText();
    });
  }

  private render(): HTMLElement {
    const root = document.createElement('div');
    root.className = 'saga-map-screen';
    root.style.display = 'none';

    root.innerHTML = `
      <!-- HUD Superior Fijo Estilo Triple-A Casual Game -->
      <header class="saga-header-bar">
        <!-- Widget Izquierdo: Vidas / Energía -->
        <div class="saga-header-widget hearts-widget interactive" id="saga-widget-lives" title="Vidas para jugar Match-3">
          <div class="header-icon-circle heart-circle">❤️</div>
          <div class="header-widget-info">
            <div class="widget-main-text">
              <span id="saga-lives-count">5</span>
              <span class="widget-sub-label" id="saga-lives-timer">Lleno</span>
            </div>
          </div>
          <button class="widget-add-btn interactive" id="saga-btn-add-lives" title="Recargar Vidas">＋</button>
        </div>

        <!-- Logo Central Arcor con Lema -->
        <div class="saga-header-center">
          <div class="saga-logo-wrapper">
            <img src="./arcor_logo.png" alt="ARCOR" class="saga-arcor-logo" />
            <span class="saga-arcor-tagline">75 Años Dulces ♡</span>
          </div>
        </div>

        <!-- Widget Derecho: Monedas & Estrellas & Accesos Rápidos -->
        <div class="saga-header-right">
          <div class="saga-header-widget money-widget interactive" id="saga-widget-money" title="Dinero total acumulado">
            <div class="header-icon-circle coin-circle">🪙</div>
            <div class="header-widget-info">
              <div class="widget-main-text">
                <span id="saga-money-count">$2.500</span>
              </div>
            </div>
          </div>

          <div class="saga-header-widget stars-widget interactive" id="saga-widget-stars" title="Estrellas acumuladas">
            <div class="header-icon-circle star-circle">⭐</div>
            <div class="header-widget-info">
              <div class="widget-main-text">
                <span id="saga-stars-count">0</span>
              </div>
            </div>
          </div>

          <!-- Botón de retorno a la Fábrica 3D -->
          <button class="btn-saga-toggle-factory interactive" id="saga-btn-to-factory" title="Ir a la Fábrica 3D de Arroyito">
            <span class="factory-icon">🏭</span>
            <span class="factory-text">Fábrica</span>
          </button>

          <!-- Botón Museo del Sabor 75 Años -->
          <button class="btn-saga-museum interactive" id="saga-btn-museum" title="Visitar el Museo del Sabor - 75 Años de Arcor">
            <span class="museum-icon">🏛️</span>
            <span class="museum-text">Museo</span>
          </button>

          <!-- Botón Taller: Creá tu Producto -->
          <button class="btn-saga-creator interactive" id="saga-btn-creator" title="Taller: Diseñá tu golosina Arcor">
            <span class="creator-icon">🎨</span>
            <span class="creator-text">Producto</span>
          </button>

          <!-- Botón Cajas Obsequio -->
          <button class="btn-saga-giftbox interactive" id="saga-btn-giftbox" title="Taller: Armá tu caja obsequio">
            <span class="giftbox-icon">🎁</span>
            <span class="giftbox-text">Obsequio</span>
          </button>

          <!-- Botón Colección & Logros -->
          <button class="btn-saga-collection interactive" id="saga-btn-collection" title="Colección y Logros">
            <span class="collection-icon">🏆</span>
          </button>

          <!-- Botón de Música -->
          <button class="btn-saga-music interactive" id="saga-btn-music" title="Música de Fondo">
            <span id="saga-music-icon">🎵</span>
          </button>

          <!-- Botón de Ajustes -->
          <button class="btn-saga-settings interactive" id="saga-btn-settings" title="Ajustes">
            <span>⚙️</span>
          </button>
        </div>
      </header>

      <!-- Línea Temporal Interactiva de Décadas (Navegación Rápida con Desplazamiento Suave) -->
      <nav class="saga-timeline-bar" id="saga-timeline-bar">
        <div class="saga-timeline-inner">
          <div class="timeline-meta-row">
            <div class="timeline-brand-tag">
              <span class="timeline-brand-icon">🏛️</span>
              <strong class="timeline-brand-name">75 AÑOS DE HISTORIA ARCOR (1951 — 2026)</strong>
            </div>
            <div class="timeline-stats-tag">
              <span class="timeline-year-label" id="timeline-year-label">Año 1951</span>
              <span class="timeline-progress-pill" id="timeline-progress-pill">1 de 75 Años</span>
              <button class="timeline-museum-btn interactive" id="timeline-btn-museum" title="Ir al Museo">
                <span>MUSEO 75 AÑOS ➔</span>
              </button>
            </div>
          </div>

          <!-- Botonera de Salto Rápido a Zonas y Décadas -->
          <div class="timeline-decades-row" id="timeline-decades-row">
            <button class="decade-chip interactive" data-level="1" data-year="1951">1951 🏭</button>
            <button class="decade-chip interactive" data-level="9" data-year="1960">1960 🌾</button>
            <button class="decade-chip interactive" data-level="17" data-year="1970">1970 🍫</button>
            <button class="decade-chip interactive" data-level="26" data-year="1980">1980 ✨</button>
            <button class="decade-chip interactive" data-level="35" data-year="1990">1990 🍪</button>
            <button class="decade-chip interactive" data-level="44" data-year="2000">2000 🍅</button>
            <button class="decade-chip interactive" data-level="53" data-year="2010">2010 🍦</button>
            <button class="decade-chip interactive" data-level="61" data-year="2020">2020 🌿</button>
            <button class="decade-chip interactive chip-gold-anniversary" data-level="75" data-year="2026">75 Años 🏆</button>
            <button class="decade-chip interactive chip-current-focus" id="saga-chip-locate-my-year">🎯 Mi Nivel</button>
          </div>
        </div>
      </nav>

      <!-- VIEWPORT VERTICAL 9:16 PARA MÓVILES (CON SCROLL FLUIDO HACIA ABAJO) -->
      <main class="saga-vertical-viewport" id="saga-vertical-viewport">
        <!-- Fondo Ambiental Luminoso que se expande en pantallas de escritorio -->
        <div class="saga-ambient-backdrop"></div>

        <!-- Contenedor Scrollable del Mundo Continuo -->
        <div class="saga-vertical-scroll" id="saga-vertical-scroll">
          <div class="saga-world-stage" id="saga-world-stage">

            <!-- Capa 1: Secciones de Escenarios Ilustrados por Zona (9 Zonas Continuas) -->
            <div class="saga-zones-background-layer" id="saga-zones-layer"></div>

            <!-- Capa 2: Sendero Dorado SVG Continuo de los 75 Niveles -->
            <svg class="saga-trail-svg" id="saga-trail-svg" viewBox="0 0 420 8550" preserveAspectRatio="none">
              <defs>
                <linearGradient id="goldenTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#f59e0b" />
                  <stop offset="30%" stop-color="#ffd700" />
                  <stop offset="50%" stop-color="#fffbeb" />
                  <stop offset="70%" stop-color="#ffd700" />
                  <stop offset="100%" stop-color="#d97706" />
                </linearGradient>
                <filter id="goldenRoadGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <!-- Sombra del sendero -->
              <path id="trail-shadow" class="svg-trail-shadow" d="" />
              <!-- Borde de adoquines dorados -->
              <path id="trail-curb" class="svg-trail-curb" d="" />
              <!-- Asfalto / Calzada dorada de confitería -->
              <path id="trail-road" class="svg-trail-road" d="" />
              <!-- Línea punteada reflectante de piedras brillantes -->
              <path id="trail-dash" class="svg-trail-dash" d="" />
            </svg>

            <!-- Capa 3: Elementos Ambientales Animados (Agua, Hojas, Chispas, Humo, etc.) -->
            <div class="saga-scenery-props-layer" id="saga-scenery-props-layer"></div>

            <!-- Capa 4: Sellos de Hitos Históricos en la Ruta (1951, 1960, ..., 75 Años) -->
            <div class="saga-milestones-layer" id="saga-milestones-layer"></div>

            <!-- Capa 5: Los 75 Nodos de Nivel Interactivos Independientes -->
            <div class="saga-nodes-layer" id="saga-nodes-layer"></div>

            <!-- Capa 6: Gran Zona Ceremonial de los 75 Años (Al final del recorrido) -->
            <div class="saga-75th-celebration-plaza" id="saga-75th-plaza">
              <div class="plaza-godrays"></div>
              <div class="plaza-confetti-rain" id="plaza-confetti"></div>
              <div class="plaza-trophy-pedestal">
                <div class="trophy-glow-halo"></div>
                <div class="trophy-big-crown">🏆</div>
                <h2 class="plaza-trophy-title">¡75 AÑOS DE DULZURA ARCOR!</h2>
                <p class="plaza-trophy-subtitle">1951 — 2026 · Gracias por hacer este sueño realidad junto a millones de familias.</p>
              </div>
            </div>

          </div>
        </div>

        <!-- Botón Inferior Flotante Sticky: JUGAR NIVEL ACTUAL (Fácil de Tocar con el Pulgar) -->
        <div class="saga-bottom-cta">
          <button class="saga-play-cta-btn interactive" id="saga-btn-play-current" title="Jugar el nivel actual">
            <span class="cta-candy-icon">🍬</span>
            <span class="cta-label" id="saga-play-btn-txt">JUGAR NIVEL 1</span>
            <span class="cta-arrow-glow">▶</span>
          </button>
        </div>

        <!-- Widget Flotante de Acceso Rápido Vertical (Arriba, Mi Nivel, 75 Años) -->
        <aside class="saga-quick-scroll-nav" aria-label="Navegación Rápida">
          <button class="quick-nav-btn interactive" id="saga-quick-btn-top" title="Ir al Inicio (1951)">
            <span class="quick-nav-icon">▲</span>
            <span class="quick-nav-tooltip">1951</span>
          </button>
          <button class="quick-nav-btn quick-nav-active-level interactive" id="saga-quick-btn-my-level" title="Ir a Mi Nivel Actual">
            <span class="quick-nav-icon">🎯</span>
            <span class="quick-nav-tooltip">Mi Nivel</span>
          </button>
          <button class="quick-nav-btn interactive" id="saga-quick-btn-bottom" title="Ir a la Cumbre (75 Años)">
            <span class="quick-nav-icon">▼</span>
            <span class="quick-nav-tooltip">75 Años</span>
          </button>
        </aside>
      </main>
    `;

    return root;
  }

  private initHeaderElements(): void {
    this.livesCountEl = this.element.querySelector('#saga-lives-count');
    this.livesTimerEl = this.element.querySelector('#saga-lives-timer');
    this.starsCountEl = this.element.querySelector('#saga-stars-count');
    this.moneyCountEl = this.element.querySelector('#saga-money-count');
    this.playCtaTxtEl = this.element.querySelector('#saga-play-btn-txt');

    // Recargar vidas mediante Quiz
    const addLives = (e: Event) => {
      e.stopPropagation();
      soundManager.playClick();
      if (this.onOpenQuizRequested) {
        this.onOpenQuizRequested();
      } else {
        progressionState.refillLives();
      }
    };
    this.element.querySelector('#saga-btn-add-lives')?.addEventListener('click', addLives);
    this.element.querySelector('#saga-widget-lives')?.addEventListener('click', addLives);

    // Volver a la fábrica 3D
    this.element.querySelector('#saga-btn-to-factory')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.onOpenFactoryRequested) {
        this.onOpenFactoryRequested();
      }
    });

    // Abrir Museo del Sabor 75 Años
    const openMuseumHandler = () => {
      soundManager.playClick();
      if (this.onOpenMuseumRequested) {
        this.onOpenMuseumRequested();
      }
    };
    this.element.querySelector('#saga-btn-museum')?.addEventListener('click', openMuseumHandler);
    this.element.querySelector('#timeline-btn-museum')?.addEventListener('click', openMuseumHandler);

    // Taller Creativo de Productos
    this.element.querySelector('#saga-btn-creator')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.onOpenProductCreatorRequested) {
        this.onOpenProductCreatorRequested();
      }
    });

    // Cajas Obsequio
    this.element.querySelector('#saga-btn-giftbox')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.onOpenGiftBoxRequested) {
        this.onOpenGiftBoxRequested();
      }
    });

    // Mi Colección y Logros
    this.element.querySelector('#saga-btn-collection')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.onOpenCollectionRequested) {
        this.onOpenCollectionRequested();
      }
    });

    // Botón de Música Directo
    const sagaMusicBtn = this.element.querySelector('#saga-btn-music') as HTMLElement | null;
    const sagaMusicIcon = this.element.querySelector('#saga-music-icon');

    const updateSagaMusicUI = (muted: boolean) => {
      if (sagaMusicIcon) sagaMusicIcon.textContent = muted ? '🔇' : '🎵';
      if (sagaMusicBtn) {
        sagaMusicBtn.classList.toggle('muted', muted);
        sagaMusicBtn.title = muted ? 'Música silenciada (Clic para activar)' : 'Música activada (Clic para silenciar)';
      }
    };

    sagaMusicBtn?.addEventListener('click', () => {
      soundManager.playClick();
      proceduralMusic.toggleMute();
    });

    proceduralMusic.subscribe((muted) => {
      updateSagaMusicUI(muted);
    });

    updateSagaMusicUI(proceduralMusic.getIsMuted());

    // Ajustes
    this.element.querySelector('#saga-btn-settings')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.onOpenSettingsRequested) {
        this.onOpenSettingsRequested();
      }
    });

    // Botón Jugar Nivel Actual
    this.element.querySelector('#saga-btn-play-current')?.addEventListener('click', () => {
      soundManager.playClick();
      const currentLevel = progressionState.getCurrentLevel();
      const lives = progressionState.getLives();
      if (lives <= 0) {
        if (this.onOpenQuizRequested) {
          this.onOpenQuizRequested();
        } else {
          progressionState.refillLives();
        }
        return;
      }
      progressionState.useLife();
      soundManager.playFanfare();
      if (this.onPlayLevelRequested) {
        this.onPlayLevelRequested(currentLevel);
      }
    });



    this.updateHeader();
    this.updatePlayCtaText();
  }

  private updatePlayCtaText(): void {
    if (this.playCtaTxtEl) {
      const curLvl = progressionState.getCurrentLevel();
      this.playCtaTxtEl.textContent = `JUGAR NIVEL ${curLvl}`;
    }
  }

  /**
   * Construye las 9 secciones de Zonas Temáticas continuas con su arte e identidad visual
   */
  private buildWorldZones(): void {
    const zonesLayer = this.element.querySelector('#saga-zones-layer');
    if (!zonesLayer) return;

    zonesLayer.innerHTML = '';
    const STEP_Y = 104;

    SAGA_ZONES.forEach((zone) => {
      const zoneLevelCount = (zone.endLevel - zone.startLevel + 1);
      const zoneHeight = zoneLevelCount * STEP_Y;

      const zoneEl = document.createElement('section');
      zoneEl.className = `saga-world-zone zone-idx-${zone.zoneIndex}`;
      zoneEl.dataset.zone = zone.id;
      zoneEl.style.height = `${zoneHeight}px`;
      if (zone.bgImage) {
        zoneEl.style.backgroundImage = `url("${zone.bgImage}")`;
        zoneEl.style.backgroundSize = 'cover';
        zoneEl.style.backgroundPosition = 'center top';
        zoneEl.style.backgroundRepeat = 'no-repeat';
      } else {
        zoneEl.style.background = zone.bgGradient;
      }

      // Determinar de qué lado del sendero colocar la tarjeta de zona para que NUNCA cruce el camino
      const startPt = this.pathPoints.find(p => p.levelNumber === zone.startLevel) || this.pathPoints[0];
      const isRoadOnLeft = startPt.xPercent < 50;
      const cardSideClass = isRoadOnLeft ? 'zone-card-right' : 'zone-card-left';

      zoneEl.innerHTML = `
        <!-- Borde / Separador suave superior con la zona anterior -->
        <div class="zone-blend-transition"></div>

        <!-- Encabezado / Placa de la Zona (Alternado a un lado del sendero sin superponerlo) -->
        <div class="zone-header-card ${cardSideClass}" style="border-color: ${zone.accentColor};">
          <div class="zone-era-pill" style="background: ${zone.accentColor};">
            <span>${zone.startYear} — ${zone.endYear}</span>
          </div>
          <h3 class="zone-title" style="color: ${zone.accentColor};">${zone.themeTitle}</h3>
          <p class="zone-subtitle">${zone.themeSubtitle}</p>
        </div>

        <!-- Elementos ilustrados vectoriales / siluetas del fondo de la zona -->
        <div class="zone-scenery-silhouette silhouette-${zone.id}"></div>
      `;

      zonesLayer.appendChild(zoneEl);
    });

    // Elementos animados de escenografía (Agua, Hojas, Chispas, Cacao, etc.)
    this.buildSceneryProps();
  }

  /**
   * Agrega pequeños elementos interactivos y animados en la escenografía
   */
  private buildSceneryProps(): void {
    const propsLayer = this.element.querySelector('#saga-scenery-props-layer');
    if (!propsLayer) return;

    propsLayer.innerHTML = '';
    const STEP_Y = 104;

    let accumulatedY = 0;
    SAGA_ZONES.forEach((zone) => {
      const zoneLevelCount = (zone.endLevel - zone.startLevel + 1);
      const zoneHeight = zoneLevelCount * STEP_Y;
      const zoneTopY = accumulatedY;

      zone.sceneryElements.forEach((scenery) => {
        const propEl = document.createElement('div');
        propEl.className = `saga-scenery-prop prop-${scenery.type} interactive`;
        propEl.title = scenery.title;

        const propY = zoneTopY + (scenery.yPercent / 100) * zoneHeight;
        propEl.style.left = `${scenery.xPercent}%`;
        propEl.style.top = `${propY}px`;

        propEl.innerHTML = `
          <div class="prop-inner-anim">
            <span class="prop-icon">${scenery.icon || '✨'}</span>
            <div class="prop-glow-halo"></div>
          </div>
          <div class="prop-label-tooltip">${scenery.title}</div>
        `;

        propEl.addEventListener('click', (e) => {
          e.stopPropagation();
          soundManager.playClick();
          propEl.classList.add('prop-clicked-bounce');
          setTimeout(() => propEl.classList.remove('prop-clicked-bounce'), 600);
        });

        propsLayer.appendChild(propEl);
      });

      accumulatedY += zoneHeight;
    });
  }

  /**
   * Genera el Sendero Dorado Continuo SVG con 4 capas de profundidad
   */
  private buildGoldenTrailPath(): void {
    const d = generateGoldenPathSvgD(this.pathPoints, 420);

    this.pathShadowEl = this.element.querySelector('#trail-shadow');
    this.pathCurbEl = this.element.querySelector('#trail-curb');
    this.pathSvgEl = this.element.querySelector('#trail-road');
    this.pathDashEl = this.element.querySelector('#trail-dash');

    if (this.pathShadowEl) this.pathShadowEl.setAttribute('d', d);
    if (this.pathCurbEl) this.pathCurbEl.setAttribute('d', d);
    if (this.pathSvgEl) this.pathSvgEl.setAttribute('d', d);
    if (this.pathDashEl) this.pathDashEl.setAttribute('d', d);
  }

  /**
   * Inicializa los 75 Nodos de Nivel independientes a lo largo de las coordenadas del sendero
   */
  private initLevelNodes(): void {
    const layer = this.element.querySelector('#saga-nodes-layer');
    if (!layer) return;

    layer.innerHTML = '';
    this.nodes = [];

    this.pathPoints.forEach((pt) => {
      const def = progressionState.getLevelDefinition(pt.levelNumber);

      const comp = new LevelNodeComponent(def, (lvl) => {
        soundManager.playClick();
        const lives = progressionState.getLives();
        if (lives <= 0) {
          if (this.onOpenQuizRequested) {
            this.onOpenQuizRequested();
          } else {
            progressionState.refillLives();
          }
          return;
        }
        progressionState.useLife();
        soundManager.playFanfare();
        if (this.onPlayLevelRequested) {
          this.onPlayLevelRequested(lvl);
        }
      });

      // Posicionamiento vertical exacto
      comp.setPosition(pt.xPercent, pt.yPx);
      layer.appendChild(comp.element);
      this.nodes.push(comp);
    });
  }

  /**
   * Coloca los Hitos Históricos rigurosamente alineados al lado de su respectivo nivel
   */
  private initMilestones(): void {
    const layer = this.element.querySelector('#saga-milestones-layer');
    if (!layer) return;

    layer.innerHTML = '';

    SAGA_HISTORICAL_MILESTONES.forEach((m) => {
      const targetPoint = this.pathPoints.find(p => p.levelNumber === m.level);
      if (!targetPoint) return;

      const zone = SAGA_ZONES.find(z => m.level >= z.startLevel && m.level <= z.endLevel) || SAGA_ZONES[0];
      const accentColor = zone.accentColor || '#ffd700';

      const milestoneEl = document.createElement('div');

      // Si el nivel está a la derecha del centro (xPercent >= 50%), colocamos la tarjeta a la IZQUIERDA
      // Si el nivel está a la izquierda del centro (xPercent < 50%), colocamos la tarjeta a la DERECHA
      const isLevelOnRight = targetPoint.xPercent >= 50;
      milestoneEl.className = `saga-milestone-marker interactive ${isLevelOnRight ? 'milestone-align-left' : 'milestone-align-right'}`;
      milestoneEl.dataset.level = m.level.toString();

      // Alineación vertical EXACTA al centro del nodo de nivel:
      milestoneEl.style.top = `${targetPoint.yPx}px`;

      if (isLevelOnRight) {
        milestoneEl.style.left = '16px';
        milestoneEl.style.right = 'auto';
        milestoneEl.style.maxWidth = `calc(${targetPoint.xPercent}% - 36px)`;
      } else {
        milestoneEl.style.right = '16px';
        milestoneEl.style.left = 'auto';
        milestoneEl.style.maxWidth = `calc(${100 - targetPoint.xPercent}% - 36px)`;
      }

      milestoneEl.title = `${m.year}: ${m.title} — ${m.subtitle} (Toca para abrir hito histórico)`;

      milestoneEl.innerHTML = `
        <div class="milestone-ribbon-card" style="border-color: ${accentColor};">
          <span class="ribbon-icon">${m.icon || '📜'}</span>
          <div class="ribbon-text-stack">
            <strong class="ribbon-year" style="color: ${accentColor};">${m.year}</strong>
            <span class="ribbon-subtitle">${m.title}</span>
          </div>
          <span class="ribbon-sparkle">✨</span>
        </div>
        <div class="milestone-guide-line" style="background: linear-gradient(${isLevelOnRight ? '90deg' : '270deg'}, ${accentColor}, transparent);"></div>
      `;

      milestoneEl.addEventListener('click', (e) => {
        e.stopPropagation();
        soundManager.playClick();
        this.openMilestoneCard(m.cardId, m.year, m.title, m.subtitle);
      });

      layer.appendChild(milestoneEl);
    });
  }

  private openMilestoneCard(cardId: string, year: number, title: string, subtitle: string): void {
    let targetEvent: HistoricalEvent | null = null;
    for (const era of ERAS_DEFINITION) {
      for (const ev of era.events) {
        if (ev.id === cardId || Math.abs(ev.year - year) <= 3) {
          targetEvent = ev;
          break;
        }
      }
      if (targetEvent) break;
    }

    if (!targetEvent) {
      targetEvent = {
        id: cardId,
        year,
        title,
        description: subtitle,
        historicalCard: {
          quoteOrFact: '"Haciendo un mundo más dulce ♡"',
          unlockedLore: subtitle
        },
        quest: {
          objective: 'Hito histórico Arcor',
          targetResource: 'candies',
          targetAmount: 50,
          rewardCoins: 500,
          rewardReputation: 3
        },
        unlocks: {}
      };
    }

    if (targetEvent) {
      this.cardModal.show(targetEvent);
    }
  }

  /**
   * Barra de Décadas con Scroll Suave Inteligente
   */
  private initTimelineNavigation(): void {
    const chips = this.element.querySelectorAll('.decade-chip[data-level]');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        soundManager.playClick();
        const targetLvl = Number((chip as HTMLElement).dataset.level) || 1;
        this.scrollToLevel(targetLvl);
      });
    });

    this.element.querySelector('#saga-chip-locate-my-year')?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      const curLvl = progressionState.getCurrentLevel();
      this.scrollToLevel(curLvl);
    });
  }

  /**
   * Desplaza suavemente el mapa vertical hasta enfocar el nivel indicado
   */
  public scrollToLevel(levelNumber: number, _animated: boolean = true): void {
    const pt = this.pathPoints.find(p => p.levelNumber === levelNumber);
    if (!pt || !this.scrollContainer) return;

    // Centrar el nivel verticalmente en la pantalla con margen equilibrado respecto al botón inferior
    const viewportHeight = this.scrollContainer.clientHeight || window.innerHeight;
    const targetScrollY = Math.max(0, pt.yPx - viewportHeight * 0.48);

    this.scrollContainer.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });

    const node = this.nodes[levelNumber - 1];
    if (node) {
      node.pulseHighlight();
    }
  }

  /**
   * Motor de Desplazamiento Ligero y Fluido del Mapa (Mouse Drag, Inercia, Rueda Inteligente y Atajos)
   */
  private initSmoothScrollEngine(): void {
    if (!this.scrollContainer) return;
    const viewport = this.element.querySelector('#saga-vertical-viewport') as HTMLElement | null;

    let isPointerDown = false;
    let hasDragged = false;
    let startY = 0;
    let startScrollTop = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocityY = 0;
    let momentumRafId: number | null = null;

    const stopMomentum = () => {
      if (momentumRafId !== null) {
        cancelAnimationFrame(momentumRafId);
        momentumRafId = null;
      }
    };

    // 1. Inercia física ligera al soltar el mouse
    const startMomentum = () => {
      stopMomentum();
      if (Math.abs(velocityY) < 0.2) return;

      const friction = 0.94; // Deceleración sedosa y suave
      const step = () => {
        if (Math.abs(velocityY) < 0.08) {
          velocityY = 0;
          return;
        }
        this.scrollContainer.scrollTop -= velocityY * 16;
        velocityY *= friction;
        momentumRafId = requestAnimationFrame(step);
      };
      momentumRafId = requestAnimationFrame(step);
    };

    // 2. Mouse / Pointer Down
    this.scrollContainer.addEventListener('pointerdown', (e: PointerEvent) => {
      // Dejar que los toques táctiles móviles usen la inercia nativa de 120Hz del navegador
      if (e.pointerType === 'touch') return;
      // Solo botón primario
      if (e.button !== 0) return;

      stopMomentum();
      isPointerDown = true;
      hasDragged = false;
      startY = e.clientY;
      lastY = e.clientY;
      startScrollTop = this.scrollContainer.scrollTop;
      lastTime = performance.now();
      velocityY = 0;

      this.scrollContainer.classList.add('is-dragging');
    });

    // 3. Pointer Move
    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!isPointerDown) return;

      const currentY = e.clientY;
      const deltaY = currentY - startY;

      // Umbral mínimo de 4px para activar arrastre
      if (!hasDragged && Math.abs(deltaY) > 4) {
        hasDragged = true;
      }

      if (hasDragged) {
        this.scrollContainer.scrollTop = startScrollTop - deltaY;

        const now = performance.now();
        const dt = Math.max(1, now - lastTime);
        const dy = currentY - lastY;
        velocityY = (dy / dt) * 0.85 + velocityY * 0.15;

        lastY = currentY;
        lastTime = now;
      }
    });

    // 4. Pointer Up / Cancel
    const endDrag = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      this.scrollContainer.classList.remove('is-dragging');

      if (hasDragged) {
        startMomentum();
        setTimeout(() => {
          hasDragged = false;
        }, 100);
      }
    };

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // 5. Interceptar clics accidentales si el usuario estaba arrastrando el mapa
    this.scrollContainer.addEventListener('click', (e: MouseEvent) => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);

    // 6. Rueda del mouse (Wheel) que responde en cualquier parte de la pantalla (incluso fuera del centro)
    viewport?.addEventListener('wheel', (e: WheelEvent) => {
      stopMomentum();
      if (!this.scrollContainer.contains(e.target as Node)) {
        this.scrollContainer.scrollTop += e.deltaY;
      }
    }, { passive: true });

    // 7. Navegación con teclado (Flechas, RePág, AvPág, Inicio, Fin)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.element.style.display === 'none') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      stopMomentum();
      if (e.key === 'ArrowDown') {
        this.scrollContainer.scrollTop += 90;
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        this.scrollContainer.scrollTop -= 90;
        e.preventDefault();
      } else if (e.key === 'PageDown' || e.key === ' ') {
        this.scrollContainer.scrollTop += 480;
        e.preventDefault();
      } else if (e.key === 'PageUp') {
        this.scrollContainer.scrollTop -= 480;
        e.preventDefault();
      } else if (e.key === 'Home') {
        this.scrollToLevel(1);
        e.preventDefault();
      } else if (e.key === 'End') {
        this.scrollToLevel(75);
        e.preventDefault();
      }
    });

    // 8. Botonera Flotante Lateral de Navegación Rápida (▲ Inicio, 🎯 Mi Nivel, ▼ 75 Años)
    const btnTop = this.element.querySelector('#saga-quick-btn-top');
    const btnLevel = this.element.querySelector('#saga-quick-btn-my-level');
    const btnBottom = this.element.querySelector('#saga-quick-btn-bottom');

    btnTop?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      this.scrollToLevel(1);
    });

    btnLevel?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      this.scrollToLevel(progressionState.getCurrentLevel());
    });

    btnBottom?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      this.scrollToLevel(75);
    });
  }

  public updateHeader(): void {
    if (this.livesCountEl) {
      this.livesCountEl.textContent = `${progressionState.getLives()}`;
    }
    if (this.livesTimerEl) {
      const countdown = progressionState.getRegenCountdown();
      this.livesTimerEl.textContent = countdown.isFull ? 'Lleno' : countdown.text;
    }
    if (this.starsCountEl) {
      this.starsCountEl.textContent = `${progressionState.getTotalStars()}`;
    }
    if (this.moneyCountEl) {
      const money = gameState.getData().money || 0;
      this.moneyCountEl.textContent = `$${money.toLocaleString('es-AR')}`;
    }

    const curLevel = progressionState.getCurrentLevel();
    const curDef = progressionState.getLevelDefinition(curLevel);

    const yearLabelEl = this.element.querySelector('#timeline-year-label');
    const progPillEl = this.element.querySelector('#timeline-progress-pill');

    if (yearLabelEl) {
      yearLabelEl.textContent = `Año ${curDef.year} • Nivel ${curLevel}`;
    }
    if (progPillEl) {
      const pct = Math.round((curLevel / 75) * 100);
      progPillEl.textContent = `${curLevel} de 75 (${pct}%)`;
    }

    // Resaltar década activa
    const chips = this.element.querySelectorAll('.decade-chip[data-level]');
    chips.forEach(chip => {
      const lvl = Number((chip as HTMLElement).dataset.level);
      if (lvl && Math.abs(curLevel - lvl) < 9) {
        chip.classList.add('chip-active-era');
      } else {
        chip.classList.remove('chip-active-era');
      }
    });
  }

  public show(): void {
    this.element.style.display = 'flex';
    this.updateHeader();
    this.nodes.forEach(n => n.update());
    this.updatePlayCtaText();

    // Al abrir el mapa, enfocar y hacer autoscroll suave al nivel activo
    setTimeout(() => {
      const curLvl = progressionState.getCurrentLevel();
      this.scrollToLevel(curLvl);
    }, 60);
  }

  public hide(): void {
    this.element.style.display = 'none';
  }

  public destroy(): void {
    // Limpieza de memoria
  }
}
