import { Cardboard } from "./cardboard.js";

export class Goal {
  private targets: Cardboard[];

  constructor(targets: Cardboard[]) {
    this.targets = targets;
  }

  public getTargets(): Cardboard[] {
    return this.targets;
  }

  public contains(color: string, value: number): boolean {
    return this.targets.some(
      (cardboard) =>
        cardboard.color === color &&
        cardboard.face.value === value
    );
  }
}
