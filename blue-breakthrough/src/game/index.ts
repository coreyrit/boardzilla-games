import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
  numberSetting,
} from '@boardzilla/core';
import { fundingCards } from './funding.js';
import { upgradeCards } from './upgrades.js';

export class BlueBreakthroughPlayer extends Player<MyGame, BlueBreakthroughPlayer> {
    space: PlayerSpace
    board: PlayerBoard
}

class MyGame extends Game<MyGame, BlueBreakthroughPlayer> {
}

export class MainBoard extends Space<MyGame> {
}

export class PlayerSpace extends Space<MyGame> {
}

export class PlayersSpace extends Space<MyGame> {
}

export class PlayerBoard extends Space<MyGame> {
}

export class CubeBag extends Piece<MyGame> {
}

export class Supply extends Piece<MyGame> {
}

export class CubePlate extends Space<MyGame> {
  public index: number;
}

export class FundingSpace extends Space<MyGame> {
  public index: number;
}

export class UpgradeSpace extends Space<MyGame> {
  public index: number;
}

export enum CubeColor {
  Orange = "orange",
  Brown = "#964b00",
  Blue = "blue",
  White = "white",
  Black = "black",
  Red = "red",
  Yellow = "yellow",
}

export class ResourceCube extends Piece<MyGame> {
  public color: CubeColor;
}

export enum FundingType {
  Permanent = "Permanent",
  Instant = "Instant",
  Ongoing = "Ongoing"
}

export class FundingCard extends Piece<MyGame> {
  public name: string;
  public type: FundingType;
  public effect: string;
}

export enum UpgradeType {
  cooling = "cooling",
  exhaust = "exhaust",
  heater = "heater",
  injection = "injection",
  nozzle = "nozzle",
  pump = "pump",
  trap = "trap"
}

export class UpgradeCard extends Piece<MyGame> {
  public stage: number;
  public name: string;
  public type: UpgradeType;
  public effect: string;
  public cost: number;

  public typeName() : string {
    const inputString = this.type.toString();
    if (!inputString) {
      return ""; // Handle empty or null strings
    }
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
  }

  public stageName() : string {
    switch(this.stage) {
      case 1:
        return "I";
      case 2:
        return "II";
      case 3:
        return "III";
    }
    return "";
  }
}

export class FundingDeck extends Space<MyGame> {
}

export class UpgradeDeck extends Space<MyGame> {
}

export default createGame(BlueBreakthroughPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, forLoop, eachPlayer } = game.flowCommands;

  function addRoundCubes(game: MyGame, round: number) {
    for(var i = 0; i < game.players.length; i++) {
      switch(round) {
        case 1:
          game.message("Adding cubes for round " + round + ".")
          const supply = game.first(Supply)!;
          const bag = game.first(CubeBag)!;
          game.first(ResourceCube, {color: CubeColor.Orange})!.putInto(bag);
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

  function drawCubesToPlates(game: MyGame) {
      for(var i = 1; i <= game.players.length; i++) {
        for(var j = 0; j < 4; j++) {
          game.first(CubeBag)!.top(ResourceCube)!.putInto(game.first(CubePlate, {index: i})!);
        }
      }
  }

  function fillFunding(game: MyGame) {
    // clear previous cards first
    for(const space of game.all(FundingSpace)) {
      for(const card of space.all(FundingCard)) {
        card.putInto(game.first(Supply)!);
      }
    }
    for(var i = 1; i <= game.players.length; i++) {
      game.first(FundingDeck)!.top(FundingCard)!.putInto(game.first(FundingSpace, {index: i})!);
    }
  }

  function fillUpgrades(game: MyGame) {
    for(var i = 1; i <= game.players.length; i++) {
      for(const space of game.all(UpgradeSpace, {index: i})) {
        if(space.all(UpgradeCard).length == 0) {
          game.first(UpgradeDeck)!.top(UpgradeCard)!.putInto(space);
        }
      }
    }
  }

  const mainBoard = game.create(MainBoard, "mainBoard");
  const bag = game.create(CubeBag, "bag");
  const supply = game.create(Supply, "supply");

  const playersSpace = game.create(PlayersSpace, 'playersSpace')
  for(var i = 1; i <= game.players.length; i++) {
    const playerSpace = playersSpace.create(PlayerSpace, 'playerSpace' + i, {player: game.players[i]});
    const playerBoard = playerSpace.create(PlayerBoard, 'p' + i + "Board")
    playerBoard.player = game.players[i];
    
    game.players[i-1].space = playerSpace
    game.players[i-1].board = playerBoard
  }


  for(var i = 1; i <= 4; i++) {
    const plate = mainBoard.create(CubePlate, "cubePlate" + i, {index: i})
    const funding = mainBoard.create(FundingSpace, "funding" + i, {index: i})
    const upgradeA = mainBoard.create(UpgradeSpace, "upgrade" + i + "-a", {index: i})
    const upgradeB = mainBoard.create(UpgradeSpace, "upgrade" + i + "-b", {index: i})
  }

  const colors: CubeColor[] = [CubeColor.Orange, CubeColor.Brown, CubeColor.Blue, CubeColor.White, 
    CubeColor.Black, CubeColor.Red, CubeColor.Yellow]
  for(var i = 1; i <= 30; i++) {
    for(const color of colors) {
      supply.create(ResourceCube, color + "Cube" + i, {color: color});
    }
  }

  const fundingDeck = game.create(FundingDeck, "fundingDeck");
  for (const fundingCard of fundingCards) {
    fundingDeck.create(FundingCard, fundingCard.name!.replace(' ', '_'), fundingCard);
  }
  fundingDeck.shuffle();

  const upgradeDeck = game.create(UpgradeDeck, "upgradeDeck");
  for (const upgradeCard of upgradeCards) {
    upgradeDeck.create(UpgradeCard, upgradeDeck.name!.replace(' ', '_'), upgradeCard);
  }
  upgradeDeck.shuffle();

  game.defineActions({
    end: () => action({
      prompt: 'Game over'
    }).chooseOnBoard(
      'none', []
    ),
  });

  game.defineFlow(

    forLoop({ name: 'round', initial: 1, next: round => round + 1, while: round => round <= 7, do: [

      ({round}) => addRoundCubes(game, round),

      () => drawCubesToPlates(game),
      () => fillFunding(game),
      () => fillUpgrades(game),

      playerActions({ actions: ['end']}),
    
    ]})
  );
});
