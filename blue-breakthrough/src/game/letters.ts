
import { AvailableTokenSpace, CubeBag, LetterCard, PowerToken, ResourceCube, ResourceSpace, Supply, TokenAbility, UnavailableTokenSpace, UpgradeCard, UpgradeType } from "./components.js";
import { BlueBreakthroughPlayer, MyGame } from "./index.js";

export enum LetterName {
    TerminateProjectNotice = "Terminate Project Notice",
    BudgetFreeze = "Budget Freeze",
    StopResearchFocusOnProfits = "Stop Research, Focus on Profits",
    CutTestingHours = "Cut Testing Hours",
    MandatoryReporting = "Mandatory Reporting",
    CorporateAudit = "Corporate Audit",
    EquipmentMaintenance = "Equipment Maintenance",
    ResearchReallocation = "Research Reallocation",
    OvertimeRestrictions = "Overtime Restrictions",
    CostCuttingMeasures = "Cost-Cutting Measures",
    InventoryShortage = "Inventory Shortage",
    NewSafetyProtocols = "New Safety Protocols",
    BudgetReviewBoardVisit = "Budget Review Board Visit",
    SupplierDelay = "Supplier Delay",
    PerformanceEvaluation = "Performance Evaluation",
    InternalCompetitionPolicy = "Internal Competition Policy",
    RevisedReportingStandards = "Revised Reporting Standards",
    MoraleComitteeInitiative = "Morale Committee Initiative"
}

export const letterCards: Partial<LetterCard>[] = [
    {name: LetterName.SupplierDelay,	effect: "Discarding leftover cubes when gaining resources loses points per cube instead of earning."},
    {name: LetterName.MoraleComitteeInitiative,	effect: "Each player may spend 3 ⭐ to gain any cube to start the round or lose 1 ⭐."},
    {name: LetterName.RevisedReportingStandards,	effect: "All players must choose one upgrade on their board that cannot be used this round."},
    {name: LetterName.InternalCompetitionPolicy,	effect: "Players may only use upgrade types that all players have (e.g. exhaust allowed only if all players have exhaust upgrades)"},
    {name: LetterName.PerformanceEvaluation,	effect: "You must score at least 7 ⭐ this round during Testing, otherwise you score nothing."},    
    {name: LetterName.BudgetReviewBoardVisit,	effect: "The player(s) with the fewest upgrades gains +5 ⭐; all others lose 2 ⭐."},
    {name: LetterName.NewSafetyProtocols,	effect: "You cannot use any Pump upgrades during Testing this round."},
    {name: LetterName.InventoryShortage,	effect: "When Gathering each player may only take up to 2 cubes regardless of power."},
    {name: LetterName.CostCuttingMeasures,	effect: "Players cannot buy upgrades of cost 3 or 4 this round."},
    {name: LetterName.OvertimeRestrictions,	effect: "Power tokens of 4 have no function this round."},
    {name: LetterName.ResearchReallocation,	effect: "Each player places all of their stored cubes into the bag and draws back an equal number."},
    {name: LetterName.EquipmentMaintenance,	effect: "You cannot use any Exhaust or Cooling upgrades during Testing this round."},
    {name: LetterName.CorporateAudit,	effect: "No funding cards can be used this round (including Maintenance Delay)."},
    {name: LetterName.MandatoryReporting,	effect: "At the end of the round, each player must discard 1 cube of their choice from their board or lose 3 ⭐."},
    {name: LetterName.CutTestingHours,	effect: "Each player may use only 2 upgrades in their Test Phase (instead of all)."},
    {name: LetterName.StopResearchFocusOnProfits,	effect: "You cannot use any Injection or Heater upgrades during Testing this round."},
    {name: LetterName.BudgetFreeze,	effect: "This round, all Upgrade cards cost +1 power."},
    {name: LetterName.TerminateProjectNotice,	effect: "Players must place their highest available power token into the cooling pool."},    
]

export class LetterEffects {
    game: MyGame

    constructor(game: MyGame) {
        this.game = game
    }

    testingPointCheck(player: BlueBreakthroughPlayer, points: number) : boolean {
        if(this.game.hasLetter(LetterName.PerformanceEvaluation) && !player.letterImmune) {
            return points >= 7;
        } else {
            return true;
        }
    }

    finishTesting(player: BlueBreakthroughPlayer) {
        if(this.game.hasLetter(LetterName.MandatoryReporting) && !player.letterImmune) {
            this.game.followUp({name: 'mandatoryReporting'});
        }
    }

    maxResources(player: BlueBreakthroughPlayer) : number {
        return this.game.hasLetter(LetterName.InventoryShortage) && !player.letterImmune ? 2 : 100;
    }

    tokenForbidden(player: BlueBreakthroughPlayer, token: PowerToken) : boolean {
        return this.game.hasLetter(LetterName.OvertimeRestrictions) && token.val == 4 && !player.letterImmune;
    }

    cubesPerPlate() : number {
        return 4;
    }

    discardedCubePoints(player: BlueBreakthroughPlayer, count : number) : number {
        return this.game.hasLetter(LetterName.SupplierDelay) && !player.letterImmune ? -1 * count : count;
    }


    upgradeForbidden(player: BlueBreakthroughPlayer, upgrade: UpgradeCard) : boolean {
        if(this.game.hasLetter(LetterName.InternalCompetitionPolicy) && !player.letterImmune) {
            return this.game.players.map(p => p.space.all(UpgradeCard, {type: upgrade.type}).length > 0 ? 1 : 0)
                .reduce((sum, current) => sum + current, 0) != this.game.players.length; 
        } else if(this.game.hasLetter(LetterName.StopResearchFocusOnProfits) && [UpgradeType.injection, UpgradeType.heater].includes(upgrade.type) && !player.letterImmune) {
            return true;
        } else if(this.game.hasLetter(LetterName.EquipmentMaintenance) && [UpgradeType.exhaust, UpgradeType.cooling].includes(upgrade.type) && !player.letterImmune) {
            return true;
        } else if(this.game.hasLetter(LetterName.NewSafetyProtocols) && [UpgradeType.pump].includes(upgrade.type) && !player.letterImmune) {
            return true;
        } else {
            return false;
        }
    }

    upgradeAvailable(player: BlueBreakthroughPlayer, upgrade: UpgradeCard) : boolean {
        if(this.game.hasLetter(LetterName.CostCuttingMeasures) && !player.letterImmune && upgrade.cost >= 3) {
            return false;
        }
        return true;
    }

    fundingForbidden(player: BlueBreakthroughPlayer) : boolean {
        return this.game.hasLetter(LetterName.CorporateAudit) && !player.letterImmune;
    }

    upgradeUseLimit(player: BlueBreakthroughPlayer) : number {
        return this.game.hasLetter(LetterName.CutTestingHours) && !player.letterImmune ? 2 : 100;
    }

    upgradeTax(player: BlueBreakthroughPlayer) : number {
        return this.game.hasLetter(LetterName.BudgetFreeze) && !player.letterImmune ? 1 : 0;
    }

    applyLetter(letter: LetterCard) {
        switch(letter.name) {
            case LetterName.TerminateProjectNotice:
                for(const p of this.game.players) {
                    if(!p.letterImmune) {
                        let maxToken : PowerToken | null = null;
                        for(const token of p.board.first(AvailableTokenSpace)!.all(PowerToken)) {
                            if(maxToken == null) {
                                maxToken = token;
                            } else if(token.value() > maxToken.value() && ![TokenAbility.Publish, TokenAbility.Recall].includes(token.ability())) {
                                maxToken = token;
                            } else if(token.value() == maxToken.value() && maxToken.ability() == TokenAbility.B && token.ability() == TokenAbility.A) {
                                maxToken = token;
                            }
                        }
                        maxToken!.putInto(p.space.first(UnavailableTokenSpace)!);
                        maxToken!.showToAll();
                        p.checkCooldown();
                    }
                }
            case LetterName.ResearchReallocation:
                let myMap = new Map<BlueBreakthroughPlayer, number>();
                const bag = this.game.first(CubeBag)!
                for(const p of this.game.players) {
                    if(!p.letterImmune) {
                        const cubes = p.space.first(ResourceSpace)!.all(ResourceCube); 
                        myMap.set(p, cubes.length);
                        cubes.forEach(c => c.putInto(bag));
                    }
                }
                bag.shuffle();
                for(const p of this.game.players) {
                    if(!p.letterImmune) {
                        const n = myMap.get(p)!;
                        for(var i = 0; i < n; i++) {
                            bag.top(ResourceCube)!.putInto(p.space.first(ResourceSpace)!);
                        }
                    }
                }
                break;
            case LetterName.BudgetReviewBoardVisit:
                let minUpgrades = 1000;
                for(const p of this.game.players) {
                    const n = p.space.all(UpgradeCard).length;
                    if(n < minUpgrades) {
                        minUpgrades = n;
                    }
                }
                for(const p of this.game.players) {
                    if(!p.letterImmune) {
                        if(p.space.all(UpgradeCard).length == minUpgrades) {
                            p.scorePoints(5, LetterName.BudgetReviewBoardVisit);
                        } else {
                            p.scorePoints(-2, LetterName.BudgetReviewBoardVisit);
                        }
                    }
                }
                break;
        }
    }
}

