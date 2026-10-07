import { ArcorProductSpot } from '../gameplay/ProgressionState.ts';
import { soundManager } from '../core/SoundManager.ts';

export class ProductCardModal {
  public element: HTMLElement;
  private iconEl: HTMLElement | null = null;
  private nameEl: HTMLElement | null = null;
  private yearEl: HTMLElement | null = null;
  private taglineEl: HTMLElement | null = null;
  private descEl: HTMLElement | null = null;
  private factEl: HTMLElement | null = null;

  constructor() {
    this.element = this.render();
  }

  private render(): HTMLElement {
    const root = document.createElement('div');
    root.className = 'product-modal-backdrop';
    root.style.display = 'none';

    root.innerHTML = `
      <div class="product-card-frame">
        <!-- Brillo dorado decorativo -->
        <div class="card-golden-sheen"></div>
        
        <div class="product-card-header">
          <div class="product-decade-badge" id="prod-decade">AÑOS 80</div>
          <button class="product-close-btn interactive" id="prod-close-btn" title="Cerrar">✕</button>
        </div>

        <div class="product-card-visual">
          <div class="product-icon-aura" id="prod-icon">🍫</div>
        </div>

        <div class="product-card-content">
          <h2 class="product-title" id="prod-name">Bon o Bon</h2>
          <div class="product-year" id="prod-year">Lanzamiento: 1984</div>
          <div class="product-tagline" id="prod-tagline">"Un Bon o Bon por un beso"</div>
          <p class="product-description" id="prod-desc">
            El bombón de chocolate con leche y oblea crocante relleno con crema de maní.
          </p>
          <div class="product-fun-fact-box">
            <span class="fact-label">💡 Curiosidad Histórica:</span>
            <span class="fact-text" id="prod-fact">Inspiró la creación de la Semana de la Dulzura.</span>
          </div>
        </div>

        <div class="product-card-footer">
          <button class="btn-product-ok interactive" id="prod-btn-ok">
            <span>🍬 ¡Dulce Historia!</span>
          </button>
        </div>
      </div>
    `;

    this.iconEl = root.querySelector('#prod-icon');
    this.nameEl = root.querySelector('#prod-name');
    this.yearEl = root.querySelector('#prod-year');
    this.taglineEl = root.querySelector('#prod-tagline');
    this.descEl = root.querySelector('#prod-desc');
    this.factEl = root.querySelector('#prod-fact');

    const close = () => this.hide();
    root.querySelector('#prod-close-btn')?.addEventListener('click', close);
    root.querySelector('#prod-btn-ok')?.addEventListener('click', close);

    root.addEventListener('click', (e) => {
      if (e.target === root) close();
    });

    return root;
  }

  public show(prod: ArcorProductSpot): void {
    if (this.nameEl) this.nameEl.textContent = prod.name;
    if (this.iconEl) this.iconEl.textContent = prod.icon;
    if (this.yearEl) this.yearEl.textContent = `Lanzamiento oficial: ${prod.year} (${prod.decade})`;
    if (this.taglineEl) this.taglineEl.textContent = `«${prod.tagline}»`;
    if (this.descEl) this.descEl.textContent = prod.description;
    if (this.factEl) this.factEl.textContent = prod.funFact;
    const decEl = this.element.querySelector('#prod-decade');
    if (decEl) decEl.textContent = prod.decade.toUpperCase();

    this.element.style.display = 'flex';
    soundManager.playClick();
  }

  public hide(): void {
    this.element.style.display = 'none';
    soundManager.playClick();
  }
}
