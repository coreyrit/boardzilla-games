import { Piece } from "@boardzilla/core";
import { Color, MyGame } from "./index.js";

export class CustomerCard extends Piece<MyGame> {
    flipped: boolean = false;
    requiredCandles: Color[];
}

export class EndGameTile extends Piece<MyGame> {
    flipped: boolean = true;
}
  
export class RoundEndTile extends Piece<MyGame> {
    flipped: boolean = true;
}
  
export class BackAlleyTile extends Piece<MyGame> {
    flipped: boolean = true;
    letter: String;
}

export class WorkerPiece extends Piece<MyGame> {
    color: Color;
  }

export class ColorDie extends WorkerPiece {
    roll(): void {
      let index = Math.floor(this.game.random() * 6);
      const values = Object.values(Color);
      this.color = values[index];
    }
}
  
export class CandlePawn extends WorkerPiece {
  
}
  
export class KeyShape extends WorkerPiece {
  
}

export class Wax extends Piece<MyGame> {
  
}

export class PowerTile extends Piece<MyGame> {
  flipped: boolean = true;
}

export class MasteryCube extends Piece<MyGame> {
    color: Color
}

export class ScoreTracker extends Piece<MyGame> {
    color: Color
    flipped: Boolean = false;
}
  
  export class Pigment extends Piece<MyGame> {
    color: Color = Color.Red;
  }
  
  export class Melt extends Piece<MyGame> {
    color: Color = Color.White
  
    mix(color: Color): void {
      switch(this.color) {
        case Color.White: {
          this.color = color;
          break;
        }
        case Color.Red: {
          switch(color) {
            case Color.Blue: {
              this.color = Color.Purple;
              break;
            }
            case Color.Yellow: {
              this.color = Color.Orange;
              break;
            }
          }
          break;
        }
        case Color.Yellow: {
          switch(color) {
            case Color.Blue: {
              this.color = Color.Green;
              break;
            }
            case Color.Red: {
              this.color = Color.Orange;
              break;
            }
          }
          break;
        }
        case Color.Blue: {
          switch(color) {
            case Color.Yellow: {
              this.color = Color.Green;
              break;
            }
            case Color.Red: {
              this.color = Color.Purple;
              break;
            }
          }
          break;
        }
        case Color.Green: {
          if(color == Color.Red) {
            this.color = Color.Black;
          }
          break;
        }
        case Color.Orange: {
          if(color == Color.Blue) {
            this.color = Color.Black;
          }
          break;
        }
        case Color.Purple: {
          if(color == Color.Yellow) {
            this.color = Color.Black;
          }
          break;
        }
      }
    }
  }
