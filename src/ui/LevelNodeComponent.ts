import { LevelDefinition, progressionState } from '../gameplay/ProgressionState.ts';
import { soundManager } from '../core/SoundManager.ts';

export class LevelNodeComponent {
  public element: HTMLElement;
  public definition: LevelDefinition;
  private onSelectCallback: (level: number) => void;

  constructor(definition: LevelDefinition, onSelect: (level: number) => void) {
    this.definition = definition;
    this.onSelectCallback = onSelect;
    this.element = this.render();
    this.update();
  }

  private render(): HTMLElement {
    const node = document.createElement('div');
    const isSpecial = !!this.definition.isSpecialMilestone;
    const isDecade = (this.definition.year % 10 === 0) || this.definition.levelNumber === 1 || this.definition.levelNumber === 75 || isSpecial;

    node.className = `saga-level-node interactive ${isSpecial ? 'node-milestone-special' : ''} ${isDecade ? 'show-year-pill' : ''}`;
    node.dataset.level = this.definition.levelNumber.toString();

    // Posición porcentual exacta sobre la ruta
    node.style.left = `${this.definition.xPercent}%`;
    node.style.top = `${this.definition.yPercent}%`;

    const cleanTitle = this.definition.title.replace(/^Nivel \d+:\s*/, '');

    node.innerHTML = `
      <!-- Indicador animado para nivel activo -->
      <div class="saga-node-mascot-badge" style="display: none;">
        <img src="./arcorito.png" alt="Arcorito" class="saga-mascot-img" />
        <span class="saga-mascot-speech">¡JUEGA AQUÍ!</span>
      </div>

      <!-- Corona/Laurel dorada para niveles de hitos históricos especiales -->
      ${isSpecial ? `<div class="saga-node-crown" title="Hito Histórico: ${this.definition.milestoneTitle || cleanTitle}">👑</div>` : ''}

      <!-- Halo pulsante para nivel activo -->
      <div class="saga-node-halo"></div>

      <!-- Botón principal del nivel (medallón joya) -->
      <div class="saga-node-disc">
        <span class="saga-node-number">${this.definition.levelNumber}</span>
        <span class="saga-node-lock">🔒</span>
      </div>

      <!-- Etiqueta del Año Histórico (hitos y décadas) -->
      <div class="saga-node-year-pill">${this.definition.year}</div>

      <!-- Fila de estrellas ganadas (1 a 3) -->
      <div class="saga-node-stars">
        <span class="star-slot s1">★</span>
        <span class="star-slot s2">★</span>
        <span class="star-slot s3">★</span>
      </div>

      <!-- Tooltip enriquecido al pasar el cursor -->
      <div class="saga-node-tooltip">
        <div class="tooltip-header-row">
          <span class="tooltip-year-badge">${this.definition.year}</span>
          <span class="tooltip-level-badge">Nivel ${this.definition.levelNumber}</span>
        </div>
        <div class="tooltip-title-text">${cleanTitle}</div>
        ${isSpecial ? `<div class="tooltip-milestone-tag">🏆 ${this.definition.milestoneTitle || 'Hito Histórico Arcor'}</div>` : ''}
      </div>
    `;

    // Click handler con feedback táctil
    node.addEventListener('pointerdown', () => {
      node.classList.add('pressed');
    });

    const release = () => node.classList.remove('pressed');
    node.addEventListener('pointerup', release);
    node.addEventListener('pointerleave', release);

    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentLevel = progressionState.getCurrentLevel();
      const isUnlocked = this.definition.levelNumber <= currentLevel;

      if (isUnlocked) {
        soundManager.playClick();
        this.onSelectCallback(this.definition.levelNumber);
      } else {
        soundManager.playClick();
        this.shakeLocked();
      }
    });

    return node;
  }

  public setPosition(xPercent: number, yPx: number): void {
    this.element.style.left = `${xPercent}%`;
    this.element.style.top = `${yPx}px`;
  }

  public pulseHighlight(): void {
    this.element.classList.remove('pulse-highlight');
    void this.element.offsetWidth;
    this.element.classList.add('pulse-highlight');
    setTimeout(() => this.element.classList.remove('pulse-highlight'), 1800);
  }

  public shakeLocked(): void {
    this.element.classList.remove('shake-locked');
    void this.element.offsetWidth;
    this.element.classList.add('shake-locked');
  }

  public update(): void {
    const currentLevel = progressionState.getCurrentLevel();
    const lvlNum = this.definition.levelNumber;
    const stars = progressionState.getLevelStars(lvlNum);

    const isCurrentActive = lvlNum === currentLevel;
    const isCompleted = stars > 0;
    const isLocked = lvlNum > currentLevel;

    this.element.classList.remove('state-completed', 'state-active', 'state-locked');

    const mascotBadge = this.element.querySelector('.saga-node-mascot-badge') as HTMLElement;
    const starSlots = this.element.querySelectorAll('.star-slot');

    if (isCompleted) {
      this.element.classList.add('state-completed');
      if (mascotBadge) mascotBadge.style.display = 'none';
      starSlots.forEach((slot, idx) => {
        if (idx < stars) {
          slot.classList.add('earned');
        } else {
          slot.classList.remove('earned');
        }
      });
    } else if (isCurrentActive) {
      this.element.classList.add('state-active');
      if (mascotBadge) mascotBadge.style.display = 'flex';
      starSlots.forEach(s => s.classList.remove('earned'));
    } else if (isLocked) {
      this.element.classList.add('state-locked');
      if (mascotBadge) mascotBadge.style.display = 'none';
      starSlots.forEach(s => s.classList.remove('earned'));
    }
  }
}
