import { LitElement, css, html, unsafeCSS } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { debounce, SEARCH_DEBOUNCE_MS } from '../../utils/debounce.ts';
import searchStyles from './country-search.scss?inline';

export class CountrySearch extends LitElement {
  static styles = css`
    ${unsafeCSS(searchStyles)}
  `;

  private inputRef = createRef<HTMLInputElement>();

  private pending = false;

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

  // DECISION: "Buscando…" se muestra entre la última pulsación de tecla y la emisión del evento, no después.
  private onInput() {
    this.setPending(true);
    this.scheduleNotify();
  }

  protected render() {
    return html`
      <div class="wrap">
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
      </div>
    `;
  }
}

customElements.define('country-search', CountrySearch);
