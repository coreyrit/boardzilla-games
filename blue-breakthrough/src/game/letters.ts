
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
}

export const letterCards: Partial<LetterCard>[] = [
    {name: LetterName.SupplierDelay,	effect: "Only reveal 3 cubes per player this round.  Randomly draw and discard 1 cube per player as well."},
    {name: LetterName.BudgetReviewBoardVisit,	effect: "The player(s) with the fewest upgrades gains +5 ⭐; all others lose 2 ⭐."},
    {name: LetterName.NewSafetyProtocols,	effect: "You cannot use any Pump upgrades during Testing this round."},
    {name: LetterName.InventoryShortage,	effect: "When Gathering each player may only take up to 2 cubes regardless of power."},
    {name: LetterName.CostCuttingMeasures,	effect: "Players cannot buy upgrades of cost 3 or 4 this round."},
    {name: LetterName.OvertimeRestrictions,	effect: "Power tokens of 4 have no function this round."},
    {name: LetterName.ResearchReallocation,	effect: "Each player places all of their stored cubes into the bag and draws back an equal number."},
    {name: LetterName.EquipmentMaintenance,	effect: "You cannot use any Exhaust or Cooling upgrades during Testing this round."},
    {name: LetterName.CorporateAudit,	effect: "No funding cards can be used this round."},
    {name: LetterName.MandatoryReporting,	effect: "At the end of the round, each player must discard 1 cube of their choice from their board or lose 2 ⭐."},
    {name: LetterName.CutTestingHours,	effect: "Each player may use only 2 upgrades in their Test Phase (instead of all)."},
    {name: LetterName.StopResearchFocusOnProfits,	effect: "You cannot use any Injection or Heater upgrades during Testing this round."},
    {name: LetterName.BudgetFreeze,	effect: "This round, all Upgrade cards cost +1 power."},
    {name: LetterName.TerminateProjectNotice,	effect: "Players must place their highest available power token into the cooling pool."},                                
    
    {name: "Revised Reporting Standards",	effect: "All players must choose one upgrade on their board that cannot be used this round."},    
    {name: "Morale Committee Initiative",	effect: "Each player must give one stored cube to the player on their right. If they cannot they lose 1 ⭐."},
    {name: "Performance Evaluation",	effect: "If you score at least 7 ⭐ this round during Testing, score an additional 5 ⭐."},
    {name: "Internal Competition Policy",	effect: "Players may only use upgrade types that all players have (e.g. exhaust allowed only if all players have exhaust upgrades)"},
]

export class LetterEffects {
    game: MyGame

    constructor(game: MyGame) {
        this.game = game
    }

    finishTesting(player: BlueBreakthroughPlayer) {
        if(this.game.hasLetter(LetterName.MandatoryReporting)) {
            this.game.followUp({name: 'mandatoryReporting'});
        }
    }

    maxResources() : number {
        return this.game.hasLetter(LetterName.InventoryShortage) ? 2 : 100;
    }

    tokenForbidden(token: PowerToken) : boolean {
        return this.game.hasLetter(LetterName.OvertimeRestrictions) && token.val == 4;
    }

    cubesPerPlate() : number {
        return this.game.hasLetter(LetterName.SupplierDelay) ? 3 : 4;
    }

    upgradeForbidden(upgrade: UpgradeCard) : boolean {
        if(this.game.hasLetter(LetterName.StopResearchFocusOnProfits) && [UpgradeType.injection, UpgradeType.heater].includes(upgrade.type)) {
            return true;
        } else if(this.game.hasLetter(LetterName.EquipmentMaintenance) && [UpgradeType.exhaust, UpgradeType.cooling].includes(upgrade.type)) {
            return true;
        } else if(this.game.hasLetter(LetterName.NewSafetyProtocols) && [UpgradeType.pump].includes(upgrade.type)) {
            return true;
        } else {
            return false;
        }
    }

    upgradeAvailable(upgrade: UpgradeCard) : boolean {
        if(this.game.hasLetter(LetterName.CostCuttingMeasures) && upgrade.cost >= 3) {
            return false;
        }
        return true;
    }

    fundingForbidden() : boolean {
        return this.game.hasLetter(LetterName.CorporateAudit);
    }

    upgradeUseLimit() : number {
        return this.game.hasLetter(LetterName.CutTestingHours) ? 2 : 100;
    }

    upgradeTax() : number {
        return this.game.hasLetter(LetterName.BudgetFreeze) ? 1 : 0;
    }

    applyLetter(letter: LetterCard) {
        switch(letter.name) {
            case LetterName.TerminateProjectNotice:
                for(const p of this.game.players) {
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
                }
            case LetterName.ResearchReallocation:
                let myMap = new Map<BlueBreakthroughPlayer, number>();
                const bag = this.game.first(CubeBag)!
                for(const p of this.game.players) {
                    const cubes = p.space.first(ResourceSpace)!.all(ResourceCube); 
                    myMap.set(p, cubes.length);
                    cubes.forEach(c => c.putInto(bag));
                }
                bag.shuffle();
                for(const p of this.game.players) {
                    const n = myMap.get(p)!;
                    for(var i = 0; i < n; i++) {
                        bag.top(ResourceCube)!.putInto(p.space.first(ResourceSpace)!);
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
                    if(p.space.all(UpgradeCard).length == minUpgrades) {
                        p.scorePoints(5);
                    } else {
                        p.scorePoints(-2);
                    }
                }
                break;
            case LetterName.SupplierDelay:
                for(var i = 0; i < this.game.players.length; i++) {
                    this.game.first(CubeBag)!.top(ResourceCube)!.putInto(this.game.first(Supply)!);
                }
                break;
        }
    }
}

