import { Piece, Space } from "@boardzilla/core";
import { Building, Color, MyGame, SpaceType } from "./index.js";
import { CandlePawn, ColorDie, KeyShape, Melt, WorkerPiece } from "./components.js";

export class WorkerSpace extends Space<MyGame> {
    building: Building
    spaceType: SpaceType
    color: Color | undefined

    containsKey() : boolean {
      return this.all(KeyShape).length > 0;
    }
    containsDie() : boolean {
      return this.all(ColorDie).length > 0;
    }
    containsCandle() : boolean {
      return this.all(CandlePawn).length > 0;
    }

    toHtml() : string {
      return this.all(WorkerPiece).length > 1 ? '‎ ‎ ‎' + this.all(WorkerPiece).length + '‎ ‎ ‎' : '';
    }
}
  
export class ComponentSpace extends Space<MyGame> {
  num: number;
}
  
export class DiceSpace extends Space<MyGame> {
  
}
  
export class ReadySpace extends Space<MyGame> {
  
}

export class GoalSpace extends Space<MyGame> {
  
}

export class CustomerSpace extends Space<MyGame> {
  
}
  
export class Candelabra extends Space<MyGame> {
  color: Color;
}

export class CandleTopRow extends Piece<MyGame> {

}
export class CandleBottomRow extends Piece<MyGame> {
    
}

export class CandleSpace extends Piece<MyGame> {
    color: Color
}
  
export class KeyHook extends Space<MyGame> {
    color: Color;
}
  
export class Spill extends Space<MyGame> {
  
}
  
export class GameEndSpace extends Space<MyGame> {
    score: number = 0;
}
  
export class RoundEndSpace extends Space<MyGame> {
  
}

export class RoundSpace extends Space<MyGame> {
  round: number;
}
  
export class BackAlleySpace extends Space<MyGame> {
  letter: string = "";
  building: Building;
}

export class CheckSpace extends Space<MyGame> {
  building: Building;
}
  
export class PlayerSpace extends Space<MyGame> {
 
}

export class PlayersSpace extends Space<MyGame> {
 
}
  
export class ChandlersBoard extends Space<MyGame> {
  
}
  
export class PlayerBoard extends Space<MyGame> {
  openingsForColor(color: Color) : number {
    const openings = this.all(Melt).map(x => x.canTakeColor(color) ? 1 : 0).reduce((sum, current) => sum + current, 0);
    return openings;
  }
}

export class PowerSpace extends Space<MyGame> {

}
    
export class MasteryTrack extends Space<MyGame> {
  
}

export class MasterySpace extends Space<MyGame> {
  index: number = 0;
}

export class ScoringTrack extends Space<MyGame> {

}

export class ScoringSpace extends Space<MyGame> {
    score: number = 0;
    override toString(): string {
        return this.score.toString()
    }
}

export class BackAlley extends Space<MyGame> {
    letter: string;
}

