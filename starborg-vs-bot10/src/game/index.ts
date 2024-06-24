import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
  GameElement,
  Action
} from '@boardzilla/core';
import { skip } from 'node:test';
import { Handler } from 'puppeteer/internal/types.js';


import { Phase1, HandlerSpace } from './phase1.js'
import { BotSpace, Phase2, StarborgSpace } from './phase2.js'
import { PhaseAll } from './phaseAll.js'

export type SingleArgument = string | number | boolean | GameElement | Player;
export type Argument = SingleArgument | SingleArgument[];

export class StarborgVsBot10Player extends Player<MyGame, StarborgVsBot10Player> {
}

export class Starborg extends Piece<MyGame> {
  isHandler: boolean = true;
  color: 'red' | 'blue' | 'green' | 'black' | 'yellow'

  phase1DieActions : Record<number, string>
  phase2DieActions : Record<number, string>

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
  unblockedAttack: number

  topMovement: Movement;
  bottomMovement: Movement;

  lowAttack: 'kick' | 'bite' | 'punch'
  highAttack: 'kick' | 'bite' | 'punch'

  damaged: boolean = false
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

  getClockwiseBot10() : BotSpace {
    const myBot10 = this.container(BotSpace)!
    return this.getNextClockwiseBot10(myBot10)
  }

  getNextClockwiseBot10(myBot10: BotSpace) : BotSpace {
    let nextSpace = undefined

    switch(myBot10.name) {
      case 'nw': { nextSpace = this.game.first(BotSpace, {name: 'ne'})!; break; }
      case 'ne': { nextSpace = this.game.first(BotSpace, {name: 'se'})!; break; }
      case 'sw': { nextSpace = this.game.first(BotSpace, {name: 'nw'})!; break; }
      case 'se': { nextSpace = this.game.first(BotSpace, {name: 'sw'})!; break; }
    }
    
    if(nextSpace!.first(Bot10)!.damaged) {
      return this.getNextClockwiseBot10(nextSpace!)
    } else {
      return nextSpace!
    }
  }

  getCounterClockwiseBot10() : BotSpace {
    const myBot10 = this.container(BotSpace)!
    return this.getNextCounterClockwiseBot10(myBot10)
  }

  getNextCounterClockwiseBot10(myBot10: BotSpace) : BotSpace {
    let nextSpace = undefined

    switch(myBot10.name) {
      case 'nw': { nextSpace =  this.game.first(BotSpace, {name: 'sw'})!; break; }
      case 'ne': { nextSpace =  this.game.first(BotSpace, {name: 'nw'})!; break; }
      case 'sw': { nextSpace =  this.game.first(BotSpace, {name: 'se'})!; break; }
      case 'se': { nextSpace =  this.game.first(BotSpace, {name: 'ne'})!; break; }
    }
    if(nextSpace!.first(Bot10)!.damaged) {
      return this.getNextCounterClockwiseBot10(nextSpace!)
    } else {
      return nextSpace!
    }
  }


  getClockwiseStarborg() : StarborgSpace {
    const myStarborg = this.container(StarborgSpace)!
    switch(myStarborg.color) {
      case 'black': { return this.game.first(StarborgSpace, {color: 'green'})! }
      case 'red': { return this.game.first(StarborgSpace, {color: 'black'})! }
      case 'green': { return this.game.first(StarborgSpace, {color: 'yellow'})! }
      case 'yellow': { return this.game.first(StarborgSpace, {color: 'blue'})! }
      case 'blue': { return this.game.first(StarborgSpace, {color: 'red'})! }
    }
    return myStarborg
  }

  getCounterClockwiseStarborg() : StarborgSpace {
    const myStarborg = this.container(StarborgSpace)!
    switch(myStarborg.color) {
      case 'black': { return this.game.first(StarborgSpace, {color: 'red'})! }
      case 'red': { return this.game.first(StarborgSpace, {color: 'blue'})! }
      case 'green': { return this.game.first(StarborgSpace, {color: 'black'})! }
      case 'yellow': { return this.game.first(StarborgSpace, {color: 'green'})! }
      case 'blue': { return this.game.first(StarborgSpace, {color: 'yellow'})! }
    }
    return myStarborg
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
  
  performingAction : boolean = false
  theNextAction : string = 'none'

  bot10damage : number = 4
  phase: number = 1

  selectedDie: Die | undefined = undefined
  selectedHandler: HandlerSpace | undefined = undefined
  selectedBot10: BotSpace | undefined = undefined
  selectedStarborg: StarborgSpace | undefined = undefined

  clearAction() : void {
    this.performingAction = false
    this.theNextAction = 'none'
  }

  nextActionIs(action: string) : boolean {
    return this.theNextAction == action
  }

  performAction(nextAction: string) {
    this.performingAction = false
    this.theNextAction = nextAction    
  }

  clearSelectionsAndMove() : void {
    if(this.selectedDie != undefined && this.selectedHandler != undefined) {
      this.selectedDie.putInto(this.selectedHandler)
    } else if(this.selectedDie != undefined && this.selectedBot10 != undefined) {
      this.selectedDie.putInto(this.selectedBot10)
    } else if(this.selectedDie != undefined && this.selectedStarborg != undefined) {
      this.selectedDie.putInto(this.selectedStarborg)
    }
    this.selectedDie = undefined
    this.selectedHandler = undefined
    this.selectedBot10 = undefined
    this.selectedStarborg = undefined
  }
}

export default createGame(StarborgVsBot10Player, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer, whileLoop, forLoop, ifElse } = game.flowCommands;

  const phase1 = new Phase1(game)
  phase1.setup()

  const phase2 = new Phase2(game)
  phase2.setup()

  const phaseAll = new PhaseAll(game)

  const allActions = Object.assign({}, phaseAll.getActions(phase1, phase2), phase1.getActions(), phase2.getActions());
  game.defineActions(allActions);

  game.defineFlow(

    // set up for phase 1
    () => phase1.begin(),

    // PHASE I
    whileLoop({while: () => game.phase == 1, do: ([

      // HANDLER TURN

      // 1. Remove 2 dice from cards.
      playerActions({ actions: ['choose2DiceFromHandlers', 'choose1DieFromHandlers', 'chooseNoDiceFromHandlers']}),

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
          () => game.performingAction = false,
          whileLoop({while: () => game.theNextAction != 'none' && !game.performingAction, do: ([
            () => game.message('Next action is: ' + game.theNextAction),
            () => game.performingAction = true,
            // performing any sort of action (or even none) should set performing to false
            playerActions({ actions: phase1.allActions(), continueIfImpossible: true}),
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
    whileLoop({while: () => game.phase == 2, do: ([

      // HANDLER TURN

      // 1. Remove 2 dice from cards.
      playerActions({ actions: ['choose2DiceFromStarborg', 'choose1DieFromStarborg', 'chooseNoDiceFromStarborg']}),

      // 2. Roll the dice. 
      () => $.player.all(Die).forEach(x => x.roll()),
      () => phase2.checkBot10Attack(),

      // 3. Place both dice, one at a time on a Handler card and perform cactions.
      forLoop({ name: 'd', initial: 1, next: d => d + 1, while: d => d <= 2, do: [
        
        // place a die on a handler
        playerActions({ actions: ['choosePlayerDie']}),
        playerActions({ actions: ['chooseStarborg']}),

        // perform chain of actions
        () => game.performingAction = false,
        whileLoop({while: () => game.theNextAction != 'none' && !game.performingAction, do: ([
          () => game.message('Next action is: ' + game.theNextAction),
          () => game.performingAction = true,
          // performing any sort of action (or even none) should set performing to false
          playerActions({ actions: phase2.allActions(), continueIfImpossible: true}),
          () => game.clearSelectionsAndMove(),
        ])}),
      ]}),

      // 4. Check for Bot-10 Damage
      () => phase2.checkForDamage(),

      // BOT-10 TURN

      // 1. Roll dice on Bot-10
      // 2. Target ares on Starborg
      () => { phase2.rollDiceAndAttack() },

    ])}),


    playerActions({ actions: []}),

  );
});
