import { Piece } from "@boardzilla/core";
import { Color, CustomerType, MyGame } from "./index.js";
import { CandleSpace } from "./boards.js";

export class CustomerCard extends Piece<MyGame> {
    flipped: boolean = false;
    data: string = ""
    color: Color = Color.White;
    customerType: CustomerType = CustomerType.None;
    
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
      const space = this.game.first(CandleSpace, 
        {name: this.name + '-' + candle.color}
      )!;
      candle.putInto(space);
    }
}

export class EndGameTile extends Piece<MyGame> {
    flipped: boolean = true;
}
  
export class RoundEndTile extends Piece<MyGame> {
    flipped: boolean = true;
}
  
export class BackAlleyTile extends Piece<MyGame> {
    flipped: boolean = true;
    letter: String;

    performAction(game: MyGame) : void {
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
          break;
        }
        case 'convert-key-to-die': {
          if(game.currentPlayer().board.all(Wax).length > 0) {
            game.currentPlayer().meltWax([game.currentPlayer().board.first(Wax)!]);
          }
          break;
        }
        case 'move-candle': {
          break;
        }
        case 'swap-customer': {
          break;
        }

        case 'add-pigment': {
          if(game.currentPlayer().board.all(Melt).length > 0) {
            game.followUp({name: 'choosePigmentColor'});
          }
          break;
        }
        case 'advance-mastery': {
          game.currentPlayer().increaseMastery();
          break;
        }
        case 'gain-goal-card': {
          break;
        }
        case 'place-white-candle': {
          if(game.currentPlayer().board.all(CandlePawn, {color: Color.White}).length > 0) {
            game.followUp({name:'chooseWhiteCandle'});
            game.followUp({name:'placeWhiteCandle'});
          }
          break;
        }
        case 'remove-pigment': {
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
  
}
  
export class KeyShape extends WorkerPiece {
  
}

export class Wax extends Piece<MyGame> {
  
}

export class PowerTile extends Piece<MyGame> {
  flipped: boolean = true;
}

export class MasteryCube extends Piece<MyGame> {
    color: Color
}

export class ScoreTracker extends Piece<MyGame> {
    color: Color
    flipped: Boolean = false;
}
  
  export class Pigment extends Piece<MyGame> {
    color: Color = Color.Red;
  }
  
  export class Melt extends Piece<MyGame> {
    color: Color = Color.White
  
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
