import { LitElement, css, html, unsafeCSS } from 'lit';
import type { Country } from '../../types/country.ts';
import detailStyles from './country-detail.scss?inline';

export class CountryDetail extends LitElement {
  static properties = {
    country: { type: Object, attribute: false },
  };

  static styles = css`
    ${unsafeCSS(detailStyles)}
  `;

  declare country: Country | null;

  constructor() {
    super();
    this.country = null;
  }

  private readonly emitBack = () => {
    this.dispatchEvent(
      new CustomEvent('country-detail-back', {
        bubbles: true,
        composed: true,
      }),
    );
  };

  private formatInt(n: number): string {
    return new Intl.NumberFormat().format(n);
  }

  protected render() {
    if (!this.country) {
      return html``;
    }

    const c = this.country;

    // DECISION: animación de entrada (opacity) en .panel; la salida la gestiona el padre al ocultar el componente.
    return html`
      <div class="panel">
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
        <button type="button" class="back" @click=${this.emitBack}>Volver</button>
      </div>
    `;
  }
}

customElements.define('country-detail', CountryDetail);
