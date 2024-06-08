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
  handLimit: number = 6
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

export class RailCard extends Piece<MyGame> {
  rotated: boolean = false
  letter: string = ""
  routes: Record<string, string> = {}
  flippedRoutes: Record<string, string> = {}
  unavailable: boolean = false;  
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
    return false;
  }

  noRails(number : number) : boolean {
    return this.all(YearSpace).find(x => x.space == number)!.all(RailCard).length == 0
  }

  isDamaged(number : number) : boolean {
    return false;
  }

  moveCargo() : MoveResult {
    let cargo = this.first(Cargo)!

    if(cargo.location == 'none') {
        cargo.location = 'start';
        // cargo.setPosition(cargo.x, cargo.y-20, cargo.width, cargo.height);
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
        // var pt = rail.getLocationPoint(cargoLocation);
        // cargo.setPosition(rail.x+pt.x-7, rail.y+pt.y, 15f, 15f);
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
                // cargo.setPosition(cargo.x, cargo.y-20, cargo.width, cargo.height);
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
        
        // var pt = rail.getLocationPoint(cargoLocation);
        // cargo.setPosition(rail.x+pt.x-7, rail.y+pt.y, 15f, 15f);
        cargo.putInto(rail);
    }
    return MoveResult.Safe;
}
}

export class YearSpace extends Space<MyGame> {
  space: number
}

export class Pawn extends Piece<MyGame> {
  
}

export class Cargo extends Piece<MyGame> {
  location: string //'tl' | 'tr' | 'cl' | 'cr' | 'bl' | 'br' | 'none'
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
  return (space._t.parent as YearMat).year
}

function occupied(space : YearSpace) : boolean {
  return false //space.all().length > 0
}

function movementOf(space : YearSpace) : number {
  return (space._t.parent! as YearMat).movement;
}

function buildingOf(player: Game27panicPlayer) : number {
  return ((player.pawn._t.parent! as YearSpace)._t.parent as YearMat).building;
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

  // year mats
  const years: number[] = [1930, 1957, 1984, 2011]
  const mvmt: number[] = [1, 1, 2, 2]
  const bldg: number[] = [3, 2, 2, 1]
  for (let j = 0; j < 4; j++) {
    const yearMat = game.create(YearMat, 'year' + years[j], {year: years[j], movement: mvmt[j], building: bldg[j]});

    for (let i = -2; i <= 18; i++) {
      yearMat.create(YearSpace, i.toString(), {space: i})
    }
    switch(years[j]) {
      case 1930: {
        let start = yearMat.all(YearSpace).find(x => x.space == 16)!.create(RailCard, 'start1930',
          {rotated: false, letter: "Start", unavailable: false}
        );
        start.create(Cargo, 'green', {location: 'none'})
        break;
      }
      case 1957: {
        let start = yearMat.all(YearSpace).find(x => x.space == 17)!.create(RailCard, 'start1957',
          {rotated: false, letter: "Start", unavailable: false}
        );
        start.create(Cargo, 'red', {location: 'none'})
        break;
      }
      case 1984: {  
        let start = yearMat.all(YearSpace).find(x => x.space == 17)!.create(RailCard, 'start1984',
          {rotated: false, letter: "Start", unavailable: false}
        );
        start.create(Cargo, 'yellow', {location: 'none'})
        break;
      }
      case 2011: {
        let start = yearMat.all(YearSpace).find(x => x.space == 18)!.create(RailCard, 'start2011',
          {rotated: false, letter: "Start", unavailable: false}
        );
        start.create(Cargo, 'blue', {location: 'none'})
        break;
      }
    }
  }


  // players
  var playerNum = 1;
  for (const player of game.players) {
    const mat = game.create(PlayerHand, 'player' + playerNum, { player });
    const pawn = game.create(Pawn, 'player' + playerNum)

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
  game.create(Space, 'scraps');
  for (let i = 0; i < 5; i++) {
    $.scraps.create(Token, 'Scraps')
  }
  game.create(Space, 'garbage')

  // rail cards
  game.create(Space, 'railCards');
  for (const railCard of railCards) {
    for(let i = 0; i < 4; i++) {
      let rc = $.railCards.create(RailCard, railCard.letter!, railCard)
      Object.entries(rc.routes).forEach(([key, value]) => rc.routes[value] = key);
      Object.entries(rc.flippedRoutes).forEach(([key, value]) => rc.flippedRoutes[value] = key);
    }
  }

  // valid movements
  let moveArea : Record<number, Record<number, number[]>> = {1: {}, 2: {}};
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
    }
    if(i % 3 == 1 || i % 3 == 2) {
      valid1.push(i+1)
      
      valid2.push(i-2)
      valid2.push(i+4)
    }
    
    moveArea[1][i] = valid1.filter(x => x >= 1 && x<= 15)
    moveArea[2][i] = valid1.concat(valid2).filter(x => x >= 1 && x<= 15)
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
          buildCard.putInto($.discard)
          let result = game.all(YearMat).find(x => x.year == buildCard.year)?.moveCargo();
          if (result != MoveResult.Safe) {
            game.finish(undefined, 'crashed')
          }
        } else {
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
      'space', game.all(YearSpace).filter(x => !occupied(x) && moveArea[movementOf(x)][spaceOf(player)].includes(x.space) && yearOf(player) == matYear(x))
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
        return $.railCards.all(RailCard).filter(x => !x.unavailable && letterCounts.get(x.letter)! >= buildingOf(player))
      }
    ).do(({ card }) => {
      player.buildLetter = card.letter
    }).message(
      'You built {{card}}'
    ),

    chooseBuildCards: (player) => action({
      prompt: 'Choose Build Cards',
    }).chooseOnBoard(
      'buildCards', player.hand.all(BuildCard).filter(x => x.letter == player.buildLetter), {number: buildingOf(player)}
    ).do(
      ({ buildCards }) => {
        buildCards.forEach(x => x.putInto($.discard))
        game.all(YearMat).forEach(x => {
          if (x.year >= yearOf(player)) {
            let railCard = $.railCards.all(RailCard).filter(x => x.letter == player.buildLetter).first(RailCard)!
            railCard.putInto(x.all(YearSpace).find(x => x.space == spaceOf(player))!)
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
            playerActions({ actions: ['trade', 'finish']})
          )}),
          playerActions({ actions: ['build', 'scraps', 'skip']}),
          whileLoop({while: () => game.players.current()!.buildLetter != undefined, do: (
            playerActions({ actions: ['chooseBuildCards']})
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