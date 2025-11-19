import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';

export class SingleSortPlayer extends Player<MyGame, SingleSortPlayer> {
}

class MyGame extends Game<MyGame, SingleSortPlayer> {
}

export default createGame(SingleSortPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;

  game.defineActions({
  });

  game.defineFlow(
  );
});
