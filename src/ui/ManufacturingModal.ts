import { gameState } from '../gameplay/GameState.ts';
import { soundManager } from '../core/SoundManager.ts';
import { HistoricalEvent } from '../gameplay/historyEras.ts';

export class ManufacturingModal {
  public element: HTMLElement;
  private onProduceCallback?: (completedEvent: HistoricalEvent | null) => void;

  constructor(onProduce?: (completedEvent: HistoricalEvent | null) => void) {
    this.onProduceCallback = onProduce;
    this.element = this.render();
  }

  private render(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';

    modal.innerHTML = `
      <div class="modal-dialog manufacturing-dialog">
        <div class="modal-header">
          <div class="modal-title-box">
            <h2 class="modal-title">🔥 PLANTA DE ELABORACIÓN Y COCCIÓN</h2>
            <span class="modal-subtitle">Pailas de bronce y líneas continuas de dulces de Arcor</span>
          </div>
          <button class="modal-close-btn" id="mfg-modal-close">✕</button>
        </div>

        <div class="modal-body">
          <!-- Métricas de Producción -->
          <div class="mfg-status-row">
            <div class="mfg-stat-card">
              <span class="mfg-stat-label">Caramelos Duros</span>
              <span class="mfg-stat-value highlight-gold" id="mfg-stock-candies">0</span>
            </div>
            <div class="mfg-stat-card">
              <span class="mfg-stat-label">Caramelos de Leche</span>
              <span class="mfg-stat-value" id="mfg-stock-milk">0</span>
            </div>
            <div class="mfg-stat-card">
              <span class="mfg-stat-label">Bon o Bon</span>
              <span class="mfg-stat-value" id="mfg-stock-bon">0</span>
            </div>
            <div class="mfg-stat-card">
              <span class="mfg-stat-label">Bono Caramelistas</span>
              <span class="mfg-stat-value highlight" id="mfg-worker-bonus">+0%</span>
            </div>
          </div>

          <!-- Líneas de Cocción -->
          <div class="mfg-recipes-list" id="mfg-recipes-list"></div>

          <!-- Venta Inmediata a Comercios Locales -->
          <div class="mfg-wholesale-panel">
            <div class="wholesale-title">🏪 Venta Mayorista Local (Arroyito y San Francisco)</div>
            <p class="wholesale-desc">¿Necesitas dinero al instante? Vende lotes de caramelos sin esperar al camión de ruta.</p>
            <div class="wholesale-actions">
              <button class="btn btn-secondary interactive" id="btn-sell-25">
                Vender 25 Caramelos (+$125 USD)
              </button>
              <button class="btn btn-primary interactive" id="btn-sell-100">
                Vender 100 Caramelos (+$500 USD)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.querySelector('#mfg-modal-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    modal.querySelector('#btn-sell-25')?.addEventListener('click', () => {
      gameState.sellCandies(25);
      soundManager.playClick();
      this.updateContent();
      if (this.onProduceCallback) this.onProduceCallback(null);
    });

    modal.querySelector('#btn-sell-100')?.addEventListener('click', () => {
      gameState.sellCandies(100);
      soundManager.playClick();
      this.updateContent();
      if (this.onProduceCallback) this.onProduceCallback(null);
    });

    return modal;
  }

  public show(): void {
    this.updateContent();
    this.element.classList.add('active');
  }

  public hide(): void {
    this.element.classList.remove('active');
  }

  public updateContent(): void {
    const data = gameState.getData();

    const candiesEl = this.element.querySelector('#mfg-stock-candies');
    const milkEl = this.element.querySelector('#mfg-stock-milk');
    const bonEl = this.element.querySelector('#mfg-stock-bon');
    const bonusEl = this.element.querySelector('#mfg-worker-bonus');

    if (candiesEl) candiesEl.textContent = `${data.hardCandies}`;
    if (milkEl) milkEl.textContent = `${data.milkCandies || 0}`;
    if (bonEl) bonEl.textContent = `${data.bonOBon || 0}`;
    if (bonusEl) bonusEl.textContent = `+${Math.round(data.workers.caramelistas * 15)}%`;

    const listEl = this.element.querySelector('#mfg-recipes-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    // Receta 1: Caramelos Duros Tradicionales (1951)
    const canCookHard = data.sugar >= 1;
    const canCookHard5 = data.sugar >= 5;

    const r1 = document.createElement('div');
    r1.className = 'mfg-recipe-card';
    r1.innerHTML = `
      <div class="recipe-icon">🍬</div>
      <div class="recipe-info">
        <div class="recipe-title">Paila de Bronce: Caramelos Cristalinos</div>
        <div class="recipe-meta">Costo: 1 saco de azúcar • Rinde: 10 caramelos duros</div>
        <div class="recipe-stock-indicator">Stock azúcar disponible: ${data.sugar} sacos</div>
      </div>
      <div class="recipe-actions">
        <button class="btn btn-secondary btn-cook-1 interactive" ${!canCookHard ? 'disabled' : ''}>
          Cocinar 1 Lote (+10 🍬)
        </button>
        <button class="btn btn-primary btn-cook-5 interactive" ${!canCookHard5 ? 'disabled' : ''}>
          Lote x5 (+50 🍬)
        </button>
      </div>
    `;

    r1.querySelector('.btn-cook-1')?.addEventListener('click', () => {
      const res = gameState.produceCandies();
      if (res.success) {
        soundManager.playClick();
        this.updateContent();
        if (this.onProduceCallback) this.onProduceCallback(res.completedEvent);
      }
    });

    r1.querySelector('.btn-cook-5')?.addEventListener('click', () => {
      let lastEvent: HistoricalEvent | null = null;
      for (let i = 0; i < 5; i++) {
        const res = gameState.produceCandies();
        if (res.completedEvent) lastEvent = res.completedEvent;
      }
      soundManager.playFanfare();
      this.updateContent();
      if (this.onProduceCallback) this.onProduceCallback(lastEvent);
    });

    listEl.appendChild(r1);

    // Receta 2: Caramelos de Leche (1955)
    if (data.currentYear >= 1954) {
      const canCookMilk = data.sugar >= 1 && (data.milk || 0) >= 1;
      const r2 = document.createElement('div');
      r2.className = 'mfg-recipe-card';
      r2.innerHTML = `
        <div class="recipe-icon">🥛</div>
        <div class="recipe-info">
          <div class="recipe-title">Paila Dulcera: Caramelos de Leche</div>
          <div class="recipe-meta">Costo: 1 Azúcar + 1 Leche • Rinde: 8 Caramelos de Leche</div>
          <div class="recipe-stock-indicator">Azúcar: ${data.sugar} | Leche: ${data.milk || 0}</div>
        </div>
        <div class="recipe-actions">
          <button class="btn btn-primary btn-cook-milk interactive" ${!canCookMilk ? 'disabled' : ''}>
            Cocinar Lote (+8 🥛)
          </button>
        </div>
      `;

      r2.querySelector('.btn-cook-milk')?.addEventListener('click', () => {
        const res = gameState.produceMilkCandies();
        if (res.success) {
          this.updateContent();
        }
      });

      listEl.appendChild(r2);
    }

    // Receta 3: Bon o Bon (1984)
    if (data.currentYear >= 1984) {
      const canCookBon = (data.cocoa || 0) >= 2 && data.sugar >= 2;
      const r3 = document.createElement('div');
      r3.className = 'mfg-recipe-card';
      r3.innerHTML = `
        <div class="recipe-icon">🍫</div>
        <div class="recipe-info">
          <div class="recipe-title">Línea de Templado: Bon o Bon</div>
          <div class="recipe-meta">Costo: 2 Cacao + 2 Azúcar • Rinde: 5 Bombones Bon o Bon</div>
          <div class="recipe-stock-indicator">Cacao: ${data.cocoa || 0} | Azúcar: ${data.sugar}</div>
        </div>
        <div class="recipe-actions">
          <button class="btn btn-primary btn-cook-bon interactive" ${!canCookBon ? 'disabled' : ''}>
            Bañar Lote (+5 🍫)
          </button>
        </div>
      `;

      r3.querySelector('.btn-cook-bon')?.addEventListener('click', () => {
        const res = gameState.produceBonOBon();
        if (res.success) {
          this.updateContent();
        }
      });

      listEl.appendChild(r3);
    }
  }
}
