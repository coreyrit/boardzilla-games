import {
  Space,
  Piece,
} from '@boardzilla/core';

import { BlueBreakthroughPlayer, MyGame } from './index.js';
import { FundingPowers } from './powers.js';

export class MainBoard extends Space<MyGame> {
}

export enum TokenAction {
  Funding = "Funding",
  Resources = "Resources",
  Upgrade = "Upgrade"
}

export class RoundSpace extends Space<MyGame> {
  public round: number;
}

export class ReferenceSpace extends Space<MyGame> {
}

export class RoundTracker extends Piece<MyGame> {
}

export class PriorityPawn extends Piece<MyGame> {
}

export class PowerTokenSpace extends Space<MyGame> {
  public action: TokenAction;
  public complete: boolean = false;

  public override toString(): string {
    return this.action.toString();  
  }  
}

export class StorageSpace extends Space<MyGame> {
  public stage: number;
}

export class PlayerSpace extends Space<MyGame> {
}

export class PlayersSpace extends Space<MyGame> {
}

export class AvailableTokenSpace extends Space<MyGame> {
}

export class UnavailableTokenSpace extends Space<MyGame> {
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

  public initialize() {    
    this.input = [];
    this.output = [];
    this.points = (this.effect.match(/⭐/g)||[]).length;

    // this.game.message(this.effect + ": " + this.effect.length);
    const parts = this.effect.replace("Gain", "").replace(" ", "").replace("⭐", "").split('→');
    
    if(parts.length == 1) {
      // this.game.message(parts[0]);
      let temp = parts[0];
      // while(temp.length > 0) {
        for(const symbol of ['⬜','🟫','🟦','🟧','⬛','🟥','🟨','✳️']) {
          if(temp.includes(symbol)) {
            this.output.push( this.game.colorFromSymbol(symbol) );
          }
        }
      // }
    }
    
    if(parts.length > 1) {
      let temp = parts[0];
      // while(temp.length > 0) {
        for(const symbol of ['⬜','🟫','🟦','🟧','⬛','🟥','🟨','✳️']) {
          if(temp.includes(symbol)) {
            this.input.push( this.game.colorFromSymbol(symbol) );
          }
        }
      // }
      temp = parts[1];
      // while(temp.length > 0) {
        for(const symbol of ['⬜','🟫','🟦','🟧','⬛','🟥','🟨','✳️']) {
          if(temp.includes(symbol)) {
            this.output.push( this.game.colorFromSymbol(symbol) );
          }
          if(temp.replace(symbol, "").includes(symbol)) {
            this.output.push( this.game.colorFromSymbol(symbol) );
          }
        }
      // }
    }
  }

  public mayUse(player: BlueBreakthroughPlayer) : boolean {
    if(this.rotation != 0) {
      return false;
    } else if(this.input == undefined) {
      return true;
    }    
    let requirementsMet: number = 0;
    const playerCubes = this.container(PlayerSpace)!.first(ResourceSpace)!.all(ResourceCube);
    for(const color of this.input) {
      if((color != CubeColor.Any && !playerCubes.map( x => x.color ).includes(color)) || playerCubes.length == 0) {
        
      } else {
        requirementsMet++;
      }
    }
    const powers = new FundingPowers(this.game);
    return requirementsMet >= (this.input.length - powers.bonusResourceDiscount(player, this));
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
  scoreTesting(player: BlueBreakthroughPlayer) : void {
    const led = this.first(LEDCard)!;
    for(const layer of led.layers) {

      const row = this.first(LEDRow, {index: layer.index})!;
      let cubeColors = row.all(ResourceCube).map(x => x.color);
      // this.game.message(cubeColors.join(","));

      while(led.isComplete(layer, cubeColors)) {
        // this.game.message("complete = " + led.isComplete(layer, cubeColors));

        player.scorePoints(led.getScoring(layer, row));
        for(const color of layer.colors) {
          const index = cubeColors.indexOf(color);
          cubeColors.splice(index, 1);
          // this.game.message(cubeColors.join(","));
        }
      }

    }
  }
}

export class LEDLayer {
  public index: number;
  public text: string;
  public colors: CubeColor[];
  public optional: boolean;
  public repeatable: boolean;
  public points: number;
}

export class LEDRow extends Space<MyGame> {
  public index: number;
}

export class LEDCard extends Piece<MyGame> {
  public letter: string;
  public special: string;
  public show: boolean = false;
  public layers: LEDLayer[];

  public getScoring(layer: LEDLayer, row: LEDRow) {
    if(this.letter == "A" && layer.index == 5) {
      switch(row.all(ResourceCube, {color: CubeColor.Yellow}).length) {
        case 1:
          return 5;
        case 2:
          return 12
        case 3:
          return 20;
        default:
          return 0;
      }
    } else {
      return layer.points;
    }
  }

  public canRepeat(layer: LEDLayer, row: LEDRow) {
    if(this.letter == "A" && layer.index == 5) {
      return row.all(ResourceCube, {color: CubeColor.Yellow}).length < 3;
    } else {
      return layer.repeatable;
    }
  }

  public isLayerComplete(layer: LEDLayer, includeOptional: boolean = true): boolean {
    if(includeOptional && layer.optional) {
      return true;
    }
    const row = this.container(LEDSpace)!.first(LEDRow, {index: layer.index})!;
    const cubes = row.all(ResourceCube).map( x => x.color );
    return this.isComplete(layer, cubes);
  }

  public isComplete(layer: LEDLayer, cubes: CubeColor[]): boolean {
    if(layer.colors.length == 0 || cubes.length == 0) {
      return false;
    }
    for(const c of layer.colors) {
      if(!cubes.includes(c)) {        
        return false;
      }
    }
    return true;
  }

  public rowsNeedingColor(color: CubeColor): LEDRow[] {
    let rows: LEDRow[] = [];
    let doBreak: boolean = false;
    for(var index = 1; index <= 7 && !doBreak; index++) {
      // this.game.message('index ' + index);
      const layer = this.layers[index-1];
      const row = this.container(LEDSpace)!.first(LEDRow, {index: index})!;
      
      const complete = this.isLayerComplete(layer, false);
      const needsColor = layer.colors.includes(color);
      const needsAny = layer.colors.includes(CubeColor.Any);
      const isOptional = layer.optional;

      // this.game.message("index:" + index + ",complete:" + complete + ",needsColor:" + 
        // needsColor + ",needsAny:" + needsAny + ",isOptional:" + isOptional);

      // first check if the row needs the color in question
      if(needsColor || needsAny) {
        // make sure it isn't already completed
        if(!complete) {
          // does it already have the required amount?
          if(this.canRepeat(layer, row) || (layer.colors.filter(x => x == color).length != row.all(ResourceCube, {color: color}).length)) {
            rows.push(row);
          }          
          
          // if the row isn't optional, then stop looking
          if(!layer.optional) {
            doBreak = true;
            // this.game.message("breaking early: " + index)
          }   
        } else {
          // it was completed, so check if it can be repeated
          if(this.canRepeat(layer, row)) {
            rows.push(row);
          }
        }
      } else {
        // was it optional?
        if(!complete && !isOptional) {
          doBreak = true;
        }
      }
    }
    // this.game.message("rows = " + rows.join(","));
    return rows;
  }

  public nextColorsNeeded(): CubeColor[] {
    let colors: CubeColor[] = [];
    for(var index = 1; index <= 7; index++) {
      const layer = this.layers[index-1];
      const row = this.container(LEDSpace)!.first(LEDRow, {index: index})!;
      if(!this.isLayerComplete(layer) || this.canRepeat(layer, row)) {
        for(const color of layer.colors) {
          if(color == CubeColor.Any) {
            colors.push(CubeColor.Black);
            colors.push(CubeColor.Blue);
            colors.push(CubeColor.White);
            colors.push(CubeColor.Brown);
            colors.push(CubeColor.Yellow);
            colors.push(CubeColor.Red);
            colors.push(CubeColor.Orange);
          } else {
            colors.push(color);
          }
        }        
      }
      if(!this.isLayerComplete(layer) && !layer.optional) {
        break;
      }
    }
    return colors;
  }
}

export class PublishToken extends Piece<MyGame> {
  public flipped = false;
}

export class DrawUpgradeSpace extends Space<MyGame> {

}
