import { Piece, Player } from "@boardzilla/core";
import { Candelabra, Color, ComponentSpace, KeyHook, MyGame, PlayerBoard } from "./index.js";
import { WorkerPiece, CandlePawn, ColorDie, KeyShape, Wax, Pigment, MasteryCube, Melt } from "./components.js";

export class ChandlersPlayer extends Player<MyGame, ChandlersPlayer> {
    board: PlayerBoard
    stack: Boolean = false;
  
    nextEmptySpace() : ComponentSpace {
      const spaces = this.board.all(ComponentSpace).filter(x => x.all(Piece).length == 0);
      return spaces.first(ComponentSpace)!
    }
  
    gainWax(count: number = 1) : void {  
      for(var i = 0; i < count; i++) {
        $.bag.first(Wax)?.putInto(this.nextEmptySpace());
      }
    }
  
    gainShape(color: Color) : void {
      this.game.first(KeyHook, {color: color})!.first(KeyShape)?.putInto(this.nextEmptySpace());
    }
  
    gainCandle(melt: Melt, backToBag: Boolean = true, count: number = 2) : void {
      if(backToBag) {
        melt.putInto($.bag)
      }
      for(var i = 0; i < count; i++) {
        const candles = this.game.all(Candelabra);
        const candle = candles.first(CandlePawn, {color: melt.color})!;
        candle.putInto(this.nextEmptySpace());
      }
      if(backToBag) {
        melt.color = Color.White
      }
    }
  
    meltWaxSpill(wax: Wax[]) : void {
      for(var i = 0; i < wax.length; i += 2) {
        if(i+1 < wax.length) {
          wax[i].putInto($.bag);
          wax[i+1].putInto($.waxSpillArea); // make sure to earn points
          $.bag.first(Melt)?.putInto(this.nextEmptySpace());
        }
      }
    }
  
    meltWax(wax: Wax[]) : void {
      for(var i = 0; i < wax.length; i ++) {
        wax[i].putInto($.bag);
        $.bag.first(Melt)?.putInto(this.nextEmptySpace());
      }
    }
  
    workerCount(): number {
      return this.board.all(WorkerPiece).length
    }
  
    diceCount(): number {
      return this.board.all(ColorDie).length
    }
  
    workerColors(): Color[] {
      return this.board.all(ColorDie).map(x => x.color);
    }
  
    masteryLevel(): number {
      const cube = this.board.first(MasteryCube, {color: Color.Green})!
      const allSpaces = this.board.all(MasteryCube);
      const index = allSpaces.indexOf(cube);
      if(index >= 13) {
        return 3;
      } else if(index >= 6) {
        return 2;
      } else {
        return 1;
      }
    }
  }