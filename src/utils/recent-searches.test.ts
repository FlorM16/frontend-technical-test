import { expect } from '@open-wc/testing';
import { addRecentSearch, getRecentSearches } from './recent-searches.ts';

const STORAGE_KEY = 'country-explorer-recent-searches';

describe('recent-searches', () => {
  beforeEach(() => localStorage.removeItem(STORAGE_KEY));
  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  it('prepends newer terms and dedupes case-insensitively', () => {
    addRecentSearch('peru');
    addRecentSearch('spain');
    addRecentSearch('Peru');
    expect(getRecentSearches()).to.deep.equal(['Peru', 'spain']);
  });

  it('keeps at most 10 entries', () => {
    for (let i = 0; i < 15; i += 1) {
      addRecentSearch(`t${i}`);
    }
    expect(getRecentSearches()).to.have.length(10);
    expect(getRecentSearches()[0]).to.equal('t14');
  });
});
