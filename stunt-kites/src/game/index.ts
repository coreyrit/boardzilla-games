import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';
import { flight1aCells } from './flight-cells.js';

export class StuntKitesPlayer extends Player<MyGame, StuntKitesPlayer> {
}

class MyGame extends Game<MyGame, StuntKitesPlayer> {
}

export class PilotSpace extends Space<MyGame> {

}

export class FlightSpace extends Space<MyGame> {

}

export class HandSpace extends Space<MyGame> {

}

export class TrickSpace extends Space<MyGame> {

}

export class TimerSpace extends Space<MyGame> {

}

export class Card extends Piece<MyGame> {
  flipped : boolean = false
}

export class PilotCard extends Card {

}

export class HandCard extends Card {
  color: string
}

export class LeftHandCard extends HandCard {

}

export class RightHandCard extends HandCard {

}

export class FlightCell extends Space<MyGame> {
  rowLetter: string
  column: number
  cloudFill: boolean
  cloudCount: number
  windCount: number
}

export class FlightCard extends Card {

}

export class TrickCard extends Card {

}

export class TimerCard extends Card {

}

export class KiteCard extends Card {
}

export default createGame(StuntKitesPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;

  game.create(PilotSpace, 'pilotSpace')
  game.create(TimerSpace, 'timerSpace')

  game.create(FlightSpace, 'redFlightSpace')
  game.create(HandSpace, 'redHandLeftSpace')
  game.create(HandSpace, 'redHandRightSpace')
  game.create(TrickSpace, 'redTricksSpace')

  game.create(FlightSpace, 'blueFlightSpace')
  game.create(HandSpace, 'blueHandLeftSpace')
  game.create(HandSpace, 'blueHandRightSpace')
  game.create(TrickSpace, 'blueTricksSpace')

  $.pilotSpace.create(PilotCard, 'pilotCard');

  // 8 trick cards
  for(let i = 0; i < 8; i++) {
    $.timerSpace.create(TrickCard, 'trick-' + i);
  }
  $.timerSpace.create(TimerCard,'timer')


  // for(let row = 0; row < 5; row++) {
  //   for(let col = 0; col < 7; col++) {
  //     $.blueFlightSpace.create(FlightCell, 'blue-' + row + ',' + col)
  //     $.redFlightSpace.create(FlightCell, 'red-' + row + ',' + col)
  //   }
  // }

  $.blueHandLeftSpace.create(LeftHandCard, 'blueLeftHand', {color: 'blue', rotation: 225});
  $.blueHandRightSpace.create(RightHandCard, 'blueRightHand', {color: 'blue', rotation: 135});    

  $.redHandLeftSpace.create(LeftHandCard, 'redLeftHand', {color: 'red', rotation: 45});
  $.redHandRightSpace.create(RightHandCard, 'redRightHand', {color: 'red', rotation: 315});
  // $.redFlightSpace.first(FlightCell, {name: 'red-4,3'})!.create(KiteCard, 'redKite', {flight: 'kite0'});

  $.blueFlightSpace.create(FlightCard, 'flight-1')
  for (const flightCell of flight1aCells) {
    $.blueFlightSpace.create(FlightCell, 'blue-' + flightCell.rowLetter + ',' + flightCell.column, flightCell)
  }

  $.blueFlightSpace.first(FlightCell, {rowLetter: 'A', column: 4})!.create(KiteCard, 'blueKite', {rotation: 0, flipped: false});


  game.defineActions({
    spinLeft: () => action({
      prompt: 'Spin Left'
    }).do(
      () => {
        const kite = $.blueFlightSpace.first(KiteCard)!
        kite.rotation = kite.rotation - 45
      }
    ),

    spinRight: () => action({
      prompt: 'Spin Right'
    }).do(
      () => {
        const kite = $.blueFlightSpace.first(KiteCard)!
        kite.rotation = kite.rotation + 45
      }
    ),     
  });

  game.defineFlow(
    loop(
      // eachPlayer({
        // name: 'turn', do: [
          playerActions({ actions: ['spinLeft', 'spinRight']}),
        // ]
      // }),      
    )
  );
});
