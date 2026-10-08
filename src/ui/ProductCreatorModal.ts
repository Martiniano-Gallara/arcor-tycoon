/**
 * PRODUCT CREATOR MODAL: "CREÁ TU PRODUCTO"
 * 
 * Taller creativo 3D de alta fidelidad con packaging interactivo:
 * - Escenario con podio dorado, aros de neón y fondo de estudio de chocolate.
 * - Envoltorio 3D con terminaciones crimp zigzag metálicas, logo oficial Arcor y sellos oficiales.
 * - Configuración lateral: Envases, Orbes de color glossy, Inputs y Sellos Arcor.
 * - Botón radiante de Finalizar Diseño y pantalla de celebración.
 */

import {
  customizationManager,
  PACKAGING_TYPES_INFO,
  COLOR_THEMES_CATALOG,
  STICKERS_CATALOG,
  ArcorBrandKey,
  PackagingType,
  CustomProduct
} from '../gameplay/CustomizationManager.ts';
import { achievementsManager } from '../gameplay/AchievementsManager.ts';
import { soundManager } from '../core/SoundManager.ts';
import { gameState } from '../gameplay/GameState.ts';
import { escapeHtml } from '../core/SecurityUtils.ts';

const PACKAGING_ORDER: PackagingType[] = [
  'tubo_confites',
  'pouch_doypack',
  'lata_vintage',
  'flow_pack',
  'tableta_chocolate',
  'caja_bombones'
];

export class ProductCreatorModal {
  public element: HTMLElement;

  // Estado del creador actual (configurado por defecto idéntico a la referencia del usuario)
  private selectedBrand: ArcorBrandKey = 'arcor';
  private selectedPackaging: PackagingType = 'tubo_confites';
  private selectedColorThemeId: string = 'mogul_rainbow'; // Magenta / Ruby
  private productName: string = 'Nueva Golosina Arcor';
  private productFlavor: string = 'Edición Artesanal de Fábrica';
  private selectedStickers: Set<string> = new Set(['st_75_anos', 'st_arroyito', 'st_sin_tacc']);
  private currentAngleDeg: number = 0;

  // Elementos de vista previa
  private previewWrapperEl: HTMLElement | null = null;
  private previewTitleEl: HTMLElement | null = null;
  private previewFlavorEl: HTMLElement | null = null;
  private previewStickersRowEl: HTMLElement | null = null;
  private previewFormatTextEl: HTMLElement | null = null;

  // Vistas
  private editorViewEl: HTMLElement | null = null;
  private readyViewEl: HTMLElement | null = null;
  private readyProductCardEl: HTMLElement | null = null;

  // Callbacks
  public onSaved?: (product: CustomProduct) => void;
  public onUseInGiftBox?: (product: CustomProduct) => void;
  public onOpenCollection?: () => void;
  public onClose?: () => void;

  constructor() {
    this.element = this.render();
    this.updateLivePreview();
    gameState.subscribe(() => {
      this.updateCoinsDisplay();
    });
  }

  private render(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'creator-modal-backdrop';
    backdrop.id = 'product-creator-modal';
    backdrop.style.display = 'none';

    backdrop.innerHTML = `
      <div class="box-builder-canvas">
        
        <!-- BARRA SUPERIOR: VOLVER + CARTEL + STEPPER + MONEDAS -->
        <header class="taller-top-header">
          <button class="taller-btn-volver interactive" id="creator-btn-close" title="Volver al juego">
            <span>← VOLVER</span>
          </button>

          <!-- Cartel Central -->
          <div class="taller-marquee-center">
            <div class="taller-ribbon-badge">★ TALLER CREATIVO ARCOR ★</div>
            <h1 class="taller-title-3d">CREÁ TU PRODUCTO</h1>
            <p class="taller-subtitle">Personalizá tu golosina favorita con packaging 3D exclusivo</p>
          </div>

          <!-- Stepper de Pasos -->
          <div class="taller-stepper-capsule" id="creator-stepper">
            <div class="taller-step-item active" data-step="1">
              <span class="step-circle">1</span>
              <span>Marca</span>
            </div>
            <div class="taller-step-item" data-step="2">
              <span class="step-circle">2</span>
              <span>Envase</span>
            </div>
            <div class="taller-step-item" data-step="3">
              <span class="step-circle">3</span>
              <span>Color</span>
            </div>
            <div class="taller-step-item" data-step="4">
              <span class="step-circle">4</span>
              <span>Detalles</span>
            </div>
            <div class="taller-step-item" data-step="5">
              <span class="step-circle">5</span>
              <span>Terminado</span>
            </div>
          </div>

          <!-- Monedas -->
          <div class="taller-coins-pill">
            <span class="coin-symbol">🪙</span>
            <span class="coin-val" id="taller-coins-display">$${(gameState.getData().money || 0).toLocaleString('es-AR')}</span>
          </div>
        </header>

        <!-- VISTA 1: EDITOR INTERACTIVO CON ESCENARIO HERO 3D -->
        <main class="taller-2col-layout" id="creator-workspace-grid">
          
          <!-- COLUMNA IZQUIERDA: HERO PACKAGING 3D SHOWCASE -->
          <section class="taller-stage-card">
            <!-- Banner Superior del Escenario -->
            <div class="taller-stage-top-badge">
              <span>★ PACKAGING 3D INTERACTIVO ★</span>
            </div>

            <!-- Fondo Escénico de Estudio con Podio Dorado y Aros de Neón -->
            <div class="taller-stage-viewport"></div>

            <!-- Flechas de navegación del carrusel (< y >) -->
            <button class="stage-carousel-nav-btn prev-btn interactive" id="btn-stage-prev" title="Envase anterior">‹</button>
            <button class="stage-carousel-nav-btn next-btn interactive" id="btn-stage-next" title="Siguiente envase">›</button>

            <!-- Escenario 3D Central con el Producto Flotante -->
            <div class="taller-product-3d-anchor" id="taller-product-3d-anchor">
              <div class="taller-wrapper-hero" id="packaging-live-preview" title="¡Tocá o arrastrá para interactuar!" style="max-width: 440px; width: 100%; position: relative;">
                <!-- Crimp dentado izquierdo -->
                <div class="wrapper-crimp-seal wrapper-crimp-left"></div>

                <!-- Cuerpo interior del envoltorio -->
                <div class="wrapper-inner-body" id="pkg-inner-body" style="max-width: 380px; width: 100%; position: relative;">
                  <!-- Capas de foil metálico y ondas de chocolate -->
                  <div class="wrapper-sheen-highlight"></div>
                  <div class="wrapper-metallic-sweep"></div>
                  <div class="wrapper-choco-ribbon-bg"></div>

                  <!-- Cubos de chocolate 3D decorativos en el envoltorio -->
                  <div class="wrapper-choco-cube-decor cube-left"></div>
                  <div class="wrapper-choco-cube-decor cube-right"></div>

                  <!-- Contenido Frontal del Envoltorio -->
                  <div class="wrapper-front-content">
                    <!-- Emblema Óvalo Arcor -->
                    <div class="pkg-brand-emblem-wrap">
                      <div class="pkg-arcor-oval-emblem">
                        <img src="./arcor_logo.png" alt="Arcor" class="pkg-arcor-logo-img" height="28" style="height: 28px; width: auto; max-height: 28px; object-fit: contain; display: block;" />
                      </div>
                      <div class="pkg-slogan-line">Le damos sabor al mundo</div>
                    </div>

                    <!-- Nombre y Sabor -->
                    <h3 class="pkg-hero-title" id="pkg-preview-name">Nueva Golosina Arcor</h3>
                    <p class="pkg-hero-flavor" id="pkg-preview-flavor">Edición Artesanal de Fábrica</p>

                    <!-- Sellos en el Wrapper -->
                    <div class="pkg-wrapper-badges-row" id="pkg-preview-stickers"></div>
                  </div>
                </div>

                <!-- Crimp dentado derecho -->
                <div class="wrapper-crimp-seal wrapper-crimp-right"></div>
              </div>
            </div>

            <!-- Controles Inferiores del Escenario -->
            <div class="taller-stage-bottom-bar">
              <!-- Puntos de Paginación (4 dots) -->
              <div class="taller-dots-row" id="stage-dots-row">
                <span class="taller-dot active" data-index="0"></span>
                <span class="taller-dot" data-index="1"></span>
                <span class="taller-dot" data-index="2"></span>
                <span class="taller-dot" data-index="3"></span>
              </div>

              <!-- Botones de Ángulo / Órbita -->
              <div class="taller-orbit-btns-row">
                <button class="taller-orbit-btn interactive" id="btn-rot-left">↺ Izq</button>
                <button class="taller-orbit-btn interactive" id="btn-rot-front">↔ Frente</button>
                <button class="taller-orbit-btn interactive" id="btn-rot-right">↻ Der</button>
              </div>

              <!-- Pill de Formato Actual -->
              <button class="taller-current-format-pill interactive" id="btn-format-tag" title="Cambiar formato">
                <span id="preview-format-text">✏️ Tubo Confitero Cristal</span>
              </button>
            </div>
          </section>

          <!-- COLUMNA DERECHA: PANEL DE CONFIGURACIÓN DEL PRODUCTO -->
          <aside class="taller-controls-card">
            
            <!-- 2. Tipo de Envase (Tarjetas en Fila) -->
            <div class="taller-panel-section">
              <div class="taller-sec-header">2. TIPO DE ENVASE</div>
              <div class="taller-packaging-cards-row" id="taller-packaging-row">
                <!-- Renderizado dinámico de las 3 tarjetas -->
              </div>
            </div>

            <!-- 3. Color & Acabado Glossy -->
            <div class="taller-panel-section">
              <div class="taller-sec-header">3. COLOR & ACABADO GLOSSY</div>
              <div class="taller-colors-swatches-row" id="taller-colors-row">
                <!-- Renderizado de los 6 orbes circulares -->
              </div>
            </div>

            <!-- 4. Nombre & Sabor -->
            <div class="taller-panel-section">
              <div class="taller-sec-header">4. NOMBRE & SABOR</div>
              <div class="taller-inputs-stack">
                <div class="taller-input-row">
                  <span class="taller-input-label">Nombre:</span>
                  <input type="text" id="input-prod-name" class="taller-text-input interactive" value="Nueva Golosina Arcor" maxlength="30" />
                </div>
                <div class="taller-input-row">
                  <span class="taller-input-label">Sabor:</span>
                  <input type="text" id="input-prod-flavor" class="taller-text-input interactive" value="Edición Artesanal de Fábrica" maxlength="42" />
                </div>
              </div>
            </div>

            <!-- 5. Sellos Oficiales Arcor -->
            <div class="taller-panel-section">
              <div class="taller-sec-header">5. SELLOS OFICIALES ARCOR</div>
              <div class="taller-badges-grid" id="taller-badges-grid">
                <!-- Renderizado dinámico de los 7 sellos -->
              </div>
            </div>

            <!-- Botón Grande de Finalizar Diseño -->
            <button class="btn-taller-finalizar interactive" id="btn-finish-product">
              <span>¡FINALIZAR DISEÑO! →</span>
            </button>

          </aside>
        </main>

        <!-- VISTA 2: ¡TU PRODUCTO ESTÁ LISTO! (FESTEJO CINEMÁTICO) -->
        <div class="box-closed-ceremony-view creator-ready-view" id="creator-ready-view" style="display: none;">
          <div class="ceremony-god-rays"></div>
          <div class="ceremony-confetti-layer" id="creator-confetti-layer"></div>

          <div class="closed-cinematic-stage">
            <div class="ready-hero-pedestal-scene">
              <div class="ready-showcase-box" id="ready-product-showcase"></div>
            </div>
          </div>

          <div class="ceremony-celebration-text">
            <h2 class="ceremony-title">¡TU PRODUCTO ESTÁ LISTO!</h2>
            <p class="ceremony-sub">
              Tu golosina exclusiva ha sido fabricada con éxito y forma parte del catálogo oficial.
            </p>
          </div>

          <!-- Acciones de Destino -->
          <div class="ceremony-actions-row">
            <button class="btn btn-primary btn-golden-capsule interactive" id="btn-ready-save-collection">
              <span>📦 Guardar en Mi Colección</span>
            </button>
            <button class="btn btn-secondary wood-pill-btn interactive" id="btn-ready-use-box">
              <span>🎁 Usar en Caja Obsequio</span>
            </button>
            <button class="btn btn-secondary wood-pill-btn interactive" id="btn-ready-create-another">
              <span>🔄 Crear Otra Golosina</span>
            </button>
          </div>
        </div>

      </div>
    `;

    // Cachear elementos de UI
    this.previewWrapperEl = backdrop.querySelector('#packaging-live-preview');
    this.previewTitleEl = backdrop.querySelector('#pkg-preview-name');
    this.previewFlavorEl = backdrop.querySelector('#pkg-preview-flavor');
    this.previewStickersRowEl = backdrop.querySelector('#pkg-preview-stickers');
    this.previewFormatTextEl = backdrop.querySelector('#preview-format-text');

    this.editorViewEl = backdrop.querySelector('#creator-workspace-grid');
    this.readyViewEl = backdrop.querySelector('#creator-ready-view');
    this.readyProductCardEl = backdrop.querySelector('#ready-product-showcase');

    // Inicializar secciones y selectores
    this.renderPackagingCards(backdrop);
    this.renderColorSwatches(backdrop);
    this.renderStickerBadges(backdrop);
    this.bindInputs(backdrop);
    this.bindEvents(backdrop);

    return backdrop;
  }

  /**
   * Renderiza las 3 tarjetas de packaging principales en la sección 2
   */
  private renderPackagingCards(root: HTMLElement): void {
    const container = root.querySelector('#taller-packaging-row');
    if (!container) return;
    container.innerHTML = '';

    // Mostramos las 3 tarjetas de la referencia: Tubo cristal, Doypack, Lata vintage
    const DISPLAY_PKGS: PackagingType[] = ['tubo_confites', 'pouch_doypack', 'lata_vintage'];

    DISPLAY_PKGS.forEach((pkgKey) => {
      const info = PACKAGING_TYPES_INFO[pkgKey];
      const isSelected = pkgKey === this.selectedPackaging;
      const status = customizationManager.isPackagingUnlocked(pkgKey);

      const card = document.createElement('div');
      card.className = `taller-pkg-card interactive ${isSelected ? 'selected' : ''} ${!status.isUnlocked ? 'locked' : ''}`;
      
      let iconDisplay = '';
      if (pkgKey === 'tubo_confites') {
        iconDisplay = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="transform: rotate(25deg);">
            <rect x="9" y="2" width="6" height="3" rx="1" fill="#ffd700" stroke="#b45309" stroke-width="0.8"/>
            <rect x="9" y="5" width="6" height="16" rx="3" stroke="#e0f2fe" stroke-width="1.8" fill="rgba(224, 242, 254, 0.25)"/>
            <circle cx="12" cy="9" r="1.6" fill="#f43f5e"/>
            <circle cx="12" cy="13" r="1.6" fill="#facc15"/>
            <circle cx="12" cy="17" r="1.6" fill="#38bdf8"/>
          </svg>
        `;
      } else if (pkgKey === 'pouch_doypack') {
        iconDisplay = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 7h12l-1.5 13H7.5L6 7z" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="1.8"/>
            <path d="M10 7V5a2 2 0 0 1 4 0v2" stroke="#38bdf8" stroke-width="1.8"/>
          </svg>
        `;
      } else {
        iconDisplay = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="7" width="16" height="13" rx="3" fill="rgba(244, 114, 182, 0.2)" stroke="#f472b6" stroke-width="1.8"/>
            <path d="M9 7V5a1.5 1.5 0 0 1 3-0.5A1.5 1.5 0 0 1 15 7" stroke="#f472b6" stroke-width="1.8"/>
            <circle cx="12" cy="13.5" r="2" fill="#ffd700"/>
          </svg>
        `;
      }

      card.innerHTML = `
        <span class="card-top-icon">${iconDisplay}</span>
        ${!status.isUnlocked ? '<span class="card-lock-label">🔒 Bloqueado</span>' : ''}
        <span class="card-title">${info.name}</span>
        <span class="card-desc">${!status.isUnlocked ? `Se desbloquea en Nivel ${info.requiredLevel || 9} de Arcor Crush` : info.description}</span>
      `;

      card.addEventListener('click', () => {
        if (!status.isUnlocked) {
          soundManager.playLose();
          alert(`🔒 Envase Bloqueado:\n${status.requirementText}`);
          return;
        }
        soundManager.playClick();
        this.selectedPackaging = pkgKey;
        container.querySelectorAll('.taller-pkg-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.setStep(2);
        this.updateLivePreview();
        this.triggerBounce();
      });

      container.appendChild(card);
    });
  }

  /**
   * Renderiza los 6 orbes circulares glossy de colores en la sección 3
   */
  private renderColorSwatches(root: HTMLElement): void {
    const container = root.querySelector('#taller-colors-row');
    if (!container) return;
    container.innerHTML = '';

    const ORB_GRADIENTS: Record<string, string> = {
      gold_75: 'radial-gradient(circle at 35% 30%, #fef08a 0%, #eab308 55%, #854d0e 100%)',
      bonobon_red: 'radial-gradient(circle at 35% 30%, #fca5a5 0%, #ef4444 55%, #7f1d1d 100%)',
      choco_gold: 'radial-gradient(circle at 35% 30%, #d7a47b 0%, #78350f 55%, #2e1005 100%)',
      mogul_rainbow: 'radial-gradient(circle at 35% 30%, #f472b6 0%, #db2777 55%, #700b39 100%)',
      bagley_blue: 'radial-gradient(circle at 35% 30%, #60a5fa 0%, #2563eb 55%, #172554 100%)',
      vintage_emerald: 'radial-gradient(circle at 35% 30%, #86efac 0%, #16a34a 55%, #14532d 100%)'
    };

    COLOR_THEMES_CATALOG.forEach((theme) => {
      const isSelected = theme.id === this.selectedColorThemeId;
      const status = customizationManager.isColorThemeUnlocked(theme);

      const orb = document.createElement('button');
      orb.className = `taller-color-orb interactive ${isSelected ? 'selected' : ''} ${!status.isUnlocked ? 'locked' : ''}`;
      orb.style.background = ORB_GRADIENTS[theme.id] || `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
      orb.title = theme.name;

      if (!status.isUnlocked) {
        orb.innerHTML = '<span class="orb-lock">🔒</span>';
      }

      orb.addEventListener('click', () => {
        if (!status.isUnlocked) {
          soundManager.playLose();
          alert(`🔒 Color Bloqueado:\n${status.requirementText}`);
          return;
        }
        soundManager.playClick();
        this.selectedColorThemeId = theme.id;
        container.querySelectorAll('.taller-color-orb').forEach(o => o.classList.remove('selected'));
        orb.classList.add('selected');
        this.setStep(3);
        this.updateLivePreview();
        this.triggerBounce();
      });

      container.appendChild(orb);
    });
  }

  /**
   * Renderiza los 7 sellos oficiales en la sección 5
   */
  private renderStickerBadges(root: HTMLElement): void {
    const container = root.querySelector('#taller-badges-grid');
    if (!container) return;
    container.innerHTML = '';

    STICKERS_CATALOG.forEach((st) => {
      const isSelected = this.selectedStickers.has(st.id);
      const status = customizationManager.isStickerUnlocked(st);

      const chip = document.createElement('button');

      // Determinar clase de color según el sello de la referencia
      let colorClass = 'badge-green';
      if (st.id === 'st_dulzura') colorClass = 'badge-magenta';
      else if (st.id === 'st_cacao_puro') colorClass = 'badge-brown';
      else if (!status.isUnlocked) colorClass = 'badge-locked';

      chip.className = `taller-badge-chip ${colorClass} interactive ${isSelected ? 'selected' : ''} ${!status.isUnlocked ? 'locked' : ''}`;
      
      const lockSuffix = !status.isUnlocked ? ' <span style="font-size: 0.72rem; opacity: 0.85;">🔒</span>' : '';
      chip.innerHTML = `<span>${st.icon}</span> <span>${st.label}</span>${lockSuffix}`;

      chip.addEventListener('click', () => {
        if (!status.isUnlocked) {
          soundManager.playLose();
          alert(`🔒 Sello Bloqueado:\n${status.requirementText}`);
          return;
        }
        soundManager.playClick();
        if (this.selectedStickers.has(st.id)) {
          this.selectedStickers.delete(st.id);
          chip.classList.remove('selected');
        } else {
          if (this.selectedStickers.size >= 4) {
            alert('Puedes incluir hasta 4 sellos en el packaging.');
            return;
          }
          this.selectedStickers.add(st.id);
          chip.classList.add('selected');
        }
        this.setStep(4);
        this.updateLivePreview();
        this.triggerBounce();
      });

      container.appendChild(chip);
    });
  }

  /**
   * Conecta los inputs de texto
   */
  private bindInputs(root: HTMLElement): void {
    const nameInput = root.querySelector<HTMLInputElement>('#input-prod-name');
    const flavorInput = root.querySelector<HTMLInputElement>('#input-prod-flavor');

    nameInput?.addEventListener('input', () => {
      this.productName = nameInput.value || 'Nueva Golosina Arcor';
      this.setStep(4);
      this.updateLivePreview();
    });

    flavorInput?.addEventListener('input', () => {
      this.productFlavor = flavorInput.value || 'Edición Artesanal de Fábrica';
      this.setStep(4);
      this.updateLivePreview();
    });
  }

  /**
   * Conecta eventos de navegación y órbita 3D
   */
  private bindEvents(root: HTMLElement): void {
    // Cerrar
    root.querySelector('#creator-btn-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    // Finalizar diseño
    root.querySelector('#btn-finish-product')?.addEventListener('click', () => {
      this.handleFinishProduct();
    });

    // Carrusel < y > del escenario
    root.querySelector('#btn-stage-prev')?.addEventListener('click', () => {
      soundManager.playClick();
      this.cyclePackaging(-1);
    });

    root.querySelector('#btn-stage-next')?.addEventListener('click', () => {
      soundManager.playClick();
      this.cyclePackaging(1);
    });

    // Botones de rotación 3D
    const wrapper = this.previewWrapperEl;
    root.querySelector('#btn-rot-left')?.addEventListener('click', () => {
      soundManager.playClick();
      this.currentAngleDeg = -24;
      if (wrapper) wrapper.style.transform = `perspective(1000px) rotateY(${this.currentAngleDeg}deg) rotateX(4deg)`;
      this.triggerBounce();
    });

    root.querySelector('#btn-rot-front')?.addEventListener('click', () => {
      soundManager.playClick();
      this.currentAngleDeg = 0;
      if (wrapper) wrapper.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
      this.triggerBounce();
    });

    root.querySelector('#btn-rot-right')?.addEventListener('click', () => {
      soundManager.playClick();
      this.currentAngleDeg = 24;
      if (wrapper) wrapper.style.transform = `perspective(1000px) rotateY(${this.currentAngleDeg}deg) rotateX(-4deg)`;
      this.triggerBounce();
    });

    // Click interactivo directo en el wrapper
    wrapper?.addEventListener('click', () => {
      soundManager.playCoin();
      this.triggerBounce();
    });

    // Pantalla de festejo
    root.querySelector('#btn-ready-save-collection')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
      if (this.onOpenCollection) {
        this.onOpenCollection();
      } else if (this.onClose) {
        this.onClose();
      }
    });

    root.querySelector('#btn-ready-create-another')?.addEventListener('click', () => {
      soundManager.playClick();
      this.resetToEditor();
    });

    root.querySelector('#btn-ready-use-box')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
      const last = customizationManager.getCustomProducts()[0];
      if (last && this.onUseInGiftBox) {
        this.onUseInGiftBox(last);
      }
    });
  }

  /**
   * Cambia el empaque usando las flechas o puntos
   */
  private cyclePackaging(delta: number): void {
    const currentIdx = PACKAGING_ORDER.indexOf(this.selectedPackaging);
    const nextIdx = (currentIdx + delta + PACKAGING_ORDER.length) % PACKAGING_ORDER.length;
    this.selectedPackaging = PACKAGING_ORDER[nextIdx];
    this.renderPackagingCards(this.element);
    this.updateLivePreview();
    this.triggerBounce();
  }

  /**
   * Actualiza el render visual de la maqueta en vivo
   */
  private updateLivePreview(): void {
    if (!this.previewWrapperEl) return;

    const theme = COLOR_THEMES_CATALOG.find(c => c.id === this.selectedColorThemeId) || COLOR_THEMES_CATALOG[3];
    const pkgInfo = PACKAGING_TYPES_INFO[this.selectedPackaging];

    // Gradiente dinámico de fondo del envoltorio
    const innerBody = (this.element || document).querySelector('#pkg-inner-body') as HTMLElement | null;
    if (innerBody) {
      innerBody.style.background = `radial-gradient(ellipse at 50% 35%, ${theme.primary} 0%, ${theme.secondary} 65%, #18050e 100%)`;
    }
    if (this.previewWrapperEl) {
      this.previewWrapperEl.style.boxShadow = `0 30px 85px rgba(0, 0, 0, 0.96), 0 0 50px ${theme.primary}66, inset 0 1px 3px rgba(255, 255, 255, 0.65)`;
    }

    // Títulos
    if (this.previewTitleEl) {
      this.previewTitleEl.textContent = this.productName;
    }
    if (this.previewFlavorEl) {
      this.previewFlavorEl.textContent = this.productFlavor;
    }

    // Sellos renderizados en el wrapper
    if (this.previewStickersRowEl) {
      this.previewStickersRowEl.innerHTML = '';
      this.selectedStickers.forEach(stId => {
        const s = STICKERS_CATALOG.find(x => x.id === stId);
        if (s) {
          const badge = document.createElement('span');
          badge.className = 'pkg-hero-badge-pill';
          badge.innerHTML = `<span class="b-icon">${s.icon}</span> <span>${s.label}</span>`;
          this.previewStickersRowEl?.appendChild(badge);
        }
      });
    }

    // Pill de formato actual
    if (this.previewFormatTextEl) {
      this.previewFormatTextEl.textContent = `✏️ ${pkgInfo.name}`;
    }

    // Sincronizar dots
    if (this.element) {
      const dots = this.element.querySelectorAll('#stage-dots-row .taller-dot');
      const dotIdx = Math.max(0, PACKAGING_ORDER.indexOf(this.selectedPackaging)) % 4;
      dots.forEach((d, idx) => {
        if (idx === dotIdx) d.classList.add('active');
        else d.classList.remove('active');
      });
    }
  }

  private triggerBounce(): void {
    if (!this.previewWrapperEl) return;
    this.previewWrapperEl.style.transform = `perspective(1000px) rotateY(${this.currentAngleDeg}deg) scale(1.04)`;
    setTimeout(() => {
      if (this.previewWrapperEl) {
        this.previewWrapperEl.style.transform = `perspective(1000px) rotateY(${this.currentAngleDeg}deg) scale(1)`;
      }
    }, 180);
  }

  private setStep(stepNum: number): void {
    if (!this.element) return;
    const steps = this.element.querySelectorAll('.taller-step-item');
    steps.forEach((s) => {
      const num = Number(s.getAttribute('data-step'));
      if (num === stepNum) s.classList.add('active');
      else s.classList.remove('active');
    });
  }

  private handleFinishProduct(): void {
    const sanitizedName = (this.productName || 'Nueva Golosina Arcor').trim().slice(0, 40).replace(/[<>&"']/g, '');
    const sanitizedFlavor = (this.productFlavor || 'Edición Artesanal de Fábrica').trim().slice(0, 80).replace(/[<>&"']/g, '');

    let saved: any;
    try {
      saved = customizationManager.saveCustomProduct({
        brand: this.selectedBrand,
        packaging: this.selectedPackaging,
        name: sanitizedName,
        flavorOrMessage: sanitizedFlavor,
        colorThemeId: this.selectedColorThemeId,
        selectedStickers: Array.from(this.selectedStickers)
      });
    } catch (err: any) {
      alert(err?.message || 'Error: no se pudo guardar la golosina.');
      return;
    }

    soundManager.playFanfare();
    achievementsManager.checkAll();

    if (this.readyProductCardEl) {
      const theme = COLOR_THEMES_CATALOG.find(c => c.id === saved.colorThemeId) || COLOR_THEMES_CATALOG[0];

      this.readyProductCardEl.innerHTML = `
        <div class="ready-product-item" style="background: linear-gradient(145deg, ${theme.primary} 0%, ${theme.secondary} 100%); border: 2px solid ${theme.accent};">
          <div class="ready-brand-tag" style="color: ${theme.accent};">ARCOR</div>
          <h3 class="ready-item-name" style="color: #ffffff;">${escapeHtml(saved.name)}</h3>
          <p class="ready-item-flavor">${escapeHtml(saved.flavorOrMessage)}</p>
          <div class="ready-item-stickers">
            ${saved.selectedStickers.map((stId: string) => {
              const s = STICKERS_CATALOG.find(x => x.id === stId);
              return s ? `<span class="mini-sticker">${s.icon} ${s.label}</span>` : '';
            }).join('')}
          </div>
          <span class="ready-timestamp">📅 Fabricado el ${new Date(saved.createdAt).toLocaleDateString()}</span>
        </div>
      `;
    }

    if (this.editorViewEl) this.editorViewEl.style.display = 'none';
    if (this.readyViewEl) {
      this.readyViewEl.style.display = 'flex';
      this.readyViewEl.classList.add('ready-animate-in');
    }

    if (this.onSaved) {
      this.onSaved(saved);
    }
  }

  private resetToEditor(): void {
    if (this.editorViewEl) this.editorViewEl.style.display = 'grid';
    if (this.readyViewEl) this.readyViewEl.style.display = 'none';
    this.updateLivePreview();
  }

  public updateCoinsDisplay(): void {
    const coinsDisplay = this.element.querySelector('#taller-coins-display');
    if (coinsDisplay) {
      const money = gameState.getData().money || 0;
      coinsDisplay.textContent = `$${money.toLocaleString('es-AR')}`;
    }
  }

  public show(): void {
    this.resetToEditor();
    this.updateCoinsDisplay();
    this.element.style.display = 'flex';
  }

  public hide(): void {
    this.element.style.display = 'none';
    if (this.onClose) {
      this.onClose();
    }
  }
}
