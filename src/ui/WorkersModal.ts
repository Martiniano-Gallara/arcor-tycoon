import { gameState } from '../gameplay/GameState.ts';
import { soundManager } from '../core/SoundManager.ts';

export class WorkersModal {
  public element: HTMLElement;
  private onUpdatedCallback?: () => void;

  constructor(onUpdated?: () => void) {
    this.onUpdatedCallback = onUpdated;
    this.element = this.render();
  }

  private render(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">👥 PERSONAL Y TRABAJADORES</h2>
          <button class="modal-close-btn" id="workers-modal-close">✕</button>
        </div>

        <div class="modal-body" id="workers-modal-body">
          <!-- Resumen de Nómina -->
          <div class="workers-summary-card">
            <div class="summary-item">
              <span class="summary-label">Nómina Mensual</span>
              <span class="summary-val" id="workers-payroll-val">$0 USD/mes</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Bono de Velocidad</span>
              <span class="summary-val highlight" id="workers-speed-val">+0%</span>
            </div>
          </div>

          <!-- Roles -->
          <div class="workers-roles-list" id="workers-roles-list"></div>
        </div>
      </div>
    `;

    modal.querySelector('#workers-modal-close')?.addEventListener('click', () => {
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
    const w = data.workers;

    const payrollEl = this.element.querySelector('#workers-payroll-val');
    const speedEl = this.element.querySelector('#workers-speed-val');
    const listEl = this.element.querySelector('#workers-roles-list');

    const totalPayroll = (w.caramelistas * 25) + (w.acarreadores * 18) + (w.mecanicos * 30);
    const speedBonus = Math.round(w.caramelistas * 15);

    if (payrollEl) payrollEl.textContent = `$${totalPayroll} USD/mes`;
    if (speedEl) speedEl.textContent = `+${speedBonus}%`;

    if (!listEl) return;
    listEl.innerHTML = '';

    const rolesConfig = [
      {
        roleKey: 'caramelistas' as const,
        name: 'Maestros Caramelistas',
        icon: '👨‍🍳',
        count: w.caramelistas,
        wage: '$25 USD/mes',
        hireCost: '$80 USD',
        desc: 'Cocineros de paila. Cada uno aporta +15% de velocidad a las líneas de dulces.'
      },
      {
        roleKey: 'acarreadores' as const,
        name: 'Acarreadores con Carretilla',
        icon: '🚜',
        count: w.acarreadores,
        wage: '$18 USD/mes',
        hireCost: '$50 USD',
        desc: 'Recorren los caminos transportando sacos y cajas entre galpones y almacenes.'
      },
      {
        roleKey: 'mecanicos' as const,
        name: 'Mecánicos de Mantenimiento',
        icon: '🔧',
        count: w.mecanicos,
        wage: '$30 USD/mes',
        hireCost: '$120 USD',
        desc: 'Mantienen engrasadas las pailas y motores eléctricos evitando fallas operativas.'
      }
    ];

    rolesConfig.forEach(cfg => {
      const item = document.createElement('div');
      item.className = 'worker-role-card';

      item.innerHTML = `
        <div class="role-icon-box">${cfg.icon}</div>
        <div class="role-info">
          <div class="role-title-row">
            <span class="role-name">${cfg.name}</span>
            <span class="role-wage">${cfg.wage}</span>
          </div>
          <div class="role-desc">${cfg.desc}</div>
          <div class="role-controls-row">
            <span class="role-hire-cost">Contratar: ${cfg.hireCost}</span>
            <div class="counter-buttons">
              <button class="btn-counter btn-minus interactive" ${cfg.count <= 0 ? 'disabled' : ''}>-</button>
              <span class="counter-value">${cfg.count}</span>
              <button class="btn-counter btn-plus interactive">+</button>
            </div>
          </div>
        </div>
      `;

      item.querySelector('.btn-plus')?.addEventListener('click', () => {
        const ok = gameState.hireWorker(cfg.roleKey);
        if (ok) {
          this.updateContent();
          if (this.onUpdatedCallback) this.onUpdatedCallback();
        }
      });

      item.querySelector('.btn-minus')?.addEventListener('click', () => {
        const ok = gameState.fireWorker(cfg.roleKey);
        if (ok) {
          this.updateContent();
          if (this.onUpdatedCallback) this.onUpdatedCallback();
        }
      });

      listEl.appendChild(item);
    });
  }
}
