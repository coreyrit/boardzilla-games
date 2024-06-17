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
  firstPlayerColor: string = 'blue'

  soloWorkers() : void {

    // check for solo play and block some spaces
    if (this.players.length == 1) {

      const hands = ['left', 'right']
      let plannedTrick = false

      hands.forEach(hand => {
        const worker = Math.floor(this.game.random() * 6) + 1
        switch(worker) {
          case 1: {          
            this.first(WorkerSpace, {color: 'blue', side: hand, topic: 'push', action: '1'})!.occupiedColor = 'red'
            this.message('The AI placed their ' + hand + ' worker on push 1.');
            break;
          }
          case 2: {
            this.first(WorkerSpace, {color: 'blue', side: hand, topic: 'push', action: '1'})!.occupiedColor = 'red'
            this.first(WorkerSpace, {color: 'blue', side: hand, topic: 'push', action: '2'})!.occupiedColor = 'red'
            this.message('The AI placed their ' + hand + ' worker on push 2.');
            break;
          }
          case 3: {
            this.first(WorkerSpace, {color: 'blue', side: hand, topic: 'control', action: 'charge'})!.occupiedColor = 'red'
            this.message('The AI placed their ' + hand + ' worker on control charge.');
            break;
          }
          case 4: {
            this.first(WorkerSpace, {color: 'blue', side: hand, topic: 'control', action: 'charge'})!.occupiedColor = 'red'
            this.first(WorkerSpace, {color: 'blue', side: hand, topic: 'control', action: 'flip'})!.occupiedColor = 'red'
            this.message('The AI placed their ' + hand + ' worker on control flip.');
            break;
          }
          case 5: {
            this.first(WorkerSpace, {color: 'blue', side: hand, topic: 'pull', action: '1'})!.occupiedColor = 'red'
            this.message('The AI placed their ' + hand + ' worker on pull 1.');
            break;
          }
          case 6: {
            if(!plannedTrick && $.timerSpace.all(TrickCard).length >= 3) {
              const side1 = $.timerSpace.top(TrickCard)!; side1.putInto($.garbage)
              const side2 = $.timerSpace.top(TrickCard)!; side2.putInto($.garbage)
              plannedTrick = true
              this.message('The AI used their ' + hand + ' worker to plan.');
              this.message(side1.nm + '/'  + side2.nm + ' is removed from the game');
            } else if(!plannedTrick && this.first(TrickSpace, {color: 'red'})!.all(TrickCard).length > 0) {
              this.first(TrickSpace, {color: 'red'})!.first(TrickCard)!.putInto(this.first(ScoreSpace, {color: 'red'})!);
            }
            break;
          }
        }
      })
    }
  }

  playerScore(playerColor: string) : number {
    let performedTricks = 0;
    this.first(ScoreSpace, {color: playerColor})!.all(TrickCard).forEach(x => performedTricks += x.vp);
    
    let plannedTricks = 0
    this.first(TrickSpace, {color: playerColor})!.all(TrickCard).forEach(x => plannedTricks += (x.name == 'final-trick' ? 0 : x.vp));
    
    const stringPairs = Math.min(
      this.first(ScoreSpace, {color: playerColor})!.all(TrickCard, {status: 'cross'}).length, 
      this.first(ScoreSpace, {color: playerColor})!.all(TrickCard, {status: 'uncross'}).length
    )
    return performedTricks - plannedTricks + stringPairs
  }

  planTrick(player: StuntKitesPlayer): void {
    const side1 = $.timerSpace.top(TrickCard)!; side1.putInto($.trickFrontSpace);
    const side2 = $.timerSpace.top(TrickCard)!; side2.putInto($.trickBackSpace);

    this.game.message(player.name +  ' is choosing between ' + side1.nm + ' and ' + side2.nm + '.')
    
    if($.timerSpace.all(TrickCard).length == 1) {
      this.planFinalTrick();    
    }
  }

  clearHighlights(): void {
    // clear the pilot card
    this.game.all(WorkerSpace).forEach(x => {      
      x.highlight = false
    })
  }

  getPossibleActions() : void {
    const player = this.players.current()!
    // this.message("player " + player.playerColor + " is going")

    // make sure they can click the spaces
    this.all(PilotSpace).forEach(x => {
      x.sortBy(player.playerColor + 'Order')
    })

    // highlight available actions              
    this.all(WorkerSpace).forEach(x => {
      x.highlight = false;
    })
    const possibleActions = this.all(WorkerSpace, {occupiedColor: 'none'}).filter(
      x => 
        // must not be owned or owned by current player
        (x.ownerColor == 'none' || x.ownerColor == player.playerColor)
        &&
        // there is an available hand on that side
        this.all(HandSpace).all(HandCard, {color: x.color, side: x.side}).length > 0
        &&        
        (
          // either doesn't rquire a charge
          (
            // no chage needed
            !x.requiresCharge
            &&
            // and its not a flip where the charge is already covered
            (
              // either not the flip action
              x.action != 'flip'
              ||
              // or the charge action inside is not covered
              this.all(WorkerSpace, {color: player.playerColor, side: x.side, action: 'charge', occupiedColor: 'none'}).length > 0
            )
          )
          ||
          // or a hand is available that IS charged
          (
            this.all(HandSpace).all(HandCard, {color: x.color, side: x.side, charged: true}).length > 0
          )
        )
      )

    possibleActions.forEach(x => {
      x.highlight = true
    })

    this.first(WorkerSpace, {name: 'plan'})!.highlight = true
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
        const otherSpace = this.first(WorkerSpace, {
          color: otherColor, 
          side: otherSide, 
          topic: otherTopic, 
          action: otherAction})!
        otherSpace.occupiedColor = space.occupiedColor
        otherSpace.occupiedCharge = space.occupiedCharge
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
    this.all(HandCard).forEach(x => {
      x.putInto(this.first(HandSpace, {color: x.color, side: x.side})!)
    })
    this.all(WorkerSpace).forEach(x => {
      x.occupiedColor = 'none'
      x.occupiedCharge = ''
    })
  }

  moveKiteUp(kite: KiteCard): void {
    const space = kite.container(FlightCell)!
    if(space.rowNumber < 5) {
      kite.putInto(this.first(FlightCell, {rowNumber: space.rowNumber+1, column: space.column, color: kite.color})!)
    }
  }
  moveKiteLeft(kite: KiteCard): void {
    const space = kite.container(FlightCell)!
    if(space.column > 1) {
      kite.putInto(this.first(FlightCell, {rowNumber: space.rowNumber, column: space.column-1, color: kite.color})!)
    } else {
      if(space.rowNumber >= 1) {
        this.moveKiteDown(kite)
      }
    }
  }
  moveKiteRight(kite: KiteCard): void {
    const space = kite.container(FlightCell)!
    if(space.column < 7) {
      kite.putInto(this.first(FlightCell, {rowNumber: space.rowNumber, column: space.column+1, color: kite.color})!)
    } else {
      if(space.rowNumber >= 1) {
        this.moveKiteDown(kite)
      }
    }
  }
  moveKiteDown(kite: KiteCard): void {
    const space = kite.container(FlightCell)!
    if(space.rowNumber > 1) {
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

  planFinalTrick() : void {
    // give both players the final trick
    $.garbage.first(TrickCard, {name: 'final-trick'})!.putInto(this.first(TrickSpace, {color: 'blue'})!)
    $.garbage.first(TrickCard, {name: 'final-trick'})!.putInto(this.first(TrickSpace, {color: 'red'})!)
    this.first(TrickCard, {name: 'timer'})!.putInto($.garbage)
  }

  updateTimer(): void {
    $.timerSpace.rotation += 90

    if ($.timerSpace.rotation == 270) {
      // remove the bottom card from the deck
      if($.timerSpace.all(TrickCard).length >= 3) {
        $.timerSpace.top(TrickCard)!.putInto($.garbage)
        $.timerSpace.top(TrickCard)!.putInto($.garbage)
      }
      
      if($.timerSpace.all(TrickCard).length == 1) {
        this.planFinalTrick();    
      }
    }
  }

  changeFirstPlayer() : void {
    if(this.players.length > 1) {
      this.game.all(PilotCard).forEach(x => {
        x.color = x.color == 'blue' ? 'red' : 'blue'
      })
      this.firstPlayerColor = this.firstPlayerColor == 'blue' ? 'red' : 'blue'
      this.players.reverse()
    }
  }

  playerHasGust(player: StuntKitesPlayer) : boolean {
    const kite = this.first(KiteCard, {color: player.playerColor})!
    const wind : number = kite.container(FlightCell)!.windCount
    const playerWinds = this.first(ScoreSpace, {color: player.playerColor})!.all(TrickCard).map(x => {
      return x.rotation == 90 ? x.wind : x.xwind
    })
    return playerWinds.includes(wind)
  }

  checkForGameEnd() : void {
    const blueFinalTrick = this.first(ScoreSpace, {color: 'blue'})!.all(TrickCard, {name: 'final-trick'}).length > 0
    const redFinalTrick = this.first(ScoreSpace, {color: 'red'})!.all(TrickCard, {name: 'final-trick'}).length > 0

    // check for game end
    if(blueFinalTrick || redFinalTrick) {
      if(this.players.length > 1) {
        let blueScore = this.playerScore('blue')
        let redScore = this.playerScore('red')
  
        this.message('Blue player scored ' + blueScore)
        this.message('Red player scored ' + redScore)
    
        if(blueScore > redScore) {
          this.finish(this.players.filter(x => x.playerColor == 'blue'), 'blueWin')
        } else if(redScore > blueScore) {
          this.finish(this.players.filter(x => x.playerColor == 'red'), 'redWin')
        } else {
          if (blueFinalTrick && !redFinalTrick) {
            this.finish(this.players.filter(x => x.playerColor == 'blue'), 'blueWin')
          } else if(!blueFinalTrick && redFinalTrick) {
            this.finish(this.players.filter(x => x.playerColor == 'red'), 'redWin')
          } else {
            this.finish(undefined, 'tie')
         }
        }
      } else {
        let blueScore = this.playerScore('blue')
        this.message('Blue player scored ' + blueScore)
        if(blueScore <= 8) {
          this.finish(this.players[0], 'keepPracticing')
        } else if(blueScore >= 9 && blueScore <= 12) {
          this.finish(this.players[0], 'justForFun')
        } else if(blueScore >= 13 && blueScore <= 16) {
          this.finish(this.players[0], 'competitive')
        } else if(blueScore >= 17 && blueScore <= 20) {
          this.finish(this.players[0], 'challenger')
        } else [
          this.finish(this.players[0], 'champion')
        ]
      }
    }
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
export class ScoreSpace extends Space<MyGame> {
  color: string  
}
export class ScoreCell extends Space<MyGame> {
  color: string
  filled: boolean = false;
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

export class HandCard extends Piece<MyGame> {
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
  occupiedCharge: string = ''
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
  status: 'plan' | 'cross' | 'uncross' = 'plan'

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


  inPosition(kite: KiteCard) : boolean {
    const space = kite.container(FlightCell)!
    return space.cloudFill == this.reqFill &&
      this.reqRows.includes(space.rowLetter) &&
      (
        (kite.rotation == this.ltReqDeg && space.cloudCount == 1) 
        || 
        (kite.rotation == this.rtReqDeg && space.cloudCount == 2)
      )      
  }
}

// export class TimerCard extends TrickCard {

// }

export class KiteCard extends Card {
  color: string  
}

export default createGame(StuntKitesPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer, whileLoop, forLoop } = game.flowCommands;  

  // set up players
  game.players[0].playerColor = 'blue'
  if(game.players.length > 1) {
    game.players[1].playerColor = 'red'
  }

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
  $.timerSpace.create(WorkerSpace, 'plan', {color: 'none', side: 'none', topic: 'none', action: 'plan', requiresCharge: false})

  game.create(TrickChoiceSpace, 'trickFrontSpace')
  game.create(TrickChoiceSpace, 'trickBackSpace')

  // player spaces
  game.create(FlightSpace, 'redFlightSpace')
  game.create(HandSpace, 'redHandLeftSpace', {color: 'red', side: 'left'})
  game.create(HandSpace, 'redHandRightSpace', {color: 'red', side: 'right'})
  game.create(TrickSpace, 'redTricksSpace', {color: 'red'})
  game.create(ScoreSpace, 'redScoreSpace', {color: 'red'})

  game.create(FlightSpace, 'blueFlightSpace')
  game.create(HandSpace, 'blueHandLeftSpace', {color: 'blue', side: 'left'})
  game.create(HandSpace, 'blueHandRightSpace', {color: 'blue', side: 'right'})
  game.create(TrickSpace, 'blueTricksSpace', {color: 'blue'})  
  game.create(ScoreSpace, 'blueScoreSpace', {color: 'blue'})

  // 8 possible trick cards
  // for(let i = 1; i <= 8; i++) {
  //   $.redScoreSpace.create(ScoreCell, 'red-score-' + i, {color: 'red'})
  //   $.blueScoreSpace.create(ScoreCell, 'blue-score-' + i, {color: 'blue'})
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

  $.timerSpace.create(TrickCard, 'timer', {shuffleOrder: 1.5}) // force timer on top when shuffled
  
  // 2 final cards one per player
  $.garbage.create(TrickCard, 'final-trick', 
    {nm: "Final Trick", vp: 1, wind: 0, xwind: 0, reqFill: false, reqRows: ["B"], ltReqDeg: 0, 
      rtReqDeg: 0, flip: true, hor: 0, ver: -1, spin: 0, shuffleOrder: 1});
  $.garbage.create(TrickCard, 'final-trick', 
    {nm: "Final Trick", vp: 1, wind: 0, xwind: 0, reqFill: false, reqRows: ["B"], ltReqDeg: 0, 
      rtReqDeg: 0, flip: true, hor: 0, ver: -1, spin: 0, shuffleOrder: 1});


  $.blueHandLeftSpace.create(HandCard, 'blue-left', {side: 'left', color: 'blue', rotation: 45});
  $.blueHandRightSpace.create(HandCard, 'blue-right', {side: 'right', color: 'blue', rotation: 315});    

  if(game.players.length > 1) {
    $.redHandLeftSpace.create(HandCard, 'red-left', {side: 'left', color: 'red', rotation: 45});
    $.redHandRightSpace.create(HandCard, 'red-right', {side: 'right', color: 'red', rotation: 315});
  }

  $.blueFlightSpace.create(FlightCard, 'flight-1')
  if(game.players.length > 1) {
    $.redFlightSpace.create(FlightCard, 'flight-1')
  }
  for (const flightCell of flight1aCells) {
    const blueCell = $.blueFlightSpace.create(FlightCell, 'blue-' + flightCell.rowLetter + ',' + flightCell.column, flightCell)
    blueCell.color = 'blue'
    if(game.players.length > 1) {
      const redCell = $.redFlightSpace.create(FlightCell, 'red-' + flightCell.rowLetter + ',' + flightCell.column, flightCell)
      redCell.color = 'red'
    }
  }

  $.blueFlightSpace.first(FlightCell, {rowLetter: 'A', column: 4})!.create(KiteCard, 'blueKite', {color: 'blue', rotation: 0, flipped: false});
  if(game.players.length > 1) {
    $.redFlightSpace.first(FlightCell, {rowLetter: 'A', column: 4})!.create(KiteCard, 'redKite', {color: 'red', rotation: 0, flipped: false});
  }

  game.defineActions({

    // plan: (player) => action({
    //   prompt: 'Plan',
    //   condition: $.timerSpace.all(TrickCard).length >= 3
    // }).do(() => {
    //   game.followUp({name: 'planHand'});
    // }),

    planHand: (player) => action({
      prompt: 'Choose a hand to plan with'
    }).chooseOnBoard(
      'hand', game.all(HandCard, {color: player.playerColor})
    ).do(({ hand }) => {
      hand.putInto($.garbage)
      game.message(player.name + ' used their ' + hand.side + ' worker to plan.');

      game.planTrick(player)
      game.followUp({name: 'chooseTrick'});
    }),

    workerAction: (player) => action({
      prompt: 'Choose a highlighted triangle to place a worker'
    }).chooseOnBoard(
      'space', game.all(WorkerSpace, {'highlight': true}),
      { skipIf: 'never' }
    ).do(({ space }) => {  

      if (space.name == 'plan') {        
        game.followUp({name: 'planHand'});
        return;
      }

      const worker = game.first(HandCard, {color: player.playerColor, side: space.side})!;
      const kite = game.first(KiteCard, {color: player.playerColor})!

      // block the space
      space.occupiedColor = worker.color      
      let double = false

      // check for charge
      if(space.action == 'charge') {
        worker.charged = true
      } else if(space.action == 'flip') {
        kite.flipped = !kite.flipped
      }

      // use charge for inside actions
      if(space.action == '2' || space.action == 'flip') {
        worker.charged = false
      }

      // if the player went inside, technically the outside spot is blocked too
      switch(space.action) {
        case '2': {
          const inside = game.first(WorkerSpace, {occupiedColor: 'none', side: space.side, color: player.playerColor, topic: space.topic, action: '1'})
          if(inside != undefined) {
            double = true
            inside.occupiedColor = worker.color
          }
          break;
        }
        case 'flip': {
          const inside = game.first(WorkerSpace, {occupiedColor: 'none', side: space.side, color: player.playerColor, topic: space.topic, action: 'charge'})
          if(inside != undefined) {
            double = true
            inside.occupiedColor = worker.color
          }
          break
        }
      }

      worker.putInto($.garbage)      

      switch(space.topic) {
        case 'push': {
          kite.rotation += space.side == 'left' ? 45 : -45;
          if(space.action == '2' && double) {            
            kite.rotation += space.side == 'left' ? 45 : -45;
          }
          break;
        }
        case 'pull': {
          kite.rotation += space.side == 'right' ? 45 : -45;
          if(space.action == '2' && double) {
            kite.rotation += space.side == 'right' ? 45 : -45;
          }
          break;
        }
      }

      // update the charged symbol on the space
      space.occupiedCharge = worker.charged ? "+" : "-"

      game.message(player.name + ' placed their ' + worker.side + ' worker on ' + space.topic + ' ' + space.action + '.');
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

    gustKite: (player) => action({
      prompt: 'Use gust',
      condition: game.playerHasGust(player),
    }).chooseFrom(
      "direction", ["Up", "Down", "Left", "Right"]
    ).do(({direction}) => {  
      const kite = game.first(KiteCard, {color: player.playerColor})!
      switch(direction) {
        case 'Up': {game.moveKiteUp(kite); break}
        case 'Down': {game.moveKiteDown(kite); break}
        case 'Left': {game.moveKiteLeft(kite); break}
        case 'Right': {game.moveKiteRight(kite); break}
      }
    }),

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
    }),

    chooseTrick: (player) => action({
      prompt: 'Choose which trick to plan',
    }).chooseOnBoard(
      'side', [$.trickFrontSpace.first(TrickCard)!, $.trickBackSpace.first(TrickCard)!]
    ).do(({ side }) => {
      // keep one side and discard the other
      side.putInto(game.first(TrickSpace, {color: player.playerColor})!);  
      
      game.message(player.name +  ' chose ' + side.nm + '.')

      // clear choices
      game.all(TrickChoiceSpace).all(TrickCard).forEach(x => {
        x.putInto($.garbage)
      })
    }),

    performTrick: (player) => action({
      prompt: 'Choose to perform trick',
    }).chooseOnBoard(
      'trick', game.first(TrickSpace, {color: player.playerColor})!.all(TrickCard)
        .filter(x => x.inPosition( game.first(KiteCard, {color: player.playerColor})!))
    ).do(({ trick }) => {
      // move the kite based on trick
      const kite = game.first(KiteCard, {color: player.playerColor})!
      const space = kite.container(FlightCell)!

      // flip
      if(trick.flip) {
        kite.flipped = !kite.flipped
      }

      // move horizontal
      for(let x = 0; x < trick.hor; x++) {
        space.cloudCount == 1 ? game.moveKiteRight(kite) : game.moveKiteLeft(kite)
      }

      // move vertical
      for(let y = 0; y < Math.abs(trick.ver); y++) {
        trick.ver > 0  ? game.moveKiteUp(kite) : game.moveKiteDown(kite)
      }

      // rotate
      kite.rotation += space.cloudCount == 1 ? trick.spin : -trick.spin

      // then store with appropriate lines side up
      if(kite.flipped) {
        // trick.rotation = 270
        trick.status = 'cross'
      } else {
        // trick.rotation = 90
        trick.status = 'uncross'
      }
      
      // const cell = game.first(ScoreSpace, {color: player.playerColor})!.first(ScoreCell, {filled: false})!
      // cell.filled = true
      // cell.rotation = 90
      // trick.putInto(cell)

      trick.rotation = kite.flipped ? 270 : 90
      trick.putInto(game.first(ScoreSpace, {color: player.playerColor})!)
    }),

  });
  

  game.defineFlow(        
      // shuffle the tricks
      () => {
        $.timerSpace.sortBy('shuffleOrder')  
        $.timerSpace.rotation = 270      
      },

      // choose initial tricks
      eachPlayer({          
        name: 'turn', do: [  
          ({turn}) => game.planTrick(turn),
          playerActions({ actions: ['chooseTrick']}),
        ]          
      }),

    // start the game  
    loop(
      
      // solo placement
      () => game.soloWorkers(),
      
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
      eachPlayer({          
        name: 'turn', do: [  
          playerActions({ actions: ['performTrick', 'skip']}),
        ]          
      }),

      () => game.returnWorkers(),

      // apply wind phase
      eachPlayer({          
        name: 'turn', do: [  
          forLoop({ name: 'wind', initial: 1, next: wind => wind + 1, while: wind => wind <= game.currentPlayerWindCount(), do: [
            playerActions({ 
              actions: ['useControl', 'moveWithWind']})
          ]}),
        ]          
      }),

      // gusts phase
      eachPlayer({          
        name: 'turn', do: [  
          playerActions({ 
            actions: ['gustKite', 'skip']}),
        ]          
      }),

      // check for game end
      () => game.checkForGameEnd(),

      // update timer
      () => game.updateTimer(),

      // change first player
      () => game.changeFirstPlayer(),
    )
  );
});
