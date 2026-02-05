import { BeeGamePlayer, FlowerCard, FlowerColumn, FlowerType } from "./index.js";

export type Coord = {
  c: number; // column index
  r: number; // row index
};

export class ScoringHelper {
  public typeAt(col: FlowerColumn, row: number): FlowerType | null {
    return col.all(FlowerCard)[row]?.type ?? null;
  }

  public fullTypeAt(columns: FlowerColumn[], c: number, r: number): FlowerType | null {
    const col = columns[c];
    if (!col) return null;
    return this.typeAt(col, r);
  }

  public key(c: number, r: number): string {
    return `${c},${r}`;
  }

  public countDiagonalTriples3Cols(player: BeeGamePlayer): number {
    const [c0, c1, c2] = player.space.all(FlowerColumn);

    let count = 0;
    const maxR0 = c0.all(FlowerCard).length;

    for (let r = 0; r < maxR0; r++) {
      const t = this.typeAt(c0, r);
      if (t === null) continue;

      // down-right: (0,r) (1,r+1) (2,r+2)
      if (this.typeAt(c1, r + 1) === t && this.typeAt(c2, r + 2) === t) {
        count++;
      }

      // up-right: (0,r) (1,r-1) (2,r-2)
      if (this.typeAt(c1, r - 1) === t && this.typeAt(c2, r - 2) === t) {
        count++;
      }
    }

    return count;
  }

  public countRowsWithAdjacentPair(player: BeeGamePlayer): number {
    const [c0, c1, c2] = player.space.all(FlowerColumn);
    const maxRows = Math.max(c0.all(FlowerCard).length, c1.all(FlowerCard).length, c2.all(FlowerCard).length);

    let rowsWithMatch = 0;

    for (let r = 0; r < maxRows; r++) {
      const t0 = this.typeAt(c0, r);
      const t1 = this.typeAt(c1, r);
      const t2 = this.typeAt(c2, r);

      const leftMatch = t0 !== null && t1 !== null && t0 === t1;
      const rightMatch = t1 !== null && t2 !== null && t1 === t2;

      if (leftMatch || rightMatch) rowsWithMatch++;
    }

    return rowsWithMatch;
  }

  public countCardsAboveLowestType(player: BeeGamePlayer, targetType: FlowerType): number {
    let total = 0;

    for (const col of player.space.all(FlowerColumn)) {
      let lowestIdx = -1;

      // scan from bottom to top to find lowest occurrence
      for (let i = col.all(FlowerCard).length - 1; i >= 0; i--) {
        if (col.all(FlowerCard)[i].type === targetType) {
          lowestIdx = i;
          break;
        }
      }

      if (lowestIdx !== -1) {
        // cards above it are indices 0..lowestIdx-1
        total += lowestIdx;
      }
    }

    return total;
  }

  public countRowsWithAtLeastTwoOfType(player: BeeGamePlayer, targetType: FlowerType): number {
    const [c0, c1, c2] = player.space.all(FlowerColumn);
    const maxRows = Math.max(c0.all(FlowerCard).length, c1.all(FlowerCard).length, c2.all(FlowerCard).length);

    let rows = 0;

    for (let r = 0; r < maxRows; r++) {
      let hits = 0;
      if (this.typeAt(c0, r) === targetType) hits++;
      if (this.typeAt(c1, r) === targetType) hits++;
      if (this.typeAt(c2, r) === targetType) hits++;

      if (hits >= 2) rows++;
    }

    return rows;
  }

  public countTypeInColumnsThatContainType(player: BeeGamePlayer, countType: FlowerType, mustAlsoContainType: FlowerType): number {
    let total = 0;

    for (const col of player.space.all(FlowerColumn)) {
      let hasOther = false;
      let count = 0;

      for (const card of col.all(FlowerCard)) {
        if (card.type === mustAlsoContainType) hasOther = true;
        if (card.type === countType) count++;
      }

      if (hasOther) total += count;
    }

    return total;
  }

  public largestOrthogonalAreaSize(player: BeeGamePlayer, targetType: FlowerType): number {
    const numCols = player.space.all(FlowerColumn).length;
    const maxRows = Math.max(0, ...player.space.all(FlowerColumn).map(c => c.all(FlowerCard).length));

    const visited = new Set<string>();
    let best = 0;

    for (let c = 0; c < numCols; c++) {
      for (let r = 0; r < maxRows; r++) {
        if (this.fullTypeAt(player.space.all(FlowerColumn), c, r) !== targetType) continue;

        const startK = this.key(c, r);
        if (visited.has(startK)) continue;

        // BFS / flood fill
        let size = 0;
        const queue: Coord[] = [{ c, r }];
        visited.add(startK);

        while (queue.length) {
          const cur = queue.pop()!;
          size++;

          const neighbors: Coord[] = [
            { c: cur.c - 1, r: cur.r },
            { c: cur.c + 1, r: cur.r },
            { c: cur.c, r: cur.r - 1 },
            { c: cur.c, r: cur.r + 1 },
          ];

          for (const n of neighbors) {
            if (this.fullTypeAt(player.space.all(FlowerColumn), n.c, n.r) !== targetType) continue;

            const nk = this.key(n.c, n.r);
            if (visited.has(nk)) continue;

            visited.add(nk);
            queue.push(n);
          }
        }

        if (size > best) best = size;
      }
    }

    return best;
  }

  public countTypeInRowsThatContainType(player: BeeGamePlayer, countType: FlowerType, mustAlsoContainType: FlowerType): number {
    const [c0, c1, c2] = player.space.all(FlowerColumn);
    const maxRows = Math.max(c0.all(FlowerCard).length, c1.all(FlowerCard).length, c2.all(FlowerCard).length);

    let total = 0;

    for (let r = 0; r < maxRows; r++) {
      const t0 = this.typeAt(c0, r);
      const t1 = this.typeAt(c1, r);
      const t2 = this.typeAt(c2, r);

      const hasOther =
        t0 === mustAlsoContainType ||
        t1 === mustAlsoContainType ||
        t2 === mustAlsoContainType;

      if (!hasOther) continue;

      if (t0 === countType) total++;
      if (t1 === countType) total++;
      if (t2 === countType) total++;
    }

    return total;
  }

  public countDirectlyBelow(player: BeeGamePlayer, aboveType: FlowerType, belowType: FlowerType): number {
    let total = 0;

    for (const col of player.space.all(FlowerColumn)) {
      for (let i = 0; i < col.all(FlowerCard).length - 1; i++) {
        if (col.all(FlowerCard)[i].type === aboveType && col.all(FlowerCard)[i + 1].type === belowType) {
          total++;
        }
      }
    }

    return total;
  }
}