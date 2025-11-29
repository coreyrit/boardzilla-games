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
  FundingType,
  DrawUpgradeSpace
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
        return ["usePriorityWindow", "useEmergencyReset", "skip"]
    }

    public actionsAfterTesting() : string[] {
        return ["useMiniStorage", "usePowerRefund", "skip"]
    }

    public actionsAfterUpgrades() : string[] {
        return ["useInvestorBonus", "skip"]
    }

    public afterDiscardingFunding(player: BlueBreakthroughPlayer) {
        if(player.hasFunding(FundingName.InvestorTrust)) {
            // get an extra resource
            this.game.followUp({name: 'chooseAnyResource'});
            player.space.first(FundingCard, FundingName.InvestorTrust)!.rotation = 90;
        }
    }

    public usingUpgrade(player: BlueBreakthroughPlayer, upgrade: UpgradeCard) {
        if(player.hasFunding(FundingName.PreciseTools)) {
          this.game.followUp({name: 'usePrecisionTools', args: {upgrade: upgrade}});
        } else if(player.hasFunding(FundingName.LoanedTechnician)) {
            this.game.followUp({name: 'useLoanedTechnicial', args: {upgrade: upgrade}});
        }
    }

    public useAbility(player: BlueBreakthroughPlayer, funding: FundingCard) : boolean {
        switch(funding.name) {
          case FundingName.ReagentVoucher:
            this.game.followUp({name: 'useReagentVoucher'});
            return true;
          case FundingName.ExperimentalCatalyst:
            this.game.followUp({name: 'useExperimentalCatalyst'});
            return true; 
          case FundingName.ResearchCollaboration:
            this.game.followUp({name: 'useResearchCollaboration'});
            return true; 
          case FundingName.OverclockedReactor:
            this.game.followUp({name: 'useOverclockedReactor'});
            return true;
          case FundingName.PublicDemonstration:
            this.game.followUp({name: 'usePublicDemonstration'});
            return true;
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
          case FundingName.RnDGrant:
            this.game.first(FundingDeck)!.top(FundingCard)!.putInto(this.game.first(DrawUpgradeSpace)!);
            this.game.first(FundingDeck)!.top(FundingCard)!.putInto(this.game.first(DrawUpgradeSpace)!);
            this.game.followUp({name: 'chooseFundingFromDraw'});
            return true;
          case FundingName.LateStageFunding:
            if(this.game.getEra() == 3) {
                this.game.first(FundingDeck)!.top(FundingCard)!.putInto(player.space);
                this.game.first(FundingDeck)!.top(FundingCard)!.putInto(player.space);
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    public handleExtraCube(player: BlueBreakthroughPlayer, cube: ResourceCube) {
        if(player.hasFunding(FundingName.ExtraTrapSlot)) {
            cube.putInto(this.game.first(FundingCard, FundingName.ExtraTrapSlot)!);
        }
    }

    public handleLeftoverCubes(player: BlueBreakthroughPlayer, cubes: ResourceCube[]) {
        if(player.hasFunding(FundingName.StorageInsurance)) {
            player.scorePoints(cubes.length * 2);
        }
    }

    public bonusResourceDiscount(player: BlueBreakthroughPlayer, upgrade: UpgradeCard) : number {
        return (upgrade.input.length == 2 && player.hasFunding(FundingName.EfficiencyAudit)) ? 1 : 0;
    }

    public bonusUpgradeDraw(player: BlueBreakthroughPlayer) : number {
        return player.hasFunding(FundingName.MarketPeek) ? 1 : 0;
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

    public bonusUpgradePoints(upgrade: UpgradeCard, player: BlueBreakthroughPlayer) : number {
        return player.hasFunding(FundingName.InvestorFavor) && upgrade.cost >= 3 ? 3 : 0;
    }

    public bonusUpgradeUse(player: BlueBreakthroughPlayer) : boolean {
        return player.hasFunding(FundingName.ConverterVoucher);
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
            }).do(() => player.doneActions = true),

            usePrecisionTools: (player) => action<{upgrade: UpgradeCard}>({
                prompt: FundingName.PreciseTools
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
                    player.space.first(FundingCard, FundingName.PreciseTools)!.rotation = 90;

                    if(player.hasFunding(FundingName.LoanedTechnician)) {
                        this.game.followUp({name: 'useLoanedTechnicial', args: {upgrade: upgrade}});
                    }
                }
            }),

            useLoanedTechnicial: (player) => action<{upgrade: UpgradeCard}>({
                prompt: FundingName.LoanedTechnician
            }).chooseFrom(
                "choice", ({upgrade}) => ["Yes", "No"],
                { skipIf: 'never'}
            ).do(({upgrade, choice}) => {
                if(choice == "Yes") {
                    player.space.first(FundingCard, {name: FundingName.LoanedTechnician})!.rotation = 90;  
                    upgrade.rotation = 0; 
                }
            }),

            useMiniStorage: (player) => action({
                prompt: FundingName.MiniStorage,
                condition: player.hasFunding(FundingName.MiniStorage) &&
                    player.space.all(FundingCard, {name: FundingName.MiniStorage}).all(ResourceCube).length < 2,
            }).chooseOnBoard(
                'cubes', player.space.first(ResourceSpace)!.all(ResourceCube).filter(x => [CubeColor.Blue, CubeColor.White].includes(x.color)),
                { min: 0, max: 2, skipIf: 'never' }
            ).do(({ cubes }) => {
                const card = player.space.first(FundingCard, {name: FundingName.MiniStorage});
                if(card != undefined) {
                    cubes.forEach(x => x.putInto(card!));
                }
            }),

            useTemporarySlot: (player) => action<{upgrade: UpgradeCard}>({
                prompt: FundingName.TemporarySlot,
            }).chooseFrom(
                "choice", ["Yes", "No"],
                { skipIf: 'never'}
            ).do(({ choice, upgrade }) => {
                if(choice == "Yes") {
                    upgrade.putInto(player.space.first(FundingCard, {name: FundingName.TemporarySlot})!);
                } else {
                    player.finishPlacingUpgrade(upgrade);
                }                
            }),

            usePowerRefund: (player) => action({
                prompt: FundingName.PowerRefund,
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
                prompt: FundingName.PriorityWindow,
                condition: player.hasFunding(FundingName.PriorityWindow)
            }).do(() => {
                player.fundingBoost = 2;
                player.space.first(FundingCard, FundingName.PriorityWindow)!.rotation = 90;
            }),

            useReagentVoucher: (player) => action({
                prompt: FundingName.ReagentVoucher,
                // condition: player.hasFunding(FundingName.ReagentVoucher)
            }).chooseFrom(
                "choice", ['🟦', '⬜'],
                { skipIf: 'never'}
            ).do(({choice}) => {
                const supply = game.first(Supply)!;
                const color = game.colorFromSymbol(choice);
                supply.first(ResourceCube, {color: color})!.putInto(player.space.first(ResourceSpace)!);
                // player.space.first(FundingCard, FundingName.ReagentVoucher)!.rotation = 90;
            }),

            useExperimentalCatalyst: (player) => action({
                prompt: FundingName.ExperimentalCatalyst,
                // condition: player.hasFunding(FundingName.ExperimentalCatalyst)
            }).chooseOnBoard(
                'cube', player.space.first(ResourceSpace)!.all(ResourceCube),
                { skipIf: 'never' }
            ).do(({cube}) => {
                const supply = game.first(Supply)!;
                cube.putInto(supply);
                game.followUp({name: 'chooseAnyResource'});
            }),

            useResearchCollaboration: (player) => action({
                prompt: FundingName.ResearchCollaboration,
                // condition: player.hasFunding(FundingName.ResearchCollaboration)
            }).chooseOnBoard(
                'upgrade', game.players.filter(p => p != player).flatMap(x => x.space.all(UpgradeCard, {type: UpgradeType.trap})),
                { skipIf: 'never' }
            ).do(({upgrade}) => {
               const cube = game.first(Supply)!.first(ResourceCube, {color: upgrade.output[0]})!;
               cube.putInto(player.space.first(ResourceSpace)!);
            }),

            useOverclockedReactor: (player) => action({
                prompt: FundingName.OverclockedReactor,
                // condition: player.hasFunding(FundingName.OverclockedReactor)
            }).chooseOnBoard(
                'upgrade', $.mainBoard.all(UpgradeCard).filter(x => x.mayUse(player)),
                { skipIf: 'never' }
            ).do(({upgrade}) => {
               player.useUpgrade(upgrade);
               upgrade.rotation = 0;
            }),

            usePublicDemonstration: (player) => action({
                prompt: FundingName.PublicDemonstration,
                // condition: player.hasFunding(FundingName.PublicDemonstration)
            }).chooseOnBoard(
                'upgrade', player.space.all(UpgradeCard).filter(x => x.rotation == 0),
                { skipIf: 'never' }
            ).do(({upgrade}) => {
               upgrade.rotation = 90;
               player.scorePoints(upgrade.cost);
            }),

            useEmergencyReset: (player) => action({
                prompt: FundingName.EmergencyReset,
                condition: player.hasFunding(FundingName.EmergencyReset)
            }).do(() => {
                this.game.followUp({name: 'useEmergencyResetReplaceToken', args: {action: TokenAction.Funding}});
                this.game.followUp({name: 'useEmergencyResetReplaceToken', args: {action: TokenAction.Resources}});
                this.game.followUp({name: 'useEmergencyResetReplaceToken', args: {action: TokenAction.Upgrade}});
                player.space.first(FundingCard, FundingName.EmergencyReset)!.rotation = 90;
            }),

            useEmergencyResetReplaceToken: (player) => action<{action: TokenAction}>({
                prompt: "Replace Token",
            }).chooseOnBoard(
                'currentToken', ({action}) => player.board.all(PowerTokenSpace, {action: action}).all(PowerToken)!,
                { skipIf: 'never' }
            ).chooseOnBoard(
                'token', ({action}) => player.board.all(AvailableTokenSpace).all(PowerToken).concat(player.board.all(PowerTokenSpace).all(PowerToken)),
                { skipIf: 'never' }
            ).do(({currentToken, token, action}) => {
                currentToken.putInto(token.container(Space)!);
                token.putInto(player.board.first(PowerTokenSpace, {action: action})!);
            }),

            useConverterVoucher: (player) => action<{upgrade: UpgradeCard}>({
                prompt: FundingName.ConverterVoucher,
                condition: player.hasFunding(FundingName.ConverterVoucher)
            }).chooseFrom(
                "choice", ['Yes', 'No'], 
                { skipIf: 'never' }
    )       .do(({choice, upgrade})  => {
                if(choice == "Yes") {
                    player.space.first(FundingCard, {name: FundingName.ConverterVoucher})!.rotation = 90;
                    player.useUpgrade(upgrade, false);
                } else {
                    if(upgrade.mayUse(player)) {
                        player.useUpgrade(upgrade);
                    }
                }
            }),

            useEfficiencyAudit: (player) => action<{upgrade: UpgradeCard}>({
                prompt: FundingName.EfficiencyAudit,
                condition: player.hasFunding(FundingName.EfficiencyAudit)
            }).chooseOnBoard(
                'cube', ({upgrade}) => player.space.first(ResourceSpace)!.all(ResourceCube).filter(x => upgrade.input.includes(x.color)),
                { skipIf: 'never' }
            ).do(({cube, upgrade})  => {
                cube.putInto(this.game.first(Supply)!);
                player.useUpgrade(upgrade, false);
            }),

            useInvestorBonus: (player) => action({
                prompt: FundingName.InvestorBonus,
                condition: player.hasFunding(FundingName.InvestorBonus)
            }).do(() => {
                player.scorePoints(player.purchasedUpgrades * 4);
                player.space.first(FundingCard, FundingName.InvestorBonus)!.rotation = 90;          
            }),

        }
    }
}

