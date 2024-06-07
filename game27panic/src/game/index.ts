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
}

export class RailCard extends Piece<MyGame> {
  rotated: boolean = false
  letter: string = ""
  routes: Record<string, string> = {}
  flippedRoutes: Record<string, string> = {}
  unavailable: boolean = false;
  color: 'red' | 'blue';
}

export class YearMat extends Space<MyGame> {
  year: number
  movement: number
  building: number
}

export class YearSpace extends Space<MyGame> {
  space: number
}

export class Pawn extends Piece<MyGame> {
  
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

    for (let i = 1; i <= 15; i++) {
      yearMat.create(YearSpace, i.toString(), {space: i})
    }
  }


  // players
  var playerNum = 1;
  for (const player of game.players) {
    const mat = game.create(PlayerHand, 'player' + playerNum, { player });
    const pawn = game.create(Pawn, 'player' + playerNum)

    pawn.putInto($['year' + years[playerNum-1]].all().at(13)!)

    //mat.onEnter(Token, t => t.showToAll());
    playerNum++;
    player.hand = mat
    player.pawn = pawn
  }

  // build deck
  game.create(Space, 'buildCards');
  for (const buildCard of buildCards) {
    $.buildCards.create(BuildCard, buildCard.letter! + ',' + buildCard.damageColumn, buildCard)
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
      $.railCards.create(RailCard, railCard.letter!, railCard)
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
        } else {
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
            railCard.putInto(x.all(YearSpace).at(spaceOf(player)-1)!)
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
          $.buildCards.first(BuildCard)?.putInto(player.hand)
        }
      }
    },
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