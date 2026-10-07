export class PWANotifier {
  private deferredPrompt: any = null;
  private installBtn: HTMLElement | null = null;
  private isStandalone: boolean = false;

  constructor() {
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (this.installBtn) {
        this.installBtn.style.display = 'flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      if (this.installBtn) {
        this.installBtn.style.display = 'none';
      }
    });
  }

  public registerButton(btn: HTMLElement): void {
    this.installBtn = btn;
    if (this.isStandalone) {
      btn.style.display = 'none';
      return;
    }
    btn.style.display = this.deferredPrompt ? 'flex' : 'none';

    btn.addEventListener('click', async () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          this.deferredPrompt = null;
          btn.style.display = 'none';
        }
      } else {
        alert('Para instalar la aplicación, pulsa "Compartir" o el menú del navegador y selecciona "Agregar a pantalla de inicio".');
      }
    });
  }
}

export const pwaNotifier = new PWANotifier();
