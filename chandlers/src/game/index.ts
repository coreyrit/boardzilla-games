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
import { BackAlleySpace, Candelabra, ChandlersBoard, ComponentSpace, CustomerSpace, DiceSpace, GameEndSpace, KeyHook, MasterySpace, MasteryTrack, PlayerBoard, PlayerSpace, PowerSpace, ReadySpace, RoundEndSpace, ScoringSpace, ScoringTrack, Spill, WorkerSpace } from './boards.js';

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
        // also need to do the back alley action    
        break;
      }
      case Building.Pigment: {
        this.currentPlayer().board.all(PowerTile).forEach(x => {x.flipped = true});
        // also need to do the back alley action    
        break;
      }
      case Building. Mold: {
        this.followUp({name: 'chooseCandlesToTrade'});    
        // also need to do the back alley action    
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
  $.drawCustomer.create(CustomerCard, 'intrepidity')
  $.drawCustomer.create(CustomerCard, 'audacity')
  $.drawCustomer.create(CustomerCard, 'bamboozle')
  $.drawCustomer.create(CustomerCard, 'blessing-of-autumn')
  $.drawCustomer.create(CustomerCard, 'blessing-of-heaven')
  $.drawCustomer.create(CustomerCard, 'blessing-of-midnight')
  $.drawCustomer.create(CustomerCard, 'blessing-of-moonlight')
  $.drawCustomer.create(CustomerCard, 'blessing-of-spring')
  $.drawCustomer.create(CustomerCard, 'blessing-of-summer')
  $.drawCustomer.create(CustomerCard, 'broker')
  $.drawCustomer.create(CustomerCard, 'bypass')
  $.drawCustomer.create(CustomerCard, 'cleansing-flood')
  $.drawCustomer.create(CustomerCard, 'cutoff')
  $.drawCustomer.create(CustomerCard, 'daring')
  $.drawCustomer.create(CustomerCard, 'dealer')
  $.drawCustomer.create(CustomerCard, 'deception')
  $.drawCustomer.create(CustomerCard, 'detour')
  $.drawCustomer.create(CustomerCard, 'discount')
  $.drawCustomer.create(CustomerCard, 'discovery')
  $.drawCustomer.create(CustomerCard, 'double-dip')
  $.drawCustomer.create(CustomerCard, 'exploit')
  $.drawCustomer.create(CustomerCard, 'exploration')
  $.drawCustomer.create(CustomerCard, 'grift')
  $.drawCustomer.create(CustomerCard, 'heroism')
  $.drawCustomer.create(CustomerCard, 'hoodwink')
  $.drawCustomer.create(CustomerCard, 'infernal-rush')
  $.drawCustomer.create(CustomerCard, 'intrepidity')
  $.drawCustomer.create(CustomerCard, 'lightning-crash')
  $.drawCustomer.create(CustomerCard, 'miscount', {requiredCandles: [Color.Green, Color.Orange, Color.Black]})
  $.drawCustomer.create(CustomerCard, 'nourishing-wave')
  $.drawCustomer.create(CustomerCard, 'operator')
  $.drawCustomer.create(CustomerCard, 'passage')
  $.drawCustomer.create(CustomerCard, 'prince-rohan')
  $.drawCustomer.create(CustomerCard, 'prince-tyrion')
  $.drawCustomer.create(CustomerCard, 'princess-buttercup')
  $.drawCustomer.create(CustomerCard, 'princess-evergreen')
  $.drawCustomer.create(CustomerCard, 'princess-peach')
  $.drawCustomer.create(CustomerCard, 'princess-perrywinkle')
  $.drawCustomer.create(CustomerCard, 'retailer')
  $.drawCustomer.create(CustomerCard, 'scam')
  $.drawCustomer.create(CustomerCard, 'seller')
  $.drawCustomer.create(CustomerCard, 'shadow-strike')
  $.drawCustomer.create(CustomerCard, 'shortcut')
  $.drawCustomer.create(CustomerCard, 'sleight-of-hand')
  $.drawCustomer.create(CustomerCard, 'sunlight-surge')
  $.drawCustomer.create(CustomerCard, 'tomfoolery')
  $.drawCustomer.create(CustomerCard, 'trail')
  $.drawCustomer.create(CustomerCard, 'trickery')
  $.drawCustomer.create(CustomerCard, 'vendor')

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

  const bag = game.create(Space, 'bag')
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
  game.create(BackAlleySpace, 'backAlleySpaceA1');
  game.create(BackAlleySpace, 'backAlleySpaceA2');
  game.create(BackAlleySpace, 'backAlleySpaceA3');
  game.create(BackAlleySpace, 'backAlleySpaceA4');

  game.create(BackAlleySpace, 'backAlleySpaceB1');
  game.create(BackAlleySpace, 'backAlleySpaceB2');
  game.create(BackAlleySpace, 'backAlleySpaceB3');
  game.create(BackAlleySpace, 'backAlleySpaceB4');

  game.create(BackAlleySpace, 'waxBackAlleySpaceA');
  game.create(BackAlleySpace, 'pigmentBackAlleySpaceA');
  game.create(BackAlleySpace, 'pigmentBackAlleySpaceB');
  game.create(BackAlleySpace, 'moldBackAlleySpaceB');

  game.create(BackAlleyTile, 'refresh-customers', {letter: "A"});
  game.create(BackAlleyTile, 'melt-wax', {letter: "A"});
  game.create(BackAlleyTile, 'purchace-spilt-wax', {letter: "A"});
  game.create(BackAlleyTile, 'convert-key-to-die', {letter: "A"});
  game.create(BackAlleyTile, 'move-candle', {letter: "A"});
  game.create(BackAlleyTile, 'swap-customer', {letter: "A"});

  game.create(BackAlleyTile, 'add-pigment', {letter: "B"});
  game.create(BackAlleyTile, 'advance-mastery', {letter: "B"});
  game.create(BackAlleyTile, 'gain-goal-card', {letter: "B"});
  game.create(BackAlleyTile, 'place-white-candle', {letter: "B"});
  game.create(BackAlleyTile, 'remove-pigment', {letter: "B"});
  game.create(BackAlleyTile, 'two-wax', {letter: "B"});

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

  $.drawCustomer.top(CustomerCard)?.putInto($.playerSpace)



  game.all(Candelabra).first(CandlePawn, {color: Color.Orange})?.putInto($.playerSpace.first(CustomerCard)!);
  $.bag.first(Wax)?.putInto($.playerSpace.first(CustomerCard)!);


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

    chooseCandlesToTrade: (player) => action({
      prompt: 'Choose candles to trade'
    }).chooseOnBoard(
      'playerCandle', player.board.all(CandlePawn),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'candle', game.all(Candelabra).all(CandlePawn),
      { skipIf: 'never' }
    ).do(({ playerCandle, candle }) => {
      playerCandle.putInto($.bag);
      candle.putInto(player.nextEmptySpace());
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

    chooseWax: (player) => action({
      prompt: 'Choose wax to melt',
    }).chooseOnBoard(
      'wax', player.board.all(Wax),
      { skipIf: 'never', min: 2, max: 8 }
    ).do(({ wax }) => {
      player.meltWaxSpill(wax);
    }),

    chooseWaxRepeater: (player) => action({
      prompt: 'Choose wax to melt',
    }).chooseOnBoard(
      'wax', player.board.all(Wax),
      { skipIf: 'never', min: 1, max: player.masteryLevel() }
    ).do(({ wax }) => {
      player.meltWax(wax);
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

    chooseMeltRed: player => action({
      prompt: 'Choose melt to pigment red',
    }).chooseOnBoard(
      'melt', player.board.all(Melt),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      melt.mix(Color.Red);
    }),
    chooseMeltYellow: player => action({
      prompt: 'Choose melt to pigment yellow',
    }).chooseOnBoard(
      'melt', player.board.all(Melt),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      melt.mix(Color.Yellow);
    }),
    chooseMeltBlue: player => action({
      prompt: 'Choose melt to pigment blue',
    }).chooseOnBoard(
      'melt', player.board.all(Melt),
      { skipIf: 'never' }
    ).do(({ melt }) => {
      melt.mix(Color.Blue);
    }),

    chooseMeltManyRed: player => action({
      prompt: 'Choose melt(s) to pigment red',
    }).chooseOnBoard(
      'melts', player.board.all(Melt),
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
      'melts', player.board.all(Melt),
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
      'melts', player.board.all(Melt),
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


    placeWorker: (player) => action({
      prompt: 'Place the worker',
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
      playerActions({ actions: ['placeWorker', 'skip']})
    )
  );
});
