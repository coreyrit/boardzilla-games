import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';
import { D6 } from '@boardzilla/core/components';
import { arch } from 'os';
import { ScoringHelper } from './scoring-helper.js';

export class BeeGamePlayer extends Player<MyGame, BeeGamePlayer> {
  space: PlayerSpace;
  beePlayed: BeeToken | null = null;
  placedInApiary: boolean = false;  
  mintDiscount: number = 0;
  dandelionDiscount: number = 0;
  lavenderDiscount: number = 0;

  public setScore() {
    let score = 0;
    score += this.getFlowerScore();
    score += this.getBeeScore();
    score += this.getHoneyScore();
    score += this.getArrangementScore();
    this.space.first(PlayerScore)!.score = score;
  }

  public setBaseScore() {
    let score = 0;
    score += this.getFlowerScore(true);
    score += this.getBeeScore(true);
    score += this.getHoneyScore(true);
    this.space.first(PlayerScore)!.score = score;
  }

  public addArrangementScore(arrangement: ArrangementCard, log : boolean = false) {
    const helper = new ScoringHelper();
    let score = this.space.first(PlayerScore)!.score;
    const add = this.getSingleArrangementScore(arrangement, helper);
    score += add;
    if(log) this.game.message(this.name + ' scored ' + add + ' points for ' + arrangement.scoring);
    this.space.first(PlayerScore)!.score = score;
  }


  public getFlowerScore(log : boolean = false) : number {
    let score = 0;
    
    // get score for flowers
    this.space.all(FlowerCard).forEach(x => {
      switch(x.scoring) {
        case FlowerScoring.VP1:
          score += 1;
          break;
        case FlowerScoring.VP2:
          score += 2;
          break;
        case FlowerScoring.Per3DandelionVP2:
          score += 2 * Math.floor((this.space.all(FlowerCard, {type: FlowerType.Dandelion}).length / 3));
          break;
        case FlowerScoring.Per3LavenderVP2:
          score += 2 * Math.floor((this.space.all(FlowerCard, {type: FlowerType.Lavender}).length / 3));
          break;
        case FlowerScoring.Per3MintVP2:
          score += 2 * Math.floor((this.space.all(FlowerCard, {type: FlowerType.Mint}).length / 3));
          break;
        case FlowerScoring.PerDandelionHoneyVP1:
          score += this.space.all(HoneyCard, {faceUp: true, type: FlowerType.Dandelion}).length;;
          break;
        case FlowerScoring.PerLavenderHoneyVP1:
          score += this.space.all(HoneyCard, {faceUp: true, type: FlowerType.Lavender}).length;;
          break;
        case FlowerScoring.PerMintHoneyVP1:
          score += this.space.all(HoneyCard, {faceUp: true, type: FlowerType.Mint}).length;;
          break;
        default:
          break;
      }      
    });

    if(log) this.game.message(this.name + ' scored ' + score + ' points for flowers.');
    return score;
  }

  public getBeeScore(log : boolean = false) : number {
    let score = 0;
    // get score for bees    
    this.space.all(BeeToken).concat(this.game.all(BeeSpace).all(BeeToken, {player: this})).forEach(x => {
      score += x.beeVP;      
    });
    if(log) this.game.message(this.name + ' scored ' + score + ' points for bees.');
    return score;
  }

  public getHoneyScore(log : boolean = false) : number {
    let score = 0;

    const mintHoney = this.space.all(HoneyCard, {faceUp: true, type: FlowerType.Mint}).length;
    const dandelionHoney = this.space.all(HoneyCard, {faceUp: true, type: FlowerType.Dandelion}).length;
    const lavenderHoney = this.space.all(HoneyCard, {faceUp: true, type: FlowerType.Lavender}).length;

    // get score for honey
    const mintScore = mintHoney > 3 ? this.getHoneySetScore(3) + this.getHoneySetScore(mintHoney-3) : this.getHoneySetScore(mintHoney);
    score += mintScore;
    if(log) this.game.message(this.name + ' scored ' + mintScore + ' points for ' + FlowerType.Mint + ' honey.');
    const lavenderScore = lavenderHoney > 3 ? this.getHoneySetScore(3) + this.getHoneySetScore(lavenderHoney-3) : this.getHoneySetScore(lavenderHoney);
    score += lavenderScore;
    if(log) this.game.message(this.name + ' scored ' + lavenderScore + ' points for ' + FlowerType.Lavender + ' honey.');
    const dandelionScore = dandelionHoney > 3 ? this.getHoneySetScore(3) + this.getHoneySetScore(dandelionHoney-3) : this.getHoneySetScore(dandelionHoney);
    score += dandelionScore;
    if(log) this.game.message(this.name + ' scored ' + dandelionScore + ' points for ' + FlowerType.Dandelion + ' honey.');
      
    const commonHoney = this.space.all(HoneyCard, {faceUp: false}).length * 3;
    score += commonHoney;
    if(log) this.game.message(this.name + ' scored ' + commonHoney + ' points for common honey.');

    const rareHoney = this.space.all(HoneyCard, {faceUp: true, scoring: HoneyScoring.VP4}).length * 4;
    score += rareHoney;
    if(log) this.game.message(this.name + ' scored ' + rareHoney + ' points for rare honey.');
    
    return score;
  }

  public getArrangementScore(log : boolean = false) : number {
    const helper = new ScoringHelper();

    let score = 0;
    $.arrangements.all(ArrangementCard).forEach(x => {
      const pts = this.getSingleArrangementScore(x, helper);
      score += pts;
      if(log) this.game.message(this.name + ' scored ' + pts + ' points for ' + x.scoring);
    });

    return score;
  }

  public getSingleArrangementScore(x : ArrangementCard, helper: ScoringHelper) : number {
    switch(x.scoring) {
      case ArrangementScoring.AngledPlanting: {
        return 4 * helper.countDiagonalTriples3Cols(this);
      }
      case ArrangementScoring.DandelionBase: {
        return helper.countCardsAboveLowestType(this, FlowerType.Dandelion);
      }
      case ArrangementScoring.FlowerPairing: {
        return 2 * helper.countRowsWithAdjacentPair(this);
      }
      case ArrangementScoring.LavenderRows: {
        return 3 * helper.countRowsWithAtLeastTwoOfType(this, FlowerType.Lavender);
      }
      case ArrangementScoring.LayeredNectar: {
        return helper.countTypeInColumnsThatContainType(this, FlowerType.Lavender, FlowerType.Mint);
      }
      case ArrangementScoring.MintMassing: {
        return helper.largestOrthogonalAreaSize(this, FlowerType.Mint);
      }
      case ArrangementScoring.MixedForage: {
        return helper.countTypeInRowsThatContainType(this, FlowerType.Dandelion, FlowerType.Lavender);
      }
      case ArrangementScoring.UnderBloom: {
        return 2 * helper.countDirectlyBelow(this, FlowerType.Dandelion, FlowerType.Mint);
      }
      case ArrangementScoring.GardenAbundance: {
        // nothing yet
        return 0;
      }
      default: {
        return 0;
      }
    }
  }

  public getHoneySetScore(count : number) : number {
    switch(count) {
      case 1:
        return 3;
      case 2:
        return 7;
      case 3:
        return 12;
    }
    return 0;
  }

  public reset() {
    this.beePlayed = null;
    this.placedInApiary = false;
    this.mintDiscount = 0;
    this.dandelionDiscount = 0;
    this.lavenderDiscount = 0;
  }

  public discCount() : number {
    return this.space.first(DiscSpace)!.all(Disc).length;
  }

  public canUseDisc(count: number) : boolean {
    return this.placedInApiary || 
           this.beePlayed == null || 
           this.beePlayed!.ability != BeeAbility.ZephyrAndApiary || 
           this.space.first(DiscSpace)!.all(Disc).length > count;
  }

  public canAffordFlower(flower: FlowerCard): boolean { 
    if(flower.wild) {  
      return this.space.first(DiscSpace)!.all(Disc, {type: flower.cost[0]}).length >= 1 &&
             this.space.first(DiscSpace)!.all(Disc, {type: flower.cost[1]}).length >= 1;
    } else {
      return this.space.first(DiscSpace)!.all(Disc, {type: flower.type}).length >= 2;
    }
  }

  public isMultisetSubsetWithDiscount<T>(
    need: T[],
    have: T[],
    discount = 0
  ): boolean {
    const counts = new Map<T, number>();

    for (const item of have) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }

    let misses = 0;

    for (const item of need) {
      const remaining = counts.get(item) ?? 0;

      if (remaining > 0) {
        counts.set(item, remaining - 1);
      } else {
        misses++;
        if (misses > discount) return false;
      }
    }

    return true;
  }

  public apiaryCanAffordHoney(apiary: ApiaryCard, honey: HoneyCard) : boolean {
    if(honey.faceUp) {
      let discColors = []
      discColors.push(apiary.type);    
      apiary.all(Disc).forEach(x => discColors.push(x.type));
    
      let discount = 0;
      switch(honey.type) {
        case FlowerType.Dandelion:
          discount = this.dandelionDiscount;
          break;
        case FlowerType.Lavender:
          discount = this.lavenderDiscount;
          break;
        case FlowerType.Mint:
          discount = this.mintDiscount;
          break;
      }

      return this.isMultisetSubsetWithDiscount(honey.cost, discColors, discount);
    } else {
      return apiary.all(Disc).length >= 3;
    }
  }

  public canAffordHoney(honey: HoneyCard): boolean { 
    const apiary = this.space.all(ApiaryCard);
    return this.apiaryCanAffordHoney(apiary[0], honey) ||
           this.apiaryCanAffordHoney(apiary[1], honey) ||
           this.apiaryCanAffordHoney(apiary[2], honey);
  }

    public rollDie() {
      const die = this.game.first(D6)!;
      die.roll();
      let result = '';
      switch(die.current) {
        case 2:
          $.pool.first(Disc, {type: FlowerType.Dandelion})!.putInto(this.space.first(DiscSpace)!);
          result = FlowerType.Dandelion;
          break;
        case 3:
          this.game.followUp({name: 'chooseDiscColor', args: {colors: [FlowerType.Mint, FlowerType.Dandelion, FlowerType.Lavender]}});
          result = 'Any Disc';
          break;
        case 4:
          $.pool.first(Disc, {type: FlowerType.Lavender})!.putInto(this.space.first(DiscSpace)!);
          result = FlowerType.Lavender;
          break;
        case 6:
          $.pool.first(Disc, {type: FlowerType.Mint})!.putInto(this.space.first(DiscSpace)!);
          result = FlowerType.Mint;
          break;
        case 1:
        case 5:
          if(this.space.all(LarvaHex).length >=2) {
            this.space.all(LarvaHex).putInto($.pool);
            $.pool.first(BeeToken, {upgradedBeeVP: 3})!.putInto(this.space);
          } else {
            $.pool.first(LarvaHex)!.putInto(this.space);
          }
          result = 'Larva';
          break;
      }

      this.game.message(`{{player}} rolled the die and got {{result}}.`, {player: this, result: result});
    }
}

export class PlayersSpace extends Space<MyGame> {  
}

export class PlayerScore extends Piece<MyGame> {
  score: number = 0;
}

export class PlayerSpace extends Space<MyGame> {  
}

export class FlowerColumn extends Space<MyGame> {
  index: number;

  public override toString(): string {
    return this.first(FlowerCard)!.type + ' Column';
  }
}

export class FieldSpace extends Space<MyGame> {
  row: number;
  column: number;
}

export enum BeeSpaceSide {
  Top,
  Bottom,
  Left,
  Right
}

export class BeeSpace extends Space<MyGame> {
  side: BeeSpaceSide;
  index: number;
}

export class FirstPlayerToken extends Piece<MyGame> {
}

export enum FlowerType {
  None = 'None',
  Mint = 'Mint 🟢',
  Dandelion = 'Dandelion 🟡',
  Lavender = 'Lavender 🟣',
}

export enum FlowerAbility {
  None,
  RollDie = 'Roll Die',
  Send2YellowApiary = 'Send Any 2 Discs to Yellow Apiary',
  Send2GreenApiary = 'Send Any 2 Discs to Green Apiary',
  Send2PurpleApiary = 'Send Any 2 Discs to Purple Apiary',
  RollAndGainYellow = 'Roll Die and Gain Dandelion',
  RollAndGainGreen = 'Roll Die and Gain Mint',
  RollAndGainPurple = 'Roll Die and Gain Lavender',
  DandelionHoney2Less = 'Make Dandelion Honey for 2 Less',
  MintHoney2Less = 'Make Mint Honey for 2 Less',
  LavenderHoney2Less = 'Make Lavneder Honey for 2 Less',
  GreenOrPurple = 'Take Mint or Lavender',
  YellowOrPurple = 'Take Dandelion or Lavender',
  GreenOrYellow = 'Take Mint or Dandelion',
  AnyForLavender = 'Pay Any Disc for Lavender Flower',
  AnyForDandelion = 'Pay Any Disc for Dandelion Flower',
  AnyForMint = 'Pay Any Disc for Mint Flower'
}

export enum FlowerScoring {
  None,
  VP1,
  VP2,
  PerDandelionHoneyVP1,
  PerMintHoneyVP1,
  PerLavenderHoneyVP1,
  Per3LavenderVP2,
  Per3MintVP2,
  Per3DandelionVP2,
  EndGoals
}

export class FlowerCard extends Piece<MyGame> {
  faceUp: boolean = false;
  type: FlowerType;
  wild: boolean = false;
  cost: FlowerType[];
  ability: FlowerAbility;
  scoring: FlowerScoring;

  public performAbility(player: BeeGamePlayer) {
    switch(this.ability) {
      case FlowerAbility.RollDie:
        player.rollDie();
        break;
      case FlowerAbility.Send2GreenApiary:
        this.game.followUp({name: 'choose2ColorsForApiary', args: { apiary: player.space.first(ApiaryCard, {type: FlowerType.Mint})!, count: 2 }});
        break;
      case FlowerAbility.Send2YellowApiary:
        this.game.followUp({name: 'choose2ColorsForApiary', args: { apiary: player.space.first(ApiaryCard, {type: FlowerType.Dandelion})!, count: 2 }});
        break;
      case FlowerAbility.Send2PurpleApiary:
        this.game.followUp({name: 'choose2ColorsForApiary', args: { apiary: player.space.first(ApiaryCard, {type: FlowerType.Lavender})!, count: 2 }});
        break;
      case FlowerAbility.RollAndGainPurple:
        player.rollDie();
        $.pool.first(Disc, {type: FlowerType.Lavender})!.putInto(player.space.first(DiscSpace)!);
        break;
      case FlowerAbility.RollAndGainYellow:
        player.rollDie();
        $.pool.first(Disc, {type: FlowerType.Dandelion})!.putInto(player.space.first(DiscSpace)!);
        break;
      case FlowerAbility.RollAndGainGreen:
        player.rollDie();
        $.pool.first(Disc, {type: FlowerType.Mint})!.putInto(player.space.first(DiscSpace)!);
        break;
      case FlowerAbility.AnyForLavender:
        if(player.discCount() > 0 && player.canUseDisc(1) && $.field.all(FlowerCard, {type: FlowerType.Lavender}).filter(x => x.all(Disc).length == 0).length > 0) {
          this.game.followUp({name: 'purchaseFlowerByType', args: { type: FlowerType.Lavender }});
        }
        break;
      case FlowerAbility.AnyForMint:
        if(player.discCount() > 0 && player.canUseDisc(1) && $.field.all(FlowerCard, {type: FlowerType.Mint}).filter(x => x.all(Disc).length == 0).length > 0) {
          this.game.followUp({name: 'purchaseFlowerByType', args: { type: FlowerType.Mint }});
        }
        break;
      case FlowerAbility.AnyForDandelion:
        if(player.discCount() > 0 && player.canUseDisc(1) && $.field.all(FlowerCard, {type: FlowerType.Dandelion}).filter(x => x.all(Disc).length == 0).length > 0) {
          this.game.followUp({name: 'purchaseFlowerByType', args: { type: FlowerType.Dandelion }});
        }
        break;
      case FlowerAbility.GreenOrPurple:
        this.game.followUp({name: 'chooseDiscColor', args: {colors: [FlowerType.Mint, FlowerType.Lavender]}});
        break;
      case FlowerAbility.YellowOrPurple:
        this.game.followUp({name: 'chooseDiscColor', args: {colors: [FlowerType.Dandelion, FlowerType.Lavender]}});
        break;
      case FlowerAbility.GreenOrYellow:
        this.game.followUp({name: 'chooseDiscColor', args: {colors: [FlowerType.Mint, FlowerType.Dandelion]}});
        break;
      case FlowerAbility.DandelionHoney2Less:
        player.dandelionDiscount = 2;
        break;
      case FlowerAbility.LavenderHoney2Less:
        player.lavenderDiscount = 2;
        break;
      case FlowerAbility.MintHoney2Less:
        player.mintDiscount = 2;
        break;
    }
  }

  public override toString(): string {
    if(this.wild) {
      return 'Wildflower';
    } else {
      return this.type + ' Flower (' + this.ability + ')';
    }
  }
}

export enum HoneyScoring {
  VP4,
  VP3_7_12
}

export enum ArrangementScoring {
  DandelionBase = 'Dandelion Base',
  LayeredNectar = 'Layered Nectar',
  FlowerPairing = 'Flower Pairing',
  LavenderRows = 'Lavender Rows',
  UnderBloom = 'Under Bloom',
  AngledPlanting = 'Angled Planting',
  MintMassing = 'Mint Massing',
  MixedForage = 'Mixed Forage',
  GardenAbundance = 'Garden Abundance'
}

export class ArrangementCard extends Piece<MyGame> {
  faceUp: boolean = false;
  scoring: ArrangementScoring;
}

export class HoneyCard extends Piece<MyGame> {
  faceUp: boolean = false;
  type: FlowerType;
  rot: boolean = false;
  cost: FlowerType[];
  scoring: HoneyScoring;

  public override toString(): string {
    if(this.faceUp) {
      if(this.scoring == HoneyScoring.VP4) {
        return 'Rare Honey';
      } else {
        return this.type + ' Honey'
      }
    } else {
      return 'Common Honey'
    }
  }
}

export class ApiaryCard extends Piece<MyGame> {
  type: FlowerType;
  color: string;

  public capitalize(str: string): string {
    if (!str) return str;
    return str[0].toUpperCase() + str.slice(1);
  }

  public override toString(): string {
    return this.type + ' Apiary' 
  }
}

export class ApiaryConvert extends Piece<MyGame> {

}

export class Disc extends Piece<MyGame> {
  type: FlowerType;
  color: string;

  public override toString(): string {
    return this.type;
  }
}

export class DiscSpace extends Space<MyGame> {

}

export class LarvaHex extends Piece<MyGame> {

}

export enum BeeAbility {
  None = '',
  ZephyrAndApiary = 'Zepyr & Apiary',
  RollDie = 'Roll Die',
  ChooseDisc = 'Choose Disc',
  Zephyr = 'Zephyr'
}

// export enum BeeColor {
//   Magenta,
//   Emerald,
//   Gold,
//   Sapphire,
//   Gray
// }
// function getPlayerBeeColor(playerIndex: number) : BeeColor {
//   switch(playerIndex) {
//     case 1:
//       return BeeColor.Magenta;
//     case 2:
//       return BeeColor.Emerald;
//     case 3:
//       return BeeColor.Gold;
//     case 4:
//       return BeeColor.Sapphire;
//     default:
//       return BeeColor.Gray;
//   }
// }

export class BeeToken extends Piece<MyGame> {
  upgraded: boolean = false;
  oneTimeUse: boolean;  

  beeCount: number;
  beeVP: number;  
  ability: BeeAbility;

  upgradedBeeCount: number;
  upgradedBeeVP: number;
  upgradedAbility: BeeAbility;

  public performAbility(player: BeeGamePlayer) {
    switch(this.ability) {
      case BeeAbility.RollDie:
        player.rollDie();
        break;
      case BeeAbility.Zephyr:
      case BeeAbility.ZephyrAndApiary:
        $.field.all(FlowerCard).forEach(x => {
          if(x.all(Disc).length == 0 && !x.wild) {
            $.pool.first(Disc, {type: x.type})!.putInto(x);
          }
        })
        this.game.message(`{{player}} used Zepnyr to refill the field.`, {player: this});
        break;
      case BeeAbility.ChooseDisc:
        this.game.followUp({name: 'chooseDiscColor', args: {colors: [FlowerType.Mint, FlowerType.Dandelion, FlowerType.Lavender]}});
        break;
    }
  }

  public override toString(): string {
    if(this.beeCount == 0) {
      return this.beeVP + 'VP'; 
    } else {
      let str = '';
      if(this.oneTimeUse) {
        str += 'Single-Use '
      }
      if(this.ability != BeeAbility.None) {
        str += this.ability + ' + ' + this.beeCount + ' Bee';
      } else {
        str += this.beeCount + ' Bee';
      }
      return str;
    }
  }
}

export class MyGame extends Game<MyGame, BeeGamePlayer> {  
  gameOver : boolean = false;
  nextArranementName: string = '';

  public drawFlowerCard() : FlowerCard {
    const flower = $.flowerDeck.top(FlowerCard)!;
    flower.faceUp = true;      
    if(!flower.wild) {
      $.pool.first(Disc, {type: flower.type})!.putInto(flower);
    }
    return flower;
  }

  public checkForGameEnd() {
    this.players.forEach(x => {      
      if(x.space.all(HoneyCard).length + x.space.all(FlowerCard).length >= 12) {
      // if(x.space.all(HoneyCard).length + x.space.all(FlowerCard).length >= 5) {
        this.gameOver = true;
      }
    });
  }

  public announceWinner() : void {
    this.message('game over!');

    var winners: BeeGamePlayer[] = []
    var highScore: number = 0;

    this.players.forEach(x => {
      this.game.all(BeeSpace).all(BeeToken, {player: x}).putInto(x.space);
      const score = x.space.first(PlayerScore)!.score;
      if(score > highScore) {
        winners = [x];
        highScore = score;
      }
    });
    this.finish(winners);
  }

  public drawHoneyCard() : HoneyCard {
    const honey = $.honeyDeck.top(HoneyCard)!;
    honey.faceUp = true;      
    return honey;
  }

  public refillField() {
    $.field.all(FieldSpace).filter(x => x.all(FlowerCard).length == 0).forEach(space => {
      this.drawFlowerCard().putInto(space);
    });
  }

  public refillHoney() {
    while($.honey.all(HoneyCard).length < this.players.length+1) {
      this.game.drawHoneyCard().putInto($.honey);
    }
  }

  public uniqueDiscsByType(discs: Disc[]): Disc[] {
    const seen = new Set<FlowerType>();
    return discs.filter(disc => {
      if (seen.has(disc.type)) return false;
      seen.add(disc.type);
      return true;
    });
  }

  public sendDiscToApiary(choice : FlowerType, apiary: ApiaryCard) {
    switch(choice) {
      case FlowerType.Mint:
        $.pool.first(Disc, {type: FlowerType.Mint})!.putInto(apiary);
        break;
      case FlowerType.Dandelion:
        $.pool.first(Disc, {type: FlowerType.Dandelion})!.putInto(apiary);
        break;
      case FlowerType.Lavender:
        $.pool.first(Disc, {type: FlowerType.Lavender})!.putInto(apiary);
        break;  
    }
  }
}

function setupGame(game: MyGame) {

  const pool = game.create(Space, 'pool');
  const field = game.create(Space, 'field');
  const honey = game.create(Space, 'honey');
  const arrangements = game.create(Space, "arrangements");

  for(let r = 1; r <= 3; r++) {
    for(let c = 1; c <= 3; c++) {
      field.create(FieldSpace, 'field-space-r' + r + '-c' + c, {row: r, column: c});
    }
  }

  for(let i = 0; i < 15; i++) {
    pool.create(Disc, 'disc-mint-' + (i+1), {color: 'green', type: FlowerType.Mint});
    pool.create(Disc, 'disc-dandelion-' + (i+1), {color: 'yellow', type: FlowerType.Dandelion});
    pool.create(Disc, 'disc-lavender-' + (i+1), {color: 'purple', type: FlowerType.Lavender}); 
  }

  for(let i = 0; i < 8; i++) {
    pool.create(LarvaHex, 'larva-' + i);
  }

  for(let i = 1; i <= 8; i++) {
    pool.create(BeeToken, 'bonus-bee-' + i, {
          oneTimeUse: true, upgraded: false,
          beeCount: 3, beeVP: 0, ability: BeeAbility.Zephyr,
          upgradedBeeCount: 0, upgradedBeeVP: 3, upgradedAbility: BeeAbility.None});
  }

  game.create(BeeSpace, 'bee-space-top-1', {side: BeeSpaceSide.Top, index: 1});
  game.create(BeeSpace, 'bee-space-top-2', {side: BeeSpaceSide.Top, index: 2});
  game.create(BeeSpace, 'bee-space-top-3', {side: BeeSpaceSide.Top, index: 3});
  game.create(BeeSpace, 'bee-space-bottom-1', {side: BeeSpaceSide.Bottom, index: 1});
  game.create(BeeSpace, 'bee-space-bottom-2', {side: BeeSpaceSide.Bottom, index: 2});
  game.create(BeeSpace, 'bee-space-bottom-3', {side: BeeSpaceSide.Bottom, index: 3});
  game.create(BeeSpace, 'bee-space-left-1', {side: BeeSpaceSide.Left, index: 1});
  game.create(BeeSpace, 'bee-space-left-2', {side: BeeSpaceSide.Left, index: 2});
  game.create(BeeSpace, 'bee-space-left-3', {side: BeeSpaceSide.Left, index: 3});
  game.create(BeeSpace, 'bee-space-right-1', {side: BeeSpaceSide.Right, index: 1});
  game.create(BeeSpace, 'bee-space-right-2', {side: BeeSpaceSide.Right, index: 2});
  game.create(BeeSpace, 'bee-space-right-3', {side: BeeSpaceSide.Right, index: 3});

  // set up players
  const playersSpace = game.create(PlayersSpace, 'playersSpace');
  for(var i = 1; i <= game.players.length; i++) {      
    const playerSpace = playersSpace.create(PlayerSpace, 'playerSpace' + i);
    playerSpace.create(PlayerScore, 'score-' + i);
    playerSpace.create(DiscSpace, 'discSpace-' + i);
    if(i == 1) {
      playerSpace.create(FirstPlayerToken, "firstPlayerToken"); 
    }
    const player = game.players[i-1];
    player.space = playerSpace
    player.space.player = player

    // starter flowers
    const col1 = playerSpace.create(FlowerColumn, 'flowerColumn1-' + i, {index: 1});
    const col2 = playerSpace.create(FlowerColumn, 'flowerColumn2-' + i, {index: 2});
    const col3 = playerSpace.create(FlowerColumn, 'flowerColumn3-' + i, {index: 3}); 

    col1.create(FlowerCard, 'starter-mint-' + i, {faceUp: true, type: FlowerType.Mint, cost: [], 
      ability: FlowerAbility.RollDie, scoring: FlowerScoring.None});
    col2.create(FlowerCard, 'starter-dandelion-' + i, {faceUp: true, type: FlowerType.Dandelion, cost: [], 
      ability: FlowerAbility.RollDie, scoring: FlowerScoring.None});
    col3.create(FlowerCard, 'starter-lavender-' + i, {faceUp: true, type: FlowerType.Lavender, cost: [], 
      ability: FlowerAbility.RollDie, scoring: FlowerScoring.None});  
    
    // bee tokens
    switch(i) {
      case 1:
        playerSpace.create(BeeToken, 'bee-token-player-bee-' + i, {
          oneTimeUse: true, upgraded: false,
          beeCount: 1, beeVP: 0, ability: BeeAbility.None,
          upgradedBeeCount: 0, upgradedBeeVP: 2, upgradedAbility: BeeAbility.None});
        break;
      case 2:
        playerSpace.create(BeeToken, 'bee-token-player-bee-' + i, {
          oneTimeUse: true, upgraded: false,
          beeCount: 1, beeVP: 0, ability: BeeAbility.RollDie,
          upgradedBeeCount: 0, upgradedBeeVP: 2, upgradedAbility: BeeAbility.RollDie});
        break;
      case 3:
        playerSpace.create(BeeToken, 'bee-token-player-bee-' + i, {
          oneTimeUse: true, upgraded: false,
          beeCount: 2, beeVP: 0, ability: BeeAbility.None,
          upgradedBeeCount: 0, upgradedBeeVP: 2, upgradedAbility: BeeAbility.None});
        break;
      case 4:
        playerSpace.create(BeeToken, 'bee-token-player-bee-' + i, {
          oneTimeUse: true, upgraded: false,
          beeCount: 2, beeVP: 0, ability: BeeAbility.Zephyr,
          upgradedBeeCount: 0, upgradedBeeVP: 2, upgradedAbility: BeeAbility.Zephyr});
        break;
    }    
    const bee1 = playerSpace.create(BeeToken, 'bee-token-two-bee-' + i, {
      oneTimeUse: false, upgraded: false,
      beeCount: 2, beeVP: 0, ability: BeeAbility.None,
      upgradedBeeCount: 3, upgradedBeeVP: 1, upgradedAbility: BeeAbility.None});
    const bee2 = playerSpace.create(BeeToken, 'bee-token-zephyr-bee-' + i, {
      oneTimeUse: false, upgraded: false,
      beeCount: 2, beeVP: 0, ability: BeeAbility.ZephyrAndApiary,
      upgradedBeeCount: 2, upgradedBeeVP: 1, upgradedAbility: BeeAbility.Zephyr});
    const bee3 = playerSpace.create(BeeToken, 'bee-token-roll-bee-' + i, {
      oneTimeUse: false, upgraded: false,
      beeCount: 1, beeVP: 0, ability: BeeAbility.RollDie,
      upgradedBeeCount: 1, upgradedBeeVP: 1, upgradedAbility: BeeAbility.ChooseDisc});

    bee1.player = player;
    bee2.player = player;
    bee3.player = player;

    // create apiary
    const lavender = playerSpace.create(ApiaryCard, 'apiary-card-lavender-' + i, {color: 'purple',type: FlowerType.Lavender});    
    lavender.create(ApiaryConvert, 'apiary-card-lavender-convert-' + i);
    const dandelion = playerSpace.create(ApiaryCard, 'apiary-card-dandelion-' + i, {color: 'yellow', type: FlowerType.Dandelion});
    dandelion.create(ApiaryConvert, 'apiary-card-dandelion-convert-' + i);
    const mint = playerSpace.create(ApiaryCard, 'apiary-card-mint-' + i, {color: 'green', type: FlowerType.Mint});
    mint.create(ApiaryConvert, 'apiary-card-mint-convert-' + i);
  }

  // create the honey
  const honeyDeck = game.create(Space, 'honeyDeck');
  honeyDeck.create(HoneyCard, 'honey-card-1', {type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint, FlowerType.Mint, FlowerType.Mint, FlowerType.Mint], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-2', {type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint, FlowerType.Mint, FlowerType.Mint, FlowerType.Dandelion], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-3', {type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender, FlowerType.Lavender, FlowerType.Lavender, FlowerType.Mint], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-4', {type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender, FlowerType.Lavender, FlowerType.Lavender, FlowerType.Dandelion], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-5', {type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint, FlowerType.Mint, FlowerType.Mint, FlowerType.Lavender], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-6', {type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint, FlowerType.Mint, FlowerType.Dandelion, FlowerType.Dandelion], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-7', {type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint, FlowerType.Mint, FlowerType.Mint, FlowerType.Lavender], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-8', {type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Lavender, FlowerType.Mint], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-9', {type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Lavender, FlowerType.Lavender], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-10', {type: FlowerType.None, cost: [FlowerType.Mint, FlowerType.Mint, FlowerType.Lavender, FlowerType.Lavender, FlowerType.Dandelion], scoring: HoneyScoring.VP4});
  honeyDeck.create(HoneyCard, 'honey-card-11', {type: FlowerType.None, cost: [FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Lavender, FlowerType.Lavender, FlowerType.Mint], scoring: HoneyScoring.VP4});
  honeyDeck.create(HoneyCard, 'honey-card-12', {type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Lavender, FlowerType.Mint], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-13', {type: FlowerType.None, cost: [FlowerType.Mint, FlowerType.Mint, FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Lavender], scoring: HoneyScoring.VP4});
  honeyDeck.create(HoneyCard, 'honey-card-14', {type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint, FlowerType.Mint, FlowerType.Lavender, FlowerType.Dandelion], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-15', {type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender, FlowerType.Lavender, FlowerType.Mint, FlowerType.Mint], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-16', {type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender, FlowerType.Lavender, FlowerType.Dandelion, FlowerType.Dandelion], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-17', {type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Mint], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-18', {type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Lavender], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-19', {type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender, FlowerType.Lavender, FlowerType.Mint, FlowerType.Dandelion], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-20', {type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Dandelion, FlowerType.Dandelion], scoring: HoneyScoring.VP3_7_12});
  honeyDeck.create(HoneyCard, 'honey-card-21', {type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender, FlowerType.Lavender, FlowerType.Lavender, FlowerType.Lavender], scoring: HoneyScoring.VP3_7_12});

  honeyDeck.shuffle();

  for(let i = 0; i < game.players.length + 1; i++) {
    game.drawHoneyCard().putInto($.honey);
  }

  // game.drawHoneyCard().putInto(game.players[0].space);
  // game.drawHoneyCard().putInto(game.players[0].space);
  // game.drawHoneyCard().putInto(game.players[0].space);

  // create the rest of the flowers
  const flowerDeck = game.create(Space, 'flowerDeck');
  flowerDeck.create(FlowerCard, 'flower-card-1', {ability: FlowerAbility.Send2YellowApiary, scoring: FlowerScoring.VP1, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-2', {ability: FlowerAbility.Send2GreenApiary, scoring: FlowerScoring.VP1, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-3', {ability: FlowerAbility.Send2PurpleApiary, scoring: FlowerScoring.VP1, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-4', {ability: FlowerAbility.RollAndGainYellow, scoring: FlowerScoring.None, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-5', {ability: FlowerAbility.RollAndGainYellow, scoring: FlowerScoring.None, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-6', {ability: FlowerAbility.DandelionHoney2Less, scoring: FlowerScoring.PerDandelionHoneyVP1, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-7', {ability: FlowerAbility.MintHoney2Less, scoring: FlowerScoring.PerMintHoneyVP1, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-8', {ability: FlowerAbility.LavenderHoney2Less, scoring: FlowerScoring.PerLavenderHoneyVP1, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-9', {ability: FlowerAbility.GreenOrPurple, scoring: FlowerScoring.VP2, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-10', {ability: FlowerAbility.GreenOrPurple, scoring: FlowerScoring.VP2, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-11', {ability: FlowerAbility.AnyForLavender, scoring: FlowerScoring.Per3LavenderVP2, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-12', {ability: FlowerAbility.AnyForDandelion, scoring: FlowerScoring.Per3DandelionVP2, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-13', {ability: FlowerAbility.AnyForMint, scoring: FlowerScoring.Per3MintVP2, type: FlowerType.Dandelion, cost: [FlowerType.Dandelion, FlowerType.Dandelion]});

  flowerDeck.create(FlowerCard, 'flower-card-14', {ability: FlowerAbility.Send2YellowApiary, scoring: FlowerScoring.VP1, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-15', {ability: FlowerAbility.Send2GreenApiary, scoring: FlowerScoring.VP1, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-16', {ability: FlowerAbility.Send2PurpleApiary, scoring: FlowerScoring.VP1, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-17', {ability: FlowerAbility.RollAndGainGreen, scoring: FlowerScoring.None, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-18', {ability: FlowerAbility.RollAndGainGreen, scoring: FlowerScoring.None, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-19', {ability: FlowerAbility.DandelionHoney2Less, scoring: FlowerScoring.PerDandelionHoneyVP1, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-20', {ability: FlowerAbility.MintHoney2Less, scoring: FlowerScoring.PerMintHoneyVP1, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-21', {ability: FlowerAbility.LavenderHoney2Less, scoring: FlowerScoring.PerLavenderHoneyVP1, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-22', {ability: FlowerAbility.YellowOrPurple, scoring: FlowerScoring.VP2, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-23', {ability: FlowerAbility.YellowOrPurple, scoring: FlowerScoring.VP2, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-24', {ability: FlowerAbility.AnyForLavender, scoring: FlowerScoring.Per3LavenderVP2, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-25', {ability: FlowerAbility.AnyForDandelion, scoring: FlowerScoring.Per3DandelionVP2, type: FlowerType.Mint, cost: [FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-26', {ability: FlowerAbility.AnyForMint, scoring: FlowerScoring.Per3MintVP2, type: FlowerType.Mint, cost: [FlowerType.Mint, FlowerType.Mint]});

  flowerDeck.create(FlowerCard, 'flower-card-27', {ability: FlowerAbility.Send2YellowApiary, scoring: FlowerScoring.VP1, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-28', {ability: FlowerAbility.Send2GreenApiary, scoring: FlowerScoring.VP1, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-29', {ability: FlowerAbility.Send2PurpleApiary, scoring: FlowerScoring.VP1, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-30', {ability: FlowerAbility.RollAndGainPurple, scoring: FlowerScoring.None, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-31', {ability: FlowerAbility.RollAndGainPurple, scoring: FlowerScoring.None, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-32', {ability: FlowerAbility.DandelionHoney2Less, scoring: FlowerScoring.PerDandelionHoneyVP1, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-33', {ability: FlowerAbility.MintHoney2Less, scoring: FlowerScoring.PerMintHoneyVP1, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-34', {ability: FlowerAbility.LavenderHoney2Less, scoring: FlowerScoring.PerLavenderHoneyVP1, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-35', {ability: FlowerAbility.GreenOrYellow, scoring: FlowerScoring.VP2, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-36', {ability: FlowerAbility.GreenOrYellow, scoring: FlowerScoring.VP2, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-37', {ability: FlowerAbility.AnyForLavender, scoring: FlowerScoring.Per3LavenderVP2, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-38', {ability: FlowerAbility.AnyForDandelion, scoring: FlowerScoring.Per3DandelionVP2, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});
  flowerDeck.create(FlowerCard, 'flower-card-39', {ability: FlowerAbility.AnyForMint, scoring: FlowerScoring.Per3MintVP2, type: FlowerType.Lavender, cost: [FlowerType.Lavender, FlowerType.Lavender]});

  flowerDeck.create(FlowerCard, 'flower-card-40', {ability: FlowerAbility.None, scoring: FlowerScoring.EndGoals, wild: true, type: FlowerType.None, cost: [FlowerType.Lavender, FlowerType.Mint]});
  flowerDeck.create(FlowerCard, 'flower-card-41', {ability: FlowerAbility.None, scoring: FlowerScoring.EndGoals, wild: true, type: FlowerType.None, cost: [FlowerType.Lavender, FlowerType.Dandelion]});
  flowerDeck.create(FlowerCard, 'flower-card-42', {ability: FlowerAbility.None, scoring: FlowerScoring.EndGoals, wild: true, type: FlowerType.None, cost: [FlowerType.Dandelion, FlowerType.Mint]});

  flowerDeck.shuffle();

  for(let r = 1; r <= 3; r++) {
    for(let c = 1; c <= 3; c++) {    
      game.drawFlowerCard().putInto(game.first(FieldSpace, {row: r, column: c})!);
    }
  }

  const die = game.create(D6, 'flowerDie');

  // set up the arrangement goals
  const arrangementDeck = game.create(Space, 'arrangementDeck');
  arrangementDeck.create(ArrangementCard, 'dandelion-base', {scoring: ArrangementScoring.DandelionBase});
  arrangementDeck.create(ArrangementCard, 'layered-nectar', {scoring: ArrangementScoring.LayeredNectar});
  arrangementDeck.create(ArrangementCard, 'flower-pairing', {scoring: ArrangementScoring.FlowerPairing});
  arrangementDeck.create(ArrangementCard, 'lavender-rows', {scoring: ArrangementScoring.LavenderRows});
  arrangementDeck.create(ArrangementCard, 'under-bloom', {scoring: ArrangementScoring.UnderBloom});
  arrangementDeck.create(ArrangementCard, 'angled-planting', {scoring: ArrangementScoring.AngledPlanting});
  arrangementDeck.create(ArrangementCard, 'mint-massing', {scoring: ArrangementScoring.MintMassing});
  arrangementDeck.create(ArrangementCard, 'mixed-forage', {scoring: ArrangementScoring.MixedForage});
  arrangementDeck.create(ArrangementCard, 'garden-abundance', {scoring: ArrangementScoring.GardenAbundance});

  arrangementDeck.shuffle();
  arrangementDeck.topN(3, ArrangementCard).forEach(x => {
    x.faceUp = true;
    x.putInto($.arrangements);
  });
}

export default createGame(BeeGamePlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, whileLoop, eachPlayer, forEach, ifElse } = game.flowCommands;

  setupGame(game);

  game.defineActions({
    chooseDiscColor: (player) => action<{colors: FlowerType[]}>({
      prompt: "Choose Disc Color",
    }).chooseFrom(
      "choice", ({colors}) => colors,
      { skipIf: 'never'}
    ).do(({choice}) => {
      switch(choice) {
        case FlowerType.Mint:
          $.pool.first(Disc, {type: FlowerType.Mint})!.putInto(player.space.first(DiscSpace)!);
          break;
        case FlowerType.Dandelion:
          $.pool.first(Disc, {type: FlowerType.Dandelion})!.putInto(player.space.first(DiscSpace)!);
          break;
        case FlowerType.Lavender:
          $.pool.first(Disc, {type: FlowerType.Lavender})!.putInto(player.space.first(DiscSpace)!);
          break;  
      }

      game.message(`{{player}} gained a {{choice}} from the supply.`, {player: player, choice: choice});
    }),

    chooseBeeToken: (player) => action({
      prompt: "Choose Bee Token"
    }).chooseOnBoard(
      'token', player.space.all(BeeToken).filter(x => x.beeCount > 0),
      { skipIf: 'never' }
    ).do(({ token }) => {
      game.followUp({name: 'chooseBeeSpace', args: { token: token }});
    }),

    chooseBeeSpace: (player) => action<{token: BeeToken}>({
      prompt: "Choose Bee Space"
    }).chooseOnBoard(
      'space', game.all(BeeSpace).filter(x => x.all(BeeToken, {player: player}).length == 0),
      { skipIf: 'never' }
    ).do(({ token, space }) => {
      if(space.all(BeeToken).length > 0) {
        const currentBee = space.first(BeeToken)!;
        if(currentBee.player != null) {
          currentBee.putInto(currentBee.player.space);
        } else {
          currentBee.putInto($.pool);
        }
      }
      token.putInto(space); 
      player.beePlayed = token;

      token.performAbility(player);

      // figure out which flowers the bees map to
      let discs = [];
      for(let i = 0; i < token.beeCount; i++) {
        switch(space.side) {
          case BeeSpaceSide.Top:
            discs.push(game.first(FieldSpace, {row: 1+i, column: space.index})!.first(FlowerCard)!.first(Disc)!);
            break;
          case BeeSpaceSide.Bottom:
            discs.push(game.first(FieldSpace, {row: 3-i, column: space.index})!.first(FlowerCard)!.first(Disc)!);
            break;
          case BeeSpaceSide.Left:
            discs.push(game.first(FieldSpace, {row: space.index, column: 1+i})!.first(FlowerCard)!.first(Disc)!);
            break;
          case BeeSpaceSide.Right:
            discs.push(game.first(FieldSpace, {row: space.index, column: 3-i})!.first(FlowerCard)!.first(Disc)!);
            break;
        }   
      }

      discs.forEach(d => {
        d.putInto(player.space.first(DiscSpace)!);
      })

      game.message(`{{player}} placed their {{token}} and gained {{discs}} from the supply.`, 
        {player: player, token: token, discs: discs});
    }),

    chooseDiscForFlower: (player) => action<{flower: FlowerCard}>({
      prompt: "Choose Disc"
    }).chooseOnBoard(
      'disc', player.space.first(DiscSpace)!.all(Disc),
      { skipIf: 'never' }
    ).do(({ disc, flower }) => {
      disc.putInto($.pool);
      game.message(`{{player}} payed {{disc}}.`, {player: player, disc: disc});
      game.followUp({name: 'plantFlower', args: {flower: flower, ignoreCost: true}});
    }),

    purchaseFlower: (player) => action({
      prompt: "Purchase Flower",
      condition: player.canUseDisc(2)
    }).chooseOnBoard(
      'flower', $.field.all(FlowerCard).filter(x => x.all(Disc).length == 0 && player.canAffordFlower(x)),
      { skipIf: 'never' }
    ).do(({ flower }) => {
      game.followUp({name: 'plantFlower', args: {flower: flower, ignoreCost: false}});
    }),

    purchaseFlowerByType: (player) => action<{type: FlowerType}>({
      prompt: "Purchase Flower",
      condition: player.canUseDisc(1)
    }).chooseOnBoard(
      'flower', ({type}) => $.field.all(FlowerCard, {type: type}).filter(x => x.all(Disc).length == 0),
      { skipIf: 'never' }
    ).do(({ flower }) => {
      game.followUp({name: 'chooseDiscForFlower', args: {flower}});
    }),

    plantFlower: (player) => action<{flower: FlowerCard, ignoreCost: boolean}>({
      prompt: "Plant Flower",
    }).chooseOnBoard(
      // is the requirement for only 4 per column necessary?
      'column', player.space.all(FlowerColumn).filter(x => x.all(FlowerCard).length < 4).flatMap(x => x.last(FlowerCard)!),
      { skipIf: 'never' }
    ).do(({ column, flower, ignoreCost }) => {
      if(!ignoreCost) {
        let discs: Disc[] = [];
        flower.cost.forEach(x => {
          const disc = player.space.first(DiscSpace)!.first(Disc, {type: x})!;
          discs.push(disc);
          disc.putInto($.pool);
        });
        game.message(`{{player}} payed {{discs}}.`, {player: player, discs: discs});
      }
      
      const columns = player.space.all(FlowerColumn);
      const minBefore = Math.min(columns[0].all(FlowerCard).length, columns[1].all(FlowerCard).length, columns[2].all(FlowerCard).length)
      flower.putInto(column.container(FlowerColumn)!);
      // flower.putInto(column);
      const minAfter = Math.min(columns[0].all(FlowerCard).length, columns[1].all(FlowerCard).length, columns[2].all(FlowerCard).length)

      // check for full row
      if(minAfter > minBefore) {
        $.pool.first(BeeToken, {upgradedBeeVP: 3})!.putInto(player.space);
      }

      game.message(`{{player}} planted {{flower}} in the {{column}}.`,
        {player: player, flower: flower, column: column.container(FlowerColumn)!});

    }),

    fillApiary: (player) => action({
      prompt: "Fill Apiary"
    }).chooseOnBoard(
      'apiary', player.space.all(ApiaryCard).filter(x => x.all(Disc).length < 4),
      { skipIf: 'never' }
    ).do(({ apiary }) => {
      game.followUp({name: 'chooseDiscForApiary', args: {apiary}});
    }),

    chooseColorForApiary: (player) => action<{apiary: ApiaryCard}>({
      prompt: "Choose Disc Colors",
    }).chooseFrom(
      "choice", [FlowerType.Mint, FlowerType.Dandelion, FlowerType.Lavender],
    ).do(({choice, apiary}) => {
      game.sendDiscToApiary(choice, apiary);
      game.message(`{{player}} sent {{disc}} to {{apiary}} from the supply.`, {player: player, disc: choice, apiary: apiary});
    }),

    choose2ColorsForApiary: (player) => action<{apiary: ApiaryCard}>({
      prompt: "Choose Disc Colors",
    }).chooseGroup({
      disc1: ['select', [FlowerType.Mint, FlowerType.Dandelion, FlowerType.Lavender]],
      disc2: ['select', [FlowerType.Mint, FlowerType.Dandelion, FlowerType.Lavender]],
    }).do(({disc1, disc2, apiary}) => {
      [disc1, disc2].forEach(choice => { 
        game.sendDiscToApiary(choice, apiary);
      });
      game.message(`{{player}} sent {{discs}} to {{apiary}} from the supply.`, {player: player, discs: [disc1, disc2], apiary: apiary});
    }),

    chooseDiscForApiary: (player) => action<{apiary: ApiaryCard}>({
      prompt: "Choose Discs"
    }).chooseOnBoard(
      'disc', player.space.first(DiscSpace)!.all(Disc), 
        //game.uniqueDiscsByType(player.space.first(DiscSpace)!.all(Disc)),
      { min: 1, max: ({apiary}) => 4 - apiary.all(Disc).length  }
    ).do(({ disc, apiary }) => {
      disc.forEach(x => x.putInto(apiary));
      player.placedInApiary = true;
      game.message(`{{player}} placed {{discs}} in {{apiary}}.`, {player: player, discs: disc, apiary: apiary});
    }),

    activateFlower: (player) => action({
      prompt: "Activate Flower",
      condition: player.canUseDisc(1)
    }).chooseOnBoard(
      'flower', player.space.all(FlowerCard).filter(x => x.all(Disc).length == 0 && player.space.first(DiscSpace)!.all(Disc, {type: x.type}).length > 0),
      { skipIf: 'never' }
    ).do(({ flower }) => {
      player.space.first(DiscSpace)!.first(Disc, {type: flower.type})!.putInto(flower);
      flower.performAbility(player);

      game.message(`{{player}} activated {{flower}}}.`, {player: player, flower: flower});
    }),

    recallBees: (player) => action({
      prompt: "Recall Bees",
      condition: game.all(BeeSpace).all(BeeToken, {player: player}).length > 0
    }).do(() => {
      game.all(BeeSpace).all(BeeToken, {player: player}).putInto(player.space);
      player.space.all(FlowerCard).all(Disc).putInto($.pool);
      player.rollDie();

      game.message(`{{player}} recalled their bees.`, {player: player});
    }),

    purchaseHoney: (player) => action({
      prompt: "Purchase Honey",
    }).chooseOnBoard(
      'honey', $.honey.all(HoneyCard).concat($.honeyDeck.bottom(HoneyCard)!).filter(x => player.canAffordHoney(x)),
      { skipIf: 'never' }
    ).do(({ honey }) => {
      game.followUp({name: 'emptyApiary', args: {honey: honey}});
    }),

    emptyApiary: (player) => action<{honey: HoneyCard}>({
      prompt: "Choose Apiary",
    }).chooseOnBoard(
      'apiary', ({honey}) => player.space.all(ApiaryCard).filter(x => player.apiaryCanAffordHoney(x, honey)),
      { skipIf: 'only-one' }
    ).do(({ honey, apiary }) => {
      honey.putInto(player.space);

      // honey.rotation = 270;
      apiary.all(Disc).putInto($.pool);
      if(!honey.faceUp) {
        honey.rot = true;
      } else {
        if(player.space.all(BeeToken, {upgraded: false})
          .concat(game.all(BeeSpace).all(BeeToken, {player: player, upgraded: false})).length > 0) {
            game.followUp({name: 'upgradeBeetoken'});
        }
      }    

      game.message(`{{player}} emptied their {{apiary}} to make {{honey}}.`, 
        {player: player, apiary: apiary, honey: honey});
    }),

    upgradeBeetoken: (player) => action({
      prompt: "Choose Bee to Upgrade",
    }).chooseOnBoard(
      'bee', player.space.all(BeeToken, {upgraded: false})
        .concat(game.all(BeeSpace).all(BeeToken, {player: player, upgraded: false})),
      { skipIf: 'never' }
    ).do(({ bee }) => {
      bee.upgraded = true;
      bee.beeCount = bee.upgradedBeeCount;
      bee.ability = bee.upgradedAbility;
      bee.beeVP = bee.upgradedBeeVP;

      game.message(`{{player}} upgraded a bee to {{bee}}.`, {player: player, bee: bee});
    }),

    finishTurn: (player) => action({
      prompt: "Finish Turn"
    }).chooseFrom(
      "choice", ['Done'],
      { skipIf: 'never'}
    ).do(() => {
      // do nothing
      game.message(`{{player}} ended their turn.`, {player: player});
    }),

    chooseWildflowerType: (player) => action<{wildflower: FlowerCard}>({
      prompt: "Choose Wildflower Type for " + game.nextArranementName
    }).chooseFrom(
      "choice", [FlowerType.Mint, FlowerType.Dandelion, FlowerType.Lavender],
      { skipIf: 'never'}
    ).do(({choice, wildflower}) => {
       wildflower.type = choice;
    }),

    convertDiscs: (player) => action({
      prompt: "Convert Apiary Discs"
    }).chooseOnBoard(
      'converter', player.space.all(ApiaryConvert).filter(x => x.container(ApiaryCard)!.all(Disc).length >= 2),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'discs', ({converter}) => converter.container(ApiaryCard)!.all(Disc),
      { number: 2 }
    ).do(({converter, discs}) => {
       discs.forEach(x => x.putInto(($.pool)));
       game.message(`{{player}} converted {{discs}}.`, {player: player, discs: discs});

       game.followUp({name: 'chooseColorForApiary', args: {apiary: converter.container(ApiaryCard)!, count: 1}})
    }),

  });

  game.defineFlow(
    whileLoop({while: () => !game.gameOver, do: ([
      eachPlayer({
        name: 'turn', do: [
          ({turn}) => turn.reset(),
          playerActions({ actions: ['chooseBeeToken', 'recallBees']}),
          whileLoop({while: ({turn}) => turn.space.first(DiscSpace)!.all(Disc).length > 0, do: ([
            playerActions({ actions: ['purchaseFlower', 'fillApiary', 'activateFlower', 'convertDiscs'] }),
          ])}),

          playerActions({ actions: ['purchaseHoney', 'convertDiscs', 'finishTurn'] }),

          // refill the field
          () => game.refillField(),

          // refill the honey
          () => game.refillHoney(),

          ({turn}) => turn.setScore(),
        ],        
      }),
      () => game.checkForGameEnd(),        
    ])}),    

    // players with wild flowers need to choose their types
    eachPlayer({
      name: 'turn', do: [
        ({turn}) => turn.setBaseScore(),
        forEach({ name: 'arrangement', collection: () => $.arrangements.all(ArrangementCard), do: [
          forEach({ name: 'flower', collection: ({turn}) => turn.space.all(FlowerCard, {wild: true}), do: [
            ({arrangement}) => game.nextArranementName = arrangement.scoring,
            ({flower}) => game.followUp({name: 'chooseWildflowerType', args: {wildflower: flower}}),
          ]}),
          ({turn, arrangement}) => turn.addArrangementScore(arrangement, true),
        ]}),
      ],
    }),

    () => game.announceWinner(),
  );
});
