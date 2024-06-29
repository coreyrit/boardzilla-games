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
import { HandlerSpace, Phase1 } from './phase1.js';
import { BotSpace, Phase2, StarborgSpace } from './phase2.js';
import { disconnect } from 'process';

export type SingleArgument = string | number | boolean | GameElement | Player;
export type Argument = SingleArgument | SingleArgument[];


export class PhaseAll {

    game: MyGame

    constructor(game: MyGame) {
        this.game = game
    }

    canDoNextAction(game: MyGame, phase1: Phase1, phase2: Phase2, die: D6) : boolean {
        if (this.game.phase == 2 && phase2.partDamaged(die.container(StarborgSpace)!)) {
            return false
        } else if (this.game.phase == 1 && die.container(HandlerSpace) != undefined && phase1.handlerInjured(die.container(HandlerSpace)!)) {
            return false
        } else {
            return true
        }
    }

    getNextAction(game: MyGame, phase1: Phase1, phase2: Phase2, die: D6) : string {
        if(this.canDoNextAction(game, phase1, phase2, die)) {
            return game.phase == 1 ? phase1.getAction(die.container(HandlerSpace)!, die) :
                        phase2.getAction(die.container(StarborgSpace)!, die)
        } else {
            game.clearAction()
            return 'none'
        }
    }

    getActions(phase1: Phase1, phase2: Phase2): Record<string, (player: StarborgVsBot10Player) => Action<Record<string, Argument>>> {
        const game = this.game
        const { action } = game;

        return {

            bot10turn: (player) => action({
            }).message('Bot-10 is taking its turn.'),

            rollDice: (player) => action({
            }).chooseOnBoard(
                'dice', $.player.all(D6),
                { number: 2 }
            ).do(({dice}) => {
                dice.forEach(x => {
                    x.roll()
                })
                game.message('You roll a ' + dice[0].current + ' and ' + dice[1].current + '.')
            }),

            // SET
            add1: (player) => action({
                prompt: 'Choose a die to increase by 1',
                condition: game.nextActionIs('add1') && 
                    game.all(HandlerSpace).all(D6).filter(x => x.current < 6).length +
                    game.all(StarborgSpace).all(D6).concat(game.all(BotSpace).all(D6)).filter(x => x.current < 6).length > 0
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(D6).concat(game.all(StarborgSpace).all(D6)).concat(game.all(BotSpace).all(D6)).filter(x => x.current < 6),
                { skipIf: 'never' }
            ).do(({ die }) => {
                die.current = die.current + 1
                game.performAction(this.getNextAction(game, phase1, phase2, die))
                game.message('You increased the die to ' + die.current + '.')
            }),

            addSub1: (player) => action({
                prompt: 'Choose a die to increase or decrease by 1',
                condition: game.nextActionIs('addSub1')
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(D6).concat(game.all(StarborgSpace).all(D6)).concat(game.all(BotSpace).all(D6)),
                {skipIf: 'never'}
            ).do(({ die }) => {
                game.selectedDie = die;
                if (die.current == 1) {
                    game.followUp({ name: 'addSubFollowUp1' })
                } else if (die.current == 6) {
                    game.followUp({ name: 'addSubFollowUp6' })
                } else {
                    game.followUp({ name: 'addSubFollowUp' })
                }
                game.message('You are changing ' + die.current + '.')
            }),

            set: (player) => action({
                prompt: 'Choose a die to set',
                condition: game.nextActionIs('set')
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(D6).concat(game.all(StarborgSpace).all(D6)).concat(game.all(BotSpace).all(D6))
            ).do(({ die }) => { game.selectedDie = die; game.followUp({ name: 'setFollowUp' }) }),

            setFollowUp: (player) => action({
                prompt: 'Set a value',
            }).chooseFrom(
                "value", ["1", "2", "3", "4", "5", "6"]
            ).do(({ value }) => {
                const val = +value                
                if (game.selectedDie!.current == val) {
                    game.clearAction()
                } else {
                    game.selectedDie!.current = val
                    game.performAction(this.getNextAction(game, phase1, phase2, game.selectedDie!))
                }
            }).message('You changed the die to ' + game.selectedDie!.current + '.'),
            addSubFollowUp1: (player) => action({
                prompt: 'Increase',
            }).chooseFrom(
                "value", ["+1"], { skipIf: 'never' }
            ).do(({ value }) => {
                const val = game.selectedDie!.current + 1
                game.selectedDie!.current = val
                game.performAction(this.getNextAction(game, phase1, phase2, game.selectedDie!))
            }).message('You increased the die to ' + game.selectedDie!.current + '.'),
            addSubFollowUp6: (player) => action({
                prompt: 'Decrease',
            }).chooseFrom(
                "value", ["-1"], { skipIf: 'never' }
            ).do(({ value }) => {
                const val = game.selectedDie!.current - 1
                game.selectedDie!.current = val
                game.performAction(this.getNextAction(game, phase1, phase2, game.selectedDie!))
            }).message('You decreased the die to ' + game.selectedDie!.current + '.'),
            addSubFollowUp: (player) => action({
                prompt: 'Decrease or Increase',
            }).chooseFrom(
                "value", ["-1", "+1"]
            ).do(({ value }) => {
                const val = game.selectedDie!.current + (value == "-1" ? -1 : 1)
                game.selectedDie!.current = val
                game.performAction(this.getNextAction(game, phase1, phase2, game.selectedDie!))
            }).message('You changed the die to ' + game.selectedDie!.current + '.'),

            sub1: (player) => action({
                prompt: 'Choose a die to decrease by 1',
                condition: game.nextActionIs('sub1') &&
                    game.all(HandlerSpace).all(D6).filter(x => x.current > 1).length +
                    game.all(StarborgSpace).all(D6).filter(x => x.current > 1).length +
                    game.all(BotSpace).all(D6).filter(x => x.current > 1).length > 0
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(D6).concat(
                    game.all(StarborgSpace).all(D6)).filter(x => x.current > 1),
                { skipIf: 'never' }
            ).do(({ die }) => {
                die.current = die.current - 1
                game.performAction(this.getNextAction(game, phase1, phase2, die))
                game.message('You decreaesed the die to ' + die.current + '.')  
            }),

            roll: () => action({
                prompt: 'Choose a die to roll',
                condition: game.nextActionIs('roll')
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(D6).concat(game.all(StarborgSpace).all(D6)).concat(game.all(BotSpace).all(D6)),
                {skipIf: 'never'}
            ).do(({ die }) => {
                const prevFace = die.current
                die.roll()                
                const newFace = die.current
                if(die.container(StarborgSpace) != undefined && prevFace != newFace) {
                    game.performAction(this.getNextAction(game, phase1, phase2, die))
                } else {
                    game.clearAction()
                }
                game.message('You rolled a ' + prevFace + ' into a ' + newFace + '.')
            }),
        }
    }
}