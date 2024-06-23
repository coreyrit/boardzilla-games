import {
  createGame,
  Player,
  Space,
  Piece,
  Game
} from '@boardzilla/core';
import { skip } from 'node:test';
import { Handler } from 'puppeteer/internal/types.js';


import { Phase1, HandlerSpace } from './phase1.js'
import { Phase2 } from './phase2.js'

export class StarborgVsBot10Player extends Player<MyGame, StarborgVsBot10Player> {
}

export class Starborg extends Piece<MyGame> {
  isHandler: boolean = true;
  color: 'red' | 'blue' | 'green' | 'black' | 'yellow'

  dieActions : Record<number, string>
  formation: number

  getX() : number {
    if(this.color == 'black') {
      return 45
    } else if(this.color == 'red') {
      return 42
    } else if(this.color == 'green') {
      return 44
    } else if(this.color == 'blue') {
      return this.game.bot10damage == 5 ? 72 : 84
    } else if(this.color == 'yellow') {
      return this.game.bot10damage == 7 ? 6 : 18
    } else {
      return 0
    }
  }

  getY() : number {
    if(this.color == 'black') {
      return this.game.bot10damage == 1 ? 18 : 36
    } else if(this.color == 'red' || this.color == 'green') {
      return 10
    } else if(this.color == 'blue' || this.color == 'yellow') {
      return 79
    } else {
      return 0
    }
  }

  showCube() : boolean {
    if(this.game.phase == 2) {
      if(this.color == 'black' && this.game.bot10damage <= 2) {
        return true;
      } else if(this.color == 'red' && this.game.bot10damage == 3) {
        return true;
      } else if(this.color == 'green' && this.game.bot10damage == 4) {
        return true;
      } else if(this.color == 'blue' && this.game.bot10damage >= 5 && this.game.bot10damage <= 6) {
        return true;
      } else if(this.color == 'yellow' && this.game.bot10damage >= 7) {
        return true;
      }
    }
    return false;
  }
}

export class Movement {  
  moveDirection: 'right' | 'left'
  handlerColor: 'red' | 'blue' | 'green' | 'black' | 'yellow'
}

export class Bot10 extends Piece<MyGame> {
  phase1: 'vehicle' | 'move-left' | 'move-right' | 'attack'
  phase2: 'nw' | 'ne' | 'sw' | 'se'

  arrowColor: 'black' | 'white'

  topMovement: Movement;
  bottomMovement: Movement;
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

export class MyGame extends Game<MyGame, StarborgVsBot10Player> {
  nextAction : string = 'none'

  bot10damage : number = 0
  phase: number = 1

  selectedDie: Die | undefined = undefined
  selectedHandler: HandlerSpace | undefined = undefined

  clearSelectionsAndMove() : void {
    if(this.selectedDie != undefined && this.selectedHandler != undefined) {
      this.selectedDie.putInto(this.selectedHandler)
    }
    this.selectedDie = undefined
    this.selectedHandler = undefined
  }
}

export default createGame(StarborgVsBot10Player, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer, whileLoop, forLoop, ifElse } = game.flowCommands;

  const phase1 = new Phase1(game)
  phase1.setup()

  const phase2 = new Phase2(game)
  phase2.setup()

  game.defineActions(phase1.getActions());

  game.defineFlow(

    // set up for phase 1
    () => phase1.begin(),

    // PHASE I
    whileLoop({while: () => game.phase == 1, do: ([

      // HANDLER TURN

      // 1. Remove 2 dice from cards.
      playerActions({ actions: ['chooseDice', 'chooseDie', 'chooseNone']}),

      // 2. Roll the dice. 
      () => $.player.all(Die).forEach(x => x.roll()),
      playerActions({ actions: ['transform', 'skip']}),

      // only if not transformred
      ifElse({
        if: () => game.phase == 1,
        do: [
          // 3. Place both dice, one at a time on a Handler card and perform cactions.
          forLoop({ name: 'd', initial: 1, next: d => d + 1, while: d => d <= 2, do: [
        
          // place a die on a handler
          playerActions({ actions: ['choosePlayerDie']}),
          playerActions({ actions: ['chooseHandler']}),

          // perform chain of actions
          whileLoop({while: () => game.nextAction != 'none', do: ([
            () => game.message('Next action is: ' + game.nextAction),
            playerActions({ actions: ['nextAction']}),
            () => game.clearSelectionsAndMove(),
          ])}),
        ]}),

        // 4. Check for Bot-10 Damage
        () => phase1.checkForDamage(),

        // BOT-10 TURN
        // only if not transformred
        ifElse({
          if: () => game.phase == 1,
          do: [
            // 1. Shuffle the 3 movemvent cards
            () => { phase1.shuffleMovementCards() },

            // 2. Follow bottom actions
            () => { phase1.followBot10Actions() },
          ]})
        ]})
    ])}),

    // set up for phase 2
    () => phase2.begin(),

    // PHASE II


    playerActions({ actions: []}),

  );
});
