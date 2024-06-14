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
  getPossibleActions() : void {
    const player = this.players.current()!
    this.message("player " + player.playerColor + " is going")

    // make sure they can click the spaces
    this.all(PilotSpace).forEach(x => {
      x.sortBy(player.playerColor + 'Order')
    })

    // highlight available actions              
    this.all(WorkerSpace).forEach(x => {
      x.highlight = false;
    })
    const possibleActions = this.all(WorkerSpace, {occupiedColor: 'none'}).filter(
      x => (x.ownerColor == 'none' || x.ownerColor == player.playerColor) &&
      this.all(HandSpace).all(HandCard, {color: x.color, side: x.side}).filter(y => !x.requiresCharge || y.charged).length > 0)                  
    possibleActions.forEach(x => {
      x.highlight = true
    })
  }

  syncPilotCards() : void {
    // sync the other players board
    this.all(WorkerSpace, {color: this.players.current()!.playerColor}).forEach(space => {
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
        this.first(WorkerSpace, {
          color: otherColor, 
          side: otherSide, 
          topic: otherTopic, 
          action: otherAction})!.occupiedColor = space.occupiedColor
      }
    });
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
  rowNumber: number
  column: number
  cloudFill: boolean
  cloudCount: number
  windCount: number
  color: string
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
  highlight: boolean = false
}

export class FlightCard extends Card {

}

export class TrickCard extends Card {

}

export class TimerCard extends Card {

}

export class KiteCard extends Card {
  color: string
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

  const pilotBlue = $.pilotSpace.create(PilotCard, 'pilot', {color: 'blue'});
  pilotBlue.showOnlyTo(1)
  const pilotRed = $.pilotSpace.create(PilotCard, 'pilot', {color: 'blue', rotation: 180});
  pilotRed.showOnlyTo(2)

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
  $.redFlightSpace.create(FlightCard, 'flight-1')
  for (const flightCell of flight1aCells) {
    const blueCell = $.blueFlightSpace.create(FlightCell, 'blue-' + flightCell.rowLetter + ',' + flightCell.column, flightCell)
    blueCell.color = 'blue'
    const redCell = $.redFlightSpace.create(FlightCell, 'red-' + flightCell.rowLetter + ',' + flightCell.column, flightCell)
    redCell.color = 'red'
  }

  $.blueFlightSpace.first(FlightCell, {rowLetter: 'A', column: 4})!.create(KiteCard, 'blueKite', {color: 'blue', rotation: 0, flipped: false});
  $.redFlightSpace.first(FlightCell, {rowLetter: 'A', column: 4})!.create(KiteCard, 'blueKite', {color: 'red', rotation: 0, flipped: false});


  game.defineActions({

    workerAction: (player) => action({
      prompt: 'Place worker'
    }).chooseOnBoard(
      'space', game.all(WorkerSpace, {'highlight': true}),
      { skipIf: 'never' }
    ).do(({ space }) => {  
      const worker = game.first(HandCard, {color: player.playerColor, side: space.side})!;
      space.occupiedColor = worker.color

      // if the player went inside, technically the outside spot is blocked too
      switch(space.action) {
        case '2': {
          const inside = game.first(WorkerSpace, {occupiedColor: 'none', side: space.side, color: player.playerColor, topic: space.topic, action: '1'})
          if(inside != undefined) {
            inside.occupiedColor = worker.color
          }
          break;
        }
        case 'flip': {
          const inside = game.first(WorkerSpace, {occupiedColor: 'none', side: space.side, color: player.playerColor, topic: space.topic, action: 'charge'})
          if(inside != undefined) {
            inside.occupiedColor = worker.color
          }
          break
        }
        case '1': {
          const outside = game.first(WorkerSpace, {occupiedColor: 'none', side: space.side, color: player.playerColor, topic: space.topic, action: '2'})
          if(outside != undefined) {
            outside.occupiedColor = 'none-inside'
          }
          break;
        }
        case 'charge': {
          const outside = game.first(WorkerSpace, {occupiedColor: 'none', side: space.side, color: player.playerColor, topic: space.topic, action: 'flip'})
          if(outside != undefined) {
            outside.occupiedColor = 'none-inside'
          }
          break
        }
      }

      worker.putInto($.garbage)

      const kite = game.first(KiteCard, {color: player.playerColor})!
      switch(space.topic) {
        case 'push': {
          kite.rotation += space.side == 'left' ? 45 : -45;
          if(space.action == '2') {
            kite.rotation += space.side == 'left' ? 45 : -45;
          }
          break;
        }
        case 'pull': {
          kite.rotation += space.side == 'right' ? 45 : -45;
          if(space.action == '2') {
            kite.rotation += space.side == 'right' ? 45 : -45;
          }
          break;
        }
      }
    }),

    moveKiteDown: (player) => action({
      prompt: 'Move down',
      condition: game.all(WorkerSpace, {occupiedColor: player.playerColor}).length >= 2 &&
      game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'left', topic: 'push'}).length > 0 && 
      game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'right', topic: 'push'}).length > 0
    }).do(() => {  
      const kite = game.first(KiteCard, {color: player.playerColor})!
      const space = kite.container(FlightCell)!
      if(space.rowNumber >= 1) {
        kite.putInto(game.first(FlightCell, {rowNumber: space.rowNumber-1, column: space.column, color: kite.color})!)
      } else {
        // crash!
      }
    }),

    moveKiteLeft: (player) => action({
      prompt: 'Move left',
      condition: game.all(WorkerSpace, {occupiedColor: player.playerColor}).length >= 2 &&
      game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'left', topic: 'control'}).length > 0 && 
      game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'right', topic: 'control'}).length > 0
    }).do(() => {  
      const kite = game.first(KiteCard, {color: player.playerColor})!
      const space = kite.container(FlightCell)!
      if(space.column >= 1) {
        kite.putInto(game.first(FlightCell, {rowNumber: space.rowNumber, column: space.column-1, color: kite.color})!)
      } else {
        if(space.rowNumber >= 1) {
          kite.putInto(game.first(FlightCell, {rowNumber: space.rowNumber-1, column: space.column, color: kite.color})!)
        } else {
          // crash!
        }
      }
    }),

    moveKiteRight: (player) => action({
      prompt: 'Move right',
      condition: game.all(WorkerSpace, {occupiedColor: player.playerColor}).length >= 2 &&
      game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'left', topic: 'control'}).length > 0 && 
      game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'right', topic: 'control'}).length > 0
    }).do(() => {  
      const kite = game.first(KiteCard, {color: player.playerColor})!
      const space = kite.container(FlightCell)!
      if(space.column <= 7) {
        kite.putInto(game.first(FlightCell, {rowNumber: space.rowNumber, column: space.column+1, color: kite.color})!)
      } else {
        if(space.rowNumber >= 1) {
          kite.putInto(game.first(FlightCell, {rowNumber: space.rowNumber-1, column: space.column, color: kite.color})!)
        } else {
          // crash!
        }
      }
    }),

    moveKiteUp: (player) => action({
      prompt: 'Move up',
      condition: 
        game.all(WorkerSpace, {occupiedColor: player.playerColor}).length >= 2 &&
        game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'left', topic: 'pull'}).length > 0 && 
        game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'right', topic: 'pull'}).length > 0
    }).do(() => {  
      const kite = game.first(KiteCard, {color: player.playerColor})!
      const space = kite.container(FlightCell)!
      if(space.rowNumber <= 5) {
        kite.putInto(game.first(FlightCell, {rowNumber: space.rowNumber+1, column: space.column, color: kite.color})!)
      }
    }).message("moved up"),

    skip: (player) => action({
      prompt: 'Skip',
    }).do(() => {
    }),



  });

  game.defineFlow(
    loop(        
      whileLoop({while: () => game.all(HandSpace).flatMap(x => x.all(HandCard)).length > 0, do: (
        // worker phase
        eachPlayer({          
          name: 'turn', do: [
            () => game.getPossibleActions(),
            playerActions({ actions: ['workerAction']}),
            () => game.syncPilotCards(),             
          ]          
        })        
      )}),

      // optional combined actions
      eachPlayer({          
        name: 'turn', do: [  
          playerActions({ actions: ['moveKiteDown', 'moveKiteLeft', 'moveKiteRight', 'moveKiteUp', 'skip']}),
        ]          
      }),
      
      playerActions({ actions: []}),
    )
  );
});
