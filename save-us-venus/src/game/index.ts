import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';

export class SUVPlayer extends Player<MyGame, SUVPlayer> {
  space: EarthPlayerSpace;
}

export class MyGame extends Game<MyGame, SUVPlayer> {

  public revealNextEvent() : void {
    this.first(EventCover)!.putInto($.box);

    const event = $.eventRow.all(EventCard)[9 - $.overlayRow.all(EventCover).length];
    this.game.all(LandSpace, {landType: event.disasterLocation}).forEach(landSpace => {
      if(landSpace.all(BuildingCard).length > 0) {
        // Destroy the building
        landSpace.first(BuildingCard)!.putInto($.box);
      } else {
        // Injure the humans
        landSpace.all(HumanToken).forEach(human => {
          if(human.isInjured) {
            human.putInto($.box);
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
  Beach,
  Mountains,
  Farm,
  Forest
}

export enum BuildingType {
  Hospital,
  Sanctuary,
  Capitol,
  Base
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
}

export class BuildingCard extends Piece<MyGame> {
  public buildingType: BuildingType;
  public color: string = 'white';
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

    const buildingDeck = playerSpace.create(BuildingDeck, 'buildingDeck' + p);
    buildingDeck.create(BuildingCard, 'hospital' + p, {buildingType: BuildingType.Hospital});
    buildingDeck.create(BuildingCard, 'sanctuary' + p, {buildingType: BuildingType.Sanctuary});
    buildingDeck.create(BuildingCard, 'capitol' + p, {buildingType: BuildingType.Capitol});
    buildingDeck.create(BuildingCard, 'base' + p, {buildingType: BuildingType.Base});
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

    activateEngineer: (player) => action({
      prompt: 'Activate Engineer'
    }).chooseOnBoard(
      'engineer', player.space.all(HumanToken, {earthRole: EarthRole.Engineer})
    ).do(({engineer}) => {        
      
    }),

    activateMedic: (player) => action({
      prompt: 'Activate Medic'
    }).chooseOnBoard(
      'medic', player.space.all(HumanToken, {earthRole: EarthRole.Medic})
    ).do(({medic}) => {        
      const land = medic.container(LandSpace)!;
      game.followUp({name: 'healHumans', args: {land: land}});
    }),

     healHumans: (player) => action<{land: LandSpace}>({
      prompt: 'Choose Humans to Heal'
    }).chooseOnBoard(
      'humans', ({land}) => land.all(HumanToken, {isInjured: true}),
      { min: 0, max: 2 }
    ).do(({humans}) => {        
      humans.forEach(human => {
        human.isInjured = false;
      });
    }),

    activateDiplomat: (player) => action({
      prompt: 'Activate Diplomat'
    }).chooseOnBoard(
      'diplomat', player.space.all(HumanToken, {earthRole: EarthRole.Diplomat})
    ).do(({diplomat}) => {        
      
    }),
    
    activateSoldier: (player) => action({
      prompt: 'Activate Soldier'
    }).chooseOnBoard(
      'soldier', player.space.all(HumanToken, {earthRole: EarthRole.Soldier})
    ).do(({soldier}) => {

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

    playerActions({ actions: []}),
  );
});
