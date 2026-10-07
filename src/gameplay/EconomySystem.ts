import { soundManager } from '../core/SoundManager.ts';

export class EconomySystem {
  public static readonly SUGAR_PRICE = 15; // USD por saco
  public static readonly GLUCOSE_PRICE = 25; // USD por tarro
  public static readonly CANDY_SELL_PRICE = 2; // USD por caramelo

  /**
   * Intenta comprar sacos de azúcar
   */
  public buySugar(currentMoney: number, currentSugar: number, count: number = 5): { success: boolean; newMoney: number; newSugar: number; message: string } {
    const cost = count * EconomySystem.SUGAR_PRICE;
    if (currentMoney < cost) {
      return { success: false, newMoney: currentMoney, newSugar: currentSugar, message: 'Fondos insuficientes para azúcar' };
    }
    soundManager.playCoin();
    return {
      success: true,
      newMoney: currentMoney - cost,
      newSugar: currentSugar + count,
      message: `Comprados ${count} sacos de azúcar (-$${cost} USD)`
    };
  }

  /**
   * Elabora un lote de caramelos duros en la paila de cobre (1951)
   */
  public produceBatch(currentSugar: number, currentCandies: number): { success: boolean; newSugar: number; newCandies: number; produced: number; message: string } {
    const sugarNeeded = 2; // 2 sacos de azúcar
    const batchYield = 25; // 25 caramelos por lote

    if (currentSugar < sugarNeeded) {
      return { success: false, newSugar: currentSugar, newCandies: currentCandies, produced: 0, message: `Se necesitan ${sugarNeeded} sacos de azúcar para encender la paila` };
    }

    soundManager.playSteam();
    return {
      success: true,
      newSugar: currentSugar - sugarNeeded,
      newCandies: currentCandies + batchYield,
      produced: batchYield,
      message: `¡Lote cocinado! +${batchYield} Caramelos Cristalinos`
    };
  }

  /**
   * Vende caramelos a los almacenes
   */
  public sellCandies(currentMoney: number, currentCandies: number, count: number = 25): { success: boolean; newMoney: number; newCandies: number; earnings: number; message: string } {
    if (currentCandies < count) {
      return { success: false, newMoney: currentMoney, newCandies: currentCandies, earnings: 0, message: 'Stock de caramelos insuficiente' };
    }

    const earnings = count * EconomySystem.CANDY_SELL_PRICE;
    soundManager.playCoin();
    return {
      success: true,
      newMoney: currentMoney + earnings,
      newCandies: currentCandies - count,
      earnings,
      message: `¡Venta completada! +$${earnings} USD`
    };
  }
}

export const economySystem = new EconomySystem();
