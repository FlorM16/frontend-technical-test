import { LitElement, css, html, unsafeCSS } from 'lit';
import type { Country } from '../../types/country.ts';
import { searchCountriesByName } from '../../services/countries-api.ts';
import '../country-search/country-search.ts';
import '../country-list/country-list.ts';
import '../country-detail/country-detail.ts';
import explorerStyles from './country-explorer.scss?inline';

export class CountryExplorer extends LitElement {
  static styles = css`
    ${unsafeCSS(explorerStyles)}
  `;

  private countries: Country[] = [];

  private loading = false;

  private errorMessage = '';

  private selectedCountry: Country | null = null;

  private lastSelectedCca3: string | null = null;

  private focusReturnCca3: string | null = null;

  private lastQuery = '';

  private abortCtrl: AbortController | undefined;

  private refresh() {
    this.requestUpdate();
  }

  private readonly skipToContent = (e: Event) => {
    e.preventDefault();
    this.renderRoot.querySelector<HTMLElement>('#explorer-content')?.focus();
  };

  // DECISION: aborto en disconnectedCallback y no en el constructor: el constructor corre una sola vez al crear el elemento; si el usuario sale de la página o se quita el nodo, hace falta cancelar fetch en curso para no dejar red activa ni actualizar estado de un componente ya desmontado.
  disconnectedCallback() {
    this.abortCtrl?.abort();
    super.disconnectedCallback();
  }

  private async fetchCountries(term: string) {
    // DECISION: aborto la petición anterior con AbortController antes de abrir otra, en lugar de dejar varias en vuelo: si no, una respuesta lenta antigua podría pisar una búsqueda nueva.
    this.abortCtrl?.abort();
    this.abortCtrl = new AbortController();
    this.lastQuery = term;
    this.loading = true;
    this.errorMessage = '';
    this.refresh();

    try {
      this.countries = await searchCountriesByName(term, this.abortCtrl.signal);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return;
      }
      this.countries = [];
      this.errorMessage =
        e instanceof Error ? e.message : 'No se pudieron cargar los países.';
    } finally {
      this.loading = false;
      this.refresh();
    }
  }

  private readonly onSearchChange = (e: Event) => {
    const { term } = (e as CustomEvent<{ term: string }>).detail;
    this.selectedCountry = null;
    this.lastSelectedCca3 = null;
    this.focusReturnCca3 = null;
    void this.fetchCountries(term);
  };

  private readonly onSelect = (e: Event) => {
    const country = (e as CustomEvent<Country>).detail;
    this.lastSelectedCca3 = country.cca3;
    this.selectedCountry = country;
    this.refresh();
  };

  private readonly onBack = () => {
    this.focusReturnCca3 = this.lastSelectedCca3;
    this.selectedCountry = null;
    this.refresh();
  };

  private readonly onListFocusReturned = () => {
    this.focusReturnCca3 = null;
    this.requestUpdate();
  };

  private readonly onListRetry = () => {
    void this.fetchCountries(this.lastQuery);
  };

  protected render() {
    return html`
      <button type="button" class="skip-link" @click=${this.skipToContent}>
        Saltar al contenido principal
      </button>
      <div class="shell">
        <header class="top" role="banner">
          <slot name="heading"></slot>
          <country-search @country-search-change=${this.onSearchChange}></country-search>
        </header>
        <main id="explorer-content" class="content-main" tabindex="-1" aria-label="Explorador de países">
          ${this.selectedCountry
            ? html`
                <country-detail
                  .country=${this.selectedCountry}
                  @country-detail-back=${this.onBack}
                ></country-detail>
              `
            : html`
                <country-list
                  .countries=${this.countries}
                  .loading=${this.loading}
                  .errorMessage=${this.errorMessage}
                  .focusReturnCca3=${this.focusReturnCca3}
                  @country-select=${this.onSelect}
                  @country-list-retry=${this.onListRetry}
                  @country-list-focus-returned=${this.onListFocusReturned}
                ></country-list>
              `}
        </main>
      </div>
    `;
  }
}

customElements.define('country-explorer', CountryExplorer);
