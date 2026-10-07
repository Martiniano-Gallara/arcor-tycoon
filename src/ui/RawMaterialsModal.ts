import { gameState } from '../gameplay/GameState.ts';
import { soundManager } from '../core/SoundManager.ts';

export class RawMaterialsModal {
  public element: HTMLElement;
  private onBuyCallback?: () => void;

  constructor(onBuy?: () => void) {
    this.onBuyCallback = onBuy;
    this.element = this.render();
  }

  private render(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';

    modal.innerHTML = `
      <div class="modal-dialog raw-materials-dialog">
        <div class="modal-header">
          <div class="modal-title-box">
            <h2 class="modal-title">🌾 MERCADO DE MATERIAS PRIMAS E INSUMOS</h2>
            <span class="modal-subtitle">Abastece las pailas y líneas de producción de Arroyito</span>
          </div>
          <button class="modal-close-btn" id="materials-modal-close">✕</button>
        </div>

        <div class="modal-body">
          <!-- Billetera y Resumen de Almacén -->
          <div class="materials-wallet-bar">
            <div class="wallet-item">
              <span class="wallet-label">Capital Disponible:</span>
              <span class="wallet-val highlight-gold" id="mat-wallet-money">$0 USD</span>
            </div>
            <div class="wallet-item">
              <span class="wallet-label">Capacidad de Silos:</span>
              <span class="wallet-val" id="mat-silo-capacity">Amplitud Óptima 🏗️</span>
            </div>
          </div>

          <!-- Listado de Insumos -->
          <div class="raw-materials-grid" id="raw-materials-list"></div>
        </div>
      </div>
    `;

    modal.querySelector('#materials-modal-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
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
    const moneyEl = this.element.querySelector('#mat-wallet-money');
    if (moneyEl) moneyEl.textContent = `$${data.money} USD`;

    const listEl = this.element.querySelector('#raw-materials-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const materialsConfig = [
      {
        key: 'sugar' as const,
        name: 'Azúcar Refinada',
        icon: '🌾',
        unitPrice: 10,
        currentStock: data.sugar,
        unitLabel: 'sacos',
        desc: 'Base dulce indispensable para toda golosina y cocción en paila de cobre.',
        bundles: [
          { count: 5, cost: 50 },
          { count: 25, cost: 250 },
          { count: 100, cost: 1000 }
        ]
      },
      {
        key: 'glucose' as const,
        name: 'Jarabe de Glucosa',
        icon: '🍯',
        unitPrice: 15,
        currentStock: data.glucose || 0,
        unitLabel: 'barriles',
        desc: 'Aporta consistencia cristalina, brillo superior y previene la cristalización prematura.',
        bundles: [
          { count: 5, cost: 75 },
          { count: 25, cost: 375 }
        ]
      },
      {
        key: 'milk' as const,
        name: 'Leche Fresca de Tambo',
        icon: '🥛',
        unitPrice: 12,
        currentStock: data.milk || 0,
        unitLabel: 'cantimploras',
        desc: 'Proveniente de las cuencas lecheras cordobesas para los Caramelos de Leche de 1955.',
        bundles: [
          { count: 5, cost: 60 },
          { count: 20, cost: 240 }
        ]
      },
      {
        key: 'cocoa' as const,
        name: 'Cacao Fino y Pasta de Maní',
        icon: '🍫',
        unitPrice: 25,
        currentStock: data.cocoa || 0,
        unitLabel: 'cajas',
        desc: 'Cacao tostado seleccionado para coberturas de chocolate y la línea Bon o Bon.',
        bundles: [
          { count: 5, cost: 125 },
          { count: 15, cost: 375 }
        ]
      },
      {
        key: 'flour' as const,
        name: 'Harina de Trigo Seleccionada',
        icon: '🥖',
        unitPrice: 8,
        currentStock: data.flour || 0,
        unitLabel: 'bolsas',
        desc: 'Molienda fina para las galletitas secas y rellenas de la planta Bagley.',
        bundles: [
          { count: 10, cost: 80 },
          { count: 50, cost: 400 }
        ]
      }
    ];

    materialsConfig.forEach(mat => {
      const card = document.createElement('div');
      card.className = 'raw-material-card';

      const buttonsHtml = mat.bundles.map(b => {
        const canAfford = data.money >= b.cost;
        return `
          <button class="btn btn-secondary btn-buy-bundle interactive" data-count="${b.count}" ${!canAfford ? 'disabled' : ''}>
            +${b.count} (${b.cost} USD)
          </button>
        `;
      }).join('');

      card.innerHTML = `
        <div class="material-card-top">
          <div class="material-icon-box">${mat.icon}</div>
          <div class="material-info">
            <div class="material-name-row">
              <span class="material-name">${mat.name}</span>
              <span class="material-stock-badge">Stock: ${mat.currentStock} ${mat.unitLabel}</span>
            </div>
            <div class="material-desc">${mat.desc}</div>
          </div>
        </div>

        <div class="material-card-actions">
          <span class="material-unit-price">Precio unitario: $${mat.unitPrice} USD</span>
          <div class="material-bundles-row">
            ${buttonsHtml}
          </div>
        </div>
      `;

      card.querySelectorAll('.btn-buy-bundle').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const count = parseInt(target.getAttribute('data-count') || '5', 10);
          const res = gameState.buyRawMaterial(mat.key, count);
          if (res.success) {
            soundManager.playClick();
            this.updateContent();
            if (this.onBuyCallback) this.onBuyCallback();
          }
        });
      });

      listEl.appendChild(card);
    });
  }
}
