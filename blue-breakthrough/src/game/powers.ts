import { BlueBreakthroughPlayer, MyGame } from "./index.js";
import {
    createGame,
    Player,
    Space,
    Piece,
    Game,
    Action,
    GameElement
} from '@boardzilla/core';
import { PlayerSpace, PlayerBoard, ResourceCube, CubeBag, Supply, CubeColor, FundingSpace,
  FundingDeck, FundingCard, UpgradeSpace, UpgradeDeck, UpgradeCard, CubePlate, ScoreCube, 
  ScoreSpace, ScoreTrack, MainBoard, PlayersSpace, PowerToken, TokenAbility, AvailableTokenSpace,
  PowerTokenSpace,
  TokenAction,
  ReactorSpace,
  LEDCard,
  LEDSpace,
  ResourceSpace,
  UpgradeType,
  UnavailableTokenSpace,
  StorageSpace,
  RoundSpace,
  RoundTracker,
  PublishToken,
  PriorityPawn,
  FundingType
 } from './components.js';
export type SingleArgument = string | number | boolean | GameElement | Player;
export type Argument = SingleArgument | SingleArgument[];

export class FundingPowers {
    game: MyGame

    constructor(game: MyGame) {
        this.game = game
    }

    public usingUpgrade(player: BlueBreakthroughPlayer, upgrade: UpgradeCard) {
        if(player.hasFunding("Precision Tools")) {
          this.game.followUp({name: 'usePrecisionTools', args: {upgrade: upgrade}});
        }
    }

    public finishTesting(player: BlueBreakthroughPlayer) {
        if(player.hasFunding("Power Refund")) {
            this.game.followUp({name: 'usePowerRefund'});
        }
    }

    public useInstant(player: BlueBreakthroughPlayer, funding: FundingCard) {
        switch(funding.name) {
          case "Selective Draw":
            const bag = this.game.first(CubeBag)!;
            const supply = this.game.first(Supply)!;
            const space = player.space.first(ResourceSpace)!;
            supply.first(ResourceCube, {color: CubeColor.Blue})!.putInto(bag);
            supply.first(ResourceCube, {color: CubeColor.Blue})!.putInto(bag);
            supply.first(ResourceCube, {color: CubeColor.White})!.putInto(bag);
            supply.first(ResourceCube, {color: CubeColor.White})!.putInto(bag);
            bag.shuffle();
            bag.top(ResourceCube)!.putInto(space);
            bag.top(ResourceCube)!.putInto(space);
            bag.top(ResourceCube)!.putInto(space);
            bag.top(ResourceCube)!.putInto(space);
            break;
        }
    }

    public bonusGainResource(player: BlueBreakthroughPlayer) : number {
        return player.hasFunding("Market Surge") ? 1 : 0;
    }

    public bonusPlateSelection(player: BlueBreakthroughPlayer) : number {
        return player.hasFunding("Cube Draw") ? 1 : 0;
    }

    public getActions(): Record<string, (player: BlueBreakthroughPlayer) => Action<Record<string, Argument>>> {
        const game = this.game
        const { action } = game;

        return {

            usePrecisionTools: (player) => action<{upgrade: UpgradeCard}>({
                prompt: "Precison Tooling"
            }).chooseFrom(
                "choice", ({upgrade}) => upgrade.output.map(x => game.symbolFromColor(x)).concat("Skip").filter(x => x != "✳️"),
                { skipIf: 'never'}
            ).do(({upgrade, choice}) => {
                if(choice != "Skip") {
                    const supply = game.first(Supply)!;
                    const color = game.colorFromSymbol(choice);
                    game.followUp({name: 'chooseAnyResource'});

                    // remove the original color
                    player.space.first(ResourceSpace)!.first(ResourceCube, {color: color})!.putInto(supply);
                    player.space.first(FundingCard, "Precision Tools")!.rotation = 90;
                }
            }),

            usePowerRefund: (player) => action({
                prompt: "Power Refund"
            }).chooseFrom(
                "choice", player.board.first(LEDSpace)!.all(ResourceCube).map(x => game.symbolFromColor(x.color)),
                { skipIf: 'never'}
            ).do(({choice}) => {
                const supply = game.first(Supply)!;
                const color = game.colorFromSymbol(choice);
                supply.first(ResourceCube, {color: color})!.putInto(player.space.first(ResourceSpace)!);
            }),
        }
    }
}

