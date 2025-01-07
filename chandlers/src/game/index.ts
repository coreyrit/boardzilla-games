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
import { CustomerCard, EndGameTile, RoundEndTile, BackAlleyTile, ColorDie, KeyShape, CandlePawn, PowerTile, Wax, WorkerPiece, Pigment, Melt, MasteryCube, ScoreTracker } from './components.js';
import { BackAlley, BackAlleySpace, Candelabra, CandleBottomRow, CandleSpace, CandleTopRow, ChandlersBoard, ComponentSpace, CustomerSpace, DiceSpace, GameEndSpace, KeyHook, MasterySpace, MasteryTrack, PlayerBoard, PlayerSpace, PowerSpace, ReadySpace, RoundEndSpace, ScoringSpace, ScoringTrack, Spill, WorkerSpace } from './boards.js';

export enum Building {
  Wax = 'wax',
  Pigment = 'pigment',
  Mold = 'mold'
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
    if(space != undefined) {
      space.color = space.top(WorkerPiece)?.color;
    }

    switch(building) {
      case Building.Wax: {
        this.followUp({name: 'chooseWaxRepeater'});
        break;
      }
      case Building.Pigment: {
        for(var i = 0; i < this.currentPlayer().masteryLevel(); i++) {
          this.followUp({name: 'choosePigmentColor'});    
        }
        break;
      }
      case Building. Mold: {
        for(var i = 0; i < this.currentPlayer().masteryLevel(); i++) {
          this.followUp({name: 'chooseMelt'});    
        }
        break;
      }
    }
  }

  performBackroom(building: Building, space: WorkerSpace | undefined = undefined) : void {
    if(space != undefined) {
      space.color = space.top(WorkerPiece)?.color;
    }

    switch(building) {
      case Building.Wax: {
        this.followUp({name: 'chooseCustomer'});
        $.waxBackAlleySpaceA.first(BackAlleyTile)!.performAction(this);
        break;
      }
      case Building.Pigment: {
        this.currentPlayer().board.all(PowerTile).forEach(x => {x.flipped = true});
        $.pigmentBackAlleySpaceA.first(BackAlleyTile)!.performAction(this);
        $.pigmentBackAlleySpaceB.first(BackAlleyTile)!.performAction(this);
        break;
      }
      case Building. Mold: {
        this.followUp({name: 'chooseCandlesToTrade'});    
        $.moldBackAlleySpaceB.first(BackAlleyTile)!.performAction(this);
        break;
      }
    }
  }

  performMiddle(building: Building, space: WorkerSpace) : void {
    space.color = space.top(WorkerPiece)?.color;
    this.followUp({name: 'chooseMiddleAction', args: { building: building }});
  }
}

export default createGame(ChandlersPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;

  game.init();

  const bag = game.create(Space, 'bag')

  // create the board
  const board = game.create(ChandlersBoard, 'board');

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
  $.drawCustomer.create(CustomerCard, 'audacity', {customerType: CustomerType.Adventurer, color: Color.Green, data: "bgpx"})
  $.drawCustomer.create(CustomerCard, 'bamboozle', {customerType: CustomerType.Charlatan, color: Color.Blue, data: "brp"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-autumn', {customerType: CustomerType.Priest, color: Color.Orange, data: "brgo"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-heaven', {customerType: CustomerType.Priest, color: Color.Blue, data: "bypo"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-midnight', {customerType: CustomerType.Priest, color: Color.Purple, data: "rpo"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-moonlight', {customerType: CustomerType.Priest, color: Color.Yellow, data: "yrgo"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-spring', {customerType: CustomerType.Priest, color: Color.Green, data: "bgx"})
  $.drawCustomer.create(CustomerCard, 'blessing-of-summer', {customerType: CustomerType.Priest, color: Color.Red, data: "wyrx"})
  $.drawCustomer.create(CustomerCard, 'broker', {customerType: CustomerType.Merchant, color: Color.Blue, data: "byrp"})
  $.drawCustomer.create(CustomerCard, 'bypass', {customerType: CustomerType.Cartographer, color: Color.Yellow, data: "bygo"})
  $.drawCustomer.create(CustomerCard, 'cleansing-flood', {customerType: CustomerType.Witch, color: Color.Blue, data: "bgpo"})
  $.drawCustomer.create(CustomerCard, 'cutoff', {customerType: CustomerType.Cartographer, color: Color.Purple, data: "wrp"})
  $.drawCustomer.create(CustomerCard, 'daring', {customerType: CustomerType.Adventurer, color: Color.Blue, data: "bwrx"})
  $.drawCustomer.create(CustomerCard, 'dealer', {customerType: CustomerType.Merchant, color: Color.Purple, data: "wyp"})
  $.drawCustomer.create(CustomerCard, 'deception', {customerType: CustomerType.Rogue, color: Color.Yellow, data: "byx"})
  $.drawCustomer.create(CustomerCard, 'detour', {customerType: CustomerType.Cartographer, color: Color.Orange, data: "wypo"})
  $.drawCustomer.create(CustomerCard, 'discount', {customerType: CustomerType.Rogue, color: Color.Blue, data: "byo"})
  $.drawCustomer.create(CustomerCard, 'discovery', {customerType: CustomerType.Adventurer, color: Color.Purple, data: "rpx"})
  $.drawCustomer.create(CustomerCard, 'double-dip', {customerType: CustomerType.Rogue, color: Color.Red, data: "bwrp"})
  $.drawCustomer.create(CustomerCard, 'exploit', {customerType: CustomerType.Rogue, color: Color.Purple, data: "bwpo"})
  $.drawCustomer.create(CustomerCard, 'exploration', {customerType: CustomerType.Adventurer, color: Color.Orange, data: "wgo"})
  $.drawCustomer.create(CustomerCard, 'grift', {customerType: CustomerType.Charlatan, color: Color.Orange, data: "bwgo"})
  $.drawCustomer.create(CustomerCard, 'heroism', {customerType: CustomerType.Adventurer, color: Color.Yellow, data: "byrg"})
  $.drawCustomer.create(CustomerCard, 'hoodwink', {customerType: CustomerType.Charlatan, color: Color.Red, data: "wrgx"})
  $.drawCustomer.create(CustomerCard, 'infernal-rush', {customerType: CustomerType.Witch, color: Color.Red, data: "wyro"})
  $.drawCustomer.create(CustomerCard, 'intrepidity', {customerType: CustomerType.Adventurer, color: Color.Red, data: "rgpo"})
  $.drawCustomer.create(CustomerCard, 'lightning-crash', {customerType: CustomerType.Witch, color: Color.Yellow, data: "yrx"})
  $.drawCustomer.create(CustomerCard, 'miscount', {customerType: CustomerType.Rogue, color: Color.Green, data: "gox"})
  $.drawCustomer.create(CustomerCard, 'nourishing-wave', {customerType: CustomerType.Witch, color: Color.Green, data: "wygx"})
  $.drawCustomer.create(CustomerCard, 'operator', {customerType: CustomerType.Merchant, color: Color.Orange, data: "bwo"})
  $.drawCustomer.create(CustomerCard, 'passage', {customerType: CustomerType.Cartographer, color: Color.Green, data: "wgp"})
  $.drawCustomer.create(CustomerCard, 'prince-rohan', {customerType: CustomerType.Prince, color: Color.Red, data: "bwrg"})
  $.drawCustomer.create(CustomerCard, 'prince-tyrion', {customerType: CustomerType.Prince, color: Color.Purple, data: "bypx"})
  $.drawCustomer.create(CustomerCard, 'princess-buttercup', {customerType: CustomerType.Prince, color: Color.Yellow, data: "yrox"})
  $.drawCustomer.create(CustomerCard, 'princess-evergreen', {customerType: CustomerType.Prince, color: Color.Green, data: "wyg"})
  $.drawCustomer.create(CustomerCard, 'princess-peach', {customerType: CustomerType.Prince, color: Color.Orange, data: "bwro"})
  $.drawCustomer.create(CustomerCard, 'princess-perrywinkle', {customerType: CustomerType.Prince, color: Color.Blue, data: "bwyp"})
  $.drawCustomer.create(CustomerCard, 'retailer', {customerType: CustomerType.Merchant, color: Color.Red, data: "wrox"})
  $.drawCustomer.create(CustomerCard, 'scam', {customerType: CustomerType.Charlatan, color: Color.Yellow, data: "byg"})
  $.drawCustomer.create(CustomerCard, 'seller', {customerType: CustomerType.Merchant, color: Color.Green, data: "wygo"})
  $.drawCustomer.create(CustomerCard, 'shadow-strike', {customerType: CustomerType.Witch, color: Color.Purple, data: "wrgp"})
  $.drawCustomer.create(CustomerCard, 'shortcut', {customerType: CustomerType.Cartographer, color: Color.Red, data: "wyrg"})
  $.drawCustomer.create(CustomerCard, 'sleight-of-hand', {customerType: CustomerType.Rogue, color: Color.Orange, data: "wrpo"})
  $.drawCustomer.create(CustomerCard, 'sunlight-surge', {customerType: CustomerType.Witch, color: Color.Orange, data: "wgpo"})
  $.drawCustomer.create(CustomerCard, 'tomfoolery', {customerType: CustomerType.Charlatan, color: Color.Purple, data: "wpo"})
  $.drawCustomer.create(CustomerCard, 'trail', {customerType: CustomerType.Cartographer, color: Color.Blue, data: "bwpx"})
  $.drawCustomer.create(CustomerCard, 'trickery', {customerType: CustomerType.Charlatan, color: Color.Green, data: "ygx"})
  $.drawCustomer.create(CustomerCard, 'vendor', {customerType: CustomerType.Merchant, color: Color.Yellow, data: "ypx"})

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
  const whiteCandles = game.create(Candelabra, 'whiteCandles');
  const redCandles = game.create(Candelabra, 'redCandles');
  const yellowCandles = game.create(Candelabra, 'yellowCandles');
  const blueCandles = game.create(Candelabra, 'blueCandles');
  const orangeCandles = game.create(Candelabra, 'orangeCandles');
  const greenCandles = game.create(Candelabra, 'greenCandles');
  const purpleCandles = game.create(Candelabra, 'purpleCandles');
  const blackCandles = game.create(Candelabra, 'blackCandles');

  // place ONE white candle in the bag
  $.bag.create(CandlePawn, 'whiteCandleBag', {color: Color.White});

  for(var i = 0; i < 8; i++) {
    $.whiteCandles.create(CandlePawn, 'whiteCandle' + i, {color: Color.White})
  }
  for(var i = 0; i < 6; i++) {
    $.redCandles.create(CandlePawn, 'redCandle' + i, {color: Color.Red})
    $.yellowCandles.create(CandlePawn, 'yellowCandle' + i, {color: Color.Yellow})
    $.blueCandles.create(CandlePawn, 'blueCandle' + i, {color: Color.Blue})
    $.orangeCandles.create(CandlePawn, 'orangeCandle' + i, {color: Color.Orange})
    $.greenCandles.create(CandlePawn, 'greenCandle' + i, {color: Color.Green})
    $.purpleCandles.create(CandlePawn, 'purpleCandle' + i, {color: Color.Purple})
  }
  for(var i = 0; i < 4; i++) {
    $.blackCandles.create(CandlePawn, 'blackCandle' + i, {color: Color.Black})
  }

  // roll random dice to start the round
  game.setup = true;
  for(var i = 0; i < 2; i++) {
    Object.values(Building).forEach((building: Building) =>{
      const die = game.create(ColorDie, 'colorDie' + i);
      die.roll()
      die.putInto(game.first(WorkerSpace, { building: building, color: die.color })!)
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

  game.create(GameEndSpace, 'gameEndType1')
  game.create(GameEndSpace, 'gameEndType2')
  game.create(GameEndSpace, 'gameEndType3')
  
  game.create(EndGameTile, 'adventurer')
  game.create(EndGameTile, 'charlatan')
  game.create(EndGameTile, 'rogue')
  game.create(EndGameTile, 'merchant')
  game.create(EndGameTile, 'priest')
  game.create(EndGameTile, 'prince')
  game.create(EndGameTile, 'witch')
  game.create(EndGameTile, 'cartographer')
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
  bag.first(RoundEndTile)?.putInto($.roundEndSpace1);
  bag.first(RoundEndTile)?.putInto($.roundEndSpace2);
  bag.first(RoundEndTile)?.putInto($.roundEndSpace3);

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

  game.create(BackAlleySpace, 'waxBackAlleySpaceA');
  game.create(BackAlleySpace, 'pigmentBackAlleySpaceA');
  game.create(BackAlleySpace, 'pigmentBackAlleySpaceB');
  game.create(BackAlleySpace, 'moldBackAlleySpaceB');

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
  $.scoring100.create(ScoreTracker, 'greenScore', {color: Color.Green});

  // player
  game.create(PlayerSpace, 'playerSpace')
  $.playerSpace.onEnter(CustomerCard, x => {
    x.flipped = true;
  })

  const greenBoard = $.playerSpace.create(PlayerBoard, "greenBoard")
  game.players[0].board = greenBoard

  greenBoard.create(ComponentSpace, 'greenComponent1');
  greenBoard.create(ComponentSpace, 'greenComponent2');
  greenBoard.create(ComponentSpace, 'greenComponent3');
  greenBoard.create(ComponentSpace, 'greenComponent4');
  greenBoard.create(ComponentSpace, 'greenComponent5');
  greenBoard.create(ComponentSpace, 'greenComponent6');
  greenBoard.create(ComponentSpace, 'greenComponent7');
  greenBoard.create(ComponentSpace, 'greenComponent8');

  greenBoard.create(DiceSpace, 'greenDie1');
  greenBoard.create(DiceSpace, 'greenDie2');
  greenBoard.create(DiceSpace, 'greenDie3');

  const power1 = greenBoard.create(PowerSpace, 'greenPower1')
  const power2 = greenBoard.create(PowerSpace, 'greenPower2')
  const power3 = greenBoard.create(PowerSpace, 'greenPower3')

  const baseAction = greenBoard.create(CustomerSpace, 'greenBaseActionSpace');
  baseAction.create(CustomerCard, 'greenBaseAction', {flipped: true})

  const masteryTrack = greenBoard.create(MasteryTrack, 'greenMastery')
  for(var i = 0; i < 16; i++) {
    masteryTrack.create(MasterySpace, 'mastery' + i, {index: i});
  }
  $.mastery0.create(MasteryCube, 'greenCube', {color: Color.Green});

  power1.create(PowerTile, 'roll')
  power2.create(PowerTile, 'set')
  power3.create(PowerTile, 'stack')

  // bag.first(Wax)?.putInto($.greenComponent1)

  const die1 = game.create(ColorDie, 'p1colorDie1'); die1.roll(); die1.putInto($.greenDie1);
  const die2 = game.create(ColorDie, 'p1colorDie2'); die2.roll(); die2.putInto($.greenDie2);
  const die3 = game.create(ColorDie, 'p1colorDie3'); die3.roll(); die3.putInto($.greenDie3);

  $.bag.first(Melt)?.putInto($.greenComponent1);
  $.bag.first(Wax)?.putInto($.greenComponent2);

  const card = $.drawCustomer.top(CustomerCard)!
  card.putInto($.playerSpace);

  // GAME ACTIONS
  game.defineActions({
    chooseSpiltPigment: (player) => action({
      prompt: 'Choose spilt pigments',
    }).chooseOnBoard(
      'pigments', $.pigmentSpillArea.all(Pigment),
      { skipIf: 'never', min: 0, max: 8 }
    ).do(({ pigments }) => {
      pigments.forEach(x => {
        switch(x.color) {
          case Color.Red: {
            game.followUp({name: 'chooseMeltRed'})
            break;
          }
          case Color.Yellow: {
            game.followUp({name: 'chooseMeltYellow'})
            break;
          }
          case Color.Blue: {
            game.followUp({name: 'chooseMeltBlue'})
            break;
          }
        }
        x.putInto($.bag)
      })
    }),

    chooseCustomer: (player) => action({
      prompt: 'Choose a customer'
    }).chooseOnBoard(
      'customer', [$.customer1, $.customer2, $.customer3, $.customer4],
      { skipIf: 'never' }
    ).do(({ customer }) => {
      customer.first(CustomerCard)?.putInto($.playerSpace);
      $.drawCustomer.top(CustomerCard)?.putInto(customer);
    }),



    chooseWorker: (player) => action({
      prompt: 'Choose a worker',
      condition: player.workerCount() > 0,
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
        $.drawCustomer.top(CustomerCard)?.putInto($.playerSpace);
      } else {
        customer.first(CustomerCard)?.putInto($.playerSpace);
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

    chooseMiddleAction: () => action<{building: Building}>({
      prompt: "Choose which action to perform"
    }).chooseFrom(
      'action', ({ building }) => ['Mastery', 'Backroom']
    ).do(
      ({ action, building }) => {
        if(action == 'Mastery') {
          game.performMastery(building);
        } else {
          game.performBackroom(building);
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
        game.followUp({name: 'chooseBackAlleyAction', args: {space: space}});
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

    chooseBackAlleyAction: (player) => action<{space: BackAlley}>({
      prompt: 'Choose back alley tile',
    }).chooseOnBoard(
      'token', ({space}) => game.all(BackAlleySpace, {letter: space.letter}),
      { skipIf: 'never' }
    ).do(({ token }) => {
      token.first(BackAlleyTile)!.performAction(game);
    }),
    

    activateCustomer: (player) => action<{color: Color}>({
      prompt: "Choose customer to activate"
    }).chooseOnBoard(
      'customer', ({ color }) => $.playerSpace.all(CustomerCard, {color: color}).concat(player.board.first(CustomerCard)!),
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
            break;
          }
          case CustomerType.Witch: {    
            game.followUp({name: 'chooseCandlesToTrade', args: {color: Color.White}});
            break;
          }
          case CustomerType.Priest: {
            $.bag.first(CandlePawn, {color: Color.White})?.putInto(player.nextEmptySpace());
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
      'space', $.playerSpace.all(CandleSpace, {color: $.ready.first(WorkerPiece)?.color})
        .filter(x => x.all(CandlePawn).length == 0) ,
      { skipIf: 'never' }
    ).do(({ space }) => {
      space.container(CustomerCard)!.placeCandle($.ready.first(WorkerPiece)!)
      game.followUp({name: 'activateCustomer', args: {color: space.color}});
    }),

    placeWhiteCandle: player => action({
      prompt: 'Place the candle',
      condition: $.ready.first(WorkerPiece)! instanceof CandlePawn
    }).chooseOnBoard(
      'space', $.playerSpace.all(CandleSpace)
        .filter(x => x.all(CandlePawn).length == 0),
      { skipIf: 'never' }
    ).do(({ space }) => {
      space.container(CustomerCard)!.placeCandle($.ready.first(WorkerPiece)!)
      game.followUp({name: 'activateCustomer', args: {color: Color.White}});
    }),

    placeWorker: (player) => action({
      prompt: 'Use the worker',
      condition: $.ready.all(WorkerPiece).length > 0
    }).chooseOnBoard(
      'space', game.all(WorkerSpace)
        .filter(x => x.all(WorkerPiece).length == 0 
          || (x.top(WorkerPiece) instanceof KeyShape && $.ready.first(WorkerPiece) instanceof ColorDie)
          || (x.top(WorkerPiece) instanceof KeyShape && $.ready.first(WorkerPiece) instanceof CandlePawn)
          || (x.top(WorkerPiece) instanceof ColorDie && $.ready.first(WorkerPiece) instanceof CandlePawn)          
          || (x.top(WorkerPiece) instanceof ColorDie && player.stack && $.ready.first(WorkerPiece) instanceof ColorDie)
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
        .filter(x => x.name != 'pigmentMiddle' || ($.pigmentRepeater.all(WorkerPiece).length > 0 && $.pigmentBackroom.all(WorkerPiece).length > 0))
        .filter(x => x.name != 'moldMiddle' || ($.moldRepeater.all(WorkerPiece).length > 0 && $.moldBackroom.all(WorkerPiece).length > 0))

        // advanced filtering
        .filter(x => [$.waxOrange, $.waxGreen, $.waxPurple].includes(x) && player.board.all(Wax).length < 2 ? false : true)
        
        .filter(x => x == $.pigmentRed && 
          player.board.all(Melt).map(x => x.canTakeColor(Color.Red) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0 ? false : true)
        .filter(x => x == $.pigmentBlue && 
          player.board.all(Melt).map(x => x.canTakeColor(Color.Blue) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0 ? false : true)
        .filter(x => x == $.pigmentYellow && 
          player.board.all(Melt).map(x => x.canTakeColor(Color.Yellow) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0 ? false : true)
        .filter(x => x == $.pigmentOrange && 
            (
              player.board.all(Melt).map(x => x.canTakeColor(Color.Red) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0 ||
              player.board.all(Melt).map(x => x.canTakeColor(Color.Yellow) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0
            ) ? false : true)
        .filter(x => x == $.pigmentGreen && 
            (
              player.board.all(Melt).map(x => x.canTakeColor(Color.Blue) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0 ||
              player.board.all(Melt).map(x => x.canTakeColor(Color.Yellow) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0
            ) ? false : true)
        .filter(x => x == $.pigmentPurple && 
            (
              player.board.all(Melt).map(x => x.canTakeColor(Color.Red) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0 ||
              player.board.all(Melt).map(x => x.canTakeColor(Color.Blue) ? 1 : 0).reduce((sum, current) => sum + current, 0) == 0
            ) ? false : true)
            ,
      { skipIf: 'never' }
    ).do(({ space }) => {
      player.stack = false;
      $.ready.first(WorkerPiece)?.putInto(space);
      // player.selectedWorker = undefined
    }),

    pass: (player) => action({
      prompt: 'Pass',
    }).do(() => {
      game.finish(undefined)
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

    chooseMelt: (player) => action({
      prompt: 'Choose melt to mold',
    }).chooseOnBoard(
      'melt', player.board.all(Melt),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      player.gainCandle(melt, false, 1);
      melt.putInto($.meltSpillArea);  
      // also need to gain points      
    }),
    
    choosePigmentColor: (player) => action({
      prompt: 'Choose melt and pigment color',
    }).chooseOnBoard(
      'melt', player.board.all(Melt),
      { skipIf: 'never' }
    ).chooseFrom(
      "color", ['Red', 'Yellow', 'Blue', 'Finish'], 
      { skipIf: 'never' }
    ).do(({ melt, color }) => {
      if(color != 'Finish') {
        melt.mix(Color[color]);
      }
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

    usePower: (player) => action({
      prompt: 'Use a power tile',
      condition: player.diceCount() > 0,
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

  });

  game.defineFlow(
    loop(
      playerActions({ actions: ['chooseWorker', 'usePower', 'pass']}),
      playerActions({ actions: ['placeWorker', 'placeCandle', 'sellCandle', 'skip']})
    )
  );
});
