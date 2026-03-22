import { expect } from '@open-wc/testing';
import {
  clampPage,
  getDisplayRange,
  getPageCount,
  getPageSlice,
  PAGE_SIZE,
} from './pagination.ts';

describe('pagination', () => {
  it('getPageSlice returns the second page of items', () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    expect(getPageSlice(items, 2, 12)).to.deep.equal(
      Array.from({ length: 12 }, (_, i) => i + 12),
    );
  });

  it('getPageCount, getDisplayRange and clampPage stay consistent', () => {
    const total = 40;
    const pageCount = getPageCount(total, PAGE_SIZE);
    expect(pageCount).to.equal(4);
    expect(getDisplayRange(2, PAGE_SIZE, total)).to.deep.equal({ from: 13, to: 24 });
    expect(clampPage(99, pageCount)).to.equal(4);
    expect(clampPage(0, pageCount)).to.equal(1);
  });
});
