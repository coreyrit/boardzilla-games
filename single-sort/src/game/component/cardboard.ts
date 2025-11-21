import {
  Space
} from '@boardzilla/core';

import { Component } from "./component.js";
import { MyGame } from "../index.js";


export class Cardboard extends Component {

  public faceUp: boolean;
  public face: number;
  public clean: boolean;
  public textColor: string;

  override toString(): string {
      return (this.clean ? "clean" : "dirty") + " " + this.colorText()  + " " + this.face + " cardboard";
  }

  public flip(): void {
    this.faceUp = !this.faceUp;
  }

  public toss(game: MyGame): void {
    this.faceUp = (Math.floor(game.random() * 2) + 1) % 2 == 0;
  }

  public static createGreenCleanCardboard(box: Space<MyGame>, value: number): Cardboard {
    const cb = box.create(Cardboard, 'greenCleanCB', {
      face: value,
      clean: true,
      color: "darkgreen",
      textColor: "white"
    });
    cb.toss(box.game);
    return cb;
  }

  public static createBlueCleanCardboard(box: Space<MyGame>, value: number): Cardboard {
    const cb = box.create(Cardboard, 'blueCleanCB', {
      face: value,
      clean: true,
      color: "blue",
      textColor: "white"
    });
    cb.toss(box.game);
    return cb;
  }

  public static createYellowCleanCardboard(box: Space<MyGame>, value: number): Cardboard {
    const cb = box.create(Cardboard, 'yellowCleanCB', {
      face: value,
      clean: true,
      color: "yellow",
      textColor: "black"
    });
    cb.toss(box.game);
    return cb;
  }

  public static createGreenDirtyCardboard(box: Space<MyGame>, value: number): Cardboard {
    const cb = box.create(Cardboard, 'greenDirtyCB', {
      face: value,
      clean: false,
      color: "darkgreen",
      textColor: "white"
    });
    cb.toss(box.game);
    return cb;
  }

  public static createBlueDirtyCardboard(box: Space<MyGame>, value: number): Cardboard {
    const cb = box.create(Cardboard, 'blueDirtyCB', {
      face: value,
      clean: false,
      color: "blue",
      textColor: "white"
    });
    cb.toss(box.game);
    return cb;
  }

  public static createYellowDirtyCardboard(box: Space<MyGame>, value: number): Cardboard {
    const cb = box.create(Cardboard, 'yellowDirtyCB', {
      face: value,
      clean: false,
      color: "yellow",
      textColor: "white"
    });
    cb.toss(box.game);
    return cb;
  }
}
