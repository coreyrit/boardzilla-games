import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
  GameElement,
  Action
} from '@boardzilla/core';
import { D6 } from '@boardzilla/core/components';

import { Phase1, HandlerSpace } from './phase1.js'
import { BotSpace, Phase2, StarborgSpace } from './phase2.js'
import { PhaseAll } from './phaseAll.js'

export type SingleArgument = string | number | boolean | GameElement | Player;
export type Argument = SingleArgument | SingleArgument[];

export class StarborgVsBot10Player extends Player<MyGame, StarborgVsBot10Player> {
}

export class RefSpace extends Space<MyGame> {
}

export class IconSpace extends Space<MyGame> {
}

export class Starborg extends Piece<MyGame> {
  isHandler: boolean = true;
  color: 'red' | 'blue' | 'green' | 'black' | 'yellow'

  phase1DieActions : Record<number, string>
  phase2DieActions : Record<number, string>

  formation: number  

  override toString(): string {
      return this.game.phase == 1 ? this.color : '?'
  }

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
      if(this.color == 'black' && this.game.bot10damage >= 1 && this.game.bot10damage <= 2) {
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


// export class Die extends D6 {
  // face: number = 1
  // locked: boolean = true

  // roll(): void {
  //   this.face = Math.floor(this.game.random() * 6 + 1)
  //   this.game.rotation += 720
  //   this.game.addDelay()
  // }

  // override toString(): string {
    // return this.current.toString()
  // }
// }

export class MyGame extends Game<MyGame, StarborgVsBot10Player> {
  
  infoHeader: string = ""
  info: string = ""

  performingAction : boolean = false
  theNextAction : string = 'none'
  doAttackAdjacent : number = 0
  moveAfterAttack : 'left' | 'right'

  bot10damage : number = 0
  phase: number = 1

  selectedDie: D6 | undefined = undefined
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

  game.create(IconSpace, 'iconRef')

  const phase1 = new Phase1(game)
  phase1.setup()

  const phase2 = new Phase2(game)
  phase2.setup()

  game.create(RefSpace, 'ref')

  const phaseAll = new PhaseAll(game)

  const allActions = Object.assign({}, phaseAll.getActions(phase1, phase2), phase1.getActions(), phase2.getActions());
  game.defineActions(allActions);

  game.defineFlow(

    // set up for phase 1
    () => phase1.begin(),

    // PHASE I
    whileLoop({while: () => game.phase == 1, do: ([

      // HANDLER TURN
      () => {
        game.infoHeader = 'Handler Turn';
        game.info = '1. Remove 2 dice from cards.  Any die previously removed from a card by a Bot-10 attack must be included in this decision.';
      },

      // 1. Remove 2 dice from cards.
      playerActions({ actions: ['choose2DiceFromHandlers', 'choose1DieFromHandlers', 'chooseNoDiceFromHandlers']}),

      () => {
        game.info = '2. Roll the dice.  If the sum of the dice is equal to one of the uninjured Handler’s Starborg formation values, then you may choose to form Starborg at this time and move to Phase 2 of the game.';
      },

      // 2. Roll the dice. 
      playerActions({ actions: ['rollDice']}),
      playerActions({ actions: ['transform', 'skip']}),

      () => {
        game.info = '3. Place both dice, one at a time on a Handler card.  Perform the action on the card that matches the die value. Only 1 die permitted per card.  Do not perform actions on injured Handlers.';
      },

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
            // () => game.message('Next action is: ' + game.theNextAction),
            () => game.performingAction = true,
            // performing any sort of action (or even none) should set performing to false
            playerActions({ actions: phase1.allActions(), continueIfImpossible: true}),
            () => game.clearSelectionsAndMove(),
          ])}),
        ]}),

        () => {
          game.info = '4. Check for Bot-10 damage.  Bot-10 is damaged if the order of the Handlers is the same as the order of the colors on the bottom of the Bot-10 movement cards.  To damage Bot-10, move the cube to the next space in numerical order.';
        },

        // 4. Check for Bot-10 Damage
        playerActions({ actions: ['checkForDamagePhase1']}),

        // BOT-10 TURN      
        playerActions({ actions: ['bot10turn']}),

        // only if not transformred
        ifElse({
          if: () => game.phase == 1,
          do: [
            () => {
              game.infoHeader = 'Bot-10 Turn';
              game.info = '1. Shuffle the 3 movement cards and lay them out in a new row.  Be sure to maintain card orientation.';
            },
            
            // 1. Shuffle the 3 movemvent cards
            () => { phase1.shuffleMovementCards() },

            () => {
              game.info = '2. Follow the actions on the bottom of the cards in order from left to right.  Bot-10 will either move or attack.';
            },

            // 2. Follow bottom actions
            // () => { phase1.followBot10Actions() },
            playerActions({ actions: ['performMove1']}),
            ifElse({if: () => game.doAttackAdjacent > 0, do: [playerActions({ actions: ['attackAdjacent']})]}),
            playerActions({ actions: ['performMove2']}),
            ifElse({if: () => game.doAttackAdjacent > 0, do: [playerActions({ actions: ['attackAdjacent']})]}),
            playerActions({ actions: ['performMove3']}),
            ifElse({if: () => game.doAttackAdjacent > 0, do: [playerActions({ actions: ['attackAdjacent']})]}),
          ]})
        ]})
    ])}),


    // set up for phase 2
    () => phase2.begin(),

    // PHASE II
    whileLoop({while: () => game.phase == 2, do: ([

      // HANDLER TURN
      () => {
        game.infoHeader = 'Starborg Turn';
        game.info = '1. Collect 2 dice, starting with ones not on cards.';
      },

      // 1. Remove 2 dice from cards.
      playerActions({ actions: ['choose2DiceFromStarborg', 'choose1DieFromStarborg', 'chooseNoDiceFromStarborg']}),

      () => {
        game.info = '2. Roll the dice.  If the sum of the dice is equal to one of the attack values still on Bot-10, Starborg takes 2 damage.';
      },

      // 2. Roll the dice. 
      () => $.player.all(D6).forEach(x => x.roll()),
      () => phase2.checkBot10Attack(),

      () => {
        game.info = '3. Place both dice, one at a time on a Starborg card.  Perform the action on the card that matches the die value. Do not perform actions on a card that has the health cube.  Chain actions as you would in Phase 1.';
      },
      
      // 3. Place both dice, one at a time on a Handler card and perform cactions.
      forLoop({ name: 'd', initial: 1, next: d => d + 1, while: d => d <= 2, do: [
        
        // place a die on a handler
        playerActions({ actions: ['choosePlayerDie']}),
        playerActions({ actions: ['chooseStarborg']}),

        // perform chain of actions
        () => game.performingAction = false,
        whileLoop({while: () => game.theNextAction != 'none' && !game.performingAction, do: ([
          // () => game.message('Next action is: ' + game.theNextAction),
          () => game.performingAction = true,
          // performing any sort of action (or even none) should set performing to false
          playerActions({ actions: phase2.allActions(), continueIfImpossible: true}),
          () => game.clearSelectionsAndMove(),
        ])}),
      ]}),

      () => {
        game.info = '4. Check for Bot-10 damage.  Bot-10 is damaged if a die is placed on Bot-10 and the values of all placed dice are on the correct types of attacks and the values are in the correct increasing order.  When Bot-10 is damaged, remove the card that had the die on it from play and reclaim the die.  If this is the final card on Bot-10, you win!';
      },

      // 4. Check for Bot-10 Damage
      playerActions({ actions: ['checkForDamagePhase2']}),

      // BOT-10 TURN
      playerActions({ actions: ['bot10turn']}),

      () => {
        game.infoHeader = 'Bot-10 Turn';
        game.info = '1. Roll all dice on Bot-10, if any, maintaining their positions on Bot-10.';
      },

      // 1. Roll dice on Bot-10
      playerActions({ actions: ['rollBot10Dice']}),

      () => {
        game.info = '2. Target the corresponding areas on Starborg.  If the part on Starborg has a die remove it, otherwise Starborg takes 1 damage.';
      },
      
      // 2. Target ares on Starborg
      playerActions({ actions: ['attackWithBot10Dice']}),

    ])}),


    playerActions({ actions: []}),

  );
});
