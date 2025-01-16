import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';
import { read } from 'fs';
import { constants } from 'os';
import { isNativeError } from 'util/types';
import { WaxBuilding } from './building/wax.js';
import { PigmentBuilding } from './building/pigment.js';
import { MoldBuilding } from './building/mold.js';
import { ChandlersPlayer } from './player.js';
import { CustomerCard, EndGameTile, RoundEndTile, BackAlleyTile, ColorDie, KeyShape, CandlePawn, PowerTile, Wax, WorkerPiece, Pigment, Melt, MasteryCube, ScoreTracker, Bulb, GoalCard, Lamp, Trash, Check } from './components.js';
import { BackAlley, BackAlleySpace, Candelabra, CandleBottomRow, CandleSpace, CandleTopRow, ChandlersBoard, CheckSpace, ComponentSpace, CustomerSpace, DiceSpace, GameEndSpace, GoalSpace, KeyHook, MasterySpace, MasteryTrack, PlayerBoard, PlayerSpace, PlayersSpace, PowerSpace, ReadySpace, RoundEndSpace, RoundSpace, ScoringSpace, ScoringTrack, Spill, WorkerSpace } from './boards.js';
import { count, timeLog } from 'console';

export enum Building {
  Wax = 'wax',
  Pigment = 'pigment',
  Mold = 'mold'
}

export enum SpaceType {
  Color = 'color',
  Mastery = 'mastery',
  Backroom = 'backroom',
  Middle = 'middle',
  Spill = 'spill'
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
  setup: Boolean = false;

  init(): void {    
  }

  currentRound() : number {
    return this.first(Bulb)!.container(RoundSpace)!.round;
  }

  nextRound() : void {
    this.first(Bulb)!.putInto(this.first(RoundSpace, {round: this.currentRound()+1})!);
  }

  checkRoundEndGoals() : void {
    this.all(RoundEndSpace).all(RoundEndTile).forEach(x => {
      if(x.flipped) {
        for(const player of this.players) {
          if(x.achieved(player)) {
            console.log(player.name + ' achieved round end goal: ' + x.name + ' and scores 5 points.')
            this.message(player.name + ' achieved round end goal: ' + x.name + ' and scores 5 points.')
            player.increaseScore(5);
            x.flipped = false;
          }
        }
      }
    })
  }

  allPlayersPassed() : boolean {
    for (const player of this.players) {
      if(!player.pass) {
        return false;
      }
    }
    return true;
  }

  capitalize(color: Color) : string {
    return color.toString().charAt(0).toUpperCase() + color.toString().substring(1)
  }

  currentPlayer() : ChandlersPlayer {
    const pl = this.players.current() as ChandlersPlayer;
    return pl;
  }

  middleAvailable(left: WorkerSpace, right: WorkerSpace, middle: WorkerSpace) : Boolean {
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
          this.followUp({name: 'chooseWaxRepeater'});
          break;
       }
        case Building.Pigment: {
          this.followUp({name: 'choosePigmentColor', args: {firstChoice: true}}); 
          for(var i = 1; i < this.currentPlayer().masteryLevel(); i++) {
            this.followUp({name: 'choosePigmentColor', args: {firstChoice: false}});    
          }
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
          this.followUp({name: 'chooseCustomer'});
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
}

export default createGame(ChandlersPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer, whileLoop, ifElse } = game.flowCommands;

  game.init();

  const bag = game.create(Space, 'bag')
  bag.onEnter(CandlePawn, x => {
    if(!game.setup) {
      bag.first(Trash)!.putInto(game.first(Candelabra, {color: x.color})!);
    }
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
  
  goalDeck.shuffle();

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
  $.drawCustomer.create(CustomerCard, 'audacity', {scoring: [2, 4, 8, 14], customerType: CustomerType.Adventurer, color: Color.Green, data: "bgpx"})
  $.drawCustomer.create(CustomerCard, 'bamboozle', {scoring: [1, 4, 8], customerType: CustomerType.Charlatan, color: Color.Blue, data: "brp"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-autumn', {scoring: [2, 4, 7, 13], customerType: CustomerType.Priest, color: Color.Orange, data: "brgo"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-heaven', {scoring: [2, 4, 7, 13], customerType: CustomerType.Priest, color: Color.Blue, data: "bypo"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-midnight', {scoring: [1, 4, 8], customerType: CustomerType.Priest, color: Color.Purple, data: "rpo"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-moonlight', {scoring: [2, 4, 7, 13], customerType: CustomerType.Priest, color: Color.Yellow, data: "yrgo"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-spring', {scoring: [1, 4, 9], customerType: CustomerType.Priest, color: Color.Green, data: "bgx"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-summer', {scoring: [2, 4, 7, 13], customerType: CustomerType.Priest, color: Color.Red, data: "wyrx"})
  $.drawCustomer.create(CustomerCard, 'broker', {scoring: [2, 4, 7, 13], customerType: CustomerType.Merchant, color: Color.Blue, data: "byrp"})
  $.drawCustomer.create(CustomerCard, 'bypass', {scoring: [2, 4, 7, 13], customerType: CustomerType.Cartographer, color: Color.Yellow, data: "bygo"})
  $.drawCustomer.create(CustomerCard, 'cleansing-flood', {scoring: [2, 4, 8, 14], customerType: CustomerType.Witch, color: Color.Blue, data: "bgpo"})
  $.drawCustomer.create(CustomerCard, 'cutoff', {scoring: [1, 3, 7], customerType: CustomerType.Cartographer, color: Color.Purple, data: "wrp"})
  $.drawCustomer.create(CustomerCard, 'daring', {scoring: [2, 4, 7, 13], customerType: CustomerType.Adventurer, color: Color.Blue, data: "bwrx"})
  $.drawCustomer.create(CustomerCard, 'dealer', {scoring: [1, 3, 7], customerType: CustomerType.Merchant, color: Color.Purple, data: "wyp"})
  $.drawCustomer.create(CustomerCard, 'deception', {scoring: [1, 4, 8], customerType: CustomerType.Rogue, color: Color.Yellow, data: "byx"})
  $.drawCustomer.create(CustomerCard, 'detour', {scoring: [2, 4, 7, 13], customerType: CustomerType.Cartographer, color: Color.Orange, data: "wypo"})
  $.drawCustomer.create(CustomerCard, 'discount', {scoring: [1, 4, 8], customerType: CustomerType.Rogue, color: Color.Blue, data: "byo"})
  $.drawCustomer.create(CustomerCard, 'discovery', {scoring: [1, 4, 9], customerType: CustomerType.Adventurer, color: Color.Purple, data: "rpx"})
  $.drawCustomer.create(CustomerCard, 'double-dip', {scoring: [2, 4, 7, 14], customerType: CustomerType.Rogue, color: Color.Red, data: "bwrp"})
  $.drawCustomer.create(CustomerCard, 'exploit', {scoring: [2, 4, 7, 13], customerType: CustomerType.Rogue, color: Color.Purple, data: "bwpo"})
  $.drawCustomer.create(CustomerCard, 'exploration', {scoring: [1, 4, 8], customerType: CustomerType.Adventurer, color: Color.Orange, data: "wgo"})
  $.drawCustomer.create(CustomerCard, 'grift', {scoring: [2, 4, 7, 13], customerType: CustomerType.Charlatan, color: Color.Orange, data: "bwgo"})
  $.drawCustomer.create(CustomerCard, 'heroism', {scoring: [2, 4, 7, 13], customerType: CustomerType.Adventurer, color: Color.Yellow, data: "byrg"})
  $.drawCustomer.create(CustomerCard, 'hoodwink', {scoring: [2, 4, 7, 13], customerType: CustomerType.Charlatan, color: Color.Red, data: "wrgx"})
  $.drawCustomer.create(CustomerCard, 'infernal-rush', {scoring: [2, 4, 7, 12], customerType: CustomerType.Witch, color: Color.Red, data: "wyro"})
  $.drawCustomer.create(CustomerCard, 'intrepidity', {scoring: [2, 4, 8, 14], customerType: CustomerType.Adventurer, color: Color.Red, data: "rgpo"})
  $.drawCustomer.create(CustomerCard, 'lightning-crash', {scoring: [1, 4, 8], customerType: CustomerType.Witch, color: Color.Yellow, data: "yrx"})
  $.drawCustomer.create(CustomerCard, 'miscount', {scoring: [1, 4, 9], customerType: CustomerType.Rogue, color: Color.Green, data: "gox"})
  $.drawCustomer.create(CustomerCard, 'nourishing-wave', {scoring: [2, 4, 7, 13], customerType: CustomerType.Witch, color: Color.Green, data: "wygx"})
  $.drawCustomer.create(CustomerCard, 'operator', {scoring: [1, 3, 7], customerType: CustomerType.Merchant, color: Color.Orange, data: "bwo"})
  $.drawCustomer.create(CustomerCard, 'passage', {scoring: [1, 4, 8], customerType: CustomerType.Cartographer, color: Color.Green, data: "wgp"})
  $.drawCustomer.create(CustomerCard, 'prince-rohan', {scoring: [2, 4, 7, 12], customerType: CustomerType.Prince, color: Color.Red, data: "bwrg"})
  $.drawCustomer.create(CustomerCard, 'prince-tyrion', {scoring: [2, 4, 8, 14], customerType: CustomerType.Prince, color: Color.Purple, data: "bypx"})
  $.drawCustomer.create(CustomerCard, 'princess-buttercup', {scoring: [2, 4, 8, 14], customerType: CustomerType.Prince, color: Color.Yellow, data: "yrox"})
  $.drawCustomer.create(CustomerCard, 'princess-evergreen', {scoring: [1, 3, 7], customerType: CustomerType.Prince, color: Color.Green, data: "wyg"})
  $.drawCustomer.create(CustomerCard, 'princess-peach', {scoring: [2, 4, 7, 12], customerType: CustomerType.Prince, color: Color.Orange, data: "bwro"})
  $.drawCustomer.create(CustomerCard, 'princess-perrywinkle', {scoring: [2, 4, 7, 12], customerType: CustomerType.Prince, color: Color.Blue, data: "bwyp"})
  $.drawCustomer.create(CustomerCard, 'retailer', {scoring: [2, 4, 7, 13], customerType: CustomerType.Merchant, color: Color.Red, data: "wrox"})
  $.drawCustomer.create(CustomerCard, 'scam', {scoring: [1, 4, 8], customerType: CustomerType.Charlatan, color: Color.Yellow, data: "byg"})
  $.drawCustomer.create(CustomerCard, 'seller', {scoring: [2, 4, 7, 13], customerType: CustomerType.Merchant, color: Color.Green, data: "wygo"})
  $.drawCustomer.create(CustomerCard, 'shadow-strike', {scoring: [2, 4, 7, 13], customerType: CustomerType.Witch, color: Color.Purple, data: "wrgp"})
  $.drawCustomer.create(CustomerCard, 'shortcut', {scoring: [2, 4, 7, 12], customerType: CustomerType.Cartographer, color: Color.Red, data: "wyrg"})
  $.drawCustomer.create(CustomerCard, 'sleight-of-hand', {scoring: [2, 4, 7, 13], customerType: CustomerType.Rogue, color: Color.Orange, data: "wrpo"})
  $.drawCustomer.create(CustomerCard, 'sunlight-surge', {scoring: [2, 4, 7, 13], customerType: CustomerType.Witch, color: Color.Orange, data: "wgpo"})
  $.drawCustomer.create(CustomerCard, 'tomfoolery', {scoring: [1, 4, 8], customerType: CustomerType.Charlatan, color: Color.Purple, data: "wpo"})
  $.drawCustomer.create(CustomerCard, 'trail', {scoring: [2, 4, 7, 13], customerType: CustomerType.Cartographer, color: Color.Blue, data: "bwpx"})
  $.drawCustomer.create(CustomerCard, 'trickery', {scoring: [1, 4, 9], customerType: CustomerType.Charlatan, color: Color.Green, data: "ygx"})
  $.drawCustomer.create(CustomerCard, 'vendor', {scoring: [1, 4, 9], customerType: CustomerType.Merchant, color: Color.Yellow, data: "ypx"})

  // create candle spaces
  $.drawCustomer.all(CustomerCard).forEach(x => {
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
  })

  drawCustomer.shuffle()
  drawCustomer.top(CustomerCard)?.putInto($.customer1)
  drawCustomer.top(CustomerCard)?.putInto($.customer2)
  drawCustomer.top(CustomerCard)?.putInto($.customer3)
  drawCustomer.top(CustomerCard)?.putInto($.customer4)

  // set up the worker spaces
  const waxBuilding = new WaxBuilding()
  waxBuilding.createWorkerSpaces(game);

  const pigmentBuilding = new PigmentBuilding();
  pigmentBuilding.createWorkerSpaces(game);

  const moldBuilding = new MoldBuilding();
  moldBuilding.createWorkerSpaces(game);

  // build out spill areas
  const waxSpillArea = game.create(Spill, 'waxSpillArea');
  const pigmentSpillArea = game.create(Spill, 'pigmentSpillArea');
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

  game.setup = true;

  for(var i = 0; i < 8 + game.players.length-2; i++) {
    $.whiteCandles.create(CandlePawn, 'whiteCandle' + i, {color: Color.White})
  }
  for(var i = 0; i < 6 + game.players.length-2; i++) {
    $.redCandles.create(CandlePawn, 'redCandle' + i, {color: Color.Red})
    $.yellowCandles.create(CandlePawn, 'yellowCandle' + i, {color: Color.Yellow})
    $.blueCandles.create(CandlePawn, 'blueCandle' + i, {color: Color.Blue})
    $.orangeCandles.create(CandlePawn, 'orangeCandle' + i, {color: Color.Orange})
    $.greenCandles.create(CandlePawn, 'greenCandle' + i, {color: Color.Green})
    $.purpleCandles.create(CandlePawn, 'purpleCandle' + i, {color: Color.Purple})
  }
  for(var i = 0; i < 4 + game.players.length-2; i++) {
    $.blackCandles.create(CandlePawn, 'blackCandle' + i, {color: Color.Black})
  }

  // roll random dice to start the round
  
  for(var i = 0; i < 4-game.players.length; i++) {
    Object.values(Building).forEach((building: Building) =>{
      const die = game.create(ColorDie, 'colorDie' + i);
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


  game.create(GameEndSpace, 'gameEndType1')
  game.create(GameEndSpace, 'gameEndType2')
  game.create(GameEndSpace, 'gameEndType3')

  $.gameEndType1.onEnter(EndGameTile, x => {
    x.flipped = false;
  })
  $.gameEndType2.onEnter(EndGameTile, x => {
    x.flipped = false;
  })
  $.gameEndType3.onEnter(EndGameTile, x => {
    x.flipped = false;
  })
  
  game.create(EndGameTile, 'adventurer', {type: CustomerType.Adventurer})
  game.create(EndGameTile, 'charlatan', {type: CustomerType.Charlatan})
  game.create(EndGameTile, 'rogue', {type: CustomerType.Rogue})
  game.create(EndGameTile, 'merchant', {type: CustomerType.Merchant})
  game.create(EndGameTile, 'priest', {type: CustomerType.Priest})
  game.create(EndGameTile, 'prince', {type: CustomerType.Prince})
  game.create(EndGameTile, 'witch', {type: CustomerType.Witch})
  game.create(EndGameTile, 'cartographer', {type: CustomerType.Cartographer})
  game.all(EndGameTile).putInto(bag);
  bag.shuffle()
  bag.first(EndGameTile)?.putInto($.whiteType);
  bag.first(EndGameTile)?.putInto($.redType);
  bag.first(EndGameTile)?.putInto($.yellowType);
  bag.first(EndGameTile)?.putInto($.blueType);
  bag.first(EndGameTile)?.putInto($.orangeType);
  bag.first(EndGameTile)?.putInto($.greenType);
  bag.first(EndGameTile)?.putInto($.purpleType);
  bag.first(EndGameTile)?.putInto($.blackType);

  // rounds
  game.create(RoundSpace, 'round1', {round: 1});
  game.create(RoundSpace, 'round2', {round: 2});
  game.create(RoundSpace, 'round3', {round: 3});
  game.create(RoundSpace, 'round4', {round: 4});

  $.round1.create(Bulb, 'bulb');

  // create some trash cans
  for(var i = 0; i < 64; i++) {
    $.bag.create(Trash, 'trash' + i);
  }

  // round end goals
  game.create(RoundEndSpace, 'roundEndSpace1')
  game.create(RoundEndSpace, 'roundEndSpace2')
  game.create(RoundEndSpace, 'roundEndSpace3')
  game.create(RoundEndSpace, 'roundEndSpace4')
  game.create(RoundEndSpace, 'roundEndSpace5')

  game.create(RoundEndTile, 'customer-satisfaction')
  game.create(RoundEndTile, 'five-colors')
  game.create(RoundEndTile, 'mastery-level-three')
  game.create(RoundEndTile, 'one-by-five')
  game.create(RoundEndTile, 'two-pairs')
  game.create(RoundEndTile, 'three-by-three-otherwise')
  game.create(RoundEndTile, 'three-by-tree-likewise')
  game.create(RoundEndTile, 'two-by-three')
  game.create(RoundEndTile, 'two-by-two-by-color')
  game.create(RoundEndTile, 'two-by-two-by-type')
  game.all(RoundEndTile).putInto(bag);
  bag.shuffle()

  const roundEndSpaces = game.all(RoundEndSpace);
  for(var i = 0; i < game.players.length+1; i++) {
    bag.first(RoundEndTile)?.putInto(roundEndSpaces[i]);  
  }

  // back alley
  game.create(BackAlleySpace, 'backAlleySpaceA1', {letter: "A"});
  game.create(BackAlleySpace, 'backAlleySpaceA2', {letter: "A"});
  game.create(BackAlleySpace, 'backAlleySpaceA3', {letter: "A"});
  game.create(BackAlleySpace, 'backAlleySpaceA4', {letter: "A"});

  game.create(BackAlley, 'backAlleyA', {letter: "A"});

  game.create(BackAlleySpace, 'backAlleySpaceB1', {letter: "B"});
  game.create(BackAlleySpace, 'backAlleySpaceB2', {letter: "B"});
  game.create(BackAlleySpace, 'backAlleySpaceB3', {letter: "B"});
  game.create(BackAlleySpace, 'backAlleySpaceB4', {letter: "B"});

  game.create(BackAlley, 'backAlleyB', {letter: "B"});

  game.create(BackAlleySpace, 'waxBackAlleySpaceA', {building: Building.Wax});
  const waxCheckSpace = game.create(CheckSpace, 'waxBackroomCheckSpace', {building: Building.Wax});
  const waxCheck = waxCheckSpace.create(Check, 'waxBackroomCheck');

  game.create(BackAlleySpace, 'pigmentBackAlleySpaceA', {building: Building.Pigment});
  game.create(BackAlleySpace, 'pigmentBackAlleySpaceB', {building: Building.Pigment});
  const pigmentCheckSpace = game.create(CheckSpace, 'pigmentBackroomCheckSpace', {building: Building.Pigment});
  const pigmentCheck = pigmentCheckSpace.create(Check, 'pigmentBackroomCheck');

  game.create(BackAlleySpace, 'moldBackAlleySpaceB', {building: Building.Mold});
  const moldCheckSpace = game.create(CheckSpace, 'moldBackroomCheckSpace', {building: Building.Mold});
  const moldCheck = moldCheckSpace.create(Check, 'moldBackroomCheck');

  const refreshCustomers = game.create(BackAlleyTile, 'refresh-customers', {letter: "A"});
  const meltWax = game.create(BackAlleyTile, 'melt-wax', {letter: "A"});
  const purchaseSpiltWax = game.create(BackAlleyTile, 'purchace-spilt-wax', {letter: "A"});
  const convertKeyToDie = game.create(BackAlleyTile, 'convert-key-to-die', {letter: "A"});
  const moveCandle = game.create(BackAlleyTile, 'move-candle', {letter: "A"});
  const swapCustomer = game.create(BackAlleyTile, 'swap-customer', {letter: "A"});

  const addPigment = game.create(BackAlleyTile, 'add-pigment', {letter: "B"});
  const advanceMastery = game.create(BackAlleyTile, 'advance-mastery', {letter: "B"});
  const gainGoalCard = game.create(BackAlleyTile, 'gain-goal-card', {letter: "B"});
  const placeWhiteCandle = game.create(BackAlleyTile, 'place-white-candle', {letter: "B"});
  const removePigment = game.create(BackAlleyTile, 'remove-pigment', {letter: "B"});
  const twoWax = game.create(BackAlleyTile, 'two-wax', {letter: "B"});

  game.all(BackAlleyTile).putInto(bag);
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

    for(var l = 1; l <= 20; l++) {
      playerBoard.create(ComponentSpace, 'p' + i + 'Component' + l, {num: l});
    }

    const playerDie1 = playerBoard.create(DiceSpace, 'p' + i + 'Die1');
    const playerDie2 = playerBoard.create(DiceSpace, 'p' + i + 'Die2');
    const playerDie3 = playerBoard.create(DiceSpace, 'p' + i + 'Die3');

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

    power1.create(PowerTile, 'roll')
    power2.create(PowerTile, 'set')
    power3.create(PowerTile, 'stack')

    const die1 = game.create(ColorDie, 'p' + i + 'colorDie1'); die1.roll(); die1.putInto(playerDie1);
    const die2 = game.create(ColorDie, 'p' + i + 'colorDie2'); die2.roll(); die2.putInto(playerDie2);
    const die3 = game.create(ColorDie, 'p' + i + 'colorDie3'); die3.roll(); die3.putInto(playerDie3);

    $.bag.first(Melt)?.putInto(game.players[i].nextEmptySpace());
    for(var j = 0; j <= i; j++) {
      $.bag.first(Wax)?.putInto(game.players[i].nextEmptySpace());
    }

    const card = $.drawCustomer.top(CustomerCard)!
    card.putInto(playerSpace);

    const goal = $.goalDeck.top(GoalCard)!
    goal.putInto(playerSpace);
    goal.showOnlyTo(game.players[i]);
  }

  // GAME ACTIONS
  game.defineActions({

    chooseSpiltPigmentToMix: (player) => action<{melt: Melt}>({
      prompt: 'Choose pigment color'
    })
    .chooseOnBoard(
      'pigment', ({melt}) => $.pigmentSpillArea.all(Pigment).filter(x => melt.canTakeColor(x.color)),
      { skipIf: 'never' }
    ).do(      
      ({ melt, pigment }) => {
        melt.mix(pigment.color);
        pigment.putInto($.bag);
        if($.pigmentSpillArea.all(Pigment).length > 0) {
          game.followUp({name: 'chooseSpiltPigment'})
        }
      }
    ),

    chooseSpiltPigment: (player) => action<{firstChoice: boolean}>({
      prompt: 'Choose melt to pigment'
    }).chooseFrom(
      "continueMixing", () => ['Yes', 'No'],
      { prompt: 'Mix from spilled pigment?', skipIf: 'never' }
    ).chooseOnBoard(
      'melt', ({continueMixing}) => continueMixing == 'Yes' ? player.board.all(Melt) : [],
      { min: 0 }    
    )
    // .chooseOnBoard(
    //   'pigment', ({melt}) => $.pigmentSpillArea.all(Pigment).filter(x => melt.canTakeColor(x.color)),
    //   { skipIf: 'never' }
    // )
    .do(      
      ({ melt, continueMixing }) => {
        if(melt.length > 0 && continueMixing == 'Yes') {
          game.followUp({name: 'chooseSpiltPigmentToMix', args: {melt: melt[0]}})
          // melt[0].mix(pigment.color);
          // pigment.putInto($.bag);
          // if($.pigmentSpillArea.all(Pigment).length > 0) {
          //   game.followUp({name: 'chooseSpiltPigment'})
          // }
        }
      }
    ),

    chooseCustomer: (player) => action({
      prompt: 'Choose a customer'
    }).chooseOnBoard(
      'customer', [$.customer1, $.customer2, $.customer3, $.customer4],
      { skipIf: 'never' }
    ).do(({ customer }) => {
      customer.first(CustomerCard)?.putInto(player.space);
      $.drawCustomer.top(CustomerCard)?.putInto(customer);
    }),



    chooseWorker: (player) => action({
      prompt: 'Choose a worker',
      condition: player.workerCount() > 0 && !player.pass,
    }).chooseOnBoard(
      'worker', player.board.all(WorkerPiece),
      { skipIf: 'never' }
    ).do(({ worker }) => {
      // player.selectedWorker = worker
      worker.putInto($.ready)
    }),

    chooseWhiteCandle: (player) => action({
      prompt: 'Choose a white candle',
    }).chooseOnBoard(
      'candle', player.board.all(CandlePawn, {color: Color.White}),
      { skipIf: 'never' }
    ).do(({ candle }) => {
      // player.selectedWorker = worker
      candle.putInto($.ready)
    }),

    chooseWax: (player) => action({
      prompt: 'Choose wax to melt',
    }).chooseOnBoard(
      'wax', player.board.all(Wax),
      { skipIf: 'never', min: 2, max: 8 }
    ).do(({ wax }) => {
      player.meltWaxSpill(wax);
    }),

    chooseKey: (player) => action({
      prompt: 'Choose key to gain',
    }).chooseOnBoard(
      'key', game.all(KeyHook).all(KeyShape),
      { skipIf: 'never' }
    ).do(({ key }) => {
      key.putInto(player.nextEmptySpace())
    }),

    
    chooseDieFromBoard: (player) => action<{key: KeyShape}>({
      prompt: 'Choose die to take',
    }).chooseOnBoard(
      'die', game.all(WorkerSpace).all(ColorDie),
      { skipIf: 'never' }
    ).do(({ key, die }) => {
      key.putInto(game.first(KeyHook, {color: key.color})!);
      console.log('die = ' + die)
      die.roll();
      die.putInto(player.nextEmptyDieSpace());
    }),

    chooseKeyAndShape2: (player) => action({
      prompt: 'Choose key to trade',
    }).chooseOnBoard(
      'key', player.board.all(KeyShape),
      { skipIf: 'never' }
    ).do(({ key }) => {
      game.followUp({name: 'chooseDieFromBoard', args: {key: key}})
    }),

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
      console.log('die = ' + die)
      die.roll();
      die.putInto(player.nextEmptyDieSpace());
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
    }),

    chooseWaxRepeater: (player) => action({
      prompt: 'Choose wax to melt',
    }).chooseOnBoard(
      'wax', player.board.all(Wax),
      { skipIf: 'never', min: 1, max: player.masteryLevel() }
    ).do(({ wax }) => {
      player.meltWax(wax);
    }),

    chooseNextCustomer: (player) => action({
      prompt: 'Choose your next customer',
    }).chooseOnBoard(
      'customer', [$.drawCustomer, $.customer1, $.customer2, $.customer3, $.customer4],
      { skipIf: 'never' }
    ).do(({ customer }) => {
      if( customer == $.drawCustomer) {
        $.drawCustomer.top(CustomerCard)?.putInto(player.space);
      } else {
        customer.first(CustomerCard)?.putInto(player.space);
        $.drawCustomer.top(CustomerCard)?.putInto(customer);
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
      'melts', () => player.board.all(Melt),
      { skipIf: 'never', min: 1, max: game.currentPlayer().masteryLevel() }
    ).do(({ melts }) => {
      melts.forEach(x => {
        player.gainCandle(x, false, 1);
        x.putInto($.meltSpillArea);  
        player.increaseScore();
      })
      // if(count > 1 && player.board.all(Melt).length > 0) {
      //   game.followUp({name: 'continueMolding', args: {count: count}});
      // }
    }),

    choosePigmentColor: (player) => action<{firstChoice: boolean}>({
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
            break;
          }
          case 'Blue': {
            melt.mix(Color.Blue);
            break;
          }
          case 'Yellow': {
            melt.mix(Color.Yellow);
            break;
          }
        }
      }
    ),

    chooseCandlesToTrade: (player) => action<{color: Color}>({
      prompt: 'Choose candles to trade'
    }).chooseOnBoard(
      'playerCandle', ({ color }) => color == undefined ? player.board.all(CandlePawn) : player.board.all(CandlePawn, {color: color}),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'candle', game.all(Candelabra).all(CandlePawn),
      { skipIf: 'never' }
    ).do(({ playerCandle, candle }) => {
      playerCandle.putInto($.bag);
      candle.putInto(player.nextEmptySpace());
    }),

    sellCandle: player => action({
      prompt: 'Sell the candle',
      condition: $.ready.first(WorkerPiece)! instanceof CandlePawn
    }).chooseOnBoard(
      'space', game.all(BackAlley),
      { skipIf: 'never' }
    ).do(({ space }) => {
      switch(space.letter) {
        case 'A': {
          player.increaseScore();
          break;
        }
        case 'B': {
          if(player.board.all(PowerTile, {flipped: false}).length > 0) {
            game.followUp({name: 'choosePowerTile'});
          }
          break;
        }
      }

      const candle = $.ready.first(CandlePawn)!
      var actions = 2;
      if(candle.color == Color.White) {
        actions = 1;
      } else if(candle.color == Color.Black) {
        actions = 3;
      }
      for(var i = 0; i < actions; i++) {
        game.followUp({name: 'chooseBackAlleyAction', args: {letter: space.letter}});
      }

      candle.putInto($.bag);
    }),
    
    choosePowerTile: (player) => action({
      prompt: 'Choose power tile',
    }).chooseOnBoard(
      'tile', player.board.all(PowerTile, {flipped: false}),
      { skipIf: 'never' }
    ).do(({ tile }) => {
      tile.flipped = true;
    }),

    chooseBackAlleyAction: (player) => action<{letter: string}>({
      prompt: 'Choose back alley tile',
    }).chooseOnBoard(
      'token', ({letter}) => ['A', 'B'].includes(letter) ? game.all(BackAlleySpace, {letter: letter}) :
        game.all(BackAlleySpace, {letter: 'A'}).concat(game.all(BackAlleySpace, {letter: 'B'})),
      { skipIf: 'never' }
    ).do(({ token }) => {
      token.first(BackAlleyTile)!.performActionAfterConfirmation(game);
    }),
    
    chooseCandleToMove: (player) => action({
      prompt: 'Choose candle to move',
    }).chooseOnBoard(
      'candle', player.space.all(CustomerCard)
        .filter(x => x.all(CandlePawn).length < x.requiredCandles().length).all(CandlePawn),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'space', ({candle}) => player.space.all(CandleSpace, {color: candle.color})
        .filter(x => x.all(CandlePawn).length == 0).concat(candle.container(CandleSpace)!),
      { skipIf: 'never' }
    )
    .do(({ candle, space }) => {
      candle.putInto(space);
    }),

    chooseCustomerToSwap: (player) => action({
      prompt: 'Choose customers to swap',
    }).chooseOnBoard(
      'customer1', player.space.all(CustomerCard).filter(x => x.all(CandlePawn).length == 0),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'customer2', ({customer1}) => [$.customer1, $.customer2, $.customer3, $.customer4],
      { skipIf: 'never' }
    ).do(({ customer1, customer2 }) => {
      customer2.top(CustomerCard)?.putInto(player.space);
      customer1.putInto(customer2);
    }),

    activateCustomer: (player) => action<{color: Color}>({
      prompt: "Choose customer to activate"
    }).chooseOnBoard(
      'customer', ({ color }) => player.space.all(CustomerCard, {color: color}).concat(player.board.first(CustomerCard)!)
      ,
      { skipIf: 'never' }
    ).do(
      ({ customer, color }) => {
        // perform the customer action
        if(customer.color == Color.White) {
          switch(color) {
            case Color.White: {
              player.increaseMastery(1);
              break;
            }
            case Color.Red: {
              player.increaseMastery(2);
              break;
            }
            case Color.Yellow: {
              player.increaseMastery(2);
              break;
            }
            case Color.Blue: {
              player.increaseMastery(2);
              break;
            }
            case Color.Green: {
              player.increaseMastery(2);
              break;
            }
            case Color.Orange: {
              player.increaseMastery(2);
              break;
            }
            case Color.Purple: {
              player.increaseMastery(2);
              break;
            }
            case Color.Black: {
              player.increaseMastery(3);
              break;
            }
          }
        } else {
         switch(customer.customerType) {
          case CustomerType.Adventurer: {
            game.followUp({name: 'chooseKey'})
            break;
          }
          case CustomerType.Rogue: {
            var actions = player.space.all(CustomerCard, {customerType: CustomerType.Rogue}).length;
            for(var i = 0; i < actions; i++) {
              game.followUp({name: 'chooseBackAlleyAction', args: {letter: 'All'}});
            }
            break;
          }
          case CustomerType.Witch: {    
            game.followUp({name: 'chooseCandlesToTrade', args: {color: Color.White}});
            break;
          }
          case CustomerType.Priest: {
            if($.bag.all(CandlePawn, {color: Color.White}).length > 0) {
              $.bag.first(CandlePawn, {color: Color.White})?.putInto(player.nextEmptySpace());
              game.first(Candelabra, {color: Color.White})!.top(Trash)!.putInto($.bag);
            }
            break;
          }
          case CustomerType.Prince: {
            player.increaseScore(3);
            break;
          }
          case CustomerType.Merchant: {
            game.followUp({name: 'chooseNextCustomer'})
            break;
          }
          case CustomerType.Charlatan: {
            game.followUp({name: 'chooseSpiltDie'})
            break;
          }
          case CustomerType.Cartographer: {
            const mastery = player.currentMastery();
            if(mastery >= 2) {
              player.setMastery(mastery-2);
              game.followUp({name: 'chooseAvailableColorAction'});
            }
            break;
          }
         } 
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
    }),
    chooseMeltYellow: player => action({
      prompt: 'Choose melt to pigment yellow',
    }).chooseOnBoard(
      'melt', player.board.all(Melt).filter(x => x.canTakeColor(Color.Yellow)),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      melt.mix(Color.Yellow);
    }),
    chooseMeltBlue: player => action({
      prompt: 'Choose melt to pigment blue',
    }).chooseOnBoard(
      'melt', player.board.all(Melt).filter(x => x.canTakeColor(Color.Blue)),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      melt.mix(Color.Blue);
    }),

    chooseMeltManyRed: player => action({
      prompt: 'Choose melt(s) to pigment red',
    }).chooseOnBoard(
      'melts', player.board.all(Melt).filter(x => x.canTakeColor(Color.Red)),
      { skipIf: 'never', min: 1, max: 8 }
    ).do(({ melts }) => {
      melts.forEach(x => {
        x.mix(Color.Red);
        $.bag.first(Pigment, {color: Color.Red})?.putInto($.pigmentSpillArea);
        player.increaseScore();
      }
    )}),
    chooseMeltManyYellow: player => action({
      prompt: 'Choose melt(s) to pigment yellow',
    }).chooseOnBoard(
      'melts', player.board.all(Melt).filter(x => x.canTakeColor(Color.Yellow)),
      { skipIf: 'never', min: 1, max: 8 }
    ).do(({ melts }) => {
      melts.forEach(x => {
        x.mix(Color.Yellow);
        $.bag.first(Pigment, {color: Color.Yellow})?.putInto($.pigmentSpillArea);
        player.increaseScore();
      }
    )}),
    chooseMeltManyBlue: player => action({
      prompt: 'Choose melt(s) to pigment blue',
    }).chooseOnBoard(
      'melts', player.board.all(Melt).filter(x => x.canTakeColor(Color.Blue)),
      { skipIf: 'never', min: 1, max: 8 }
    ).do(({ melts }) => {
      melts.forEach(x => {
        x.mix(Color.Blue);
        $.bag.first(Pigment, {color: Color.Blue})?.putInto($.pigmentSpillArea);
        player.increaseScore();
      }
    )}),

    chooseRedOrWhiteMelt: player => action({
      prompt: 'Choose red melt or white melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Red}).concat(player.board.all(Melt, {color: Color.White})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      player.gainCandle(melt);
    }),
    chooseYellowOrWhiteMelt: player => action({
      prompt: 'Choose yellow melt or white melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Yellow}).concat(player.board.all(Melt, {color: Color.White})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      player.gainCandle(melt);
    }),
    chooseBlueOrWhiteMelt: player => action({
      prompt: 'Choose blue melt or white melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Blue}).concat(player.board.all(Melt, {color: Color.White})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      player.gainCandle(melt);
    }),
    chooseOrangeOrBlackMelt: player => action({
      prompt: 'Choose orange melt or black melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Orange}).concat(player.board.all(Melt, {color: Color.Black})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      player.gainCandle(melt);
    }),
    chooseGreenOrBlackMelt: player => action({
      prompt: 'Choose green melt or black melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Green}).concat(player.board.all(Melt, {color: Color.Black})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      player.gainCandle(melt);
    }),
    choosePurpleOrBlackMelt: player => action({
      prompt: 'Choose purple melt or black melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt, {color: Color.Purple}).concat(player.board.all(Melt, {color: Color.Black})),
      { skipIf: 'never' }
    ).do(({ melt }) => {
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
      card.placeCandle($.ready.first(WorkerPiece)!)
      if(card.all(CandlePawn).length == card.requiredCandles().length && card.requiredCandles().length == 3) {
        $.drawCustomer.top(CustomerCard)?.putInto(player.space);
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
      $.ready.first(WorkerPiece)!.putInto(space);
      if(card.all(CandlePawn).length == card.requiredCandles().length && card.requiredCandles().length == 3) {
        $.drawCustomer.top(CustomerCard)?.putInto(player.space);
      }
      player.increaseMastery(1);
    }),

    placeWorker: (player) => action({
      prompt: 'Use the worker',
      condition: $.ready.all(WorkerPiece).length > 0
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

      if(game.setting('captureWorkers') && 
        ![$.waxSpill, $.pigmentSpill, $.moldSpill].includes(space) && space.all(WorkerPiece).length > 0) {
        const top = space.top(WorkerPiece)!;
        if(worker instanceof CandlePawn && top instanceof ColorDie) {
          const die = top as ColorDie;
          die.roll();
          die.putInto(player.nextEmptyDieSpace());
        } else if(worker instanceof CandlePawn && top instanceof KeyShape) {
          top.putInto(player.nextEmptySpace());
        } else if(worker instanceof ColorDie && top instanceof KeyShape) {
          top.putInto(player.nextEmptySpace());
        }
      }      
      worker.putInto(space);
      player.placedWorker = true;
    }),

    pass: (player) => action({
      prompt: 'Pass',
    }).do(() => {
      player.pass = true;
      player.placedWorker = true;
    }),
    skip: (player) => action({
      condition: $.ready.all(WorkerPiece).length == 0,
    }).do(() => {
        // do nothing
    }),

    chooseDiceToRoll: (player) => action({
      prompt: 'Choose dice to roll',
    }).chooseOnBoard(
      'dice', player.board.all(ColorDie),
      { skipIf: 'never', min: 1, max: 11 }
    ).do(({ dice }) => {
      dice.forEach(x => x.roll());
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
    }),

    confirmAction: (player) => action<{tile: BackAlleyTile}>({
      prompt: 'Do you want to perform the bonus?',
    }).chooseFrom(
      "choice", ({tile}) => [tile.name, 'Skip'], 
      { skipIf: 'never' }
    ).do(({ choice, tile }) => {
      if(choice != 'Skip') {
        tile.performActionAfterConfirmation(game);
      }
    }),

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
          break;
        }
        case 'Blue': {
          melt.unmix(Color.Blue);
          break;
        }
        case 'Yellow': {
          melt.unmix(Color.Yellow);
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

    // choose backroom action based on building, the type, and what spaces have already been used
    chooseBackroomAction: (player) => action<{building : Building, usedSpaces: Space<MyGame>[]}>({
      prompt: 'Choose next action to perform',
    }).chooseOnBoard(
      'chosenSpace', ({building, usedSpaces}) => 
        // return the worker space and add in the back alley spaces
        [game.first(WorkerSpace, {building: building, spaceType: SpaceType.Backroom})! as Space<MyGame>]
          .concat(game.all(BackAlleySpace, {building: building}).map(x => x as Space<MyGame>))
          // filter out already used spaces
          .filter(x => !usedSpaces.includes(x))
          .concat(game.all(CheckSpace, {building: building})!.filter(x => x.first(Check)!.flipped)),
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
          game.first(CheckSpace, {building: building})!.first(Check)!.flipped = true; // allow cancel
        }        
        game.followUp({name: 'chooseBackroomAction', args: {building: building, usedSpaces: nextList}})
      } else {
        game.first(CheckSpace, {building: building})!.first(Check)!.flipped = false;
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
          break;
        }
        case 2: {
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);
          break;
        }
        case 3: {
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);
          player.board.first(Wax)?.putInto($.bag);
          break;
        }
      }
    }),

    usePower: (player) => action({
      prompt: 'Use a power tile',
      condition: player.diceCount() > 0 && !player.pass,
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
          break;
        }
      }
      power.flipped = false;
    }),

    discardExtraComponents: (player) => action({
      prompt: 'Discard Down to 8 components',
    }).chooseOnBoard(
      'components', player.board.all(ComponentSpace).all(Piece),
      { skipIf: 'never', number: player.componentCount() - 8 }
    ).do(({ components }) => {
      for(const component of components) {      
        if(component instanceof KeyShape) {
          const key = component as KeyShape;
          key.putInto(game.first(KeyHook, {color: key.color})!);
        } else if(component instanceof Melt) {
          (component as Melt).color = Color.White;
          component.putInto($.bag);
        } else {
          component.putInto($.bag);
        }
      }
    }),

  });

  game.defineFlow(

    loop(

      () => {
        const firstPlayer = game.first(Lamp)!;
        game.players.setCurrent(game.players[0]);     
        // move to the next player until you get to the first player token
        for(var i = 0; i < firstPlayer.playerIndex; i++) {
          game.players.next();
        }
      },

      whileLoop({while: () => !game.allPlayersPassed(), do: ([        
        () => {game.currentPlayer().placedWorker = false},
        whileLoop({while: () => !game.currentPlayer().placedWorker, do: ([
          playerActions({ actions: ['chooseWorker', 'usePower', 'pass']}),
          playerActions({ actions: ['placeWorker', 'placeCandle', 'sellCandle', 'skip']}),
          ifElse({
            if: () => game.currentPlayer().componentCount() > 8, do: [playerActions({ actions: ['discardExtraComponents']})
          ]}),
          () => {
            // make sure to pull any floating pieces back to the board
            game.currentPlayer().board.all(ComponentSpace).filter(x => x.num > 8).forEach(y => {
              if(y.all(Piece).length > 0) {
                y.first(Piece)!.putInto(game.currentPlayer().nextEmptySpace());
              }
            });
          }
        ])}),
        () => {game.players.next();}
      ])}),
      
      () => {
        // check round end goals
        game.checkRoundEndGoals();

        if(game.currentRound() < 4) {

          // reset players
          for(const player of game.players) { player.pass = false; }

          // reset space colors
          ($.waxRepeater as WorkerSpace).color = undefined;
          ($.waxBackroom as WorkerSpace).color = undefined;
          ($.waxMiddle as WorkerSpace).color = undefined;
          ($.pigmentRepeater as WorkerSpace).color = undefined;
          ($.pigmentBackroom as WorkerSpace).color = undefined;
          ($.pigmentMiddle as WorkerSpace).color = undefined;
          ($.moldRepeater as WorkerSpace).color = undefined;
          ($.moldBackroom as WorkerSpace).color = undefined;
          ($.moldMiddle as WorkerSpace).color = undefined;

          // discard used candles
          game.all(WorkerSpace).all(CandlePawn).putInto($.bag);

          // return shapes
          game.first(KeyShape, {color: Color.Red})?.putInto($.redHook);
          game.first(KeyShape, {color: Color.Yellow})?.putInto($.yellowHook);
          game.first(KeyShape, {color: Color.Blue})?.putInto($.blueHook);
          game.first(KeyShape, {color: Color.Orange})?.putInto($.orangeHook);
          game.first(KeyShape, {color: Color.Green})?.putInto($.greenHook);
          game.first(KeyShape, {color: Color.Purple})?.putInto($.purpleHook);

          // reset the customers
          for(const customer of [$.customer1, $.customer2, $.customer3, $.customer4]) {
            customer.first(CustomerCard)?.putInto($.bag);
            $.drawCustomer.top(CustomerCard)?.putInto(customer);
          }

          // set starting dice
          game.all(ColorDie).putInto($.bag);
          game.setup = true;
          for(var i = 0; i < 4-game.players.length; i++) {
            Object.values(Building).forEach((building: Building) =>{
              const die = $.bag.first(ColorDie)!;
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

          // start with new dice
          for(const player of game.players) {
            const die1 = $.bag.first(ColorDie); die1?.roll(); die1?.putInto(player.nextEmptyDieSpace());
            const die2 = $.bag.first(ColorDie); die2?.roll(); die2?.putInto(player.nextEmptyDieSpace());
            const die3 = $.bag.first(ColorDie); die3?.roll(); die3?.putInto(player.nextEmptyDieSpace());
          }

          // move the first player token
          const firstPlayer = game.first(Lamp)!;
          if(firstPlayer.playerIndex < game.players.length-1) {
            firstPlayer.playerIndex = firstPlayer.playerIndex+1;            
          } else {
            firstPlayer.playerIndex = 0;
          }      
          firstPlayer.putInto(game.players[firstPlayer.playerIndex].space);
          
          // move the round tracker
          game.nextRound();
        
        } else {

          // do final scoring
          game.players.forEach(player => {
            // score for customers
            player.space.all(CustomerCard).forEach(card => {
              const candleCount = card.all(CandlePawn).length;
              if(candleCount > 0) {
                const candleScore = card.scoring[candleCount-1]
                game.message(player.name + ' scored ' + candleScore + ' points for candles on ' + card.name);
                player.increaseScore(candleScore);
              }
            })
            // score for mastery
            game.message(player.name + ' scored ' + player.masteryScore() + ' points for mastery');
            player.increaseScore(player.masteryScore());

            // score for personal goals
            player.space.all(GoalCard).forEach(goal => {
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

                  game.message(player.name + ' scored 6 points for goal ' + goal.name);
                  player.increaseScore(6);
                }
              }
            );

            // score for game end goals
            if($.gameEndType1.all(EndGameTile).length > 0) {
              const type1 = $.gameEndType1.first(EndGameTile)!
              const score1 = player.space.all(CustomerCard, {customerType: type1.type})
                .filter(x => x.all(CandlePawn).length > 0).length * 5;
              player.increaseScore(score1);
              game.message(player.name + ' scored ' + score1 + ' points for type ' + type1);
            }
            if($.gameEndType2.all(EndGameTile).length > 0) {
              const type2 = $.gameEndType2.first(EndGameTile)!
              const score2 = player.space.all(CustomerCard, {customerType: type2.type})
                .filter(x => x.all(CandlePawn).length > 0).length * 3;
              player.increaseScore(score2);
              game.message(player.name + ' scored ' + score2 + ' points for type ' + type2);
            }
            if($.gameEndType3.all(EndGameTile).length > 0) {
              const type3 = $.gameEndType3.first(EndGameTile)!
              const score3 = player.space.all(CustomerCard, {customerType: type3.type})
                .filter(x => x.all(CandlePawn).length > 0).length * 5;
              player.increaseScore(score3);
              game.message(player.name + ' scored ' + score3 + ' points for type ' + type3);
            }
          })

          game.finish(undefined)
        }
      }
    )    
  );
});
