import React from 'react';
import { render, numberSetting, Space, Piece } from '@boardzilla/core';
import setup, { Token, YearMat, YearSpace, RailCard, Cargo, Pawn, Damage, PlayerHand, BuildCard, RailStack} from '../game/index.js';

import './style.scss';
//import '@boardzilla/core/index.css';

render(setup, {
  settings: {
    tokens: numberSetting('Number of tokens', 4, 24),
  },

  announcements: {
    crashed: game => {
      return (
        <>
          <h1>
            Game Over!
          </h1>
        </>
      );
    },
    damaged: game => {
      return (
        <>
          <h1>
            Game Over!
          </h1>
        </>
      );
    },
    win: game => {
      return (
        <>
          <h1>
            You Win!
          </h1>
        </>
      );
    }
  },


  layout: game => {
    // game.disableDefaultAppearance();

    game.appearance({
      render: () => null
    });

    //game.disableDefaultAppearance()

    game.layout('year1930', { area: { left: 0, top: 1, width: 20, height: 50 }});
    game.layout('year1957', { area: { left: 22, top: 1, width: 20, height: 50 }});
    game.layout('year1984', { area: { left: 44, top: 1, width: 20, height: 50 }});
    game.layout('year2011', { area: { left: 66, top: 1, width: 20, height: 50 }});

    game.layout('buildCards', { area: { left: 88, top: 55, width: 38, height: 18 }});
    game.layout('railCards', { area: { left: 88, top: 1, width: 30, height: 50 }});

    game.layout('discard', { area: { left: 88, top: 75, width: 38, height: 9 }});
    game.layout('move', { area: { left: 88, top: 84, width: 38, height: 9 }});

    game.layout('garbage', { area: { left: 0, top: 0, width: 0, height: 0 }});
    game.layout('scraps', { area: { left: -12, top: 1, width: 10, height: 50 }});

    game.layout('player1', { area: { left: -12, top: 55, width: 85, height: 18 }});
    game.layout('player2', { area: { left: -12, top: 75, width: 85, height: 18 }});

    game.layout('damage', { area: { left: 75, top: 75, width: 10, height: 18 }});

    game.all(PlayerHand).layout(BuildCard, {direction: 'ltr'});


    

    game.all(Token).appearance({
      aspectRatio: 1,
      render: () => (
        <div className="flipper">
          <div className="front"></div>
          <div className="back"></div>
        </div>
      )
    });

    // game.all(RailCard).appearance({
    //   render: x => (
    //     <div className={'railCard' + (x.unavailable ? 'Unavailable' : 'Available')}>{x.name}
        
    //     </div>
    //   )
    // });

    // game.all(YearSpace).appearance({
    //   aspectRatio: 250/350,
    // });

    game.all(RailCard).appearance({
      aspectRatio: 25/35,
      render: rc => (
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" x="0" y="0" stroke='black' fill={rc.unavailable ? 'coral' : 'lightblue'} />
          <line x1={rc.pts[0].a.x} y1={rc.pts[0].a.y} x2={rc.pts[0].b.x} y2={rc.pts[0].b.y} stroke="white" stroke-width="1" />
          <line x1={rc.pts[1].a.x} y1={rc.pts[1].a.y} x2={rc.pts[1].b.x} y2={rc.pts[1].b.y} stroke="white" stroke-width="1" />
          <text x="50%" y="50%">{rc.letter}</text>
        </svg>
      )
    });

    game.all(YearSpace).appearance({
      aspectRatio: 25/35,
      render: x => (
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" x="0" y="0" stroke="black" fill="lightgray" />
          <text x="50%" y="50%">{x.space}</text>
        </svg>
      )
    });

    game.all(Cargo).appearance({
      render: x => (
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="10" height="10" x={x.coords.x} y={x.coords.y} fill={x.name} />
        </svg>
      )
    });

    game.all(Pawn).appearance({
      aspectRatio: 25/25,
      render: x => (
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <circle cx={x.color == 'green' ? "35%" : "65%"} cy="15%" r="15%" fill={x.color} />
          <rect x={x.color == 'green' ? "20%" : "50%"} y="28%" width="30%" height="20%" fill={x.color} />
        </svg>
      )
    });

    game.all(Damage).appearance({
      aspectRatio: 25/25,
      render: x => (
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="75%" r="25%" fill='red' />
        </svg>
      )
    });

    game.all(YearMat).layout(YearSpace, {
      rows: 7,
      columns: 3,
    })

    game.all(YearSpace).layout(Piece, {
      offsetColumn: {x: 0, y: 0},
    });

    game.all(RailStack).layout(RailCard, {
      offsetColumn: {x: 0, y: 0},
    });

    game.all(YearSpace).layout(RailCard, {
      scaling: 'fill'
    });

    game.layout(Space, {
      gap: 1,
      margin: 1
    });

    game.all('pool').layout(Token, {
      gap: 1,
      margin: 1
    });
  }
});
