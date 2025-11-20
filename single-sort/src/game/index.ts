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

export default createGame(SingleSortPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, forLoop, whileLoop, eachPlayer } = game.flowCommands;

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
  
  
  // let state = State.CleanUp;
  // let take: Cardboard[] = [];
  // let rotSelection: Component | undefined = undefined;

  let players = game.players.length;

  // let time: number = 0;

  // const hands: Hand[] = [];
  // let goals: Goal[] = [];

  const table = game.create(Table, 'table');
  const box = game.create(Box, 'box');

  const playersSpace = game.create(PlayersSpace, 'playersSpace')
  for(var i = 0; i < game.players.length; i++) {
    const playerSpace = playersSpace.create(Hand, 'hand' + i, {player: game.players[i]});
    game.players[i].hand = playerSpace
  }



  // if(players == 1) {
  //   goals.push(new Goal([
  //     game.first(Cardboard, {color: "darkgreen", face: CardboardFace.fromTypeAndValue(false, 5)})!,
  //     game.first(Cardboard, {color: "blue", face: CardboardFace.fromTypeAndValue(false, 5)})!,
  //     game.first(Cardboard, {color: "yellow", face: CardboardFace.fromTypeAndValue(false, 5)})!
  //   ]));
  // } else {
  //   goals.push(new Goal([
  //     game.first(Cardboard, {color: "yellow", face: CardboardFace.fromTypeAndValue(false, 1)})!,
  //     game.first(Cardboard, {color: "yellow", face: CardboardFace.fromTypeAndValue(false, 2)})!
  //   ]));
  //   goals.push(new Goal([
  //     game.first(Cardboard, {color: "yellow", face: CardboardFace.fromTypeAndValue(false, 3)})!,
  //     game.first(Cardboard, {color: "yellow", face: CardboardFace.fromTypeAndValue(false, 4)})!
  //   ]));
  //   goals.push(new Goal([
  //     game.first(Cardboard, {color: "blue", face: CardboardFace.fromTypeAndValue(false, 1)})!,
  //     game.first(Cardboard, {color: "blue", face: CardboardFace.fromTypeAndValue(false, 2)})!
  //   ]));
  //   goals.push(new Goal([
  //     game.first(Cardboard, {color: "blue", face: CardboardFace.fromTypeAndValue(false, 3)})!,
  //     game.first(Cardboard, {color: "blue", face: CardboardFace.fromTypeAndValue(false, 4)})!
  //   ]));
  //   goals.push(new Goal([
  //     game.first(Cardboard, {color: "darkgreen", face: CardboardFace.fromTypeAndValue(false, 1)})!,
  //     game.first(Cardboard, {color: "darkgreen", face: CardboardFace.fromTypeAndValue(false, 2)})!
  //   ]));
  //   goals.push(new Goal([
  //     game.first(Cardboard, {color: "darkgreen", face: CardboardFace.fromTypeAndValue(false, 3)})!,
  //     game.first(Cardboard, {color: "darkgreen", face: CardboardFace.fromTypeAndValue(false, 4)})!
  //   ]));

  //   goals = shuffleArray(goals);
    
  //   let turn = 0;
  //   for(const player of game.players) {
  //     hands.push(game.create(Hand, `hand${turn}`, { player }));
  //   }
  // }

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
      'what', ({recycle}) => 
        table.all(Glass, {color: recycle.color}).map(x => x as Component)
        .concat(recycle instanceof Cardboard ? 
          table.all(Cardboard, {faceUp: true, color: recycle.color, face: (recycle as Cardboard).face}).map(x => x as Component)
          .concat(
            table.all(Plastic, {color: recycle.color, face: (recycle as Cardboard).face}).map(x => x as Component)
          ) : [])
        .concat(recycle instanceof Plastic ? 
          table.all(Cardboard, {faceUp: true, color: recycle.color, face: (recycle as Plastic).face}).map(x => x as Component)
          .concat(
            table.all(Plastic, {color: recycle.color, face: (recycle as Plastic).face}).map(x => x as Component)
          ) : []),
      { skipIf: 'never' }
    ).do(({ recycle, what }) => {
      recycle.putInto(table);
      what.putInto(player.hand);      
    }),

    skip: (player) => action({
      prompt: 'Skip',
    }),

  });

  game.defineFlow(
    
    eachPlayer({
      name: 'turn', do: [
        // Collect
        whileLoop({while: () => (
          (game.players.length == 1 && game.players.current()!.take.length < 2) || 
          (game.players.current()!.take.length == 0 || !game.players.current()!.take[game.players.current()!.take.length-1].clean)
        ), do: ([
            playerActions({ actions: ['collectCardboard']}),
        ])}),
        // Recycle
        playerActions({ actions: ['recycleChoice', 'skip']}),
      ]   
    })
  )

});
