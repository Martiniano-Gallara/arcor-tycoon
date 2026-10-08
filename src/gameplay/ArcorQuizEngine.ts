import { ARCOR_QUIZ_QUESTIONS, QuizQuestion } from './ArcorQuizData.ts';
import { progressionState } from './ProgressionState.ts';
import { gameState } from './GameState.ts';
import { achievementsManager } from './AchievementsManager.ts';

export interface AnswerResult {
  isCorrect: boolean;
  selectedIndex: number;
  correctIndex: number;
  explanation: string;
  livesAwarded: number;
  scoreAwarded: number;
  isTimeout: boolean;
}

export interface QuizSessionSummary {
  totalQuestions: number;
  correctCount: number;
  livesEarned: number;
  totalScore: number;
}

export class ArcorQuizEngine {
  private questions: QuizQuestion[] = [];
  private currentIndex: number = 0;
  private timerHandle: number | null = null;
  private secondsLeft: number = 0;
  private totalSecondsForCurrent: number = 15;
  private isQuestionAnswered: boolean = false;

  // Estadísticas de la sesión
  private correctCount: number = 0;
  private livesEarned: number = 0;
  private totalScore: number = 0;

  // Callbacks
  public onQuestionReady?: (question: QuizQuestion, questionNumber: number, totalQuestions: number, timeLimit: number) => void;
  public onTimerTick?: (secondsLeft: number, totalSeconds: number) => void;
  public onAnswerResult?: (result: AnswerResult) => void;
  public onQuizComplete?: (summary: QuizSessionSummary) => void;

  public static readonly RECENT_QUESTIONS_KEY = 'arcor_quiz_recent_ids';
  public static readonly DAILY_LIVES_KEY = 'arcor_quiz_daily_lives';
  public static readonly MAX_DAILY_TRIVIA_LIVES = 5;

  constructor() {}

  /**
   * Inicia una nueva sesión de 5 preguntas con progresión de dificultad:
   * P1, P2: Fácil
   * P3, P4: Media
   * P5: Difícil
   */
  public startSession(questionCount: number = 5): void {
    this.stopTimer();
    this.currentIndex = 0;
    this.correctCount = 0;
    this.livesEarned = 0;
    this.totalScore = 0;
    this.isQuestionAnswered = false;

    this.questions = this.pickSessionQuestions(questionCount);

    if (this.questions.length === 0) {
      // Fallback
      this.questions = [...ARCOR_QUIZ_QUESTIONS].slice(0, questionCount);
    }

    this.presentCurrentQuestion();
  }

  /**
   * Obtiene la pregunta actual
   */
  public getCurrentQuestion(): QuizQuestion | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.questions.length) {
      return this.questions[this.currentIndex];
    }
    return null;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getTotalQuestions(): number {
    return this.questions.length;
  }

  /**
   * Presenta la pregunta actual y enciende el temporizador
   */
  private presentCurrentQuestion(): void {
    const q = this.getCurrentQuestion();
    if (!q) {
      this.finishSession();
      return;
    }

    this.isQuestionAnswered = false;

    // Tiempo según dificultad: Fácil 15s, Media 12s, Difícil 10s
    if (q.difficulty === 'facil') {
      this.totalSecondsForCurrent = 15;
    } else if (q.difficulty === 'media') {
      this.totalSecondsForCurrent = 12;
    } else {
      this.totalSecondsForCurrent = 10;
    }
    this.secondsLeft = this.totalSecondsForCurrent;

    if (this.onQuestionReady) {
      this.onQuestionReady(q, this.currentIndex + 1, this.questions.length, this.totalSecondsForCurrent);
    }

    this.startTimer();
  }

  /**
   * Maneja la respuesta del jugador
   */
  public answer(optionIndex: number): AnswerResult | null {
    if (this.isQuestionAnswered) return null;
    const q = this.getCurrentQuestion();
    if (!q) return null;

    this.isQuestionAnswered = true;
    this.stopTimer();

    const isCorrect = optionIndex === q.correctIndex;
    let livesAwarded = 0;
    let scoreAwarded = 0;

    if (isCorrect) {
      this.correctCount++;

      // ECO-05: Límite diario de 5 vidas recuperadas por trivia y verificar que vidas < 5
      const currentLives = progressionState.getLives();
      const dailyGiven = this.getDailyTriviaLivesGiven();
      if (currentLives < 5 && dailyGiven < ArcorQuizEngine.MAX_DAILY_TRIVIA_LIVES) {
        livesAwarded = 1;
        progressionState.addLives(1);
        this.livesEarned += 1;
        this.incrementDailyTriviaLives();
      } else {
        livesAwarded = 0;
      }

      // Puntuación: Base (100) + Bonus por tiempo restante
      const speedBonus = this.secondsLeft * 15;
      const difficultyMultiplier = q.difficulty === 'dificil' ? 2.0 : q.difficulty === 'media' ? 1.5 : 1.0;
      scoreAwarded = Math.round((100 + speedBonus) * difficultyMultiplier);
      this.totalScore += scoreAwarded;

      // Registrar estadísticas globales para logros y progresión
      gameState.recordQuizStats(1, scoreAwarded);
      achievementsManager.checkAll();
    }

    // Registrar en preguntas vistas recientemente
    this.recordSeenQuestion(q.id);

    const result: AnswerResult = {
      isCorrect,
      selectedIndex: optionIndex,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      livesAwarded,
      scoreAwarded,
      isTimeout: false
    };

    if (this.onAnswerResult) {
      this.onAnswerResult(result);
    }

    return result;
  }

  /**
   * Maneja el tiempo agotado (timeout)
   */
  private handleTimeout(): void {
    if (this.isQuestionAnswered) return;
    const q = this.getCurrentQuestion();
    if (!q) return;

    this.isQuestionAnswered = true;
    this.stopTimer();

    this.recordSeenQuestion(q.id);

    const result: AnswerResult = {
      isCorrect: false,
      selectedIndex: -1, // Sin selección
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      livesAwarded: 0,
      scoreAwarded: 0,
      isTimeout: true
    };

    if (this.onAnswerResult) {
      this.onAnswerResult(result);
    }
  }

  /**
   * Avanza a la siguiente pregunta o finaliza
   */
  public nextQuestion(): void {
    this.stopTimer();
    this.currentIndex++;

    if (this.currentIndex < this.questions.length) {
      this.presentCurrentQuestion();
    } else {
      this.finishSession();
    }
  }

  /**
   * Termina la sesión y emite el resumen
   */
  private finishSession(): void {
    this.stopTimer();
    const summary: QuizSessionSummary = {
      totalQuestions: this.questions.length,
      correctCount: this.correctCount,
      livesEarned: this.livesEarned,
      totalScore: this.totalScore
    };

    if (this.onQuizComplete) {
      this.onQuizComplete(summary);
    }
  }

  /**
   * Temporizador por segundo
   */
  private startTimer(): void {
    this.stopTimer();
    if (this.onTimerTick) {
      this.onTimerTick(this.secondsLeft, this.totalSecondsForCurrent);
    }

    this.timerHandle = window.setInterval(() => {
      this.secondsLeft--;

      if (this.onTimerTick) {
        this.onTimerTick(Math.max(0, this.secondsLeft), this.totalSecondsForCurrent);
      }

      if (this.secondsLeft <= 0) {
        this.stopTimer();
        this.handleTimeout();
      }
    }, 1000);
  }

  public stopTimer(): void {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  public destroy(): void {
    this.stopTimer();
  }

  // =========================================================================
  // SELECCIÓN INTELIGENTE DE PREGUNTAS ANTI-REPETICIÓN
  // =========================================================================
  private pickSessionQuestions(count: number): QuizQuestion[] {
    const recentIds = this.getRecentSeenIds();

    const faciles = ARCOR_QUIZ_QUESTIONS.filter(q => q.difficulty === 'facil');
    const medias = ARCOR_QUIZ_QUESTIONS.filter(q => q.difficulty === 'media');
    const dificiles = ARCOR_QUIZ_QUESTIONS.filter(q => q.difficulty === 'dificil');

    // Distribución progresiva de 5 preguntas: 2 fáciles, 2 medias, 1 difícil
    const selected: QuizQuestion[] = [];

    selected.push(...this.pickFromPool(faciles, 2, recentIds));
    selected.push(...this.pickFromPool(medias, 2, recentIds));
    selected.push(...this.pickFromPool(dificiles, 1, recentIds));

    // Si por alguna razón faltan, rellenar de cualquier pool
    while (selected.length < count) {
      const remaining = ARCOR_QUIZ_QUESTIONS.filter(q => !selected.some(s => s.id === q.id));
      if (remaining.length === 0) break;
      const pick = remaining[Math.floor(Math.random() * remaining.length)];
      selected.push(pick);
    }

    return selected.slice(0, count);
  }

  private pickFromPool(pool: QuizQuestion[], countNeeded: number, recentIds: Set<string>): QuizQuestion[] {
    // Filtrar preguntas que no se hayan visto recientemente
    let candidates = pool.filter(q => !recentIds.has(q.id));
    if (candidates.length < countNeeded) {
      // Si ya vimos todas, usamos todo el pool para no quedarnos sin preguntas
      candidates = [...pool];
    }

    // Mezclar aleatoriamente (Fisher-Yates)
    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, countNeeded);
  }

  private getRecentSeenIds(): Set<string> {
    try {
      const raw = localStorage.getItem(ArcorQuizEngine.RECENT_QUESTIONS_KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  private recordSeenQuestion(questionId: string): void {
    try {
      const seen = this.getRecentSeenIds();
      seen.add(questionId);
      // Mantener un historial máximo de 15 para rotar suavemente
      const arr = Array.from(seen);
      if (arr.length > 15) {
        arr.splice(0, arr.length - 15);
      }
      localStorage.setItem(ArcorQuizEngine.RECENT_QUESTIONS_KEY, JSON.stringify(arr));
    } catch {}
  }

  public getDailyTriviaLivesGiven(): number {
    try {
      const raw = localStorage.getItem(ArcorQuizEngine.DAILY_LIVES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const today = new Date().toISOString().slice(0, 10);
        if (parsed.date === today && typeof parsed.count === 'number') {
          return parsed.count;
        }
      }
    } catch {}
    return 0;
  }

  private incrementDailyTriviaLives(): void {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const current = this.getDailyTriviaLivesGiven();
      localStorage.setItem(ArcorQuizEngine.DAILY_LIVES_KEY, JSON.stringify({
        date: today,
        count: current + 1
      }));
    } catch {}
  }
}
