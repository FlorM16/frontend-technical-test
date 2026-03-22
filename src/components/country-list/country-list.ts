import { LitElement, css, html, unsafeCSS } from 'lit';
import type { Country } from '../../types/country.ts';
import listStyles from './country-list.scss?inline';

const MAX_CARDS = 12;

export class CountryList extends LitElement {
  static properties = {
    countries: { type: Array, attribute: false },
    loading: { type: Boolean },
    errorMessage: { type: String, attribute: false },
  };

  static styles = css`
    ${unsafeCSS(listStyles)}
  `;

  declare countries: Country[];

  declare loading: boolean;

  declare errorMessage: string;

  constructor() {
    super();
    this.countries = [];
    this.loading = false;
    this.errorMessage = '';
  }

  private get visibleCountries(): Country[] {
    // DECISION: el límite de 12 aplica solo al render; la prop `countries` sigue siendo la lista completa que envía el explorer.
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

  protected render() {
    if (this.loading) {
      return html`
        <div class="loading" aria-busy="true">
          <div class="spinner" aria-hidden="true"></div>
          <span>Cargando…</span>
        </div>
      `;
    }

    if (this.errorMessage !== '') {
      return html`
        <div class="state" role="alert">
          <p>${this.errorMessage}</p>
          <button type="button" class="retry" @click=${this.emitRetry}>Reintentar</button>
        </div>
      `;
    }

    if (this.countries.length === 0) {
      return html`<div class="state" role="status">No hay resultados para mostrar.</div>`;
    }

    return html`
      <div class="grid">
        ${this.visibleCountries.map(
          (c) => html`
            <button type="button" class="card" @click=${() => this.selectCountry(c)}>
              ${c.flagImageUrl
                ? html`<img src=${c.flagImageUrl} alt="" loading="lazy" />`
                : null}
              <div class="card-body">
                <div class="card-title">${c.nameOfficial}</div>
                <div class="card-meta">${c.capital || '—'}</div>
                <div class="card-meta">${c.region || '—'}</div>
              </div>
            </button>
          `,
        )}
      </div>
    `;
  }
}

customElements.define('country-list', CountryList);
