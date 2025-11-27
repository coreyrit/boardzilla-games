import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
  numberSetting,
} from '@boardzilla/core';

import { on } from 'events';

import { PlayerSpace, PlayerBoard, ResourceCube, CubeBag, Supply, CubeColor, FundingSpace,
  FundingDeck, FundingCard, UpgradeSpace, UpgradeDeck, UpgradeCard, CubePlate, ScoreCube, 
  ScoreSpace, ScoreTrack, MainBoard, PlayersSpace, PowerToken, TokenAbility, AvailableTokenSpace,
  PowerTokenSpace,
  TokenAction,
  ReactorSpace,
  LEDCard,
  LEDSpace,
  ResourceSpace,
  UpgradeType,
  UnavailableTokenSpace,
  StorageSpace,
  RoundSpace,
  RoundTracker,
  PublishToken,
  PriorityPawn
 } from './components.js';
import { buildGame } from './build.js';

export class BlueBreakthroughPlayer extends Player<MyGame, BlueBreakthroughPlayer> {
    space: PlayerSpace
    board: PlayerBoard
    score: number = 0;
    doneTesting: boolean = false;

    public scorePoints(points: number) {
      this.game.message(this + " score " + points + " points.");
      this.score += points;
      const oneCube = this.board.first(ScoreTrack, {tens: false})!.first(ScoreCube)!;
      const tenCube = this.board.first(ScoreTrack, {tens: true})!.first(ScoreCube)!;

      let temp = this.score;
      while(temp >= 100) {
        temp -= 100;
      }

      const tens = Math.floor(temp / 10);
      const ones = temp % 10;

      oneCube.putInto(this.board.first(ScoreTrack, {tens: false})!.first(ScoreSpace, {value: ones})!);
      tenCube.putInto(this.board.first(ScoreTrack, {tens: true})!.first(ScoreSpace, {value: tens * 10})!);
    }

    public publishPaper() : void {
      this.space.first(PublishToken, {flipped: false})!.flipped = true;
      switch(this.space.all(PublishToken, {flipped: true}).length) {
        case 1:
          this.scorePoints(1);
          break;
        case 2:
          this.scorePoints(3);
          break;
        case 3:
          this.scorePoints(6);
          break;
        case 4:
          this.scorePoints(10);
          break;
        case 5:
          this.scorePoints(15);
          break;
      }
    }
    
    public getScore() : number {
      return this.score;
    }

    public placeUpgrade(upgrade: UpgradeCard) : void {
      let space: ReactorSpace | null = null;
      if(upgrade.type == UpgradeType.pump) {
        const spaces = this.board.all(ReactorSpace, {type: UpgradeType.pump});
        if(spaces[0].all(UpgradeCard).length == 0) {
          space = spaces[0];
        } else {
          space = spaces[1];
        }
      } else {
        space = this.board.first(ReactorSpace, {type: upgrade.type})!
      }

      if(space!.all(UpgradeCard).length > 0) {
        this.game.followUp({name: 'discardUpgrade', args: {upgrade: upgrade}});
      } else {
        upgrade.putInto(space!);
      }
    }
}

export class MyGame extends Game<MyGame, BlueBreakthroughPlayer> {
  public round = 1;
  public priority = 1;

  public getPriorityDistance(player: BlueBreakthroughPlayer): number {
    const playerIndex = this.players.indexOf(player) + 1;
    if(playerIndex < this.priority) {
      return (playerIndex + this.players.length) - playerIndex;
    } else {
      return this.priority - playerIndex;
    }
  }

  public colorFromSymbol(symbol: string) : CubeColor {
      switch(symbol) {
      case '⬜':
        return CubeColor.White;
      case '🟫':
        return CubeColor.Brown;
      case '🟦':
        return CubeColor.Blue;
      case '🟧':
        return CubeColor.Orange;
      case '⬛':
        return CubeColor.Black;
      case '🟥':
        return CubeColor.Red;
      case '🟨':
        return CubeColor.Yellow;
      default:
        return CubeColor.Any;
      }
    }

  public getStage(round: number) : number {
    switch(round) {
      case 1:
        return 1;
      case 2:
      case 3:
      case 4:
      case 5:
        return 2;
      case 6:
      case 7:
        return 3;
    }
    return 0;
  }

  public addRoundCubes(round: number) {
    this.game.all(CubePlate).all(ResourceCube).forEach(x => x.putInto(this.game.first(Supply)!));

    const bag = this.first(CubeBag)!;
    const supply = this.first(Supply)!

    for(var i = 0; i < this.players.length; i++) {
      switch(round) {
        case 1:         
          supply.first(ResourceCube, {color: CubeColor.Orange})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Orange})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Orange})!.putInto(bag);  
          supply.first(ResourceCube, {color: CubeColor.Brown})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Brown})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Brown})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Blue})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.White})!.putInto(bag);        
          break;
        case 2:          
          supply.first(ResourceCube, {color: CubeColor.Orange})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Brown})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Blue})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.White})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Black})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Black})!.putInto(bag);
          break;
        case 3:          
          supply.first(ResourceCube, {color: CubeColor.Blue})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.White})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Black})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Black})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Red})!.putInto(bag);
          break;
        case 4:          
          supply.first(ResourceCube, {color: CubeColor.Blue})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.White})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Red})!.putInto(bag);
          break;
        case 5:          
          supply.first(ResourceCube, {color: CubeColor.Blue})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.White})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Red})!.putInto(bag);
          break;
        case 6:          
          supply.first(ResourceCube, {color: CubeColor.Blue})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.White})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Red})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Yellow})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Yellow})!.putInto(bag);
          break;
        case 7:          
          supply.first(ResourceCube, {color: CubeColor.Blue})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.White})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Yellow})!.putInto(bag);
          break;
      }
    }
    bag .shuffle();
    this.game.message("Bag size: " + bag.all(ResourceCube).length);
  }

  public drawCubesToPlates() {
    
      for(var i = 1; i <= this.players.length; i++) {
        for(var j = 0; j < 4; j++) {
          const bag = this.first(CubeBag)!;
          const plate = this.first(CubePlate, {index: i})!;
          if(bag.all(ResourceCube).length > 0) {
            const cube = bag.top(ResourceCube)!;
            cube.putInto(plate);
          }
        }
      }
  }

  public fillFunding() {
    // clear previous cards first
    for(const space of this.all(FundingSpace)) {
      for(const card of space.all(FundingCard)) {
        card.putInto(this.first(Supply)!);
      }
    }
    for(var i = 1; i <= this.players.length; i++) {
      this.first(FundingDeck)!.top(FundingCard)!.putInto(this.first(FundingSpace, {index: i})!);
    }
  }

  public fillUpgrades(round: number) {
    // clear previous cards first
    for(const space of this.all(UpgradeSpace)) {
      for(const card of space.all(UpgradeCard, {stage: this.getStage(round)-1})) {
        card.putInto(this.first(Supply)!);
      }
    }
    for(var i = 1; i <= this.players.length; i++) {
      for(const space of this.all(UpgradeSpace, {index: i})) {
        if(space.all(UpgradeCard).length == 0) {
          this.first(UpgradeDeck)!.top(UpgradeCard, {stage: this.getStage(round)})!.putInto(space);
        }
      }
    }
  }

  public playersRemaining(action: TokenAction): BlueBreakthroughPlayer[] {
    return this.all(PowerTokenSpace, 
      {action: action, complete: false}).map(x => x.container(PlayerSpace)!.player!);
  }

  public nextTurnOrder(action: TokenAction): BlueBreakthroughPlayer {
    const playersRemaining: BlueBreakthroughPlayer[] = this.playersRemaining(action);

    let nextPlayer: BlueBreakthroughPlayer | null = null;
    let bestToken: PowerToken | null = null;    
    let bestScore: number = -1;
    let bestSum: number = -1;
    let bestPriority: number = -1;

    playersRemaining.forEach( p=> {
      const token = p.board.first(PowerTokenSpace, {action: action})!.first(PowerToken)!
      
      const playerScore = p.getScore();
      const distance = this.getPriorityDistance(p);
      const tokenSum = p.board.all(PowerTokenSpace).reduce((sum, x) => sum + x.first(PowerToken)!.value, 0);

      let secondTieBreaker: boolean = false;
      switch(action) {
        case TokenAction.Funding:
          secondTieBreaker = playerScore > bestScore;
          break;
        case TokenAction.Resources:
          secondTieBreaker = tokenSum < bestSum;
          break;
        case TokenAction.Upgrade:
          secondTieBreaker = tokenSum > bestSum;
          break;
      }

      if(bestToken == null || [TokenAbility.Publish, TokenAbility.Recall].includes(bestToken.ability)) {
        bestToken = token; nextPlayer = p; bestScore = playerScore; bestSum = tokenSum; bestPriority = distance;
        // this.game.message("Initializing turn: " + nextPlayer);
      } else {
        // first check token value
        if(action == TokenAction.Funding ? token.value > bestToken.value : token.value < bestToken.value) {
          bestToken = token; nextPlayer = p; bestScore = playerScore; bestSum = tokenSum; bestPriority = distance;
          // this.game.message("Highest value: " + nextPlayer);
        } 
        // then check abilities if tied
        else if(token.value == bestToken.value && 
            token.ability == TokenAbility.A && bestToken.ability == TokenAbility.B) {
          bestToken = token; nextPlayer = p; bestScore = playerScore; bestSum = tokenSum; bestPriority = distance;
          // this.game.message("A vs B: " + nextPlayer);
        } 
        // then second tie-breakerif still tied
        else if(token.value == bestToken.value && token.ability == bestToken.ability && secondTieBreaker) {
          bestToken = token; nextPlayer = p; bestScore = playerScore; bestSum = tokenSum; bestPriority = distance;
          // this.game.message("2nd tie-breaker: " + nextPlayer);
        }         
        // final tie goes to priority pawn
        else if(token.value == bestToken.value && token.ability == bestToken.ability && !secondTieBreaker && distance < bestPriority) {
          bestToken = token; nextPlayer = p; bestScore = playerScore; bestSum = tokenSum; bestPriority = distance;
          // this.game.message("Priority: " + nextPlayer);
        }
      }
    })

    this.game.message("Next turn: " + nextPlayer);
    return nextPlayer!;
  }
  
  public getPlayerToken(player: BlueBreakthroughPlayer, action: TokenAction) : PowerToken {
    return player.board.first(PowerTokenSpace, {action: action})!.first(PowerToken)!;
  }

  public getEra() : number {
    return 1;
  }
}

export default createGame(BlueBreakthroughPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, forLoop, eachPlayer, whileLoop, ifElse } = game.flowCommands;

  buildGame(game);
  
  game.defineActions({
    placeToken: (player) => action({
      prompt: 'Place Token'
    }).chooseOnBoard(
      'token', player.board.first(AvailableTokenSpace)!.all(PowerToken),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'space', player.board.all(PowerTokenSpace).filter(x => x.all(PowerToken).length == 0),
      { skipIf: 'never' }
    ).do(({ token, space }) => {
      token.putInto(space);
    }).message(`{{player}} placed a token on {{space}}.`),

    chooseFunding: (player) => action({
      prompt: 'Choose Funding',
      condition: game.getPlayerToken(player, TokenAction.Funding).mayPeformAction()
    }).chooseOnBoard(
      'funding', game.all(FundingSpace).all(FundingCard),
      { skipIf: 'never' }
    ).do(({ funding }) => {
      funding.putInto(player.space);
      player.space.first(PowerTokenSpace, {action: TokenAction.Funding})!.complete = true;
      player.scorePoints(game.getPlayerToken(player, TokenAction.Funding).value);
    }).message(`{{player}} took {{funding}}.`),

    publishFunding: (player) => action({
      prompt: 'Publish',
      condition: game.getPlayerToken(player, TokenAction.Funding).ability == TokenAbility.Publish
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Funding})!.complete = true;
    }),

    recallFunding: (player) => action({
      prompt: 'Recall',
      condition: game.getPlayerToken(player, TokenAction.Funding).ability == TokenAbility.Recall
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Funding})!.complete = true;
    }),

    useFunding: (player) => action<{upgrade: UpgradeCard}>({
      prompt: "Use Funding"
    }).chooseOnBoard(
      'funding', player.space.all(FundingCard),
      { skipIf: 'never' }
    ).chooseFrom(
      "choice", ['Yes', 'No'], 
      { prompt: "Discard?", skipIf: 'never' }
    ).do(({ funding, choice }) => {
      if(choice == "Yes") {
        game.followUp({name: 'chooseAnyResoure', args: {funding: funding}});
      }
    }), 

    storeCubes: (player) => action({
      prompt: "Store Cubes"
    }).chooseOnBoard(
      'cubes', player.space.first(ResourceSpace)!.all(ResourceCube),
      { min: 0, max: game.getStage(game.round), skipIf: 'never' }
    ).do(({ cubes }) => {
      for(var i = 0; i < cubes.length; i++) {
        cubes[i].putInto(player.space.first(StorageSpace, {stage: (i+1)})!);
      }
    }),
    
    recallToken: (player) => action({
      prompt: "Recall Token"
    }).chooseOnBoard(
      'token', player.board.all(PowerTokenSpace).all(PowerToken)
        .concat(player.board.first(UnavailableTokenSpace)!.all(PowerToken))
        .filter(x => x.ability != TokenAbility.Recall),
      { skipIf: 'never' }
    ).do(({ token }) => {
      player.scorePoints(player.space.first(UnavailableTokenSpace)!.all(PowerToken).length);
      token.showOnlyTo(player);
      token.putInto(player.space.first(AvailableTokenSpace)!);
    }),

    chooseAnyResoure: (player) => action<{funding: FundingCard}>({
    }).chooseFrom(
      "choice", ['⬜','🟫','🟦','🟧','⬛','🟥','🟨'],
      { skipIf: 'never'}
    ).do(({funding, choice}) => {
      game.first(Supply)!.first(ResourceCube, {color: game.colorFromSymbol(choice)})!
        .putInto(player.space.first(ResourceSpace)!);
      if(funding != undefined) {
        funding.putInto(game.first(Supply)!);
      }
    }),

    chooseResources: (player) => action({
      condition: game.getPlayerToken(player, TokenAction.Resources).mayPeformAction(),
      prompt: "Gain Resources (" + game.getPlayerToken(player, TokenAction.Resources).value + ")"
    }).chooseOnBoard(
      'plate', game.all(CubePlate).filter(x => x.all(ResourceCube).length > 0),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'cubes', ({plate}) => plate.all(ResourceCube),
      { number: game.getPlayerToken(player, TokenAction.Resources).value }
    ).do(({ plate, cubes }) => {
      cubes.forEach( c=> c.putInto(player.space.first(ResourceSpace)!) );
      player.space.first(PowerTokenSpace, {action: TokenAction.Resources})!.complete = true;
      player.scorePoints(plate.all(ResourceCube).length);
      plate.all(ResourceCube).forEach( c=> c.putInto(game.first(Supply)!) );
    }),

    publishResources: (player) => action({
      prompt: 'Publish',
      condition: game.getPlayerToken(player, TokenAction.Resources).ability == TokenAbility.Publish
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Resources})!.complete = true;
    }),

    recallResources: (player) => action({
      prompt: 'Recall',
      condition: game.getPlayerToken(player, TokenAction.Resources).ability == TokenAbility.Recall
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Resources})!.complete = true;
    }),

    chooseUpgrades: (player) => action({
      condition: game.getPlayerToken(player, TokenAction.Upgrade).mayPeformAction(),
      prompt: "Choose Upgrades (" + game.getPlayerToken(player, TokenAction.Upgrade).value + ")"
    }).chooseOnBoard(
      'upgrades', game.all(UpgradeSpace).all(UpgradeCard).filter(x => x.cost <= game.getPlayerToken(player, TokenAction.Upgrade).value),
      { min: 1, max: 2, skipIf: 'never', validate: ({upgrades}) => {
        const upgradeSum = upgrades.reduce((sum, x) => sum + x.cost, 0)
        return upgradeSum <= game.getPlayerToken(player, TokenAction.Upgrade).value;
      } }
    ).do(({ upgrades }) => {
      upgrades.forEach( c=> player.placeUpgrade(c) );      
      player.scorePoints(game.getEra() * upgrades.length);
      player.space.first(PowerTokenSpace, {action: TokenAction.Upgrade})!.complete = true;
    }),  

    discardUpgrade: (player) => action<{upgrade: UpgradeCard}>({
      prompt: "Replace Upgrade?"
    }).chooseFrom(
      "choice", ['Yes', 'No'], 
      { skipIf: 'never' }
    ).do(({ upgrade, choice }) => {
      // game.message('upgrade = '  + upgrade + ', choice = ' + choice);

      if(choice == 'Yes') {
        player.board.first(ReactorSpace, {type: upgrade.type})!.first(UpgradeCard)!.putInto(game.first(Supply)!);
        upgrade.putInto(player.board.first(ReactorSpace, {type: upgrade.type})!);
      } else {
        upgrade.putInto(game.first(Supply)!);
      }
    }),  
    
    drawUpgrade: (player) => action({
      prompt: 'Draw Upgrade',
      condition: game.getPlayerToken(player, TokenAction.Upgrade).mayPeformAction(),
    }).do(() => {
      // this automatically happens .....
      const upgrade = game.first(UpgradeDeck)!.first(UpgradeCard, {stage: game.getStage(game.round)})!;
      player.placeUpgrade(upgrade);
      player.scorePoints(game.getEra());
      player.space.first(PowerTokenSpace, {action: TokenAction.Upgrade})!.complete = true;
      game.message(`{player} drew {upgrade`)
    }),

    publishUpgrades: (player) => action({
      prompt: 'Publish',
      condition: game.getPlayerToken(player, TokenAction.Upgrade).ability == TokenAbility.Publish
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Upgrade})!.complete = true;
    }),

    recallUpgrades: (player) => action({
      prompt: 'Recall',
      condition: game.getPlayerToken(player, TokenAction.Upgrade).ability == TokenAbility.Recall
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Upgrade})!.complete = true;
    }),

    end: () => action({
      prompt: 'Game over'
    }).chooseOnBoard(
      'none', []
    ),

    flipLED: (player) => action({
      prompt: 'Flip LED',
      condition: player.board.first(LEDSpace)!.all(ResourceCube).length == 0
    }).do(() => {
      const first = player.board.first(LEDCard)!;
      first.putInto(player.board.first(LEDSpace)!);
    }),

    placeCube: (player) => action({
      prompt: 'Place Cube'
    }).chooseOnBoard(
      'cube', player.space.first(ResourceSpace)!.all(ResourceCube)
        .filter(c=> player.board.first(LEDSpace)!.first(LEDCard)!.nextColorsNeeded().includes(c.color))
        ,
      { skipIf: 'never' }
    ).chooseOnBoard(
      'row', ({cube}) => player.board.first(LEDSpace)!.first(LEDCard)!.rowsNeedingColor(cube.color),
      { skipIf: 'never' }
    ).do(({cube, row}) => {
      cube.putInto(row);
    }),

    chooseCostCube: (player) => action<{upgrade: UpgradeCard}>({
      prompt: 'Choose Cube'
    }).chooseOnBoard(
      'cube', player.space.first(ResourceSpace)!.all(ResourceCube),
      { skipIf: 'never' }
    ).do(({upgrade, cube}) => {
      const supply = game.first(Supply)!;
      const resources = player.space.first(ResourceSpace)!
      cube.putInto(supply);
      for(const color of upgrade.output) {
          supply.first(ResourceCube, {color: color})!.putInto(resources);
        }
    }),

    useUpgrade: (player) => action({
      prompt: 'Use Upgrade'
    }).chooseOnBoard(
      'upgrade', player.board.all(UpgradeCard).filter(x => x.mayUse()),
    ).do(({upgrade}) => {
      player.scorePoints(upgrade.points);
      const supply = game.first(Supply)!;
      const resources = player.space.first(ResourceSpace)!

      for(const color of upgrade.input) {
        if(color != CubeColor.Any) {
          resources.first(ResourceCube, {color: color})!.putInto(supply);
        }
      }
      if(upgrade.input.includes(CubeColor.Any)) {
        game.followUp({name: 'chooseCostCube', args: {upgrade: upgrade}});
      } else {
        for(const color of upgrade.output) {
          if(color != CubeColor.Any) {
            supply.first(ResourceCube, {color: color})!.putInto(resources);
          }
        }
        if(upgrade.output.includes(CubeColor.Any)) {
          game.followUp({name: 'chooseAnyResoure'});
        }
      }
      upgrade.rotation = 90;
    }),

    finishTesting: (player) => action({
      prompt: 'Finish Testing'
    }).do(() => {
      player.doneTesting = true;
    }),
  });

  game.defineFlow(

    forLoop({ name: 'round', initial: 1, next: round => round + 1, while: round => round <= 7, do: [

      // start round
      () => game.first(PriorityPawn)!.putInto(game.players[game.priority-1].space),
      ({round}) => game.first(RoundTracker)!.putInto(game.first(RoundSpace, {round: round})!),
      () => game.players.forEach(x => x.board.all(StorageSpace).all(ResourceCube).forEach(c => c.putInto(x.space.first(ResourceSpace)!))),
      ({round}) => game.round = round,
      ({round}) => game.addRoundCubes(round),
      () => game.drawCubesToPlates(),
      () => game.fillFunding(),
      ({round}) => game.fillUpgrades(round),

      // place tokens
      eachPlayer({
        name: 'turn', do: [
          whileLoop({while: ({turn}) => 
            turn.board.all(PowerTokenSpace).all(PowerToken).length < 3, do: (
                [
                  playerActions({ actions: ['placeToken']}),
                ]
          )})          
        ]
      }),        

      // reveal tokens
      () => game.all(PowerTokenSpace).all(PowerToken).forEach( x=> x.showToAll() ),

      // resolve funding
      whileLoop({while: () => game.playersRemaining(TokenAction.Funding).length > 0, do: ([  
        eachPlayer({name: 'turn', do: [
          ifElse({
            if: ({turn}) => game.nextTurnOrder(TokenAction.Funding) == turn, do: [
              playerActions({ actions: ['chooseFunding', 'publishFunding', 'recallFunding']}),
            ],
          }),   
        ]}),
      ])}),

      // resolve resources
      whileLoop({while: () => game.playersRemaining(TokenAction.Resources).length > 0, do: ([  
        eachPlayer({name: 'turn', do: [
          ifElse({
            if: ({turn}) => game.nextTurnOrder(TokenAction.Resources) == turn, do: [
              playerActions({ actions: ['chooseResources', 'publishResources', 'recallResources']}),
            ],
          }),   
        ]}),
      ])}),

      // resolve upgrades
      whileLoop({while: () => game.playersRemaining(TokenAction.Upgrade).length > 0, do: ([  
        eachPlayer({name: 'turn', do: [
          ifElse({
            if: ({turn}) => game.nextTurnOrder(TokenAction.Upgrade) == turn, do: [
              playerActions({ actions: ['chooseUpgrades', 'publishUpgrades', 'recallUpgrades', 'drawUpgrade']}),
            ],
          }),   
        ]}),
      ])}),

      // test phase
      eachPlayer({
        name: 'turn', do: [
          whileLoop({while: ({turn}) => 
            !turn.doneTesting, do: (
                [
                  playerActions({ actions: ['flipLED', 'placeCube', 'useUpgrade', 'useFunding', 'finishTesting']}),
                  // ({turn}) => game.message("After: Next colors needed: " + turn.board.first(LEDSpace)!.first(LEDCard)!.nextColorsNeeded()),
                ]
          )}),
          
          // score points for testing
          ({turn}) => turn.space.first(LEDSpace)!.scoreTesting(turn),

          // store leftover cubes
          ifElse({
            if: ({turn}) => turn.space.first(ResourceSpace)!.all(ResourceCube).length > 0, do: [
              playerActions({ actions: ['storeCubes']}),
            ],
          }), 

          // activate player publish ability
          ifElse({
            if: ({turn}) => turn.board.all(PowerTokenSpace).all(PowerToken, {ability: TokenAbility.Publish}).length > 0, do: [
              ({turn}) => turn.publishPaper(),
            ],
          }),

          // activate player recall ability
          ifElse({
            if: ({turn}) => turn.board.all(PowerTokenSpace).all(PowerToken, {ability: TokenAbility.Recall}).length > 0, do: [
              playerActions({ actions: ['recallToken']}),
            ],
          }),
        ]
      }),           
    
      // prepare for next round
      () => game.players.forEach( p=> {
        const cooldown = p.board.first(UnavailableTokenSpace)!;
        p.board.all(PowerTokenSpace).all(PowerToken).forEach( t=> t.putInto(cooldown) );
        if(cooldown.all(PowerToken).length >= 7) {
          cooldown.all(PowerToken).forEach(x => {
            x.showOnlyTo(p);
            x.putInto(p.board.first(AvailableTokenSpace)!)
          });
        }
        p.board.all(PowerTokenSpace).forEach( s=> s.complete = false );
        p.doneTesting = false;
        p.board.all(UpgradeCard).forEach( u => u.rotation = 0 );
        p.board.first(LEDSpace)!.all(ResourceCube).forEach( c => c.putInto(game.first(Supply)!) );
        p.space.first(ResourceSpace)!.all(ResourceCube).forEach( c => c.putInto(game.first(Supply)!) );
      }),
      () => {
        game.priority++;
        if(game.priority > game.players.length) {
          game.priority = 1;
        }
      },

    ]}),

    () => game.message("Game Over."),
  );
});
