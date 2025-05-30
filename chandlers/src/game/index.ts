import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
  Do,
} from '@boardzilla/core';
import { read } from 'fs';
import { constants } from 'os';
import { isNativeError } from 'util/types';
import { WaxBuilding } from './building/wax.js';
import { PigmentBuilding } from './building/pigment.js';
import { MoldBuilding } from './building/mold.js';
import { ChandlersPlayer } from './player.js';
import { CustomerCard, EndGameTile, RoundEndTile, BackAlleyTile, ColorDie, KeyShape, CandlePawn, PowerTile, Wax, WorkerPiece, Pigment, Melt, MasteryCube, ScoreTracker, Bulb, GoalCard, Lamp, Trash, Check, CaptureTile, PlayerOrderCube } from './components.js';
import { BackAlley, BackAlleySpace, Bag, Candelabra, CandleBottomRow, CandleSpace, CandleTopRow, ChandlersBoard, CheckSpace, ComponentSpace, CustomerCubeSpace, CustomerSpace, DiceSpace, GameEndSpace, GoalSpace, KeyHook, MasterySpace, MasteryTrack, PlayerBoard, PlayerOrderSpace, PlayerSpace, PlayersSpace, PowerSpace, ReadySpace, RoundEndSpace, RoundSpace, ScoringSpace, ScoringTrack, Spill, WorkerSpace } from './boards.js';
import { count, timeLog } from 'console';
import { disconnect } from 'process';
import { Component } from 'react';

export enum Building {
  Wax = 'wax',
  Pigment = 'pigment',
  Mold = 'mold',
  None = 'none'
}

export enum SpaceType {
  Color = 'color',
  Mastery = 'mastery',
  Backroom = 'backroom',
  Middle = 'middle',
  Spill = 'spill',
  Alley = 'alley'
}

export enum Color {
  Red = 'red',
  Yellow = 'yellow',
  Blue = 'blue',
  Orange = 'orange',
  Green = 'green',
  Purple = 'purple',
  White = 'white',
  Black = 'black'
}

export enum CustomerType {
  None = 'none',
  Prince = 'prince',
  Rogue = 'rogue',
  Priest = 'priest',
  Witch = 'witch',
  Merchant = 'merchant',
  Adventurer = 'adventurer',
  Cartographer = 'cartographer',
  Charlatan = 'charlatan'
}

export class MyGame extends Game<MyGame, ChandlersPlayer> {
  setup: boolean = false;
  gameOver: boolean = false;
  waxCount: number = 1;
  roundEndLoop: number = 0;
  playerTurn: number = 1;

  init(): void {    
  }

  currentRound() : number {
    return this.first(Bulb)!.container(RoundSpace)!.round;
  }

  moveFirstPlayerToken() : void {
    const firstPlayer = this.first(Lamp)!;
    if(firstPlayer.playerIndex < this.players.length-1) {
      firstPlayer.playerIndex = firstPlayer.playerIndex+1;            
    } else {
      firstPlayer.playerIndex = 0;
    }      
    firstPlayer.putInto(this.players[firstPlayer.playerIndex].space);  

    // const lastPlayer = this.first(CaptureTile)!;
    // var lastPlayerIndex = firstPlayer.playerIndex-1;
    // if(lastPlayerIndex < 0) {
    //   lastPlayerIndex = this.players.length-1;
    // }
    // lastPlayer.putInto(this.players[lastPlayerIndex].space);
    // lastPlayer.flipped = true;    
  }

  playersGainIncome() : void {
    // give everyone wax for the next round
    this.game.players.forEach(x => {
      for(var i = 0; i < x.masteryLevel(); i++) {
        $.bag.first(Wax)?.putInto(x.nextEmptySpace());
      }
    })
  }

  moveToFirstPlayer() : void {
    const firstPlayer = this.first(Lamp)!;
    this.players.setCurrent(this.players[0]); 
    // move to the next player until you get to the first player token
    for(var i = 0; i < firstPlayer.playerIndex; i++) {
      this.players.next();
    }


    // this.playerTurn = this.players.length == 1 ? 4 : 1;
    // const cube = this.first(PlayerOrderSpace, {num: this.playerTurn})!.first(PlayerOrderCube)!;
    // this.players.setCurrent(this.players[cube.index]);

    this.message('Round ' + this.currentRound() + ' begins.');
  }

  nextPlayerInTurnOrder() : void {
    console.log('all players passed: ' + this.allPlayersPassed());
    for(var i = 0; i < 4; i++) {      
      this.playerTurn = this.playerTurn == 4 ? 1 : this.playerTurn+1;
      console.log('checking: ' + this.playerTurn);

      if(this.first(PlayerOrderSpace, {num: this.playerTurn, pass: false})!.all(Piece).length > 0) {
        console.log('next player turn is: ' + this.playerTurn);
        
        const cube = this.first(PlayerOrderSpace, {num: this.playerTurn})!.first(PlayerOrderCube)!;

        console.log('moving to index: ' + cube.index);

        this.players.setCurrent(this.players[cube.index]);
        return;
      }      
    }
    // if all else fails, return the first player
    console.log("I don't know what I'm doing");
    this.players.next();
  }

  drawTopCustomer() : CustomerCard {
    if($.drawCustomer.all(CustomerCard).length == 0) {
      $.bag.all(CustomerCard).putInto($.drawCustomer);
      $.drawCustomer.all(CustomerCard).forEach(x => {
        x.flipped = false;
      })
      $.drawCustomer.shuffle();
    }
    return $.drawCustomer.top(CustomerCard)!
  }

  deckSize() : string {
    return $.drawCustomer.all(CustomerCard).length.toString();
  }

  drawTopGoal() : GoalCard {
    if($.goalDeck.all(GoalCard).length == 0) {
      $.bag.all(GoalCard).putInto($.goalDeck);
      $.goalDeck.shuffle();
    }
    return $.goalDeck.top(GoalCard)!
  }

  setupPlayer(turn: ChandlersPlayer) : void {    
    if($.drawCustomer.all(CustomerCard).length > 0) {
      this.initPlayer(turn);
      this.drawTopCustomer().putInto(turn.space);
      const goal1 = this.drawTopGoal()
      goal1.putInto(turn.space);
      goal1.showOnlyTo(turn);
    }
  }

  resetTurn() : void {
    this.currentPlayer().soldCandle = false
    this.currentPlayer().finished = false
    this.currentPlayer().placedWorker = false
  }

  endTurn() : void {
    if(!this.currentPlayer().placedWorker && !this.currentPlayer().pass) {
      // const cube = this.first(PlayerOrderCube, {index: this.players.indexOf(this.currentPlayer())})!;
      // cube.putInto(this.nextAvailablePlayerOrderPass());
      this.message(this.currentPlayer().name + ' passes.');

      this.currentPlayer().pass = true;
      this.currentPlayer().placedWorker = true;
    }    
    this.currentPlayer().finished = true;
  }

  relocateDice() : void {
    if(this.currentPlayer().board.all(DiceSpace).filter(x => x.all(ColorDie).length == 0).length > 0) {
      this.currentPlayer().board.all(ColorDie).filter(x => x.container(ComponentSpace) != null).forEach(x => {
        x.putInto(this.currentPlayer().nextEmptyDieSpace());
      });
    }
  }

  collectComponents() : void {
    this.currentPlayer().board.all(ComponentSpace).filter(x => x.num > 8).forEach(y => {
      if(y.all(Piece).length > 0) {
        y.first(Piece)!.putInto(this.currentPlayer().nextEmptySpace());
      }
    });  
  }

  scoreNextRoundEndTile(player: ChandlersPlayer, tile: RoundEndTile) : boolean {
    if(tile.achieved(player)) {
      console.log(player.name + ' achieved round end goal: ' + tile.name + ' and scores 5 points.')
      this.message(player.name + ' achieved round end goal: ' + tile.name + ' and scores 5 points.')
      player.increaseScore(5);
      tile.scored = true;
      return true;
    } else {
      return false;
    }
  }

  scoreNextCustomer(player: ChandlersPlayer) : boolean {    
    // score the next customer
    const card = player.space.all(CustomerCard).filter(x => x.customerType != CustomerType.None && !x.scoredCandles).first(CustomerCard)!;
    const candleCount = card.all(CandlePawn).length;
    const candleScore = candleCount > 0 ? card.scoring[candleCount-1] : 0;
    this.message(player.name + ' scored ' + candleScore + ' points for candles on ' + card.name);
    player.increaseScore(candleScore);
    card.scoredCandles = true;
    return player.space.all(CustomerCard).filter(x => x.customerType != CustomerType.None && !x.scoredCandles).length > 0;
  }

  scoreForMastery(player: ChandlersPlayer) : void {
    // score for mastery
    this.message(player.name + ' scored ' + player.masteryScore() + ' points for mastery');
    player.increaseScore(player.masteryScore());
  }

  scoreForPlayerOrder(player: ChandlersPlayer) : void {
    // score for player order
    const index = this.players.indexOf(player);
    const cube = this.first(PlayerOrderCube, {index: index});
    const space = cube?.container(PlayerOrderSpace)!;
    
    var points = 0;
    switch(space.num) {
      case 1: {
        points = 3;
        break;
      }
      case 2: {
        points = 2;
        break;
      }
      case 3: {
        points = 1;
        break;
      }
    }
    this.message(player.name + ' scored ' + points + ' points for player order');
    player.increaseScore(points);
  }

  scoreNextGoal(player: ChandlersPlayer) : boolean {
    // score for next personal goal
    const goal = player.space.first(GoalCard, {scored: false})!;
    if (
      (goal.color1 == goal.color2 &&
      player.space.all(CustomerCard, {color: goal.color1, scoredGoal: false}).filter(x => x.all(CandlePawn).length > 0).length >= 2)
      ||
      (player.space.all(CustomerCard, {color: goal.color1, scoredGoal: false}).filter(x => x.all(CandlePawn).length > 0).length > 0 && 
      player.space.all(CustomerCard, {color: goal.color2, scoredGoal: false}).filter(x => x.all(CandlePawn).length > 0).length > 0)
    ) {
      const goal1 = player.space.first(CustomerCard, {color: goal.color1, scoredGoal: false});
      if(goal1 != undefined) {
        goal1.scoredGoal = true;
      }

      const goal2 = player.space.first(CustomerCard, {color: goal.color2, scoredGoal: false});                  
      if(goal2 != undefined) {
        goal2.scoredGoal = true;
      }

      this.message(player.name + ' scored 3 points for goal ' + goal.name);
      player.increaseScore(3);
    } else {
      this.message(player.name + ' scored 0 points for goal ' + goal.name);
    }
    goal.scored = true;
    return player.space.all(GoalCard).filter(x => !x.scored).length > 0;
  }

  scoreEndGameTile(player: ChandlersPlayer, score: number) : boolean {
    const tile = this.first(GameEndSpace, {score: score})!;
    if(tile.all(EndGameTile).length > 0) {
      const type = tile.first(EndGameTile)!
      var score = player.space.all(CustomerCard, {customerType: type.type})
        .filter(x => x.all(CandlePawn).length > 0).length * tile.score;
      if(score == undefined) {
        score = 0;
      }
      player.increaseScore(score);
      this.message(player.name + ' scored ' + score + ' points for type ' + type);
      return true;
    }
    return false;
  }

  announceWinner() : void {
    var winners: ChandlersPlayer[] = []
    var highScore: number = 0;

    this.players.forEach(x => {
      if(x.currentScore() > highScore) {
        winners = [x];
        highScore = x.currentScore();
      } else if(x.currentScore() == highScore) {
        winners.push(x);
      }
    });
    this.finish(winners);
  }

  // calculatePlayerFinalScore(player: ChandlersPlayer) : void {
  //   while(this.scoreNextCustomer(player)) {}
  //   this.scoreForMastery(player);
  //   while(this.scoreNextGoal(player)) {}
  //   this.scoreEndGameTile(player, 5);
  //   this.scoreEndGameTile(player, 3);
  //   this.scoreEndGameTile(player, 2);
  // }
  
  resetDice() : void {
    this.all(ColorDie).putInto($.bag);
    this.setup = true;
    for(var i = 0; i < 4-this.players.length; i++) {
      [Building.Wax, Building.Pigment, Building.Mold].forEach((building: Building) =>{
        const die = $.bag.first(ColorDie)!;
        die.roll()
        if(i == 2) {
          // for solo randomly put one in mastery or backroom
          if(Math.floor(this.random() * 2) % 2 == 0) {
            die.putInto(this.first(WorkerSpace, { building: building, spaceType: SpaceType.Mastery })!)
          } else {
            die.putInto(this.first(WorkerSpace, { building: building, spaceType: SpaceType.Backroom })!)
          }
        } else {
          die.putInto(this.first(WorkerSpace, { building: building, color: die.color })!)
        }
      });          
    }
    this.setup = false;
  }

  endRound() : void  {
    this.message('Round ' + this.currentRound() + ' ends.');    

    if(this.currentRound() < 3) {

      // reset players
      for(const player of this.players) { player.pass = false; }

      // reset space colors
      this.all(WorkerSpace).filter(x => x.spaceType != SpaceType.Color).forEach(x => x.color = undefined);

      // discard used candles
      this.all(WorkerSpace).all(CandlePawn).putInto($.bag);

      // return shapes
      this.all(KeyShape).forEach(x => x.putInto(this.first(KeyHook,{color: x.color})!));

      // reset the customers
      [$.customer1, $.customer2, $.customer3, $.customer4].forEach(customer => {
        customer.first(CustomerCard)?.putInto($.bag);
        this.drawTopCustomer().putInto(customer);
      });

      // set starting dice
      this.resetDice();

      // start with new dice
      for(const player of this.players) {
        const die1 = $.bag.first(ColorDie); die1?.roll(); die1?.putInto(player.nextEmptyDieSpace());
        const die2 = $.bag.first(ColorDie); die2?.roll(); die2?.putInto(player.nextEmptyDieSpace());
        const die3 = $.bag.first(ColorDie); die3?.roll(); die3?.putInto(player.nextEmptyDieSpace());
        // if(this.currentRound() == 2 && this.game.players.length < 4) {
        //   const die4 = $.bag.first(ColorDie); die4?.roll(); die4?.putInto(player.nextEmptyDieSpace());
        // }
      }

      

      // move the first player token
      this.moveFirstPlayerToken();
      
      // move player order cubes up
      // this.movePlayerOrderUp();

      // give each player some wax
      // this.playersGainIncome();
    
      // move the round tracker
      this.nextRound();

    } else if(this.currentRound() == 3) {
      this.gameOver = true;

      // this.followUp({name: 'showScore'});
      // this.followUp({name: 'playNewGame'});
      
    } else {
      // say gg and do final scoring
      this.followUp({name: 'goodGame'});
    }    
  }

  movePlayerOrderUp() : void {
    this.all(PlayerOrderSpace, {pass: true}).all(PlayerOrderCube).forEach(x => {
      x.putInto(this.nextAvailablePlayerOrder());
    });
  }

  nextRound() : void {
    this.first(Bulb)!.putInto(this.first(RoundSpace, {round: this.currentRound()+1})!);
    this.all(CustomerCubeSpace).forEach(x => {x.used = false});
  }

  // checkRoundEndGoals() : void {
  //   this.all(RoundEndSpace).all(RoundEndTile).forEach(x => {
  //     if(x.flipped) {
  //       for(const player of this.players) {
  //         if(x.achieved(player)) {
  //           console.log(player.name + ' achieved round end goal: ' + x.name + ' and scores 5 points.')
  //           this.message(player.name + ' achieved round end goal: ' + x.name + ' and scores 5 points.')
  //           player.increaseScore(5);
  //           x.flipped = false;
  //         }
  //       }
  //     }
  //   })
  // }

  allPlayersPassed() : boolean {
    for (const player of this.players) {
      if(!player.pass) {
        return false;
      }
    }
    return true;

    // return this.game.all(PlayerOrderSpace, {pass: false}).filter(x => x.all(Piece).length > 0).length == 0;
  }

  capitalize(color: Color) : string {
    return color.toString().charAt(0).toUpperCase() + color.toString().substring(1)
  }

  currentPlayer() : ChandlersPlayer {
    const pl = this.players.current() as ChandlersPlayer;
    return pl;
  }

  middleAvailable(left: WorkerSpace, right: WorkerSpace, middle: WorkerSpace) : boolean {
    if(left.all(WorkerPiece).length == 0 || right.all(WorkerPiece).length == 0) {
      return false;
    }
    const readyWorker = $.ready.first(WorkerPiece);
    if(readyWorker == undefined) {
      return false;
    }
    return readyWorker.color != left.color && readyWorker.color != right.color;
  }

  performMastery(building: Building, space: WorkerSpace | undefined = undefined) : void {
    if(!this.setup) {
      switch(building) {
        case Building.Wax: {
          this.currentPlayer().increaseMastery(1);
          this.followUp({name: 'chooseWaxRepeater'});
          break;
       }
        case Building.Pigment: {          
          $.pigmentMasteryArea.all(Pigment).showToAll();
          this.followUp({name: 'choosePigmentColor', args: {remaining: this.currentPlayer().masteryLevel()}}); 
          // for(var i = 1; i < this.currentPlayer().masteryLevel(); i++) {
          //   this.first(CheckSpace, {building: Building.Pigment, type: SpaceType.Mastery})!.top(Check)!.flipped = true;
          //   this.followUp({name: 'choosePigmentColor', args: {firstChoice: false}});    
          // }
          break;
        }
        case Building. Mold: {
          this.followUp({name: 'chooseMelt', args: {count:this.currentPlayer().masteryLevel()}});    
          break;
        }
      }
    }
  }

  performBackroom(building: Building, space: WorkerSpace | undefined = undefined) : void {
    if(!this.setup) {
      switch(building) {
        case Building.Wax: {
          if(this.currentPlayer().currentMastery() > 0) {
            this.followUp({name: 'chooseCustomer'});
          } else {
            this.followUp({name: 'chooseCustomerFinish'});
          }
          // $.waxBackAlleySpaceA.first(BackAlleyTile)!.performAction(this);
          break;
        }
        case Building.Pigment: {
          this.currentPlayer().board.all(PowerTile).forEach(x => {x.flipped = true});
          // $.pigmentBackAlleySpaceA.first(BackAlleyTile)!.performAction(this);
          // $.pigmentBackAlleySpaceB.first(BackAlleyTile)!.performAction(this);
          break;
        }
        case Building. Mold: {
          this.followUp({name: 'chooseCandlesToTrade'});    
          // $.moldBackAlleySpaceB.first(BackAlleyTile)!.performAction(this);
          break;
        }
      }
    }
  }

  placeEndGameTile(tile : EndGameTile) {
    if($.gameEndType1.all(EndGameTile).length == 0) {
      tile.putInto($.gameEndType1);
    } else if($.gameEndType2.all(EndGameTile).length == 0) {
      tile.putInto($.gameEndType2);
    } else if($.gameEndType3.all(EndGameTile).length == 0) {
      tile.putInto($.gameEndType3);
    } else {
      tile.putInto($.bag);
    }
  }

  doCapture(player: ChandlersPlayer, top: WorkerPiece, space: WorkerSpace) : void {
    console.log(top);

    if(top instanceof ColorDie) {
      const die = top as ColorDie;
      die.roll();
      die.putInto(player.nextEmptyDieSpace());

      this.message(player.name + ' captures a die and rolls ' + die.color + '.');
    } else if(top instanceof KeyShape) {
      const key = top as KeyShape;
      key.putInto(player.nextEmptySpace());

      this.message(player.name + ' captures the ' + key + '.');
    }

    // make sure to reset the color
    if(space.all(WorkerPiece).length == 0 && [SpaceType.Backroom, SpaceType.Mastery, SpaceType.Middle].includes(space.spaceType)) {
      space.color = undefined;
    }
  }

  nextAvailablePlayerOrder() : PlayerOrderSpace {
    switch(this.players.length) {
      case 1: {
        return this.all(PlayerOrderSpace, {pass: false})
          .filter(x => x.num == 4)
          .filter(x => x.all(Piece).length == 0).first(PlayerOrderSpace)!;
      }
      case 2: {
        return this.all(PlayerOrderSpace, {pass: false})
          .filter(x => x.num == 1 || x.num == 4)
          .filter(x => x.all(Piece).length == 0).first(PlayerOrderSpace)!;
      }
      case 3: {
        return this.all(PlayerOrderSpace, {pass: false})
          .filter(x => x.num == 1 || x.num >= 3)
          .filter(x => x.all(Piece).length == 0).first(PlayerOrderSpace)!;
      }      
    }
    return this.all(PlayerOrderSpace, {pass: false})
          .filter(x => x.all(Piece).length == 0).first(PlayerOrderSpace)!;
  }

  nextAvailablePlayerOrderPass() : PlayerOrderSpace {
    const spaces = this.all(PlayerOrderSpace, {pass: true}).filter(x => x.all(Piece).length == 0);
    return spaces.first(PlayerOrderSpace)!
  }

  initPlayer(player : ChandlersPlayer) : void {
      const componentSpaces = player.board.all(ComponentSpace);
      this.message('component spaces = ' + componentSpaces.length);
      if(componentSpaces.length >= this.waxCount + 1) {
        $.bag.first(Melt)?.putInto(componentSpaces[0]);
        for(var j = 0; j < this.waxCount; j++) {
          $.bag.first(Wax)?.putInto(componentSpaces[j+1]);
        }
      }
      this.waxCount++;

      this.drawTopCustomer().putInto(player.space);
      this.drawTopGoal().putInto(player.space);      

      player.space.all(GoalCard).forEach(x => x.showOnlyTo(player));

      player.setScore(0);
      player.setMastery(1);

      player.pass = false;
      player.stack = false;
      player.soldCandle = false;
      player.placedWorker = false;
      player.finished = false;
      player.finalScore = false;
  }

  setupGame(playerCount : number) : void {
    if(playerCount <= 0) {
      return;
    }

    this.setup = true;
    try {
      const bag = this.first(Bag)!
      this.waxCount = 1;

    // shuffle the goals
    this.all(GoalCard).putInto($.goalDeck);
    this.all(GoalCard).forEach(x => {
      x.scored = false;
    });
    $.goalDeck.shuffle();

    // shuffle the customers
    this.all(CustomerCard).filter(x => x.customerType != CustomerType.None).putInto($.drawCustomer);
    this.all(CustomerCard).filter(x => x.customerType != CustomerType.None).forEach(x => {
      x.scoredGoal = false;
      x.scoredCandles = false;
    });
    $.drawCustomer.shuffle()
    this.drawTopCustomer().putInto($.customer1)
    this.drawTopCustomer().putInto($.customer2)
    this.drawTopCustomer().putInto($.customer3)
    this.drawTopCustomer().putInto($.customer4)

    // return keys
    this.all(KeyShape).forEach(x => x.putInto(this.first(KeyHook,{color: x.color})!));

    // return candles
    this.all(CandlePawn).forEach(x => x.putInto(this.first(Candelabra, {color: x.color})!));    

    // set end game tiles
    this.all(EndGameTile).putInto(bag);
    bag.shuffle()
    bag.first(EndGameTile)?.putInto($.whiteType);
    bag.first(EndGameTile)?.putInto($.redType);
    bag.first(EndGameTile)?.putInto($.yellowType);
    bag.first(EndGameTile)?.putInto($.blueType);
    bag.first(EndGameTile)?.putInto($.orangeType);
    bag.first(EndGameTile)?.putInto($.greenType);
    bag.first(EndGameTile)?.putInto($.purpleType);
    bag.first(EndGameTile)?.putInto($.blackType);
    
    // set round to 1
    this.first(Bulb)!.putInto(this.first(RoundSpace, {round: 1})!);

    // randomly choose round end tiles
    bag.all(RoundEndTile).putInto(bag);
    bag.shuffle()
  
    const roundEndSpaces = this.all(RoundEndSpace);
    for(var i = 0; i < playerCount+1; i++) {
      bag.first(RoundEndTile)?.putInto(roundEndSpaces[i]);  
    }

    // randomize back alley tiles
    this.all(BackAlleyTile).putInto(bag);
    bag.shuffle()
    
    bag.first(BackAlleyTile, {letter: "A"})?.putInto($.backAlleySpaceA1);
    bag.first(BackAlleyTile, {letter: "A"})?.putInto($.backAlleySpaceA2);
    bag.first(BackAlleyTile, {letter: "A"})?.putInto($.backAlleySpaceA3);
    bag.first(BackAlleyTile, {letter: "A"})?.putInto($.backAlleySpaceA4);
    bag.first(BackAlleyTile, {letter: "A"})?.putInto($.waxBackAlleySpaceA);
    bag.first(BackAlleyTile, {letter: "A"})?.putInto($.pigmentBackAlleySpaceA);
  
    bag.first(BackAlleyTile, {letter: "B"})?.putInto($.backAlleySpaceB1);
    bag.first(BackAlleyTile, {letter: "B"})?.putInto($.backAlleySpaceB2);
    bag.first(BackAlleyTile, {letter: "B"})?.putInto($.backAlleySpaceB3);
    bag.first(BackAlleyTile, {letter: "B"})?.putInto($.backAlleySpaceB4);
    bag.first(BackAlleyTile, {letter: "B"})?.putInto($.pigmentBackAlleySpaceB);
    bag.first(BackAlleyTile, {letter: "B"})?.putInto($.moldBackAlleySpaceB);

    // reset space colors
    this.all(WorkerSpace).filter(x => x.spaceType != SpaceType.Color).forEach(x => x.color = undefined);
    }
    catch(e){
      if (typeof e === "string") {
        this.message(e);
      } else if (e instanceof Error) {
        this.message(e.message);
      }
    }
    this.setup = false;
  }
}

export default createGame(ChandlersPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer, everyPlayer, whileLoop, forLoop, ifElse } = game.flowCommands;

  game.init();

  // create a bag to hold stuff
  const bag = game.create(Bag, 'bag')

  // create some trash cans
  for(var i = 0; i < 64; i++) {
    bag.create(Trash, 'trash' + i);
  }

  bag.onEnter(CandlePawn, x => {
    bag.first(Trash)!.putInto(game.first(Candelabra, {color: x.color})!);
  })
  bag.onExit(CandlePawn, x => {
    game.first(Candelabra, {color: x.color})!.top(Trash)!.putInto(bag);
  })

  // create the board
  const board = game.create(ChandlersBoard, 'board');

  // set up the goal deck
  const goalDeck = game.create(GoalSpace, 'goalDeck');
  goalDeck.create(GoalCard, 'purple-purple', {color1: Color.Purple, color2: Color.Purple} );
  goalDeck.create(GoalCard, 'blue-blue', {color1: Color.Blue, color2: Color.Blue} );
  goalDeck.create(GoalCard, 'blue-purple', {color1: Color.Blue, color2: Color.Purple} );
  goalDeck.create(GoalCard, 'green-purple', {color1: Color.Green, color2: Color.Purple} );
  goalDeck.create(GoalCard, 'green-green', {color1: Color.Green, color2: Color.Green} );
  goalDeck.create(GoalCard, 'green-blue', {color1: Color.Green, color2: Color.Blue} );
  goalDeck.create(GoalCard, 'yellow-blue', {color1: Color.Yellow, color2: Color.Blue} );
  goalDeck.create(GoalCard, 'yellow-green', {color1: Color.Yellow, color2: Color.Green} );
  goalDeck.create(GoalCard, 'yellow-purple', {color1: Color.Yellow, color2: Color.Purple} );
  goalDeck.create(GoalCard, 'yellow-yellow', {color1: Color.Yellow, color2: Color.Yellow} );
  goalDeck.create(GoalCard, 'orange-blue', {color1: Color.Orange, color2: Color.Blue} );
  goalDeck.create(GoalCard, 'orange-green', {color1: Color.Orange, color2: Color.Green} );
  goalDeck.create(GoalCard, 'orange-orange', {color1: Color.Orange, color2: Color.Orange} );
  goalDeck.create(GoalCard, 'orange-purple', {color1: Color.Orange, color2: Color.Purple} );
  goalDeck.create(GoalCard, 'orange-yellow', {color1: Color.Orange, color2: Color.Yellow} );
  goalDeck.create(GoalCard, 'red-red', {color1: Color.Red, color2: Color.Red} );
  goalDeck.create(GoalCard, 'red-blue', {color1: Color.Red, color2: Color.Blue} );
  goalDeck.create(GoalCard, 'red-green', {color1: Color.Red, color2: Color.Green} );
  goalDeck.create(GoalCard, 'red-orange', {color1: Color.Red, color2: Color.Orange} );
  goalDeck.create(GoalCard, 'red-purple', {color1: Color.Red, color2: Color.Purple} );
  goalDeck.create(GoalCard, 'red-yellow', {color1: Color.Red, color2: Color.Yellow} );

  // set up the market
  const drawCustomer = game.create(CustomerSpace, 'drawCustomer');
  const customer1 = game.create(CustomerSpace, 'customer1');
  const customer2 = game.create(CustomerSpace, 'customer2');
  const customer3 = game.create(CustomerSpace, 'customer3');
  const customer4 = game.create(CustomerSpace, 'customer4');
  customer1.onEnter(CustomerCard, x => { x.flipped = true; })
  customer2.onEnter(CustomerCard, x => { x.flipped = true; })
  customer3.onEnter(CustomerCard, x => { x.flipped = true; })
  customer4.onEnter(CustomerCard, x => { x.flipped = true; })
  
  // build the customer deck
  drawCustomer.create(CustomerCard, 'audacity', {scoring: [2, 4, 8, 14], customerType: CustomerType.Adventurer, color: Color.Green, data: "bgpx"})
  drawCustomer.create(CustomerCard, 'bamboozle', {scoring: [1, 4, 8], customerType: CustomerType.Charlatan, color: Color.Blue, data: "brp"})
  drawCustomer.create(CustomerCard, 'blessing-of-autumn', {scoring: [2, 4, 7, 13], customerType: CustomerType.Priest, color: Color.Orange, data: "brgo"})
  drawCustomer.create(CustomerCard, 'blessing-of-heaven', {scoring: [2, 4, 7, 13], customerType: CustomerType.Priest, color: Color.Blue, data: "bypo"})
  drawCustomer.create(CustomerCard, 'blessing-of-midnight', {scoring: [1, 4, 8], customerType: CustomerType.Priest, color: Color.Purple, data: "rpo"})
  drawCustomer.create(CustomerCard, 'blessing-of-moonlight', {scoring: [2, 4, 7, 13], customerType: CustomerType.Priest, color: Color.Yellow, data: "yrgo"})
  drawCustomer.create(CustomerCard, 'blessing-of-spring', {scoring: [1, 4, 9], customerType: CustomerType.Priest, color: Color.Green, data: "bgx"})
  drawCustomer.create(CustomerCard, 'blessing-of-summer', {scoring: [2, 4, 7, 13], customerType: CustomerType.Priest, color: Color.Red, data: "wyrx"})
  drawCustomer.create(CustomerCard, 'broker', {scoring: [2, 4, 7, 13], customerType: CustomerType.Merchant, color: Color.Blue, data: "byrp"})
  drawCustomer.create(CustomerCard, 'bypass', {scoring: [2, 4, 7, 13], customerType: CustomerType.Cartographer, color: Color.Yellow, data: "bygo"})
  drawCustomer.create(CustomerCard, 'cleansing-flood', {scoring: [2, 4, 8, 14], customerType: CustomerType.Witch, color: Color.Blue, data: "bgpo"})
  drawCustomer.create(CustomerCard, 'cutoff', {scoring: [1, 3, 7], customerType: CustomerType.Cartographer, color: Color.Purple, data: "wrp"})
  drawCustomer.create(CustomerCard, 'daring', {scoring: [2, 4, 7, 13], customerType: CustomerType.Adventurer, color: Color.Blue, data: "bwrx"})
  drawCustomer.create(CustomerCard, 'dealer', {scoring: [1, 3, 7], customerType: CustomerType.Merchant, color: Color.Purple, data: "wyp"})
  drawCustomer.create(CustomerCard, 'deception', {scoring: [1, 4, 8], customerType: CustomerType.Rogue, color: Color.Yellow, data: "byx"})
  drawCustomer.create(CustomerCard, 'detour', {scoring: [2, 4, 7, 13], customerType: CustomerType.Cartographer, color: Color.Orange, data: "wypo"})
  drawCustomer.create(CustomerCard, 'discount', {scoring: [1, 4, 8], customerType: CustomerType.Rogue, color: Color.Blue, data: "byo"})
  drawCustomer.create(CustomerCard, 'discovery', {scoring: [1, 4, 9], customerType: CustomerType.Adventurer, color: Color.Purple, data: "rpx"})
  drawCustomer.create(CustomerCard, 'double-dip', {scoring: [2, 4, 7, 14], customerType: CustomerType.Rogue, color: Color.Red, data: "bwrp"})
  drawCustomer.create(CustomerCard, 'exploit', {scoring: [2, 4, 7, 13], customerType: CustomerType.Rogue, color: Color.Purple, data: "bwpo"})
  drawCustomer.create(CustomerCard, 'exploration', {scoring: [1, 4, 8], customerType: CustomerType.Adventurer, color: Color.Orange, data: "wgo"})
  drawCustomer.create(CustomerCard, 'grift', {scoring: [2, 4, 7, 13], customerType: CustomerType.Charlatan, color: Color.Orange, data: "bwgo"})
  drawCustomer.create(CustomerCard, 'heroism', {scoring: [2, 4, 7, 13], customerType: CustomerType.Adventurer, color: Color.Yellow, data: "byrg"})
  drawCustomer.create(CustomerCard, 'hoodwink', {scoring: [2, 4, 7, 13], customerType: CustomerType.Charlatan, color: Color.Red, data: "wrgx"})
  drawCustomer.create(CustomerCard, 'infernal-rush', {scoring: [2, 4, 7, 12], customerType: CustomerType.Witch, color: Color.Red, data: "wyro"})
  drawCustomer.create(CustomerCard, 'intrepidity', {scoring: [2, 4, 8, 14], customerType: CustomerType.Adventurer, color: Color.Red, data: "rgpo"})
  drawCustomer.create(CustomerCard, 'lightning-crash', {scoring: [1, 4, 8], customerType: CustomerType.Witch, color: Color.Yellow, data: "yrx"})
  drawCustomer.create(CustomerCard, 'miscount', {scoring: [1, 4, 9], customerType: CustomerType.Rogue, color: Color.Green, data: "gox"})
  drawCustomer.create(CustomerCard, 'nourishing-wave', {scoring: [2, 4, 7, 13], customerType: CustomerType.Witch, color: Color.Green, data: "wygx"})
  drawCustomer.create(CustomerCard, 'operator', {scoring: [1, 3, 7], customerType: CustomerType.Merchant, color: Color.Orange, data: "bwo"})
  drawCustomer.create(CustomerCard, 'passage', {scoring: [1, 4, 8], customerType: CustomerType.Cartographer, color: Color.Green, data: "wgp"})
  drawCustomer.create(CustomerCard, 'prince-rohan', {scoring: [2, 4, 7, 12], customerType: CustomerType.Prince, color: Color.Red, data: "bwrg"})
  drawCustomer.create(CustomerCard, 'prince-tyrion', {scoring: [2, 4, 8, 14], customerType: CustomerType.Prince, color: Color.Purple, data: "bypx"})
  drawCustomer.create(CustomerCard, 'princess-buttercup', {scoring: [2, 4, 8, 14], customerType: CustomerType.Prince, color: Color.Yellow, data: "yrox"})
  drawCustomer.create(CustomerCard, 'princess-evergreen', {scoring: [1, 3, 7], customerType: CustomerType.Prince, color: Color.Green, data: "wyg"})
  drawCustomer.create(CustomerCard, 'princess-peach', {scoring: [2, 4, 7, 12], customerType: CustomerType.Prince, color: Color.Orange, data: "bwro"})
  drawCustomer.create(CustomerCard, 'princess-perrywinkle', {scoring: [2, 4, 7, 12], customerType: CustomerType.Prince, color: Color.Blue, data: "bwyp"})
  drawCustomer.create(CustomerCard, 'retailer', {scoring: [2, 4, 7, 13], customerType: CustomerType.Merchant, color: Color.Red, data: "wrox"})
  drawCustomer.create(CustomerCard, 'scam', {scoring: [1, 4, 8], customerType: CustomerType.Charlatan, color: Color.Yellow, data: "byg"})
  drawCustomer.create(CustomerCard, 'seller', {scoring: [2, 4, 7, 13], customerType: CustomerType.Merchant, color: Color.Green, data: "wygo"})
  drawCustomer.create(CustomerCard, 'shadow-strike', {scoring: [2, 4, 7, 13], customerType: CustomerType.Witch, color: Color.Purple, data: "wrgp"})
  drawCustomer.create(CustomerCard, 'shortcut', {scoring: [2, 4, 7, 12], customerType: CustomerType.Cartographer, color: Color.Red, data: "wyrg"})
  drawCustomer.create(CustomerCard, 'sleight-of-hand', {scoring: [2, 4, 7, 13], customerType: CustomerType.Rogue, color: Color.Orange, data: "wrpo"})
  drawCustomer.create(CustomerCard, 'sunlight-surge', {scoring: [2, 4, 7, 13], customerType: CustomerType.Witch, color: Color.Orange, data: "wgpo"})
  drawCustomer.create(CustomerCard, 'tomfoolery', {scoring: [1, 4, 8], customerType: CustomerType.Charlatan, color: Color.Purple, data: "wpo"})
  drawCustomer.create(CustomerCard, 'trail', {scoring: [2, 4, 7, 13], customerType: CustomerType.Cartographer, color: Color.Blue, data: "bwpx"})
  drawCustomer.create(CustomerCard, 'trickery', {scoring: [1, 4, 9], customerType: CustomerType.Charlatan, color: Color.Green, data: "ygx"})
  drawCustomer.create(CustomerCard, 'vendor', {scoring: [1, 4, 9], customerType: CustomerType.Merchant, color: Color.Yellow, data: "ypx"})

  // create candle spaces
  game.all(CustomerCard).forEach(x => {
    const topRow = x.create(CandleTopRow, x.name + '-topRow');
    const bottomRow = x.create(CandleBottomRow, x.name + '-bottomRow');

    if(x.requiredCandles().includes(Color.Blue)) { topRow.create(CandleSpace, x.name + '-blue', {color: Color.Blue}); }
    if(x.requiredCandles().includes(Color.White)) { topRow.create(CandleSpace, x.name + '-white', {color: Color.White}); }
    if(x.requiredCandles().includes(Color.Yellow)) { topRow.create(CandleSpace, x.name + '-yellow', {color: Color.Yellow}); }
    if(x.requiredCandles().includes(Color.Red)) { topRow.create(CandleSpace, x.name + '-red', {color: Color.Red}); }

    if(x.requiredCandles().includes(Color.Green)) { bottomRow.create(CandleSpace, x.name + '-green', {color: Color.Green}); }
    if(x.requiredCandles().includes(Color.Purple)) { bottomRow.create(CandleSpace, x.name + '-purple', {color: Color.Purple}); }
    if(x.requiredCandles().includes(Color.Orange)) { bottomRow.create(CandleSpace, x.name + '-orange', {color: Color.Orange}); }
    if(x.requiredCandles().includes(Color.Black)) { bottomRow.create(CandleSpace, x.name + '-black', {color: Color.Black}); }

    x.create(CustomerCubeSpace, x.name + '-customerCube');
  })

  // set up the worker spaces
  const waxBuilding = new WaxBuilding()
  waxBuilding.createWorkerSpaces(game);

  const pigmentBuilding = new PigmentBuilding();
  pigmentBuilding.createWorkerSpaces(game);

  const moldBuilding = new MoldBuilding();
  moldBuilding.createWorkerSpaces(game);

  // build out spill areas
  const waxSpillArea = game.create(Spill, 'waxSpillArea');
  
  const pigmentMasteryArea = game.create(Space, 'pigmentMasteryArea');
  pigmentMasteryArea.create(Pigment,'pigmentMasteryRed', {color: Color.Red})
  pigmentMasteryArea.create(Pigment,'pigmentMasteryYellow', {color: Color.Yellow})
  pigmentMasteryArea.create(Pigment,'pigmentMasteryBlue', {color: Color.Blue})
  pigmentMasteryArea.all(Pigment).hideFromAll();

  const pigmentSpillArea = game.create(Spill, 'pigmentSpillArea');
  const pigmentSpillCheckSpace = game.create(CheckSpace, 'pigmentSpillCheckSpace', {building: Building.Pigment, type: SpaceType.Spill});
  const pigmentSpillCheck = pigmentSpillCheckSpace.create(Check, 'pigmentSpillCheck');
  const pigmentMasteryCheckSpace = game.create(CheckSpace, 'pigmentMasteryCheckSpace', {building: Building.Pigment, type: SpaceType.Mastery});
  const pigmentMastertCheck = pigmentMasteryCheckSpace.create(Check, 'pigmentMasteryCheck');

  const meltpillArea = game.create(Spill, 'meltSpillArea');

  // place the keys
  const redHook = game.create(KeyHook, 'redHook', {color: Color.Red});
  const yellowHook = game.create(KeyHook, 'yellowHook', {color: Color.Yellow});
  const blueHook = game.create(KeyHook, 'blueHook', {color: Color.Blue});
  const orangeHook = game.create(KeyHook, 'orangeHook', {color: Color.Orange});
  const greenHook = game.create(KeyHook, 'greenHook', {color: Color.Green});
  const purpleHook = game.create(KeyHook, 'purpleHook', {color: Color.Purple});

  redHook.create(KeyShape, 'red-key', {color: Color.Red});
  yellowHook.create(KeyShape, 'yellow-key', {color: Color.Yellow});
  blueHook.create(KeyShape, 'blue-key', {color: Color.Blue});
  orangeHook.create(KeyShape, 'orange-key', {color: Color.Orange});
  greenHook.create(KeyShape, 'green-key', {color: Color.Green});
  purpleHook.create(KeyShape, 'purple-key', {color: Color.Purple});

  // place the candles
  const whiteCandles = game.create(Candelabra, 'whiteCandles', {color: Color.White});
  const redCandles = game.create(Candelabra, 'redCandles', {color: Color.Red});
  const yellowCandles = game.create(Candelabra, 'yellowCandles', {color: Color.Yellow});
  const blueCandles = game.create(Candelabra, 'blueCandles', {color: Color.Blue});
  const orangeCandles = game.create(Candelabra, 'orangeCandles', {color: Color.Orange});
  const greenCandles = game.create(Candelabra, 'greenCandles', {color: Color.Green});
  const purpleCandles = game.create(Candelabra, 'purpleCandles', {color: Color.Purple});
  const blackCandles = game.create(Candelabra, 'blackCandles', {color: Color.Black});

  // place ONE white candle in the bag
  // $.bag.create(CandlePawn, 'whiteCandleBag', {color: Color.White});

  const playerCountCandles = game.players.length == 1 ? -2 : game.players.length-2;
  for(var i = 0; i < 8 + playerCountCandles; i++) {
    whiteCandles.create(CandlePawn, 'whiteCandle' + i, {color: Color.White})
  }
  for(var i = 0; i < 6 + playerCountCandles; i++) {
    redCandles.create(CandlePawn, 'redCandle' + i, {color: Color.Red})
    yellowCandles.create(CandlePawn, 'yellowCandle' + i, {color: Color.Yellow})
    blueCandles.create(CandlePawn, 'blueCandle' + i, {color: Color.Blue})
    orangeCandles.create(CandlePawn, 'orangeCandle' + i, {color: Color.Orange})
    greenCandles.create(CandlePawn, 'greenCandle' + i, {color: Color.Green})
    purpleCandles.create(CandlePawn, 'purpleCandle' + i, {color: Color.Purple})
  }
  for(var i = 0; i < 4 + playerCountCandles; i++) {
    blackCandles.create(CandlePawn, 'blackCandle' + i, {color: Color.Black})
  }

  game.setup = true;
      for(var i = 0; i < 4-game.players.length; i++) {
      [Building.Wax, Building.Pigment, Building.Mold].forEach((building: Building) =>{
        const die = game.create(ColorDie, 'colorDie' + building + 'd' + i);
        die.roll()

        if(i == 2) {
          // for solo randomly put one in mastery or backroom
          if(Math.floor(game.random() * 2) % 2 == 0) {
            die.putInto(game.first(WorkerSpace, { building: building, spaceType: SpaceType.Mastery })!)
          } else {
            die.putInto(game.first(WorkerSpace, { building: building, spaceType: SpaceType.Backroom })!)
          }
        } else {
          die.putInto(game.first(WorkerSpace, { building: building, color: die.color })!)
        }
      });
    }
    game.setup = false;

  // place the end game customer types
  game.create(GameEndSpace, 'whiteType');
  game.create(GameEndSpace, 'redType');
  game.create(GameEndSpace, 'yellowType');
  game.create(GameEndSpace, 'blueType');
  game.create(GameEndSpace, 'orangeType');
  game.create(GameEndSpace, 'greenType');
  game.create(GameEndSpace, 'purpleType');
  game.create(GameEndSpace, 'blackType');

  whiteCandles.onExit(CandlePawn, x => {
    if(whiteCandles.all(CandlePawn).length == 0) {
      game.placeEndGameTile($.whiteType.first(EndGameTile)!);
    }
  })
  redCandles.onExit(CandlePawn, x => {
    if(redCandles.all(CandlePawn).length == 0) {
      game.placeEndGameTile($.redType.first(EndGameTile)!);
    }
  })
  yellowCandles.onExit(CandlePawn, x => {
    if(yellowCandles.all(CandlePawn).length == 0) {
      game.placeEndGameTile($.yellowType.first(EndGameTile)!);
    }
  })
  blueCandles.onExit(CandlePawn, x => {
    if(blueCandles.all(CandlePawn).length == 0) {
      game.placeEndGameTile($.blueType.first(EndGameTile)!);
    }
  })
  orangeCandles.onExit(CandlePawn, x => {
    if(orangeCandles.all(CandlePawn).length == 0) {
      game.placeEndGameTile($.orangeType.first(EndGameTile)!);
    }
  })
  greenCandles.onExit(CandlePawn, x => {
    if(greenCandles.all(CandlePawn).length == 0) {
      game.placeEndGameTile($.greenType.first(EndGameTile)!);
    }
  })
  purpleCandles.onExit(CandlePawn, x => {
    if(purpleCandles.all(CandlePawn).length == 0) {
      game.placeEndGameTile($.purpleType.first(EndGameTile)!);
    }
  })
  blackCandles.onExit(CandlePawn, x => {
    if(blackCandles.all(CandlePawn).length == 0) {
      game.placeEndGameTile($.blackType.first(EndGameTile)!);
    }
  })

  game.create(GameEndSpace, 'gameEndType1', {score: 3})
  game.create(GameEndSpace, 'gameEndType2', {score: 2})
  game.create(GameEndSpace, 'gameEndType3', {score: 1})

  $.gameEndType1.onEnter(EndGameTile, x => {
    x.flipped = false;
  })
  $.gameEndType2.onEnter(EndGameTile, x => {
    x.flipped = false;
  })
  $.gameEndType3.onEnter(EndGameTile, x => {
    x.flipped = false;
  })
  
  bag.create(EndGameTile, 'adventurer', {type: CustomerType.Adventurer})
  bag.create(EndGameTile, 'charlatan', {type: CustomerType.Charlatan})
  bag.create(EndGameTile, 'rogue', {type: CustomerType.Rogue})
  bag.create(EndGameTile, 'merchant', {type: CustomerType.Merchant})
  bag.create(EndGameTile, 'priest', {type: CustomerType.Priest})
  bag.create(EndGameTile, 'prince', {type: CustomerType.Prince})
  bag.create(EndGameTile, 'witch', {type: CustomerType.Witch})
  bag.create(EndGameTile, 'cartographer', {type: CustomerType.Cartographer})

  // rounds
  $.bag.create(RoundSpace, 'fakeRound0', {round: 0});
  game.create(RoundSpace, 'round1', {round: 1});
  game.create(RoundSpace, 'round2', {round: 2});
  game.create(RoundSpace, 'round3', {round: 3});
  game.create(RoundSpace, 'round4', {round: 4});
  $.bag.create(RoundSpace, 'fakeRound5', {round: 5})

  bag.create(Bulb, 'bulb');

  // player order
  // game.create(PlayerOrderSpace, 'playerOrder1', {num: 1, pass: false});
  // game.create(PlayerOrderSpace, 'playerOrder2', {num: 2, pass: false});
  // game.create(PlayerOrderSpace, 'playerOrder3', {num: 3, pass: false});
  // game.create(PlayerOrderSpace, 'playerOrder4', {num: 4, pass: false});

  // game.create(PlayerOrderSpace, 'playerOrderPass1', {num: 1, pass: true});
  // game.create(PlayerOrderSpace, 'playerOrderPass2', {num: 2, pass: true});
  // game.create(PlayerOrderSpace, 'playerOrderPass3', {num: 3, pass: true});
  // game.create(PlayerOrderSpace, 'playerOrderPass4', {num: 4, pass: true});

  // round end goals
  game.create(RoundEndSpace, 'roundEndSpace1')
  game.create(RoundEndSpace, 'roundEndSpace2')
  game.create(RoundEndSpace, 'roundEndSpace3')
  game.create(RoundEndSpace, 'roundEndSpace4')
  game.create(RoundEndSpace, 'roundEndSpace5')

  bag.create(RoundEndTile, 'customer-satisfaction')
  bag.create(RoundEndTile, 'five-colors')
  bag.create(RoundEndTile, 'mastery-level-three')
  bag.create(RoundEndTile, 'one-by-five')
  bag.create(RoundEndTile, 'two-pairs')
  bag.create(RoundEndTile, 'three-by-three-otherwise')
  bag.create(RoundEndTile, 'three-by-tree-likewise')
  bag.create(RoundEndTile, 'two-by-three')
  bag.create(RoundEndTile, 'two-by-two-by-color')
  bag.create(RoundEndTile, 'two-by-two-by-type')

  // back alley
  game.create(BackAlleySpace, 'backAlleySpaceA1', {letter: "A"});
  game.create(BackAlleySpace, 'backAlleySpaceA2', {letter: "A"});
  game.create(BackAlleySpace, 'backAlleySpaceA3', {letter: "A"});
  game.create(BackAlleySpace, 'backAlleySpaceA4', {letter: "A"});
  const alleyACheckSpace = game.create(CheckSpace, 'alleyACheckSpace', {building: Building.None, type: SpaceType.Alley});
  const alleyACheck = alleyACheckSpace.create(Check, 'alleyACheck');

  game.create(BackAlley, 'backAlleyA', {letter: "A"});

  game.create(BackAlleySpace, 'backAlleySpaceB1', {letter: "B"});
  game.create(BackAlleySpace, 'backAlleySpaceB2', {letter: "B"});
  game.create(BackAlleySpace, 'backAlleySpaceB3', {letter: "B"});
  game.create(BackAlleySpace, 'backAlleySpaceB4', {letter: "B"});
  const alleyBCheckSpace = game.create(CheckSpace, 'alleyBCheckSpace', {building: Building.None, type: SpaceType.Alley});
  const alleyBCheck = alleyBCheckSpace.create(Check, 'alleyBCheck');

  game.create(BackAlley, 'backAlleyB', {letter: "B"});

  game.create(BackAlleySpace, 'waxBackAlleySpaceA', {building: Building.Wax});
  const waxCheckSpace = game.create(CheckSpace, 'waxBackroomCheckSpace', {building: Building.Wax, type: SpaceType.Backroom});
  const waxCheck = waxCheckSpace.create(Check, 'waxBackroomCheck');

  game.create(BackAlleySpace, 'pigmentBackAlleySpaceA', {building: Building.Pigment});
  game.create(BackAlleySpace, 'pigmentBackAlleySpaceB', {building: Building.Pigment});
  const pigmentCheckSpace = game.create(CheckSpace, 'pigmentBackroomCheckSpace', {building: Building.Pigment, type: SpaceType.Backroom});
  const pigmentCheck = pigmentCheckSpace.create(Check, 'pigmentBackroomCheck');

  game.create(BackAlleySpace, 'moldBackAlleySpaceB', {building: Building.Mold});
  const moldCheckSpace = game.create(CheckSpace, 'moldBackroomCheckSpace', {building: Building.Mold, type: SpaceType.Backroom});
  const moldCheck = moldCheckSpace.create(Check, 'moldBackroomCheck');

  const refreshCustomers = bag.create(BackAlleyTile, 'refresh-customers', {letter: "A"});
  const meltWax = bag.create(BackAlleyTile, 'melt-wax', {letter: "A"});
  const purchaseSpiltWax = bag.create(BackAlleyTile, 'purchace-spilt-wax', {letter: "A"});
  const convertKeyToDie = bag.create(BackAlleyTile, 'convert-key-to-die', {letter: "A"});
  const placeWhiteCandle = bag.create(BackAlleyTile, 'place-white-candle', {letter: "A"});  
  const swapCustomer = bag.create(BackAlleyTile, 'swap-customer', {letter: "A"});

  const addPigment = bag.create(BackAlleyTile, 'add-pigment', {letter: "B"});
  const advanceMastery = bag.create(BackAlleyTile, 'advance-mastery', {letter: "B"});
  const gainGoalCard = bag.create(BackAlleyTile, 'gain-goal-card', {letter: "B"});
  const moveCandle = bag.create(BackAlleyTile, 'move-candle', {letter: "B"});
  const removePigment = bag.create(BackAlleyTile, 'remove-pigment', {letter: "B"});
  const twoWax = bag.create(BackAlleyTile, 'two-wax', {letter: "B"});

  game.create(ReadySpace, 'ready');

  // create some wax
  for(var i = 0; i < 48; i++) {
    bag.create(Wax, 'wax' + i);
  }
  for(var i = 0; i < 32; i++) {
    bag.create(Melt, 'melt' + i);
  }
  for(var i = 0; i < 8; i++) {
    bag.create(Pigment, 'pigmentRed' + i, {color: Color.Red});
    bag.create(Pigment, 'pigmentYellow' + i, {color: Color.Yellow});
    bag.create(Pigment, 'pigmentBlue' + i, {color: Color.Blue});
  }

  game.create(ScoringTrack, 'scoringTrack1_20')
  game.create(ScoringTrack, 'scoringTrack21_50')
  game.create(ScoringTrack, 'scoringTrack51_70')
  game.create(ScoringTrack, 'scoringTrack71_100')

  for(var i = 1; i <= 20; i++) {
    $.scoringTrack1_20.create(ScoringSpace, 'scoring' + i, {score: i});
  }
  for(var i = 21; i <= 50; i++) {
    $.scoringTrack21_50.create(ScoringSpace, 'scoring' + i, {score: i});
  }
  for(var i = 51; i <= 70; i++) {
    $.scoringTrack51_70.create(ScoringSpace, 'scoring' + i, {score: i});
  }
  for(var i = 71; i <= 100; i++) {
    $.scoringTrack71_100.create(ScoringSpace, 'scoring' + i, {score: i == 100 ? 0 : i});
  }  

  // players  
  const playersSpace = game.create(PlayersSpace, 'playersSpace')

  const firstPlayer = game.create(Lamp, 'firstPlayer');

  // const lastPlayer = game.create(CaptureTile, 'captureTile');

  for(var i = 0; i < game.players.length; i++) {
    const score = $.scoring100.create(ScoreTracker, 'p' + i + 'Score', 
      {color: Color.White, index: i}); // color will be fixed
    score.player = game.players[i];
    
    const playerSpace = playersSpace.create(PlayerSpace, 'playerSpace' + i, {player: game.players[i]});
    playerSpace.onEnter(CustomerCard, x => {
      x.flipped = true;
    })
    playerSpace.onEnter(GoalCard, x => {
      x.flipped = true;      
    })

    const playerBoard = playerSpace.create(PlayerBoard, 'p' + i + "Board")
    playerBoard.player = game.players[i];
    
    game.players[i].space = playerSpace
    game.players[i].board = playerBoard
    // game.players[i].playerColor = colors[i]

    if(i == 0) {
      firstPlayer.putInto(game.players[i].space);
    }

    // if(i == game.players.length-1) {
    //   lastPlayer.putInto(game.players[i].space);
    // }

    for(var l = 1; l <= 20; l++) {
      playerBoard.create(ComponentSpace, 'p' + i + 'Component' + l, {num: l});
    }

    const playerDie1 = playerBoard.create(DiceSpace, 'p' + i + 'Die1');    
    const playerDie2 = playerBoard.create(DiceSpace, 'p' + i + 'Die2');
    const playerDie3 = playerBoard.create(DiceSpace, 'p' + i + 'Die3');
    // const playerDie4 = playerBoard.create(DiceSpace, 'p' + i + 'Die4');

    const die1 = playerDie1.create(ColorDie, 'p' + i + 'd1'); die1.roll();
    const die2 = playerDie2.create(ColorDie, 'p' + i + 'd2'); die2.roll();    
    const die3 = playerDie3.create(ColorDie, 'p' + i + 'd3'); die3.roll();

    // const die4 = playerDie4.create(ColorDie, 'p' + i + 'd4'); die4.roll();die4.putInto($.bag);

    const power1 = playerBoard.create(PowerSpace, 'p' + i + 'Power1')
    const power2 = playerBoard.create(PowerSpace, 'p' + i + 'Power2')
    const power3 = playerBoard.create(PowerSpace, 'p' + i + 'Power3')

    const baseAction = playerBoard.create(CustomerSpace, 'p' + i + 'BaseActionSpace');
    baseAction.create(CustomerCard, 'p' + i + 'BaseAction', {flipped: true, color: Color.White})

    const masteryTrack = playerBoard.create(MasteryTrack, 'p' + i + 'Mastery')
    for(var k = 0; k < 16; k++) {
      const trackSpace = masteryTrack.create(MasterySpace, 'p' + i  + 'Mastery' + k, {index: k});
      if(k == 0) {
        const mastery = trackSpace.create(MasteryCube, 'p' + i + 'Cube', {index: i, color: Color.White}); // color will be fixed
        mastery.player = game.players[i];
      }
    }

    // const playerOrderCube = game.create(PlayerOrderCube, 'po' + i + 'Cube', {index: i, color: Color.White}); // color will be fixed
    // playerOrderCube.player = game.players[i];
    // playerOrderCube.putInto(game.nextAvailablePlayerOrder());

    power1.create(PowerTile, 'roll')
    power2.create(PowerTile, 'set')
    power3.create(PowerTile, 'stack')
  }  

  // GAME ACTIONS
  game.defineActions({
    
    chooseCustomer: (player) => action<{top: WorkerPiece, space: WorkerSpace}>({
      prompt: 'Would you like to spend 1 mastery to cycle the customers?',
    }).chooseFrom(
      "choice", ['Yes', 'No'], 
      { skipIf: 'never' }
    ).do(({choice, top, space}) => {
      if(choice == 'Yes') {
        player.decreaseMastery(1);
        for(const customer of [$.customer1, $.customer2, $.customer3, $.customer4]) {
          customer.first(CustomerCard)?.putInto($.bag);
          game.drawTopCustomer().putInto(customer);
        }
        if(player.currentMastery() > 0) {
          game.followUp({name: 'chooseCustomer'});
        } else {
          game.followUp({name: 'chooseCustomerFinish'});
        }
      } else {
        game.followUp({name: 'chooseCustomerFinish'});
      }
    }),

    chooseCustomerFinish: (player) => action({
      prompt: 'Choose a customer'
    }).chooseOnBoard(
      'customer', [$.customer1, $.customer2, $.customer3, $.customer4],
      { skipIf: 'never' }
    ).do(({ customer }) => {
      const card = customer.first(CustomerCard)!;
      card.putInto(player.space);
      game.drawTopCustomer().putInto(customer);

      game.message(player.name + ' takes the customer ' + card + '.')
    }),

    chooseWorker: (player) => action({
      prompt: 'Choose a worker',
      condition: player.workerCount() > 0 && !player.pass
    }).chooseOnBoard(
      'worker', player.placedWorker ? player.board.all(CandlePawn).filter(x => player.hasSomewhereToPutACandle(x)) : 
        player.board.all(WorkerPiece),
      { skipIf: 'never' }
    ).do(({ worker }) => {
      worker.putInto($.ready)
    }),

    chooseWhiteCandle: (player) => action({
      prompt: 'Choose a white candle',
    }).chooseOnBoard(
      'candle', player.board.all(CandlePawn, {color: Color.White}),
      { skipIf: 'never' }
    ).do(({ candle }) => {
      candle.putInto($.ready)
    }),

    chooseWax: (player) => action({
      prompt: 'Choose wax to melt',
    }).chooseOnBoard(
      'wax', player.board.all(Wax),
      { skipIf: 'never', min: 2, max: 48 }
    ).do(({ wax }) => {
      const counts = player.meltWaxSpill(wax);

      game.message(player.name + ' melts ' + (wax.length) + ' wax into ' + counts.meltCount + ' melts.');
      game.message(counts.pointCount + ' wax spills and ' + player.name + ' scores ' + counts.pointCount + ' points.');
    }),

    chooseKey: (player) => action({
      prompt: 'Choose key to gain',
    }).chooseOnBoard(
      'key', game.all(KeyHook).all(KeyShape),
      { skipIf: 'never' }
    ).do(({ key }) => {
      key.putInto(player.nextEmptySpace())

      game.message(player.name + ' takes the ' + key + '.')
    }),

    
    // chooseDieFromBoard: (player) => action<{key: KeyShape}>({
    //   prompt: 'Choose die to take',
    // }).chooseOnBoard(
    //   'die', game.all(WorkerSpace).all(ColorDie),
    //   { skipIf: 'never' }
    // ).do(({ key, die }) => {
    //   key.putInto(game.first(KeyHook, {color: key.color})!);
    //   die.roll();
    //   die.putInto(player.nextEmptyDieSpace());

    //   game.message(player.name + ' trades the ' + key + ' for a die and rolls a ' + die.color + '.');
    // }),

    // chooseKeyAndShape2: (player) => action({
    //   prompt: 'Choose key to trade',
    // }).chooseOnBoard(
    //   'key', player.board.all(KeyShape),
    //   { skipIf: 'never' }
    // ).do(({ key }) => {
    //   game.followUp({name: 'chooseDieFromBoard', args: {key: key}})
    // }),

    chooseKeyAndShape: (player) => action({
      prompt: 'Choose key to trade',
    }).chooseOnBoard(
      'key', player.board.all(KeyShape),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'die', game.all(WorkerSpace).all(ColorDie),
      { skipIf: 'never' }
    ).do(({ die, key }) => {
      key.putInto(game.first(KeyHook, {color: key.color})!);

      const space = die.container(WorkerSpace)!;

      die.roll();
      die.putInto(player.nextEmptyDieSpace());

      // make sure to reset the color
      if(space.all(WorkerPiece).length == 0 && [SpaceType.Backroom, SpaceType.Mastery, SpaceType.Middle].includes(space.spaceType)) {
        space.color = undefined;
      }

      game.message(player.name + ' trades the ' + key + ' for a die and rolls ' + die.color + '.');
    }),

    chooseSpiltDie: (player) => action({
      prompt: 'Choose die to gain',
    }).chooseOnBoard(
      'die', $.waxSpill.all(ColorDie)
        .concat($.pigmentSpill.all(ColorDie))
        .concat($.moldSpill.all(ColorDie)),
      { skipIf: 'never' }
    ).do(({ die }) => {
      die.roll();
      die.putInto(player.nextEmptyDieSpace())

      game.message(player.name + ' takes a die from the spill and rolls ' + die.color + '.');
    }),

    chooseWaxRepeater: (player) => action({
      prompt: 'Choose wax to melt',
    }).chooseOnBoard(
      'wax', player.board.all(Wax),
      { skipIf: 'never', min: 1, max: player.masteryLevel() }
    ).do(({ wax }) => {
      const melts = player.meltWax(wax);

      game.message(player.name + ' melts ' + melts + ' wax into ' + melts + ' melts.')
    }),

    chooseNextCustomer: (player) => action({
      prompt: 'Choose your next customer',
    }).chooseOnBoard(
      'customer', [$.drawCustomer, $.customer1, $.customer2, $.customer3, $.customer4],
      { skipIf: 'never' }
    ).do(({ customer }) => {
      if( customer == $.drawCustomer) {
        game.drawTopCustomer().putInto(player.space);

        game.message(player.name + ' draws the top customer.');
      } else {
        const card = customer.first(CustomerCard)!;
        card.putInto(player.space);
        game.drawTopCustomer().putInto(customer);
        
        game.message(player.name + ' takes the customer ' + card + '.');
      }
    }),

    chooseAvailableColorAction: (player) => action({
      prompt: 'Choose an available color action',
    }).chooseOnBoard(
      'action', [$.waxRed, $.waxYellow, $.waxBlue, $.waxOrange, $.waxGreen, $.waxPurple,
        $.pigmentRed, $.pigmentYellow, $.pigmentBlue, $.pigmentOrange, $.pigmentGreen, $.pigmentPurple,
        $.moldRed, $.moldYellow, $.moldBlue, $.moldOrange, $.moldGreen, $.moldPurple]
        .filter(x => x.all(WorkerPiece).length == 0),
      { skipIf: 'never' }
    ).do(({ action }) => {
      const workerSpace = action as WorkerSpace;
      switch(workerSpace.building) {
        case Building.Wax: {
          if([Color.Red, Color.Yellow, Color.Blue].includes(workerSpace.color!)) {
            new WaxBuilding().performPrimvaryColor(game, workerSpace.color!, true);
          } else {
            new WaxBuilding().performSecondaryColor(game, workerSpace.color!, true);
          }
          break;
        }
        case Building.Pigment: {
          if([Color.Red, Color.Yellow, Color.Blue].includes(workerSpace.color!)) {
            new PigmentBuilding().performPrimvaryColor(game, workerSpace.color!, true);
          } else {
            new PigmentBuilding().performSecondaryColor(game, workerSpace.color!, true);
          }
          break;
        }
        case Building.Mold: {
          if([Color.Red, Color.Yellow, Color.Blue].includes(workerSpace.color!)) {
            new MoldBuilding().performPrimvaryColor(game, workerSpace.color!, true);
          } else {
            new MoldBuilding().performSecondaryColor(game, workerSpace.color!, true);
          }
          break;
        }
      }
    }),

    // continueMolding: (player) => action<{count: number}>({
    //   prompt: 'Do you want to continue molding?',
    // }).chooseFrom(
    //   "choice", () => ['Yes', 'No'],
    //   { skipIf: 'never' }
    // ).do(({ choice, count }) => {
    //   if(choice == 'Yes') {
    //     game.followUp({name: 'chooseMelt', args: {count: count-1}});
    //   }
    // }),

    chooseMelt: (player) => action({
      prompt: 'Choose melt to mold',
    }).chooseOnBoard(
      'melts', () => player.board.all(Melt).filter(x => game.all(Candelabra, {color: x.color}).all(CandlePawn).length > 0),
      { skipIf: 'never', min: 1, max: game.currentPlayer().masteryLevel() }
    ).do(({ melts }) => {

      var points = 0;
      melts.forEach(x => {
        player.gainCandle(x, false, 1);

        if($.meltSpillArea.all(Melt).length < 5) {
          x.putInto($.meltSpillArea);  
          player.increaseScore(2);
          points++;
        } else {
          x.color = Color.White;
          x.putInto($.bag);
        }

        game.message(player.name + ' molds a ' + x + ' into a ' + x.color + ' candle.');
      });
      
      game.message(points+ ' melts spill and ' + player.name + ' scores ' + points + ' points.');
    }),

  

    chooseCandlesToTrade: (player) => action<{color: Color}>({
      prompt: 'Choose candles to trade'
    }).chooseOnBoard(
      'playerCandle', ({ color }) => color == undefined ? player.board.all(CandlePawn) : player.board.all(CandlePawn, {color: color}),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'candle', ({playerCandle}) => game.all(Candelabra).all(CandlePawn).filter(x => x.color != playerCandle.color),
      { skipIf: 'never' }
    ).do(({ playerCandle, candle }) => {
      playerCandle.putInto($.bag);
      candle.putInto(player.nextEmptySpace());

      game.message(player.name + ' trades a ' + playerCandle + ' for a ' + candle + '.');
    }),

    sellCandle: player => action({
      prompt: 'Sell the candle',
      condition: $.ready.first(WorkerPiece)! instanceof CandlePawn && !player.placedWorker && !player.soldCandle
    }).chooseOnBoard(
      'space', game.all(BackAlley),
      { skipIf: 'never' }
    ).do(({ space }) => {

      const candle = $.ready.first(CandlePawn)!
      game.message(player.name + ' sells a ' + candle + 'to back alley ' + space.letter + '.');

      switch(space.letter) {
        case 'A': {
          player.increaseScore();
          game.message(player.name + ' scores 1 point.');
          break;
        }
        case 'B': {
          if(player.board.all(PowerTile, {flipped: false}).length > 0) {
            game.followUp({name: 'choosePowerTile'});
          }
          break;
        }
      }
      
      var actions = 2;
      if(candle.color == Color.White) {
        actions = 1;
      } else if(candle.color == Color.Black) {
        actions = 3;
      }

      const checkSpace = space.letter == 'A' ? $.alleyACheckSpace : $.alleyBCheckSpace;
      checkSpace.first(Check)!.flipped = true;
      game.followUp({name: 'chooseBackAlleyAction', args: {letter: space.letter, actions: actions}});

      player.soldCandle = true;
      candle.putInto($.bag);
    }),
    
    choosePowerTile: (player) => action({
      prompt: 'Choose power tile',
    }).chooseOnBoard(
      'tile', player.board.all(PowerTile, {flipped: false}),
      { skipIf: 'never' }
    ).do(({ tile }) => {
      tile.flipped = true;

      game.message(player.name + ' uses power tile ' + tile + '.');
    }),

    chooseBackAlleyAction: (player) => action<{letter: string, actions: number}>({
      prompt: 'Choose back alley tile',
    }).chooseOnBoard(
      'token', ({letter}) => (['A', 'B'].includes(letter) ? game.all(BackAlleySpace, {letter: letter}) :
        game.all(BackAlleySpace, {letter: 'A'}).concat(game.all(BackAlleySpace, {letter: 'B'})))
        .filter(x => x.first(BackAlleyTile)!.isPossible(game, player))
        .map(x => x as Space<MyGame>)
        .concat(letter == 'A' ? $.alleyACheckSpace as Space<MyGame> : $.alleyBCheckSpace as Space<MyGame>)
        ,
      { skipIf: 'never' }
    ).do(({ token, letter, actions }) => {
      if(token != $.alleyACheckSpace  && token != $.alleyBCheckSpace) {
        token.first(BackAlleyTile)!.performActionAfterConfirmation(game);

        if(actions > 1) {
          game.followUp({name: 'chooseBackAlleyAction', args: {letter: letter, actions: actions-1}});
        } else {
          $.alleyACheckSpace.first(Check)!.flipped = false;
          $.alleyBCheckSpace.first(Check)!.flipped = false;  
        }
      } else {
        $.alleyACheckSpace.first(Check)!.flipped = false;
        $.alleyBCheckSpace.first(Check)!.flipped = false;
      }
    }),
    
    chooseCandleToMove: (player) => action({
      prompt: 'Choose candle to move',
    }).chooseOnBoard(
      'candle', player.space.all(CustomerCard)
        .filter(x => x.all(CandlePawn).length < x.requiredCandles().length).all(CandlePawn),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'space', ({candle}) => candle.container(CustomerCard)!
        .all(CandleSpace)
        .filter(x => x.all(CandlePawn).length == 0)
        .concat(candle.container(CandleSpace)!)
        ,
      { skipIf: 'never' }
    )
    .do(({ candle, space }) => {
      candle.putInto(space);
      game.message(player.name + ' moves a ' + candle + ' to customer ' + space.container(CustomerCard)! + '.' );
    }),

    chooseCustomerToSwap: (player) => action({
      prompt: 'Choose customers to swap',
    }).chooseOnBoard(
      'customer1', player.space.all(CustomerCard).filter(x => x.customerType != CustomerType.None && x.all(CandlePawn).length == 0),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'customer2', ({customer1}) => [$.customer1, $.customer2, $.customer3, $.customer4],
      { skipIf: 'never' }
    ).do(({ customer1, customer2 }) => {
      const card = customer2.top(CustomerCard)!;
      card.putInto(player.space);
      customer1.putInto(customer2);

      game.message(player.name + ' swaps customer ' + customer1 + ' for ' + card + '.');
    }),

    activateCustomer: (player) => action<{color: Color}>({
      prompt: "Choose customer to activate"
    }).chooseOnBoard(
      'customer', ({ color }) => player.space.all(CustomerCard, {color: color}).concat(player.board.first(CustomerCard)!)
        // filter available customers
        .filter(x => x.isPossible(game, player))
        .filter(x => x.first(CustomerCubeSpace) == undefined || !x.first(CustomerCubeSpace)!.used)
      ,
      { skipIf: 'never' }
    ).do(
      ({ customer, color }) => {
        // perform the customer action
        if(customer.color == Color.White) {
          customer.gainMastery(game, player, color);
        } else {
          customer.first(CustomerCubeSpace)!.used = true;
          customer.peformAbility(game, player);
        }
      }
    ),

    chooseMeltRed: player => action({
      prompt: 'Choose melt to pigment red',
    }).chooseOnBoard(
      'melt', player.board.all(Melt).filter(x => x.canTakeColor(Color.Red)),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      melt.mix(Color.Red);

      game.message(player.name + ' mixes red and makes a ' + melt + '.');
    }),
    chooseMeltYellow: player => action({
      prompt: 'Choose melt to pigment yellow',
    }).chooseOnBoard(
      'melt', player.board.all(Melt).filter(x => x.canTakeColor(Color.Yellow)),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      melt.mix(Color.Yellow);

      game.message(player.name + ' mixes yellow and makes a ' + melt + '.');
    }),
    chooseMeltBlue: player => action({
      prompt: 'Choose melt to pigment blue',
    }).chooseOnBoard(
      'melt', player.board.all(Melt).filter(x => x.canTakeColor(Color.Blue)),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      melt.mix(Color.Blue);

      game.message(player.name + ' mixes blue and makes a ' + melt + '.');
    }),

    chooseMeltManyRed: player => action({
      prompt: 'Choose melt(s) to pigment red',
    }).chooseOnBoard(
      'melts', player.board.all(Melt).filter(x => x.canTakeColor(Color.Red)),
      { skipIf: 'never', min: 1, max: 8 }
    ).do(({ melts }) => {
      var points = 0;
      melts.forEach(x => {
        x.mix(Color.Red);
        if($.pigmentSpillArea.all(Pigment).length < 10) {
          $.bag.first(Pigment, {color: Color.Red})?.putInto($.pigmentSpillArea);
          player.increaseScore();
          points++;
        }
      });
      game.message(player.name + ' mixes red into ' + melts.length + ' melts.');
      game.message(points+ ' red pigments spill and ' + player.name + ' scores ' + points + ' points');
    }),
    chooseMeltManyYellow: player => action({
      prompt: 'Choose melt(s) to pigment yellow',
    }).chooseOnBoard(
      'melts', player.board.all(Melt).filter(x => x.canTakeColor(Color.Yellow)),
      { skipIf: 'never', min: 1, max: 8 }
    ).do(({ melts }) => {
      var points = 0;
      melts.forEach(x => {
        x.mix(Color.Yellow);
        if($.pigmentSpillArea.all(Pigment).length < 10) {
          $.bag.first(Pigment, {color: Color.Yellow})?.putInto($.pigmentSpillArea);
          player.increaseScore();
          points++;
        }
      });
      game.message(player.name + ' mixes yellow into ' + melts.length + ' melts.');
      game.message(points + ' yellow pigments spill and ' + player.name + ' scores ' + points+ ' points');
    }),
    chooseMeltManyBlue: player => action({
      prompt: 'Choose melt(s) to pigment blue',
    }).chooseOnBoard(
      'melts', player.board.all(Melt).filter(x => x.canTakeColor(Color.Blue)),
      { skipIf: 'never', min: 1, max: 8 }
    ).do(({ melts }) => {
      var points = 0;
      melts.forEach(x => {
        x.mix(Color.Blue);
        if($.pigmentSpillArea.all(Pigment).length < 10) {
          $.bag.first(Pigment, {color: Color.Blue})?.putInto($.pigmentSpillArea);
          player.increaseScore();
          points++;
        }
      });
      game.message(player.name + ' mixes blue into ' + melts.length + ' melts.');
      game.message(points + ' blue pigments spill and ' + player.name + ' scores ' + points + ' points');
    }),

    chooseRedOrWhiteMelt: player => action({
      prompt: 'Choose red melt or white melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Red}).concat(player.board.all(Melt, {color: Color.White})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      game.message(player.name + ' molds a ' + melt + ' into 2 ' + melt.color + ' candles.');
      player.gainCandle(melt);      
    }),
    chooseYellowOrWhiteMelt: player => action({
      prompt: 'Choose yellow melt or white melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Yellow}).concat(player.board.all(Melt, {color: Color.White})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      game.message(player.name + ' molds a ' + melt + ' into 2 ' + melt.color + ' candles.');
      player.gainCandle(melt);      
    }),
    chooseBlueOrWhiteMelt: player => action({
      prompt: 'Choose blue melt or white melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Blue}).concat(player.board.all(Melt, {color: Color.White})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      game.message(player.name + ' molds a ' + melt + ' into 2 ' + melt.color + ' candles.');
      player.gainCandle(melt);      
    }),
    chooseOrangeOrBlackMelt: player => action({
      prompt: 'Choose orange melt or black melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Orange}).concat(player.board.all(Melt, {color: Color.Black})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      game.message(player.name + ' molds a ' + melt + ' into 2 ' + melt.color + ' candles.');
      player.gainCandle(melt);      
    }),
    chooseGreenOrBlackMelt: player => action({
      prompt: 'Choose green melt or black melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Green}).concat(player.board.all(Melt, {color: Color.Black})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      game.message(player.name + ' molds a ' + melt + ' into 2 ' + melt.color + ' candles.');
      player.gainCandle(melt);      
    }),
    choosePurpleOrBlackMelt: player => action({
      prompt: 'Choose purple melt or black melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Purple}).concat(player.board.all(Melt, {color: Color.Black})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      game.message(player.name + ' molds a ' + melt + ' into 2 ' + melt.color + ' candles.');
      player.gainCandle(melt);      
    }),

    placeCandle: player => action({
      prompt: 'Place the candle',
      condition: $.ready.first(WorkerPiece)! instanceof CandlePawn
    }).chooseOnBoard(
      'space', player.space.all(CandleSpace, {color: $.ready.first(WorkerPiece)?.color})
        .filter(x => x.all(CandlePawn).length == 0) ,
      { skipIf: 'never' }
    ).do(({ space }) => {
      const card = space.container(CustomerCard)!
      const candle = $.ready.first(CandlePawn)!
      card.placeCandle(candle);

      game.message(player.name + ' places a ' + candle + ' on customer ' + card + '.');
      if(card.all(CandlePawn).length == card.requiredCandles().length && card.requiredCandles().length == 3) {
        game.drawTopCustomer().putInto(player.space);

        game.message(player.name + ' finishes customer ' + card + ' and draws a new card.');
      }
      game.followUp({name: 'activateCustomer', args: {color: space.color}});
    }),

    placeWhiteCandle: player => action({
      prompt: 'Place the candle',
      condition: $.ready.first(WorkerPiece)! instanceof CandlePawn
    }).chooseOnBoard(
      'space', player.space.all(CandleSpace)
        .filter(x => x.all(CandlePawn).length == 0),
      { skipIf: 'never' }
    ).do(({ space }) => {
      const card = space.container(CustomerCard)!
      const candle = $.ready.first(CandlePawn)!
      candle.putInto(space);

      game.message(player.name + ' places a ' + candle + ' on customer ' + card + '.');
      if(card.all(CandlePawn).length == card.requiredCandles().length && card.requiredCandles().length == 3) {
        game.drawTopCustomer().putInto(player.space);

        game.message(player.name + ' finishes customer ' + card + ' and draws a new card.');
      }
      player.increaseMastery(1);
      game.message(player.name + ' gains 1 mastery.');
    }),

    placeWorker: (player) => action({
      prompt: 'Use the worker',
      condition: $.ready.all(WorkerPiece).length > 0 && !player.placedWorker
    }).chooseOnBoard(
      'space', game.all(WorkerSpace)
        .filter(x => x.all(WorkerPiece).length == 0 
          || (!x.containsDie() && !x.containsCandle() && $.ready.first(WorkerPiece) instanceof ColorDie)
          || (!x.containsCandle() && $.ready.first(WorkerPiece) && $.ready.first(WorkerPiece) instanceof CandlePawn)
          || (!x.containsCandle() && player.stack && $.ready.first(WorkerPiece) instanceof ColorDie)
        )
        .filter(x => x.color == undefined 
          || x.color == $.ready.first(WorkerPiece)?.color
          || (x.all(WorkerPiece).length == 0 && $.ready.first(WorkerPiece)?.color == Color.Black)
          || (x.top(WorkerPiece) instanceof KeyShape && $.ready.first(WorkerPiece)?.color == Color.Black)
          || (x.top(WorkerPiece) instanceof KeyShape && $.ready.first(WorkerPiece)?.color == Color.Black)
          || (x.top(WorkerPiece) instanceof ColorDie && $.ready.first(WorkerPiece)?.color == Color.Black)
        )
        .concat(game.first(WorkerSpace, {name: 'waxSpill'})!)
        .concat(game.first(WorkerSpace, {name: 'pigmentSpill'})!)
        .concat(game.first(WorkerSpace, {name: 'moldSpill'})!)
        .filter(x => x.name != 'waxMiddle' || game.middleAvailable($.waxRepeater as WorkerSpace, $.waxBackroom as WorkerSpace, $.waxMiddle as WorkerSpace))
        .filter(x => x.name != 'pigmentMiddle' || game.middleAvailable($.pigmentRepeater as WorkerSpace, $.pigmentBackroom as WorkerSpace, $.pigmentMiddle as WorkerSpace))
        .filter(x => x.name != 'moldMiddle' || (
          game.middleAvailable($.moldRepeater as WorkerSpace, $.moldBackroom as WorkerSpace, $.moldMiddle as WorkerSpace)
          && 
          game.currentPlayer().board.all(Melt).length + game.currentPlayer().board.all(CandlePawn).length > 0
        ))
        // advanced filtering        
        .filter(x => x != $.waxOrange || player.board.all(Wax).length >= 2)
        .filter(x => x != $.waxGreen || player.board.all(Wax).length >= 2)
        .filter(x => x != $.waxPurple || player.board.all(Wax).length >= 2)

        .filter(x => x != $.waxRepeater || player.board.all(Wax).length > 0)
        .filter(x => x != $.moldRepeater || player.board.all(Melt).length > 0)
        .filter(x => x != $.moldBackroom || player.board.all(CandlePawn).length > 0)

        
        .filter(x => x != $.pigmentRed || player.board.openingsForColor(Color.Red) > 0)
        .filter(x => x != $.pigmentBlue || player.board.openingsForColor(Color.Blue) > 0)
        .filter(x => x != $.pigmentYellow || player.board.openingsForColor(Color.Yellow) > 0)
        .filter(x => x != $.pigmentOrange ||
            (player.board.openingsForColor(Color.Red) > 0 && player.board.openingsForColor(Color.Yellow) > 0))
        .filter(x => x != $.pigmentGreen ||
            (player.board.openingsForColor(Color.Blue) > 0 && player.board.openingsForColor(Color.Yellow) > 0))
        .filter(x => x != $.pigmentPurple || 
            (player.board.openingsForColor(Color.Blue) > 0 && player.board.openingsForColor(Color.Red) > 0))
        .filter(x => x != $.pigmentRepeater ||
            (player.board.openingsForColor(Color.Red) > 0 || 
             player.board.openingsForColor(Color.Yellow) > 0 || 
             player.board.openingsForColor(Color.Blue) > 0))

        // make sure the candle still exists
        .filter(x => x != $.moldRepeater ||
          player.board.all(Melt).map(y => game.all(Candelabra, {color: y.color}).all(CandlePawn).length > 0  ? 1 : 0)
          .reduce((sum, current) => sum + current, 0) > 0)

        .filter(x => x != $.moldRed ||
           (
            (player.board.all(Melt, {color: Color.White}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.White}).length > 1) ||
            (player.board.all(Melt, {color: Color.Red}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.Red}).length > 1)
           )
        )
        .filter(x => x != $.moldYellow ||
          (
           (player.board.all(Melt, {color: Color.White}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.White}).length > 1) ||
           (player.board.all(Melt, {color: Color.Yellow}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.Yellow}).length > 1)
          )
        )
        .filter(x => x != $.moldBlue ||
          (
           (player.board.all(Melt, {color: Color.White}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.White}).length > 1) ||
           (player.board.all(Melt, {color: Color.Blue}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.Blue}).length > 1)
          )
        )
        .filter(x => x != $.moldOrange ||
          (
           (player.board.all(Melt, {color: Color.Black}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.Black}).length > 1) ||
           (player.board.all(Melt, {color: Color.Orange}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.Orange}).length > 1)
          )
        )
        .filter(x => x != $.moldGreen ||
          (
           (player.board.all(Melt, {color: Color.Black}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.Black}).length > 1) ||
           (player.board.all(Melt, {color: Color.Green}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.Green}).length > 1)
          )
        )
        .filter(x => x != $.moldPurple ||
          (
           (player.board.all(Melt, {color: Color.Black}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.Black}).length > 1) ||
           (player.board.all(Melt, {color: Color.Purple}).length > 0 && game.all(Candelabra).all(CandlePawn, {color: Color.Purple}).length > 1)
          )
        ),
        { skipIf: 'never' }
    ).do(({ space }) => {
      player.stack = false;

      const worker = $.ready.first(WorkerPiece)!;    

      if(![$.waxSpill, $.pigmentSpill, $.moldSpill].includes(space) && space.all(WorkerPiece).length > 0 &&
      (
        (worker instanceof CandlePawn && space.top(WorkerPiece)! instanceof ColorDie) ||
        (worker instanceof CandlePawn && space.top(WorkerPiece)! instanceof KeyShape) ||
        (worker instanceof ColorDie && space.top(WorkerPiece)! instanceof ColorDie) ||
        (worker instanceof ColorDie && space.top(WorkerPiece)! instanceof KeyShape)
      )) {        
        const top = space.all(ColorDie).length > 0 ? space.first(ColorDie)! : space.first(KeyShape)!;

        /*if(player.space.all(CaptureTile).filter(x => x.flipped).length > 0) {
          game.followUp({name: 'confirmFreeCapture', args: {top: top, space: space}});
        } else*/ if(player.currentMastery() >= game.currentRound()) {
          game.followUp({name: 'confirmCapture', args: {top: top, space: space}});
        }
      }
        
      // will do this also AFTER a confirmation is made
      worker.putInto(space);
      player.placedWorker = true;
    }),

    confirmCapture: (player) => action<{top: WorkerPiece, space: WorkerSpace}>({
      prompt: 'Would you like to spend ' + game.currentRound() + ' mastery to capture the top worker?',
    }).chooseFrom(
      "choice", ['Yes', 'No'], 
      { skipIf: 'never' }
    ).do(({choice, top, space}) => {
      if(choice == 'Yes') {
        player.decreaseMastery(game.currentRound());
        game.doCapture(player, top, space);
      }
    }),

    confirmFreeCapture: (player) => action<{top: WorkerPiece, space: WorkerSpace}>({
      prompt: 'Would you like to use your capture token to capture the top worker?',
    }).chooseFrom(
      "choice", ['Yes', 'No'], 
      { skipIf: 'never' }
    ).do(({choice, top, space}) => {
      if(choice == 'Yes') {
        player.space.first(CaptureTile)!.flipped = false;
        game.doCapture(player, top, space);
      }
    }),

    choosePassAction: (player) => action({
      prompt: 'Choose pass action',
      condition: player.pass,      
    }).chooseFrom(
      "choice", ['Gain Wax', 'Draw Customer', 'Earn Prestige'], 
      { skipIf: 'never' }
    ).do(({choice}) => {
      switch(choice) {
        case 'Gain Wax': {
          player.gainWax(1);
          break;
        }
        case 'Draw Customer': {
          game.drawTopCustomer().putInto(player.space);
          break;
        }
        case 'Earn Prestige': {
          player.increaseScore(1)
          break;
        }
      }
      player.finished = true;
    }),

    pass: (player) => action({
      prompt: 'Pass',
      condition: !player.placedWorker && !player.pass,
    }).do(() => {
      player.pass = true;
      player.placedWorker = true;
      player.finished = true;

      // const cube = game.first(PlayerOrderCube, {index: game.players.indexOf(player)})!;
      // cube.putInto(game.nextAvailablePlayerOrderPass());

      game.message(player.name + ' passes.');
    }),

    goodGame: (player) => action({
      prompt: 'Say good game',
    }).chooseFrom(
      "words", ['gg!'], 
      { skipIf: 'never' }
    ).do(() => {
      game.message(player.name + ' says good game.');      

      // if(!player.finalScore) {
      //   game.calculatePlayerFinalScore(player);
      //   player.finalScore = true;
      // }
    }),

    finish: (player) => action({
      prompt: 'Finish',
      condition: !player.pass && player.placedWorker,
    }).do(() => {
      player.finished = true;
    }),

    chooseDiceToRoll: (player) => action({
      prompt: 'Choose dice to roll',
    }).chooseOnBoard(
      'dice', player.board.all(ColorDie),
      { skipIf: 'never', min: 1, max: 11 }
    ).do(({ dice }) => {
      dice.forEach(x => x.roll());

      game.message(player.name + ' rolls their dice.');
    }),

    chooseDieToSet: (player) => action({
      prompt: 'Choose die to set and color',
    }).chooseOnBoard(
      'die', player.board.all(ColorDie),
      { skipIf: 'never' }
    )
    .chooseFrom(
      "color", ['Red', 'Yellow', 'Blue', 'Orange', 'Green', 'Purple'], 
      { skipIf: 'never' }
    )
    .do(({ die, color }) => {
      die.color = Color[color]

      game.message(player.name + ' sets a die to ' + die.color + '.');
    }),

    // confirmAction: (player) => action<{tile: BackAlleyTile}>({
    //   prompt: 'Do you want to perform the bonus?',
    // }).chooseFrom(
    //   "choice", ({tile}) => [tile.name, 'Skip'], 
    //   { skipIf: 'never' }
    // ).do(({ choice, tile }) => {
    //   if(choice != 'Skip') {
    //     tile.performActionAfterConfirmation(game);
    //   }
    // }),

    choosePigmentsToRemove: (player) => action({
      prompt: 'Choose melt to remove pigments',
    }).chooseOnBoard(
      'melt', player.board.all(Melt).filter(x => x.color != Color.White),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      game.followUp({name: 'chooseColorToRemove', args: {melt: melt}})
    }),

    chooseColorToRemove: (player) => action<{melt: Melt}>({
      prompt: 'Choose color to remove',
    }).chooseFrom(
      "color", ({melt}) => ['Red', 'Yellow', 'Blue', 'Finish']
        .filter(x => x != 'Red' || melt.hasColor(Color.Red))
        .filter(x => x != 'Yellow' || melt.hasColor(Color.Yellow))
        .filter(x => x != 'Blue' || melt.hasColor(Color.Blue))
        , 
      { skipIf: 'never' }
    )
    .do(({ melt, color }) => {
      switch(color) {
        case 'Red': {
          melt.unmix(Color.Red);
          player.increaseScore();

          game.message(player.name + ' removes a red and makes a ' + melt + '.');
          break;
        }
        case 'Blue': {
          melt.unmix(Color.Blue);
          player.increaseScore();

          game.message(player.name + ' removes a blue and makes a ' + melt + '.');
          break;
        }
        case 'Yellow': {
          melt.unmix(Color.Yellow);
          player.increaseScore();

          game.message(player.name + ' removes a yellow and makes a ' + melt + '.');
          break;
        }
      }
      if(color != 'Finish') {
        game.followUp({name: 'chooseColorToRemove', args: {melt: melt}})
      }
    }),

    chooseOneSpiltMelt: (player) => action({
      prompt: 'Choose spilt melt to buy',
    }).chooseOnBoard(
      'melt', $.meltSpillArea.all(Melt),
      { skipIf: 'never' }
    )
    .do(({ melt }) => {
      melt.putInto(player.nextEmptySpace());
      player.board.first(Wax)?.putInto($.bag);
      player.board.first(Wax)?.putInto($.bag);

      game.message(player.name + ' spends 2 wax for 1 spilt melt.');
    }),

    chooseMiddleAction: () => action<{workerSpace: WorkerSpace}>({
      prompt: "Choose which action to perform",
    }).chooseFrom(
      'action', ({ workerSpace }) => ['Mastery', 'Backroom']
        .filter(x => workerSpace.building != Building.Wax || x != 'Mastery' || game.currentPlayer().board.all(Wax).length > 0)
        .filter(x => workerSpace.building != Building.Pigment || x != 'Mastery' ||
          game.currentPlayer().board.openingsForColor(Color.Red) > 0 || 
          game.currentPlayer().board.openingsForColor(Color.Yellow) > 0 || 
          game.currentPlayer().board.openingsForColor(Color.Blue) > 0)
        .filter(x => workerSpace.building != Building.Mold || x != 'Mastery' || game.currentPlayer().board.all(Melt).length > 0)
        .filter(x => workerSpace.building != Building.Mold || x != 'Backroom' || game.currentPlayer().board.all(CandlePawn).length > 0),
        { skipIf: 'never' }
    ).do(
      ({ action, workerSpace }) => {
        if(workerSpace != undefined) {
          workerSpace.color = workerSpace.top(WorkerPiece)?.color;
        }
                
        if(action == 'Mastery') {          
          game.performMastery(workerSpace.building);
        } else {
          game.followUp({name: 'chooseBackroomAction', args: {building: workerSpace.building, usedSpaces: []}});
        }
      }
    ),

    choosePigmentColor2: (player) => action<{firstChoice: boolean}>({
      prompt: 'Choose melt and pigment color'
    }).chooseOnBoard(
      'melt', () => player.board.all(Melt),
      { skipIf: 'never' }
    ).chooseFrom(
      "color", ({firstChoice}) => ['Red', 'Yellow', 'Blue', 'Finish']
        .filter(x => x == 'Red' && player.board.all(Melt).map(x => x.canTakeColor(Color.Red) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0 ? false : true)
        .filter(x => x == 'Yellow' && player.board.all(Melt).map(x => x.canTakeColor(Color.Yellow) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0 ? false : true)
        .filter(x => x == 'Blue' && player.board.all(Melt).map(x => x.canTakeColor(Color.Blue) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0 ? false : true)
        .filter(x => x == 'Finish' && firstChoice ? false : true)
        ,
      { skipIf: 'never' }
    ).do(
      ({ melt, color }) => {
        switch(color) {
          case 'Red': {
            melt.mix(Color.Red);
            game.message(player.name + ' mixes red and makes a ' + melt);
            break;
          }
          case 'Blue': {
            melt.mix(Color.Blue);
            game.message(player.name + ' mixes blue and makes a ' + melt);
            break;
          }
          case 'Yellow': {
            melt.mix(Color.Yellow);
            game.message(player.name + ' mixes yellow and makes a ' + melt);
            break;
          }
        }
      }
    ),

    choosePigmentColor: (player) => action<{remaining: number}>({
      prompt: 'Choose pigment to mix'
    }).chooseOnBoard(
      'pigment', () => $.pigmentMasteryArea.all(Pigment)
        .filter(x => player.board.openingsForColor(x.color!) > 0)
        .map(x => x as Piece<MyGame>)
        .concat(game.all(CheckSpace, {building: Building.Pigment, type: SpaceType.Mastery}).map(x => x.first(Check)!)),
      { skipIf: 'never' }
    ).do(({pigment, remaining}) => {
      if(pigment instanceof Pigment) {
        game.followUp({name: 'chooseMeltToMixIntoFromMastery', args: {color: pigment.color!, remaining: remaining-1}})
      } else {
        $.pigmentMasteryArea.all(Pigment).hideFromAll();
        game.first(CheckSpace, {building: Building.Pigment, type: SpaceType.Mastery})!.top(Check)!.flipped = false;
      }
    }),

    chooseMeltToMixIntoFromMastery: (player) => action<{color: Color, remaining: number}>({
      prompt: 'Choose melt to mix into'
    }).chooseOnBoard(
      'melt', ({color}) => player.board.all(Melt).filter(x => x.canTakeColor(color)),
      { skipIf: 'never' }
    ).do(({color, melt, remaining}) => {
      if(color != undefined) {
        melt.mix(color);        
        game.message(player.name + ' mixes a ' + color + ' pigment to make a ' + melt + '.');

        if(remaining > 0) {
          game.first(CheckSpace, {building: Building.Pigment, type: SpaceType.Mastery})!.top(Check)!.flipped = true;
          game.followUp({name: 'choosePigmentColor', args: {remaining: remaining}})
        } else {
          $.pigmentMasteryArea.all(Pigment).hideFromAll();
          game.first(CheckSpace, {building: Building.Pigment, type: SpaceType.Mastery})!.top(Check)!.flipped = false;
        }
      }
    }),


    chooseMeltToMixInto: (player) => action<{color: Color}>({
      prompt: 'Choose melt to mix into'
    }).chooseOnBoard(
      'melt', ({color}) => player.board.all(Melt).filter(x => x.canTakeColor(color)),
      { skipIf: 'never' }
    ).do(({color, melt}) => {
      if(color != undefined) {
        melt.mix(color);        
        game.message(player.name + ' mixes a ' + color + ' pigment to make a ' + melt + '.');

        const openings = $.pigmentSpillArea.all(Pigment).map(x => game.currentPlayer().board.openingsForColor(x.color!)).reduce((sum, current) => sum + current, 0);
        if(openings > 0) {
          game.followUp({name: 'chooseSpiltPigment'})
        } else {
          game.first(CheckSpace, {building: Building.Pigment, type: SpaceType.Spill})!.top(Check)!.flipped = false;
        }
      }
    }),

    chooseSpiltPigment: (player) => action({
      prompt: 'Choose pigment to mix'
    }).chooseOnBoard(
      'pigment', () => $.pigmentSpillArea.all(Pigment)
        .filter(x => player.board.openingsForColor(x.color!) > 0)
        .map(x => x as Piece<MyGame>)
        .concat(game.all(CheckSpace, {building: Building.Pigment, type: SpaceType.Spill}).map(x => x.first(Check)!)),
      { skipIf: 'never' }
    ).do(({pigment}) => {
      if(pigment instanceof Pigment) {
        pigment.putInto($.bag);
        game.followUp({name: 'chooseMeltToMixInto', args: {color: pigment.color!}})
      } else {
        game.first(CheckSpace, {building: Building.Pigment, type: SpaceType.Spill})!.top(Check)!.flipped = false;
      }
    }),



    // choose backroom action based on building, the type, and what spaces have already been used
    chooseBackroomAction: (player) => action<{building : Building, usedSpaces: Space<MyGame>[]}>({
      prompt: 'Choose next action to perform',
    }).chooseOnBoard(
      'chosenSpace', ({building, usedSpaces}) => 
        // return the worker space and add in the back alley spaces
        [game.first(WorkerSpace, {building: building, spaceType: SpaceType.Backroom})! as Space<MyGame>]
          .concat(game.all(BackAlleySpace, {building: building}).filter(x => x.first(BackAlleyTile)!.isPossible(game, player)).map(x => x as Space<MyGame>))
          // filter out already used spaces
          .filter(x => !usedSpaces.includes(x))
          .concat(game.all(CheckSpace, {building: building, type: SpaceType.Backroom})!.filter(x => x.first(Check)!.flipped)),
      { skipIf: 'never' }
    )
    .do(({ building, usedSpaces, chosenSpace }) => {    

      // if it is a check, then do nothing
      if(chosenSpace instanceof CheckSpace) {
        chosenSpace.first(Check)!.flipped = false;
        return;
      }

      // if it is a worker space, do the normal work
      else if(chosenSpace instanceof WorkerSpace) {
                
        if(chosenSpace != undefined) {
          const workerSpace = chosenSpace as WorkerSpace;
          workerSpace.color = chosenSpace.top(WorkerPiece)?.color;
        }

        game.performBackroom(building, chosenSpace)
      } 
      // otherwise perform the back alley tile action
      else {
        chosenSpace.first(BackAlleyTile)!.performAction(game);
      }

      // what were the choices again?
      const choiceSpaces = [game.first(WorkerSpace, {building: building, spaceType: SpaceType.Backroom})! as Space<MyGame>]
        .concat(game.all(BackAlleySpace, {building: building}).map(x => x as Space<MyGame>))
        .filter(x => !usedSpaces.includes(x));

      // if there are stil more things you can do, keep going
      if(choiceSpaces.filter(x => x != chosenSpace).length > 0) {
        const nextList = usedSpaces.concat(chosenSpace);
        if(nextList.filter(x => x instanceof WorkerSpace).length > 0) {
          game.first(CheckSpace, {building: building, type: SpaceType.Backroom})!.first(Check)!.flipped = true; // allow cancel
        }        
        game.followUp({name: 'chooseBackroomAction', args: {building: building, usedSpaces: nextList}})
      } else {
        game.first(CheckSpace, {building: building, type: SpaceType.Backroom})!.first(Check)!.flipped = false;
      }
    }),

    chooseSpiltMelts: (player) => action({
      prompt: 'Choose spilt melts to buy',
    }).chooseOnBoard(
      'melts', $.meltSpillArea.all(Melt),
      { skipIf: 'never', min: 1, max: player.board.all(Wax).length >= 5 ? 3 : (player.board.all(Wax).length >= 3 ? 2: 1) }
    )
    .do(({ melts }) => {
      melts.forEach(x => x.putInto(player.nextEmptySpace()));
      switch(melts.length) {
        case 1: {
          player.board.first(Wax)?.putInto($.bag); 
          
          game.message(player.name + ' spends 1 wax to take 1 melt from the spill.');
          break;
        }
        case 2: {
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);

          game.message(player.name + ' spends 3 wax to take 2 melts from the spill.');
          break;
        }
        case 3: {
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);

          game.message(player.name + ' spends 5 wax to take 3 melts from the spill.');
          break;
        }
      }
    }),

    usePower: (player) => action({
      prompt: 'Use a power tile',
      condition: player.diceCount() > 0 && !player.pass && !player.placedWorker,
    }).chooseOnBoard(
      'power', player.board.all(PowerTile, {flipped: true}),
      { skipIf: 'never' }
    ).do(({ power }) => {
      switch(power.name) {
        case 'roll': {
          game.followUp({name: 'chooseDiceToRoll'});
          break;
        }
        case 'set': {
          game.followUp({name: 'chooseDieToSet'});
          break;    
        }
        case 'stack': {
          player.stack = true;

          game.message(player.name + ' uses their stack power.');
          break;
        }
      }
      power.flipped = false;
    }),

    discardExtraCustomers: (player) => action({
      prompt: 'Discard down to 8 customers',
    }).chooseOnBoard(
      'customers', player.space.all(CustomerCard).filter(x => x.customerType != CustomerType.None),
      { skipIf: 'never', number: player.customerCount() - 8 }
    ).do(({ customers }) => {
      customers.forEach(customer=> {      
        // throw out any candles on it
        customer.all(CandlePawn).forEach(x => {
          x.putInto($.bag);
        })
        customer.putInto($.bag);
      })
      game.message(player.name + ' discards down to 8 customers.');
    }),

    discardExtraComponents: (player) => action({
      prompt: 'Discard down to 8 components',
    }).chooseOnBoard(
      'components', player.board.all(ComponentSpace).all(Piece),
      { skipIf: 'never', number: player.componentCount() - 8 }
    ).do(({ components }) => {
      components.forEach(component=> {      
        if(component instanceof KeyShape) {
          const key = component as KeyShape;
          key.putInto(game.first(KeyHook, {color: key.color})!);
        } else if(component instanceof Melt) {
          (component as Melt).color = Color.White;
          component.putInto($.bag);
        } else {
          component.putInto($.bag);
        }
      })

      game.message(player.name + ' discards down to 8 components.');
    }),

    discardExtraGoals: (player) => action({
      prompt: 'Discard down to 3 goals',
    }).chooseOnBoard(
      'goals', player.space.all(GoalCard),
      { skipIf: 'never', number: player.goalCount() - 3 }
    ).do(({ goals }) => {
      goals.forEach(goal=> {              
        goal.putInto($.bag);
      })
      game.message(player.name + ' discards down to 3 goals.');
    }),

    chooseStartingCustomer: (player) => action({
      prompt: 'Choose starting customer',
    }).chooseOnBoard(
      'customer', player.space.all(CustomerCard).filter(x => x.customerType != CustomerType.None),
      { skipIf: 'never' }
    ).do(({ customer }) => {
      player.space.all(CustomerCard)
        .filter(x => x.customerType != CustomerType.None && x != customer)
        .putInto($.bag);

        game.message(player.name + ' chooses their starting customer.');
    }),

    chooseStartingGoal: (player) => action({
      prompt: 'Choose starting goal',
    }).chooseOnBoard(
      'goal', player.space.all(GoalCard),
      { skipIf: 'never' }
    ).do(({ goal }) => {
      player.space.all(GoalCard)
        .filter(x => x != goal)
        .putInto($.bag);

        game.message(player.name + ' chooses their starting goal.');
    }),

    pause: (player) => action({}).do(() => {}),

  });

  game.defineFlow(
    () => game.setupGame(game.players.length),
    
    // allow players to choose their first cards
    eachPlayer({
      name: 'turn', do: [
        ({turn}) => game.setupPlayer(turn),        
        playerActions({ actions: ['chooseStartingCustomer']}),
        playerActions({ actions: ['chooseStartingGoal']}),
      ]
    }),    
    
    // loop game until it is over
    whileLoop({while: () => !game.gameOver, do: ([
      
      () => game.moveToFirstPlayer(),

      // round continues until everyone passes
      whileLoop({while: () => !game.allPlayersPassed(), do: ([        
        () => game.resetTurn(),

        // allow a player to take their turn
        whileLoop({while: () => !game.currentPlayer().finished, do: ([
          ifElse({
            if: () => game.currentPlayer().workerCount() > 0 || game.currentPlayer().pass, do: [
              playerActions({ actions: ['chooseWorker', 'usePower', 'finish', 'choosePassAction', 'pass']}),
            ],          
            else: () => game.endTurn(),
          }),              
          ifElse({
            if: () => !game.gameOver && $.ready.all(WorkerPiece).length > 0, do: [
              playerActions({ actions: ['placeWorker', 'placeCandle', 'sellCandle']}),          
          ]}),          
        ])}),

        // try to relocate dice
        () => game.relocateDice(),

        // discard down to 8 customers
        ifElse({
          if: () => game.currentPlayer().customerCount() > 8, do: [playerActions({ actions: ['discardExtraCustomers']})
        ]}),

        // discard down to 8 components
        ifElse({
          if: () => game.currentPlayer().componentCount() > 8, do: [playerActions({ actions: ['discardExtraComponents']})
        ]}),

        // discard down to 3 goals
        ifElse({
          if: () => game.currentPlayer().goalCount() > 3, do: [playerActions({ actions: ['discardExtraGoals']})
        ]}),

        // make sure to pull any floating pieces back to the board
        () => game.collectComponents(),
          
        // move to the next player
        () => game.players.next(),
        // () => game.nextPlayerInTurnOrder(),
      ])}),
            
      // check round end goals
      eachPlayer({name: 'turn', do: [
        playerActions({actions: ['pause']}),
        () => game.roundEndLoop = 0,
        loop(
          ifElse({
            if: ({turn}) => game.roundEndLoop >= game.all(RoundEndSpace).all(RoundEndTile, {flipped: true}).length, do: () => Do.break()
          }),
          ifElse({
            if: ({turn}) => game.scoreNextRoundEndTile(turn, game.all(RoundEndSpace).all(RoundEndTile, {flipped: true})[game.roundEndLoop]), do: playerActions({actions: ['pause']})
          }),
          () => game.roundEndLoop = game.roundEndLoop + 1
        )
      ]}),

      // eachPlayer({name: 'turn', do: [        
      //   ({turn}) => game.message('Check round end goals for ' + turn.name),
      //   forLoop({name: 'x', initial: 0, next: x => x + 1, while: x => x < game.all(RoundEndSpace).all(RoundEndTile, {flipped: true}).length, do: ({ x }) => {
      //     ifElse({
      //       if: ({turn}) => game.scoreNextRoundEndTile(turn, game.all(RoundEndSpace).all(RoundEndTile, {flipped: true})[x]), do: playerActions({actions: ['pause']})
      //     })
      //   }})
      // ]}),

      // now flip all scored round end tiles over
      () => game.all(RoundEndSpace).all(RoundEndTile, {scored: true}).forEach(x => x.flipped = false),

      // finish the round
      () => game.endRound(),                 
    ])}),

    // move player order cubes up
    // () => game.movePlayerOrderUp(),

    // reveal private goals
    () => game.all(GoalCard).forEach(x => x.showToAll()),

    // score for customers
    eachPlayer({name: 'turn', do: [
      playerActions({actions: ['pause']}),
      loop(ifElse({
        if: ({turn}) => game.scoreNextCustomer(turn), do: playerActions({actions: ['pause']}), else: () => Do.break()
      }))
    ]}),

    // score for mastery
    eachPlayer({name: 'turn', do: [
      playerActions({actions: ['pause']}),
      ({turn}) => game.scoreForMastery(turn),
    ]}),

    // score for goals
    eachPlayer({name: 'turn', do: [
      playerActions({actions: ['pause']}),
      loop(ifElse({
        if: ({turn}) => game.scoreNextGoal(turn), do: playerActions({actions: ['pause']}), else: () => Do.break()
      }))
    ]}),

    // score for player order
    // eachPlayer({name: 'turn', do: [
    //   playerActions({actions: ['pause']}),
    //   ({turn}) => game.scoreForPlayerOrder(turn),
    // ]}),

    // score for end game
    eachPlayer({name: 'turn', do: [
      playerActions({actions: ['pause']}),
      ifElse({if: ({turn}) => game.scoreEndGameTile(turn, 3), do: playerActions({actions: ['pause']})}),
      ifElse({if: ({turn}) => game.scoreEndGameTile(turn, 2), do: playerActions({actions: ['pause']})}),
      ifElse({if: ({turn}) => game.scoreEndGameTile(turn, 1), do: playerActions({actions: ['pause']})})
    ]}),

    () => game.announceWinner()
  );
});
