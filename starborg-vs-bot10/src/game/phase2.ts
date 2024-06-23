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

}

export class BotSpace extends Space<MyGame> {

}

export class Phase2 {
    game: MyGame

    constructor(game: MyGame) {
        this.game = game
    }

    setup() : void {
        this.game.create(StarborgSpace, 'head')
        this.game.create(StarborgSpace, 'leftArm')
        this.game.create(StarborgSpace, 'rightArm')
        this.game.create(StarborgSpace, 'leftLeg')
        this.game.create(StarborgSpace, 'rightLeg')

        this.game.create(BotSpace, 'nw')
        this.game.create(BotSpace, 'ne')
        this.game.create(BotSpace, 'sw')
        this.game.create(BotSpace, 'se')
    }
    
    transformHandler(handlerColor: 'red' | 'blue' | 'black' | 'yellow' | 'green', spaceName: string) {
        const card = this.game.first(Starborg, {color: handlerColor})!
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
}