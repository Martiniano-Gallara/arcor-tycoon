import { gameState } from '../gameplay/GameState.ts';
import { soundManager } from '../core/SoundManager.ts';

export class ContractsModal {
  public element: HTMLElement;
  private timerInterval: any = null;

  constructor() {
    this.element = this.render();
  }

  private render(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">🚚 CONTRATOS Y EXPEDICIONES</h2>
          <button class="modal-close-btn" id="contracts-modal-close">✕</button>
        </div>

        <div class="modal-body" id="contracts-modal-body">
          <!-- Banner de Estado del Camión -->
          <div class="truck-status-banner" id="truck-status-banner">
            <span class="truck-status-emoji">🚛</span>
            <div class="truck-status-info">
              <span class="truck-status-title" id="truck-status-title">Camión en el Andén</span>
              <span class="truck-status-sub" id="truck-status-sub">Listo para cargar pedidos en Arroyito</span>
            </div>
          </div>

          <!-- Listado de Contratos -->
          <div class="contracts-list" id="contracts-list"></div>
        </div>
      </div>
    `;

    modal.querySelector('#contracts-modal-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    return modal;
  }

  public show(): void {
    this.updateContent();
    this.element.classList.add('active');

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.updateStatusBanner();
    }, 1000);
  }

  public hide(): void {
    this.element.classList.remove('active');
    clearInterval(this.timerInterval);
  }

  private updateStatusBanner(): void {
    const sys = gameState.logisticsSystem;
    const bannerTitle = this.element.querySelector('#truck-status-title');
    const bannerSub = this.element.querySelector('#truck-status-sub');

    if (sys.activeContract) {
      const remaining = Math.max(0, Math.ceil(sys.activeContract.remainingSeconds));
      if (bannerTitle) bannerTitle.textContent = `En ruta a: ${sys.activeContract.clientCity}`;
      if (bannerSub) bannerSub.textContent = `⏳ Regreso estimado en: ${remaining} segundos`;
    } else {
      if (bannerTitle) bannerTitle.textContent = 'Camión en el Andén de Arroyito';
      if (bannerSub) bannerSub.textContent = 'Listo para cargar pedidos y salir a la ruta';
    }
  }

  public updateContent(): void {
    this.updateStatusBanner();

    const listEl = this.element.querySelector('#contracts-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const sys = gameState.logisticsSystem;
    const data = gameState.getData();

    sys.contracts.forEach(c => {
      const card = document.createElement('div');
      card.className = 'contract-card';

      // Verificar si tenemos todo el stock
      let canFulfill = true;
      const requirementsHtml = Object.entries(c.requestedProducts).map(([prod, needed]) => {
        const stock = (data as any)[prod] || 0;
        const hasEnough = stock >= (needed || 0);
        if (!hasEnough) canFulfill = false;

        const prodLabels: Record<string, string> = {
          hardCandies: 'Caramelos Duros',
          milkCandies: 'Caramelos de Leche',
          bonOBon: 'Bon o Bon'
        };

        return `
          <div class="req-item ${hasEnough ? 'req-ok' : 'req-missing'}">
            <span>${prodLabels[prod] || prod}: ${stock}/${needed}</span>
          </div>
        `;
      }).join('');

      const isBusy = sys.activeContract !== null;

      card.innerHTML = `
        <div class="contract-header">
          <span class="contract-icon">${c.icon}</span>
          <div class="contract-destination">
            <span class="client-name">${c.clientName}</span>
            <span class="client-city">📍 ${c.clientCity} (${c.distanceKm} km)</span>
          </div>
        </div>

        <div class="contract-requirements">
          ${requirementsHtml}
        </div>

        <div class="contract-footer">
          <div class="contract-rewards">
            <span class="reward-chip gold">+$${c.rewardMoney} USD</span>
            <span class="reward-chip star">+${c.rewardReputation} ⭐</span>
            <span class="reward-time">⏱️ ${c.durationSeconds}s</span>
          </div>

          <button class="btn ${canFulfill && !isBusy ? 'btn-primary' : 'btn-secondary'} btn-dispatch interactive" ${!canFulfill || isBusy ? 'disabled' : ''}>
            ${isBusy ? 'Camión en viaje' : !canFulfill ? 'Falta Stock' : 'Despachar 🚚'}
          </button>
        </div>
      `;

      card.querySelector('.btn-dispatch')?.addEventListener('click', () => {
        soundManager.playFanfare();
        const res = sys.dispatch(c.id, data as any);
        if (res.success) {
          // Deducir productos consumidos
          for (const [prod, amt] of Object.entries(res.consumed)) {
            (data as any)[prod] = Math.max(0, ((data as any)[prod] || 0) - (amt || 0));
          }
          gameState.notify();
          this.updateContent();
        }
      });

      listEl.appendChild(card);
    });
  }
}
