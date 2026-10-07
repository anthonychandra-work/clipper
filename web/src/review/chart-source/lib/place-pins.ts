const ROWS = 2;

export interface PinSpot {
  id: string;
  middle: number;
}

export interface PinStrip {
  width: number;
  tapSize: number;
}

export interface PlacedPin {
  id: string;
  middle: number;
  isOnLowRow: boolean;
}

interface PinCluster {
  wanted: number[];
  first: number;
}

export function placePins(spotsInOrder: readonly PinSpot[], strip: PinStrip): PlacedPin[] {
  const rows = Array.from({ length: ROWS }, (_, row) => spotsInOrder.filter((_spot, place) => place % ROWS === row));
  const placedByRow = rows.map((spots) => spreadRow(spots, strip));
  return spotsInOrder.map((spot, place) => ({
    id: spot.id,
    middle: placedByRow[place % ROWS][Math.floor(place / ROWS)],
    isOnLowRow: place % ROWS === 1,
  }));
}

function spreadRow(spots: readonly PinSpot[], strip: PinStrip): number[] {
  const edge = strip.tapSize / 2;
  const room = Math.max(0, strip.width - strip.tapSize);
  const step = spots.length > 1 ? Math.min(strip.tapSize, room / (spots.length - 1)) : 0;
  const wanted = spots.map((spot) => Math.min(edge + room, Math.max(edge, spot.middle)));
  const clusters = wanted.reduce<PinCluster[]>((merged, middle) => {
    return mergeWhileCrowded([...merged, { wanted: [middle], first: middle }], { step, edge, room });
  }, []);
  return clusters.flatMap((cluster) => cluster.wanted.map((_middle, place) => cluster.first + place * step));
}

function mergeWhileCrowded(clusters: PinCluster[], row: { step: number; edge: number; room: number }): PinCluster[] {
  const last = clusters[clusters.length - 1];
  const before = clusters[clusters.length - 2];
  if (before === undefined || last.first - endOf(before, row.step) >= row.step) return clusters;
  const wanted = [...before.wanted, ...last.wanted];
  const merged = { wanted, first: centreCluster(wanted, row) };
  return mergeWhileCrowded([...clusters.slice(0, -2), merged], row);
}

function centreCluster(wanted: number[], row: { step: number; edge: number; room: number }): number {
  const starts = wanted.map((middle, place) => middle - place * row.step);
  const centred = starts.reduce((sum, start) => sum + start, 0) / starts.length;
  const latestFirst = row.edge + row.room - (wanted.length - 1) * row.step;
  return Math.min(latestFirst, Math.max(row.edge, centred));
}

function endOf(cluster: PinCluster, step: number): number {
  return cluster.first + (cluster.wanted.length - 1) * step;
}
