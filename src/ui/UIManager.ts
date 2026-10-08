import { TitleScreen } from './TitleScreen.ts';
import { ArchiveModal } from './ArchiveModal.ts';
import { SettingsModal } from './SettingsModal.ts';
import { NarrativeDialog } from './NarrativeDialog.ts';
import { HistoricalCardModal } from './HistoricalCardModal.ts';
import { GameplayHUD } from './GameplayHUD.ts';
import { WorkersModal } from './WorkersModal.ts';
import { ContractsModal } from './ContractsModal.ts';
import { WorldMapModal } from './WorldMapModal.ts';
import { ArcoritoGuideModal } from './ArcoritoGuideModal.ts';
import { RawMaterialsModal } from './RawMaterialsModal.ts';
import { ManufacturingModal } from './ManufacturingModal.ts';
import { Match3Engine } from '../minigame/Match3Engine.ts';
import { Match3HUD } from './Match3HUD.ts';
import { SagaMapEngine } from './SagaMapEngine.ts';
import { MetaProgressionBridge } from '../gameplay/MetaProgressionBridge.ts';
import { gameState } from '../gameplay/GameState.ts';
import { SaveManager } from '../core/SaveManager.ts';
import { progressionState } from '../gameplay/ProgressionState.ts';
import { tickSystem } from '../core/TickSystem.ts';
import { MuseumOfFlavorEngine } from '../museum/MuseumOfFlavorEngine.ts';
import { ArcorQuizModal } from './ArcorQuizModal.ts';
import { ProductCreatorModal } from './ProductCreatorModal.ts';
import { GiftBoxBuilderModal } from './GiftBoxBuilderModal.ts';
import { MyCollectionModal } from './MyCollectionModal.ts';
import { sanitizeSharedGiftBox } from '../core/SecurityUtils.ts';
import { achievementsManager } from '../gameplay/AchievementsManager.ts';

export class UIManager {
  private uiRoot: HTMLElement;

  public titleScreen: TitleScreen;
  public archiveModal: ArchiveModal;
  public settingsModal: SettingsModal;
  public narrativeDialog: NarrativeDialog;
  public historicalCardModal: HistoricalCardModal;
  public gameplayHUD: GameplayHUD;
  public workersModal: WorkersModal;
  public contractsModal: ContractsModal;
  public worldMapModal: WorldMapModal;
  public arcoritoGuideModal: ArcoritoGuideModal;
  public rawMaterialsModal: RawMaterialsModal;
  public manufacturingModal: ManufacturingModal;

  // Match-3 Narrativo y Saga Map de Progresión Histórica
  public metaBridge: MetaProgressionBridge;
  public match3Engine: Match3Engine;
  public match3HUD: Match3HUD;
  public sagaMapEngine: SagaMapEngine;

  // Museo del Sabor - 75 Años de Arcor
  public museumEngine: MuseumOfFlavorEngine;
  private previousScreenBeforeMuseum: 'title' | 'sagamap' | 'gameplay' = 'title';

  // Módulo de Quiz Histórico (Recuperación de Vidas)
  public arcorQuizModal: ArcorQuizModal;
  private previousScreenBeforeQuiz: 'match3' | 'sagamap' | 'gameplay' = 'sagamap';

  // Taller Creativo y Colección Arcor
  public productCreatorModal: ProductCreatorModal;
  public giftBoxBuilderModal: GiftBoxBuilderModal;
  public myCollectionModal: MyCollectionModal;
  private previousScreenBeforeWorkshop: 'sagamap' | 'gameplay' = 'gameplay';

  constructor(uiRoot: HTMLElement) {
    this.uiRoot = uiRoot;

    // Inicializar puente de progresión y motor de puzzle Match-3
    this.metaBridge = new MetaProgressionBridge();
    this.match3Engine = new Match3Engine();
    this.match3HUD = new Match3HUD(this.match3Engine, this.metaBridge);

    // 1. Modales de información y polaroid
    this.historicalCardModal = new HistoricalCardModal();
    this.archiveModal = new ArchiveModal(this.metaBridge, (event) => {
      this.historicalCardModal.show(event);
    });
    this.archiveModal.onMilestoneAdvanced = () => {
      this.gameplayHUD.updateState(gameState.getData());
      this.museumEngine.updateHistoryButton();
      this.gameplayHUD.showToast('¡Hito histórico desbloqueado! Fábrica expandida 🌾🏭');
    };

    // Saga Map interactivo de progresión
    this.sagaMapEngine = new SagaMapEngine(this.metaBridge, this.historicalCardModal);
    this.sagaMapEngine.onPlayLevelRequested = (lvl) => {
      this.tryStartLevel(lvl);
    };
    this.sagaMapEngine.onOpenFactoryRequested = () => {
      this.sagaMapEngine.hide();
      this.gameplayHUD.show();
    };
    this.sagaMapEngine.onOpenSettingsRequested = () => {
      this.settingsModal.show();
    };
    this.sagaMapEngine.onOpenMuseumRequested = () => {
      this.openMuseum('sagamap');
    };
    this.sagaMapEngine.onOpenQuizRequested = () => {
      this.openQuiz('sagamap');
    };

    // 1b. Inicializar Museo del Sabor (75 Años de Arcor)
    this.museumEngine = new MuseumOfFlavorEngine();
    this.museumEngine.onCloseRequested = () => {
      this.closeMuseum();
    };
    this.museumEngine.onOpenHistory = () => {
      this.archiveModal.show();
    };

    // 1c. Inicializar Módulo de Quiz de Historia y Vidas Arcor
    this.arcorQuizModal = new ArcorQuizModal();
    this.arcorQuizModal.onClose = () => {
      if (this.previousScreenBeforeQuiz === 'sagamap') {
        this.sagaMapEngine.show();
      } else if (this.previousScreenBeforeQuiz === 'gameplay') {
        this.gameplayHUD.show();
        this.gameplayHUD.updateProgressionInfo();
      }
    };
    this.match3HUD.onOpenQuizRequested = () => {
      this.openQuiz('match3');
    };

    // 1d. Inicializar Taller Creativo y Colección Arcor
    this.productCreatorModal = new ProductCreatorModal();
    this.giftBoxBuilderModal = new GiftBoxBuilderModal();
    this.myCollectionModal = new MyCollectionModal();

    // Conexiones cruzadas del ecosistema de creación
    this.productCreatorModal.onUseInGiftBox = (product) => {
      this.productCreatorModal.hide();
      this.giftBoxBuilderModal.showWithSpecificProduct(product);
    };
    this.productCreatorModal.onOpenCollection = () => {
      this.productCreatorModal.hide();
      this.openMyCollection('products', this.previousScreenBeforeWorkshop);
    };

    this.giftBoxBuilderModal.onOpenCollection = () => {
      this.giftBoxBuilderModal.hide();
      this.openMyCollection('boxes', this.previousScreenBeforeWorkshop);
    };
    this.giftBoxBuilderModal.onCreateProductRequested = () => {
      this.giftBoxBuilderModal.hide();
      this.openProductCreator(this.previousScreenBeforeWorkshop);
    };

    this.myCollectionModal.onCreateProductRequested = () => {
      this.myCollectionModal.hide();
      this.openProductCreator(this.previousScreenBeforeWorkshop);
    };
    this.myCollectionModal.onCreateGiftBoxRequested = () => {
      this.myCollectionModal.hide();
      this.openGiftBoxBuilder(this.previousScreenBeforeWorkshop);
    };
    this.myCollectionModal.onPlayQuizRequested = () => {
      this.myCollectionModal.hide();
      this.openQuiz(this.previousScreenBeforeWorkshop);
    };
    this.myCollectionModal.onPlayMatch3Requested = () => {
      this.myCollectionModal.hide();
      this.tryStartLevel();
    };

    this.sagaMapEngine.onOpenProductCreatorRequested = () => {
      this.openProductCreator('sagamap');
    };
    this.sagaMapEngine.onOpenGiftBoxRequested = () => {
      this.openGiftBoxBuilder('sagamap');
    };
    this.sagaMapEngine.onOpenCollectionRequested = (tab) => {
      this.openMyCollection(tab || 'products', 'sagamap');
    };

    // Al cerrar Match3HUD, volver a la fábrica animada con los datos actualizados
    this.match3HUD.onClose = () => {
      this.gameplayHUD.show();
      this.gameplayHUD.factoryView.syncWithState();
    };

    this.metaBridge.onMilestoneUnlocked = (event) => {
      this.historicalCardModal.show(event);
      this.gameplayHUD.showToast(`¡Hito histórico desbloqueado: ${event.title} (${event.year})! ⭐📜`);
      this.gameplayHUD.factoryView.syncWithState();
    };

    this.metaBridge.onFactoryUpgradeUnlocked = (event) => {
      this.gameplayHUD.factoryView.syncWithState();
      this.gameplayHUD.showToast(`¡Fábrica modernizada! Nuevas instalaciones añadidas (${event.year}) 🏭✨`);
    };

    this.settingsModal = new SettingsModal();

    // 2. Diálogo narrativo con Don Fulvio y Arcorito
    this.narrativeDialog = new NarrativeDialog();

    this.workersModal = new WorkersModal(() => {});
    this.contractsModal = new ContractsModal();

    // 4. Modal de Filiales y Rutas de Exportación (Mapa Mundial)
    this.worldMapModal = new WorldMapModal((branch) => {
      this.gameplayHUD.showToast(`¡Inaugurada filial: ${branch.name}! 🌍`);
    });

    // 5. Modales de Mercado de Insumos y Planta de Elaboración
    this.rawMaterialsModal = new RawMaterialsModal(() => {
      this.gameplayHUD.showToast('¡Insumos recibidos en el almacén de Arroyito! 🌾');
    });

    this.manufacturingModal = new ManufacturingModal((completedEvent) => {
      if (completedEvent) {
        this.historicalCardModal.show(completedEvent);
      }
    });

    // 6. Guía Oficial e Interactiva de Arcorito
    this.arcoritoGuideModal = new ArcoritoGuideModal({
      onOpenMuseum: () => this.openMuseum('gameplay'),
      onOpenArcorCrushMap: () => {
        this.gameplayHUD.hide();
        this.sagaMapEngine.show();
      },
      onPlayLevel: () => {
        this.tryStartLevel();
      },
      onOpenHistory: () => {
        this.archiveModal.show();
      },
      onViewFactory: () => {
        this.sagaMapEngine.hide();
        this.gameplayHUD.show();
        this.gameplayHUD.showToast('Visualizando el predio industrial de Arroyito 🌾🏭');
      }
    });

    // 7. HUD de juego con fábrica ilustrada animada, globos de texto, monedas y vidas
    this.gameplayHUD = new GameplayHUD({
      onOpenArcorCrushMap: () => {
        this.gameplayHUD.hide();
        this.sagaMapEngine.show();
      },
      onPlayArcorCrushLatest: () => {
        this.tryStartLevel();
      },
      onOpenHistory: () => {
        this.archiveModal.show();
      },
      onViewFactory: () => {
        this.gameplayHUD.factoryView.syncWithState();
        this.gameplayHUD.showToast('Predio Arroyito en constante evolución histórica 🌾🏭');
      },
      onReturnToMenu: () => {
        this.returnToMainMenu();
      },
      onOpenSettings: () => {
        this.settingsModal.show();
      },
      onOpenArchive: () => {
        this.archiveModal.show();
      },
      onOpenMuseum: () => {
        this.openMuseum('gameplay');
      },
      onOpenQuiz: () => {
        this.openQuiz('gameplay');
      },
      onOpenProductCreator: () => {
        this.openProductCreator('gameplay');
      },
      onOpenGiftBoxBuilder: () => {
        this.openGiftBoxBuilder('gameplay');
      },
      onOpenCollection: (tab) => {
        this.openMyCollection(tab || 'products', 'gameplay');
      },
      onOpenFulvioTasks: () => {
        const event = gameState.questManager.getCurrentEvent();
        if (event) {
          this.narrativeDialog.showFulvioDirective(event.title, event.description);
        } else {
          this.narrativeDialog.showFulvioDirective(
            'El Imperio Concluido',
            'Hemos alcanzado la cúspide industrial y llevado nuestros dulces a todo el planeta.'
          );
        }
      },
      onAskArcorito: () => {
        this.arcoritoGuideModal.show();
      },
      onToggleDayNight: () => {
        this.gameplayHUD.factoryView.toggleNightMode();
      },
      onSaveGame: () => {
        SaveManager.save(gameState.getData());
        this.gameplayHUD.showToast('¡Partida guardada con éxito en la memoria! 💾✨');
      },
      onResetGame: () => {
        const confirmed = window.confirm('¿Deseas reiniciar la fábrica y comenzar una nueva partida desde 1951?');
        if (confirmed) {
          SaveManager.reset();
          window.location.reload();
        }
      }
    });

    // 8. Pantalla de Título Interactiva
    this.titleScreen = new TitleScreen({
      onContinueGame: () => this.handleContinueGame(),
      onNewGame: () => this.handleNewGame(),
      onOpenMuseum: () => this.openMuseum('title'),
      onOpenSettings: () => this.settingsModal.show()
    });

    // 9. Suscribir decisiones directivas en QuestManager
    gameState.questManager.subscribeDecisionRequired((event) => {
      if (event.isDecisionEvent) {
        this.narrativeDialog.showEcuadorDecision((accepted) => {
          const res = gameState.questManager.resolveDecision(accepted);
          if (res.completedEvent) {
            this.historicalCardModal.show(res.completedEvent);
          }
        });
      }
    });

    // Montar todos los elementos en uiRoot
    this.uiRoot.appendChild(this.titleScreen.element);
    this.uiRoot.appendChild(this.archiveModal.element);
    this.uiRoot.appendChild(this.settingsModal.element);
    this.uiRoot.appendChild(this.historicalCardModal.element);
    this.uiRoot.appendChild(this.narrativeDialog.element);
    this.uiRoot.appendChild(this.workersModal.element);
    this.uiRoot.appendChild(this.contractsModal.element);
    this.uiRoot.appendChild(this.worldMapModal.element);
    this.uiRoot.appendChild(this.rawMaterialsModal.element);
    this.uiRoot.appendChild(this.manufacturingModal.element);
    this.uiRoot.appendChild(this.arcoritoGuideModal.element);
    this.uiRoot.appendChild(this.gameplayHUD.element);
    this.uiRoot.appendChild(this.match3HUD.element);
    this.uiRoot.appendChild(this.sagaMapEngine.element);
    this.uiRoot.appendChild(this.museumEngine.element);
    this.uiRoot.appendChild(this.productCreatorModal.element);
    this.uiRoot.appendChild(this.giftBoxBuilderModal.element);
    this.uiRoot.appendChild(this.myCollectionModal.element);

    // Conectar enrutamiento de regalo compartido por URL (#box=...)
    this.setupSharedGiftBoxRouting();
  }

  private handleContinueGame(): void {
    this.titleScreen.dismiss(() => {
      this.enterGameplay();
    });
  }

  private handleNewGame(): void {
    const data = gameState.getData();
    const hasProgress = data.currentYear > 1951 || data.currentMonth > 6 || (data.completedQuests && data.completedQuests.length > 0) || (data.match3CurrentLevel && data.match3CurrentLevel > 1) || data.hasSeenPrologue;

    if (hasProgress) {
      const confirmed = window.confirm(
        '¿Deseas comenzar una nueva partida desde 1951?\n\nTu progreso se reiniciará al Nivel 1 fundacional.'
      );
      if (!confirmed) return;
    }

    gameState.resetGame();
    this.titleScreen.dismiss(() => {
      this.enterGameplay();
    });
  }

  // Navegación del Museo del Sabor - 75 Años
  public openMuseum(from: 'title' | 'sagamap' | 'gameplay' = 'sagamap'): void {
    this.previousScreenBeforeMuseum = from;
    if (from === 'title') {
      this.titleScreen.element.style.display = 'none';
    } else if (from === 'sagamap') {
      this.sagaMapEngine.hide();
    } else if (from === 'gameplay') {
      this.gameplayHUD.hide();
    }
    this.museumEngine.element.style.zIndex = '5000';
    this.museumEngine.updateHistoryButton();
    this.museumEngine.show();
  }

  public closeMuseum(): void {
    this.museumEngine.hide();
    if (this.previousScreenBeforeMuseum === 'title') {
      this.titleScreen.show();
    } else if (this.previousScreenBeforeMuseum === 'gameplay') {
      this.gameplayHUD.show();
    } else {
      this.sagaMapEngine.show();
    }
  }

  // Navegación del Quiz Histórico de Vidas
  public openQuiz(from: 'match3' | 'sagamap' | 'gameplay' = 'sagamap'): void {
    this.previousScreenBeforeQuiz = from;
    this.arcorQuizModal.show();
  }

  // Navegación del Taller Creativo y Colección Arcor
  public openProductCreator(from: 'sagamap' | 'gameplay' = 'gameplay'): void {
    this.previousScreenBeforeWorkshop = from;
    this.myCollectionModal.hide();
    this.giftBoxBuilderModal.hide();
    this.productCreatorModal.show();
  }

  public openGiftBoxBuilder(from: 'sagamap' | 'gameplay' = 'gameplay'): void {
    this.previousScreenBeforeWorkshop = from;
    this.myCollectionModal.hide();
    this.productCreatorModal.hide();
    this.giftBoxBuilderModal.show();
  }

  public openMyCollection(tab: 'products' | 'boxes' | 'unlocks' | 'achievements' = 'products', from: 'sagamap' | 'gameplay' = 'gameplay'): void {
    this.previousScreenBeforeWorkshop = from;
    this.productCreatorModal.hide();
    this.giftBoxBuilderModal.hide();
    this.myCollectionModal.show(tab);
  }

  public enterGameplay(): void {
    this.gameplayHUD.show();
    tickSystem.resume();

    // Comprobar estado inicial de logros y colecciones
    achievementsManager.checkAll();

    // Producción fuera de línea (Offline Idle Gains)
    const offline = gameState.checkOfflineGains();
    if (offline) {
      const mins = Math.max(1, Math.floor(offline.offlineSeconds / 60));
      const msg = `¡Bienvenido de vuelta a Arroyito! Durante tu ausencia (${mins} min), tus operarios despacharon ${offline.boxesShipped} cajas de golosinas y acumularon +$${offline.earnedMoney} USD y +${offline.earnedCandies} caramelos. ¡El dulce imperio nunca duerme! 📦🍬`;
      this.narrativeDialog.showArcoritoMessage(msg, 'Producción Fuera de Línea (Offline Gains)');
    }
  }

  private returnToMainMenu(): void {
    this.gameplayHUD.hide();
    this.titleScreen.show();
    tickSystem.pause();
  }

  public update(_delta: number): void {
    this.gameplayHUD.updateIdleRate(this.metaBridge.getIdleRatePerSecond());
    this.gameplayHUD.updateDayNightCycle();
  }

  /**
   * Enrutamiento de enlaces compartidos de regalo (#box=...)
   */
  private setupSharedGiftBoxRouting(): void {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && (hash.startsWith('#box=') || hash.startsWith('#giftbox='))) {
        try {
          const rawB64 = decodeURIComponent(hash.replace(/^#(box|giftbox)=/, ''));
          if (rawB64.length > 4096) {
            console.warn('[UIManager] Payload de caja compartida excede longitud permitida');
            return;
          }
          const binary = atob(rawB64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const jsonStr = new TextDecoder().decode(bytes);
          const rawData = JSON.parse(jsonStr);
          const sanitized = sanitizeSharedGiftBox(rawData);
          if (sanitized) {
            this.titleScreen.element.style.display = 'none';
            this.sagaMapEngine.hide();
            this.gameplayHUD.show();
            this.openGiftBoxBuilder('gameplay');
            this.giftBoxBuilderModal.showSharedBox(sanitized);
          }
        } catch (err) {
          console.warn('Error al decodificar regalo compartido desde hash:', err);
        }
      }
    };

    if (document.readyState === 'complete') {
      handleHash();
    } else {
      window.addEventListener('load', handleHash, { once: true });
    }

    window.addEventListener('hashchange', handleHash);
  }

  /**
   * Punto de entrada único centralizado para iniciar cualquier nivel de Match-3 (F-03)
   */
  public tryStartLevel(level?: number): boolean {
    const currentLevel = level || progressionState.getCurrentLevel();
    const lives = progressionState.getLives();
    if (lives <= 0) {
      this.gameplayHUD.showToast('¡No te quedan vidas! ❤️ Realizá la Trivia para recargar.');
      this.openQuiz('gameplay');
      return false;
    }

    const started = this.match3HUD.show(currentLevel);
    if (started) {
      this.gameplayHUD.hide();
      this.sagaMapEngine.hide();
      this.arcoritoGuideModal.hide();
      this.myCollectionModal.hide();
    }
    return started;
  }
}
