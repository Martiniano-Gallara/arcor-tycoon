import { gameState } from '../gameplay/GameState.ts';
import { soundManager } from '../core/SoundManager.ts';
import { proceduralMusic } from '../audio/ProceduralMusic.ts';
import { SaveManager } from '../core/SaveManager.ts';

export class SettingsModal {
  public element: HTMLElement;
  private onQualityChangeCallback?: (quality: 'low' | 'medium' | 'high') => void;
  private isMuted: boolean = false;

  constructor(onQualityChange?: (quality: 'low' | 'medium' | 'high') => void) {
    this.onQualityChangeCallback = onQualityChange;
    this.element = this.render();

    proceduralMusic.subscribe((muted) => {
      if (this.isMuted !== muted) {
        this.setMutedState(muted);
      }
    });
  }

  private render(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop settings-modal-backdrop';
    const settings = gameState.getData().settings;

    const initialSfx = settings.sfxVolume !== undefined ? settings.sfxVolume : 0.8;
    const initialMusic = settings.musicVolume !== undefined ? settings.musicVolume : 0.5;

    backdrop.innerHTML = `
      <div class="modal-dialog settings-dialog">
        <!-- Cabecera Dorada con Logo y Cerrar -->
        <div class="modal-header settings-header">
          <div class="settings-title-group">
            <div class="settings-icon-badge">⚙️</div>
            <div>
              <h2 class="modal-title settings-main-title">AJUSTES Y OPCIONES</h2>
              <span class="settings-subtitle">Preferencias de Sonido, Calidad 3D y Partida</span>
            </div>
          </div>
          <button class="modal-close-btn interactive" id="settings-close-btn" aria-label="Cerrar Ajustes">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body settings-body-scrollable">
          <!-- 1. AUDIO Y AMBIENTE -->
          <div class="settings-card-panel">
            <div class="card-panel-header">
              <span class="panel-icon">🎵</span>
              <span class="panel-title">AUDIO Y AMBIENTE SONORO</span>
              <button class="btn-mute-toggle interactive" id="btn-toggle-mute" title="Silenciar / Activar todo el audio">
                <span id="mute-toggle-icon">🔊</span>
                <span id="mute-toggle-label">Sonido Activo</span>
              </button>
            </div>

            <div class="settings-item-row">
              <div class="item-meta">
                <span class="item-title">Efectos SFX</span>
                <span class="item-desc">Clics, monedas y caramelos</span>
              </div>
              <div class="item-control-row">
                <input type="range" class="slider-gold interactive" id="sfx-slider" min="0" max="1" step="0.05" value="${initialSfx}">
                <span class="slider-pct-badge" id="sfx-pct">${Math.round(initialSfx * 100)}%</span>
                <button class="btn-test-sound interactive" id="btn-test-sfx" title="Probar efecto">
                  🔊 Probar
                </button>
              </div>
            </div>

            <div class="settings-item-row">
              <div class="item-meta">
                <span class="item-title">Música Histórica</span>
                <span class="item-desc">Melodía nostálgica de fondo</span>
              </div>
              <div class="item-control-row">
                <input type="range" class="slider-gold interactive" id="music-slider" min="0" max="1" step="0.05" value="${initialMusic}">
                <span class="slider-pct-badge" id="music-pct">${Math.round(initialMusic * 100)}%</span>
                <button class="btn-test-sound interactive" id="btn-test-music" title="Probar melodía">
                  🎵 Probar
                </button>
              </div>
            </div>
          </div>

          <!-- 2. RENDIMIENTO VISUAL 3D Y PANTALLA -->
          <div class="settings-card-panel">
            <div class="card-panel-header">
              <span class="panel-icon">🎨</span>
              <span class="panel-title">GRÁFICOS Y RENDIMIENTO 3D</span>
            </div>

            <div class="settings-item-col">
              <div class="item-meta-between">
                <span class="item-title">Fidelidad Visual</span>
                <span class="quality-tag-indicator" id="quality-info-badge">
                  ${settings.quality === 'high' ? 'Ultra HD (Sombras y Partículas)' : settings.quality === 'medium' ? 'Equilibrado (Recomendado)' : 'Bajo (Ahorro Batería)'}
                </span>
              </div>
              <div class="quality-segmented interactive">
                <button class="quality-seg-btn ${settings.quality === 'low' ? 'active' : ''}" data-quality="low">
                  🍃 Bajo
                </button>
                <button class="quality-seg-btn ${settings.quality === 'medium' ? 'active' : ''}" data-quality="medium">
                  ⚖️ Medio
                </button>
                <button class="quality-seg-btn ${settings.quality === 'high' ? 'active' : ''}" data-quality="high">
                  ✨ Alto
                </button>
              </div>
            </div>

            <div class="settings-item-row" style="margin-top: 8px;">
              <div class="item-meta">
                <span class="item-title">Tasa de Refresco</span>
                <span class="item-desc">Fluidez de animaciones y cámara</span>
              </div>
              <button class="btn-fps-toggle interactive ${settings.fps60 ? 'active' : ''}" id="btn-toggle-fps">
                <span class="fps-badge">${settings.fps60 ? '⚡ 60 FPS' : '🔋 30 FPS'}</span>
                <span class="fps-sub">${settings.fps60 ? 'Ultra fluido' : 'Ahorro energía'}</span>
              </button>
            </div>
          </div>

          <!-- 3. GESTIÓN DE DATOS Y PARTIDA -->
          <div class="settings-card-panel">
            <div class="card-panel-header">
              <span class="panel-icon">💾</span>
              <span class="panel-title">MEMORIA Y RESPALDO</span>
              <span class="save-status-pill">✅ Guardado Activo</span>
            </div>

            <div class="save-actions-grid">
              <button class="btn-save-action interactive" id="export-save-btn" title="Descargar archivo de partida .json">
                <span class="save-btn-icon">💾</span>
                <div class="save-btn-txt">
                  <span class="btn-main-txt">Exportar Partida</span>
                  <span class="btn-sub-txt">Descargar archivo .JSON</span>
                </div>
              </button>

              <button class="btn-save-action interactive" id="import-save-btn" title="Cargar partida desde archivo .json">
                <span class="save-btn-icon">📂</span>
                <div class="save-btn-txt">
                  <span class="btn-main-txt">Importar Partida</span>
                  <span class="btn-sub-txt">Restaurar copia .JSON</span>
                </div>
              </button>
            </div>

            <!-- Zona de Peligro / Reinicio Protegido -->
            <div class="reset-zone" id="reset-zone">
              <button class="btn-reset-trigger interactive" id="btn-trigger-reset">
                ⚠️ Reiniciar Fábrica a 1951
              </button>
              <div class="reset-confirm-box" id="reset-confirm-box" style="display: none;">
                <p class="reset-warning-msg">¿Estás seguro? Perderás el progreso de la fábrica y niveles para volver al año fundacional 1951.</p>
                <div class="reset-confirm-btns">
                  <button class="btn-reset-cancel interactive" id="btn-cancel-reset">Cancelar</button>
                  <button class="btn-reset-confirm interactive" id="btn-confirm-reset">Sí, Reiniciar Todo</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. CRÉDITOS Y SELLO HISTÓRICO ARCOR -->
          <div class="settings-footer-stamp">
            <div class="stamp-crest">
              <img src="./arcor_logo.png" alt="ARCOR" class="stamp-logo" />
              <span class="stamp-year">1951 — 2026</span>
            </div>
            <p class="stamp-quote">“Un pequeño comienzo, un gran futuro...”</p>
            <span class="stamp-credits">Homenaje a Don Fulvio Salvador Pagani y los pioneros de Arroyito · v2.5.0</span>
          </div>
        </div>
      </div>
    `;

    // Listeners
    const closeBtn = backdrop.querySelector('#settings-close-btn');
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

    // Slider SFX
    const sfxSlider = backdrop.querySelector('#sfx-slider') as HTMLInputElement;
    const sfxPct = backdrop.querySelector('#sfx-pct');
    sfxSlider?.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      if (sfxPct) sfxPct.textContent = `${Math.round(val * 100)}%`;
      if (this.isMuted && val > 0) {
        this.setMutedState(false);
      }
      soundManager.setSfxVolume(val);
      gameState.updateSettings({ sfxVolume: val });
    });

    // Probar SFX
    backdrop.querySelector('#btn-test-sfx')?.addEventListener('click', () => {
      if (this.isMuted) {
        this.setMutedState(false);
      }
      let cur = gameState.getData().settings.sfxVolume;
      if (cur <= 0.05) {
        cur = 0.8;
        if (sfxSlider) sfxSlider.value = '0.8';
        if (sfxPct) sfxPct.textContent = '80%';
        gameState.updateSettings({ sfxVolume: 0.8 });
      }
      soundManager.playCoin();
    });

    // Slider Música
    const musicSlider = backdrop.querySelector('#music-slider') as HTMLInputElement;
    const musicPct = backdrop.querySelector('#music-pct');
    musicSlider?.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      if (musicPct) musicPct.textContent = `${Math.round(val * 100)}%`;
      if (this.isMuted && val > 0) {
        this.setMutedState(false);
      }
      soundManager.setMusicVolume(val);
      proceduralMusic.setVolume(val);
      gameState.updateSettings({ musicVolume: val });
    });

    // Probar Música
    backdrop.querySelector('#btn-test-music')?.addEventListener('click', () => {
      if (this.isMuted) {
        this.setMutedState(false);
      }
      let cur = gameState.getData().settings.musicVolume;
      if (cur <= 0.05) {
        cur = 0.5;
        if (musicSlider) musicSlider.value = '0.5';
        if (musicPct) musicPct.textContent = '50%';
        gameState.updateSettings({ musicVolume: 0.5 });
      }
      proceduralMusic.playPreview();
      soundManager.playFanfare();
    });

    // Toggle Mute
    const muteBtn = backdrop.querySelector('#btn-toggle-mute');
    muteBtn?.addEventListener('click', () => {
      this.setMutedState(!this.isMuted);
      if (!this.isMuted) {
        soundManager.playClick();
      }
    });

    // Segmented Quality
    const qualityBtns = backdrop.querySelectorAll('.quality-seg-btn');
    const qualityBadge = backdrop.querySelector('#quality-info-badge');
    qualityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playClick();
        qualityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const quality = btn.getAttribute('data-quality') as 'low' | 'medium' | 'high';
        gameState.updateSettings({ quality });
        if (qualityBadge) {
          qualityBadge.textContent = quality === 'high'
            ? 'Ultra HD (Sombras y Partículas)'
            : quality === 'medium'
            ? 'Equilibrado (Recomendado)'
            : 'Bajo (Ahorro Batería)';
        }
        if (this.onQualityChangeCallback) {
          this.onQualityChangeCallback(quality);
        }
      });
    });

    // FPS Toggle
    const fpsBtn = backdrop.querySelector('#btn-toggle-fps');
    fpsBtn?.addEventListener('click', () => {
      soundManager.playClick();
      const currentFps = gameState.getData().settings.fps60;
      const nextFps = !currentFps;
      gameState.updateSettings({ fps60: nextFps });
      fpsBtn.classList.toggle('active', nextFps);
      const badge = fpsBtn.querySelector('.fps-badge');
      const sub = fpsBtn.querySelector('.fps-sub');
      if (badge) badge.textContent = nextFps ? '⚡ 60 FPS' : '🔋 30 FPS';
      if (sub) sub.textContent = nextFps ? 'Ultra fluido' : 'Ahorro energía';
    });

    // Exportar
    const exportBtn = backdrop.querySelector('#export-save-btn');
    exportBtn?.addEventListener('click', () => {
      soundManager.playClick();
      const json = SaveManager.exportJSON(gameState.getData());
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arcor_tycoon_save_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Importar
    const importBtn = backdrop.querySelector('#import-save-btn');
    importBtn?.addEventListener('click', () => {
      soundManager.playClick();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const content = evt.target?.result as string;
            const imported = SaveManager.importJSON(content);
            if (imported) {
              window.location.reload();
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    });

    // Reset con confirmación
    const triggerResetBtn = backdrop.querySelector('#btn-trigger-reset');
    const resetConfirmBox = backdrop.querySelector('#reset-confirm-box') as HTMLElement;
    const cancelResetBtn = backdrop.querySelector('#btn-cancel-reset');
    const confirmResetBtn = backdrop.querySelector('#btn-confirm-reset');

    triggerResetBtn?.addEventListener('click', () => {
      soundManager.playClick();
      if (resetConfirmBox) resetConfirmBox.style.display = 'flex';
      triggerResetBtn.setAttribute('style', 'display: none;');
    });

    cancelResetBtn?.addEventListener('click', () => {
      soundManager.playClick();
      if (resetConfirmBox) resetConfirmBox.style.display = 'none';
      triggerResetBtn?.removeAttribute('style');
    });

    confirmResetBtn?.addEventListener('click', () => {
      soundManager.playClick();
      gameState.resetGame();
      window.location.reload();
    });

    return backdrop;
  }

  private setMutedState(muted: boolean): void {
    this.isMuted = muted;
    soundManager.setMuted(muted);
    if (proceduralMusic.getIsMuted() !== muted) {
      proceduralMusic.setMuted(muted);
    }

    const muteBtn = this.element?.querySelector('#btn-toggle-mute');
    const muteIcon = this.element?.querySelector('#mute-toggle-icon');
    const muteLabel = this.element?.querySelector('#mute-toggle-label');

    if (muteIcon && muteLabel && muteBtn) {
      muteIcon.textContent = muted ? '🔇' : '🔊';
      muteLabel.textContent = muted ? 'Silenciado' : 'Sonido Activo';
      muteBtn.classList.toggle('muted', muted);
    }
  }

  public refreshUI(): void {
    const settings = gameState.getData().settings;

    // Si los volúmenes están en 0 por defecto o estado previo corrupto, restablecer a valores recomendados
    let sfxVol = settings.sfxVolume !== undefined ? settings.sfxVolume : 0.8;
    let musicVol = settings.musicVolume !== undefined ? settings.musicVolume : 0.5;

    // Si ambos están en 0 en la primera apertura, darles valores vivos
    if (sfxVol <= 0.05 && musicVol <= 0.05 && !soundManager.getIsMuted()) {
      sfxVol = 0.8;
      musicVol = 0.5;
      gameState.updateSettings({ sfxVolume: 0.8, musicVolume: 0.5 });
    }

    this.isMuted = soundManager.getIsMuted();

    const sfxSlider = this.element.querySelector('#sfx-slider') as HTMLInputElement | null;
    const sfxPct = this.element.querySelector('#sfx-pct');
    if (sfxSlider) sfxSlider.value = String(sfxVol);
    if (sfxPct) sfxPct.textContent = `${Math.round(sfxVol * 100)}%`;

    const musicSlider = this.element.querySelector('#music-slider') as HTMLInputElement | null;
    const musicPct = this.element.querySelector('#music-pct');
    if (musicSlider) musicSlider.value = String(musicVol);
    if (musicPct) musicPct.textContent = `${Math.round(musicVol * 100)}%`;

    this.setMutedState(this.isMuted);

    // Calidad 3D
    const quality = settings.quality || 'high';
    const qualityBtns = this.element.querySelectorAll('.quality-seg-btn');
    const qualityBadge = this.element.querySelector('#quality-info-badge');
    qualityBtns.forEach(btn => {
      const bQual = btn.getAttribute('data-quality');
      btn.classList.toggle('active', bQual === quality);
    });
    if (qualityBadge) {
      qualityBadge.textContent = quality === 'high'
        ? 'Ultra HD (Sombras y Partículas)'
        : quality === 'medium'
        ? 'Equilibrado (Recomendado)'
        : 'Bajo (Ahorro Batería)';
    }

    // FPS
    const fpsBtn = this.element.querySelector('#btn-toggle-fps');
    if (fpsBtn) {
      const is60 = settings.fps60 !== false;
      fpsBtn.classList.toggle('active', is60);
      const badge = fpsBtn.querySelector('.fps-badge');
      const sub = fpsBtn.querySelector('.fps-sub');
      if (badge) badge.textContent = is60 ? '⚡ 60 FPS' : '🔋 30 FPS';
      if (sub) sub.textContent = is60 ? 'Ultra fluido' : 'Ahorro energía';
    }
  }

  public show(): void {
    this.refreshUI();
    this.element.classList.add('active');
  }

  public hide(): void {
    this.element.classList.remove('active');
    const confirmBox = this.element.querySelector('#reset-confirm-box') as HTMLElement;
    const triggerResetBtn = this.element.querySelector('#btn-trigger-reset') as HTMLElement;
    if (confirmBox) confirmBox.style.display = 'none';
    if (triggerResetBtn) triggerResetBtn.removeAttribute('style');
  }
}
