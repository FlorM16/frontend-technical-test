import { LitElement, css, html, unsafeCSS } from 'lit';
import type { PropertyValues } from 'lit';
import type { TemplateResult } from 'lit';
import type { Country } from '../../types/country.ts';
import listStyles from './country-list.scss?inline';

const MAX_CARDS = 12;

export class CountryList extends LitElement {
  static properties = {
    countries: { type: Array, attribute: false },
    loading: { type: Boolean },
    errorMessage: { type: String, attribute: false },
    focusReturnCca3: { type: String, attribute: false },
  };

  static styles = css`
    ${unsafeCSS(listStyles)}
  `;

  declare countries: Country[];

  declare loading: boolean;

  declare errorMessage: string;

  declare focusReturnCca3: string | null;

  constructor() {
    super();
    this.countries = [];
    this.loading = false;
    this.errorMessage = '';
    this.focusReturnCca3 = null;
  }

  private get visibleCountries(): Country[] {
    // DECISION: corto a 12 solo al pintar (slice en el render), y no en el explorer: el padre debe seguir pasando la lista completa; el tope es presentación (documentado en el README).
    return this.countries.slice(0, MAX_CARDS);
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
      queueMicrotask(() => {
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
    `);
  }
}

customElements.define('country-list', CountryList);
