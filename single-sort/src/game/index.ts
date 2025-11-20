import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';

import { Component } from "./component/component.js";

import { Cardboard } from "./component/cardboard.js";
import { Plastic } from "./component/plastic.js";
import { Glass } from "./component/glass.js";
import { Metal } from "./component/metal.js";

import { Hand } from "./hand.js";
import { Goal } from "./component/goal.js";

export class SingleSortPlayer extends Player<MyGame, SingleSortPlayer> {
  public hand: Hand;
  public recycled: boolean = false;
  public take: Cardboard[] = [];
}

export class PlayersSpace extends Space<MyGame> {
 
}

export class MyGame extends Game<MyGame, SingleSortPlayer> {
}

export class Table extends Space<MyGame> {
}

export class Box extends Space<MyGame> {
}

export class Trash extends Space<MyGame> {
}

export class Junk extends Piece<MyGame> {
}

export default createGame(SingleSortPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, forLoop, whileLoop, eachPlayer, ifElse } = game.flowCommands;

  const ROWS = 9;
  const COLUMNS = 15;
  const CELL_SIZE = 100;

  const windowWidth = COLUMNS * CELL_SIZE + 200;
  const windowHeight = ROWS * CELL_SIZE + 100;

  enum State {
    Take,
    Collect,
    Rot,
    RotSwap,
    RecycleOrReduce,
    RepairOrRepurpose,
    ReuseOrReturn,
    CleanUp,
    EndTurn,
  }

  function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length;
    let randomIndex: number;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }
  
  
  let players = game.players.length;

  const table = game.create(Table, 'table');
  const box = game.create(Box, 'box');
  const trash = game.create(Trash, 'trash');

  const playersSpace = game.create(PlayersSpace, 'playersSpace')
  for(var i = 0; i < game.players.length; i++) {
    const playerSpace = playersSpace.create(Hand, 'hand' + i, {player: game.players[i]});
    game.players[i].hand = playerSpace
  }


  let state = State.Take;
  let rotSelection: Component | undefined = undefined;

  const cleanCardboards: number[] = [7, 6, 3, 2, 1, 1, 1];
  const dirtyCardboards: number[] = [3, 2, 1, 1, 1, 1];
  for(let v = 1; v <= cleanCardboards.length; v++) {
    for(let i = 0; i < cleanCardboards[v-1]; i++) {
      Cardboard.createGreenCleanCardboard(box, v);
      Cardboard.createBlueCleanCardboard(box, v);
      Cardboard.createYellowCleanCardboard(box, v);
    }
  }
  for(let v = 1; v <= dirtyCardboards.length; v++) {
    for(let i = 0; i < dirtyCardboards[v-1]; i++) {
      Cardboard.createGreenDirtyCardboard(box, v);
      Cardboard.createBlueDirtyCardboard(box, v);
      Cardboard.createYellowDirtyCardboard(box, v);
    }
  }

  for(let i = 0; i < 10; i++) {
    Plastic.createGreenPlastic(box);
    Plastic.createBluePlastic(box);
    Plastic.createYellowPlastic(box);
  }

  for(let i = 0; i < 4; i++) {
    Glass.createGreenGlass(box);
    Glass.createBlueGlass(box);
    Glass.createYellowGlass(box);
  }

  Metal.createGoldMetal(box);
  Metal.createSilverMetal(box);
  Metal.createBronzeMetal(box);

  box.shuffle();

  box.all(Piece).forEach(c => c.putInto(table));

  // stick something random in the box
  box.create(Junk, 'junk');









  




  
  game.defineActions({

    collect: (player) => action({
      prompt: 'Collect',
    }).chooseOnBoard(
      'cardboard', table.all(Cardboard, {faceUp: false}),
      { skipIf: 'never' }
    ).do(({ cardboard }) => {
      cardboard.flip()
      cardboard.putInto(player.hand)
      player.take.push(cardboard);
      game.message(game.players.length.toString());
      game.message(player.take.length.toString());
    }),

    recycle: (player) => action({
      prompt: 'Recycle',
    }).chooseOnBoard(
      'recycle', player.hand.all(Component),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'what', ({recycle}) => table.all(Component).filter(x => 
        (recycle instanceof Cardboard && x instanceof Cardboard && x.color != recycle.color && x.face == recycle.face && x.faceUp) ||
        (recycle instanceof Plastic && x instanceof Plastic && x.color != recycle.color && x.face == recycle.face) ||
        (recycle instanceof Glass && x instanceof Glass && x.color != recycle.color)
      ),
      { skipIf: 'never' }
    ).confirm(
       ({ recycle, what }) => 'Confirm Recycle'
    ).do(({ recycle, what }) => {
      recycle.putInto(table);
      what.putInto(player.hand);
      player.recycled = true;
    }),

    repairOrReduce: (player) => action({
      prompt: 'Repair or Reduce',
    }).chooseOnBoard(
      'cardboard', player.hand.all(Cardboard),
      { min: 1, max: player.hand.all(Cardboard).length, skipIf: 'never', validate: ({cardboard}) => {
        return (cardboard.length > 1 && 
                cardboard.filter(x => x.color == cardboard[0].color).length == cardboard.length &&
                table.all(Plastic, {color: cardboard[0].color, face: cardboard.reduce((sum, cb) => sum + cb.face, 0)}).filter(x => x.face != 6).length > 0
              ) ||
              (
                cardboard.length == 1                
              );
      } }
    ).chooseOnBoard(
      'what', ({cardboard}) => cardboard.length > 1 ? 
        table.all(Plastic, {color: cardboard[0].color, face: cardboard.reduce((sum, cb) => sum + cb.face, 0)}).filter(x => x.face != 6) : 
        table.all(Plastic, {color: cardboard[0].color, face: cardboard[0].face}).filter(x => x.face != 6).map(x => x as Component)
          .concat(table.all(Cardboard, {color: cardboard[0].color, faceUp: true}).filter(x => x.face < cardboard[0].face)),
      { min: 1, max: ({cardboard}) => cardboard.length > 1 ? 1 : 3, skipIf: 'never', validate: ({cardboard, what}) => {
        return  (
                  what[0] instanceof Cardboard && 
                  what.filter(x => x instanceof Cardboard).length == what.length && 
                  what.reduce((sum, cb) => sum + (cb as Cardboard).face, 0) == cardboard[0].face
                ) 
                ||
                (
                  what[0] instanceof Plastic &&
                  what.length == 1 &&
                  what[0].face == cardboard.reduce((sum, cb) => sum + cb.face, 0)
                )
      } }
    ).confirm(
       ({ cardboard, what }) => what[0] instanceof Plastic ? 'Confirm Reduce' : 'Confirm Repair'
    ).do(({ cardboard, what }) => {
      cardboard.forEach( x => x.putInto(table) );
      what.forEach( x => x.putInto(player.hand) );
    }),

    rethinkOrRepurpose: (player) => action({
      prompt: 'Rethink or Repurpose',
    }).chooseOnBoard(
      'plastic', player.hand.all(Plastic),
      { min: 1, max: game.players.length >= 5 ? 3 : 2, skipIf: 'never', validate: ({plastic}) => {
        return plastic.length != 2 || game.players.length >= 3 || 
          (plastic[0].color == plastic[1].color && table.all(Glass, {color: plastic[0].color}).length > 0);
      } }
    ).chooseOnBoard(
      'what', ({plastic}) => plastic.length == 2 && plastic[0].color == plastic[1].color ? 
        table.all(Glass, {color: plastic[0].color}).concat(plastic)
        : plastic,
      { skipIf: 'never', validate: ({what}) => {
        return true;
      } }
    ).confirm(
       ({ plastic, what }) => what instanceof Glass ? 'Confirm Repurpose' : 'Confirm Rethink'
    ).do(({ plastic, what }) => {
      plastic.forEach
      if(what instanceof Glass) {
        plastic.forEach(x => {
          x.putInto(table);
        });
        what.putInto(player.hand);
      }
    }),

    reuseOrReturn: (player) => action({
      prompt: 'Reuse or Return',
    }).chooseOnBoard(
      'glass', player.hand.all(Glass),
      { min: 1, max: game.players.length <= 3 ? 3 : 2, skipIf: 'never', validate: ({glass}) => {
        return (glass.length == 1 && table.all(Plastic, {color: glass[0].color, face: 6}).length > 0) ||
              (game.players.length <= 3 && glass.length == 3 && table.all(Metal).length > 0) ||
              (game.players.length > 3 && glass.length == 2 && table.all(Metal).length > 0);
      } }
    ).chooseOnBoard(
      'what', ({glass}) => glass.length > 1 && glass[0].color == glass[1].color ? 
        table.all(Metal)
        : table.all(Plastic, {color: glass[0].color, face: 6}),
      { skipIf: 'never', validate: ({what}) => {
        return true;
      } }
    ).confirm(
       ({ glass, what }) => what instanceof Metal ? 'Confirm Return' : 'Confirm Reuse'
    ).do(({ glass, what }) => {
      glass.forEach(x => x.putInto(table));
      what.putInto(player.hand);
    }),

    cleanup: (player) => action({
      prompt: 'Clean Up',     
    }).chooseOnBoard(
      'garbage', player.hand.all(Component).filter(x => !(x instanceof Plastic) || (x as Plastic).face != 4),
      { skipIf: 'never', number: player.hand.all(Component).filter(x => !(x instanceof Plastic) || (x as Plastic).face != 4).length-10 }
    ).do(({ garbage }) => {
      garbage.forEach(x => x.putInto(table));
    }),

    skip: (player) => action({
      prompt: 'Skip',
    }),

  });

  game.defineFlow(
    
    whileLoop({while: () => (table.all(Cardboard, {faceUp: false}).length > 0), do: ([
      eachPlayer({
        name: 'turn', do: [
          // COLLECT
          () => game.players.current()!.recycled = false,
          whileLoop({while: () => ( table.all(Cardboard, {faceUp: false}).length > 0 && 
            (
              (game.players.length == 1 && game.players.current()!.take.length < 2) || 
              (game.players.current()!.take.length == 0 || !game.players.current()!.take[game.players.current()!.take.length-1].clean)
            )
          ), do: ([
            playerActions({ actions: ['collect']}),
          ])}),
          () => game.players.current()!.take = [],
          
          // RECYCLE
          playerActions({ actions: ['recycle', 'skip']}), 
          ifElse({
            if: () => !game.players.current()!.recycled, do: [
              
              // SORT
              // 1. Cardboard Actions
              playerActions({ actions: ['repairOrReduce', 'skip']}),
              // 2. Plastic Actions
              playerActions({ actions: ['rethinkOrRepurpose', 'skip']}),
              // 3. Glass Actions
              playerActions({ actions: ['reuseOrReturn', 'skip']}),
            ]
          }),

          // CLEANUP
          () => game.players.current()!.hand.all(Cardboard, {clean: false}).forEach(x => x.putInto(trash)),
          ifElse({
            if: () => game.players.current()!.hand.all(Component).filter(x => !(x instanceof Plastic) || (x as Plastic).face != 4).length > 10, do: [
              playerActions({ actions: ['cleanup']}),
            ]
          }),
        ]   
      })
    ])})
  )

});
