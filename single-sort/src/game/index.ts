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


export class Score extends Space<MyGame> {

  calculateScore() : number{
    let score = 0;
    if(this.owner != undefined) {
      const hand = this.owner!.hand
      
      // score cardboard
      for(let v = 1; v <= 7; v++) {
        score += Math.floor(hand.all(Cardboard, {clean: true, face: v}).length / 2) * v;
      }
      
      // score plastic
      score += hand.all(Plastic, {face: 1}).length * 1;
      score += hand.all(Plastic, {face: 2}).length * 2;
      for(const color of ['darkgreen', 'blue', 'yellow']) {
        for(const val of [3, 5]) {
          if(hand.all(Cardboard, {clean: true, color: color}).reduce((sum, cb) => sum + cb.face, 0) >= val) {
            score += hand.all(Plastic, {face: val, color: color}).length * val;
          }
        }
      }
      const sixCount = hand.all(Plastic, {face: 6}).length;
      if(sixCount > 0) {
        let sixCounts: number[] = []
        this.game.players.forEach(p => {
          const count = p.hand.all(Plastic, {face: 6}).length
          if(!sixCounts.includes(count)) {
            sixCounts.push(count);
          }
        })
        sixCounts.sort((a, b) => b - a);
        if(sixCounts.length > 0 && sixCount == sixCounts[0]) {
          score += (14 - this.game.players.length);
        } else if (sixCounts.length > 1 && sixCount == sixCounts[1]) {
          score += (8 - this.game.players.length);
        }
      }

      // score glass
      let glassCounts: number[] = []
      for(const color of ['darkgreen', 'blue', 'yellow']) {
        glassCounts.push(hand.all(Glass, {color: color}).length);
      }
      glassCounts.sort((a, b) => b - a);
      if(glassCounts.length > 0) {
        score += glassCounts[0] * 5;
      }
      for(let i = 1; i < glassCounts.length; i++) {
        score += glassCounts[i] * 2;
      }

      // score metal
      score += hand.all(Metal).length * 14
      if(hand.all(Metal, {color: "#B8860B"}).length > 0) {
        score += hand.all(Plastic, {face: 1}).length * 3;
      }
      if(hand.all(Metal, {color: "#C0C0C0"}).length > 0) {
        score += hand.all(Plastic, {face: 1}).length * 2;
      }
      if(hand.all(Metal, {color: "#8B4513"}).length > 0) {
        score += hand.all(Plastic, {face: 1}).length * 1;
      }


      // private goals
      if(this.game.isOver) {
        const goal = hand.first(Goal)!;
        for(const val of goal.targetNumbers) {
          score += $.trash.all(Cardboard, {color: goal.targetColor, face: val}).length * val;
        }
      }
    }
    return score;
  }
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
  const turnRef = reference.create(TurnReference, 'turnRef');
  const scoreRef = reference.create(ScoreReference, 'scoreRef');
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

    const goal = theVoid.top(Goal)!;
    goal.showOnlyTo(game.players[i]);
    goal.putInto(hand);
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
      game.message(game.players.length.toString());
      game.message(player.take.length.toString());
    }).message(`{{player}} collects a {{cardboard}}.`),

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

          // make sure a clean cardboard was taken
          ifElse({
            if: () => game.players.current()!.take.filter(x => x.clean).length > 0, do: [
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
            () => {
              const dirty = game.players.current()!.hand.all(Cardboard, {clean: false});
              dirty.forEach(x => x.putInto(trash))
              game.message(`{{player}} trashes {{dirty}}.`, {player: game.players.current()!, dirty: dirty});
            },
            ifElse({
              if: () => game.players.current()!.hand.all(Component).filter(x => !(x instanceof Plastic) || (x as Plastic).face != 4).length > 10, do: [
                playerActions({ actions: ['cleanup']}),
              ]
            }),
          ]})
        ]
      })

    ])}),

    () => game.isOver = true,

    () => {
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
    }
  )

});
