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
import { Hand } from "./hand.js";
import { Goal } from "./component/goal.js";

export class SingleSortPlayer extends Player<MyGame, SingleSortPlayer> {
}

export class MyGame extends Game<MyGame, SingleSortPlayer> {
}

export default createGame(SingleSortPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;

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

  const box = game.create(Space<MyGame>, 'box');

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
  let take: Cardboard[] = [];
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












  




  
  game.defineActions({
  });

  game.defineFlow(
    
    () => game.message('Start 1'),
    () => game.message('Start 2'),
    () => game.message('Start 3'),
    () => game.message('Start 4'),

  );

});
