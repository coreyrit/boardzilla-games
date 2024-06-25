import { StarborgVsBot10Player, MyGame, Bot10, Starborg, Die } from '../game/index.js';
import {
    createGame,
    Player,
    Space,
    Piece,
    Game,
    Action,
    GameElement
} from '@boardzilla/core';
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
        const die = handler.first(Die)
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

    getAction(starborg: StarborgSpace, die: Die): string {
        const action = starborg.first(Starborg)!.phase2DieActions[die.face]
        if(action.endsWith('Bot10') && this.game.all(BotSpace).all(Die).length == 0) {
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

    rollDiceAndAttack() : void {
        this.game.all(BotSpace).all(Die).forEach(x => {
            x.roll()
            this.game.message('<b>Bot-10</b> rolled a <b>' + x.face + '</>.')
            const attackColor = x.container(BotSpace)!.attackColors[x.face]
            const starborg = this.game.first(StarborgSpace, {color: attackColor})!
            if(starborg.all(Die).length > 0) {
                this.game.message('<b>Starborg</b> blocked the attack')
                starborg.first(Die)!.putInto($.player)
            } else {
                this.game.message('<b>Bot-10</b> dealt Starborg <b>1</b> damage!')
                this.game.bot10damage--;
                if(this.game.bot10damage <= 0) {
                    this.game.message('<b>Starborg</b> has been <b>defeated</b>!')
                    this.game.finish(undefined)
                } else {
                    this.game.message('<b>Starborg</b> has <b>' + this.game.bot10damage + '</b> health.')
                }
            }
        })
    }

    checkBot10Attack() : void {
        const sum = $.player.all(Die).reduce((acc, cur) => acc + cur.face, 0)
        if(this.game.all(Bot10, {rotation: 0}).map(x => x.unblockedAttack).includes(sum)) {
            this.game.message('<b>Bot-10</b> rolled a <b>' + sum + '</b> and dealt Starborg <b>2</b> unblockable damage!')
            this.game.bot10damage -= 2
            if(this.game.bot10damage <= 0) {
                this.game.message('<b>Starborg</b> has been <b>defeated</b>!')
                this.game.finish(undefined)
            } else {
                this.game.message('<b>Starborg</b> has <b>' + this.game.bot10damage + '</b> health.')
            }
        }
    }

    getActions(): Record<string, (player: StarborgVsBot10Player) => Action<Record<string, Argument>>> {
        const game = this.game
        const { action } = game;

        return {
            checkForDamagePhase2: (player) => action({}).do(() => {
                // this.game.message('Check for damage.')
                // only possible with a single die on Bot-10
                if(this.game.all(BotSpace).all(Die).length == 1) {
                    const die = this.game.all(BotSpace).first(Die)!
                    const space = die.container(BotSpace)!
                    const bot10 = space.first(Bot10)!
                    const lowest = this.game.all(StarborgSpace, {attackType: bot10.lowAttack}).all(Die)
                        .map(x => x.face).reduce((acc, cur) => cur < acc ? cur : acc, 1000)
                    const highest = this.game.all(StarborgSpace, {attackType: bot10.highAttack}).all(Die)
                        .map(x => x.face).reduce((acc, cur) => cur > acc ? cur : acc, -1000)
                    const middle = die.face
        
                    // this.game.message(lowest + ' < '  + middle + ' < ' + highest)
                    this.game.message('The required attack is a <b>' + bot10.lowAttack + 
                        '</b> is less or equal to <b>Bot-10</b> which is less or equal to a <b>' + 
                        bot10.highAttack + '</b>.')
        
                    if(lowest <= middle && middle <= highest) {
                        this.game.message('<b>Bot-10</b> has been <b>damaged</b>!')
        
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
                'die', game.all(StarborgSpace).all(Die),
                {skipIf: 'never'}
            ).do(({ die }) => { 
                game.selectedDie = die; 
                game.followUp({ name: 'moveAnyFollowUp' }) 
            }).message('You are moving {{die}}.'),

            moveAnyFollowUp: (player) => action({
                prompt: 'Choose a space to move to',
            }).chooseOnBoard(
                'space', game.all(StarborgSpace).filter(x => x.all(Die).length == 0)
                    .concat(game.selectedDie!.container(StarborgSpace)!)
            ).do(({ space }) => {
                const dieSpace = game.selectedDie!.container(Space<MyGame>)!
                if (space == dieSpace) {
                    // didn't move
                    game.clearAction()
                    this.game.message('The <b>' + game.selectedDie! + '</b> did not move.')
                } else {
                    game.selectedStarborg = space
                    if(!this.partDamaged(game.selectedStarborg)) {
                        game.performAction(this.getAction(game.selectedStarborg, game.selectedDie!))
                    } else {
                        game.clearAction()
                    }
                    this.game.message('You moved the <b>' + game.selectedDie! + '</b> to <b>' + 
                        game.selectedDie!.container(StarborgSpace)! + '</b>.')
                }
            }),
            
            removeDieBot10: (player) => action({
                prompt: 'Choose a die on Bot-10 to remove',
                condition: game.nextActionIs('removeDieBot10') &&
                    game.all(BotSpace).all(Die).length > 0
            }).chooseOnBoard(
                'die', game.all(BotSpace).all(Die),
                { skipIf: 'never' }
            ).do(({ die }) => {
                die.putInto($.player)
                if(game.bot10damage < 8) {
                    game.bot10damage++;
                }
                this.game.message('<b>Starborg</b> has <b>' + this.game.bot10damage + '</b> health.')
                game.clearAction()
            }),

            swapDice: (player) => action({
                prompt: 'Choose 2 dice to swap',
                condition: game.nextActionIs('swapDice') &&
                    game.all(StarborgSpace).all(Die).length + game.all(BotSpace).all(Die).length >= 2
            }).chooseOnBoard(
                'dice', game.all(StarborgSpace).all(Die).concat(game.all(BotSpace).all(Die)),
                { skipIf: 'never', number: 2 }
            ).do(({ dice }) => {
                const space1 = dice[0].container(Space)!
                const space2 = dice[1].container(Space)!
                dice[0].putInto(space2)
                dice[1].putInto(space1)
                game.clearAction()
            }).message('You swapped {{dice}}.'),

            moveCwCcwStarborg: (player) => action({
                prompt: 'Choose a die on Starborg to move clockwise or counter-clockwise',
                condition: game.nextActionIs('moveCwCcwStarborg') &&  (
                    game.all(StarborgSpace).all(Die).filter(x => x.getClockwiseStarborg().all(Die).length == 0).length +
                    game.all(StarborgSpace).all(Die).filter(x => x.getCounterClockwiseStarborg().all(Die).length == 0).length
                ) > 0
            }).chooseOnBoard(
                'die', game.all(StarborgSpace).all(Die).filter(x => x.getClockwiseStarborg().all(Die).length == 0).concat(
                    game.all(StarborgSpace).all(Die).filter(x => x.getCounterClockwiseStarborg().all(Die).length == 0)),
            ).do(({ die }) => {
                const myStarborg = die.container(StarborgSpace)!
                game.selectedDie = die;
                if (die.getClockwiseStarborg().all(Die).length > 0) {
                    game.followUp({ name: 'cwCcwFollowUpCcw' })
                } else if (die.getCounterClockwiseStarborg().all(Die).length > 0) {
                    game.followUp({ name: 'cwCcwFollowUpCw' })
                } else {
                    game.followUp({ name: 'cwCcwFollowUp' })
                }
            }).message('You are moving a {{die}}.'),
            
            cwCcwFollowUpCcw: (player) => action({
                prompt: 'Move counter-clockwise',
            }).chooseFrom(
                "direction", ["Counter-clockwise"], { skipIf: 'never' }
            ).do(({ direction }) => {
                const ccwStarborg = game.selectedDie!.getCounterClockwiseStarborg()
                game.selectedStarborg = ccwStarborg
                if (!this.partDamaged(ccwStarborg)) {
                    game.performAction(this.getAction(ccwStarborg, game.selectedDie!))
                } else {
                    game.clearAction()
                }
            }).message('You moved the <b>' + game.selectedDie! + '</b> on <b>Starborg</b> {{direction}}.'),
            cwCcwFollowUpCw: (player) => action({
                prompt: 'Move clockwise',
            }).chooseFrom(
                "direction", ["Clockwise"], { skipIf: 'never' }
            ).do(({ direction }) => {
                const cwStarborg = game.selectedDie!.getClockwiseStarborg()
                game.selectedStarborg = cwStarborg
                if (!this.partDamaged(cwStarborg)) {
                    game.performAction(this.getAction(cwStarborg, game.selectedDie!))
                } else {
                    game.clearAction()
                }
            }).message('You moved the <b>' + game.selectedDie! + '</b> on <b>Starborg</b> {{direction}}.'),
            cwCcwFollowUp: (player) => action({
                prompt: 'Move clockwise or counter-clockwise',
            }).chooseFrom(
                "direction", ["Clockwise", "Counter-clockwise"]
            ).do(({ direction }) => {
                const starborg = direction == 'Clockwise' ? game.selectedDie!.getClockwiseStarborg() : game.selectedDie!.getCounterClockwiseStarborg()
                game.selectedStarborg = starborg
                if (!this.partDamaged(starborg)) {
                    game.performAction(this.getAction(starborg, game.selectedDie!))
                } else {
                    game.clearAction()
                }
            }).message('You moved the <b>' + game.selectedDie! + '</b> on <b>Starborg</b> {{direction}}.'),
            
            placeDie: (player) => action({
                prompt: 'Choose a die to place on Bot-10',
                condition: game.nextActionIs('placeDie')
            }).chooseOnBoard(
                'die', game.all(StarborgSpace).all(Die).concat(game.all(BotSpace).all(Die)),
                { skipIf: 'never' }
            ).do(({ die }) => {
                game.selectedDie = die; 
                game.followUp({ name: 'placeFollowUp' }) 
            }).message('You are placing a {{die}}.'),

            placeFollowUp: (player) => action({
                prompt: 'Choose a Bot-10 part to place on',
            }).chooseOnBoard(
                'bot10', game.all(BotSpace).filter(x => x.all(Die).length == 0 && !x.first(Bot10)!.damaged)
            ).do(({ bot10 }) => {
                game.selectedBot10 = bot10
                game.clearAction()
            }).message('You placed the <b>' + game.selectedDie! + '</b> on <b>Bot-10</b>.'),

            moveCwBot10: (player) => action({
                prompt: 'Choose a die on Bot-10 to move clockwise',
                condition: game.nextActionIs('moveCwBot10') &&
                    game.all(BotSpace).all(Die).length > 0,
            }).chooseOnBoard(
                'die',
                     game.all(BotSpace).all(Die).filter(x => x.getClockwiseBot10().all(Die).length == 0)
                    //  .concat(game.all(Bot10, {damaged: false}).length == 1 ? 
                        // [game.first(Bot10, {damaged: false})!.container(BotSpace)!] : [])
                        ,
                { skipIf: 'never' }
            ).do(({ die }) => {
                const cwBot10 = die.getClockwiseBot10()
                die.putInto(cwBot10)
                game.clearAction()
            }).message('You moved the {{die}} on <b>Bot-10</b> <b>clockwise</b>.'),

            moveCcwBot10: (player) => action({
                prompt: 'Choose a die on Bot-10 to move counter-clockwise',
                condition: game.nextActionIs('moveCcwBot10') &&
                    game.all(BotSpace).all(Die).length > 0
            }).chooseOnBoard(
                'die', game.all(BotSpace).all(Die).filter(x => x.getCounterClockwiseBot10().all(Die).length == 0),
                { skipIf: 'never' }
            ).do(({ die }) => {
                const cwBot10 = die.getCounterClockwiseBot10()
                die.putInto(cwBot10)
                game.clearAction()
            }).message('You moved the {{die}} on <b>Bot-10</b> <b>counter-clockwise</b>.'),


            moveCwStarborg: (player) => action({
                prompt: 'Choose a die on Starborg to move clockwise',
                condition: game.nextActionIs('moveCwStarborg')
            }).chooseOnBoard(
                'die', game.all(StarborgSpace).all(Die).filter(x => x.getClockwiseStarborg().all(Die).length == 0),
                { skipIf: 'never' }
            ).do(({ die }) => {
                const cwStarborg = die.getClockwiseStarborg()
                die.putInto(cwStarborg)
                if (!this.partDamaged(cwStarborg)) {
                    game.performAction(this.getAction(cwStarborg, die))
                } else {
                    game.clearAction()
                }
            }).message('You moved the {{die}} on <b>Starborg</b> <b>clockwise</b>.'),

            moveCcwStarborg: (player) => action({
                prompt: 'Choose a die on Starborg to move counter-clockwise',
                condition: game.nextActionIs('moveCcwStarborg')
            }).chooseOnBoard(
                'die', game.all(StarborgSpace).all(Die).filter(x => x.getCounterClockwiseStarborg().all(Die).length == 0),
                { skipIf: 'never' }
            ).do(({ die }) => {
                const cwStarborg = die.getCounterClockwiseStarborg()
                die.putInto(cwStarborg)
                if (!this.partDamaged(cwStarborg)) {
                    game.performAction(this.getAction(cwStarborg, die))
                } else {
                    game.clearAction()
                }
            }).message('You moved the {{die}} on <b>Starborg</b> <b>counter-clockwise</b>.'),

            choose2DiceFromStarborg: (player) => action({
                prompt: 'Choose 2 dice to remove',
                condition: $.player.all(Die).length == 0
            }).chooseOnBoard(
                'dice', this.game.all(StarborgSpace).all(Die).concat(this.game.all(BotSpace).all(Die)),
                { number: 2 }
            ).do(({ dice }) => {
                dice.forEach(x => {
                    x.putInto($.player)
                });
            }).message('You chose to pick up {{dice}}.'),

            choose1DieFromStarborg: (player) => action({
                prompt: 'Choose 1 die to remove',
                condition: $.player.all(Die).length == 1
            }).chooseOnBoard(
                'dice', this.game.all(StarborgSpace).all(Die).concat(this.game.all(BotSpace).all(Die)),
                { number: 1 }
            ).do(({ dice }) => {
                dice.forEach(x => {
                    x.putInto($.player)
                });
            }).message('You chose to pick up a {{dice}}.'),

            chooseNoDiceFromStarborg: (player) => action({
                condition: $.player.all(Die).length == 2
            }).message('You already have 2 dice.'),

            chooseStarborg: (player) => action({
                prompt: 'Choose a Starborg part for this die',
            }).chooseOnBoard(
                'starborg', game.all(StarborgSpace).filter(x => x.all(Die).length == 0)
            ).do(({ starborg }) => {
                game.selectedDie!.putInto(starborg)
                const h = starborg.first(Starborg)!
                if (!h.showCube()) {
                    game.performAction(this.getAction(starborg, game.selectedDie!))
                } else {
                    game.clearAction()
                }
                game.selectedDie = undefined
            }).message('You placed the <b>' + game.selectedDie! + '</b> on {{starborg}}.'),
        }
    }
}