import { describe, expect, it } from 'vitest';

import { placeMenu } from './place-menu';

const DESKTOP = { menuWidth: 290, windowWidth: 1360, windowHeight: 800 };
const PHONE = { menuWidth: 290, windowWidth: 390, windowHeight: 844 };

describe('placeMenu', () => {
  it('opens below a control in the top half, aligned to its right edge on the right side', () => {
    const anchor = { top: 9, bottom: 43, left: 1306, right: 1340 };

    expect(placeMenu({ ...DESKTOP, anchor })).toEqual({
      left: '1050px',
      top: '51px',
      bottom: 'auto',
      transformOrigin: 'right top',
    });
  });

  it('aligns to the left edge of a control on the left side', () => {
    const anchor = { top: 9, bottom: 43, left: 300, right: 334 };

    expect(placeMenu({ ...DESKTOP, anchor }).left).toBe('300px');
    expect(placeMenu({ ...DESKTOP, anchor }).transformOrigin).toBe('left top');
  });

  it('opens above a control in the bottom half', () => {
    const anchor = { top: 770, bottom: 820, left: 16, right: 130 };

    expect(placeMenu({ ...PHONE, anchor })).toEqual({
      left: '16px',
      top: 'auto',
      bottom: '82px',
      transformOrigin: 'left bottom',
    });
  });

  it('keeps a margin to the right edge of the window', () => {
    const anchor = { top: 8, bottom: 52, left: 150, right: 194 };

    expect(placeMenu({ ...PHONE, anchor }).left).toBe('92px');
  });

  it('keeps a margin to the left edge of the window', () => {
    const anchor = { top: 8, bottom: 52, left: 200, right: 244 };

    expect(placeMenu({ ...PHONE, anchor }).left).toBe('8px');
  });
});
