import { Piece, Space } from "@boardzilla/core";
import { Building, Color, MyGame } from "./index.js";

export class WorkerSpace extends Space<MyGame> {
    building: Building
    color: Color | undefined
}
  
export class ComponentSpace extends Space<MyGame> {
  
}
  
export class DiceSpace extends Space<MyGame> {
  
}
  
export class ReadySpace extends Space<MyGame> {
  
}
  
export class CustomerSpace extends Space<MyGame> {
  
}
  
export class Candelabra extends Space<MyGame> {
 
}
  
export class KeyHook extends Space<MyGame> {
    color: Color;
}
  
export class Spill extends Space<MyGame> {
  
}
  
export class GameEndSpace extends Space<MyGame> {
  
}
  
export class RoundEndSpace extends Space<MyGame> {
  
}
  
export class BackAlleySpace extends Space<MyGame> {
  
}
  
export class PlayerSpace extends Space<MyGame> {
 
}
  
export class ChandlersBoard extends Space<MyGame> {
  
}
  
export class PlayerBoard extends Space<MyGame> {
  
}

export class PowerSpace extends Space<MyGame> {

}
    
export class MasteryTrack extends Space<MyGame> {
  
}

export class MasterySpace extends Space<MyGame> {
  index: number = 0;
}

export class ScoringTrack extends Space<MyGame> {

}

export class ScoringSpace extends Space<MyGame> {
    score: number = 0;
    override toString(): string {
        return this.score.toString()
    }
}
