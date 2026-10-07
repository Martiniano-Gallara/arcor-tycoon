import { soundManager } from '../core/SoundManager.ts';

export class SplashScreen {
  public element: HTMLElement;
  private onCompleteCallback: () => void;
  private progressBar: HTMLElement | null = null;
  private statusText: HTMLElement | null = null;
  private tapPrompt: HTMLElement | null = null;

  constructor(onComplete: () => void) {
    this.onCompleteCallback = onComplete;
    this.element = this.render();
    this.initLoadingSimulation();
  }

  private render(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'splash-screen';
    el.innerHTML = `
      <div class="splash-header">
        <img src="./arcor_logo.png" alt="Arcor" class="splash-logo-img" />
        <span class="splash-subtitle">EL DULCE IMPERIO</span>
      </div>

      <div class="splash-quote-container">
        <div class="splash-quote-location">ARROYITO, CÓRDOBA — 1951</div>
        <p class="splash-quote-text">
          "Un grupo de jóvenes soñadores se reúne para encender la primera caldera artesanal, con un ideal inquebrantable: hacer llegar los mejores dulces a cada rincón de la tierra."
        </p>
      </div>

      <div class="splash-loader">
        <div class="splash-progress-track">
          <div class="splash-progress-bar" id="splash-bar"></div>
        </div>
        <span class="splash-status-text" id="splash-status">Encendiendo la primera paila de cobre...</span>
        <button class="splash-tap-prompt interactive" id="splash-tap-btn">TOCAR PARA ENTRAR</button>
      </div>
    `;

    this.progressBar = el.querySelector('#splash-bar');
    this.statusText = el.querySelector('#splash-status');
    this.tapPrompt = el.querySelector('#splash-tap-btn');

    return el;
  }

  private initLoadingSimulation(): void {
    const steps = [
      { progress: 25, text: 'Preparando galpón de Arroyito...' },
      { progress: 55, text: 'Cargando archivo histórico de 1951...' },
      { progress: 85, text: 'Alistando camión de reparto...' },
      { progress: 100, text: 'Listo para forjar la historia.' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        if (this.progressBar) this.progressBar.style.width = `${step.progress}%`;
        if (this.statusText) this.statusText.textContent = step.text;
        currentStep++;
      } else {
        clearInterval(interval);
        this.onPreloadFinished();
      }
    }, 450);
  }

  private onPreloadFinished(): void {
    if (this.statusText) this.statusText.style.display = 'none';
    if (this.tapPrompt) {
      this.tapPrompt.style.display = 'block';
      this.tapPrompt.addEventListener('click', () => {
        soundManager.playClick();
        soundManager.playFanfare();
        soundManager.startAmbientHum();
        this.element.classList.add('fade-out');
        setTimeout(() => {
          this.element.remove();
          this.onCompleteCallback();
        }, 600);
      }, { once: true });
    }
  }
}
