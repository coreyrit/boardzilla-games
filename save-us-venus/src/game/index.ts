import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';
import { off } from 'process';

export class SUVPlayer extends Player<MyGame, SUVPlayer> {
  space: EarthPlayerSpace;
  trust: boolean = false;
}

export class MyGame extends Game<MyGame, SUVPlayer> {

  public revealNextEvent() : void {
    this.first(EventCover)!.putInto($.box);

    const event = $.eventRow.all(EventCard)[9 - $.overlayRow.all(EventCover).length];
    event.showToAll();

    this.game.all(LandSpace, {landType: event.disasterLocation}).forEach(landSpace => {
      if(landSpace.all(BuildingCard).length > 0) {
        // Destroy the building
        landSpace.first(BuildingCard)!.putInto($.box);
      } else {
        // Injure the humans
        landSpace.all(HumanToken).forEach(human => {
          if(human.isInjured) {
            human.putInto(landSpace.first(LostHumanSpace)!);
          } else {
            human.isInjured = true;
          }
        });
      }
    });
  }

  public venusMotivation() : void {
    $.motivationDeck.shuffle();
    while($.trustSpace.all(TrustCard).length < 2) {
      const card = $.motivationDeck.top(EarthCard)!;
      card.showToAll();
      if(card instanceof TrustCard) {
        card.putInto($.trustSpace);         
      } else {
        card.putInto($.rejectionSpace);
      }
    }
  }


  public getRoleIcon(role: EarthRole) : string {
    switch(role) {
      case EarthRole.Engineer:
        return '⚙';
      case EarthRole.Medic:
        return '+';
      case EarthRole.Diplomat:
        return '⚖︎';
      case EarthRole.Soldier:
        return '⭑';
    }
    return "";
  }

  public getColor(piece: Piece<MyGame>) : string {
    if(piece.container(EarthPlayerSpace) != undefined) {
      const playerSpace = piece.container(EarthPlayerSpace)!;
      if(playerSpace.owner != undefined && playerSpace.owner.color != undefined) {
        return playerSpace.owner.color;
      }
    }
    return "white";
  }

  public getLocationIcon(landType: LandType) : string {
    switch(landType) {
      case LandType.Beach:
        return '༄';
      case LandType.Mountains:
        return 'ᨒ';
      case LandType.Farm:
        return '𖧧';
      case LandType.Forest:
        return '𖠰';
    }
    return "";
  }

  public getBuildingIcon(buildingType: BuildingType) : string {
    switch(buildingType) {
      case BuildingType.Hospital:
        return '🏥';
      case BuildingType.Sanctuary:
        return '⛪';
      case BuildingType.Capitol:
        return '🏛';
      case BuildingType.Base:
        return '🏠';
    }
    return "";
  }
}

export class Deck extends Space<MyGame> {
}

export class BuildingDeck extends Deck {
}


export enum EarthRole {
  Engineer = "Engineer",
  Medic = "Medic",
  Diplomat = "Diplomat",
  Soldier = "Soldier",
  None = ""
}

export enum LandType {
  Beach = "Beach",
  Mountains = "Mountains",
  Farm = "Farm",
  Forest = "Forest"
}

export enum BuildingType {
  Hospital = "Hospital",
  Sanctuary = "Sanctuary",
  Capitol = "Capitol",
  Base = "Base"
}

export class EarthCard extends Piece<MyGame> {
}

export class TrustCard extends EarthCard {
  public earthRole: EarthRole = EarthRole.None;
}

export enum VenumAction {
  Move2ToTheBeach,
  Move2FromTheBeach,
  Move2ToTheMountains,
  Move2FromTheMountains,
  Move2ToTheFarm,
  Move2FromTheFarm,
  Move2ToTheForest,
  Move2FromTheForest,
  ActivateAnEngineer,
  ActivateADiplomat,
  ActivateAMedic,
  ActivateASoldier
}

export enum SideEffect {
  Injure2AtTheBeach,
  Injure1AtTheMountainsFarmAndForest,
  Injure2AtTheMountains,
  Injure1AtTheBeachFarmAndForest,
  Injure2AtTheFarm,
  Injure1AtTheBeachMountainsAndForest,
  Injure2AtTheForest,
  Injure1AtTheBeachMountainsAndFarm,
  InjureAnEngineer,
  InjureADiplomat,
  InjureAMedic,
  InjureASoldier
}

export enum EarthAction {
  Move2From1Land,
  Heal3On1Land,
  BuildAnywhere,
  Recover1ToAnywhere,
  DrawAny2EarthCards
}

export class VenusCard extends Piece<MyGame> {
  public venusAction: VenumAction;
  public sideEffect: SideEffect;

  public getImage() : string {
    switch(this.venusAction) {
      case VenumAction.Move2ToTheBeach:
        return '𖨆 » ' + this.game.getLocationIcon(LandType.Beach);
      case VenumAction.Move2FromTheBeach:
        return '𖨆 « ' + this.game.getLocationIcon(LandType.Beach);
      case VenumAction.Move2ToTheMountains:
        return '𖨆 » ' + this.game.getLocationIcon(LandType.Mountains);
      case VenumAction.Move2FromTheMountains:
        return '𖨆 « ' + this.game.getLocationIcon(LandType.Mountains);
      case VenumAction.Move2ToTheFarm:
        return '𖨆 » ' + this.game.getLocationIcon(LandType.Farm);
      case VenumAction.Move2FromTheFarm:
        return '𖨆 « ' + this.game.getLocationIcon(LandType.Farm);
      case VenumAction.Move2ToTheForest:
        return '𖨆 » ' + this.game.getLocationIcon(LandType.Forest);
      case VenumAction.Move2FromTheForest:
        return '𖨆 « ' + this.game.getLocationIcon(LandType.Forest);
      case VenumAction.ActivateAnEngineer:
        return '⚙';
      case VenumAction.ActivateADiplomat:
        return '⚖︎';
      case VenumAction.ActivateAMedic:
        return '+';
      case VenumAction.ActivateASoldier:
        return '⭑';
    }
    return "";
  }

  public getTitle() : string {
    switch(this.venusAction) {
      case VenumAction.Move2ToTheBeach:
        return 'Move 2 to the Beach';
      case VenumAction.Move2FromTheBeach:
        return 'Move 2 from the Beach';
      case VenumAction.Move2ToTheMountains:
        return 'Move 2 to the Mountains';
      case VenumAction.Move2FromTheMountains:
        return 'Move 2 from the Mountains';
      case VenumAction.Move2ToTheFarm:
        return 'Move 2 to the Farm';
      case VenumAction.Move2FromTheFarm:
        return 'Move 2 from the Farm';
      case VenumAction.Move2ToTheForest:
        return 'Move 2 to the Forest';
      case VenumAction.Move2FromTheForest:
        return 'Move 2 from the Forest';
      case VenumAction.ActivateAnEngineer:
        return 'Activate an Engineer';
      case VenumAction.ActivateADiplomat:
        return 'Activate a Diplomat';
      case VenumAction.ActivateAMedic:
        return 'Activate a Medic';
      case VenumAction.ActivateASoldier:
        return 'Activate a Soldier';
    }
    return "";
  }

  public getSideEffectText() : string {
    switch(this.sideEffect) {
      case SideEffect.Injure2AtTheBeach:
        return 'Injure 2 at the Beach';
      case SideEffect.Injure1AtTheMountainsFarmAndForest:
        return 'Injure 1 at the Mountains, Farm, and Forest';
      case SideEffect.Injure2AtTheMountains:
        return 'Injure 2 at the Mountains';
      case SideEffect.Injure1AtTheBeachFarmAndForest:
        return 'Injure 1 at the Beach, Farm, and Forest';
      case SideEffect.Injure2AtTheFarm:
        return 'Injure 2 at the Farm';
      case SideEffect.Injure1AtTheBeachMountainsAndForest:
        return 'Injure 1 at the Beach, Mountains, and Forest';
      case SideEffect.Injure2AtTheForest:
        return 'Injure 2 at the Forest';
      case SideEffect.Injure1AtTheBeachMountainsAndFarm:
        return 'Injure 1 at the Beach, Mountains, and Farm';
      case SideEffect.InjureAnEngineer:
        return 'Injure an Engineer';
      case SideEffect.InjureADiplomat:
        return 'Injure a Diplomat';
      case SideEffect.InjureAMedic:
        return 'Injure a Medic';
      case SideEffect.InjureASoldier:
        return 'Injure a Soldier';
    }
    return "";
  }
}

export class Hand extends Space<MyGame> {
}

export class OverlayRow extends Space<MyGame> {
}

export class OfferingRow extends Space<MyGame> {
}

export class RejectionRow extends Space<MyGame> {
}

export class EventRow extends Space<MyGame> {
}

export class EventCover extends Piece<MyGame> {

}

export class EventCard extends Piece<MyGame> {
  public disasterLocation: LandType;

  public getDisasterName() : string {
    switch(this.disasterLocation) {
      case LandType.Beach:
        return 'FLOOD!';
      case LandType.Mountains:
        return 'EARTHQUAKE!';
      case LandType.Farm:
        return 'TORNADO!';
      case LandType.Forest:
        return 'FIRE!';
    }
    return "";
  }

  public getLocationName() : string {
    switch(this.disasterLocation) {
      case LandType.Beach:
        return 'BEACH';
      case LandType.Mountains:
        return 'MOUNTAINS';
      case LandType.Farm:
        return 'FARM';
      case LandType.Forest:
        return 'FOREST';
    }
    return "";
  }
}

export class TrustToken extends Piece<MyGame> {
}

export class HumanToken extends Piece<MyGame> {
  public isInjured: boolean = false;
  public earthRole: EarthRole = EarthRole.None;
}

export class LandSpace extends Space<MyGame> {
  public landType: LandType;
}

export class LandCard extends Piece<MyGame> {
  public landType: LandType;
}

export class EarthPlayerSpace extends Space<MyGame> {

}

export class RejectionCard extends EarthCard {
  public earthAction: EarthAction;
  public color: string = 'white';

  public getTitle() : string {
    switch(this.earthAction) {
      case EarthAction.Move2From1Land:
        return 'Move 2 from 1 Land';
      case EarthAction.Heal3On1Land:
        return 'Heal 3 on 1 Land';
      case EarthAction.BuildAnywhere:
        return 'Build Anywhere';
      case EarthAction.Recover1ToAnywhere:
        return 'Recover 1 to Anywhere';
      case EarthAction.DrawAny2EarthCards:
        return 'Draw Any 2 Earth Cards';
    }
    return "";  
  }
}

export class BuildingCard extends Piece<MyGame> {
  public buildingType: BuildingType;
  public color: string = 'white';

  public getText() : string {
    switch(this.buildingType) {
      case BuildingType.Hospital:
        return 'Heal 3 Here';
      case BuildingType.Sanctuary:
        return 'Recover 1 Here';
      case BuildingType.Capitol:
        return 'Draw 1 Here';
      case BuildingType.Base:
        return 'Move 2 To Here';
    }
    return "";
  }
}

export class LostHumanSpace extends Space<MyGame> {

}

export class PlayersSpace extends Space<MyGame> {

}

export default createGame(SUVPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer, ifElse } = game.flowCommands;


  game.create(Space<MyGame>, 'box');

  game.create(Hand, 'venusHand');

  $.venusHand.create(Deck, 'motivationDeck');
  $.motivationDeck.create(TrustCard, 'trustEngineer', {earthRole: EarthRole.Engineer});
  $.motivationDeck.create(TrustCard, 'trustMedic', {earthRole: EarthRole.Medic});
  $.motivationDeck.create(TrustCard, 'trustDiplomat', {earthRole: EarthRole.Diplomat});
  $.motivationDeck.create(TrustCard, 'trustSoldier', {earthRole: EarthRole.Soldier});
  $.motivationDeck.create(TrustCard, 'trust', {earthRole: EarthRole.None});
  $.motivationDeck.all(TrustCard).hideFromAll();
  $.motivationDeck.shuffle();

  game.create(Deck, 'venusDeck');
  $.venusDeck.create(VenusCard, 'move2ToTheBeach', {venusAction: VenumAction.Move2ToTheBeach, sideEffect: SideEffect.Injure2AtTheBeach});
  $.venusDeck.create(VenusCard, 'move2FromTheBeach', {venusAction: VenumAction.Move2FromTheBeach, sideEffect: SideEffect.Injure1AtTheMountainsFarmAndForest});
  $.venusDeck.create(VenusCard, 'move2ToTheMountains', {venusAction: VenumAction.Move2ToTheMountains, sideEffect: SideEffect.Injure2AtTheMountains});
  $.venusDeck.create(VenusCard, 'move2FromTheMountains', {venusAction: VenumAction.Move2FromTheMountains, sideEffect: SideEffect.Injure1AtTheBeachFarmAndForest});
  $.venusDeck.create(VenusCard, 'move2ToTheFarm', {venusAction: VenumAction.Move2ToTheFarm, sideEffect: SideEffect.Injure2AtTheFarm});
  $.venusDeck.create(VenusCard, 'move2FromTheFarm', {venusAction: VenumAction.Move2FromTheFarm, sideEffect: SideEffect.Injure1AtTheBeachMountainsAndForest});
  $.venusDeck.create(VenusCard, 'move2ToTheForest', {venusAction: VenumAction.Move2ToTheForest, sideEffect: SideEffect.Injure2AtTheForest});
  $.venusDeck.create(VenusCard, 'move2FromTheForest', {venusAction: VenumAction.Move2FromTheForest, sideEffect: SideEffect.Injure1AtTheBeachMountainsAndFarm});
  $.venusDeck.create(VenusCard, 'activateAnEngineer', {venusAction: VenumAction.ActivateAnEngineer, sideEffect: SideEffect.InjureAnEngineer});
  $.venusDeck.create(VenusCard, 'activateADiplomat', {venusAction: VenumAction.ActivateADiplomat, sideEffect: SideEffect.InjureADiplomat});
  $.venusDeck.create(VenusCard, 'activateAMedic', {venusAction: VenumAction.ActivateAMedic, sideEffect: SideEffect.InjureAMedic});
  $.venusDeck.create(VenusCard, 'activateASoldier', {venusAction: VenumAction.ActivateASoldier, sideEffect: SideEffect.InjureASoldier});
  $.venusDeck.shuffle();
  
  $.venusDeck.topN(3).putInto($.venusHand);
  $.venusHand.all(VenusCard).showOnlyTo(game.players[0]);

  game.create(Deck, 'eventDeck');
  for(let i = 1; i <= 5; i++) {
    $.eventDeck.create(EventCard, 'beachDisaster' + i, {disasterLocation: LandType.Beach});
    $.eventDeck.create(EventCard, 'mountainsDisaster' + i, {disasterLocation: LandType.Mountains});
    $.eventDeck.create(EventCard, 'farmDisaster' + i, {disasterLocation: LandType.Farm});
    $.eventDeck.create(EventCard, 'forestDisaster' + i, {disasterLocation: LandType.Forest});
  }
  $.eventDeck.shuffle();
  
  game.create(EventRow, 'eventRow');
  $.eventDeck.topN(10).putInto($.eventRow);

  game.create(OfferingRow, 'offeringRow');
  game.create(RejectionRow, 'rejectionRow');

  game.create(OverlayRow, 'overlayRow');
  $.overlayRow.create(EventCover, 'eventCover1');
  $.overlayRow.create(EventCover, 'eventCover2');
  $.overlayRow.create(EventCover, 'eventCover3');
  $.overlayRow.create(EventCover, 'eventCover4');
  $.overlayRow.create(EventCover, 'eventCover5');
  $.overlayRow.create(EventCover, 'eventCover6');
  $.overlayRow.create(EventCover, 'eventCover7');
  $.overlayRow.create(EventCover, 'eventCover8');
  $.overlayRow.create(EventCover, 'eventCover9');
  $.overlayRow.create(EventCover, 'eventCover10');

  $.eventRow.all(EventCard).showOnlyTo(game.players[0]);

  game.create(Space<MyGame>, 'trustPile');
  for(let i = 0; i < 24; i++) {
    $.trustPile.create(TrustToken, 'trustToken' + i);
  }

  game.create(Space<MyGame>, 'trustSpace');
  game.create(Space<MyGame>, 'rejectionSpace');

  const playersSpace = game.create(PlayersSpace, 'playersSpace')
  for(let p = 1; p < game.players.length; p++) {
    const playerSpace = playersSpace.create(EarthPlayerSpace, 'earthPlayerSpace' + p);
    game.players[p].space = playerSpace;
    playerSpace.player = game.players[p];
    const earthHand = playerSpace.create(Hand, 'earhthHand' + p);

    for(let i = 0; i < 2; i++) {
      $.box.create(RejectionCard, 'rejectionMove' + p + '_' + i, {earthAction: EarthAction.Move2From1Land});
      $.box.create(RejectionCard, 'rejectionHeal' + p + '_' + i, {earthAction: EarthAction.Heal3On1Land});
      $.box.create(RejectionCard, 'rejectionBuild' + p + '_' + i, {earthAction: EarthAction.BuildAnywhere});
      $.box.create(RejectionCard, 'rejectionRecover' + p + '_' + i, {earthAction: EarthAction.Recover1ToAnywhere});
      $.box.create(RejectionCard, 'rejectionDraw' + p + '_' + i, {earthAction: EarthAction.DrawAny2EarthCards});
    }
    $.box.all(RejectionCard).hideFromAll();

    for(let i = 0; i < 3; i++) {
      $.box.create(HumanToken, 'engineer' + p + '_' + i, {earthRole: EarthRole.Engineer});
      $.box.create(HumanToken, 'medic' + p + '_' + i, {earthRole: EarthRole.Medic});
      $.box.create(HumanToken, 'soldier' + p + '_' + i, {earthRole: EarthRole.Soldier});
      $.box.create(HumanToken, 'diplomat' + p + '_' + i, {earthRole: EarthRole.Diplomat});
    }
    $.box.shuffle();

    const beach = playerSpace.create(LandSpace, 'beachLand' + p, {landType: LandType.Beach});
    beach.create(LandCard, 'beachLandCard' + p, {landType: LandType.Beach});
    $.box.topN(3, HumanToken).putInto(beach);
    $.box.topN(2, RejectionCard).putInto(beach);

    const mountains = playerSpace.create(LandSpace, 'mountainsLand' + p, {landType: LandType.Mountains});
    mountains.create(LandCard, 'mountainsLandCard' + p, {landType: LandType.Mountains});
    $.box.topN(3, HumanToken).putInto(mountains);
    $.box.topN(2, RejectionCard).putInto(mountains);

    const farm = playerSpace.create(LandSpace, 'farmLand' + p, {landType: LandType.Farm});
    farm.create(LandCard, 'farmLandCard' + p, {landType: LandType.Farm});
    $.box.topN(3, HumanToken).putInto(farm);
    $.box.topN(2, RejectionCard).putInto(farm);

    const forest = playerSpace.create(LandSpace, 'forestLand' + p, {landType: LandType.Forest});  
    forest.create(LandCard, 'forestLandCard' + p, {landType: LandType.Forest});
    $.box.topN(3, HumanToken).putInto(forest);
    $.box.topN(2, RejectionCard).putInto(forest);
    
    $.box.topN(2, RejectionCard).putInto(earthHand);
    earthHand.all(RejectionCard).showOnlyTo(game.players[p]);

    const buildingDeck = playerSpace.create(BuildingDeck, 'buildingDeck' + p);
    buildingDeck.create(BuildingCard, 'hospital' + p, {buildingType: BuildingType.Hospital});
    buildingDeck.create(BuildingCard, 'sanctuary' + p, {buildingType: BuildingType.Sanctuary});
    buildingDeck.create(BuildingCard, 'capitol' + p, {buildingType: BuildingType.Capitol});
    buildingDeck.create(BuildingCard, 'base' + p, {buildingType: BuildingType.Base});

    const lostHumansSpace = playerSpace.create(LostHumanSpace, 'lostHumansSpace' + p);
    // lostHumansSpace.create(HumanToken, 'lostHuman' + p, {earthRole: EarthRole.Medic});
  }

  game.defineActions({
    chooseMotivation: (player) => action({
      prompt: 'Choose Motivation'
    }).chooseOnBoard(
      'motivation', $.trustSpace.all(TrustCard).filter(card => card.earthRole != EarthRole.None),
      { skipIf: 'never' }
    ).do(({motivation}) => {
      switch(motivation.earthRole) {
        case EarthRole.Engineer:
          game.followUp({name: 'activateEngineer'});
          break;
        case EarthRole.Medic:
          game.followUp({name: 'activateMedic'});
          break;
        case EarthRole.Diplomat:
          game.followUp({name: 'activateDiplomat'});
          break;
        case EarthRole.Soldier:
          game.followUp({name: 'activateSoldier'});
          break;
      }
    }),

    chooseOffering: (player) => action({
      prompt: 'Choose Offering'
    }).chooseOnBoard(
      'offering', $.venusHand.all(VenusCard),
      { skipIf: 'never' }
    ).do(({offering}) => {
      offering.putInto($.offeringRow);
      offering.showToAll();
      $.venusDeck.top(VenusCard)!.putInto($.venusHand);
    }),

    activateEngineer: (player) => action({
      prompt: 'Activate Engineer'
    }).chooseOnBoard(
      'engineer', player.space.all(HumanToken, {earthRole: EarthRole.Engineer})
    ).do(({engineer}) => {        
      const land = engineer.container(LandSpace)!;
      if(land.all(BuildingCard).length == 0 && player.space.all(BuildingDeck).all(BuildingCard).length > 0) {
        game.followUp({name: 'buildBuilding', args: {land: land}});
      }
    }),

    buildBuilding: (player) => action<{land: LandSpace}>({
      prompt: 'Choose Building to Build'
    }).chooseOnBoard(
      'building', ({land}) => player.space.all(BuildingDeck).all(BuildingCard),
    ).do(({land, building}) => {        
      building.putInto(land);

      switch(building.buildingType) {
        case BuildingType.Hospital:
          game.followUp({name: 'healHumans', args: {land: land, count: 3}});
          break;
        case BuildingType.Base:
          game.followUp({name: 'moveHumansTo', args: {land: land}});
          break;
        case BuildingType.Capitol:
          if(player.space.all(RejectionCard).length > 0) {
            game.followUp({name: 'drawCard', args: {land: land}});
          }
          break;
        case BuildingType.Sanctuary:
          if(player.space.all(LostHumanSpace).all(HumanToken).length > 0) {
            game.followUp({name: 'recoverHuman', args: {land: land}});
          }
          break;
      }
    }),

    recoverHuman: (player) => action<{land: LandSpace}>({
      prompt: 'Choose Human to Recover'
    }).chooseOnBoard(
      'human', ({land}) => player.space.first(LostHumanSpace)!.all(HumanToken),
    ).do(({human, land}) => {        
      human.isInjured = false;
      human.putInto(land);
    }),

    drawCard: (player) => action<{land: LandSpace}>({
      prompt: 'Draw Earth Card'
    }).chooseOnBoard(
      'card', ({land}) => land.all(RejectionCard)
    ).do(({card}) => {        
      card.putInto(player.space.first(Hand)!);
      card.showOnlyTo(player);
    }),

    moveHumansTo: (player) => action<{land: LandSpace}>({
      prompt: 'Choose Humans to Move'
    }).chooseOnBoard(
      'humans', ({land}) => player.space.all(HumanToken).filter(x => x.container(LandSpace) != land),
      { min: 0, max: 2 }
    ).do(({humans, land}) => {        
      humans.forEach(human => {
        human.putInto(land);
      })
    }),

    moveHumansFrom: (player) => action<{soldier: HumanToken, land: LandSpace, count: number}>({
      prompt: 'Choose Human to Move'
    }).chooseOnBoard(
      'human', ({soldier, land}) => land.all(HumanToken).filter(x => x != soldier),
      { skipIf: 'never' }
      // { min: 0, max: 1 }
    ).do(({human, soldier, land, count}) => {        
      if(human != undefined) {
        game.followUp({name: 'chooseHumanLocation', args: {human: human, soldier: soldier, land: land, count: count}});
      }
    }),

    chooseHumanLocation: (player) => action<{human: HumanToken, soldier: HumanToken, land: LandSpace, count: number}>({
      prompt: 'Choose Location for Human'
    }).chooseOnBoard(
      'destination', ({land}) => player.space.all(LandSpace).filter(x => x != land),
    ).do(({destination, human, soldier, land, count}) => {        
      human.putInto(destination);
      if(count > 1) {
        game.followUp({name: 'moveHumansFrom', args: {soldier: soldier, land: land, count: count - 1}});
      }
    }),

    activateMedic: (player) => action({
      prompt: 'Activate Medic'
    }).chooseOnBoard(
      'medic', player.space.all(HumanToken, {earthRole: EarthRole.Medic})
    ).do(({medic}) => {        
      const land = medic.container(LandSpace)!;
      game.followUp({name: 'healHumans', args: {land: land, count: 2}});
    }),

    healHumans: (player) => action<{land: LandSpace, count: number}>({
      prompt: 'Choose Humans to Heal'
    }).chooseOnBoard(
      'humans', ({land}) => land.all(HumanToken, {isInjured: true}),
      { min: 0, max: ({count}) => count }
    ).do(({humans}) => {        
      humans.forEach(human => {
        human.isInjured = false;
      });
    }),

    injureHumans: (player) => action<{lands: [LandType], countEach: number}>({
      prompt: 'Choose Human(s) to Injure'
    }).chooseOnBoard(
      'humans', ({lands}) => player.space.first(LandSpace, {landType: lands[0]})!.all(HumanToken),
      // { min: ({lands}) => Math.min(2, player.space.first(LandSpace, {landType: lands[0]})!.all(HumanToken).length), max: ({countEach}) => countEach }
      { number: ({lands, countEach}) => Math.min(countEach, player.space.first(LandSpace, {landType: lands[0]})!.all(HumanToken).length) }
    ).do(({lands, humans}) => {        
      humans.forEach(human => {
        if(human.isInjured) {
          human.putInto(player.space.first(LostHumanSpace)!);
        } else {
          human.isInjured = true;
        }
      });

      if(lands.length > 1) {
        game.followUp({name: 'injureHumans', args: {lands: lands.slice(1), countEach: 1}});
      }
    }),

    injureRole: (player) => action<{earthRole: EarthRole}>({
      prompt: 'Choose Humans to Injure'
    }).chooseOnBoard(
      'human', ({earthRole}) => player.space.all(LandSpace).all(HumanToken, {earthRole: earthRole}),
    ).do(({human}) => {        
      if(human.isInjured) {
        human.putInto(player.space.first(LostHumanSpace)!);
      } else {
        human.isInjured;
      }
    }),

    activateDiplomat: (player) => action({
      prompt: 'Activate Diplomat'
    }).chooseOnBoard(
      'diplomat', player.space.all(HumanToken, {earthRole: EarthRole.Diplomat})
    ).do(({diplomat}) => {   
      if(player.space.all(RejectionCard).length > 0) {
        game.followUp({name: 'drawCard', args: {land: diplomat.container(LandSpace)!}});
      }
    }),
    
    activateSoldier: (player) => action({
      prompt: 'Activate Soldier'
    }).chooseOnBoard(
      'soldier', player.space.all(HumanToken, {earthRole: EarthRole.Soldier})
    ).do(({soldier}) => {
      game.followUp({name: 'moveToOrFrom', args: {soldier: soldier, land: soldier.container(LandSpace)!}});
    }),

    moveToOrFrom: (player) => action<{soldier: HumanToken, land: LandSpace}>({
      prompt: 'To or From?'
    }).chooseFrom(
      "choice", ({land}) => ['Move To ' + land.landType, 'Move From ' + land.landType], 
      { skipIf: 'never' }
    ).do(({choice, soldier, land}) => {        
      if(choice.startsWith('Move To')) {
        game.followUp({name: 'moveHumansTo', args: {land: land}});
      } else {
        game.followUp({name: 'moveHumansFrom', args: {soldier: soldier, land: land, count: 2}});
      }
    }),

    trustVenus: (player) => action({
      prompt: 'Trust?'
    }).chooseFrom(
      "trust", ['Trust Venus'], 
      { skipIf: 'never' }
    ).do(({trust}) => {
      player.trust = true;
      $.trustPile.first(TrustToken)!.putInto($.venusHand);

      const offering = $.offeringRow.all(VenusCard)[9 - $.overlayRow.all(EventCover).length];
      game.message(offering.getTitle());

      switch(offering.venusAction) {
        case VenumAction.Move2ToTheBeach:
          game.followUp({name: 'moveHumansTo', args: {land: player.space.first(LandSpace, {landType: LandType.Beach})!}});
          break;
        case VenumAction.Move2FromTheBeach:
          game.followUp({name: 'moveHumansFrom', args: {land: player.space.first(LandSpace, {landType: LandType.Beach})!, count: 2}});
          break;
        case VenumAction.Move2ToTheMountains:
          game.followUp({name: 'moveHumansTo', args: {land: player.space.first(LandSpace, {landType: LandType.Mountains})!}});
          break;
        case VenumAction.Move2FromTheMountains:
          game.followUp({name: 'moveHumansFrom', args: {land: player.space.first(LandSpace, {landType: LandType.Mountains})!, count: 2}});
          break;
        case VenumAction.Move2ToTheFarm:
          game.followUp({name: 'moveHumansTo', args: {land: player.space.first(LandSpace, {landType: LandType.Farm})!}});
          break;
        case VenumAction.Move2FromTheFarm:
          game.followUp({name: 'moveHumansFrom', args: {land: player.space.first(LandSpace, {landType: LandType.Farm})!, count: 2}});
          break;
        case VenumAction.Move2ToTheForest:
          game.followUp({name: 'moveHumansTo', args: {land: player.space.first(LandSpace, {landType: LandType.Forest})!}});
          break;
        case VenumAction.Move2FromTheForest:
          game.followUp({name: 'moveHumansFrom', args: {land: player.space.first(LandSpace, {landType: LandType.Forest})!, count: 2}});
          break;
        case VenumAction.ActivateAnEngineer:
          game.followUp({name: 'activateEngineer'});
          break;
        case VenumAction.ActivateADiplomat:
          game.followUp({name: 'activateDiplomat'});
          break;
        case VenumAction.ActivateAMedic:
          game.followUp({name: 'activateMedic'});
          break;
        case VenumAction.ActivateASoldier:
          game.followUp({name: 'activateSoldier'});
          break;
      }
    }),

    venusSideEffect: (player) => action({
      prompt: 'Venus Side Effect'
    }).do(() => {
      const offering = $.offeringRow.all(VenusCard)[9 - $.overlayRow.all(EventCover).length];
      game.message(offering.getSideEffectText());
      switch(offering.sideEffect) {
        case SideEffect.Injure2AtTheBeach:
          game.followUp({name: 'injureHumans', args: {lands: [LandType.Beach], countEach: 2}});
          break;
        case SideEffect.Injure1AtTheMountainsFarmAndForest:
          game.followUp({name: 'injureHumans', args: {lands: [LandType.Mountains, LandType.Farm, LandType.Forest], countEach: 1}});
          break;
        case SideEffect.Injure2AtTheMountains:
          game.followUp({name: 'injureHumans', args: {lands: [LandType.Mountains], countEach: 2}});
          break;
        case SideEffect.Injure1AtTheBeachFarmAndForest:
          game.followUp({name: 'injureHumans', args: {lands: [LandType.Beach, LandType.Farm, LandType.Forest], countEach: 1}});
          break;
        case SideEffect.Injure2AtTheFarm:
          game.followUp({name: 'injureHumans', args: {lands: [LandType.Farm], countEach: 2}});
          break;
        case SideEffect.Injure1AtTheBeachMountainsAndForest:
          game.followUp({name: 'injureHumans', args: {lands: [LandType.Beach, LandType.Mountains, LandType.Forest], countEach: 1}});
          break;
        case SideEffect.Injure2AtTheForest:
          game.followUp({name: 'injureHumans', args: {lands: [LandType.Forest], countEach: 2}});
          break;
        case SideEffect.Injure1AtTheBeachMountainsAndFarm:
          game.followUp({name: 'injureHumans', args: {lands: [LandType.Beach, LandType.Mountains, LandType.Farm], countEach: 1}});
          break;
        case SideEffect.InjureAnEngineer:
          game.followUp({name: 'injureRole', args: {earthRole: EarthRole.Engineer}});
          break;
        case SideEffect.InjureADiplomat:
          game.followUp({name: 'injureRole', args: {earthRole: EarthRole.Diplomat}});
          break;
        case SideEffect.InjureAMedic:
          game.followUp({name: 'injureRole', args: {earthRole: EarthRole.Medic}});
          break;
        case SideEffect.InjureASoldier:
          game.followUp({name: 'injureRole', args: {earthRole: EarthRole.Soldier}});
          break;
      }
    }),

    rejectVenus: (player) => action({
      prompt: 'Reject Venus'
    }).chooseOnBoard(
      'card', player.space.all(Hand).all(RejectionCard)
    ).do(({card}) => {
      player.trust = false;
      
    }),
  });

  game.defineFlow(

    // 1. Reveal Next Event and Apply Disaster
    () => game.revealNextEvent(),

    // 2. Venus Motivation
    () => game.venusMotivation(),

    // 3. Earth Abilities
    eachPlayer({
      name: 'turn', do: [
        ifElse({
          if: ({turn}) => turn != game.players[0], do: [
              playerActions({ actions: ['chooseMotivation']}),
          ],
        }),
      ]
    }),

    // 4. Venus Offering
    eachPlayer({
      name: 'turn', do: [
        ifElse({
          if: ({turn}) => turn == game.players[0], do: [
              playerActions({ actions: ['chooseOffering']}),
          ],
        }),
      ]
    }),

    // 5. Earth Trusts or Rejects
    eachPlayer({
      name: 'turn', do: [
        ifElse({
          if: ({turn}) => turn != game.players[0], do: [
              playerActions({ actions: ['trustVenus', 'rejectVenus']}),
          ],
        }),
      ]
    }),

    // 6. Venus Side Effect
    eachPlayer({
      name: 'turn', do: [
        ifElse({
          if: ({turn}) => turn != game.players[0] && turn.trust, do: [
              playerActions({ actions: ['venusSideEffect']}),
          ],
        }),
      ]
    }),

    playerActions({ actions: []}),
  );
});
