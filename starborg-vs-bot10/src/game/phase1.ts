
import { StarborgVsBot10Player, MyGame, PlayerSpace, MovementSpace, VehicleSpace, HandlerSpace, Bot10, Starborg, Die } from '../game/index.js';
import {
    createGame,
    Player,
    Space,
    Piece,
    Game,
    Action,
    GameElement
} from '@boardzilla/core';


export type SingleArgument = string | number | boolean | GameElement | Player;
export type Argument = SingleArgument | SingleArgument[];


const START = 0
const DOUBLE_RIGHT = 1
const DOUBLE_LEFT = 2
const DOUBLE_BOTH = 3
const ATTACK_ADJACENT = 4
const DOUBLE_ATTACK = 5
const DOUBLE_ATTACK_ADJACENT = 6
const ATTACK_ALL_NO_DIE = 7
const FORM_STARBORG = 8


export class Phase1 {

    game: MyGame


    constructor(game: MyGame) {
        this.game = game
    }

    getActions(): Record<string, (player: StarborgVsBot10Player) => Action<Record<string, Argument>>> {
        const game = this.game
        const { action } = game;

        return {
            chooseDice: (player) => action({
                prompt: 'Choose 2 dice to remove',
                condition: $.player.all(Die).length == 0
            }).chooseOnBoard(
                'dice', $.handlers.all(Die),
                { number: 2 }
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
                { number: 1 }
            ).do(({ dice }) => {
                dice.forEach(x => {
                    x.putInto($.player)
                });
            }),

            chooseNone: (player) => action({
                condition: $.player.all(Die).length == 2
            }).message('Already have 2 dice.'),

            choosePlayerDie: (player) => action({
                prompt: 'Choose a die to place',
            }).chooseOnBoard(
                'die', $.player.all(Die),
                { skipIf: 'never' }
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
                if (h.rotation != 90) {
                    game.nextAction = this.getAction(handler, game.selectedDie!)
                } else {
                    game.nextAction = 'none'
                }
                game.selectedDie = undefined
            }),

            attackAdjacent: (player) => action({
                prompt: 'Choose an adjacent handler to be attacked',
            }).chooseOnBoard(
                'handler', [game.first(HandlerSpace, { index: this.getVehicleIndex() - 1 })!, game.first(HandlerSpace, { index: this.getVehicleIndex() + 1 })!]
            ).do(({ handler }) => {
                this.attackPosition(handler)
                if (game.bot10damage == DOUBLE_ATTACK_ADJACENT) {
                    this.attackPosition(handler)
                }
            }),

            // HEAL
            heal: (player) => action({
                prompt: 'Choose a handler to heal'
            }).chooseOnBoard(
                'handler', game.all(Starborg)
            ).do(({ handler }) => {
                handler.rotation = 0
                game.nextAction = 'none'
            }),

            // SET
            roll: () => action({
                prompt: 'Choose a die to roll',
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(Die)
            ).do(({ die }) => {
                die.roll()
                if (!this.handlerInjured(die.container(HandlerSpace)!)) {
                    game.nextAction = this.getAction(die.container(HandlerSpace)!, die)
                } else {
                    game.nextAction = 'none'
                }
            }),

            sub1: (player) => action({
                prompt: 'Choose a die to decrease by 1',
                condition: game.all(HandlerSpace).all(Die).filter(x => x.face > 1).length > 0
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(Die).filter(x => x.face > 1),
                { skipIf: 'never' }
            ).do(({ die }) => {
                die.face = die.face - 1
                if (!this.handlerInjured(die.container(HandlerSpace)!)) {
                    game.nextAction = this.getAction(die.container(HandlerSpace)!, die)
                } else {
                    game.nextAction = 'none'
                }
            }),
            add1: (player) => action({
                prompt: 'Choose a die to increase by 1',
                condition: game.all(HandlerSpace).all(Die).filter(x => x.face < 6).length > 0
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(Die).filter(x => x.face < 6),
                { skipIf: 'never' }
            ).do(({ die }) => {
                die.face = die.face + 1
                if (!this.handlerInjured(die.container(HandlerSpace)!)) {
                    game.nextAction = this.getAction(die.container(HandlerSpace)!, die)
                } else {
                    game.nextAction = 'none'
                }
            }),
            addSub1: (player) => action({
                prompt: 'Choose a die to increase or decrease by 1',
            }).chooseOnBoard('die', game.all(HandlerSpace).all(Die)
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
            }).chooseOnBoard('die', game.all(HandlerSpace).all(Die)
            ).do(({ die }) => { game.selectedDie = die; game.followUp({ name: 'setFollowUp' }) }),

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
                    if (!this.handlerInjured(game.selectedDie!.container(HandlerSpace)!)) {
                        game.nextAction = this.getAction(game.selectedDie!.container(HandlerSpace)!, game.selectedDie!)
                    } else {
                        game.nextAction = 'none'
                    }
                }
            }),
            addSubFollowUp1: (player) => action({
                prompt: 'Increase',
            }).chooseFrom(
                "value", ["+1"], { skipIf: 'never' }
            ).do(({ value }) => {
                const val = game.selectedDie!.face + 1
                game.selectedDie!.face = val
                if (!this.handlerInjured(game.selectedDie!.container(HandlerSpace)!)) {
                    game.nextAction = this.getAction(game.selectedDie!.container(HandlerSpace)!, game.selectedDie!)
                } else {
                    game.nextAction = 'none'
                }
            }),
            addSubFollowUp6: (player) => action({
                prompt: 'Decrease',
            }).chooseFrom(
                "value", ["-1"], { skipIf: 'never' }
            ).do(({ value }) => {
                const val = game.selectedDie!.face - 1
                game.selectedDie!.face = val
                if (!this.handlerInjured(game.selectedDie!.container(HandlerSpace)!)) {
                    game.nextAction = this.getAction(game.selectedDie!.container(HandlerSpace)!, game.selectedDie!)
                } else {
                    game.nextAction = 'none'
                }
            }),
            addSubFollowUp: (player) => action({
                prompt: 'Decrease or Increase',
            }).chooseFrom(
                "value", ["-1", "+1"]
            ).do(({ value }) => {
                const val = game.selectedDie!.face + (value == "-1" ? -1 : 1)
                game.selectedDie!.face = val
                if (!this.handlerInjured(game.selectedDie!.container(HandlerSpace)!)) {
                    game.nextAction = this.getAction(game.selectedDie!.container(HandlerSpace)!, game.selectedDie!)
                } else {
                    game.nextAction = 'none'
                }
            }),

            // MOVE
            move: (player) => action({
                prompt: 'Choose a die to move',
            }).chooseOnBoard('die', game.all(HandlerSpace).all(Die)
            ).do(({ die }) => { game.selectedDie = die; game.followUp({ name: 'moveFollowUp' }) }),

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
                    if (!this.handlerInjured(handler)) {
                        game.nextAction = this.getAction(handler, game.selectedDie!)
                    } else {
                        game.nextAction = 'none'
                    }
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
                if (myHandler == die.getLeftHandler() || die.getLeftHandler().all(Die).length > 0) {
                    game.followUp({ name: 'leftRightFollowUpRight' })
                } else if (myHandler == die.getRightHandler() || die.getRightHandler().all(Die).length > 0) {
                    game.followUp({ name: 'leftRightFollowUpLeft' })
                } else {
                    game.followUp({ name: 'leftRightFollowUp' })
                }
            }),

            leftRightFollowUpLeft: (player) => action({
                prompt: 'Move left',
            }).chooseFrom(
                "direction", ["Left", "Skip"], { skipIf: 'never' }
            ).do(({ direction }) => {
                if (direction != 'Skip') {
                    const leftHandler = game.selectedDie!.getLeftHandler()
                    game.selectedHandler = leftHandler
                    if (!this.handlerInjured(leftHandler)) {
                        game.nextAction = this.getAction(leftHandler, game.selectedDie!)
                    } else {
                        game.nextAction = 'none'
                    }
                } else {
                    game.nextAction = 'none'
                }
            }),
            leftRightFollowUpRight: (player) => action({
                prompt: 'Move right',
            }).chooseFrom(
                "direction", ["Right", "Skip"], { skipIf: 'never' }
            ).do(({ direction }) => {
                if (direction != 'Skip') {
                    const rightHandler = game.selectedDie!.getRightHandler()
                    game.selectedHandler = rightHandler
                    if (!this.handlerInjured(rightHandler)) {
                        game.nextAction = this.getAction(rightHandler, game.selectedDie!)
                    } else {
                        game.nextAction = 'none'
                    }
                } else {
                    game.nextAction = 'none'
                }
            }),
            leftRightFollowUp: (player) => action({
                prompt: 'Move left or right',
            }).chooseFrom(
                "direction", ["Left", "Right", "Skip"]
            ).do(({ direction }) => {
                if (direction != 'Skip') {
                    const handler = direction == 'Left' ? game.selectedDie!.getLeftHandler() : game.selectedDie!.getRightHandler()
                    game.selectedHandler = handler
                    if (!this.handlerInjured(handler)) {
                        game.nextAction = this.getAction(handler, game.selectedDie!)
                    } else {
                        game.nextAction = 'none'
                    }
                } else {
                    game.nextAction = 'none'
                }
            }),

            moveLeft: (player) => action({
                prompt: 'Choose a die to move left',
                condition: game.all(HandlerSpace).all(Die).filter(x => x.getLeftHandler().all(Die).length == 0).length > 0
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(Die).filter(x => x.getLeftHandler().all(Die).length == 0),
                { skipIf: 'never' }
            ).do(({ die }) => {
                const leftHandler = die.getLeftHandler()
                die.putInto(leftHandler)
                if (!this.handlerInjured(leftHandler)) {
                    game.nextAction = this.getAction(leftHandler, die)
                } else {
                    game.nextAction = 'none'
                }
            }),

            moveRight: (player) => action({
                prompt: 'Choose a die to move right',
                condition: game.all(HandlerSpace).all(Die).filter(x => x.getRightHandler().all(Die).length == 0).length > 0
            }).chooseOnBoard(
                'die', game.all(HandlerSpace).all(Die).filter(x => x.getRightHandler().all(Die).length == 0),
                { skipIf: 'never' }
            ).do(({ die }) => {
                const rightHandler = die.getRightHandler()
                die.putInto(rightHandler)
                if (!this.handlerInjured(rightHandler)) {
                    game.nextAction = this.getAction(rightHandler, die)
                } else {
                    game.nextAction = 'none'
                }
            }),

            swap: (player) => action({
                prompt: 'Choose 2 Handlers to swap',
            }).chooseOnBoard(
                'handlers', game.all(Starborg),
                { number: 2 }
            ).do(({ handlers }) => {
                const h1 = handlers[0].container(HandlerSpace)!
                const h2 = handlers[1].container(HandlerSpace)!
                const d1 = h1.first(Die)
                const d2 = h2.first(Die)

                handlers[0].putInto(h2)
                handlers[1].putInto(h1)
                if (d1 != undefined) {
                    d1.putInto(h2)
                }
                if (d2 != undefined) {
                    d2.putInto(h1)
                }
                game.nextAction = 'none'
            }),

            shiftLeft: () => action().do(
                () => {
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
                () => {
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
                () => {
                    const attack = game.first(Bot10, { phase1: 'attack' })!
                    attack.rotation += 180
                    game.nextAction = 'none'
                }
            ),

            nextAction: () => action().do(
                () => game.followUp({ name: game.nextAction })
            ),

            transform: (player) => action({
                prompt: 'Transform into Starborg',
                condition: game.all(Starborg, { rotation: 0 }).map(x => x.formation)
                    .includes($.player.all(Die).reduce((acc, cur) => acc + cur.face, 0))
            }).do(() => {
                game.message('TRANSFORM!')
                game.phase = 2
            }),
            skip: (player) => action({
                prompt: 'Skip'
            }).do(() => {
                game.nextAction = 'none'
            }),
        }

    }

    begin(): void {
        // roll and place dice
        this.game.all(Die).forEach(x => { x.roll() });
        const dice: Die[] = this.game.all(Die).sortBy('face')
        dice[0].putInto($.handler1)
        dice[1].putInto($.handler3)
        dice[2].putInto($.handler5)
    }

    shuffleMovementCards(): void {
        const shuffle = $.movement.all(Bot10).sortBy(x => this.game.random())
        shuffle[0].putInto($.move1)
        shuffle[1].putInto($.move2)
        shuffle[2].putInto($.move3)
    }

    followBot10Actions(): void {
        this.performMove($.move1.first(Bot10)!)
        this.performMove($.move2.first(Bot10)!)
        this.performMove($.move3.first(Bot10)!)
    }

    moveLeft(): void {
        const vehicle = this.game.first(Bot10, { phase1: 'vehicle' })!
        const space = vehicle.container(VehicleSpace)!
        if (space.index == 1) {
            vehicle.putInto(this.game.first(VehicleSpace, { index: 5 })!);
        } else {
            vehicle.putInto(this.game.first(VehicleSpace, { index: space.index - 1 })!);
        }
    }

    moveRight(): void {
        const vehicle = this.game.first(Bot10, { phase1: 'vehicle' })!
        const space = vehicle.container(VehicleSpace)!
        if (space.index == 5) {
            vehicle.putInto(this.game.first(VehicleSpace, { index: 1 })!);
        } else {
            vehicle.putInto(this.game.first(VehicleSpace, { index: space.index + 1 })!);
        }
    }

    attackPosition(handler: HandlerSpace): void {
        const die = handler.first(Die)
        if (die != undefined) {
            // dice protect handlers
            die.putInto($.player)
        } else {
            const card = handler.first(Starborg)!
            if (card.rotation == 90) {
                this.game.finish(undefined)
            } else {
                card.rotation = 90
            }
        }
    }

    getAction(handler: HandlerSpace, die: Die): string {
        return handler.first(Starborg)!.dieActions[die.face]
    }

    handlerInjured(space: HandlerSpace): boolean {
        const handler = space.first(Starborg)!
        return handler.rotation == 90
    }

    getVehicleIndex(): number {
        const vehicle = this.game.first(Bot10, { phase1: 'vehicle' })!;
        return vehicle.container(VehicleSpace)!.index;
    }

    checkForDamage(): void {
        this.game.message('Check for damage.')

        const move1 = $.move1.first(Bot10)!
        const move2 = $.move2.first(Bot10)!
        const move3 = $.move3.first(Bot10)!
        const color1 = move1.rotation == 180 ? move1.topMovement.handlerColor : move1.bottomMovement.handlerColor
        const color2 = move2.rotation == 180 ? move2.topMovement.handlerColor : move2.bottomMovement.handlerColor
        const color3 = move3.rotation == 180 ? move3.topMovement.handlerColor : move3.bottomMovement.handlerColor
        const index1 = this.game.first(Starborg, { color: color1 })!.container(HandlerSpace)!.index
        const index2 = this.game.first(Starborg, { color: color2 })!.container(HandlerSpace)!.index
        const index3 = this.game.first(Starborg, { color: color3 })!.container(HandlerSpace)!.index

        this.game.message(color1 + ' < ' + color2 + ' < ' + color3)
        this.game.message(index1 + ' < ' + index2 + ' < ' + index3)
        if (index1 < index2 && index2 < index3) {
            this.game.bot10damage++
            this.game.all(Bot10).filter(x => x.phase1 != 'vehicle').forEach(x => x.rotation += 180)
            this.game.message('Bot-10 has been damaged!')

            if (this.game.bot10damage == FORM_STARBORG) {
                this.game.message('TRANSFORM!')
                this.game.phase = 2
            }
        }
    }

    performMove(move: Bot10): void {
        const movemment = move.rotation == 180 ? move.topMovement : move.bottomMovement
        const vehicle = this.game.first(Bot10, { phase1: 'vehicle' })!
        const space = vehicle.container(VehicleSpace)!
        if (movemment.moveDirection == 'left') {
            this.moveLeft()
            if ((this.game.bot10damage == DOUBLE_LEFT && move.arrowColor == 'black' ||
                this.game.bot10damage == DOUBLE_BOTH && move.arrowColor == 'white')) {
                this.moveLeft()
            }
        } else {
            this.moveRight()
            if ((this.game.bot10damage == DOUBLE_RIGHT && move.arrowColor == 'black' ||
                this.game.bot10damage == DOUBLE_BOTH && move.arrowColor == 'white')) {
                this.moveRight()
            }
        }
        if (move.phase1 == 'attack') {

            // find the handler in the same column
            const handler = this.game.first(HandlerSpace, { index: space.index })!
            this.attackPosition(handler)

            if (this.game.bot10damage == ATTACK_ALL_NO_DIE) {
                this.game.all(HandlerSpace).forEach(x => {
                    if (x.all(Die).length == 0) {
                        this.attackPosition(x)
                    }
                })
            } else {
                if (this.game.bot10damage == DOUBLE_ATTACK || this.game.bot10damage == DOUBLE_ATTACK_ADJACENT) {
                    this.attackPosition(handler)
                }

                if (this.game.bot10damage == ATTACK_ADJACENT) {
                    if (handler.index == 1) {
                        this.attackPosition(this.game.first(HandlerSpace, { index: handler.index + 1 })!)
                    } else if (handler.index == 5) {
                        this.attackPosition(this.game.first(HandlerSpace, { index: handler.index - 1 })!)
                    } else {
                        this.game.followUp({ name: 'attackAdjacent' })
                    }
                }
            }
        }
    }

    setup(): void {
        this.game.create(Space, 'phase1')

        $.phase1.create(Space, 'movement')
        $.phase1.create(Space, 'vehicles')
        $.phase1.create(Space, 'handlers')
        $.phase1.create(PlayerSpace, 'player')

        $.movement.create(MovementSpace, 'move1')
        $.movement.create(MovementSpace, 'move2')
        $.movement.create(MovementSpace, 'move3')

        $.move1.create(Bot10, 'move-1_and_bot10nw',
            {
                phase1: 'move-left',
                topMovement: { handlerColor: 'red', moveDirection: 'left' },
                bottomMovement: { handlerColor: 'green', moveDirection: 'left' }
            })
        $.move2.create(Bot10, 'move-2_and_bot10ne',
            {
                phase1: 'attack',
                topMovement: { handlerColor: 'black', moveDirection: 'right' },
                bottomMovement: { handlerColor: 'black', moveDirection: 'left' }
            })
        $.move3.create(Bot10, 'move-3_and_bot10sw',
            {
                phase1: 'move-right',
                topMovement: { handlerColor: 'yellow', moveDirection: 'right' },
                bottomMovement: { handlerColor: 'blue', moveDirection: 'right' }
            })

        $.vehicles.create(VehicleSpace, 'vehicle1', { index: 1 })
        $.vehicles.create(VehicleSpace, 'vehicle2', { index: 2 })
        $.vehicles.create(VehicleSpace, 'vehicle3', { index: 3 })
        $.vehicles.create(VehicleSpace, 'vehicle4', { index: 4 })
        $.vehicles.create(VehicleSpace, 'vehicle5', { index: 5 })

        const vehicle = $.vehicle3.create(Bot10, 'vehicle_and_bot10se', { phase1: 'vehicle' })
        vehicle.rotation = 270

        $.handlers.create(HandlerSpace, 'handler1', { index: 1 })
        $.handlers.create(HandlerSpace, 'handler2', { index: 2 })
        $.handlers.create(HandlerSpace, 'handler3', { index: 3 })
        $.handlers.create(HandlerSpace, 'handler4', { index: 4 })
        $.handlers.create(HandlerSpace, 'handler5', { index: 5 })

        $.handler1.create(Starborg, 'green-handler_and_left-arm', {
            color: 'green', formation: 11, dieActions: {
                1: 'add1', 2: 'swap', 3: 'shiftRight', 4: 'addSub1', 5: 'roll', 6: 'set'
            }
        })

        $.handler2.create(Starborg, 'red-handler_and_right-arm', {
            color: 'red', formation: 10, dieActions: {
                1: 'shiftLeft', 2: 'addSub1', 3: 'roll', 4: 'sub1', 5: 'swap', 6: 'set'
            }
        })

        $.handler3.create(Starborg, 'black-handler_and_head', {
            color: 'black', formation: 7, dieActions: {
                1: 'shiftRight', 2: 'move', 3: 'swap', 4: 'set', 5: 'shiftLeft', 6: 'heal'
            }
        })

        $.handler4.create(Starborg, 'yellow-handler_and_left-leg', {
            color: 'yellow', formation: 4, dieActions: {
                1: 'moveLeftRight', 2: 'rotate', 3: 'shiftLeft', 4: 'swap', 5: 'moveLeft', 6: 'move'
            }
        })

        $.handler5.create(Starborg, 'blue-handler_and_right-leg', {
            color: 'blue', formation: 3, dieActions: {
                1: 'swap', 2: 'shiftRight', 3: 'moveRight', 4: 'rotate', 5: 'moveLeftRight', 6: 'move'
            }
        })

        $.player.create(Die, 'die1')
        $.player.create(Die, 'die2')
        $.player.create(Die, 'die3')

        $.player.onEnter(Die, x => {
            x.locked = false
        })
    }
}