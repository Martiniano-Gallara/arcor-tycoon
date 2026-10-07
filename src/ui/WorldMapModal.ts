import { gameState } from '../gameplay/GameState.ts';
import { soundFX } from '../audio/SoundFXManager.ts';
import { soundManager } from '../core/SoundManager.ts';
import { GlobalBranch, GLOBAL_BRANCHES } from '../gameplay/GlobalBranches.ts';
export { type GlobalBranch, GLOBAL_BRANCHES };

interface MapPinCoord {
  x: number;
  y: number;
}

const PIN_COORDINATES: Record<string, MapPinCoord> = {
  'branch-arroyito': { x: 195, y: 228 },
  'branch-tucuman': { x: 190, y: 202 },
  'branch-mendoza': { x: 182, y: 224 },
  'branch-cartocor-parana': { x: 204, y: 218 },
  'branch-chile': { x: 175, y: 228 },
  'branch-brasil': { x: 236, y: 208 },
  'branch-angola': { x: 350, y: 205 }
};

/**
 * WorldMapModal: Expansión de Arcor a lo largo del mundo junto a un mapa interactivo con rutas comerciales y plantas.
 */
export class WorldMapModal {
  public element: HTMLElement;
  private onBranchUnlockedCallback?: (branch: GlobalBranch) => void;
  private activeTooltipEl: HTMLElement | null = null;

  constructor(onBranchUnlocked?: (branch: GlobalBranch) => void) {
    this.onBranchUnlockedCallback = onBranchUnlocked;
    this.element = this.render();
  }

  private render(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';

    modal.innerHTML = `
      <div class="modal-dialog modal-world-map">
        <div class="modal-header">
          <div class="world-map-title-box">
            <h2 class="modal-title">🌍 EXPANSIÓN GLOBAL: GRUPO ARCOR</h2>
            <span class="world-map-subtitle">Megaplantas industriales, filiales y rutas de exportación mundiales</span>
          </div>
          <button class="modal-close-btn interactive" id="world-map-close">✕</button>
        </div>

        <div class="modal-body" id="world-map-body">
          <!-- Banner de Estadísticas de Exportación Global -->
          <div class="export-stats-banner">
            <div class="export-stat-item">
              <span class="export-stat-label">Ingresos Globales</span>
              <span class="export-stat-val" id="world-passive-income">$0 USD/min</span>
            </div>
            <div class="export-stat-item">
              <span class="export-stat-label">Plantas Activas</span>
              <span class="export-stat-val" id="world-unlocked-count">1/7</span>
            </div>
            <div class="export-stat-item">
              <span class="export-stat-label">Prestigio Arcor</span>
              <span class="export-stat-val" id="world-reputation-val">★ 1</span>
            </div>
          </div>

          <!-- MAPA INTERACTIVO MUNDIAL (SVG Interactivo con Rutas de Comercio y Nodos de Plantas) -->
          <div class="interactive-world-map-wrapper">
            <div class="map-interactive-header">
              <span class="map-hint-txt">🗺️ Toca cualquier punto del globo para inspeccionar la filial o megaplanta</span>
              <span class="map-legend"><span class="legend-dot central"></span> Sede Central <span class="legend-dot active"></span> Activa <span class="legend-dot locked"></span> Por Inaugurar</span>
            </div>

            <div class="map-svg-container" id="world-map-svg-container">
              <!-- SVG Estilizado de la Tierra con Rutas -->
              <svg viewBox="0 0 520 290" class="world-svg-viewport" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <!-- Filtro de Resplandor Dorado -->
                  <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <!-- Gradiente para Rutas Comerciales -->
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffe082" stop-opacity="0.9" />
                    <stop offset="100%" stop-color="#ff9800" stop-opacity="0.7" />
                  </linearGradient>
                </defs>

                <!-- Fondo del Océano -->
                <rect width="100%" height="100%" fill="#0a121e" rx="14" />

                <!-- Retícula de Coordenadas Náuticas -->
                <line x1="0" y1="72" x2="520" y2="72" stroke="rgba(255,215,0,0.08)" stroke-dasharray="4,4" />
                <line x1="0" y1="145" x2="520" y2="145" stroke="rgba(255,215,0,0.15)" stroke-dasharray="6,4" />
                <line x1="0" y1="218" x2="520" y2="218" stroke="rgba(255,215,0,0.08)" stroke-dasharray="4,4" />
                <line x1="130" y1="0" x2="130" y2="290" stroke="rgba(255,215,0,0.08)" stroke-dasharray="4,4" />
                <line x1="260" y1="0" x2="260" y2="290" stroke="rgba(255,215,0,0.08)" stroke-dasharray="4,4" />
                <line x1="390" y1="0" x2="390" y2="290" stroke="rgba(255,215,0,0.08)" stroke-dasharray="4,4" />

                <!-- Siluetas Geográficas de Continentes -->
                <!-- Norteamérica -->
                <path d="M 60 45 Q 110 35 150 45 Q 165 70 140 105 Q 115 125 90 120 Q 80 90 60 70 Z" fill="#1b2838" stroke="rgba(212,175,55,0.25)" stroke-width="1.2" />
                <!-- Sudamérica -->
                <path d="M 145 130 Q 185 130 220 160 Q 255 190 235 245 Q 200 280 185 285 Q 165 260 165 210 Q 155 170 145 130 Z" fill="#223447" stroke="rgba(212,175,55,0.4)" stroke-width="1.5" />
                <!-- Europa -->
                <path d="M 270 45 Q 310 40 335 60 Q 330 85 295 90 Q 275 75 270 45 Z" fill="#1b2838" stroke="rgba(212,175,55,0.25)" stroke-width="1.2" />
                <!-- África -->
                <path d="M 275 105 Q 335 100 365 145 Q 375 195 345 240 Q 315 255 295 210 Q 275 160 275 105 Z" fill="#203042" stroke="rgba(212,175,55,0.35)" stroke-width="1.3" />
                <!-- Asia / Oceanía Simplificado -->
                <path d="M 350 45 Q 440 40 480 85 Q 460 135 410 130 Q 370 95 350 45 Z" fill="#1b2838" stroke="rgba(212,175,55,0.25)" stroke-width="1.2" />

                <!-- Capa de Rutas de Exportación (Arcos de Comercio) -->
                <g id="world-trade-routes-group"></g>

                <!-- Capa de Pines Interactivos de las Plantas -->
                <g id="world-pins-group"></g>
              </svg>

              <!-- Tooltip Flotante del Mapa -->
              <div class="map-floating-tooltip" id="map-pin-tooltip" style="display: none;"></div>
            </div>
          </div>

          <!-- Listado Detallado de Filiales y Megaplantas -->
          <div class="branches-section-title">
            <span>🏭 EMPRESAS, MEGAPLANTAS Y CENTROS DE DISTRIBUCIÓN</span>
          </div>
          <div class="branches-grid" id="branches-list"></div>
        </div>
      </div>
    `;

    modal.querySelector('#world-map-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    this.activeTooltipEl = modal.querySelector('#map-pin-tooltip');

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
    const unlockedIds = data.unlockedCards || [];

    const incomeEl = this.element.querySelector('#world-passive-income');
    const countEl = this.element.querySelector('#world-unlocked-count');
    const repEl = this.element.querySelector('#world-reputation-val');
    const listEl = this.element.querySelector('#branches-list');
    const routesGroup = this.element.querySelector('#world-trade-routes-group');
    const pinsGroup = this.element.querySelector('#world-pins-group');

    let totalIncome = 0;
    let unlockedCount = 0;
    let totalRep = 1;

    GLOBAL_BRANCHES.forEach(b => {
      const isUnlocked = b.id === 'branch-arroyito' || unlockedIds.includes(b.id);
      if (isUnlocked) {
        totalIncome += b.passiveEarningsPerMinute;
        unlockedCount++;
        totalRep += b.reputationBonus;
      }
    });

    if (incomeEl) incomeEl.textContent = `+$${totalIncome.toLocaleString()} USD/min`;
    if (countEl) countEl.textContent = `${unlockedCount}/${GLOBAL_BRANCHES.length}`;
    if (repEl) repEl.textContent = `★ ${totalRep}`;

    // 1. Renderizar Rutas y Pines en el Mapa SVG Interactivo
    if (routesGroup && pinsGroup) {
      routesGroup.innerHTML = '';
      pinsGroup.innerHTML = '';

      const hub = PIN_COORDINATES['branch-arroyito'] || { x: 195, y: 228 };

      GLOBAL_BRANCHES.forEach(b => {
        const coord = PIN_COORDINATES[b.id] || { x: 195, y: 228 };
        const isUnlocked = b.id === 'branch-arroyito' || unlockedIds.includes(b.id);
        const isHub = b.id === 'branch-arroyito';

        // Dibujar arco de ruta comercial desde Arroyito si no es el hub
        if (!isHub) {
          const midX = (hub.x + coord.x) / 2;
          const midY = Math.min(hub.y, coord.y) - 18; // Curva convexa
          const pathD = `M ${hub.x} ${hub.y} Q ${midX} ${midY} ${coord.x} ${coord.y}`;

          const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pathEl.setAttribute('d', pathD);
          pathEl.setAttribute('class', `svg-trade-route ${isUnlocked ? 'active-route' : 'inactive-route'}`);
          routesGroup.appendChild(pathEl);
        }

        // Crear Pin Interactivo
        const pinG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        pinG.setAttribute('class', `svg-map-pin ${isHub ? 'hub-pin' : isUnlocked ? 'unlocked-pin' : 'locked-pin'} interactive`);
        pinG.setAttribute('transform', `translate(${coord.x}, ${coord.y})`);
        pinG.style.cursor = 'pointer';

        // Onda o halo pulsante
        const pulseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulseCircle.setAttribute('r', isHub ? '9' : '6');
        pulseCircle.setAttribute('class', 'svg-pin-aura');
        pinG.appendChild(pulseCircle);

        // Centro del pin
        const dotCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dotCircle.setAttribute('r', isHub ? '5.5' : '4');
        dotCircle.setAttribute('class', 'svg-pin-dot');
        pinG.appendChild(dotCircle);

        // Icono o Bandera
        const textIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textIcon.setAttribute('y', '-9');
        textIcon.setAttribute('text-anchor', 'middle');
        textIcon.setAttribute('class', 'svg-pin-flag');
        textIcon.textContent = b.icon;
        pinG.appendChild(textIcon);

        // Tooltip y Scroll al hacer click o hover
        pinG.addEventListener('mouseenter', (e) => {
          this.showMapTooltip(b, isUnlocked, e.clientX, e.clientY);
        });

        pinG.addEventListener('mouseleave', () => {
          this.hideMapTooltip();
        });

        pinG.addEventListener('click', (e) => {
          e.stopPropagation();
          soundManager.playClick();
          this.scrollToCard(b.id);
        });

        pinsGroup.appendChild(pinG);
      });
    }

    // 2. Renderizar Listado de Tarjetas de Filiales
    if (!listEl) return;
    listEl.innerHTML = '';

    GLOBAL_BRANCHES.forEach(b => {
      const isUnlocked = b.id === 'branch-arroyito' || unlockedIds.includes(b.id);
      const canAfford = data.money >= b.costMoney;
      const isEraUnlocked = data.currentYear >= b.year;

      const card = document.createElement('div');
      card.id = `branch-card-${b.id}`;
      card.className = `branch-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      card.innerHTML = `
        <div class="branch-card-header">
          <span class="branch-icon">${b.icon}</span>
          <div class="branch-title-info">
            <span class="branch-name">${b.name}</span>
            <span class="branch-loc">📍 ${b.location} (${b.country}) • Hito ${b.year}</span>
          </div>
          ${isUnlocked ? '<span class="badge-status-active">OPERATIVA</span>' : ''}
        </div>

        <p class="branch-desc">${b.description}</p>

        <div class="branch-footer">
          <div class="branch-perks">
            <span class="perk-tag income">+$${b.passiveEarningsPerMinute} USD/min</span>
            <span class="perk-tag rep">+${b.reputationBonus} ★ Prestigio</span>
          </div>

          ${
            isUnlocked
              ? '<span class="branch-unlocked-tag">✅ Conectada a Casa Central Arroyito</span>'
              : `
              <button class="btn ${canAfford && isEraUnlocked ? 'btn-primary' : 'btn-secondary'} btn-unlock-branch interactive" ${!canAfford || !isEraUnlocked ? 'disabled' : ''}>
                ${!isEraUnlocked ? `🔒 Requiere Era ${b.year}` : !canAfford ? 'Sin fondos suficientes' : `Inaugurar ($${b.costMoney.toLocaleString()} USD)`}
              </button>
            `
          }
        </div>
      `;

      card.querySelector('.btn-unlock-branch')?.addEventListener('click', () => {
        const success = gameState.unlockBranch(b.id, b.costMoney, b.reputationBonus);
        if (success) {
          soundFX.playVictoryArpeggio();

          if (this.onBranchUnlockedCallback) {
            this.onBranchUnlockedCallback(b);
          }

          this.updateContent();
        }
      });

      listEl.appendChild(card);
    });
  }

  private showMapTooltip(branch: GlobalBranch, isUnlocked: boolean, clientX: number, clientY: number): void {
    if (!this.activeTooltipEl) return;

    this.activeTooltipEl.innerHTML = `
      <div class="tooltip-header">
        <span>${branch.icon}</span>
        <strong>${branch.name}</strong>
      </div>
      <div class="tooltip-sub">${branch.location} • Año ${branch.year}</div>
      <div class="tooltip-status ${isUnlocked ? 'active' : 'locked'}">
        ${isUnlocked ? `✅ Operativa (+$${branch.passiveEarningsPerMinute} USD/min)` : `🔒 Inauguración en Era ${branch.year}`}
      </div>
    `;

    const rect = this.element.getBoundingClientRect();
    this.activeTooltipEl.style.left = `${clientX - rect.left + 12}px`;
    this.activeTooltipEl.style.top = `${clientY - rect.top - 36}px`;
    this.activeTooltipEl.style.display = 'block';
  }

  private hideMapTooltip(): void {
    if (this.activeTooltipEl) {
      this.activeTooltipEl.style.display = 'none';
    }
  }

  private scrollToCard(branchId: string): void {
    const card = this.element.querySelector(`#branch-card-${branchId}`) as HTMLElement;
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('highlight-glow');
      setTimeout(() => {
        card.classList.remove('highlight-glow');
      }, 1500);
    }
  }
}
