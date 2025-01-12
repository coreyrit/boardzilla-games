import { Piece, Player } from "@boardzilla/core";
import { Color, MyGame } from "./index.js";
import { WorkerPiece, CandlePawn, ColorDie, KeyShape, Wax, Pigment, MasteryCube, Melt, ScoreTracker } from "./components.js";
import { Candelabra, ComponentSpace, DiceSpace, KeyHook, MasterySpace, PlayerBoard, PlayerSpace, ScoringSpace, ScoringTrack } from "./boards.js";

export class ChandlersPlayer extends Player<MyGame, ChandlersPlayer> {
    space: PlayerSpace
    board: PlayerBoard
    pass: Boolean = false;
    stack: Boolean = false;
    placedWorker: Boolean = false;
    playerColor: Color
  
    componentCount() : number {
      const c =  this.board.all(ComponentSpace)
        .map(x => x.all(Piece).length == 0 ? 0 : 1)
        .reduce((sum, current) => sum + current, 0);
      return c;
    }

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
      const cube = this.board.first(MasteryCube, {color: this.playerColor})!
      return cube.container(MasterySpace)!.index;
    }

    setMastery(index: number): void {
      const cube = this.board.first(MasteryCube, {color: this.playerColor})!
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

    masteryScore(): number {
      switch(this.currentMastery()) {
        case 0: { return 0; }
        case 1: { return 1; }
        case 2: { return 2; }
        case 3: { return 3; }
        case 4: { return 4; }
        case 5: { return 5; }
        case 6: { return 6; }
        case 7: { return 6; }
        case 8: { return 7; }
        case 9: { return 7; }
        case 10: { return 8; }
        case 11: { return 8; }
        case 12: { return 9; }
        case 13: { return 9; }
        case 14: { return 9; }
        case 15: { return 10; }
      }
      return 0;
    }

    increaseMastery(value: number = 1): void {
      if(this.currentMastery()+value > 15) {
        this.setMastery(15);
        this.increaseScore(1);
      } else {
        this.setMastery(this.currentMastery()+value);
      }
    }

    currentScore(): number {
        const tracker = this.game.first(ScoreTracker, {color: this.playerColor})!
        return tracker.flipped ? tracker.container(ScoringSpace)!.score + 100 : tracker.container(ScoringSpace)!.score;
    }

    setScore(score: number): void {
        const tracker = this.game.first(ScoreTracker, {color: this.playerColor})!
        tracker.putInto(this.game.first(ScoringSpace, {score: score})!)
    }

    increaseScore(value: number = 1): void {
        this.setScore(this.currentScore()+value);
    }
  }