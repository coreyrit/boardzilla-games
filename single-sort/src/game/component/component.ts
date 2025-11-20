import {
  Piece
} from '@boardzilla/core';
import { MyGame } from "../index.js";

export enum Material {
    None,
    Cardboard,
    Plastic,
    Glass,
    Metal,
}

export abstract class Component extends Piece<MyGame> {
  public color: string;
  public highlight: boolean = false;

  public abstract getMaterial(): Material;
}