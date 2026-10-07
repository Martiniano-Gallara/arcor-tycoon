import { gameState } from '../gameplay/GameState.ts';
import { progressionState } from '../gameplay/ProgressionState.ts';
import { soundManager } from '../core/SoundManager.ts';

export interface ArcoritoGuideActions {
  onOpenBuild?: () => void;
  onOpenMuseum?: () => void;
  onOpenArcorCrushMap: () => void;
  onPlayLevel: () => void;
  onOpenHistory: () => void;
  onViewFactory: () => void;
}

/**
 * ArcoritoGuideModal: Consejero Oficial de Arcorito.
 * Explica el bucle de juego moderno:
 * 1. Superar niveles de Arcor Crush (único motor de avance y desbloqueo histórico).
 * 2. Ganar dinero en dólares ($ USD) para construir y expandir.
 * 3. Catálogo unificado de Construcción (plantas industriales, infraestructura y terrenos).
 * 4. Desbloquear hitos históricos verificados de Don Fulvio Pagani (1951-2026).
 */
export class ArcoritoGuideModal {
  public element: HTMLElement;
  private actions: ArcoritoGuideActions;
  private activeTopicKey: string = 'crush';

  constructor(actions: ArcoritoGuideActions) {
    this.actions = actions;
    this.element = this.render();
  }

  private render(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';

    modal.innerHTML = `
      <div class="modal-dialog arcorito-guide-dialog">
        <!-- Header con Avatar animado de Arcorito -->
        <div class="modal-header arcorito-modal-header">
          <div class="arcorito-header-profile">
            <div class="arcorito-avatar-frame">
              <img src="./arcorito.png" alt="Arcorito" class="arcorito-guide-avatar" />
              <div class="arcorito-sparkle-halo">✨</div>
            </div>
            <div class="arcorito-header-titles">
              <h2 class="modal-title">ARCORITO • CONSEJERO Y GUÍA</h2>
              <span class="arcorito-header-sub">Tu compañero para expandir la fábrica y revivir la historia desde 1951</span>
            </div>
          </div>
          <button class="modal-close-btn" id="arcorito-guide-close">✕</button>
        </div>

        <div class="modal-body arcorito-modal-body">
          <!-- Sección 1: Diagnóstico en Tiempo Real y Consejo Inmediato -->
          <div class="arcorito-advisor-box" id="arcorito-advisor-box">
            <div class="advisor-bubble-header">
              <span class="advisor-chip">💡 Consejo Estratégico en Vivo</span>
              <span class="advisor-time" id="advisor-live-time">Predio Arroyito, Córdoba</span>
            </div>
            <p class="advisor-speech-text" id="advisor-speech-text">
              ¡Cargando informe de fábrica...
            </p>
            <div class="advisor-quick-shortcuts" id="advisor-quick-shortcuts"></div>
          </div>

          <!-- Pestañas / Selector de Temas de la Guía -->
          <div class="guide-topics-container">
            <div class="guide-topics-sidebar" id="guide-topics-list">
              <!-- Botones de temas generados dinámicamente -->
            </div>

            <div class="guide-topic-content" id="guide-topic-content">
              <!-- Contenido detallado del tema seleccionado -->
            </div>
          </div>
        </div>
      </div>
    `;

    modal.querySelector('#arcorito-guide-close')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    return modal;
  }

  public show(): void {
    this.refreshAdvisorAdvice();
    this.renderTopicsSidebar();
    this.renderTopicDetail(this.activeTopicKey);
    this.element.classList.add('active');
  }

  public hide(): void {
    this.element.classList.remove('active');
  }

  /**
   * Diagnóstico estratégico en tiempo real basado en el avance de Arcor Crush y caja
   */
  private refreshAdvisorAdvice(): void {
    const data = gameState.getData();
    const currentLevel = progressionState.getCurrentLevel();
    const activeQuest = gameState.questManager.getCurrentEvent();
    const speechEl = this.element.querySelector('#advisor-speech-text');
    const shortcutsEl = this.element.querySelector('#advisor-quick-shortcuts');

    if (!speechEl || !shortcutsEl) return;
    shortcutsEl.innerHTML = '';

    const tips: string[] = [];
    const shortcuts: { label: string; icon: string; action: () => void }[] = [];

    // 1. Nivel actual de Arcor Crush
    if (activeQuest) {
      tips.push(`🍬 <strong>¡Avanza en Arcor Crush!</strong> El objetivo actual es el <strong>Nivel ${currentLevel}</strong> para desbloquear el hito de <strong>${activeQuest.year}: "${activeQuest.title}"</strong>. Cada victoria te entrega dinero en dólares ($ USD) y estrellas doradas.`);
      shortcuts.push({
        label: `Jugar Nivel ${currentLevel}`,
        icon: '🍬',
        action: () => { this.hide(); this.actions.onPlayLevel(); }
      });
    }

    // 2. Dinero disponible para la fábrica
    if (data.money >= 500) {
      tips.push(`🏛️ <strong>¡Hay capital para invertir!</strong> Tienes <strong>$${data.money.toLocaleString()} USD</strong> en caja. Visita el <em>Museo 75 Años</em> o supera más niveles para continuar modernizando la fábrica.`);
      shortcuts.push({
        label: 'Ver Fábrica',
        icon: '🏭',
        action: () => { this.hide(); this.actions.onViewFactory(); }
      });
    } else {
      tips.push(`💵 <strong>¿Necesitas más dinero?</strong> La forma de financiar el crecimiento industrial es superando niveles en <em>Arcor Crush</em> o recaudando la renta pasiva continua.`);
    }

    // 3. Ver mapa de niveles
    shortcuts.push({
      label: 'Ver Mapa Saga',
      icon: '🗺️',
      action: () => { this.hide(); this.actions.onOpenArcorCrushMap(); }
    });

    // 4. Álbum histórico
    if ((data.completedQuests || []).length > 0) {
      shortcuts.push({
        label: 'Ver Archivo Histórico',
        icon: '📜',
        action: () => { this.hide(); this.actions.onOpenHistory(); }
      });
    }

    speechEl.innerHTML = tips.join('<br/><br/>');

    shortcuts.forEach(sc => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary advisor-shortcut-btn interactive';
      btn.innerHTML = `<span>${sc.icon}</span> <span>${sc.label}</span>`;
      btn.addEventListener('click', () => {
        soundManager.playClick();
        sc.action();
      });
      shortcutsEl.appendChild(btn);
    });
  }

  /**
   * Catálogo temático oficial de Arcorito
   */
  private getTopicsConfig() {
    return [
      {
        key: 'crush',
        icon: '🍬',
        title: 'Arcor Crush (Progresión)',
        subtitle: 'El motor principal del juego',
        content: `
          <h3>¿Cómo avanzar en el juego?</h3>
          <p><strong>La forma de progresar en la historia y expandir el imperio es superando los niveles de Arcor Crush.</strong></p>
          <ul>
            <li><strong>💵 Dinero en Dólares ($ USD):</strong> Cada nivel completado te recompensa inmediatamente con cientos de dólares ($ USD) directos a tu caja.</li>
            <li><strong>⭐ Desbloqueo Histórico:</strong> Al ganar cada nivel, se desclasifica el hito histórico verificado de Arcor correspondiente (desde 1951 con el primer galpón hasta el complejo moderno de 2026).</li>
            <li><strong>🏭 Evolución de la Fábrica:</strong> Con cada hito, el predio de Arroyito incorpora mejoras visuales: chimeneas con humo activo, camiones de reparto Ford 1953, alas de producción de chocolate y silos automatizados.</li>
          </ul>
          <div class="guide-tip-box">
            <strong>Consejo de Arcorito:</strong> ¡Combina 4 caramelos en línea para crear un Caramelo Rayado, o 5 caramelos para desatar el Mega Rocklet multicolor que barre todo el tablero!
          </div>
        `,
        actionLabel: 'Jugar Último Nivel',
        actionIcon: '🍬',
        action: () => { this.hide(); this.actions.onPlayLevel(); }
      },
      {
        key: 'factory',
        icon: '🏭',
        title: 'Fábrica Histórica & Museo',
        subtitle: 'Evolución viva de Arroyito',
        content: `
          <h3>Evolución de la Fábrica y Museo 75 Años</h3>
          <p>La fábrica de Arcor evoluciona año tras año con tus logros:</p>
          <ol>
            <li><strong>🏭 Predio Industrial Animado:</strong> Contempla las chimeneas humeantes, el clásico camión de reparto verde Ford 1953 y las luces de los talleres.</li>
            <li><strong>🏛️ Museo del Sabor 75 Años:</strong> Explora vitrinas con productos legendarios, material inédito y el libro de colección.</li>
            <li><strong>💵 Renta Pasiva por Segundo:</strong> Cada año y cada nivel aumentan tus ingresos continuos.</li>
          </ol>
        `,
        actionLabel: 'Ver la Fábrica',
        actionIcon: '🏭',
        action: () => { this.hide(); this.actions.onViewFactory(); }
      },
      {
        key: 'history',
        icon: '📜',
        title: 'Historia & Don Fulvio',
        subtitle: 'Documentos y fotos reales',
        content: `
          <h3>El Legado de Don Fulvio Salvador Pagani</h3>
          <p>Cada vez que superas un nivel de Arcor Crush, desbloqueas una <strong>Tarjeta Histórica Polaroid</strong> con material verificado:</p>
          <ul>
            <li>Fotografías de época restauradas del primer galpón de 1951, camiones de reparto y las primeras líneas de producción.</li>
            <li>Frases y directivas reales de Don Fulvio Pagani.</li>
            <li>Acontecimientos históricos que llevaron a Arcor de un pequeño pueblo cordobés a convertirse en el mayor exportador de caramelos del mundo.</li>
          </ul>
          <p>Puedes consultar todas las memorias acumuladas y avanzar con tus estrellas en cualquier momento visitando el <strong>Museo del Sabor 🏛️</strong>.</p>
        `,
        actionLabel: 'Entrar al Museo del Sabor',
        actionIcon: '🏛️',
        action: () => {
          this.hide();
          if (this.actions.onOpenMuseum) {
            this.actions.onOpenMuseum();
          } else {
            this.actions.onOpenHistory();
          }
        }
      },
      {
        key: 'factory',
        icon: '🌾',
        title: 'Fábrica 3D & Diorama',
        subtitle: 'Cámara, rotación y paisaje',
        content: `
          <h3>Explorar el Predio Industrial 3D</h3>
          <p>La fábrica de Arroyito está viva y en constante crecimiento sobre la campiña cordobesa:</p>
          <ul>
            <li><strong>Rotar y Zoom:</strong> Arrastra con el botón secundario del ratón o con dos dedos en pantallas táctiles para orbitar la escena. Usa la rueda del mouse o gesto de pellizco para acercarte.</li>
            <li><strong>Ciclo Día y Noche:</strong> Observa la fábrica al sol radiante o bajo las estrellas con faroles industriales encendidos.</li>
            <li><strong>Camión Histórico:</strong> El legendario camión verde recorre la ruta hacia el horizonte llevando los dulces a los almacenes argentinos.</li>
          </ul>
        `,
        actionLabel: 'Ver Predio 3D',
        actionIcon: '🌾',
        action: () => { this.hide(); this.actions.onViewFactory(); }
      }
    ];
  }

  private renderTopicsSidebar(): void {
    const listEl = this.element.querySelector('#guide-topics-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const topics = this.getTopicsConfig();

    topics.forEach(t => {
      const btn = document.createElement('button');
      btn.className = `guide-topic-btn interactive ${t.key === this.activeTopicKey ? 'active' : ''}`;
      btn.innerHTML = `
        <span class="topic-btn-icon">${t.icon}</span>
        <div class="topic-btn-text">
          <span class="topic-btn-title">${t.title}</span>
          <span class="topic-btn-sub">${t.subtitle}</span>
        </div>
      `;

      btn.addEventListener('click', () => {
        soundManager.playClick();
        this.activeTopicKey = t.key;
        this.renderTopicsSidebar();
        this.renderTopicDetail(t.key);
      });

      listEl.appendChild(btn);
    });
  }

  private renderTopicDetail(topicKey: string): void {
    const contentEl = this.element.querySelector('#guide-topic-content');
    if (!contentEl) return;

    const topic = this.getTopicsConfig().find(t => t.key === topicKey) || this.getTopicsConfig()[0];

    contentEl.innerHTML = `
      <div class="topic-detail-card">
        <div class="topic-detail-body">
          ${topic.content}
        </div>
        <div class="topic-detail-footer">
          <button class="btn btn-primary topic-action-btn interactive" id="topic-action-btn">
            <span>${topic.actionIcon}</span>
            <span>${topic.actionLabel}</span>
          </button>
        </div>
      </div>
    `;

    contentEl.querySelector('#topic-action-btn')?.addEventListener('click', () => {
      soundManager.playClick();
      topic.action();
    });
  }
}
