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
import { FundingPowers } from "./powers.js";
import { FundingName } from "./funding.js";
import { LetterEffects } from "./letters.js";
export type SingleArgument = string | number | boolean | GameElement | Player;
export type Argument = SingleArgument | SingleArgument[];

export class Actions {
    game: MyGame
    powers: FundingPowers
    letters: LetterEffects

    constructor(game: MyGame, powers: FundingPowers, letters: LetterEffects) {
        this.game = game
        this.powers = powers;
        this.letters = letters;
    }

    getActions(): Record<string, (player: BlueBreakthroughPlayer) => Action<Record<string, Argument>>> {
        const game = this.game
        const { action } = game;

        return {

    placeToken: (player) => action({
      prompt: 'Place Token'
    }).chooseOnBoard(
      'token', player.board.first(AvailableTokenSpace)!.all(PowerToken),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'space', player.board.all(PowerTokenSpace).filter(x => x.all(PowerToken).length == 0),
      { skipIf: 'never' }
    ).do(({ token, space }) => {
      token.putInto(space);
    }).message(`{{player}} placed a token on {{space}}.`),

    chooseFunding: (player) => action({
      prompt: 'Choose Funding',
      condition: game.getPlayerToken(player, TokenAction.Funding).mayPeformAction()
    }).chooseOnBoard(
      'funding', game.all(FundingSpace).all(FundingCard),
      { skipIf: 'never' }
    ).do(({ funding }) => {
      funding.putInto(player.space);
      player.space.first(PowerTokenSpace, {action: TokenAction.Funding})!.complete = true;
      player.scorePoints(game.getPlayerToken(player, TokenAction.Funding).value);
    }).message(`{{player}} took {{funding}}.`),

    publishFunding: (player) => action({
      prompt: 'Publish',
      condition: game.getPlayerToken(player, TokenAction.Funding).ability == TokenAbility.Publish
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Funding})!.complete = true;
    }),

    recallFunding: (player) => action({
      prompt: 'Recall',
      condition: game.getPlayerToken(player, TokenAction.Funding).ability == TokenAbility.Recall
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Funding})!.complete = true;
    }),

    discardFunding: (player) => action<{upgrade: UpgradeCard}>({
      prompt: "Discard Funding",
    }).chooseOnBoard(
      'funding', player.space.all(FundingCard).filter(x => x.type == FundingType.Permanent || x.rotation == 90),
      { skipIf: 'never' }
    ).confirm(
       'Discard'
    ).do(({ funding }) => {
      game.followUp({name: 'chooseAnyResource', args: {funding: funding}});
    }), 

    useFunding: (player) => action<{upgrade: UpgradeCard}>({
      prompt: "Use Funding"
    }).chooseOnBoard(
      'funding', player.space.all(FundingCard).filter(x => x.type != FundingType.Permanent && x.rotation == 0),
      { skipIf: 'never' }
    ).chooseFrom(
      "choice", ['Ability', 'Discard'], 
      { skipIf: 'never' }
    ).do(({ funding, choice }) => {
      if(choice == "Discard") {
        game.followUp({name: 'chooseAnyResource', args: {funding: funding}});
      } else {
        if(this.powers.useAbility(player, funding)) {
            funding.rotation = 90;
        }
      }
    }),

    storeCubes: (player) => action({
      prompt: "Store Cubes (" + (game.getStage(game.round) + this.powers.bonusStorage(player)) + ")"
    }).chooseOnBoard(
      'cubes', player.space.first(ResourceSpace)!.all(ResourceCube),
      { min: 0, max: game.getStage(game.round) + this.powers.bonusStorage(player), skipIf: 'never' }
    ).do(({ cubes }) => {
      for(var i = 0; i < cubes.length; i++) {
        if((i+1) <= game.getStage(game.round)) {
            cubes[i].putInto(player.space.first(StorageSpace, {stage: (i+1)})!);
        } else {
            this.powers.handleExtraCube(player, cubes[i]);
        }
      }
      this.powers.handleLeftoverCubes(player, player.space.first(ResourceSpace)!.all(ResourceCube));
      this.letters.finishTesting(player);
    }),
    
    recallToken: (player) => action({
      prompt: "Recall Token"
    }).chooseOnBoard(
      'token', player.board.all(PowerTokenSpace).all(PowerToken)
        .concat(player.board.first(UnavailableTokenSpace)!.all(PowerToken))
        .filter(x => x.ability != TokenAbility.Recall),
      { skipIf: 'never' }
    ).do(({ token }) => {
      // player.scorePoints(player.space.first(UnavailableTokenSpace)!.all(PowerToken).length);
      player.scorePoints(game.round);
      token.showOnlyTo(player);
      token.putInto(player.space.first(AvailableTokenSpace)!);
    }),

    chooseAnyResource: (player) => action<{funding: FundingCard}>({
      prompt: "Gain Any"
    }).chooseFrom(
      "choice", ['⬜','🟫','🟦','🟧','⬛','🟥','🟨'],
      { skipIf: 'never' }
    ).do(({funding, choice}) => {
      game.first(Supply)!.first(ResourceCube, {color: game.colorFromSymbol(choice)})!
        .putInto(player.space.first(ResourceSpace)!);
      if(funding != undefined) {
        funding.putInto(game.first(Supply)!);
        this.powers.afterDiscardingFunding(player);
      }
    }),

    chooseResources: (player) => action({
      condition: game.getPlayerToken(player, TokenAction.Resources).mayPeformAction(),
      prompt: "Gain Resources (" + (game.getPlayerToken(player, TokenAction.Resources).value + this.powers.bonusGainResource(player)) + ")"
    }).chooseOnBoard(
      'plates', game.all(CubePlate).filter(x => x.all(ResourceCube).length > 0),
      { min: 1, max: 1 + this.powers.bonusPlateSelection(player), skipIf: 'never' }
    ).chooseOnBoard(
      'cubes', ({plates}) => plates[0].all(ResourceCube).concat(plates.length > 1 ? plates[1].all(ResourceCube) : []),
      { number: ({plates}) => Math.min(game.getPlayerToken(player, TokenAction.Resources).value + this.powers.bonusGainResource(player),
        plates.reduce((sum, current) => sum + current.all(ResourceCube).length, 0)) }
    ).do(({ plates, cubes }) => {      
      
      // special case for Cube Draw
      let uniquePlates: CubePlate[] = [] 
      if(cubes.length == 0) {
        uniquePlates.push(plates[0]);
      } else {
        if(plates.length > 0) {               
          cubes.forEach(x => {
            const pl = x.container(CubePlate)!;
            if(!uniquePlates.includes(pl)) {
              uniquePlates.push(pl);
            }
          });
        }
      }
      
      // give cubes to player
      cubes.forEach( c=> c.putInto(player.space.first(ResourceSpace)!) );
      player.space.first(PowerTokenSpace, {action: TokenAction.Resources})!.complete = true;

      let plate = plates[0];

      // special case for Cube Draw
      if(plates.length > 0) {
        if(uniquePlates.length > 1) {
          plates[0].all(ResourceCube).forEach(x => x.putInto(plates[1]));          
        } else {
          plate = uniquePlates[0];
        }
      }

      player.scorePoints(plate.all(ResourceCube).length);
      plate.all(ResourceCube).forEach( c=> c.putInto(game.first(Supply)!) );
    }),

    publishResources: (player) => action({
      prompt: 'Publish',
      condition: game.getPlayerToken(player, TokenAction.Resources).ability == TokenAbility.Publish
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Resources})!.complete = true;
    }),

    recallResources: (player) => action({
      prompt: 'Recall',
      condition: game.getPlayerToken(player, TokenAction.Resources).ability == TokenAbility.Recall
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Resources})!.complete = true;
    }),

    chooseUpgrades: (player) => action({
      condition: game.getPlayerToken(player, TokenAction.Upgrade).mayPeformAction(),
      prompt: "Choose Upgrades (" + game.getPlayerToken(player, TokenAction.Upgrade).value + ")"
    }).chooseOnBoard(
      'upgrades', game.all(UpgradeSpace).all(UpgradeCard)
        .filter(x => x.cost-this.powers.bonusUpgradeDiscout(player)+this.letters.upgradeTax() <= game.getPlayerToken(player, TokenAction.Upgrade).value),
      { min: 1, max: 2, skipIf: 'never', validate: ({upgrades}) => {
        const upgradeSum = upgrades.reduce((sum, x) => sum + x.cost-this.powers.bonusUpgradeDiscout(player)+this.letters.upgradeTax(), 0)
        return upgradeSum <= game.getPlayerToken(player, TokenAction.Upgrade).value;
      } }
    ).do(({ upgrades }) => {
      player.purchasedUpgrades = upgrades.length;
      upgrades.forEach( c=> player.placeUpgrade(c) );
      player.scorePoints((game.getEra() * upgrades.length) + 
        upgrades.reduce((sum, current) => sum + this.powers.bonusUpgradePoints(current, player), 0));
      player.space.first(PowerTokenSpace, {action: TokenAction.Upgrade})!.complete = true;
    }),  

    drawUpgrade: (player) => action({
      prompt: 'Draw Upgrade',
      condition: game.getPlayerToken(player, TokenAction.Upgrade).mayPeformAction(),
    }).do(() => {
      // this automatically happens .....
      const upgradeSpace = game.first(DrawUpgradeSpace)!;

      for(var i = 0; i < 1 + this.powers.bonusUpgradeDraw(player); i++) {
        const upgrade = game.first(UpgradeDeck)!.first(UpgradeCard, {stage: game.getStage(game.round)})!;
        upgrade.putInto(upgradeSpace);
      }

      if(upgradeSpace.all(UpgradeCard).length > 1) {
        game.followUp({name: 'chooseUpgradeFromDraw'});
      } else {
        const upgrade = upgradeSpace.first(UpgradeCard)!;
        player.placeUpgrade(upgrade);
        player.scorePoints(game.getEra() + this.powers.bonusUpgradePoints(upgrade, player));      
        player.space.first(PowerTokenSpace, {action: TokenAction.Upgrade})!.complete = true;
        game.message(player.name + " drew " + upgrade);
      }
    }),

    discardUpgrade: (player) => action<{upgrade: UpgradeCard}>({
      prompt: "Replace Upgrade?"
    }).chooseFrom(
      "choice", ['Yes', 'No'], 
      { skipIf: 'never' }
    ).do(({ upgrade, choice }) => {
      if(choice == 'Yes') {
        player.board.first(ReactorSpace, {type: upgrade.type})!.first(UpgradeCard)!.putInto(game.first(Supply)!);
        upgrade.putInto(player.board.first(ReactorSpace, {type: upgrade.type})!);
      } else {
        upgrade.putInto(game.first(Supply)!);
      }
    }),  

    discardPump: (player) => action<{upgrade: UpgradeCard}>({
      prompt: "Replace Upgrade?"
    }).chooseFrom(
      "choice", ['Yes', 'No'], 
      { skipIf: 'never' }
    ).do(({ upgrade, choice }) => {
      if(choice == 'Yes') {
        this.game.followUp({name: 'choosePump', args: {upgrade: upgrade}});
      } else {
        upgrade.putInto(game.first(Supply)!);
      }
    }),

    choosePump: (player) => action<{upgrade: UpgradeCard}>({
      prompt: 'Choose Pump to Discard',
    }).chooseOnBoard(
      'pump', player.board.all(UpgradeSpace).all(UpgradeCard, {type: UpgradeType.pump}),
      { skipIf: 'never' }
    ).do(({ pump }) => {
      const space = pump.container(UpgradeSpace)!
      pump.putInto(game.first(Supply)!);
      pump.putInto(space);
    }), 

    chooseUpgradeFromDraw: (player) => action({
      prompt: 'Choose Upgrade',
    }).chooseOnBoard(
      'upgrade', game.first(DrawUpgradeSpace)!.all(UpgradeCard),
      { skipIf: 'never' }
    ).do(({upgrade}) => {
      player.placeUpgrade(upgrade);
      player.scorePoints(game.getEra() + this.powers.bonusUpgradePoints(upgrade, player));      
      player.space.first(PowerTokenSpace, {action: TokenAction.Upgrade})!.complete = true;

      this.game.first(DrawUpgradeSpace)!.all(UpgradeCard).forEach(x => x.putInto(this.game.first(Supply)!));
      game.message(player.name + " drew " + upgrade);
    }),

    chooseFundingFromDraw: (player) => action({
      prompt: 'Choose Funding',
    }).chooseOnBoard(
      'funding', game.first(DrawUpgradeSpace)!.all(FundingCard),
      { skipIf: 'never' }
    ).do(({funding}) => {
      funding.putInto(player.space);
      this.game.first(DrawUpgradeSpace)!.all(FundingCard).forEach(x => x.putInto(this.game.first(Supply)!));

    }),

    publishUpgrades: (player) => action({
      prompt: 'Publish',
      condition: game.getPlayerToken(player, TokenAction.Upgrade).ability == TokenAbility.Publish
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Upgrade})!.complete = true;
    }),

    recallUpgrades: (player) => action({
      prompt: 'Recall',
      condition: game.getPlayerToken(player, TokenAction.Upgrade).ability == TokenAbility.Recall
    }).do(() => {
      player.space.first(PowerTokenSpace, {action: TokenAction.Upgrade})!.complete = true;
    }),

    end: () => action({
      prompt: 'Game over'
    }).chooseOnBoard(
      'none', []
    ),

    flipLED: (player) => action({
      prompt: 'Flip LED',
      condition: player.board.first(LEDSpace)!.all(ResourceCube).length == 0
    }).chooseOnBoard(
      'led', player.space.all(LEDSpace),
      { skipIf: 'never' }
    ).do(({led}) => {
      const first = player.board.first(LEDCard)!;
      first.putInto(led);
    }),

    placeCube: (player) => action({
      prompt: 'Place Cube'
    }).chooseOnBoard(
      'cube', player.space.first(ResourceSpace)!.all(ResourceCube)
        .filter(c=> player.board.first(LEDSpace)!.first(LEDCard)!.nextColorsNeeded().includes(c.color))
        ,
      { skipIf: 'never' }
    ).chooseOnBoard(
      'row', ({cube}) => player.board.first(LEDSpace)!.first(LEDCard)!.rowsNeedingColor(cube.color),
      { skipIf: 'never' }
    ).do(({cube, row}) => {
      cube.putInto(row);
    }),

    chooseCostCube: (player) => action<{upgrade: UpgradeCard}>({
      prompt: 'Choose Cube'
    }).chooseOnBoard(
      'cube', ({upgrade}) => player.space.first(ResourceSpace)!.all(ResourceCube)
        .slice(0, player.space.first(ResourceSpace)!.all(ResourceCube).length - upgrade.output.length),
      { skipIf: 'never' }
    ).do(({upgrade, cube}) => {
      const supply = game.first(Supply)!;
      const resources = player.space.first(ResourceSpace)!
      cube.putInto(supply);
    }),

    useUpgrade: (player) => action({
      prompt: 'Use Upgrade'
    }).chooseOnBoard(
      'upgrade', player.space.all(UpgradeCard).filter(x => x.mayUse(player)),
    ).do(({upgrade}) => {        
      if(this.powers.bonusResourceDiscount(player, upgrade) > 0) {
        game.followUp({name: 'useEfficiencyAudit', args: {upgrade: upgrade}});
      } else {
        player.useUpgrade(upgrade);
      }
    }),

    finishTesting: (player) => action({
      prompt: 'Finish Testing'
    }).do(() => {
      player.doneTesting = true;
    }),

    mandatoryReporting: (player) => action({
      prompt: "Mandatory Reporting",
    }).chooseOnBoard(
      'cubes', player.board.all(StorageSpace).all(ResourceCube),
      { min: 0, max: 1, skipIf: 'never' }
    ).do(({ cubes }) => {
      if(cubes.length > 0) {
        cubes[0].putInto(game.first(Supply)!);
      } else {
        player.scorePoints(-2);
      }
    }), 

        }
    }

}
