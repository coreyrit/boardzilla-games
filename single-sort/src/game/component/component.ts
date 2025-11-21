import {
  Piece
} from '@boardzilla/core';
import { MyGame } from "../index.js";

export class Component extends Piece<MyGame> {
  public color: string;
  public highlight: boolean = false;

  public static getColorText(color: string): string {
    switch (color) {
      case "darkgreen":
        return "green";
      case "blue":
        return "blue";
      case "yellow":
        return "yellow";
      case "#B8860B":
        return "gold";
      case "#C0C0C0":
        return "silver";
      case "#8B4513":
        return "bronze";
      default:
        return "???";
    }
  }
  public colorText() : string {
    return Component.getColorText(this.color);
  }
}