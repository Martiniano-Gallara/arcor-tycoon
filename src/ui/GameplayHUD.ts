import { gameState } from '../gameplay/GameState.ts';
import { GameSaveData, SaveManager } from '../core/SaveManager.ts';
import { soundManager } from '../core/SoundManager.ts';
import { timeManager, TimeSpeed } from '../core/TimeManager.ts';
import { proceduralMusic } from '../audio/ProceduralMusic.ts';
import { progressionState, ProgressionState } from '../gameplay/ProgressionState.ts';
import { FactoryAnimatedView } from './FactoryAnimatedView.ts';
import { customizationManager } from '../gameplay/CustomizationManager.ts';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export interface GameplayHUDCallbacks {
  // Acciones Principales Inferiores
  onOpenArcorCrushMap: () => void;
  onPlayArcorCrushLatest: () => void;
  onOpenHistory: () => void;
  onViewFactory?: () => void;
  onOpenProductCreator?: () => void;
  onOpenGiftBoxBuilder?: () => void;
  onOpenCollection?: (tab?: 'products' | 'boxes' | 'unlocks' | 'achievements') => void;

  // Acciones y Navegación de la Barra Superior
  onReturnToMenu: () => void;
  onOpenSettings: () => void;
  onOpenArchive: () => void;
  onOpenMuseum?: () => void;
  onOpenQuiz?: () => void;
  onOpenFulvioTasks?: () => void;
  onAskArcorito?: () => void;
  onToggleDayNight?: () => void;
  onSaveGame?: () => void;
  onResetGame?: () => void;
}

/**
 * GameplayHUD:
 * - PARTE SUPERIOR COMPLETA (11 características):
 *   1. Dinero total
 *   2. Dinero generado (ingresos/segundo)
 *   3. Nivel Arcor Crush
 *   4. Vidas Arcor Crush (con temporizador)
 *   5. Hora / día / mes / año
 *   6. Nombre y avatar (menú de perfil)
 *   7. Arcorito consejero
 *   8. Fulvio tareas (directivas activas)
 *   9. Misiones (barra y registro)
 *   10. Velocidades de tiempo (Pausa, 1x, 2x)
 *   11. Menú Hamburguesa (ajustes, archivo, guardar, música, salir)
 *
 * - PARTE INFERIOR: Las 5 opciones solicitadas (Construir, Expansión, Arcor crush, Jugar Arcor crush, Historia)
 */
export class GameplayHUD {
  public element: HTMLElement;
  public factoryView: FactoryAnimatedView;
  private callbacks: GameplayHUDCallbacks;

  // Elementos de la Barra Superior
  private dateEl: HTMLElement | null = null;
  private moneyEl: HTMLElement | null = null;
  private idleIncomeEl: HTMLElement | null = null;
  private crushLevelEl: HTMLElement | null = null;
  private livesCountEl: HTMLElement | null = null;
  private livesTimerEl: HTMLElement | null = null;
  private dayNightIconEl: HTMLElement | null = null;
  private dayNightTimeEl: HTMLElement | null = null;
  private questDescEl: HTMLElement | null = null;
  private questBarEl: HTMLElement | null = null;
  private missionNumEl: HTMLElement | null = null;

  // Modales y Dropdowns internos
  private burgerDropdown: HTMLElement | null = null;
  private profileModal: HTMLElement | null = null;
  private livesModal: HTMLElement | null = null;
  private missionsModal: HTMLElement | null = null;
  private missionsModalContent: HTMLElement | null = null;
  private toastEl: HTMLElement | null = null;

  // Velocidades y Música
  private btnSpeedPause: HTMLButtonElement | null = null;
  private btnSpeed1x: HTMLButtonElement | null = null;
  private btnSpeed2x: HTMLButtonElement | null = null;

  // Subtítulos de botones inferiores
  private buildEraSubEl: HTMLElement | null = null;
  private m3LevelLabelEl: HTMLElement | null = null;
  private collectionSubEl: HTMLElement | null = null;

  // Modal de vidas
  private modalLivesCountEl: HTMLElement | null = null;
  private modalTimerTxtEl: HTMLElement | null = null;

  private toastTimer: any = null;

  constructor(callbacks: GameplayHUDCallbacks) {
    this.callbacks = callbacks;
    this.factoryView = new FactoryAnimatedView();
    this.element = this.render();
    this.element.prepend(this.factoryView.element);

    // Suscripciones al estado del juego y de progresión
    gameState.subscribe(this.updateState.bind(this));
    progressionState.subscribe(this.updateProgressionInfo.bind(this));

    // Suscripción reactiva al estado de la música procedural
    proceduralMusic.subscribe((muted) => {
      this.updateMusicStatus(muted, true);
    });

    // Inicialización de estado inicial seguro
    this.updateProgressionInfo();
    this.updateState(gameState.getData());
    this.updateMusicStatus(proceduralMusic.getIsMuted(), false);
  }

  private render(): HTMLElement {
    const hud = document.createElement('div');
    hud.className = 'gameplay-hud';

    hud.innerHTML = `
      <!-- ====================================================================
           PARTE SUPERIOR COMPLETA (DASHBOARD INDUSTRIAL CON 11 FUNCIONES)
           ==================================================================== -->
      <header class="hud-top-dashboard">
        <div class="hud-top-main-bar">

          <!-- 1. GRUPO IZQUIERDO: Menú Hamburguesa + Botón Rápido Música + Avatar y Nombre + Hora/Día/Mes/Año + Velocidades -->
          <div class="hud-cluster-left">
            <!-- 11. Menú Hamburguesa -->
            <button class="hud-top-btn hud-burger-btn interactive" id="btn-hud-burger" title="Abrir Menú de Juego">
              <span class="burger-lines">☰</span>
            </button>

            <!-- Botón Rápido de Música Directo en el HUD -->
            <button class="hud-top-btn hud-music-btn interactive" id="btn-hud-quick-music" title="Música Nostálgica (Clic para silenciar)">
              <span class="music-icon" id="quick-music-icon">🎵</span>
            </button>

            <!-- 6. Nombre y Avatar (Menú de Perfil) -->
            <div class="hud-profile-pill interactive" id="btn-hud-profile" title="Ver Perfil del Fundador y Empresa">
              <div class="profile-avatar-wrapper">
                <img src="./fulvio_pagani.png" alt="Avatar Don Fulvio" class="profile-avatar-img" />
              </div>
              <div class="profile-text-col">
                <span class="profile-name">Don Fulvio</span>
                <span class="profile-badge">Fundador</span>
              </div>
            </div>

            <!-- 5. Hora / Día / Mes / Año + Día/Noche -->
            <div class="hud-chronometer-pill interactive" id="hud-day-night" title="Horario y Calendario Histórico (Click para alternar día/noche)">
              <span class="chrono-icon" id="day-night-icon">☀️</span>
              <div class="chrono-text-col">
                <span class="chrono-time" id="day-night-time">09:30</span>
                <span class="chrono-date" id="hud-date">Junio 1951</span>
              </div>
            </div>

            <!-- 10. Velocidades de Tiempo -->
            <div class="hud-time-controls">
              <button class="btn-time-speed interactive" id="btn-speed-pause" title="Pausar juego">⏸</button>
              <button class="btn-time-speed active interactive" id="btn-speed-1x" title="Velocidad normal (1x)">1x</button>
              <button class="btn-time-speed interactive" id="btn-speed-2x" title="Velocidad rápida (2x)">2x</button>
            </div>
          </div>

          <!-- 2. GRUPO CENTRAL: Dinero Total + Dinero Generado + Nivel Arcor Crush + Vidas (Tiempo) -->
          <div class="hud-cluster-center">
            <!-- 1. Dinero Total -->
            <div class="hud-stat-chip money-chip" title="Dinero total acumulado en caja">
              <span class="chip-icon">💵</span>
              <div class="chip-col">
                <span class="chip-value" id="hud-money">$2.500 USD</span>
                <span class="chip-label">Dinero Total</span>
              </div>
            </div>

            <!-- 2. Dinero Generado (Ingresos Pasivos por Segundo) -->
            <div class="hud-stat-chip income-chip" title="Dinero generado continuamente por la fábrica por segundo">
              <span class="chip-icon">⚡</span>
              <div class="chip-col">
                <span class="chip-value" id="hud-idle-income">+$20/s</span>
                <span class="chip-label">Generado</span>
              </div>
            </div>

            <!-- 3. Nivel Arcor Crush -->
            <div class="hud-stat-chip crush-chip interactive" id="btn-hud-crush-level" title="Nivel alcanzado en Arcor Crush">
              <span class="chip-icon">🍬</span>
              <div class="chip-col">
                <span class="chip-value" id="hud-crush-level-txt">Nivel 1</span>
                <span class="chip-label">Arcor Crush</span>
              </div>
            </div>

            <!-- 4. Vidas Arcor Crush (Tiempo) -->
            <div class="hud-stat-chip lives-chip interactive" id="btn-hud-lives" title="Vidas de juego y tiempo restante de regeneración">
              <span class="chip-icon heart-icon">❤️</span>
              <div class="chip-col">
                <span class="chip-value" id="hud-lives-val">5/5</span>
                <span class="chip-label" id="hud-lives-timer">Lleno</span>
              </div>
            </div>
          </div>

          <!-- 3. GRUPO DERECHO: Misiones + Fulvio Tareas + Arcorito Consejero -->
          <div class="hud-cluster-right">
            <!-- 9. Misiones (con Barra de Progreso y Hito Activo) -->
            <div class="hud-mission-badge interactive" id="btn-hud-missions" title="Ver Misiones y Objetivos Históricos">
              <div class="mission-target-icon">🎯</div>
              <div class="mission-content-col">
                <div class="mission-top-row">
                  <span class="mission-title-tag">MISIÓN</span>
                  <span class="mission-progress-fraction" id="hud-mission-progress-num">0/50</span>
                </div>
                <span class="mission-desc-txt" id="hud-quest-desc">1951 • Fundación de Arcor y Primer Galpón</span>
                <div class="mission-progress-track">
                  <div class="mission-progress-fill" id="hud-quest-bar"></div>
                </div>
              </div>
            </div>

            <!-- 8. Fulvio Tareas (Directivas de Don Fulvio Pagani) -->
            <button class="hud-advisor-card fulvio-card interactive" id="btn-hud-fulvio" title="Directivas y Tareas de Don Fulvio Pagani">
              <div class="advisor-avatar-box">
                <img src="./fulvio_pagani.png" alt="Don Fulvio" class="advisor-thumb-img" />
              </div>
              <div class="advisor-txt-col">
                <span class="advisor-label">Don Fulvio</span>
                <span class="advisor-role">Tareas</span>
              </div>
            </button>

            <!-- 7. Arcorito Consejero -->
            <button class="hud-advisor-card arcorito-card interactive" id="btn-arcorito-helper" title="Consejo y Diagnóstico de Arcorito">
              <div class="advisor-avatar-box arcorito-glow-box">
                <img src="./arcorito.png" alt="Arcorito" class="advisor-thumb-img arcorito-thumb" />
                <span class="beacon-dot"></span>
              </div>
              <div class="advisor-txt-col">
                <span class="advisor-label">Arcorito</span>
                <span class="advisor-role">Consejero</span>
              </div>
            </button>
          </div>

        </div>

        <!-- 11. MENÚ HAMBURGUESA DROPDOWN -->
        <div class="hud-burger-dropdown" id="hud-burger-dropdown" style="display: none;">
          <div class="burger-dropdown-header">
            <span>⚙️ MENÚ GENERAL</span>
            <button class="dropdown-close-btn interactive" id="btn-burger-close">✕</button>
          </div>
          <div class="burger-dropdown-items">
            <button class="burger-item-btn interactive" id="burger-opt-home">
              <span class="b-icon">🏠</span>
              <div class="b-txt">
                <span class="b-title">Menú Principal</span>
                <span class="b-sub">Volver a la pantalla de título</span>
              </div>
            </button>
            <button class="burger-item-btn interactive" id="burger-opt-settings">
              <span class="b-icon">⚙️</span>
              <div class="b-txt">
                <span class="b-title">Ajustes & Gráficos</span>
                <span class="b-sub">Volumen de audio y calidad 3D</span>
              </div>
            </button>
            <button class="burger-item-btn interactive" id="burger-opt-museum" style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(80, 40, 15, 0.4)); border: 1px solid #d4af37;">
              <span class="b-icon">🏛️</span>
              <div class="b-txt">
                <span class="b-title" style="color: #ffd700;">Museo del Sabor</span>
                <span class="b-sub">75 Años de Arcor (1951 - 2026)</span>
              </div>
            </button>
            <button class="burger-item-btn interactive" id="burger-opt-product-creator" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(80, 20, 60, 0.4)); border: 1px solid #ec4899;">
              <span class="b-icon">🎨</span>
              <div class="b-txt">
                <span class="b-title" style="color: #f472b6;">Creá tu Producto</span>
                <span class="b-sub">Personalizá packaging, sabores y stickers</span>
              </div>
            </button>
            <button class="burger-item-btn interactive" id="burger-opt-giftbox-builder" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(120, 30, 30, 0.4)); border: 1px solid #ef4444;">
              <span class="b-icon">🎁</span>
              <div class="b-txt">
                <span class="b-title" style="color: #f87171;">Creá tu Caja Obsequio</span>
                <span class="b-sub">Cajas virtuales con dedicatoria y moños</span>
              </div>
            </button>
            <button class="burger-item-btn interactive" id="burger-opt-my-collection" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(20, 80, 40, 0.4)); border: 1px solid #22c55e;">
              <span class="b-icon">🏆</span>
              <div class="b-txt">
                <span class="b-title" style="color: #4ade80;">Mi Colección & Logros</span>
                <span class="b-sub">Progreso, creaciones y recompensas</span>
              </div>
            </button>
            <button class="burger-item-btn interactive" id="burger-opt-save">
              <span class="b-icon">💾</span>
              <div class="b-txt">
                <span class="b-title">Guardar Partida</span>
                <span class="b-sub">Guardado manual en la memoria</span>
              </div>
            </button>
            <button class="burger-item-btn interactive" id="burger-opt-music">
              <span class="b-icon" id="burger-music-icon">🎵</span>
              <div class="b-txt">
                <span class="b-title">Música Nostálgica</span>
                <span class="b-sub" id="burger-music-sub">Activa</span>
              </div>
            </button>
            <button class="burger-item-btn danger interactive" id="burger-opt-reset">
              <span class="b-icon">🔄</span>
              <div class="b-txt">
                <span class="b-title">Reiniciar Fábrica</span>
                <span class="b-sub">Empezar de cero en 1951</span>
              </div>
            </button>
          </div>
        </div>

        <!-- MODAL DE PERFIL DE DON FULVIO & EMPRESA -->
        <div class="hud-profile-modal-backdrop" id="hud-profile-modal" style="display: none;">
          <div class="profile-modal-card">
            <div class="profile-modal-top">
              <button class="profile-close-btn interactive" id="btn-profile-close">✕</button>
              <div class="profile-avatar-circle">
                <img src="./fulvio_pagani.png" alt="Don Fulvio Pagani" class="profile-avatar-big" />
              </div>
              <h3 class="profile-founder-title">Don Fulvio Salvador Pagani</h3>
              <span class="profile-founder-role">Presidente & Fundador de ARCOR</span>
            </div>
            <div class="profile-modal-stats">
              <div class="prof-stat-box">
                <span class="prof-stat-val" id="prof-year-val">1951</span>
                <span class="prof-stat-lbl">Año Fundacional</span>
              </div>
              <div class="prof-stat-box">
                <span class="prof-stat-val" id="prof-money-val">$2.500</span>
                <span class="prof-stat-lbl">Capital en Caja</span>
              </div>
              <div class="prof-stat-box">
                <span class="prof-stat-val" id="prof-stars-val">0 ⭐</span>
                <span class="prof-stat-lbl">Estrellas Historia</span>
              </div>
            </div>
            <div class="profile-quote-block">
              <p>“Un grupo de jóvenes soñadores se reúne para encender la primera caldera artesanal, con un ideal inquebrantable: hacer llegar los mejores dulces a cada rincón de la tierra.”</p>
              <span class="quote-signature">— Don Fulvio Salvador Pagani, 1951</span>
            </div>
          </div>
        </div>

        <!-- MODAL DE VIDAS ARCOR CRUSH (TIEMPO) -->
        <div class="hud-lives-modal-backdrop" id="hud-lives-modal" style="display: none;">
          <div class="lives-modal-card">
            <button class="lives-close-btn interactive" id="btn-lives-close">✕</button>
            <div class="lives-huge-heart">❤️</div>
            <h3 class="lives-modal-heading">ENERGÍA ARCOR CRUSH</h3>
            <div class="lives-current-count">
              <span id="lives-modal-count">5</span> / 5 VIDAS
            </div>
            <p class="lives-timer-status" id="lives-modal-timer-txt">Tus vidas están al máximo.</p>
            <div class="lives-rules-info">
              <span>Recuperas 1 ❤️ automáticamente cada 20 minutos de juego.</span>
            </div>
            <button class="btn btn-secondary btn-quiz-lives interactive" id="btn-quiz-lives" style="margin-top: 10px; width: 100%;">
              <span>💡 Jugar Trivia Arcor (+Vidas)</span>
            </button>
          </div>
        </div>

        <!-- MODAL DE MISIONES Y DIRECTIVAS -->
        <div class="hud-missions-modal-backdrop" id="hud-missions-modal" style="display: none;">
          <div class="missions-modal-card">
            <div class="missions-modal-header">
              <div class="missions-title-box">
                <span class="m-icon">🎯</span>
                <span>MISIONES & DIRECTIVAS INDUSTRIALES</span>
              </div>
              <button class="missions-close-btn interactive" id="btn-missions-close">✕</button>
            </div>
            <div class="missions-modal-body" id="missions-modal-content"></div>
          </div>
        </div>
      </header>

      <!-- Toast Flotante -->
      <div class="toast-notification" id="hud-toast"></div>

      <!-- ====================================================================
           PARTE INFERIOR: LAS 5 OPCIONES CLAVE DE ALTA JERARQUÍA
           ==================================================================== -->
      <nav class="hud-bottom-actions-bar" aria-label="Navegación Principal de Juego">
        <!-- 1. Museo 75 Años (Vitrinas de Oro, Productos, Historia) -->
        <button class="hud-hero-bottom-btn btn-action-museum interactive" id="action-museum" title="Entrar al Museo del Sabor 75 Años de ARCOR">
          <span class="hud-btn-icon">🏛️</span>
          <div class="hud-btn-text-col">
            <span class="hud-btn-label">Museo 75 Años</span>
            <span class="hud-btn-sub" id="hud-build-era-sub">Vitrinas de Oro</span>
          </div>
        </button>

        <!-- 2. Jugar Arcor Crush (Abre el Mapa de los 75 Años) -->
        <button class="hud-hero-bottom-btn btn-action-crush-play interactive" id="action-crush-play" title="Entrar a Arcor Crush y ver el Mapa Saga">
          <div class="hud-play-badge">▶</div>
          <span class="hud-btn-icon">🍬</span>
          <div class="hud-btn-text-col">
            <span class="hud-btn-label">Jugar Arcor Crush</span>
            <span class="hud-btn-sub" id="hud-m3-level-label">Nivel 1</span>
          </div>
        </button>


        <!-- 6. Creá tu Producto (Taller Interactivo) -->
        <button class="hud-hero-bottom-btn btn-action-creator interactive" id="action-product-creator" title="Diseñá y personalizá tu propio packaging y golosina Arcor">
          <span class="hud-btn-icon">🎨</span>
          <div class="hud-btn-text-col">
            <span class="hud-btn-label">Creá tu Producto</span>
            <span class="hud-btn-sub">Taller de Diseño</span>
          </div>
        </button>

        <!-- 7. Creá tu Caja Obsequio (Regalo Virtual 3D) -->
        <button class="hud-hero-bottom-btn btn-action-giftbox interactive" id="action-giftbox-builder" title="Armá una caja obsequio con dulces, dedicatoria y moño">
          <span class="hud-btn-icon">🎁</span>
          <div class="hud-btn-text-col">
            <span class="hud-btn-label">Caja Obsequio</span>
            <span class="hud-btn-sub">Regalo Virtual</span>
          </div>
        </button>

        <!-- 8. Mi Colección & Salón de Logros -->
        <button class="hud-hero-bottom-btn btn-action-collection interactive" id="action-collection" title="Explorá tus creaciones, catálogo de desbloqueos y logros">
          <span class="hud-btn-icon">🏆</span>
          <div class="hud-btn-text-col">
            <span class="hud-btn-label">Mi Colección</span>
            <span class="hud-btn-sub" id="hud-collection-sub">Logros & Álbum</span>
          </div>
        </button>
      </nav>
    `;

    // Vincular Referencias a Elementos
    this.dateEl = hud.querySelector('#hud-date');
    this.moneyEl = hud.querySelector('#hud-money');
    this.idleIncomeEl = hud.querySelector('#hud-idle-income');
    this.crushLevelEl = hud.querySelector('#hud-crush-level-txt');
    this.collectionSubEl = hud.querySelector('#hud-collection-sub');
    this.livesCountEl = hud.querySelector('#hud-lives-val');
    this.livesTimerEl = hud.querySelector('#hud-lives-timer');
    this.dayNightIconEl = hud.querySelector('#day-night-icon');
    this.dayNightTimeEl = hud.querySelector('#day-night-time');
    this.questDescEl = hud.querySelector('#hud-quest-desc');
    this.questBarEl = hud.querySelector('#hud-quest-bar');
    this.missionNumEl = hud.querySelector('#hud-mission-progress-num');

    this.burgerDropdown = hud.querySelector('#hud-burger-dropdown');
    this.profileModal = hud.querySelector('#hud-profile-modal');
    this.livesModal = hud.querySelector('#hud-lives-modal');
    this.missionsModal = hud.querySelector('#hud-missions-modal');
    this.missionsModalContent = hud.querySelector('#missions-modal-content');
    this.toastEl = hud.querySelector('#hud-toast');

    this.buildEraSubEl = hud.querySelector('#hud-build-era-sub');
    this.m3LevelLabelEl = hud.querySelector('#hud-m3-level-label');

    this.modalLivesCountEl = hud.querySelector('#lives-modal-count');
    this.modalTimerTxtEl = hud.querySelector('#lives-modal-timer-txt');

    // Botones de Velocidad
    this.btnSpeedPause = hud.querySelector('#btn-speed-pause');
    this.btnSpeed1x = hud.querySelector('#btn-speed-1x');
    this.btnSpeed2x = hud.querySelector('#btn-speed-2x');

    this.btnSpeedPause?.addEventListener('click', () => {
      soundManager.playClick();
      timeManager.setSpeed(0);
    });

    this.btnSpeed1x?.addEventListener('click', () => {
      soundManager.playClick();
      timeManager.setSpeed(1);
    });

    this.btnSpeed2x?.addEventListener('click', () => {
      soundManager.playClick();
      timeManager.setSpeed(2);
    });

    timeManager.subscribeSpeed((speed, isPaused) => {
      this.updateSpeedButtons(speed, isPaused);
    });

    timeManager.subscribeDay((day, month, year) => {
      this.updateDateDisplay(day, month, year);
    });

    // =========================================================================
    // EVENTOS DE LA BARRA SUPERIOR
    // =========================================================================

    // 11. Menú Hamburguesa Toggle
    hud.querySelector('#btn-hud-burger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      this.toggleBurgerMenu();
    });

    hud.querySelector('#btn-burger-close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      this.closeBurgerMenu();
    });

    // Opciones del Menú Hamburguesa
    hud.querySelector('#burger-opt-home')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeBurgerMenu();
      this.callbacks.onReturnToMenu();
    });

    hud.querySelector('#burger-opt-settings')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeBurgerMenu();
      this.callbacks.onOpenSettings();
    });

    hud.querySelector('#burger-opt-museum')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeBurgerMenu();
      if (this.callbacks.onOpenMuseum) {
        this.callbacks.onOpenMuseum();
      }
    });

    hud.querySelector('#burger-opt-product-creator')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeBurgerMenu();
      if (this.callbacks.onOpenProductCreator) {
        this.callbacks.onOpenProductCreator();
      }
    });

    hud.querySelector('#burger-opt-giftbox-builder')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeBurgerMenu();
      if (this.callbacks.onOpenGiftBoxBuilder) {
        this.callbacks.onOpenGiftBoxBuilder();
      }
    });

    hud.querySelector('#burger-opt-my-collection')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeBurgerMenu();
      if (this.callbacks.onOpenCollection) {
        this.callbacks.onOpenCollection();
      }
    });

    hud.querySelector('#burger-opt-save')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeBurgerMenu();
      if (this.callbacks.onSaveGame) {
        this.callbacks.onSaveGame();
      } else {
        SaveManager.save(gameState.getData());
        this.showToast('¡Partida guardada con éxito! 💾✨');
      }
    });

    hud.querySelector('#btn-hud-quick-music')?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      proceduralMusic.toggleMute();
    });

    hud.querySelector('#burger-opt-music')?.addEventListener('click', () => {
      soundManager.playClick();
      proceduralMusic.toggleMute();
    });

    hud.querySelector('#burger-opt-reset')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeBurgerMenu();
      if (this.callbacks.onResetGame) {
        this.callbacks.onResetGame();
      }
    });

    // 6. Nombre y Avatar (Menú de Perfil)
    hud.querySelector('#btn-hud-profile')?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      this.openProfileModal();
    });

    hud.querySelector('#btn-profile-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeProfileModal();
    });

    // 4. Vidas Arcor Crush (Modal con tiempo de recarga)
    hud.querySelector('#btn-hud-lives')?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      this.openLivesModal();
    });

    hud.querySelector('#btn-lives-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeLivesModal();
    });

    hud.querySelector('#btn-quiz-lives')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeLivesModal();
      if (this.callbacks.onOpenQuiz) {
        this.callbacks.onOpenQuiz();
      }
    });

    // 3. Nivel Crush Click
    hud.querySelector('#btn-hud-crush-level')?.addEventListener('click', () => {
      soundManager.playClick();
      this.callbacks.onPlayArcorCrushLatest();
    });

    // 9. Misiones (Modal de Registro)
    hud.querySelector('#btn-hud-missions')?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      this.openMissionsModal();
    });

    hud.querySelector('#btn-missions-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeMissionsModal();
    });

    // 8. Fulvio Tareas
    hud.querySelector('#btn-hud-fulvio')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.callbacks.onOpenFulvioTasks) {
        this.callbacks.onOpenFulvioTasks();
      }
    });

    // 7. Arcorito Consejero
    hud.querySelector('#btn-arcorito-helper')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.callbacks.onAskArcorito) {
        this.callbacks.onAskArcorito();
      }
    });

    // 5. Ciclo Día / Noche
    hud.querySelector('#hud-day-night')?.addEventListener('click', () => {
      soundManager.playClick();
      this.callbacks.onToggleDayNight?.();
    });

    // Cerrar modales al hacer clic afuera
    hud.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (this.burgerDropdown && this.burgerDropdown.style.display !== 'none') {
        if (!this.burgerDropdown.contains(target) && target.id !== 'btn-hud-burger') {
          this.closeBurgerMenu();
        }
      }
      if (this.profileModal && target === this.profileModal) {
        this.closeProfileModal();
      }
      if (this.livesModal && target === this.livesModal) {
        this.closeLivesModal();
      }
      if (this.missionsModal && target === this.missionsModal) {
        this.closeMissionsModal();
      }
    });

    // =========================================================================
    // EVENTOS DE LAS 5 ACCIONES PRINCIPALES INFERIORES
    // =========================================================================
    hud.querySelector('#action-museum')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.callbacks.onOpenMuseum) {
        this.callbacks.onOpenMuseum();
      }
    });

    hud.querySelector('#action-crush-play')?.addEventListener('click', () => {
      soundManager.playClick();
      this.callbacks.onOpenArcorCrushMap();
    });


    hud.querySelector('#action-product-creator')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.callbacks.onOpenProductCreator) {
        this.callbacks.onOpenProductCreator();
      }
    });

    hud.querySelector('#action-giftbox-builder')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.callbacks.onOpenGiftBoxBuilder) {
        this.callbacks.onOpenGiftBoxBuilder();
      }
    });

    hud.querySelector('#action-collection')?.addEventListener('click', () => {
      soundManager.playClick();
      if (this.callbacks.onOpenCollection) {
        this.callbacks.onOpenCollection();
      }
    });

    return hud;
  }

  // =========================================================================
  // CONTROL DE MODALES Y MENÚ HAMBURGUESA
  // =========================================================================
  private toggleBurgerMenu(): void {
    if (!this.burgerDropdown) return;
    const isOpen = this.burgerDropdown.style.display !== 'none';
    this.burgerDropdown.style.display = isOpen ? 'none' : 'flex';
  }

  private closeBurgerMenu(): void {
    if (this.burgerDropdown) this.burgerDropdown.style.display = 'none';
  }

  private openProfileModal(): void {
    if (!this.profileModal) return;
    const data = gameState.getData();
    const yVal = this.profileModal.querySelector('#prof-year-val');
    const mVal = this.profileModal.querySelector('#prof-money-val');
    const sVal = this.profileModal.querySelector('#prof-stars-val');

    if (yVal) yVal.textContent = `${data.currentYear || 1951}`;
    if (mVal) mVal.textContent = `$${(data.money || 0).toLocaleString()} USD`;
    if (sVal) sVal.textContent = `${data.match3Stars || 0} ⭐`;

    this.profileModal.style.display = 'flex';
  }

  private closeProfileModal(): void {
    if (this.profileModal) this.profileModal.style.display = 'none';
  }

  private openLivesModal(): void {
    if (!this.livesModal) return;
    this.updateProgressionInfo();
    this.livesModal.style.display = 'flex';
  }

  private closeLivesModal(): void {
    if (this.livesModal) this.livesModal.style.display = 'none';
  }

  private openMissionsModal(): void {
    if (!this.missionsModal || !this.missionsModalContent) return;

    const currentLevel = progressionState.getCurrentLevel();
    const event = gameState.questManager.getCurrentEvent();
    const data = gameState.getData();
    const cashReward = 750 + (currentLevel * 350);

    this.missionsModalContent.innerHTML = `
      <div class="mission-modal-card-active">
        <div class="m-card-badge">HITO HISTÓRICO EN JUEGO</div>
        <h4 class="m-card-title">${event ? `${event.year} • ${event.title}` : '¡Todos los hitos históricos cumplidos!'}</h4>
        <p class="m-card-desc">${event ? event.description : 'El grupo industrial Arcor es líder global en golosinas y chocolates.'}</p>
        
        <div class="m-card-progress-box">
          <div class="m-prog-header">
            <span>Objetivo Único de Avance:</span>
            <strong>Superar Nivel ${currentLevel} de Arcor Crush</strong>
          </div>
          <div class="m-prog-bar-track">
            <div class="m-prog-bar-fill" style="width: ${data.match3LevelStars?.[currentLevel] ? 100 : 50}%"></div>
          </div>
        </div>

        <div class="m-card-rewards-box">
          <span class="rew-title">Recompensas al Ganar el Nivel:</span>
          <div class="rew-chips">
            <span class="rew-chip gold">💵 +$${cashReward.toLocaleString()} USD para Construir</span>
            <span class="rew-chip star">⭐ +1 Estrella Histórica</span>
            <span class="rew-chip rep">📜 Desbloqueo de Hito y Tarjeta Polaroid</span>
          </div>
        </div>

        <div style="margin-top: 16px; display: flex; gap: 10px; justify-content: center;">
          <button class="btn btn-primary interactive" id="btn-modal-play-now" style="background: linear-gradient(135deg, #ffd700, #ff8c00); color: #000; font-weight: 800; padding: 10px 20px; font-size: 1rem; border-radius: 20px; box-shadow: 0 4px 15px rgba(255, 140, 0, 0.4);">
            🍬 Jugar Nivel ${currentLevel} de Arcor Crush ▶
          </button>
        </div>
      </div>

      <div class="mission-modal-historical-context">
        <span>📜 Años históricos recorridos: <strong>${Math.min(75, currentLevel)} de 75 Años (1951 - 2025)</strong></span>
      </div>
    `;

    this.missionsModalContent.querySelector('#btn-modal-play-now')?.addEventListener('click', () => {
      soundManager.playClick();
      this.closeMissionsModal();
      this.callbacks.onPlayArcorCrushLatest();
    });

    this.missionsModal.style.display = 'flex';
  }

  private closeMissionsModal(): void {
    if (this.missionsModal) this.missionsModal.style.display = 'none';
  }

  private updateMusicStatus(muted: boolean, showToast: boolean = false): void {
    // 1. Botón rápido en la barra superior
    const quickBtn = this.element?.querySelector('#btn-hud-quick-music') as HTMLElement | null;
    const quickIcon = this.element?.querySelector('#quick-music-icon');
    if (quickIcon) quickIcon.textContent = muted ? '🔇' : '🎵';
    if (quickBtn) {
      quickBtn.classList.toggle('muted', muted);
      quickBtn.title = muted ? 'Música silenciada (Clic para activar)' : 'Música activada (Clic para silenciar)';
    }

    // 2. Opción dentro del menú hamburguesa
    const burgerItem = this.element?.querySelector('#burger-opt-music') as HTMLElement | null;
    const icon = this.element?.querySelector('#burger-music-icon');
    const sub = this.element?.querySelector('#burger-music-sub');
    if (icon) icon.textContent = muted ? '🔇' : '🎵';
    if (sub) sub.textContent = muted ? 'Silenciada' : 'Activa';
    if (burgerItem) {
      burgerItem.classList.toggle('muted', muted);
    }

    if (showToast) {
      this.showToast(muted ? 'Música silenciada 🔇' : 'Música activada 🎶');
    }
  }

  // =========================================================================
  // ACTUALIZACIÓN DE ESTADO Y SINCRONIZACIÓN
  // =========================================================================
  public updateProgressionInfo(): void {
    const currentLevel = progressionState.getCurrentLevel();
    const lives = progressionState.getLives();
    const countdown = progressionState.getRegenCountdown();

    if (this.crushLevelEl) {
      this.crushLevelEl.textContent = `Nivel ${currentLevel}`;
    }

    if (this.livesCountEl) {
      this.livesCountEl.textContent = `${lives}/${ProgressionState.MAX_LIVES}`;
    }

    if (this.livesTimerEl) {
      this.livesTimerEl.textContent = countdown.isFull ? 'Lleno' : countdown.text;
    }

    // Modal de Vidas si está abierto
    if (this.modalLivesCountEl) this.modalLivesCountEl.textContent = `${lives}`;
    if (this.modalTimerTxtEl) {
      this.modalTimerTxtEl.textContent = countdown.isFull
        ? 'Tus vidas están al máximo (5 ❤️).'
        : `Próxima vida en: ${countdown.text}`;
    }

    // Subtítulo de Mi Colección
    if (this.collectionSubEl) {
      const stats = customizationManager.getCollectionStatistics();
      this.collectionSubEl.textContent = `${stats.percentage}% Colección`;
    }
  }

  public showToast(message: string): void {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl?.classList.remove('show');
    }, 2500);
  }

  public updateIdleRate(rate: number): void {
    if (this.idleIncomeEl) {
      this.idleIncomeEl.textContent = `+$${rate}/s`;
    }
  }

  public updateState(state: GameSaveData): void {
    // 1. Dinero Total
    if (this.moneyEl) {
      this.moneyEl.textContent = `$${state.money.toLocaleString()} USD`;
    }

    // 2. Dinero Generado
    if (this.idleIncomeEl) {
      const totalRate = gameState.getIdleIncomePerSecond();
      this.idleIncomeEl.textContent = `+$${totalRate}/s`;
    }

    // 5. Fecha (Hora / Día / Mes / Año)
    if (this.dateEl) {
      const monthName = MONTH_NAMES[state.currentMonth - 1] || 'Junio';
      const day = timeManager.getCurrentDay() || 1;
      this.dateEl.textContent = `${day} de ${monthName}, ${state.currentYear}`;
    }

    // 9. Misiones y Progreso
    const activeEvent = gameState.questManager.getCurrentEvent();
    const currentLvl = state.match3CurrentLevel || 1;

    if (activeEvent) {
      if (this.questDescEl) {
        this.questDescEl.textContent = `${activeEvent.year} • ${activeEvent.title}`;
      }
      if (this.missionNumEl) {
        this.missionNumEl.textContent = `Nivel ${currentLvl}`;
      }
      if (this.questBarEl) {
        const stars = state.match3LevelStars?.[currentLvl] || 0;
        this.questBarEl.style.width = stars > 0 ? '100%' : '50%';
      }
    } else {
      if (this.questDescEl) this.questDescEl.textContent = '¡Todos los hitos alcanzados!';
      if (this.missionNumEl) this.missionNumEl.textContent = '100%';
      if (this.questBarEl) this.questBarEl.style.width = '100%';
    }

    // Actualizar Subtítulos de los 5 Botones Inferiores
    if (this.buildEraSubEl) {
      this.buildEraSubEl.textContent = `Era ${state.currentYear}`;
    }

    if (this.m3LevelLabelEl) {
      this.m3LevelLabelEl.textContent = `Nivel ${state.match3CurrentLevel || 1}`;
    }

    this.updateProgressionInfo();
  }

  public show(): void {
    this.element.classList.add('active');
    this.factoryView.resume();
    this.factoryView.resize();
    this.factoryView.syncWithState();
    this.updateState(gameState.getData());
    this.updateProgressionInfo();
  }

  public hide(): void {
    this.element.classList.remove('active');
    this.factoryView.pause();
  }

  public updateDayNightCycle(): void {
    const progress = timeManager.getDayProgress();
    const totalMinutes = Math.floor(progress * 1440);
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    const formatted = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

    let icon = '☀️';
    if (hh >= 6 && hh < 18) {
      icon = '☀️';
    } else if (hh >= 18 && hh < 21) {
      icon = '🌅';
    } else {
      icon = '🌙';
    }

    this.updateDayNight(formatted, icon);
  }

  public updateDayNight(formattedTime: string, emoji: string): void {
    if (this.dayNightTimeEl) this.dayNightTimeEl.textContent = formattedTime;
    if (this.dayNightIconEl) this.dayNightIconEl.textContent = emoji;
  }

  public updateSpeedButtons(speed: TimeSpeed, isPaused: boolean): void {
    if (this.btnSpeedPause) this.btnSpeedPause.classList.toggle('active', isPaused || speed === 0);
    if (this.btnSpeed1x) this.btnSpeed1x.classList.toggle('active', !isPaused && speed === 1);
    if (this.btnSpeed2x) this.btnSpeed2x.classList.toggle('active', !isPaused && speed === 2);
  }

  public updateDateDisplay(day: number, month: number, year: number): void {
    if (this.dateEl) {
      const monthName = MONTH_NAMES[month - 1] || 'Junio';
      this.dateEl.textContent = `${day} de ${monthName}, ${year}`;
    }
  }
}
