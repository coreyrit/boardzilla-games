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
import { HandlerSpace, Phase1 } from './phase1.js';
import { Phase2, StarborgSpace } from './phase2.js';

export type SingleArgument = string | number | boolean | GameElement | Player;
export type Argument = SingleArgument | SingleArgument[];


export class PhaseAll {

    game: MyGame

    constructor(game: MyGame) {
        this.game = game
    }

    canDoNextAction(game: MyGame, phase1: Phase1, phase2: Phase2, die: Die) : boolean {
        if (this.game.phase == 2 && phase2.partDamaged(die.container(StarborgSpace)!)) {
            return false
        } else if (this.game.phase == 1 && phase1.handlerInjured(die.container(HandlerSpace)!)) {
            return false
        } else {
            return true
        }
    }

    getNextAction(game: MyGame, phase1: Phase1, phase2: Phase2, die: Die) : string {
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
            // SET
            add1: (player) => action({
                prompt: 'Choose a die to increase by 1',
                condition: game.nextActionIs('add1') && 
                    game.all(HandlerSpace).all(Die).filter(x => x.face < 6).length +
                    game.all(StarborgSpace).all(Die).filter(x => x.face < 6).length > 0
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(Die).concat(game.all(StarborgSpace).all(Die)).filter(x => x.face < 6),
                { skipIf: 'never' }
            ).do(({ die }) => {
                die.face = die.face + 1
                game.performAction(this.getNextAction(game, phase1, phase2, die))
            }),

            addSub1: (player) => action({
                prompt: 'Choose a die to increase or decrease by 1',
                condition: game.nextActionIs('addSub1')
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(Die).concat(game.all(StarborgSpace).all(Die)),
                {skipIf: 'never'}
            ).do(({ die }) => {
                game.selectedDie = die;
                if (die.face == 1) {
                    game.followUp({ name: 'addSubFollowUp1' })
                } else if (die.face == 6) {
                    game.followUp({ name: 'addSubFollowUp6' })
                } else {
                    game.followUp({ name: 'addSubFollowUp' })
                }
            }),

            set: (player) => action({
                prompt: 'Choose a die to set',
                condition: game.nextActionIs('set')
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(Die).concat(game.all(StarborgSpace).all(Die))
            ).do(({ die }) => { game.selectedDie = die; game.followUp({ name: 'setFollowUp' }) }),

            setFollowUp: (player) => action({
                prompt: 'Set a value',
            }).chooseFrom(
                "value", ["1", "2", "3", "4", "5", "6"]
            ).do(({ value }) => {
                const val = +value                
                if (game.selectedDie!.face == val) {
                    game.clearAction()
                } else {
                    game.selectedDie!.face = val
                    game.performAction(this.getNextAction(game, phase1, phase2, game.selectedDie!))
                }
            }),
            addSubFollowUp1: (player) => action({
                prompt: 'Increase',
            }).chooseFrom(
                "value", ["+1"], { skipIf: 'never' }
            ).do(({ value }) => {
                const val = game.selectedDie!.face + 1
                game.selectedDie!.face = val
                game.performAction(this.getNextAction(game, phase1, phase2, game.selectedDie!))
            }),
            addSubFollowUp6: (player) => action({
                prompt: 'Decrease',
            }).chooseFrom(
                "value", ["-1"], { skipIf: 'never' }
            ).do(({ value }) => {
                const val = game.selectedDie!.face - 1
                game.selectedDie!.face = val
                game.performAction(this.getNextAction(game, phase1, phase2, game.selectedDie!))
            }),
            addSubFollowUp: (player) => action({
                prompt: 'Decrease or Increase',
            }).chooseFrom(
                "value", ["-1", "+1"]
            ).do(({ value }) => {
                const val = game.selectedDie!.face + (value == "-1" ? -1 : 1)
                game.selectedDie!.face = val
                game.performAction(this.getNextAction(game, phase1, phase2, game.selectedDie!))
            }),

            sub1: (player) => action({
                prompt: 'Choose a die to decrease by 1',
                condition: game.nextActionIs('sub1') &&
                    game.all(HandlerSpace).all(Die).filter(x => x.face > 1).length +
                    game.all(StarborgSpace).all(Die).filter(x => x.face > 1).length > 0
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(Die).concat(
                    game.all(StarborgSpace).all(Die)).filter(x => x.face > 1),
                { skipIf: 'never' }
            ).do(({ die }) => {
                die.face = die.face - 1
                game.performAction(this.getNextAction(game, phase1, phase2, die))
            }),

            roll: () => action({
                prompt: 'Choose a die to roll',
                condition: game.nextActionIs('roll')
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(Die).concat(game.all(StarborgSpace).all(Die)),
                {skipIf: 'never'}
            ).do(({ die }) => {
                die.roll()
                game.performAction(this.getNextAction(game, phase1, phase2, die))
            }),
        }
    }
}