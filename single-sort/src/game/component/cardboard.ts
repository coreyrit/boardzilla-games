import {
  Space
} from '@boardzilla/core';

import { Material, Component } from "./component.js";
import { MyGame } from "../index.js";

  export class CardboardFace {
        public clean: boolean;
        public value: number;
        public text: string;

    constructor(
      clean: boolean,
      value: number,
      text: string
    ) {
        this.clean = clean;
        this.value = value;
        this.text = text;
    }

    static fromTypeAndValue(clean: boolean, value: number): CardboardFace {
            if(clean) {
                switch(value) {
                    case 1:
                        return Cardboard.CleanOne;
                    case 2:
                        return Cardboard.CleanTwo;
                    case 3:
                        return Cardboard.CleanThree;
                    case 4:
                        return Cardboard.CleanFour;
                    case 5:
                        return Cardboard.CleanFive;
                    case 6:
                        return Cardboard.CleanSix;
                    case 7:
                        return Cardboard.CleanSeven;
                }
            } else {
                switch(value) {
                    case 1:
                        return Cardboard.DirtyOne;
                    case 2:
                        return Cardboard.DirtyTwo;
                    case 3:
                        return Cardboard.DirtyThree;
                    case 4:
                        return Cardboard.DirtyFour;
                    case 5:
                        return Cardboard.DirtyFive;
                    case 6:
                        return Cardboard.DirtySix;
                }
            }
            // throw new RuntimeException("Invalid value for " + (clean ? "clean" : "dirty") + " cardboard: " + value);

            throw Error("Invalid value for " + (clean ? "clean" : "dirty") + " cardboard: " + value);

        }
}

export class Cardboard extends Component {
    static CleanOne = new CardboardFace(true, 1, "\u2673");
    static CleanTwo = new CardboardFace(true, 2, "\u2674");
    static CleanThree = new CardboardFace(true, 3, "\u2675");
    static CleanFour = new CardboardFace(true, 4, "\u2676");
    static CleanFive = new CardboardFace(true, 5, "\u2677");
    static CleanSix = new CardboardFace(true, 6, "\u2678");
    static CleanSeven = new CardboardFace(true, 7, "\u2679");
    static DirtyOne = new CardboardFace(false, 1, "\u278a");
    static DirtyTwo = new CardboardFace(false, 2, "\u278b");
    static DirtyThree = new CardboardFace(false, 3, "\u278c");
    static DirtyFour = new CardboardFace(false, 4, "\u278d");
    static DirtyFive = new CardboardFace(false, 5, "\u278e");
    static DirtySix = new CardboardFace(false, 6, "\u278f");

  private faceUp: boolean;
  public face: CardboardFace;
  public textColor: string;

  public flip(): void {
    this.faceUp = true;
  }

  public static createGreenCleanCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'greenCleanCB', {
      face: CardboardFace.fromTypeAndValue(true, value),
      color: "darkgreen",
      textColor: "white"
    });
  }

  public static createBlueCleanCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'blueCleanCB', {
      face: CardboardFace.fromTypeAndValue(true, value),
      color: "blue",
      textColor: "white"
    });
  }

  public static createYellowCleanCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'yellowCleanCB', {
      face: CardboardFace.fromTypeAndValue(true, value),
      color: "yellow",
      textColor: "black"
    });
  }

  public static createGreenDirtyCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'greenDirtyCB', {
      face: CardboardFace.fromTypeAndValue(false, value),
      color: "darkgreen",
      textColor: "white"
    });
  }

  public static createBlueDirtyCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'blueDirtyCB', {
      face: CardboardFace.fromTypeAndValue(false, value),
      color: "blue",
      textColor: "white"
    });
  }

  public static createYellowDirtyCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'yellowDirtyCB', {
      face: CardboardFace.fromTypeAndValue(false, value),
      color: "yellow",
      textColor: "white"
    });
  }

//   public draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
//     ctx.fillStyle = this.faceUp ? this.color : "darkorange";
//     ctx.beginPath();
//     ctx.moveTo(x + 10, y + 90);
//     ctx.lineTo(x + 50, y + 10);
//     ctx.lineTo(x + 90, y + 90);
//     ctx.closePath();
//     ctx.fill();

//     this.setStroke(ctx);
//     ctx.stroke();

//     if (this.faceUp) {
//       ctx.font = "48px Arial";
//       ctx.fillStyle = this.textColor;
//       ctx.fillText(this.face.text, x + (this.face.clean ? 25 : 30), y + 80);
//     }
//   }

  public getMaterial(): Material {
    return Material.Cardboard;
  }
}
