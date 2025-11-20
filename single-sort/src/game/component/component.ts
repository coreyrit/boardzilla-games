import {
  Piece
} from '@boardzilla/core';
import { MyGame } from "../index.js";

export class Component extends Piece<MyGame> {
  public color: string;
  public highlight: boolean = false;
}