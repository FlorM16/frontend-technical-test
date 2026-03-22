import type { Country } from '../types/country.ts';

const BASE_URL = 'https://restcountries.com/v3.1';

type RestCountry = {
  name?: { common?: string; official?: string };
  cca3?: string;
  capital?: string[];
  region?: string;
  flags?: { png?: string; svg?: string };
  population?: number;
  area?: number;
  languages?: Record<string, string>;
  currencies?: Record<string, { name?: string; symbol?: string }>;
  timezones?: string[];
};

function mapToCountry(raw: RestCountry): Country {
  const name = raw.name ?? {};
  const languageLabels = raw.languages ? Object.values(raw.languages) : [];
  const currencyLabels = raw.currencies
    ? Object.entries(raw.currencies).map(([code, c]) => {
      const label = c?.name ?? code;
      const sym = c?.symbol ? ` (${c.symbol})` : '';
      return `${code} — ${label}${sym}`;
    })
    : [];

  return {
    cca3: raw.cca3 ?? '',
    nameCommon: name.common ?? '',
    nameOfficial: name.official ?? name.common ?? '',
    capital: raw.capital?.join(', ') ?? '',
    region: raw.region ?? '',
    flagImageUrl: raw.flags?.png ?? raw.flags?.svg ?? '',
    population: raw.population ?? 0,
    area: raw.area ?? 0,
    languageLabels,
    currencyLabels,
    timezones: raw.timezones ?? [],
  };
}

export async function searchCountriesByName(
  query: string,
  signal: AbortSignal,
): Promise<Country[]> {
  const q = query.trim();

  // DECISION: si el término está vacío se devuelve [] sin fetch, en lugar de llamar al endpoint: no hay consulta útil y se evitan red y respuestas 4xx innecesarias.
  if (!q) {
    return [];
  }

  const url = `${BASE_URL}/name/${encodeURIComponent(q)}?fields=cca3,name,capital,region,flags,population,area,languages,currencies,timezones`;
  const response = await fetch(url, { signal });

  // DECISION: ante HTTP 404 se devuelve [] y no se lanza Error, en lugar de tratarlo como fallo de red: en REST Countries significa “sin coincidencias”; la pantalla de error queda reservada para otros códigos y errores de red.
  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Countries API HTTP ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('Countries API: invalid response shape');
  }

  return payload.map((item) => mapToCountry(item as RestCountry));
}
