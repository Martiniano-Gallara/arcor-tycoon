import { soundFX } from '../audio/SoundFXManager.ts';

export type CandyType =
  | 'caramelo_1951'
  | 'minty'
  | 'caramelo_miel'
  | 'caramelo_frutal'
  | 'toffee_cubo'
  | 'aguila'
  | 'bonobon'
  | 'buttertoffe'
  | 'cofler'
  | 'mogul'
  | 'rocklets';

export type SpecialType = 'normal' | 'striped_h' | 'striped_v' | 'wrapped_bomb' | 'disco_rocklet';

export interface ArcorProductInfo {
  type: CandyType;
  name: string;
  year: number;
  unlockedAtLevel: number;
  category: 'caramelos' | 'chocolates' | 'bombones' | 'gomitas' | 'confites';
  description: string;
  icon: string;
}

export const ARCOR_HISTORIC_PRODUCTS: Record<CandyType, ArcorProductInfo> = {
  caramelo_1951: {
    type: 'caramelo_1951',
    name: 'Caramelo Clásico Arcor',
    year: 1951,
    unlockedAtLevel: 1,
    category: 'caramelos',
    description: 'El primer caramelo artesanal creado por Don Fulvio Pagani en Arroyito.',
    icon: '🍬'
  },
  minty: {
    type: 'minty',
    name: 'Caramelo Cristal de Menta',
    year: 1951,
    unlockedAtLevel: 1,
    category: 'caramelos',
    description: 'Caramelos duros transparentes con refrescante sabor a menta natural.',
    icon: '🌿'
  },
  caramelo_miel: {
    type: 'caramelo_miel',
    name: 'Caramelo de Miel Pionero',
    year: 1951,
    unlockedAtLevel: 1,
    category: 'caramelos',
    description: 'Caramelos artesanales elaborados con miel pura cordobesa cocidos a fuego lento.',
    icon: '🍯'
  },
  caramelo_frutal: {
    type: 'caramelo_frutal',
    name: 'Caramelo Cítrico Frutal',
    year: 1951,
    unlockedAtLevel: 1,
    category: 'caramelos',
    description: 'Caramelos con esencias naturales de naranja y limón cosechados en el valle cordobés.',
    icon: '🍊'
  },
  toffee_cubo: {
    type: 'toffee_cubo',
    name: 'Cubo de Toffee Tradicional',
    year: 1960,
    unlockedAtLevel: 10,
    category: 'caramelos',
    description: 'Delicados bocados blandos de dulce de leche cocidos en pailas de cobre.',
    icon: '🧈'
  },
  aguila: {
    type: 'aguila',
    name: 'Trufa de Chocolate Águila',
    year: 1970,
    unlockedAtLevel: 20,
    category: 'chocolates',
    description: 'Los primeros chocolates finos elaborados en la planta modelo de Arcor.',
    icon: '🍫'
  },
  mogul: {
    type: 'mogul',
    name: 'Gomitas Mogul',
    year: 1983,
    unlockedAtLevel: 33,
    category: 'gomitas',
    description: 'Gomitas con jugo natural de frutas y la ternura de los ositos más famosos.',
    icon: '🐻'
  },
  bonobon: {
    type: 'bonobon',
    name: 'Bon o Bon',
    year: 1984,
    unlockedAtLevel: 34,
    category: 'bombones',
    description: 'El hito mundial de Arcor: oblea crocante, relleno de maní y baño de chocolate con leche.',
    icon: '✨'
  },
  buttertoffe: {
    type: 'buttertoffe',
    name: 'Butter Toffees',
    year: 1985,
    unlockedAtLevel: 35,
    category: 'caramelos',
    description: 'Inspirados en los toffees ingleses, un clásico suave e irresistible.',
    icon: '👑'
  },
  cofler: {
    type: 'cofler',
    name: 'Tableta Cofler',
    year: 1993,
    unlockedAtLevel: 43,
    category: 'chocolates',
    description: 'La felicidad que se comparte: tabletas macizas de chocolate con leche puro.',
    icon: '🍫'
  },
  rocklets: {
    type: 'rocklets',
    name: 'Confites Rocklets',
    year: 1996,
    unlockedAtLevel: 46,
    category: 'confites',
    description: 'Confites de chocolate con leche cubiertos de crocante azúcar multicolor.',
    icon: '🌈'
  }
};

export interface CandyPiece {
  id: string;
  type: CandyType;
  special: SpecialType;
  row: number;
  col: number;
  // Animación suave de posición y rebote
  visualX: number;
  visualY: number;
  scale: number;
  alpha: number;
  isMatched: boolean;
  fallVelocity: number;
}

export interface LevelObjective {
  type: CandyType;
  target: number;
  current: number;
  icon: string;
  name: string;
  year?: number;
}

export interface LevelConfig {
  levelNumber: number;
  moves: number;
  objectives: LevelObjective[];
  starScores: [number, number, number]; // Umbrales de 1, 2 y 3 estrellas
  allowedCandies: CandyType[];
  newUnlockedProduct?: ArcorProductInfo;
}

export class Match3Engine {
  public static readonly ROWS = 7;
  public static readonly COLS = 7;

  public grid: (CandyPiece | null)[][] = [];
  public currentLevel: number = 1;
  public movesRemaining: number = 20;
  public score: number = 0;
  public objectives: LevelObjective[] = [];
  public starScores: [number, number, number] = [3000, 6500, 11000];
  public allowedCandies: CandyType[] = ['caramelo_1951', 'minty', 'caramelo_miel', 'caramelo_frutal'];

  // Estados de control de flujo
  public isBusy: boolean = false;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;
  public comboStreak: number = 0;
  public extraMovesPurchased: number = 0;

  // Control de concurrencia y watchdog para evitar bloqueos ("no se trabe")
  private activeCascadeToken: number = 0;
  private watchdogTimer: any = null;

  // Callbacks para vista y audio
  public onStateChanged?: () => void;
  public onMatchTriggered?: (pieces: CandyPiece[], combo: number) => void;
  public onSpecialTriggered?: (type: SpecialType, row: number, col: number) => void;
  public onScoreFloat?: (text: string, x: number, y: number, color?: string) => void;
  public onLevelWon?: (stars: number, score: number, coins: number, level?: number) => void;
  public onLevelLost?: () => void;

  private inBounds(r: number, c: number): boolean {
    return r >= 0 && r < Match3Engine.ROWS && c >= 0 && c < Match3Engine.COLS;
  }

  constructor() {
    this.initEmptyGrid();
  }

  private resetWatchdog(): void {
    if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
    this.watchdogTimer = setTimeout(() => {
      if (this.isBusy && !this.isGameOver) {
        console.warn('[Match3Engine] Watchdog triggered: unlocking stuck busy state');
        this.isBusy = false;
        if (!this.findPossibleMove()) {
          this.shuffleBoard();
        }
        if (this.onStateChanged) this.onStateChanged();
      }
    }, 3500);
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private initEmptyGrid(): void {
    this.grid = [];
    for (let r = 0; r < Match3Engine.ROWS; r++) {
      this.grid[r] = [];
      for (let c = 0; c < Match3Engine.COLS; c++) {
        this.grid[r][c] = null;
      }
    }
  }

  /**
   * Carga y arranca un nivel específico
   */
  public startLevel(config: LevelConfig): void {
    this.activeCascadeToken++;
    this.clearWatchdog();
    this.currentLevel = config.levelNumber;
    this.movesRemaining = config.moves;
    this.score = 0;
    this.objectives = config.objectives.map(o => ({ ...o, current: 0 }));
    this.starScores = config.starScores;
    this.allowedCandies = [...config.allowedCandies];
    this.isGameOver = false;
    this.isVictory = false;
    this.comboStreak = 0;
    this.isBusy = false;
    this.extraMovesPurchased = 0;

    this.initEmptyGrid();
    this.populateInitialBoard();
    if (this.onStateChanged) this.onStateChanged();
  }

  /**
   * Añade movimientos adicionales (máximo 1 compra por intento de nivel)
   */
  public addExtraMoves(count: number): boolean {
    if (this.extraMovesPurchased >= 1) {
      return false;
    }
    this.extraMovesPurchased++;
    this.movesRemaining += count;
    this.isGameOver = false;
    this.isBusy = false;
    if (this.onStateChanged) this.onStateChanged();
    return true;
  }

  public canAddExtraMoves(): boolean {
    return this.extraMovesPurchased === 0;
  }

  private getRandomCandyType(): CandyType {
    const idx = Math.floor(Math.random() * this.allowedCandies.length);
    return this.allowedCandies[idx] || this.allowedCandies[0] || 'caramelo_1951';
  }

  private createPiece(row: number, col: number, type?: CandyType, special: SpecialType = 'normal'): CandyPiece {
    return {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: type || this.getRandomCandyType(),
      special,
      row,
      col,
      visualX: col,
      visualY: row - 7, // Aparecen cayendo desde arriba
      scale: 1,
      alpha: 1,
      isMatched: false,
      fallVelocity: 0
    };
  }

  /**
   * Llena el tablero asegurando que no haya matches automáticos iniciales
   */
  private populateInitialBoard(): void {
    for (let r = 0; r < Match3Engine.ROWS; r++) {
      for (let c = 0; c < Match3Engine.COLS; c++) {
        let type: CandyType;
        let attempts = 0;
        do {
          type = this.getRandomCandyType();
          attempts++;
        } while (
          attempts < 30 &&
          ((c >= 2 && this.grid[r][c - 1]?.type === type && this.grid[r][c - 2]?.type === type) ||
           (r >= 2 && this.grid[r - 1][c]?.type === type && this.grid[r - 2][c]?.type === type))
        );

        const piece = this.createPiece(r, c, type);
        piece.visualY = r; // Asentado de inicio
        this.grid[r][c] = piece;
      }
    }
  }

  /**
   * Intento de intercambio táctil entre dos casillas contiguas
   */
  public trySwap(r1: number, c1: number, r2: number, c2: number): boolean {
    if (this.isBusy || this.isGameOver) return false;
    if (!this.inBounds(r1, c1) || !this.inBounds(r2, c2)) return false;

    // Verificar adyacencia
    const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2);
    if (dist !== 1) return false;

    const p1 = this.grid[r1][c1];
    const p2 = this.grid[r2][c2];
    if (!p1 || !p2) return false;

    // Caso 1: Combinación con Disco Multicolor Rocklets
    if (p1.special === 'disco_rocklet' || p2.special === 'disco_rocklet') {
      this.executeSwapState(r1, c1, r2, c2);
      this.movesRemaining--;
      this.comboStreak = 0;
      soundFX.playCandySwap();
      this.processDiscoSwap(p1, p2);
      return true;
    }

    // Intercambiar temporalmente para chequear matches
    this.executeSwapState(r1, c1, r2, c2);
    const matches = this.findAllMatches();

    if (matches.length > 0) {
      // Intercambio válido
      this.movesRemaining--;
      this.comboStreak = 0;
      soundFX.playCandySwap();
      this.processMatchesCascade();
      return true;
    } else {
      // Revertir intercambio con rebote sonoro
      this.executeSwapState(r1, c1, r2, c2);
      soundFX.playCandySwap();
      if (this.onStateChanged) this.onStateChanged();
      return false;
    }
  }

  private executeSwapState(r1: number, c1: number, r2: number, c2: number): void {
    const temp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = temp;

    if (this.grid[r1][c1]) {
      this.grid[r1][c1]!.row = r1;
      this.grid[r1][c1]!.col = c1;
    }
    if (this.grid[r2][c2]) {
      this.grid[r2][c2]!.row = r2;
      this.grid[r2][c2]!.col = c2;
    }
  }

  /**
   * Resuelve el intercambio con Rocklets Disco Multicolor
   */
  private processDiscoSwap(p1: CandyPiece, p2: CandyPiece): void {
    this.isBusy = true;
    this.resetWatchdog();
    soundFX.playDiscoZap();

    const disco = p1.special === 'disco_rocklet' ? p1 : p2;
    const other = p1.special === 'disco_rocklet' ? p2 : p1;

    disco.isMatched = true;

    if (other.special === 'disco_rocklet') {
      // Dos discos juntos = limpia todo el tablero
      for (let r = 0; r < Match3Engine.ROWS; r++) {
        for (let c = 0; c < Match3Engine.COLS; c++) {
          if (this.grid[r][c]) {
            this.grid[r][c]!.isMatched = true;
          }
        }
      }
      this.addScore(4500, '¡MEGA ROCKLETS!');
    } else {
      // Elimina todas las piezas del color seleccionado
      const targetType = other.type;
      let count = 0;
      for (let r = 0; r < Match3Engine.ROWS; r++) {
        for (let c = 0; c < Match3Engine.COLS; c++) {
          const piece = this.grid[r][c];
          if (piece && piece.type === targetType) {
            piece.isMatched = true;
            count++;
          }
        }
      }
      other.isMatched = true;
      this.addScore(count * 150 + 800, '¡RAYO ROCKLETS!');
      this.trackObjectives(targetType, count);
    }

    const token = this.activeCascadeToken;
    setTimeout(() => {
      if (token !== this.activeCascadeToken) return;
      this.removeMatchedAndDrop();
    }, 380);
  }

  /**
   * Búsqueda integral de combinaciones horizontales y verticales
   */
  public findAllMatches(): { pieces: CandyPiece[]; pattern: 'line3' | 'line4' | 'line5' | 'shapeTL'; triggerPiece: CandyPiece }[] {
    const results: { pieces: CandyPiece[]; pattern: 'line3' | 'line4' | 'line5' | 'shapeTL'; triggerPiece: CandyPiece }[] = [];

    // Matriz de marcas
    const horizMatches: CandyPiece[][] = [];
    const vertMatches: CandyPiece[][] = [];

    // 1. Chequeo Horizontal
    for (let r = 0; r < Match3Engine.ROWS; r++) {
      let matchLen = 1;
      for (let c = 0; c < Match3Engine.COLS; c++) {
        const current = this.grid[r][c];
        const next = c < Match3Engine.COLS - 1 ? this.grid[r][c + 1] : null;

        if (current && next && current.type === next.type && current.special !== 'disco_rocklet' && next.special !== 'disco_rocklet') {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            const line: CandyPiece[] = [];
            for (let k = 0; k < matchLen; k++) {
              line.push(this.grid[r][c - k]!);
            }
            horizMatches.push(line);
          }
          matchLen = 1;
        }
      }
    }

    // 2. Chequeo Vertical
    for (let c = 0; c < Match3Engine.COLS; c++) {
      let matchLen = 1;
      for (let r = 0; r < Match3Engine.ROWS; r++) {
        const current = this.grid[r][c];
        const next = r < Match3Engine.ROWS - 1 ? this.grid[r + 1][c] : null;

        if (current && next && current.type === next.type && current.special !== 'disco_rocklet' && next.special !== 'disco_rocklet') {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            const line: CandyPiece[] = [];
            for (let k = 0; k < matchLen; k++) {
              line.push(this.grid[r - k][c]!);
            }
            vertMatches.push(line);
          }
          matchLen = 1;
        }
      }
    }

    // Identificar intersecciones en T o L (Bomba de Chocolate)
    const processedPieces = new Set<string>();

    horizMatches.forEach(hLine => {
      vertMatches.forEach(vLine => {
        const common = hLine.find(hp => vLine.some(vp => vp.id === hp.id));
        if (common) {
          const combined = Array.from(new Set([...hLine, ...vLine]));
          combined.forEach(p => processedPieces.add(p.id));
          results.push({
            pieces: combined,
            pattern: 'shapeTL',
            triggerPiece: common
          });
        }
      });
    });

    // Añadir líneas restantes
    horizMatches.forEach(line => {
      if (!line.some(p => processedPieces.has(p.id))) {
        line.forEach(p => processedPieces.add(p.id));
        results.push({
          pieces: line,
          pattern: line.length >= 5 ? 'line5' : line.length === 4 ? 'line4' : 'line3',
          triggerPiece: line[Math.floor(line.length / 2)]
        });
      }
    });

    vertMatches.forEach(line => {
      if (!line.some(p => processedPieces.has(p.id))) {
        line.forEach(p => processedPieces.add(p.id));
        results.push({
          pieces: line,
          pattern: line.length >= 5 ? 'line5' : line.length === 4 ? 'line4' : 'line3',
          triggerPiece: line[Math.floor(line.length / 2)]
        });
      }
    });

    return results;
  }

  /**
   * Ejecuta la cascada de eliminación, generación de piezas especiales y gravedad
   */
  private processMatchesCascade(): void {
    this.isBusy = true;
    this.resetWatchdog();
    const token = this.activeCascadeToken;
    const matchGroups = this.findAllMatches();

    if (matchGroups.length === 0) {
      // Fin de la cascada
      this.isBusy = false;
      this.clearWatchdog();
      this.comboStreak = 0;
      this.checkLevelConditions();

      // Control de slots: si no quedan movimientos válidos en el tablero, mezclar automáticamente
      if (!this.isGameOver) {
        const move = this.findPossibleMove();
        if (!move) {
          this.isBusy = true;
          this.resetWatchdog();
          setTimeout(() => {
            if (token !== this.activeCascadeToken) return;
            this.shuffleBoard();
            this.isBusy = false;
            this.clearWatchdog();
          }, 350);
        }
      }

      if (this.onStateChanged) this.onStateChanged();
      return;
    }

    this.comboStreak++;
    soundFX.playCandyMatch(this.comboStreak);

    // Elogios según el combo
    if (this.comboStreak === 2) this.floatPraise('¡DULCE RACHA! 🍬');
    else if (this.comboStreak === 3) this.floatPraise('¡INCREÍBLE! ⭐');
    else if (this.comboStreak >= 4) this.floatPraise('¡EXQUISITO! 🔥');

    const toSpecialTransform: { piece: CandyPiece; newSpecial: SpecialType }[] = [];

    matchGroups.forEach(group => {
      let specialToCreate: SpecialType = 'normal';

      if (group.pattern === 'line5') {
        specialToCreate = 'disco_rocklet';
      } else if (group.pattern === 'shapeTL') {
        specialToCreate = 'wrapped_bomb';
      } else if (group.pattern === 'line4') {
        // Alternar rayado horizontal / vertical
        specialToCreate = Math.random() > 0.5 ? 'striped_h' : 'striped_v';
      }

      group.pieces.forEach(p => {
        if (specialToCreate !== 'normal' && p.id === group.triggerPiece.id) {
          toSpecialTransform.push({ piece: p, newSpecial: specialToCreate });
        } else {
          p.isMatched = true;
          this.triggerPieceSpecialEffect(p);
        }
      });

      // Puntos y objetivos
      const type = group.triggerPiece.type;
      this.trackObjectives(type, group.pieces.length);
      this.addScore(group.pieces.length * 80 * this.comboStreak);

      if (this.onMatchTriggered) {
        this.onMatchTriggered(group.pieces, this.comboStreak);
      }
    });

    // Convertir la pieza especial si corresponde
    toSpecialTransform.forEach(st => {
      st.piece.isMatched = false;
      st.piece.special = st.newSpecial;
      if (st.newSpecial === 'disco_rocklet') {
        st.piece.type = 'rocklets'; // Rocklets Disco
      }
      if (this.onSpecialTriggered) {
        this.onSpecialTriggered(st.newSpecial, st.piece.row, st.piece.col);
      }
    });

    if (this.onStateChanged) this.onStateChanged();

    setTimeout(() => {
      if (token !== this.activeCascadeToken) return;
      this.removeMatchedAndDrop();
    }, 280);
  }

  /**
   * Desata el efecto colateral si se elimina una pieza especial
   */
  private triggerPieceSpecialEffect(p: CandyPiece): void {
    if (p.special === 'striped_h') {
      soundFX.playStripedBlast();
      // Elimina toda la fila
      for (let c = 0; c < Match3Engine.COLS; c++) {
        const neighbor = this.grid[p.row][c];
        if (neighbor && !neighbor.isMatched) {
          neighbor.isMatched = true;
          this.trackObjectives(neighbor.type, 1);
        }
      }
      this.addScore(400);
    } else if (p.special === 'striped_v') {
      soundFX.playStripedBlast();
      // Elimina toda la columna
      for (let r = 0; r < Match3Engine.ROWS; r++) {
        const neighbor = this.grid[r][p.col];
        if (neighbor && !neighbor.isMatched) {
          neighbor.isMatched = true;
          this.trackObjectives(neighbor.type, 1);
        }
      }
      this.addScore(400);
    } else if (p.special === 'wrapped_bomb') {
      soundFX.playBombExplode();
      // Explota 3x3
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = p.row + dr;
          const nc = p.col + dc;
          if (nr >= 0 && nr < Match3Engine.ROWS && nc >= 0 && nc < Match3Engine.COLS) {
            const neighbor = this.grid[nr][nc];
            if (neighbor && !neighbor.isMatched) {
              neighbor.isMatched = true;
              this.trackObjectives(neighbor.type, 1);
            }
          }
        }
      }
      this.addScore(750);
    }
  }

  /**
   * Remueve piezas marcadas y aplica gravedad con rebote
   */
  private removeMatchedAndDrop(): void {
    const token = this.activeCascadeToken;

    // 1. Limpiar eliminadas
    for (let r = 0; r < Match3Engine.ROWS; r++) {
      for (let c = 0; c < Match3Engine.COLS; c++) {
        if (this.grid[r][c]?.isMatched) {
          this.grid[r][c] = null;
        }
      }
    }

    // 2. Desplazar columnas hacia abajo
    for (let c = 0; c < Match3Engine.COLS; c++) {
      let emptyRow = Match3Engine.ROWS - 1;
      for (let r = Match3Engine.ROWS - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) {
          if (emptyRow !== r) {
            this.grid[emptyRow][c] = this.grid[r][c];
            this.grid[r][c] = null;
            this.grid[emptyRow][c]!.row = emptyRow;
          }
          emptyRow--;
        }
      }

      // 3. Crear nuevas piezas en los huecos superiores
      let spawnOffset = 1;
      for (let r = emptyRow; r >= 0; r--) {
        const piece = this.createPiece(r, c);
        piece.visualY = -spawnOffset;
        this.grid[r][c] = piece;
        spawnOffset++;
      }
    }

    // 4. Control riguroso de slots: asegurar que absolutamente todas las 49 casillas tengan pieza válida
    for (let r = 0; r < Match3Engine.ROWS; r++) {
      for (let c = 0; c < Match3Engine.COLS; c++) {
        if (!this.grid[r][c] || this.grid[r][c]?.isMatched) {
          const piece = this.createPiece(r, c);
          piece.visualY = r - 1;
          this.grid[r][c] = piece;
        }
      }
    }

    if (this.onStateChanged) this.onStateChanged();

    // Esperar a que caigan y chequear nuevas combinaciones en cascada
    setTimeout(() => {
      if (token !== this.activeCascadeToken) return;
      this.processMatchesCascade();
    }, 320);
  }

  // =========================================================================
  // GESTIÓN DE OBJETIVOS, PUNTUACIÓN Y BOOSTERS
  // =========================================================================

  private trackObjectives(type: CandyType, count: number): void {
    const obj = this.objectives.find(o => o.type === type);
    if (obj) {
      obj.current = Math.min(obj.target, obj.current + count);
    }
  }

  private addScore(pts: number, floatText?: string): void {
    this.score += pts;
    if (floatText && this.onScoreFloat) {
      this.onScoreFloat(floatText, Match3Engine.COLS / 2, Match3Engine.ROWS / 2);
    }
  }

  private floatPraise(text: string): void {
    if (this.onScoreFloat) {
      this.onScoreFloat(text, Match3Engine.COLS / 2, Match3Engine.ROWS / 2, '#ffd700');
    }
  }

  private checkLevelConditions(): void {
    const allObjectivesDone = this.objectives.every(o => o.current >= o.target);

    if (allObjectivesDone) {
      this.isGameOver = true;
      this.isVictory = true;
      this.isBusy = true;

      // Calcular estrellas ganadas (1 a 3)
      let stars = 1;
      if (this.score >= this.starScores[2]) stars = 3;
      else if (this.score >= this.starScores[1]) stars = 2;

      // Bono por movimientos sobrantes ("Sugar Crush")
      const bonusCoins = 150 + this.movesRemaining * 25;
      this.score += this.movesRemaining * 500;

      soundFX.playLevelWin();

      const wonLevel = this.currentLevel;
      const wonToken = this.activeCascadeToken;

      setTimeout(() => {
        if (wonToken !== this.activeCascadeToken || wonLevel !== this.currentLevel) return;
        if (this.onLevelWon) {
          this.onLevelWon(stars, this.score, bonusCoins, wonLevel);
        }
      }, 700);

      return;
    }

    if (this.movesRemaining <= 0) {
      this.isGameOver = true;
      this.isVictory = false;
      if (this.onLevelLost) {
        this.onLevelLost();
      }
    }
  }

  // =========================================================================
  // BOOSTERS TÁCTILES
  // =========================================================================

  /** Martillo de Caramelo: rompe 1 casilla puntual */
  public useBoosterHammer(row: number, col: number): boolean {
    if (this.isBusy || this.isGameOver) return false;
    if (!this.inBounds(row, col)) return false;
    const piece = this.grid[row][col];
    if (!piece) return false;

    soundFX.playBoosterHammer();
    piece.isMatched = true;
    this.triggerPieceSpecialEffect(piece);
    this.trackObjectives(piece.type, 1);
    this.addScore(250, '¡MARTILLAZO!');

    this.isBusy = true;
    this.resetWatchdog();
    const token = this.activeCascadeToken;
    setTimeout(() => {
      if (token !== this.activeCascadeToken) return;
      this.removeMatchedAndDrop();
    }, 250);
    return true;
  }

  /** Guante Intercambiador: cambia 2 piezas contiguas sin gastar movimiento */
  public useBoosterSwap(r1: number, c1: number, r2: number, c2: number): boolean {
    if (this.isBusy || this.isGameOver) return false;
    if (!this.inBounds(r1, c1) || !this.inBounds(r2, c2)) return false;
    const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2);
    if (dist !== 1) return false;

    this.executeSwapState(r1, c1, r2, c2);
    soundFX.playCandySwap();
    this.processMatchesCascade();
    return true;
  }

  /** Generar Mega Rocklet instantáneo */
  public useBoosterMegaRocklet(row: number, col: number): boolean {
    if (this.isBusy || this.isGameOver) return false;
    if (!this.inBounds(row, col)) return false;
    const piece = this.grid[row][col];
    if (!piece) return false;

    piece.special = 'disco_rocklet';
    piece.type = 'rocklets';
    soundFX.playDiscoZap();
    if (this.onStateChanged) this.onStateChanged();
    return true;
  }

  /** Obtener el conteo de estrellas actual */
  public getCurrentStars(): number {
    if (this.score >= this.starScores[2]) return 3;
    if (this.score >= this.starScores[1]) return 2;
    if (this.score >= this.starScores[0]) return 1;
    return 0;
  }

  /**
   * Encuentra un posible movimiento válido en el tablero actual para guiar al jugador
   */
  public findPossibleMove(ignoreBusy: boolean = false): { r1: number; c1: number; r2: number; c2: number } | null {
    if ((!ignoreBusy && this.isBusy) || this.isGameOver) return null;

    // Verificar intercambios horizontales
    for (let r = 0; r < Match3Engine.ROWS; r++) {
      for (let c = 0; c < Match3Engine.COLS - 1; c++) {
        const p1 = this.grid[r][c];
        const p2 = this.grid[r][c + 1];
        if (!p1 || !p2) continue;

        if (p1.special === 'disco_rocklet' || p2.special === 'disco_rocklet') {
          return { r1: r, c1: c, r2: r, c2: c + 1 };
        }

        // Simular swap
        this.grid[r][c] = p2;
        this.grid[r][c + 1] = p1;
        const matches = this.findAllMatches();
        // Revertir swap
        this.grid[r][c] = p1;
        this.grid[r][c + 1] = p2;

        if (matches.length > 0) {
          return { r1: r, c1: c, r2: r, c2: c + 1 };
        }
      }
    }

    // Verificar intercambios verticales
    for (let c = 0; c < Match3Engine.COLS; c++) {
      for (let r = 0; r < Match3Engine.ROWS - 1; r++) {
        const p1 = this.grid[r][c];
        const p2 = this.grid[r + 1][c];
        if (!p1 || !p2) continue;

        if (p1.special === 'disco_rocklet' || p2.special === 'disco_rocklet') {
          return { r1: r, c1: c, r2: r + 1, c2: c };
        }

        // Simular swap
        this.grid[r][c] = p2;
        this.grid[r + 1][c] = p1;
        const matches = this.findAllMatches();
        // Revertir swap
        this.grid[r][c] = p1;
        this.grid[r + 1][c] = p2;

        if (matches.length > 0) {
          return { r1: r, c1: c, r2: r + 1, c2: c };
        }
      }
    }

    return null;
  }

  /**
   * Mezcla todas las piezas del tablero cuando no quedan movimientos válidos (deadlock prevention)
   */
  public shuffleBoard(): boolean {
    const pieces: { type: CandyType; special: SpecialType }[] = [];
    for (let r = 0; r < Match3Engine.ROWS; r++) {
      for (let c = 0; c < Match3Engine.COLS; c++) {
        const p = this.grid[r][c];
        if (p) {
          pieces.push({ type: p.type, special: p.special });
        }
      }
    }

    if (pieces.length === 0) return false;

    let attempts = 0;
    let foundValid = false;

    while (attempts < 80 && !foundValid) {
      attempts++;
      // Fisher-Yates shuffle
      for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = pieces[i];
        pieces[i] = pieces[j];
        pieces[j] = temp;
      }

      // Reubicar en el tablero
      let idx = 0;
      for (let r = 0; r < Match3Engine.ROWS; r++) {
        for (let c = 0; c < Match3Engine.COLS; c++) {
          if (this.grid[r][c]) {
            this.grid[r][c]!.type = pieces[idx].type;
            this.grid[r][c]!.special = pieces[idx].special;
            this.grid[r][c]!.isMatched = false;
            // Animación de rebote al mezclar
            this.grid[r][c]!.visualY = r - (Math.random() * 2 + 1);
            this.grid[r][c]!.fallVelocity = 0;
            idx++;
          }
        }
      }

      const matches = this.findAllMatches();
      const move = this.findPossibleMove(true);
      if (matches.length === 0 && move !== null) {
        foundValid = true;
        break;
      }
    }

    if (!foundValid) {
      this.populateInitialBoard();
    }

    soundFX.playCandySwap();
    this.floatPraise('¡SIN MOVIMIENTOS - MEZCLANDO! 🔄');
    if (this.onStateChanged) this.onStateChanged();
    return true;
  }
}
