import { ArcorQuizEngine, AnswerResult, QuizSessionSummary } from '../gameplay/ArcorQuizEngine.ts';
import { QuizQuestion } from '../gameplay/ArcorQuizData.ts';
import { progressionState } from '../gameplay/ProgressionState.ts';
import { soundManager } from '../core/SoundManager.ts';

export class ArcorQuizModal {
  private element: HTMLElement;
  private engine: ArcorQuizEngine;

  // Elementos del DOM
  private statusBarEl: HTMLElement | null = null;
  private livesCountEl: HTMLElement | null = null;
  private questionProgressEl: HTMLElement | null = null;
  private difficultyBadgeEl: HTMLElement | null = null;
  private timerBarEl: HTMLElement | null = null;
  private timerTextEl: HTMLElement | null = null;
  private categoryBadgeEl: HTMLElement | null = null;
  private questionTextEl: HTMLElement | null = null;
  private optionsGridEl: HTMLElement | null = null;
  private explanationCardEl: HTMLElement | null = null;
  private explanationTextEl: HTMLElement | null = null;
  private nextBtnEl: HTMLElement | null = null;
  private floatingHeartsContainer: HTMLElement | null = null;

  // Vistas
  private questionViewEl: HTMLElement | null = null;
  private resultsViewEl: HTMLElement | null = null;
  private resultCorrectEl: HTMLElement | null = null;
  private resultLivesEl: HTMLElement | null = null;
  private resultScoreEl: HTMLElement | null = null;

  // Callback de cierre
  public onClose?: () => void;

  constructor() {
    this.engine = new ArcorQuizEngine();
    this.element = this.render();
    document.body.appendChild(this.element);
    this.bindEngineEvents();
  }

  private render(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'arcor-quiz-backdrop';
    backdrop.id = 'arcor-quiz-modal';
    backdrop.style.display = 'none';

    backdrop.innerHTML = `
      <div class="arcor-quiz-card" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
        <!-- Floating FX Layer -->
        <div class="quiz-fx-layer" id="quiz-fx-layer"></div>

        <!-- CABECERA SUPERIOR -->
        <div class="quiz-header">
          <div class="quiz-header-left">
            <span class="quiz-brand-tag">ARCOR 75 AÑOS</span>
            <h2 class="quiz-title" id="quiz-title">TRIVIA INDUSTRIAL</h2>
          </div>

          <div class="quiz-header-right">
            <!-- Marcador en vivo de vidas recuperadas -->
            <div class="quiz-lives-chip" id="quiz-lives-chip" title="Vidas reales de Candy Crush">
              <span class="quiz-heart-icon">❤️</span>
              <span class="quiz-lives-count" id="quiz-header-lives">5/5</span>
            </div>

            <!-- Botón Salir / Cerrar -->
            <button class="quiz-close-btn interactive" id="quiz-btn-close" title="Cerrar Quiz">✕</button>
          </div>
        </div>

        <!-- BARRA DE INFORMACIÓN Y TIEMPO -->
        <div class="quiz-status-bar">
          <div class="quiz-meta-row">
            <span class="quiz-progress-text" id="quiz-progress-text">Pregunta 1 de 5</span>
            <span class="quiz-difficulty-badge badge-facil" id="quiz-difficulty-badge">⭐ FÁCIL</span>
            <span class="quiz-timer-display" id="quiz-timer-text">⏳ 15s</span>
          </div>

          <!-- Barra de progreso de tiempo con gradiente dinámico -->
          <div class="quiz-timer-track">
            <div class="quiz-timer-fill" id="quiz-timer-fill" style="width: 100%;"></div>
          </div>
        </div>

        <!-- ================================================================
             VISTA 1: PREGUNTA Y OPCIONES
             ================================================================ -->
        <div class="quiz-question-view" id="quiz-question-view">
          <!-- Categoría e icono -->
          <div class="quiz-category-tag" id="quiz-category-tag">
            <span class="cat-icon">🏭</span>
            <span class="cat-label">HISTORIA DE ARROYITO</span>
          </div>

          <!-- Texto de la Pregunta -->
          <h3 class="quiz-question-text" id="quiz-question-text">
            ¿Cargando pregunta de la historia de Arcor...?
          </h3>

          <!-- Grid de las 4 Opciones Táctiles -->
          <div class="quiz-options-grid" id="quiz-options-grid">
            <!-- Se generan dinámicamente -->
          </div>

          <!-- Tarjeta de Curiosidad / Explicación Histórica Real -->
          <div class="quiz-explanation-card" id="quiz-explanation-card" style="display: none;">
            <div class="explanation-badge">
              <span class="exp-icon">💡</span>
              <span class="exp-title">DATO HISTÓRICO REAL</span>
            </div>
            <p class="explanation-text" id="quiz-explanation-text"></p>
          </div>

          <!-- Botón de Siguiente Pregunta -->
          <div class="quiz-actions-row">
            <button class="btn btn-primary btn-quiz-next interactive" id="quiz-btn-next" style="display: none;">
              <span>SIGUIENTE PREGUNTA</span>
              <span class="arrow-icon">➔</span>
            </button>
          </div>
        </div>

        <!-- ================================================================
             VISTA 2: RESULTADOS Y RETORNO AL JUEGO
             ================================================================ -->
        <div class="quiz-results-view" id="quiz-results-view" style="display: none;">
          <div class="results-trophy-badge">🏆</div>
          <h2 class="results-heading">¡TRIVIA COMPLETADA!</h2>
          <p class="results-subheading">
            Has demostrado tu conocimiento sobre el dulce imperio de Arcor y recuperado energía vital.
          </p>

          <div class="results-stats-grid">
            <div class="result-stat-box">
              <span class="stat-icon">🎯</span>
              <span class="stat-value" id="res-correct-count">0 / 5</span>
              <span class="stat-label">Aciertos</span>
            </div>

            <div class="result-stat-box highlight-box">
              <span class="stat-icon">❤️</span>
              <span class="stat-value text-gold" id="res-lives-earned">+0</span>
              <span class="stat-label">Vidas Ganadas</span>
            </div>

            <div class="result-stat-box">
              <span class="stat-icon">⭐</span>
              <span class="stat-value" id="res-total-score">0</span>
              <span class="stat-label">Puntos Trivia</span>
            </div>
          </div>

          <button class="btn btn-primary btn-quiz-return interactive" id="btn-quiz-return">
            <span>🍬 VOLVER AL JUEGO</span>
          </button>
        </div>
      </div>
    `;

    // Cachear elementos
    this.statusBarEl = backdrop.querySelector('.quiz-status-bar');
    this.livesCountEl = backdrop.querySelector('#quiz-header-lives');
    this.questionProgressEl = backdrop.querySelector('#quiz-progress-text');
    this.difficultyBadgeEl = backdrop.querySelector('#quiz-difficulty-badge');
    this.timerBarEl = backdrop.querySelector('#quiz-timer-fill');
    this.timerTextEl = backdrop.querySelector('#quiz-timer-text');
    this.categoryBadgeEl = backdrop.querySelector('#quiz-category-tag');
    this.questionTextEl = backdrop.querySelector('#quiz-question-text');
    this.optionsGridEl = backdrop.querySelector('#quiz-options-grid');
    this.explanationCardEl = backdrop.querySelector('#quiz-explanation-card');
    this.explanationTextEl = backdrop.querySelector('#quiz-explanation-text');
    this.nextBtnEl = backdrop.querySelector('#quiz-btn-next');
    this.floatingHeartsContainer = backdrop.querySelector('#quiz-fx-layer');

    this.questionViewEl = backdrop.querySelector('#quiz-question-view');
    this.resultsViewEl = backdrop.querySelector('#quiz-results-view');
    this.resultCorrectEl = backdrop.querySelector('#res-correct-count');
    this.resultLivesEl = backdrop.querySelector('#res-lives-earned');
    this.resultScoreEl = backdrop.querySelector('#res-total-score');

    // Eventos de botones fijos
    backdrop.querySelector('#quiz-btn-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    backdrop.querySelector('#btn-quiz-return')?.addEventListener('click', () => {
      soundManager.playFanfare();
      this.hide();
    });

    this.nextBtnEl?.addEventListener('click', () => {
      soundManager.playClick();
      this.engine.nextQuestion();
    });

    return backdrop;
  }

  /**
   * Conecta los eventos del motor de Quiz con la vista
   */
  private bindEngineEvents(): void {
    // 1. Nueva pregunta lista
    this.engine.onQuestionReady = (question, num, total, timeLimit) => {
      this.renderQuestion(question, num, total, timeLimit);
    };

    // 2. Tictac del temporizador
    this.engine.onTimerTick = (secondsLeft, totalSeconds) => {
      this.updateTimer(secondsLeft, totalSeconds);
    };

    // 3. Resultado de la respuesta
    this.engine.onAnswerResult = (result) => {
      this.renderAnswerFeedback(result);
    };

    // 4. Sesión completada
    this.engine.onQuizComplete = (summary) => {
      this.renderResults(summary);
    };
  }

  /**
   * Abre el modal y arranca la sesión
   */
  public show(): void {
    this.updateLivesHeader();
    this.element.style.display = 'flex';

    if (this.statusBarEl) this.statusBarEl.style.display = 'flex';
    if (this.questionViewEl) this.questionViewEl.style.display = 'block';
    if (this.resultsViewEl) this.resultsViewEl.style.display = 'none';

    // Iniciar nueva sesión de 5 preguntas
    this.engine.startSession(5);
  }

  /**
   * Oculta el modal y detiene temporizadores
   */
  public hide(): void {
    this.engine.stopTimer();
    this.element.style.display = 'none';
    if (this.onClose) {
      this.onClose();
    }
  }

  /**
   * Renderiza la pregunta en pantalla
   */
  private renderQuestion(q: QuizQuestion, num: number, total: number, _timeLimit: number): void {
    this.updateLivesHeader();

    // Actualizar progreso "Pregunta 3 de 5"
    if (this.questionProgressEl) {
      this.questionProgressEl.textContent = `Pregunta ${num} de ${total}`;
    }

    // Actualizar badge de dificultad
    if (this.difficultyBadgeEl) {
      this.difficultyBadgeEl.className = `quiz-difficulty-badge badge-${q.difficulty}`;
      if (q.difficulty === 'facil') {
        this.difficultyBadgeEl.textContent = '⭐ FÁCIL';
      } else if (q.difficulty === 'media') {
        this.difficultyBadgeEl.textContent = '⭐⭐ MEDIA';
      } else {
        this.difficultyBadgeEl.textContent = '⭐⭐⭐ DIFÍCIL';
      }
    }

    // Categoría
    if (this.categoryBadgeEl) {
      const catLabels: Record<string, string> = {
        historia: 'HISTORIA INDUSTRIAL',
        arroyito: 'CUNA DE ARROYITO',
        productos: 'GOLOSINAS & CHOCOLATES',
        marcas: 'GRANDES MARCAS',
        curiosidades: 'CURIOSIDADES ARCOR',
        produccion: 'INGENIERÍA & PRODUCCIÓN'
      };
      const label = catLabels[q.category] || 'TRIVIA ARCOR';
      this.categoryBadgeEl.innerHTML = `
        <span class="cat-icon">${q.icon || '🍬'}</span>
        <span class="cat-label">${label}</span>
      `;
    }

    // Texto de la pregunta
    if (this.questionTextEl) {
      this.questionTextEl.textContent = q.question;
    }

    // Ocultar explicación previa y botón siguiente
    if (this.explanationCardEl) {
      this.explanationCardEl.style.display = 'none';
      this.explanationCardEl.classList.remove('card-animate-in');
    }
    if (this.nextBtnEl) {
      this.nextBtnEl.style.display = 'none';
    }

    // Renderizar las 4 opciones táctiles
    if (this.optionsGridEl) {
      this.optionsGridEl.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];

      q.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn interactive';
        btn.dataset.index = `${idx}`;
        btn.innerHTML = `
          <span class="opt-letter">${letters[idx]}</span>
          <span class="opt-text">${optText}</span>
          <span class="opt-status-icon"></span>
        `;

        btn.addEventListener('click', () => {
          this.engine.answer(idx);
        });

        this.optionsGridEl?.appendChild(btn);
      });
    }
  }

  /**
   * Actualiza el temporizador visual
   */
  private updateTimer(secondsLeft: number, totalSeconds: number): void {
    if (this.timerTextEl) {
      this.timerTextEl.textContent = `⏳ ${secondsLeft}s`;
    }

    if (this.timerBarEl) {
      const pct = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100));
      this.timerBarEl.style.width = `${pct}%`;

      // Cambio cromático: Verde/Dorado -> Amarillo -> Rojo
      if (pct < 25) {
        this.timerBarEl.style.background = 'linear-gradient(90deg, #ff1744, #ff5252)';
      } else if (pct < 50) {
        this.timerBarEl.style.background = 'linear-gradient(90deg, #ff9800, #ffb74d)';
      } else {
        this.timerBarEl.style.background = 'linear-gradient(90deg, #ffd700, #4caf50)';
      }
    }
  }

  /**
   * Renderiza el feedback de acierto o fallo
   */
  private renderAnswerFeedback(result: AnswerResult): void {
    // Deshabilitar botones para evitar clics dobles
    if (this.optionsGridEl) {
      const buttons = this.optionsGridEl.querySelectorAll<HTMLButtonElement>('.quiz-option-btn');
      buttons.forEach((btn, idx) => {
        btn.disabled = true;

        const iconEl = btn.querySelector('.opt-status-icon');

        if (idx === result.correctIndex) {
          btn.classList.add('quiz-opt-correct');
          if (iconEl) iconEl.textContent = '✓';
        } else if (idx === result.selectedIndex) {
          btn.classList.add('quiz-opt-wrong');
          if (iconEl) iconEl.textContent = '✕';
        } else {
          btn.classList.add('quiz-opt-faded');
        }
      });
    }

    if (result.isCorrect) {
      soundManager.playFanfare();
      this.spawnFloatingHeartFeedback();
      this.updateLivesHeader();
    } else {
      soundManager.playLose();
    }

    // Mostrar tarjeta informativa histórica
    if (this.explanationCardEl && this.explanationTextEl) {
      this.explanationTextEl.textContent = result.explanation;
      this.explanationCardEl.style.display = 'block';
      this.explanationCardEl.classList.add('card-animate-in');
    }

    // Mostrar botón para avanzar
    if (this.nextBtnEl) {
      const isLast = this.engine.getCurrentIndex() >= this.engine.getTotalQuestions() - 1;
      this.nextBtnEl.innerHTML = `
        <span>${isLast ? 'VER RESULTADOS' : 'SIGUIENTE PREGUNTA'}</span>
        <span class="arrow-icon">${isLast ? '🏆' : '➔'}</span>
      `;
      this.nextBtnEl.style.display = 'inline-flex';
      this.nextBtnEl.classList.add('pulse-glow');
    }
  }

  /**
   * Animación de corazón flotante al sumar vida
   */
  private spawnFloatingHeartFeedback(): void {
    if (!this.floatingHeartsContainer) return;

    const fx = document.createElement('div');
    fx.className = 'floating-heart-earn';
    fx.innerHTML = `
      <span class="heart-pulse">❤️</span>
      <span class="heart-text">+1 VIDA</span>
    `;

    this.floatingHeartsContainer.appendChild(fx);

    setTimeout(() => {
      fx.remove();
    }, 1800);
  }

  /**
   * Actualiza el indicador de vidas de la cabecera
   */
  private updateLivesHeader(): void {
    const lives = progressionState.getLives();
    if (this.livesCountEl) {
      this.livesCountEl.textContent = `${lives}/5`;
    }
  }

  /**
   * Muestra la pantalla de resultados finales
   */
  private renderResults(summary: QuizSessionSummary): void {
    if (this.statusBarEl) this.statusBarEl.style.display = 'none';
    if (this.questionViewEl) this.questionViewEl.style.display = 'none';
    if (this.resultsViewEl) {
      this.resultsViewEl.style.display = 'flex';
      this.resultsViewEl.classList.add('results-animate-in');
    }

    soundManager.playFanfare();

    if (this.resultCorrectEl) {
      this.resultCorrectEl.textContent = `${summary.correctCount} / ${summary.totalQuestions}`;
    }
    if (this.resultLivesEl) {
      this.resultLivesEl.textContent = `+${summary.livesEarned} ❤️`;
    }
    if (this.resultScoreEl) {
      this.resultScoreEl.textContent = `${summary.totalScore} pts`;
    }

    this.updateLivesHeader();
  }
}
