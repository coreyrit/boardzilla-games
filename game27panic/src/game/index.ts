import {
  createGame,
  Player,
  Game,
  Space,
  Piece,
} from '@boardzilla/core';

import { buildCards } from './build-cards.js';

export class Game27panicPlayer extends Player<MyGame, Game27panicPlayer> {
  /**
   * Any properties of your players that are specific to your game go here
   */
  space: number = 0; // as an example
  year: number = 2011
  hand: PlayerHand
  pawn: Pawn
};

export class MyGame extends Game<MyGame, Game27panicPlayer> {
  /**
   * Any overall properties of your game go here
   */
  phase: number = 1; // as an example
}

/**
 * Define your game's custom pieces and spaces.
 */
export class Token extends Piece<MyGame> { // as an example
  color: 'red' | 'blue';
}

export class BuildCard extends Piece<MyGame> {
  type: 'rail' | 'move' | 'wild'
  rotated: boolean = false
  letter: string = ""
  routes: Record<string, string> = {}
  flippedRoutes: Record<string, string> = {}
  damageColumn: number = 0
}

export class RailCard extends Piece<MyGame> {

}

export class YearSpace extends Space<MyGame> {
  id: number
  year: number
}

export class Pawn extends Piece<MyGame> {
  
}

export class PlayerHand extends Space<MyGame> {

}

export default createGame(Game27panicPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;

  
  
  // year mats
  const years: number[] = [1930, 1957, 1984, 2011]
  for (const year of years) {
    const yearMat = game.create(Space, 'year' + year);
    for (let i = 1; i <= 15; i++) {
      yearMat.create(YearSpace, 'year' + i.toString(), {id: i, year: year})
    }
  }

  /**
   * Create your game's layout and all included pieces, e.g.:
   */
  var playerNum = 1;
  for (const player of game.players) {
    const mat = game.create(PlayerHand, 'player' + playerNum, { player });
    const pawn = game.create(Pawn, 'player' + playerNum)

    pawn.putInto($.year1930.all().at(13)!)

    //mat.onEnter(Token, t => t.showToAll());
    playerNum++;
    player.space = 14
    player.year = 2011
    player.hand = mat
    player.pawn = pawn
  }

  game.create(Space, 'buildCards');
  for (const buildCard of buildCards) {
    $.buildCards.create(BuildCard, buildCard.letter! + ',' + buildCard.damageColumn, buildCard)
  }

  // game.create(Space, 'pool');
  // $.pool.onEnter(Token, t => t.hideFromAll());
  // $.pool.createMany(game.setting('tokens') - 1, Token, 'blue', { color: 'blue' });
  // $.pool.create(Token, 'red', { color: 'red' });



  let move1 : Record<number, number[]> = {};
  let move2 : Record<number, number[]> = {};
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
    
    move1[i] = valid1.filter(x => x >= 1 && x<= 15)
    move2[i] = valid1.concat(valid2).filter(x => x >= 1 && x<= 15)
  }


  /**
   * Define all possible game actions, e.g.:
   */
  game.defineActions({
    drawBuildCard: () => action({
      prompt: 'Draw a Build Card'
    }).chooseOnBoard(
      'buildCard', [$.buildCards.first(BuildCard)!],
      { skipIf: 'never' }
    ).do(
      ({ buildCard }) => buildCard.putInto($.player1)
    ).message(
      'You drew a {{buildCard}}'
    ),

    timeTravel: (player) => action({
      prompt: 'Travel through Time'
    }).chooseOnBoard(
      'space', $.year1930.all(YearSpace).filter(x => x.id == player.space && player.year != 1930)
        .concat($.year1957.all(YearSpace).filter(x => x.id == player.space && player.year != 1957))
        .concat($.year1984.all(YearSpace).filter(x => x.id == player.space && player.year != 1984))
        .concat($.year2011.all(YearSpace).filter(x => x.id == player.space && player.year != 2011))
    ).do(({ space }) => {
        player.pawn.putInto(space)
        player.year = space.year
        player.space = space.id
      }
    ).message(
      'You traveled to {{space}}'
    ),

    move: (player) => action({
      prompt: 'Move'
    }).chooseOnBoard(
      'space', $.year1930.all(YearSpace).filter(x => move1[player.space].includes(x.id) && player.year == 1930)
        .concat($.year1957.all(YearSpace).filter(x => move1[player.space].includes(x.id) && player.year == 1957))
        .concat($.year1984.all(YearSpace).filter(x => move2[player.space].includes(x.id) && player.year == 1984))
        .concat($.year2011.all(YearSpace).filter(x =>move2[player.space].includes(x.id) && player.year == 2011))
    ).do(({ space }) => {
        player.pawn.putInto(space)
        player.space = space.id
      }
    ).message(
      'You Moved to {{space}}'
    ),

    skip: () => action({
      prompt: 'Skip'
    })

    // take: player => action({
    //   prompt: 'Choose a token',
    // }).chooseOnBoard(
    //   'token', $.pool.all(Token),
    // ).move(
    //   'token', player.my('mat')!
    // ).message(
    //   `{{player}} drew a {{token}} token.`
    // ).do(({ token }) => {
    //   if (token.color === 'red') {
    //     game.message("{{player}} wins!", { player });
    //     game.finish(player);
    //   }
    // }),
   });

  /**
   * Define the game flow, starting with board setup and progressing through all
   * phases and turns, e.g.:
   */
  game.defineFlow(
    () => $.buildCards.shuffle(),
    () => {
      for (const player of game.players) {
        for(let i = 0; i < 5; i++) {
          $.buildCards.first(BuildCard)?.putInto(player.hand)
        }
      }
    },
    playerActions({ actions: ['drawBuildCard']}),
    playerActions({ actions: ['timeTravel', 'skip']}),
    playerActions({ actions: ['move', 'skip']}),
    playerActions({ actions: []}),
    // () => $.pool.shuffle(),
    // loop(
    //   eachPlayer({
    //     name: 'player'
    //     do: playerActions({
    //       actions: ['take']
    //     }),
    //   })
    // )
  );
});
// 