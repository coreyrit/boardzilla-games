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

export class ResourceSpace extends Space<MyGame> {
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
  Any = "green"
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

  public input: CubeColor[];
  public output: CubeColor[];
  public points: number = 0;

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

  public initialize() {    
    this.input = [];
    this.output = [];
    this.points = (this.effect.match(/⭐/g)||[]).length;

    this.game.message(this.effect + ": " + this.effect.length);
    const parts = this.effect.replace("Gain", "").replace(" ", "").replace("⭐", "").split('→');
    
    if(parts.length == 1) {
      // this.game.message(parts[0]);
      let temp = parts[0];
      // while(temp.length > 0) {
        for(const symbol of ['⬜','🟫','🟦','🟧','⬛','🟥','🟨','✳️']) {
          if(temp.includes(symbol)) {
            this.output.push( this.colorFromSymbol(symbol) );
          }
        }
      // }
    }
    
    if(parts.length > 1) {
      let temp = parts[0];
      // while(temp.length > 0) {
        for(const symbol of ['⬜','🟫','🟦','🟧','⬛','🟥','🟨','✳️']) {
          if(temp.includes(symbol)) {
            this.input.push( this.colorFromSymbol(symbol) );
          }
        }
      // }
      temp = parts[1];
      // while(temp.length > 0) {
        for(const symbol of ['⬜','🟫','🟦','🟧','⬛','🟥','🟨','✳️']) {
          if(temp.includes(symbol)) {
            this.output.push( this.colorFromSymbol(symbol) );
          }
          if(temp.replace(symbol, "").includes(symbol)) {
            this.output.push( this.colorFromSymbol(symbol) );
          }
        }
      // }
    }
  }

  public mayUse() : boolean {
    if(this.rotation != 0) {
      return false;
    }
    if(this.input != undefined) {
      for(const color of this.input) {
        if(!this.container(PlayerSpace)!.first(ResourceSpace)!.all(ResourceCube).map( x => x.color ).includes(color)) {
          return false;
        }
      }
    }
    return true;
  }

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

export class LEDLayer {
  public index: number;
  public text: string;
  public colors: CubeColor[];
  public optional: boolean;
  public repeatable: boolean;  
}

export class LEDRow extends Space<MyGame> {
  public index: number;
}

export class LEDCard extends Piece<MyGame> {
  public letter: string;
  public special: string;
  public show: boolean = false;
  public layers: LEDLayer[];

  public isLayerComplete(layer: LEDLayer): boolean {
    if(layer.optional) {
      return true;
    }
    for(const c of layer.colors) {
      if( !this.container(LEDSpace)!.first(LEDRow, {index: layer.index})!.all(ResourceCube).map( x => x.color ).includes(c)) {
        return false;
      }
    }
    return true;
  }

  public rowsNeedingColor(color: CubeColor): LEDRow[] {
    let rows: LEDRow[] = [];
    for(var index = 1; index <= 7; index++) {
      const layer = this.layers[index-1];
      if(!this.isLayerComplete(layer) && layer.colors.includes(color)) {
        rows.push(this.container(LEDSpace)!.first(LEDRow, {index: index})!);
        break;
      }
      if(this.isLayerComplete(layer) && layer.colors.includes(color) && layer.repeatable) {
        rows.push(this.container(LEDSpace)!.first(LEDRow, {index: index})!);
      }
    }
    return rows;
  }

  public nextColorsNeeded(): CubeColor[] {
    let colors: CubeColor[] = [];
    for(var index = 1; index <= 7; index++) {
      const layer = this.layers[index-1];
      if(!this.isLayerComplete(layer) || layer.repeatable) {
        colors.push(...layer.colors);
      }
      if(!this.isLayerComplete(layer) && !layer.optional) {
        break;
      }
    }
    return colors;
  }
}
