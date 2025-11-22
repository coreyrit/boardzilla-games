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
import { Score } from "./score.js";
import { Goal } from "./component/goal.js";

export class SingleSortPlayer extends Player<MyGame, SingleSortPlayer> {
  public hand: Hand;
  public score: Score;
  public recycled: boolean = false;
  public take: Cardboard[] = [];
}

export class PlayersSpace extends Space<MyGame> {
 
}

export class MyGame extends Game<MyGame, SingleSortPlayer> {
  public isOver: boolean = false;
}

export class Table extends Space<MyGame> {
}

export class Box extends Space<MyGame> {
}

export class Trash extends Space<MyGame> {
}

export class TheVoid extends Space<MyGame> {
}

export class Junk extends Piece<MyGame> {
}

export class Reference extends Space<MyGame> {
}
export class TurnReference extends Space<MyGame> {
}
export class ScoreReference extends Space<MyGame> {
}
export class SoloTurnReference extends Space<MyGame> {
}
export class SoloScoreReference extends Space<MyGame> {
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
  const reference = game.create(Reference, 'reference');
  const turnRef = game.players.length == 1 ? reference.create(SoloTurnReference, 'turnRef') : reference.create(TurnReference, 'turnRef');
  const scoreRef = game.players.length == 1 ? reference.create(SoloScoreReference, 'scoreRef') : reference.create(ScoreReference, 'scoreRef');
  const theVoid = game.create(TheVoid, 'theVoid');

  // I need some temporary dice in the void
  theVoid.create(Plastic, "dummyPlastic1");
  theVoid.create(Plastic, "dummyPlastic2");
  theVoid.create(Plastic, "dummyPlastic3");

  // goals
  theVoid.create(Goal, 'goal1', {targetColor: 'darkgreen', targetNumbers: [1, 2]});
  theVoid.create(Goal, 'goal2', {targetColor: 'darkgreen', targetNumbers: [3, 4]});
  theVoid.create(Goal, 'goal3', {targetColor: 'blue', targetNumbers: [1, 2]});
  theVoid.create(Goal, 'goal4', {targetColor: 'blue', targetNumbers: [3, 4]});
  theVoid.create(Goal, 'goal5', {targetColor: 'yellow', targetNumbers: [1, 2]});
  theVoid.create(Goal, 'goal6', {targetColor: 'yellow', targetNumbers: [3, 4]});
  theVoid.shuffle();

  // players
  const playersSpace = game.create(PlayersSpace, 'playersSpace')
  for(var i = 0; i < game.players.length; i++) {
    const hand = playersSpace.create(Hand, 'hand' + i, {player: game.players[i]});
    const score = hand.create(Score, 'score' + i, {player: game.players[i]});
    game.players[i].hand = hand
    game.players[i].score = score

    if(game.players.length > 1) {
      const goal = theVoid.top(Goal)!;
      goal.showOnlyTo(game.players[i]);
      goal.putInto(hand);
    }
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
    }).message(`{{player}} collects a {{cardboard}}.`),

    discardOne: (player) => action({
      prompt: 'Discard One',
    }).chooseOnBoard(
      'cardboard', player.take,
      { skipIf: 'never' }
    ).do(({ cardboard }) => {
      cardboard.putInto(table)
    }).message(`{{player}} discards {{cardboard}}.`),

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
    }).message(`{{player}} recycles a {{recycle}} into a {{what}}.`),

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
          .concat(table.all(Cardboard, {color: cardboard[0].color, faceUp: true}).filter(x => x.face <= cardboard[0].face)),
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
      game.message(`{{player}} {{action}} {{cardboard}} into {{what}}.`, 
        {player: player, cardboard: cardboard, what: what, action: what[0] instanceof Plastic ? 'reduces' : 'repairs' });
    }),

    rethinkOrRepurpose: (player) => action({
      prompt: 'Rethink or Repurpose',
    }).chooseOnBoard(
      'plastic', player.hand.all(Plastic),
      { min: 1, max: game.players.length >= 5 ? 3 : 2, skipIf: 'never', validate: ({plastic}) => {
        return plastic.length == 1 || 
          (plastic.length == 2 && plastic[0].color == plastic[1].color && table.all(Glass, {color: plastic[0].color}).length > 0) ||
          (game.players.length >= 3 && plastic.length == 2 && plastic[0].color != plastic[1].color) ||
          (game.players.length >= 5 && plastic.length == 3 && plastic[0].color != plastic[1].color && plastic[1].color != plastic[2].color && plastic[0].color != plastic[2].color);
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

      // get the dummy dice from the void
      const before = theVoid.all(Plastic).slice(0, plastic.length);
      for(let i = 0; i < plastic.length; i++) {
        before[i].face = plastic[i].face;
        before[i].color = plastic[i].color;
      }

      plastic.forEach(x => x.roll(game)); 
      if(what instanceof Glass) {
        plastic.forEach(x => x.putInto(table));
        what.putInto(player.hand);
      }
      game.message(`{{player}} {{action}} {{before}} into {{what}}.`, 
        {player: player, before: before, what: what instanceof Glass ? what : plastic, 
          action: what instanceof Glass ? 'repurposes' : 'rethinks' });
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
      'what', ({glass}) => glass.length > 1 ? 
        table.all(Metal) : table.all(Plastic, {color: glass[0].color, face: 6}),
      { skipIf: 'never', validate: ({what}) => {
        return true;
      } }
    ).confirm(
       ({ glass, what }) => what instanceof Metal ? 'Confirm Return' : 'Confirm Reuse'
    ).do(({ glass, what }) => {
      glass.forEach(x => x.putInto(table));
      what.putInto(player.hand);

      game.message(`{{player}} {{action}} {{glass}} for {{what}}.`, 
        {player: player, glass: glass, what: what, 
          action: what instanceof Glass ? 'returns' : 'reuses' });
    }),

    cleanup: (player) => action({
      prompt: 'Clean Up',     
    }).chooseOnBoard(
      'garbage', player.hand.all(Component).filter(x => !(x instanceof Plastic) || (x as Plastic).face != 4),
      { skipIf: 'never', number: player.hand.all(Component).filter(x => !(x instanceof Plastic) || (x as Plastic).face != 4).length-10 }
    ).do(({ garbage }) => {
      garbage.forEach(x => x.putInto(table));
    }).message(`{{player}} cleans up {{garbage}}`),

    skipRecycle: (player) => action({
      prompt: 'Skip',
    }).message(`{{player}} skips recycle.`),
    skipCardboardActions: (player) => action({
      prompt: 'Skip',
    }).message(`{{player}} skips cardboard actions.`),
    skipPlasticActions: (player) => action({
      prompt: 'Skip',
    }).message(`{{player}} skips plastic actions.`),
    skipGlassActions: (player) => action({
      prompt: 'Skip',
    }).message(`{{player}} skips glass actions.`),

    end: () => action({
      prompt: 'Game over'
    }).chooseOnBoard(
      'none', []
    ),

  });

  game.defineFlow(
    
    whileLoop({while: () => (
      (
        (game.players.length == 1 && table.all(Cardboard, {faceUp: false}).length > 1) ||
        (game.players.length > 1 && table.all(Cardboard, {faceUp: false}).length > 0)
      )), do: ([
      eachPlayer({
        name: 'turn', do: [
          // COLLECT
          () => game.players.current()!.recycled = false,
          whileLoop({while: () => (
            (
              (
                // solo always collects exactly 2 cardboards
                table.all(Cardboard, {faceUp: false}).length > 0 &&
                game.players.length == 1 && game.players.current()!.take.length < 2
              ) 
              || 
              (
                // multiplayer collects until a clean cardboard is taken
                table.all(Cardboard, {faceUp: false}).length > 0 &&
                game.players.length > 1 && 
                (
                  game.players.current()!.take.length == 0 || !game.players.current()!.take[game.players.current()!.take.length-1].clean
                )
              )
            )
          ), do: ([
            playerActions({ actions: ['collect']}),
          ])}),

          // make sure a clean cardboard was taken
          ifElse({
            if: () => (
              (
                // ensure 2 cardboard were taken in solo
                game.players.length == 1 &&
                game.players.current()!.take.length == 2
              )
              ||
              (
                // multiplayer immediately ends if no clean cardboard was taken
                game.players.length > 1 &&
                game.players.current()!.take.filter(x => x.clean).length > 0
              )
            ), do: [

              // Discard one in solo mode
              ifElse({
                if: () => game.players.length == 1, do: [
                  playerActions({ actions: ['discardOne']}),
                ]
              }),

              // clear the take
              () => game.players.current()!.take = [],              

              // RECYCLE
              playerActions({ actions: ['recycle', 'skipRecycle']}), 
              ifElse({
                if: () => !game.players.current()!.recycled, do: [
                  // SORT
                  // 1. Cardboard Actions
                  playerActions({ actions: ['repairOrReduce', 'skipCardboardActions']}),
                  // 2. Plastic Actions
                  playerActions({ actions: ['rethinkOrRepurpose', 'skipPlasticActions']}),
                  // 3. Glass Actions
                  playerActions({ actions: ['reuseOrReturn', 'skipGlassActions']}),
                ]
              }),

              // CLEANUP
              () => {
                const dirty = game.players.current()!.hand.all(Cardboard, {clean: false});
                dirty.forEach(x => x.putInto(trash))
                if(dirty.length > 0) {
                  game.message(`{{player}} trashes {{dirty}}.`, {player: game.players.current()!, dirty: dirty});
                }
              },
              ifElse({
                if: () => game.players.current()!.hand.all(Component).filter(x => !(x instanceof Plastic) || (x as Plastic).face != 4).length > 10, do: [
                  playerActions({ actions: ['cleanup']}),
                ]
              }),
            ]
          })
        ]
      })

    ])}),

    () => game.isOver = true,

    () => {    
      if(game.players.length > 1) {
        var winners: SingleSortPlayer[] = []
        var highScore: number = -1;
        game.players.forEach(x => {
          x.hand.first(Goal)!.showToAll();
          if(x.score.calculateScore() > highScore) {
            winners = [x];
            highScore = x.score.calculateScore();
          } else if(x.score.calculateScore() == highScore) {
            winners.push(x);
          }
        });      
        game.finish(winners);
      } else {
        const score = game.players[0].score.calculateScore();
        if(score >= 0 && score <= 20) {
          game.finish(undefined, 'wasteful')
          game.followUp({name: 'end'});
        } else if(score >= 21 && score <= 35) {
          game.finish(undefined, 'ineffective')
          game.followUp({name: 'end'});
        } else if(score >= 36 && score <= 50) {
          game.finish(undefined, 'adequate')
          game.followUp({name: 'end'});
        } else if(score >= 51 && score <= 60) {
          game.finish(undefined, 'goingGreen')
          game.followUp({name: 'end'});
        } else if(score >= 61 && score <= 70) {
          game.finish(undefined, 'sustainable')
          game.followUp({name: 'end'});
        } else if(score >= 71) {
          game.finish(undefined, 'zeroEmissions')
          game.followUp({name: 'end'});
        }
      }
    }
  )

});
