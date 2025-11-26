import {
  Space,
  Piece,
} from '@boardzilla/core';

import { MyGame } from './index.js';

export class MainBoard extends Space<MyGame> {
}

export enum TokenAction {
  Funding = "Funding",
  Resources = "Resources",
  Upgrade = "Upgrade"
}

export class PowerTokenSpace extends Space<MyGame> {
  public action: TokenAction;
  public complete: boolean = false;

  public override toString(): string {
    return this.action.toString();  
  }  
}

export class PlayerSpace extends Space<MyGame> {
}

export class PlayersSpace extends Space<MyGame> {
}

export class AvailableTokenSpace extends Space<MyGame> {
}

export class ScoreTrack extends Space<MyGame> {
  public tens: boolean = false;
}

export class ScoreSpace extends Space<MyGame> {
  public value: number;
}

export class ScoreCube extends Piece<MyGame> {
  public value: number;

  public getColor() : string {
    if(this.container(PlayerSpace) != undefined) {
      const playerSpace = this.container(PlayerSpace)!;
      if(playerSpace.owner != undefined && playerSpace.owner.color != undefined) {
        return playerSpace.owner.color;
      }
    }
    return "white";
  }
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

export enum TokenAbility {
  None,
  A,
  B,
  Publish,
  Recall
}
export class PowerToken extends Piece<MyGame> {
  flipped: boolean = false;
  value: number;
  ability: TokenAbility;

  public mayPeformAction() : boolean {
    return ![TokenAbility.Publish, TokenAbility.Recall].includes(this.ability);
  }

  public getColor() : string {
    if(this.container(PlayerSpace) != undefined) {
      const playerSpace = this.container(PlayerSpace)!;
      if(playerSpace.owner != undefined && playerSpace.owner.color != undefined) {
        return playerSpace.owner.color;
      }
    }
    return "white";
  }

  public getSymbol() : string {
    let symbol = "";
    if(this.value != undefined &&![TokenAbility.Publish, TokenAbility.Recall].includes(this.ability)) {
      symbol += this.value.toString();
    }
    switch(this.ability) {
      case TokenAbility.A:
        symbol += "A";
        break;
    case TokenAbility.B:
        symbol += "B";
        break;
    case TokenAbility.Publish:
        symbol += "✎";
        break;
    case TokenAbility.Recall:
        symbol += "⤴︎";
        break;
    }
    return symbol;
  }
}

export class ReactorSpace extends Space<MyGame> {
  type: UpgradeType;
}

export class LEDSpace extends Space<MyGame> {
}

export class LEDCard extends Piece<MyGame> {
  public letter: string;

  public layer1: string;
  public layer2: string;
  public layer3: string;
  public layer4: string;
  public layer5: string;
  public layer6: string;
  public layer7: string;

  public special: string;
}
