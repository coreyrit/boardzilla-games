import {
  Space
} from '@boardzilla/core';
import { MyGame, SingleSortPlayer } from "./index.js";

export class Hand extends Space<MyGame> {
  player: SingleSortPlayer;
}