import { describe, expect, it } from 'vitest';

import { type PinSpot, type PlacedPin, placePins } from './place-pins';

const PHONE_CARD = { width: 326, tapSize: 44 };
const THREE_HOURS = 10_800;

function spot(id: string, middle: number): PinSpot {
  return { id, middle };
}

function listMiddles(placed: PlacedPin[], isOnLowRow: boolean): number[] {
  return placed.filter((pin) => pin.isOnLowRow === isOnLowRow).map((pin) => pin.middle);
}

function findSmallestGap(middles: number[]): number {
  const gaps = middles.slice(1).map((middle, place) => middle - middles[place]);
  return Math.min(...gaps);
}

describe('placePins', () => {
  it('puts the pins in two rows by turns, in the order of their clips', () => {
    const placed = placePins([spot('c01', 40), spot('c03', 110), spot('c02', 180), spot('c04', 250)], PHONE_CARD);

    expect(placed.map((pin) => pin.id)).toEqual(['c01', 'c03', 'c02', 'c04']);
    expect(placed.map((pin) => pin.isOnLowRow)).toEqual([false, true, false, true]);
  });

  it('leaves pins that are far apart where their clips are', () => {
    const placed = placePins([spot('c01', 40), spot('c03', 110), spot('c02', 180), spot('c04', 250)], PHONE_CARD);

    expect(placed.map((pin) => pin.middle)).toEqual([40, 110, 180, 250]);
  });

  it('leaves two pins a tap area apart on a row where they are', () => {
    const placed = placePins([spot('c01', 100), spot('c02', 120), spot('c03', 144)], PHONE_CARD);

    expect(listMiddles(placed, false)).toEqual([100, 144]);
  });

  it('moves two pins that crowd on a row apart by no more than a tap area needs', () => {
    const placed = placePins([spot('c01', 100), spot('c02', 200), spot('c03', 110)], PHONE_CARD);

    expect(listMiddles(placed, false)).toEqual([83, 127]);
    expect(listMiddles(placed, true)).toEqual([200]);
  });

  it('keeps a pin that crowds nobody in place beside a pair that was moved apart', () => {
    const spots = [spot('c01', 100), spot('c02', 20), spot('c03', 110), spot('c04', 300), spot('c05', 250)];

    const placed = placePins(spots, PHONE_CARD);

    expect(listMiddles(placed, false)).toEqual([83, 127, 250]);
    expect(listMiddles(placed, true)).toEqual([22, 300]);
  });

  it('keeps the tap area of a pin at either end inside the card', () => {
    const placed = placePins([spot('c01', 0), spot('c02', 163), spot('c03', 326)], PHONE_CARD);

    expect(listMiddles(placed, false)).toEqual([22, 304]);
  });

  it('gives twelve clips within one minute of a three-hour video each a place of their own in a card 326 px wide', () => {
    const clips = Array.from({ length: 12 }, (_, place) => {
      const middleSeconds = 5400 + place * 5;
      return spot(`c${place + 1}`, (middleSeconds / THREE_HOURS) * PHONE_CARD.width);
    });

    const placed = placePins(clips, PHONE_CARD);
    const rows = [listMiddles(placed, false), listMiddles(placed, true)];

    expect(rows.map((row) => row.length)).toEqual([6, 6]);
    expect(rows.map(findSmallestGap).map(Math.round)).toEqual([44, 44]);
    expect(Math.min(...rows.flat())).toBeGreaterThanOrEqual(22);
    expect(Math.max(...rows.flat())).toBeLessThanOrEqual(304);
    expect(rows[0]).toEqual([...rows[0]].sort((left, right) => left - right));
  });

  it('centres a crowd of pins on the place their clips share', () => {
    const crowd = [spot('c01', 163), spot('c02', 10), spot('c03', 163), spot('c04', 300), spot('c05', 163)];

    const placed = placePins(crowd, PHONE_CARD);

    expect(listMiddles(placed, false)).toEqual([119, 163, 207]);
  });

  it('draws the pins closer than a tap area only when the row is too narrow to hold them apart', () => {
    const narrow = { width: 100, tapSize: 44 };
    const crowd = [spot('c01', 50), spot('c02', 50), spot('c03', 50), spot('c04', 50), spot('c05', 50)];

    const placed = placePins(crowd, narrow);

    expect(listMiddles(placed, false)).toEqual([22, 50, 78]);
  });
});
