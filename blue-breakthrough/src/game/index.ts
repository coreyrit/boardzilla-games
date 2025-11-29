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
  PriorityPawn,
  FundingType
 } from './components.js';
import { buildGame } from './build.js';
import { Actions } from './actions.js';
import { FundingPowers } from './powers.js';
import { FundingName } from './funding.js';

export class BlueBreakthroughPlayer extends Player<MyGame, BlueBreakthroughPlayer> {
    space: PlayerSpace
    board: PlayerBoard
    score: number = 0;
    doneTesting: boolean = false;
    doneActions: boolean = false;
    fundingBoost: number = 0;
    purchasedUpgrades: number = 0;

    public hasFunding(name: FundingName) : boolean {
      return this.space.all(FundingCard, {name: name}).length > 0 && 
          this.space.first(FundingCard, {name: name})!.rotation == 0 &&
          this.space.first(FundingCard, {name: name})!.all(UpgradeCard).length == 0;
    }

    public spendUpgradeCost(upgrade: UpgradeCard) {
      const supply = this.game.first(Supply)!;
      const resources = this.space.first(ResourceSpace)!

      for(const color of upgrade.input) {
        if(color != CubeColor.Any) {
          resources.first(ResourceCube, {color: color})!.putInto(supply);
        }
      }
      if(upgrade.input.includes(CubeColor.Any)) {
        this.game.followUp({name: 'chooseCostCube', args: {upgrade: upgrade}});
      }
    }

    public gainUpgradeBenefit(upgrade: UpgradeCard) {
      const supply = this.game.first(Supply)!;
      const resources = this.space.first(ResourceSpace)!

        for(const color of upgrade.output) {
          if(color != CubeColor.Any) {
            supply.first(ResourceCube, {color: color})!.putInto(resources);
          }
        }
        if(upgrade.output.includes(CubeColor.Any)) {
          this.game.followUp({name: 'chooseAnyResource'});
        }
    }

    public useUpgrade(upgrade: UpgradeCard, spendCost: boolean = true) {
      const powers = new FundingPowers(this.game);
      this.scorePoints(upgrade.points);
      if(spendCost) {
        this.spendUpgradeCost(upgrade);
      }
      powers.usingUpgrade(this, upgrade);
      this.gainUpgradeBenefit(upgrade);

      if(this.hasFunding(FundingName.ReactorGrant) && upgrade.type == UpgradeType.heater) {
        this.scorePoints(2);
      }
      if(!this.hasFunding(FundingName.BackupGenerator) || upgrade.type != UpgradeType.exhaust) {
        upgrade.rotation = 90;
      }
    }

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
      for(const player of this.game.players) {
        if(player != this && player.hasFunding(FundingName.PatentLicense) && player.space.all(UpgradeCard, {type: upgrade.type}).length > 0) {
          player.scorePoints(1);
        }
      }

      if(this.hasFunding(FundingName.TemporarySlot)) {
        this.game.followUp({name: 'useTemporarySlot', args: {upgrade: upgrade}});
      } else {
        this.finishPlacingUpgrade(upgrade);
      }
    }

    public finishPlacingUpgrade(upgrade: UpgradeCard) : void {
      let space: ReactorSpace | null = null;
      
      if(upgrade.type == UpgradeType.pump) {
        const spaces = this.board.all(ReactorSpace, {type: UpgradeType.pump});
        if(spaces[0].all(UpgradeCard).length == 0) {
          space = spaces[0];
        } else if(spaces[1].all(UpgradeCard).length == 0) {
          space = spaces[1];
        } else {
          this.game.followUp({name: 'discardPump', args: {upgrade: upgrade}});
          return;
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
      return (playerIndex + this.players.length) - this.priority;
    } else {
      return playerIndex - this.priority;
    }
  }

  public symbolFromColor(color: CubeColor) : string {
    switch(color) {
      case CubeColor.White:
        return '⬜'
      case CubeColor.Brown:
        return '🟫'
      case CubeColor.Blue:
        return '🟦'
      case CubeColor.Orange:
        return '🟧'
      case CubeColor.Black:
        return '⬛'
      case CubeColor.Red:
        return '🟥'
      case CubeColor.Yellow:
        return '🟨'
      default:
        return '✳️'
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
    let bestValue: number = -1;
    let bestScore: number = -1;
    let bestSum: number = -1;
    let bestPriority: number = -1;

    playersRemaining.forEach( p=> {
      const token = p.board.first(PowerTokenSpace, {action: action})!.first(PowerToken)!
      
      const tokenValue = token.value + (action == TokenAction.Funding ? p.fundingBoost : 0);
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
        bestToken = token; bestValue = tokenValue; nextPlayer = p; bestScore = playerScore; bestSum = tokenSum; bestPriority = distance;
        this.game.message("Initializing turn: " + nextPlayer);
      } else {
        // first check token value
        if(action == TokenAction.Funding ? tokenValue > bestValue : tokenValue < bestValue) {
          bestToken = token; bestValue = tokenValue; nextPlayer = p; bestScore = playerScore; bestSum = tokenSum; bestPriority = distance;
          this.game.message("Highest value: " + nextPlayer);
        } 
        // then check abilities if tied
        else if(tokenValue == bestValue && 
            token.ability == TokenAbility.A && bestToken.ability == TokenAbility.B) {
          bestToken = token; bestValue = tokenValue; nextPlayer = p; bestScore = playerScore; bestSum = tokenSum; bestPriority = distance;
          this.game.message("A vs B: " + nextPlayer);
        } 
        // then second tie-breakerif still tied
        else if(tokenValue == bestValue && token.ability == bestToken.ability && secondTieBreaker) {
          bestToken = token; bestValue = tokenValue; nextPlayer = p; bestScore = playerScore; bestSum = tokenSum; bestPriority = distance;
          this.game.message("2nd tie-breaker: " + nextPlayer);
        }         
        // final tie goes to priority pawn
        else if(tokenValue == bestValue && token.ability == bestToken.ability && !secondTieBreaker && distance < bestPriority) {
          bestToken = token; bestValue = tokenValue; nextPlayer = p; bestScore = playerScore; bestSum = tokenSum; bestPriority = distance;
          this.game.message("Priority: " + nextPlayer);
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
    return this.getStage(this.round);
  }

  public getStorageCubes(player: BlueBreakthroughPlayer) : ResourceCube[] {
    const powers = new FundingPowers(this);
    return player.board.all(StorageSpace).all(ResourceCube).concat(powers.getExtraStorageCubes(player));
  }
}

export default createGame(BlueBreakthroughPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, forLoop, eachPlayer, whileLoop, ifElse } = game.flowCommands;

  buildGame(game);
  
  const powers = new FundingPowers(game);
  const actions = new Actions(game, powers);  
  const allActions = Object.assign({}, actions.getActions(), powers.getActions());
  game.defineActions(allActions);

  game.defineFlow(

    forLoop({ name: 'round', initial: 1, next: round => round + 1, while: round => round <= 7, do: [

      // start round
      ({round}) => game.round = round,
      () => game.first(PriorityPawn)!.putInto(game.players[game.priority-1].space),
      ({round}) => game.first(RoundTracker)!.putInto(game.first(RoundSpace, {round: round})!),
      () => game.players.forEach(x => game.getStorageCubes(x).forEach(c => c.putInto(x.space.first(ResourceSpace)!))),      
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

      // before funding
      eachPlayer({name: 'turn', do: [
       ({turn}) => turn.doneActions = false,
        whileLoop({while: ({turn}) => !turn.doneActions, do: ([
          playerActions({ actions: powers.actionsBeforeFunding() }),
        ])}),
      ]}),

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
              playerActions({ actions: powers.actionsAfterUpgrades() }),
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
                  playerActions({ actions: ['flipLED', 'placeCube', 'useUpgrade', 'discardFunding', 'useFunding', 'finishTesting']}),
                  // ({turn}) => game.message("After: Next colors needed: " + turn.board.first(LEDSpace)!.first(LEDCard)!.nextColorsNeeded()),
                ]
          )}),

          ({turn}) => turn.doneActions = false,
          whileLoop({while: ({turn}) => !turn.doneActions, do: ([
            playerActions({ actions: powers.actionsAfterTesting() }),
          ])}),
          
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
        p.fundingBoost = 0;
        p.purchasedUpgrades = 0;
        p.space.all(UpgradeCard).forEach( u => u.rotation = 0 );
        p.board.first(LEDSpace)!.all(ResourceCube).forEach( c => c.putInto(game.first(Supply)!) );
        p.space.first(ResourceSpace)!.all(ResourceCube).forEach( c => c.putInto(game.first(Supply)!) );

        p.space.all(FundingCard, {type:FundingType.Ongoing}).forEach(x => x.rotation = 0);
        p.space.all(FundingCard, {type:FundingType.Permanent}).forEach(x => x.rotation = 0);
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
