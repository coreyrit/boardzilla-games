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
  TokenAction
 } from './components.js';
import { buildGame } from './build.js';

export class BlueBreakthroughPlayer extends Player<MyGame, BlueBreakthroughPlayer> {
    space: PlayerSpace
    board: PlayerBoard
    score: number = 0;

    public scorePoints(points: number) {
      this.score += points;
      const oneCube = this.board.first(ScoreTrack, {tens: false})!.first(ScoreCube)!;
      const tenCube = this.board.first(ScoreTrack, {tens: true})!.first(ScoreCube)!;

      const tens = Math.floor(this.score / 10);
      const ones = this.score % 10;

      oneCube.putInto(this.board.first(ScoreTrack, {tens: false})!.first(ScoreSpace, {value: ones})!);
      tenCube.putInto(this.board.first(ScoreTrack, {tens: true})!.first(ScoreSpace, {value: tens * 10})!);
    }
    
    public getScore() : number {
      return this.score;
    }
}

export class MyGame extends Game<MyGame, BlueBreakthroughPlayer> {
  public addRoundCubes(round: number) {
    const bag = this.first(CubeBag)!;
    for(var i = 0; i < this.players.length; i++) {
      switch(round) {
        case 1:
          this.message("Adding cubes for round " + round + ".")
          const supply = this.first(Supply)!;          
          this.first(ResourceCube, {color: CubeColor.Orange})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Orange})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Orange})!.putInto(bag);  
          supply.first(ResourceCube, {color: CubeColor.Brown})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Brown})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Brown})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.Blue})!.putInto(bag);
          supply.first(ResourceCube, {color: CubeColor.White})!.putInto(bag);        
          break;
      }
    }
    bag .shuffle();
  }

  public drawCubesToPlates() {
      for(var i = 1; i <= this.players.length; i++) {
        for(var j = 0; j < 4; j++) {
          this.first(CubeBag)!.top(ResourceCube)!.putInto(this.first(CubePlate, {index: i})!);
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
    for(var i = 1; i <= this.players.length; i++) {
      for(const space of this.all(UpgradeSpace, {index: i})) {
        if(space.all(UpgradeCard).length == 0) {
          this.first(UpgradeDeck)!.top(UpgradeCard, {stage: round})!.putInto(space);
        }
      }
    }
  }

  public playersRemaining(action: TokenAction): BlueBreakthroughPlayer[] {
    return this.all(PowerTokenSpace, 
      {action: action, complete: false}).map(x => x.container(PlayerSpace)!.player!);
  }

  public nextFundingTurnOrder(): BlueBreakthroughPlayer {
    const playersRemaining: BlueBreakthroughPlayer[] = this.playersRemaining(TokenAction.Funding);
    let maxToken: PowerToken | null = null;
    let nextPlayer: BlueBreakthroughPlayer | null = null;
    let maxPlayerScore: number = -1;

    playersRemaining.forEach( p=> {
      const token = p.board.first(PowerTokenSpace, {action: TokenAction.Funding})!.first(PowerToken)!
      const playerScore = p.getScore();

      if(maxToken == null || [TokenAbility.Publish, TokenAbility.Recall].includes(maxToken.ability)) {
        maxToken = token; nextPlayer = p; maxPlayerScore = playerScore;
      } else {
        // first check token value
        if(token.value > maxToken.value) {
          maxToken = token; nextPlayer = p; maxPlayerScore = playerScore;
        } 
        // then check abilities if tied
        else if(token.value == maxToken.value && 
            token.ability == TokenAbility.A && maxToken.ability == TokenAbility.B) {
          maxToken = token; nextPlayer = p; maxPlayerScore = playerScore;
        } 
        // then check score if still tied
        else if(token.value == maxToken.value && token.ability == maxToken.ability 
          && playerScore > maxPlayerScore
        ) {
          maxToken = token; nextPlayer = p; maxPlayerScore = playerScore;
        }         
        // final tie goes to priority pawn
        else if(token.value == maxToken.value &&
          token.ability == maxToken.ability && playerScore == maxPlayerScore) {
            
        }
      }
    })

    this.game.message("Next Funding turn: " + nextPlayer);
    return nextPlayer!;
  }

  public nextResourcesTurnOrder(): BlueBreakthroughPlayer {
    const playersRemaining: BlueBreakthroughPlayer[] = this.playersRemaining(TokenAction.Resources);
    let minToken: PowerToken | null = null;
    let nextPlayer: BlueBreakthroughPlayer | null = null;
    let maxTokenSum: number = -1;

    playersRemaining.forEach( p=> {
      const token = p.board.first(PowerTokenSpace, {action: TokenAction.Resources})!.first(PowerToken)!
      const tokenSum = p.board.all(PowerTokenSpace).reduce((sum, x) => sum + x.first(PowerToken)!.value, 0)

      if(minToken == null || [TokenAbility.Publish, TokenAbility.Recall].includes(minToken.ability)) {
        minToken = token; nextPlayer = p; maxTokenSum = tokenSum;
      } else {
        // first check token value
        if(token.value < minToken.value) {
          minToken = token; nextPlayer = p; maxTokenSum = tokenSum;
        } 
        // then check abilities if tied
        else if(token.value == minToken.value && 
            token.ability == TokenAbility.A && minToken.ability == TokenAbility.B) {
          minToken = token; nextPlayer = p; maxTokenSum = tokenSum;
        } 
        // then check token sum if still tied
        else if(token.value == minToken.value && token.ability == minToken.ability 
          && tokenSum > maxTokenSum
        ) {
          minToken = token; nextPlayer = p; maxTokenSum = tokenSum;
        }         
        // final tie goes to priority pawn
        else if(token.value == minToken.value &&
          token.ability == minToken.ability && maxTokenSum == tokenSum) {
        }
      }
    })

    this.game.message("Next Resources turn: " + nextPlayer);
    return nextPlayer!;
  }

  public getPlayerToken(player: BlueBreakthroughPlayer, action: TokenAction) : PowerToken {
    return player.board.first(PowerTokenSpace, {action: action})!.first(PowerToken)!;
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

    chooseResourcePlate: (player) => action({
      condition: game.getPlayerToken(player, TokenAction.Resources).mayPeformAction(),
      prompt: "Choose Resources"
    }).chooseOnBoard(
      'plate', game.all(CubePlate).filter(x => x.all(ResourceCube).length > 0),
      { prompt: 'Choose Plate',skipIf: 'never' }
    ).chooseOnBoard(
      'cubes', ({plate}) => plate.all(ResourceCube),
      { prompt: 'Choose X Cubes', number: game.getPlayerToken(player, TokenAction.Resources).value }
    ).do(({ plate, cubes }) => {
      cubes.forEach( c=> c.putInto(player.space) );
      player.space.first(PowerTokenSpace, {action: TokenAction.Resources})!.complete = true;
      player.scorePoints(plate.all(ResourceCube).length);
      plate.all(ResourceCube).forEach( c=> c.putInto(game.first(Supply)!) );
    }),

    publishResources: (player) => action({
      prompt: 'Publish',
      condition: game.getPlayerToken(player, TokenAction.Funding).ability == TokenAbility.Publish
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Resources})!.complete = true;
    }),

    recallResources: (player) => action({
      prompt: 'Recall',
      condition: game.getPlayerToken(player, TokenAction.Funding).ability == TokenAbility.Recall
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Resources})!.complete = true;
    }),

    end: () => action({
      prompt: 'Game over'
    }).chooseOnBoard(
      'none', []
    ),
  });

  game.defineFlow(

    forLoop({ name: 'round', initial: 1, next: round => round + 1, while: round => round <= 7, do: [

      ({round}) => game.addRoundCubes(round),
      () => game.drawCubesToPlates(),
      () => game.fillFunding(),
      ({round}) => game.fillUpgrades(round),

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
            if: ({turn}) => game.nextFundingTurnOrder() == turn, do: [
              playerActions({ actions: ['chooseFunding', 'publishFunding', 'recallFunding']}),
            ],
          }),   
        ]}),
      ])}),

      // resolve resources
      whileLoop({while: () => game.playersRemaining(TokenAction.Resources).length > 0, do: ([  
        eachPlayer({name: 'turn', do: [
          ifElse({
            if: ({turn}) => game.nextResourcesTurnOrder() == turn, do: [
              playerActions({ actions: ['chooseResourcePlate', 'publishResources', 'recallResources']}),
            ],
          }),   
        ]}),
      ])}),
    
      playerActions({ actions: ['end']}),

    ]})
  );
});
