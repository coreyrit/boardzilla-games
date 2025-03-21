import { Piece, Player, Space } from "@boardzilla/core";
import { Color, CustomerType, MyGame } from "./index.js";
import { WorkerPiece, CandlePawn, ColorDie, KeyShape, Wax, Pigment, MasteryCube, Melt, ScoreTracker, CustomerCard, GoalCard } from "./components.js";
import { Candelabra, CandleSpace, ComponentSpace, DiceSpace, KeyHook, MasterySpace, PlayerBoard, PlayerSpace, ScoringSpace, ScoringTrack } from "./boards.js";

export class ChandlersPlayer extends Player<MyGame, ChandlersPlayer> {
    space: PlayerSpace
    board: PlayerBoard
    pass: boolean = false;
    stack: boolean = false;
    soldCandle: boolean = false;
    placedWorker: boolean = false;
    finished: boolean = false;
    finalScore: boolean = false;
    playerColor: Color
  
    customerCount() : number {
      return this.space.all(CustomerCard).filter(x => x.customerType != CustomerType.None).length;
    }

    goalCount() : number {
      return this.space.all(GoalCard).length;
    }

    componentCount() : number {
      const c =  this.board.all(ComponentSpace)
        .map(x => x.all(Piece).length == 0 ? 0 : 1)
        .reduce((sum, current) => sum + current, 0);
      return c;
    }

    hasSomewhereToPutACandle(candle: CandlePawn) : boolean {
      var found: boolean = false;
      this.space.all(CustomerCard).forEach(x => {
        if(x.all(CandleSpace, {color: candle.color}).filter(y => y.all(CandlePawn).length == 0).length > 0) {
          console.log('found a spot for ' + candle.color)
          found = true;
        } else {
          console.log('no spot for ' + candle.color)
        }
      })
      return found;
    }

    nextEmptySpace() : ComponentSpace {
      const spaces = this.board.all(ComponentSpace).filter(x => x.all(Piece).length == 0);
      return spaces.first(ComponentSpace)!
    }

    nextEmptyDieSpace() : Space<MyGame> {
      const spaces = this.board.all(DiceSpace).filter(x => x.all(Piece).length == 0);
      if(spaces.length > 0) {
        return spaces.first(DiceSpace)!
      } else {
        return this.nextEmptySpace();
      }
    }
  
    gainWax(count: number = 1) : void {  
      for(var i = 0; i < count; i++) {
        $.bag.first(Wax)?.putInto(this.nextEmptySpace());
      }
    }
  
    gainShape(color: Color) : void {
      this.game.first(KeyHook, {color: color})!.first(KeyShape)?.putInto(this.nextEmptySpace());
    }
  
    gainCandle(melt: Melt, backToBag: boolean = true, count: number = 2) : void {
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
  
    meltWaxSpill(wax: Wax[]) : {meltCount: number, pointCount: number} {
      var melts = 0;
      var points = 0;
      for(var i = 0; i < wax.length; i += 2) {
        if(i+1 < wax.length) {
          wax[i].putInto($.bag);

          if($.waxSpillArea.all(Wax).length < 8) {
            wax[i+1].putInto($.waxSpillArea);
            this.game.currentPlayer().increaseScore();
            points++;          
          } else {
            wax[i+1].putInto($.bag);
          }

          $.bag.first(Melt)?.putInto(this.nextEmptySpace());
          melts++
        }
      }
      return {meltCount: melts, pointCount: points};
    }
  
    meltWax(wax: Wax[]) : number {
      var j = 0;
      for(var i = 0; i < wax.length; i ++) {
        wax[i].putInto($.bag);
        $.bag.first(Melt)?.putInto(this.nextEmptySpace());
        j++;
      }
      return j;
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
      const cube = this.board.first(MasteryCube, {index: this.game.players.indexOf(this)})!
      return cube.container(MasterySpace)!.index;
    }

    setMastery(index: number): void {
      const cube = this.board.first(MasteryCube, {index: this.game.players.indexOf(this)})!
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

    decreaseMastery(value: number = 1): void {
      if(this.currentMastery()-value < 1) {
        this.setMastery(0);
      } else {
        this.setMastery(this.currentMastery()-value);
      }
    }

    currentScore(): number {
        const tracker = this.game.first(ScoreTracker, {index: this.game.players.indexOf(this)})!
        return tracker.flipped ? tracker.container(ScoringSpace)!.score + 100 : tracker.container(ScoringSpace)!.score;
    }

    setScore(score: number): void {
        const tracker = this.game.first(ScoreTracker, {index: this.game.players.indexOf(this)})!
        
        if(score >= 100) {
          tracker.flipped = true;
          tracker.putInto(this.game.first(ScoringSpace, {score: score-100})!)
        } else {
          tracker.putInto(this.game.first(ScoringSpace, {score: score})!)
        }
    }

    increaseScore(value: number = 1): void {
        this.setScore(this.currentScore()+value);
    }
  }