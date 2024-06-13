import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';

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
  face : string
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

}

export class TrickCard extends Card {

}

export class TimerCard extends Card {

}

export class KiteCard extends Card {
  flight : string
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


  for(let row = 0; row < 5; row++) {
    for(let col = 0; col < 7; col++) {
      $.blueFlightSpace.create(FlightCell, 'blue-' + row + ',' + col)
      $.redFlightSpace.create(FlightCell, 'red-' + row + ',' + col)
    }
  }

  $.blueHandLeftSpace.create(LeftHandCard, 'blueLeftHand', {color: 'blue', rotation: 225});
  $.blueHandRightSpace.create(RightHandCard, 'blueRightHand', {color: 'blue', rotation: 135});  
  $.blueFlightSpace.first(FlightCell, {name: 'blue-4,3'})!.create(KiteCard, 'blueKite', {flight: 'kite0'});

  $.redHandLeftSpace.create(LeftHandCard, 'redLeftHand', {color: 'red', rotation: 45});
  $.redHandRightSpace.create(RightHandCard, 'redRightHand', {color: 'red', rotation: 315});
  $.redFlightSpace.first(FlightCell, {name: 'red-4,3'})!.create(KiteCard, 'redKite', {flight: 'kite0'});

  game.defineActions({
    rotate: () => action({
      prompt: 'Red'
    }).do(
      () => {
        // $.blueHandLeftSpace.all(LeftHandCard).forEach(x => {
        //   if(x.color == 'red') {
        //     x.showToAll();
        //   } else {
        //     x.hideFromAll();
        //   }
        // })

        $.blueHandLeftSpace.all(LeftHandCard).forEach(x => {
        
        })
      }
    ),

    skip: () => action({
      prompt: 'Blue'
    }).do(
      () => {
        // $.blueHandLeftSpace.all(LeftHandCard).forEach(x => {
        //   if(x.color == 'blue') {
        //     x.showToAll();
        //   } else {
        //     x.hideFromAll();
        //   }
        // })
      }
    ),     
  });

  game.defineFlow(
    loop(
      // eachPlayer({
        // name: 'turn', do: [
          playerActions({ actions: ['rotate', 'skip']}),
        // ]
      // }),      
    )
  );
});
