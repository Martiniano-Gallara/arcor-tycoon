import { gameState } from '../gameplay/GameState.ts';
import { soundManager } from '../core/SoundManager.ts';

export class PrologueDialog {
  public element: HTMLElement;
  private onCompleteCallback: () => void;
  private currentStep: number = 0;
  private textEl: HTMLElement | null = null;
  private nextBtn: HTMLElement | null = null;

  private dialogSteps = [
    {
      title: 'DON FULVIO SALVADOR PAGANI',
      role: 'Cofundador de Arcor • Arroyito, 1951',
      text: '¡Muchachos, bienvenidos a Arroyito! Hoy, 5 de julio de 1951, damos el primer paso de un largo camino. Hemos levantado este galpón con nuestras propias manos sobre esta tierra cordobesa.'
    },
    {
      title: 'DON FULVIO SALVADOR PAGANI',
      role: 'Cofundador de Arcor • Arroyito, 1951',
      text: 'Nuestro lema es innegociable: dar a todos los niños caramelos de la mejor calidad al precio más justo. Para encender la paila de cobre necesitamos reunir 10 sacos de azúcar refinado y elaborar nuestro primer lote de 50 caramelos cristalinos.'
    },
    {
      title: 'DON FULVIO SALVADOR PAGANI',
      role: 'Cofundador de Arcor • Arroyito, 1951',
      text: 'El camión de reparto ya está estacionado junto al muelle. La caldera está tibia... ¡Pongamos manos a la obra y hagamos historia juntos!'
    }
  ];

  constructor(onComplete: () => void) {
    this.onCompleteCallback = onComplete;
    this.element = this.render();
  }

  private render(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'prologue-overlay';

    overlay.innerHTML = `
      <div class="dialog-card">
        <div class="dialog-character-header">
          <div class="character-avatar-frame">
            <img src="./fulvio_pagani.png" alt="Don Fulvio Pagani" class="founder-portrait-img" />
          </div>
          <div class="character-info">
            <h3 class="character-name" id="dialog-name">DON FULVIO SALVADOR PAGANI</h3>
            <span class="character-role" id="dialog-role">Cofundador de Arcor • Arroyito, 1951</span>
          </div>
        </div>

        <p class="dialog-text-content" id="dialog-text"></p>

        <div class="dialog-actions">
          <button class="btn btn-primary interactive" id="dialog-next-btn">
            Siguiente
          </button>
        </div>
      </div>
    `;

    this.textEl = overlay.querySelector('#dialog-text');
    this.nextBtn = overlay.querySelector('#dialog-next-btn');

    this.nextBtn?.addEventListener('click', () => {
      soundManager.playClick();
      this.currentStep++;
      if (this.currentStep < this.dialogSteps.length) {
        this.updateStep();
      } else {
        this.finish();
      }
    });

    this.updateStep();
    return overlay;
  }

  private updateStep(): void {
    const step = this.dialogSteps[this.currentStep];
    if (this.textEl) {
      this.textEl.textContent = step.text;
    }
    if (this.nextBtn) {
      this.nextBtn.textContent = this.currentStep === this.dialogSteps.length - 1
        ? '¡A las pailas, Don Fulvio! 🍬'
        : 'Continuar ▶';
    }
  }

  public show(): void {
    this.currentStep = 0;
    this.updateStep();
    this.element.classList.add('active');
  }

  private finish(): void {
    gameState.setHasSeenPrologue(true);
    soundManager.playFanfare();
    this.element.classList.remove('active');
    this.onCompleteCallback();
  }
}
