import { StarborgVsBot10Player, MyGame, Bot10, Starborg } from '../game/index.js';
import {
    createGame,
    Player,
    Space,
    Piece,
    Game,
    Action,
    GameElement
} from '@boardzilla/core';
import { D6 } from '@boardzilla/core/components';
import { HandlerSpace } from './phase1.js';

export type SingleArgument = string | number | boolean | GameElement | Player;
export type Argument = SingleArgument | SingleArgument[];

export class StarborgSpace extends Space<MyGame> {
    color: 'red' | 'green' | 'yellow' | 'blue' | 'black'
    attackType: 'bite' | 'kick' | 'punch'

    override toString(): string {
        return this.color.toString()
    }
}

export class BotSpace extends Space<MyGame> {
    attackColors: Record<number, 'red' | 'green' | 'yellow' | 'blue' | 'black'>
}

export class Phase2 {
    game: MyGame

    constructor(game: MyGame) {
        this.game = game
    }

    getClockwiseBot10(die: D6) : BotSpace {
        const myBot10 = die.container(BotSpace)!
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
    
      getCounterClockwiseBot10(die: D6) : BotSpace {
        const myBot10 = die.container(BotSpace)!
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
    
    
      getClockwiseStarborg(die: D6) : StarborgSpace {
        const myStarborg = die.container(StarborgSpace)!
        switch(myStarborg.color) {
          case 'black': { return this.game.first(StarborgSpace, {color: 'green'})! }
          case 'red': { return this.game.first(StarborgSpace, {color: 'black'})! }
          case 'green': { return this.game.first(StarborgSpace, {color: 'yellow'})! }
          case 'yellow': { return this.game.first(StarborgSpace, {color: 'blue'})! }
          case 'blue': { return this.game.first(StarborgSpace, {color: 'red'})! }
        }
        return myStarborg
      }
    
      getCounterClockwiseStarborg(die: D6) : StarborgSpace {
        const myStarborg = die.container(StarborgSpace)!
        switch(myStarborg.color) {
          case 'black': { return this.game.first(StarborgSpace, {color: 'red'})! }
          case 'red': { return this.game.first(StarborgSpace, {color: 'blue'})! }
          case 'green': { return this.game.first(StarborgSpace, {color: 'black'})! }
          case 'yellow': { return this.game.first(StarborgSpace, {color: 'green'})! }
          case 'blue': { return this.game.first(StarborgSpace, {color: 'yellow'})! }
        }
        return myStarborg
      }

    allActions() : string[] {
        return [
            'add1',
            'sub1',
            'addSub1',
            'moveCwBot10',
            'moveCcwBot10',
            'moveCwCcwStarborg',
            'moveCwStarborg',
            'moveCcwStarborg',
            'moveAny',
            'set',
            'placeDie',
            'removeDieBot10',
            'swapDice',
            'roll'
        ]
    }


    setup() : void {
        this.game.create(StarborgSpace, 'head', {color: 'black', attackType: 'bite'})
        this.game.create(StarborgSpace, 'leftArm', {color: 'green', attackType: 'punch'})
        this.game.create(StarborgSpace, 'rightArm', {color: 'red', attackType: 'punch'})
        this.game.create(StarborgSpace, 'leftLeg', {color: 'yellow', attackType: 'kick'})
        this.game.create(StarborgSpace, 'rightLeg', {color: 'blue', attackType: 'kick'})

        this.game.create(BotSpace, 'nw', {attackColors: {
            1: 'blue', 2: 'yellow', 3: 'black', 4: 'yellow', 5: 'red', 6: 'blue'
        }})
        this.game.create(BotSpace, 'ne', {attackColors: {
            1: 'black', 2: 'blue', 3: 'yellow', 4: 'yellow', 5: 'green', 6: 'blue'
        }})
        this.game.create(BotSpace, 'sw', {attackColors: {
            1: 'red', 2: 'green', 3: 'green', 4: 'red', 5: 'black', 6: 'yellow'
        }})
        this.game.create(BotSpace, 'se', {attackColors: {
            1: 'red', 2: 'black', 3: 'blue', 4: 'green', 5: 'red', 6: 'green'
        }})
        
        this.game.first(Starborg, {color: 'black'})!.phase2DieActions = {
            1: 'moveCwBot10', 2: 'moveAny', 3: 'swapDice', 4: 'set', 5: 'moveCcwBot10', 6: 'removeDieBot10'
        }
        this.game.first(Starborg, {color: 'blue'})!.phase2DieActions = {
            1: 'moveCwCcwStarborg', 2: 'moveCwBot10', 3: 'moveCwStarborg', 4: 'placeDie', 5: 'swapDice', 6: 'moveAny'
        }
        this.game.first(Starborg, {color: 'yellow'})!.phase2DieActions = {
            1: 'placeDie', 2: 'moveCwCcwStarborg', 3: 'moveCcwBot10', 4: 'swapDice', 5: 'moveCcwStarborg', 6: 'moveAny'
        }
        this.game.first(Starborg, {color: 'red'})!.phase2DieActions = {
            1: 'moveCcwBot10', 2: 'swapDice', 3: 'addSub1', 4: 'roll', 5: 'sub1', 6: 'set'
        }
        this.game.first(Starborg, {color: 'green'})!.phase2DieActions = {
            1: 'swapDice', 2: 'add1', 3: 'roll', 4: 'addSub1', 5: 'moveCwBot10', 6: 'set'
        }
        
    }
    
    transformHandler(handlerColor: 'red' | 'blue' | 'black' | 'yellow' | 'green', spaceName: string) {
        const card = this.game.first(Starborg, {color: handlerColor})!
        card.rotation = 0
        const handler = card.container(HandlerSpace)!
        const space = this.game.first(StarborgSpace, {name: spaceName})!
        card.isHandler = false
        card.putInto(space)
        const die = handler.first(D6)
        if(die != undefined) {
            die.putInto(space)
        }
    }

    begin() : void {
        this.transformHandler('black', 'head')
        this.transformHandler('green', 'leftArm')
        this.transformHandler('red', 'rightArm')
        this.transformHandler('yellow', 'leftLeg')
        this.transformHandler('blue', 'rightLeg')

        this.game.all(Bot10).forEach(x => x.rotation = 0)

        this.game.first(Bot10, {phase2: 'nw'})!.putInto($.nw)
        this.game.first(Bot10, {phase2: 'ne'})!.putInto($.ne)
        this.game.first(Bot10, {phase2: 'sw'})!.putInto($.sw)
        this.game.first(Bot10, {phase2: 'se'})!.putInto($.se)
    }

    getAction(starborg: StarborgSpace, die: D6): string {
        const action = starborg.first(Starborg)!.phase2DieActions[die.current]
        if(action.endsWith('Bot10') && this.game.all(BotSpace).all(D6).length == 0) {
            this.game.clearAction()
            return 'none'
        } else {
            return action;
        }
    }

    partDamaged(space: StarborgSpace): boolean {
        const starborg = space.first(Starborg)!
        return starborg.showCube()
    }

    checkBot10Attack() : void {
        const sum = $.player.all(D6).reduce((acc, cur) => acc + cur.current, 0)
        if(this.game.all(Bot10, {damaged: false}).map(x => x.unblockedAttack).includes(sum)) {
            this.game.message('Bot-10 rolled a ' + sum + ' and dealt Starborg 2 unblockable damage!')
            this.game.bot10damage -= 2
            if(this.game.bot10damage <= 0) {
                this.game.message('Starborg has been defeated!')
                this.game.finish(undefined)
            } else {
                this.game.message('Starborg has ' + this.game.bot10damage + ' health.')
            }
        }
    }

    getActions(): Record<string, (player: StarborgVsBot10Player) => Action<Record<string, Argument>>> {
        const game = this.game
        const { action } = game;

        return {

            rollBot10Dice: (player) => action({}).do(() => {
                this.game.all(BotSpace).all(D6).forEach(x => {
                    x.roll()
                    this.game.message('Bot-10 rolled a ' + x.current + '.')
                })
            }),
        
            attackWithBot10Dice: (player) => action({}).do(() => {
                this.game.all(BotSpace).all(D6).forEach(x => {                    
                    const attackColor = x.container(BotSpace)!.attackColors[x.current]
                    const starborg = this.game.first(StarborgSpace, {color: attackColor})!
                    if(starborg.all(D6).length > 0) {
                        this.game.message('Starborg blocked the attack.')
                        starborg.first(D6)!.putInto($.player)
                    } else {
                        this.game.message('Bot-10 dealt Starborg 1 damage!')
                        this.game.bot10damage--;
                        if(this.game.bot10damage <= 0) {
                            this.game.message('Starborg has been defeated!')
                            this.game.finish(undefined)
                        } else {
                            this.game.message('Starborg has ' + this.game.bot10damage + ' health.')
                        }
                    }
                })
            }),

            checkForDamagePhase2: (player) => action({}).do(() => {
                // this.game.message('Check for damage.')
                // only possible with a single die on Bot-10
                if(this.game.all(BotSpace).all(D6).length == 1) {
                    const die = this.game.all(BotSpace).first(D6)!
                    const space = die.container(BotSpace)!
                    const bot10 = space.first(Bot10)!
                    const lowest = this.game.all(StarborgSpace, {attackType: bot10.lowAttack}).all(D6)
                        .map(x => x.current).reduce((acc, cur) => cur < acc ? cur : acc, 1000)
                    const highest = this.game.all(StarborgSpace, {attackType: bot10.highAttack}).all(D6)
                        .map(x => x.current).reduce((acc, cur) => cur > acc ? cur : acc, -1000)
                    const middle = die.current
        
                    // this.game.message(lowest + ' < '  + middle + ' < ' + highest)
                    this.game.message('The required attack is a ' + bot10.lowAttack + 
                        ' is less or equal to Bot-10 which is less or equal to a ' + 
                        bot10.highAttack + '.')
        
                    if(lowest <= middle && middle <= highest) {
                        this.game.message('Bot-10 has been damaged!')
        
                        bot10.damaged = true
                        die.putInto($.player)
        
                        if(this.game.all(Bot10, {damaged: true}).length == 4) {
                            this.game.finish(this.game.players[0])
                        }
                    }
        
                }
            }),

            moveAny: (player) => action({
                prompt: 'Choose a die to move',
                condition: game.nextActionIs('moveAny')
            }).chooseOnBoard(
                'die', game.all(StarborgSpace).all(D6).concat(game.all(BotSpace).all(D6)),
                {skipIf: 'never'}
            ).do(({ die }) => { 
                game.selectedDie = die; 
                game.followUp({ name: 'moveAnyFollowUp' }) 
                game.message('You are moving ' + die.current + '.')
            }),

            moveAnyFollowUp: (player) => action({
                prompt: 'Choose a space to move to',
            }).chooseOnBoard(
                'space', game.all(StarborgSpace).filter(x => x.all(D6).length == 0).map(x => x as Space<MyGame>)
                    .concat(game.all(BotSpace).filter(x => x.all(D6).length == 0).map(x => x as Space<MyGame>))
                    .concat(game.selectedDie!.container(Space<MyGame>)!)
            ).do(({ space }) => {
                const dieSpace = game.selectedDie!.container(Space<MyGame>)!
                if (space == dieSpace) {
                    // didn't move
                    game.clearAction()
                    this.game.message('The ' + game.selectedDie!.current + ' did not move.')
                } else {
                    if(space instanceof StarborgSpace) {
                        game.selectedStarborg = space
                        if(!this.partDamaged(game.selectedStarborg)) {
                            game.performAction(this.getAction(game.selectedStarborg, game.selectedDie!))
                        } else {
                            game.clearAction()
                        }
                    } else if(space instanceof BotSpace) {
                        game.selectedBot10 = space
                        game.clearAction()
                    }
                    this.game.message('You moved the ' + game.selectedDie!.current + ' to ' + 
                        game.selectedDie!.container(StarborgSpace)! + '.')
                }
            }),
            
            removeDieBot10: (player) => action({
                prompt: 'Choose a die on Bot-10 to remove',
                condition: game.nextActionIs('removeDieBot10') &&
                    game.all(BotSpace).all(D6).length > 0
            }).chooseOnBoard(
                'die', game.all(BotSpace).all(D6),
                { skipIf: 'never' }
            ).do(({ die }) => {
                die.putInto($.player)
                if(game.bot10damage < 8) {
                    game.bot10damage++;
                }
                this.game.message('Starborg has ' + this.game.bot10damage + ' health.')
                game.clearAction()
            }),

            swapDice: (player) => action({
                prompt: 'Choose 2 dice to swap',
                condition: game.nextActionIs('swapDice') &&
                    game.all(StarborgSpace).all(D6).length + game.all(BotSpace).all(D6).length >= 2
            }).chooseOnBoard(
                'dice', game.all(StarborgSpace).all(D6).concat(game.all(BotSpace).all(D6)),
                { skipIf: 'never', number: 2 }
            ).do(({ dice }) => {
                const space1 = dice[0].container(Space)!
                const space2 = dice[1].container(Space)!
                dice[0].putInto(space2)
                dice[1].putInto(space1)
                game.clearAction()
                game.message('You swapped ' + dice[0].current + ' and ' + dice[1].current + '.')
            }),

            moveCwCcwStarborg: (player) => action({
                prompt: 'Choose a die on Starborg to move clockwise or counter-clockwise',
                condition: game.nextActionIs('moveCwCcwStarborg') &&  (
                    game.all(StarborgSpace).all(D6).filter(x => this.getClockwiseStarborg(x).all(D6).length == 0).length +
                    game.all(StarborgSpace).all(D6).filter(x => this.getCounterClockwiseStarborg(x).all(D6).length == 0).length
                ) > 0
            }).chooseOnBoard(
                'die', game.all(StarborgSpace).all(D6).filter(x => this.getClockwiseStarborg(x).all(D6).length == 0).concat(
                    game.all(StarborgSpace).all(D6).filter(x => this.getCounterClockwiseStarborg(x).all(D6).length == 0)),
            ).do(({ die }) => {
                const myStarborg = die.container(StarborgSpace)!
                game.selectedDie = die;
                if (this.getClockwiseStarborg(die).all(D6).length > 0) {
                    game.followUp({ name: 'cwCcwFollowUpCcw' })
                } else if (this.getCounterClockwiseStarborg(die).all(D6).length > 0) {
                    game.followUp({ name: 'cwCcwFollowUpCw' })
                } else {
                    game.followUp({ name: 'cwCcwFollowUp' })
                }
                game.message('You are moving ' + die.current + '.')
            }),
            
            cwCcwFollowUpCcw: (player) => action({
                prompt: 'Move counter-clockwise',
            }).chooseFrom(
                "direction", ["Counter-clockwise"], { skipIf: 'never' }
            ).do(({ direction }) => {
                const ccwStarborg = this.getCounterClockwiseStarborg(game.selectedDie!)
                game.selectedStarborg = ccwStarborg
                if (!this.partDamaged(ccwStarborg)) {
                    game.performAction(this.getAction(ccwStarborg, game.selectedDie!))
                } else {
                    game.clearAction()
                }
            }).message('You moved the ' + game.selectedDie!.current + ' on Starborg {{direction}}.'),
            cwCcwFollowUpCw: (player) => action({
                prompt: 'Move clockwise',
            }).chooseFrom(
                "direction", ["Clockwise"], { skipIf: 'never' }
            ).do(({ direction }) => {
                const cwStarborg = this.getClockwiseStarborg(game.selectedDie!)
                game.selectedStarborg = cwStarborg
                if (!this.partDamaged(cwStarborg)) {
                    game.performAction(this.getAction(cwStarborg, game.selectedDie!))
                } else {
                    game.clearAction()
                }
            }).message('You moved the ' + game.selectedDie!.current + ' on Starborg {{direction}}.'),
            cwCcwFollowUp: (player) => action({
                prompt: 'Move clockwise or counter-clockwise',
            }).chooseFrom(
                "direction", ["Clockwise", "Counter-clockwise"]
            ).do(({ direction }) => {
                const starborg = direction == 'Clockwise' ? this.getClockwiseStarborg(game.selectedDie!) : this.getCounterClockwiseStarborg(game.selectedDie!)
                game.selectedStarborg = starborg
                if (!this.partDamaged(starborg)) {
                    game.performAction(this.getAction(starborg, game.selectedDie!))
                } else {
                    game.clearAction()
                }
            }).message('You moved the ' + game.selectedDie!.current + ' on Starborg {{direction}}.'),
            
            placeDie: (player) => action({
                prompt: 'Choose a die to place on Bot-10',
                condition: game.nextActionIs('placeDie')
            }).chooseOnBoard(
                'die', game.all(StarborgSpace).all(D6).concat(game.all(BotSpace).all(D6)),
                { skipIf: 'never' }
            ).do(({ die }) => {
                game.selectedDie = die; 
                game.followUp({ name: 'placeFollowUp' }) 
                game.message('You are placing a ' + die.current + '.')
            }),

            placeFollowUp: (player) => action({
                prompt: 'Choose a Bot-10 part to place on',
            }).chooseOnBoard(
                'bot10', game.all(BotSpace).filter(x => x.all(D6).length == 0 && !x.first(Bot10)!.damaged)
            ).do(({ bot10 }) => {
                game.selectedBot10 = bot10
                game.clearAction()
            }).message('You placed the ' + game.selectedDie!.current + ' on Bot-10.'),

            moveCwBot10: (player) => action({
                prompt: 'Choose a die on Bot-10 to move clockwise',
                condition: game.nextActionIs('moveCwBot10') &&
                    game.all(BotSpace).all(D6).length > 0,
            }).chooseOnBoard(
                'die',
                     game.all(BotSpace).all(D6).filter(x => this.getClockwiseBot10(x).all(D6).length == 0)
                    //  .concat(game.all(Bot10, {damaged: false}).length == 1 ? 
                        // [game.first(Bot10, {damaged: false})!.container(BotSpace)!] : [])
                        ,
                { skipIf: 'never' }
            ).do(({ die }) => {
                const cwBot10 = this.getClockwiseBot10(die)
                die.putInto(cwBot10)
                game.clearAction()
                game.message('You moved the ' + die.current + ' on Bot-10 clockwise.')
            }),

            moveCcwBot10: (player) => action({
                prompt: 'Choose a die on Bot-10 to move counter-clockwise',
                condition: game.nextActionIs('moveCcwBot10') &&
                    game.all(BotSpace).all(D6).length > 0
            }).chooseOnBoard(
                'die', game.all(BotSpace).all(D6).filter(x => this.getCounterClockwiseBot10(x).all(D6).length == 0),
                { skipIf: 'never' }
            ).do(({ die }) => {
                const cwBot10 = this.getCounterClockwiseBot10(die)
                die.putInto(cwBot10)
                game.clearAction()
                game.message('You moved the ' + die.current + ' on Bot-10 counter-clockwise.')
            }),


            moveCwStarborg: (player) => action({
                prompt: 'Choose a die on Starborg to move clockwise',
                condition: game.nextActionIs('moveCwStarborg')
            }).chooseOnBoard(
                'die', game.all(StarborgSpace).all(D6).filter(x => this.getClockwiseStarborg(x).all(D6).length == 0),
                { skipIf: 'never' }
            ).do(({ die }) => {
                const cwStarborg = this.getClockwiseStarborg(die)
                die.putInto(cwStarborg)
                if (!this.partDamaged(cwStarborg)) {
                    game.performAction(this.getAction(cwStarborg, die))
                } else {
                    game.clearAction()
                }
                game.message('You moved the ' + die.current + ' on Starborg clockwise.')
            }),

            moveCcwStarborg: (player) => action({
                prompt: 'Choose a die on Starborg to move counter-clockwise',
                condition: game.nextActionIs('moveCcwStarborg')
            }).chooseOnBoard(
                'die', game.all(StarborgSpace).all(D6).filter(x => this.getCounterClockwiseStarborg(x).all(D6).length == 0),
                { skipIf: 'never' }
            ).do(({ die }) => {
                const cwStarborg = this.getCounterClockwiseStarborg(die)
                die.putInto(cwStarborg)
                if (!this.partDamaged(cwStarborg)) {
                    game.performAction(this.getAction(cwStarborg, die))
                } else {
                    game.clearAction()
                }
                game.message('You moved the ' + die.current + ' on Starborg counter-clockwise.')
            }),

            choose2DiceFromStarborg: (player) => action({
                prompt: 'Choose 2 dice to remove',
                condition: $.player.all(D6).length == 0
            }).chooseOnBoard(
                'dice', this.game.all(StarborgSpace).all(D6).concat(this.game.all(BotSpace).all(D6)),
                { number: 2 }
            ).do(({ dice }) => {
                dice.forEach(x => {
                    x.putInto($.player)
                });
                game.message('You chose to pick up ' + dice[0].current + ' and ' + dice[1].current + '.')
            }),

            choose1DieFromStarborg: (player) => action({
                prompt: 'Choose 1 die to remove',
                condition: $.player.all(D6).length == 1
            }).chooseOnBoard(
                'dice', this.game.all(StarborgSpace).all(D6).concat(this.game.all(BotSpace).all(D6)),
                { number: 1 }
            ).do(({ dice }) => {
                dice.forEach(x => {
                    x.putInto($.player)
                });
                game.message('You chose to pick up ' + dice[0].current + '.')
            }),

            chooseNoDiceFromStarborg: (player) => action({
                condition: $.player.all(D6).length == 2
            }).message('You already have 2 dice.'),

            chooseStarborg: (player) => action({
                prompt: 'Choose a Starborg part for this die',
            }).chooseOnBoard(
                'starborg', game.all(StarborgSpace).filter(x => x.all(D6).length == 0)
            ).do(({ starborg }) => {
                game.selectedDie!.putInto(starborg)
                const h = starborg.first(Starborg)!
                if (!h.showCube()) {
                    game.performAction(this.getAction(starborg, game.selectedDie!))
                } else {
                    game.clearAction()
                }
                game.selectedDie = undefined
            }).message('You placed the ' + game.selectedDie!.current + ' on {{starborg}}.'),
        }
    }
}