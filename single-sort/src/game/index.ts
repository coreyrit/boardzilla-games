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

    collectCardboard: (player) => action({
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

    recycleChoice: (player) => action({
      prompt: 'Recycle',
    }).chooseOnBoard(
      'component', player.hand.all(Component),
      { skipIf: 'never' }
    ).do(({ component }) => {
      if(component != undefined) {
        game.followUp({name: 'recycleWhat', args: {recycle: component}})
      }
    }),

    recycleWhat: (player) =>  action<{recycle: Component}>({
      prompt: 'Recycle',
    }).chooseOnBoard(
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

    repairOrReduceCardboard: (player) => action({
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
    ).do(({ cardboard }) => {
      if(cardboard.length > 1) {
        game.followUp({name: 'reduceWhat', args: {reduce: cardboard}})
      } else if(cardboard.length == 1) {
        if(table.all(Plastic, {color: cardboard[0].color, face: cardboard.reduce((sum, cb) => sum + cb.face, 0)}).filter(x => x.face != 6).length > 0) {
          game.followUp({name: 'repairOrReduceWhat', args: {repairOrReduce: cardboard[0]}})
        } else {
          game.followUp({name: 'repairWhat', args: {repair: cardboard[0]}})
        }        
      }
    }),

    reduceWhat: (player) =>  action<{reduce: Cardboard[]}>({
      prompt: 'Reduce',
    }).chooseOnBoard(
      'what', ({reduce}) => table.all(Plastic, {color: reduce[0].color, face: reduce.reduce((sum, cb) => sum + cb.face, 0)}).filter(x => x.face != 6),
      { skipIf: 'never', validate: ({what, reduce}) => {
        return what.face == reduce.reduce((sum, cb) => sum + cb.face, 0)
      } } 
    ).do(({ reduce, what }) => {
      reduce.forEach(x => x.putInto(table));
      what.putInto(player.hand);
    }),

    repairWhat: (player) =>  action<{repair: Cardboard}>({
      prompt: 'Repair',
    }).chooseOnBoard(
      'what', ({repair}) => table.all(Cardboard, {color: repair.color, faceUp: true}).filter(x => x.face <= repair.face)
      ,
      { min: 1, max: 3, skipIf: 'never', validate: ({what, repair}) => {
        return repair.face == what.reduce((sum, cb) => sum + cb.face, 0)
      } } 
    ).do(({ repair, what }) => {
      what.forEach(x => x.putInto(table));
      repair.putInto(player.hand);
    }),

    repairOrReduceWhat: (player) => action<{repairOrReduce: Cardboard}>({
      prompt: 'Repair or Reduce',
    }).chooseOnBoard(
      'what', ({repairOrReduce}) => table.all(Cardboard, {color: repairOrReduce.color, faceUp: true}).filter(x => x.face <= repairOrReduce.face).map(x => x as Component)
        .concat(table.all(Plastic, {color: repairOrReduce.color, face: repairOrReduce.face}).filter(x => x.face != 6).map(x => x as Component)
      ),
      { min: 1, max: 3, skipIf: 'never', validate: ({what, repairOrReduce}) => {
        return (what.length >= 1 && 
                what.filter(x => x instanceof Cardboard).length == what.length && 
                repairOrReduce.face == what.reduce((sum, cb) => sum + (cb as Cardboard).face, 0)) ||
               (what.length == 1 && what[0] instanceof Plastic && (what[0] as Plastic).face == repairOrReduce.face)
      } } 
    ).do(({ repairOrReduce, what }) => {
      repairOrReduce.putInto(table);
      what.forEach(x => x.putInto(player.hand));
    }),

    rethinkOrRepurposePlastic: (player) => action({
      prompt: 'Rethink or Repurpose',
    }).chooseOnBoard(
      'plastic', player.hand.all(Plastic),
      { min: 1, max: game.players.length >= 5 ? 3 : 2, skipIf: 'never', validate: ({plastic}) => {
        return true;
      } }
    ).do(({ plastic }) => {
      if(plastic.length == 2 && plastic[0].color == plastic[1].color && game.players.length < 3 && table.all(Glass, {color: plastic[0].color}).length > 0) {
        game.followUp({name: 'repurposeWhat', args: {repurpose: plastic}})
      } else if(plastic.length == 2 && plastic[0].color == plastic[1].color && game.players.length >= 3 && table.all(Glass, {color: plastic[0].color}).length > 0) {
        game.followUp({name: 'rethinkOrRepurposeWhat', args: {rethinkOrRepurpose: plastic}})
      } else {
        game.followUp({name: 'rethinkWhat', args: {rethink: plastic}})
      }
    }),

    rethinkWhat: (player) => action<{rethink: Plastic[]}>({
      prompt: 'Rethink',
    }).confirm(
       ({ rethink }) => 'Confirm Rethink'
    ).do(({ rethink }) => {
      rethink.forEach(x => x.roll(game));
    }),

    repurposeWhat: (player) => action<{repurpose: Plastic[]}>({
      prompt: 'Repurpose',
    }).chooseOnBoard(
      'what', ({repurpose}) => table.all(Glass, {color: repurpose[0].color}),
      { skipIf: 'never', validate: ({what}) => {
        return true;
      } }
    ).do(({ repurpose, what }) => {
      repurpose.forEach(x => x.roll(game));
      what.putInto(player.hand);
      repurpose.forEach(x => x.putInto(table));
    }),

    rethinkOrRepurposeWhat: (player) => action<{rethinkOrRepurpose: Plastic[]}>({
      prompt: 'Rethink or Repurpose',
    }).chooseOnBoard(
      'what', ({rethinkOrRepurpose}) => table.all(Glass, {color: rethinkOrRepurpose[0].color})
        .concat(rethinkOrRepurpose),
      { skipIf: 'never', validate: ({what}) => {
        return true;
      } }
    ).confirm(
       ({ rethinkOrRepurpose, what }) => what instanceof Glass ? 'Repurpose?' : 'Rethink?'
    ).do(({ rethinkOrRepurpose, what }) => {
      rethinkOrRepurpose.forEach(x => x.roll(game));
      if(what instanceof Glass) {
        what.putInto(player.hand);
        rethinkOrRepurpose.forEach(x => x.putInto(table));
      }
    }),

    skip: (player) => action({
      prompt: 'Skip',
    }),

  });

  game.defineFlow(
    
    loop(
      eachPlayer({
        name: 'turn', do: [
          // Collect
          () => game.players.current()!.recycled = false,
          whileLoop({while: () => (
            (game.players.length == 1 && game.players.current()!.take.length < 2) || 
            (game.players.current()!.take.length == 0 || !game.players.current()!.take[game.players.current()!.take.length-1].clean)
          ), do: ([
            playerActions({ actions: ['collectCardboard']}),
          ])}),
          () => game.players.current()!.take = [],
          // Recycle
          playerActions({ actions: ['recycleChoice', 'skip']}),
          // Sort
          ifElse({
            if: () => !game.players.current()!.recycled, do: [
              // Cardboard Actions
              playerActions({ actions: ['repairOrReduceCardboard', 'skip']}),

              // Plastic Actions
              playerActions({ actions: ['rethinkOrRepurposePlastic', 'skip']}),
            ]
          }),
        ]   
      })
    )
  )

});
