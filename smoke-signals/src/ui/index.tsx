import React from 'react';
import { numberSetting, render } from '@boardzilla/core';
import {
  BlanketCard,
  BlanketColor,
  Edge,
  FireCard,
  FireEdge,
  GoalCard,
  PlayerSpace,
  SmokeCard,
  SmokeSignalsGame,
} from '../game/index.js';
import setup from '../game/index.js';
import page1Back from './assets/page1-back.jpg';
import page1Front from './assets/page1-front.jpg';
import page2Back from './assets/page2-back.jpg';
import page2Front from './assets/page2-front.jpg';

import './style.scss';

type SheetPos = {
  sheet: string;
  col: 0 | 1 | 2;
  row: 0 | 1 | 2;
};

const SHEET_SIZE = '300% 300%';

const blanketArt: Record<string, SheetPos> = {
  'blanket-card-1-white-far': { sheet: page1Front, col: 0, row: 0 },
  'blanket-card-1-white-near': { sheet: page1Front, col: 1, row: 0 },
  'blanket-card-1-gold': { sheet: page1Front, col: 1, row: 1 },
  'blanket-card-1-black-inner': { sheet: page1Front, col: 2, row: 0 },
  'blanket-card-1-black-outer': { sheet: page1Front, col: 0, row: 1 },
  'blanket-card-2-white-inner': { sheet: page1Front, col: 2, row: 1 },
  'blanket-card-2-white-outer': { sheet: page1Front, col: 0, row: 2 },
  'blanket-card-2-gold': { sheet: page2Front, col: 0, row: 0 },
  'blanket-card-2-black-far': { sheet: page1Front, col:  1, row: 2 },
  'blanket-card-2-black-near': { sheet: page1Front, col: 2, row: 2 },
};

const blanketBackArtByColor: Record<BlanketColor, SheetPos> = {
  [BlanketColor.Black]: { sheet: page1Back, col: 0, row: 0 },
  [BlanketColor.White]: { sheet: page1Back, col: 1, row: 0 },
  [BlanketColor.Gold]: { sheet: page1Back, col: 1, row: 1 },
};

const fireArt: Record<string, SheetPos> = {
  'fire-card-a1': { sheet: page2Front, col: 1, row: 0 },
  'fire-card-a2': { sheet: page2Front, col: 1, row: 0 }, // rotate
  'fire-card-a3': { sheet: page2Back, col: 1, row: 0 },
  'fire-card-a4': { sheet: page2Back, col: 1, row: 0 }, // rotate
  'fire-card-b1': { sheet: page2Front, col: 2, row: 0 },
  'fire-card-b2': { sheet: page2Front, col: 2, row: 0 }, // rotate
  'fire-card-b3': { sheet: page2Back, col: 0, row: 0 },
  'fire-card-b4': { sheet: page2Back, col: 0, row: 0 }, // rotate
  'fire-card-c1': { sheet: page2Front, col: 0, row: 1 },
  'fire-card-c2': { sheet: page2Front, col: 0, row: 1 }, // rotate
  'fire-card-c3': { sheet: page2Back, col: 2, row: 1 },
  'fire-card-c4': { sheet: page2Back, col: 2, row: 1 }, // rotate
  'fire-card-d1': { sheet: page2Front, col: 1, row: 1 },
  'fire-card-d2': { sheet: page2Front, col: 1, row: 1 }, // rotate
  'fire-card-d3': { sheet: page2Back, col: 1, row: 1 },
  'fire-card-d4': { sheet: page2Back, col: 1, row: 1 }, // rotate
};

const smokeArt: Record<string, SheetPos> = {
  'smoke-card-green': { sheet: page2Back, col: 0, row: 1 },
  'smoke-card-yellow': { sheet: page2Back, col: 2, row: 2 },
  'smoke-card-orange': { sheet: page2Back, col: 1, row: 2 },
  'smoke-card-red': { sheet: page2Back, col: 0, row: 2 },
};

const goalArt: Record<string, SheetPos> = {
  'goal-1': { sheet: page2Front, col: 2, row: 1 },
  'goal-2': { sheet: page2Front, col: 2, row: 1 },
  'goal-3': { sheet: page2Front, col: 2, row: 1 },

  'goal-4': { sheet: page2Front, col: 0, row: 2 },
  'goal-5': { sheet: page2Front, col: 0, row: 2 },
  'goal-6': { sheet: page2Front, col: 0, row: 2 },

  'goal-7': { sheet: page2Front, col: 1, row: 2 },
  'goal-8': { sheet: page2Front, col: 1, row: 2 },
  'goal-9': { sheet: page2Front, col: 1, row: 2 },

  'goal-10': { sheet: page2Front, col: 2, row: 2 },
  'goal-11': { sheet: page2Front, col: 2, row: 2 },
  'goal-12': { sheet: page2Front, col: 2, row: 2 },
};

function spriteStyle(pos: SheetPos) {
  return {
    backgroundImage: `url(${pos.sheet})`,
    backgroundSize: SHEET_SIZE,
    backgroundPosition: `${pos.col * 50}% ${pos.row * 50}%`,
    backgroundRepeat: 'no-repeat',
    width: '100%',
    height: '100%',
  } as const;
}

function artForCard(card: BlanketCard | FireCard | SmokeCard | GoalCard): SheetPos | undefined {
  if (card instanceof BlanketCard) {
    return blanketArt[card.name];
  }

  if (card instanceof FireCard) {
    return fireArt[card.name];
  }

  if (card instanceof GoalCard) {
    return goalArt[card.name];
  }

  return smokeArt[card.name];
}

function blanketBackArtFor(card: BlanketCard): SheetPos {
  return blanketBackArtByColor[card.color ?? BlanketColor.Black];
}

function blanketOrientationClass(card: BlanketCard, isFirstViewer: boolean): string {
  const isFace = card.isVisible();
  const shouldRotate = isFirstViewer ? !isFace : isFace;
  return shouldRotate ? 'rotated-hand-card' : '';
}

function fireTransformStyle(card: FireCard, isFirstViewer: boolean) {
  if (isFirstViewer) {
    return undefined;
  }

  return { transform: 'rotate(180deg)' } as const;
}

render(setup, {
  settings: {
    challengeNumber: numberSetting('Challenge', 1, 12),
  },
  announcements: {
    'coop-win': () => (
      <>
        <h1>Game finished</h1>
        <h2>You all win!</h2>
      </>
    ),
    'coop-loss': () => (
      <>
        <h1>Game finished</h1>
        <h2>You all lose!</h2>
      </>
    ),
  },
  layout: (game, player) => {
    game.disableDefaultAppearance();    

    const viewingPlayer = player ?? game.players[0];
    const isFirstViewer = viewingPlayer === game.players[0];
    const otherPlayer = viewingPlayer
      ? game.players.find(candidate => candidate !== viewingPlayer)
      : game.players[1];
    const mySpace = viewingPlayer ? game.first(PlayerSpace, { player: viewingPlayer }) : undefined;
    const opponentSpace = otherPlayer ? game.first(PlayerSpace, { player: otherPlayer }) : undefined;
    const fireArea = isFirstViewer
      ? { left: 0, top: 40, width: 43, height: 13 }
      : { left: 57, top: 40, width: 43, height: 13 };
    const smokeArea = isFirstViewer
      ? { left: 45, top: 40, width: 55, height: 13 }
      : { left: 0, top: 40, width: 55, height: 13 };
    const topEdgeArea = isFirstViewer
      ? [
          { left: 0, top: 25, width: 10, height: 13 },
          { left: 11, top: 25, width: 10, height: 13 },
          { left: 22, top: 25, width: 10, height: 13 },
          { left: 33, top: 25, width: 10, height: 13 },
        ]
      : [
          { left: 57, top: 25, width: 10, height: 13 },
          { left: 68, top: 25, width: 10, height: 13 },
          { left: 79, top: 25, width: 10, height: 13 },
          { left: 90, top: 25, width: 10, height: 13 },
        ];
    const bottomEdgeArea = isFirstViewer
      ? [
          { left: 0, top: 55, width: 10, height: 13 },
          { left: 11, top: 55, width: 10, height: 13 },
          { left: 22, top: 55, width: 10, height: 13 },
          { left: 33, top: 55, width: 10, height: 13 },
        ]
      : [
          { left: 57, top: 55, width: 10, height: 13 },
          { left: 68, top: 55, width: 10, height: 13 },
          { left: 79, top: 55, width: 10, height: 13 },
          { left: 90, top: 55, width: 10, height: 13 },
        ];
    const topEdges = isFirstViewer
      ? [$.fireEdgeTop1, $.fireEdgeTop2, $.fireEdgeTop3, $.fireEdgeTop4]
      : [$.fireEdgeBottom4, $.fireEdgeBottom3, $.fireEdgeBottom2, $.fireEdgeBottom1];
    const bottomEdges = isFirstViewer
      ? [$.fireEdgeBottom1, $.fireEdgeBottom2, $.fireEdgeBottom3, $.fireEdgeBottom4]
      : [$.fireEdgeTop4, $.fireEdgeTop3, $.fireEdgeTop2, $.fireEdgeTop1];

    game.layout(topEdges[0], { area: topEdgeArea[0] }); //, showBoundingBox: topEdges[0].name });
    game.layout(topEdges[1], { area: topEdgeArea[1] }); //, showBoundingBox: topEdges[1].name });
    game.layout(topEdges[2], { area: topEdgeArea[2] }); //, showBoundingBox: topEdges[2].name });
    game.layout(topEdges[3], { area: topEdgeArea[3] }); //, showBoundingBox: topEdges[3].name });

    game.layout(bottomEdges[0], { area: bottomEdgeArea[0] }); //, showBoundingBox: bottomEdges[0].name });
    game.layout(bottomEdges[1], { area: bottomEdgeArea[1] }); //, showBoundingBox: bottomEdges[1].name });
    game.layout(bottomEdges[2], { area: bottomEdgeArea[2] }); //, showBoundingBox: bottomEdges[2].name });
    game.layout(bottomEdges[3], { area: bottomEdgeArea[3] }); //, showBoundingBox: bottomEdges[3].name });
    
    game.layout(FireCard, {
      area: fireArea,
      columns: 4,
      rows: 1,
      gap: { x: 1.7, y: 0 },
      direction: isFirstViewer ? 'ltr' : 'rtl',
      // showBoundingBox: 'Fire Row',
    });

    game.layout(SmokeCard, {
      area: smokeArea,
      columns: 4,
      rows: 1,
      gap: { x: 1, y: 0 },
      direction: isFirstViewer ? 'ltr' : 'rtl',
      // showBoundingBox: 'Smoke Row',
    });

    
    if (opponentSpace) {
      game.layout(opponentSpace, {
        area: { left: 25, top: 10, width: 50, height: 13 },
        // showBoundingBox: 'Top Player Hand',
      });

      opponentSpace.layout(BlanketCard, { columns: 5, rows: 1, gap: { x: 1, y: 0 } });
    }

    if (mySpace) {
      game.layout(mySpace, {
        area: { left: 25, top: 70, width: 50, height: 13 },
        // showBoundingBox: 'Bottom Player Hand',
      });

      mySpace.layout(BlanketCard, { columns: 5, rows: 1, gap: { x: 1, y: 0 } });
    }

    game.layout($.goalSpace, {
      area: { left: 80, top: 70, width: 18, height: 13 },
      // showBoundingBox: 'Goal Space',
    });

    game.all(BlanketCard).appearance({
      className: 'sheet-card blanket-card',
      aspectRatio: 375 / 525,
      render: card => {
        const art = card.isVisible() ? artForCard(card) : blanketBackArtFor(card);
        const orientationClass = blanketOrientationClass(card, isFirstViewer);

        return (
          <div className="hover-zoom-shell">
            <div className={`sheet-card-face ${orientationClass}`.trim()}>
              {art ? <div className="card-art" style={spriteStyle(art)} /> : <div className="card-fallback">{card.name}</div>}
            </div>
          </div>
        );
      },
    });

    game.all(FireCard).appearance({
      className: 'sheet-card fire-card',
      aspectRatio: 375 / 525,
      render: card => {
        const art = artForCard(card);

        return (
          <div className="hover-zoom-shell">
            <div className="sheet-card-face" style={fireTransformStyle(card, isFirstViewer)}>
              {art ? <div className="card-art" style={spriteStyle(art)} /> : <div className="card-fallback">{card.name}</div>}
            </div>
          </div>
        );
      },
    });

    game.all(SmokeCard).appearance({
      className: 'sheet-card',
      aspectRatio: 375 / 525,
      render: card => {
        const art = artForCard(card);

        return (
          <div className="hover-zoom-shell">
            <div className="sheet-card-face">
              {art ? <div className="card-art" style={spriteStyle(art)} /> : <div className="card-fallback">{card.name}</div>}
            </div>
          </div>
        );
      },
    });

    game.all(GoalCard).appearance({
      className: 'sheet-card goal-card',
      aspectRatio: 375 / 525,
      render: card => {
        const art = artForCard(card);

        return (
          <div className="hover-zoom-shell">
            <div className="sheet-card-face">
              {art ? <div className="card-art" style={spriteStyle(art)} /> : <div className="card-fallback">{card.name}</div>}
            </div>
          </div>
        );
      },
    });

    game.all(FireEdge).appearance({
      className: 'fire-edge-space',
      render: edge => (
        <div className={`fire-edge-face ${game.currentRevealEdge === edge.name ? 'active-reveal-edge' : ''}`} />
      ),
    });
  },
});
