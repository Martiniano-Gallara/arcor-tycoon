/**
 * MY COLLECTION & ACHIEVEMENTS MODAL: "MI COLECCIÓN & LOGROS ARCOR"
 * 
 * Muestra todo el progreso acumulado del jugador:
 * 1. Pestaña "Mis Productos": Vitrina de golosinas y chocolates personalizados creados en el taller.
 * 2. Pestaña "Cajas Obsequio": Galería de cajas de regalo diseñadas e inspeccionables.
 * 3. Pestaña "Catálogo & Desbloqueos": Todos los elementos visuales (packagings, stickers, colores) con estado desbloqueado/bloqueado.
 * 4. Pestaña "Salón de Logros": 12 logros con medallas, barras de progreso y recompensas reclamables.
 * 
 * Barra de porcentaje global de avance de la colección.
 */

import {
  customizationManager,
  PACKAGING_TYPES_INFO,
  COLOR_THEMES_CATALOG,
  STICKERS_CATALOG,
  BOX_DESIGNS_CATALOG,
  ARCOR_BRANDS_INFO,
  PackagingType
} from '../gameplay/CustomizationManager.ts';
import { achievementsManager, ACHIEVEMENTS_CATALOG } from '../gameplay/AchievementsManager.ts';
import { soundManager } from '../core/SoundManager.ts';
import { escapeHtml } from '../core/SecurityUtils.ts';

export class MyCollectionModal {
  public element: HTMLElement;
  private currentTab: 'products' | 'boxes' | 'unlocks' | 'achievements' = 'products';

  // Elementos DOM
  private progressPercentEl: HTMLElement | null = null;
  private tabContentEl: HTMLElement | null = null;

  // Callbacks
  public onOpenCreatorRequested?: () => void;
  public onOpenBoxBuilderRequested?: () => void;
  public onCreateProductRequested?: () => void;
  public onCreateGiftBoxRequested?: () => void;
  public onPlayQuizRequested?: () => void;
  public onPlayMatch3Requested?: () => void;
  public onClose?: () => void;

  constructor() {
    this.element = this.render();
  }

  private render(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'collection-modal-backdrop';
    backdrop.id = 'my-collection-modal';
    backdrop.style.display = 'none';

    backdrop.innerHTML = `
      <div class="collection-modal-card">
        <!-- Cabecera Superior con Barra de Progreso Global -->
        <div class="collection-header">
          <div class="coll-header-left">
            <span class="coll-tag">PATRIMONIO & LOGROS</span>
            <h2 class="coll-title">MI COLECCIÓN ARCOR</h2>
          </div>

          <div class="coll-header-right">
            <!-- Barra de porcentaje de colección -->
            <div class="coll-progress-pill" id="coll-progress-pill" title="Porcentaje total de elementos desbloqueados">
              <span class="coll-progress-icon">🌟</span>
              <span class="coll-progress-label" id="coll-progress-percent">0% Colección</span>
            </div>
            <button class="coll-close-btn interactive" id="coll-btn-close" title="Cerrar Vitrina">✕</button>
          </div>
        </div>

        <!-- Barra de Pestañas Principales -->
        <nav class="coll-nav-tabs">
          <button class="coll-tab-btn active interactive" data-tab="products" id="tab-btn-products">
            <span class="t-ico">🍬</span>
            <span class="t-txt">Mis Productos</span>
            <span class="t-badge" id="badge-prods-count">0</span>
          </button>

          <button class="coll-tab-btn interactive" data-tab="boxes" id="tab-btn-boxes">
            <span class="t-ico">🎁</span>
            <span class="t-txt">Cajas Obsequio</span>
            <span class="t-badge" id="badge-boxes-count">0</span>
          </button>

          <button class="coll-tab-btn interactive" data-tab="unlocks" id="tab-btn-unlocks">
            <span class="t-ico">🔓</span>
            <span class="t-txt">Desbloqueos</span>
          </button>

          <button class="coll-tab-btn interactive" data-tab="achievements" id="tab-btn-achievements">
            <span class="t-ico">🏆</span>
            <span class="t-txt">Logros</span>
            <span class="t-badge highlight-badge" id="badge-ach-count">0/12</span>
          </button>
        </nav>

        <!-- Contenido Dinámico de la Pestaña -->
        <div class="coll-tab-body" id="coll-tab-content">
          <!-- Renderizado dinámico según la pestaña activa -->
        </div>
      </div>
    `;

    // Cachear elementos
    this.progressPercentEl = backdrop.querySelector('#coll-progress-percent');
    this.tabContentEl = backdrop.querySelector('#coll-tab-content');

    // Eventos de Pestañas
    backdrop.querySelectorAll<HTMLButtonElement>('.coll-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playClick();
        const tab = btn.dataset.tab as 'products' | 'boxes' | 'unlocks' | 'achievements';
        if (tab) {
          this.switchTab(tab);
        }
      });
    });

    backdrop.querySelector('#coll-btn-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    return backdrop;
  }

  public switchTab(tab: 'products' | 'boxes' | 'unlocks' | 'achievements'): void {
    this.currentTab = tab;

    // Actualizar botones de pestaña
    this.element.querySelectorAll('.coll-tab-btn').forEach(btn => {
      if ((btn as HTMLElement).dataset.tab === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderCurrentTab();
  }

  /**
   * Refresca la vista y el contenido de la pestaña activa
   */
  public renderCurrentTab(): void {
    if (!this.tabContentEl) return;
    this.updateStatsHeader();

    if (this.currentTab === 'products') {
      this.renderProductsTab();
    } else if (this.currentTab === 'boxes') {
      this.renderBoxesTab();
    } else if (this.currentTab === 'unlocks') {
      this.renderUnlocksTab();
    } else if (this.currentTab === 'achievements') {
      this.renderAchievementsTab();
    }
  }

  private updateStatsHeader(): void {
    const stats = customizationManager.getCollectionStatistics();
    if (this.progressPercentEl) {
      this.progressPercentEl.textContent = `${stats.percentage}% Colección`;
    }

    const badgeP = this.element.querySelector('#badge-prods-count');
    const badgeB = this.element.querySelector('#badge-boxes-count');
    const badgeA = this.element.querySelector('#badge-ach-count');

    if (badgeP) badgeP.textContent = `${stats.customProductsCreated}`;
    if (badgeB) badgeB.textContent = `${stats.giftBoxesCreated}`;

    const achSummary = achievementsManager.getSummary();
    if (badgeA) badgeA.textContent = `${achSummary.unlocked}/${achSummary.total}`;
  }

  // =========================================================================
  // PESTAÑA 1: MIS PRODUCTOS CREADOS
  // =========================================================================
  private renderProductsTab(): void {
    if (!this.tabContentEl) return;
    const prods = customizationManager.getCustomProducts();

    if (prods.length === 0) {
      this.tabContentEl.innerHTML = `
        <div class="coll-empty-state">
          <div class="empty-icon">🍬</div>
          <h3 class="empty-title">Aún no creaste productos personalizados</h3>
          <p class="empty-desc">Entrá al Taller Creativo de Arcor para diseñar tu propia línea de chocolates, gomitas o bombones con nombres y sellos únicos.</p>
          <button class="btn btn-primary interactive" id="btn-empty-create-prod">
            <span>✨ ¡Crear Mi Primer Producto!</span>
          </button>
        </div>
      `;
      this.tabContentEl.querySelector('#btn-empty-create-prod')?.addEventListener('click', () => {
        soundManager.playClick();
        this.hide();
        if (this.onCreateProductRequested) {
          this.onCreateProductRequested();
        } else if (this.onOpenCreatorRequested) {
          this.onOpenCreatorRequested();
        }
      });
      return;
    }

    let html = `
      <div class="coll-prods-header">
        <span class="prods-sub">Tus diseños únicos fabricados en el taller oficial:</span>
        <button class="btn btn-primary btn-sm interactive" id="btn-coll-new-prod">＋ Crear Nuevo Producto</button>
      </div>
      <div class="coll-cards-grid">
    `;

    prods.forEach(prod => {
      const brand = ARCOR_BRANDS_INFO[prod.brand];
      const theme = COLOR_THEMES_CATALOG.find(c => c.id === prod.colorThemeId) || COLOR_THEMES_CATALOG[0];
      const pkg = PACKAGING_TYPES_INFO[prod.packaging];

      html += `
        <div class="coll-prod-card" style="background: linear-gradient(145deg, ${theme.primary} 0%, ${theme.secondary} 100%); border-color: ${theme.accent};">
          <div class="c-card-top">
            <span class="c-brand-badge" style="color: ${theme.accent}">${brand.name.toUpperCase()}</span>
            <span class="c-pkg-badge">${pkg.icon} ${pkg.name}</span>
          </div>

          <h4 class="c-prod-title" style="color: ${theme.text}">${escapeHtml(prod.name)}</h4>
          <p class="c-prod-flavor">${escapeHtml(prod.flavorOrMessage)}</p>

          <div class="c-stickers-row">
            ${prod.selectedStickers.map(stId => {
              const s = STICKERS_CATALOG.find(x => x.id === stId);
              return s ? `<span class="c-mini-st">${s.icon} ${s.label}</span>` : '';
            }).join('')}
          </div>

          <div class="c-card-bottom">
            <span class="c-date">📅 ${new Date(prod.createdAt).toLocaleDateString()}</span>
            <button class="c-delete-btn interactive" data-id="${prod.id}" title="Eliminar diseño">🗑️</button>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    this.tabContentEl.innerHTML = html;

    this.tabContentEl.querySelector('#btn-coll-new-prod')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
      if (this.onCreateProductRequested) {
        this.onCreateProductRequested();
      } else if (this.onOpenCreatorRequested) {
        this.onOpenCreatorRequested();
      }
    });

    this.tabContentEl.querySelectorAll('.c-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).dataset.id;
        if (id && confirm('¿Deseas eliminar este producto de tu colección?')) {
          soundManager.playClick();
          customizationManager.deleteCustomProduct(id);
          this.renderProductsTab();
        }
      });
    });
  }

  // =========================================================================
  // PESTAÑA 2: CAJAS OBSEQUIO CREADAS
  // =========================================================================
  private renderBoxesTab(): void {
    if (!this.tabContentEl) return;
    const boxes = customizationManager.getGiftBoxes();

    if (boxes.length === 0) {
      this.tabContentEl.innerHTML = `
        <div class="coll-empty-state">
          <div class="empty-icon">🎁</div>
          <h3 class="empty-title">Aún no armaste cajas obsequio</h3>
          <p class="empty-desc">Elegí una caja de madera o dorada, llenala con golosinas Arcor y dedicatorias con moño para regalar a quien quieras.</p>
          <button class="btn btn-primary interactive" id="btn-empty-create-box">
            <span>🎁 ¡Armar Mi Primera Caja Obsequio!</span>
          </button>
        </div>
      `;
      this.tabContentEl.querySelector('#btn-empty-create-box')?.addEventListener('click', () => {
        soundManager.playClick();
        this.hide();
        if (this.onCreateGiftBoxRequested) {
          this.onCreateGiftBoxRequested();
        } else if (this.onOpenBoxBuilderRequested) {
          this.onOpenBoxBuilderRequested();
        }
      });
      return;
    }

    let html = `
      <div class="coll-prods-header">
        <span class="prods-sub">Tus cajas obsequio preparadas con dedicatoria:</span>
        <button class="btn btn-primary btn-sm interactive" id="btn-coll-new-box">＋ Armar Nueva Caja</button>
      </div>
      <div class="coll-boxes-grid">
    `;

    boxes.forEach(box => {
      const design = BOX_DESIGNS_CATALOG.find(d => d.id === box.boxDesignId) || BOX_DESIGNS_CATALOG[0];

      html += `
        <div class="coll-box-card" style="background: ${design.bgGradient}; border-color: ${design.borderColor};">
          <div class="box-card-ribbon ribbon-${box.ribbonColor}">🎀 Moño ${box.ribbonColor.toUpperCase()}</div>

          <div class="box-card-details">
            <span class="box-card-design-tag">${design.name}</span>
            <h4 class="box-card-to">Para: ${escapeHtml(box.toPerson)}</h4>
            <p class="box-card-msg">"${escapeHtml(box.dedicationMessage)}"</p>
            <span class="box-card-from">De: ${escapeHtml(box.fromPerson)} ♡</span>
          </div>

          <div class="box-items-preview-row">
            ${box.placedProducts.map(p => `<span class="b-mini-item" title="${escapeHtml(p.name)}">${escapeHtml(p.icon)}</span>`).join('')}
          </div>

          <div class="c-card-bottom">
            <span class="c-date">📦 ${box.placedProducts.length} productos • ${new Date(box.createdAt).toLocaleDateString()}</span>
            <button class="c-delete-btn interactive" data-id="${box.id}" title="Eliminar caja">🗑️</button>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    this.tabContentEl.innerHTML = html;

    this.tabContentEl.querySelector('#btn-coll-new-box')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
      if (this.onCreateGiftBoxRequested) {
        this.onCreateGiftBoxRequested();
      } else if (this.onOpenBoxBuilderRequested) {
        this.onOpenBoxBuilderRequested();
      }
    });

    this.tabContentEl.querySelectorAll('.c-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).dataset.id;
        if (id && confirm('¿Deseas eliminar esta caja obsequio de tu colección?')) {
          soundManager.playClick();
          customizationManager.deleteGiftBox(id);
          this.renderBoxesTab();
        }
      });
    });
  }

  // =========================================================================
  // PESTAÑA 3: CATÁLOGO DE DESBLOQUEOS
  // =========================================================================
  private renderUnlocksTab(): void {
    if (!this.tabContentEl) return;

    let html = `
      <div class="unlocks-catalog-wrapper">
        <p class="unlocks-intro">
          Superá niveles en **Arcor Crush** y acumulá puntos en la **Trivia Arcor** para desbloquear nuevos envoltorios, stickers y cajas conmemorativas.
        </p>

        <!-- 1. Packagings -->
        <div class="unlock-group-box">
          <h4 class="unlock-group-title">🍬 FORMATOS DE PACKAGING</h4>
          <div class="unlock-items-grid">
            ${Object.entries(PACKAGING_TYPES_INFO).map(([key, info]) => {
              const st = customizationManager.isPackagingUnlocked(key as PackagingType);
              return `
                <div class="unlock-item-card ${st.isUnlocked ? 'unlocked' : 'locked'}">
                  <span class="u-icon">${info.icon}</span>
                  <div class="u-info">
                    <span class="u-name">${info.name}</span>
                    <span class="u-status">${st.isUnlocked ? '✓ Desbloqueado' : `🔒 ${st.requirementText}`}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 2. Stickers y Sellos Oficiales -->
        <div class="unlock-group-box">
          <h4 class="unlock-group-title">⭐ SELLOS & STICKERS OFICIALES</h4>
          <div class="unlock-items-grid">
            ${STICKERS_CATALOG.map(stk => {
              const st = customizationManager.isStickerUnlocked(stk);
              return `
                <div class="unlock-item-card ${st.isUnlocked ? 'unlocked' : 'locked'}">
                  <span class="u-icon">${stk.icon}</span>
                  <div class="u-info">
                    <span class="u-name">${stk.label}</span>
                    <span class="u-status">${st.isUnlocked ? '✓ Desbloqueado' : `🔒 ${st.requirementText}`}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. Diseños de Caja -->
        <div class="unlock-group-box">
          <h4 class="unlock-group-title">🎁 DISEÑOS DE CAJA OBSEQUIO</h4>
          <div class="unlock-items-grid">
            ${BOX_DESIGNS_CATALOG.map(box => {
              const st = customizationManager.isBoxDesignUnlocked(box);
              return `
                <div class="unlock-item-card ${st.isUnlocked ? 'unlocked' : 'locked'}">
                  <span class="u-icon">📦</span>
                  <div class="u-info">
                    <span class="u-name">${box.name}</span>
                    <span class="u-status">${st.isUnlocked ? '✓ Desbloqueado' : `🔒 ${st.requirementText}`}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    this.tabContentEl.innerHTML = html;
  }

  // =========================================================================
  // PESTAÑA 4: SALÓN DE LOGROS
  // =========================================================================
  private renderAchievementsTab(): void {
    if (!this.tabContentEl) return;
    achievementsManager.checkAll();

    let html = `
      <div class="achievements-catalog-wrapper">
        <p class="unlocks-intro">
          Completá desafíos en toda la experiencia para obtener recompensas monetarias y avanzar en tu estatus industrial de Arcor.
        </p>

        <div class="achievements-list-grid">
    `;

    ACHIEVEMENTS_CATALOG.forEach(ach => {
      const p = achievementsManager.getProgress(ach.id);
      const pct = Math.min(100, Math.round((p.currentProgress / ach.maxProgress) * 100));

      html += `
        <div class="achievement-row-card ${p.unlocked ? 'unlocked' : 'in-progress'} ${p.claimed ? 'claimed' : ''}">
          <div class="ach-medal-box">${ach.icon}</div>

          <div class="ach-info-col">
            <div class="ach-title-row">
              <span class="ach-title">${ach.title}</span>
              <span class="ach-reward-tag">${ach.rewardText}</span>
            </div>
            <p class="ach-desc">${ach.description}</p>

            <div class="ach-progress-bar-wrap">
              <div class="ach-progress-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="ach-progress-num">${Math.min(ach.maxProgress, p.currentProgress)} / ${ach.maxProgress}</span>
          </div>

          <div class="ach-action-col">
            ${p.claimed
              ? '<span class="ach-claimed-badge">✓ Reclamado</span>'
              : p.unlocked
              ? `<button class="btn btn-primary btn-claim-ach interactive" data-id="${ach.id}">Reclamar 💰</button>`
              : '<span class="ach-locked-badge">🔒 En progreso</span>'
            }
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    this.tabContentEl.innerHTML = html;

    this.tabContentEl.querySelectorAll('.btn-claim-ach').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id;
        if (id) {
          const success = achievementsManager.claimReward(id);
          if (success) {
            this.renderAchievementsTab();
          }
        }
      });
    });
  }

  public show(tab?: 'products' | 'boxes' | 'unlocks' | 'achievements'): void {
    this.switchTab(tab || 'products');
    this.element.style.display = 'flex';
  }

  public hide(): void {
    this.element.style.display = 'none';
    if (this.onClose) this.onClose();
  }
}
