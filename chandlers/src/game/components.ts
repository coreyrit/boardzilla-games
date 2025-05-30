import { Piece } from "@boardzilla/core";
import { Building, Color, CustomerType, MyGame } from "./index.js";
import { BackAlleySpace, CandleSpace, KeyHook, WorkerSpace } from "./boards.js";
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

    isPossible(game: MyGame, player: ChandlersPlayer) : boolean {
      switch(this.customerType) {
        case CustomerType.Adventurer: {
          return game.all(KeyHook).all(KeyShape).length > 0
        }
        case CustomerType.Rogue: {
          // return $.backAlleyA.all(BackAlleySpace).all(BackAlleyTile)
          //   .concat($.backAlleyB.all(BackAlleySpace).all(BackAlleyTile))
          //   .filter(x => x.isPossible(game, player)).length > 0;
          return true; // seems to have a bug above
        }
        case CustomerType.Witch: {    
          return player.board.all(CandlePawn, {color: Color.White}).length > 0;
        }
        case CustomerType.Priest: {
          return $.bag.all(CandlePawn, {color: Color.White}).length > 0;
        }
        case CustomerType.Prince: {
          return true; // can always get points
        }
        case CustomerType.Merchant: {
          return true; // can always get a customer
        }
        case CustomerType.Charlatan: {
          return $.waxSpill.all(ColorDie).length + $.pigmentSpill.all(ColorDie).length + $.moldSpill.all(ColorDie).length > 0;
        }
        case CustomerType.Cartographer: {
          return /*player.currentMastery() >= 2 && */ game.all(WorkerSpace).filter(x => x.color != undefined && x.all(WorkerPiece).length == 0).length > 0;
        }
      }
      return true;
    }

    peformAbility(game: MyGame, player: ChandlersPlayer) : void {
      switch(this.customerType) {
        case CustomerType.Adventurer: {
          game.followUp({name: 'chooseKey'})
          break;
        }
        case CustomerType.Rogue: {
          var actions = player.space.all(CustomerCard, {customerType: CustomerType.Rogue}).length;
          $.alleyBCheckSpace.first(Check)!.flipped = true;
          game.followUp({name: 'chooseBackAlleyAction', args: {letter: 'All', actions: actions}});
          break;
        }
        case CustomerType.Witch: {    
          game.followUp({name: 'chooseCandlesToTrade', args: {color: Color.White}});
          break;
        }
        case CustomerType.Priest: {
          if($.bag.all(CandlePawn, {color: Color.White}).length > 0) {
            $.bag.first(CandlePawn, {color: Color.White})?.putInto(player.nextEmptySpace());              

            game.message(player.name + ' takes a white candle from the discard.');
          }
          break;
        }
        case CustomerType.Prince: {
          player.increaseScore(3);

          game.message(player.name + ' gains 3 points.');
          break;
        }
        case CustomerType.Merchant: {
          game.followUp({name: 'chooseNextCustomer'})
          break;
        }
        case CustomerType.Charlatan: {
          game.followUp({name: 'chooseSpiltDie'})
          break;
        }
        case CustomerType.Cartographer: {
          const mastery = player.currentMastery();
          // if(mastery >= 2) {
            // player.decreaseMastery(2);

            // game.message(player.name + ' spends 2 mastery.');
            game.followUp({name: 'chooseAvailableColorAction'});
          // }
          break;
        }
       } 
    }

    gainMastery(game: MyGame, player: ChandlersPlayer, color: Color) : void {
      switch(color) {
        case Color.White: {
          player.increaseMastery(1);
          game.message(player.name + ' gains 1 mastery.');
          break;
        }
        case Color.Red: {
          player.increaseMastery(2);
          game.message(player.name + ' gains 2 mastery.');
          break;
        }
        case Color.Yellow: {
          player.increaseMastery(2);
          game.message(player.name + ' gains 2 mastery.');
          break;
        }
        case Color.Blue: {
          player.increaseMastery(2);
          game.message(player.name + ' gains 2 mastery.');
          break;
        }
        case Color.Green: {
          player.increaseMastery(2);
          game.message(player.name + ' gains 2 mastery.');
          break;
        }
        case Color.Orange: {
          player.increaseMastery(2);
          game.message(player.name + ' gains 2 mastery.');
          break;
        }
        case Color.Purple: {
          player.increaseMastery(2);
          game.message(player.name + ' gains 2 mastery.');
          break;
        }
        case Color.Black: {
          player.increaseMastery(3);
          game.message(player.name + ' gains 3 mastery.');
          break;
        }
      }
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
    scored: boolean = false;

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

    isPossible(game: MyGame, player: ChandlersPlayer): boolean {
      switch(this.name) {
        case 'refresh-customers': {
          return true;
        }
        case 'melt-wax': {
          return player.board.all(Wax).length > 0;
        }
        case 'purchace-spilt-wax': {
          return player.board.all(Wax).length >= 2 && $.meltSpillArea.all(Melt).length >= 1;
        }
        case 'convert-key-to-die': {
          return player.board.all(KeyShape).length > 0;
        }
        case 'move-candle': {
          // a lot more to it than this...
          return player.space.all(CustomerCard)
            .filter(x => x.color != Color.White && x.all(CandlePawn).length < x.requiredCandles().length && x.all(CandlePawn).length > 0)
            .length > 0
        }
        case 'swap-customer': {
          return player.space.all(CustomerCard).filter(x => x.color != Color.White && x.all(CandlePawn).length == 0).length > 0
        }
        case 'add-pigment': {
          return player.board.all(Melt).filter(x => x.color != Color.Black).length > 0;
        }
        case 'advance-mastery': {
          return true;
        }
        case 'gain-goal-card': {
          return $.goalDeck.all(GoalCard).length > 0;
        }
        case 'place-white-candle': {
          return player.board.all(CandlePawn, {color: Color.White}).length > 0;
        }
        case 'remove-pigment': {
          return player.board.all(Melt).filter(x => x.color != Color.White).length > 0;
        }
        case 'two-wax': {
          return true;
        }
      }
      return true;
    }

    performActionAfterConfirmation(game: MyGame) : void {
      switch(this.name) {
        case 'refresh-customers': {
          for(const customer of [$.customer1, $.customer2, $.customer3, $.customer4]) {
            customer.first(CustomerCard)?.putInto($.bag);
            game.drawTopCustomer().putInto(customer);
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
          if(game.currentPlayer().board.all(Wax).length >= 2) {
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
          // console.log(game.currentPlayer().space.all(CandlePawn).length);
          if(game.currentPlayer().space.all(CustomerCard)
            .filter(x => x.color != Color.White && x.all(CandlePawn).length < x.requiredCandles().length && x.all(CandlePawn).length > 0)
            .length > 0) {
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
            $.pigmentMasteryArea.all(Pigment).showToAll();
            game.followUp({name: 'choosePigmentColor', args: {remaining: 1}});
          }
          break;
        }
        case 'advance-mastery': {
          game.currentPlayer().increaseMastery();
          break;
        }
        case 'gain-goal-card': {
          if($.goalDeck.all(GoalCard).length > 0) {
            const goal = game.drawTopGoal()
            console.log(goal.name);
            console.log(game.currentPlayer().space.name);
            goal.putInto(game.currentPlayer().space);
            goal.showOnlyTo(game.currentPlayer());
          }
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

export class CaptureTile extends Piece<MyGame> {
  flipped: boolean = true;
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

export class PlayerOrderCube extends Piece<MyGame> {
  color: Color
  index: number;
}

export class ScoreTracker extends Piece<MyGame> {
    color: Color;
    index: number;
    flipped: boolean = false;
}
  
  export class Pigment extends Piece<MyGame> {
    color: Color | undefined = undefined;

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
        case Color.Black: {
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
