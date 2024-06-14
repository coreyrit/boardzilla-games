import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';
import { flight1aCells } from './flight-cells.js';
import { tricks } from './tricks.js';

export class StuntKitesPlayer extends Player<MyGame, StuntKitesPlayer> {
  playerColor : string
}

class MyGame extends Game<MyGame, StuntKitesPlayer> {
  planTrick(): void {
    $.timerSpace.bottom(TrickCard)!.putInto($.trickFrontSpace)
    $.timerSpace.bottom(TrickCard)!.putInto($.trickBackSpace)
  }

  clearHighlights(): void {
    // clear the pilot card
    this.game.all(WorkerSpace).forEach(x => {
      x.occupiedColor = 'none'
      x.highlight = false
    })
  }

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

  currentPlayerWindCount() : number {
    const currentPlayer = this.players.current()!
    const kite = this.first(KiteCard, {color: currentPlayer.playerColor})!
    switch(kite.rotation) {
      case 45: {
        return 1;
      }
      case 90: {
        return 2;
      }
      case 135: {
        return 1;
      }
      case 180: {
        return 1;
      }
      case 225: {
        return 1;
      }
      case 270: {
        return 2;
      }
      case 315: {
        return 1;
      }
      default: {
        return 0;
      }
    }
  }

  returnWorkers() : void {
    this.message('moving hands')
    this.all(HandCard).forEach(x => {
      x.putInto(this.first(HandSpace, {color: x.color, side: x.side})!)
    })
  }

  moveKiteUp(kite: KiteCard): void {
    const space = kite.container(FlightCell)!
    if(space.rowNumber <= 5) {
      kite.putInto(this.first(FlightCell, {rowNumber: space.rowNumber+1, column: space.column, color: kite.color})!)
    }
  }
  moveKiteLeft(kite: KiteCard): void {
    const space = kite.container(FlightCell)!
    if(space.column >= 1) {
      kite.putInto(this.first(FlightCell, {rowNumber: space.rowNumber, column: space.column-1, color: kite.color})!)
    } else {
      if(space.rowNumber >= 1) {
        this.moveKiteDown(kite)
      }
    }
  }
  moveKiteRight(kite: KiteCard): void {
    const space = kite.container(FlightCell)!
    if(space.column <= 7) {
      kite.putInto(this.first(FlightCell, {rowNumber: space.rowNumber, column: space.column+1, color: kite.color})!)
    } else {
      if(space.rowNumber >= 1) {
        this.moveKiteDown(kite)
      }
    }
  }
  moveKiteDown(kite: KiteCard): void {
    const space = kite.container(FlightCell)!
    if(space.rowNumber >= 1) {
      kite.putInto(this.first(FlightCell, {rowNumber: space.rowNumber-1, column: space.column, color: kite.color})!)
    } else {
      // crash!
    }
  }
  moveKiteWithWind(kite: KiteCard): void {
    switch(kite.rotation) {
      case 45: {
        this.moveKiteRight(kite)
        break;
      }
      case 90: {
        this.moveKiteRight(kite)
        break;
      }
      case 135: {
        this.moveKiteRight(kite)
        break;
      }
      case 180: {
        this.moveKiteDown(kite)
        break;
      }
      case 225: {
        this.moveKiteLeft(kite)
        break;
      }
      case 270: {
        this.moveKiteLeft(kite)
        break;
      }
      case 315: {
        this.moveKiteLeft(kite)
        break;
      }
    }
  }

  updateTimer(): void {
    $.timerSpace.rotation += 90

    // const timer = this.first(TimerCard)!
    // timer.rotation += 90;
    // if (timer.rotation == 0 || timer.rotation == 360) {
    //   // remove the bottom card from the deck

    // }
  }
}

export class PilotSpace extends Space<MyGame> {
  side: string
}

export class FlightSpace extends Space<MyGame> {

}

export class HandSpace extends Space<MyGame> {
  color: string
  side: string
}

export class TrickSpace extends Space<MyGame> {
  color: string
}

export class TrickChoiceSpace extends Space<MyGame> {

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
  shuffleOrder: number
  
  // info
  nm: string
  vp: number

  // rewards
  wind: number
  xwind: number
  
  // requirements
  reqFill: boolean
  reqRows: string[]
  ltReqDeg: number
  rtReqDeg: number

  // results
  flip: boolean = false
  hor: number = 0
  ver: number = 0
  spin: number = 0
}

export class TimerCard extends TrickCard {

}

export class KiteCard extends Card {
  color: string  
}

export default createGame(StuntKitesPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer, whileLoop, forLoop } = game.flowCommands;

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
  game.create(TrickChoiceSpace, 'trickFrontSpace')
  game.create(TrickChoiceSpace, 'trickBackSpace')

  game.create(FlightSpace, 'redFlightSpace')
  game.create(HandSpace, 'redHandLeftSpace', {color: 'red', side: 'left'})
  game.create(HandSpace, 'redHandRightSpace', {color: 'red', side: 'right'})
  game.create(TrickSpace, 'redTricksSpace', {color: 'red'})

  game.create(FlightSpace, 'blueFlightSpace')
  game.create(HandSpace, 'blueHandLeftSpace', {color: 'blue', side: 'left'})
  game.create(HandSpace, 'blueHandRightSpace', {color: 'blue', side: 'right'})
  game.create(TrickSpace, 'blueTricksSpace', {color: 'blue'})  

  // 8 trick cards
  // for(let i = 0; i < 8; i++) {
    // const shuffleOrder = game.random()
    // $.timerSpace.create(TrickCard, 'trick-' + i + '-front', {shuffleOrder: shuffleOrder});
    // $.timerSpace.create(TrickCard, 'trick-' + i + '-back', {shuffleOrder: shuffleOrder});
  // }

  //for (const trickCard of tricks) {
  for (let i = 0; i < tricks.length; i+= 2) {
    const shuffleOrder = game.random()
    let tempFront = tricks[i]
    let tempBack = tricks[i+1]
    tempFront.shuffleOrder = shuffleOrder
    tempBack.shuffleOrder = shuffleOrder
    $.timerSpace.create(TrickCard, tempFront.nm!.toLowerCase().replace(' ', '-').replace("'", ""), tempFront);
    $.timerSpace.create(TrickCard, tempBack.nm!.toLowerCase().replace(' ', '-').replace("'", ""), tempBack);
  }


  $.timerSpace.create(TimerCard, 'timer', {shuffleOrder: -1}) // force timer on top when shuffled
  $.timerSpace.create(TrickCard, 'final-trick', {shuffleOrder: -0.5});


  $.blueHandLeftSpace.create(HandCard, 'blue-left', {side: 'left', color: 'blue', rotation: 45});
  $.blueHandRightSpace.create(HandCard, 'blue-right', {side: 'right', color: 'blue', rotation: 315});    

  $.redHandLeftSpace.create(HandCard, 'red-left', {side: 'left', color: 'red', rotation: 45});
  $.redHandRightSpace.create(HandCard, 'red-right', {side: 'right', color: 'red', rotation: 315});

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
      game.moveKiteDown(kite)
    }),

    moveKiteLeft: (player) => action({
      prompt: 'Move left',
      condition: game.all(WorkerSpace, {occupiedColor: player.playerColor}).length >= 2 &&
      game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'left', topic: 'control'}).length > 0 && 
      game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'right', topic: 'control'}).length > 0
    }).do(() => {  
      const kite = game.first(KiteCard, {color: player.playerColor})!
      game.moveKiteLeft(kite)
    }),

    moveKiteRight: (player) => action({
      prompt: 'Move right',
      condition: game.all(WorkerSpace, {occupiedColor: player.playerColor}).length >= 2 &&
      game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'left', topic: 'control'}).length > 0 && 
      game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'right', topic: 'control'}).length > 0
    }).do(() => {  
      const kite = game.first(KiteCard, {color: player.playerColor})!
      game.moveKiteRight(kite)
    }),

    moveKiteUp: (player) => action({
      prompt: 'Move up',
      condition: 
        game.all(WorkerSpace, {occupiedColor: player.playerColor}).length >= 2 &&
        game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'left', topic: 'pull'}).length > 0 && 
        game.all(WorkerSpace, {occupiedColor: player.playerColor, side: 'right', topic: 'pull'}).length > 0
    }).do(() => {  
      const kite = game.first(KiteCard, {color: player.playerColor})!
      game.moveKiteUp(kite);
    }).message("moved up"),

    skip: (player) => action({
      prompt: 'Skip',
    }).do(() => {
    }),

    moveWithWind: (player) => action({
      prompt: 'Move with wind'
    }).do(() => {
      const kite = game.first(KiteCard, {color: player.playerColor})!
      game.moveKiteWithWind(kite)
    }),

    useControl: (player) => action({
      prompt: 'Choose a hand to use control'
    }).chooseOnBoard(
      'hand', game.all(HandCard, {color: player.playerColor, charged: true})
    ).do(({ hand }) => {
      hand.charged = false
      hand.flipped = true
    }),

    chooseTrick: (player) => action({
      prompt: 'Choose which trick to plan',
    }).chooseOnBoard(
      'side', [$.trickFrontSpace.first(TrickCard)!, $.trickBackSpace.first(TrickCard)!]
    ).do(({ side }) => {
      // keep one side and discard the other
      side.putInto(game.first(TrickSpace, {color: player.playerColor})!);

      // clear choices
      game.all(TrickChoiceSpace).all(TrickCard).forEach(x => {
        x.putInto($.garbage)
      })
    }),

  });

  game.defineFlow(
    loop(       
      
      // shuffle the tricks
      () => {
        $.timerSpace.sortBy('shuffleOrder')        
      },

      // choose initial tricks
      eachPlayer({          
        name: 'turn', do: [  
          () => game.planTrick(),
          playerActions({ actions: ['chooseTrick']}),
        ]          
      }),
      
      // worker phase
      whileLoop({while: () => game.all(HandSpace).flatMap(x => x.all(HandCard)).length > 0, do: (        
        eachPlayer({          
          name: 'turn', do: [
            () => game.getPossibleActions(),
            playerActions({ actions: ['workerAction']}),
            () => game.syncPilotCards(),             
          ]          
        })        
      )}),

      () => game.clearHighlights(),

      // optional combined actions
      eachPlayer({          
        name: 'turn', do: [  
          playerActions({ actions: ['moveKiteDown', 'moveKiteLeft', 'moveKiteRight', 'moveKiteUp', 'skip']}),
        ]          
      }),
      
      // perform tricks phase

      () => game.returnWorkers(),

      // apply wind phase
      eachPlayer({          
        name: 'turn', do: [  
          forLoop({ name: 'wind', initial: 1, next: wind => wind + 1, while: wind => wind <= game.currentPlayerWindCount(), do: [
            playerActions({ actions: ['useControl', 'moveWithWind']})
          ]}),
        ]          
      }),

      // gusts phase

      // update timer
      () => game.updateTimer(),


      playerActions({ actions: []}),
    )
  );
});
