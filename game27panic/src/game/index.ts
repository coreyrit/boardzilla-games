import {
  createGame,
  Player,
  Game,
  Space,
  Piece,
  Do,
} from '@boardzilla/core';

import { buildCards } from './build-cards.js';
import { railCards } from './rail-cards.js';

// player
export class Game27panicPlayer extends Player<MyGame, Game27panicPlayer> {
  scientist: Scientist
  limit: number
  hand: PlayerHand
  pawn: Pawn

  // temporary variables when building or trading
  buildLetter: string | undefined
  scrapsLetter: string | undefined
  tradePartner: PlayerHand | undefined
};

export class MyGame extends Game<MyGame, Game27panicPlayer> {
  
  // hand limit
  handLimit: number = 0

  // number of scraps
  scrapsCount: number = 5;

  // number of damage tokens
  damageTokenCount: number = 12;

  // valid movements
  moveArea : Record<number, Record<number, number[]>> = {1: {}, 2: {}};
  
  // initalizes valid movement around the grid
  init(): void {
    switch(this.players.length) {
      case 4: {
        this.handLimit = 3;
        break;
      }
      case 3: {
        this.handLimit = 4;
        break;
      }
      default: {
        this.handLimit = 6;
        break;
      }
    }

    for(let i = 1; i <= 15; i++) {
      let valid1 = []
      let valid2 = []
  
      valid1.push(i-3)
      valid1.push(i+3)

      valid2.push(i-6)
      valid2.push(i+6)
  
      if(i % 3 == 0 || i % 3 == 2) {
        valid1.push(i-1)
    
        valid2.push(i-4)
        valid2.push(i+2)

        if(i % 3 == 0) {
          valid2.push(i-2)
        }
      }
      if(i % 3 == 1 || i % 3 == 2) {
        valid1.push(i+1)
    
        valid2.push(i-2)
        valid2.push(i+4)

        if(i % 3 == 1) {
          valid2.push(i+2)
        }
      }
  
      this.moveArea[1][i] = valid1.filter(x => x >= 1 && x<= 15)
      this.moveArea[2][i] = valid1.concat(valid2).filter(x => x >= 1 && x<= 15)
    }
  }

  canMove(player : Game27panicPlayer, x : YearSpace, numSpaces: number = 0) : boolean {
    if(occupied(x)) {
      return false;
    } else if(x == player.pawn.container(YearSpace)) {
      return true
    } else if(numSpaces == 0) {
      return false
    } else if(this.moveArea[1][x.space] == undefined) {
      return false
    } else {      
      const year = player.pawn.container(YearMat)!;
      let result = false;
      this.moveArea[1][x.space].forEach(space => {
        result = result || this.canMove(player, year.first(YearSpace, {space: space})!, numSpaces-1)
      })
      return result;
    }    
  }

  checkForWin() : boolean {
    if(this.game.all(Cargo, {location: 'finish'}).length == 4) {
      return true;
    }
    
    // see if all paths are safe
    let win = true;
    this.game.all(YearMat).forEach(x => {
      const cargo = x.first(Cargo)!
      win = win && x.testCargo(cargo.container(YearSpace)!, cargo.location, true) == MoveResult.Safe;
    });

    return win;
  }
}

// tokens are used for scraps tokens
export class Token extends Piece<MyGame> {
}

// the deck of build cards
export class BuildDeck extends Space<MyGame> {
}

// build cards
export class BuildCard extends Piece<MyGame> {
  type: 'rail' | 'move' | 'wild'
  rotated: boolean = false
  letter: string = ""
  damageColumn: number = 0
  year: number = 0
}

// coordinate by percentage inside of parent
export class Coordinate {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

// a pair of coordinates
export class CoordinatePair {
  a: Coordinate
  b: Coordinate
  constructor(a: Coordinate, b: Coordinate) {
    this.a = a;
    this.b = b;
  }
}

// Get the coordinates a particular location.
// Apply an optional offset.
function coordsOf(location: string, offsetX: number = 0, offsetY: number = 0, next : string = 'none') : Coordinate {
  switch(location) {
    case 'tl': { return new Coordinate(33-offsetX, 15-offsetY)}
    case 'tr': { return new Coordinate(66-offsetX, 15-offsetY)}

    case 'bl': { return new Coordinate(33-offsetX, 85-offsetY)}
    case 'br': { return new Coordinate(66-offsetX, 85-offsetY)}

    case 'cl': { return new Coordinate(15-offsetX, 50-offsetY)}
    case 'cr': { return new Coordinate(85-offsetX, 50-offsetY)}

    case 'finish': { return new Coordinate(50-offsetX, 75-offsetY)}
    
    case 'none': { 
      switch(next) {
        case 'tl': {
          return new Coordinate(33-offsetX, 50-offsetY)
        }
        case 'tr': {
          return new Coordinate(66-offsetX, 50-offsetY)
        }
        default: {
          return new Coordinate(50-offsetX, 50-offsetY)
        }
      }      
    }
    default: { return new Coordinate(0, 0)}
  }
}

// a rail card for building routes
export class RailCard extends Piece<MyGame> {
  rotated: boolean = false
  letter: string = ""
  routes: Record<string, string> = {}
  unavailable: boolean = false;
  pts: CoordinatePair[]  
  face: String = ""

  // updates the coordinates based on current orientation
  updateCoordinates() : void {
    this.pts = Object.entries(this.routes).map(([key, value]) => new CoordinatePair(coordsOf(key), coordsOf(value)))
  }

  // rotate a location and return resulting string
  rotateLocation(location : string) {
    switch(location) {
      case 'tl': { return 'br' }
      case 'tr': { return 'bl' }
      case 'cl': { return 'cr' }
      case 'cr': { return 'cl' }
      case 'bl': { return 'tr' }
      case 'br': { return 'tl' }
      default: { return location }
    }
  }

  // rotate this card
  rotate() : void {
    this.rotated = !this.rotated
    this.rotation = this.rotated ? 180 : 0

    let newRoutes : Record<string, string> = {}
    Object.entries(this.routes).forEach(([key, value]) => {
      let newKey = this.rotateLocation(key)
      let newValue = this.rotateLocation(value)
      newRoutes[newKey] = newValue;
    });
    this.routes = newRoutes;
    Object.entries(this.routes).forEach(([key, value]) => this.routes[value] = key);
    this.updateCoordinates()
  }
}

// a stack of like letter rail cards
export class RailStack extends Space<MyGame> {
  stack : RailCard[]
  letter : string
}

// the result of moving
export enum MoveResult {
  Safe,
  DamagedRail,
  OffMap,
  MissingRail,
  Obstacle,
  MismatchedRail,
  Win,
  Unknown
}

// a mat with spaces
export class YearMat extends Space<MyGame> {
  year: number
  movement: number
  building: number
  
  // blocked by an obstacle
  isBlocked(number : number) : boolean {
    return this.first(YearSpace, {space: number})!.all(Obstacle).length > 0
  }

  // checks if space has a rail
  noRails(number : number) : boolean {
    return this.first(YearSpace, {space: number})!.all(RailCard).length == 0
  }

  // checks if rail is damaged
  isDamaged(number : number) : boolean {
    return this.first(YearSpace, {space: number})!.all(Damage).length > 0
  }

  moveCargo() : MoveResult {
    let cargo = this.first(Cargo)!
    return this.testCargo(cargo.container(YearSpace)!, cargo.location);
  }

  // moves cargo in this year to its nesxt space and returns the result
  testCargo(oldCargoSpace: YearSpace, oldCargoLocation: string, test : boolean = false) : MoveResult {
    let newCargoLocation = ''

    // first check if the cargo has started moving
    if(oldCargoLocation == 'none') {
        let railCard = this.first(RailCard, {name: 'start' + this.year})!;
        newCargoLocation = railCard!.routes['none']

        if(test) {
          return this.testCargo(oldCargoSpace, newCargoLocation, test);
        } else {
          const cargo = this.first(Cargo)!
          cargo.location = newCargoLocation;
          cargo.updateCoordinates();
          return MoveResult.Safe;
        }
    } 
    // check if cargo has made it to the finish
    else if(oldCargoLocation == 'finish') {
        return MoveResult.Safe;
    } 
    // else the cargo is moving
    else {
        let nl = {number: 0, location: 'none'}
        let cargoSquare = oldCargoSpace.space

        let column1 = [1, 4, 7, 10, 13];
        let column3 = [3, 6, 9, 12, 15];
        if(oldCargoLocation == 'cl') {
            if(column1.includes(cargoSquare)) {
                return MoveResult.OffMap;
            } else {
                nl.number = cargoSquare-1;
            }
        } else if(oldCargoLocation == 'tl' || oldCargoLocation == 'tr') {
            if(cargoSquare <= 3) {                
                let finish = this.first(YearSpace, {space: cargoSquare-3})!
                newCargoLocation = 'finish';

                if (test) {
                  return this.testCargo(finish, newCargoLocation, test);
                } else {
                  const cargo = this.first(Cargo)!                
                  cargo.location = newCargoLocation;
                  cargo.updateCoordinates();
                  cargo.putInto(finish);            
                  return MoveResult.Safe;
                }                
            } else {
                nl.number = cargoSquare-3;
            }
        } else if(oldCargoLocation == 'bl' || oldCargoLocation == 'br') {
            if(cargoSquare >= 13) {
                return MoveResult.OffMap;
            } else {
                nl.number = cargoSquare+3;
            }
        } else if(oldCargoLocation == 'cr') {
            if(column3.includes(cargoSquare)) {
                return MoveResult.OffMap;
            } else {
                nl.number = cargoSquare+1;
            }
        }

        if(this.isBlocked(nl.number)) return MoveResult.Obstacle;
        if(this.noRails(nl.number)) return MoveResult.MissingRail;
        if(this.isDamaged(nl.number)) return MoveResult.DamagedRail;

        nl.location = 'none'
        switch(oldCargoLocation) {
            case 'bl': {nl.location = 'tl'; break; }
            case 'br': {nl.location = 'tr'; break; }
            case 'tl': {nl.location = 'bl'; break; }
            case 'tr': {nl.location = 'br'; break; }
            case 'cl': {nl.location = 'cr'; break; }
            case 'cr': {nl.location = 'cl'; break; }
        }

        let rail = this.first(YearSpace, {space: nl.number})!.first(RailCard)!
        if(rail.routes[nl.location] == undefined) {
            return MoveResult.MismatchedRail;
        }

        newCargoLocation = rail.routes[nl.location];
        if(test) {
          return this.testCargo(rail.container(YearSpace)!, newCargoLocation, test);
        } else {      
          const cargo = this.first(Cargo)!
          cargo.location = newCargoLocation;
          cargo.updateCoordinates();
          cargo.putInto(rail.container(YearSpace)!);           
          return MoveResult.Safe;
        }
    }

    // should not get here
    return MoveResult.Unknown;
  }
}

// a space within a year mat
export class YearSpace extends Space<MyGame> {
  space: number
  column: number
}

// a player's pawn
export class Pawn extends Piece<MyGame> {
  color: string
  x: number
}

// a damage token
export class Damage extends Piece<MyGame> {
}

// an obstacle card
export class Obstacle extends Piece<MyGame> {
}

// a cargo cube
export class Cargo extends Piece<MyGame> {
  location: string //'tl' | 'tr' | 'cl' | 'cr' | 'bl' | 'br' | 'none'
  coords: Coordinate = new Coordinate(0, 0);

  updateCoordinates(next: string = 'none'): void {
    let offsetX = 15
    let offsetY = 15
    
    this.coords = coordsOf(this.location, 
      offsetX,
      offsetY, 
      next);
  }
}

export class PlayerPane extends Space<MyGame> {

}

export class ScientistPane extends Space<MyGame> {

}

export class Scientist extends Piece<MyGame> {
  color: string
  year: number
}

// the player's hand of build cards
export class PlayerHand extends Space<MyGame> {
  player: Game27panicPlayer
}

// get the space number of the year mat a player's pawn is on
function spaceOf(player: Game27panicPlayer) : number {
  return player.pawn.container(YearSpace)!.space;
}

// get the year that the player's pawn is on
function yearOf(player: Game27panicPlayer) : number {
  return player.pawn.container(YearMat)!.year;
}

function prevYear(year : number) {
  switch(year) {
    case 1957: { return 1930 }
    case 1984: { return 1957 }
    case 2011: { return 1984 }
    default: -1
  }
}

function nextYear(year : number) {
  switch(year) {
    case 1930: { return 1957 }
    case 1957: { return 1984 }
    case 1984: { return 2011 }
    default: -1
  }
}

// get the year of the mat a particular space is in  
function matYear(space: YearSpace): number {
  return space.container(YearMat)!.year
}

// return whether or not a space has an obstacle
function occupied(space : YearSpace) : boolean {
  return space.all(Obstacle).length > 0
}

// get the movement allowed in the given year
function movementOf(space : YearSpace) : number {
  return space.container(YearMat)!.movement
}

// giet the number of required build cards in the given year
function buildingOf(player: Game27panicPlayer) : number {
  return player.pawn.container(YearMat)!.building
}

// return a map of how build letters to how many are in the list
function countBy(list: any, keyGetter: any) : Map<string, number> {
  let map = new Map<string, number>()
  list.forEach((item: any) => {
       const key = keyGetter(item);
       if (!map.has(key)) {
           map.set(key, 1);
       } else {
           map.set(key, map.get(key)!+1)
       }
  });
  return map;
}

// create the game
export default createGame(Game27panicPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer, whileLoop } = game.flowCommands;

  game.init()

  // game.disableDefaultAppearance()

  // scientist selection
  game.create(ScientistPane, 'scientists')

  $.scientists.create(Scientist, 'geologist', {color: 'green', year: 1930})
  $.scientists.create(Scientist, 'astronomer', {color: 'yellow', year: 1957})
  $.scientists.create(Scientist, 'chemist', {color: 'red', year: 1984})
  $.scientists.create(Scientist, 'physicist', {color: 'blue', year: 2011})

  // year mats
  const years: number[] = [1930, 1957, 1984, 2011]
  const mvmt: number[] = [1, 1, 2, 2]
  const bldg: number[] = [3, 2, 2, 1]
  const colOffset: number[] = [0, 3, 6, 9]
  const locations: string[] = ['tl', 'tl', 'tr', 'tr']
  const cargoColors: string[] = ['green', 'yellow', 'red', 'blue']
  const startSpaces: number[] = [16, 17, 17, 18]
  let column = 1

  // loop through the years
  for (let j = 0; j < years.length; j++) {

    // create the year mat
    const yearMat = game.create(YearMat, 'year' + years[j], {year: years[j], movement: mvmt[j], building: bldg[j]});

    // add spaces to the mat
    for (let i = -2; i <= 18; i++) {
      yearMat.create(YearSpace, i.toString(), {space: i, column: (i % 3 == 0 ? 3 : i % 3) + colOffset[j]})
    }

    // initialize routes for start rail card
    let startRoutes : Record<string, string> = {}
    startRoutes[locations[j]] = 'none'
    startRoutes['none'] = locations[j]

    // create the start rail
    let start = yearMat.first(YearSpace, {space: startSpaces[j]})!.create(RailCard, 'start' + years[j],
        {rotated: false, letter: "Start", unavailable: false, routes: startRoutes});
    start.face = 'start' + years[j]
    start.updateCoordinates()

    // initialize routes for start rail card
    let finishRoutes : Record<string, string> = {}
    finishRoutes['bl'] = 'finish'
    finishRoutes['br'] = 'finish'
    finishRoutes['finish'] = 'bl'
    finishRoutes['finish'] = 'br'

    // create the finish rails
    for (let i = -2; i <= 0; i++) {
      let finish = yearMat.first(YearSpace, {space: i})!.create(RailCard, 'finish-' + column,
        {rotated: false, letter: "Finish", unavailable: false, routes: finishRoutes});
      finish.face = 'finish-' + column
      finish.updateCoordinates()
      column++;
    }
    
    // place cargo on the start rail
    let cargo = start.container(YearSpace)!.create(Cargo, cargoColors[j], {location: 'none'})
    cargo.updateCoordinates(locations[j])
  }

  // add obstacles
  let obs1 = Math.floor(game.random() * 6) + 1
  let obs2 = Math.floor(game.random() * 6) + 7
  $.year1957.first(YearSpace, {'space': obs1})!.create(Obstacle, 'blocked')
  $.year1984.first(YearSpace, {'space': obs1})!.create(Obstacle, 'blocked')
  $.year2011.first(YearSpace, {'space': obs1})!.create(Obstacle, 'blocked')
  $.year2011.first(YearSpace, {'space': obs2})!.create(Obstacle, 'blocked')

  // add players
  const playerArea = game.create(PlayerPane, 'playerArea')
  var playerColors = ['red', 'green', 'blue', 'yellow']
  var playerYears = [1984, 1930, 2011, 1957]
  var playerXs = [15, 40, 65, 90]
  for (let j = 0; j < game.players.length; j++) {
    const player = game.players[j];
    const playerNum = j+1
 
    const pawn = game.create(Pawn, 'player' + playerNum, {color: playerColors[j], x: playerXs[j]})    

    const hand = playerArea.create(PlayerHand, 'player' + playerNum, { player : player });
    hand.onEnter(BuildCard, ((x) => { 
      x.showToAll() 
      hand.sortBy("name")
    }))

    pawn.putInto(game.first(YearMat, {year: playerYears[j]})!.first(YearSpace, {space: 14})!)
    player.hand = hand
    player.pawn = pawn
    player.limit = game.handLimit
  }

  // create build deck
  game.create(BuildDeck, 'buildCards');
  $.buildCards.onEnter(BuildCard, ((x) => { x.hideFromAll() }))
  for (const buildCard of buildCards) {
    $.buildCards.create(BuildCard, buildCard.type == 'rail' ? buildCard.letter! + ',' + buildCard.damageColumn : 
      buildCard.type == 'move' ? buildCard.year! + '' : 'Wild', 
      buildCard)
  }

  // create build discard
  game.create(Space, 'discard');

  // create a place to keep the move cards
  game.create(Space, 'move');
  $.move.onEnter(BuildCard, ((x) => { x.showToAll() }))
  
  // create some scraps
  game.create(Space, 'scraps');
  for (let i = 0; i < game.scrapsCount; i++) {
    $.scraps.create(Token, 'Scraps')
  }

  // create a garbage area to remove stuff from the game
  game.create(Space, 'garbage')

  // create damage tokens
  game.create(Space, 'damage')
  for (let i = 0; i < game.damageTokenCount; i++) {
    $.damage.create(Damage, 'Damage')
  }

  // creates spaces for the rail cards (available and unavailable)
  game.create(Space, 'availableRailCards');
  game.create(Space, 'unavailableRailCards');

  // create the rail cards
  let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
  let stacks = new Map<string, RailStack>();
  for (const railCard of railCards) {
    for(let i = 0; i < 4; i++) {
      if(!stacks.has(railCard.letter!)) {
        let rs = $.availableRailCards.create(RailStack, railCard.letter!, {letter: railCard.letter})
        let urs = $.unavailableRailCards.create(RailStack, railCard.letter!, {letter: railCard.letter})
        urs.onEnter(RailCard, ((x) => {
          x.unavailable = true;
          x.face = 'unavailable' + x.letter
        }))
        
        stacks.set(railCard.letter!, rs)    
      }
      let rc = stacks.get(railCard.letter!)!.create(RailCard, railCard.letter!, railCard)
      rc.face = 'available' + rc.letter
      Object.entries(rc.routes).forEach(([key, value]) => rc.routes[value] = key);
      rc.updateCoordinates()
    }
  }

  // test moving all rail cards to unavailable
  // $.availableRailCards.all(RailCard).forEach(x => {
  //   x.putInto($.unavailableRailCards.first(RailStack, {letter: x.letter})!)
  // });


  game.all(YearSpace).forEach(ym => {
    ym.onEnter(RailCard, ((x) => {
      x.unavailable = false;
      x.face = 'available' + x.letter
    }))
  });

  /**
   * Define all possible game actions, e.g.:
   */
  game.defineActions({

    drawBuildCard: (player) => action({
      prompt: 'Draw a Build Card'
    }).chooseOnBoard(
      'buildCard', [$.buildCards.last(BuildCard)!],
      { skipIf: 'never' }
    ).do(
      ({ buildCard }) => {
        if(buildCard.type == 'move') {
          // discard and move cargo
          buildCard.putInto($.move)
          let result = game.first(YearMat, {year: buildCard.year})!.moveCargo();
          if (result != MoveResult.Safe) {
            game.finish(undefined, 'crashed')
          } else if (game.checkForWin()) {
            game.finish(undefined, 'win')
          }

          // check if 3 move cards
          if ($.move.all(BuildCard).length >= 3) {
            $.move.all(BuildCard).forEach(x => {
              if(game.all(YearMat, {year: x.year}).first(Cargo)!.location == 'finish') {
                // don't recirulcate this move card
                x.putInto($.garbage)
              } else {
                x.putInto($.buildCards)
              }
            })
          }
          $.buildCards.shuffle()

        } else {
          game.message('checking for damage in column: ' + buildCard.damageColumn)          
          
          // ignore for chemist
          const playerColumn = player.pawn.container(YearSpace)!.column;
          let centerColumn = playerColumn;
          if(playerColumn % 3 == 1) {
            centerColumn++;
          } else if(playerColumn % 3 == 0) {
            centerColumn--;
          }
          if(player.scientist.name == 'chemist' && buildCard.damageColumn >= centerColumn-4 && buildCard.damageColumn <= centerColumn+4) {
            game.message("Ignore damage because of Chemist.")
          } else {
            // check for damage
            let rails = game.all(YearSpace, {column: buildCard.damageColumn})
              .filter(x => x.all(Cargo).length == 0 && x.all(Damage).length == 0)
            let rail = undefined
            if(rails.length > 0) {
              rail = rails.all(RailCard).filter(x => !x.name.startsWith("start") && !x.name.startsWith("finish")).first(RailCard)!
            }
            if(rail != undefined) {
              game.message(rail!.toString());
              if($.damage.all(Damage).length == 0) {
                game.finish(undefined, 'damaged')
              } else {
                $.damage.first(Damage)!.putInto(rail.container(YearSpace)!)
              }
            } else {
              game.message('no rail found')
            }
          }
          
          // add card to hand
          buildCard.putInto(player.hand)
        }
      }
    ).message(
      'You drew a {{buildCard}}'
    ),

    discardBuildCard: (player) => action({
      prompt: 'Discard a Build Card',
    }).chooseOnBoard(
      'buildCard', player.hand.all(BuildCard)
    ).do(
      ({ buildCard }) => {
        buildCard.putInto($.discard)
      }
    ).message(
      'You discarded {{buildCard}}'
    ),    

    timeTravel: (player) => action({
      prompt: 'Time Travel'
    }).chooseOnBoard(
      'space', game.all(YearSpace).filter(x => !occupied(x) && x.space == spaceOf(player) && yearOf(player) != matYear(x))
    ).do(({ space }) => {
        player.pawn.putInto(space)
      }
    ).message(
      'You traveled to {{space}}'
    ),

    move: (player) => action({
      prompt: 'Move'
    }).chooseOnBoard(
      'space', player.pawn.container(YearMat)!.all(YearSpace).filter(x => x.space != spaceOf(player) && 
        game.canMove(player, x, player.scientist.name == 'physicist' ? movementOf(x) * 2 : movementOf(x))
      )
    ).do(({ space }) => {
        player.pawn.putInto(space)
      }
    ).message(
      'You Moved to {{space}}'
    ),

    chooseTradePartner: (player) => action({
      prompt: 'Choose Trade Partner'
    }).chooseOnBoard(
      'partner', player.scientist.name == 'astronomer' ? 
        (game.players.map(x => x.hand).filter(x => x != player.hand && yearOf(player) == yearOf(x.player!))).concat
        (game.players.map(x => x.hand).filter(x => x != player.hand && prevYear(yearOf(player)) == yearOf(x.player!))).concat
        (game.players.map(x => x.hand).filter(x => x != player.hand && nextYear(yearOf(player)) == yearOf(x.player!))) :    
        game.players.map(x => x.hand).filter(x => x != player.hand && yearOf(player) == yearOf(x.player!))
    ).do(({ partner }) => {
      player.tradePartner = partner
    }),

    trade: (player) => action({
      prompt: 'Trade'
    }).chooseOnBoard(
      'card', player.tradePartner != undefined ? player.hand.all(BuildCard).concat(player.tradePartner.all(BuildCard)) : []
    ).do(({ card }) => {
        if(card.container(PlayerHand) == player.hand) {
          card.putInto(player.tradePartner!)
        } else if(player.hand.all(BuildCard)) {
          card.putInto(player.hand)
        }
      }
    ).message(
      'You traded {{card}}'
    ),

    skip: (player) => action({
      prompt: 'Skip',
    }),

    finishTrading: (player) => action({
      prompt: 'Finish',
      condition: (
        player.hand.all(BuildCard).length <= player.limit
        && 
        player.tradePartner!.all(BuildCard).length <= player.tradePartner!.player.limit
      )
    }).do(() => {
      player.tradePartner = undefined
    }),

    build: (player) => action({
      prompt: 'Build',
      condition: player.pawn.container(YearSpace)!.all(RailCard).length == 0
    }).chooseOnBoard(
      'card', () => {
        let letterCounts : Map<string, number> = countBy(player.hand.all(BuildCard), (x : BuildCard) => x.letter);
        return $.availableRailCards.all(RailCard).filter(x =>
          (player.hand.all(BuildCard, {type: 'wild'}).length >= buildingOf(player)) ||
          (letterCounts.get(x.letter)! + player.hand.all(BuildCard, {type: 'wild'}).length >= buildingOf(player)))
      }
    ).do(({ card }) => {
      player.buildLetter = card.letter

      game.all(YearMat).forEach(x => {
        if (x.year >= yearOf(player)) {
          let yearSpace = x.first(YearSpace, {space: spaceOf(player)})!
          let railCard = $.availableRailCards.all(RailCard).filter(x => x.letter == player.buildLetter).first(RailCard)!
          if(yearSpace.all(RailCard).length == 0 && yearSpace.all(Obstacle).length == 0) {
            railCard.putInto(yearSpace)
          }
        }
      })
      $.availableRailCards.all(RailCard).filter(x => x.letter == player.buildLetter).forEach(x => {
        x.putInto($.unavailableRailCards.first(RailStack, {letter: x.letter})!)
      })
    }).message(
      'You built {{card}}'
    ),

    chooseBuildCards: (player) => action({
      prompt: 'Choose Build Cards',
    }).chooseOnBoard(
      'buildCards', player.hand.all(BuildCard, {letter: player.buildLetter})
        .concat(player.hand.all(BuildCard, {type: 'wild'})), {number: buildingOf(player)}
    ).do(
      ({ buildCards }) => {
        buildCards.forEach(x => x.putInto($.discard))        
        player.buildLetter = undefined
      }
    ),

    scraps: (player) => action({
      prompt: 'Build Scraps',
      condition: player.pawn.container(YearSpace)!.all(RailCard).length == 0 &&
        $.scraps.all(Token).length > 0 && player.hand.all(BuildCard).length > 0
    }).chooseOnBoard(
      'scraps', $.unavailableRailCards.all(RailCard)
    ).do(
      ({scraps}) => {
        player.scrapsLetter = scraps.letter

        // place the unavailable rail card
        let sc = $.unavailableRailCards.first(RailCard, {letter: player.scrapsLetter})!
        sc.putInto(player.pawn.container(YearSpace)!)

        // use up a scraps token
        $.scraps.first(Token)!.putInto($.garbage)
      }
    ),

    discardForScraps: (player) => action({
      prompt: 'Discard a Build Card',
    }).chooseOnBoard(
      'buildCard', player.hand.all(BuildCard)
    ).do(
      ({ buildCard }) => {        
        // discard a build card
        buildCard.putInto($.discard)
        player.scrapsLetter = undefined
      }
    ).message(
      'You discarded {{buildCard}}'
    ),

    repair: (player) => action({
      prompt: 'Repair Rail',
      condition: player.pawn.container(YearSpace)!.all(Damage).length > 0
    }).do(
      () => { 
        player.pawn.container(YearSpace)!.first(Damage)!.putInto($.damage)
      }
    ),

    rotate: (player) => action({
      prompt: 'Rotate Rails'
    }).do(
      () => {
        if(player.buildLetter != undefined) {
          // rotate now and future
          game.all(YearMat).forEach(x => {
            if (x.year >= yearOf(player)) {
              let yearSpace = x.first(YearSpace, {space: spaceOf(player)})!
              let railCard = yearSpace.all(RailCard).filter(x => x.letter == player.buildLetter).forEach(y => {
                y.rotate();
              })
            }
          })
        } else {
          // rotate just the scraps
          let x = player.pawn.container(YearMat)!
          let yearSpace = x.first(YearSpace, {space: spaceOf(player)})!
          let railCard = yearSpace.all(RailCard).filter(x => x.letter == player.scrapsLetter).forEach(y => {
              y.rotate();
            })
        }
      }
    ),

    removeRail: (player) => action({
      prompt: 'Remove Rail',
      condition: player.pawn.container(YearSpace)!.all(RailCard).length > 0 &&
        player.pawn.container(YearSpace)!.all(Damage).length == 0 &&
        player.pawn.container(YearSpace)!.all(Cargo).length == 0
    }).do(
      () => {
        let rail = player.pawn.container(YearSpace)!.first(RailCard)!;
        // rail.unavailable = true
        // rail.face = 'unavailable' + rail.letter
        rail.putInto($.unavailableRailCards.first(RailStack, {letter: rail.letter})!);
      } 
    ),

    checkForWin: () => action({
    }).do(
      () => {
        if(game.checkForWin()) {
          game.finish(undefined, 'win')
          // game.addDelay()
        }
      }
    ),

    chooseScientist: (player) => action({
      prompt: 'Choose your scientist',
    }).chooseOnBoard(
      'scientist', $.scientists.all(Scientist)
    ).do(
      ({ scientist }) => {        
        player.scientist = scientist
        player.pawn.color = scientist.color
        player.pawn.putInto(game.first(YearMat, {year: scientist.year})!.first(YearSpace, {space: 14})!)
        if(scientist.name == 'geologist') {
          player.limit = game.handLimit + 1
        }
        scientist.putInto($.buildCards)
      }
    ).message(
      'You chose {{scientist}}'
    ),

   });

   
  /**
   * Define the game flow, starting with board setup and progressing through all
   * phases and turns, e.g.:
   */
  game.defineFlow(
    () => $.buildCards.shuffle(),
    eachPlayer({
      name: 'turn', do: [
        playerActions({ actions: ['chooseScientist']}),
      ]
    }),
    () => {      
      $.scientists.all(Scientist).forEach(x => x.putInto($.garbage))
    },
    () => {
      // deal starting hands
      for (const player of game.players) {
        for(let i = 0; i < game.handLimit-1; i++) {
          $.buildCards.all(BuildCard).filter(x => x.type != 'move').first(BuildCard)?.putInto(player.hand)
        }
      }
    },
    () => $.buildCards.shuffle(),
    loop(
        eachPlayer({
          name: 'turn', do: [
            () => { 
              $.buildCards.all(Scientist).hideFromAll();
              game.players.current()!.scientist.showToAll();
            },

            // 1. Draw a build card and 2. Check for Damage
            playerActions({ actions: ['drawBuildCard']}),
          
            // (Discard down to hand limit)
            whileLoop({while: () => game.players.current()!.hand.all(BuildCard).length > game.players.current()!.limit, do: (
              playerActions({ actions: ['discardBuildCard']})
            )}),

            // 3. Travel through time
            playerActions({ actions: ['timeTravel', 'skip']}),

            // 4. Move within year
            playerActions({ actions: ['move', 'skip']}),

            // 5. Trade cards with ONE player in the same year
            playerActions({ actions: ['chooseTradePartner', 'skip']}),
            whileLoop({while: () => game.players.current()!.tradePartner != undefined, do: (
              playerActions({ actions: ['trade', 'finishTrading']})
            )}),

            // Build or Repair or Recycle
            playerActions({ actions: [
              'build', 
              'scraps', 
              'repair', 
              'removeRail', 
              'skip'
              ]}),
            whileLoop({while: () => game.players.current()!.buildLetter != undefined, do: (
              playerActions({ actions: ['chooseBuildCards', 'rotate']})
            )}),
            whileLoop({while: () => game.players.current()!.scrapsLetter != undefined, do: (
              playerActions({ actions: ['discardForScraps', 'rotate']})
            )}),
            
            // Check for win
            playerActions({ actions: ['checkForWin']}),
          ]
        })
    )
  );
});
// 