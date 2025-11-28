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
import { FundingName } from "./funding.js";
export type SingleArgument = string | number | boolean | GameElement | Player;
export type Argument = SingleArgument | SingleArgument[];

export class FundingPowers {
    game: MyGame

    constructor(game: MyGame) {
        this.game = game
    }

    public actionsBeforeFunding() : string[] {
        return ["usePriorityWindow", "skip"]
    }

    public actionsAfterTesting() : string[] {
        return ["usePowerRefund", "skip"]
    }

    public actionsAfterUpgrades() : string[] {
        return ["useInvestorBonus", "skip"]
    }

    public afterDiscardingFunding(player: BlueBreakthroughPlayer) {
        if(player.hasFunding(FundingName.InvestorTrust)) {
            // get an extra resource
            this.game.followUp({name: 'chooseAnyResource'});
            player.space.first(FundingCard, "Investor Trust")!.rotation = 90;
        }
    }

    public usingUpgrade(player: BlueBreakthroughPlayer, upgrade: UpgradeCard) {
        if(player.hasFunding(FundingName.PreciseTools)) {
          this.game.followUp({name: 'usePrecisionTools', args: {upgrade: upgrade}});
        }
    }

    public useInstant(player: BlueBreakthroughPlayer, funding: FundingCard) : boolean {
        switch(funding.name) {
          case FundingName.SelectiveDraw:
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
            return true;
          case FundingName.VictoryResearch:
            player.scorePoints(5);
            return true;
          case FundingName.PowerSwap:
            player.space.first(UnavailableTokenSpace)!.all(PowerToken).forEach(x => {
                x.showOnlyTo(player);
                x.putInto(player.space.first(AvailableTokenSpace)!)
            });
            return true;
        }
        return false;
    }

    public handleExtraCube(player: BlueBreakthroughPlayer, cube: ResourceCube) {
        if(player.hasFunding(FundingName.ExtraTrapSlot)) {
            cube.putInto(this.game.first(FundingCard, FundingName.ExtraTrapSlot)!);
        }
    }

    public bonusStorage(player: BlueBreakthroughPlayer) : number {
        return player.hasFunding(FundingName.ExtraTrapSlot) ? 1 : 0;
    }

    public bonusGainResource(player: BlueBreakthroughPlayer) : number {
        return player.hasFunding(FundingName.MarketSurge) ? 1 : 0;
    }

    public bonusPlateSelection(player: BlueBreakthroughPlayer) : number {
        return player.hasFunding(FundingName.CubeDraw) ? 1 : 0;
    }

    public bonusUpgradeDiscout(player: BlueBreakthroughPlayer) : number {
        return player.hasFunding(FundingName.SharedUpgrade) ? 1 : 0;
    }

    public bonusDiscardResource(player: BlueBreakthroughPlayer) : number {
        return 0;
    }

    public getExtraStorageCubes(player: BlueBreakthroughPlayer) : ResourceCube[] {
        return player.space.all(FundingCard).all(ResourceCube);
    }

    public getActions(): Record<string, (player: BlueBreakthroughPlayer) => Action<Record<string, Argument>>> {
        const game = this.game
        const { action } = game;

        return {

            skip: (player) => action({
                prompt: 'Skip',
            }),

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
                prompt: "Power Refund",
                condition: player.hasFunding(FundingName.PowerRefund)
            }).chooseFrom(
                "choice", player.board.first(LEDSpace)!.all(ResourceCube).map(x => game.symbolFromColor(x.color)),
                { skipIf: 'never'}
            ).do(({choice}) => {
                const supply = game.first(Supply)!;
                const color = game.colorFromSymbol(choice);
                supply.first(ResourceCube, {color: color})!.putInto(player.space.first(ResourceSpace)!);
            }),

            usePriorityWindow: (player) => action({
                prompt: "Priority Window",
                condition: player.hasFunding(FundingName.PriorityWindow)
            }).do(() => {
                player.fundingBoost = 2;
                player.space.first(FundingCard, "Priority Window")!.rotation = 90;          
            }),

            useConverterVoucher: (player) => action<{upgrade: UpgradeCard}>({
                prompt: "Converter Voucher?",
                condition: player.hasFunding(FundingName.ConverterVoucher)
            }).chooseFrom(
                "choice", ['Yes', 'No'], 
                { skipIf: 'never' }
    )       .do(({choice, upgrade})  => {
                if(choice == "Yes") {
                    player.space.first(FundingCard, {name: FundingName.ConverterVoucher})!.rotation = 90;
                    player.useUpgrade(upgrade, false);
                } else {
                    if(upgrade.mayUse()) {
                        player.useUpgrade(upgrade);
                    }
                }
            }),

            useInvestorBonus: (player) => action({
                prompt: "Investor Bonus",
                condition: player.hasFunding(FundingName.InvestorBonus)
            }).do(() => {
                player.scorePoints(player.purchasedUpgrades * 4);
                player.space.first(FundingCard, FundingName.InvestorBonus)!.rotation = 90;          
            }),

        }
    }
}

