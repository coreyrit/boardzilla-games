import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';

export enum BlanketColor {
  White = 'white',
  Black = 'black',
  Gold = 'gold',
}

export enum BlanketAction {
  RotateNear,
  RotateFar,
  RotateOuter,
  RotateInner,
  SwapNear,
  SwapFar,
  SwapOuter,
  SwapInner,
  Gold
}

export class BlanketCard extends Piece<SmokeSignalsGame> {
  color!: BlanketColor;
  action: BlanketAction;
}

export class FireCard extends Piece<SmokeSignalsGame> {
  action: FireCardAction;
}

export class SmokeCard extends Piece<SmokeSignalsGame> {
  color: SmokeColor;
}

export class GoalCard extends Piece<SmokeSignalsGame> {

}

type SmokeSnapshot = {
  name: string;
  position: number;
  rotation: number;
};

export class SmokeSignalsPlayer extends Player<SmokeSignalsGame, SmokeSignalsPlayer> {

}

export class SmokeSignalsGame extends Game<SmokeSignalsGame, SmokeSignalsPlayer> {
  phase: 'placement' | 'reveal' | 'done' = 'placement';
  currentRevealEdge?: string;
  pendingGoldAction?: string;
  challengeNumber: number;
  goalSatisfied?: boolean;
  initialSmokeState?: SmokeSnapshot[];
  attempts = 0;
  readonly maxAttempts = 3;

  placedBlankets() {
    return this.all(FireEdge).all(BlanketCard).length;
  }

  revealOrder() {
    return [1, 2, 3, 4].flatMap(index => [
      this.first(FireEdge, { edge: Edge.Top, index }),
      this.first(FireEdge, { edge: Edge.Bottom, index }),
    ]).filter((edge): edge is FireEdge => !!edge);
  }

  revealPlayerForEdge(edge: FireEdge) {
    return edge.edge === Edge.Bottom ? this.players[0] : this.players[1];
  }

  currentRevealEdgeSpace() {
    return this.currentRevealEdge
      ? this.all(FireEdge).find(edge => edge.name === this.currentRevealEdge)
      : undefined;
  }

  queueGoldAction(actionName: string) {
    this.pendingGoldAction = actionName;
  }

  clearPendingGoldAction() {
    this.pendingGoldAction = undefined;
  }

  playerSpace(player: SmokeSignalsPlayer) {
    return this.first(PlayerSpace, { player });
  }

  edgeSideForPlayer(player: SmokeSignalsPlayer) {
    return player === this.players[0] ? Edge.Bottom : Edge.Top;
  }

  edgeCardsForPlayer(player: SmokeSignalsPlayer) {
    const edge = this.edgeSideForPlayer(player);

    return this.all(FireEdge)
      .filter(space => space.edge === edge)
      .sort((a, b) => a.index - b.index)
      .flatMap(space => space.all(BlanketCard));
  }

  snapshotSmokes() {
    this.initialSmokeState = this.smokeCards()
      .map(card => ({
        name: card.name,
        position: card.position(),
        rotation: card.rotation ?? 0,
      }))
      .sort((a, b) => a.position - b.position);
  }

  resetSmokes() {
    this.initialSmokeState?.forEach(({ name, position, rotation }) => {
      const smoke = this.first(SmokeCard, { name });

      if (!smoke) {
        return;
      }

      smoke.rotation = rotation;
      smoke.putInto(this, { position });
    });
  }

  prepareNextRound() {
    this.players.forEach(player => {
      const space = this.playerSpace(player);

      if (!space) {
        return;
      }

      this.edgeCardsForPlayer(player).forEach(card => {
        card.putInto(space);
      });
    });

    this.resetSmokes();
    this.currentRevealEdge = undefined;
    this.clearPendingGoldAction();
    this.goalSatisfied = false;
    this.phase = 'placement';
  }

  goalCard() {
    return this.first(GoalCard);
  }

  rotateSmoke(card: SmokeCard) {
    card.rotation = card.rotation == 0 ? 90 : 0;
  }

  smokeCards() {
    return this.all(SmokeCard);
  }

  swapSmoke(card1: SmokeCard, card2: SmokeCard) {
    const container = card1.container();

    if (!container || container !== card2.container()) {
      return;
    }

    const pos1 = card1.position();
    const pos2 = card2.position();

    if (pos1 === pos2) {
      return;
    }

    if (pos1 < pos2) {
      card2.putInto(container, { position: pos1 });
      card1.putInto(container, { position: pos2 });
      return;
    }

    card1.putInto(container, { position: pos2 });
    card2.putInto(container, { position: pos1 });
  }

  performBlanketAction(card: BlanketCard) {
    const smokes = this.smokeCards();

    switch(card.action) {
      case BlanketAction.RotateNear:
        this.rotateSmoke(smokes[0]);
        this.rotateSmoke(smokes[1]);
        break;
      case BlanketAction.RotateFar:
        this.rotateSmoke(smokes[2]);
        this.rotateSmoke(smokes[3]);
        break;
      case BlanketAction.RotateOuter:
        this.rotateSmoke(smokes[0]);
        this.rotateSmoke(smokes[3]);
        break;
      case BlanketAction.RotateInner:
        this.rotateSmoke(smokes[1]);
        this.rotateSmoke(smokes[2]);
        break;
      case BlanketAction.SwapNear:
        this.swapSmoke(smokes[0], smokes[1]);
        break;
      case BlanketAction.SwapFar:
        this.swapSmoke(smokes[2], smokes[3]);
        break;
      case BlanketAction.SwapOuter:
        this.swapSmoke(smokes[0], smokes[3]);
        break;
      case BlanketAction.SwapInner:
        this.swapSmoke(smokes[1], smokes[2]);
        break;
      case BlanketAction.Gold:
        const fireCard = this.game.all(FireCard)[card.container(FireEdge)!.index - 1];
        switch(fireCard.action) {
          case FireCardAction.SwapRed:
            this.queueGoldAction('swapRedSmoke');
            break;
          case FireCardAction.SwapOrange:
            this.queueGoldAction('swapOrangeSmoke');
            break;
          case FireCardAction.SwapYellow:
            this.queueGoldAction('swapYellowSmoke');
            break;
          case FireCardAction.SwapGreen:
            this.queueGoldAction('swapGreenSmoke');
            break;
          case FireCardAction.RotateBlack:
            this.queueGoldAction('rotateBlackCloud');
            break;
          case FireCardAction.RotateWhite:
            this.queueGoldAction('rotateWhiteCloud');
            break;
          case FireCardAction.Repeat:
            this.queueGoldAction('repeatBlanketAction');
            break;
          case FireCardAction.Peek:
            this.queueGoldAction('peekBlanket');
            break;
        }
    }
  }

  revealEdge(edge: FireEdge) {
    this.phase = 'reveal';
    this.currentRevealEdge = edge.name;
    edge.all(BlanketCard).showToAll();
    this.message('Reveal {{edge}}.', { edge });
    this.addDelay();

    if(edge.all(BlanketCard).length == 1) {
      this.performBlanketAction(edge.first(BlanketCard)!);
    }
  }
}

export enum Edge {
  Top,
  Bottom
}

export enum Restriction {
  None,
  Black,
  White,
  TwoCards,
  NoGold
}

export enum FireCardAction {
  SwapRed,
  SwapOrange,
  SwapYellow,
  SwapGreen,
  RotateBlack,
  RotateWhite,
  Repeat,
  Peek
}

export enum SmokeColor {
  Red,
  Orange,
  Yellow,
  Green
}

export class FireEdge extends Space<SmokeSignalsGame, SmokeSignalsPlayer> {
  edge: Edge;
  index: number;
  restriction: Restriction = Restriction.None;
 
 
  public blanketAllowed(card: BlanketCard) : boolean {
    const sideEdges = this.game.all(FireEdge, { edge: this.edge });
    const currentRestriction = this.restriction;

    // first make sure there's no more than 4 on this side
    if (sideEdges.all(BlanketCard).length > 4) {
      return false;
    }
    // no edge can have more than 2 cards
    if (this.all(BlanketCard).length >= 2) {
      return false;
    }
    // only 1 edge card can have 2 cards
    if (sideEdges.filter(x => x.all(BlanketCard).length === 2).length === 1 &&
       this.all(BlanketCard).length === 1) {
      return false;
    }
    // if this is the last remaining black card, it can only go to black
    if(this.game.all(FireEdge).all(BlanketCard, { color: BlanketColor.Black }).length == 3 && 
      this.game.all(FireEdge, {restriction: Restriction.Black}).length != 0 &&
      this.game.first(FireEdge, {restriction: Restriction.Black})!.all(BlanketCard).length == 0 &&
       card.color == BlanketColor.Black && this.restriction != Restriction.Black) {
        return false;
    }
    // if this is the last white black card, it can only go to white
    if(this.game.all(FireEdge).all(BlanketCard, { color: BlanketColor.White }).length == 3 && 
      this.game.all(FireEdge, {restriction: Restriction.White}).length != 0 &&
      this.game.first(FireEdge, {restriction: Restriction.White})!.all(BlanketCard).length == 0 &&
       card.color == BlanketColor.White && this.restriction != Restriction.White) {
        return false;
    }
    // white and black restrictions only allow a single card 
    if ((currentRestriction === Restriction.Black || currentRestriction === Restriction.White) &&
      this.all(BlanketCard).length === 1) {
        return false;      
    }
    // check black requirement
    if (currentRestriction === Restriction.Black && card.color !== BlanketColor.Black) {
      return false;
    }
    // check white requirement    
    if (currentRestriction === Restriction.White && card.color !== BlanketColor.White) {
      return false;
    }
    // check no gold requirement
    if (currentRestriction === Restriction.NoGold && card.color === BlanketColor.Gold) {
      return false;
    }
    // check two card requirement
    // this is tricky - basically nothing BUT the 2 card location is allowed once
    // a side has 4 cards on it
    if (sideEdges.all(BlanketCard).length === 4 &&
       sideEdges.filter(edge => edge.restriction === Restriction.TwoCards).length === 1 &&
       currentRestriction !== Restriction.TwoCards) {
      return false;
    } 

    // else it's allowed
    return true;
  }
}

export class PlayerSpace extends Space<SmokeSignalsGame, SmokeSignalsPlayer> {
  player: SmokeSignalsPlayer;
}

export class GoalSpace extends Space<SmokeSignalsGame, SmokeSignalsPlayer> {

}

function createOwnedBlanketCard(
  space: PlayerSpace,
  owner: SmokeSignalsPlayer | undefined,
  name: string,
  color: BlanketColor,
  action: BlanketAction
) {
  const card = space.create(BlanketCard, name, { color: color, action: action });

  if (owner) {
    card.showOnlyTo(owner);
  }

  return card;
}

function nextTopEdgeIndex(game: SmokeSignalsGame) : number {
  return game.all(FireEdge, { edge: Edge.Top }).length + 1;
}
function nextBottomEdgeIndex(game: SmokeSignalsGame) : number {
  return game.all(FireEdge, { edge: Edge.Bottom }).length + 1;
}

function createA1(game: SmokeSignalsGame) {
  game.create(FireCard, 'fire-card-a1', {action: FireCardAction.SwapRed});
  game.create(FireEdge, 'fireEdgeTop' + nextTopEdgeIndex(game), { edge: Edge.Top, index: nextTopEdgeIndex(game), restriction: Restriction.Black });
  game.create(FireEdge, 'fireEdgeBottom' + nextBottomEdgeIndex(game), { edge: Edge.Bottom, index: nextBottomEdgeIndex(game) });
}
function createB1(game: SmokeSignalsGame) {
  game.create(FireCard, 'fire-card-b1', {action: FireCardAction.SwapOrange});
  game.create(FireEdge, 'fireEdgeTop' + nextTopEdgeIndex(game), { edge: Edge.Top, index: nextTopEdgeIndex(game) });
  game.create(FireEdge, 'fireEdgeBottom' + nextBottomEdgeIndex(game), { edge: Edge.Bottom, index: nextBottomEdgeIndex(game) });
}
function createB2(game: SmokeSignalsGame) {
  const b = game.create(FireCard, 'fire-card-b2', {action: FireCardAction.SwapOrange});
  b.rotation = 180;
  game.create(FireEdge, 'fireEdgeTop' + nextTopEdgeIndex(game), { edge: Edge.Top, index: nextTopEdgeIndex(game) });
  game.create(FireEdge, 'fireEdgeBottom' + nextBottomEdgeIndex(game), { edge: Edge.Bottom, index: nextBottomEdgeIndex(game) });
}
function createB3(game: SmokeSignalsGame) {
  game.create(FireCard, 'fire-card-b3', {action: FireCardAction.RotateBlack});
  game.create(FireEdge, 'fireEdgeTop' + nextTopEdgeIndex(game), { edge: Edge.Top, index: nextTopEdgeIndex(game) });
  game.create(FireEdge, 'fireEdgeBottom' + nextBottomEdgeIndex(game), { edge: Edge.Bottom, index: nextBottomEdgeIndex(game), restriction: Restriction.White });
}
function createC2(game: SmokeSignalsGame) {
  const c = game.create(FireCard, 'fire-card-c2', {action: FireCardAction.SwapYellow});
  c.rotation = 180;
  game.create(FireEdge, 'fireEdgeTop' + nextTopEdgeIndex(game), { edge: Edge.Top, index: nextTopEdgeIndex(game) });
  game.create(FireEdge, 'fireEdgeBottom' + nextBottomEdgeIndex(game), { edge: Edge.Bottom, index: nextBottomEdgeIndex(game) });
}
function createC4(game: SmokeSignalsGame) {
  const c = game.create(FireCard, 'fire-card-c4', {action: FireCardAction.Peek});
  c.rotation = 180;
  game.create(FireEdge, 'fireEdgeTop' + nextTopEdgeIndex(game), { edge: Edge.Top, index: nextTopEdgeIndex(game) });
  game.create(FireEdge, 'fireEdgeBottom' + nextBottomEdgeIndex(game), { edge: Edge.Bottom, index: nextBottomEdgeIndex(game) });
}
function createD3(game: SmokeSignalsGame) {
  const d = game.create(FireCard, 'fire-card-d3', {action: FireCardAction.Repeat});
  game.create(FireEdge, 'fireEdgeTop' + nextTopEdgeIndex(game), { edge: Edge.Top, index: nextTopEdgeIndex(game), restriction: Restriction.NoGold});
  game.create(FireEdge, 'fireEdgeBottom' + nextBottomEdgeIndex(game), { edge: Edge.Bottom, index: nextBottomEdgeIndex(game)});
}
function createD4(game: SmokeSignalsGame) {
  const d = game.create(FireCard, 'fire-card-d4', {action: FireCardAction.Repeat});
  d.rotation = 180;
  game.create(FireEdge, 'fireEdgeTop' + nextTopEdgeIndex(game), { edge: Edge.Top, index: nextTopEdgeIndex(game) });
  game.create(FireEdge, 'fireEdgeBottom' + nextBottomEdgeIndex(game), { edge: Edge.Bottom, index: nextBottomEdgeIndex(game), restriction: Restriction.NoGold});
}

function createRed(game: SmokeSignalsGame, black: boolean = false) {
  const card = game.create(SmokeCard, 'smoke-card-red', {color: SmokeColor.Red});
  if(black) {
    card.rotation = 90;
  }
}
function createYellow(game: SmokeSignalsGame, black: boolean = false) {
  const card = game.create(SmokeCard, 'smoke-card-yellow', {color: SmokeColor.Yellow});
  if(black) {
    card.rotation = 90;
  } 
}
function createOrange(game: SmokeSignalsGame, black: boolean = false) {
  const card = game.create(SmokeCard, 'smoke-card-orange', {color: SmokeColor.Orange });
  if(black) {
    card.rotation = 90;
  }
}
function createGreen(game: SmokeSignalsGame, black: boolean = false) {
  const card = game.create(SmokeCard, 'smoke-card-green', {color: SmokeColor.Green});
  if(black) {
    card.rotation = 90;
  }
}

function setupChallenge(game: SmokeSignalsGame, num: number) {
  game.challengeNumber = num;

  const goal = $.goalSpace.create(GoalCard, 'goal-' + num);
  goal.rotation = 90;

  switch(num) {
    case 1:
      createA1(game); createB3(game); createC2(game); createD4(game);
      createRed(game); createYellow(game); createOrange(game); createGreen(game);      
      break;
    case 2:
      createA1(game); createB1(game); createC2(game); createD3(game);
      createRed(game, true); createYellow(game); createOrange(game); createGreen(game, true);
      break;
    case 3:
      createB2(game); createA1(game); createD3(game); createC4(game);
      createYellow(game); createRed(game, true); createGreen(game); createOrange(game, true);
      break;
  }
}

function checkChallengeGoal(game: SmokeSignalsGame, num: number) : boolean {
  switch(num) {
    case 1:
      return game.all(SmokeCard).indexOf(game.first(SmokeCard, { color: SmokeColor.Green })!) <
             game.all(SmokeCard).indexOf(game.first(SmokeCard, { color: SmokeColor.Yellow })!) &&
              game.first(SmokeCard, { color: SmokeColor.Red })!.rotation === 90;
    case 2:
      return game.all(SmokeCard).indexOf(game.first(SmokeCard, { color: SmokeColor.Red })!) == 1 &&
              game.first(SmokeCard, { color: SmokeColor.Red })!.rotation === 0;
    case 3:
      return game.all(SmokeCard).indexOf(game.first(SmokeCard, { color: SmokeColor.Orange })!) == 0 &&
             game.all(SmokeCard).indexOf(game.first(SmokeCard, { color: SmokeColor.Red })!) == 3 &&
              game.all(SmokeCard, { rotation: 0 }).length == 2;
  }
  return false;
}

export default createGame(SmokeSignalsPlayer, SmokeSignalsGame, game => {
  const { action } = game;
  const { playerActions, eachPlayer, forLoop, whileLoop } = game.flowCommands;

  game.registerClasses(
    BlanketCard,
    FireCard,
    SmokeCard,
    FireEdge,
    PlayerSpace,
  );

  BlanketCard.revealWhenHidden('color');  

  game.create(GoalSpace, 'goalSpace');

  const playerSpace1 = game.create(PlayerSpace, 'playerSpace1', {player: game.players[0]});
  playerSpace1.onEnter(BlanketCard, card => card.showOnlyTo(game.players[0]));
  createOwnedBlanketCard(playerSpace1, game.players[0], 'blanket-card-1-white-far', BlanketColor.White, BlanketAction.SwapFar);
  createOwnedBlanketCard(playerSpace1, game.players[0], 'blanket-card-1-white-near', BlanketColor.White, BlanketAction.SwapNear);
  createOwnedBlanketCard(playerSpace1, game.players[0], 'blanket-card-1-gold', BlanketColor.Gold, BlanketAction.Gold);
  createOwnedBlanketCard(playerSpace1, game.players[0], 'blanket-card-1-black-inner', BlanketColor.Black, BlanketAction.RotateInner);
  createOwnedBlanketCard(playerSpace1, game.players[0], 'blanket-card-1-black-outer', BlanketColor.Black, BlanketAction.RotateOuter);

  const playerSpace2 = game.create(PlayerSpace, 'playerSpace2', {player: game.players[1]});
  playerSpace2.onEnter(BlanketCard, card => card.showOnlyTo(game.players[1]));
  createOwnedBlanketCard(playerSpace2, game.players[1], 'blanket-card-2-white-inner', BlanketColor.White, BlanketAction.SwapInner);
  createOwnedBlanketCard(playerSpace2, game.players[1], 'blanket-card-2-white-outer', BlanketColor.White, BlanketAction.SwapOuter);
  createOwnedBlanketCard(playerSpace2, game.players[1], 'blanket-card-2-gold', BlanketColor.Gold, BlanketAction.Gold);
  createOwnedBlanketCard(playerSpace2, game.players[1], 'blanket-card-2-black-far', BlanketColor.Black, BlanketAction.RotateFar);
  createOwnedBlanketCard(playerSpace2, game.players[1], 'blanket-card-2-black-near', BlanketColor.Black, BlanketAction.RotateNear);

  setupChallenge(game, game.setting("challengeNumber"));

  game.all(FireEdge).forEach(edge => {
    edge.onEnter(BlanketCard, card => card.hideFromAll());
  });

  game.defineActions({
    placeBlanketCard: (player) => action({
      prompt: "Choose Blanket Card"
    }).chooseOnBoard(
      'card', game.first(PlayerSpace, {player: player})!.all(BlanketCard),
      { skipIf: 'never' }
    ).chooseOnBoard(
      'space', ({card}) => game.all(FireEdge).filter(x => x.blanketAllowed(card)),
      { skipIf: 'never' }
    ).do(({ card, space }) => {
      card.putInto(space);
    }),
    revealCurrentEdge: () => action({
      prompt: 'Click the highlighted edge to reveal it.',
    }).chooseOnBoard(
      'edge',
      () => game.all(FireEdge).filter(edge => edge.name === game.currentRevealEdge),
      { skipIf: 'never' }
    ).do(({ edge }) => {
      game.revealEdge(edge);
    }),
    activateRevealedBlanket: () => action({
      prompt: 'Choose which revealed blanket activates.',
    }).chooseOnBoard(
      'card',
      () => game.currentRevealEdgeSpace()?.all(BlanketCard) ?? [],
      { skipIf: 'never' }
    ).do(({ card }) => {
      game.performBlanketAction(card);
      game.message('Activate {{card}}.', { card });
    }),
    swapRedSmoke: () => action({
      prompt: 'Choose smoke to swap with red.',
      condition: () => game.pendingGoldAction === 'swapRedSmoke',
    }).chooseOnBoard(
      'smoke',
      () => game.all(SmokeCard).filter(x => x.color != SmokeColor.Red),
      { skipIf: 'never' }
    ).do(({ smoke }) => {
      game.clearPendingGoldAction();
      game.swapSmoke(game.first(SmokeCard, {color: SmokeColor.Red})!, smoke);
      game.message('Activate Gold.');
    }),
    swapOrangeSmoke: () => action({
      prompt: 'Choose smoke to swap with orange.',
      condition: () => game.pendingGoldAction === 'swapOrangeSmoke',
    }).chooseOnBoard(
      'smoke',
      () => game.all(SmokeCard).filter(x => x.color != SmokeColor.Orange),
      { skipIf: 'never' }
    ).do(({ smoke }) => {
      game.clearPendingGoldAction();
      game.swapSmoke(game.first(SmokeCard, {color: SmokeColor.Orange})!, smoke);
      game.message('Activate Gold.');
    }),
    swapYellowSmoke: () => action({
      prompt: 'Choose smoke to swap with yellow.',
      condition: () => game.pendingGoldAction === 'swapYellowSmoke',
    }).chooseOnBoard(
      'smoke',
      () => game.all(SmokeCard).filter(x => x.color != SmokeColor.Yellow),
      { skipIf: 'never' }
    ).do(({ smoke }) => {
      game.clearPendingGoldAction();
      game.swapSmoke(game.first(SmokeCard, {color: SmokeColor.Yellow})!, smoke);
      game.message('Activate Gold.');
    }),
    swapGreenSmoke: () => action({
      prompt: 'Choose smoke to swap with green.',
      condition: () => game.pendingGoldAction === 'swapGreenSmoke',
    }).chooseOnBoard(
      'smoke',
      () => game.all(SmokeCard).filter(x => x.color != SmokeColor.Green),
      { skipIf: 'never' }
    ).do(({ smoke }) => {
      game.clearPendingGoldAction();
      game.swapSmoke(game.first(SmokeCard, {color: SmokeColor.Green})!, smoke);
      game.message('Activate Gold.');
    }),
    rotateWhiteCloud: () => action({
      prompt: 'Choose white cloud to rotate.',
      condition: () => game.pendingGoldAction === 'rotateWhiteCloud',
    }).chooseOnBoard(
      'smoke',
      () => game.all(SmokeCard, {rotation: 0}),
      { skipIf: 'never' }
    ).do(({ smoke }) => {
      game.clearPendingGoldAction();
      game.rotateSmoke(smoke);
      game.message('Activate Gold.');
    }),
    rotateBlackCloud: () => action({
      prompt: 'Choose black cloud to rotate.',
      condition: () => game.pendingGoldAction === 'rotateBlackCloud',
    }).chooseOnBoard(
      'smoke',
      () => game.all(SmokeCard, {rotation: 90}),
      { skipIf: 'never' }
    ).do(({ smoke }) => {
      game.clearPendingGoldAction();
      game.rotateSmoke(smoke);
      game.message('Activate Gold.');
    }),
    repeatBlanketAction: () => action({
      prompt: 'Choose a blanket card to repeat its action.',
      condition: () => game.pendingGoldAction === 'repeatBlanketAction',
    }).chooseOnBoard(
      'blanket',
      () => game.all(BlanketCard).filter(x => x.isVisible()),
      { skipIf: 'never' }
    ).do(({ blanket }) => {
      game.clearPendingGoldAction();
      game.message('Activate Gold.');
      game.performBlanketAction(blanket);
    }),
    peekBlanket: (player) => action({
      prompt: 'Choose a blanket card to peek.',
      condition: () => game.pendingGoldAction === 'peekBlanket',
    }).chooseOnBoard(
      'blanket',
      () => game.all(BlanketCard).filter(x => !x.isVisibleTo(player)),
      { skipIf: 'never' }
    ).do(({ blanket }) => {
      game.clearPendingGoldAction();
      game.message('Activate Gold.');
      blanket.showOnlyTo(player);
    }),
  });

  game.defineFlow(
    () => {
      game.snapshotSmokes();
    },
    whileLoop({
      while: () => !game.goalSatisfied && game.attempts < game.maxAttempts,
      do: [
        forLoop({
          name: 'round',
          initial: 1,
          next: round => round + 1,
          while: round => round <= 5,
          do: [
            eachPlayer({
              name: "player",
              do: playerActions({
                actions: ['placeBlanketCard'],
              }),
            }),
          ],
        }),
        () => {
          game.phase = 'reveal';
        },
        forLoop({
          name: 'revealStep',
          initial: 0,
          next: revealStep => revealStep + 1,
          while: revealStep => revealStep < game.revealOrder().length,
          do: [
            ({ revealStep }) => {
              const edge = game.revealOrder()[revealStep];

              if (edge) {
                game.currentRevealEdge = edge.name;
              }
            },
            playerActions({
              name: 'reveal-current-edge',
              player: ({ revealStep }) => {
                const edge = game.revealOrder()[revealStep];
                return edge ? game.revealPlayerForEdge(edge) : game.players[0];
              },
              actions: ['revealCurrentEdge'],
            }),
            playerActions({
              name: 'choose-revealed-blanket',
              player: ({ revealStep }) => {
                const edge = game.revealOrder()[revealStep];
                return edge ? game.revealPlayerForEdge(edge) : game.players[0];
              },
              condition: () => (game.currentRevealEdgeSpace()?.all(BlanketCard).length ?? 0) === 2,
              actions: ['activateRevealedBlanket'],
            }),
            playerActions({
              name: 'resolve-swap-red-gold-action',
              player: ({ revealStep }) => {
                const edge = game.revealOrder()[revealStep];
                return edge ? game.revealPlayerForEdge(edge) : game.players[0];
              },
              condition: () => game.pendingGoldAction === 'swapRedSmoke',
              actions: ['swapRedSmoke'],
            }),
            playerActions({
              name: 'resolve-swap-orange-gold-action',
              player: ({ revealStep }) => {
                const edge = game.revealOrder()[revealStep];
                return edge ? game.revealPlayerForEdge(edge) : game.players[0];
              },
              condition: () => game.pendingGoldAction === 'swapOrangeSmoke',
              actions: ['swapOrangeSmoke'],
            }),
            playerActions({
              name: 'resolve-swap-yellow-gold-action',
              player: ({ revealStep }) => {
                const edge = game.revealOrder()[revealStep];
                return edge ? game.revealPlayerForEdge(edge) : game.players[0];
              },
              condition: () => game.pendingGoldAction === 'swapYellowSmoke',
              actions: ['swapYellowSmoke'],
            }),
            playerActions({
              name: 'resolve-swap-green-gold-action',
              player: ({ revealStep }) => {
                const edge = game.revealOrder()[revealStep];
                return edge ? game.revealPlayerForEdge(edge) : game.players[0];
              },
              condition: () => game.pendingGoldAction === 'swapGreenSmoke',
              actions: ['swapGreenSmoke'],
            }),
            playerActions({
              name: 'resolve-rotate-white-gold-action',
              player: ({ revealStep }) => {
                const edge = game.revealOrder()[revealStep];
                return edge ? game.revealPlayerForEdge(edge) : game.players[0];
              },
              condition: () => game.pendingGoldAction === 'rotateWhiteCloud',
              actions: ['rotateWhiteCloud'],
            }),
            playerActions({
              name: 'resolve-rotate-black-gold-action',
              player: ({ revealStep }) => {
                const edge = game.revealOrder()[revealStep];
                return edge ? game.revealPlayerForEdge(edge) : game.players[0];
              },
              condition: () => game.pendingGoldAction === 'rotateBlackCloud',
              actions: ['rotateBlackCloud'],
            }),
            playerActions({
              name: 'resolve-repeat-gold-action',
              player: ({ revealStep }) => {
                const edge = game.revealOrder()[revealStep];
                return edge ? game.revealPlayerForEdge(edge) : game.players[0];
              },
              condition: () => game.pendingGoldAction === 'repeatBlanketAction',
              actions: ['repeatBlanketAction'],
            }),
            playerActions({
              name: 'resolve-peek-gold-action',
              player: ({ revealStep }) => {
                const edge = game.revealOrder()[revealStep];
                return edge ? game.revealPlayerForEdge(edge) : game.players[0];
              },
              condition: () => game.pendingGoldAction === 'peekBlanket',
              actions: ['peekBlanket'],
            }),
          ],
        }),
        () => {
          game.attempts += 1;
          game.goalSatisfied = checkChallengeGoal(game, game.challengeNumber);

          game.message(game.goalSatisfied ? 'You win!' : 'You lose!');

          if (game.goalSatisfied) {            
            game.currentRevealEdge = undefined;
            game.clearPendingGoldAction();
            game.phase = 'done';
            game.finish(game.players, 'coop-win');
            return;
          }

          if (game.attempts >= game.maxAttempts) {
            game.currentRevealEdge = undefined;
            game.clearPendingGoldAction();
            game.phase = 'done';
            game.finish([], 'coop-loss');
            return;
          }

          game.prepareNextRound();
          game.message('Start the next round. Attempt {{attempt}} of {{max}}.', {
            attempt: game.attempts + 1,
            max: game.maxAttempts,
          });
        },
      ],
    }),
  );
});
