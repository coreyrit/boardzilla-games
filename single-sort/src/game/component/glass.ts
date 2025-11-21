import {
  Space
} from '@boardzilla/core';

import { MyGame } from "../index.js";
import { Component } from "./component.js";

export class Glass extends Component {

  override toString(): string {
      return this.colorText() + " glass";
  }

  public static createGreenGlass(box: Space<MyGame>): Glass {
    return box.create(Glass, "greenGlass", {color: "darkgreen"});
  }

  public static createBlueGlass(box: Space<MyGame>): Glass {
    return box.create(Glass, "blueGlass", {color: "blue"});
  }

  public static createYellowGlass(box: Space<MyGame>): Glass {
    return box.create(Glass, "yellowGlass", {color: "yellow"});
  }
}