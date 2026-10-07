import { ERAS_DEFINITION, HistoricalEvent } from '../gameplay/historyEras.ts';
import { gameState } from '../gameplay/GameState.ts';
import { soundManager } from '../core/SoundManager.ts';
import type { MetaProgressionBridge } from '../gameplay/MetaProgressionBridge.ts';

export class ArchiveModal {
  public element: HTMLElement;
  private currentEraIndex: number = 1; // Nivel 1 (1951) por defecto
  private cardsContainer: HTMLElement | null = null;
  private tabsContainer: HTMLElement | null = null;
  private advanceBarContainer: HTMLElement | null = null;
  private onCardClickCallback?: (event: HistoricalEvent) => void;
  private metaBridge?: MetaProgressionBridge;
  public onMilestoneAdvanced?: (event: HistoricalEvent) => void;

  constructor(metaBridge?: MetaProgressionBridge, onCardClick?: (event: HistoricalEvent) => void) {
    this.metaBridge = metaBridge;
    this.onCardClickCallback = onCardClick;
    this.element = this.render();
  }

  private render(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">📜 ARCHIVO HISTÓRICO ARCOR</h2>
          <button class="modal-close-btn interactive" id="archive-close-btn" aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="archive-advance-bar" id="archive-advance-bar"></div>
          <div class="archive-era-tabs interactive" id="archive-era-tabs"></div>
          <div class="archive-cards-grid" id="archive-cards-grid"></div>
        </div>
      </div>
    `;

    this.advanceBarContainer = backdrop.querySelector('#archive-advance-bar');
    this.tabsContainer = backdrop.querySelector('#archive-era-tabs');
    this.cardsContainer = backdrop.querySelector('#archive-cards-grid');

    const closeBtn = backdrop.querySelector('#archive-close-btn');
    closeBtn?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        soundManager.playClick();
        this.hide();
      }
    });

    this.updateAdvanceBar();
    this.renderTabs();
    this.renderCards();

    return backdrop;
  }

  private renderTabs(): void {
    if (!this.tabsContainer) return;
    this.tabsContainer.innerHTML = '';

    ERAS_DEFINITION.forEach((era, idx) => {
      const btn = document.createElement('button');
      btn.className = `era-tab-btn ${idx === this.currentEraIndex ? 'active' : ''}`;
      btn.textContent = `${era.startYear}-${era.endYear}`;
      btn.title = era.eraName;
      btn.addEventListener('click', () => {
        soundManager.playClick();
        this.currentEraIndex = idx;
        this.renderTabs();
        this.renderCards();
      });
      this.tabsContainer?.appendChild(btn);
    });
  }

  private renderCards(): void {
    if (!this.cardsContainer) return;
    this.cardsContainer.innerHTML = '';

    const era = ERAS_DEFINITION[this.currentEraIndex];
    const unlockedIds = gameState.getData().unlockedCards;

    era.events.forEach(event => {
      // Los primeros hitos de 1924 y 1951 están desbloqueados por defecto para lectura
      const isUnlocked = event.year <= 1951 || unlockedIds.includes(event.id);
      const cardEl = document.createElement('div');
      cardEl.className = `archive-card ${isUnlocked ? 'unlocked' : 'locked'} interactive`;

      cardEl.innerHTML = `
        <div class="archive-card-icon">${isUnlocked ? (event.imagePlaceholder || '📜') : '🔒'}</div>
        <div class="archive-card-content">
          <span class="archive-card-year">${event.year} • ${era.eraName}</span>
          <h4 class="archive-card-name">${isUnlocked ? event.title : 'Hito Histórico Bloqueado'}</h4>
          <p class="archive-card-desc">${isUnlocked ? event.description : 'Supera los objetivos de producción de la era para desclasificar este documento.'}</p>
        </div>
        <span class="archive-badge ${isUnlocked ? 'unlocked' : 'locked-badge'}">
          ${isUnlocked ? 'Desclasificado' : 'Bloqueado'}
        </span>
      `;

      if (isUnlocked && this.onCardClickCallback) {
        cardEl.addEventListener('click', () => {
          this.onCardClickCallback?.(event);
        });
      }

      this.cardsContainer?.appendChild(cardEl);
    });
  }

  public updateAdvanceBar(): void {
    if (!this.advanceBarContainer) return;
    const data = gameState.getData();
    const stars = data.match3Stars || 0;
    const nextEvent = this.metaBridge?.getNextStoryMilestone();

    if (!nextEvent) {
      this.advanceBarContainer.innerHTML = `
        <div class="archive-advance-info all-completed">
          <span class="archive-advance-star-icon">🏆</span>
          <div class="archive-advance-text">
            <span class="archive-advance-title">¡Todos los Hitos Desbloqueados!</span>
            <span class="archive-advance-sub">Has recorrido y celebrado los 75 años de historia de Arcor.</span>
          </div>
        </div>
      `;
      return;
    }

    const hasStars = stars >= 1;
    this.advanceBarContainer.innerHTML = `
      <div class="archive-advance-info">
        <span class="archive-advance-star-icon">⭐</span>
        <div class="archive-advance-text">
          <span class="archive-advance-title">${stars} ${stars === 1 ? 'Estrella disponible' : 'Estrellas disponibles'}</span>
          <span class="archive-advance-sub">Próximo hito: <strong>${nextEvent.year} — ${nextEvent.title}</strong></span>
        </div>
      </div>
      <button class="archive-btn-advance interactive ${hasStars ? 'can-advance' : 'disabled'}" id="archive-btn-advance" ${hasStars ? '' : 'disabled'} title="${hasStars ? 'Desbloquear hito histórico' : 'Superá niveles en Arcor Crush para ganar ⭐'}">
        <span class="advance-icon">📜</span>
        <span class="advance-text">¡Avanzar! (1 ⭐)</span>
      </button>
    `;

    const advanceBtn = this.advanceBarContainer.querySelector('#archive-btn-advance');
    advanceBtn?.addEventListener('click', () => {
      if (!this.metaBridge) return;
      const res = this.metaBridge.progressStoryMilestone();
      if (res.success && res.event) {
        soundManager.playFanfare();
        const eraIdx = ERAS_DEFINITION.findIndex(e => e.events.some(ev => ev.id === res.event!.id));
        if (eraIdx !== -1) {
          this.currentEraIndex = eraIdx;
        }
        this.renderTabs();
        this.renderCards();
        this.updateAdvanceBar();
        if (this.onMilestoneAdvanced) {
          this.onMilestoneAdvanced(res.event);
        }
      }
    });
  }

  public show(): void {
    this.updateAdvanceBar();
    this.renderTabs();
    this.renderCards();
    this.element.classList.add('active');
  }

  public hide(): void {
    this.element.classList.remove('active');
  }
}
