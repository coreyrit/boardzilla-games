import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';

export class LostRuinsOfArnakPlayer extends Player<MyGame, LostRuinsOfArnakPlayer> {
}

class MyGame extends Game<MyGame, LostRuinsOfArnakPlayer> {
}

export class RoundsRegion extends Space<MyGame> {
}
export class PlayRegion extends Space<MyGame> {
}
export class Level2Region extends Space<MyGame> {
}
export class Level1Region extends Space<MyGame> {
}
export class Level0Region extends Space<MyGame> {
}

export class RoundSpace extends Space<MyGame> {
}

export default createGame(LostRuinsOfArnakPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;


  const board = game.create(Space, 'board')
  const rounds = board.create(RoundsRegion, 'rounds')  
  rounds.create(RoundSpace, 'r0')
  rounds.create(RoundSpace, 'r1')
  rounds.create(RoundSpace, 'r2')
  rounds.create(RoundSpace, 'r3')
  rounds.create(RoundSpace, 'r4')
  rounds.create(RoundSpace, 'r5')
  const play = board.create(PlayRegion, 'play')
  const sites = play.create(Space, 'sites')
  const level2 = sites.create(Level2Region, 'level2')
  level2.create(Space, '2_1')
  level2.create(Space, '2_2')
  level2.create(Space, '2_3')
  level2.create(Space, '2_4')
  const level1 = sites.create(Level1Region, 'level1')
  level1.create(Space, '1_1')
  level1.create(Space, '1_2')
  level1.create(Space, '1_3')
  level1.create(Space, '1_4')
  level1.create(Space, '1_5')
  level1.create(Space, '1_6')
  level1.create(Space, '1_7')
  level1.create(Space, '1_8')
  const level0 = sites.create(Level0Region, 'level0')
  level0.create(Space, '0_1')
  level0.create(Space, '0_2')
  level0.create(Space, '0_3')
  level0.create(Space, '0_4')
  level0.create(Space, '0_5')
  const research = play.create(Space, 'research')



  game.defineActions({
  });

  game.defineFlow(
    playerActions({ actions: []})
  );
});
