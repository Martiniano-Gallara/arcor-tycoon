import './assets/styles.css';
import './assets/museum.css';
import './assets/product_creator.css';

import { UIManager } from './ui/UIManager.ts';
import { gameLoop } from './core/GameLoop.ts';
import { gameState } from './gameplay/GameState.ts';
import { timeManager } from './core/TimeManager.ts';
import { proceduralMusic } from './audio/ProceduralMusic.ts';

// Registro de Service Worker para PWA Offline
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('Registro de Service Worker PWA falló:', err);
    });
  });
}

// Inicialización de la aplicación
function initApp(): void {
  const uiRoot = document.getElementById('ui-root');

  if (!uiRoot) {
    console.error('No se encontró el contenedor base #ui-root del DOM.');
    return;
  }

  try {
    // 1. Inicializar sistema de interfaz desacoplada
    const uiManager = new UIManager(uiRoot);

    if ((import.meta as any).env?.DEV) {
      (window as any).uiManager = uiManager;
      (window as any).gameState = gameState;
    }

    // 2. Conectar TimeManager calibrado (1 día = 5s, 1 mes = 30s, 1 año = 6 min)
    timeManager.subscribeMonth(() => {
      gameState.advanceMonth();
    });

    // 3. Arranque seguro de audio Web Audio API en la primera interacción
    const startAudioOnGesture = () => {
      proceduralMusic.initContext();
      if (!proceduralMusic.getIsMuted()) {
        proceduralMusic.start();
      }
      window.removeEventListener('pointerdown', startAudioOnGesture);
      window.removeEventListener('keydown', startAudioOnGesture);
    };
    window.addEventListener('pointerdown', startAudioOnGesture, { once: true });
    window.addEventListener('keydown', startAudioOnGesture, { once: true });

    // 4. Conectar el bucle principal de simulación y actualización de UI
    gameLoop.add((delta) => {
      const data = gameState.getData();
      timeManager.update(delta, data.currentMonth, data.currentYear);
      uiManager.update(delta);
    });

    // 5. Iniciar bucle
    gameLoop.start();
  } catch (err) {
    console.error('Error al inicializar Arcor Tycoon:', err);
    renderRecoveryScreen(uiRoot, err);
  }
}

function renderRecoveryScreen(uiRoot: HTMLElement, error: unknown): void {
  const errMessage = error instanceof Error ? error.message : String(error);
  uiRoot.innerHTML = `
    <div style="position: fixed; inset: 0; background: radial-gradient(circle, #2b1305 0%, #110702 100%); display: flex; align-items: center; justify-content: center; z-index: 99999; font-family: sans-serif; color: #fff; padding: 20px;">
      <div style="max-width: 480px; width: 100%; background: rgba(30, 15, 8, 0.95); border: 2px solid #d4af37; border-radius: 16px; padding: 28px; text-align: center; box-shadow: 0 15px 40px rgba(0,0,0,0.8);">
        <div style="font-size: 3rem; margin-bottom: 12px;">🏭🍬</div>
        <h2 style="color: #ffd700; margin: 0 0 10px 0; font-size: 1.4rem;">Arcor Tycoon: Recuperación del Sistema</h2>
        <p style="color: #e2d9cc; font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px;">
          Se detectó una discrepancia al iniciar el juego. Para continuar jugando sin problemas, podés restaurar el respaldo automático o reiniciar los datos.
        </p>
        <div style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; margin-bottom: 24px; font-family: monospace; font-size: 0.8rem; color: #f87171; text-align: left; word-break: break-all;">
          ${errMessage.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="btn-recovery-restore" style="padding: 12px 20px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.95rem;">
            🔄 Restaurar Copia de Seguridad
          </button>
          <button id="btn-recovery-reset" style="padding: 12px 20px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem;">
            ⚠️ Reiniciar Datos a Estado Inicial
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-recovery-restore')?.addEventListener('click', () => {
    try {
      const backup = localStorage.getItem('arcor_tycoon_save_v2_backup');
      if (backup) {
        localStorage.setItem('arcor_tycoon_save_v2', backup);
      }
    } catch {}
    window.location.reload();
  });

  document.getElementById('btn-recovery-reset')?.addEventListener('click', () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
