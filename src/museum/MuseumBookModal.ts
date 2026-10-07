import { ARCHIVE_BOOK_PAGES, ArchiveBookPage } from './MuseumData.ts';
import { soundManager } from '../core/SoundManager.ts';

export class MuseumBookModal {
  public element: HTMLElement;
  private currentPageIndex: number = 0;
  public onOpenArchiveRequested?: () => void;

  constructor() {
    this.element = this.render();
  }

  private render(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'museum-modal-backdrop';
    backdrop.style.display = 'none';

    backdrop.innerHTML = `
      <div class="museum-book-dialog">
        <!-- Haz de luz cálida cenital -->
        <div class="showcase-spotlight-beam"></div>

        <button class="museum-close-btn interactive" id="book-close-btn" title="Cerrar libro">✕</button>

        <div class="museum-book-wrapper">
          <div class="book-spine-crest">
            <span class="crest-icon">📖</span>
            <span class="crest-title">NUESTRA HISTORIA • ARCOR 75 AÑOS</span>
          </div>

          <!-- Estructura del libro abierto en dos páginas -->
          <div class="open-book-spread">
            <!-- Página Izquierda: Fotografía Histórica de Archivo -->
            <div class="book-page page-left">
              <div class="page-corner-decor top-left"></div>
              <div class="page-inner-content">
                <div class="photo-archive-frame">
                  <div class="photo-mount-tape tape-tl"></div>
                  <div class="photo-mount-tape tape-tr"></div>
                  <img src="./fabrica_arroyito_1951.jpg" alt="Foto histórica" class="archive-photo-img" id="book-photo-img" />
                </div>
                <div class="photo-caption-text" id="book-photo-caption">
                  La primera fábrica de Arcor en Arroyito con su histórica chimenea, julio de 1951.
                </div>
                <div class="page-seal-stamp">
                  <span class="seal-stamp-inner">ARCOR • ARCHIVO HISTÓRICO OFICIAL</span>
                </div>
              </div>
              <div class="page-number-footer" id="book-page-num-left">Pág. 1</div>
            </div>

            <!-- Página Derecha: Relato Histórico y Cita -->
            <div class="book-page page-right">
              <div class="page-corner-decor top-right"></div>
              <div class="page-inner-content">
                <div class="chapter-year-badge" id="book-chapter-year">1951 — Arroyito, Córdoba</div>
                <h3 class="chapter-title" id="book-chapter-title">El Sueño de la Paila de Cobre</h3>
                <h4 class="chapter-subtitle" id="book-chapter-subtitle">El nacimiento de una pasión confitera</h4>

                <div class="chapter-body-text" id="book-chapter-body">
                  <!-- Párrafos históricos -->
                </div>

                <!-- Cita histórica de Don Fulvio Pagani -->
                <div class="chapter-quote-card">
                  <div class="quote-symbol">“</div>
                  <p class="quote-text" id="book-quote-text">
                    Dar a todos caramelos de calidad a un precio justo para que la dulzura llegue a cada hogar.
                  </p>
                  <span class="quote-author" id="book-quote-author">— Fulvio Salvador Pagani</span>
                </div>
              </div>
              <div class="page-number-footer" id="book-page-num-right">Pág. 2</div>
            </div>
          </div>

          <!-- Controles de navegación de páginas y acceso al archivo de hitos -->
          <div class="book-navigation-bar">
            <button class="book-nav-btn interactive" id="book-btn-prev">
              <span>◀</span> Anterior
            </button>
            <div class="book-page-indicator" id="book-page-indicator">Capítulo 1 de 5</div>
            <button class="book-nav-btn interactive" id="book-btn-next">
              Siguiente <span>▶</span>
            </button>
            <button class="book-nav-btn book-btn-archive interactive" id="book-btn-archive" title="Ver Archivo de Hitos y Documentos">
              <span>📜</span> Archivo Histórico
            </button>
          </div>
        </div>
      </div>
    `;

    backdrop.querySelector('#book-close-btn')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
    });

    backdrop.querySelector('#book-btn-archive')?.addEventListener('click', () => {
      soundManager.playClick();
      this.hide();
      if (this.onOpenArchiveRequested) {
        this.onOpenArchiveRequested();
      }
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        soundManager.playClick();
        this.hide();
      }
    });

    backdrop.querySelector('#book-btn-prev')?.addEventListener('click', () => {
      if (this.currentPageIndex > 0) {
        soundManager.playClick();
        this.currentPageIndex--;
        this.updatePageContent();
      }
    });

    backdrop.querySelector('#book-btn-next')?.addEventListener('click', () => {
      if (this.currentPageIndex < ARCHIVE_BOOK_PAGES.length - 1) {
        soundManager.playClick();
        this.currentPageIndex++;
        this.updatePageContent();
      }
    });

    return backdrop;
  }

  public show(pageIdx: number = 0): void {
    this.currentPageIndex = Math.max(0, Math.min(ARCHIVE_BOOK_PAGES.length - 1, pageIdx));
    this.updatePageContent();
    this.element.style.display = 'flex';
    soundManager.playClick();
  }

  private updatePageContent(): void {
    const page: ArchiveBookPage = ARCHIVE_BOOK_PAGES[this.currentPageIndex];
    const el = this.element;

    const photoImg = el.querySelector('#book-photo-img') as HTMLImageElement;
    const photoCaption = el.querySelector('#book-photo-caption');
    const chapterYear = el.querySelector('#book-chapter-year');
    const chapterTitle = el.querySelector('#book-chapter-title');
    const chapterSubtitle = el.querySelector('#book-chapter-subtitle');
    const chapterBody = el.querySelector('#book-chapter-body');
    const quoteText = el.querySelector('#book-quote-text');
    const quoteAuthor = el.querySelector('#book-quote-author');
    const pageNumLeft = el.querySelector('#book-page-num-left');
    const pageNumRight = el.querySelector('#book-page-num-right');
    const indicator = el.querySelector('#book-page-indicator');
    const btnPrev = el.querySelector('#book-btn-prev') as HTMLButtonElement;
    const btnNext = el.querySelector('#book-btn-next') as HTMLButtonElement;

    if (photoImg) photoImg.src = page.imagePath;
    if (photoCaption) photoCaption.textContent = page.imageCaption;
    if (chapterYear) chapterYear.textContent = page.yearLabel;
    if (chapterTitle) chapterTitle.textContent = page.title;
    if (chapterSubtitle) chapterSubtitle.textContent = page.subtitle;

    if (chapterBody) {
      chapterBody.innerHTML = page.storyBody
        .map(paragraph => `<p class="book-story-paragraph">${paragraph}</p>`)
        .join('');
    }

    if (quoteText) quoteText.textContent = page.historicalQuote;
    if (quoteAuthor) quoteAuthor.textContent = `— ${page.authorQuote}`;

    if (pageNumLeft) pageNumLeft.textContent = `Pág. ${this.currentPageIndex * 2 + 1}`;
    if (pageNumRight) pageNumRight.textContent = `Pág. ${this.currentPageIndex * 2 + 2}`;
    if (indicator) indicator.textContent = `Capítulo ${this.currentPageIndex + 1} de ${ARCHIVE_BOOK_PAGES.length}`;

    if (btnPrev) btnPrev.disabled = this.currentPageIndex === 0;
    if (btnNext) btnNext.disabled = this.currentPageIndex === ARCHIVE_BOOK_PAGES.length - 1;
  }

  public hide(): void {
    this.element.style.display = 'none';
  }
}
