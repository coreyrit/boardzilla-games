import { Piece } from "@boardzilla/core";
import { Building, Color, CustomerType, MyGame } from "./index.js";
import { CandleSpace } from "./boards.js";
import { ChandlersPlayer } from "./player.js";
import { IdSet, SetLogic } from "./setlogic.js";

export class GoalCard extends Piece<MyGame> {
  flipped: boolean = false;
  color1: Color;
  color2: Color;
  scored: boolean = false;
}

export class CustomerCard extends Piece<MyGame> {
    flipped: boolean = false;
    data: string = ""
    color: Color = Color.White;
    customerType: CustomerType = CustomerType.None;
    scoring: number[]
    scoredCandles: boolean = false;
    scoredGoal: boolean = false;

    override toString() : string {
      return this.name;
    }
    
    requiredCandles(): Color[] {
      var req: Color[] = []
      if(this.data.includes("b")) {
        req.push(Color.Blue);
      }
      if(this.data.includes("w")) {
        req.push(Color.White);
      }
      if(this.data.includes("r")) {
        req.push(Color.Red);
      }
      if(this.data.includes("y")) {
        req.push(Color.Yellow);
      }
      if(this.data.includes("g")) {
        req.push(Color.Green);
      }
      if(this.data.includes("o")) {
        req.push(Color.Orange);
      }
      if(this.data.includes("p")) {
        req.push(Color.Purple);
      }
      if(this.data.includes("x")) {
        req.push(Color.Black);
      }
      return req;
    }

    placeCandle(candle: CandlePawn) : void {      
      const space = this.first(CandleSpace, 
        {name: this.name + '-' + candle.color}
      )!;
      candle.putInto(space);
    }
}

export class EndGameTile extends Piece<MyGame> {
    flipped: boolean = true;
    type: CustomerType;
}
  
export class RoundEndTile extends Piece<MyGame> {
    flipped: boolean = true;


    customerColorsToIdSets(player : ChandlersPlayer) : IdSet[] {
      return player.space.all(CustomerCard).map(x => new IdSet(x.color.toString(), 
        x.all(CandlePawn).map(y => y.color.toString())))
    }

    customerTypesToIdSets(player : ChandlersPlayer) : IdSet[] {
      return player.space.all(CustomerCard).map(x => new IdSet(x.customerType.toString(), 
        x.all(CandlePawn).map(y => y.color.toString())))
    }

    achieved(player: ChandlersPlayer) : boolean {
      const customerColors = [Color.Red, Color.Yellow, Color.Blue, Color.Orange, Color.Green, Color.Purple]
      const customerTypes = [CustomerType.Adventurer, CustomerType.Cartographer, CustomerType.Charlatan, CustomerType.Merchant,
        CustomerType.Priest, CustomerType.Prince, CustomerType.Rogue, CustomerType.Witch]
      const candleColors = [Color.White, Color.Red, Color.Blue, Color.Yellow, Color.Orange, Color.Green, Color.Purple, Color.Black]

      console.log('checking ' + this.name)

      switch(this.name) {
        case 'customer-satisfaction': {
          return player.space.all(CustomerCard)
            .filter(x => x.all(CandlePawn).length == x.requiredCandles().length && x.customerType != CustomerType.None).length >= 2
        }
        case 'five-colors': {
          return SetLogic.fiveColors(this.customerColorsToIdSets(player));
        }
        case 'mastery-level-three': {
          return player.masteryLevel() == 3;
        }
        case 'one-by-five': {
          return SetLogic.oneByFive(this.customerColorsToIdSets(player));
        }
        case 'two-pairs': {
          return SetLogic.twoPairs(this.customerColorsToIdSets(player));
        }
        case 'three-by-three-otherwise': {
          return SetLogic.threeByThreeOtherwise(this.customerColorsToIdSets(player));
        }
        case 'three-by-tree-likewise': {
          return SetLogic.threeByThreeLikewise(this.customerColorsToIdSets(player));
        }
        case 'two-by-three': {
          return player.space.all(CustomerCard)
            .filter(x => x.all(CandlePawn).length >= 2).length >= 3
        }
        case 'two-by-two-by-color': {
          return SetLogic.twoByTwo(this.customerColorsToIdSets(player));
        }
        case 'two-by-two-by-type': {
          return SetLogic.twoByTwo(this.customerTypesToIdSets(player));
        }
      }
      return false;
    }
}

export class BackAlleyTile extends Piece<MyGame> {
    flipped: boolean = true;
    letter: String;

    performAction(game: MyGame) : void {
      // game.followUp({name: 'confirmAction', args: {tile: this}});
      this.performActionAfterConfirmation(game);
    }

    performActionAfterConfirmation(game: MyGame) : void {
      switch(this.name) {
        case 'refresh-customers': {
          for(const customer of [$.customer1, $.customer2, $.customer3, $.customer4]) {
            customer.first(CustomerCard)?.putInto($.bag);
            $.drawCustomer.top(CustomerCard)?.putInto(customer);
          }
          break;
        }
        case 'melt-wax': {
          if(game.currentPlayer().board.all(Wax).length > 0) {
            game.currentPlayer().meltWax([game.currentPlayer().board.first(Wax)!]);
          }
          break;
        }
        case 'purchace-spilt-wax': {
          if(game.currentPlayer().board.all(Wax).length > 0) {
            game.followUp({name: 'chooseOneSpiltMelt'})
          }
          break;
        }
        case 'convert-key-to-die': {
          if(game.currentPlayer().board.all(KeyShape).length > 0) {
            game.followUp({name: 'chooseKeyAndShape'})
          }
          break;
        }
        case 'move-candle': {
          console.log(game.currentPlayer().space.all(CandlePawn).length);
          if(game.currentPlayer().space.all(CustomerCard)
              .filter(x => x.all(CandlePawn).length < x.requiredCandles().length)
              .all(CandlePawn).length > 0) {
            game.followUp({name: 'chooseCandleToMove'})
          }
          break;
        }
        case 'swap-customer': {
          if(game.currentPlayer().space.all(CustomerCard).filter(x => x.all(CandlePawn).length == 0)) {
            game.followUp({name: 'chooseCustomerToSwap'})
          }
          break;
        }

        case 'add-pigment': {
          if(game.currentPlayer().board.all(Melt).length > 0) {
            game.followUp({name: 'choosePigmentColor', args: {firstChoice: true}});
          }
          break;
        }
        case 'advance-mastery': {
          game.currentPlayer().increaseMastery();
          break;
        }
        case 'gain-goal-card': {
          const goal = $.goalDeck.top(GoalCard)!
          console.log(goal.name);
          console.log(game.currentPlayer().space.name);
          goal.putInto(game.currentPlayer().space);
          goal.showOnlyTo(game.currentPlayer());
          break;
        }
        case 'place-white-candle': {
          if(game.currentPlayer().space.all(CandlePawn, {color: Color.White}).length > 0) {
            game.followUp({name:'chooseWhiteCandle'});
            game.followUp({name:'placeWhiteCandle'});
          }
          break;
        }
        case 'remove-pigment': {
          if(game.currentPlayer().board.all(Melt).filter(x => x.color != Color.White).length > 0) {
            game.followUp({name:'choosePigmentsToRemove'});
          }
          break;
        }
        case 'two-wax': {
          game.currentPlayer().gainWax(2); 
          break;
        }
      }
    }
}

export class WorkerPiece extends Piece<MyGame> {
    color: Color;
}

export class ColorDie extends WorkerPiece {
    roll(): void {
      let index = Math.floor(this.game.random() * 6);
      const values = Object.values(Color);
      this.color = values[index];
    }
}
  
export class CandlePawn extends WorkerPiece {
  override toString() : string {
    return this.color + ' candle'
  }
}
  
export class KeyShape extends WorkerPiece {
  override toString() : string {
    return this.color + ' key';
  }
}

export class Wax extends Piece<MyGame> {
  
}

export class Bulb extends Piece<MyGame> {
  
}

export class Trash extends Piece<MyGame> {
  
}

export class Check extends Piece<MyGame> {
  flipped: boolean = false;
}

export class Lamp extends Piece<MyGame> {
  playerIndex: number = 0;
}

export class PowerTile extends Piece<MyGame> {
  flipped: boolean = true;

  override toString() : string {
    return this.name;
  }
}

export class MasteryCube extends Piece<MyGame> {
    color: Color
    index: number;
}

export class ScoreTracker extends Piece<MyGame> {
    color: Color;
    index: number;
    flipped: boolean = false;
}
  
  export class Pigment extends Piece<MyGame> {
    color: Color = Color.Red;

    override toString() : string {
      return this.color + ' pigment'
    }
  }
  
  export class Melt extends Piece<MyGame> {
    color: Color = Color.White

    override toString() : string {
      return this.color + ' melt'
    }
  
    hasColor(color: Color): boolean {
      switch(color) {
        case Color.Red: {
          return [Color.Black, Color.Purple, Color.Orange, Color.Red].includes(this.color);
        }
        case Color.Blue: {
          return [Color.Black, Color.Green, Color.Purple, Color.Blue].includes(this.color);
        }
        case Color.Yellow: {
          return [Color.Black, Color.Orange, Color.Green, Color.Yellow].includes(this.color);
        }
      }
      return false;
    }

    canTakeColor(color: Color): boolean {
      switch(color) {
        case Color.Red: {
          return [Color.White, Color.Blue, Color.Yellow, Color.Green].includes(this.color);
        }
        case Color.Blue: {
          return [Color.White, Color.Red, Color.Yellow, Color.Orange].includes(this.color);
        }
        case Color.Yellow: {
          return [Color.White, Color.Blue, Color.Red, Color.Purple].includes(this.color);
        }
      }
      return false;
    }

    unmix(color: Color): void {
      switch(this.color) {
        case Color.Red: {
          if(color == Color.Red) {
            this.color = Color.White;
          }
          break;
        }
        case Color.Yellow: {
          if(color == Color.Yellow) {
            this.color = Color.White;
          }
          break;
        }
        case Color.Blue: {
          if(color == Color.Blue) {
            this.color = Color.White;
          }
          break;
        }
        case Color.Green: {
          if(color == Color.Blue) {
            this.color = Color.Yellow;
          } else if(color == Color.Yellow) {
            this.color = Color.Blue;
          }
          break;
        }
        case Color.Orange: {
          if(color == Color.Red) {
            this.color = Color.Yellow;
          } else if(color == Color.Yellow) {
            this.color = Color.Red;
          }
          break;
        }
        case Color.Purple: {
          if(color == Color.Blue) {
            this.color = Color.Red;
          } else if(color == Color.Red) {
            this.color = Color.Blue;
          }
          break;
        }
        case Color.Purple: {
          if(color == Color.Blue) {
            this.color = Color.Orange;
          } else if(color == Color.Red) {
            this.color = Color.Green;
          } else if(color == Color.Yellow) {
            this.color = Color.Purple;
          }
          break;
        }
      }
    }

    mix(color: Color): void {
      switch(this.color) {
        case Color.White: {
          this.color = color;
          break;
        }
        case Color.Red: {
          switch(color) {
            case Color.Blue: {
              this.color = Color.Purple;
              break;
            }
            case Color.Yellow: {
              this.color = Color.Orange;
              break;
            }
          }
          break;
        }
        case Color.Yellow: {
          switch(color) {
            case Color.Blue: {
              this.color = Color.Green;
              break;
            }
            case Color.Red: {
              this.color = Color.Orange;
              break;
            }
          }
          break;
        }
        case Color.Blue: {
          switch(color) {
            case Color.Yellow: {
              this.color = Color.Green;
              break;
            }
            case Color.Red: {
              this.color = Color.Purple;
              break;
            }
          }
          break;
        }
        case Color.Green: {
          if(color == Color.Red) {
            this.color = Color.Black;
          }
          break;
        }
        case Color.Orange: {
          if(color == Color.Blue) {
            this.color = Color.Black;
          }
          break;
        }
        case Color.Purple: {
          if(color == Color.Yellow) {
            this.color = Color.Black;
          }
          break;
        }
      }
    }
  }
