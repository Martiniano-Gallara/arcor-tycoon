import { HistoricalEvent } from '../gameplay/historyEras.ts';
import { soundManager } from '../core/SoundManager.ts';

interface HeroImageConfig {
  image: string;
  cursiveTag: string;
}

/**
 * Mapea eventos históricos a ilustraciones de alta calidad y lemas de época
 */
function getEventHeroConfig(event: HistoricalEvent): HeroImageConfig {
  const titleLower = (event.title || '').toLowerCase();
  const idLower = (event.id || '').toLowerCase();

  // 1964: Primeras Ventas a Europa (Buque mercante Arcor y mapa de Europa)
  if (event.year === 1964 || titleLower.includes('europa') || idLower.includes('1964')) {
    return {
      image: './history/event_1964.jpg',
      cursiveTag: 'Calidad que llega más lejos'
    };
  }

  // 1951: Fundación / Primer Galpón en Arroyito
  if (event.year <= 1957 || idLower.includes('1951') || titleLower.includes('fundaci') || titleLower.includes('nacimiento')) {
    return {
      image: './history/event_1951.jpg',
      cursiveTag: 'El sueño que comenzó en Arroyito'
    };
  }

  // 1984: Nacimiento del Bon o Bon
  if ((event.year >= 1980 && event.year <= 1990) || idLower.includes('bonobon') || titleLower.includes('bon o bon')) {
    return {
      image: './history/event_1984.jpg',
      cursiveTag: 'Un dulce símbolo de afecto'
    };
  }

  // Si el evento tiene imagen explícita
  if ((event as any).image) {
    return {
      image: (event as any).image,
      cursiveTag: 'Patrimonio Histórico Arcor'
    };
  }

  // Fallback armónico según era
  if (event.year < 1975) {
    return {
      image: './history/event_1964.jpg',
      cursiveTag: 'Abriendo nuevas rutas al mundo'
    };
  }

  return {
    image: './history/event_1984.jpg',
    cursiveTag: 'Innovación con sabor argentino'
  };
}

export class HistoricalCardModal {
  public element: HTMLElement;
  private onContinueCallback?: () => void;

  constructor() {
    this.element = this.render();
  }

  private render(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop polaroid-modal-backdrop';

    backdrop.innerHTML = `
      <div class="polaroid-card-container">
        <!-- Vintage Archival Document Frame -->
        <div class="polaroid-document vintage-archival-card" id="polaroid-doc-frame">
          
          <!-- Adorno superior derecho: Cinta de seda azul & oro -->
          <div class="polaroid-corner-ribbon-top">
            <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 50 0 C 65 30, 85 50, 110 58 L 110 0 Z" fill="#08284d" />
              <path d="M 68 0 C 78 24, 94 38, 110 44 L 110 0 Z" fill="#14467d" />
              <path d="M 58 0 C 72 28, 90 45, 110 52" stroke="#d4af37" stroke-width="2.5" />
            </svg>
          </div>

          <!-- Sello DESCLASIFICADO con animación de estampado -->
          <div class="polaroid-stamp animated-stamp" id="card-stamp">
            DESCLASIFICADO
          </div>
          
          <!-- Encabezado de Archivo Histórico -->
          <div class="polaroid-header">
            <span class="polaroid-archive-tag">ARCHIVO HISTÓRICO GRUPO ARCOR</span>
            <div class="polaroid-year-row">
              <span class="polaroid-year" id="card-year">1964</span>
              <span class="polaroid-cursive-tag" id="card-cursive-tag">Calidad que llega más lejos</span>
            </div>
          </div>

          <!-- Banner Ilustrado Fotorrealista / Storybook -->
          <div class="polaroid-hero-banner-container">
            <div class="polaroid-hero-banner-frame">
              <img
                src="./history/event_1964.jpg"
                alt="Hito Histórico"
                class="polaroid-hero-banner-img"
                id="card-hero-img"
                draggable="false"
              />
              <div class="polaroid-hero-banner-shimmer"></div>
              
              <!-- Título superpuesto con banner inferior elegante -->
              <div class="polaroid-hero-title-overlay">
                <h3 class="polaroid-hero-title" id="card-title">Primeras Ventas a Europa</h3>
              </div>
            </div>
          </div>

          <!-- Cuerpo: Cita + Descripción Lore -->
          <div class="polaroid-body">
            <blockquote class="polaroid-quote vintage-quote" id="card-quote">
              "Los estándares de calidad de Arroyito alcanzaron las exigentes normas europeas de pureza alimenticia."
            </blockquote>

            <p class="polaroid-lore vintage-lore" id="card-lore">
              Fue el primer hito de exportación intercontinental de la empresa, abriendo las rutas marítimas desde el puerto de Rosario y Buenos Aires.
            </p>

            <!-- Marcas de Desbloqueos (Edificio, Producto, Región) con Iconos Circulares -->
            <div class="polaroid-unlocks-stack" id="card-unlocks">
              <!-- Se inyectan dinámicamente con estilo de pastilla moderna -->
            </div>
          </div>

          <!-- Marca de Agua Postal de Época: ARCOR Por Un Mundo Más Dulce -->
          <div class="polaroid-watermark-stamp">
            <svg viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Círculos concéntricos postales -->
              <circle cx="85" cy="90" r="70" stroke="#a48458" stroke-width="2" stroke-dasharray="8 4" opacity="0.45" />
              <circle cx="85" cy="90" r="56" stroke="#a48458" stroke-width="1.5" opacity="0.45" />
              <!-- Globo terráqueo -->
              <ellipse cx="85" cy="90" rx="30" ry="56" stroke="#a48458" stroke-width="1" stroke-dasharray="3 3" opacity="0.35" />
              <line x1="85" y1="34" x2="85" y2="146" stroke="#a48458" stroke-width="1" opacity="0.35" />
              <line x1="29" y1="90" x2="141" y2="90" stroke="#a48458" stroke-width="1" opacity="0.35" />
              <!-- Texto matasellos -->
              <text x="85" y="78" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-weight="900" font-size="15" fill="#8c6a38" letter-spacing="2" opacity="0.6">ARCOR</text>
              <text x="85" y="108" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="700" font-size="8" fill="#8c6a38" letter-spacing="1" opacity="0.55">POR UN MUNDO</text>
              <text x="85" y="119" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="700" font-size="8" fill="#8c6a38" letter-spacing="1" opacity="0.55">MÁS DULCE</text>
              <!-- Ondas de cancelación postal -->
              <path d="M 148 65 C 166 58, 172 72, 190 65 C 198 62, 208 68, 218 65" stroke="#a48458" stroke-width="1.8" opacity="0.4" />
              <path d="M 150 82 C 168 75, 174 89, 192 82 C 200 79, 210 85, 220 82" stroke="#a48458" stroke-width="1.8" opacity="0.4" />
              <path d="M 148 99 C 166 92, 172 106, 190 99 C 198 96, 208 102, 218 99" stroke="#a48458" stroke-width="1.8" opacity="0.4" />
              <path d="M 146 116 C 164 109, 170 123, 188 116 C 196 113, 206 119, 216 116" stroke="#a48458" stroke-width="1.8" opacity="0.4" />
            </svg>
          </div>

          <!-- Botón de Continuar Dorado Emboss con Brillo 3D -->
          <div class="polaroid-footer">
            <button class="btn btn-primary btn-golden-history-cta interactive" id="btn-polaroid-continue">
              <span>CONTINUAR HISTORIA</span>
              <span class="cta-arrow">▶</span>
              <span class="cta-shine-sweep"></span>
            </button>
          </div>

          <!-- Adorno inferior: Ondas de cinta azul & dorado -->
          <div class="polaroid-corner-ribbon-bottom">
            <svg viewBox="0 0 440 45" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M 0 32 C 45 10, 95 36, 140 42 L 140 45 L 0 45 Z" fill="#08284d" />
              <path d="M 0 36 C 40 18, 85 38, 125 43 L 125 45 L 0 45 Z" fill="#14467d" />
              <path d="M 0 40 C 35 26, 75 40, 105 44" stroke="#d4af37" stroke-width="2.5" />
              
              <path d="M 440 32 C 395 10, 345 36, 300 42 L 300 45 L 440 45 Z" fill="#08284d" />
              <path d="M 440 36 C 400 18, 355 38, 315 43 L 315 45 L 440 45 Z" fill="#14467d" />
              <path d="M 440 40 C 405 26, 365 40, 335 44" stroke="#d4af37" stroke-width="2.5" />

              <line x1="0" y1="43" x2="440" y2="43" stroke="#d4af37" stroke-width="2" />
            </svg>
          </div>

        </div>
      </div>
    `;

    const continueBtn = backdrop.querySelector('#btn-polaroid-continue');
    continueBtn?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
      if (this.onContinueCallback) {
        this.onContinueCallback();
      }
    });

    return backdrop;
  }

  public show(event: HistoricalEvent, onContinue?: () => void): void {
    this.onContinueCallback = onContinue;

    const yearEl = this.element.querySelector('#card-year');
    const titleEl = this.element.querySelector('#card-title');
    const quoteEl = this.element.querySelector('#card-quote');
    const loreEl = this.element.querySelector('#card-lore');
    const unlocksStack = this.element.querySelector('#card-unlocks');
    const heroImgEl = this.element.querySelector('#card-hero-img') as HTMLImageElement;
    const cursiveTagEl = this.element.querySelector('#card-cursive-tag');
    const stampEl = this.element.querySelector('#card-stamp');

    if (yearEl) yearEl.textContent = `${event.year}`;
    if (titleEl) titleEl.textContent = event.title;
    if (quoteEl) quoteEl.textContent = `"${event.historicalCard.quoteOrFact}"`;
    if (loreEl) loreEl.textContent = event.historicalCard.unlockedLore;

    // Configuración de imagen y lema
    const heroConfig = getEventHeroConfig(event);
    if (heroImgEl) {
      heroImgEl.src = heroConfig.image;
      heroImgEl.alt = event.title;
    }
    if (cursiveTagEl) {
      cursiveTagEl.textContent = heroConfig.cursiveTag;
    }

    // Reiniciar animación del sello desclasificado
    if (stampEl) {
      stampEl.classList.remove('stamp-slammed');
      void (stampEl as HTMLElement).offsetWidth;
      stampEl.classList.add('stamp-slammed');
    }

    // Badges en pastillas de renglón completo con icono circular
    if (unlocksStack) {
      unlocksStack.innerHTML = '';
      const allUnlocks: { label: string; tag: string; icon: string }[] = [];

      (event.unlocks.buildings || []).forEach(b => allUnlocks.push({ label: b, tag: 'EDIFICIO', icon: '🏢' }));
      (event.unlocks.products || []).forEach(p => allUnlocks.push({ label: p, tag: 'PRODUCTO', icon: '📦' }));
      (event.unlocks.regions || []).forEach(r => allUnlocks.push({ label: r, tag: 'REGIÓN', icon: '📍' }));

      allUnlocks.forEach(u => {
        const badge = document.createElement('div');
        badge.className = 'polaroid-badge-pill interactive';
        badge.innerHTML = `
          <div class="badge-icon-disc" title="${u.tag}">${u.icon}</div>
          <div class="badge-text-group">
            <span class="badge-tag-lbl">${u.tag}</span>
            <span class="badge-val-txt">${u.label}</span>
          </div>
        `;
        unlocksStack.appendChild(badge);
      });
    }

    soundManager.playFanfare();
    this.element.classList.add('active');

    // Efecto de apertura con sonido de papel vintage
    const cardDoc = this.element.querySelector('#polaroid-doc-frame');
    if (cardDoc) {
      cardDoc.classList.remove('card-opening');
      void (cardDoc as HTMLElement).offsetWidth;
      cardDoc.classList.add('card-opening');
    }
  }

  public hide(): void {
    this.element.classList.remove('active');
  }
}
