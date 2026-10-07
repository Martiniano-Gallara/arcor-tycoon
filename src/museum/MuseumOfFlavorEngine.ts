import {
  MUSEUM_EXHIBITS,
  ARCORITO_MUSEUM_DIALOGUES,
  type MuseumExhibit
} from './MuseumData.ts';
import { MuseumShowcaseModal } from './MuseumShowcaseModal.ts';
import { MuseumBookModal } from './MuseumBookModal.ts';
import { soundManager } from '../core/SoundManager.ts';
import { gameState } from '../gameplay/GameState.ts';
import { proceduralMusic } from '../audio/ProceduralMusic.ts';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  alphaSpeed: number;
  color: string;
}

export type MuseumViewMode = 'grand-hall' | 'timeline-path';

export class MuseumOfFlavorEngine {
  public element: HTMLElement;
  public showcaseModal: MuseumShowcaseModal;
  public bookModal: MuseumBookModal;
  public onCloseRequested?: () => void;
  public onOpenHistory?: () => void;

  private currentViewMode: MuseumViewMode = 'grand-hall';
  private particlesCanvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animFrameId: number | null = null;

  private arcoritoDialogIndex: number = 0;

  constructor() {
    // 1. Instanciar modales satélite
    this.showcaseModal = new MuseumShowcaseModal((exhibitId) => {
      this.handleExhibitCollected(exhibitId);
    });
    this.bookModal = new MuseumBookModal();
    this.bookModal.onOpenArchiveRequested = () => {
      if (this.onOpenHistory) {
        this.onOpenHistory();
      }
    };

    // 2. Renderizar el DOM principal del Museo
    this.element = this.render();

    // 3. Montar modales dentro del contenedor del museo
    this.element.appendChild(this.showcaseModal.element);
    this.element.appendChild(this.bookModal.element);

    // 4. Inicializar canvas de partículas ambientales doradas
    this.initParticlesCanvas();

    // 5. Vincular eventos e interactividad
    this.bindEvents();

    // 6. Actualizar contadores iniciales y botón de historia
    this.updateCollectionBadge();
    this.updateHistoryButton();
  }

  private render(): HTMLElement {
    const root = document.createElement('div');
    root.className = 'museum-screen';
    root.style.display = 'none';

    root.innerHTML = `
      <!-- 1. BARRA SUPERIOR DE NAVEGACIÓN Y PATRIMONIO DEL MUSEO -->
      <header class="museum-top-bar">
        <div class="museum-bar-left">
          <button class="museum-btn-exit interactive" id="museum-btn-exit" title="Volver al juego">
            <span class="exit-arrow">⬅</span>
            <span class="exit-txt">Salir del Museo</span>
          </button>
          
          <div class="museum-heritage-badge">
            <span class="badge-beacon"></span>
            <span class="badge-text">MUSEO DEL SABOR • 75º ANIVERSARIO DE ARCOR</span>
          </div>
        </div>

        <nav class="museum-view-selector">
          <button class="museum-view-tab active interactive" id="museum-tab-hall" data-mode="grand-hall">
            <span class="tab-icon">🏛️</span>
            <span class="tab-label">Gran Salón</span>
          </button>
          <button class="museum-view-tab interactive" id="museum-tab-path" data-mode="timeline-path">
            <span class="tab-icon">🗺️</span>
            <span class="tab-label">Camino Histórico</span>
          </button>
        </nav>

        <div class="museum-bar-right">
          <!-- Botón Historia / ¡Avanzar! (1 ⭐) (Idéntico al botón de Historia del juego) -->
          <button class="museum-btn-history interactive" id="museum-btn-history" title="Ver Álbum de Fotos, Cartas y Archivo Histórico">
            <span class="museum-btn-history-icon">📜</span>
            <div class="museum-btn-history-text">
              <span class="museum-btn-history-title">Historia</span>
              <span class="museum-btn-history-sub" id="museum-history-sub">¡Avanzar! (1 ⭐)</span>
            </div>
          </button>

          <button class="museum-btn-all-vitrines interactive" id="museum-btn-all-vitrines" title="Abrir Galería de las 12 Vitrinas de Oro">
            <span class="all-vitrines-icon">🍬</span>
            <span class="all-vitrines-txt">12 Vitrinas</span>
          </button>

          <div class="museum-collection-counter" id="museum-collection-counter" title="Caramelos descubiertos en el Museo">
            <span class="counter-icon">🏆</span>
            <div class="counter-info">
              <span class="counter-val" id="museum-collected-txt">0 / 12</span>
              <span class="counter-lbl">Coleccionados</span>
            </div>
            <div class="counter-progress-mini">
              <div class="counter-progress-fill" id="museum-progress-fill" style="width: 0%;"></div>
            </div>
          </div>

          <button class="museum-btn-audio interactive" id="museum-btn-audio" title="Música y Ambiente">
            <span id="museum-audio-icon">🎵</span>
          </button>
        </div>
      </header>

      <!-- 2. CONTENEDOR ESCÉNICO RESPONSIVE DEL MUSEO (1024 x 682, 3:2 FIT) -->
      <div class="museum-stage-viewport" id="museum-stage-viewport">
        <div class="museum-stage-frame" id="museum-stage-frame">
          
          <!-- Capa 1: Imagen de Fondo Gran Salón -->
          <img 
            src="./museo_del_sabor_bg.jpg" 
            alt="Gran Salón Museo del Sabor 75 Años Arcor" 
            class="museum-bg-layer museum-layer-hall active" 
            id="museum-bg-hall" 
          />

          <!-- Capa 2: Imagen de Fondo Camino Histórico -->
          <img 
            src="./museo_path_bg.jpg" 
            alt="Camino del Sabor - Línea de Tiempo 75 Años Arcor" 
            class="museum-bg-layer museum-layer-path" 
            id="museum-bg-path" 
          />

          <!-- Capa 3: Canvas de Partículas Doradas Ambientales -->
          <canvas class="museum-particles-canvas" id="museum-particles-canvas"></canvas>

          <!-- =================================================================
               CAPA 4A: HOTSPOTS INTERACTIVOS DEL GRAN SALÓN
               ================================================================= -->
          <div class="museum-hotspots-layer" id="layer-hotspots-hall">
            
            <!-- Hotspot 1: Muro 1950 ("TODO COMENZÓ CON UN SUEÑO" / Fábrica Arroyito) -->
            <button class="museum-hotspot hotspot-hall-1950 interactive" id="hotspot-hall-1950" title="Ver Fotografía Histórica Arroyito 1951">
              <div class="hotspot-beacon-glow"></div>
              <div class="hotspot-pin">
                <span class="pin-icon">🏭</span>
                <span class="pin-tag">1951: El Origen</span>
              </div>
            </button>

            <!-- Hotspot 2: Vitrina 1960 - Caramelos Holanda -->
            <button class="museum-hotspot hotspot-hall-1960 interactive" id="hotspot-hall-1960" title="Examinar Caramelos Holanda (1960)">
              <div class="hotspot-beacon-glow"></div>
              <div class="hotspot-pin">
                <span class="pin-icon">🍬</span>
                <span class="pin-tag">1960: Holanda</span>
              </div>
            </button>

            <!-- Hotspot 3: Vitrina 1970 - Caramelos Frutales -->
            <button class="museum-hotspot hotspot-hall-1970 interactive" id="hotspot-hall-1970" title="Examinar Frutales Arcor (1970)">
              <div class="hotspot-beacon-glow"></div>
              <div class="hotspot-pin">
                <span class="pin-icon">🍓</span>
                <span class="pin-tag">1970: Frutales</span>
              </div>
            </button>

            <!-- Hotspot 4: Vitrina 1980 - Menta Cristal -->
            <button class="museum-hotspot hotspot-hall-1980 interactive" id="hotspot-hall-1980" title="Examinar Menta Cristal (1975/1980)">
              <div class="hotspot-beacon-glow"></div>
              <div class="hotspot-pin">
                <span class="pin-icon">🌿</span>
                <span class="pin-tag">1980: Menta</span>
              </div>
            </button>

            <!-- Hotspot 5: Vitrina 1990 - Butter Toffees -->
            <button class="museum-hotspot hotspot-hall-1990 interactive" id="hotspot-hall-1990" title="Examinar Butter Toffees (1964/1990)">
              <div class="hotspot-beacon-glow"></div>
              <div class="hotspot-pin">
                <span class="pin-icon">🧈</span>
                <span class="pin-tag">1990: Butter Toffees</span>
              </div>
            </button>

            <!-- Hotspot 6: Vitrina 2000 - Confites Rocklets -->
            <button class="museum-hotspot hotspot-hall-2000 interactive" id="hotspot-hall-2000" title="Examinar Rocklets (1993/2000)">
              <div class="hotspot-beacon-glow"></div>
              <div class="hotspot-pin">
                <span class="pin-icon">🌈</span>
                <span class="pin-tag">2000: Rocklets</span>
              </div>
            </button>

            <!-- Hotspot 7: Vitrina 2020 - Chocolates Cofler & Bon o Bon -->
            <button class="museum-hotspot hotspot-hall-2020 interactive" id="hotspot-hall-2020" title="Examinar Chocolates Cofler y Bon o Bon">
              <div class="hotspot-beacon-glow"></div>
              <div class="hotspot-pin">
                <span class="pin-icon">🍫</span>
                <span class="pin-tag">2020: Cofler</span>
              </div>
            </button>

            <!-- Hotspot 8: Pedestal Central - Libro Abierto ("NUESTRA HISTORIA") -->
            <button class="museum-hotspot hotspot-hall-book interactive" id="hotspot-hall-book" title="Abrir Libro de Archivo 'Nuestra Historia' (5 Capítulos)">
              <div class="hotspot-beacon-ring"></div>
              <div class="hotspot-pin book-pin">
                <span class="pin-icon">📖</span>
                <span class="pin-tag">Libro (5 Capítulos)</span>
              </div>
            </button>

            <!-- Hotspot 8B: Pedestal Central - Hitos y Archivo Histórico (¡Avanzar! ⭐) -->
            <button class="museum-hotspot hotspot-hall-history interactive" id="hotspot-hall-history" title="Ver Hitos Históricos y Avanzar con Estrellas ⭐">
              <div class="hotspot-beacon-glow"></div>
              <div class="hotspot-pin history-pin">
                <span class="pin-icon">📜</span>
                <span class="pin-tag" id="hotspot-history-tag">Hitos e Historia</span>
              </div>
            </button>

            <!-- Hotspot 9: Vitrina de Primer Plano ("SABORES QUE NOS ACOMPAÑAN SIEMPRE") -->
            <button class="museum-hotspot hotspot-hall-showcase interactive" id="hotspot-hall-showcase" title="Ver Colección de las 12 Vitrinas de Oro">
              <div class="hotspot-beacon-glow"></div>
              <div class="hotspot-pin showcase-pin">
                <span class="pin-icon">✨</span>
                <span class="pin-tag">12 Vitrinas de Oro</span>
              </div>
            </button>

            <!-- Hotspot 10: Chef Arcorito (Guía interactivo del Museo) -->
            <div class="museum-arcorito-anchor" id="museum-arcorito-anchor">
              <button class="hotspot-arcorito-touch interactive" id="hotspot-arcorito-touch" title="Hablar con Arcorito">
                <span class="arcorito-touch-hint">💬 ¡Tocame!</span>
              </button>
              
              <!-- Globo de diálogo animado -->
              <div class="museum-speech-bubble" id="museum-speech-bubble">
                <div class="bubble-sparkle">✨</div>
                <p class="bubble-text" id="museum-speech-text">
                  ¡Hola! Te doy la bienvenida al Museo del Sabor 75 Años. Hacé clic en las vitrinas, el muro de 1950 o el libro para explorar nuestras memorias. 🍬🏛️
                </p>
                <span class="bubble-subhint">👆 Clic para otra anécdota</span>
              </div>
            </div>

          </div>

          <!-- =================================================================
               CAPA 4B: HOTSPOTS INTERACTIVOS DEL CAMINO HISTÓRICO
               ================================================================= -->
          <div class="museum-hotspots-layer" id="layer-hotspots-path" style="display: none;">
            
            <!-- Nodo 1: 1950 Arroyito -->
            <button class="museum-path-node node-1 interactive" id="path-node-1" title="1950: El Origen en Arroyito">
              <span class="path-node-num">1</span>
              <span class="path-node-label">1950: Arroyito</span>
            </button>

            <!-- Nodo 2: 1970 Frutales -->
            <button class="museum-path-node node-2 interactive" id="path-node-2" title="1970: Caramelos Frutales">
              <span class="path-node-num">2</span>
              <span class="path-node-label">1970: Frutales</span>
            </button>

            <!-- Nodo 3: 75 Años El Gran Portal -->
            <button class="museum-path-node node-3 interactive" id="path-node-3" title="75 Años: Don Fulvio Salvador Pagani">
              <span class="path-node-num">3</span>
              <span class="path-node-label">75 Años: Don Fulvio</span>
            </button>

            <!-- Nodo 4: 1980 Menta Cristal -->
            <button class="museum-path-node node-4a interactive" id="path-node-4a" title="1980: Menta Cristal">
              <span class="path-node-num">4</span>
              <span class="path-node-label">1980: Menta</span>
            </button>

            <!-- Nodo 4b: 1990 Butter Toffees -->
            <button class="museum-path-node node-4b interactive" id="path-node-4b" title="1990: Butter Toffees">
              <span class="path-node-num">4★</span>
              <span class="path-node-label">1990: Toffees</span>
            </button>

            <!-- Nodo 5: 2000 Rocklets -->
            <button class="museum-path-node node-5 interactive" id="path-node-5" title="2000: Rocklets & Alianzas">
              <span class="path-node-num">5</span>
              <span class="path-node-label">2000: Rocklets</span>
            </button>

            <!-- Nodo 6: 2026 Hoy y Futuro -->
            <button class="museum-path-node node-6 interactive" id="path-node-6" title="2026: Hoy y el Futuro Arcor">
              <span class="path-node-num">6</span>
              <span class="path-node-label">2026: Presente</span>
            </button>

            <!-- Libro en la vista de camino -->
            <button class="museum-path-book-btn interactive" id="path-book-trigger" title="Abrir Libro de Archivo">
              <span class="pin-icon">📖</span>
              <span class="pin-tag">Libro de Archivo</span>
            </button>
          </div>

        </div>
      </div>

      <!-- =================================================================
           3. MODAL DE ZOOM DE LA FOTO HISTÓRICA DE 1951
           ================================================================= -->
      <div class="museum-modal-backdrop photo-zoom-modal" id="origin-photo-modal" style="display: none;">
        <div class="photo-zoom-dialog">
          <button class="museum-close-btn interactive" id="photo-zoom-close" title="Cerrar">✕</button>
          
          <div class="photo-zoom-header">
            <span class="zoom-badge">ARCHIVO HISTÓRICO OFICIAL • 1951</span>
            <h2 class="zoom-title">Planta Modelo Arroyito — 5 de Julio de 1951</h2>
          </div>

          <div class="zoom-image-wrapper">
            <img src="./fabrica_arroyito_1951.jpg" alt="Detalle Fábrica Arroyito 1951" class="zoom-big-photo" />
            <div class="zoom-image-frame-gold"></div>
          </div>

          <div class="zoom-photo-caption">
            <p>
              Fotografía auténtica de la primera planta industrial construida en <strong>Arroyito (Córdoba)</strong>.
              Destacan su icónica chimenea de ladrillo cocido artesanal, la entrada original de camiones de distribución y los galpones donde <strong>Don Fulvio Salvador Pagani</strong>, junto a sus hermanos y socios fundadores, instalaron las primeras pailas de cobre.
            </p>
            <div class="zoom-quote-row">
              <span class="zoom-quote-symbol">“</span>
              <em>Una paila de cobre, un fuego encendido y el sueño inquebrantable de llevar dulzura a cada hogar argentino.</em>
              <span class="zoom-quote-author">— Don Fulvio Pagani</span>
            </div>
            
            <div class="zoom-actions">
              <button class="btn-zoom-open-book interactive" id="btn-zoom-open-book">
                <span>📖</span> Leer Capítulo 1: El Sueño de la Paila de Cobre
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- =================================================================
           4. MODAL/CATÁLOGO DE LAS 12 VITRINAS DE ORO
           ================================================================= -->
      <div class="museum-modal-backdrop all-vitrines-modal" id="all-vitrines-modal" style="display: none;">
        <div class="all-vitrines-dialog">
          <button class="museum-close-btn interactive" id="all-vitrines-close" title="Cerrar">✕</button>

          <div class="all-vitrines-header">
            <div class="vitrines-crest">🍬 ★ 75 AÑOS ★ 🍬</div>
            <h2 class="vitrines-modal-title">Galería de las 12 Vitrinas de Oro</h2>
            <p class="vitrines-modal-sub">
              Los sabores legendarios y grandes hitos confiteros que forjaron la historia de Grupo Arcor.
            </p>
            <div class="vitrines-progress-pill">
              <span id="vitrines-modal-counter">0 / 12 Descubiertos</span>
            </div>
          </div>

          <div class="vitrines-grid-scroll" id="all-vitrines-grid">
            <!-- Renderizado dinámico de las 12 vitrinas -->
          </div>
        </div>
      </div>
    `;

    return root;
  }

  private initParticlesCanvas(): void {
    this.particlesCanvas = this.element.querySelector('#museum-particles-canvas') as HTMLCanvasElement;
    if (!this.particlesCanvas) return;
    this.ctx = this.particlesCanvas.getContext('2d');

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Crear 45 partículas doradas flotantes
    this.particles = [];
    const colors = ['#ffe066', '#d4af37', '#ffd700', '#fff8e7', '#ffaa00'];
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: Math.random() * 1024,
        y: Math.random() * 682,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.2 - Math.random() * 0.35, // ascienden suavemente como polvo de hadas
        size: 1.2 + Math.random() * 2.8,
        alpha: 0.25 + Math.random() * 0.7,
        alphaSpeed: 0.006 + Math.random() * 0.012,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  private resizeCanvas(): void {
    if (!this.particlesCanvas) return;
    const frame = this.element.querySelector('#museum-stage-frame');
    if (frame) {
      const rect = frame.getBoundingClientRect();
      this.particlesCanvas.width = rect.width || 1024;
      this.particlesCanvas.height = rect.height || 682;
    } else {
      this.particlesCanvas.width = 1024;
      this.particlesCanvas.height = 682;
    }
  }

  private startParticleLoop(): void {
    const loop = () => {
      if (this.element.style.display !== 'none' && this.ctx && this.particlesCanvas) {
        this.ctx.clearRect(0, 0, this.particlesCanvas.width, this.particlesCanvas.height);

        const w = this.particlesCanvas.width;
        const h = this.particlesCanvas.height;

        for (const p of this.particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha += p.alphaSpeed;

          if (p.alpha > 0.9 || p.alpha < 0.15) {
            p.alphaSpeed = -p.alphaSpeed;
          }

          if (p.y < -10) {
            p.y = h + 10;
            p.x = Math.random() * w;
          }
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;

          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
          this.ctx.fillStyle = p.color;
          this.ctx.shadowBlur = 6;
          this.ctx.shadowColor = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }
      }
      this.animFrameId = requestAnimationFrame(loop);
    };

    if (!this.animFrameId) {
      this.animFrameId = requestAnimationFrame(loop);
    }
  }

  private stopParticleLoop(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private bindEvents(): void {
    // 1. Botón Salir del Museo
    const exitBtn = this.element.querySelector('#museum-btn-exit');
    exitBtn?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
      if (this.onCloseRequested) {
        this.onCloseRequested();
      }
    });

    // 2. Conmutador de vistas (Gran Salón vs Camino Histórico)
    const tabHall = this.element.querySelector('#museum-tab-hall');
    const tabPath = this.element.querySelector('#museum-tab-path');

    tabHall?.addEventListener('click', () => {
      soundManager.playClick();
      this.switchViewMode('grand-hall');
    });

    tabPath?.addEventListener('click', () => {
      soundManager.playClick();
      this.switchViewMode('timeline-path');
    });

    // 3. Audio toggle
    const audioBtn = this.element.querySelector('#museum-btn-audio');
    audioBtn?.addEventListener('click', () => {
      this.toggleMusic();
    });

    // 3b. Botón Historia / ¡Avanzar! (1 ⭐) en la barra superior
    const historyBtn = this.element.querySelector('#museum-btn-history');
    historyBtn?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.onOpenHistory) {
        this.onOpenHistory();
      }
    });

    // 4. Botón catálogo de las 12 vitrinas
    const allVitrinesBtn = this.element.querySelector('#museum-btn-all-vitrines');
    allVitrinesBtn?.addEventListener('click', () => {
      soundManager.playClick();
      this.openAllVitrinesModal();
    });

    const allVitrinesClose = this.element.querySelector('#all-vitrines-close');
    allVitrinesClose?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeAllVitrinesModal();
    });

    const allVitrinesModal = this.element.querySelector('#all-vitrines-modal') as HTMLElement;
    allVitrinesModal?.addEventListener('click', (e) => {
      if (e.target === allVitrinesModal) {
        soundManager.playClick();
        this.closeAllVitrinesModal();
      }
    });

    // 5. Hotspots del Gran Salón:
    // 1950 Muro
    this.element.querySelector('#hotspot-hall-1950')?.addEventListener('click', () => {
      soundManager.playClick();
      this.openPhotoZoomModal();
    });

    // Vitrinas individuales
    this.bindExhibitTrigger('#hotspot-hall-1960', 'exhibit-holanda-1960');
    this.bindExhibitTrigger('#hotspot-hall-1970', 'exhibit-frutales-1970');
    this.bindExhibitTrigger('#hotspot-hall-1980', 'exhibit-menta-1975');
    this.bindExhibitTrigger('#hotspot-hall-1990', 'exhibit-butter-1964');
    this.bindExhibitTrigger('#hotspot-hall-2000', 'exhibit-rocklets-1993');
    this.bindExhibitTrigger('#hotspot-hall-2020', 'exhibit-cofler-1995');

    // Libro abierto en pedestal central
    this.element.querySelector('#hotspot-hall-book')?.addEventListener('click', () => {
      soundManager.playClick();
      this.bookModal.show(0);
      this.setArcoritoMessage(ARCORITO_MUSEUM_DIALOGUES.bookOpened[0]);
    });

    // Pedestal Hitos y Archivo Histórico (¡Avanzar! ⭐)
    this.element.querySelector('#hotspot-hall-history')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.onOpenHistory) {
        this.onOpenHistory();
      }
    });

    // Vitrina inferior frontal
    this.element.querySelector('#hotspot-hall-showcase')?.addEventListener('click', () => {
      soundManager.playClick();
      this.openAllVitrinesModal();
    });

    // Arcorito interactivo
    this.element.querySelector('#hotspot-arcorito-touch')?.addEventListener('click', () => {
      soundManager.playClick();
      this.cycleArcoritoDialog();
    });

    this.element.querySelector('#museum-speech-bubble')?.addEventListener('click', () => {
      soundManager.playClick();
      this.cycleArcoritoDialog();
    });

    // 6. Hotspots del Camino Histórico:
    this.element.querySelector('#path-node-1')?.addEventListener('click', () => {
      soundManager.playClick();
      this.openPhotoZoomModal();
    });

    this.bindExhibitTrigger('#path-node-2', 'exhibit-frutales-1970');

    this.element.querySelector('#path-node-3')?.addEventListener('click', () => {
      soundManager.playClick();
      this.bookModal.show(0);
      this.setArcoritoMessage(ARCORITO_MUSEUM_DIALOGUES.welcome[1] || '¡Don Fulvio encendió el sueño en Arroyito!');
    });

    this.bindExhibitTrigger('#path-node-4a', 'exhibit-menta-1975');
    this.bindExhibitTrigger('#path-node-4b', 'exhibit-butter-1964');
    this.bindExhibitTrigger('#path-node-5', 'exhibit-rocklets-1993');
    this.bindExhibitTrigger('#path-node-6', 'exhibit-75anos-2025');

    this.element.querySelector('#path-book-trigger')?.addEventListener('click', () => {
      soundManager.playClick();
      this.bookModal.show(0);
    });

    // 7. Modales satélite internos
    const photoModal = this.element.querySelector('#origin-photo-modal') as HTMLElement;
    const photoCloseBtn = this.element.querySelector('#photo-zoom-close');
    const zoomBookBtn = this.element.querySelector('#btn-zoom-open-book');

    photoCloseBtn?.addEventListener('click', () => {
      soundManager.playClick();
      if (photoModal) photoModal.style.display = 'none';
    });

    photoModal?.addEventListener('click', (e) => {
      if (e.target === photoModal) {
        soundManager.playClick();
        photoModal.style.display = 'none';
      }
    });

    zoomBookBtn?.addEventListener('click', () => {
      soundManager.playClick();
      if (photoModal) photoModal.style.display = 'none';
      this.bookModal.show(0);
    });

    // Escuchar redimensionamiento para el canvas
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  private bindExhibitTrigger(selector: string, exhibitId: string): void {
    const el = this.element.querySelector(selector);
    el?.addEventListener('click', () => {
      soundManager.playClick();
      const exhibit: MuseumExhibit | undefined = MUSEUM_EXHIBITS.find((e) => e.id === exhibitId);
      if (exhibit) {
        const isDiscovered = gameState.isMuseumCandyDiscovered(exhibit.id);
        this.showcaseModal.show(exhibit, isDiscovered);
      }
    });
  }

  public getViewMode(): MuseumViewMode {
    return this.currentViewMode;
  }

  public switchViewMode(mode: MuseumViewMode): void {
    this.currentViewMode = mode;

    const tabHall = this.element.querySelector('#museum-tab-hall');
    const tabPath = this.element.querySelector('#museum-tab-path');
    const bgHall = this.element.querySelector('#museum-bg-hall');
    const bgPath = this.element.querySelector('#museum-bg-path');
    const layerHall = this.element.querySelector('#layer-hotspots-hall') as HTMLElement;
    const layerPath = this.element.querySelector('#layer-hotspots-path') as HTMLElement;

    if (mode === 'grand-hall') {
      tabHall?.classList.add('active');
      tabPath?.classList.remove('active');
      bgHall?.classList.add('active');
      bgPath?.classList.remove('active');
      if (layerHall) layerHall.style.display = 'block';
      if (layerPath) layerPath.style.display = 'none';
      this.setArcoritoMessage('¡Estás en el Gran Salón! Tocá las vitrinas, el muro o el libro para descubrir nuestras golosinas.');
    } else {
      tabPath?.classList.add('active');
      tabHall?.classList.remove('active');
      bgPath?.classList.add('active');
      bgHall?.classList.remove('active');
      if (layerPath) layerPath.style.display = 'block';
      if (layerHall) layerHall.style.display = 'none';
      this.setArcoritoMessage('¡Este es el Camino Histórico! Recorré los hitos dorados del 1 al 6 a través de 75 años.');
    }
  }

  private openPhotoZoomModal(): void {
    const photoModal = this.element.querySelector('#origin-photo-modal') as HTMLElement;
    if (photoModal) photoModal.style.display = 'flex';
    this.setArcoritoMessage(ARCORITO_MUSEUM_DIALOGUES.photo1950[0]);
  }

  private openAllVitrinesModal(): void {
    this.buildAllVitrinesGrid();
    const modal = this.element.querySelector('#all-vitrines-modal') as HTMLElement;
    if (modal) modal.style.display = 'flex';
  }

  private closeAllVitrinesModal(): void {
    const modal = this.element.querySelector('#all-vitrines-modal') as HTMLElement;
    if (modal) modal.style.display = 'none';
  }

  private buildAllVitrinesGrid(): void {
    const grid = this.element.querySelector('#all-vitrines-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const total = MUSEUM_EXHIBITS.length;
    const discovered = gameState.getDiscoveredMuseumCandies().length;
    const counterEl = this.element.querySelector('#vitrines-modal-counter');
    if (counterEl) counterEl.textContent = `${discovered} / ${total} Coleccionados`;

    MUSEUM_EXHIBITS.forEach((exhibit) => {
      const isCollected = gameState.isMuseumCandyDiscovered(exhibit.id);

      const card = document.createElement('div');
      card.className = `vitrine-catalog-card interactive ${isCollected ? 'collected' : 'uncollected'}`;

      const photoStageHtml = exhibit.candyPhoto
        ? `
          <div class="museum-photo-stage">
            <div class="museum-photo-ambient-glow" style="--candy-glow: ${exhibit.candyColor};"></div>
            <img 
              src="${exhibit.candyPhoto}" 
              alt="${exhibit.candyName}" 
              class="museum-candy-photo" 
              draggable="false"
              loading="lazy"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div class="vitrine-candy-3d shape-${exhibit.candyShape}" style="display: none; background: ${exhibit.candyGradient}; box-shadow: 0 8px 20px rgba(0,0,0,0.5), 0 0 16px ${exhibit.candyColor}88;">
              <div class="v-knot knot-l"></div>
              <div class="v-gloss"></div>
              <span class="v-brand">${exhibit.wrapperText}</span>
              <div class="v-knot knot-r"></div>
            </div>
            <div class="museum-photo-shadow"></div>
            <div class="museum-photo-shimmer-sweep"></div>
          </div>
        `
        : `
          <div class="vitrine-candy-3d shape-${exhibit.candyShape}" style="background: ${exhibit.candyGradient}; box-shadow: 0 8px 20px rgba(0,0,0,0.5), 0 0 16px ${exhibit.candyColor}88;">
            <div class="v-knot knot-l"></div>
            <div class="v-gloss"></div>
            <span class="v-brand">${exhibit.wrapperText}</span>
            <div class="v-knot knot-r"></div>
          </div>
        `;

      card.innerHTML = `
        <div class="catalog-candy-stage has-candy-photo">
          ${photoStageHtml}
          <span class="catalog-year-tag">${exhibit.year}</span>
        </div>

        <div class="catalog-card-body">
          <span class="catalog-decade">${exhibit.decade}</span>
          <h4 class="catalog-title">${exhibit.title}</h4>
          <p class="catalog-importance">${exhibit.importance}</p>
          <div class="catalog-badge">
            ${isCollected ? '✓ EN TU COLECCIÓN' : '🔍 EXAMINAR (+🪙)'}
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        soundManager.playClick();
        const collectedNow = gameState.isMuseumCandyDiscovered(exhibit.id);
        this.showcaseModal.show(exhibit, collectedNow);
      });

      grid.appendChild(card);
    });
  }

  private handleExhibitCollected(exhibitId: string): void {
    const isNew = gameState.discoverMuseumCandy(exhibitId);
    if (isNew) {
      this.updateCollectionBadge();
      this.buildAllVitrinesGrid();

      const totalCollected = gameState.getDiscoveredMuseumCandies().length;
      if (totalCollected >= MUSEUM_EXHIBITS.length) {
        this.setArcoritoMessage(ARCORITO_MUSEUM_DIALOGUES.allCandiesFound[0]);
      } else {
        const dialogList = ARCORITO_MUSEUM_DIALOGUES.candyDiscovered;
        const msg = dialogList[Math.floor(Math.random() * dialogList.length)];
        this.setArcoritoMessage(msg);
      }
    }
  }

  private updateCollectionBadge(): void {
    const collectedCount = gameState.getDiscoveredMuseumCandies().length;
    const total = MUSEUM_EXHIBITS.length;
    const percent = Math.min(100, Math.round((collectedCount / total) * 100));

    const countTxt = this.element.querySelector('#museum-collected-txt');
    const fillEl = this.element.querySelector('#museum-progress-fill') as HTMLElement;

    if (countTxt) countTxt.textContent = `${collectedCount} / ${total}`;
    if (fillEl) fillEl.style.width = `${percent}%`;
  }

  private setArcoritoMessage(msg: string): void {
    const textEl = this.element.querySelector('#museum-speech-text');
    if (textEl) {
      textEl.textContent = msg;
    }
  }

  private cycleArcoritoDialog(): void {
    const allMessages = [
      ...ARCORITO_MUSEUM_DIALOGUES.welcome,
      ...ARCORITO_MUSEUM_DIALOGUES.photo1950,
      ...ARCORITO_MUSEUM_DIALOGUES.candyDiscovered
    ];
    this.arcoritoDialogIndex = (this.arcoritoDialogIndex + 1) % allMessages.length;
    this.setArcoritoMessage(allMessages[this.arcoritoDialogIndex]);
  }

  private toggleMusic(): void {
    soundManager.playClick();
    const isMuted = proceduralMusic.toggleMute();
    const icon = this.element.querySelector('#museum-audio-icon');
    if (icon) {
      icon.textContent = isMuted ? '🔇' : '🎵';
    }
  }

  public updateHistoryButton(): void {
    const data = gameState.getData();
    const stars = data.match3Stars || 0;
    const hasStars = stars >= 1;

    const subEl = this.element.querySelector('#museum-history-sub');
    const btnEl = this.element.querySelector('#museum-btn-history');
    const hallTagEl = this.element.querySelector('#hotspot-history-tag');

    if (subEl) {
      subEl.textContent = hasStars ? `¡Avanzar! (${stars} ⭐)` : 'Álbum e Hitos';
      if (hasStars) {
        subEl.classList.add('has-stars');
        btnEl?.classList.add('pulse-advance');
      } else {
        subEl.classList.remove('has-stars');
        btnEl?.classList.remove('pulse-advance');
      }
    }

    if (hallTagEl) {
      hallTagEl.textContent = hasStars ? `Hitos (${stars} ⭐)` : 'Hitos e Historia';
    }
  }

  public show(): void {
    this.element.style.display = 'flex';
    this.switchViewMode('grand-hall');
    this.resizeCanvas();
    this.startParticleLoop();
    this.updateCollectionBadge();
    this.updateHistoryButton();
    this.setArcoritoMessage(ARCORITO_MUSEUM_DIALOGUES.welcome[0]);
    soundManager.playFanfare();
  }

  public hide(): void {
    this.element.style.display = 'none';
    this.stopParticleLoop();
    this.showcaseModal.hide();
    this.bookModal.hide();
    this.closeAllVitrinesModal();
    const photoModal = this.element.querySelector('#origin-photo-modal') as HTMLElement;
    if (photoModal) photoModal.style.display = 'none';
  }
}
