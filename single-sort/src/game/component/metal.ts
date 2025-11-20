import {
  Space
} from '@boardzilla/core';

import { MyGame } from "../index.js";
import { Component, Material } from "./component.js";

export class Metal extends Component {

  public static createGoldMetal(box: Space<MyGame>): Metal {
    return box.create(Metal, "goldMetal", {color: "#B8860B"});
  }

  public static createSilverMetal(box: Space<MyGame>): Metal {
    return box.create(Metal, "silverMetal", {color: "#C0C0C0"});
  }

  public static createBronzeMetal(box: Space<MyGame>): Metal {
    return box.create(Metal, "bronzeMetal", {color: "#8B4513"});
  }

  public getMaterial(): Material {
    return Material.Metal;
  }
}
