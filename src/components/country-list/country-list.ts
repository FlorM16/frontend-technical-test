import { LitElement, css, html, unsafeCSS } from 'lit';
import type { PropertyValues } from 'lit';
import type { TemplateResult } from 'lit';
import type { Country } from '../../types/country.ts';
import {
  PAGE_SIZE,
  clampPage,
  getDisplayRange,
  getPageCount,
  getPageSlice,
} from '../../utils/pagination.ts';
import listStyles from './country-list.scss?inline';

export class CountryList extends LitElement {
  static properties = {
    countries: { type: Array, attribute: false },
    loading: { type: Boolean },
    errorMessage: { type: String, attribute: false },
    focusReturnCca3: { type: String, attribute: false },
    currentPage: { type: Number, state: true },
  };

  static styles = css`
    ${unsafeCSS(listStyles)}
  `;

  declare countries: Country[];

  declare loading: boolean;

  declare errorMessage: string;

  declare focusReturnCca3: string | null;

  declare currentPage: number;

  constructor() {
    super();
    this.countries = [];
    this.loading = false;
    this.errorMessage = '';
    this.focusReturnCca3 = null;
    this.currentPage = 1;
  }

  willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('countries')) {
      this.currentPage = 1;
    }
  }

  private get pageCount(): number {
    return getPageCount(this.countries.length, PAGE_SIZE);
  }

  private get visibleCountries(): Country[] {
    return getPageSlice(this.countries, this.currentPage, PAGE_SIZE);
  }

  private goToPage(next: number) {
    const page = clampPage(next, this.pageCount);
    if (page === this.currentPage) return;
    this.currentPage = page;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    queueMicrotask(() => {
      this.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'nearest' });
    });
  }

  private selectCountry(country: Country) {
    this.dispatchEvent(
      new CustomEvent('country-select', {
        detail: country,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private emitRetry() {
    this.dispatchEvent(
      new CustomEvent('country-list-retry', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private regionWrap(body: TemplateResult): TemplateResult {
    return html`
      <div class="list-region" role="region" aria-labelledby="country-results-heading">
        <h2 id="country-results-heading" class="sr-only">Resultados de la búsqueda</h2>
        ${body}
      </div>
    `;
  }

  protected updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('focusReturnCca3') && this.focusReturnCca3) {
      const id = this.focusReturnCca3;
      const idx = this.countries.findIndex((c) => c.cca3 === id);
      if (idx >= 0) {
        const page = Math.floor(idx / PAGE_SIZE) + 1;
        this.currentPage = clampPage(page, this.pageCount);
      }
      queueMicrotask(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const btn = this.renderRoot.querySelector(
              `button[data-cca3="${CSS.escape(id)}"]`,
            ) as HTMLButtonElement | null;
            btn?.focus();
            this.dispatchEvent(
              new CustomEvent('country-list-focus-returned', {
                bubbles: true,
                composed: true,
              }),
            );
          });
        });
      });
    }
  }

  protected render() {
    if (this.loading) {
      return this.regionWrap(html`
        <div class="loading" aria-busy="true" aria-describedby="country-results-heading">
          <div class="spinner" aria-hidden="true"></div>
          <span>Cargando…</span>
        </div>
      `);
    }

    if (this.errorMessage !== '') {
      return this.regionWrap(html`
        <div class="state" role="alert" aria-live="assertive">
          <p>${this.errorMessage}</p>
          <button type="button" class="retry" @click=${this.emitRetry}>Reintentar</button>
        </div>
      `);
    }

    if (this.countries.length === 0) {
      return this.regionWrap(html`
        <div class="state state--empty" role="status" aria-live="polite">No hay resultados para mostrar.</div>
      `);
    }

    const total = this.countries.length;
    const { from, to } = getDisplayRange(this.currentPage, PAGE_SIZE, total);
    const pages = this.pageCount;
    const showPager = pages > 1;

    return this.regionWrap(html`
      <div class="grid" role="list">
        ${this.visibleCountries.map(
          (c) => html`
            <div class="grid-cell" role="listitem">
              <button
                type="button"
                class="card"
                data-cca3=${c.cca3}
                aria-label=${`Ver detalles de ${c.nameOfficial}`}
                @click=${() => this.selectCountry(c)}
              >
                ${c.flagImageUrl
                  ? html`<img src=${c.flagImageUrl} alt="" loading="lazy" />
                    `
                  : null}
                <div>
                  <div class="card-title">${c.nameOfficial}</div>
                  <div class="card-meta">${c.capital || '—'}</div>
                  <div class="card-meta">${c.region || '—'}</div>
                </div>
              </button>
            </div>
          `,
        )}
      </div>
      ${showPager
        ? html`
            <nav class="pager" aria-label="Paginación de resultados">
              <button
                type="button"
                class="pager-btn"
                ?disabled=${this.currentPage <= 1}
                aria-label="Página anterior"
                @click=${() => this.goToPage(this.currentPage - 1)}
              >
                Anterior
              </button>
              <p class="pager-status" aria-live="polite">
                Página ${this.currentPage} de ${pages} · ${from}–${to} de ${total}
              </p>
              <button
                type="button"
                class="pager-btn"
                ?disabled=${this.currentPage >= pages}
                aria-label="Página siguiente"
                @click=${() => this.goToPage(this.currentPage + 1)}
              >
                Siguiente
              </button>
            </nav>
          `
        : null}
    `);
  }
}

customElements.define('country-list', CountryList);
