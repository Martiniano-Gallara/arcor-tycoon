/**
 * GIFT BOX BUILDER MODAL: "CREÁ TU CAJA OBSEQUIO ARCOR"
 * 
 * Experiencia interactiva 3D inspirada en la fábrica mágica de Arcor:
 * - Selección de golosinas organizadas por categorías con miniaturas 3D hiper-realistas
 * - Buscador en tiempo real y asesoramiento del chef 3D Arcorito con globos interactivos
 * - Caja de regalo 3D en perspectiva con colchón de viruta/papel picado artesanal
 * - Arrastre libre (drag & drop y táctil) de golosinas dentro de la caja con inclinaciones y sombras
 * - Placa de madera rústica con dedicatoria interior personalizada
 * - Selección de diseño de caja (Azul Confeti, Dorado Artesanal, Romántica Corazones, Carnaval)
 * - Selección de temáticas conmemorativas y moños de seda en varios colores
 * - Animación ceremonial de cierre 3D: solapa abatible, lazada de moño y lluvia de confeti
 */

import {
  customizationManager,
  BOX_DESIGNS_CATALOG,
  BOX_THEMES_CATALOG,
  BoxDesign,
  BoxTheme,
  RibbonColor,
  PlacedBoxProduct,
  GiftBox,
  CustomProduct
} from '../gameplay/CustomizationManager.ts';
import { escapeHtml, sanitizeSharedGiftBox } from '../core/SecurityUtils.ts';
import { achievementsManager } from '../gameplay/AchievementsManager.ts';
import { soundManager } from '../core/SoundManager.ts';
import { gameState } from '../gameplay/GameState.ts';

export type CandyCategory = 'todos' | 'chocolates' | 'caramelos' | 'gomitas' | 'galletitas' | 'especiales';

export interface BoxCandyDefinition {
  type: string;
  name: string;
  brand: string;
  category: CandyCategory;
  bgGradient: string;
  accentColor: string;
  icon: string;
  image?: string;  // URL de foto real del producto
  packageKind: 'bonobon' | 'tablet' | 'flowpack' | 'pouch' | 'twist';
  subtitle: string;
}

export const CATALOG_CANDIES: BoxCandyDefinition[] = [
  {
    type: 'bonobon',
    name: 'Bon o Bon Leche',
    brand: 'bon o bon',
    category: 'chocolates',
    bgGradient: 'radial-gradient(circle at 35% 30%, #ffd700 0%, #b8860b 60%, #8b6508 100%)',
    accentColor: '#d32f2f',
    icon: '🍫',
    image: './candies/bonobon_leche.png',
    packageKind: 'bonobon',
    subtitle: 'El clásico bombón'
  },
  {
    type: 'bonobon_blanco',
    name: 'Bon o Bon Blanco',
    brand: 'bon o bon',
    category: 'chocolates',
    bgGradient: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #f7f3d9 60%, #e0d8a8 100%)',
    accentColor: '#c5a059',
    icon: '✨',
    image: './candies/bonobon_blanco.png',
    packageKind: 'bonobon',
    subtitle: 'Chocolate blanco & maní'
  },
  {
    type: 'caramelo_1951',
    name: 'Caramelo Arcor',
    brand: 'Arcor',
    category: 'caramelos',
    bgGradient: 'linear-gradient(135deg, #e53935 0%, #b71c1c 100%)',
    accentColor: '#ffffff',
    icon: '🍬',
    image: './candies/caramelo_arcor.png',
    packageKind: 'twist',
    subtitle: 'El sabor original 1951'
  },
  {
    type: 'cofler',
    name: 'Cofler Chocolate',
    brand: 'Cofler',
    category: 'chocolates',
    bgGradient: 'linear-gradient(145deg, #3e2723 0%, #1a0f08 100%)',
    accentColor: '#ffd700',
    icon: '🍫',
    image: './candies/cofler.png',
    packageKind: 'tablet',
    subtitle: 'Puro chocolate con leche'
  },
  {
    type: 'mogul',
    name: 'Gomitas Mogul',
    brand: 'Mogul',
    category: 'gomitas',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #3b82f6 50%, #eab308 100%)',
    accentColor: '#ffffff',
    icon: '🐻',
    image: './candies/mogul_gomitas.png',
    packageKind: 'flowpack',
    subtitle: 'Ositos frutales con jugo'
  },
  {
    type: 'rocklets',
    name: 'Rocklets Confites',
    brand: 'Rocklets',
    category: 'chocolates',
    bgGradient: 'linear-gradient(145deg, #09090b 0%, #18181b 100%)',
    accentColor: '#38bdf8',
    icon: '🌈',
    image: './candies/rocklets.png',
    packageKind: 'flowpack',
    subtitle: 'Lentejas de chocolate'
  },
  {
    type: 'tofi',
    name: 'Tofi Dulce de Leche',
    brand: 'Tofi',
    category: 'chocolates',
    bgGradient: 'linear-gradient(135deg, #854d0e 0%, #451a03 100%)',
    accentColor: '#fef08a',
    icon: '🍯',
    image: './candies/tofi.png',
    packageKind: 'tablet',
    subtitle: 'Con dulce de leche'
  },
  {
    type: 'serranitas',
    name: 'Serranitas',
    brand: 'Bagley',
    category: 'galletitas',
    bgGradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
    accentColor: '#fde047',
    icon: '🍪',
    image: './candies/bagley.png',
    packageKind: 'flowpack',
    subtitle: 'Galletitas doradas'
  },
  {
    type: 'saladix',
    name: 'Saladix Horneadas',
    brand: 'Bagley',
    category: 'galletitas',
    bgGradient: 'linear-gradient(135deg, #dc2626 0%, #1d4ed8 100%)',
    accentColor: '#ffffff',
    icon: '🥨',
    packageKind: 'pouch',
    subtitle: 'Snack crujiente horneado'
  },
  {
    type: 'bagley',
    name: 'Surtido Bagley',
    brand: 'Bagley',
    category: 'galletitas',
    bgGradient: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
    accentColor: '#fef08a',
    icon: '🍪',
    image: './candies/bagley.png',
    packageKind: 'flowpack',
    subtitle: 'Tradición en galletitas'
  },
  {
    type: 'aguila',
    name: 'Águila Cacao 70%',
    brand: 'Águila',
    category: 'chocolates',
    bgGradient: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
    accentColor: '#f59e0b',
    icon: '🦅',
    image: './candies/aguila.png',
    packageKind: 'tablet',
    subtitle: 'Puro chocolate para taza'
  },
  {
    type: 'buttertoffe',
    name: 'Butter Toffees',
    brand: 'Butter Toffees',
    category: 'caramelos',
    bgGradient: 'radial-gradient(circle at 30% 30%, #f59e0b 0%, #b45309 60%, #78350f 100%)',
    accentColor: '#fef3c7',
    icon: '🧈',
    image: './candies/butter_toffees.png',
    packageKind: 'twist',
    subtitle: 'Caramelo de leche suave'
  },
  {
    type: 'holanda',
    name: 'Caramelos Holanda',
    brand: 'Holanda',
    category: 'caramelos',
    bgGradient: 'linear-gradient(135deg, #b71c1c 0%, #1d4ed8 100%)',
    accentColor: '#ffffff',
    icon: '🍬',
    image: './candies/holanda.png',
    packageKind: 'twist',
    subtitle: 'Dulce de leche clásico'
  },
  {
    type: 'frutales',
    name: 'Frutales Arcor',
    brand: 'Arcor',
    category: 'caramelos',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
    accentColor: '#fde047',
    icon: '🍓',
    image: './candies/frutales.png',
    packageKind: 'twist',
    subtitle: 'Surtido de frutas reales'
  },
  {
    type: 'menta',
    name: 'Menta Cristal',
    brand: 'Arcor',
    category: 'caramelos',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    accentColor: '#a7f3d0',
    icon: '🌿',
    image: './candies/menta_cristal.png',
    packageKind: 'twist',
    subtitle: 'Frescura cristalina'
  }
];

export interface CelebrationParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  kind: 'rect' | 'star' | 'heart' | 'sparkle' | 'streamer' | 'candy';
  rotation: number;
  vRot: number;
  rot3d: number;
  vRot3d: number;
  alpha: number;
  decay: number;
  swaySpeed: number;
  swayOffset: number;
  candyChar?: string;
}

export class GiftBoxBuilderModal {
  public element: HTMLElement;

  // Estado del creador
  private selectedDesign: BoxDesign = BOX_DESIGNS_CATALOG[0];
  private selectedTheme: BoxTheme = BOX_THEMES_CATALOG[0];
  private selectedRibbon: RibbonColor = 'dorado';
  private selectedCategory: CandyCategory = 'todos';
  private searchQuery: string = '';
  private toPerson: string = 'Alguien Muy Especial';
  private fromPerson: string = 'Yo';
  private dedicationText: string = 'Un mundo más dulce para vos ♡';
  private placedItems: PlacedBoxProduct[] = [];

  // Estado de la animación ceremonial y compartir
  private isFinishing: boolean = false;
  private lastSavedBox: GiftBox | null = null;
  private celebrationRafId: number | null = null;

  // Vistas
  private builderViewEl: HTMLElement | null = null;
  private closedBoxViewEl: HTMLElement | null = null;
  private boxInteriorEl: HTMLElement | null = null;
  private boxCountBadgeEl: HTMLElement | null = null;
  private arcoritoBubbleEl: HTMLElement | null = null;
  private insideDedicationPlaqueEl: HTMLElement | null = null;

  // Callbacks
  public onBoxSaved?: (box: GiftBox) => void;
  public onOpenCollection?: () => void;
  public onCreateProductRequested?: () => void;
  public onClose?: () => void;

  constructor() {
    this.element = this.render();
  }

  private render(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'box-builder-backdrop';
    backdrop.id = 'gift-box-builder-modal';
    backdrop.style.display = 'none';

    backdrop.innerHTML = `
      <div class="box-builder-canvas">
        
        <!-- ==============================================================
             BARRA SUPERIOR: VOLVER + CARTEL DE MADERA CON LUCES + PASOS + MONEDAS
             ============================================================== -->
        <header class="workshop-top-header">
          <!-- Botón Volver de madera -->
          <button class="wood-pill-btn interactive" id="bb-btn-close" title="Volver al juego">
            <span class="btn-arrow">←</span>
            <span>Volver</span>
          </button>

          <!-- Cartel Principal de Madera con Luces de Feria Marquee -->
          <div class="marquee-wood-board">
            <div class="marquee-bulbs-row">
              <span class="bulb"></span><span class="bulb"></span><span class="bulb"></span>
              <span class="bulb"></span><span class="bulb"></span><span class="bulb"></span>
              <span class="bulb"></span><span class="bulb"></span><span class="bulb"></span>
            </div>
            <div class="board-ribbon-tag">TALLER DE OBSEQUIOS ARCOR</div>
            <h1 class="board-3d-title">CREÁ TU CAJA OBSEQUIO</h1>
            <p class="board-sub-text">Elegí, armá y sorprendé con un mundo más dulce</p>
          </div>

          <!-- Stepper de Progreso Guiado -->
          <div class="workshop-stepper-pill" id="workshop-stepper">
            <div class="step-chip active" data-step="1">
              <span class="step-num">1</span>
              <span class="step-lbl">Productos</span>
            </div>
            <div class="step-chip" data-step="2">
              <span class="step-num">2</span>
              <span class="step-lbl">Caja</span>
            </div>
            <div class="step-chip" data-step="3">
              <span class="step-num">3</span>
              <span class="step-lbl">Decoración</span>
            </div>
            <div class="step-chip" data-step="4">
              <span class="step-num">4</span>
              <span class="step-lbl">Mensaje</span>
            </div>
            <div class="step-chip" data-step="5">
              <span class="step-num">5</span>
              <span class="step-lbl">Vista previa</span>
            </div>
          </div>

          <!-- Widget de Monedas de Oro -->
          <div class="workshop-coins-badge" id="workshop-coins-val">
            <span class="coin-ico">🪙</span>
            <span class="coin-txt">$${(gameState.getData().money || 2500).toLocaleString()}</span>
          </div>
        </header>

        <!-- ==============================================================
             CONTENIDO PRINCIPAL: 3 COLUMNAS (CATÁLOGO / CAJA 3D / PERSONALIZADOR)
             ============================================================== -->
        <main class="workshop-3col-stage" id="box-workspace">

          <!-- ------------------------------------------------------------
               COLUMNA 1: "ELEGÍ TUS GOLOSINAS" (CATÁLOGO & ARCORITO CHEF)
               ------------------------------------------------------------ -->
          <aside class="workshop-left-panel">
            <div class="panel-header-row">
              <span class="panel-dot">●</span>
              <h3 class="panel-heading">Elegí tus golosinas</h3>
              <button class="btn-clear-mini interactive" id="btn-clear-box" title="Vaciar la caja">Vaciar</button>
            </div>

            <!-- Filtro de Categorías -->
            <div class="categories-pills-row" id="candy-categories-row">
              <button class="cat-pill active interactive" data-cat="todos">🟨 Todos</button>
              <button class="cat-pill interactive" data-cat="chocolates">🍫 Chocolates</button>
              <button class="cat-pill interactive" data-cat="caramelos">🍬 Caramelos</button>
              <button class="cat-pill interactive" data-cat="gomitas">🐻 Gomitas</button>
              <button class="cat-pill interactive" data-cat="galletitas">🍪 Galletitas</button>
              <button class="cat-pill interactive" data-cat="especiales">⭐ Especiales</button>
            </div>

            <!-- Buscador Rápido -->
            <div class="candies-search-wrap">
              <span class="search-ico">🔍</span>
              <input type="text" id="input-candy-search" class="candies-search-input interactive" placeholder="Buscar producto Arcor..." />
            </div>

            <!-- Grilla 3D de Productos Seleccionables -->
            <div class="candies-catalog-grid" id="candies-catalog-grid"></div>

            <!-- Mascota Arcorito Chef en la esquina inferior izquierda -->
            <div class="arcorito-helper-widget">
              <div class="arcorito-speech-bubble" id="arcorito-speech-bubble">
                <span>¡Hacé una caja única! Tocá o arrastrá dulces adentro.</span>
              </div>
              <div class="arcorito-chef-avatar-wrap">
                <img src="./arcorito.png" alt="Arcorito" class="arcorito-chef-img" />
              </div>
            </div>
          </aside>


          <!-- ------------------------------------------------------------
               COLUMNA 2: ESCENARIO 3D FOTOREALISTA DE LA CAJA OBSEQUIO
               ------------------------------------------------------------ -->
          <section class="workshop-center-stage">
            <div class="workbench-surface photoreal-workbench">
              
              <!-- Escenario 3D de la Caja con Render Fotorrealista de Nano Banana -->
              <div class="box-3d-scene photoreal-scene" id="box-3d-scene">
                <div class="photoreal-stage-card">
                  <!-- Imagen 3D hiperrealista de la Caja Arcor -->
                  <img src="./box_stage_3d.jpg" alt="Caja Obsequio Arcor 3D" class="photoreal-stage-img" draggable="false" />
                  
                  <!-- Resplandor áurico dorado animado -->
                  <div class="photoreal-ambient-glow"></div>

                  <!-- Destellos y chispas mágicas flotantes -->
                  <div class="photoreal-sparkles-floating">
                    <span class="p-sparkle s-1">✨</span>
                    <span class="p-sparkle s-2">✨</span>
                    <span class="p-sparkle s-3">🌟</span>
                    <span class="p-sparkle s-4">✨</span>
                  </div>

                  <!-- Bombón dorado flotante interactivo (izquierda) -->
                  <div class="floating-prop-zone prop-bonbon" title="Bombón Arcor Dorado">
                    <div class="prop-anim-ring"></div>
                  </div>

                  <!-- Bloque de chocolate flotante interactivo (derecha) -->
                  <div class="floating-prop-zone prop-choco" title="Chocolate Cofler">
                    <div class="prop-anim-ring"></div>
                  </div>

                  <!-- CAVIDAD INTERIOR: Donde caen y se acomodan las golosinas reales -->
                  <div class="box-3d-cavity photoreal-cavity" id="box-interior-cavity">
                    <!-- Mensaje de caja vacía -->
                    <div class="box-empty-hint photoreal-hint" id="box-empty-hint">
                      <span class="hint-ico">🎁</span>
                      <strong class="hint-title">Caja vacía.</strong>
                      <span class="hint-txt">Tocá golosinas en el panel izquierdo para llenarla.</span>
                    </div>

                    <!-- DROPZONE: Contenedor táctil para colocar y arrastrar golosinas -->
                    <div class="box-interior-dropzone photoreal-dropzone" id="box-interior-dropzone"></div>
                  </div>

                  <!-- Placa / Tarjeta artesanal de dedicatoria apoyada al frente -->
                  <div class="box-inside-dedication-card photoreal-card" id="box-inside-dedication">
                    <span class="plaque-pin">📌</span>
                    <p class="plaque-msg" id="plaque-text">"Un mundo más dulce para vos ♡"</p>
                  </div>

                  <!-- Badge flotante con conteo de dulces -->
                  <div class="box-items-counter-pill photoreal-counter" id="box-count-badge">
                    <span class="counter-ico">🍪</span>
                    <span class="counter-val">0 / 12 Golosinas</span>
                  </div>

                  <!-- Indicadores de carrusel en la base del pedestal -->
                  <div class="stage-carousel-dots">
                    <span class="carousel-dot active"></span>
                    <span class="carousel-dot"></span>
                    <span class="carousel-dot"></span>
                    <span class="carousel-dot"></span>
                  </div>

                  <!-- Capa de Canvas para Explosión de Celebración Radial -->
                  <canvas class="box-celebration-canvas" id="box-celebration-canvas"></canvas>

                  <!-- Tapa 3D Cinemática para Cierre Físico Satisfactorio -->
                  <div class="cinematic-box-lid-flap" id="cinematic-box-lid-flap" style="display: none;">
                    <div class="lid-texture-surface" id="lid-texture-surface">
                      <div class="lid-border-emboss"></div>
                      <div class="lid-ribbon-stripe" id="lid-ribbon-stripe"></div>
                      <div class="lid-golden-seal">
                        <div class="seal-inner-txt">ARCOR 75 AÑOS</div>
                      </div>
                      <div class="lid-lacquer-glint"></div>
                    </div>
                  </div>

                  <!-- Destello Dorado de Sellado -->
                  <div class="lid-sealed-flash" id="lid-sealed-flash"></div>
                </div>
              </div>

            </div>
          </section>


          <!-- ------------------------------------------------------------
               COLUMNA 3: CAJA, TEMÁTICA, DECORACIÓN & MENSAJE
               ------------------------------------------------------------ -->
          <aside class="workshop-right-panel">
            <!-- 1. Diseño de Caja -->
            <div class="panel-section-group">
              <div class="sec-title-row">
                <span class="sec-bullet">●</span>
                <span class="sec-title">Caja</span>
              </div>
              <div class="box-skins-grid" id="bb-designs-row"></div>
            </div>

            <!-- 2. Temática -->
            <div class="panel-section-group">
              <div class="sec-title-row">
                <span class="sec-bullet">●</span>
                <span class="sec-title">Temática</span>
              </div>
              <div class="box-themes-grid" id="bb-themes-row"></div>
            </div>

            <!-- 3. Decoración (Moños y Adornos) -->
            <div class="panel-section-group">
              <div class="sec-title-row">
                <span class="sec-bullet">●</span>
                <span class="sec-title">Decoración & Moño</span>
              </div>
              <div class="ribbons-selector-row" id="bb-ribbons-row"></div>
              <div class="box-charms-row" id="bb-charms-row">
                <button class="charm-chip interactive" data-charm="💖">💖 Amor</button>
                <button class="charm-chip interactive" data-charm="⭐">⭐ Estrella</button>
                <button class="charm-chip interactive" data-charm="😊">😊 Alegría</button>
                <button class="charm-chip interactive" data-charm="🌈">🌈 Dulzura</button>
              </div>
            </div>

            <!-- 4. Dedicatoria y Mensaje -->
            <div class="panel-section-group">
              <div class="sec-title-row">
                <span class="sec-bullet">●</span>
                <span class="sec-title">Dedicatoria</span>
              </div>
              <div class="dedication-inputs-stack">
                <div class="input-line">
                  <label>Para:</label>
                  <input type="text" id="input-box-to" class="ded-input interactive" value="Alguien Muy Especial" maxlength="30" />
                </div>
                <div class="input-line">
                  <label>De:</label>
                  <input type="text" id="input-box-from" class="ded-input interactive" value="Yo" maxlength="30" />
                </div>
                <div class="input-line">
                  <label>Mensaje:</label>
                  <textarea id="input-box-msg" class="ded-textarea interactive" maxlength="120" rows="2">Un mundo más dulce para vos ♡</textarea>
                </div>
              </div>
            </div>

            <!-- Botón Grande Dorado de Cierre (Igual al de la referencia) -->
            <div class="panel-cta-row">
              <button class="btn-golden-capsule interactive" id="btn-close-giftbox">
                <span>Siguiente</span>
                <span class="capsule-arrow">➔</span>
              </button>
            </div>
          </aside>

        </main>


        <!-- ==============================================================
             VISTA 2: ANIMACIÓN CEREMONIAL 3D Y CAJA CERRADA TERMINADA
             ============================================================== -->
        <div class="box-closed-ceremony-view" id="box-closed-view" style="display: none;">
          <!-- Banner de Regalo Compartido (solo visible si se abre mediante link compartido) -->
          <div class="shared-gift-top-banner" id="shared-gift-banner" style="display: none;">
            <div class="shared-banner-title">🎁 ¡Te enviaron este regalo dulce de Arcor!</div>
            <button class="shared-banner-btn interactive" id="btn-make-my-own-gift">✨ Armar mi propio regalo</button>
          </div>

          <!-- Contenedor de Partículas de Confetti y Chispas Continuas -->
          <div class="ceremony-confetti-layer" id="ceremony-confetti-layer"></div>

          <div class="closed-cinematic-stage">
            <!-- Vitrina de la Caja Cerrada con Moño de Seda 3D y Sello -->
            <div class="ceremony-box-card" id="finished-box-card">
              <div class="finished-box-lid-3d" id="finished-box-lid-3d">
                
                <!-- Moño 3D Animado Cruzado con vaivén natural -->
                <div class="finished-ribbon-bands" id="fin-ribbon-bands">
                  <div class="ribbon-band-h"></div>
                  <div class="ribbon-band-v"></div>
                  <div class="ribbon-luxury-bow fin-bow-natural-sway" id="fin-bow">
                    <span class="bow-knot">🎀</span>
                  </div>
                </div>

                <!-- Sello Dorado Arcor 75 Años -->
                <div class="arcor-gold-wax-seal">
                  <div class="seal-inner">ARCOR 75 AÑOS</div>
                </div>

                <!-- Haz de brillo lento diagonal del packaging -->
                <div class="box-luxury-shimmer-sweep"></div>
              </div>

              <!-- Tarjeta Colgante con Dedicatoria Revelada Progresivamente -->
              <div class="luxury-hanging-tag" id="gift-hanging-tag">
                <div class="tag-ambient-float-decor">
                  <span class="decor-sparkle d-1">✨</span>
                  <span class="decor-heart d-2">♡</span>
                  <span class="decor-star d-3">★</span>
                </div>
                <span class="tag-pin">📍</span>
                <div class="tag-line-item tag-for" id="tag-for-person">Para: Alguien Especial</div>
                <p class="tag-line-item tag-body" id="tag-message-body">"¡Que disfrutes mucho todas estas golosinas!"</p>
                <div class="tag-line-item tag-from" id="tag-from-person">Con cariño, Yo ♡</div>
              </div>
            </div>
          </div>

          <div class="ceremony-celebration-text" id="ceremony-celebration-text">
            <h2 class="ceremony-title">¡TU REGALO ESTÁ LISTO PARA ENTREGAR!</h2>
            <p class="ceremony-sub">La caja ha sido cuidadosamente cerrada, atada con el moño y preparada para sorprender.</p>
          </div>

          <!-- Acciones -->
          <div class="ceremony-actions-row" id="ceremony-actions-row">
            <button class="btn btn-primary btn-share-giftbox interactive" id="btn-share-giftbox">
              <span>💌 COMPARTIR MI REGALO</span>
            </button>
            <button class="btn btn-secondary btn-golden-capsule interactive" id="btn-save-box-collection">
              <span>📦 GUARDAR EN MI COLECCIÓN</span>
            </button>
            <button class="btn btn-secondary wood-pill-btn interactive" id="btn-make-another-box">
              <span>🔄 ARMAR OTRA CAJA</span>
            </button>
          </div>

          <!-- Toast / Modal de Compartir Feedback -->
          <div class="gift-share-toast" id="gift-share-toast" style="display: none;">
            <div class="toast-card">
              <span class="toast-icon">💌</span>
              <div class="toast-body">
                <strong class="toast-title">¡Enlace de tu regalo listo para compartir!</strong>
                <p class="toast-sub">Copiado al portapapeles. Quien lo abra verá la caja cerrada con tu dedicatoria y la animación completa.</p>
              </div>
              <div class="toast-actions">
                <a href="#" target="_blank" class="toast-wa-btn interactive" id="toast-share-wa">
                  <span>💬 WhatsApp</span>
                </a>
                <button class="toast-copy-btn interactive" id="toast-share-copy">📋 Copiar de nuevo</button>
                <button class="toast-close-btn interactive" id="toast-share-close">✕</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    // Cachear referencias DOM
    this.builderViewEl = backdrop.querySelector('#box-workspace');
    this.closedBoxViewEl = backdrop.querySelector('#box-closed-view');
    this.boxInteriorEl = backdrop.querySelector('#box-interior-dropzone');
    this.boxCountBadgeEl = backdrop.querySelector('#box-count-badge');
    this.arcoritoBubbleEl = backdrop.querySelector('#arcorito-speech-bubble span');
    this.insideDedicationPlaqueEl = backdrop.querySelector('#plaque-text');

    // Inicializar subcomponentes
    this.renderCatalogGrid(backdrop);
    this.renderCategoryFilters(backdrop);
    this.renderDesigns(backdrop);
    this.renderThemes(backdrop);
    this.renderRibbons(backdrop);
    this.renderCharms(backdrop);
    this.bindDedicationInputs(backdrop);
    this.bindSearchInput(backdrop);

    // Eventos principales
    backdrop.querySelector('#bb-btn-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
      if (this.onClose) this.onClose();
    });

    backdrop.querySelector('#btn-clear-box')?.addEventListener('click', () => {
      if (this.isFinishing) return;
      soundManager.playClick();
      this.clearBox();
    });

    backdrop.querySelector('#btn-close-giftbox')?.addEventListener('click', () => {
      this.handleCloseAndFinishBox();
    });

    backdrop.querySelector('#btn-share-giftbox')?.addEventListener('click', () => {
      this.handleShareGiftBox();
    });

    backdrop.querySelector('#btn-make-my-own-gift')?.addEventListener('click', () => {
      soundManager.playClick();
      this.resetBuilder();
    });

    backdrop.querySelector('#btn-save-box-collection')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
      if (this.onOpenCollection) {
        this.onOpenCollection();
      } else if (this.onClose) {
        this.onClose();
      }
    });

    backdrop.querySelector('#btn-make-another-box')?.addEventListener('click', () => {
      soundManager.playClick();
      this.resetBuilder();
    });

    return backdrop;
  }

  /**
   * Renderiza los filtros de categorías
   */
  private renderCategoryFilters(root: HTMLElement): void {
    const row = root.querySelector('#candy-categories-row');
    if (!row) return;

    row.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playClick();
        row.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedCategory = (btn.getAttribute('data-cat') || 'todos') as CandyCategory;
        this.renderCatalogGrid(root);
      });
    });
  }

  /**
   * Conecta el buscador de golosinas
   */
  private bindSearchInput(root: HTMLElement): void {
    const inp = root.querySelector<HTMLInputElement>('#input-candy-search');
    inp?.addEventListener('input', () => {
      this.searchQuery = (inp.value || '').trim().toLowerCase();
      this.renderCatalogGrid(root);
    });
  }

  /**
   * Renderiza el catálogo interactivo de golosinas (oficiales + personalizadas del usuario)
   */
  private renderCatalogGrid(root: HTMLElement): void {
    const grid = root.querySelector('#candies-catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // 1. Filtrar golosinas de catálogo estándar
    let list = CATALOG_CANDIES.filter(c => {
      const matchCat = this.selectedCategory === 'todos' || c.category === this.selectedCategory;
      const matchSearch = !this.searchQuery || c.name.toLowerCase().includes(this.searchQuery) || c.brand.toLowerCase().includes(this.searchQuery);
      return matchCat && matchSearch;
    });

    // 2. Incorporar productos personalizados creados por el usuario
    const customProds = customizationManager.getCustomProducts();
    const customList = customProds
      .filter(p => {
        const matchCat = this.selectedCategory === 'todos' || this.selectedCategory === 'especiales';
        const matchSearch = !this.searchQuery || p.name.toLowerCase().includes(this.searchQuery);
        return matchCat && matchSearch;
      })
      .map((p): BoxCandyDefinition => ({
        type: `custom_${p.id}`,
        name: p.name,
        brand: p.brand.toUpperCase(),
        category: 'especiales' as CandyCategory,
        bgGradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        accentColor: '#fef08a',
        icon: '✨',
        packageKind: 'pouch' as const,
        subtitle: p.flavorOrMessage
      }));

    const combined: BoxCandyDefinition[] = [...list, ...customList];

    if (combined.length === 0) {
      grid.innerHTML = `
        <div class="catalog-empty-msg">
          <span>🔍 No se encontraron productos.</span>
        </div>
      `;
      return;
    }

    combined.forEach(candy => {
      const card = document.createElement('div');
      card.className = 'catalog-candy-card interactive';
      const safeName = escapeHtml(candy.name);
      const safeSub = escapeHtml(candy.subtitle);
      const safeIcon = escapeHtml(candy.icon);
      card.title = `Agregar ${safeName} a la caja`;

      // Thumb: foto real si existe, si no, fallback a emoji animado
      const thumbInner = candy.image
        ? `<img
            src="${candy.image}"
            alt="${safeName}"
            class="candy-product-photo"
            draggable="false"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <span class="candy-pack-icon candy-pack-fallback" style="display:none">${safeIcon}</span>`
        : `<div class="candy-foil-glare"></div>
           <span class="candy-pack-icon">${safeIcon}</span>`;

      card.innerHTML = `
        <div class="candy-card-thumb package-thumb-${candy.packageKind} ${candy.image ? 'has-photo' : ''}">
          <div class="candy-card-ambient-light"></div>
          ${thumbInner}
          <button class="candy-add-btn interactive" title="Agregar ${safeName} a la caja">＋</button>
        </div>
        <div class="candy-card-meta">
          <span class="candy-card-name" title="${safeName}">${safeName}</span>
          <span class="candy-card-sub" title="${safeSub}">${safeSub}</span>
        </div>
      `;

      // Clic para agregar con efecto y sonido
      card.addEventListener('click', () => {
        this.addCandyWithAnimation(candy, card);
      });

      // Arrastre HTML5 Drag & Drop
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer?.setData('text/plain', JSON.stringify(candy));
      });

      grid.appendChild(card);
    });
  }

  /**
   * Agrega un dulce a la caja con animación de trayectoria y sonido
   */
  private addCandyWithAnimation(candy: BoxCandyDefinition, _sourceEl?: HTMLElement): void {
    if (this.isFinishing) return;

    if (this.placedItems.length >= 12) {
      soundManager.playLose();
      this.updateArcoritoBubble('¡La caja está llena! (Máximo 12 productos). Podés quitar alguno tocándolo.');
      return;
    }

    soundManager.playCoin();

    // Posición dispersa con ligera rotación natural
    const count = this.placedItems.length;
    const basePositions = [
      { x: 50, y: 55, r: 0 },
      { x: 30, y: 35, r: -10 },
      { x: 70, y: 35, r: 12 },
      { x: 20, y: 65, r: -15 },
      { x: 80, y: 65, r: 14 },
      { x: 40, y: 40, r: -5 },
      { x: 60, y: 42, r: 8 },
      { x: 50, y: 25, r: 3 },
      { x: 32, y: 75, r: -8 },
      { x: 68, y: 75, r: 9 },
      { x: 22, y: 48, r: -18 },
      { x: 78, y: 48, r: 16 }
    ];

    const targetPos = basePositions[count % basePositions.length];
    const jitterX = (Math.random() - 0.5) * 8;
    const jitterY = (Math.random() - 0.5) * 8;

    const item: PlacedBoxProduct = {
      id: `box_item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: candy.type,
      name: candy.name,
      icon: candy.icon,
      xPercent: Math.max(15, Math.min(85, targetPos.x + jitterX)),
      yPercent: Math.max(20, Math.min(80, targetPos.y + jitterY)),
      rotationDeg: targetPos.r + (Math.random() - 0.5) * 6
    };

    this.addItemToBox(item);

    // Cuando se alcanza el máximo permitido (12/12): disparar secuencia de celebración
    if (this.placedItems.length === 12) {
      this.isFinishing = true;
      this.updateArcoritoBubble('¡Caja completa! 12 de 12 golosinas alcanzadas. ¡Iniciando celebración!');
      setTimeout(() => {
        this.startCelebrationSequence();
      }, 280);
      return;
    }

    // Actualizar globo de Arcorito
    if (this.placedItems.length === 1) {
      this.updateArcoritoBubble('¡Gran comienzo! Ese dulce le va a encantar.');
    } else if (this.placedItems.length >= 6 && this.placedItems.length < 10) {
      this.updateArcoritoBubble('¡Esa caja se ve abundante y deliciosa! Ya casi está lista.');
    } else if (this.placedItems.length >= 10) {
      this.updateArcoritoBubble('¡Espectacular! Falta muy poquito para completar las 12.');
    }
  }

  /**
   * Coloca el elemento en el interior de la caja y habilita su arrastre táctil
   */
  public addItemToBox(item: PlacedBoxProduct): void {
    if (!this.boxInteriorEl) return;
    this.placedItems.push(item);

    const emptyHint = this.element.querySelector('#box-empty-hint') as HTMLElement;
    if (emptyHint) emptyHint.style.display = 'none';

    const candyDef = CATALOG_CANDIES.find(c => c.type === item.type);
    if (!candyDef) {
      console.warn(`[GiftBoxBuilder] Tipo de golosina no reconocido: ${item.type}`);
      return;
    }

    const el = document.createElement('div');
    el.className = 'placed-box-item interactive';
    el.id = `placed_${item.id}`;
    el.style.left = `${item.xPercent}%`;
    el.style.top = `${item.yPercent}%`;
    el.style.transform = `translate(-50%, -50%) rotate(${item.rotationDeg}deg)`;
    el.style.setProperty('--rot', `${item.rotationDeg}deg`);

    const safeName = escapeHtml(candyDef.name);
    const safeIcon = escapeHtml(candyDef.icon);
    const hasPhoto = !!candyDef.image;
    const innerHtml = hasPhoto
      ? `<img src="${candyDef.image}" alt="${safeName}" class="placed-candy-photo" draggable="false" />`
      : `<div class="placed-package-3d package-thumb-${candyDef.packageKind}" style="background: ${candyDef.bgGradient}; border: 2px solid ${candyDef.accentColor};">
          <span class="placed-icon">${safeIcon}</span>
          <span class="placed-label">${safeName}</span>
          <div class="placed-foil-gleam"></div>
        </div>`;

    el.innerHTML = `
      ${innerHtml}
      <button class="candy-remove-x" title="Quitar dulce">✕</button>
    `;

    // Quitar al tocar la X
    el.querySelector('.candy-remove-x')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeItemFromBox(item.id);
    });

    // Habilitar arrastre libre dentro de la caja
    this.enableDragOnPlacedItem(el, item);

    this.boxInteriorEl.appendChild(el);
    this.updateBoxCountBadge();
  }

  /**
   * Quita un dulce de la caja
   */
  private removeItemFromBox(itemId: string): void {
    soundManager.playClick();
    this.placedItems = this.placedItems.filter(i => i.id !== itemId);
    const el = this.boxInteriorEl?.querySelector(`#placed_${itemId}`);
    if (el) {
      el.classList.add('removing-puff');
      setTimeout(() => el.remove(), 200);
    }
    this.updateBoxCountBadge();

    if (this.placedItems.length === 0) {
      const emptyHint = this.element.querySelector('#box-empty-hint') as HTMLElement;
      if (emptyHint) emptyHint.style.display = 'flex';
      this.updateArcoritoBubble('Caja vacía. Podés empezar agregando un Bon o Bon o Chocolinas.');
    }
  }

  /**
   * Vacía toda la caja
   */
  private clearBox(): void {
    this.placedItems = [];
    if (this.boxInteriorEl) {
      const items = this.boxInteriorEl.querySelectorAll('.placed-box-item');
      items.forEach(i => i.remove());
    }
    const emptyHint = this.element.querySelector('#box-empty-hint') as HTMLElement;
    if (emptyHint) emptyHint.style.display = 'flex';
    this.updateBoxCountBadge();
    this.updateArcoritoBubble('Caja vaciada. ¡Vamos a armar una nueva combinación!');
  }

  /**
   * Habilita reposicionamiento táctil y por puntero
   */
  private enableDragOnPlacedItem(el: HTMLElement, item: PlacedBoxProduct): void {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = item.xPercent;
    let initialY = item.yPercent;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).classList.contains('candy-remove-x')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = item.xPercent;
      initialY = item.yPercent;
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-dragging');
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !this.boxInteriorEl) return;
      const rect = this.boxInteriorEl.getBoundingClientRect();
      const deltaXPct = ((e.clientX - startX) / rect.width) * 100;
      const deltaYPct = ((e.clientY - startY) / rect.height) * 100;

      item.xPercent = Math.max(12, Math.min(88, initialX + deltaXPct));
      item.yPercent = Math.max(15, Math.min(85, initialY + deltaYPct));

      el.style.left = `${item.xPercent}%`;
      el.style.top = `${item.yPercent}%`;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      el.classList.remove('is-dragging');
      try { el.releasePointerCapture(e.pointerId); } catch {}
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
  }

  /**
   * Renderiza los diseños de caja (Caja Azul Confeti, Madera Arroyito, Oro 75 Años, etc.)
   */
  private renderDesigns(root: HTMLElement): void {
    const grid = root.querySelector('#bb-designs-row');
    if (!grid) return;
    grid.innerHTML = '';

    BOX_DESIGNS_CATALOG.forEach(box => {
      const isSel = box.id === this.selectedDesign.id;
      const status = customizationManager.isBoxDesignUnlocked(box);

      const btn = document.createElement('button');
      btn.className = `box-skin-card interactive ${isSel ? 'selected' : ''} ${!status.isUnlocked ? 'is-locked' : ''}`;
      btn.innerHTML = `
        <div class="skin-swatch" style="background: ${box.bgGradient}; border-color: ${box.borderColor};">
          <span class="swatch-ico">🎁</span>
        </div>
        <span class="skin-name">${box.name}</span>
        ${!status.isUnlocked ? `<span class="skin-lock">🔒</span>` : ''}
      `;

      btn.addEventListener('click', () => {
        if (!status.isUnlocked) {
          soundManager.playLose();
          alert(`🔒 Caja Bloqueada:\n${status.requirementText}`);
          return;
        }
        soundManager.playClick();
        this.selectedDesign = box;
        grid.querySelectorAll('.box-skin-card').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Actualizar visuales de la caja 3D
        const front = this.element.querySelector('#box-face-front') as HTMLElement;
        const lid = this.element.querySelector('#box-open-lid') as HTMLElement;
        if (front) front.style.background = box.bgGradient;
        if (lid) lid.style.background = box.bgGradient;
      });

      grid.appendChild(btn);
    });
  }

  /**
   * Renderiza las temáticas (Cumpleaños, Fiestas, Día del Amigo, etc.)
   */
  private renderThemes(root: HTMLElement): void {
    const grid = root.querySelector('#bb-themes-row');
    if (!grid) return;
    grid.innerHTML = '';

    BOX_THEMES_CATALOG.forEach(theme => {
      const isSel = theme.id === this.selectedTheme.id;
      const btn = document.createElement('button');
      btn.className = `theme-pill-chip interactive ${isSel ? 'selected' : ''}`;
      btn.innerHTML = `<span class="t-ico">${theme.icon}</span> <span class="t-name">${theme.name}</span>`;

      btn.addEventListener('click', () => {
        soundManager.playClick();
        this.selectedTheme = theme;
        grid.querySelectorAll('.theme-pill-chip').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Actualizar mensaje de dedicatoria
        const msgArea = this.element.querySelector<HTMLTextAreaElement>('#input-box-msg');
        if (msgArea) {
          msgArea.value = theme.defaultDedication;
          this.dedicationText = theme.defaultDedication;
          if (this.insideDedicationPlaqueEl) {
            this.insideDedicationPlaqueEl.textContent = `"${theme.defaultDedication}"`;
          }
        }
      });

      grid.appendChild(btn);
    });
  }

  /**
   * Renderiza los moños de raso
   */
  private renderRibbons(root: HTMLElement): void {
    const row = root.querySelector('#bb-ribbons-row');
    if (!row) return;
    row.innerHTML = '';

    const ribbons: { id: RibbonColor; name: string; hex: string; icon: string }[] = [
      { id: 'azul', name: 'Azul Seda', hex: '#1e40af', icon: '🎀' },
      { id: 'dorado', name: 'Oro Real', hex: '#ffd700', icon: '🎀' },
      { id: 'rojo', name: 'Rojo Pasión', hex: '#dc2626', icon: '🎀' },
      { id: 'verde', name: 'Verde Menta', hex: '#16a34a', icon: '🎀' },
      { id: 'rosa', name: 'Rosa Pastel', hex: '#ec4899', icon: '🎀' }
    ];

    ribbons.forEach(r => {
      const isSel = r.id === this.selectedRibbon;
      const btn = document.createElement('button');
      btn.className = `ribbon-swatch-chip interactive ${isSel ? 'selected' : ''}`;
      btn.style.background = r.hex;
      btn.title = r.name;
      btn.innerHTML = `<span>${r.icon}</span>`;

      btn.addEventListener('click', () => {
        soundManager.playClick();
        this.selectedRibbon = r.id;
        row.querySelectorAll('.ribbon-swatch-chip').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const decor = this.element.querySelector('#draped-ribbon-decor');
        if (decor) {
          decor.className = `draped-ribbon-decor ribbon-${r.id}`;
        }
      });

      row.appendChild(btn);
    });
  }

  /**
   * Renderiza charms y stickers adicionales
   */
  private renderCharms(root: HTMLElement): void {
    const row = root.querySelector('#bb-charms-row');
    row?.querySelectorAll('.charm-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playClick();
        btn.classList.toggle('selected');
        const charm = btn.getAttribute('data-charm') || '✨';
        this.addCharmToBox(charm);
      });
    });
  }

  private addCharmToBox(charm: string): void {
    this.addItemToBox({
      id: `charm_${Date.now()}`,
      type: 'charm',
      name: 'Adorno Especial',
      icon: charm,
      xPercent: 50 + (Math.random() - 0.5) * 20,
      yPercent: 30 + (Math.random() - 0.5) * 15,
      rotationDeg: (Math.random() - 0.5) * 25
    });
  }

  /**
   * Conecta los campos de texto
   */
  private bindDedicationInputs(root: HTMLElement): void {
    const toInput = root.querySelector<HTMLInputElement>('#input-box-to');
    const fromInput = root.querySelector<HTMLInputElement>('#input-box-from');
    const msgInput = root.querySelector<HTMLTextAreaElement>('#input-box-msg');

    const updateDedicationPlaque = () => {
      if (this.insideDedicationPlaqueEl) {
        if (this.toPerson && this.toPerson !== 'Alguien Muy Especial') {
          this.insideDedicationPlaqueEl.textContent = `"${this.dedicationText}" - Para: ${this.toPerson}`;
        } else {
          this.insideDedicationPlaqueEl.textContent = `"${this.dedicationText}"`;
        }
      }
    };

    toInput?.addEventListener('input', () => {
      this.toPerson = toInput.value || 'Alguien Muy Especial';
      updateDedicationPlaque();
    });

    fromInput?.addEventListener('input', () => {
      this.fromPerson = fromInput.value || 'Yo';
      updateDedicationPlaque();
    });

    msgInput?.addEventListener('input', () => {
      this.dedicationText = msgInput.value || 'Un mundo más dulce para vos ♡';
      updateDedicationPlaque();
    });
  }

  private updateBoxCountBadge(): void {
    if (this.boxCountBadgeEl) {
      this.boxCountBadgeEl.innerHTML = `<span class="counter-ico">🍪</span> <span class="counter-val">${this.placedItems.length} / 12 Golosinas</span>`;
    }
  }

  private updateArcoritoBubble(msg: string): void {
    if (this.arcoritoBubbleEl) {
      this.arcoritoBubbleEl.textContent = msg;
    }
  }

  /**
   * INICIO DE LA SECUENCIA DE CELEBRACIÓN Y CIERRE (ANIMADA, ELEGANTE & JERÁRQUICA)
   */
  private handleCloseAndFinishBox(): void {
    if (this.isFinishing) return;

    if (this.placedItems.length === 0) {
      soundManager.playLose();
      alert('¡Agregá al menos una golosina a la caja antes de cerrarla!');
      return;
    }

    this.startCelebrationSequence();
  }

  /**
   * Secuencia completa de finalización
   */
  private startCelebrationSequence(): void {
    if (this.isFinishing && this.lastSavedBox) return;
    this.isFinishing = true;

    // Accesibilidad: si el usuario tiene animaciones reducidas, saltar cinemática
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      this.finishBoxImmediately();
      return;
    }

    // ------------------------------------------------------------------------
    // FASE 1: FINALIZACIÓN DE LA CAJA (Detener interacción, bounce y brillos)
    // ------------------------------------------------------------------------
    const workspace = this.element.querySelector('#box-workspace') as HTMLElement;
    workspace?.classList.add('is-finishing-sequence');

    const scene = this.element.querySelector('#box-3d-scene') as HTMLElement;
    scene?.classList.add('box-satisfaction-bounce');

    if (this.boxInteriorEl) {
      const items = this.boxInteriorEl.querySelectorAll('.placed-box-item');
      items.forEach((itemEl, idx) => {
        setTimeout(() => {
          itemEl.classList.add('candies-gleam-pulse');
        }, idx * 35);
      });
    }

    if (this.boxCountBadgeEl) {
      this.boxCountBadgeEl.classList.add('counter-celebration-pulse');
      this.boxCountBadgeEl.innerHTML = `<span class="counter-ico">✨</span> <span class="counter-val">${this.placedItems.length} / 12 ¡Regalo Listo!</span>`;
    }

    soundManager.playCoin();
    this.updateArcoritoBubble('¡La caja está lista! ¡Comienza la celebración!');

    // ------------------------------------------------------------------------
    // FASE 2: EXPLOSIÓN DE CELEBRACIÓN (Confeti dorado, estrellitas, corazones)
    // ------------------------------------------------------------------------
    setTimeout(() => {
      soundManager.playMagicSparkle();
      this.fireCelebrationExplosion();
    }, 380);

    // ------------------------------------------------------------------------
    // FASE 3: CIERRE FÍSICO DE LA CAJA (Tapa descendente, destello y presencia)
    // ------------------------------------------------------------------------
    setTimeout(() => {
      this.executeLidCloseAnimation();
    }, 1180);

    // ------------------------------------------------------------------------
    // FASE 4: TRANSICIÓN A LA PANTALLA FINAL (Fade + scale suave hacia vitrina)
    // ------------------------------------------------------------------------
    setTimeout(() => {
      this.transitionToFinalCeremonyView();
    }, 1980);
  }

  /**
   * Finalización instantánea para modo accesibilidad (prefers-reduced-motion)
   */
  private finishBoxImmediately(): void {
    let saved: any;
    try {
      saved = customizationManager.saveGiftBox({
        boxDesignId: this.selectedDesign.id,
        themeId: this.selectedTheme.id,
        toPerson: this.toPerson,
        fromPerson: this.fromPerson,
        dedicationMessage: this.dedicationText,
        ribbonColor: this.selectedRibbon,
        placedProducts: [...this.placedItems]
      });
    } catch (err: any) {
      alert(err?.message || 'Error: no se pudo guardar la caja de regalo.');
      return;
    }

    this.lastSavedBox = saved;
    achievementsManager.checkAll();

    if (this.builderViewEl) this.builderViewEl.style.display = 'none';
    if (this.closedBoxViewEl) this.closedBoxViewEl.style.display = 'flex';

    this.runFinalScreenSequence(saved);
    if (this.onBoxSaved) this.onBoxSaved(saved);
  }

  /**
   * FASE 2: Explosión radial de confeti dorado, chispas, estrellitas y corazones
   */
  private fireCelebrationExplosion(): void {
    const canvas = this.element.querySelector<HTMLCanvasElement>('#box-celebration-canvas');
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    if (this.celebrationRafId) {
      cancelAnimationFrame(this.celebrationRafId);
      this.celebrationRafId = null;
    }

    const originX = rect.width * 0.5;
    const originY = rect.height * 0.44;

    const colors = [
      '#ffd700', '#f59e0b', '#fff8db', '#fde047',
      '#e5a93b', '#dc2626', '#b91c1c', '#4a2810', '#ffffff'
    ];
    const kinds: Array<'rect' | 'star' | 'heart' | 'sparkle' | 'streamer' | 'candy'> = [
      'rect', 'rect', 'star', 'heart', 'sparkle', 'streamer', 'candy'
    ];
    const candyEmojis = ['🍬', '🍫', '✨', '🍯', '🍪'];

    const particles: CelebrationParticle[] = [];
    const particleCount = 110;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.5 + Math.random() * 8.5;
      const kind = kinds[Math.floor(Math.random() * kinds.length)];

      particles.push({
        x: originX + (Math.random() - 0.5) * 20,
        y: originY + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 2.8),
        size: kind === 'candy' ? (12 + Math.random() * 8) : kind === 'streamer' ? (14 + Math.random() * 10) : (5 + Math.random() * 8),
        color: colors[Math.floor(Math.random() * colors.length)],
        kind,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.18,
        rot3d: Math.random() * Math.PI * 2,
        vRot3d: (Math.random() - 0.5) * 0.22,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.014,
        swaySpeed: 2 + Math.random() * 3,
        swayOffset: Math.random() * Math.PI * 2,
        candyChar: kind === 'candy' ? candyEmojis[Math.floor(Math.random() * candyEmojis.length)] : undefined
      });
    }

    const startTime = performance.now();

    const renderLoop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, rect.width, rect.height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0.01) continue;
        aliveCount++;

        // Física suave: drag + caída amortiguada + balanceo
        p.vx *= 0.96;
        p.vy += 0.22;
        p.x += p.vx + Math.sin(elapsed * p.swaySpeed + p.swayOffset) * 0.6;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.rot3d += p.vRot3d;
        p.alpha = Math.max(0, p.alpha - p.decay);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.kind === 'rect') {
          const scaleX = Math.cos(p.rot3d);
          ctx.scale(scaleX, 1);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size * 0.6, p.size, p.size * 1.2);
        } else if (p.kind === 'star') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          const s = p.size;
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        } else if (p.kind === 'heart') {
          ctx.fillStyle = p.color;
          const s = p.size * 0.7;
          ctx.beginPath();
          ctx.moveTo(0, s * 0.3);
          ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.2, s * 0.5, 0, s * 1.3);
          ctx.bezierCurveTo(s * 1.2, s * 0.5, s, -s * 0.5, 0, s * 0.3);
          ctx.fill();
        } else if (p.kind === 'sparkle') {
          const rad = p.size * 0.6;
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, p.color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, rad, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'streamer') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.bezierCurveTo(-p.size * 0.5, -p.size * 0.4, p.size * 0.5, p.size * 0.4, p.size, 0);
          ctx.stroke();
        } else if (p.kind === 'candy' && p.candyChar) {
          ctx.font = `${Math.round(p.size)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.candyChar, 0, 0);
        }

        ctx.restore();
      }

      if (aliveCount > 0 && elapsed < 1.6) {
        this.celebrationRafId = requestAnimationFrame(renderLoop);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
        this.celebrationRafId = null;
      }
    };

    this.celebrationRafId = requestAnimationFrame(renderLoop);
  }

  /**
   * FASE 3: Cierre físico satisfactorio de la tapa
   */
  private executeLidCloseAnimation(): void {
    const flap = this.element.querySelector('#cinematic-box-lid-flap') as HTMLElement;
    const lidSurface = this.element.querySelector('#lid-texture-surface') as HTMLElement;
    const stripe = this.element.querySelector('#lid-ribbon-stripe') as HTMLElement;
    const flash = this.element.querySelector('#lid-sealed-flash') as HTMLElement;
    const scene = this.element.querySelector('#box-3d-scene') as HTMLElement;

    if (lidSurface) {
      lidSurface.style.background = this.selectedDesign.bgGradient;
      lidSurface.style.borderColor = this.selectedDesign.borderColor;
    }
    if (stripe) {
      stripe.className = `lid-ribbon-stripe ribbon-${this.selectedRibbon}`;
    }

    if (flap) {
      flap.style.display = 'block';
      flap.classList.add('lid-descend-close');
    }

    // Momento del impacto físico del cierre (500ms tras inicio del descenso)
    setTimeout(() => {
      soundManager.playBoxSnap();
      if (flash) {
        flash.classList.add('flash-active');
        setTimeout(() => flash.classList.remove('flash-active'), 500);
      }
      if (scene) {
        scene.classList.add('box-sealed-zoom');
      }
    }, 500);
  }

  /**
   * FASE 4: Transición elegante hacia la vitrina ceremonial
   */
  private transitionToFinalCeremonyView(): void {
    // 1. Guardar caja en el gestor y almacenamiento local
    let saved: any;
    try {
      saved = customizationManager.saveGiftBox({
        boxDesignId: this.selectedDesign.id,
        themeId: this.selectedTheme.id,
        toPerson: this.toPerson,
        fromPerson: this.fromPerson,
        dedicationMessage: this.dedicationText,
        ribbonColor: this.selectedRibbon,
        placedProducts: [...this.placedItems]
      });
    } catch (err: any) {
      alert(err?.message || 'Error: no se pudo guardar la caja de regalo.');
      return;
    }

    this.lastSavedBox = saved;
    achievementsManager.checkAll();

    // 2. Transición visual elegante
    if (this.builderViewEl) {
      this.builderViewEl.classList.add('workshop-fade-exit');
      setTimeout(() => {
        if (this.builderViewEl) this.builderViewEl.style.display = 'none';
        if (this.closedBoxViewEl) {
          this.closedBoxViewEl.style.display = 'flex';
          this.closedBoxViewEl.classList.add('ceremony-enter-anim');
          this.runFinalScreenSequence(saved);
        }
      }, 380);
    } else {
      if (this.closedBoxViewEl) {
        this.closedBoxViewEl.style.display = 'flex';
        this.runFinalScreenSequence(saved);
      }
    }

    if (this.onBoxSaved) {
      this.onBoxSaved(saved);
    }
  }

  /**
   * FASE 5: Animación jerárquica de la pantalla final y revelación progresiva de la dedicatoria
   */
  private runFinalScreenSequence(saved: GiftBox): void {
    soundManager.playFanfare();

    // 1. Configurar caja terminada con packaging y moño
    const finLid = this.element.querySelector('#finished-box-lid-3d') as HTMLElement;
    if (finLid) {
      finLid.style.background = this.selectedDesign.bgGradient;
    }

    const ribbonBands = this.element.querySelector('#fin-ribbon-bands') as HTMLElement;
    if (ribbonBands) {
      ribbonBands.className = `finished-ribbon-bands ribbon-${this.selectedRibbon}`;
    }

    // Activar respiración natural del moño
    const finBow = this.element.querySelector('#fin-bow') as HTMLElement;
    finBow?.classList.add('fin-bow-natural-sway');

    // Tarjeta de dedicatoria
    const tagCard = this.element.querySelector('#gift-hanging-tag') as HTMLElement;
    const tagFor = this.element.querySelector('#tag-for-person') as HTMLElement;
    const tagMsg = this.element.querySelector('#tag-message-body') as HTMLElement;
    const tagFrom = this.element.querySelector('#tag-from-person') as HTMLElement;

    if (tagFor) {
      tagFor.textContent = `Para: ${saved.toPerson}`;
      tagFor.classList.remove('tag-line-revealed');
    }
    if (tagMsg) {
      tagMsg.textContent = `"${saved.dedicationMessage}"`;
      tagMsg.classList.remove('tag-line-revealed');
    }
    if (tagFrom) {
      tagFrom.textContent = `Con cariño, ${saved.fromPerson} ♡`;
      tagFrom.classList.remove('tag-line-revealed');
    }

    // Iniciar partículas de ambiente flotante continuo
    this.startAmbientFloatingDust();

    // T=0ms: Entrada de la caja con scale y glow
    const boxCard = this.element.querySelector('#finished-box-card') as HTMLElement;
    boxCard?.classList.add('box-card-enter-anim');

    // T=350ms: Tarjeta cuelga y entra con leve vaivén
    setTimeout(() => {
      tagCard?.classList.add('tag-unfurl-anim');
    }, 350);

    // T=700ms: Revelación línea "Para: ..."
    setTimeout(() => {
      tagFor?.classList.add('tag-line-revealed');
    }, 700);

    // T=1150ms: Revelación del mensaje de dedicatoria
    setTimeout(() => {
      tagMsg?.classList.add('tag-line-revealed');
    }, 1150);

    // T=1600ms: Revelación línea "Con cariño, Yo ♡"
    setTimeout(() => {
      tagFrom?.classList.add('tag-line-revealed');
    }, 1600);

    // T=1900ms: Título y subtítulo oficial
    const celebrationText = this.element.querySelector('#ceremony-celebration-text') as HTMLElement;
    setTimeout(() => {
      celebrationText?.classList.add('celebration-text-revealed');
    }, 1900);

    // T=2100ms: Fila de acciones con botones
    const actionsRow = this.element.querySelector('#ceremony-actions-row') as HTMLElement;
    setTimeout(() => {
      actionsRow?.classList.add('actions-row-revealed');
      this.isFinishing = false;
    }, 2100);
  }

  /**
   * Partículas sutiles de polvo de hadas continuo en la pantalla ceremonial
   */
  private startAmbientFloatingDust(): void {
    const container = this.element.querySelector('#ceremony-confetti-layer') as HTMLElement;
    if (!container) return;
    container.innerHTML = '';

    const chars = ['✨', '🌟', '♡', '★', '✨', '💛', '✨'];
    const colors = ['#ffd700', '#f59e0b', '#fff8db', '#fde047', '#ff80ab'];

    for (let i = 0; i < 18; i++) {
      const p = document.createElement('span');
      p.className = 'ceremony-ambient-particle';
      p.textContent = chars[i % chars.length];
      p.style.left = `${5 + Math.random() * 90}%`;
      p.style.top = `${60 + Math.random() * 35}%`;
      p.style.color = colors[i % colors.length];
      p.style.fontSize = `${10 + Math.random() * 12}px`;
      p.style.animationDelay = `${(Math.random() * 4).toFixed(1)}s`;
      p.style.animationDuration = `${(5.5 + Math.random() * 3.5).toFixed(1)}s`;
      container.appendChild(p);
    }
  }

  /**
   * COMPARTIR EL REGALO (Web Share API + Enlace interactivo animado)
   */
  private handleShareGiftBox(): void {
    soundManager.playClick();
    const box = this.lastSavedBox || {
      id: `box_${Date.now()}`,
      boxDesignId: this.selectedDesign.id,
      themeId: this.selectedTheme.id,
      toPerson: this.toPerson,
      fromPerson: this.fromPerson,
      dedicationMessage: this.dedicationText,
      ribbonColor: this.selectedRibbon,
      placedProducts: [...this.placedItems],
      createdAt: Date.now()
    };

    const payload = {
      id: box.id,
      t: box.toPerson,
      f: box.fromPerson,
      m: box.dedicationMessage,
      d: box.boxDesignId,
      th: box.themeId,
      r: box.ribbonColor,
      p: box.placedProducts.map(p => ({
        t: p.type,
        n: p.name,
        i: p.icon,
        x: Math.round(p.xPercent),
        y: Math.round(p.yPercent),
        r: Math.round(p.rotationDeg)
      }))
    };

    try {
      const jsonStr = JSON.stringify(payload);
      const bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const shareUrl = `${window.location.origin}${window.location.pathname}#box=${encodeURIComponent(base64)}`;

      const shareText = `¡Hola ${box.toPerson}! Te preparé una caja especial de golosinas Arcor con una dedicatoria personalizada: "${box.dedicationMessage}". Podés verla animada acá:`;

      // Copiar siempre al portapapeles
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).catch(() => {});
      }

      // Si Web Share API está disponible (móviles / navegadores soportados)
      if (navigator.share) {
        navigator.share({
          title: `🎁 ¡Caja de Regalo Arcor para ${box.toPerson}!`,
          text: shareText,
          url: shareUrl
        }).catch((err) => {
          if (err.name !== 'AbortError') {
            this.showShareToast(shareUrl, box.toPerson, shareText);
          }
        });
      } else {
        this.showShareToast(shareUrl, box.toPerson, shareText);
      }
    } catch (e) {
      console.error('Error al generar enlace de compartir:', e);
      alert('¡Regalo listo! Podés guardarlo en tu colección.');
    }
  }

  private showShareToast(shareUrl: string, toName: string, shareText: string): void {
    const toast = this.element.querySelector('#gift-share-toast') as HTMLElement;
    if (!toast) return;

    const waBtn = toast.querySelector<HTMLAnchorElement>('#toast-share-wa');
    if (waBtn) {
      const waMsg = `${shareText}\n${shareUrl}`;
      waBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`;
    }

    const copyBtn = toast.querySelector<HTMLButtonElement>('#toast-share-copy');
    if (copyBtn) {
      copyBtn.textContent = '📋 Copiar de nuevo';
      copyBtn.onclick = () => {
        soundManager.playClick();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareUrl);
          copyBtn.textContent = '✓ ¡Copiado!';
          setTimeout(() => {
            copyBtn.textContent = '📋 Copiar de nuevo';
          }, 2000);
        }
      };
    }

    const closeBtn = toast.querySelector<HTMLButtonElement>('#toast-share-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        toast.style.display = 'none';
      };
    }

    const titleEl = toast.querySelector('.toast-title');
    if (titleEl) {
      titleEl.textContent = `¡Enlace de regalo para ${toName} copiado!`;
    }

    toast.style.display = 'block';

    setTimeout(() => {
      if (toast.style.display === 'block') {
        toast.style.display = 'none';
      }
    }, 9000);
  }

  /**
   * Muestra una caja obsequio recibida mediante enlace compartido
   */
  public showSharedBox(shared: any): void {
    const valid = sanitizeSharedGiftBox(shared) || {
      t: 'Alguien Muy Especial',
      f: 'Yo',
      m: 'Un mundo más dulce para vos ♡',
      r: 'dorado',
      d: 'dorada_lujo',
      th: 'aniversario',
      p: []
    };

    this.resetBuilder();

    this.toPerson = valid.t;
    this.fromPerson = valid.f;
    this.dedicationText = valid.m;
    this.selectedRibbon = valid.r as RibbonColor;

    const design = BOX_DESIGNS_CATALOG.find(d => d.id === valid.d) || BOX_DESIGNS_CATALOG[0];
    this.selectedDesign = design;

    const theme = BOX_THEMES_CATALOG.find(t => t.id === valid.th) || BOX_THEMES_CATALOG[0];
    this.selectedTheme = theme;

    this.placedItems = valid.p.map((p, idx) => {
      const def = CATALOG_CANDIES.find(c => c.type === p.type) || CATALOG_CANDIES[0];
      return {
        id: `item_${Date.now()}_${idx}`,
        type: def.type,
        name: def.name,
        icon: def.icon,
        xPercent: p.x,
        yPercent: p.y,
        rotationDeg: p.r
      };
    });

    if (this.builderViewEl) this.builderViewEl.style.display = 'none';
    if (this.closedBoxViewEl) this.closedBoxViewEl.style.display = 'flex';

    const banner = this.element.querySelector('#shared-gift-banner') as HTMLElement;
    if (banner) banner.style.display = 'flex';

    this.element.style.display = 'flex';

    const mockSaved: GiftBox = {
      id: shared.id || `box_${Date.now()}`,
      boxDesignId: design.id,
      themeId: theme.id,
      toPerson: this.toPerson,
      fromPerson: this.fromPerson,
      dedicationMessage: this.dedicationText,
      ribbonColor: this.selectedRibbon,
      placedProducts: [...this.placedItems],
      createdAt: Date.now()
    };

    this.lastSavedBox = mockSaved;
    this.runFinalScreenSequence(mockSaved);
  }

  private resetBuilder(): void {
    this.isFinishing = false;
    if (this.celebrationRafId) {
      cancelAnimationFrame(this.celebrationRafId);
      this.celebrationRafId = null;
    }

    const canvas = this.element.querySelector<HTMLCanvasElement>('#box-celebration-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    const scene = this.element.querySelector('#box-3d-scene');
    scene?.classList.remove('box-satisfaction-bounce', 'box-sealed-zoom', 'closing-cinematic-zoom');

    const workspace = this.element.querySelector('#box-workspace');
    workspace?.classList.remove('is-finishing-sequence', 'workshop-fade-exit');

    const flap = this.element.querySelector('#cinematic-box-lid-flap') as HTMLElement;
    if (flap) {
      flap.style.display = 'none';
      flap.classList.remove('lid-descend-close');
    }

    const flash = this.element.querySelector('#lid-sealed-flash');
    flash?.classList.remove('flash-active');

    const banner = this.element.querySelector('#shared-gift-banner') as HTMLElement;
    if (banner) banner.style.display = 'none';

    const toast = this.element.querySelector('#gift-share-toast') as HTMLElement;
    if (toast) toast.style.display = 'none';

    const confettiLayer = this.element.querySelector('#ceremony-confetti-layer') as HTMLElement;
    if (confettiLayer) confettiLayer.innerHTML = '';

    const boxCard = this.element.querySelector('#finished-box-card');
    boxCard?.classList.remove('box-card-enter-anim');

    const tagCard = this.element.querySelector('#gift-hanging-tag');
    tagCard?.classList.remove('tag-unfurl-anim');

    const celebrationText = this.element.querySelector('#ceremony-celebration-text');
    celebrationText?.classList.remove('celebration-text-revealed');

    const actionsRow = this.element.querySelector('#ceremony-actions-row');
    actionsRow?.classList.remove('actions-row-revealed');

    if (this.boxCountBadgeEl) {
      this.boxCountBadgeEl.classList.remove('counter-celebration-pulse');
    }

    if (this.builderViewEl) {
      this.builderViewEl.style.display = 'grid';
    }
    if (this.closedBoxViewEl) {
      this.closedBoxViewEl.style.display = 'none';
    }

    this.clearBox();
    this.renderCatalogGrid(this.element);
  }

  public show(): void {
    this.resetBuilder();
    this.element.style.display = 'flex';
  }

  public showWithSpecificProduct(prod: CustomProduct): void {
    this.show();
    this.addItemToBox({
      id: `custom_${prod.id}_${Date.now()}`,
      type: `custom_${prod.id}`,
      name: prod.name,
      icon: '✨',
      xPercent: 50,
      yPercent: 50,
      rotationDeg: 0
    });
    this.updateArcoritoBubble(`¡Agregamos tu producto personalizado "${prod.name}" a la caja!`);
  }

  public hide(): void {
    this.element.style.display = 'none';
  }
}
