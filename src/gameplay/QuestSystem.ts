export interface Quest {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  rewardMoney: number;
  rewardReputation: number;
  unlockCardId?: string;
  completed: boolean;
}

export class QuestSystem {
  private quests: Quest[] = [
    {
      id: 'quest-primer-lote',
      title: 'El Primer Lote de 1951',
      description: 'Compra 10 sacos de azúcar y elabora 50 caramelos duros en la paila de cobre.',
      targetAmount: 50,
      currentAmount: 0,
      rewardMoney: 150,
      rewardReputation: 2,
      unlockCardId: 'card-caramelo-cristal',
      completed: false
    },
    {
      id: 'quest-primer-reparto',
      title: 'El Reparto en Arroyito',
      description: 'Vende caramelos a los almacenes locales para consolidar las ventas.',
      targetAmount: 100,
      currentAmount: 0,
      rewardMoney: 350,
      rewardReputation: 5,
      completed: false
    }
  ];

  public getQuests(): Quest[] {
    return this.quests;
  }

  public getCurrentQuest(): Quest | null {
    return this.quests.find(q => !q.completed) || null;
  }

  public trackProgress(amount: number): { completedQuest: Quest | null } {
    const active = this.getCurrentQuest();
    if (!active) return { completedQuest: null };

    active.currentAmount = Math.min(active.targetAmount, active.currentAmount + amount);
    if (active.currentAmount >= active.targetAmount && !active.completed) {
      active.completed = true;
      return { completedQuest: active };
    }
    return { completedQuest: null };
  }
}
