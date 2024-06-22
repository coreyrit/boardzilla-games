import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';
import { skip } from 'node:test';
import { Handler } from 'puppeteer/internal/types.js';

export class StarborgVsBot10Player extends Player<MyGame, StarborgVsBot10Player> {
}


export class Starborg extends Piece<MyGame> {
  isHandler: boolean = true;
  color: 'red' | 'blue' | 'green' | 'black' | 'yellow'

  dieActions : Record<number, string>
}

export class Movement {
  moveDirection: 'right' | 'left'
  handlerColor: 'red' | 'blue' | 'green' | 'black' | 'yellow'
}

export class Bot10 extends Piece<MyGame> {
  phase1: 'vehicle' | 'move-left' | 'move-right' | 'attack'

  topMovmeent: Movement;
  bottomMovement: Movement;
}

export class VehicleSpace extends Space<MyGame> {
  index: number
}

export class MovementSpace extends Space<MyGame> {

}

export class HandlerSpace extends Space<MyGame> {
  index: number
}

export class PlayerSpace extends Space<MyGame> {

}

export class Die extends Piece<MyGame> {
  face: number = 1
  locked: boolean = true

  roll(): void {
    this.face = Math.floor(this.game.random() * 6 + 1)
  }
  override toString(): string {
    return this.face.toString()
  }

  getLeftHandler() : HandlerSpace {
    const myHandler = this.container(HandlerSpace)!
    const leftHandler = myHandler.index == 1 ? 
      myHandler : 
      this.game.first(HandlerSpace, {index: myHandler.index-1})!
    return leftHandler
  }

  getRightHandler() : HandlerSpace {
    const myHandler = this.container(HandlerSpace)!
    const leftHandler = myHandler.index == 5 ? 
      myHandler : 
      this.game.first(HandlerSpace, {index: myHandler.index+1})!
    return leftHandler
  }
}

class MyGame extends Game<MyGame, StarborgVsBot10Player> {
  nextAction : string = 'none'

  bot10damge : number = 0

  selectedDie: Die | undefined = undefined
  selectedHandler: HandlerSpace | undefined = undefined

  getAction(handler: HandlerSpace, die: Die) : string {
    return handler.first(Starborg)!.dieActions[die.face]
  }

  clearSelectionsAndMove() : void {
    if(this.selectedDie != undefined && this.selectedHandler != undefined) {
      this.selectedDie.putInto(this.selectedHandler)
    }
    this.selectedDie = undefined
    this.selectedHandler = undefined
  }

  performMove(move: Bot10) : void {
    const movemment = move.rotation == 180 ? move.topMovmeent : move.bottomMovement
    const vehicle = this.first(Bot10, {phase1: 'vehicle'})!
    const space = vehicle.container(VehicleSpace)!
    if(movemment.moveDirection == 'left') {
      if(space.index == 1) {
        vehicle.putInto(this.first(VehicleSpace, {index: 5})!);
      } else {
        vehicle.putInto(this.first(VehicleSpace, {index: space.index-1})!);
      }
    } else {
      if(space.index == 5) {
        vehicle.putInto(this.first(VehicleSpace, {index: 1})!);
      } else {
        vehicle.putInto(this.first(VehicleSpace, {index: space.index+1})!);
      }
    }
    if(move.phase1 == 'attack') {
      // find the handler in the same column
      const handler = this.first(HandlerSpace, {index: space.index})!
      const die = handler.first(Die)
      if(die != undefined) {
        // dice protect handlers
        die.putInto($.player)
      } else {
        const card = handler.first(Starborg)!
        if(card.rotation == 90) {
          this.finish(undefined)
        } else {
          card.rotation = 90
        }
      }
    }
  }
}

export default createGame(StarborgVsBot10Player, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer, whileLoop, forLoop } = game.flowCommands;

  game.create(Space, 'phase1')

  $.phase1.create(Space, 'movement')
  $.phase1.create(Space, 'vehicles')
  $.phase1.create(Space, 'handlers')
  $.phase1.create(PlayerSpace, 'player')

  $.movement.create(MovementSpace, 'move1')
  $.movement.create(MovementSpace, 'move2')
  $.movement.create(MovementSpace, 'move3')

  $.move1.create(Bot10, 'move-1_and_bot10nw', 
    {phase1: 'move-left',
     topMovmeent: {handlerColor: 'red', moveDirection: 'left'},
     bottomMovement: {handlerColor: 'green', moveDirection: 'left'}})
  $.move2.create(Bot10, 'move-2_and_bot10ne', 
    {phase1: 'attack', 
     topMovmeent: {handlerColor: 'black', moveDirection: 'right'},
     bottomMovement: {handlerColor: 'black', moveDirection: 'left'}})
  $.move3.create(Bot10, 'move-3_and_bot10sw', 
    {phase1: 'move-right',
     topMovmeent: {handlerColor: 'yellow', moveDirection: 'right'},
     bottomMovement: {handlerColor: 'blue', moveDirection: 'right'}})

  $.vehicles.create(VehicleSpace, 'vehicle1', {index: 1})
  $.vehicles.create(VehicleSpace, 'vehicle2', {index: 2})
  $.vehicles.create(VehicleSpace, 'vehicle3', {index: 3})
  $.vehicles.create(VehicleSpace, 'vehicle4', {index: 4})
  $.vehicles.create(VehicleSpace, 'vehicle5', {index: 5})

  const vehicle = $.vehicle3.create(Bot10, 'vehicle_and_bot10se', {phase1: 'vehicle'})
  vehicle.rotation = 270


  $.handlers.create(HandlerSpace, 'handler1', {index: 1})
  $.handlers.create(HandlerSpace, 'handler2', {index: 2})
  $.handlers.create(HandlerSpace, 'handler3', {index: 3})
  $.handlers.create(HandlerSpace, 'handler4', {index: 4})
  $.handlers.create(HandlerSpace, 'handler5', {index: 5})

  $.handler1.create(Starborg, 'green-handler_and_left-arm', {color: 'green', dieActions: {
    1: 'add1',
    2: 'swap',
    3: 'shiftRight',
    4: 'addSub1',
    5: 'roll',
    6: 'set'
  }})
  
  $.handler2.create(Starborg, 'red-handler_and_right-arm', {color: 'red', dieActions: {
    1: 'shiftLeft',
    2: 'addSub1',
    3: 'roll',
    4: 'sub1',
    5: 'swap',
    6: 'set'
  }})

  $.handler3.create(Starborg, 'black-handler_and_head', {color: 'black', dieActions: {
    1: 'shiftRight',
    2: 'move',
    3: 'swap',
    4: 'set',
    5: 'shiftLeft',
    6: 'heal'
  }})

  $.handler4.create(Starborg, 'yellow-handler_and_left-leg', {color: 'yellow', dieActions: {
    1: 'moveLeftRight',
    2: 'rotate',
    3: 'shiftLeft',
    4: 'swap',
    5: 'moveLeft',
    6: 'move'
  }})

  $.handler5.create(Starborg, 'blue-handler_and_right-leg', {color: 'blue', dieActions: {
    1: 'swap',
    2: 'shiftRight',
    3: 'moveRight',
    4: 'rotate',
    5: 'moveLeftRight',
    6: 'move'
  }})

  $.player.create(Die, 'die1')
  $.player.create(Die, 'die2')
  $.player.create(Die, 'die3')

  $.player.onEnter(Die, x => {
    x.locked = false
  })

  game.defineActions({
    
    chooseDice: (player) => action({
      prompt: 'Choose 2 dice to remove',
      condition: $.player.all(Die).length == 0
    }).chooseOnBoard(
      'dice', $.handlers.all(Die),
      {number: 2}
    ).do(({ dice }) => {
      dice.forEach(x => {
        x.putInto($.player)        
      });
    }),

    chooseDie: (player) => action({
      prompt: 'Choose 1 die to remove',
      condition: $.player.all(Die).length == 1
    }).chooseOnBoard(
      'dice', $.handlers.all(Die),
      {number: 1}
    ).do(({ dice }) => {
      dice.forEach(x => {
        x.putInto($.player)        
      });
    }),

    choosePlayerDie: (player) => action({
      prompt: 'Choose a die to place',      
    }).chooseOnBoard(
      'die', $.player.all(Die),
      {skipIf: 'never'}
    ).do(({ die }) => {
      game.selectedDie = die
    }),


    chooseHandler: (player) => action({
      prompt: 'Choose a handler for this die',
    }).chooseOnBoard(
      'handler', game.all(HandlerSpace).filter(x => x.all(Die).length == 0)
    ).do(({ handler }) => {
      game.selectedDie!.putInto(handler)
      const h = handler.first(Starborg)!
      if(h.rotation != 90) {
        game.nextAction = game.getAction(handler, game.selectedDie!)
      } else {
        game.nextAction = 'none'
      }
      game.selectedDie = undefined
    }),


    // SET
    roll: () => action({
      prompt: 'Choose a die to roll',
    }).chooseOnBoard(
      'die', game.all(HandlerSpace).all(Die)
    ).do(({ die }) => {
      die.roll()
      game.nextAction = game.getAction(die.container(HandlerSpace)!, die)
    }),

    sub1: (player) => action({
      prompt: 'Choose a die to decrease by 1',
      condition: game.all(HandlerSpace).all(Die).filter(x => x.face > 1).length > 0
    }).chooseOnBoard(
      'die', game.all(HandlerSpace).all(Die).filter(x => x.face > 1),
      {skipIf: 'never'}
    ).do(({ die }) => {
      die.face = die.face - 1
      game.nextAction = game.getAction(die.container(HandlerSpace)!, die)
    }),
    add1: (player) => action({
      prompt: 'Choose a die to increase by 1',
      condition: game.all(HandlerSpace).all(Die).filter(x => x.face < 6).length > 0
    }).chooseOnBoard(
      'die', game.all(HandlerSpace).all(Die).filter(x => x.face < 6),
      {skipIf: 'never'}
    ).do(({ die }) => {
      die.face = die.face + 1
      game.nextAction = game.getAction(die.container(HandlerSpace)!, die)
    }),
    addSub1: (player) => action({
      prompt: 'Choose a die to increase or decrease by 1',
    }).chooseOnBoard('die', game.all(HandlerSpace).all(Die)
    ).do(({ die }) => {
      game.selectedDie = die; 
      if(die.face == 1) {
        game.followUp({name: 'addSubFollowUp1'})
      } else if(die.face == 6) {
        game.followUp({name: 'addSubFollowUp6'}) 
      } else {
        game.followUp({name: 'addSubFollowUp'})
      }
    }),

    set: (player) => action({
      prompt: 'Choose a die to set',
    }).chooseOnBoard('die', game.all(HandlerSpace).all(Die)
    ).do(({ die }) => {game.selectedDie = die; game.followUp({name: 'setFollowUp'})}),
    
    setFollowUp: (player) => action({
      prompt: 'Set a value',
    }).chooseFrom(
      "value", ["1", "2", "3", "4", "5", "6"]
    ).do(({ value }) => {
      const val = +value
      if (game.selectedDie!.face == val) {
        game.nextAction = 'none'
      } else {
        game.selectedDie!.face = val      
        game.nextAction = game.getAction(game.selectedDie!.container(HandlerSpace)!, game.selectedDie!)
      }
    }),
    addSubFollowUp1: (player) => action({
      prompt: 'Increase',
    }).chooseFrom(
      "value", ["+1"], {skipIf: 'never'}
    ).do(({ value }) => {
      const val = game.selectedDie!.face + 1
      game.selectedDie!.face = val
      game.nextAction = game.getAction(game.selectedDie!.container(HandlerSpace)!, game.selectedDie!)
    }),
    addSubFollowUp6: (player) => action({
      prompt: 'Decrease',
    }).chooseFrom(
      "value", ["-1"], {skipIf: 'never'}
    ).do(({ value }) => {
      const val = game.selectedDie!.face -1
      game.selectedDie!.face = val
      game.nextAction = game.getAction(game.selectedDie!.container(HandlerSpace)!, game.selectedDie!)
    }),
    addSubFollowUp: (player) => action({
      prompt: 'Decrease or Increase',
    }).chooseFrom(
      "value", ["-1", "+1"]
    ).do(({ value }) => {
      const val = game.selectedDie!.face + (value == "-1" ? -1 : 1)
      game.selectedDie!.face = val
      game.nextAction = game.getAction(game.selectedDie!.container(HandlerSpace)!, game.selectedDie!)
    }),

    // MOVE
    move: (player) => action({
      prompt: 'Choose a die to move',
    }).chooseOnBoard('die', game.all(HandlerSpace).all(Die)
    ).do(({ die }) => {game.selectedDie = die; game.followUp({name: 'moveFollowUp'})}),    

    moveFollowUp: (player) => action({
      prompt: 'Choose a handler to move to',
    }).chooseOnBoard(
      'handler', game.all(HandlerSpace).filter(x => x.all(Die).length == 0)
        .concat(game.selectedDie!.container(HandlerSpace)!)
    ).do(({ handler }) => {
      const dieHandler = game.selectedDie!.container(HandlerSpace)!
      if (handler == dieHandler) {
        // didn't move
        game.nextAction = 'none'
      } else {
        game.selectedHandler = handler
        game.nextAction = game.getAction(handler, game.selectedDie!)
      }
    }),

    moveLeftRight: (player) => action({
      prompt: 'Choose a die to move left or right',
      condition: (
        game.all(HandlerSpace).all(Die).filter(x => x.getLeftHandler().all(Die).length == 0).length +
        game.all(HandlerSpace).all(Die).filter(x => x.getRightHandler().all(Die).length == 0).length
        ) > 0
    }).chooseOnBoard(
      'die', game.all(HandlerSpace).all(Die).filter(x => x.getLeftHandler().all(Die).length == 0).concat(
        game.all(HandlerSpace).all(Die).filter(x => x.getRightHandler().all(Die).length == 0)),
    ).do(({ die }) => {
      const myHandler = die.container(HandlerSpace)!
      game.selectedDie = die;
      if(myHandler == die.getLeftHandler() || die.getLeftHandler().all(Die).length > 0) {
        game.followUp({name: 'leftRightFollowUpRight'})
      } else if(myHandler == die.getRightHandler() || die.getRightHandler().all(Die).length > 0) {
        game.followUp({name: 'leftRightFollowUpLeft'}) 
      } else {
        game.followUp({name: 'leftRightFollowUp'})
      }
    }),

    leftRightFollowUpLeft: (player) => action({
      prompt: 'Move left',
    }).chooseFrom(
      "direction", ["left"], {skipIf: 'never'}
    ).do(({ direction }) => {
      const leftHandler = game.selectedDie!.getLeftHandler()
      game.selectedHandler = leftHandler
      game.nextAction = game.getAction(leftHandler, game.selectedDie!)
    }),
    leftRightFollowUpRight: (player) => action({
      prompt: 'Move right',
    }).chooseFrom(
      "direction", ["right"], {skipIf: 'never'}
    ).do(({ direction }) => {
      const rightHandler = game.selectedDie!.getRightHandler()
      game.selectedHandler = rightHandler
      game.nextAction = game.getAction(rightHandler, game.selectedDie!)
    }),
    leftRightFollowUp: (player) => action({
      prompt: 'Move left or right',
    }).chooseFrom(
      "direction", ["Left", "Right"]
    ).do(({ direction }) => {
      const handler = direction == 'Left' ? game.selectedDie!.getLeftHandler() : game.selectedDie!.getRightHandler()
      game.selectedHandler = handler
      game.nextAction = game.getAction(handler, game.selectedDie!)
    }),

    moveLeft: (player) => action({
      prompt: 'Choose a die to move left',
      condition: game.all(HandlerSpace).all(Die).filter(x => x.getLeftHandler().all(Die).length == 0).length > 0
    }).chooseOnBoard(
      'die', game.all(HandlerSpace).all(Die).filter(x => x.getLeftHandler().all(Die).length == 0),
      {skipIf: 'never'}
    ).do(({ die }) => {
      const leftHandler = die.getLeftHandler()
      die.putInto(leftHandler)
      game.nextAction = game.getAction(leftHandler, die)
    }),

    moveRight: (player) => action({
      prompt: 'Choose a die to move right',
      condition: game.all(HandlerSpace).all(Die).filter(x => x.getRightHandler().all(Die).length == 0).length > 0
    }).chooseOnBoard(
      'die', game.all(HandlerSpace).all(Die).filter(x => x.getRightHandler().all(Die).length == 0),
      {skipIf: 'never'}
    ).do(({ die }) => {
      const rightHandler = die.getRightHandler()
      die.putInto(rightHandler)
      game.nextAction = game.getAction(rightHandler, die)
    }),

    swap: (player) => action({
      prompt: 'Choose 2 Handlers to swap',
    }).chooseOnBoard(
      'handlers', game.all(Starborg),
      {number: 2}
    ).do(({ handlers }) => {
      const h1 = handlers[0].container(HandlerSpace)!
      const h2 = handlers[1].container(HandlerSpace)!
      const d1 = h1.first(Die)
      const d2 = h2.first(Die)

      handlers[0].putInto(h2)
      handlers[1].putInto(h1)
      if(d1 != undefined) {
        d1.putInto(h2)
      }
      if(d2 != undefined) {
        d2.putInto(h1)
      }
      game.nextAction = 'none'
    }),  

    shiftLeft: () => action().do(
      () =>{
        const move1 = $.move1.first(Bot10)!
        const move2 = $.move2.first(Bot10)!
        const move3 = $.move3.first(Bot10)!
        move1.putInto($.move3)
        move3.putInto($.move2)
        move2.putInto($.move1)
        game.nextAction = 'none'
      }
    ),
    shiftRight: () => action().do(
      () =>{
        const move1 = $.move1.first(Bot10)!
        const move2 = $.move2.first(Bot10)!
        const move3 = $.move3.first(Bot10)!
        move3.putInto($.move1)
        move1.putInto($.move2)
        move2.putInto($.move3)
        game.nextAction = 'none'
      }
    ),
    rotate: () => action().do(
      () =>{
        const attack = game.first(Bot10, {phase1: 'vehicle'})!
        attack.rotation += 180
        game.nextAction = 'none'
      }
    ),
    heal: () => action().do(
      () =>{
        game.message('nothing yet')
        game.nextAction = 'none'
      }
    ),

    nextAction: () => action().do(
      () => game.followUp({name: game.nextAction})      
    )

  });

  game.defineFlow(

    // set up for phase 1
    () => {
      // roll and place dice
      game.all(Die).forEach(x => {x.roll()});
      const dice : Die[] = game.all(Die).sortBy('face')
      dice[0].putInto($.handler1)
      dice[1].putInto($.handler3)
      dice[2].putInto($.handler5)
    },

    loop(

      // HANDLER TURN

      // 1. Remove 2 dice from cards.
      playerActions({ actions: ['chooseDice', 'chooseDie']}),

      // 2. Roll the dice. 
      () => $.player.all(Die).forEach(x => x.roll()),

      // 3. Place both dice, one at a time on a Handler card and perform cactions.
      forLoop({ name: 'd', initial: 1, next: d => d + 1, while: d => d <= 2, do: [

        playerActions({ actions: ['choosePlayerDie']}),
        playerActions({ actions: ['chooseHandler']}),

        whileLoop({while: () => game.nextAction != 'none', do: ([
          () => game.message('Next action is: ' + game.nextAction),
          playerActions({ actions: ['nextAction']}),

          // movement workaround
          () => game.clearSelectionsAndMove(),
        ])}),
    
      ]}),

      // 4. Check for Bot-10 Damage

      // BOT-10 TURN

      // 1. Shuffle the 3 movemvent cards
      () => $.movement.shuffle(),

      // 2. Follow bottom actions
      () => {
        game.performMove($.move1.first(Bot10)!)
        game.performMove($.move2.first(Bot10)!)
        game.performMove($.move3.first(Bot10)!)
      },


    ),

      playerActions({ actions: []}),
    );
});
