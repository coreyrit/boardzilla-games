import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';
import { flight1aCells } from './flight-cells.js';

export class StuntKitesPlayer extends Player<MyGame, StuntKitesPlayer> {
  playerColor : string
}

class MyGame extends Game<MyGame, StuntKitesPlayer> {
  rotatePilotCard(pilotCard : PilotCard) : void {
    pilotCard.rotation += 180
    this.swapSpaces(this.first(WorkerSpace, {name: 'pullLeft1'})!, this.first(WorkerSpace, {name: 'pushRight1'})!)
    this.swapSpaces(this.first(WorkerSpace, {name: 'pullLeft2'})!, this.first(WorkerSpace, {name: 'pushRight2'})!)

    this.swapSpaces(this.first(WorkerSpace, {name: 'pullRight1'})!, this.first(WorkerSpace, {name: 'pushLeft1'})!)
    this.swapSpaces(this.first(WorkerSpace, {name: 'pullRight2'})!, this.first(WorkerSpace, {name: 'pushLeft2'})!)

    this.swapSpaces(this.first(WorkerSpace, {name: 'controlLeftCharge'})!, this.first(WorkerSpace, {name: 'controlRightCharge'})!)
    this.swapSpaces(this.first(WorkerSpace, {name: 'controlLeftFlip'})!, this.first(WorkerSpace, {name: 'controlRightFlip'})!)
  }

  swapSpaces(space1: WorkerSpace, space2: WorkerSpace) {
    const prevColor : string | undefined = space1.occupiedColor;
    space1.occupiedColor = space2.occupiedColor
    space2.occupiedColor = prevColor
  }
}

export class PilotSpace extends Space<MyGame> {
  side: string
}

export class FlightSpace extends Space<MyGame> {

}

export class HandSpace extends Space<MyGame> {
  color: string
}

export class TrickSpace extends Space<MyGame> {

}

export class TimerSpace extends Space<MyGame> {

}

export class Card extends Piece<MyGame> {
  flipped : boolean = false
}

export class PilotCard extends Card {
  color: string

}

export class HandCard extends Card {
  color: string
  side: string
  charged: boolean = true
}

export class FlightCell extends Space<MyGame> {
  rowLetter: string
  column: number
  cloudFill: boolean
  cloudCount: number
  windCount: number
}

export class WorkerSpace extends Piece<MyGame> {
  side: string
  color: string
  topic: string
  action: string
  occupiedColor: string = 'none'
  blueOrder: number
  redOrder: number
  ownerColor: string = 'none'
  requiresCharge: boolean = false
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
  const { playerActions, loop, eachPlayer, whileLoop } = game.flowCommands;

  game.players[0].playerColor = 'blue'
  game.players[1].playerColor = 'red'

  game.create(Space, 'garbage')
  game.create(Space, 'pilotSpace')
  
  game.create(PilotSpace, 'nw1', {side: 'left'})
  game.create(PilotSpace, 'nw2', {side: 'left'})
  game.create(PilotSpace, 'w1', {side: 'left'})
  game.create(PilotSpace, 'w2', {side: 'left'})
  game.create(PilotSpace, 'sw1', {side: 'left'})
  game.create(PilotSpace, 'sw2', {side: 'left'})
  game.create(PilotSpace, 'ne1', {side: 'right'})
  game.create(PilotSpace, 'ne2', {side: 'right'})
  game.create(PilotSpace, 'e1', {side: 'right'})
  game.create(PilotSpace, 'e2', {side: 'right'})
  game.create(PilotSpace, 'se1', {side: 'right'})
  game.create(PilotSpace, 'se2', {side: 'right'})
  
  const colors = ['blue', 'red']
  colors.forEach(color => {
    $.nw1.create(WorkerSpace, 'push_left_1_' + color, {color: color, side: 'left', topic: 'push', action: '1', requiresCharge : false})
    $.nw2.create(WorkerSpace, 'push_left_2_' + color, {color: color, side: 'left', topic: 'push', action: '2', requiresCharge : true, ownerColor: color == 'blue' ? 'red' : 'blue'})

    $.w1.create(WorkerSpace, 'control_left_charge_' + color, {color: color, side: 'left', topic: 'control', action: 'charge', requiresCharge : false})
    $.w2.create(WorkerSpace, 'control_left_flip_' + color, {color: color, side: 'left', topic: 'control', action: 'flip', requiresCharge : false})

    $.sw1.create(WorkerSpace, 'pull_left_1_' + color, {color: color, side: 'left', topic: 'pull', action: '1', requiresCharge : false})
    $.sw2.create(WorkerSpace, 'pull_left_2_' + color, {color: color, side: 'left', topic: 'pull', action: '2', requiresCharge : true, ownerColor: color})

    $.ne1.create(WorkerSpace, 'push_right_1_' + color, {color: color, side: 'right', topic: 'push', action: '1', requiresCharge : false})
    $.ne2.create(WorkerSpace, 'push_right_2_' + color, {color: color, side: 'right', topic: 'push', action: '2', requiresCharge : true, ownerColor: color == 'blue' ? 'red' : 'blue'})

    $.e1.create(WorkerSpace, 'control_right_charge_' + color, {color: color, side: 'right', topic: 'control', action: 'charge', requiresCharge : false})
    $.e2.create(WorkerSpace, 'control_right_flip_' + color, {color: color, side: 'right', topic: 'control', action: 'flip', requiresCharge : false})

    $.se1.create(WorkerSpace, 'pull_right_1_' + color, {color: color, side: 'right', topic: 'pull', action: '1', requiresCharge : false})
    $.se2.create(WorkerSpace, 'pull_right_2_' + color, {color: color, side: 'right', topic: 'pull', action: '2', requiresCharge : true, ownerColor: color})
  })

  game.all(WorkerSpace).forEach(x => {
    x.blueOrder = x.color == 'blue' ? 2 : 1
    x.redOrder = x.color == 'red' ? 2 : 1
  })

  game.all(WorkerSpace, {color: 'blue'}).showOnlyTo(1)
  game.all(WorkerSpace, {color: 'red'}).showOnlyTo(2)

  $.pilotSpace.create(PilotCard, 'pilot', {color: 'blue'});

  game.create(TimerSpace, 'timerSpace')

  game.create(FlightSpace, 'redFlightSpace')
  game.create(HandSpace, 'redHandLeftSpace', {color: 'red'})
  game.create(HandSpace, 'redHandRightSpace', {color: 'red'})
  game.create(TrickSpace, 'redTricksSpace')

  game.create(FlightSpace, 'blueFlightSpace')
  game.create(HandSpace, 'blueHandLeftSpace', {color: 'blue'})
  game.create(HandSpace, 'blueHandRightSpace', {color: 'blue'})
  game.create(TrickSpace, 'blueTricksSpace')  

  // 8 trick cards
  for(let i = 0; i < 8; i++) {
    $.timerSpace.create(TrickCard, 'trick-' + i);
  }
  $.timerSpace.create(TimerCard,'timer')


  $.blueHandLeftSpace.create(HandCard, 'blueLeftHand', {side: 'left', color: 'blue', rotation: 225});
  $.blueHandRightSpace.create(HandCard, 'blueRightHand', {side: 'right', color: 'blue', rotation: 135});    

  $.redHandLeftSpace.create(HandCard, 'redLeftHand', {side: 'left', color: 'red', rotation: 45});
  $.redHandRightSpace.create(HandCard, 'redRightHand', {side: 'right', color: 'red', rotation: 315});

  $.blueFlightSpace.create(FlightCard, 'flight-1')
  for (const flightCell of flight1aCells) {
    $.blueFlightSpace.create(FlightCell, 'blue-' + flightCell.rowLetter + ',' + flightCell.column, flightCell)
  }

  $.blueFlightSpace.first(FlightCell, {rowLetter: 'B', column: 6})!.create(KiteCard, 'blueKite', {rotation: 0, flipped: false});


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
    
    chooseWorker: (player) => action({
      prompt: 'Choose a worker'
    }).chooseOnBoard(
      'space', 
        game.all(WorkerSpace, {occupiedColor: 'none'}).filter(
          x => (x.ownerColor == 'none' || x.ownerColor == player.playerColor) &&
            game.all(HandSpace).all(HandCard, {color: x.color, side: x.side}).filter(y => !x.requiresCharge || y.charged).length > 0)                  
          ,
      { skipIf: 'never' }
    ).do(({ space }) => {  
      const worker = game.first(HandCard, {color: player.playerColor, side: space.side})!;
      space.occupiedColor = worker.color

      // if the player went inside, technically the outside spot is blocked too
      switch(space.action) {
        case '2': {
          game.first(WorkerSpace, {color: player.playerColor, topic: space.topic, action: '1'})!.occupiedColor = worker.color
          break;
        }
        case 'flip': {
          game.first(WorkerSpace, {color: player.playerColor, topic: space.topic, action: 'charge'})!.occupiedColor = worker.color
          break
        }
      }

      worker.putInto($.garbage)
    }),


  });

  game.defineFlow(
    loop(        
      whileLoop({while: () => game.all(HandSpace).flatMap(x => x.all(HandCard)).length > 0, do: (
        // worker phase
        eachPlayer({          
          name: 'turn', do: [
            () => {
              game.message("player " + game.players.current()!.playerColor + " is going")

              // make sure they can click the spaces
              game.all(PilotSpace).forEach(x => {
                x.sortBy(game.players.current()!.playerColor + 'Order')
              })
            },
            playerActions({ actions: ['chooseWorker']}),
            () => {
              // sync the other players board
              game.all(WorkerSpace, {color: game.players.current()!.playerColor}).forEach(space => {
                if(space.occupiedColor != 'none') {
                  const otherColor = space.color == 'blue' ? 'red' : 'blue'
                  const otherSide = space.side == 'left' ? 'right' : 'left'
                  const otherAction = space.action
                  let otherTopic = space.topic
                  switch(space.topic) {
                    case 'push': {
                      otherTopic = 'pull'
                      break;
                    }
                    case 'pull': {
                      otherTopic = 'push'
                      break;
                    }
                  }
                  game.first(WorkerSpace, {
                    color: otherColor, 
                    side: otherSide, 
                    topic: otherTopic, 
                    action: otherAction})!.occupiedColor = space.occupiedColor
                }
              });
            }
          ]          
        })
      )}),
      
      playerActions({ actions: ['spinLeft', 'spinRight']}),
    )
  );
});
