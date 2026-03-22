import { LitElement, css, html, unsafeCSS } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { debounce, SEARCH_DEBOUNCE_MS } from '../../utils/debounce.ts';
import searchStyles from './country-search.scss?inline';

export class CountrySearch extends LitElement {
  static properties = {
    recentSearches: { type: Array, attribute: false },
  };

  static styles = css`
    ${unsafeCSS(searchStyles)}
  `;

  declare recentSearches: string[];

  private inputRef = createRef<HTMLInputElement>();

  private pending = false;

  constructor() {
    super();
    this.recentSearches = [];
  }

  private readonly flushTerm = () => {
    const raw = this.inputRef.value?.value ?? '';
    const term = raw.trim();
    this.setPending(false);
    this.dispatchEvent(
      new CustomEvent('country-search-change', {
        detail: { term },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private readonly scheduleNotify = debounce(this.flushTerm, SEARCH_DEBOUNCE_MS);

  private setPending(next: boolean) {
    if (this.pending === next) return;
    this.pending = next;
    this.requestUpdate();
  }

  // DECISION: se muestra “Buscando…” mientras el debounce está pendiente, no solo después de emitir el evento al padre: el enunciado exige feedback durante la ventana de debounce, no únicamente cuando el término ya se propagó.
  private onInput() {
    this.setPending(true);
    this.scheduleNotify();
  }

  // DECISION: al pulsar un chip reciente se emite country-search-change al instante sin debounce, en lugar de reutilizar el mismo flujo que el input: el término es un valor cerrado, no tecleo carácter a carácter, así que no aplica la misma política anti-spam.
  private pickRecent(term: string) {
    if (this.inputRef.value) {
      this.inputRef.value.value = term;
    }
    this.setPending(false);
    this.dispatchEvent(
      new CustomEvent('country-search-change', {
        detail: { term },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected render() {
    const recents = this.recentSearches ?? [];
    return html`
      <div class="wrap" role="search" aria-label="Buscar países por nombre">
        <label for="country-search-input">Buscar país</label>
        <input
          id="country-search-input"
          type="search"
          autocomplete="off"
          placeholder="Nombre del país"
          ${ref(this.inputRef)}
          @input=${this.onInput}
        />
        <div class="pending" role="status" aria-live="polite">
          ${this.pending ? 'Buscando…' : ''}
        </div>
        ${recents.length > 0
        ? html`
              <div class="recent" role="region" aria-label="Búsquedas recientes">
                <span class="recent-label" id="recent-searches-label">Recientes</span>
                <ul class="recent-list" role="list" aria-labelledby="recent-searches-label">
                  ${recents.map(
          (s) => html`
                      <li role="listitem">
                        <button
                          type="button"
                          class="recent-chip"
                          aria-label=${`Buscar de nuevo: ${s}`}
                          @click=${() => this.pickRecent(s)}
                        >
                          ${s}
                        </button>
                      </li>
                    `,
        )}
                </ul>
              </div>
            `
        : null}
      </div>
    `;
  }
}

customElements.define('country-search', CountrySearch);
