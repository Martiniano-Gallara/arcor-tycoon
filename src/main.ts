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
    (window as any).uiManager = uiManager;
    (window as any).gameState = gameState;
    console.log('Arcor Tycoon: UI Manager inicializado', uiManager);

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
    console.log('Arcor Tycoon: Bucle de juego iniciado correctamente.');
  } catch (err) {
    console.error('Error al inicializar Arcor Tycoon:', err);
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
