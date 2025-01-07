import { Piece, Player } from "@boardzilla/core";
import { Color, MyGame } from "./index.js";
import { WorkerPiece, CandlePawn, ColorDie, KeyShape, Wax, Pigment, MasteryCube, Melt, ScoreTracker } from "./components.js";
import { Candelabra, ComponentSpace, DiceSpace, KeyHook, MasterySpace, PlayerBoard, ScoringSpace, ScoringTrack } from "./boards.js";

export class ChandlersPlayer extends Player<MyGame, ChandlersPlayer> {
    board: PlayerBoard
    stack: Boolean = false;
  
    nextEmptySpace() : ComponentSpace {
      const spaces = this.board.all(ComponentSpace).filter(x => x.all(Piece).length == 0);
      return spaces.first(ComponentSpace)!
    }

    nextEmptyDieSpace() : DiceSpace {
      const spaces = this.board.all(DiceSpace).filter(x => x.all(Piece).length == 0);
      return spaces.first(DiceSpace)!
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
          wax[i+1].putInto($.waxSpillArea);
          this.game.currentPlayer().increaseScore();
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
  
    currentMastery(): number {
      const cube = this.board.first(MasteryCube, {color: Color.Green})!
      return cube.container(MasterySpace)!.index;
    }

    setMastery(index: number): void {
      const cube = this.board.first(MasteryCube, {color: Color.Green})!
      cube.putInto(this.board.first(MasterySpace, {index: index})!);
    }

    masteryLevel(): number {
      const index = this.currentMastery();
      if(index >= 13) {
        return 3;
      } else if(index >= 6) {
        return 2;
      } else {
        return 1;
      }
    }

    increaseMastery(value: number = 1): void {
      this.setMastery(this.currentMastery()+value);
  }

    currentScore(): number {
        const tracker = this.game.first(ScoreTracker, {color: Color.Green})!
        return tracker.flipped ? tracker.container(ScoringSpace)!.score + 100 : tracker.container(ScoringSpace)!.score;
    }

    setScore(score: number): void {
        const tracker = this.game.first(ScoreTracker, {color: Color.Green})!
        tracker.putInto(this.game.first(ScoringSpace, {score: score})!)
    }

    increaseScore(value: number = 1): void {
        this.setScore(this.currentScore()+value);
    }
  }