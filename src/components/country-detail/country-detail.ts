import { LitElement, css, html, unsafeCSS } from 'lit';
import type { PropertyValues } from 'lit';
import type { Country } from '../../types/country.ts';
import detailStyles from './country-detail.scss?inline';

export class CountryDetail extends LitElement {
  static properties = {
    country: { type: Object, attribute: false },
    exiting: { state: true },
    enterReady: { state: true },
  };

  static styles = css`
    ${unsafeCSS(detailStyles)}
  `;

  declare country: Country | null;

  declare exiting: boolean;

  declare enterReady: boolean;

  private visibleClassScheduled = false;

  constructor() {
    super();
    this.country = null;
    this.exiting = false;
    this.enterReady = false;
  }

  willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('country') && this.country != null) {
      this.exiting = false;
      this.visibleClassScheduled = false;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.enterReady = true;
      } else {
        this.enterReady = false;
      }
    }
  }

  // DECISION: uso deferVisibleClass (requestAnimationFrame) antes de .panel--visible y no abro el panel visible en el primer render: sin ese desfase el navegador no aplica transition de entrada (no hay estado “antes” y “después”).
  private deferVisibleClass() {
    if (!this.country || this.exiting) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (this.visibleClassScheduled) return;
    this.visibleClassScheduled = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.visibleClassScheduled = false;
        if (this.country && !this.exiting) {
          this.enterReady = true;
        }
      });
    });
  }

  protected firstUpdated() {
    this.deferVisibleClass();
  }

  private readonly finishBack = () => {
    this.dispatchEvent(
      new CustomEvent('country-detail-back', {
        bubbles: true,
        composed: true,
      }),
    );
  };

  private readonly onBackClick = () => {
    if (this.exiting || !this.country) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.finishBack();
      return;
    }
    this.exiting = true;
  };

  // DECISION: emito country-detail-back en transitionend y no en el click de Volver: si el padre oculta el componente al instante, se corta la transition de salida; hay que esperar a que el CSS termine.
  private readonly onExitTransitionEnd = (e: Event) => {
    const ev = e as TransitionEvent;
    const panel = this.renderRoot.querySelector('.panel');
    if (!panel || e.target !== panel || ev.propertyName !== 'opacity' || !this.exiting) return;
    panel.removeEventListener('transitionend', this.onExitTransitionEnd);
    this.exiting = false;
    this.finishBack();
  };

  protected updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('exiting') && this.exiting && this.country) {
      this.renderRoot.querySelector('.panel')?.addEventListener('transitionend', this.onExitTransitionEnd);
    }
    if (changed.has('country') && this.country) {
      this.deferVisibleClass();
    }
  }

  private formatInt(n: number): string {
    return new Intl.NumberFormat().format(n);
  }

  protected render() {
    if (!this.country) {
      return html``;
    }

    const c = this.country;

    return html`
      <div
        class="panel ${this.exiting ? 'panel--exiting' : ''} ${!this.exiting && this.enterReady ? 'panel--visible' : ''}"
      >
        <h2>${c.nameOfficial}</h2>
        <dl>
          <dt>Población</dt>
          <dd>${this.formatInt(c.population)}</dd>
          <dt>Área (km²)</dt>
          <dd>${this.formatInt(c.area)}</dd>
          <dt>Idiomas</dt>
          <dd>${c.languageLabels.length ? c.languageLabels.join(', ') : '—'}</dd>
          <dt>Monedas</dt>
          <dd>${c.currencyLabels.length ? c.currencyLabels.join(', ') : '—'}</dd>
          <dt>Zonas horarias</dt>
          <dd>${c.timezones.length ? c.timezones.join(', ') : '—'}</dd>
        </dl>
        <button type="button" class="back" ?disabled=${this.exiting} @click=${this.onBackClick}>
          Volver
        </button>
      </div>
    `;
  }
}

customElements.define('country-detail', CountryDetail);
