import { soundManager } from '../core/SoundManager.ts';

export type SpeakerType = 'fulvio' | 'arcorito';

export interface DialogChoice {
  text: string;
  isCorrect?: boolean;
  onSelect: () => void;
}

export interface DialogueStep {
  speaker: SpeakerType;
  speakerName: string;
  speakerRole: string;
  text: string;
  choices: DialogChoice[];
}

export class NarrativeDialog {
  public element: HTMLElement;
  private messageEl: HTMLElement | null = null;
  private speakerNameEl: HTMLElement | null = null;
  private speakerRoleEl: HTMLElement | null = null;
  private actionsContainer: HTMLElement | null = null;
  private avatarImg: HTMLImageElement | null = null;
  private badgeTitle: HTMLElement | null = null;
  private avatarBadge: HTMLElement | null = null;
  private avatarWrapper: HTMLElement | null = null;

  private typeTimer: any = null;
  private fullCurrentText: string = '';
  private isTyping: boolean = false;

  constructor() {
    this.element = this.render();
  }

  private render(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'narrative-dialog-overlay';

    overlay.innerHTML = `
      <div class="narrative-dialog-box">
        <!-- Animated Speaker Avatar Frame (Dynamic between Don Fulvio & Arcorito) -->
        <div class="speaker-avatar-wrapper" id="speaker-wrapper">
          <div class="voice-ripple-ring"></div>
          <div class="voice-ripple-ring outer"></div>
          
          <!-- Animated Magic Stars for Arcorito -->
          <div class="arcorito-sparkles-container" id="arcorito-sparkles">
            <span class="magic-star s1">✨</span>
            <span class="magic-star s2">🍬</span>
            <span class="magic-star s3">⭐</span>
          </div>

          <div class="speaker-avatar-badge" id="speaker-badge">
            <img src="./fulvio_pagani.png" alt="Orador" class="speaker-img" id="speaker-img" />
          </div>
          <div class="speaker-badge-title" id="badge-title">DON FULVIO</div>
        </div>

        <!-- Speech Bubble Content -->
        <div class="narrative-speech-bubble" id="speech-bubble">
          <div class="speech-header">
            <span class="speaker-name" id="speaker-name">DON FULVIO SALVADOR PAGANI</span>
            <span class="speaker-role" id="speaker-role">Fundador y Presidente • Arroyito, 1951</span>
          </div>

          <p class="speech-body-text interactive" id="dialog-message-body"></p>

          <div class="speech-actions-row" id="speech-actions-row"></div>
        </div>
      </div>
    `;

    this.messageEl = overlay.querySelector('#dialog-message-body');
    this.speakerNameEl = overlay.querySelector('#speaker-name');
    this.speakerRoleEl = overlay.querySelector('#speaker-role');
    this.actionsContainer = overlay.querySelector('#speech-actions-row');
    this.avatarImg = overlay.querySelector('#speaker-img');
    this.badgeTitle = overlay.querySelector('#badge-title');
    this.avatarBadge = overlay.querySelector('#speaker-badge');
    this.avatarWrapper = overlay.querySelector('#speaker-wrapper');

    // Al hacer clic en el texto mientras se escribe, se completa instantáneamente
    this.messageEl?.addEventListener('click', () => {
      if (this.isTyping) {
        this.skipTypewriter();
      }
    });

    return overlay;
  }

  /**
   * Configura la apariencia del orador activo (Don Fulvio o Arcorito)
   */
  public setSpeaker(speaker: SpeakerType, customRole?: string): void {
    if (!this.avatarImg || !this.badgeTitle || !this.avatarBadge || !this.avatarWrapper) return;

    if (speaker === 'fulvio') {
      this.avatarImg.src = './fulvio_pagani.png';
      this.avatarImg.className = 'speaker-img fulvio-img';
      this.badgeTitle.textContent = 'DON FULVIO';
      if (this.speakerNameEl) this.speakerNameEl.textContent = 'DON FULVIO SALVADOR PAGANI';
      if (this.speakerRoleEl) this.speakerRoleEl.textContent = customRole || 'Cofundador y Presidente • Arcor 1951';

      this.avatarWrapper.className = 'speaker-avatar-wrapper fulvio-mode';
      this.avatarBadge.className = 'speaker-avatar-badge fulvio-badge';
    } else {
      this.avatarImg.src = './arcorito.png';
      this.avatarImg.className = 'speaker-img arcorito-img';
      this.badgeTitle.textContent = 'ARCORITO';
      if (this.speakerNameEl) this.speakerNameEl.textContent = 'ARCORITO';
      if (this.speakerRoleEl) this.speakerRoleEl.textContent = customRole || 'Embajador de Momentos Mágicos';

      this.avatarWrapper.className = 'speaker-avatar-wrapper arcorito-mode';
      this.avatarBadge.className = 'speaker-avatar-badge arcorito-badge';
    }
  }

  /**
   * Efecto de máquina de escribir interactivo con audio suave
   */
  private typeText(text: string, onDone?: () => void): void {
    clearTimeout(this.typeTimer);
    this.fullCurrentText = text;
    this.isTyping = true;
    if (this.avatarBadge) this.avatarBadge.classList.add('is-speaking');
    if (this.avatarWrapper) this.avatarWrapper.classList.add('is-speaking');

    if (this.messageEl) this.messageEl.textContent = '';
    let idx = 0;

    const step = () => {
      if (!this.isTyping || !this.messageEl) return;

      if (idx < text.length) {
        this.messageEl.textContent += text.charAt(idx);
        idx++;
        if (idx % 3 === 0) {
          soundManager.playClick();
        }
        this.typeTimer = setTimeout(step, 18);
      } else {
        this.isTyping = false;
        if (this.avatarBadge) this.avatarBadge.classList.remove('is-speaking');
        if (this.avatarWrapper) this.avatarWrapper.classList.remove('is-speaking');
        if (onDone) onDone();
      }
    };

    step();
  }

  private skipTypewriter(): void {
    clearTimeout(this.typeTimer);
    this.isTyping = false;
    if (this.messageEl) this.messageEl.textContent = this.fullCurrentText;
    if (this.avatarBadge) this.avatarBadge.classList.remove('is-speaking');
    if (this.avatarWrapper) this.avatarWrapper.classList.remove('is-speaking');
  }

  /**
   * Ejecuta una secuencia de diálogos multi-orador (Don Fulvio y Arcorito)
   */
  public runSequence(steps: DialogueStep[], onCompleteAll: () => void): void {
    let currentIdx = 0;

    const showCurrent = () => {
      if (currentIdx >= steps.length) {
        this.hide();
        onCompleteAll();
        return;
      }

      const st = steps[currentIdx];
      this.setSpeaker(st.speaker, st.speakerRole);
      this.typeText(st.text);

      this.renderChoices(
        st.choices.map(ch => ({
          ...ch,
          onSelect: () => {
            currentIdx++;
            showCurrent();
          }
        }))
      );
    };

    soundManager.playFanfare();
    this.element.classList.add('active');
    showCurrent();
  }

  /**
   * Diálogo 1: Tutorial de 1951 en Arroyito con Don Fulvio Salvador Pagani y Arcorito
   */
  public showTutorial1951(onFinished: () => void): void {
    const steps: DialogueStep[] = [
      {
        speaker: 'fulvio',
        speakerName: 'DON FULVIO SALVADOR PAGANI',
        speakerRole: 'Cofundador de Arcor • Arroyito, 1951',
        text: '¡Muchachos, bienvenidos a Arroyito! Hoy, 5 de julio de 1951, encendemos el primer fuego de un gran sueño. Con esfuerzo propio y las pailas de bronce, demostraremos que desde el interior cordobés podemos forjar una industria de clase mundial.',
        choices: [
          {
            text: '▶ Escuchar a Don Fulvio',
            onSelect: () => {}
          }
        ]
      },
      {
        speaker: 'fulvio',
        speakerName: 'DON FULVIO SALVADOR PAGANI',
        speakerRole: 'Cofundador de Arcor • Arroyito, 1951',
        text: 'Nuestro lema fundacional es inquebrantable: dar a todos caramelos de la mejor calidad al precio más justo. Para iniciar la producción, debemos comprar 10 sacos de azúcar y cocinar nuestro primer lote de 50 caramelos cristalinos.',
        choices: [
          {
            text: '▶ Siguiente',
            onSelect: () => {}
          }
        ]
      },
      {
        speaker: 'arcorito',
        speakerName: 'ARCORITO',
        speakerRole: 'Guía de Momentos Mágicos',
        text: '¡El camión de reparto clásico ya está en el patio y la paila de cobre está templada! ¡Vamos a encender la fábrica y hacer historia junto a Don Fulvio!',
        choices: [
          {
            text: '¡A las pailas de cobre! 🍬',
            onSelect: () => {}
          }
        ]
      }
    ];

    this.runSequence(steps, onFinished);
  }

  /**
   * Evento Especial 1968: El Incidente del Ecuador (Toma de decisiones directivas)
   */
  public showEcuadorDecision(onResolved: (accepted: boolean) => void): void {
    const steps: DialogueStep[] = [
      {
        speaker: 'arcorito',
        speakerName: 'ARCORITO',
        speakerRole: 'Alerta Comercial Internacional',
        text: '¡Alerta en alta mar! Un contenedor de caramelos de leche con destino a Estados Unidos se derritió al cruzar la línea del Ecuador por el calor del trópico. El cliente reclama la reposición... ¿Qué decisión tomará el directorio?',
        choices: [
          {
            text: '▶ Consultar con Don Fulvio Pagani',
            onSelect: () => {}
          }
        ]
      },
      {
        speaker: 'fulvio',
        speakerName: 'DON FULVIO SALVADOR PAGANI',
        speakerRole: 'Presidente del Directorio de Arcor',
        text: 'En Arcor, la palabra y la honestidad valen más que cualquier cargamento. Asumiremos el 100% de la pérdida, pagaremos la factura y repondremos los caramelos. La confianza con nuestros clientes en Norteamérica es sagrada.',
        choices: [
          {
            text: '✅ Respaldar la decisión de Don Fulvio (+100 Reputación ⭐)',
            isCorrect: true,
            onSelect: () => {}
          },
          {
            text: '❌ Intentar deslindar la responsabilidad',
            isCorrect: false,
            onSelect: () => {
              alert('Don Fulvio nos recuerda: "La integridad no se negocia". Arcor asume la factura con orgullo y gana la confianza total de EE.UU.');
            }
          }
        ]
      }
    ];

    this.runSequence(steps, () => {
      onResolved(true);
    });
  }

  private renderChoices(choices: DialogChoice[]): void {
    if (!this.actionsContainer) return;
    this.actionsContainer.innerHTML = '';

    choices.forEach(ch => {
      const btn = document.createElement('button');
      btn.className = `btn ${ch.isCorrect !== false ? 'btn-primary' : 'btn-secondary'} interactive`;
      btn.style.fontSize = '0.86rem';
      btn.style.minHeight = '42px';
      btn.textContent = ch.text;

      btn.addEventListener('click', () => {
        soundManager.playClick();
        ch.onSelect();
      });

      this.actionsContainer?.appendChild(btn);
    });
  }

  /**
   * Muestra un mensaje directo de Arcorito dando consejos o datos mágicos
   */
  public showArcoritoMessage(text: string, title?: string, onFinished?: () => void): void {
    const steps: DialogueStep[] = [
      {
        speaker: 'arcorito',
        speakerName: 'ARCORITO',
        speakerRole: title || 'Guía de Momentos Mágicos',
        text,
        choices: [
          {
            text: '¡Entendido, Arcorito! ⭐',
            onSelect: () => {}
          }
        ]
      }
    ];
    this.runSequence(steps, onFinished || (() => {}));
  }

  /**
   * Muestra la directiva activa y tareas de Don Fulvio Pagani
   */
  public showFulvioDirective(eventTitle: string, description: string, onFinished?: () => void): void {
    const steps: DialogueStep[] = [
      {
        speaker: 'fulvio',
        speakerName: 'DON FULVIO PAGANI',
        speakerRole: 'Presidente Fundador',
        text: `Nuestra directiva prioritaria en este momento es: "${eventTitle}". ${description} Recuerda: cada caramelo y cada hito que alcanzamos es una promesa cumplida para nuestra gente. ¡Sigamos adelante con pasión industrial!`,
        choices: [
          {
            text: '¡A trabajar, Don Fulvio! 🏭',
            onSelect: () => {}
          }
        ]
      }
    ];
    this.runSequence(steps, onFinished || (() => {}));
  }

  public hide(): void {
    clearTimeout(this.typeTimer);
    this.isTyping = false;
    this.element.classList.remove('active');
  }
}
