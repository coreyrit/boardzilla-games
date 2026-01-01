import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';
import { count } from 'console';
import { off } from 'process';

export class SUVPlayer extends Player<MyGame, SUVPlayer> {
  space: EarthPlayerSpace;
  trust: boolean = false;
  playedOffering: boolean = false;
  acceptDisaster: boolean = false;
}

export class MyGame extends Game<MyGame, SUVPlayer> {
  public gameOver : boolean = false;

  announceResult() : void {
    $.venusGoal.all(GoalCard).showToAll();
    $.earthGoal.all(GoalCard).showToAll();

    if(this.lostGame()) {
      this.finish(undefined, 'lost')
    } else {

      const beachHumanCount = this.all(LandSpace, {landType: LandType.Beach}).all(HumanToken).length;
      const mountainsHumanCount = this.all(LandSpace, {landType: LandType.Mountains}).all(HumanToken).length;
      const farmHumanCount = this.all(LandSpace, {landType: LandType.Farm}).all(HumanToken).length;
      const forestHumanCount = this.all(LandSpace, {landType: LandType.Forest}).all(HumanToken).length;
      
      const engineersCount = this.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Engineer}).length;
      const medicsCount = this.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Medic}).length;
      const diplomatsCount = this.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Diplomat}).length;
      const soldiersCount = this.all(LandSpace)?.all(HumanToken, {earthRole: EarthRole.Soldier}).length;

      const earthGoal = $.earthGoal.first(GoalCard)!;
      const beachGoal = beachHumanCount >= earthGoal.earthBeach;
      const mountainsGoal = mountainsHumanCount >= earthGoal.earthMountains;
      const farmGoal = farmHumanCount >= earthGoal.earthFarm;
      const forestGoal = forestHumanCount >= earthGoal.earthForest;

      const venusGoal = $.venusGoal.first(GoalCard)!;
      const engineersGoal = engineersCount >= venusGoal.venusEngineers;
      const medicsGoal = medicsCount >= venusGoal.venusMedics;
      const diplomatsGoal = diplomatsCount >= venusGoal.venusDiplomats;
      const soldiersGoal = soldiersCount >= venusGoal.venusSoldiers;

      if(beachGoal && mountainsGoal && farmGoal && forestGoal && engineersGoal && medicsGoal && diplomatsGoal && soldiersGoal) {
        this.finish(undefined, 'win')
      } else {
        this.finish(undefined, 'lost')
      }      
    }
  }

  public lostGame() : boolean {
    const rejectionCount = $.rejectionSpace.all(RejectionCard).length;
    switch(this.game.players.length-1) {
      case 1:
        return rejectionCount >= 2;
      case 2:
        return rejectionCount >= 5;
      case 3:
        return rejectionCount >= 8;
    }
    return this.game.all(LandSpace).all(HumanToken).length == 0;
  }

  public revealNextEvent() : void {
    $.overlayRow.first(EventCover)!.putInto($.box);

    const event = $.eventRow.all(EventCard)[9 - $.overlayRow.all(EventCover).length];
    event.showToAll();

    this.destroyLocation(event.disasterLocation);
  }

  public destroyLocation(disasterLocation: LandType) {
    this.game.all(LandSpace, {landType: disasterLocation}).forEach(landSpace => {
      if(landSpace.all(BuildingCard).length > 0) {
        // Destroy the building
        landSpace.first(BuildingCard)!.putInto($.box);
      } else {
        // Injure the humans
        landSpace.all(HumanToken).forEach(human => {
          if(human.isInjured) {
            human.putInto(landSpace.container(PlayersSpace)!.first(LostHumanSpace)!);
          } else {
            human.isInjured = true;
          }
        });
      }
    });
  }

  public venusMotivation() : void {
    $.trustSpace.all(TrustCard).putInto($.motivationDeck);
    $.motivationDeck.all(EarthCard).hideFromAll();
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

    this.game.gameOver = this.game.lostGame();
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

export class GoalCard extends Piece<MyGame> {
  public earthPlayerCount: number;

  public forEarthPlayer: boolean;
  
  public earthMountains: number;
  public earthFarm: number;
  public earthBeach: number;
  public earthForest: number;
  
  public venusMedics: number;
  public venusEngineers: number;
  public venusDiplomats: number;
  public venusSoldiers: number;

  public getPlayerCountColor() : string {
    switch(this.earthPlayerCount) {
      case 1:
        return "lightGreen";
      case 2:
        return "lightYellow";
      case 3:
        return "lightRed";
    }
    return "white";
  }
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
  public visible: string = "Yes";
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

export class DisasterSpace extends Space<MyGame> {
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
  public color: string = 'black';

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

export class RejectionSpace extends Space<MyGame> {

}

export default createGame(SUVPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, forLoop, whileLoop, loop, eachPlayer, ifElse } = game.flowCommands;


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

  $.venusDeck.all(VenusCard).hideFromAll();
  
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
  game.create(DisasterSpace, 'disasterSpace');

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
  game.create(RejectionSpace, 'rejectionSpace');

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

    $.box.create(GoalCard, 'goal1_1', {earthPlayerCount: 1, 
      earthMountains: 2, earthFarm: 1, earthBeach: 2, earthForest: 1, venusMedics: 2, venusEngineers: 1, venusDiplomats: 2, venusSoldiers: 1});
    $.box.create(GoalCard, 'goal1_2', {earthPlayerCount: 1, 
      earthMountains: 2, earthFarm: 2, earthBeach: 1, earthForest: 1, venusMedics: 1, venusEngineers: 2, venusDiplomats: 1, venusSoldiers: 2});
    $.box.create(GoalCard, 'goal1_3', {earthPlayerCount: 1, 
      earthMountains: 1, earthFarm: 2, earthBeach: 1, earthForest: 2, venusMedics: 1, venusEngineers: 2, venusDiplomats: 2, venusSoldiers: 1});
    $.box.create(GoalCard, 'goal1_4', {earthPlayerCount: 1, 
      earthMountains: 1, earthFarm: 1, earthBeach: 2, earthForest: 2, venusMedics: 2, venusEngineers: 1, venusDiplomats: 1, venusSoldiers: 2});

    $.box.create(GoalCard, 'goal2_1', {earthPlayerCount: 2, 
      earthMountains: 4, earthFarm: 2, earthBeach: 3, earthForest: 3, venusMedics: 4, venusEngineers: 3, venusDiplomats: 2, venusSoldiers: 3});
    $.box.create(GoalCard, 'goal2_2', {earthPlayerCount: 2, 
      earthMountains: 3, earthFarm: 4, earthBeach: 3, earthForest: 2, venusMedics: 3, venusEngineers: 4, venusDiplomats: 3, venusSoldiers: 2});
    $.box.create(GoalCard, 'goal2_3', {earthPlayerCount: 2, 
      earthMountains: 2, earthFarm: 3, earthBeach: 4, earthForest: 3, venusMedics: 3, venusEngineers: 2, venusDiplomats: 4, venusSoldiers: 3});
    $.box.create(GoalCard, 'goal2_4', {earthPlayerCount: 2, 
      earthMountains: 3, earthFarm: 3, earthBeach: 2, earthForest: 4, venusMedics: 2, venusEngineers: 3, venusDiplomats: 3, venusSoldiers: 4});

    $.box.create(GoalCard, 'goal3_1', {earthPlayerCount: 3, 
      earthMountains: 6, earthFarm: 3, earthBeach: 5, earthForest: 4, venusMedics: 6, venusEngineers: 4, venusDiplomats: 3, venusSoldiers: 5});
    $.box.create(GoalCard, 'goal3_2', {earthPlayerCount: 3, 
      earthMountains: 3, earthFarm: 5, earthBeach: 4, earthForest: 6, venusMedics: 4, venusEngineers: 6, venusDiplomats: 5, venusSoldiers: 3});
    $.box.create(GoalCard, 'goal3_3', {earthPlayerCount: 3, 
      earthMountains: 5, earthFarm: 4, earthBeach: 6, earthForest: 3, venusMedics: 3, venusEngineers: 5, venusDiplomats: 6, venusSoldiers: 4});
    $.box.create(GoalCard, 'goal3_4', {earthPlayerCount: 3, 
      earthMountains: 4, earthFarm: 6, earthBeach: 3, earthForest: 5, venusMedics: 5, venusEngineers: 3, venusDiplomats: 4, venusSoldiers: 6});

    $.box.shuffle();

    game.create(Space<MyGame>, 'venusGoal');
    game.create(Space<MyGame>, 'earthGoal');

    const venusGoal = $.box.first(GoalCard, {earthPlayerCount: game.players.length-1})!;
    venusGoal.forEarthPlayer = false;
    venusGoal.showOnlyTo(game.players[0]);
    venusGoal.putInto($.venusGoal);
  
    const earthGoal = $.box.first(GoalCard, {earthPlayerCount: game.players.length-1})!;
    earthGoal.forEarthPlayer = true;
    earthGoal.hideFromAll();
    for(let i = 1; i < game.players.length; i++) {
      earthGoal.showTo(game.players[i]);
    }
    earthGoal.putInto($.earthGoal);        

    const mountains = playerSpace.create(LandSpace, 'mountainsLand' + p, {landType: LandType.Mountains});
    mountains.create(LandCard, 'mountainsLandCard' + p, {landType: LandType.Mountains});
    $.box.topN(3, HumanToken).putInto(mountains);
    $.box.topN(2, RejectionCard).putInto(mountains);

    const farm = playerSpace.create(LandSpace, 'farmLand' + p, {landType: LandType.Farm});
    farm.create(LandCard, 'farmLandCard' + p, {landType: LandType.Farm});
    $.box.topN(3, HumanToken).putInto(farm);
    $.box.topN(2, RejectionCard).putInto(farm);

    const beach = playerSpace.create(LandSpace, 'beachLand' + p, {landType: LandType.Beach});
    beach.create(LandCard, 'beachLandCard' + p, {landType: LandType.Beach});
    $.box.topN(3, HumanToken).putInto(beach);
    $.box.topN(2, RejectionCard).putInto(beach);

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
          if(player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Engineer}).length > 0) {
            game.followUp({name: 'activateEngineer'});
          }
          break;
        case EarthRole.Medic:
          if(player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Medic}).length > 0) {
            game.followUp({name: 'activateMedic'});
          }
          break;
        case EarthRole.Diplomat:
          if(player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Diplomat}).length > 0) {
            game.followUp({name: 'activateDiplomat'});
          }
          break;
        case EarthRole.Soldier:
          if(player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Soldier}).length > 0) {
            game.followUp({name: 'activateSoldier'});
          }
          break;
      }
    }),

    chooseOffering: (player) => action({
      prompt: 'Choose Offering'
    }).chooseOnBoard(
      'offering', $.venusHand.all(VenusCard),
      { skipIf: 'never' }
    ).do(({offering}) => {
      player.playedOffering = true;
      offering.putInto($.offeringRow);
      offering.showToAll();
      if($.venusDeck.all(VenusCard).length > 0) {
        const next = $.venusDeck.top(VenusCard)!;
        next.showOnlyTo(game.players[0]);
        next.putInto($.venusHand);
      }
    }),

    newEvent: (player) => action({
      prompt: 'Replace Event (' + (game.players.length-1) + ')',
      condition: $.venusHand.all(TrustToken).length >= (game.players.length-1)
    }).do(() => {
      game.followUp({name: 'replaceEventCard'});
    }),

    replaceEventCard: (player) => action({
      prompt: 'Choose Event Card to Replace'
    }).chooseOnBoard(
      'card', $.eventRow.all(EventCard).splice(10-$.overlayRow.all(EventCover).length)
    ).do(({card}) => {
      const position = $.eventRow.all(EventCard).indexOf(card);
      card.putInto($.eventDeck, {position: $.eventDeck.all(EventCard).length});
      const event = $.eventDeck.top(EventCard)!;
      event.showOnlyTo(game.players[0]);
      event.putInto($.eventRow, {position: position});
      $.venusHand.topN((game.players.length-1), TrustToken).putInto($.box);
    }),

    swapEvents: (player) => action({
      prompt: 'Swap 2 Events (' + ((game.players.length-1)*2) + ')',
      condition: $.venusHand.all(TrustToken).length >= (game.players.length-1)*2 && $.overlayRow.all(EventCover).length >= 2
    }).do(() => {
      game.followUp({name: 'chooseEventCardsToSwap'});
    }),

    chooseEventCardsToSwap: (player) => action({
      prompt: 'Choose Event Cards to Swap'
    }).chooseOnBoard(
      'cards', $.eventRow.all(EventCard).splice(10-$.overlayRow.all(EventCover).length),
      {number: 2}
    ).do(({cards}) => {
      const position1 = $.eventRow.all(EventCard).indexOf(cards[0]);
      const position2 = $.eventRow.all(EventCard).indexOf(cards[1]);

      if(position1 < position2) {
        cards[1].putInto($.eventRow, {position: position1});
        cards[0].putInto($.eventRow, {position: position2});
      } else {
        cards[0].putInto($.eventRow, {position: position2});
        cards[1].putInto($.eventRow, {position: position1});
      }

      $.venusHand.topN((game.players.length-1)*2, TrustToken).putInto($.box);
    }),

    newVenusCard: (player) => action({
      prompt: 'Draw New Venus Card (' + ((game.players.length-1)*2) + ')',
      condition: $.venusHand.all(TrustToken).length >= (game.players.length-1)*2 && $.venusDeck.all(VenusCard).length > 0
    }).do(() => {
      const card = $.venusDeck.top(VenusCard)!
      card.showOnlyTo(game.players[0]);
      card.putInto($.venusHand);
      game.followUp({name: 'discardVenusCard'});
      $.venusHand.topN((game.players.length-1)*2, TrustToken).putInto($.box);
    }),

    discardVenusCard: (player) => action({
      prompt: 'Choose Venus Card to Discard'
    }).chooseOnBoard(
      'card', $.venusHand.all(VenusCard)
    ).do(({card}) => {        
      card.hideFromAll();
      card.putInto($.venusDeck, {position: $.venusDeck.all(VenusCard).length});
    }),

    activateEngineer: (player) => action({
      prompt: 'Activate Engineer'
    }).chooseOnBoard(
      'engineer', player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Engineer}),
      {skipIf: 'never'}
    ).do(({engineer}) => {        
      const land = engineer.container(LandSpace)!;
      if(land.all(BuildingCard).length == 0 && player.space.all(BuildingDeck).all(BuildingCard).length > 0) {
        game.followUp({name: 'buildBuilding', args: {land: land}});
      }
    }),

    buildWhere: (player) => action({
      prompt: 'Choose where to build'
    }).chooseOnBoard(
      'ld', player.space.all(LandSpace).filter(x => x.all(BuildingCard).length == 0).map(x => x.first(LandCard)!)
    ).do(({ld}) => {        
      const land = ld.container(LandSpace)!;
      if(land.all(BuildingCard).length == 0 && player.space.all(BuildingDeck).all(BuildingCard).length > 0) {
        game.followUp({name: 'buildBuilding', args: {land: land}});
      }
    }),

    healWhere: (player) => action({
      prompt: 'Choose where to heal'
    }).chooseOnBoard(
      'ld', player.space.all(LandSpace).map(x => x.first(LandCard)!)
    ).do(({ld}) => {        
      const land = ld.container(LandSpace)!;
      game.followUp({name: 'healHumans', args: {land: land, count: 3}});
    }),

    recoverWhere: (player) => action({
      prompt: 'Choose where to recover'
    }).chooseOnBoard(
      'ld', player.space.all(LandSpace).map(x => x.first(LandCard)!)
    ).do(({ld}) => {   
      const land = ld.container(LandSpace)!;     
      if(player.space.all(LostHumanSpace).all(HumanToken).length > 0) {
        game.followUp({name: 'recoverHuman', args: {land: land}});
      }
    }),

    moveFromWhere: (player) => action({
      prompt: 'Choose where to move from'
    }).chooseOnBoard(
      'ld', player.space.all(LandSpace).map(x => x.first(LandCard)!)
    ).do(({ld}) => {      
      const land = ld.container(LandSpace)!;
      const count = land.all(HumanToken).length;
      if(count > 0) {  
        game.followUp({name: 'moveHumansFrom', args: {land: land, count: Math.min(count, 2)}});
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
            game.followUp({name: 'drawCard', args: {lands: [land], count: 1}});
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

    drawCard: (player) => action<{lands: [LandSpace], count: number}>({
      prompt: 'Draw Earth Card(s)'
    }).chooseOnBoard(
      'cards', ({lands}) => lands.flatMap(x => x.all(RejectionCard)),
      {number: ({count}) => count}
    ).do(({cards}) => {       
       cards.forEach(card => {
        card.putInto(player.space.first(Hand)!);
        card.showOnlyTo(player);
       });
    }),

    moveHumansTo: (player) => action<{land: LandSpace}>({
      prompt: 'Choose Humans to Move'
    }).chooseOnBoard(
      'humans', ({land}) => player.space.all(LandSpace).all(HumanToken).filter(x => x.container(LandSpace) != land),
      { number: ({land}) => Math.min(player.space.all(LandSpace).all(HumanToken).filter(x => x.container(LandSpace) != land).length, 2) }
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
    ).chooseOnBoard(
      'dest', ({land}) => player.space.all(LandCard).filter(x => x != land.first(LandCard)!),
    ).do(({dest, human, soldier, land, count}) => {      
      const destination = dest.container(LandSpace)!;
      human.putInto(destination);
      if(count > 1) {
        game.followUp({name: 'moveHumansFrom', args: {soldier: soldier, land: land, count: count - 1}});
      }
    }),

    // chooseHumanLocation: (player) => action<{human: HumanToken, soldier: HumanToken, land: LandSpace, count: number}>({
    //   prompt: 'Choose Location for Human'
    // }).chooseOnBoard(
    //   'destination', ({land}) => player.space.all(LandSpace).filter(x => x != land),
    // ).do(({destination, human, soldier, land, count}) => {
    //   game.message('human = ' + human);
    //   game.message('soldier = ' + soldier);
    //   game.message('land = ' + land);
    //   game.message('destination = ' + destination);
    //   game.message('count = ' + count);
    //   human.putInto(destination);
    //   if(count > 1) {
    //     game.followUp({name: 'moveHumansFrom', args: {soldier: soldier, land: land, count: count - 1}});
    //   }
    // }),

    activateMedic: (player) => action({
      prompt: 'Activate Medic'
    }).chooseOnBoard(
      'medic', player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Medic}),
      {skipIf: 'never'}
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
        human.isInjured = true;
      }
    }),

    activateDiplomat: (player) => action({
      prompt: 'Activate Diplomat'
    }).chooseOnBoard(
      'diplomat', player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Diplomat}),
      {skipIf: 'never'}
    ).do(({diplomat}) => {   
      const land = diplomat.container(LandSpace)!;
      if(land.all(RejectionCard).length > 0) {
        game.followUp({name: 'drawCard', args: {lands: [land], count: 1}});
      }
    }),
    
    activateSoldier: (player) => action({
      prompt: 'Activate Soldier',
    }).chooseOnBoard(
      'soldier', player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Soldier}),
      {skipIf: 'never'}
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
        const count = land.all(HumanToken).filter(x => x != soldier).length;
        if(count > 0) {
          game.followUp({name: 'moveHumansFrom', args: {soldier: soldier, land: land, count: Math.min(count,2)}});
        }
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

      const beachHumanCount = player.space.first(LandSpace, {landType: LandType.Beach})!.all(HumanToken).length;
      const mountainsHumanCount = player.space.first(LandSpace, {landType: LandType.Mountains})!.all(HumanToken).length;
      const farmHumanCount = player.space.first(LandSpace, {landType: LandType.Farm})!.all(HumanToken).length;
      const forestHumanCount = player.space.first(LandSpace, {landType: LandType.Forest})!.all(HumanToken).length;

      switch(offering.venusAction) {
        case VenumAction.Move2ToTheBeach:
          game.followUp({name: 'moveHumansTo', args: {land: player.space.first(LandSpace, {landType: LandType.Beach})!}});
          break;
        case VenumAction.Move2FromTheBeach:
          if(beachHumanCount > 0) {
            game.followUp({name: 'moveHumansFrom', args: {land: player.space.first(LandSpace, {landType: LandType.Beach})!, count: Math.min(beachHumanCount, 2)}});
          }
          break;
        case VenumAction.Move2ToTheMountains:
          game.followUp({name: 'moveHumansTo', args: {land: player.space.first(LandSpace, {landType: LandType.Mountains})!}});
          break;
        case VenumAction.Move2FromTheMountains:
          if(mountainsHumanCount > 0) {
            game.followUp({name: 'moveHumansFrom', args: {land: player.space.first(LandSpace, {landType: LandType.Mountains})!, count: Math.min(mountainsHumanCount, 2)}});
          }
          break;
        case VenumAction.Move2ToTheFarm:
          game.followUp({name: 'moveHumansTo', args: {land: player.space.first(LandSpace, {landType: LandType.Farm})!}});
          break;
        case VenumAction.Move2FromTheFarm:
          if(farmHumanCount > 0) {
            game.followUp({name: 'moveHumansFrom', args: {land: player.space.first(LandSpace, {landType: LandType.Farm})!, count: Math.min(farmHumanCount, 2)}});
          }
          break;
        case VenumAction.Move2ToTheForest:
          game.followUp({name: 'moveHumansTo', args: {land: player.space.first(LandSpace, {landType: LandType.Forest})!}});
          break;
        case VenumAction.Move2FromTheForest:
          if(forestHumanCount > 0) {
            game.followUp({name: 'moveHumansFrom', args: {land: player.space.first(LandSpace, {landType: LandType.Forest})!, count: Math.min(forestHumanCount, 2)}});
          }          
          break;
        case VenumAction.ActivateAnEngineer:
          if(player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Engineer}).length > 0) {
            game.followUp({name: 'activateEngineer'});
          }
          break;
        case VenumAction.ActivateADiplomat:
          if(player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Diplomat}).length > 0) {
            game.followUp({name: 'activateDiplomat'});
          }
          break;
        case VenumAction.ActivateAMedic:
          if(player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Medic}).length > 0) {
            game.followUp({name: 'activateMedic'});
          }
          break;
        case VenumAction.ActivateASoldier:
          if(player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Soldier}).length > 0) {
            game.followUp({name: 'activateSoldier'});
          }
          break;
      }
    }),

    venusSideEffect: (player) => action({
      prompt: 'Venus Side Effect'
    }).do(() => {
      const offering = $.offeringRow.all(VenusCard)[9 - $.overlayRow.all(EventCover).length];
      game.message(offering.getSideEffectText());

      const beachHumanCount = player.space.first(LandSpace, {landType: LandType.Beach})!.all(HumanToken).length;
      const mountainsHumanCount = player.space.first(LandSpace, {landType: LandType.Mountains})!.all(HumanToken).length;
      const farmHumanCount = player.space.first(LandSpace, {landType: LandType.Farm})!.all(HumanToken).length;
      const forestHumanCount = player.space.first(LandSpace, {landType: LandType.Forest})!.all(HumanToken).length;
      
      const engineersCount = player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Engineer}).length;
      const medicsCount = player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Medic}).length;
      const diplomatsCount = player.space.all(LandSpace).all(HumanToken, {earthRole: EarthRole.Diplomat}).length;
      const soldiersCount = player.space.all(LandSpace)?.all(HumanToken, {earthRole: EarthRole.Soldier}).length;

      const lands : LandType[] = []
      
      switch(offering.sideEffect) {
        case SideEffect.Injure2AtTheBeach:
          if(beachHumanCount > 0) {
            game.followUp({name: 'injureHumans', args: {lands: [LandType.Beach], countEach: 2}});
          }
          break;
        case SideEffect.Injure1AtTheMountainsFarmAndForest:          
          if(mountainsHumanCount > 0) {lands.push(LandType.Mountains)}
          if(farmHumanCount > 0) {lands.push(LandType.Farm)}
          if(forestHumanCount > 0) {lands.push(LandType.Forest)}
          if(lands.length > 0) {
            game.followUp({name: 'injureHumans', args: {lands: lands, countEach: 1}});
          }
          break;
        case SideEffect.Injure2AtTheMountains:
          if(mountainsHumanCount > 0) {
            game.followUp({name: 'injureHumans', args: {lands: [LandType.Mountains], countEach: 2}});
          }
          break;
        case SideEffect.Injure1AtTheBeachFarmAndForest:
          if(beachHumanCount > 0) {lands.push(LandType.Beach)}
          if(farmHumanCount > 0) {lands.push(LandType.Farm)}
          if(forestHumanCount > 0) {lands.push(LandType.Forest)}
          if(lands.length > 0) {
            game.followUp({name: 'injureHumans', args: {lands: lands, countEach: 1}});
          }
          break;
        case SideEffect.Injure2AtTheFarm:
          if(farmHumanCount > 0) {
            game.followUp({name: 'injureHumans', args: {lands: [LandType.Farm], countEach: 2}});
          }
          break;
        case SideEffect.Injure1AtTheBeachMountainsAndForest:
          if(beachHumanCount > 0) {lands.push(LandType.Beach)}
          if(mountainsHumanCount > 0) {lands.push(LandType.Mountains)}
          if(forestHumanCount > 0) {lands.push(LandType.Forest)}
          if(lands.length > 0) {
            game.followUp({name: 'injureHumans', args: {lands: lands, countEach: 1}});
          }
          break;
        case SideEffect.Injure2AtTheForest:
          if(forestHumanCount > 0) {
            game.followUp({name: 'injureHumans', args: {lands: [LandType.Forest], countEach: 2}});
          }
          break;
        case SideEffect.Injure1AtTheBeachMountainsAndFarm:
          if(beachHumanCount > 0) {lands.push(LandType.Beach)}
          if(mountainsHumanCount > 0) {lands.push(LandType.Mountains)}
          if(farmHumanCount > 0) {lands.push(LandType.Farm)}
          if(lands.length > 0) {
            game.followUp({name: 'injureHumans', args: {lands: lands, countEach: 1}});
          }
          break;
        case SideEffect.InjureAnEngineer:
          if(engineersCount > 0) {
            game.followUp({name: 'injureRole', args: {earthRole: EarthRole.Engineer}});
          }
          break;
        case SideEffect.InjureADiplomat:
          if(diplomatsCount > 0) {
            game.followUp({name: 'injureRole', args: {earthRole: EarthRole.Diplomat}});
          }
          break;
        case SideEffect.InjureAMedic:
          if(medicsCount > 0) {
            game.followUp({name: 'injureRole', args: {earthRole: EarthRole.Medic}});
          }
          break;
        case SideEffect.InjureASoldier:
          if(soldiersCount > 0) {
            game.followUp({name: 'injureRole', args: {earthRole: EarthRole.Soldier}});
          }
          break;
      }
    }),

    rejectVenus: (player) => action({
      prompt: 'Reject Venus'
    }).chooseOnBoard(
      'card', player.space.all(Hand).all(RejectionCard)
    ).do(({card}) => {
      player.trust = false;
      card.color = game.getColor(card);
      card.putInto($.rejectionRow);      
      card.showToAll();

      switch(card.earthAction) {
        case EarthAction.DrawAny2EarthCards:
          game.followUp({name: 'drawCard', args: {lands: player.space.all(LandSpace), count: 2}});
          break;
        case EarthAction.BuildAnywhere:
          game.followUp({name: 'buildWhere'});
          break;
        case EarthAction.Heal3On1Land:
          game.followUp({name: 'healWhere'});
          break;
        case EarthAction.Recover1ToAnywhere:
          game.followUp({name: 'recoverWhere'});
          break;
        case EarthAction.Move2From1Land:
          game.followUp({name: 'moveFromWhere'});
          break;
      }
    }),

    acceptDisaster: (player) => action({
      prompt: 'Accept Disaster'
    }).do(() => {
      player.acceptDisaster = true;
    }),

    newDisaster: (player) => action({
      prompt: 'New Disaster (' + (game.players.length-1) + ')',
      condition: $.venusHand.all(TrustToken).length >= (game.players.length-1) && $.eventDeck.all(EventCard).length > 0
    }).do(() => {
      $.disasterSpace.all(EventCard).putInto($.box);
      $.venusHand.topN((game.players.length-1), TrustToken).putInto($.box);
    }),
  
  });

  game.defineFlow(

    forLoop({ name: 'round', initial: 1, next: round => round + 1, while: round => round <= 10 && !game.gameOver, do: [
      
      // 1. Reveal Next Event and Apply Disaster
      () => game.revealNextEvent(),

      // 2. Venus Motivation
      () => game.venusMotivation(),

      ifElse({
        if: () => !game.gameOver, do: [

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
                  ({turn}) => turn.playedOffering = false,
                  whileLoop({while: ({turn}) => !turn.playedOffering, do: ([
                    playerActions({ actions: ['chooseOffering', 'newEvent', 'swapEvents', 'newVenusCard']}),
                  ])}),
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

          () => $.rejectionRow.all(RejectionCard).putInto($.motivationDeck),
        ]}),
      ]}),

      // Final Disaster
      ifElse({
        if: () => !game.gameOver, do: [
          eachPlayer({
            name: 'turn', do: [
              ifElse({
                if: ({turn}) => turn == game.players[0], do: [
                  whileLoop({while: ({turn}) => !turn.acceptDisaster, do: ([
                    () => {
                      const disaster = $.eventDeck.top(EventCard)!;
                      disaster.putInto($.disasterSpace);
                      disaster.showToAll();
                    },
                    playerActions({ actions: ['acceptDisaster', 'newDisaster']}),
                  ])}),
                ],
              }),
            ]
          }),
          () => game.destroyLocation($.disasterSpace.first(EventCard)!.disasterLocation),
        ],        
      }),      

      // Game Over
      () => game.announceResult()
    );
});
