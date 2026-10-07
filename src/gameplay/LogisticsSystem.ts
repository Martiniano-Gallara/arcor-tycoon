export interface DeliveryContract {
  id: string;
  clientName: string;
  clientCity: string;
  distanceKm: number;
  icon: string;
  requestedProducts: Partial<Record<string, number>>;
  rewardMoney: number;
  rewardReputation: number;
  rewardExperience: number;
  durationSeconds: number;
  remainingSeconds: number;
  status: 'available' | 'in_transit' | 'completed';
}

export class LogisticsSystem {
  public contracts: DeliveryContract[] = [];
  public activeContract: DeliveryContract | null = null;
  public truckState: 'idle' | 'in_transit' | 'returning' = 'idle';
  public onContractDispatched?: (contract: DeliveryContract) => void;
  public onContractFinished?: (contract: DeliveryContract) => void;

  constructor() {
    this.refreshContracts(1951);
  }

  public refreshContracts(year: number): void {
    const list: DeliveryContract[] = [];

    // Contrato 1: Local Córdoba
    list.push({
      id: `c-cba-${Date.now()}-1`,
      clientName: 'Almacén Central San Jerónimo',
      clientCity: 'Córdoba Capital (Ruta 19)',
      distanceKm: 110,
      icon: '🏪',
      requestedProducts: { hardCandies: 30 },
      rewardMoney: 450,
      rewardReputation: 1,
      rewardExperience: 60,
      durationSeconds: 12,
      remainingSeconds: 12,
      status: 'available'
    });

    // Contrato 2: Santa Fe / Rosario
    if (year >= 1954) {
      list.push({
        id: `c-ros-${Date.now()}-2`,
        clientName: 'Distribuidora Mayorista del Litoral',
        clientCity: 'Rosario, Santa Fe',
        distanceKm: 340,
        icon: '🚛',
        requestedProducts: { hardCandies: 60, milkCandies: 30 },
        rewardMoney: 950,
        rewardReputation: 2,
        rewardExperience: 140,
        durationSeconds: 18,
        remainingSeconds: 18,
        status: 'available'
      });
    }

    // Contrato 3: Buenos Aires / Puerto Exportación
    if (year >= 1968) {
      list.push({
        id: `c-bsas-${Date.now()}-3`,
        clientName: 'Exportadora Marítima del Plata',
        clientCity: 'Puerto de Buenos Aires',
        distanceKm: 650,
        icon: '🚢',
        requestedProducts: { hardCandies: 100, milkCandies: 60 },
        rewardMoney: 2400,
        rewardReputation: 5,
        rewardExperience: 300,
        durationSeconds: 25,
        remainingSeconds: 25,
        status: 'available'
      });
    }

    // Contrato 4: Bon o Bon Moderno
    if (year >= 1984) {
      list.push({
        id: `c-bon-${Date.now()}-4`,
        clientName: 'Cadena Nacional Supermercados',
        clientCity: 'Buenos Aires & Gran Cuyo',
        distanceKm: 800,
        icon: '🍫',
        requestedProducts: { bonOBon: 60, hardCandies: 100 },
        rewardMoney: 3500,
        rewardReputation: 8,
        rewardExperience: 450,
        durationSeconds: 50,
        remainingSeconds: 50,
        status: 'available'
      });
    }

    this.contracts = list;
  }

  public dispatch(
    contractId: string,
    currentInventory: Record<string, number>
  ): { success: boolean; message: string; consumed: Partial<Record<string, number>> } {
    if (this.activeContract) {
      return { success: false, message: 'El camión ya se encuentra en ruta de reparto.', consumed: {} };
    }

    const c = this.contracts.find(item => item.id === contractId);
    if (!c) {
      return { success: false, message: 'Contrato no encontrado.', consumed: {} };
    }

    // Verificar stock
    for (const [prod, needed] of Object.entries(c.requestedProducts)) {
      const stock = currentInventory[prod] || 0;
      if (stock < (needed || 0)) {
        return {
          success: false,
          message: `Stock insuficiente: necesitas ${needed} de ${prod} (tienes ${stock}).`,
          consumed: {}
        };
      }
    }

    // Despachar
    c.status = 'in_transit';
    c.remainingSeconds = c.durationSeconds;
    this.activeContract = c;
    this.truckState = 'in_transit';

    if (this.onContractDispatched) {
      this.onContractDispatched(c);
    }

    return {
      success: true,
      message: `¡Camión despachado rumbo a ${c.clientCity}!`,
      consumed: { ...c.requestedProducts }
    };
  }

  public update(delta: number): { completedContract: DeliveryContract | null } {
    if (!this.activeContract) return { completedContract: null };

    this.activeContract.remainingSeconds -= delta;
    if (this.activeContract.remainingSeconds <= 0) {
      const finished = this.activeContract;
      finished.status = 'completed';
      this.activeContract = null;
      this.truckState = 'idle';

      // Remover el completado de la lista y regenerar si está vacía
      this.contracts = this.contracts.filter(ct => ct.id !== finished.id);
      if (this.contracts.length === 0) {
        this.refreshContracts(1960);
      }

      if (this.onContractFinished) {
        this.onContractFinished(finished);
      }

      return { completedContract: finished };
    }

    return { completedContract: null };
  }
}
