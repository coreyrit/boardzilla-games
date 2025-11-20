import {
  Space
} from '@boardzilla/core';

import { Material, Component } from "./component.js";
import { MyGame } from "../index.js";


export class Cardboard extends Component {

  private faceUp: boolean;
  public face: number;
  public clean: boolean;
  public textColor: string;

  public flip(): void {
    this.faceUp = !this.faceUp;
  }

  public static createGreenCleanCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'greenCleanCB', {
      face: value,
      clean: true,
      color: "darkgreen",
      textColor: "white"
    });
  }

  public static createBlueCleanCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'blueCleanCB', {
      face: value,
      clean: true,
      color: "blue",
      textColor: "white"
    });
  }

  public static createYellowCleanCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'yellowCleanCB', {
      face: value,
      clean: true,
      color: "yellow",
      textColor: "black"
    });
  }

  public static createGreenDirtyCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'greenDirtyCB', {
      face: value,
      clean: false,
      color: "darkgreen",
      textColor: "white"
    });
  }

  public static createBlueDirtyCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'blueDirtyCB', {
      face: value,
      clean: false,
      color: "blue",
      textColor: "white"
    });
  }

  public static createYellowDirtyCardboard(box: Space<MyGame>, value: number): Cardboard {
    return box.create(Cardboard, 'yellowDirtyCB', {
      face: value,
      clean: false,
      color: "yellow",
      textColor: "white"
    });
  }

  public getMaterial(): Material {
    return Material.Cardboard;
  }
}
