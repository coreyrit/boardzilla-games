import {
  Space
} from '@boardzilla/core';

import { MyGame } from "../index.js";
import { Component } from "./component.js";


export class Plastic extends Component {

  public face: number;
  public textColor: string;

  public roll(game: MyGame): void {
    this.face = Math.floor(game.random() * 6) + 1
  }

  public static createGreenPlastic(box: Space<MyGame>): Plastic {
    const p = box.create(Plastic, "greenPlastic", {color: "darkgreen", textColor: "white"});
    p.roll(box.game);
    return p;
  }

  public static createBluePlastic(box: Space<MyGame>): Plastic {
    const p = box.create(Plastic, "bluePlastic", {color: "blue", textColor: "white"});
    p.roll(box.game);
    return p;
  }

  public static createYellowPlastic(box: Space<MyGame>): Plastic {
    const p = box.create(Plastic, "yellowPlastic", {color: "yellow", textColor: "black"});
    p.roll(box.game);
    return p;
  }
}