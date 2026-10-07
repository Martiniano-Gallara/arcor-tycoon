import { CandyType } from './Match3Engine.ts';

interface SpriteCoords {
  x: number;
  y: number;
  w: number;
  h: number;
  isTopRow?: boolean;
}

/**
 * Coordenadas de recorte dentro del spritesheet 1024x1024
 * 3x3 Grid:
 * Row 0: Bon o Bon (0,0), Caramelo Rojo 1951 (0,1), Butter Toffees (0,2)
 * Row 1: Trufa Chocolate 1970 (1,0), Domo Rayado Praliné (1,1), Tableta Cofler 1993 (1,2)
 * Row 2: Cubo Toffee 1960 (2,0), Osito Mogul 1995 (2,1), Rocklets 1996 (2,2)
 */
const SPRITE_MAP: Partial<Record<CandyType, SpriteCoords>> = {
  bonobon: { x: 15, y: 65, w: 325, h: 220, isTopRow: true },
  caramelo_1951: { x: 355, y: 60, w: 300, h: 225, isTopRow: true },
  buttertoffe: { x: 670, y: 55, w: 320, h: 235, isTopRow: true },
  aguila: { x: 45, y: 370, w: 265, h: 265 }, // Trufa espiral chocolate
  toffee_cubo: { x: 48, y: 690, w: 265, h: 275 }, // Cubo toffee dorado
  cofler: { x: 675, y: 365, w: 295, h: 275 }, // Tableta de chocolate
  minty: { x: 370, y: 375, w: 265, h: 255 }, // Domo praliné rayado / cristal
  mogul: { x: 395, y: 680, w: 225, h: 295 }, // Osito de gomita
  rocklets: { x: 690, y: 700, w: 285, h: 255 } // Confites Rocklets
};

export class CandySpriteAtlas {
  private static instance: CandySpriteAtlas | null = null;
  private sprites: Map<CandyType, HTMLCanvasElement> = new Map();
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {
    this.initLoad();
  }

  public static getInstance(): CandySpriteAtlas {
    if (!CandySpriteAtlas.instance) {
      CandySpriteAtlas.instance = new CandySpriteAtlas();
    }
    return CandySpriteAtlas.instance;
  }

  public getIsLoaded(): boolean {
    return this.isLoaded;
  }

  public async initLoad(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve) => {
      const img = new Image();
      img.src = './arcor_candies_spritesheet.jpg';

      img.onload = () => {
        try {
          this.processSpritesheet(img);
          this.isLoaded = true;
          resolve();
        } catch (e) {
          console.warn('Error processing candy spritesheet:', e);
          resolve();
        }
      };

      img.onerror = () => {
        console.warn('Failed to load candy spritesheet: ./arcor_candies_spritesheet.jpg');
        resolve();
      };
    });

    return this.loadPromise;
  }

  /**
   * Recorta cada caramelo y procesa el canal alfa para dejar fondo 100% transparente
   */
  private processSpritesheet(img: HTMLImageElement): void {
    const rawCanvas = document.createElement('canvas');
    rawCanvas.width = img.naturalWidth || 1024;
    rawCanvas.height = img.naturalHeight || 1024;
    const rawCtx = rawCanvas.getContext('2d', { willReadFrequently: true });
    if (!rawCtx) return;

    rawCtx.drawImage(img, 0, 0);

    const targetSize = 256; // Resolución limpia para cada sprite en memoria

    for (const [typeKey, coords] of Object.entries(SPRITE_MAP)) {
      const type = typeKey as CandyType;
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = targetSize;
      pieceCanvas.height = targetSize;
      const pieceCtx = pieceCanvas.getContext('2d', { willReadFrequently: true });
      if (!pieceCtx) continue;

      // Dibujar la región centrada en pieceCanvas
      const scale = Math.min((targetSize * 0.90) / coords.w, (targetSize * 0.90) / coords.h);
      const destW = coords.w * scale;
      const destH = coords.h * scale;
      const destX = (targetSize - destW) / 2;
      const destY = (targetSize - destH) / 2;

      pieceCtx.drawImage(
        rawCanvas,
        coords.x, coords.y, coords.w, coords.h,
        destX, destY, destW, destH
      );

      // Clave de color / Alpha keying para remover el fondo negro o gris superior
      const imgData = pieceCtx.getImageData(0, 0, targetSize, targetSize);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        // 1. Detección de fondo negro (típico en todas las piezas)
        const maxRgb = Math.max(r, g, b);
        if (maxRgb < 26) {
          // Fondo oscuro puro
          data[i + 3] = 0;
        } else if (maxRgb < 48) {
          // Borde suave / Feathering
          const ramp = (maxRgb - 26) / 22;
          data[i + 3] = Math.round(a * ramp * ramp);
        }

        // 2. Detección de halo blanquecino en la fila superior
        if (coords.isTopRow) {
          const pixelY = Math.floor(i / 4 / targetSize);
          // Si está en la mitad superior del recuadro y es casi gris/blanco claro
          if (pixelY < targetSize * 0.45 && r > 165 && g > 165 && b > 165) {
            const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
            if (diff < 24) {
              // Es color de fondo neutro claro
              const lum = (r + g + b) / 3;
              if (lum > 210) {
                data[i + 3] = 0;
              } else if (lum > 165) {
                const ramp = 1 - (lum - 165) / 45;
                data[i + 3] = Math.round(a * Math.max(0, ramp));
              }
            }
          }
        }
      }

      pieceCtx.putImageData(imgData, 0, 0);
      this.sprites.set(type, pieceCanvas);
    }

    // Generar variantes artesanales de 1951 a partir de caramelo_1951
    const base1951 = this.sprites.get('caramelo_1951');
    if (base1951) {
      // 1. Caramelo de Miel (Dorado / Ámbar artesanal)
      const mielCanvas = document.createElement('canvas');
      mielCanvas.width = targetSize;
      mielCanvas.height = targetSize;
      const mielCtx = mielCanvas.getContext('2d');
      if (mielCtx) {
        mielCtx.drawImage(base1951, 0, 0);
        const mielImgData = mielCtx.getImageData(0, 0, targetSize, targetSize);
        const md = mielImgData.data;
        for (let i = 0; i < md.length; i += 4) {
          if (md[i + 3] === 0) continue;
          const r = md[i];
          const g = md[i + 1];
          const b = md[i + 2];
          const isHighlight = (r > 180 && g > 150 && b > 150);
          if (isHighlight) {
            md[i] = r;
            md[i + 1] = Math.min(255, g + 20);
            md[i + 2] = Math.max(0, b - 40);
          } else {
            md[i] = Math.min(255, Math.round(r * 1.05));
            md[i + 1] = Math.min(255, Math.round(r * 0.72 + g * 0.25));
            md[i + 2] = Math.min(255, Math.round(b * 0.15));
          }
        }
        mielCtx.putImageData(mielImgData, 0, 0);
        this.sprites.set('caramelo_miel', mielCanvas);
      }

      // 2. Caramelo Cítrico Frutal (Naranja / Cítrico artesanal)
      const frutalCanvas = document.createElement('canvas');
      frutalCanvas.width = targetSize;
      frutalCanvas.height = targetSize;
      const frutalCtx = frutalCanvas.getContext('2d');
      if (frutalCtx) {
        frutalCtx.drawImage(base1951, 0, 0);
        const frutalImgData = frutalCtx.getImageData(0, 0, targetSize, targetSize);
        const fd = frutalImgData.data;
        for (let i = 0; i < fd.length; i += 4) {
          if (fd[i + 3] === 0) continue;
          const r = fd[i];
          const g = fd[i + 1];
          const b = fd[i + 2];
          const isHighlight = (r > 180 && g > 150 && b > 150);
          if (isHighlight) {
            fd[i] = r;
            fd[i + 1] = Math.min(255, g + 10);
            fd[i + 2] = Math.max(0, b - 50);
          } else {
            fd[i] = Math.min(255, Math.round(r * 1.05));
            fd[i + 1] = Math.min(255, Math.round(r * 0.48 + g * 0.25));
            fd[i + 2] = Math.min(255, Math.round(b * 0.15));
          }
        }
        frutalCtx.putImageData(frutalImgData, 0, 0);
        this.sprites.set('caramelo_frutal', frutalCanvas);
      }
    }
  }

  /**
   * Obtiene la textura procesada de un caramelo
   */
  public getSprite(type: CandyType): HTMLCanvasElement | null {
    return this.sprites.get(type) || null;
  }

  /**
   * Dibuja el caramelo con alta fidelidad y rotación
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    type: CandyType,
    cx: number,
    cy: number,
    size: number,
    rotation: number = 0,
    scale: number = 1,
    alpha: number = 1
  ): boolean {
    const sprite = this.sprites.get(type);
    if (!sprite) return false;

    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);
    if (scale !== 1) ctx.scale(scale, scale);
    if (alpha < 1) ctx.globalAlpha *= alpha;

    const half = size / 2;
    ctx.drawImage(sprite, -half, -half, size, size);

    ctx.restore();
    return true;
  }
}

export const candySpriteAtlas = CandySpriteAtlas.getInstance();
