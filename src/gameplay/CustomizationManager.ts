/**
 * CUSTOMIZATION MANAGER: GESTIÓN DE PERSONALIZACIÓN, DESBLOQUEOS Y CREACIONES
 * 
 * Permite a los jugadores:
 * 1. Crear productos de confitería y chocolates personalizados con marcas reales de Arcor.
 * 2. Diseñar cajas de regalo virtuales con productos Arcor, golosinas personalizadas, moños y dedicatorias.
 * 3. Desbloquear nuevos packagings, stickers, colores y estilos según su progreso en Candy Crush y Quiz.
 */

import { gameState } from './GameState.ts';

// ---------------------------------------------------------------------------
// 1. TIPOS Y ESTRUCTURAS
// ---------------------------------------------------------------------------

export type ArcorBrandKey = 'arcor' | 'bonobon' | 'cofler' | 'mogul' | 'bagley' | 'buttertoffe' | 'rocklets' | 'aguila';

export type PackagingType = 'flow_pack' | 'caja_bombones' | 'lata_vintage' | 'tubo_confites' | 'pouch_doypack' | 'tableta_chocolate';

export type RibbonColor = 'dorado' | 'rojo' | 'azul' | 'verde' | 'rosa';

export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  text: string;
  accent: string;
  unlockedByDefault: boolean;
  requiredLevel?: number;
}

export interface StickerBadge {
  id: string;
  label: string;
  icon: string;
  description: string;
  unlockedByDefault: boolean;
  requiredLevel?: number;
  requiredQuizPoints?: number;
}

export interface BoxDesign {
  id: string;
  name: string;
  material: string;
  description: string;
  bgGradient: string;
  borderColor: string;
  unlockedByDefault: boolean;
  requiredLevel?: number;
}

export interface BoxTheme {
  id: string;
  name: string;
  icon: string;
  defaultDedication: string;
}

export interface CustomProduct {
  id: string;
  brand: ArcorBrandKey;
  packaging: PackagingType;
  name: string;
  flavorOrMessage: string;
  colorThemeId: string;
  selectedStickers: string[]; // IDs de stickers
  ribbonColor?: RibbonColor;
  createdAt: number;
}

export interface PlacedBoxProduct {
  id: string;
  type: string; // 'bonobon', 'mogul', 'rocklets', 'chocolinas', etc. o 'custom_prod_{id}'
  name: string;
  icon: string;
  xPercent: number; // 0..100
  yPercent: number; // 0..100
  rotationDeg: number;
}

export interface GiftBox {
  id: string;
  boxDesignId: string;
  themeId: string;
  toPerson: string;
  fromPerson: string;
  dedicationMessage: string;
  ribbonColor: RibbonColor;
  placedProducts: PlacedBoxProduct[];
  createdAt: number;
}

// ---------------------------------------------------------------------------
// 2. CATÁLOGO MAESTRO DE ELEMENTOS OFICIALES ARCOR
// ---------------------------------------------------------------------------

export const ARCOR_BRANDS_INFO: Record<ArcorBrandKey, { name: string; slogan: string; logoTag: string; icon: string; defaultColor: string }> = {
  arcor: {
    name: 'Arcor',
    slogan: 'Le damos sabor al mundo',
    logoTag: 'ARCOR',
    icon: '🍬',
    defaultColor: '#d4af37'
  },
  bonobon: {
    name: 'Bon o Bon',
    slogan: 'Donde hay emoción, hay Bon o Bon',
    logoTag: 'bon o bon',
    icon: '🍫',
    defaultColor: '#d32f2f'
  },
  cofler: {
    name: 'Cofler',
    slogan: 'La felicidad no tiene horario',
    logoTag: 'Cofler',
    icon: '🍫',
    defaultColor: '#3e2723'
  },
  mogul: {
    name: 'Mogul',
    slogan: 'Gomitas con jugo natural de frutas',
    logoTag: 'Mogul',
    icon: '🐻',
    defaultColor: '#e91e63'
  },
  bagley: {
    name: 'Bagley',
    slogan: 'Las mejores galletitas desde 1864',
    logoTag: 'Bagley',
    icon: '🍪',
    defaultColor: '#0d47a1'
  },
  buttertoffe: {
    name: 'Butter Toffees',
    slogan: 'El placer de un caramelo suave',
    logoTag: 'Butter Toffees',
    icon: '👑',
    defaultColor: '#e65100'
  },
  rocklets: {
    name: 'Rocklets',
    slogan: 'Llená tu día de colores',
    logoTag: 'ROCKLETS',
    icon: '🌈',
    defaultColor: '#00bcd4'
  },
  aguila: {
    name: 'Águila',
    slogan: 'El chocolate de los argentinos desde 1880',
    logoTag: 'Águila',
    icon: '🦅',
    defaultColor: '#212121'
  }
};

export const PACKAGING_TYPES_INFO: Record<PackagingType, { name: string; icon: string; description: string; unlockedByDefault: boolean; requiredLevel?: number }> = {
  flow_pack: {
    name: 'Envoltorio Flow-Pack',
    icon: '🍬',
    description: 'Sellado hermético de celofán satinado con bordes zigzag.',
    unlockedByDefault: true
  },
  tableta_chocolate: {
    name: 'Papel Metalizado & Faja',
    icon: '🍫',
    description: 'Envoltorio premium con papel aluminio dorado y faja ilustrada.',
    unlockedByDefault: true
  },
  caja_bombones: {
    name: 'Caja Estuche de Lujo',
    icon: '🎁',
    description: 'Elegante estuche con ventana transparente y acabado repujado.',
    unlockedByDefault: false,
    requiredLevel: 3
  },
  tubo_confites: {
    name: 'TUBO CONFITERO CRISTAL',
    icon: '🧪',
    description: 'Tubo cilíndrico transparente con tapa dorada para confites.',
    unlockedByDefault: true
  },
  pouch_doypack: {
    name: 'BOLSA POUCH DOYPACK',
    icon: '🛍️',
    description: 'Empaque de pie con cierre ziploc reutilizable para gomitas.',
    unlockedByDefault: false,
    requiredLevel: 9
  },
  lata_vintage: {
    name: 'LATA VINTAGE DE HOJALATA',
    icon: '🧰',
    description: 'Lata conmemorativa coleccionable estilo Arroyito años 60.',
    unlockedByDefault: false,
    requiredLevel: 15
  }
};

export const COLOR_THEMES_CATALOG: ColorTheme[] = [
  {
    id: 'gold_75',
    name: 'Oro Imperial 75 Años',
    primary: '#ffd700',
    secondary: '#8c5816',
    text: '#2b1505',
    accent: '#ffffff',
    unlockedByDefault: true
  },
  {
    id: 'bonobon_red',
    name: 'Rojo & Crema Pasión',
    primary: '#d32f2f',
    secondary: '#6c0c0c',
    text: '#fff8eb',
    accent: '#ffd54f',
    unlockedByDefault: true
  },
  {
    id: 'choco_gold',
    name: 'Chocolate & Nuez',
    primary: '#4e2710',
    secondary: '#281105',
    text: '#fff3e0',
    accent: '#d4af37',
    unlockedByDefault: true
  },
  {
    id: 'mogul_rainbow',
    name: 'Neón Frutal Fiestas',
    primary: '#db2777',
    secondary: '#700b39',
    text: '#ffffff',
    accent: '#ffd700',
    unlockedByDefault: true
  },
  {
    id: 'bagley_blue',
    name: 'Azul Galletitas Bagley',
    primary: '#0284c7',
    secondary: '#0c4a6e',
    text: '#ffffff',
    accent: '#38bdf8',
    unlockedByDefault: true
  },
  {
    id: 'vintage_emerald',
    name: 'Verde Menta de Época',
    primary: '#16a34a',
    secondary: '#14532d',
    text: '#ffffff',
    accent: '#4ade80',
    unlockedByDefault: false,
    requiredLevel: 8
  }
];

export const STICKERS_CATALOG: StickerBadge[] = [
  {
    id: 'st_75_anos',
    label: '75 Años Arcor',
    icon: '★',
    description: 'Emblema conmemorativo 1951 - 2026',
    unlockedByDefault: true
  },
  {
    id: 'st_arroyito',
    label: 'Hecho en Arroyito',
    icon: '🏭',
    description: 'Sello de origen de la primera fábrica de Córdoba',
    unlockedByDefault: true
  },
  {
    id: 'st_sin_tacc',
    label: 'Libre de Gluten',
    icon: '🌿',
    description: 'Certificación Sin T.A.C.C. de Arcor',
    unlockedByDefault: true
  },
  {
    id: 'st_dulzura',
    label: 'Semana de la Dulzura',
    icon: '🍬',
    description: 'Una golosina por un beso (1989)',
    unlockedByDefault: true
  },
  {
    id: 'st_cacao_puro',
    label: '70% Cacao Fino',
    icon: '🍫',
    description: 'Selección de granos de cacao premium',
    unlockedByDefault: true
  },
  {
    id: 'st_calidad_oro',
    label: 'Calidad de Origen',
    icon: '🔒',
    description: 'Sello dorado de excelencia Don Fulvio',
    unlockedByDefault: false,
    requiredQuizPoints: 300
  },
  {
    id: 'st_con_amor',
    label: 'Hecho con Afecto',
    icon: '❤️',
    description: 'Edición especial para compartir',
    unlockedByDefault: false,
    requiredQuizPoints: 600
  }
];

export const BOX_DESIGNS_CATALOG: BoxDesign[] = [
  {
    id: 'box_gold_75',
    name: 'Caja Dorada 75 Años',
    material: 'Cartón Rígido con Foil Dorado',
    description: 'Acabado conmemorativo brillante con marco barroco imperial.',
    bgGradient: 'radial-gradient(circle at 50% 30%, #5e3713 0%, #2b1305 100%)',
    borderColor: '#ffd700',
    unlockedByDefault: true
  },
  {
    id: 'box_madera_1951',
    name: 'Cajón de Madera Arroyito 1951',
    material: 'Madera Envejecida Rústica',
    description: 'Réplica de las primeras cajas de embalaje que salían de la fábrica.',
    bgGradient: 'linear-gradient(135deg, #4a2810 0%, #291204 100%)',
    borderColor: '#b87333',
    unlockedByDefault: true
  },
  {
    id: 'box_festejo',
    name: 'Caja Festiva Fiesta & Alegría',
    material: 'Laminado Brillante Multicolor',
    description: 'Ideal para cumpleaños y celebraciones familiares llenas de color.',
    bgGradient: 'radial-gradient(circle at 50% 50%, #880e4f 0%, #311b92 100%)',
    borderColor: '#ff4081',
    unlockedByDefault: false,
    requiredLevel: 4
  },
  {
    id: 'box_lata_retro',
    name: 'Lata de Colección Don Fulvio',
    material: 'Hojalata Vintage Grabada',
    description: 'Diseño clásico retro con relieve en la tapa.',
    bgGradient: 'linear-gradient(180deg, #1b3a4b 0%, #061722 100%)',
    borderColor: '#48cae4',
    unlockedByDefault: false,
    requiredLevel: 10
  }
];

export const BOX_THEMES_CATALOG: BoxTheme[] = [
  {
    id: 'theme_cumple',
    name: '¡Feliz Cumpleaños! 🎂',
    icon: '🎂',
    defaultDedication: '¡Que tu día sea tan dulce e inolvidable como todas estas golosinas! ¡Feliz cumple!'
  },
  {
    id: 'theme_dulzura',
    name: 'Semana de la Dulzura 💋',
    icon: '💋',
    defaultDedication: 'Una golosina por un beso... ¡y todo el cariño del mundo para vos!'
  },
  {
    id: 'theme_gracias',
    name: '¡Muchas Gracias! 🌟',
    icon: '🌟',
    defaultDedication: 'Un pequeño detalle dulce para agradecerte de corazón todo tu apoyo y compañía.'
  },
  {
    id: 'theme_amor',
    name: 'Con Todo Mi Cariño 💖',
    icon: '💖',
    defaultDedication: 'Para la persona más dulce de mi vida. Espero que disfrutes cada bocado.'
  },
  {
    id: 'theme_75',
    name: 'Celebración 75 Años 🏆',
    icon: '🏆',
    defaultDedication: 'Celebrando 75 años de historia, pasión argentina y los sabores que nos unen.'
  }
];

// ---------------------------------------------------------------------------
// 3. CLASE GESTORA: CUSTOMIZATION MANAGER
// ---------------------------------------------------------------------------

export class CustomizationManager {
  private static instance: CustomizationManager;

  private customProducts: CustomProduct[] = [];
  private giftBoxes: GiftBox[] = [];

  private static KEY_PRODUCTS = 'arcor_custom_products_v1';
  private static KEY_BOXES = 'arcor_gift_boxes_v1';

  private constructor() {
    this.loadFromStorage();
    if (typeof gameState !== 'undefined' && gameState?.onReset) {
      gameState.onReset(() => this.reset());
    } else {
      setTimeout(() => {
        if (typeof gameState !== 'undefined' && gameState?.onReset) {
          gameState.onReset(() => this.reset());
        }
      }, 0);
    }
  }

  public static getInstance(): CustomizationManager {
    if (!CustomizationManager.instance) {
      CustomizationManager.instance = new CustomizationManager();
    }
    return CustomizationManager.instance;
  }

  private loadFromStorage(): void {
    try {
      const rawP = localStorage.getItem(CustomizationManager.KEY_PRODUCTS);
      if (rawP) this.customProducts = JSON.parse(rawP);

      const rawB = localStorage.getItem(CustomizationManager.KEY_BOXES);
      if (rawB) this.giftBoxes = JSON.parse(rawB);
    } catch (e) {
      console.warn('Error loading custom products or gift boxes:', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(CustomizationManager.KEY_PRODUCTS, JSON.stringify(this.customProducts));
      localStorage.setItem(CustomizationManager.KEY_BOXES, JSON.stringify(this.giftBoxes));
    } catch (e) {
      console.warn('Error saving custom products or gift boxes:', e);
    }
  }

  // =========================================================================
  // GESTIÓN DE PRODUCTOS PERSONALIZADOS
  // =========================================================================

  public getCustomProducts(): CustomProduct[] {
    return [...this.customProducts];
  }

  public static readonly MAX_SAVED_ITEMS = 50;

  public saveCustomProduct(product: Omit<CustomProduct, 'id' | 'createdAt'>): CustomProduct {
    if (this.customProducts.length >= CustomizationManager.MAX_SAVED_ITEMS) {
      throw new Error(`Límite alcanzado: máximo ${CustomizationManager.MAX_SAVED_ITEMS} golosinas personalizadas.`);
    }
    const fullProduct: CustomProduct = {
      ...product,
      id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now()
    };
    this.customProducts.unshift(fullProduct);
    this.saveToStorage();
    return fullProduct;
  }

  public deleteCustomProduct(id: string): void {
    this.customProducts = this.customProducts.filter(p => p.id !== id);
    this.saveToStorage();
  }

  // =========================================================================
  // GESTIÓN DE CAJAS OBSEQUIO
  // =========================================================================

  public getGiftBoxes(): GiftBox[] {
    return [...this.giftBoxes];
  }

  public saveGiftBox(box: Omit<GiftBox, 'id' | 'createdAt'>): GiftBox {
    if (this.giftBoxes.length >= CustomizationManager.MAX_SAVED_ITEMS) {
      throw new Error(`Límite alcanzado: máximo ${CustomizationManager.MAX_SAVED_ITEMS} cajas de regalo.`);
    }
    const fullBox: GiftBox = {
      ...box,
      id: `box_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now()
    };
    this.giftBoxes.unshift(fullBox);
    this.saveToStorage();
    return fullBox;
  }

  public deleteGiftBox(id: string): void {
    this.giftBoxes = this.giftBoxes.filter(b => b.id !== id);
    this.saveToStorage();
  }

  public reset(): void {
    this.customProducts = [];
    this.giftBoxes = [];
    this.saveToStorage();
  }

  private getCurrentLevel(): number {
    if (typeof gameState === 'undefined' || !gameState) return 1;
    return (gameState.getData() as any)?.match3CurrentLevel || 1;
  }

  // =========================================================================
  // VERIFICACIÓN DE DESBLOQUEOS
  // =========================================================================

  public isPackagingUnlocked(type: PackagingType): { isUnlocked: boolean; requirementText?: string } {
    const info = PACKAGING_TYPES_INFO[type];
    if (!info || info.unlockedByDefault) return { isUnlocked: true };

    const currentLevel = this.getCurrentLevel();
    if (info.requiredLevel && currentLevel >= info.requiredLevel) {
      return { isUnlocked: true };
    }

    return {
      isUnlocked: false,
      requirementText: `Se desbloquea en Nivel ${info.requiredLevel} de Arcor Crush`
    };
  }

  public isColorThemeUnlocked(theme: ColorTheme): { isUnlocked: boolean; requirementText?: string } {
    if (theme.unlockedByDefault) return { isUnlocked: true };

    const currentLevel = this.getCurrentLevel();
    if (theme.requiredLevel && currentLevel >= theme.requiredLevel) {
      return { isUnlocked: true };
    }

    return {
      isUnlocked: false,
      requirementText: `Se desbloquea en Nivel ${theme.requiredLevel} de Arcor Crush`
    };
  }

  public isStickerUnlocked(sticker: StickerBadge): { isUnlocked: boolean; requirementText?: string } {
    if (sticker.unlockedByDefault) return { isUnlocked: true };

    const currentLevel = this.getCurrentLevel();
    if (sticker.requiredLevel && currentLevel >= sticker.requiredLevel) {
      return { isUnlocked: true };
    }

    if (sticker.requiredQuizPoints) {
      const data = gameState.getData() as any;
      const quizPts = data.totalQuizScore || 0;
      if (quizPts >= sticker.requiredQuizPoints) {
        return { isUnlocked: true };
      }
      return {
        isUnlocked: false,
        requirementText: `Requiere ${sticker.requiredQuizPoints} pts en Trivia Arcor (${quizPts}/${sticker.requiredQuizPoints})`
      };
    }

    return {
      isUnlocked: false,
      requirementText: `Se desbloquea en Nivel ${sticker.requiredLevel}`
    };
  }

  public isBoxDesignUnlocked(box: BoxDesign): { isUnlocked: boolean; requirementText?: string } {
    if (box.unlockedByDefault) return { isUnlocked: true };

    const currentLevel = this.getCurrentLevel();
    if (box.requiredLevel && currentLevel >= box.requiredLevel) {
      return { isUnlocked: true };
    }

    return {
      isUnlocked: false,
      requirementText: `Se desbloquea en Nivel ${box.requiredLevel} de Arcor Crush`
    };
  }

  // =========================================================================
  // ESTADÍSTICAS GLOBALES DE COLECCIÓN
  // =========================================================================

  public getCollectionStatistics(): {
    totalItems: number;
    unlockedItems: number;
    unlockedByProgressionItems: number;
    percentage: number;
    customProductsCreated: number;
    giftBoxesCreated: number;
  } {
    let total = 0;
    let unlocked = 0;
    let unlockedByProgression = 0;

    // Packagings
    for (const key in PACKAGING_TYPES_INFO) {
      total++;
      const info = PACKAGING_TYPES_INFO[key as PackagingType];
      const isUn = this.isPackagingUnlocked(key as PackagingType).isUnlocked;
      if (isUn) {
        unlocked++;
        if (!info.unlockedByDefault) unlockedByProgression++;
      }
    }

    // Colores
    for (const color of COLOR_THEMES_CATALOG) {
      total++;
      const isUn = this.isColorThemeUnlocked(color).isUnlocked;
      if (isUn) {
        unlocked++;
        if (!color.unlockedByDefault) unlockedByProgression++;
      }
    }

    // Stickers
    for (const st of STICKERS_CATALOG) {
      total++;
      const isUn = this.isStickerUnlocked(st).isUnlocked;
      if (isUn) {
        unlocked++;
        if (!st.unlockedByDefault) unlockedByProgression++;
      }
    }

    // Cajas
    for (const box of BOX_DESIGNS_CATALOG) {
      total++;
      const isUn = this.isBoxDesignUnlocked(box).isUnlocked;
      if (isUn) {
        unlocked++;
        if (!box.unlockedByDefault) unlockedByProgression++;
      }
    }

    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    return {
      totalItems: total,
      unlockedItems: unlocked,
      unlockedByProgressionItems: unlockedByProgression,
      percentage,
      customProductsCreated: this.customProducts.length,
      giftBoxesCreated: this.giftBoxes.length
    };
  }
}

export const customizationManager = CustomizationManager.getInstance();
