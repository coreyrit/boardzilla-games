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
import { off } from 'process';

export class Game27panicPlayer extends Player<MyGame, Game27panicPlayer> {
  /**
   * Any properties of your players that are specific to your game go here
   */
  // space: number = 0; // as an example
  // year: number = 2011
  hand: PlayerHand
  pawn: Pawn
  buildLetter: string | undefined
  scrapsLetter: string | undefined
  tradePartner: PlayerHand | undefined
};

export class MyGame extends Game<MyGame, Game27panicPlayer> {
  /**
   * Any overall properties of your game go here
   */
  handLimit: number = 6;

  // valid movements
  moveArea : Record<number, Record<number, number[]>> = {1: {}, 2: {}};
  
  init(): void {
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
          valid1.push(i-2)
        }
      }
      if(i % 3 == 1 || i % 3 == 2) {
        valid1.push(i+1)
    
        valid2.push(i-2)
        valid2.push(i+4)

        if(i % 3 == 1) {
          valid1.push(i+2)
        }
      }
  
      this.moveArea[1][i] = valid1.filter(x => x >= 1 && x<= 15)
      this.moveArea[2][i] = valid1.concat(valid2).filter(x => x >= 1 && x<= 15)
    }
  }
}

/**
 * Define your game's custom pieces and spaces.
 */
export class Token extends Piece<MyGame> { // as an example
  // color: 'red' | 'blue';
}

export class BuildCard extends Piece<MyGame> {
  type: 'rail' | 'move' | 'wild'
  rotated: boolean = false
  letter: string = ""
  damageColumn: number = 0
  year: number = 0
}

export class Coordinate {
  x: string
  y: string
  constructor(x: number, y: number) {
    this.x = x + '%'
    this.y = y + '%'
  }
}
export class CoordinatePair {
  a: Coordinate
  b: Coordinate
  constructor(a: Coordinate, b: Coordinate) {
    this.a = a;
    this.b = b;
  }
}

function coordsOf(location: string, offsetX: number = 0, offsetY: number = 0) : Coordinate {
  switch(location) {
    case 'tl': { return new Coordinate(25-offsetX, 0-offsetY)}
    case 'tr': { return new Coordinate(75-offsetX, 0-offsetY)}
    case 'bl': { return new Coordinate(25-offsetX, 100-offsetY)}
    case 'br': { return new Coordinate(75-offsetX, 100-offsetY)}
    case 'cl': { return new Coordinate(0-offsetX, 50-offsetY)}
    case 'cr': { return new Coordinate(100-offsetX, 50-offsetY)}
    case 'none': { return new Coordinate(50-offsetX, 100-offsetY)}
    default: { return new Coordinate(0, 0)}
  }
}

export class RailCard extends Piece<MyGame> {
  rotated: boolean = false
  letter: string = ""
  routes: Record<string, string> = {}
  unavailable: boolean = false;
  pts: CoordinatePair[]  

  updateCoordinates() : void {
    this.pts = Object.entries(this.routes).map(([key, value]) => new CoordinatePair(coordsOf(key), coordsOf(value)))
  }

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

  rotate() : void {
    this.rotated = !this.rotated
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

export class RailStack extends Space<MyGame> {
  stack : RailCard[]
}

export enum MoveResult {
  Safe,
  DamagedRail,
  OffMap,
  MissingRail,
  Obstacle,
  MismatchedRail,
  Win
}

export class YearMat extends Space<MyGame> {
  year: number
  movement: number
  building: number
  
  isBlocked(number : number) : boolean {
    return this.first(YearSpace, {space: number})!.all(Obstacle).length > 0
  }

  noRails(number : number) : boolean {
    return this.first(YearSpace, {space: number})!.all(RailCard).length == 0
  }

  isDamaged(number : number) : boolean {
    return this.first(YearSpace, {space: number})!.all(Damage).length > 0
  }

  moveCargo() : MoveResult {
    let cargo = this.first(Cargo)!

    if(cargo.location == 'none') {
        let railCard = cargo.container(RailCard);
        cargo.location = railCard!.routes['none']
        cargo.updateCoordinates();
    } else if(cargo.location == 'finish') {
        return MoveResult.Safe;
    } else if(cargo.location == 'start') {
        let nl = {number: -1, location: 'none'}
        switch(this.year) {
            case 1930: {nl =  {number: 13, location: 'bl'}; break; }
            case 1957: {nl =  {number: 14, location: 'bl'}; break; }
            case 1984: {nl =  {number: 14, location: 'br'}; break; }
            case 2011: {nl =  {number: 15, location: 'br'}; break; }
        }
        if(this.isBlocked(nl.number)) return MoveResult.Obstacle;
        if(this.noRails(nl.number)) return MoveResult.MismatchedRail;
        if(this.isDamaged(nl.number)) return MoveResult.DamagedRail;

        let rail = this.all(YearSpace).find(x => x.space == nl.number)!.first(RailCard)!

        console.log(rail);
        console.log(nl.location);

        Array.of
        if(rail.routes[nl.location] == undefined) {
            return MoveResult.MissingRail;
        }

        cargo.location = rail.routes[nl.location];
        cargo.updateCoordinates();
        cargo.putInto(rail);
    } else {
        let nl = {number: 0, location: 'none'}
        let cargoSquare = ((cargo._t.parent as RailCard)._t.parent as YearSpace).space;

        console.log(cargoSquare);
        console.log(cargo.location);

        let column1 = [1, 4, 7, 10, 13];
        let column3 = [3, 6, 9, 12, 15];
        if(cargo.location == 'cl') {
            if(column1.includes(cargoSquare)) {
                return MoveResult.OffMap;
            } else {
                nl.number = cargoSquare-1;
            }
        } else if(cargo.location == 'tl' || cargo.location == 'tr') {
            if(cargoSquare <= 3) {
                cargo.location = 'finish';
                return MoveResult.Safe;
            } else {
                nl.number = cargoSquare-3;
            }
        } else if(cargo.location == 'bl' || cargo.location == 'br') {
            if(cargoSquare >= 13) {
                return MoveResult.OffMap;
            } else {
                nl.number = cargoSquare+3;
            }
        } else if(cargo.location == 'cr') {
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
        switch(cargo.location) {
            case 'bl': {nl.location = 'tl'; break; }
            case 'br': {nl.location = 'tr'; break; }
            case 'tl': {nl.location = 'bl'; break; }
            case 'tr': {nl.location = 'br'; break; }
            case 'cl': {nl.location = 'cr'; break; }
            case 'cr': {nl.location = 'cl'; break; }
        }

        console.log(nl.location);

        let rail = this.all(YearSpace).find(x => x.space == nl.number)!.first(RailCard)!

        console.log(rail);

        if(rail.routes[nl.location] == undefined) {
            return MoveResult.MismatchedRail;
        }

        cargo.location = rail.routes[nl.location];
        cargo.updateCoordinates();
        cargo.putInto(rail);
    }

    return MoveResult.Safe;
}
}

export class YearSpace extends Space<MyGame> {
  space: number
  column: number
}

export class Pawn extends Piece<MyGame> {
  color: string
}

export class Damage extends Piece<MyGame> {
  
}

export class Obstacle extends Piece<MyGame> {
  
}

export class Cargo extends Piece<MyGame> {
  location: string //'tl' | 'tr' | 'cl' | 'cr' | 'bl' | 'br' | 'none'
  coords: Coordinate = new Coordinate(0, 0);

  updateCoordinates(): void {
    this.coords = coordsOf(this.location, 10,
      this.location.startsWith("t") ? -10 : 20);
  }
}

export class PlayerHand extends Space<MyGame> {

}

function spaceOf(player: Game27panicPlayer) : number {
  return (player.pawn._t.parent! as YearSpace).space;
}

function yearOf(player: Game27panicPlayer) : number {
  return matYear(player.pawn._t.parent! as YearSpace);
}

function matYear(space: YearSpace): number {
  return space.container(YearMat)!.year
}

function occupied(space : YearSpace) : boolean {
  return space.all(Obstacle).length > 0
}

function movementOf(space : YearSpace) : number {
  return space.container(YearMat)!.movement
}

function buildingOf(player: Game27panicPlayer) : number {
  return player.pawn.container(YearMat)!.building
}

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

export default createGame(Game27panicPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer, whileLoop } = game.flowCommands;

  game.init()

  // year mats
  const years: number[] = [1930, 1957, 1984, 2011]
  const mvmt: number[] = [1, 1, 2, 2]
  const bldg: number[] = [3, 2, 2, 1]
  const colOffset: number[] = [0, 3, 6, 9]

  for (let j = 0; j < 4; j++) {
    const yearMat = game.create(YearMat, 'year' + years[j], {year: years[j], movement: mvmt[j], building: bldg[j]});

    for (let i = -2; i <= 18; i++) {
      yearMat.create(YearSpace, i.toString(), {space: i, column: (i % 3 == 0 ? 3 : i % 3) + colOffset[j]})
    }
    switch(years[j]) {
      case 1930: {
        let start = yearMat.first(YearSpace, {space: 16})!.create(RailCard, 'start1930',
          {rotated: false, letter: "Start", unavailable: false, routes: {'tl': 'none', 'none': 'tl'}}
        );
        start.updateCoordinates()
        let cargo = start.create(Cargo, 'green', {location: 'none'})
        cargo.updateCoordinates()
        break;
      }
      case 1957: {
        let start = yearMat.first(YearSpace, {space: 17})!.create(RailCard, 'start1957',
          {rotated: false, letter: "Start", unavailable: false, routes: {'tl': 'none', 'none': 'tl'}}
        );
        start.updateCoordinates()
        let cargo = start.create(Cargo, 'red', {location: 'none'})
        cargo.updateCoordinates() 
        break;
      }
      case 1984: {  
        let start = yearMat.first(YearSpace, {space: 17})!.create(RailCard, 'start1984',
          {rotated: false, letter: "Start", unavailable: false, routes: {'tr': 'none', 'none': 'tr'}}
        );
        start.updateCoordinates()
        let cargo = start.create(Cargo, 'yellow', {location: 'none'})
        cargo.updateCoordinates()
        break;
      }
      case 2011: {
        let start = yearMat.first(YearSpace, {space: 18})!.create(RailCard, 'start2011',
          {rotated: false, letter: "Start", unavailable: false, routes: {'tr': 'none', 'none': 'tr'}}
        );
        start.updateCoordinates()
        let cargo = start.create(Cargo, 'blue', {location: 'none'})
        cargo.updateCoordinates()
        break;
      }
    }
  }

  let obs1 = Math.floor(Math.random() * 6) + 1
  let obs2 = Math.floor(Math.random() * 6) + 7
  $.year1957.first(YearSpace, {'space': obs1})!.create(Obstacle, 'blocked')
  $.year1984.first(YearSpace, {'space': obs1})!.create(Obstacle, 'blocked')
  $.year2011.first(YearSpace, {'space': obs1})!.create(Obstacle, 'blocked')
  $.year2011.first(YearSpace, {'space': obs2})!.create(Obstacle, 'blocked')


  // players
  var playerNum = 1;
  var playerColors = ['green', 'red', 'yellow', 'blue']
  for (const player of game.players) {
    const mat = game.create(PlayerHand, 'player' + playerNum, { player });
    const pawn = game.create(Pawn, 'player' + playerNum, {color: playerColors[playerNum-1]})

    pawn.putInto($['year' + years[playerNum-1]].all(YearSpace).find(x => x.space == 14)!)

    //mat.onEnter(Token, t => t.showToAll());
    playerNum++;
    player.hand = mat
    player.pawn = pawn
  }

  // build deck
  game.create(Space, 'buildCards');
  for (const buildCard of buildCards) {
    $.buildCards.create(BuildCard, buildCard.type == 'rail' ? buildCard.letter! + ',' + buildCard.damageColumn : 
      buildCard.year! + '', 
      buildCard)
  }
  game.create(Space, 'discard');
  game.create(Space, 'move');
  game.create(Space, 'scraps');
  for (let i = 0; i < 5; i++) {
    $.scraps.create(Token, 'Scraps')
  }
  game.create(Space, 'garbage')
  game.create(Space, 'damage')
  for (let i = 0; i < 12; i++) {
    $.damage.create(Damage, 'Damage')
  }

  // rail cards
  game.create(Space, 'railCards');
  let stacks = new Map<string, RailStack>();
  for (const railCard of railCards) {
    for(let i = 0; i < 4; i++) {
      if(!stacks.has(railCard.letter!)) {
        let rs = $.railCards.create(RailStack, railCard.letter!)
        stacks.set(railCard.letter!, rs)
      }
      let rc = stacks.get(railCard.letter!)!.create(RailCard, railCard.letter!, railCard)
      Object.entries(rc.routes).forEach(([key, value]) => rc.routes[value] = key);
      rc.updateCoordinates()
    }
  }

  /**
   * Define all possible game actions, e.g.:
   */
  game.defineActions({
    drawBuildCard: (player) => action({
      prompt: 'Draw a Build Card'
    }).chooseOnBoard(
      'buildCard', [$.buildCards.first(BuildCard)!],
      { skipIf: 'never' }
    ).do(
      ({ buildCard }) => {
        if(buildCard.type == 'move') {
          // discard and move cargo
          buildCard.putInto($.move)
          let result = game.first(YearMat, {year: buildCard.year})!.moveCargo();
          if (result != MoveResult.Safe) {
            game.finish(undefined, 'crashed')
          } else if (game.all(Cargo, {location: 'finish'}).length == 4) {
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
          // check for damage
          let rails = game.all(YearSpace, {column: buildCard.damageColumn})
            .filter(x => x.all(Cargo).length == 0 && x.all(Damage).length == 0)
          let rail = undefined
          if(rails.length > 0) {
            rail = rails.first(RailCard)
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
        player.scrapsLetter = undefined
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
      'space', game.all(YearSpace).filter(x => !occupied(x) && game.moveArea[movementOf(x)][spaceOf(player)].includes(x.space) && yearOf(player) == matYear(x))
    ).do(({ space }) => {
        player.pawn.putInto(space)
      }
    ).message(
      'You Moved to {{space}}'
    ),

    chooseTradePartner: (player) => action({
      prompt: 'Choose Trade Partner'
    }).chooseOnBoard(
      'partner', game.players.map(x => x.hand).filter(x => x != player.hand && yearOf(player) == yearOf(x.player!))
    ).do(({ partner }) => {
      player.tradePartner = partner
    }),

    trade: (player) => action({
      prompt: 'Trade'
    }).chooseOnBoard(
      'card', player.tradePartner != undefined ? player.hand.all(BuildCard).concat(player.tradePartner.all(BuildCard)) : []
    ).do(({ card }) => {
        if(card._t.parent == player.hand) {
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

    finish: (player) => action({
      prompt: 'Finish',
      condition: player.hand.all(BuildCard).length <= game.handLimit && player.tradePartner != undefined && player.tradePartner.all(BuildCard).length <= game.handLimit
    }).do(() => {
      player.tradePartner = undefined
    }),

    build: (player) => action({
      prompt: 'Build',
      condition: game.players.current()!.pawn._t.parent!.all(RailCard).length == 0
    }).chooseOnBoard(
      'card', () => {
        let letterCounts : Map<string, number> = countBy(player.hand.all(BuildCard), (x : BuildCard) => x.letter);
        return $.railCards.all(RailCard).filter(x => !x.unavailable && 
          letterCounts.get(x.letter)! + player.hand.all(BuildCard, {type: 'wild'}).length >= buildingOf(player))
      }
    ).do(({ card }) => {
      player.buildLetter = card.letter
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
        game.all(YearMat).forEach(x => {
          if (x.year >= yearOf(player)) {
            let yearSpace = x.all(YearSpace).find(x => x.space == spaceOf(player))!
            let railCard = $.railCards.all(RailCard).filter(x => x.letter == player.buildLetter).first(RailCard)!
            if(yearSpace.all(RailCard).length == 0) {
              railCard.putInto(yearSpace)
            }
          }
        })
        $.railCards.all(RailCard).filter(x => x.letter == player.buildLetter).forEach(x => x.unavailable = true)
        player.buildLetter = undefined
      }
    ),

    scraps: (player) => action({
      prompt: 'Build Scraps',
      condition: game.players.current()!.pawn._t.parent!.all(RailCard).length == 0 &&
        $.scraps.all(Token).length > 0 && game.players.current()!.hand.all(BuildCard).length > 0
    }).chooseOnBoard(
      'scraps', $.railCards.all(RailCard).filter(x => x.unavailable)
    ).do(
      ({ scraps }) => {
        scraps.unavailable = false
        scraps.putInto(player.pawn._t.parent!)
        $.scraps.first(Token)!.putInto($.garbage)
        player.scrapsLetter = scraps.letter
      }
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
        $.railCards.all(RailCard).forEach(x => x.rotate())
      }
    ),

    moveAll: (player) => action({
      prompt: 'Move all Cargo',
      condition: player.hand.all(BuildCard).length > 0
    }).do(
      () => {
        player.hand.all(BuildCard).forEach(x => x.putInto($.discard))
        game.all(YearMat).forEach(x => x.moveCargo())
        if (game.all(Cargo, {location: 'finish'}).length == 4) {
          game.finish(undefined, 'win')
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
        rail.unavailable = true
        rail.putInto($.railCards)
      }
    ),

   });

   
  /**
   * Define the game flow, starting with board setup and progressing through all
   * phases and turns, e.g.:
   */
  game.defineFlow(
    () => $.buildCards.shuffle(),
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
          playerActions({ actions: ['drawBuildCard']}),
          whileLoop({while: () => game.players.current()!.hand.all(BuildCard).length > game.handLimit, do: (
            playerActions({ actions: ['discardBuildCard']})
          )}),
          playerActions({ actions: ['timeTravel', 'skip']}),
          playerActions({ actions: ['move', 'skip']}),
          playerActions({ actions: ['chooseTradePartner', 'skip']}),
          whileLoop({while: () => game.players.current()!.tradePartner != undefined, do: (
            playerActions({ actions: ['trade', 'rotate', 'finish']})
          )}),
          playerActions({ actions: ['build', 'scraps', 'repair', 'removeRail', 'moveAll', 'skip']}),
          whileLoop({while: () => game.players.current()!.buildLetter != undefined, do: (
            playerActions({ actions: ['chooseBuildCards', 'rotate']})
          )}),
          whileLoop({while: () => game.players.current()!.scrapsLetter != undefined, do: (
            playerActions({ actions: ['discardBuildCard']})
          )}),
        ]
      })
    )
  );
});
// 