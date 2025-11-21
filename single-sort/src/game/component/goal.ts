import {
  Piece
} from '@boardzilla/core';

import { MyGame } from "../index.js";

export class Goal extends Piece<MyGame>{
  public targetColor: string;
  public targetNumbers: number[];
}
